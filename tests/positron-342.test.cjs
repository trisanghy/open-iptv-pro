'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P342 scroll target uses visible card bounds below sticky title and identity strip',()=>{
 const js=read('renderer/positron-intelligence.js');
 assert.ok(js.includes('const revealRecommendationCard=target=>{'));
 assert.ok(js.includes('visibleTop=Math.max(panelRect.top,headRect?.bottom||0,infoRect?.bottom||0)+9'));
 assert.ok(js.includes('if(cardRect.top<visibleTop)panel.scrollTop=Math.max(0,panel.scrollTop-(visibleTop-cardRect.top))'));
 assert.ok(js.includes('updateFocusProgress(play||null);\n  // Do not scroll the panel when focusing explanation summary or feedback.\n  if(event.target===play)revealRecommendationCard(play);'),'Tab and remote focus');
 assert.equal(js.split('updateFocusProgress(target);\n  revealRecommendationCard(target);').length-1,3,'J/K/P');
 assert.ok(js.includes('updateFocusProgress(next);\n  revealRecommendationCard(next);'),'remote arrows');
 assert.ok(js.includes('revealRecommendationCard(d.activeElement);'),'full identity toggle');
});
test('P342 real Electron before-after audit covers 720px and desktop, without data change',()=>{
 const qa=read('scripts/positron-342-audit.cjs'),p=JSON.parse(read('package.json'));
 assert.ok(Number(p.version.split('.')[2])>=427,'P342 behavior retained in current or later SemVer');assert.ok(qa.includes("version:'P5.1.342'"),'QA must label actual current release');assert.match(p.description,/Positron P5\.1\.\d+/);assert.ok(Number(p.description.match(/P5\.1\.(\d+)/)?.[1])>=342);
 for(const x of ['before.headingClear,false','fixed.headingClear,true','second.headingClear,true',
 'back.headingClear,true','wrapped.headingClear,true','720,height:900','1920,height:1080',
 'positron-p51342-sticky-recommendation-','assert.deepEqual(restored,original,','noOverflow'])
 assert.ok(qa.includes(x),'missing '+x);
});
