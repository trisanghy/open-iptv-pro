'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const app=fs.readFileSync(path.join(__dirname,'../renderer/app.js'),'utf8');

function between(first,second){
 const a=app.indexOf(first),b=app.indexOf(second,a+first.length);
 assert.ok(a>=0&&b>a,'Expected real renderer function: '+first);
 return app.slice(a,b);
}
const stopSource=between(' function stopPlayer(){','\n async function loadHlsLib');
const toggleSource=between(' async function playToggle(){','\n function switchChannel(');
const channelSource=between(' async function playChannel(','\n async function playToggle()');

function harness({mode='live',paused=false,withStream=true}={}){
 const calls=[],nodes=new Map(),channels=[{id:'BBC'},{id:'HBO'}];
 const $=id=>{
  if(!nodes.has(id))nodes.set(id,{
   textContent:'',classList:{
    remove:cls=>calls.push('show:'+cls),add:cls=>calls.push('hide:'+cls)
   }
  });
  return nodes.get(id);
 };
 const player={
  paused,src:'mock://live',currentSrc:'mock://live',
  srcObject:withStream?{getTracks:()=>[{stop:()=>calls.push('trackStop')}]}:null,
  pause(){calls.push('pause');this.paused=true;},
  play(){calls.push('play');this.paused=false;return Promise.resolve();},
  removeAttribute(name){calls.push('remove:'+name);delete this.src;this.currentSrc='';},
  load(){calls.push('load');}
 };
 const hls={
  stopLoad:()=>calls.push('hlsStop'),
  destroy:()=>calls.push('hlsDestroy'),
  startLoad:num=>calls.push('hlsStart:'+num)
 };
 const dash={pause:()=>calls.push('dashPause'),reset:()=>calls.push('dashReset')};
 const store={current:'HBO'};
 const scope={
  current:{id:'HBO',name:'HBO'},store,player,hls,dash,playMode:mode,
  mediaInfo:{mode},playRequestSerial:0,playGeneration:7,playAttemptSerial:3,
  lastStoppedChannelId:'',playbackProofUrl:'test',playbackProofTimer:1,
  playCandidates:['mock://live'],playCandidateIndex:0,ffmpegFallbackId:'ffmpeg-1',
  failoverTimer:1,stallTimer:2,startupNoteTimer:3,
  attemptedTransports:new Set(),nativeHlsTried:new Set(),
  clearTimeout:()=>calls.push('clearTimeout'),console:{warn:()=>calls.push('warn')},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
  document:{dispatchEvent:()=>calls.push('dispatchMediaInfo')},
  window:{
   OpenIPTVAutoPiP:{stopPlayback(){calls.push('stopPiP');return Promise.resolve(true);}},
   OpenIPTVCastUI:{stopOnLocalStop(){calls.push('stopCast');}},
   IPTVProAdvanced:{onStop(){calls.push('stopTimeshift');}},
   IPTVExtras:{onChannel:c=>calls.push('onChannel:'+String(c?.id||'null'))},
   streamleaf:{stopPlaybackFallback(id){calls.push('stopFFmpeg:'+id);return Promise.resolve();}}
  },
  $,
  save:()=>calls.push('save'),
  updatePlayerFavorite:()=>{},updateManualLinkPicker:()=>{},renderList:()=>{},
  textStatus:()=>calls.push('stoppedStatus'),
  enabledChannels:()=>channels,sortedChannels:array=>array,
  playChannel:async id=>calls.push('restart:'+id),
  toast:()=>calls.push('toast')
 };
 const context=vm.createContext(scope);
 const script=new vm.Script('(()=>{'+stopSource+'\n'+toggleSource+
  '\nreturn {stopPlayer,playToggle,state:()=>({current,playGeneration,playRequestSerial,lastStoppedChannelId,hls,dash})};})()');
 const api=script.runInContext(context);
 return {api,calls,nodes,scope,player,store};
}

