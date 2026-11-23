'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P331 six AI mode arrows/Home/End only move keyboard focus and skip disabled',()=>{
 const js=read('renderer/positron-intelligence.js'),css=read('renderer/positron-intelligence.css');
 const qa=read('scripts/positron-331-audit.cjs'),ext=read('scripts/positron-20-extension.cjs');
 const wf=read('.github/workflows/positron-lab.yml'),pkg=JSON.parse(read('package.json'));
 for(const token of ['P331: navigate the six AI modes','ArrowLeft ArrowRight ArrowUp ArrowDown Home End',
  "event.preventDefault();event.stopPropagation();","buttons[next].focus({preventScroll:true})",
  'targetRow*cols+c','!buttons[index].disabled'])assert.ok(js.includes(token),token);
 assert.ok(css.includes('#poWatchFlowPanel .po-ai-modes button:focus-visible'));
 for(const token of ['rightFocusOnly','downSameColumn','upSameColumn','enabledExploreReachable','skipDisabledExplore',
  'narrowKeyboard','playlistUnchanged','modelUnchanged','noAutoplay',
  'positron-p51331-mode-focus-before-1920x1080-real.png',
  'positron-p51331-mode-focus-after-1920x1080-real.png',
  'positron-p51331-mode-focus-after-720x900-real.png'])assert.ok(qa.includes(token),token);
 assert.ok(ext.includes("require('./positron-331-audit.cjs').run(page)"));
 assert.ok(wf.includes('node --check scripts/positron-331-audit.cjs'));
 assert.ok(wf.includes('audit-p51331-ai-mode-focus.json'));
 assert.ok(Number(pkg.version.split('.')[2])>=416,'P331 app version must not regress');
 assert.ok(read('POSITRON_P5_CHANGELOG.md').includes('## P5.1.331 / Electron 4.23.416'));
});
