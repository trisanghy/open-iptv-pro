'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('P4 has 50 sequentially gated screenshot-driven CSS revisions',()=>{
 const css=read('renderer/positron-fifty.css');
 for(let n=1;n<=50;n++){
   const s=String(n).padStart(2,'0');
   assert.ok(css.includes('Iteration '+n+':')||css.includes('Iteration '+s+':'),'missing iteration '+n);
   assert.ok(css.includes('.p50-'+s),'missing stage gate '+s);
 }
 assert.equal((css.match(/\/\* Iteration \d+: /g)||[]).length,50);
});
test('P4 does not replace video elements or modify IPTV state persistence',()=>{
 const js=read('renderer/positron-fifty.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 assert.ok(!js.includes('innerHTML='),'avoid replacing any original app markup');
 assert.ok(!js.includes('removeChild('),'do not remove native player controls');
 assert.ok(!js.includes('IPTVState.playChannel('),'delegate playback to existing app');
 assert.ok(js.includes('openTools')&&js.includes('showMore'),'all collapsed panels reopen');
});
test('P4 source, script and screenshot chain are loaded only in Positron',()=>{
 const html=read('renderer/index.html');
 assert.ok(html.includes('href="positron-fifty.css"'));
 assert.ok(html.includes('src="positron-fifty.js"'));
 assert.ok(html.indexOf('positron-fifty.js')>html.indexOf('positron-studio.js'));
 const runner=read('scripts/positron-50-audit.cjs');
 assert.doesNotThrow(()=>new vm.Script(runner));
 for(const fragment of ['setStage(args.round,args.prev)','feedbackUsedFrom','png.toString(\'base64\')','50;n++','realElectron:true'])
   assert.ok(runner.includes(fragment),fragment);
});
test('P4 safeguards dark theme transport and visual feedback',()=>{
 const css=read('renderer/positron-fifty.css');
 assert.match(css,/var\(--po-accent\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/p50-advanced-closed/);
 assert.match(css,/p50-tools-closed/);
 const js=read('renderer/positron-fifty.js');
 assert.match(js,/p50-empty/);
 assert.match(js,/localStorage/);
});
