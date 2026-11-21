'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('P5.1.55 workspace loads after all previous style and behavior layers',()=>{
 const html=read('renderer/index.html');
 assert.ok(html.indexOf('positron-workspace-v3.css')>html.indexOf('positron-media-v2.css'));
 assert.ok(html.indexOf('positron-workspace-v3.js')>html.indexOf('positron-media-v2.js'));
 assert.equal(JSON.parse(read('package.json')).version,'4.23.150');
});
test('navigation rail is reversible without deleting native navigation routes',()=>{
 const js=read('renderer/positron-workspace-v3.js');
 const css=read('renderer/positron-workspace-v3.css');
 assert.ok(js.includes("toggle.setAttribute('aria-expanded'"));
 assert.ok(js.includes("root.dataset.poRailExpanded=expanded?'true':'false'"));
 assert.ok(js.includes("toggle.addEventListener('click'"));
 assert.ok(js.includes("const nav=sidebar.querySelectorAll('.nav')"));
 assert.ok(css.includes('[data-po-rail-expanded="true"]'));
 for(const page of ['tv','fav','epg','sources','settings','multiview','doctor'])
  assert.ok(read('renderer/index.html').includes('data-page="'+page+'"'),'keep original page: '+page);
});
test('secondary controls move, but all underlying click handlers and media are untouched',()=>{
 const js=read('renderer/positron-workspace-v3.js');
 assert.ok(js.includes('output.append(advanced)'));
 assert.ok(js.includes('filterBox.append(filters)'));
 const legacy=read('renderer/positron-fifty.js');
 assert.ok(legacy.includes("more.addEventListener('click'"));
 assert.ok(legacy.includes("filters.addEventListener('click'"));
 assert.ok(legacy.includes("tools.addEventListener('click'"));
 const native=read('renderer/app.js');
 assert.ok(native.includes("bind(['playBtn'],playToggle)"));
 assert.ok(!js.includes('playChannel('));
 assert.ok(!js.includes('importSource('));
});
test('rail keeps all non-primary tools discoverable with SVG, tooltip and aria-label',()=>{
 const js=read('renderer/positron-workspace-v3.js');
 for(const page of ['multiview','shots','folders','health','doctor','profiles','export']){
  assert.ok(js.includes(page+':'),page+' outline icon missing');
 }
 assert.ok(js.includes("btn.setAttribute('aria-label',label)"));
 assert.ok(js.includes("btn.dataset.poTitle=label"));
});
test('legacy P4 style cannot reintroduce 52px circle or full-width advanced strip',()=>{
 const css=read('renderer/positron-workspace-v3.css');
 assert.ok(css.includes('.po-v3.p50-29 #page-tv .player-control-card .controls.transport-controls #playBtn'));
 assert.ok(css.includes('.po-v3.p50-36 #page-tv #positronToolsToggle'));
 assert.ok(css.includes('max-width:43px!important'));
 assert.ok(css.includes('.po-v3.p50-advanced-closed #appSidebar'));
});
