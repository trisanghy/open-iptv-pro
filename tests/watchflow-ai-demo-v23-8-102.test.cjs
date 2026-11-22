'use strict';
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'renderer/watchflow-ai-demo-v23-8-102.js'),'utf8');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const api=require('../renderer/watchflow-ai-demo-v23-8-102.js');
test('UI mounts after original unified AI controls, without replacing video or PiP',()=>{
 assert.match(html,/src="watchflow-ai-demo-v23-8-102.js"/);
 assert.match(html,/href="watchflow-ai-demo-v23-8-102.css"/);
 assert.match(source,/getElementById\('captionThirdRow'\)/);
 assert.match(source,/getElementById\('videoEnhanceToggle'\)/);
 assert.match(source,/row\.insertAdjacentElement\('afterend',panel\)/);
 assert.doesNotMatch(source,/video\.replaceWith|replaceChildren\(.*video/);
});
test('Rules read EPG and channel metadata',()=>{
 assert.equal(api.classify({name:'Random',group:'Khác'},'Thời sự 19h').label,'Tin tức');
 assert.equal(api.classify({name:'K+ SPORT1',group:'Khác'}).label,'Thể thao');
 assert.equal(api.classify({name:'HBO',group:'Khác'}).label,'Phim truyện');
 assert.equal(api.classify({name:'Unknown',group:'Khác'}).label,'Chưa phân loại');
});
test('History-based order is non-mutating',()=>{
 const c=[{id:'1'},{id:'2'}];assert.equal(api.recommend(c,[{id:'2'}])[0].id,'2');assert.equal(c[0].id,'1');
});
test('No stealth discovery or stream import in preview',()=>{
 assert.match(source,/MINH HỌA/);
 assert.match(source,/chưa kích hoạt mô hình Smart/);
 assert.doesNotMatch(source,/\bfetch\s*\(|smartLoad\s*\(|parseM3U\s*\(/);
});
