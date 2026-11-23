'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const from=html.indexOf('function setPlayerStatus(message){');
const to=html.indexOf('function resumeLastChannel(){',from);
assert.ok(from>0&&to>from);
const source=html.slice(from,to);
const local='http://127.0.0.1:17870/r/'+'b'.repeat(40)+'/0';
const c={id:'vtv3',name:'VTV3',url:'https://private-cdn.example/live.m3u8?token=never-save'};
async function flush(){for(let i=0;i<30;i++)await Promise.resolve();}
function setup(storage=new Map()){
 const timers=[],events=[],requests=[],instances=[];
 let clock=1000000;
 const classNames=new Set();
 const video={
  paused:true,readyState:3,currentTime:0,src:'',hidden:false,error:null,
  canPlayType:()=>'',load(){},pause(){this.paused=true;},
  removeAttribute(k){if(k==='src')this.src='';},
  play(){this.paused=false;return Promise.resolve();}
 };
 const player={hidden:true,classList:{add:x=>classNames.add(x),remove:x=>classNames.delete(x),contains:x=>classNames.has(x)}};
 const elements={player,video,playerStatus:{hidden:true,textContent:''},
  playbackDiag:{hidden:true,textContent:''},browserFallback:{hidden:true},avplayObject:{hidden:true},
  playingName:{textContent:''},exitModuleBtn:{title:''},channelPicker:{hidden:true}};
 class Hls{
  constructor(opts){this.opts=opts;this.events={};instances.push(this);}
  static isSupported(){return true;}
  static Events={MANIFEST_PARSED:'manifest',ERROR:'error'};
  on(n,fn){this.events[n]=fn;}
  attachMedia(v){this.video=v;}
  loadSource(url){this.url=url;}
  destroy(){this.destroyed=true;}
  ready(){this.events.manifest?.();}
  fail(details='manifestLoadError',code=403,type='networkError'){
   this.events.error?.('error',{fatal:true,type,details,response:{code}});
  }
  startLoad(){this.softNetworkRestarts=(this.softNetworkRestarts||0)+1;}
  recoverMediaError(){this.softMediaRestarts=(this.softMediaRestarts||0)+1;}
 }
 const state={recent:[],favorites:{},sources:[]};
 const env={state,URL,window:{Hls,addEventListener(){}},
  byId:id=>elements[id],document:{head:{appendChild(){}},createElement(){return{}}},
  Date:{now:()=>clock},localStorage:{
   getItem:key=>storage.get(key)||null,
   setItem:(key,value)=>storage.set(key,value)
  },setTimeout:(fn,ms)=>{const t={fn,ms,cancelled:false};timers.push(t);return t;},
  clearTimeout:t=>{if(t)t.cancelled=true;},
  fetch:(address,options)=>{
   requests.push({address,options});
   return Promise.resolve({ok:true,json:()=>Promise.resolve({url:local})});
  },
  save:()=>true,notify(){},draw(){}
 };
 const api=vm.runInNewContext(source+'\n({play,playbackReady,notePlaybackProgress,playbackWatchdog,finishPlaybackError,handleHtml5Error,savedPlaybackRoute,current:()=>({engine:playbackEngine,mode:html5Mode,serial:playbackSerial,recoveries:playbackRecoveries,stable:playbackStableAt,playing})});',env);
 return {api,env,get video(){return elements.video;},player,elements,events,timers,requests,instances,storage,
  enableMediaReplacement(){
   const parent={replaceChild(next,old){old.parentNode=null;elements.video=next;}};
   video.parentNode=parent;
   video.cloneNode=()=>({...video,parentNode:parent,paused:true,readyState:0,src:'',error:null});
  },
  advance(ms){clock+=ms;},clock:()=>clock,classes:classNames};
}
async function proveRelay(s){
 s.api.play(c);await flush();
 assert.equal(s.api.current().mode,'hlsjs','HLS.js must be first for manifest URLs');
 s.instances[0].fail();await flush();
 s.instances[1].ready();await flush();
 const token=s.api.current().serial;
 s.api.playbackReady(token);
 for(const sec of [0,2,4,6,8]){s.advance(1800);s.api.notePlaybackProgress(token,sec);}
 return token;
}
test('A single flash does not poison player memory or trigger an 8s TV restart',async()=>{
 const s=setup();
 s.api.play(c);
 s.api.playbackReady(s.api.current().serial);
 assert.equal(s.storage.has('openiptv-tizen-playback-path-v3'),false);
 s.video.paused=false;s.video.readyState=4;s.video.currentTime=0;
 s.advance(9000);
 s.api.playbackWatchdog(s.api.current().serial);
 assert.equal(s.api.current().recoveries,0,'Tizen live HLS can play while currentTime stays at 0');
 s.advance(30000);s.api.playbackWatchdog(s.api.current().serial);
 assert.equal(s.api.current().recoveries,0,'do not reopen the decoder on an unreliable clock');
 assert.equal(s.api.savedPlaybackRoute(c),'','one frame is not trusted');
});
test('Sustained relay playback is saved by source fingerprint without URL or token',async()=>{
 const s=setup();await proveRelay(s);
 assert.equal(s.api.savedPlaybackRoute(c),'relay');
 const stored=s.storage.get('openiptv-tizen-playback-path-v3');
 assert.ok(stored);
 assert.doesNotMatch(stored,/private-cdn|live\.m3u8|never-save|token/i);
 assert.match(stored,/"route":"relay"/);
});
test('After restart only the verified relay engine is tried first',async()=>{
 const storage=new Map(),first=setup(storage);
 await proveRelay(first);
 const fresh=setup(storage);
 fresh.api.play(c);await flush();
 assert.equal(fresh.api.current().mode,'hls-relay');
 assert.equal(fresh.requests.length,1,'saved successful relay skips native/HLS.js probes');
 assert.equal(fresh.instances.length,1);
 assert.equal(fresh.instances[0].url,local);
});
test('A fatal HLS error after first picture is recovered, not silently ignored',async()=>{
 const s=setup();await proveRelay(s);
 const old=s.instances.at(-1);
 s.api.play(c);await flush();
 s.instances.at(-1).ready();await flush();
 s.api.playbackReady(s.api.current().serial);
 const sessions=s.requests.filter(x=>x.address.endsWith('/session')).length;
 s.instances.at(-1).fail('fragLoadError');await flush();
 assert.equal(s.api.current().recoveries,1);
 assert.equal(s.requests.filter(x=>x.address.endsWith('/session')).length,sessions+1,'new local relay session created');
 assert.equal(old.destroyed,true);
});
test('Known-good relay retries twice before falling back to a different decoder',async()=>{
 const s=setup();await proveRelay(s);
 s.api.play(c);await flush();
 const engine=s.instances.at(-1);engine.ready();await flush();
 s.api.playbackReady(s.api.current().serial);
 engine.fail('fragmentLoadError');await flush();
 assert.equal(s.api.current().mode,'hls-relay');
 const first=s.instances.at(-1);
 first.fail('manifestLoadError');await flush();
 assert.equal(s.api.current().mode,'hls-relay','transient second failure stays on proven relay');
 const second=s.instances.at(-1);
 second.fail('manifestLoadError');await flush();
 assert.notEqual(s.api.current().mode,'hls-relay','bounded retries eventually leave the relay');
 const sessions=s.requests.length;
 s.api.handleHtml5Error(s.api.current().serial,'native blocked');await flush();
 assert.equal(s.requests.length,sessions,'bad relay is not retried immediately');
});
test('Picker autoplay and preview do not change source URLs or leak credentials to diagnostics',()=>{
 assert.match(html,/pickerPlayTimer=setTimeout\(commitPickerPlay,200\)/);
 assert.match(html,/if\(playbackConfirmed\)\{\s*if\(recoverStalledPlayback/);
 assert.match(html,/video\.ontimeupdate=function/);
 assert.match(html,/playbackProgressSeconds>=5\.5/);
 assert.match(html,/function savedPlaybackRoute\(channel\)/);
});

test('A genuinely buffering HLS stream recovers only after a prolonged lack of data',async()=>{
 const s=setup();s.api.play(c);s.api.playbackReady(s.api.current().serial);
 s.video.paused=false;s.video.readyState=1;s.video.currentTime=0;
 s.advance(9000);s.api.playbackWatchdog(s.api.current().serial);
 assert.equal(s.api.current().recoveries,0);
 s.advance(17000);s.api.playbackWatchdog(s.api.current().serial);
 assert.equal(s.api.current().recoveries,1,'25s without any video data triggers recovery');
});
test('Decoded frames prevent a false stall even when the live clock is frozen',async()=>{
 const s=setup();s.api.play(c);s.api.playbackReady(s.api.current().serial);
 s.video.paused=false;s.video.readyState=4;s.video.currentTime=0;
 s.video.webkitDecodedFrameCount=120;
 s.advance(17000);s.api.playbackWatchdog(s.api.current().serial);
 s.video.webkitDecodedFrameCount=140;
 s.advance(17000);s.api.playbackWatchdog(s.api.current().serial);
 assert.equal(s.api.current().recoveries,0);
});
test('Recoverable HLS network error resumes in-place without blanking video',async()=>{
 const s=setup();await proveRelay(s);
 s.api.play(c);await flush();const engine=s.instances.at(-1);engine.ready();
 s.api.playbackReady(s.api.current().serial);
 const count=s.instances.length,requests=s.requests.length;
 engine.fail('fragLoadError',0,'networkError');await flush();
 assert.equal(engine.softNetworkRestarts,1);
 assert.equal(s.api.current().recoveries,0);
 assert.equal(s.instances.length,count);
 assert.equal(s.requests.length,requests);
 assert.notEqual(engine.destroyed,true);
});
test('The same relay is not restarted every few seconds by premature recovery counter reset',async()=>{
 const s=setup();await proveRelay(s);
 s.api.play(c);await flush();const engine=s.instances.at(-1);engine.ready();
 s.api.playbackReady(s.api.current().serial);
 engine.fail('manifestLoadError',403);await flush();
 assert.equal(s.api.current().recoveries,1);
 const next=s.instances.at(-1);next.ready();
 const token=s.api.current().serial;s.api.playbackReady(token);
 for(const sec of [0,2,4,6,8]){s.advance(1800);s.api.notePlaybackProgress(token,sec);}
 assert.equal(s.api.current().recoveries,1,'5.5s playing is not a sustained 60s recovery');
});

test('A malformed live refresh retries on the same player after the HLS error event',async()=>{
 const s=setup(),token=await proveRelay(s);
 const engine=s.instances.at(-1),count=s.instances.length;
 const restarts=[];
 engine.startLoad=(...args)=>restarts.push(args);

 engine.fail('levelParsingError',200);
 engine.fail('levelParsingError',200);
 assert.equal(restarts.length,0,'wait for HLS.js to finish handling the fatal error');
 const first=s.timers.filter(t=>t.ms===750&&!t.cancelled);
 assert.equal(first.length,1,'duplicate errors share the pending retry');
 first[0].fn();
 assert.deepEqual(restarts,[[-1,true]],'skip an initial seek to keep the current position');
 assert.equal(s.api.current().serial,token);
 assert.equal(s.instances.length,count);
 assert.equal(engine.destroyed,undefined);

 engine.fail('levelParsingError',200);
 const second=s.timers.at(-1);
 assert.equal(second.ms,1500);
 second.fn();
 engine.fail('levelParsingError',200);
 await flush();
 assert.equal(s.api.current().recoveries,1,'persistent failures reach bounded fallback');
});

test('Relay session setup failure switches routes without leaving the TV loading',async()=>{
 const storage=new Map();
 await proveRelay(setup(storage));
 const s=setup(storage);
 s.env.fetch=()=>Promise.resolve({ok:false,status:400});
 s.api.play(c);
 await flush();
 assert.equal(s.api.current().mode,'native');
 assert.match(s.elements.playbackDiag.textContent,/HTTP 400/);
});

test('An old HTML5 rejection cannot interrupt A → B → A or reveal an old frame',async()=>{
 const s=setup();s.enableMediaReplacement();
 const progressive={...c,url:'https://private-cdn.example/stream.mp4'};
 let rejectOld;const playVideo=s.video.play;
 s.video.play=function(){return new Promise((_,reject)=>{rejectOld=reject;});};
 s.api.play(progressive);
 const first=s.video,oldPlaying=first.onplaying;
 first.play=playVideo;
 first.paused=false;first.readyState=4;oldPlaying();
 const oldReveal=s.timers.find(t=>t.ms===220);
 s.api.play({id:'other',name:'Other',url:'https://same.example/b.mp4'});
 s.api.play(progressive);
 const newVideo=s.video;
 newVideo.paused=false;newVideo.readyState=4;
 assert.notEqual(newVideo,first);
 assert.equal(oldReveal.cancelled,true);
 oldPlaying();oldReveal.fn();rejectOld(Error('The previous source failed'));
 await flush();
 assert.equal(s.api.current().mode,'native');
 assert.equal(s.classes.has('is-tuning-video'),true);
 assert.equal(s.classes.has('is-playing'),false);
 newVideo.onplaying();
 s.timers.find(t=>t.ms===220&&!t.cancelled).fn();
 assert.equal(s.classes.has('is-tuning-video'),false);
 assert.equal(s.classes.has('is-playing'),true);
});

test('Reopening a channel prioritizes its verified backup, and a removed backup is ignored',()=>{
 const s=setup();
 const channel={...c,url:'https://cdn.example/main.mp4',backupUrls:['https://cdn.example/backup.mp4']};
 s.api.play(channel);
 s.api.finishPlaybackError(s.api.current().serial,'main failed');
 s.timers.find(t=>t.ms===2400&&!t.cancelled).fn();
 const backup=channel.backupUrls[0],token=s.api.current().serial;
 assert.equal(s.video.src,backup);
 s.api.playbackReady(token);s.api.notePlaybackProgress(token,0);
 s.advance(1700);s.api.notePlaybackProgress(token,1.6);
 const fresh=setup(s.storage);
 fresh.api.play(channel);
 assert.equal(fresh.video.src,backup);
 fresh.api.finishPlaybackError(fresh.api.current().serial,'backup failed');
 fresh.timers.find(t=>t.ms===2400&&!t.cancelled).fn();
 assert.equal(fresh.video.src,channel.url);
 fresh.api.play({...channel,backupUrls:[]});
 assert.equal(fresh.video.src,channel.url);
});

test('Advancing decoded frames verify a route when the Tizen media clock is frozen',()=>{
 const s=setup();const progressive={...c,url:'https://private-cdn.example/decoded.mp4'};s.api.play(progressive);
 const token=s.api.current().serial;
 s.api.playbackReady(token);
 for(const frames of [2,35,70]){
  s.video.webkitDecodedFrameCount=frames;
  s.advance(1500);s.api.playbackWatchdog(token);
 }
 assert.equal(s.api.savedPlaybackRoute(progressive),'native');
});

test('When frame callbacks exist the first frame stays covered and the next frame reveals video',()=>{
 const s=setup(),callbacks=new Map();let nextId=0;
 s.video.videoWidth=1920;
 s.video.requestVideoFrameCallback=fn=>{callbacks.set(++nextId,fn);return nextId;};
 s.video.cancelVideoFrameCallback=id=>callbacks.delete(id);
 const progressive={...c,url:'https://private-cdn.example/decoded.mp4'};
 s.api.play(progressive);s.video.onplaying();
 callbacks.get(1)();
 assert.equal(s.classes.has('is-tuning-video'),true);
 callbacks.get(2)();
 assert.equal(s.classes.has('is-tuning-video'),false);
 assert.equal(s.classes.has('is-playing'),true);
 assert.equal(s.timers.find(t=>t.ms===450).cancelled,true);
});

test('A relay session waiting to retry stops requesting the previous channel after a switch',async()=>{
 const storage=new Map();await proveRelay(setup(storage));
 const s=setup(storage);const requests=[];
 s.env.fetch=address=>{requests.push(address);return Promise.reject(Error('relay starting'));};
 s.api.play(c);await flush();
 const retry=s.timers.find(t=>t.ms===450&&!t.cancelled);
 assert.ok(retry);
 s.api.play({id:'other',name:'Other',url:'https://different.example/b.mp4'});
 retry.fn();await flush();
 assert.equal(requests.length,1);
 assert.equal(s.api.current().playing.id,'other');
});
