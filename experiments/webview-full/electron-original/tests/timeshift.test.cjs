'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');const {mkdtempSync,writeFileSync,rmSync}=require('node:fs');const {tmpdir}=require('node:os');const path=require('node:path');
const {createTimeshift}=require('../src/timeshift.cjs');
test('Timeshift controller accepts only http(s), isolates buffer and stops process',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'iptv-time-test-'));let proc;
 try{const ctrl=createTimeshift({baseDir:dir,ffmpegPath:'dummy',logger:()=>{}});assert.throws(()=>ctrl.start('file:///private/secret'),/HTTP/);
  // Real ffmpeg process deliberately not launched in this pure test.
  assert.equal(ctrl.status().active,false);assert.throws(()=>ctrl.read('fake','../secrets'),/Không có bộ đệm/);ctrl.stop();
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('FFmpeg opt-in buffer: a local test MPEGTS source yields HLS playlist and removable files',async(t)=>{
 const {spawnSync}=require('node:child_process'),http=require('node:http'),fs=require('node:fs');
 if(spawnSync('ffmpeg',['-version'],{stdio:'ignore'}).status!==0){t.skip('ffmpeg not installed');return;}
 const dir=mkdtempSync(path.join(tmpdir(),'iptv-real-time-test-'));
 try{
  const ts=path.join(dir,'sample.ts');
  const make=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc2=size=160x90:rate=12','-t','5','-c:v','mpeg2video','-g','12','-f','mpegts',ts],{timeout:15000});
  if(make.status!==0){t.skip('FFmpeg encoder not available');return;}
  const server=http.createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'video/mp2t'});fs.createReadStream(ts).pipe(res);});
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  try{const ctrl=createTimeshift({baseDir:dir,ffmpegPath:'ffmpeg',logger:()=>{}});const info=ctrl.start(`http://127.0.0.1:${server.address().port}/sample.ts`);
   let ready=false;for(let i=0;i<45;i++){
    await new Promise(ok=>setTimeout(ok,100));try{const m=ctrl.read(info.id,'rolling.m3u8').data.toString('utf8');if(m.includes('#EXTINF')){ready=true;break;}}catch{}
   }
   assert.ok(ready,'FFmpeg should create at least one HLS segment from local MPEGTS');
   assert.throws(()=>ctrl.read(info.id,'../../secrets'),/Tên file không hợp lệ/);
   ctrl.stop();assert.equal(ctrl.status().active,false);
  }finally{server.close();}
 }finally{rmSync(dir,{recursive:true,force:true});}
});
