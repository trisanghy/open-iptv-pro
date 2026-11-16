'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const base=path.resolve(__dirname,'../renderer');
const js=fs.readFileSync(path.join(base,'video-source-aspect-v17.js'),'utf8');
const css=fs.readFileSync(path.join(base,'player-layout-rollback-v19.css'),'utf8');
const collapsedCss=fs.readFileSync(path.join(base,'tv-compact-collapse-v14.css'),'utf8');
function createHarness(){
 const handlers={};
 const properties={};
 const frame={style:{setProperty(name,val){properties[name]=val;}},dataset:{}};
 const video={videoWidth:0,videoHeight:0,readyState:0,currentSrc:'',addEventListener(name,cb){(handlers[name]??=[]).push(cb);}};
 const document={getElementById(id){return id==='video'?video:id==='playerBox'?frame:null}};
 const window={document};vm.runInNewContext(js,{window,document});
 return {handlers,properties,video,frame,emit(name){for(const cb of handlers[name]||[])cb();},api:window.IPTVSourceVideoAspect};
}
test('defaults to 16:9 without stream metadata',()=>{
 const h=createHarness();
 assert.equal(h.properties['--ipvp-source-video-aspect'],'16 / 9');
 assert.equal(h.frame.dataset.sourceAspect,'default');
});
test('source metadata updates player frame (4:3, 9:16, 21:9)',()=>{
 const h=createHarness();h.video.readyState=1;h.video.currentSrc='http://127.0.0.1/stream';
 for(const [w,height] of [[1440,1080],[1080,1920],[2560,1080]]){
  h.video.videoWidth=w;h.video.videoHeight=height;
  h.emit('loadedmetadata');
  assert.equal(h.properties['--ipvp-source-video-aspect'],`${w} / ${height}`);
  assert.equal(h.frame.dataset.sourceAspect,'source');
 }
});
test('channel changes/retries reset immediately to default 16:9',()=>{
 const h=createHarness();
 h.video.videoWidth=640;h.video.videoHeight=480;h.video.readyState=1;h.video.currentSrc='url';
 h.emit('loadedmetadata');assert.equal(h.properties['--ipvp-source-video-aspect'],'640 / 480');
 h.emit('emptied');assert.equal(h.properties['--ipvp-source-video-aspect'],'16 / 9');
 h.emit('loadstart');assert.equal(h.properties['--ipvp-source-video-aspect'],'16 / 9');
 h.video.videoWidth=1280;h.video.videoHeight=720;h.video.currentSrc='';h.emit('loadedmetadata');
 assert.equal(h.properties['--ipvp-source-video-aspect'],'16 / 9','ignore obsolete media metadata');
});
test('adaptive resolution triggers resize and retains users object-fit controls',()=>{
 const h=createHarness();h.video.readyState=2;h.video.currentSrc='stream';
 h.video.videoWidth=1280;h.video.videoHeight=720;h.emit('loadeddata');
 h.video.videoWidth=1024;h.video.videoHeight=768;h.emit('resize');
 assert.equal(h.properties['--ipvp-source-video-aspect'],'1024 / 768');
 assert.ok(!js.includes('objectFit'));
});
test('all frame presentation modes use source aspect and remove height cap',()=>{
 assert.match(css, /aspect-ratio:var\(--ipvp-source-video-aspect,16 \/ 9\)!important/);
 assert.match(css, /max-height:none!important/);
 assert.match(css, /\.player-box:fullscreen\{aspect-ratio:auto!important/);
 assert.match(collapsedCss,/aspect-ratio:var\(--ipvp-source-video-aspect,16 \/ 9\)!important/);
 const entry=fs.readFileSync(path.join(base,'app-entry.js'),'utf8');
 assert.ok(entry.indexOf("'video-source-aspect-v17.js'")>=0);
 assert.ok(entry.indexOf("'video-source-aspect-v17.js'")<entry.indexOf("'app.js'"));
});