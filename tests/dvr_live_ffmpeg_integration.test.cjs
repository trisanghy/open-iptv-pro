'use strict';
// Optional end-to-end recording on local HTTP MPEG-TS. Run explicitly with:
// DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {spawn,spawnSync}=require('node:child_process');
const {createRecordingScheduler}=require('../src/recording-scheduler.cjs');
test('real FFmpeg copies a local MPEG-TS stream to a playable DVR recording',{
 skip:process.env.DVR_INTEGRATION!=='1'?'explicit integration only':false,timeout:35000},async()=>{
 const ffmpeg=process.env.FFMPEG_EXE||'ffmpeg';
 const ffprobe=process.env.FFPROBE_EXE||'ffprobe';
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-real-dvr-'));
 const source=path.join(folder,'sample.ts');let server,service;
 try{
  const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc=size=256x144:rate=10','-t','3','-c:v','mpeg2video','-pix_fmt','yuv420p','-f','mpegts',source],{timeout:10000});
  assert.equal(result.status,0,result.stderr?.toString());
  server=http.createServer((_req,res)=>{res.setHeader('Content-Type','video/mp2t');fs.createReadStream(source).pipe(res);});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const clock={value:Date.now()};
  let onClose;
  service=createRecordingScheduler({baseDir:folder,ffmpegPath:ffmpeg,now:()=>clock.value,spawnFn:(cmd,args,opts)=>{
   const child=spawn(cmd,args,opts);child.once('close',()=>{clock.value=onClose;});return child;
  }});
  const start=clock.value+1000;onClose=start+65000;
  const job=service.create({title:'Test signal',channelName:'Demo',url:`http://127.0.0.1:${server.address().port}/stream.ts`,startAt:start,endAt:onClose});
  clock.value=start;service.tick();
  await new Promise((resolve,reject)=>{
   const started=Date.now();const timer=setInterval(()=>{
    const current=service.list().jobs.find(j=>j.id===job.id);
    if(['completed','failed','cancelled'].includes(current.status)) {clearInterval(timer);return current.status==='completed'?resolve():reject(Error(current.error));}
    if(Date.now()-started>15000){clearInterval(timer);reject(Error('FFmpeg did not finish'));}
   },100);timer.unref?.();
  });
  const out=service.list().jobs.find(j=>j.id===job.id);
  assert.match(out.file,/\.mp4$/);assert.ok(fs.existsSync(out.file));
  const info=spawnSync(ffprobe,['-v','error','-show_entries','stream=codec_name','-of','default=noprint_wrappers=1',out.file],{timeout:5000});
  assert.equal(info.status,0);assert.match(info.stdout.toString(),/mpeg2video/);
 }finally{service?.shutdown();if(server)await new Promise(r=>server.close(r));fs.rmSync(folder,{recursive:true,force:true});}
});

test('real FFmpeg also records local HLS m3u8 and preserves MPEG-TS integrity',{
 skip:process.env.DVR_INTEGRATION!=='1'?'explicit integration only':false,timeout:35000},async()=>{
 const ffmpeg=process.env.FFMPEG_EXE||'ffmpeg',ffprobe=process.env.FFPROBE_EXE||'ffprobe';
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-hls-dvr-'));
 let server,service;
 try{
  const sourceDir=path.join(folder,'source');fs.mkdirSync(sourceDir);
  const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc=size=256x144:rate=10','-t','3','-c:v','mpeg2video','-pix_fmt','yuv420p','-f','hls','-hls_time','1','-hls_list_size','0',path.join(sourceDir,'playlist.m3u8')],{timeout:10000});
  assert.equal(result.status,0,result.stderr?.toString());
  server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1);if(!/^(playlist\.m3u8|playlist\d+\.ts)$/.test(name)){res.writeHead(404);res.end();return;}
   const filename=path.join(sourceDir,name);if(!fs.existsSync(filename)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('m3u8')?'application/vnd.apple.mpegurl':'video/mp2t');fs.createReadStream(filename).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const clock={value:Date.now()};let finalTime;
  service=createRecordingScheduler({baseDir:folder,ffmpegPath:ffmpeg,now:()=>clock.value,spawnFn:(cmd,args,opts)=>{const child=spawn(cmd,args,opts);child.once('close',()=>{clock.value=finalTime;});return child;}});
  const start=clock.value+2000;finalTime=start+65000;
  const job=service.create({title:'HLS test',channelName:'Demo',url:`http://127.0.0.1:${server.address().port}/playlist.m3u8`,startAt:start,endAt:finalTime});
  clock.value=start;service.tick();
  await new Promise((resolve,reject)=>{const started=Date.now();const timer=setInterval(()=>{const j=service.list().jobs.find(x=>x.id===job.id);
   if(j.status==='completed'){clearInterval(timer);resolve();}else if(j.status==='failed'||Date.now()-started>15000){clearInterval(timer);reject(Error(j.error||'timeout'));}
  },100);timer.unref?.();});
  const file=service.list().jobs[0].file;assert.match(file,/\.mp4$/);assert.ok(fs.existsSync(file));
  const check=spawnSync(ffprobe,['-v','error','-show_entries','stream=codec_name','-of','default=noprint_wrappers=1',file],{timeout:5000});assert.equal(check.status,0);assert.match(check.stdout.toString(),/mpeg2video/);
 }finally{service?.shutdown();if(server)await new Promise(r=>server.close(r));fs.rmSync(folder,{recursive:true,force:true});}
});
