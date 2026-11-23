'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P334 actual AI keyboard shortcut focuses first Play without autoplay and clears sticky header',()=>{
 const s=read('renderer/positron-intelligence.js'),
  css=read('renderer/positron-intelligence.css'),
  qa=read('scripts/positron-334-audit.cjs'),
  ext=read('scripts/positron-20-extension.cjs'),
  wf=read('.github/workflows/positron-lab.yml');
 assert.ok(s.includes("area.setAttribute('aria-keyshortcuts','Alt+Shift+J')"));
 assert.ok(s.includes("target.focus({preventScroll:true})"));
 assert.ok(s.includes("target.scrollIntoView({block:'nearest',behavior:'instant'})"));
 assert.ok(s.includes("Alt+Shift+J: tới nút Xem đầu"));
 assert.ok(css.includes('#poWatchFlowPanel[data-po-ai-active="true"] .po-ai-entry'));
 assert.ok(css.includes('margin:9px 0 11px!important'));
 for(const key of ['newShortcutFocusOnly','noAutoplay','noPlaylistMutation',
 'noModelMutation','safeStickySpacing','spacingImproved','actionStillVisible',
 'positron-p51334-ai-jump-before-1920x1080-real.png',
 'positron-p51334-ai-jump-after-1920x1080-real.png',
 'positron-p51334-ai-jump-before-720x900-real.png',
 'positron-p51334-ai-jump-after-720x900-real.png'])assert.ok(qa.includes(key),key);
 assert.ok(ext.includes("require('./positron-334-audit.cjs').run(page)"));
 assert.ok(wf.includes('node --check scripts/positron-334-audit.cjs'));
 assert.ok(wf.includes('audit-p51334-ai-jump.json'));
 assert.match(wf,/release:\s*\n\s*if: false/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.419');
 assert.ok(read('POSITRON_P5_CHANGELOG.md').startsWith('## P5.1.334 / Electron 4.23.419'));
});
