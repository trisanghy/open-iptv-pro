
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const html=read('renderer/index.html');
const css=read('renderer/settings-v42317.css');
const features=read('renderer/features.js');

test('v4.23.36: scan/replay selectors use accessible native dropdowns',()=>{
 for(const id of ['checkConcurrencySelect','snapshotConcurrencySelect','replayMinutesSelect']){
  assert.match(html,new RegExp('<select id="'+id+'"'));
  assert.match(html,new RegExp('id="'+id+'"[^>]*aria-label='));
 }
 assert.match(read('renderer/config-dropdown-v42336.css'),/config-dropdown:focus-visible/);
 assert.doesNotMatch(html,/name="(?:checkConcurrencyChoice|snapshotConcurrencyChoice|replayMinutesChoice)"/);
});

test('v4.23.22: sidebar button is accessible and persists state independently of theme',()=>{
 assert.equal((html.match(/id="sidebarToggleBtn"/g)||[]).length,1);
 assert.match(features,/config\.sidebarVisible=!config\.sidebarVisible/);
 assert.match(features,/dataset\.sidebarVisible/);
 assert.match(features,/new ResizeObserver\(updateSidebarEdge\)/);
 assert.match(css,/data-sidebar-visible="false"/);
 assert.match(css,/data-ui-style="cinema"/);
 assert.match(css,/data-ui-style="glass"/);
 assert.match(css,/data-ui-style="swiss"/);
});

test('v4.23.22: global HSV wheel and native color-picker persist one unified accent',()=>{
 for(const id of ['colorWheel','wheelHole','wheelIndicator','wheelShadeIndicator','themePicker']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 }
 for(const id of ['appearanceAccentSlider','appearanceCustomPicker','accentColorSlider']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,0);
 }
 assert.match(features,/function wheelPick\(/);
 assert.match(features,/function rgbToHsv\(/);
 assert.match(features,/function hsvToHex\(/);
 assert.match(features,/config\.accentCustom=origin!=='reset'/);
 assert.doesNotMatch(features,/config\.appearanceAccent/);
 assert.match(css,/appearance-wheel-controls/);
});

test('v4.23.22: top bar hidden but source importing remains accessible from Source manager and empty player',()=>{
 assert.match(read('renderer/styles.css'),/\.topbar\{display:none!important\}/);
 for(const id of ['sourcesFileBtn','sourcesUrlBtn','emptyFileBtn','emptyUrlBtn'])assert.ok(html.includes('id="'+id+'"'));
});
