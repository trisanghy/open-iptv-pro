'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const stage=read('renderer/theme-stage.js'),theme=read('renderer/ui-refined.css'),fix=read('renderer/video-layout-fix-v42330.css'),html=read('renderer/index.html');
test('Theme engine never appends ordinary playback controls into video player',()=>{
 assert.doesNotMatch(stage,/player\.appendChild\(card\)/);
 assert.match(stage,/watch\.insertBefore\(card,timebar\)/);
 assert.match(fix,/#page-tv \.player-box > \.player-control-card \{ display:none!important/);
});
test('Cinema Glass Broadcast include dedicated controls grid slot',()=>{
 for(const layout of ['"video guide" "controls guide"', '"channels video guide" "channels controls guide"']) assert.ok(theme.includes(layout),layout);
 assert.match(theme,/grid-area:controls;position:relative/);
 assert.match(theme,/"channels video" "channels controls"/);
});
test('Fullscreen has single bottom toolbar with separate video area and auto hide',()=>{
 assert.match(fix,/#playerBox:fullscreen > video/);
 assert.match(fix,/height:calc\(100% - var\(--fullscreen-toolbar-height\)\)/);
 assert.match(fix,/#playerBox:fullscreen\.player-idle > video/);
 assert.match(html,/id="fullscreenUX"/);
});
test('Navigation toggle remains in sidebar and next to brand in horizontal themes',()=>{
 assert.match(html,/<aside class="sidebar" id="appSidebar">[\s\S]*?id="sidebarToggleBtn"/);
 assert.match(fix,/#appSidebar > #sidebarToggleBtn/);
 assert.match(fix,/position:relative!important;top:auto!important;left:auto!important/);
 assert.match(html,/href="video-layout-fix-v42330\.css"/);
});
