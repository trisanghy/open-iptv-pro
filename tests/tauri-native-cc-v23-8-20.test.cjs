'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const {createController}=require('../renderer/rust-native-cc-v23-8-20.js');
class VTTCue{
 constructor(startTime,endTime,text){Object.assign(this,{startTime,endTime,text});}
}
function setup(){
 const listeners=new Map(),docListeners=new Map(),cues=[];
 const track={
  mode:'disabled',cues,
  addCue(cue){cues.push(cue);},
  removeCue(cue){const i=cues.indexOf(cue);if(i!==-1)cues.splice(i,1);}
 };
 let creates=0;
 const video={
  currentTime:42,webkitPresentationMode:'inline',webkitDisplayingFullscreen:false,
  addTextTrack(){creates++;return track;},
  addEventListener(type,fn){listeners.set(type,fn);}
 };
 const doc={
  pictureInPictureElement:null,fullscreenElement:null,webkitFullscreenElement:null,
  addEventListener(type,fn){docListeners.set(type,fn);}
 };
 const win={VTTCue,requestAnimationFrame:fn=>fn()};
 const cc=createController({video,doc,win});
 return {cc,video,doc,cues,track,creates:()=>creates,
  fire:kind=>(listeners.get(kind)||docListeners.get(kind))?.()};
}
test('Normal video renders HTML captions; one native cue exists but is hidden',()=>{
 const s=setup();
 assert.equal(s.cc.sync('Nguyên bản\nBản dịch',true),true);
 assert.equal(s.track.mode,'hidden');
 assert.equal(s.cues.length,1);
 assert.equal(s.cues[0].text,'Nguyên bản\nBản dịch');
 assert.equal(s.creates(),1);
});
test('Entering and leaving native PiP shows and hides the existing cue immediately',()=>{
 const s=setup();s.cc.sync('Xin chào',true);
 s.doc.pictureInPictureElement=s.video;s.fire('enterpictureinpicture');
 assert.equal(s.track.mode,'showing');
 assert.equal(s.cues.length,1);
 s.doc.pictureInPictureElement=null;s.fire('leavepictureinpicture');
 assert.equal(s.track.mode,'hidden');
 assert.equal(s.creates(),1);
});
test('Apple WebKit PiP and native video fullscreen use the same existing text track',()=>{
 const s=setup();s.cc.sync('原文\nBản dịch',true);
 s.video.webkitPresentationMode='picture-in-picture';s.fire('webkitpresentationmodechanged');
 assert.equal(s.track.mode,'showing');
 s.video.webkitPresentationMode='inline';s.video.webkitDisplayingFullscreen=true;
 s.fire('webkitbeginfullscreen');assert.equal(s.track.mode,'showing');
 s.video.webkitDisplayingFullscreen=false;s.doc.fullscreenElement=s.video;
 s.fire('fullscreenchange');assert.equal(s.track.mode,'showing');
 s.doc.fullscreenElement=null;s.fire('fullscreenchange');
 assert.equal(s.track.mode,'hidden');
});
test('Fullscreen of playerBox keeps HTML overlay rather than duplicate native subtitles',()=>{
 const s=setup();s.cc.sync('A long translated caption',true);
 s.doc.fullscreenElement={id:'playerBox'};
 s.fire('fullscreenchange');
 assert.equal(s.track.mode,'hidden');
 const style=read('renderer/rust-subtitle-controls-v23-8-5.css');
 assert.ok(style.includes('#page-tv #playerBox:fullscreen #rustTranslatedCaption'));
 assert.ok(style.includes('bottom:max(120px,12vh)!important'));
});
test('CC disabled or video paused clears native cue; settings still govern both displays',()=>{
 const s=setup();s.cc.sync('Old caption',true);
 s.doc.pictureInPictureElement=s.video;s.fire('enterpictureinpicture');
 assert.equal(s.track.mode,'showing');
 s.cc.sync('New caption',true);
 assert.equal(s.cues.length,1);assert.equal(s.cues[0].text,'New caption');
 s.cc.clear();
 assert.equal(s.track.mode,'disabled');assert.equal(s.cues.length,0);
 s.cc.sync('Hidden',false);assert.equal(s.cues.length,0);
 const ui=read('renderer/rust-subtitle-controls-v23-8-5.js');
 assert.ok(ui.includes("nativeCC?.sync(lines.join('\\n'),settings.enabled&&lines.length>0)"));
 assert.ok(ui.includes("nativeCC?.clear()"));
 assert.ok(ui.includes("overlay.hidden=lines.length===0||!!nativeCC?.isNativePresentation()"));
});
test('Legacy duplicate track removed; only one native track is created; module is loaded before CC',()=>{
 const source=read('renderer/live-captions-v42343.js');
 const entry=read('renderer/app-entry.js');
 assert.ok(!source.includes('video.addTextTrack('));
 assert.ok(!source.includes('new window.VTTCue('));
 assert.ok(entry.indexOf("'rust-native-cc-v23-8-20.js'")<entry.indexOf("'rust-subtitle-controls-v23-8-5.js'"));
 assert.ok(read('renderer/auto-pip-v42363.js').includes('video.requestPictureInPicture()'));
});
test('Version and immutable Mac tag match',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const release=pkg.version.split('-tauri.')[1];
 const builder=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.ok(require('node:fs').readFileSync(require('node:path').join(__dirname,'../scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8').includes('SOURCE_REF="refs/heads/${BRANCH}"'));
 assert.ok(builder.includes('npm run build -- --bundles app'));
});
