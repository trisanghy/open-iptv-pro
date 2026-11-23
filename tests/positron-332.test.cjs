'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P332 AI panel expands for no-source onboarding, 44px mode targets and keyboard instructions',()=>{
 const js=read('renderer/positron-intelligence.js'),css=read('renderer/positron-intelligence.css');
 const qa=read('scripts/positron-332-audit.cjs'),ext=read('scripts/positron-20-extension.cjs');
 const wf=read('.github/workflows/positron-lab.yml');
 for(const token of ['poAIKeyboardHelp','← → ↑ ↓: chuyển chế độ · Enter/Space: chọn',
  'modeBar.setAttribute(\'aria-describedby\',modeHelp.id)','area.append(title,controls,alertRow,modeBar,modeHelp,summary'])
  assert.ok(js.includes(token),token);
 for(const token of ['P5.1.332','@media(min-width:1000px)','po-watchflow-panel[data-po-ai-active="true"]',
  'width:min(528px','min-height:44px!important','.po-ai-keyboard-help'])assert.ok(css.includes(token),token);
 for(const token of ['desktopReadingWidth','allSixModes','targets44px','helpVisibleAndLinked',
  'narrowWidth','narrowTargets44px','noHorizontalOverflow','playlistUnchanged','modelUnchanged','noAutoplay',
  'positron-p51332-ai-onboard-before-1920x1080-real.png','positron-p51332-ai-onboard-after-1920x1080-real.png',
  'positron-p51332-ai-onboard-after-720x900-real.png'])assert.ok(qa.includes(token),token);
 assert.ok(ext.includes("require('./positron-332-audit.cjs').run(page)"));
 assert.ok(wf.includes('node --check scripts/positron-332-audit.cjs'));
 assert.ok(wf.includes('audit-p51332-ai-onboard.json'));
 assert.ok(read('POSITRON_P5_CHANGELOG.md').includes('## P5.1.332 / Electron 4.23.417'));
 const p=JSON.parse(read('package.json'));assert.ok(Number(p.version.split('.')[2])>=417);
});
