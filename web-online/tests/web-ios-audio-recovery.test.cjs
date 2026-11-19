'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'web-ios-audio-recovery.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function target(o={}){const h={};o.addEventListener=(n,f)=>(h[n]??=[]).push(f);o.emit=(n,event={})=>{for(const f of h[n]||[])f(event)};return o;}
function fixture({chrome=true,sourceReady=true,reject=false}={}){
 const video=target({muted:true,paused:false,volume:.8,playCalls:0,
  src:sourceReady?'https://example.org/one.m3u8':'',currentSrc:sourceReady?'https://example.org/one.m3u8':'',
  play(){this.playCalls++;if(reject)return Promise.reject(Object.assign(new Error('Blocked'),{name:'NotAllowedError'}));
   this.paused=false;this.emit('playing');return Promise.resolve()}});
 const mute=target({});
 mute.addEventListener('click',()=>{video.muted=!video.muted;if(chrome&&!video.muted)video.paused=true});
 const box={children:[],append(el){this.children.push(el)}};
 const old={removed:0,remove(){this.removed++}};
 const elements={video,webVolumeMute:mute,playerBox:box,webUnmuteAssist:old,'web-resume-panel':old,streamInfo:{textContent:''}};
 const doc=target({readyState:'complete',created:0,createElement(tag){this.created++;return target({tag,children:[],hidden:false,attrs:{},
  setAttribute(k,v){this.attrs[k]=v},append(...items){this.children.push(...items)}})},getElementById:id=>elements[id]||null});
 const win={document:doc,IPTVState:{getStore:()=>({autoEnableAudio:true}),getCurrent:()=>({id:'one'})},
  navigator:{userAgent:chrome?'Mozilla/5.0 (iPhone) CriOS/132.0':'Mozilla/5.0 (iPhone) Safari/604.1'}};
 vm.runInNewContext(source,{window:win,document:doc,console,Promise},{timeout:3000});
 return {video,mute,box,doc,old,banner:box.children[0],button:box.children[0]?.children[1]};
}
test('one upper video banner exists, no separate lower unmute button',()=>{
 for(const chrome of [true,false]){const e=fixture({chrome});assert.equal(e.doc.created,3);assert.equal(e.old.removed,2);
  assert.equal(e.box.children.length,1);assert.equal(e.banner.id,'webAudioPermissionBanner');assert.equal(e.banner.hidden,true);}
 assert.match(html,/web-ios-audio-recovery\.css\?v=top-banner-20261119b/);
});
test('muted-autoplay permission event opens only upper banner; clicking unmutes and plays',async()=>{
 const e=fixture();e.doc.emit('openiptv:autoplay-muted',{detail:{channelId:'one'}});
 assert.equal(e.banner.hidden,false);
 e.button.emit('click');await Promise.resolve();
 assert.equal(e.video.muted,false);assert.equal(e.video.playCalls,1);assert.equal(e.banner.hidden,true);
});
test('permission error leaves upper banner visible for another user click',async()=>{
 const e=fixture({reject:true});e.doc.emit('openiptv:autoplay-blocked',{detail:{channelId:'one'}});
 e.button.emit('click');await Promise.resolve();await Promise.resolve();
 assert.equal(e.banner.hidden,false);
});
test('other channels and missing source never show permission banner',()=>{
 const e=fixture();e.doc.emit('openiptv:autoplay-muted',{detail:{channelId:'not-one'}});
 assert.equal(e.banner.hidden,true);
 const none=fixture({sourceReady:false});none.doc.emit('openiptv:autoplay-muted',{detail:{channelId:'one'}});
 assert.equal(none.banner.hidden,true);
});
test('Chrome mute button resumes native video in the same click without duplicating stream',async()=>{
 const e=fixture();e.mute.emit('click');await Promise.resolve();
 assert.equal(e.video.paused,false);assert.equal(e.video.playCalls,1);
 const safari=fixture({chrome:false});safari.mute.emit('click');assert.equal(safari.video.playCalls,0);
});
