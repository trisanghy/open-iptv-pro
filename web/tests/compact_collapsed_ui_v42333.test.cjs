"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('renderer/index.html'),compact=read('renderer/channel-panel-compact-v42333.css');
test('v4.23.33 loads compact override after every older theme layer',()=>{
 const a=html.indexOf('video-layout-fix-v42330.css');
 const b=html.indexOf('channel-panel-compact-v42333.css');
 const c=html.indexOf('channel-panel-compact-v42333.css');
 assert.ok(a>0&&b>a&&c===b);
 assert.doesNotMatch(html,/href="channel-panel-toggle-v42331\.css"/);
});
test('v4.23.33 collapsed list has a slim non-overlapping tab and reclaims width',()=>{
 assert.match(compact,/width:14px/);assert.match(compact,/padding-left:6px!important/);
 assert.doesNotMatch(compact,/padding-left:54px/);
 assert.match(compact,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(html,/id="channelPanelShowBtn"/);
});
test('v4.23.33 special theme layouts keep video and controls in separate rows',()=>{
 assert.match(compact,/grid-template-areas:"video" "controls" "guide" "strip" "time" "tools"/);
 assert.match(compact,/data-ui-style="bento"/);
 assert.match(compact,/data-theme-channel-drawer="open"/);
});
