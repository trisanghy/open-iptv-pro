'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createSpeechQueue}=require('../renderer/tts-utterance-queue-v42359.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const flush=()=>new Promise(r=>setImmediate(r));
test('v4.23.61: speaking entire WAV even when two newer translated subtitles arrive',async()=>{
 const spoken=[],completions=[];
 const q=createSpeechQueue({
  synthesize:async p=>({wav:p.text}),
  play:async(result,_payload,end)=>{spoken.push(result.wav);completions.push(end);}
 });
 q.enqueue({sequence:1,text:'Câu đầu dài cần được đọc hết.'});
 await flush();await flush();
 assert.deepEqual(spoken,['Câu đầu dài cần được đọc hết.']);
 assert.equal(q.status().playing,true);
 q.enqueue({sequence:2,text:'Câu thứ hai bị thay trong khi chờ.'});
 q.enqueue({sequence:3,text:'Câu mới nhất được đọc sau khi câu đầu hoàn tất.'});
 await flush();
 assert.deepEqual(spoken,['Câu đầu dài cần được đọc hết.'],
  'New captions must never pause or cut first audible sentence');
 assert.equal(q.status().pending,true);
 completions[0]();
 await flush();await flush();
 assert.deepEqual(spoken,['Câu đầu dài cần được đọc hết.','Câu mới nhất được đọc sau khi câu đầu hoàn tất.']);
 completions[1]();
 await flush();
 assert.equal(q.status().playing,false);
});
test('v4.23.61: TTS synthesis finishing late skips obsolete audio before it starts',async()=>{
 let firstResolve;
 const requests=[],played=[],finish=[];
 const q=createSpeechQueue({
  synthesize:async p=>{
   requests.push(p.text);
   if(p.text==='old')return new Promise(resolve=>{firstResolve=resolve;});
   return {wav:p.text};
  },
  play:async(result,_p,end)=>{played.push(result.wav);finish.push(end);}
 });
 q.enqueue({sequence:1,text:'old'});
 await flush();
 assert.deepEqual(requests,['old']);
 q.enqueue({sequence:2,text:'new'});
 firstResolve({wav:'old'});
 await flush();await flush();await flush();
 assert.deepEqual(requests,['old','new']);
 assert.deepEqual(played,['new'],'Obsolete synthesized audio must never play');
 finish[0]();
 await flush();
});
test('v4.23.61: a stopped stream cancels speech but a new subtitle alone does not',async()=>{
 let stoppedAudio=0,stoppedSynthesis=0;
 const played=[],ends=[];
 const q=createSpeechQueue({
  synthesize:async p=>({wav:p.text}),
  play:async(result,_p,end)=>{played.push(result.wav);ends.push(end);},
  cancelAudio:()=>{stoppedAudio++;},
  cancelSynthesis:()=>{stoppedSynthesis++;}
 });
 q.enqueue({sequence:1,text:'long sentence'});await flush();await flush();
 q.enqueue({sequence:2,text:'incoming subtitle'});
 await flush();
 assert.equal(stoppedAudio,0);
 assert.equal(stoppedSynthesis,0);
 q.reset(); // Actual channel switch / TTS off / voice change.
 assert.equal(stoppedAudio,1);assert.equal(stoppedSynthesis,1);
 ends[0]();await flush();
 assert.deepEqual(played,['long sentence']);
 q.enqueue({sequence:1,text:'new channel'});await flush();await flush();
 assert.deepEqual(played,['long sentence','new channel']);
});
test('v4.23.61: stale queued subtitles are dropped, no infinite voice backlog',async()=>{
 let t=1000;let end;
 const played=[];
 const q=createSpeechQueue({
  now:()=>t,maxPendingAgeMs:1000,
  synthesize:async p=>({wav:p.text}),
  play:async(r,p,done)=>{played.push(r.wav);end=done;}
 });
 q.enqueue({sequence:1,text:'first'});await flush();await flush();
 t+=100;
 q.enqueue({sequence:2,text:'old pending'});
 t+=1800;
 end();await flush();await flush();
 assert.deepEqual(played,['first']);
 assert.equal(q.status().pending,false);
});
test('v4.23.61: actual Electron UI waits for natural ended, TTS never restores transcript row',()=>{
 const ui=read('renderer/local-tts-v42344.js');
 assert.match(ui,/window\.OpenIPTVSpeechQueue\.createSpeechQueue/);
 assert.match(ui,/audio\.addEventListener\('ended'/);
 assert.match(ui,/speechQueue\.enqueue\(payload\)/);
 assert.match(ui,/speechQueue\.setEnabled\(enabled\)/);
 assert.match(ui,/if\(!e\.translated\)return/);
 assert.match(ui,/maxPendingAgeMs:18000/);
 assert.match(ui,/maxSynthAgeMs:25000/);
 assert.match(ui,/applyDuck\(\)/);
 assert.match(ui,/applySpeechRate\(audio\)/);
 assert.doesNotMatch(ui,/resetPlayback\(false\)/);
 assert.doesNotMatch(ui,/output\.hidden=false/);
 assert.doesNotMatch(ui,/Date\.now\(\)-requestedAt>12000/);
 const html=read('renderer/index.html');
 assert.ok(html.indexOf('src="tts-utterance-queue-v42359.js"')<
  html.indexOf('src="local-tts-v42344.js"'));
 assert.match(read('renderer/video-only-translated-caption-v42358.css'),/#liveCaptionOutput/);
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.61');
 assert.deepEqual(pkg.build.mac.target,['dmg']);
});
