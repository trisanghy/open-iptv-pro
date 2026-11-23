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
 return {api,env,video,player,elements,events,timers,requests,instances,storage,
  advance(ms){clock+=ms;},clock:()=>clock,classes:classNames};
}
async function proveRelay(s){
 s.api.play(c);await flush();
 s.api.handleHtml5Error(s.api.current().serial,'native blocked');await flush();
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
 assert.equal(s.api.current().mode,'native','bounded retries eventually switch decoder');
 const sessions=s.requests.length;
 s.api.handleHtml5Error(s.api.current().serial,'native blocked');await flush();
 assert.equal(s.requests.length,sessions,'bad relay is not retried immediately');
});
test('Picker autoplay and preview do not change source URLs or leak credentials to diagnostics',()=>{
 assert.match(html,/pickerPlayTimer=setTimeout\(commitPickerPlay,200\)/);
 assert.match(html,/if\(playbackConfirmed\)\{\s*if\(recoverStalledPlayback/);
 assert.match(html,/video\)\.ontimeupdate|byId\('video'\)\.ontimeupdate/);
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
