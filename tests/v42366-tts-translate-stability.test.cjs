'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {PassThrough}=require('node:stream');
const {EventEmitter}=require('node:events');
const {childExitReason}=require('../src/hymt-service.cjs');
const {createSpeechQueue}=require('../renderer/tts-utterance-queue-v42359.js');
const {createPreviewCoordinator}=require('../renderer/tts-preview-coordinator-v42366.js');
const {createVieNeuSession}=require('../src/vieneu-session.cjs');
const flush=()=>new Promise(r=>setImmediate(r));
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('4.23.66: MLX worker null exit code is always a safe string',()=>{
 assert.match(childExitReason('',null,null),/không có mã thoát/);
 assert.match(childExitReason(null,null,'SIGTERM'),/SIGTERM/);
 assert.equal(childExitReason('',1,null),'mã thoát 1');
 assert.equal(childExitReason('out of memory',null,null),'out of memory');
 assert.doesNotThrow(()=>childExitReason(undefined,undefined,undefined));
 const service=read('src/hymt-service.cjs');
 assert.doesNotMatch(service,/\(err\|\|code\)\.toString\(/);
 assert.match(service,/clearTimeout\(item\.timer\)/);
});
test('4.23.66: paused queue retains only newest subtitle and resumes immediately',async()=>{
 const requested=[],spoken=[],ends=[];
 const q=createSpeechQueue({
  synthesize:async p=>{requested.push(p.text);return {wav:p.text};},
  play:async(r,p,finish)=>{spoken.push(r.wav);ends.push(finish);}
 });
 q.setPaused(true);
 q.enqueue({sequence:1,text:'câu cũ'});
 q.enqueue({sequence:2,text:'câu mới nhất'});
 await flush();assert.deepEqual(requested,[]);
 assert.equal(q.status().paused,true);
 q.setPaused(false);await flush();await flush();
 assert.deepEqual(spoken,['câu mới nhất']);
 ends[0]();await flush();
 assert.equal(q.status().playing,false);
});
test('4.23.66: preview finishing releases held live subtitles, never overlaps the first line',async()=>{
 let stopCount=0,completeSample;
 const spoken=[],ends=[];
 const q=createSpeechQueue({
  synthesize:async p=>({wav:p.text}),
  play:async(r,p,ended)=>{spoken.push(r.wav);ends.push(ended);}
 });
 const controller=createPreviewCoordinator({
  queue:q,stopSynthesis:async()=>{stopCount++;},
  synthesize:async()=>({audioBase64:'x'}),
  play:(_r,register)=>new Promise(resolve=>{completeSample=resolve;register(()=>resolve());})
 });
 const preview=controller.run({});
 await flush();await flush();
 assert.equal(controller.isActive(),true);
 assert.equal(q.status().paused,true);
 q.enqueue({sequence:1,text:'phụ đề 1'});
 q.enqueue({sequence:2,text:'phụ đề mới'});
 await flush();
 assert.deepEqual(spoken,[]);
 completeSample();assert.equal(await preview,true);
 await flush();await flush();
 assert.equal(q.status().paused,false);
 assert.deepEqual(spoken,['phụ đề mới']);
 assert.ok(stopCount>=1);
 ends[0]();await flush();
});
test('4.23.66: changing model cancels hung preview and unlocks queue',async()=>{
 let resolveSlow,stopCount=0;
 const q=createSpeechQueue({synthesize:async p=>({wav:p.text}),play:async(_r,_p,end)=>end()});
 const ctl=createPreviewCoordinator({
  queue:q,stopSynthesis:async()=>{stopCount++;},
  synthesize:()=>new Promise(resolve=>{resolveSlow=resolve;}),
  play:async()=>{throw Error('Stale preview must not reach audio');}
 });
 const task=ctl.run({});
 await flush();await flush();
 assert.equal(ctl.isActive(),true);
 const canceled=ctl.cancel();
 await canceled;await task;await flush();
 assert.equal(q.status().paused,false);
 assert.equal(ctl.isActive(),false);
 assert.ok(stopCount>=2);
 resolveSlow?.({audioBase64:'stale'});await flush();
 assert.equal(q.status().paused,false);
});
test('4.23.66: bounded preview timeout frees TTS when model never responds',async()=>{
 let expire,stopCount=0,errorText='';
 const q=createSpeechQueue({synthesize:async()=>null,play:async()=>{}});
 const ctl=createPreviewCoordinator({
  queue:q,timeoutMs:1200,setTimer:fn=>{expire=fn;return 1;},
  clearTimer:()=>{},stopSynthesis:async()=>{stopCount++;},
  synthesize:()=>new Promise(()=>{}),play:async()=>{},
  onError:e=>{errorText=String(e.message);}
 });
 const task=ctl.run({});
 await flush();await flush();
 expire();assert.equal(await task,false);
 assert.equal(q.status().paused,false);
 assert.match(errorText,/quá thời hạn/);
 assert.ok(stopCount>=2);
});
test('4.23.66: persistent Python voice can be cancelled during model warmup',async()=>{
 const child=new EventEmitter();
 child.stdout=new PassThrough();child.stderr=new PassThrough();child.stdin=new PassThrough();
 child.kill=()=>{child.emit('exit',null);return true;};
 const session=createVieNeuSession({
  python:'/mock/python',bridge:'/mock/bridge.py',spawnProcess:()=>child
 });
 const promise=session.synthesize({voice:'vieneu:X',text:'Hello',output:'/tmp/not-created.wav'});
 await flush();
 assert.equal(session.cancel(),true);
 await assert.rejects(promise,/Đã hủy/);
 assert.equal(session.isWarm(),false);
});
test('4.23.66: MLX failure falls back only to already installed Argos for English pivot',async()=>{
 const {translateWithInstalledFallback}=require('../src/ai-translation-fallback.cjs');
 const fail=async()=>{throw Error('worker exited without code');};
 let notices=0,translated=0;
 const argos={
  status:()=>({ready:true}),
  translateText:async(text,target,source)=>{translated++;return 'Chào buổi sáng';}
 };
 const result=await translateWithInstalledFallback({
  engine:'hymt18',text:'Good morning',target:'vi',source:'en',
  mlx:{translate:fail},argos,onFallback:()=>{notices++;}
 });
 assert.equal(result,'Chào buổi sáng');
 assert.equal(translated,1);
 assert.equal(notices,1);
 const noInstaller={status:()=>({ready:false}),translateText:async()=>{throw Error('Unexpected install');}};
 await assert.rejects(()=>translateWithInstalledFallback({
  engine:'hymt7',text:'Good morning',target:'vi',source:'en',
  mlx:{translate:fail},argos:noInstaller
 }),/worker exited/);
 await assert.rejects(()=>translateWithInstalledFallback({
  engine:'hymt7',text:'Ni hao',target:'vi',source:'zh',
  mlx:{translate:fail},argos
 }),/worker exited/);
 assert.equal(await translateWithInstalledFallback({
  engine:'argos',text:'Hi',target:'vi',source:'en',mlx:{translate:fail},argos
 }),'Chào buổi sáng');
});

test('4.23.66: updated UI wires cancel, locale changes, preview and compact lines',()=>{
 const ui=read('renderer/local-tts-v42344.js'),html=read('renderer/index.html');
 const css=read('renderer/compact-live-ai-controls-v42366.css');
 assert.match(ui,/resetForModelChange/);
 assert.match(ui,/openiptv:ai-translate-settings-changed/);
 assert.match(ui,/previewCoordinator\.run/);
 assert.match(ui,/maxPendingAgeMs:5000/);
 assert.match(ui,/maxSynthAgeMs:7000/);
 assert.match(ui,/speechQueue\.enqueue\(payload\)/);
 assert.match(ui,/cancelSynthesis:\(\)=>api\.ttsStop/);
 assert.match(html,/class="caption-ai-main"/);
 assert.match(html,/class="caption-tts-main"/);
 assert.ok(html.indexOf('tts-preview-coordinator-v42366.js')<
  html.indexOf('local-tts-v42344.js'));
 assert.match(css,/#liveTtsVoice/);
 assert.match(css,/#liveCaptionStatus/);
 assert.equal(require('../package.json').version,'4.23.70');
});


test('4.23.66: versioned builders use immutable release tag',()=>{
 const ref="REF='electron-v4.23.66'";
 const personal=read('build-mac-v42366.sh');
 const publicBuilder=read('build-mac-v42366-public.sh');
 for(const script of [personal,publicBuilder]){
  assert.ok(script.includes(ref),'script must download the existing Electron branch');
  assert.ok(script.includes('refs/tags/${REF}'),'Historical source uses immutable tag');
  assert.doesNotMatch(script,/electron-v42366-ai-model-hardware-hints/);
 }
 assert.match(personal,/--dir/);
 assert.match(personal,/open "\$OUT"/);
 assert.doesNotMatch(personal,/electron-builder --mac dmg/);
 assert.match(publicBuilder,/electron-builder --mac dmg/);
});

test('Permanent branch builds latest personal app and separate public DMG',()=>{
 const app=read('build-mac-electron.sh'),pub=read('build-mac-electron-public.sh');
 for(const s of [app,pub]){assert.match(s,/REF='build-sources\/electron-desktop'/);assert.match(s,/zip\/refs\/heads\/\$REF/);}
 assert.match(app,/--dir/);assert.match(app,/open "\$OUT"/);assert.match(pub,/electron-builder --mac dmg/);
});
