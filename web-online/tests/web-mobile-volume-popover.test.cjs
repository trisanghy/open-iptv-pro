'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'web-mobile-volume.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-mobile-volume.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function node(obj={}){
 const handlers={};obj.addEventListener=(name,fn)=>(handlers[name]??=[]).push(fn);
 obj.emit=(name,event={})=>{for(const fn of handlers[name]||[])fn(event)};
 obj.contains=other=>obj===other||obj.children?.includes(other)||false;return obj;
}
function fixture({mobile=true,volume=.7}={}){
 const elements={};
 const video=node({_volume:volume,_muted:false,
  get volume(){return this._volume},set volume(x){this._volume=x;this.emit('volumechange')},
  get muted(){return this._muted},set muted(x){this._muted=x;this.emit('volumechange')}});
 const old=node({value:'80',dispatchEvent:e=>old.emit(e.type,e)});
 let saved=volume;
 old.addEventListener('input',()=>{video.volume=Number(old.value)/100;saved=video.volume});
 const speaker=node({attrs:{},setAttribute(k,v){this.attrs[k]=v},title:''});
 const top=node({children:[],append(el){this.children.push(el)}});
 Object.assign(elements,{video,volume:old,webVolumeMute:speaker});
 const doc=node({readyState:'complete',documentElement:{getAttribute:key=>key==='data-iptv-device'?(mobile?'mobile':'desktop'):null},
  getElementById:id=>elements[id]||null,
  querySelector:q=>q==='#page-tv .player-control-card .control-layout-top'?top:null,
  createElement(tag){return node({tag,children:[],attrs:{},hidden:false,
   setAttribute(k,v){this.attrs[k]=v},append(...xs){this.children.push(...xs)}})}});
 const timers=new Map();let counter=0;
 const win=node({setTimeout(fn){let id=++counter;timers.set(id,fn);return id},
  clearTimeout(id){timers.delete(id)}});
 class Event{constructor(type){this.type=type}}
 vm.runInNewContext(source,{window:win,document:doc,Event},{timeout:5000});
 const panel=top.children[0];
 return {video,old,speaker,doc,top,panel,inner:panel.children[0],slider:panel.children[1],percent:panel.children[2],timers,saved:()=>saved,
  clickSpeaker(){let stopped=false;const e={stopImmediatePropagation(){stopped=true},preventDefault(){}};speaker.emit('click',e);return stopped}};
}
test('mobile starts closed with one 0-100 slider and percentage',()=>{
 const x=fixture();assert.equal(x.top.children.length,1);assert.equal(x.panel.hidden,true);
 assert.equal(x.slider.min,'0');assert.equal(x.slider.max,'100');
 assert.equal(x.slider.value,'70');assert.equal(x.percent.textContent,'70%');
 assert.equal(x.speaker.attrs['aria-controls'],'webMobileVolumePanel');
});
test('speaker opens and closes popover rather than muting',()=>{
 const x=fixture();assert.equal(x.clickSpeaker(),true);
 assert.equal(x.panel.hidden,false);assert.equal(x.video.muted,false);
 assert.equal(x.speaker.attrs['aria-expanded'],'true');
 x.clickSpeaker();assert.equal(x.panel.hidden,true);
});
test('slider uses existing #volume persistence and responds to external changes',()=>{
 const x=fixture();x.clickSpeaker();
 x.slider.value='42';x.slider.emit('input');
 assert.equal(x.video.volume,.42);assert.equal(x.saved(),.42);
 assert.equal(x.old.value,'42');assert.equal(x.percent.textContent,'42%');
 x.video.volume=.55;assert.equal(x.slider.value,'55');
});
test('inner mute button works without closing the popover',()=>{
 const x=fixture();x.clickSpeaker();x.inner.emit('click');
 assert.equal(x.video.muted,true);assert.equal(x.panel.hidden,false);
 x.inner.emit('click');assert.equal(x.video.muted,false);
});
test('zero slider value mutes and inner button restores last audible volume',()=>{
 const x=fixture();x.clickSpeaker();x.slider.value='0';x.slider.emit('input');
 assert.equal(x.video.muted,true);x.inner.emit('click');
 assert.equal(x.video.muted,false);assert.equal(x.video.volume,.7);
});
test('outside tap, escape and inactivity hide the popover',()=>{
 const x=fixture();x.clickSpeaker();x.doc.emit('pointerdown',{target:{}});
 assert.equal(x.panel.hidden,true);x.clickSpeaker();x.doc.emit('keydown',{key:'Escape'});
 assert.equal(x.panel.hidden,true);x.clickSpeaker();
 for(const fn of [...x.timers.values()])fn();assert.equal(x.panel.hidden,true);
});
test('desktop keeps previous mute handler and mobile CSS is scoped',()=>{
 const x=fixture({mobile:false});
 assert.equal(x.clickSpeaker(),false);
 assert.equal(x.panel.hidden,true);
 assert.match(css,/html:not\(\[data-iptv-device="mobile"\]\) #webMobileVolumePanel/);
});
test('mobile style preserves vector controls and offers iOS hardware hint',()=>{
 assert.match(css,/grid-area:4\/1\/5\/2!important/);
 assert.match(css,/#webMobileVolumePanel\[hidden\]\{display:none!important\}/);
 assert.match(css,/--ipc-volume/);
 assert.match(css,/\.web-is-ios body #page-tv/);
 assert.match(source,/phím âm lượng của máy/);
});
test('HTML references versioned mobile-only JS and CSS',()=>{
 assert.match(html,/web-mobile-volume\.js\?v=mobile-volume-popover-20261119a/);
 assert.match(html,/web-mobile-volume\.css\?v=mobile-volume-popover-20261119a/);
});
