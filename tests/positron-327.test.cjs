'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('P327 WatchFlow AI reopens with keyboard focus inside the visible dialog',()=>{
 const js=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const qa=fs.readFileSync('scripts/positron-327-audit.cjs','utf8');
 const run=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const wf=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 for(const x of ['P327: restore keyboard focus','!panel.contains(active)','!active.getClientRects().length','tab.focus({preventScroll:true})'])assert.ok(js.includes(x),x);
 for(const x of ['staleFocusBehindPanel','desktopFocusInside','narrowFocusInside','playlistSafe','modelSafe','noAutoplay'])assert.ok(qa.includes(x),x);
 assert.ok(run.includes("require('./positron-327-audit.cjs').run(page)"));
 for(const x of ['positron-p51327-ai-focus-before-1920x1080-real.png','positron-p51327-ai-focus-after-1920x1080-real.png','positron-p51327-ai-focus-after-720x900-real.png'])assert.ok(wf.includes(x),x);
});
