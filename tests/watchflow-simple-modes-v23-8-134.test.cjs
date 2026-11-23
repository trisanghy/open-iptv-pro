'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Standard Smart Intelligence controls are relocated to visible main panel, not duplicated',()=>{
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 assert.match(ui,/const mainModes=panel\.querySelector\('\.wf-modes'\)/);
 assert.match(ui,/top\?\.insertAdjacentElement\('afterend',mainModes\)/);
 assert.match(ui,/mainModes\.insertAdjacentElement\('afterend',mainHint\)/);
 assert.equal((ui.match(/data-wf-mode="smart"/g)||[]).length,1);
 assert.equal((ui.match(/data-wf-mode="intelligence"/g)||[]).length,1);
});
test('One-click assistant still auto prepares Smart and Intelligence',()=>{
 const easy=fs.readFileSync('renderer/watchflow-easy-setup-v23-8-132.js','utf8');
 assert.match(easy,/void api\.startSmart\(\)/);assert.match(easy,/void api\.startIntelligence\(\)/);
 const css=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.css','utf8');
 assert.match(css,/\.watchflow-demo > \.wf-modes/);
});
test('This experiment cannot become Stable or Latest',()=>{
 const y=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8');
 assert.match(y,/prerelease: true/);assert.match(y,/make_latest: false/);
});
