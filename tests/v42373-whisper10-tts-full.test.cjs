'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

test('Whisper Electron records continuous complete 10s WAV windows, threads remain four',()=>{
 const recorder=read('src/continuous-capture.cjs'),service=read('src/live-caption-service.cjs');
 assert.match(recorder,/chunkSeconds=10/);
 assert.match(recorder,/Math\.min\(10,Math\.round\(chunkSeconds\)\)/);
 assert.match(service,/chunkSeconds:10/);
 assert.match(service,/Thu âm liên tục · nhận diện mỗi khoảng 10 giây/);
 assert.match(service,/'-t','10',wav\]/);
 assert.match(service,/const args=\['-m',md,'-f',wav,'-l','auto','-nt','-t','4'\]/);
 assert.match(service,/runContinuous\(s,getFFmpeg\(\),bin\(\),model\(\)\)/);
});
test('full current subtitle plays ALL WAV chunks even with a newer pending subtitle',async()=>{
 const source=read('renderer/local-tts-v42344.js');
 const start=source.indexOf('play:async(result,payload,onEnded)=>{');
 const end=source.indexOf('cancelAudio:()=>{',start);
 assert.ok(start>0&&end>start);
 const expression=source.slice(start,end).trim().replace(/^play:/,'').replace(/,\s*$/,'');
 const heard=[],synthesized=[];
 class FakeAudio{
  constructor(url){this.url=url;this.events={};}
  addEventListener(name,fn){this.events[name]=fn;}
  play(){heard.push(this.url.split(',').at(-1));setImmediate(()=>this.events.ended?.());return Promise.resolve();}
  pause(){} removeAttribute(){} load(){}
 }
 const box={
  enabled:true,validSession:1,playing:null,cancelSpeechAudio:null,
  source:()=> 'stream-A',mediaActive:()=>true,
  Audio:FakeAudio,applySpeechRate:()=>{},applyDuck:()=>{},status:()=>{},playbackSpeed:()=>1,
  duck:{value:'10'},Promise,
  speechQueue:{status:()=>({pending:true})},
  api:{ttsSynthesize:async p=>{synthesized.push(p.text);return {mime:'audio/wav',audioBase64:p.text};}}
 };
 const play=vm.runInNewContext('('+expression+')',box);
 let ended=0;
 await play({mime:'audio/wav',audioBase64:'first',followUpChunks:['second','third']},
   {text:'full sentence',lang:'vi',voiceId:'voice',sourceLanguage:'en',streamUrl:'stream-A',alreadyTranslated:true},
   ()=>{ended++;});
 assert.deepEqual(heard,['first','second','third']);
 assert.deepEqual(synthesized,['second','third']);
 assert.equal(ended,1);
});
test('new text replaces only pending work; stop and pause still cancel speech',()=>{
 const queue=read('renderer/tts-utterance-queue-v42359.js');
 const tts=read('renderer/local-tts-v42344.js');
 assert.match(queue,/pending=\{payload,createdAt:now\(\),serial:\+\+serial\}/);
 assert.match(tts,/maxPendingAgeMs:14000/);
 assert.match(tts,/maxSynthAgeMs:12000/);
 assert.match(tts,/resetPlayback\(\);speechQueue\.setPaused\(true\);restore\(\)/);
 assert.match(tts,/audio\.addEventListener\('ended'/);
 assert.doesNotMatch(tts,/speechQueue\.status\(\)\.pending\)break/);
});
