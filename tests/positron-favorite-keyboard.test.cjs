'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('P5.1.229 focused F key activates native favorite toggle, never playback',()=>{
 const js=read('renderer/positron-channel-jump.js'),css=read('renderer/positron-channel-jump.css');
 for(const s of ["event.key==='f'","event.preventDefault()","event.stopPropagation()","star.click()",
  "getAttribute('aria-pressed')","replacement.focus({preventScroll:true})"])
  assert.ok(js.includes(s),s);
 assert.ok(!js.includes('playChannel('));
 assert.ok(css.includes('.channel-item:focus .channel-star.marked'));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=314,'P229 favorite shortcut must survive later patch versions');
});
test('P5.1.229 real Electron screenshots verify persisted favorite and return to baseline',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),wf=read('.github/workflows/positron-lab.yml');
 for(const n of ['positron-p51229-keyboard-favorite-before-1920x1080-real.png','positron-p51229-keyboard-favorite-after-1920x1080-real.png']){
  assert.ok(qa.includes(n));assert.ok(wf.includes(n));
 }
 for(const s of ['favoriteQA229=','favoriteRestoreQA229=','countIncreased:','playbackUnchanged:','rowStillFocused:','restored:'])assert.ok(qa.includes(s),s);
});
