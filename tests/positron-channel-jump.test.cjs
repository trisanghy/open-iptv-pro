'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('P5.1.226 ships visible accessible numeric channel jump without playback',()=>{
 const html=read('renderer/index.html'),js=read('renderer/positron-channel-jump.js');
 assert.ok(html.includes('positron-channel-jump.css'));
 assert.ok(html.includes('positron-channel-jump.js'));
 for(const fragment of ["toggle.id='poChannelJumpToggle'","panel.id='poChannelJumpPanel'","state.getChannels()",
  "all.click()","expandFolderBtn","list.scrollTop+=","target.focus({preventScroll:true})",
  "event.key==='Enter'","event.key==='Escape'"])
  assert.ok(js.includes(fragment),'Missing native channel jump: '+fragment);
 assert.ok(!js.includes('playChannel('),'Jump must never call playback');
 assert.ok(!js.includes('store.channels=')&&!js.includes('save()'),'Jump cannot reorder playlist');
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=311,'P226 numeric jump must remain covered');
});
test('P5.1.226 real Electron image and list focus are checked in CI',()=>{
 const qa=read('scripts/positron-20-extension.cjs'),flow=read('.github/workflows/positron-lab.yml');
 for(const name of ['positron-p51226-channel-jump-before-1920x1080-real.png','positron-p51226-channel-jump-after-1920x1080-real.png']){
  assert.ok(qa.includes("await page.screenshot({path:path.join(out,'"+name+"'"));
  assert.ok(flow.includes(name));
 }
 assert.ok(qa.includes('focused250:active===row'));
 assert.ok(qa.includes('stillNotPlaying:'));
 assert.ok(qa.includes('focusReturned:'));
});

test('P5.1.230 keyboard group hopping does not play or reorder channels',()=>{
 const js=read('renderer/positron-channel-jump.js');
 for(const token of ["'ArrowLeft','ArrowRight'","const groupBoundaryTarget=",
  ".folder-header","nextElementSibling","rows.indexOf(groupBoundaryTarget(",
  "event.key==='ArrowRight'?1:-1","groupMove?'Đã chuyển nhóm. '"])
  assert.ok(js.includes(token),'Missing P230 behavior: '+token);
 assert.ok(!js.includes('playChannel('),'No autoplay allowed');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.315');
});
test('P5.1.230 checks left/right transitions in real 16:9 Electron screenshots',()=>{
 const qa=read('scripts/positron-20-extension.cjs');
 const flow=read('.github/workflows/positron-lab.yml');
 for(const filename of ['positron-p51230-group-navigation-before-1920x1080-real.png',
  'positron-p51230-group-navigation-after-1920x1080-real.png']){
  assert.ok(qa.includes(filename));
  assert.ok(flow.includes(filename));
 }
 for(const token of ["page.keyboard.press('ArrowRight')","page.keyboard.press('ArrowLeft')",
  'nextGroupFocused:','firstGroupFocused:','noAutoplay:','noHorizontalOverflow:'])
  assert.ok(qa.includes(token));
});
