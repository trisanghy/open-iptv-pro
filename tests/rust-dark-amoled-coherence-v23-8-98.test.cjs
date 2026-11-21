'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('Dark/AMOLED overrides load last, without changing video or app data',()=>{
 const html=read('renderer/index.html');
 const css=read('renderer/rust-dark-amoled-coherence-v23-8-98.css');
 const link='rust-dark-amoled-coherence-v23-8-98.css';
 assert.equal(html.split(link).length-1,1);
 assert.ok(html.indexOf(link)>html.indexOf('rust-dark-browser-accent-v23-8-97.css'));
 assert.ok(html.indexOf(link)>html.indexOf('video-gpu-manager-v1.css'));
 assert.match(css,/html\[data-theme="dark"\]/);
 assert.match(css,/html\[data-theme="amoled"\]/);
 assert.doesNotMatch(css,/html\[data-theme="light"\]/);
 assert.doesNotMatch(css,/localStorage|sessionStorage|playChannel|fetch\(|innerHTML|window\.streamleaf/);
 assert.match(css,/data-ui-style="current"/);
 assert.match(css,/:not\(\[data-ui-style\]\)/);
});
test('AMOLED canvas is true black and feature panels are grey-neutral, not navy',()=>{
 const css=read('renderer/rust-dark-amoled-coherence-v23-8-98.css');
 assert.match(css,/--rust-night-canvas:#000000/);
 assert.match(css,/--rust-night-card:#080808/);
 assert.match(css,/--rust-night-control:#151515/);
 assert.match(css,/\.sidebar\{background:#000!important\}/);
 for(const name of ['.player-control-card','.advanced-timebar','.compact-tools','.video-enhance-panel .veh-card',
 '#videoGpuManager','.veh-gpu-modal','.rust-browser-main','.settings-accordion-content',
 '.source-hub-section','.collector-progress','.dvr-panel','.epg-row']){
  assert.ok(css.includes(name),name);
 }
 assert.doesNotMatch(css,/#[a-f\d]{6}.*[\s](?:blue|green)\b/i);
});
test('selected browser, AI and GPU controls use saved user accent',()=>{
 const css=read('renderer/rust-dark-amoled-coherence-v23-8-98.css');
 for(const name of ['.rust-browser-tab.active','.rust-browser-chip.active','.rust-browser-card.selected',
 '.unified-ai-toggle','.video-enhance-toggle','.veh-nav button:first-child','.veh-gpu-actions button']){
  assert.ok(css.includes(name),name);
 }
 assert.match(css,/--rust-night-select:color-mix\(in srgb,var\(--accent\)/);
 assert.match(css,/accent-color:var\(--accent\)/);
 assert.match(css,/color-scheme:dark/);
});
