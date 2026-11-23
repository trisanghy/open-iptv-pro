'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P345 native AI shortcut guide is optional, remote-accessible and does not alter playback',()=>{
 const js=read('renderer/positron-intelligence.js'),css=read('renderer/positron-intelligence.css');
 for(const x of ["shortcutGuide=d.createElement('details')","shortcutGuide.id='poAIShortcutGuide'",
  "shortcutSummary.setAttribute('aria-label'","modeHelp.after(shortcutGuide)",
  "PageUp/PageDown: lùi hoặc tiến 5 gợi ý","Chỉ Enter hoặc Space trên nút Xem"])
  assert.ok(js.includes(x),'missing P345 keyboard help '+x);
 assert.ok(css.includes('#poAIShortcutGuide')&&css.includes('min-height:44px'));
 assert.ok(Number.parseInt(JSON.parse(read('package.json')).description.split('Positron P5.1.')[1],10)>=345);
});
test('P345 native Electron tests real Enter before-after and preserves P344 paging',()=>{
 const qa=read('scripts/positron-345-audit.cjs'),ext=read('scripts/positron-20-extension.cjs');
 for(const x of ["await page.keyboard.press('Enter')","after.minTouch>=44",
  "realElectron:true","noOverflow","positron-p51345-shortcut-guide-","afterSha256"])
  assert.ok(qa.includes(x),'missing P345 QA '+x);
 assert.ok(ext.includes("require('./positron-345-audit.cjs').run(page)"));
 assert.ok(read('renderer/positron-intelligence.js').includes("event.key!=='PageUp'&&event.key!=='PageDown'"));
});
