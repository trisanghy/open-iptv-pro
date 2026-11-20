'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('P5 has twenty scoped improvements with independent stage gates',()=>{
 const css=read('renderer/positron-twenty.css');
 for(let i=1;i<=20;i++){const n=String(i).padStart(2,'0');
  assert.ok(css.includes('Upgrade '+n+':'),'missing improvement '+n);
  assert.ok(css.includes('.p20-'+n),'missing style gate '+n);
 }
 assert.equal((css.match(/\/\* Upgrade \d\d:/g)||[]).length,20);
 assert.ok(css.includes('page-sources')&&css.includes('page-doctor')&&css.includes('page-epg'));
});
test('P5 companion is syntax safe and does not touch native streaming or persistence',()=>{
 const js=read('renderer/positron-twenty.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const unsafe of ['innerHTML=','removeChild(','IPTVState.playChannel(','localStorage.clear(','deleteChannel('])
  assert.ok(!js.includes(unsafe),unsafe);
 assert.ok(js.includes('OpenIPTVPositronTwenty'));
 assert.ok(js.includes("event.key==='/'"));
});
test('P5 assets are loaded after P4 without replacing it',()=>{
 const html=read('renderer/index.html');
 assert.ok(html.includes('href="positron-twenty.css"'));
 assert.ok(html.includes('src="positron-twenty.js"'));
 assert.ok(html.indexOf('positron-twenty.css')>html.indexOf('positron-fifty.css'));
 assert.ok(html.indexOf('positron-twenty.js')>html.indexOf('positron-fifty.js'));
 const script=read('scripts/positron-20-extension.cjs');
 assert.doesNotThrow(()=>new vm.Script(script));
 assert.ok(script.includes('page.screenshot'));
 assert.ok(script.includes('sha256'));
 assert.ok(script.includes('20')&&script.includes('realElectron:true'));
});
test('P5 release is immutable and versioned separately from P4.1',()=>{
 const pkg=JSON.parse(read('package.json'));
 const flow=read('.github/workflows/positron-lab.yml');
 assert.equal(pkg.version,'4.23.83');
 assert.ok(flow.includes('positron/v4.23.83-p5'));
 assert.ok(read('scripts/positron-50-audit.cjs').includes('runTwenty(page)'));
 assert.ok(flow.includes('Positron-P5-20-Real-Screenshots.zip'));
});
