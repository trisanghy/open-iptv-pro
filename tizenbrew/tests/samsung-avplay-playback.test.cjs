'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function block(start,end){
  const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,'Missing '+start);
  return html.slice(a,b);
}
const source=block('function setPlayerStatus(message){','function resumeLastChannel(){');
function setup(hasAvplay){
 const calls={avOpen:[],avPlay:0,avPause:0,avStop:0,avClose:0,htmlPlay:0,htmlPause:0,rect:[],timers:[],listeners:[],prepared:[]};
 const cls={value:new Set(),add(x){this.value.add(x);},remove(x){this.value.delete(x);},contains(x){return this.value.has(x);}};
 const player={hidden:true,classList:cls},status={hidden:false,textContent:''};
 const video={
  paused:true,hidden:false,readyState:0,src:'',
  canPlayType:()=>'',play(){calls.htmlPlay++;this.paused=false;return Promise.resolve();},
  pause(){calls.htmlPause++;this.paused=true;},
  removeAttribute(k){if(k==='src')this.src='';},load(){},
 };
 const objects={player,channelPicker:{hidden:true},playerStatus:status,playbackDiag:{hidden:true,textContent:''},video,avplayObject:{hidden:true},playingName:{textContent:''},exitModuleBtn:{title:''}};
 let avState='NONE';
 const av={
  open(url){calls.avOpen.push(url);avState='IDLE';},
  setDisplayRect(...dims){calls.rect.push(dims);},
  setDisplayMethod(){},
  setListener(obj){calls.listeners.push(obj);},
  prepareAsync(succ,fail){calls.prepared.push({succ,fail});},
  play(){calls.avPlay++;avState='PLAYING';},
  pause(){calls.avPause++;avState='PAUSED';},
  stop(){calls.avStop++;avState='IDLE';},
  close(){calls.avClose++;avState='NONE';},
  getState(){return avState;}
 };
 const state={sources:[{name:'Nguồn cũ',channels:[]}],recent:[],favorites:{}};
 const env={
  state,byId:id=>objects[id],save:()=>true,draw:()=>{},notify:()=>{},
  webapis:hasAvplay?{avplay:av}:undefined,
  window:{Hls:null},
  document:{head:{appendChild:()=>{}},createElement:()=>({})},
  setTimeout:(fn,ms)=>{const timer={fn,ms,cancelled:false};calls.timers.push(timer);return timer;},
  clearTimeout:timer=>{if(timer)timer.cancelled=true;}
 };
 const api=vm.runInNewContext(source+'\n({play,closePlayer,togglePlayback,nativeAvplay,handleHtml5Error,engine:()=>playbackEngine,serial:()=>playbackSerial,mode:()=>html5Mode,evidence:()=>playbackEvidence.slice()});',env);
 return {api,env,calls,av,player,status,video,objects,state,channel:(id,url)=>({id,name:id,url})};
}
test('Samsung Tizen loads WebAPI script and AVPlay object on TV',()=>{
 assert.match(html,/\$WEBAPIS\/webapis\/webapis\.js/);
 assert.match(html,/<object id="avplayObject" type="application\/avplayer" hidden><\/object>/);
 assert.match(html,/function startAvplay\(channel,token\)/);
});
test('AVPlay is preferred for HLS and renders the full TV display',()=>{
 const s=setup(true),c=s.channel('VTV1','https://example.com/live.m3u8');
 s.api.play(c);
 assert.deepEqual(Array.from(s.calls.avOpen),[c.url]);
 assert.equal(s.calls.htmlPlay,0);
 assert.deepEqual(Array.from(s.calls.rect[0]),[0,0,1920,1080]);
 assert.equal(s.objects.avplayObject.hidden,false);
 assert.equal(s.video.hidden,true);
 s.calls.prepared[0].succ();
 assert.equal(s.calls.avPlay,1);
 s.calls.listeners[0].oncurrentplaytime(1000);
 assert.equal(s.status.hidden,true);
 assert.ok(s.player.classList.contains('is-playing'));
 assert.deepEqual(Array.from(s.state.recent),['VTV1']);
});
test('If Samsung prepare fails, HTML5 fallback runs without losing the selected channel',async()=>{
 const s=setup(true),c=s.channel('VTV1','https://example.com/live.mp4');
 s.api.play(c);
 s.calls.prepared[0].fail('NotSupportedError');
 assert.equal(s.api.engine(),'html5');
 assert.equal(s.video.src,c.url);
 assert.equal(s.calls.htmlPlay,1);
 assert.equal(s.video.hidden,false);
 assert.equal(s.objects.avplayObject.hidden,true);
 assert.equal(s.state.sources[0].name,'Nguồn cũ');
 await Promise.resolve();
});
test('Native HTML5 is still used when AVPlay is unavailable',()=>{
 const s=setup(false),c=s.channel('VTV2','https://example.com/archive.mp4');
 s.api.play(c);
 assert.equal(s.api.engine(),'html5');
 assert.equal(s.calls.avOpen.length,0);
 assert.equal(s.calls.htmlPlay,1);
});
test('OK toggles Samsung AVPlay playback state rather than the hidden HTML5 video',()=>{
 const s=setup(true),c=s.channel('VTV3','https://example.com/live.m3u8');
 s.api.play(c);s.calls.prepared[0].succ();
 s.api.togglePlayback();
 assert.equal(s.calls.avPause,1);
 s.api.togglePlayback();
 assert.equal(s.calls.avPlay,2);
 assert.equal(s.calls.htmlPlay,0);
});
test('Switching channels cancels stale AVPlay callbacks',()=>{
 const s=setup(true);
 s.api.play(s.channel('VTV1','https://example.com/one.m3u8'));
 const old=s.calls.prepared[0];
 s.api.play(s.channel('VTV2','https://example.com/two.m3u8'));
 old.succ();
 assert.equal(s.calls.avPlay,0);
 s.calls.prepared[1].succ();
 assert.equal(s.calls.avPlay,1);
 assert.deepEqual(Array.from(s.calls.avOpen),['https://example.com/one.m3u8','https://example.com/two.m3u8']);
});
test('Closing playback stops and closes native AVPlay',()=>{
 const s=setup(true);
 s.api.play(s.channel('VTV1','https://example.com/one.m3u8'));
 s.calls.prepared[0].succ();
 s.api.closePlayer();
 assert.equal(s.calls.avStop,1);
 assert.equal(s.calls.avClose,1);
 assert.equal(s.player.hidden,true);
 assert.equal(s.objects.avplayObject.hidden,true);
});
test('HLS.js fallback is used when AVPlay is missing and native browser cannot play HLS',async()=>{
 const s=setup(false),c=s.channel('VTV4','https://example.com/live.m3u8');
 let hlsLoaded='',attachCalls=0;
 class HlsMock{
  constructor(){this.events={};}
  static isSupported(){return true;}
  on(type,fn){this.events[type]=fn;}
  attachMedia(){attachCalls++;}
  loadSource(url){hlsLoaded=url;this.events.manifest();}
  destroy(){}
 }
 HlsMock.Events={MANIFEST_PARSED:'manifest',ERROR:'error'};
 s.env.window.Hls=HlsMock;
 s.api.play(c);
 await Promise.resolve();await Promise.resolve();
 assert.equal(hlsLoaded,c.url);
 assert.equal(attachCalls,1);
 assert.equal(s.calls.htmlPlay,1);
});


