'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const svc=require('../src/live-caption-service.cjs');
test('v4.23.43 local captions require Whisper and FFmpeg, do not send speech to cloud',()=>{
 const inst=svc.createLiveCaptionService({dataDir:require('node:os').tmpdir(),getFFmpeg:()=>null,notify:()=>{}});
 assert.equal(inst.status().available,false);assert.match(inst.status().reason,/FFmpeg/);
 assert.throws(()=>inst.start({url:'file:///etc/passwd'}));assert.equal(svc.tidy('[00:00:01.000 --> 00:00:02.000] Hello'),'Hello');
});
test('v4.23.43 caption switches are on row three, after both original rows',()=>{
 const h=read('renderer/index.html');
 assert.ok(h.indexOf('id="captionThirdRow"')>h.indexOf('class="control-layout-bottom"'));
 for(const id of ['liveCaptionToggle','liveTranslateToggle','captionChooseBinary','captionChooseModel','liveCaptionOutput'])assert.match(h,new RegExp('id="'+id+'"'));
 assert.ok(h.lastIndexOf('live-caption-row-v42343.css')>h.lastIndexOf('player-compact-cast-v42342.css'));
 assert.ok(h.lastIndexOf('live-captions-v42343.js')>h.lastIndexOf('app.js'));
});
test('v4.23.43 Native IPC is bounded and captions stop before quit',()=>{
 const main=read('src/main.cjs'),pre=read('src/preload.cjs');
 for(const tag of ['caption:status','caption:start','caption:stop','caption:chooseFile']){assert.ok(main.includes(tag));assert.ok(pre.includes(tag));}
 assert.match(main,/liveCaptionService\?\.stop\(\)/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.63');
});
