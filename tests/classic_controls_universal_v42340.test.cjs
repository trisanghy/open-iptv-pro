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
test('v4.23.44 exact source version and universal Mac setting',()=>{
 assert.equal(JSON.parse(get('package.json')).version,'4.23.67');
 assert.match(get('BUILD_MAC.command'),/OPENIPTV_BUILD_ARCH/);
});