test('A channel URL with no .m3u8 suffix retries HLS.js after unsupported HTML5 source',async()=>{
 const s=setup(false),c=s.channel('VTV Prime','https://example.com/live?id=iptv');
 let loaded='',attached=0;
 class HlsMock{
  constructor(){this.events={};}
  static isSupported(){return true;}
  on(event,fn){this.events[event]=fn;}
  attachMedia(){attached++;}
  loadSource(u){loaded=u;this.events.ready();}
  destroy(){}
 }
 HlsMock.Events={MANIFEST_PARSED:'ready',ERROR:'error'};
 s.env.window.Hls=HlsMock;
 s.api.play(c);
 assert.equal(s.calls.htmlPlay,1,'Direct HTML5 attempted for extensionless stream');
 s.api.handleHtml5Error(s.api.serial(),'No supported source');
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(loaded,c.url,'Same URL reused for HLS.js, not modified');
 assert.equal(attached,1);
 assert.equal(s.calls.htmlPlay,2,'HLS.js playback retried');
 assert.equal(s.api.mode(),'hlsjs');
});
test('When AVPlay and MediaSource are unavailable the TV explains the limitation',async()=>{
 const s=setup(false),c=s.channel('VTV1','https://example.com/list.m3u8');
 class HlsMock{static isSupported(){return false;}}
 s.env.window.Hls=HlsMock;
 s.api.play(c);
 await Promise.resolve();await Promise.resolve();
 assert.match(s.status.textContent,/AVPlay không khả dụng/);
 assert.match(s.objects.playbackDiag.textContent,/HLS.js không hỗ trợ MediaSource/);
 assert.equal(s.objects.playbackDiag.hidden,false);
});
test('A native HTML5 failure retries HLS.js at most once',async()=>{
 const s=setup(false),c=s.channel('VTV Prime','https://example.com/live/channel?id=123');
 class HlsMock{static isSupported(){return false;}}
 s.env.window.Hls=HlsMock;
 s.api.play(c);
 s.api.handleHtml5Error(s.api.serial(),'no sources');
 await Promise.resolve();await Promise.resolve();
 assert.equal(s.api.mode(),'hlsjs');
 const evidence=s.api.evidence().slice();
 s.api.handleHtml5Error(s.api.serial(),'no sources again');
 assert.equal(s.api.evidence().join('|'),evidence.join('|'),'HLS failure is not retried infinitely');
});
