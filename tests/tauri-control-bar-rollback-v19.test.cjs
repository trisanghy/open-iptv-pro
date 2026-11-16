'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'renderer/player-layout-rollback-v19.css'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const script=fs.readFileSync(path.join(root,'scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8');
const extract=(start,end)=>{
 const s=html.indexOf(start);const e=html.indexOf(end,s);
 assert.ok(s>=0&&e>s,`${start}..${end} not found`);
 return html.slice(s,e);
};
test('v19 disables two-row runtime and CSS instead of moving functional controls',()=>{
 assert.ok(html.includes('href="player-layout-rollback-v19.css"'));
 assert.ok(!html.includes('href="control-bar-v16.css"'));
 assert.ok(!html.includes('src="control-bar-v16.js"'));
 assert.ok(!fs.existsSync(path.join(root,'renderer/control-bar-v16.js')));
 assert.ok(!css.includes('.v16-toolbar-top'));
 assert.ok(!html.includes('v16-toolbar-top'));
});
test('restore original header and player buttons without changing IDs',()=>{
 const card=extract('<div class="player-control-card"','<div class="video-seekbar"');
 const header=extract('<div class="playing-info"','<div class="controls"');
 const controls=extract('<div class="controls"','<div class="video-seekbar"');
 assert.ok(card.includes('class="playing-info"') && card.includes('class="controls"'));
 for(const id of ['playingTitle','playingSubtitle','manualLinkControl','manualLinkSelect','favCurrentBtn'])assert.ok(header.includes(`id="${id}"`),id);
 for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','volume','shotBtn','videoFit','castBtn','pipBtn','fullscreenBtn']){
  assert.ok(controls.includes(`id="${id}"`),id);
  assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,`duplicate ${id}`);
 }
 assert.ok(controls.includes('class="volume-icon"'));
 assert.ok(controls.includes('class="control-spacer"'));
});
test('restore original separate EPG, buffer and quick tools controls',()=>{
 for(const id of ['epgCurrent','epgNowText','openGuideBtn','quickTools','bufferToggle','bufferRewind10','bufferRewind','bufferLive','dvrQuickToggle'])assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1, id);
 assert.ok(!css.includes('.epg-current-card{display:none'));
});
test('independent v17 and v18 visual fixes remain without reparenting controls',()=>{
 assert.match(css,/aspect-ratio:var\(--ipvp-source-video-aspect,16 \/ 9\)!important/);
 assert.match(css,/width:15px!important;height:40px!important/);
 const entry=fs.readFileSync(path.join(root,'renderer/app-entry.js'),'utf8');
 assert.ok(entry.includes('video-source-aspect-v17.js'));
 assert.match(html,/id="channelPanelReopen"/);
});
test('one ZIP installer targets exactly v19, leaving two files in Downloads',()=>{
 assert.equal(pkg.version,'4.23.17-tauri.19');
 assert.match(script,/VERSION="4\.23\.17-tauri\.19"/);
 assert.match(script,/archive\/refs\/heads\/\$\{BRANCH\}\.zip/);
 assert.match(script,/cp "\$TMP\/source\.zip" "\$DEST\/\$\{NAME\}_Source\.zip"/);
 assert.ok(pkg.scripts['test:quick'].includes('tauri-control-bar-rollback-v19'));
});