'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('Positron has a separate prerelease application identity',()=>{
  const p=JSON.parse(read('package.json'));
  assert.equal(p.version,'4.23.88');
  assert.equal(p.build.appId,'org.openiptvpro.positron');
  assert.equal(p.build.productName,'Open IPTV Pro Positron');
  assert.equal(p.build.publish[0].channel,'positron');
});
test('Positron is loaded last, preserving original Electron modules',()=>{
  const html=read('renderer/index.html');
  assert.match(html,/href="positron.css"/);
  assert.match(html,/src="positron.js"/);
  assert.match(html,/src="positron-studio.js"/);
  assert.match(html,/href="positron-studio.css"/);
  assert.ok(html.indexOf('src="positron.js"')>html.indexOf('src="video-gpu-manager-v1.js"'));
  assert.ok(html.indexOf('href="positron.css"')>html.indexOf('href="sidebar-gap-repair-v42375.css"'));
});
test('Positron command layer parses and uses authoritative IPTV state',()=>{
  const js=read('renderer/positron.js');
  assert.doesNotThrow(()=>new vm.Script(js,{filename:'renderer/positron.js'}));
  for(const api of ['IPTVState?.setPage?.','IPTVState?.playChannel?.','IPTVState?.getChannels?.']) assert.ok(js.includes(api),api);
  assert.ok(js.includes('title.textContent=item.name'),'channel labels must be inserted as safe text');
  assert.ok(js.includes('event.key===\'Escape\''),'ESC must dismiss modal');
  assert.ok(js.includes('focusBefore'),'focus must restore previous layout');
});
test('Positron styling and capture runner are isolated',()=>{
  const css=read('renderer/positron.css');
  assert.match(css,/html\[data-positron="true"\]/);
  assert.match(css,/#positronPalette\[hidden\]/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.doesNotThrow(()=>new vm.Script(read('scripts/positron-capture.cjs'),{filename:'scripts/positron-capture.cjs'}));
});
