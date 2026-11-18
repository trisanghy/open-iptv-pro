'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../resume-last.js'),'utf8');

function element(tag='div'){
  const callbacks={};
  return {
    tag,hidden:false,textContent:'',checked:false,children:[],attributes:{},
    addEventListener:(type,fn)=>{(callbacks[type]??=[]).push(fn);},
    dispatch:(type)=>{for(const fn of callbacks[type]??[])fn();},
    append(...children){this.children.push(...children);},
    setAttribute(name,value){this.attributes[name]=value;},
    getAttribute(name){return this.attributes[name]??null;},
  };
}
async function environment({state={},channels=[{id:'news'}],mutedInitially=false,saveOK=true,readyState='complete'}={}){
  const data={current:'news',...state};
  const elems={
    video:element('video'),playerBox:element('div'),
    webAutoResumeLast:element('input'),webAutoResumeHint:element('small'),
    webAutoEnableAudio:element('input'),webAutoAudioHint:element('small'),
  };
  const video=elems.video;
  Object.assign(video,{
    muted:mutedInitially,defaultMuted:mutedInitially,autoplay:false,
    paused:true,currentSrc:'https://test.invalid/hls.m3u8',
    volume:.8,playCalls:0,canPlay:true,
    play(){
      this.playCalls++;
      if(!this.canPlay)return Promise.reject(Object.assign(new Error('Blocked'),{name:'NotAllowedError'}));
      this.paused=false;
      this.dispatch('playing');
      return Promise.resolve();
    },
  });
  const calls={play:[],save:0};
  let current=null;
  const app={
    getStore:()=>data,getChannels:()=>channels,getCurrent:()=>current,
    save:()=>{calls.save++;return saveOK;},
    playChannel(id){calls.play.push(id);current=channels.find(x=>x.id===id)||null;return Promise.resolve();}
  };
  const tasks=[];
  const window={
    IPTVState:app,setTimeout(fn){tasks.push(fn);},
    addEventListener(name,fn){if(name==='load')tasks.push(fn)}
  };
  const documentListeners={};
  const document={
    readyState,
    getElementById:id=>elems[id]||null,
    createElement:element,
    addEventListener(type,fn){(documentListeners[type]??=[]).push(fn)},
    dispatch(type,detail){for(const fn of documentListeners[type]||[])fn({type,detail})}
  };
  vm.runInNewContext(source,{window,document,Promise,console});
  return {data,calls,elems,video,app,document,tasks,
    async start(){const fn=tasks.shift();fn?.();await Promise.resolve();},
    async tick(){const fn=tasks.shift();fn?.();await Promise.resolve();}
  };
}
test('default setting is ON and persisted OFF is respected',async()=>{
  const enabled=await environment();
  assert.equal(enabled.elems.webAutoResumeLast.checked,true);
  const disabled=await environment({state:{autoResumeLastChannel:false}});
  assert.equal(disabled.elems.webAutoResumeLast.checked,false);
  await disabled.start();
  assert.deepEqual(disabled.calls.play,[]);
});
test('toggling setting persists to the same browser-specific store',async()=>{
  const e=await environment();
  e.elems.webAutoResumeLast.checked=false;e.elems.webAutoResumeLast.dispatch('change');
  assert.equal(e.data.autoResumeLastChannel,false);
  assert.equal(e.calls.save,1);
  e.elems.webAutoResumeLast.checked=true;e.elems.webAutoResumeLast.dispatch('change');
  assert.equal(e.data.autoResumeLastChannel,true);
  assert.equal(e.calls.save,2);
});
test('failed save rolls the toggle back',async()=>{
  const e=await environment({saveOK:false});
  e.elems.webAutoResumeLast.checked=false;e.elems.webAutoResumeLast.dispatch('change');
  assert.equal(e.elems.webAutoResumeLast.checked,true);
  assert.equal(e.data.autoResumeLastChannel,undefined);
});
test('last channel auto-resumes with sound enabled',async()=>{
  const e=await environment({mutedInitially:true});
  await e.start();
  assert.deepEqual(e.calls.play,['news']);
  assert.equal(e.video.muted,false);
  assert.equal(e.video.defaultMuted,false);
  assert.equal(e.video.autoplay,false);
});
test('missing channel, disabled source, or prior manual playback does not auto-resume',async()=>{
  const e=await environment({channels:[{id:'other'}]});await e.start();
  assert.deepEqual(e.calls.play,['other']); // saved channel missing: choose first enabled channel
  const noChannels=await environment({channels:[]});await noChannels.start();
  assert.deepEqual(noChannels.calls.play,[]);
  const missing=await environment({state:{current:''}});await missing.start();
  assert.deepEqual(missing.calls.play,['news']);
});
test('blocked sound autoplay shows actionable button; click plays unmuted',async()=>{
  const e=await environment();
  await e.start();
  // Simulate browser still blocking autoplay after source becomes ready
  e.document.dispatch('openiptv:autoplay-blocked',{channelId:'news'});
  const panel=e.elems.playerBox.children[0];
  assert.equal(panel.hidden,false);
  assert.match(panel.children[1].textContent,/Phát có tiếng/);
  e.video.canPlay=true;
  panel.children[1].dispatch('click');
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(e.video.muted,false);
  assert.equal(e.video.playCalls,1);
  assert.equal(panel.hidden,true);
});
test('browser NotAllowedError keeps the sound-enable prompt visible',async()=>{
  const e=await environment();await e.start();e.document.dispatch('openiptv:autoplay-blocked',{channelId:'news'});
  const panel=e.elems.playerBox.children[0];e.video.canPlay=false;
  panel.children[1].dispatch('click');
  await Promise.resolve();await Promise.resolve();
  assert.equal(panel.hidden,false);
  assert.match(panel.children[0].textContent,/chưa cho phép/);
});
test('switching OFF hides pending prompt without pausing playback',async()=>{
  const e=await environment();await e.start();e.document.dispatch('openiptv:autoplay-blocked',{channelId:'news'});
  const panel=e.elems.playerBox.children[0];
  e.elems.webAutoResumeLast.checked=false;e.elems.webAutoResumeLast.dispatch('change');
  assert.equal(panel.hidden,true);assert.equal(e.calls.save,1);
});
test('if web player is already handling a channel, do not replace it',async()=>{
  const e=await environment();
  e.app.getCurrent=()=>({id:'other'});
  await e.start();
  assert.deepEqual(e.calls.play,[]);
});

