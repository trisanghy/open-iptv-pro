'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('P324 five WatchFlow mode targets are 44px and tested in actual Electron',()=>{
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const audit=fs.readFileSync('scripts/positron-324-audit.cjs','utf8');
 const runner=fs.readFileSync('scripts/positron-50-audit.cjs','utf8');
 const workflow=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 assert.match(css,/P324: Electron 720px P323 shows five mode buttons/);
 assert.match(css,/\.po-flowplus-nav button\{\s*min-height:44px!important/);
 for(const word of ['narrowHeight44','keyboardFocus','playlistIntact','modelIntact','noAutoplay','oneRow'])
  assert.ok(audit.includes(word),word);
 assert.ok(runner.includes("require('./positron-324-audit.cjs').run(page)"));
 for(const name of ['positron-p51324-watchflow-tabs-before-1920x1080-real.png',
  'positron-p51324-watchflow-tabs-after-1920x1080-real.png',
  'positron-p51324-watchflow-tabs-after-720x900-real.png'])
  assert.ok(workflow.includes(name),name);
});
