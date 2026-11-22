'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../../web-tv-receiver.js'),'utf8');
const start=source.indexOf(' let playbackGeneration=0,stageGeneration=0,playbackStages=[]');
const end=source.indexOf(' function handleCommand(command){',start);
assert.ok(start>0&&end>start,'TV playback module must be extractable');
const chunk=source.slice(start,end);
function harness({nativeHls=false,hlsSupport=true,dashSupport=false}={}){
 const elements={tvPlayingTitle:{textContent:''}};
 const events={},timers=[],calls={play:0,stages:[],reported:[],status:'',history:[]};
 const video={
  paused:true,src:'',error:null,
  canPlayType:()=>nativeHls?'maybe':'',
  addEventListener(event,fn){events[event]=fn;},
  pause(){this.paused=true;},load(){},
  removeAttribute(name){if(name==='src')this.src='';},
  play(){calls.play++;this.paused=false;
   const failure=calls.failPlay?.shift?.();
   return failure?Promise.reject(Object.assign(Error(failure),{name:'NotSupportedError'})):Promise.resolve();
  }
 };
 class HlsMock{
  constructor(){this.listeners={};HlsMock.all.push(this);}
  static isSupported(){return hlsSupport;}
  on(type,fn){this.listeners[type]=fn;}
  attachMedia(){calls.stages.push('hls-attached');}
  loadSource(url){calls.stages.push('hls-source:'+url);}
  destroy(){this.destroyed=true;}
  fire(type,arg){this.listeners[type]?.({},arg);}
 }
 HlsMock.all=[];HlsMock.Events={MEDIA_ATTACHED:'media',MANIFEST_PARSED:'manifest',ERROR:'error'};
 class DashMock{
  constructor(){this.listeners={};DashMock.all.push(this);}
  on(event,fn){this.listeners[event]=fn;}
  initialize(video,url,autoplay){calls.stages.push('dash-initialize:'+String(autoplay));}
  reset(){}
 }
 DashMock.all=[];
 const root={
  Hls:HlsMock,dashjs:dashSupport?{MediaPlayer:Object.assign(()=>({create:()=>new DashMock()}),{events:{STREAM_INITIALIZED:'init',ERROR:'error'}})}:null,
  location:{protocol:'https:'},
  setTimeout(fn,ms){const timer={fn,ms,cancelled:false};timers.push(timer);return timer;},
  clearTimeout(timer){if(timer)timer.cancelled=true;}
 };
 const receiver={reportPlayback:async(state,name,id)=>{calls.reported.push({state,name,id});}};
 const env={root,video,playingName:'',playingId:'',playingUrl:'',accepted:true,receiver,
  suppressPause:true,fullscreenAttempted:false,
  renderHistory(){},leaveCinema(){},enterCinema(){},rememberChannel:(url,name)=>calls.history.push({url,name}),
  status:message=>{calls.status=message;},
  $:id=>elements[id]||({}),
  safeHistoryUrl:value=>/^https?:\/\//.test(value)?value:'',
  URL,Promise,Error};
 const api=vm.runInNewContext(chunk+'\n({loadVideo,cleanupPlayer,playbackIssue,stagesFor,nextStage,get:()=>({playbackStage,stageIndex,playingUrl,playbackStarted,stageGeneration,playbackGeneration})});',env);
 return {api,env,video,calls,events,timers,HlsMock,DashMock,root};
}
async function flush(){await Promise.resolve();await Promise.resolve();await new Promise(resolve=>setImmediate(resolve));}
test('For a .m3u8 URL HLS.js waits for MEDIA_ATTACHED and MANIFEST_PARSED before video.play()',async()=>{
 const s=harness();
 s.api.loadVideo('https://example.org/vtv2.m3u8','VTV2','22');
 assert.equal(s.api.get().playbackStage,'hlsjs');
 assert.equal(s.calls.play,0,'must not call play before manifest');
 const engine=s.HlsMock.all[0];assert.ok(engine);
 engine.fire('media');assert.deepEqual(s.calls.stages.slice(-1),['hls-source:https://example.org/vtv2.m3u8']);
 assert.equal(s.calls.play,0);
 engine.fire('manifest');await flush();
 assert.equal(s.calls.play,1,'play only when manifest parsed');
 assert.equal(s.calls.reported.filter(x=>x.state==='error').length,0);
 s.events.playing();
 assert.equal(s.calls.reported.at(-1).state,'playing');
});
test('Native HLS failure falls back to hls.js without reporting a premature Cast error',async()=>{
 const s=harness({nativeHls:true});
 s.calls.failPlay=['Failed to load because no supported source was found'];
 s.api.loadVideo('https://example.org/vtv3.m3u8','VTV3','33');
 assert.equal(s.api.get().playbackStage,'native-hls');assert.equal(s.calls.play,1);
 await flush();
 assert.equal(s.api.get().playbackStage,'hlsjs');
 assert.equal(s.calls.reported.filter(x=>x.state==='error').length,0);
 const engine=s.HlsMock.all[0];engine.fire('media');engine.fire('manifest');await flush();
 assert.equal(s.calls.play,2);
 s.events.playing();
 assert.equal(s.calls.reported.at(-1).state,'playing');
});
test('Terminal HLS manifest 403 reports the actual rejection after exhausting decoders',async()=>{
 const s=harness();s.api.loadVideo('https://example.org/live.m3u8?auth=secret','VTV4','44');
 const e=s.HlsMock.all[0];
 e.fire('media');
 e.fire('error',{fatal:true,details:'manifestLoadError',response:{code:403}});
 await flush();
 assert.equal(s.calls.reported.at(-1).state,'error');
 assert.match(s.calls.status,/manifestLoadError HTTP 403/);
 assert.doesNotMatch(s.calls.status,/secret/,'private URL/token not shown on TV');
});
test('Extensionless playlist tries HTML5 and only then hls.js after unsupported source',async()=>{
 const s=harness();
 s.calls.failPlay=['no supported source'];
 s.api.loadVideo('https://example.org/stream?quality=hd','VTV5','55');
 assert.equal(s.api.get().playbackStage,'native');
 await flush();
 assert.equal(s.api.get().playbackStage,'hlsjs');
 assert.equal(s.calls.reported.filter(x=>x.state==='error').length,0);
});
test('DASH stream defers play until stream-initialized event, not immediately after initialize',async()=>{
 const s=harness({dashSupport:true});
 s.api.loadVideo('https://example.org/live.mpd','Sports','99');
 assert.equal(s.calls.play,0);
 assert.equal(s.calls.stages.at(-1),'dash-initialize:false');
 const dash=s.DashMock.all[0];
 dash.listeners.init();
 await flush();
 assert.equal(s.calls.play,1);
});
test('Channel change invalidates old manifest callbacks and preserves the selected TV channel',async()=>{
 const s=harness();
 s.api.loadVideo('https://example.org/old.m3u8','VTV2','2');
 const old=s.HlsMock.all[0];
 s.api.loadVideo('https://example.org/new.m3u8','VTV7','7');
 old.fire('media');old.fire('manifest');await flush();
 assert.equal(s.calls.play,0);
 s.HlsMock.all[1].fire('media');s.HlsMock.all[1].fire('manifest');await flush();
 assert.equal(s.calls.play,1);
 assert.equal(s.api.get().playingUrl,'https://example.org/new.m3u8');
});
test('TV maintains encrypted pairing flow, history, local controls and source privacy',()=>{
 assert.match(source,/receiver\.command|receiver\?\.reportPlayback\('playing',playingName,playingId\)/);
 assert.match(source,/rememberChannel\(playingUrl,playingName,playingId\)/);
 assert.match(source,/tvLocalPlay/);
 assert.match(source,/onCommand:handleCommand/);
});
