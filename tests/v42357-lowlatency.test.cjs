'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {PassThrough,Writable}=require('node:stream');
const {createContinuousCapture}=require('../src/continuous-capture.cjs');
const {createVieNeuSession}=require('../src/vieneu-session.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('v4.23.60: continuous FFmpeg captures every audio chunk without reopening the input',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-segmentation-'));
 let launches=0,ffmpegArgs=null,killCount=0;
 const capture=createContinuousCapture({
  ffmpeg:'/bin/ffmpeg',url:'https://example.invalid/test.m3u8',dir,pollMs:5,
  spawnProc:(_exe,args,_options)=>{
   launches++;ffmpegArgs=args;
   const proc=new EventEmitter();proc.stderr=new PassThrough();
   proc.kill=()=>{killCount++;proc.emit('close',0);};
   return proc;
  }
 });
 try{
  capture.start();
  assert.equal(launches,1);
  assert.equal(ffmpegArgs[ffmpegArgs.indexOf('-segment_time')+1],'8');
  assert.ok(ffmpegArgs.includes('-segment_list'));
  assert.ok(!ffmpegArgs.includes('-t'),'FFmpeg must NEVER pause after recording eight seconds');
  for(let i=0;i<3;i++){
   const id=String(i).padStart(6,'0');
   fs.writeFileSync(path.join(dir,'seg_'+id+'.wav'),Buffer.alloc(26000));
  }
  fs.writeFileSync(path.join(dir,'segments.csv'),
   ['seg_000000.wav,0,8','seg_000001.wav,8,16','seg_000002.wav,16,24'].join('\n')+'\n');
  const captured=[];
  for(let i=0;i<3;i++){const segment=await capture.next();captured.push(segment.index);}
  assert.deepEqual(captured,[0,1,2],'every recorded segment is processed in capture order');
  assert.equal(launches,1,'Whisper must not trigger a second FFmpeg connection');
  assert.equal(capture.segments().length,0);
 }finally{capture.stop();fs.rmSync(dir,{recursive:true,force:true});}
 assert.equal(killCount,1);
});
test('v4.23.60: recognizer displays source text immediately and translate runs independently',()=>{
 const s=read('src/live-caption-service.cjs');
 assert.match(s,/async function runContinuous\(s,ff,wh,md\)/);
 assert.match(s,/createContinuousCapture\(/);
 assert.match(s,/s\.latestRecognized=serial/);
 assert.match(s,/translated:false,language:/);
 assert.match(s,/conversion=conversion\.catch\(\(\)=>\{\}\)\.then\(work\)/);
 assert.match(s,/serial!==s\.latestRecognized/);
 assert.match(s,/runContinuous\(s,getFFmpeg\(\),bin\(\),model\(\)\)/);
 assert.doesNotMatch(s,/Promise\.resolve\(\)\.then\(\(\)=>run\(s,getFFmpeg\(\),bin\(\),model\(\)\)\)/);
 assert.match(s,/c\.capture\?\.stop\(\)/);
});
test('v4.23.60: VieNeu uses a persistent child and never reloads weights per subtitle',async()=>{
 let launches=0,kills=0;
 const spawned=[];
 const session=createVieNeuSession({
  python:'/mock/python',bridge:'/mock/bridge.py',
  spawnProcess:(_exe,args)=>{
   launches++;
   assert.deepEqual(args,['-u','/mock/bridge.py','serve']);
   const child=new EventEmitter();
   child.stdout=new PassThrough();child.stderr=new PassThrough();
   child.requests=[];
   child.stdin=new Writable({write(chunk,_encoding,cb){
    const msg=JSON.parse(chunk.toString());
    child.requests.push(msg);
    process.nextTick(()=>child.stdout.write(JSON.stringify({id:msg.id,ok:true})+'\n'));
    cb();
   }});
   child.kill=()=>{kills++;child.emit('exit',0);};
   spawned.push(child);
   process.nextTick(()=>child.stdout.write('{"type":"ready"}\n'));
   return child;
  }
 });
 await session.synthesize({voice:'Mai Anh',text:'Xin chào',output:'/tmp/a.wav'});
 await session.synthesize({voice:'Mai Anh',text:'Tôi đang đọc câu tiếp theo',output:'/tmp/b.wav'});
 assert.equal(launches,1,'Must reuse same loaded ONNX engine');
 assert.deepEqual(spawned[0].requests.map(x=>x.text),['Xin chào','Tôi đang đọc câu tiếp theo']);
 session.shutdown();
 assert.equal(kills,1);
});
test('v4.23.57: latest pending subtitle wins without interrupting audible speech',()=>{
 const ui=read('renderer/local-tts-v42344.js');
 assert.match(ui,/lastCaptionSeq=0/);
 assert.match(ui,/number&&number<lastCaptionSeq/);
 assert.match(ui,/speechQueue\.enqueue\(payload\)/);
 assert.match(ui,/window\.OpenIPTVSpeechQueue\.createSpeechQueue/);
 assert.match(ui,/if\(!e\.translated\)return/);
 assert.doesNotMatch(ui,/resetPlayback\(false\)/);
 assert.doesNotMatch(ui,/void speak\(payload\)/);
 assert.match(ui,/audio\.addEventListener\('ended'/);
 const service=read('src/local-tts-service.cjs');
 assert.match(service,/task\.session=getPremiumSession\(\)/);
 assert.match(service,/function shutdown\(\)/);
 assert.match(service,/return Object\.freeze\(\{availability,configure,synthesize,stop,shutdown,setReference\}\)/);
});
test('v4.23.60: stop can cancel both active FFmpeg and Whisper jobs; source remains untouched',()=>{
 const c=read('src/live-caption-service.cjs');
 assert.match(c,/s\.children\?\?=new Set\(\)/);
 assert.match(c,/s\.children\?\.delete\(child\)/);
 assert.match(c,/for\(const proc of c\.children\|\|\[\]\)/);
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.66');
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
});
