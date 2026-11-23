'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P343 remote Home End jumps to first/last AI recommendation only when Xem is focused',()=>{
 const js=read('renderer/positron-intelligence.js');
 for(const token of ["list.getAttribute('aria-keyshortcuts')+' Home End'",
  "if(event.key!=='Home'&&event.key!=='End')return",
  "event.target!==current||current.disabled",
  "const next=event.key==='Home'?actions[0]:actions[actions.length-1]",
  "next.focus({preventScroll:true})",
  "updateFocusProgress(next);\n  revealRecommendationCard(next);"])
 assert.ok(js.includes(token),'missing P343 token '+token);
 assert.ok(js.includes("if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return"),'existing remote arrow keys retained');
 assert.ok(js.includes('if(event.target===play)revealRecommendationCard(play);'),'explanation/feedback focus must not cause scrolling');
});
test('P343 real Electron before/after supports keyboard Home End with safe source preservation',()=>{
 const qa=read('scripts/positron-343-audit.cjs'),pkg=JSON.parse(read('package.json'));
 assert.ok(Number(pkg.version.split('.')[2])>=428,'P343 Home/End feature persists');assert.match(pkg.description,/Positron P5\.1\.\d+/);assert.ok(Number(pkg.description.match(/P5\.1\.(\d+)/)?.[1])>=343);
 for(const x of ["version:'P5.1.343'","await page.keyboard.press('End')","await page.keyboard.press('Home')",
  "remote End selects last recommendation","remote Home returns directly to first suggestion",
  "positron-p51343-home-end-ai-","width:720,height:900","width:1920,height:1080",
  "assert.deepEqual(restored,original,","noOverflow","autoplay:false","editorAfterHome","editorAfterEnd","explanationFocus.stableScroll"])
 assert.ok(qa.includes(x),'P343 QA missing '+x);
});
