'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const a=html.indexOf('function setPlayerStatus(message){'),b=html.indexOf('function resumeLastChannel(){',a);
assert.ok(a>=0&&b>a);
const code=html.slice(a,b);
const local='http://127.0.0.1:17870/r/'+'a'.repeat(40)+'/0';
function harness({relayAvailable=true}={}){
 const requests=[],instances=[],events=[],notes=[],timers=[],calls={play:0};
 const status={hidden:true,textContent:''},diag={hidden:true,textContent:''};
 let clock=1000000;
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
  state,window:{Hls,addEventListener(){}},URL,Date:{now:()=>clock},
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
 const api=vm.runInNewContext(code+'\n({play,playbackReady,notePlaybackProgress,handleHtml5Error,current:()=>({playbackEngine,html5Mode,playing,playbackConfirmed,hlsRelayAttempted,hlsRelayUrl,playbackSerial})});',env);
 return {api,instances,requests,elements,notes,video,env,timers,calls,state,advance(ms){clock+=ms;}};
}
async function flush(){await new Promise(resolve=>setImmediate(resolve));}
function proveRoute(s){
 const token=s.api.current().playbackSerial;
 s.api.playbackReady(token);
 s.api.notePlaybackProgress(token,0);
 s.advance(2000);s.api.notePlaybackProgress(token,2);
}
test('Click channel tries HLS.js first, then TV-local relay on failure',async()=>{
 const s=harness(),selected={id:'vtv2',name:'VTV2',url:'https://cdn.example.org/live/vtv2.m3u8?token=private'};
 s.api.play(selected);await flush();
 assert.equal(s.api.current().playbackEngine,'html5');
 assert.equal(s.api.current().html5Mode,'hlsjs','direct HLS.js must be first');
 assert.equal(s.instances.length,1);
 assert.equal(s.instances[0].url,selected.url);
 assert.equal(s.requests.length,0);
 s.instances[0].fail('manifestLoadError',0);await flush();
 assert.equal(s.requests.length,1);
 assert.equal(s.requests[0].address,'http://127.0.0.1:17870/session');
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
 assert.equal(s.calls.play,1,'HLS relay plays when its manifest is ready without extra native video');
});
test('Switch channel invalidates stale local relay callbacks and never starts a wrong stream',async()=>{
 const s=harness(),a={id:'a',name:'VTV2',url:'https://cdn.example.org/old.m3u8'},
  b={id:'b',name:'VTV7',url:'https://cdn.example.org/new.m3u8'};
 s.api.play(a);await flush();
 const old=s.instances[0];old.fail(); // queues relay session callback
 s.api.play(b);await flush();
 assert.equal(s.api.current().playing.id,'b');
 assert.equal(s.api.current().html5Mode,'hlsjs');
 assert.equal(s.instances.at(-1).url,b.url);
 assert.equal(old.destroyed,true,'old HLS engine is stopped on channel change');
 assert.equal(s.elements.browserFallback.hidden,true);
});
test('When local relay service is absent, app reports failure and does not open Cast automatically',async()=>{
 const s=harness({relayAvailable:false});
 s.api.play({id:'vtv3',name:'VTV3',url:'https://cdn.example.org/live.m3u8'});
 await flush();
 s.instances[0].fail('manifestLoadError',403);await flush();
 assert.equal(s.api.current().html5Mode,'hls-relay');
 // Service startup is asynchronous; simulate the 7 bounded retries.
 for(let i=0;i<7;i++){
  const retry=s.timers.find(t=>t.ms===650&&!t.cancelled);
  assert.ok(retry,'local relay retry '+(i+1));
  retry.cancelled=true;retry.fn();await flush();
 }
 assert.equal(s.api.current().html5Mode,'native','unavailable relay falls back to native');
 s.api.handleHtml5Error(s.api.current().playbackSerial,'Native unsupported');await flush();
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

test('Proven stable relay stream starts directly on subsequent tuning',async()=>{
 const s=harness(),channel={id:'vtv3',name:'VTV3',url:'https://cdn.example.org/live/vtv3.m3u8'};
 s.api.play(channel);await flush();
 s.instances[0].fail();await flush();s.instances[1].ready();await flush();
 proveRoute(s);
 s.api.play(channel);await flush();
 assert.equal(s.api.current().html5Mode,'hls-relay');
 assert.equal(s.requests.length,2);
 assert.equal(s.instances.length,3);
 assert.equal(s.instances[2].url,local);
});
test('Fast relay error falls back to native then HLS.js without looping to relay',async()=>{
 const s=harness(),channel={id:'vtv5',name:'VTV5',url:'https://cdn.example.org/live/vtv5.m3u8'};
 s.api.play(channel);await flush();
 s.instances[0].fail();await flush();s.instances[1].ready();await flush();
 proveRoute(s);
 s.api.play(channel);await flush();
 assert.equal(s.api.current().html5Mode,'hls-relay');
 s.instances[2].fail('manifestLoadError',403);await flush();
 assert.equal(s.api.current().html5Mode,'native');
 assert.equal(s.video.src,channel.url);
 const count=s.requests.length;
 s.api.handleHtml5Error(s.api.current().playbackSerial,'Native failed again');await flush();
 assert.equal(s.api.current().html5Mode,'hlsjs');
 s.instances[3].fail('manifestLoadError',403);await flush();
 assert.equal(s.requests.length,count,'never retry the same failed relay');
});
test('Two proven relay streams allow same-host HLS channel fast start',async()=>{
 const s=harness(),url=id=>'https://same.example.org/live/'+id+'.m3u8';
 for(const id of ['vtv3','vtv5']){
  s.api.play({id,name:id,url:url(id)});await flush();
  assert.equal(s.api.current().html5Mode,'hlsjs');
  s.instances.at(-1).fail();await flush();s.instances.at(-1).ready();await flush();
  proveRoute(s);
 }
 const count=s.instances.length;
 s.api.play({id:'vtv6',name:'VTV6',url:url('vtv6')});await flush();
 assert.equal(s.api.current().html5Mode,'hls-relay');
 assert.equal(s.instances.length,count+1);
});
