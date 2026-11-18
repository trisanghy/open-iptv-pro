'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'renderer/sidebar-link-picker-v42329.css'),'utf8');
const app=fs.readFileSync(path.join(root,'renderer/app.js'),'utf8');
const features=fs.readFileSync(path.join(root,'renderer/features.js'),'utf8');
const {prioritize}=require('../renderer/manual-stream-selection.js');
test('v4.23.29: hamburger lives within sidebar and compact rail retains icons',()=>{
 assert.match(html,/<aside class="sidebar" id="appSidebar">[\s\S]*?id="sidebarToggleBtn"/);
 assert.match(css,/data-sidebar-visible="false"[^{}]*#appSidebar[\s\S]*?display:flex!important/);
 assert.match(css,/#appSidebar\s+\.nav/);
 assert.match(features,/btn\.textContent='☰'/);
 assert.match(features,/aria-expanded/);
});
test('v4.23.35: manual stream selector remains between EPG and favorite in second row',()=>{
 const row=html.match(/<div class="control-layout-bottom">[\s\S]*?<\/div>/);
 assert.ok(row);
 const textIndex=html.indexOf('class="playing-channel-text"');
 const pickerIndex=html.indexOf('id="manualStreamSelect"');
 const favoriteIndex=html.indexOf('id="favCurrentBtn"');
 assert.ok(textIndex<pickerIndex&&pickerIndex<favoriteIndex);
 assert.ok(html.indexOf('id="epgCurrent"')<pickerIndex);
 assert.ok(html.indexOf('id="videoFit"')<pickerIndex);
 assert.match(app,/manualStreamSelect.*addEventListener/);
 assert.match(app,/mode:'live'/);
 assert.match(app,/updateManualLinkPicker\(\)/);
});
test('v4.23.29: manual URL first with safe fallbacks, never accepts unknown URL',()=>{
 const links=['https://one.test/live.m3u8','https://two.test/live.m3u8','https://three.test/live.m3u8'];
 assert.deepEqual(prioritize(links,links[2]),[links[2],links[0],links[1]]);
 assert.deepEqual(prioritize(links,''),links);
 assert.equal(prioritize(links,'https://unknown.test/x'),null);
 assert.deepEqual(prioritize([links[0],links[0],links[1]],links[1]),[links[1],links[0]]);
});
