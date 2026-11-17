'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'renderer/player-layout-rollback-v19.css'),'utf8');
const pkg=require(path.join(root,'package.json'));
const script=fs.readFileSync(path.join(root,'scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8');

test('v19 playback IDs retained in v19.x without v16 dynamic DOM reparenting',()=>{
 assert.match(html,/class="player-control-card ipvp19-ui"/);
 assert.doesNotMatch(html,/control-bar-v16\.js|control-bar-v16\.css/);
 for(const id of ['playingTitle','playingSubtitle','manualLinkControl','manualLinkSelect','favCurrentBtn',
   'prevBtn','playBtn','stopBtn','nextBtn','volume','shotBtn','videoFit','castBtn','pipBtn','fullscreenBtn']){
   assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
});
test('EPG, DVR and buffer features persist after new two-row layout',()=>{
 for(const id of ['epgCurrent','epgNowText','ipvpNowTitle','ipvpNextTitle','openGuideBtn','quickTools',
 'bufferToggle','bufferRewind10','bufferRewind','bufferLive','dvrQuickToggle']){
   assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
});
test('v17 source ratio and v18 sidebar tab preserved',()=>{
 assert.match(css,/aspect-ratio:var\(--ipvp-source-video-aspect,16 \/ 9\)!important/);
 assert.match(css,/width:15px!important;height:40px!important/);
 const entry=fs.readFileSync(path.join(root,'renderer/app-entry.js'),'utf8');
 assert.match(entry,/video-source-aspect-v17\.js/);
});
test('one-ZIP installer pins current minor version tag without replacing previous builds',()=>{
 assert.match(pkg.version,/^4\.23\.17-tauri\.\d+(?:\.\d+)*$/);
 const release=pkg.version.split('-tauri.')[1];
 assert.ok(script.includes('VERSION="'+pkg.version+'"'));
 assert.ok(script.includes('TAG="rust-lab/v'+release+'"'));
 assert.match(script,/archive\/refs\/tags\/\$\{TAG\}\.zip/);
 assert.match(script,/while \[\[ -e "\$DEST" \]\]/);
 assert.match(script,/npm run build -- --bundles app/);
 assert.match(script,/APP_TARGET/);
 assert.doesNotMatch(script,/cp "\$TMP\/source\.zip" "\$DEST/);
});