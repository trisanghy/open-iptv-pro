'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const css=fs.readFileSync(path.join(root,'web-tv-wide.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const stage=fs.readFileSync(path.join(root,'theme-stage.js'),'utf8');
test('right-hand TV EPG panel is fully hidden, but its legacy references survive',()=>{
 assert.match(css,/#page-tv #themeGuidePanel/);
 assert.match(css,/display:none!important/);
 assert.match(html,/<aside class="theme-guide-panel" id="themeGuidePanel"[^>]*hidden/);
 assert.match(html,/<aside class="theme-guide-panel" id="themeGuidePanel"[^>]*display:none!important/);
 assert.match(stage,/const list=\$\('channelList'\),strip=\$\('themeStripItems'\),guide=\$\('themeGuidePanel'\)/);
 assert.match(builder,/guide_marker=/);
});
test('Cinema player and controls occupy single full-width column',()=>{
 assert.match(css,/\[data-ui-style="cinema"\] #page-tv \.tv-layout\{[^}]*grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/grid-template-areas:"video" "controls" "strip" "time" "tools"!important/);
 assert.match(css,/\[data-ui-style="cinema"\] #page-tv \.player-box\{[^}]*max-height:none!important/);
});
test('Glass and Broadcast remove the guide grid column and keep channels',()=>{
 for(const type of ['glass','broadcast']){
  assert.match(css,new RegExp('\\[data-ui-style="'+type+'"\\] #page-tv \\.tv-layout\\{'));
 }
 assert.match(css,/grid-template-areas:"channels video" "channels controls" "channels time" "channels tools"!important/);
 assert.match(css,/grid-template-areas:"channels strip" "channels video" "channels controls" "channels time" "channels tools"!important/);
 assert.doesNotMatch(css,/grid-template-areas:[^;]*guide/);
});
test('full EPG access, favorites and channel carousel remain present',()=>{
 for(const id of ['page-epg','openGuideBtn','epgCurrent','favCurrentBtn','themeChannelStrip']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.ok(html.includes('web-tv-wide.css?v=tv-wide-no-side-epg-20261118k'));
 assert.equal((html.match(/id="themeGuidePanel"/g)||[]).length,1);
});