test('audio startup toggle is independent of channel autoplay toggle',async()=>{
  const e=await environment({state:{autoResumeLastChannel:false}});
  assert.equal(e.elems.webAutoResumeLast.checked,false);
  assert.equal(e.elems.webAutoEnableAudio.checked,true);
  await e.start();assert.deepEqual(e.calls.play,[]);
});
test('audio preference is independently persisted to the browser',async()=>{
  const e=await environment();
  e.elems.webAutoEnableAudio.checked=false;e.elems.webAutoEnableAudio.dispatch('change');
  assert.equal(e.data.autoEnableAudio,false);assert.equal(e.calls.save,1);
  assert.equal(e.elems.webAutoResumeLast.checked,true);
});
test('audio disabled opens last channel muted and no unmute overlay on playing',async()=>{
  const e=await environment({state:{autoEnableAudio:false}});
  await e.start();assert.deepEqual(e.calls.play,['news']);
  assert.equal(e.video.defaultMuted,true);assert.equal(e.video.muted,true);
  e.video.paused=false;e.video.dispatch('playing');
  assert.equal(e.elems.playerBox.children[0].hidden,true);
});
test('disabled audio uses silent playback action, not forced sound',async()=>{
  const e=await environment({state:{autoEnableAudio:false}});
  await e.start();e.document.dispatch('openiptv:autoplay-blocked',{channelId:'news'});
  const panel=e.elems.playerBox.children[0];
  assert.equal(panel.children[1].textContent,'Phát kênh');
  panel.children[1].dispatch('click');
  await Promise.resolve();await Promise.resolve();
  assert.equal(e.video.muted,true);
});
test('audio setting can be enabled without restarting the channel',async()=>{
  const e=await environment({state:{autoEnableAudio:false}});
  await e.start();
  e.elems.webAutoEnableAudio.checked=true;e.elems.webAutoEnableAudio.dispatch('change');
  assert.equal(e.video.muted,false);assert.equal(e.data.autoEnableAudio,true);
  assert.deepEqual(e.calls.play,['news']);
});
test('audio toggle rolls back after failed save',async()=>{
  const e=await environment({saveOK:false});
  e.elems.webAutoEnableAudio.checked=false;e.elems.webAutoEnableAudio.dispatch('change');
  assert.equal(e.elems.webAutoEnableAudio.checked,true);
  assert.equal(e.data.autoEnableAudio,undefined);
});
test('audio preference remains configurable before any channel exists',async()=>{
  const e=await environment({state:{current:''}});
  e.elems.webAutoEnableAudio.checked=false;e.elems.webAutoEnableAudio.dispatch('change');
  assert.equal(e.data.autoEnableAudio,false);assert.equal(e.calls.save,1);
});

test('DOMContentLoaded starts the last channel before all assets finish loading',async()=>{
  const e=await environment({readyState:'loading'});
  assert.deepEqual(e.calls.play,[]);
  e.document.dispatch('DOMContentLoaded');
  await Promise.resolve();
  assert.deepEqual(e.calls.play,['news']);
});
test('canplay during slow stream loading does not invent an autoplay error',async()=>{
  const e=await environment();await e.start();
  e.video.dispatch('canplay');
  const panel=e.elems.playerBox.children[0];
  assert.equal(panel.hidden,true);
});
test('muted autoplay fallback starts video and offers one-click unmute',async()=>{
  const e=await environment();await e.start();
  e.video.muted=true;
  e.video.paused=false;
  e.video.dispatch('playing');
  e.document.dispatch('openiptv:autoplay-muted',{channelId:'news'});
  const panel=e.elems.playerBox.children[0];
  assert.equal(panel.hidden,false);
  assert.equal(panel.children[1].textContent,'Bật âm thanh');
  panel.children[1].dispatch('click');
  await Promise.resolve();await Promise.resolve();
  assert.equal(e.video.muted,false);
  assert.equal(panel.hidden,true);
});
test('unmuted successful autoplay has no popup',async()=>{
  const e=await environment();await e.start();
  e.video.muted=false;e.video.paused=false;
  e.video.dispatch('playing');
  assert.equal(e.elems.playerBox.children[0].hidden,true);
});
test('autoplay failure from another channel never triggers a popup',async()=>{
  const e=await environment();await e.start();
  e.document.dispatch('openiptv:autoplay-blocked',{channelId:'other'});
  assert.equal(e.elems.playerBox.children[0].hidden,true);
});
test('when audio was explicitly disabled, muted fallback needs no popup',async()=>{
  const e=await environment({state:{autoEnableAudio:false}});await e.start();
  e.video.paused=false;e.video.muted=true;
  e.document.dispatch('openiptv:autoplay-muted',{channelId:'news'});
  assert.equal(e.elems.playerBox.children[0].hidden,true);
});
