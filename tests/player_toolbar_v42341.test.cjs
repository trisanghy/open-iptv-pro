'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('renderer/index.html'),css=read('renderer/player-compact-cast-v42342.css');
test('v4.23.44: all core controls remain functional and within one top row',()=>{
 const top=html.split('<div class="control-layout-top">')[1].split('<div class="control-layout-bottom">')[0];
 for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','volume','castBtn','pipBtn','fullscreenBtn'])assert.match(top,new RegExp('id="'+id+'"'));
 assert.ok(top.indexOf('id="volume"')<top.indexOf('id="castBtn"'));
 assert.equal((html.match(/id="castBtn"/g)||[]).length,1);
 assert.match(css,/grid-template-columns:minmax\(145px,1\.18fr\)/);
});
test('v4.23.44: compact volume, Cast and PiP fit on laptop widths',()=>{
 assert.match(css,/max-width:105px!important/);
 assert.match(css,/output-controls #castBtn/);
 assert.match(css,/@container \(min-width:650px\) and \(max-width:980px\)/);
 assert.match(css,/flex-wrap:nowrap!important/);
});
test('v4.23.44: 2-row EPG has no labels, video-fit control has accessible name',()=>{
 assert.match(css,/content:none!important/);
 assert.doesNotMatch(html,/<span>Khung hình<\/span>/);
 assert.match(html,/id="videoFit" aria-label="Chế độ hiển thị video"/);
 for(const id of ['epgNowName','epgNextName','epgNowTime','epgNextTime']) assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(css,/max-width:225px!important/);
});
test('v4.23.44: stylesheet is loaded after previous player theme and video unaffected',()=>{
 assert.ok(html.indexOf('player-compact-cast-v42342.css')>html.indexOf('player-toolbar-v42341.css'));
 assert.ok(html.indexOf('id="playerBox"')<html.indexOf('class="player-control-card"'));
 assert.doesNotMatch(css,/#playerBox(?:\s*\{|\s*>)/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.68');
});
