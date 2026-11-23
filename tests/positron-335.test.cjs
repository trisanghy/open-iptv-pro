'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P335 new AI Alt+Shift+K moves focus to next playable recommendation only',()=>{
 const ui=read('renderer/positron-intelligence.js'),
  qa=read('scripts/positron-335-audit.cjs'),
  ext=read('scripts/positron-20-extension.cjs'),
  wf=read('.github/workflows/positron-lab.yml');
 assert.ok(ui.includes("list.setAttribute('aria-keyshortcuts','Alt+Shift+K')"));
 assert.ok(ui.includes("event.code==='KeyK'"));
 assert.ok(ui.includes(".po-ai-card .po-ai-actions button:first-child"));
 assert.ok(ui.includes("const target=actions[(current+1)%actions.length]"));
 assert.ok(ui.includes("target.focus({preventScroll:true})"));
 assert.ok(ui.includes("target.scrollIntoView({block:'nearest',behavior:'instant'})"));
 assert.ok(ui.includes("event.target,d.activeElement"));
 assert.ok(ui.includes("modeHelp.title='Alt+Shift+J: đến nút Xem đầu · Alt+Shift+K: chuyển gợi ý kế tiếp'"));
 for(const p of ['twoOrMoreRecommendations','newKFocusesSecond','wrapsToFirst',
  'noAutoplay','playlistUnchanged','modelUnchanged','secondWithinViewport',
  'positron-p51335-next-ai-before-1920x1080-real.png',
  'positron-p51335-next-ai-after-1920x1080-real.png',
  'positron-p51335-next-ai-before-720x900-real.png',
  'positron-p51335-next-ai-after-720x900-real.png'])assert.ok(qa.includes(p),p);
 assert.ok(ext.includes("require('./positron-335-audit.cjs').run(page)"));
 assert.ok(wf.includes('node --check scripts/positron-335-audit.cjs'));
 assert.ok(wf.includes('audit-p51335-next-ai.json'));
 assert.match(wf,/release:\s*\n\s*if: false/);
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=420);
 assert.ok(read('POSITRON_P5_CHANGELOG.md').includes('## P5.1.335 / Electron 4.23.420'));
});
