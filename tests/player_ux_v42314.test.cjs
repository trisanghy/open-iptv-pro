'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'renderer/player-ux.js'),'utf8');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'renderer/player-ux.css'),'utf8');
class Stub{
 constructor(id){this.id=id;this.handlers={};this.value='0';this.disabled=false;this.hidden=false;this.textContent='';this.classList={items:new Set(),contains:x=>this.classList.items.has(x),add:x=>this.classList.items.add(x),remove:x=>this.classList.items.delete(x),toggle:(x,v)=>v?this.classList.items.add(x):this.classList.items.delete(x)};}
 addEventListener(kind,cb){(this.handlers[kind]||=([])).push(cb);}
 dispatch(kind,props={}){for(const cb of this.handlers[kind]||[])cb({key:kind,target:this,preventDefault(){this.defaultPrevented=true;},...props});}
 dispatchEvent(ev){this.dispatch(ev.type,ev);return true;}
 click(){this.clicked=(this.clicked||0)+1;this.dispatch('click');}
 matches(){return false;}
 closest(){return null;}
}
function createUX(){
 const elements={};const el=id=>elements[id]||=new Stub(id);
 const video=el('video');video.seekable={length:1,start:()=>0,end:()=>120};video.currentTime=15;video.paused=false;
 const document=new Stub('document');document.getElementById=el;document.fullscreenElement=null;el('page-tv').classList.add('active-page');el('modal').classList.add('hidden');
 const events=[];const channels=[{id:'ch1',name:'Channel 1'},{id:'ch2',name:'Channel 2'}];
 let current=channels[1];let stored='ch2';
 const state={player:video,getStore:()=>({current:stored}),getCurrent:()=>current,getChannels:()=>channels,playChannel:id=>{events.push('play:'+id);return Promise.resolve();}};
 const timers=[];const window={IPTVState:state,streamleaf:{}};
 vm.runInNewContext(js,{window,document,setTimeout:(cb,ms)=>{timers.push({cb,ms});return timers.length;},clearTimeout:()=>{},console,Event,CustomEvent:class{constructor(type,props){this.type=type;this.detail=props?.detail;}}});
 return {document,video,el,events,timers,channels,setCurrent:x=>{current=x;},setLast:x=>{stored=x;}};
}
test('all main action buttons have a circle and fullscreen idle hides toolbar',()=>{
 assert.match(css, /#prevBtn,#playBtn,#stopBtn,#nextBtn/);
 assert.match(css, /border-radius:50%!important/);
 assert.match(css, /:fullscreen\.player-idle \.fullscreen-ux\{opacity:0/);
 assert.match(html,/id="videoSeek"/);assert.match(html,/id="fullscreenUX"/);
});
test('event stream with real 120s seekable window shows slider and seeks within bounds',()=>{
 const u=createUX();u.document.dispatch('openiptv:media-info',{detail:{mode:'event',hls:true,seekable:true}});
 assert.equal(u.el('videoSeekWrap').hidden,false);
 assert.equal(u.el('videoDuration').textContent,'02:00');
 u.el('videoSeek').value='500';u.el('videoSeek').dispatch('change');
 assert.ok(Math.abs(u.video.currentTime-60)<0.2);
});
test('a plain LIVE channel does not get a VOD seekbar even when seekable is 120 seconds',()=>{
 const u=createUX();
 u.document.dispatch('openiptv:media-info',{detail:{mode:'live',hls:true,seekable:true}});
 assert.equal(u.el('videoSeekWrap').hidden,true);
 assert.equal(u.el('fsSeek').disabled,true);
 u.document.dispatch('openiptv:media-info',{detail:{mode:'vod',hls:true,seekable:true}});
 assert.equal(u.el('videoSeekWrap').hidden,false);
 assert.equal(u.el('fsSeek').disabled,false);
 u.document.dispatch('openiptv:media-info',{detail:{mode:'live',hls:true,seekable:true}});
 assert.equal(u.el('videoSeekWrap').hidden,true);
});
test('left-right change channels, up-down change volume and ignore input fields',()=>{
 const u=createUX();u.el('volume').value='80';
 const trigger=(key,target={closest:()=>null})=>{let prevented=false;u.document.dispatch('keydown',{key,target,preventDefault(){prevented=true;}});return prevented;};
 assert.equal(trigger('ArrowLeft'),true);assert.equal(u.el('prevBtn').clicked,1);
 assert.equal(trigger('ArrowRight'),true);assert.equal(u.el('nextBtn').clicked,1);
 assert.equal(trigger('ArrowUp'),true);assert.equal(u.el('volume').value,'85');
 assert.equal(trigger('ArrowDown'),true);assert.equal(u.el('volume').value,'80');
 assert.equal(trigger('ArrowLeft',{closest:()=>({tagName:'INPUT'})}),false);
 assert.equal(u.el('prevBtn').clicked,1);
});
test('startup restores only a source-enabled saved channel; absent channel stays untouched',()=>{
 const u=createUX();u.setCurrent(null);u.timers.find(t=>t.ms===500).cb();
 assert.deepEqual(u.events,['play:ch2']);
 const n=createUX();n.setCurrent(null);n.setLast('missing');n.timers.find(t=>t.ms===500).cb();
 assert.deepEqual(n.events,[]);
});
test('macOS red window close quits application',()=>{
 const main=fs.readFileSync(path.join(root,'src/main.cjs'),'utf8');
 assert.match(main,/app\.on\('window-all-closed',\(\)=>app\.quit\(\)\)/);
});
