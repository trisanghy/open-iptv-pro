'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),get=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v4.23.44 player buttons retain previous ids and separate toolbar',()=>{
 const html=get('renderer/index.html'),css=get('renderer/player-classic-controls-v42340.css');
 for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','volume','castBtn','pipBtn','fullscreenBtn','videoFit','manualStreamSelect']) assert.match(html,new RegExp('id="'+id+'"'));
 assert.ok(html.indexOf('player-classic-controls-v42340.css')>html.indexOf('player-two-row-v42335.css'));
 assert.match(css,/#page-tv .player-control-card .controls.transport-controls/);
 assert.match(css,/@container \(max-width:560px\)/);
 assert.ok(html.indexOf('id="playerBox"')<html.indexOf('class="player-control-card"'));
});
test('Current Mac builders retain both architectures and the exact desktop version',()=>{
 const pkg=JSON.parse(get('package.json')),dmgbuilder=get('BUILD_MAC_DMG_ONLY.command');
 assert.equal(pkg.version,'4.23.68');
 assert.match(dmgbuilder,/arm64\|aarch64/);
 assert.match(dmgbuilder,/x64\|x86_64/);
 assert.match(dmgbuilder,/p\.version/);
 assert.match(get('build-mac-electron.sh'),/REF='build-sources\/electron-desktop'/);
});
