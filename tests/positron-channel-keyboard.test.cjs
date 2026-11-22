'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('P5.1.228 keyboard navigation does not initiate stream or move the outer TV page',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const k of ['ArrowUp','ArrowDown','Home','End','PageUp','PageDown'])assert.ok(js.includes("'"+k+"'"),k);
 for(const k of ['channelList.addEventListener','event.preventDefault()','event.stopPropagation()','next.focus({preventScroll:true})','channelList.scrollTop+='])
  assert.ok(js.includes(k),k);
 assert.ok(!js.includes('playChannel('));
 assert.ok(js.includes("event.altKey&&!event.ctrlKey"));
 const css=read('renderer/positron-channel-jump.css');
 assert.ok(css.includes('#channelList .channel-item:focus'));
 assert.ok(css.includes('outline:2px solid #83e3d3!important'));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.313');
});
test('P5.1.228 Electron CDP captures keyboard before/after and verifies full navigation',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const flow=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51228-keyboard-channels-before-1920x1080-real.png',
  'positron-p51228-keyboard-channels-after-1920x1080-real.png']){
  assert.ok(qa.includes(name));assert.ok(flow.includes(name));
 }
 for(const k of ['movedBeyond401:','focusRing:','outerPageStayed:','noAutoplay:','focusedLast:','focusedFirst:','numberFocused:'])assert.ok(qa.includes(k),k);
});