test('Electron: Stop fully shuts down HLS, DASH, FFmpeg, PiP, media stream and visible frame',()=>{
 const h=harness();
 const before=h.api.state();
 h.api.stopPlayer();
 const required=['hlsStop','hlsDestroy','dashPause','dashReset','stopPiP',
  'stopCast','stopTimeshift','pause','trackStop','remove:src','load',
  'stopFFmpeg:ffmpeg-1','save','show:hidden'];
 for(const item of required)assert.ok(h.calls.includes(item),'Missing stop operation: '+item);
 assert.equal(h.api.state().current,null);
 assert.equal(h.store.current,null);
 assert.equal(h.player.srcObject,null);
 assert.equal(h.player.src,undefined);
 assert.equal(h.api.state().hls,null);
 assert.equal(h.api.state().dash,null);
 assert.ok(h.api.state().playGeneration>before.playGeneration);
 assert.ok(h.api.state().playRequestSerial>before.playRequestSerial);
 assert.equal(h.nodes.get('#streamInfo').textContent,'Đã dừng hoàn toàn');
});

test('Electron: Pause on LIVE releases the entire stream, not just HTMLVideoElement.pause()',async()=>{
 const h=harness({mode:'live'});
 await h.api.playToggle();
 assert.ok(h.calls.includes('hlsDestroy'));
 assert.ok(h.calls.includes('stopPiP'));
 assert.ok(h.calls.includes('load'));
 assert.equal(h.api.state().current,null);
 assert.equal(h.api.state().lastStoppedChannelId,'HBO');
});

test('Electron: Play after stopping LIVE reopens the same channel, not the first playlist entry',async()=>{
 const h=harness();
 await h.api.playToggle();
 await h.api.playToggle();
 assert.ok(h.calls.includes('restart:HBO'));
 assert.ok(!h.calls.includes('restart:BBC'));
});

test('Electron: paused VOD keeps position and renderer while stopping HLS fetching',async()=>{
 const h=harness({mode:'vod'});
 await h.api.playToggle();
 assert.ok(h.calls.includes('pause'));
 assert.ok(h.calls.includes('hlsStop'));
 assert.ok(h.calls.includes('dashPause'));
 assert.ok(!h.calls.includes('hlsDestroy'));
 assert.equal(h.api.state().current.id,'HBO');
 assert.ok(!h.calls.includes('load'));
});

test('Electron: VOD resume restarts HLS loading before video playback',async()=>{
 const h=harness({mode:'vod',paused:true});
 await h.api.playToggle();
 assert.ok(h.calls.indexOf('hlsStart:-1')>=0);
 assert.ok(h.calls.indexOf('hlsStart:-1')<h.calls.indexOf('play'));
 assert.ok(!h.calls.includes('hlsDestroy'));
});

test('Electron: a stopped pending channel authorization cannot revive playback',async()=>{
 let allow=null;
 const context=vm.createContext({
  playRequestSerial:0,
  enabledChannels:()=>[{id:'HBO'}],
  toast:()=>{},
  window:{IPTVProAdvanced:{allowChannel:()=>new Promise(resolve=>{allow=resolve;})}},
  current:null
 });
 const run=new vm.Script('(()=>{'+channelSource+'\nreturn playChannel;})()').runInContext(context);
 const pending=run('HBO');
 assert.equal(typeof allow,'function');
 context.playRequestSerial++; // Equivalent to a stop while permission is pending.
 allow(true);
 await pending;
 assert.equal(context.current,null);
 assert.equal(context.playRequestSerial,2);
});

test('Electron: legacy Play/Stop buttons still call the correct handlers',()=>{
 assert.match(app,/bind\(\['stopBtn'\],stopPlayer\)/);
 assert.match(app,/bind\(\['playBtn'\],playToggle\)/);
 assert.match(app,/player\.addEventListener\('playing',\(\)=>\{if\(!current\)return;/);
 assert.match(app,/player\.addEventListener\('loadeddata',\(\)=>\{if\(!current\)return;/);
});
