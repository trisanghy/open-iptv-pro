'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P351 fixes QA fixture collision without deleting native IPTV sources',()=>{
 const qa=read('scripts/positron-350-audit.cjs');
 for(const s of ['window.__p350Native=native','getChannels:()=>[]','nativeBefore',
   'window.IPTVState=window.__p350Native','nativeAfter','isolatedFixture:true'])
   assert.ok(qa.includes(s),'P350 must isolate fixture and restore app state: '+s);
 assert.ok(!qa.includes('native QA profile has no user-supplied playlist'),
  'P350 must not depend on global QA channel count');
});
test('P351 real Electron audit checks playlist and empty-source states and restoration',()=>{
 const qa=read('scripts/positron-351-audit.cjs');
 for(const s of ['getChannels:()=>fixture','getChannels:()=>[]','!before.ctaVisible',
 'after.ctaVisible','routed.sourceUrlFocused','nativeRestored:true','noStreamPlayback:true',
 'window.IPTVState=window.__p351Native','beforeSha256','afterSha256','realElectron:true'])
   assert.ok(qa.includes(s),'P351 screenshot/behavior/state regression: '+s);
 assert.ok(read('scripts/positron-50-audit.cjs').includes("require('./positron-351-audit.cjs').run(page)"));
 const pkg=JSON.parse(read('package.json'));
 if(pkg.description.includes('P5.1.352'))assert.equal(pkg.version,'4.23.437');
 else assert.ok(Number(pkg.version.split('.').at(-1))>437);
});
