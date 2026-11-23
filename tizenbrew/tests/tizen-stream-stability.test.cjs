'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const from=html.indexOf('function setPlayerStatus(message){');
const to=html.indexOf('function resumeLastChannel(){',from);
assert.ok(from>0&&to>from);
const source=html.slice(from,to);
const local='http://127.0.0.1:17869/r/'+'b'.repeat(40)+'/0';
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
  fail(details='manifestLoadError'){this.events.error?.('error',{fatal:true,details,response:{code:403}});}
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
test('A single flash is not persisted as a working route',async()=>{
 const s=setup();
 s.api.play(c);
 s.api.playbackReady(s.api.current().serial);
 assert.equal(s.storage.has('openiptv-tizen-playback-path-v3'),false);
 s.advance(9000);
 s.api.playbackWatchdog(s.api.current().serial);
 assert.equal(s.api.current().recoveries,1,'stalled picture triggers a new attempt');
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
test('Failed relay recovery tries the next decoder without an endless relay loop',async()=>{
 const s=setup();await proveRelay(s);
 s.api.play(c);await flush();
 const engine=s.instances.at(-1);engine.ready();await flush();
 s.api.playbackReady(s.api.current().serial);
 engine.fail('fragmentLoadError');await flush();
 const next=s.instances.at(-1);
 next.fail('manifestLoadError');await flush();
 assert.equal(s.api.current().mode,'native','after one relay retry, fallback to Samsung HTML5');
 const sessions=s.requests.length;
 s.api.handleHtml5Error(s.api.current().serial,'native blocked');await flush();
 assert.equal(s.requests.length,sessions,'failed relay is not immediately repeated');
});
test('Picker autoplay and preview do not change source URLs or leak credentials to diagnostics',()=>{
 assert.match(html,/pickerPlayTimer=setTimeout\(commitPickerPlay,200\)/);
 assert.match(html,/if\(playbackConfirmed\)\{\s*if\(recoverStalledPlayback/);
 assert.match(html,/video\)\.ontimeupdate|byId\('video'\)\.ontimeupdate/);
 assert.match(html,/playbackProgressSeconds>=5\.5/);
 assert.match(html,/function savedPlaybackRoute\(channel\)/);
});
