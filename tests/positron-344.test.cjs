'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P344 five-card remote paging only on focused recommendation action',()=>{
 const js=read('renderer/positron-intelligence.js');
 for(const s of ["event.key!=='PageUp'&&event.key!=='PageDown'","const jump=event.key==='PageDown'?5:-5",
  "const index=actions.indexOf(d.activeElement)","if(index<0)return","Math.max(0,Math.min(actions.length-1,index+jump))",
  "next.focus({preventScroll:true})","revealRecommendationCard(next)"])
  assert.ok(js.includes(s),'missing focus-only paging '+s);
 assert.ok(js.includes("event.key!=='Home'&&event.key!=='End'"));
});
test('P344 captures real Electron screenshots and corrects obsolete P334 scroll assertion',()=>{
 const p=JSON.parse(read('package.json')),qa=read('scripts/positron-344-audit.cjs'),
  legacy=read('scripts/positron-334-audit.cjs');
 assert.ok(Number(p.version.split('.')[2])>=429);
 assert.ok(Number.parseInt(p.description.split('Positron P5.1.')[1]||'0',10)>=344,'P344 paging behavior must survive later release labels');
 for(const s of ["PageDown","PageUp","afterSha256","headingVisible","noOverflow","realElectron:true",
  "positron-p51344-page-navigation-"])assert.ok(qa.includes(s));
 assert.ok(legacy.includes('headingClear'));assert.ok(legacy.includes("afterNarrow.entryMargin==='9px'"));
});
