'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('P352 explains disabled AI Explore without enabling learning',()=>{
 const js=read('renderer/positron-intelligence.js'),css=read('renderer/positron-intelligence.css');
 assert.ok(js.includes("exploreMode.disabled=!enabled"));
 assert.ok(js.includes("exploreMode.setAttribute('aria-label','Khám phá AI — cần bật học sở thích')"));
 assert.ok(js.includes("if(!enabled)return;upcomingOpen=false"));
 assert.match(css,/#poAIExplore:disabled::after\{content:'Cần bật học'/);
 assert.ok(read('scripts/positron-50-audit.cjs').includes("require('./positron-352-audit.cjs').run(page)"));
});
test('P352 installer metadata stays synchronized',()=>{
 const pkg=JSON.parse(read('package.json'));if(pkg.description.includes('P5.1.352')){assert.equal(pkg.version,'4.23.437');assert.ok(read('renderer/positron.js').includes("descriptor.textContent='P5.1.352'"));}else assert.ok(Number(pkg.version.split('.').at(-1))>437);
});
