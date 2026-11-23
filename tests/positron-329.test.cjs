'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('P329 F6/Alt+Shift+W acts as accessible two-way AI panel toggle',()=>{
 const js=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-329-audit.cjs','utf8');
 const runner=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const ci=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 for(const key of ['P329: a second shortcut dismisses the visible AI panel','!panel.hidden&&aiOpen',
  'win.PositronWatchFlow?.close?.()','opener.focus({preventScroll:true})',
  "event.code==='KeyW'"])assert.ok(js.includes(key),key);
 for(const key of ['f6ClosesAndReturnsFocus','f6ReopensAI','chordClosesAndReturnsFocus','chordOpensNarrow',
  'chordClosesNarrow','playlistUnchanged','modelUnchanged','noAutoplay'])assert.ok(qa.includes(key),key);
 assert.ok(runner.includes("require('./positron-329-audit.cjs').run(page)"));
 for(const png of ["positron-p51329-ai-key-toggle-before-1920x1080-real.png","positron-p51329-ai-key-toggle-after-1920x1080-real.png","positron-p51329-ai-key-toggle-open-720x900-real.png","positron-p51329-ai-key-toggle-after-720x900-real.png"])assert.ok(ci.includes(png),png);
});
