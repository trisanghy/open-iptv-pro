'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const a=html.indexOf('function setPlayerStatus(message){'),b=html.indexOf('function resumeLastChannel(){',a);
assert.ok(a>=0&&b>a);
const code=html.slice(a,b);
const local='http://127.0.0.1:17867/r/'+'a'.repeat(40)+'/0';
function harness({relayAvailable=true}={}){
 const requests=[],instances=[],events=[],notes=[],timers=[],calls={play:0};
 const status={hidden:true,textContent:''},diag={hidden:true,textContent:''};
 const player={hidden:true,classList:{add(){},remove(){}}};
 const video={paused:true,readyState:0,hidden:false,src:'',error:null,
  canPlayType:()=>'',load(){},pause(){this.paused=true;},
  removeAttribute(k){if(k==='src')this.src='';},
  play(){calls.play++;this.paused=false;return Promise.resolve();}
 };
 const elements={
  player,video,playerStatus:status,playbackDiag:diag,
  browserFallback:{hidden:true,textContent:''},avplayObject:{hidden:true},
  playingName:{textContent:''},exitModuleBtn:{title:''},channelPicker:{hidden:true}
 };
 class Hls{
  constructor(options){this.options=options;this.handlers={};instances.push(this);}
  static isSupported(){return true;}
  on(key,fn){this.handlers[key]=fn;}
  attachMedia(video){this.video=video;}
  loadSource(url){this.url=url;}
  destroy(){this.destroyed=true;}
  fail(detail='manifestLoadError',code=0){this.handlers.error?.('error',{fatal:true,details:detail,response:{code}});}
  ready(){this.handlers.manifest?.();}
 }
 Hls.Events={MANIFEST_PARSED:'manifest',ERROR:'error'};
 const state={recent:[],favorites:{},sources:[]};
 const env={
  state,window:{Hls,addEventListener(){}},URL,
  byId:id=>elements[id],
  document:{head:{appendChild(){}},createElement(){return{}}},
  save:()=>true,draw:()=>{},notify:x=>notes.push(x),
  setTimeout:(fn,ms)=>{let t={fn,ms,cancelled:false};timers.push(t);return t;},
  clearTimeout:t=>{if(t)t.cancelled=true;},
  fetch:(address,options)=>{
   requests.push({address,options});
   if(!relayAvailable)return Promise.reject(Error('TV-local relay is offline'));
   return Promise.resolve({ok:true,json:()=>Promise.resolve({url:local})});
  }
 };
 const api=vm.runInNewContext(code+'\n({play,playbackReady,handleHtml5Error,current:()=>({playbackEngine,html5Mode,playing,playbackConfirmed,hlsRelayAttempted,hlsRelayUrl,playbackSerial})});',env);
 return {api,instances,requests,elements,notes,video,env,timers,calls,state};
}
async function flush(){await new Promise(resolve=>setImmediate(resolve));}
test('Click channel tries native HLS first, then HLS.js and TV-local relay on failure',async()=>{
 const s=harness(),selected={id:'vtv2',name:'VTV2',url:'https://cdn.example.org/live/vtv2.m3u8?token=private'};
 s.api.play(selected);await flush();
 assert.equal(s.api.current().playbackEngine,'html5');
 assert.equal(s.api.current().html5Mode,'native');
 assert.equal(s.video.src,selected.url,'native Samsung video is attempted first');
 assert.equal(s.instances.length,0);
 s.api.handleHtml5Error(s.api.current().playbackSerial,'Native HLS playback failed');await flush();
 assert.equal(s.api.current().html5Mode,'hlsjs');
 assert.equal(s.instances.length,1);
 assert.equal(s.instances[0].url,selected.url);
 assert.equal(s.requests.length,0);
 s.instances[0].fail('manifestLoadError',0);await flush();
 assert.equal(s.requests.length,1);
 assert.equal(s.requests[0].address,'http://127.0.0.1:17867/session');
 assert.equal(JSON.parse(s.requests[0].options.body).url,selected.url);
 assert.equal(s.api.current().html5Mode,'hls-relay');
 assert.equal(s.instances.length,2);
 assert.equal(s.instances[0].destroyed,true);
 assert.equal(s.instances[1].url,local);
 assert.equal(s.elements.player.hidden,false,'player stays inside TizenBrew');
 assert.equal(s.elements.browserFallback.hidden,true,'no Cast redirect');
 assert.doesNotMatch(s.elements.playbackDiag.textContent,/token=private/);
 const headers={};s.instances[1].options.xhrSetup({setRequestHeader:(k,v)=>headers[k]=v});
 assert.equal(headers['X-Open-IPTV-Relay'],'1');
 s.instances[1].ready();await flush();
 assert.equal(s.calls.play,2,'video is attempted natively, then after HLS.js manifest is ready');
});
test('Switch channel invalidates stale local relay callbacks and never starts a wrong stream',async()=>{
 const s=harness(),a={id:'a',name:'VTV2',url:'https://cdn.example.org/old.m3u8'},
  b={id:'b',name:'VTV7',url:'https://cdn.example.org/new.m3u8'};
 s.api.play(a);await flush();
 s.api.handleHtml5Error(s.api.current().playbackSerial,'Native HLS playback failed');await flush();
 const old=s.instances[0];old.fail(); // queues session callback
 s.api.play(b);await flush();
 assert.equal(s.api.current().playing.id,'b');
 assert.equal(s.api.current().html5Mode,'native');
 assert.equal(s.video.src,b.url);
 assert.equal(old.destroyed,true,'old HLS engine is stopped on channel change');
 assert.equal(s.elements.browserFallback.hidden,true);
});
test('When local relay service is absent, app reports failure and does not open Cast automatically',async()=>{
 const s=harness({relayAvailable:false});
 s.api.play({id:'vtv3',name:'VTV3',url:'https://cdn.example.org/live.m3u8'});
 await flush();s.api.handleHtml5Error(s.api.current().playbackSerial,'Native HLS playback failed');await flush();
 s.instances[0].fail('manifestLoadError',403);await flush();
 assert.equal(s.api.current().html5Mode,'hls-relay');
 // Service startup is asynchronous; simulate the 7 bounded retries.
 for(let i=0;i<7;i++){
  const retry=s.timers.find(t=>t.ms===650&&!t.cancelled);
  assert.ok(retry,'local relay retry '+(i+1));
  retry.cancelled=true;retry.fn();await flush();
 }
 assert.ok(s.elements.playbackDiag.textContent.includes('HLS nội bộ'));
 const grace=s.timers.find(t=>t.ms===2400&&!t.cancelled);
 assert.ok(grace,'fallback remains controlled within app');
 grace.fn();
 assert.match(s.elements.playerStatus.textContent,/Không phát được kênh/);
 assert.equal(s.elements.player.hidden,false);
});

test('An extensionless HLS endpoint retries TV-local relay after HTML5 and direct HLS fail',async()=>{
 const s=harness(),url='https://cdn.example.org/live/channel?id=vtv7';
 s.api.play({id:'vtv7',name:'VTV7',url});await flush();
 assert.equal(s.api.current().html5Mode,'native');
 s.api.handleHtml5Error(s.api.current().playbackSerial,'HTML5 unsupported');
 await flush();
 assert.equal(s.api.current().html5Mode,'hlsjs');
 const hls=s.instances.at(-1);assert.equal(hls.url,url);
 hls.fail('manifestLoadError');await flush();
 assert.equal(s.api.current().html5Mode,'hls-relay');
 assert.equal(s.instances.at(-1).url,local);
 assert.equal(s.elements.browserFallback.hidden,true);
});
