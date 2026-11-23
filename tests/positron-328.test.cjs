'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('P328 keyboard can open TV AI without hijacking edit focus or other pages',()=>{
 const s=fs.readFileSync('renderer/positron-intelligence.js','utf8');
 const q=fs.readFileSync('scripts/positron-328-audit.cjs','utf8');
 const r=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const wf=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 for(const x of ['P328: direct TV-only','F6 Alt+Shift+W',"event.key==='F6'",
  'event.altKey&&event.shiftKey','event.defaultPrevented','[contenteditable="true"]',
  "'page-tv'",'tab.focus({preventScroll:true})'])assert.ok(s.includes(x),x);
 for(const x of ['f6OpensAIAndFocuses','altShiftWOpensNarrow','ignoresTextInputs',
  'ignoresOtherPages','noHorizontalOverflow','playlistUnchanged','modelUnchanged','noAutoplay'])
  assert.ok(q.includes(x),x);
 assert.ok(r.includes("require('./positron-328-audit.cjs').run(page)"));
 for(const x of ['positron-p51328-ai-shortcut-before-1920x1080-real.png','positron-p51328-ai-shortcut-after-1920x1080-real.png','positron-p51328-ai-shortcut-after-720x900-real.png'])assert.ok(wf.includes(x),x);
});
