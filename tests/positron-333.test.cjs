'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P333 active AI hides redundant WatchFlow modes and preserves original path',()=>{
 const css=read('renderer/positron-intelligence.css'),js=read('renderer/positron-intelligence.js'),
  qa=read('scripts/positron-333-audit.cjs'),ext=read('scripts/positron-20-extension.cjs'),
  wf=read('.github/workflows/positron-lab.yml');
 assert.ok(css.includes('#poWatchFlowPanel[data-po-ai-active="true"] .po-flowplus-nav'));
 assert.ok(css.includes('display:none!important'));
 assert.ok(js.includes("tab.addEventListener('click',()=>{if(aiOpen)"));
 for(const p of ['legacyToolbarReproduced','layoutReclaimed','narrowFirstActionReachable',
  'redundantToolbarHidden','playlistUnchanged','modelUnchanged','noAutoplay',
  'positron-p51333-ai-actions-before-1920x1080-real.png',
  'positron-p51333-ai-actions-after-1920x1080-real.png',
  'positron-p51333-ai-actions-before-720x900-real.png',
  'positron-p51333-ai-actions-after-720x900-real.png'])assert.ok(qa.includes(p),p);
 assert.ok(ext.includes("require('./positron-333-audit.cjs').run(page)"));
 assert.ok(wf.includes('node --check scripts/positron-333-audit.cjs'));
 assert.ok(wf.includes('audit-p51333-ai-actions.json'));
 assert.match(wf,/release:\s*\n\s*if: false/);
 assert.ok(read('POSITRON_P5_CHANGELOG.md').includes('## P5.1.333 / Electron 4.23.418'));
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=418,'P333 repair must persist across later patch versions');
});
