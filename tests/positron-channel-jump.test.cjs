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
  "all.click()","expandFolderBtn","scrollIntoView({block:'center'","target.focus({preventScroll:true})",
  "event.key==='Enter'","event.key==='Escape'"])
  assert.ok(js.includes(fragment),'Missing native channel jump: '+fragment);
 assert.ok(!js.includes('playChannel('),'Jump must never call playback');
 assert.ok(!js.includes('store.channels=')&&!js.includes('save()'),'Jump cannot reorder playlist');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.311');
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
