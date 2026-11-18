'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {ratioForSource}=require('../renderer/video-source-aspect-v42338.js');
const html=read('renderer/index.html');
const css=read('renderer/video-source-aspect-v42338.css');
const js=read('renderer/video-source-aspect-v42338.js');
test('source aspect: default 16:9 before video metadata or on corrupt dimensions',()=>{
 for (const [w,h] of [[0,0],[0,1080],[-1,9],[Infinity,1],[9999,1]]) {
  const r=ratioForSource(w,h);assert.equal(r.numeric,16/9);
 }
});
test('source aspect: portrait / 4:3 / 16:9 / ultra-wide are supported',()=>{
 for (const [w,h] of [[640,480],[1920,1080],[2520,1080],[1080,1920]]) {
  assert.equal(ratioForSource(w,h).numeric,w/h);
 }
});
test('source aspect: metadata and resolution changes update frame; source switch resets it',()=>{
 assert.match(js,/loadedmetadata/);assert.match(js,/resize/);
 assert.match(js,/loadstart/);assert.match(js,/emptied/);
 assert.match(js,/--source-video-ratio/);
 assert.match(css,/aspect-ratio:\s*var\(--source-video-ratio\)!important/);
 assert.match(css,/#playerBox:not\(:fullscreen\)/);
 assert.match(css,/max-height:\s*none!important/);
});
test('source aspect: integrated after existing CSS/JS without changing playback controls',()=>{
 assert.match(html,/video-source-aspect-v42338\.css/);
 assert.match(html,/video-source-aspect-v42338\.js/);
 assert.equal((html.match(/id="video"/g)||[]).length,1);
 for (const name of ['videoFit','fullscreenUX','playBtn','manualStreamSelect'])assert.match(html,new RegExp(`id="${name}"`));
 assert.match(css,/> video\.fit-cover/);
 assert.match(css,/> video\.fit-fill/);
 assert.match(css,/> video\.fit-none/);
});
