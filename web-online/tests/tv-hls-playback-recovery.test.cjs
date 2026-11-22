'use strict';
// Regression guard for restoring the last-known-working Samsung Cast receiver.
// Keep the working native HLS path intact; do not replace it with unverified
// stage switching while users report channel playback regressions.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../../web-tv-receiver.js'),'utf8');
const tv=fs.readFileSync(path.join(__dirname,'../../tv.html'),'utf8');
const start=source.indexOf(' function cleanupPlayer(){');
const end=source.indexOf(' function handleCommand(command){',start);
assert.ok(start>=0&&end>start,'Samsung TV receiver has working playback code');
const playback=source.slice(start,end);

function harness({nativeHls=true,hlsSupport=true}={}){
 const statusMessages=[],reporting=[],events={},calls={pause:0,play:0,src:[],history:[]};
 const video={
  paused:true,error:null,src:'',canPlayType:()=>nativeHls?'probably':'',
  pause(){this.paused=true;calls.pause++;},
  play(){this.paused=false;calls.play++;return Promise.resolve();},
  load(){},removeAttribute(n){if(n==='src')this.src='';},
  addEventListener(n,fn){events[n]=fn;}
 };
 class HlsMock{
  constructor(){this.callbacks={};HlsMock.instances.push(this);}
  static isSupported(){return hlsSupport;}
  attachMedia(media){this.media=media;}
  on(event,fn){this.callbacks[event]=fn;}
  loadSource(url){this.source=url;}
  destroy(){this.destroyed=true;}
 }
 HlsMock.instances=[];
 HlsMock.Events={MEDIA_ATTACHED:'media',ERROR:'error'};
 const receiver={reportPlayback:async (...args)=>reporting.push(args)};
 const root={Hls:HlsMock,dashjs:null,location:{protocol:'https:'}};
 const els={tvPlayingTitle:{textContent:''}};
 const context={
  root,video,receiver,URL,
  accepted:true,playingUrl:'',playingName:'',playingId:'',
  suppressPause:true,fullscreenAttempted:false,hls:null,dash:null,
  safeHistoryUrl:s=>/^https?:\/\//.test(s)?s:'',
  status:text=>statusMessages.push(String(text)),
  renderHistory(){},leaveCinema(){},enterCinema(){},
  rememberChannel:(url,name,id)=>calls.history.push([url,name,id]),
  $:id=>els[id]||{}
 };
 const api=vm.runInNewContext(playback+'\n({loadVideo,cleanupPlayer,current:()=>({playingUrl,playingName,playingId,hls,dash})});',context);
 return {api,root,video,receiver,reporting,events,calls,statusMessages,HlsMock};
}
test('Restored TV receiver compiles and retains 50-channel history and remote controls',()=>{
 new vm.Script(source);
 assert.match(source,/HISTORY_LIMIT=50/);
 assert.match(source,/tvLocalPlay/);
 assert.match(source,/function focusHistory\(index\)/);
 assert.match(source,/onCommand:handleCommand/);
});
test('Working Samsung native HLS path feeds URL straight into video before starting playback',async()=>{
 const s=harness();
 const stream='https://example.org/vtv1/index.m3u8?session=valid';
 await s.api.loadVideo(stream,'VTV1','vtv1');
 assert.equal(s.video.src,stream);
 assert.equal(s.calls.play,1);
 assert.equal(s.HlsMock.instances.length,0,'native HLS remains first and untouched');
 s.events.playing();
 assert.deepEqual(s.calls.history,[ [stream,'VTV1','vtv1'] ]);
 assert.deepEqual(s.reporting.at(-1),['playing','VTV1','vtv1']);
});
test('Samsung native HLS can play other channel URLs independently without stale decoding stages',async()=>{
 const s=harness();
 await s.api.loadVideo('https://example.org/vtv7.m3u8','VTV7','vtv7');
 await s.api.loadVideo('https://example.org/vtv1.m3u8','VTV1','vtv1');
 assert.equal(s.video.src,'https://example.org/vtv1.m3u8');
 assert.equal(s.calls.play,2);
 assert.equal(s.api.current().playingName,'VTV1');
 assert.doesNotMatch(source,/let playbackGeneration=0,stageGeneration=0/);
});
test('MSE HLS path is still available when TV browser has no native HLS',async()=>{
 const s=harness({nativeHls:false});
 await s.api.loadVideo('https://example.org/vtv2.m3u8','VTV2','vtv2');
 assert.equal(s.HlsMock.instances.length,1);
 const engine=s.HlsMock.instances[0];
 assert.equal(engine.media,s.video);
 engine.callbacks.media();
 assert.equal(engine.source,'https://example.org/vtv2.m3u8');
 // This baseline path is not yet verified to work on Samsung hardware.
});
test('Existing TV page uses a new cache key to force reload of restored receiver',()=>{
 assert.match(tv,/web-tv-receiver\.js\?v=tv-rollback-stable-20261122b/);
 assert.doesNotMatch(tv,/web-tv-receiver\.js\?v=tv-hls-ready-20261122a/);
});
test('TV rejects invalid stream URL and HTTPS mixed content without disrupting pairing',async()=>{
 const s=harness();
 await s.api.loadVideo('javascript:alert(1)','Unsafe','bad');
 assert.equal(s.calls.play,0);
 await s.api.loadVideo('http://example.org/live.m3u8','HTTP','mixed');
 assert.equal(s.calls.play,0);
 assert.ok(s.statusMessages.some(x=>x.includes('HTTP')));
});
