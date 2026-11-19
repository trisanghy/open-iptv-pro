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

test('auto resume defaults ON, and disabling it prevents playback',async()=>{
 const e=await environment();
 assert.equal(e.elems.webAutoResumeLast.checked,true);
 await e.start();
 assert.deepEqual(e.calls.play,['news']);
 const disabled=await environment({state:{autoResumeLastChannel:false}});
 await disabled.start();
 assert.deepEqual(disabled.calls.play,[]);
});
test('resume fires on page readiness without waiting for slow assets',async()=>{
 const e=await environment({readyState:'loading'});
 assert.deepEqual(e.calls.play,[]);
 e.document.dispatch('DOMContentLoaded');
 await Promise.resolve();
 assert.deepEqual(e.calls.play,['news']);
 assert.equal(e.video.preload,'auto');
 assert.equal(e.video.playsInline,true);
 assert.equal(e.video.attributes.playsinline,'');
 assert.equal(e.video.autoplay,false,'web-autoplay.js alone owns the playback attempt');
});
test('autoload prefers audible playback when enabled and preserves explicit mute setting',async()=>{
 const e=await environment({mutedInitially:true});
 await e.start();
 assert.equal(e.video.muted,false);
 assert.equal(e.video.defaultMuted,false);
 const silent=await environment({state:{autoEnableAudio:false}});
 await silent.start();
 assert.equal(silent.video.muted,true);
 assert.equal(silent.video.defaultMuted,true);
});
test('no duplicate overlays, permission banners or unmute buttons after loading',async()=>{
 const e=await environment();
 await e.start();
 e.video.muted=true;
 e.video.paused=false;
 e.video.dispatch('playing');
 e.document.dispatch('openiptv:autoplay-muted',{channelId:'news'});
 e.document.dispatch('openiptv:autoplay-blocked',{channelId:'news'});
 assert.equal(e.elems.playerBox.children.length,0);
 assert.deepEqual(e.calls.play,['news']);
 assert.doesNotMatch(source,/createElement\(['"](?:button|div)['"]\)/);
 assert.doesNotMatch(source,/web-resume-panel|webUnmuteAssist|showPrompt/);
});
test('audio preference remains independently configurable and persisted',async()=>{
 const e=await environment();
 e.elems.webAutoEnableAudio.checked=false;
 e.elems.webAutoEnableAudio.dispatch('change');
 assert.equal(e.data.autoEnableAudio,false);
 assert.equal(e.calls.save,1);
 assert.equal(e.video.muted,false,'no channel yet, do not change player');
 e.elems.webAutoResumeLast.checked=false;
 e.elems.webAutoResumeLast.dispatch('change');
 assert.equal(e.data.autoResumeLastChannel,false);
 assert.equal(e.calls.save,2);
});
test('changing audio setting during playback uses existing video without reloading sources',async()=>{
 const e=await environment({state:{autoEnableAudio:false}});
 await e.start();
 e.elems.webAutoEnableAudio.checked=true;
 e.elems.webAutoEnableAudio.dispatch('change');
 assert.equal(e.video.muted,false);
 assert.equal(e.data.autoEnableAudio,true);
 assert.deepEqual(e.calls.play,['news']);
});
test('failed setting save restores checkbox state',async()=>{
 const e=await environment({saveOK:false});
 e.elems.webAutoResumeLast.checked=false;
 e.elems.webAutoResumeLast.dispatch('change');
 assert.equal(e.elems.webAutoResumeLast.checked,true);
 e.elems.webAutoEnableAudio.checked=false;
 e.elems.webAutoEnableAudio.dispatch('change');
 assert.equal(e.elems.webAutoEnableAudio.checked,true);
});
test('does not replace an active channel or load when sources are missing',async()=>{
 const e=await environment();
 e.app.getCurrent=()=>({id:'other'});
 await e.start();assert.deepEqual(e.calls.play,[]);
 const noChannels=await environment({channels:[]});
 await noChannels.start();assert.deepEqual(noChannels.calls.play,[]);
 const fallback=await environment({channels:[{id:'other'}]});
 await fallback.start();assert.deepEqual(fallback.calls.play,['other']);
});
