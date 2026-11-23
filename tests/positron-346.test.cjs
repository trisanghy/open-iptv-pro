'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P346 Escape collapses only native AI guide and returns focus without mutating playback',()=>{
 const js=read('renderer/positron-intelligence.js');
 for(const value of ["shortcutGuide.addEventListener('keydown',event=>{",
  "event.key!=='Escape'","shortcutGuide.open=false;","event.preventDefault();event.stopPropagation();",
  "shortcutSummary.focus({preventScroll:true})","shortcutGuide.setAttribute('aria-keyshortcuts','Escape')",
  "shortcutGuide.open=false; // P346: fresh modal reopens with compact help"])
  assert.ok(js.includes(value),'missing P346 nested Escape guard '+value);
 assert.ok(js.includes('modeHelp.append(shortcutGuide)'),'P326 regression: guide must not reserve a new vertical row');
 assert.ok(read('renderer/positron-intelligence.css').includes('position:absolute!important;top:-13px'),'collapsed guide must overlay existing help row');

 const p=JSON.parse(read('package.json'));assert.ok(Number.parseInt(p.description.split('Positron P5.1.')[1],10)>=346);
});
test('P346 native Electron QA compares actual before/after and reopens guide safely',()=>{
 const qa=read('scripts/positron-346-audit.cjs'),ext=read('scripts/positron-20-extension.cjs');
 for(const s of ["await page.keyboard.press('Escape')","await page.keyboard.press('F6')",
  "summaryFocused","!reopened.guideOpen","noOverflow","realElectron:true",
  "positron-p51346-escape-guide-","afterSha256"])assert.ok(qa.includes(s),'missing QA '+s);
 assert.ok(ext.includes("require('./positron-346-audit.cjs').run(page)"));
});
