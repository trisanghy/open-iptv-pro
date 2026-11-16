'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../web-volume.js'),'utf8');
function init(vol=.8){
 const elems={};const get=id=>elems[id];
 const listeners={}; const events={};
 const video={_volume:vol,_muted:false,addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn)},
   get volume(){return this._volume},set volume(v){this._volume=v;(listeners.volumechange||[]).forEach(fn=>fn())},
   get muted(){return this._muted},set muted(v){this._muted=v;(listeners.volumechange||[]).forEach(fn=>fn())}}
 const range={value:'80',listeners:{},addEventListener(event,fn){(this.listeners[event]??=[]).push(fn)},dispatchEvent(event){for(const fn of this.listeners[event.type]||[])fn({target:this})}};
 const icon={textContent:''}; const mute={firstElementChild:icon,attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(event,fn){this.listeners[event]=fn},click(){this.listeners.click()}};
 elems.video=video;elems.volume=range;elems.webVolumeMute=mute;
 let persisted=vol;
 range.addEventListener('input',()=>{video.volume=Number(range.value)/100;persisted=video.volume});
 vm.runInNewContext(source,{window:{},document:{getElementById:get},Event:class Event{constructor(type,options){this.type=type;this.bubbles=options.bubbles}}});
 return {video,range,mute,icon,persisted:()=>persisted};
}
test('initial controls show saved 80 percent volume',()=>{const x=init(.8);assert.equal(x.range.value,'80');assert.equal(x.mute.attrs['aria-pressed'],'false')});
test('mute and unmute do not change remembered volume',()=>{const x=init(.65);x.mute.click();assert.equal(x.video.muted,true);assert.equal(x.video.volume,.65);assert.equal(x.mute.attrs['aria-pressed'],'true');x.mute.click();assert.equal(x.video.muted,false);assert.equal(x.persisted(),.65)});
test('slider input updates video and uses old storage handler',()=>{const x=init(.8);x.range.value='36';x.range.dispatchEvent({type:'input'});assert.equal(x.video.volume,.36);assert.equal(x.persisted(),.36);assert.equal(x.video.muted,false)});
test('raising slider unmutes sound',()=>{const x=init(.7);x.mute.click();x.range.value='20';x.range.dispatchEvent({type:'input'});assert.equal(x.video.muted,false);assert.equal(x.video.volume,.2)});
test('zero volume is muted; button restores prior audible level',()=>{const x=init(.55);x.range.value='0';x.range.dispatchEvent({type:'input'});assert.equal(x.video.muted,true);x.mute.click();assert.equal(x.video.muted,false);assert.equal(x.video.volume,.55);assert.equal(x.range.value,'55')});
test('external video volume changes synchronize slider',()=>{const x=init(.8);x.video.volume=.43;assert.equal(x.range.value,'43');x.video.muted=true;assert.equal(x.mute.attrs['aria-label'],'Bật tiếng')});
