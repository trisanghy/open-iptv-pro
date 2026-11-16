'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const base=path.join(__dirname,'../renderer');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const css=fs.readFileSync(path.join(base,'tv-compact-collapse-v14.css'),'utf8');
test('v14 compact CSS is loaded after channel toggle CSS and preserves manual source dropdown',()=>{
  assert(html.indexOf('href="channel-panel-toggle.css"')>=0);
  assert(html.indexOf('href="tv-compact-collapse-v14.css"')>html.indexOf('href="channel-panel-toggle.css"'));
  assert.match(html,/id="manualLinkSelect"/);assert.match(html,/id="channelPanelReopen"/);
});
test('hidden list frees entire width including player box, not just grid',()=>{
  assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(css,/\.player-box:not\(:fullscreen\)/);
  assert.match(css,/max-height:none!important/);
  assert.match(css,/width:100%!important/);
  assert.match(css,/aspect-ratio:16\/9!important/);
});
test('responsive layout keeps controls and timeshift, does not hide IPTV commands',()=>{
  assert.match(css,/@media \(max-width:980px\)/);
  assert.match(css,/\.controls[\s\S]*?flex-wrap:wrap!important/);
  assert.match(css,/\.advanced-timebar/);
  assert.doesNotMatch(css,/#(?:playBtn|stopBtn|nextBtn|bufferToggle|dvrQuickToggle)\s*\{[^}]*display:none/);
});
test('fullscreen player keeps its own layout and other themes remain supported',()=>{
  assert.match(css,/\.player-box:not\(:fullscreen\)/);
  assert.match(css,/\[data-ui-style="glass"\]/);assert.match(css,/\[data-ui-style="broadcast"\]/);
});

test('Mac native window can be resized to a compact portrait-like width',()=>{
 const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'../src-tauri/tauri.conf.json'),'utf8'));
 assert(cfg.app.windows[0].minWidth<=860);
});
