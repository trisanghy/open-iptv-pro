'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('P5.1.227 isolates jump scroll to native channel-list viewport',()=>{
 const js=read('renderer/positron-channel-jump.js');
 const css=read('renderer/positron-channel-jump.css');
 assert.ok(js.includes('list.scrollTop+=targetRect.top-listRect.top'));
 assert.ok(js.includes('target.focus({preventScroll:true})'));
 assert.ok(!js.includes('target.scrollIntoView({'));
 assert.ok(css.includes('white-space:nowrap!important'));
 assert.ok(css.includes('font-size:12px!important'));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=312);
});
test('P5.1.227 real Electron screenshot detects outer page scrolling and heading wraps',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),flow=read('.github/workflows/positron-lab.yml');
 for(const key of ['outerPageStayed:','sidebarHeaderVisible:','headerOneLine:','videoTopVisible:'])assert.ok(qa.includes(key));
 for(const n of ['positron-p51227-jump-scroll-before-1920x1080-real.png','positron-p51227-jump-scroll-after-1920x1080-real.png']){
  assert.ok(qa.includes(n));assert.ok(flow.includes(n));
 }
});
