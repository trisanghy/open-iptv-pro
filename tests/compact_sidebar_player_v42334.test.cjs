
'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const css=read('renderer/channel-panel-compact-v42333.css');
const side=read('renderer/sidebar-link-picker-v42329.css');
const html=read('renderer/index.html');
test('v4.23.34 player takes single content column and close to full available width',()=>{
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/padding-left:6px!important/);
 assert.match(css,/#page-tv \.player-box\{[\s\S]*?width:100%!important/);
 assert.match(css,/#page-tv \.player-box video\{width:100%!important;height:100%!important/);
 assert.doesNotMatch(html,/href="channel-panel-toggle-v42331\.css"/);
});
test('v4.23.34 collapsed sidebar buttons and icons are centered and enlarged',()=>{
 assert.match(side,/width:78px!important;min-width:78px!important;max-width:78px!important/);
 assert.match(side,/width:50px!important;min-width:50px!important/);
 assert.match(side,/width:36px!important;height:36px!important;flex:0 0 36px!important/);
 assert.match(side,/#appSidebar\{align-items:center!important/);
 assert.match(side,/#appSidebar \.nav\{margin-left:auto!important;margin-right:auto!important/);
});
