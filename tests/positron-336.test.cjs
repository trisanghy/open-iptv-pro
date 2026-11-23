'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
test('P336 AI announces selected recommendation count and centers focus for readability',()=>{
 const js=read('renderer/positron-intelligence.js'),
 css=read('renderer/positron-intelligence.css'),
 audit=read('scripts/positron-336-audit.cjs'),
 ext=read('scripts/positron-20-extension.cjs'),
 wf=read('.github/workflows/positron-lab.yml');
 assert.ok(js.includes("focusProgress.id='poAIFocusProgress'"));
 assert.ok(js.includes("focusProgress.setAttribute('aria-live','polite')"));
 assert.ok(js.includes("focusProgress.textContent='Gợi ý '+(index+1)+'/'+cards.length"));
 assert.ok(js.includes("target.scrollIntoView({block:'center',behavior:'instant'})"));
 assert.ok(js.includes('updateFocusProgress(target)'));
 assert.ok(js.includes("focusProgress.hidden=true;focusProgress.textContent=''"));
 assert.ok(css.includes('.po-ai-focus-progress'));
 for(const key of ['newBadgeVisible','screenReaderAnnounce','secondAnnounced',
 'wrappedAnnounced','nextActionComfortable','noAutoplay','playlistUnchanged','modelUnchanged',
 'positron-p51336-focus-position-before-1920x1080-real.png',
 'positron-p51336-focus-position-after-1920x1080-real.png',
 'positron-p51336-focus-position-before-720x900-real.png',
 'positron-p51336-focus-position-after-720x900-real.png'])assert.ok(audit.includes(key),key);
 assert.ok(ext.includes("require('./positron-336-audit.cjs').run(page)"));
 assert.ok(wf.includes('node --check scripts/positron-336-audit.cjs'));
 assert.ok(wf.includes('audit-p51336-focus-position.json'));
 assert.match(wf,/release:\s*\n\s*if: false/);
 assert.ok(Number(JSON.parse(read('package.json')).version.split('.')[2])>=421);
 assert.ok(read('POSITRON_P5_CHANGELOG.md').includes('## P5.1.336 / Electron 4.23.421'));
});
