'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
test('P353 actual consent helper synchronizes enabled, accessible name and tooltip',()=>{
 const js=read('renderer/positron-intelligence.js'),m=js.match(/const syncExploreConsent=\(\)=>\{([\s\S]*?)\n \};/);
 assert.ok(m);
 const attrs={},button={setAttribute:(k,v)=>attrs[k]=v},ctx={enabled:false,exploreMode:button};vm.createContext(ctx);
 vm.runInContext('const syncExploreConsent=()=>{'+m[1]+'};syncExploreConsent()',ctx);
 assert.equal(button.disabled,true);assert.match(attrs['aria-label'],/cần bật học/);assert.match(button.title,/chỉ khả dụng/);
 vm.runInContext('enabled=true;syncExploreConsent()',ctx);
 assert.equal(button.disabled,false);assert.match(attrs['aria-label'],/đã bật học/);assert.match(button.title,/đã bật học/);
 vm.runInContext('enabled=false;syncExploreConsent()',ctx);assert.equal(button.disabled,true);assert.match(attrs['aria-label'],/cần bật học/);
 assert.ok(js.includes("exploreMode.setAttribute('aria-pressed',String(exploreOpen));syncExploreConsent();"));
 assert.match(read('renderer/positron-intelligence.css'),/#poAIExplore:not\(:disabled\)::after\{content:'Đã bật học'/);
});
test('P353 native audit uses real checkbox and restores storage',()=>{
 const qa=read('scripts/positron-353-audit.cjs');
 for(const t of ['await consent.check()','await consent.uncheck()','check(afterState,true)','check(disabled,false)','assert.deepEqual(await state(page),initial','beforeSha256','afterSha256'])assert.ok(qa.includes(t),t);
 const pkg=JSON.parse(read('package.json'));
 if(pkg.description.includes('P5.1.353')){assert.equal(pkg.version,'4.23.438');assert.ok(read('renderer/positron.js').includes("descriptor.textContent='P5.1.353'"));}
 assert.ok(read('scripts/positron-50-audit.cjs').includes("require('./positron-353-audit.cjs').run(page)"));
});
