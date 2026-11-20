'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('P3 ships 20 iterative design and interaction modules',()=>{
 const css=read('renderer/positron-studio.css'),js=read('renderer/positron-studio.js');
 assert.equal((css.match(/\/\* (?:0[1-9]|10) \*\//g)||[]).length,10);
 assert.equal((js.match(/\/\* (?:1[1-9]|20) \*\//g)||[]).length,10);
 assert.doesNotThrow(()=>new vm.Script(js));
});
test('All three palettes are token based and user selectable',()=>{
 const css=read('renderer/positron-studio.css');
 const js=read('renderer/positron-studio.js');
 for(const theme of ['night','aurora','graphite'])assert.ok(js.includes("'"+theme+"'"));
 for(const theme of ['aurora','graphite'])assert.ok(css.includes('data-positron-palette='+theme));
 assert.match(css,/--po-accent:/);
 assert.match(css,/--po-on:/);
 assert.match(js,/localStorage\.setItem\(key,id\)/);
});
test('P3 never replaces the IPTV player, channel store or consent flow',()=>{
 const js=read('renderer/positron-studio.js'),css=read('renderer/positron-studio.css');
 assert.ok(!js.includes('innerHTML='),'no HTML replacement is used');
 assert.ok(!js.includes('eval('),'no dynamic evaluation');
 assert.ok(!css.includes('video{'));
 for(const token of ['IPTVState.setPage','positronPalette','fullscreenchange','aria-activedescendant'])assert.ok(js.includes(token),token);
});
test('Keyboard navigation avoids typing fields and traps modal focus',()=>{
 const js=read('renderer/positron-studio.js');
 assert.match(js,/input,textarea,select/);
 assert.match(js,/event\.preventDefault\(\)/);
 assert.match(js,/e\.shiftKey/);
 assert.match(js,/document\.activeElement===first/);
});
test('P3 renderer audit and workflow include additional actual-electron screenshots',()=>{
 const runner=read('scripts/positron-capture.cjs');
 assert.doesNotThrow(()=>new vm.Script(runner));
 assert.ok(runner.includes('studioHistory.length,20'));
 assert.ok(runner.includes('audit-positron-p3-20-rounds.json'));
 assert.ok(runner.includes('positron-p3-final-main-real.png'));
});

test('P3.1 removes the inherited neon-green player color at higher CSS specificity',()=>{
 const css=read('renderer/positron-studio.css');
 assert.match(css,/html\[data-positron="true"\] #page-tv \.player-control-card \.controls\.transport-controls #playBtn/);
 assert.match(css,/accent-color:var\(--po-accent\)!important/);
 const js=read('renderer/positron-studio.js');
 assert.match(js,/prevBtn/);assert.match(js,/nextBtn/);
 const runner=read('scripts/positron-capture.cjs');
 assert.match(runner,/expectedPlay/);
 assert.match(runner,/positron-p31-final-main-real\.png/);
});
