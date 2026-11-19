'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {install,metadataFor}=require('../../web-background-audio.js');
function fixture({initial={},support=true,audio=true,save=true}={}){
 const handlers={},listeners={},docListeners={},windowListeners={};
 const video={
  paused:true,playCalls:0,pauseCalls:0,
  addEventListener(name,cb){(listeners[name]??=[]).push(cb)},
  play(){this.paused=false;this.playCalls++;
   for(const cb of listeners.play||[])cb();
   for(const cb of listeners.playing||[])cb();
   return Promise.resolve()},
  pause(){this.paused=true;this.pauseCalls++;for(const cb of listeners.pause||[])cb()}
 };
 const toggle={checked:false,addEventListener(name,fn){this.onChange=fn}};
 const status={textContent:''};
 const buttons=Object.fromEntries(['prevBtn','nextBtn','stopBtn'].map(k=>[k,{clicks:0,click(){this.clicks++}}]));
 const els={video,webBackgroundAudio:toggle,webBackgroundAudioStatus:status,...buttons};
 const doc={
  getElementById(id){return els[id]||null},
  addEventListener(name,cb){(docListeners[name]??=[]).push(cb)}
 };
 const mediaSession=support?{
  metadata:null,playbackState:'none',
  setActionHandler(action,fn){handlers[action]=fn}
 }:null;
 const audioSession=audio?{type:'auto'}:null;
 const nav={mediaSession,audioSession};
 let current={id:'a',name:'VTV1',group:'Tin tức',url:'https://secret.invalid/token.m3u8'};
 const state={...initial},calls={save:0};
 const app={
  getStore:()=>state,getCurrent:()=>current,
  save(){calls.save++;return save}
 };
 const win={
  IPTVState:app,MediaMetadata:class{constructor(data){Object.assign(this,data)}},
  addEventListener(name,cb){(windowListeners[name]??=[]).push(cb)}
 };
 const controller=install({win,doc,nav});
 const emit=(name)=>{for(const cb of listeners[name]||[])cb()};
 const emitDoc=(name)=>{for(const cb of docListeners[name]||[])cb()};
 return {controller,handlers,nav,mediaSession,audioSession,video,toggle,status,state,calls,buttons,
  setChannel(ch){current=ch},emit,emitDoc};
}
test('metadata is safe: no IPTV URL, token or playback credentials leak to the lock screen',()=>{
 const m=metadataFor({name:'VTV1',group:'Vietnam TV',url:'https://bad.invalid/path?token=secret',id:'ABC'});
 assert.equal(m.title,'VTV1');assert.equal(m.artist,'Vietnam TV');assert.equal(m.album,'Open IPTV Pro');
 assert.equal(m.artwork[0].src,'assets/icon.png');
 assert.doesNotMatch(JSON.stringify(m),/token=secret|bad\.invalid/);
 assert.equal(metadataFor(null),null);
});
test('Android-compatible Media Session supports play, pause, stop, previous and next',async()=>{
 const e=fixture();
 assert.equal(e.toggle.checked,true);
 assert.equal(e.mediaSession.metadata.title,'VTV1');
 assert.deepEqual(Object.keys(e.handlers),['play','pause','stop','previoustrack','nexttrack']);
 e.handlers.play();await Promise.resolve();
 assert.equal(e.video.playCalls,1);
 assert.equal(e.audioSession.type,'playback');
 assert.equal(e.mediaSession.playbackState,'playing');
 e.handlers.pause();e.emit('pause');
 assert.equal(e.video.pauseCalls,1);
 assert.equal(e.mediaSession.playbackState,'paused');
 e.handlers.nexttrack();e.handlers.previoustrack();e.handlers.stop();
 assert.equal(e.buttons.nextBtn.clicks,1);
 assert.equal(e.buttons.prevBtn.clicks,1);
 assert.equal(e.buttons.stopBtn.clicks,1);
});
test('iPhone native audio session is optional and background visibility never pauses video',()=>{
 const e=fixture();
 e.video.paused=false;e.emit('playing');e.emitDoc('visibilitychange');
 assert.equal(e.video.pauseCalls,0);assert.equal(e.video.playCalls,0);
 assert.equal(e.mediaSession.playbackState,'playing');
 assert.equal(e.audioSession.type,'playback');
 e.setChannel({id:'b',name:'VTV3',group:'Thể thao'});e.emitDoc('openiptv:media-info');
 assert.equal(e.mediaSession.metadata.title,'VTV3');
 e.setChannel(null);e.emitDoc('openiptv:media-info');
 assert.equal(e.mediaSession.metadata,null);
 assert.equal(e.mediaSession.playbackState,'none');
 assert.equal(e.audioSession.type,'playback'); // Set early on Safari to survive background interruptions.
});
test('setting is enabled by default, can be turned off and survives reload',()=>{
 const e=fixture();
 e.toggle.checked=false;e.toggle.onChange();
 assert.equal(e.state.backgroundAudioEnabled,false);
 assert.equal(e.calls.save,1);
 assert.equal(e.mediaSession.metadata,null);
 assert.equal(e.handlers.play,null);
 assert.equal(e.audioSession.type,'auto');
 const disabled=fixture({initial:e.state});
 assert.equal(disabled.toggle.checked,false);
 assert.equal(disabled.mediaSession.metadata,null);
});
test('failed save restores previous selection without deleting playlist or other app settings',()=>{
 const e=fixture({initial:{sources:[{id:'my-source'}],favorites:['a']},save:false});
 e.toggle.checked=false;e.toggle.onChange();
 assert.equal(e.toggle.checked,true);
 assert.equal(e.state.backgroundAudioEnabled,undefined);
 assert.deepEqual(e.state.sources,[{id:'my-source'}]);
 assert.deepEqual(e.state.favorites,['a']);
});
test('browser without Media Session or AudioSession fails safely',()=>{
 const e=fixture({support:false,audio:false});
 assert.equal(e.controller!==null,true);
 assert.match(e.status.textContent,/không có Media Session/);
 e.video.paused=false;
 assert.doesNotThrow(()=>e.emit('playing'));
 assert.doesNotThrow(()=>e.emitDoc('visibilitychange'));
});
test('production build retains single controls and browser-only script',()=>{
 const html=read('index.html'),builder=read('web-online/prepare-web.py'),code=read('web-background-audio.js');
 const count=(s,fragment)=>s.split(fragment).length-1;
 assert.equal(count(html,'id="webBackgroundAudio"'),1);
 assert.equal(count(html,'id="webBackgroundAudioStatus"'),1);
 assert.equal(count(html,'src="web-background-audio.js?v=lock-rescue-20261119g"'),1);
 assert.ok(html.indexOf('src="web-background-audio.js?')>html.indexOf('src="app.js?'));
 assert.ok(builder.includes("'web-background-audio.js'"));
 assert.ok(builder.includes('background_card=web_html['));
 assert.ok(builder.includes('web-background-audio.js?v=lock-rescue-20261119g'));
 assert.ok(code.includes('visibilitychange'));
 assert.doesNotMatch(code,/wakeLock\.request|setInterval\(|silent\.mp3|AudioContext\(/);
 assert.equal(read('web-online/web-background-audio.js'),code);
});
