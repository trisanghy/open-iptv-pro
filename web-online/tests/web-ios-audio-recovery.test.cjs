'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'web-ios-audio-recovery.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function target(base={}){
 const handlers={};
 base.addEventListener=(kind,fn)=>(handlers[kind]??=[]).push(fn);
 base.emit=kind=>{for(const fn of handlers[kind]||[])fn({target:base})};
 return base;
}
function fixture({chrome=true,hasSource=true,autoplayMuted=true,blocked=false}={}){
 const video=target({muted:autoplayMuted,paused:false,playCount:0,
  src:hasSource?'https://example.org/live.m3u8':'',
  currentSrc:hasSource?'https://example.org/live.m3u8':'',
  play(){
   this.playCount++;
   if(blocked)return Promise.reject(Object.assign(new Error('NotAllowedError'),{name:'NotAllowedError'}));
   this.paused=false;return Promise.resolve();
  }
 });
 const mute=target({});
 // Original web-volume.js handler runs first; Chrome may pause while unmuting.
 mute.addEventListener('click',()=>{
  video.muted=!video.muted;
  if(chrome&&!video.muted)video.paused=true;
 });
 const legacy={removed:0,remove(){this.removed++}};
 const status={textContent:''};
 const els={video,webVolumeMute:mute,webUnmuteAssist:legacy,'web-resume-panel':legacy,streamInfo:status};
 const document=target({readyState:'complete',created:0,
  createElement(){this.created++;return target({})},
  getElementById:id=>els[id]||null
 });
 const window={document,navigator:{userAgent:chrome?'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/132.0 Mobile':'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/26 Safari/604.1'}};
 vm.runInNewContext(source,{window,document,console},{timeout:3000});
 return {video,mute,legacy,status,document};
}
test('no duplicate sound buttons are created on Safari or Chrome iPhone',()=>{
 for(const chrome of [true,false]){
  const e=fixture({chrome});
  assert.equal(e.document.created,0);
  assert.equal(e.legacy.removed,2);
 }
 assert.doesNotMatch(source,/createElement|web-unmute-assist|Bật tiếng/);
});
test('Chrome iOS sound uses only existing volume button and resumes in the SAME gesture',async()=>{
 const e=fixture();
 e.mute.emit('click');
 await Promise.resolve();
 assert.equal(e.video.muted,false);
 assert.equal(e.video.paused,false);
 assert.equal(e.video.playCount,1);
});
test('muting via existing toolbar does not spuriously restart video',()=>{
 const e=fixture({autoplayMuted:false});
 e.mute.emit('click');
 assert.equal(e.video.muted,true);
 assert.equal(e.video.playCount,0);
});
test('Safari keeps existing volume action without new playback listeners',()=>{
 const e=fixture({chrome:false});
 e.mute.emit('click');
 assert.equal(e.video.playCount,0);
 assert.equal(e.video.muted,false);
});
test('empty source never triggers playback',()=>{
 const e=fixture({hasSource:false});
 e.mute.emit('click');
 assert.equal(e.video.playCount,0);
});
test('Chrome iOS autoplay policy rejection uses normal player status, no second button',async()=>{
 const e=fixture({blocked:true});
 e.mute.emit('click');
 await Promise.resolve();await Promise.resolve();
 assert.equal(e.video.playCount,1);
 assert.match(e.status.textContent,/Nhấn Phát/);
 assert.equal(e.document.created,0);
});
test('HTML includes only one inline Chrome recovery script and no obsolete overlay CSS',()=>{
 assert.match(html,/web-ios-audio-recovery\.js\?v=autoplay-clean-20261119a/);
 assert.match(html,/resume-last\.js\?v=autoplay-clean-20261119a/);
 assert.doesNotMatch(html,/web-ios-audio-recovery\.css|resume-last\.css/);
 const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
 assert.doesNotMatch(builder,/href="web-ios-audio-recovery\.css"/);
 assert.doesNotMatch(builder,/href="resume-last\.css"/);
});
