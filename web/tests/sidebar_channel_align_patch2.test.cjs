'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const page=read('renderer/index.html');
const css=read('renderer/sidebar-channel-align-v42334.css');
const logic=read('renderer/sidebar-channel-align-v42334.js');

test('sidebar alignment patch loads after old conflicting layout rules',()=>{
 const refs=['sidebar-link-picker-v42329.css','channel-panel-compact-v42333.css','sidebar-channel-align-v42334.css'];
 assert.ok(refs.every(x=>page.includes(x)));
 assert.ok(page.indexOf(refs[0])<page.indexOf(refs[1]) && page.indexOf(refs[1])<page.indexOf(refs[2]));
 assert.match(page,/sidebar-channel-align-v42334\.js/);
});
test('channel list reopen button matches the hamburger control size and visual language',()=>{
 assert.match(css,/--channel-button-size:45px/);
 assert.match(css,/#channelPanelShowBtn\s*\{[\s\S]*?height:var\(--channel-button-size\)!important/);
 assert.match(css,/#appSidebar > #sidebarToggleBtn\s*\{[\s\S]*?height:var\(--channel-button-size\)!important/);
 assert.match(logic,/sidebarToggle\.getBoundingClientRect\(\)/);
 assert.match(logic,/listLayout\.style\.setProperty\('--channel-tab-y'/);
 assert.match(logic,/listLayout\.style\.setProperty\('--channel-button-size'/);
});
test('navigation rail uses uniform centered icons and compact row spacing',()=>{
 assert.match(css,/width:50px!important/);
 assert.match(css,/height:48px!important/);
 assert.match(css,/margin:0 auto 5px!important/);
 assert.match(css,/align-items:center!important/);
 assert.match(css,/\.apple-ui-symbol\s*\{[\s\S]*?width:24px!important/);
});
test('collapsed channel panel keeps a separate non-overlapping tab lane',()=>{
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/padding-left:52px!important/);
 assert.match(css,/#page-tv \.player-box\s*\{width:100%!important/);
 assert.match(css,/#page-tv \.channel-panel\s*\{display:none!important/);
});
