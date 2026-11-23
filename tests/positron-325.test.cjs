'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('P325 WatchFlow arrow/Home/End only focuses a mode, never activates Zap',()=>{
 const js=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const qa=fs.readFileSync('scripts/positron-325-audit.cjs','utf8');
 const runner=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const workflow=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 for(const token of ["P325: focus-only keyboard navigation","event.target?.closest?.('button[data-flowplus-mode]')",
  "event.preventDefault();event.stopPropagation();","eligible[nextIndex].focus({preventScroll:true})",
  "'ArrowLeft','ArrowRight','Home','End'","toolbar.setAttribute('aria-keyshortcuts'"])
  assert.ok(js.includes(token),token);
 assert.ok(!js.includes("eligible[nextIndex].click()"),'Arrows must never activate Smart Zap');
 for(const name of ['fiveButtons','rightToSecond','endToZap','focusOnly','noAutoplay','playlistIntact','modelIntact','narrowRightToSecond'])
  assert.ok(qa.includes(name),name);
 assert.ok(runner.includes("require('./positron-325-audit.cjs').run(page)"));
 for(const png of ['positron-p51325-keyboard-modes-before-1920x1080-real.png',
  'positron-p51325-keyboard-modes-after-1920x1080-real.png',
  'positron-p51325-keyboard-modes-after-720x900-real.png'])
  assert.ok(workflow.includes(png),png);
});
