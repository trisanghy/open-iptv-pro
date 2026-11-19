'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const js=fs.readFileSync(path.join(root,'web-ios-audio-recovery.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-ios-audio-recovery.css'),'utf8');
function target(obj={}){
 const listeners={};
 obj.addEventListener=(name,callback)=>(listeners[name]??=[]).push(callback);
 obj.emit=name=>{for(const f of listeners[name]||[])f({target:obj})};
 return obj;
}
function setup({chrome=false,paused=false,muted=true,reject=false,source='https://tv.example/live.m3u8'}={}){
 const created=[],notifications=[],classes=new Set();let silent=muted;
 const video=target({src:source,currentSrc:source,readyState:3,paused,volume:.8,defaultMuted:muted,playCalls:0});
 Object.defineProperty(video,'muted',{
  get(){return silent;},
  set(v){
   const previouslySilent=silent;silent=!!v;
   if(chrome&&previouslySilent&&!silent&&!video.paused)video.paused=true;
   video.emit('volumechange');
   if(chrome&&previouslySilent&&!silent&&video.paused)video.emit('pause');
  }
 });
 video.play=function(){
  this.playCalls++;
  if(reject)return Promise.reject(Object.assign(new Error('NotAllowedError'),{name:'NotAllowedError'}));
  this.paused=false;this.emit('playing');return Promise.resolve();
 };
 const box={
  placed:false,appendChild(el){el.parentElement=box;},
  insertAdjacentElement(pos,el){
   assert.equal(pos,'afterend');this.placed=true;el.parentElement={id:'watchPanel'};
  }
 };
 const mute=target({attributes:{},setAttribute(k,v){this.attributes[k]=v;}});
 // web-volume.js attaches before this module and toggles mute first.
 mute.addEventListener('click',()=>{video.muted=!video.muted;});
 const cast={hidden:true,setAttribute(){}},pip={hidden:true,setAttribute(){}};
 const nodes={video,playerBox:box,webVolumeMute:mute,castBtn:cast,pipBtn:pip};
 const doc=target({
  readyState:'complete',getElementById:id=>nodes[id]||null,
  createElement(tag){
   assert.equal(tag,'button');
   const button=target({classList:{
    add(v){classes.add(v);},contains(v){return classes.has(v);}
   },setAttribute(k,v){this[k]=v;}});
   created.push(button);
   return button;
  }
 });
 const win={document:doc,navigator:{userAgent:chrome?
  'Mozilla/5.0 (iPhone; CPU iPhone OS 26_7 like Mac OS X) AppleWebKit/605.1.15 CriOS/131.0 Mobile/15E148':
  'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/26.0 Mobile/15E148 Safari/604.1'
 },IPTVState:{toast:(...args)=>notifications.push(args)}};
 vm.runInNewContext(js,{window:win,document:doc,console},{timeout:2000});
 assert.equal(created.length,1,'One unmute action should be constructed');
 return {video,box,mute,cast,pip,doc,assist:created[0],notifications,classes};
}
test('Chrome iPhone unmute stays touchable outside native video surface and starts audible playback in same click',async()=>{
 const x=setup({chrome:true});
 assert.equal(x.box.placed,true);
 assert.equal(x.classes.has('web-unmute-assist-chrome-ios'),true);
 assert.equal(x.assist.hidden,false);
 assert.equal(x.video.paused,false,'Muted autoplay starts playing before tap');
 x.assist.emit('click');
 await Promise.resolve();
 assert.equal(x.video.muted,false);
 assert.equal(x.video.paused,false,'Chrome pausing on unmute must be recovered');
 assert.equal(x.video.playCalls,1,'play() must be called despite previous playing state');
 assert.equal(x.assist.hidden,true);
 assert.equal(x.notifications.length,0);
});
test('Safari uses its existing video overlay behavior without restarting an already playing stream',async()=>{
 const x=setup({chrome:false});
 assert.equal(x.box.placed,false);
 assert.equal(x.assist.parentElement,x.box);
 x.assist.emit('click');
 await Promise.resolve();
 assert.equal(x.video.playCalls,0);
 assert.equal(x.video.paused,false);
 assert.equal(x.video.muted,false);
});
test('Chrome toolbar volume tap also resumes playback after native WebKit interruption',async()=>{
 const x=setup({chrome:true});
 x.mute.emit('click');
 await Promise.resolve();
 assert.equal(x.video.paused,false);
 assert.equal(x.video.muted,false);
 assert.equal(x.video.playCalls,1);
});
test('Chrome autoplay rejection keeps retry button and explains failure instead of silent inert state',async()=>{
 const x=setup({chrome:true,reject:true});
 x.assist.emit('click');
 await Promise.resolve();await Promise.resolve();
 assert.equal(x.video.playCalls,1);
 assert.equal(x.video.paused,true);
 assert.equal(x.assist.hidden,false);
 assert.equal(x.notifications.length,1);
 assert.match(x.notifications[0][0],/Không thể phát tiếng/);
});
test('no selected stream never shows or starts the recovery action',()=>{
 const x=setup({chrome:true,source:''});
 assert.equal(x.assist.hidden,true);
 x.assist.emit('click');
 assert.equal(x.video.playCalls,0);
});
test('Chrome-only CSS and cache-busted sources preserve Safari/desktop interface',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(css,/#page-tv \.watch-panel > #webUnmuteAssist\.web-unmute-assist-chrome-ios/);
 assert.match(css,/\[hidden\]\{\s*display:none!important/);
 assert.match(html,/web-ios-audio-recovery\.js\?v=chrome-ios-audio-20261119b/);
 assert.match(html,/web-ios-audio-recovery\.css\?v=chrome-ios-audio-20261119b/);
 assert.ok(!js.includes('video.src='));
 assert.ok(js.includes('if(chromeIOS||video.paused)'));
});
