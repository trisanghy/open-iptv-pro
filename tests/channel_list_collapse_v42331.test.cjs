"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('renderer/index.html'),features=read('renderer/features.js'),css=read('renderer/channel-panel-toggle-v42331.css');
test('v4.23.31 channel list has separate hide and reopen buttons',()=>{
 assert.match(html,/id="channelPanelHideBtn"/);assert.match(html,/id="channelPanelShowBtn"/);
 assert.doesNotMatch(html,/href="channel-panel-toggle-v42331\.css"/);
 assert.match(html,/href="channel-panel-compact-v42333\.css"/);
});
test('v4.23.31 restores persisted channel panel state',()=>{
 assert.match(features,/typeof config\.channelPanelVisible/);
 assert.match(features,/dataset\.channelPanelVisible/);
 assert.match(features,/updateChannelPanelVisibility\(false\)/);
 assert.match(features,/channelPanelShowBtn.*addEventListener/);
});
test('v4.23.31 collapsed panel hides list while retaining its reopen control',()=>{
 assert.match(css,/data-channel-panel-visible="false"\].*\.channel-panel\{display:none !important/);
 assert.match(css,/data-channel-panel-visible="false"\] #channelPanelShowBtn\{display:grid/);
 const compact=read('renderer/channel-panel-compact-v42333.css');
 assert.match(compact,/padding-left:6px!important/);
 assert.match(compact,/width:14px/);
 assert.match(compact,/grid-template-columns:minmax\(0,1fr\)!important/);
});
