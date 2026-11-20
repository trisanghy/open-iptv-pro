'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {PassThrough}=require('node:stream');
const {createContinuousCapture}=require('../src/continuous-capture.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
test('v4.23.67: real FFmpeg argv requests 8 seconds per WAV, no 4-second rollover',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-eight-window-'));
 let launches=0,captured;
 try{
  const recorder=createContinuousCapture({
   ffmpeg:'/mock/ffmpeg',url:'https://example.invalid/cgtn.m3u8',dir:temp,
   spawnProc:(_bin,args,opts)=>{
    launches++;captured=args;
    assert.equal(opts.cwd,temp);
    const p=new EventEmitter();p.stderr=new PassThrough();p.kill=()=>p.emit('close',0);
    return p;
   }
  });
  assert.equal(recorder.seconds,8);
  recorder.start();
  assert.equal(launches,1);
  assert.equal(captured[captured.indexOf('-segment_time')+1],'8');
  assert.ok(captured.includes('-f')&&captured.includes('segment'));
  assert.ok(captured.includes('-segment_list'));
  assert.ok(!captured.includes('-t'),'Recorder must be continuous, not time-limited');
  recorder.stop();
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('v4.23.67: all successive 8s windows stay in sequence without lost chunks',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-eight-sequences-'));
 try{
  const recorder=createContinuousCapture({
   ffmpeg:'/mock/ffmpeg',url:'https://example.invalid/cgtn.m3u8',dir:temp,
   spawnProc:()=>{
    const p=new EventEmitter();p.stderr=new PassThrough();p.kill=()=>p.emit('close',0);
    return p;
   },pollMs:5
  });
  recorder.start();
  for(let i=0;i<4;i++)fs.writeFileSync(path.join(temp,'seg_'+String(i).padStart(6,'0')+'.wav'),Buffer.alloc(26000));
  fs.writeFileSync(path.join(temp,'segments.csv'),
   ['seg_000000.wav,0,8','seg_000001.wav,8,16',
    'seg_000002.wav,16,24','seg_000003.wav,24,32'].join('\n')+'\n');
  for(let i=0;i<4;i++)assert.equal((await recorder.next()).index,i);
  assert.equal(recorder.segments().length,0);
  recorder.stop();
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('v4.23.67: Whisper gets 8s recordings; -t 4 remains thread count not chunk time',()=>{
 const service=read('src/live-caption-service.cjs');
 assert.match(service,/ffmpeg:ff,url:s\.url,dir:temp,spawnProc,chunkSeconds:8/);
 assert.match(service,/Thu âm liên tục · nhận diện mỗi khoảng 8 giây/);
 assert.match(service,/const args=\['-m',md,'-f',wav,'-l','auto','-nt','-t','4'\]/);
 assert.match(service,/conversion=conversion\.catch\(\(\)=>\{\}\)\.then\(work\)/);
 assert.match(service,/runContinuous\(s,getFFmpeg\(\),bin\(\),model\(\)\)/);
});
test('v4.23.67: translating target text and TTS complete playback stay intact',()=>{
 const caption=read('renderer/live-captions-v42343.js'),tts=read('renderer/local-tts-v42344.js');
 assert.match(caption,/if\(!ev\.translated\|\|ev\.language!==target\)/);
 assert.match(caption,/videoCaptions\.show/);
 assert.match(tts,/window\.OpenIPTVSpeechQueue\.createSpeechQueue/);
 assert.match(tts,/speechQueue\.enqueue\(payload\)/);
 assert.doesNotMatch(tts,/resetPlayback\(false\)/);
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.71');
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
});
