'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Rust Lab Light stylesheet loads last and is scoped to selected appearance',()=>{
 const html=read('renderer/index.html'),css=read('renderer/rust-light-consistency-v23-8-92.css');
 assert.match(html,/rust-light-consistency-v23-8-92\.css/);
 assert.ok(html.lastIndexOf('rust-light-consistency-v23-8-92.css')>html.lastIndexOf('rust-web-player-icons.css'));
 assert.match(css,/html\[data-theme="light"\]/);
 assert.doesNotMatch(css,/data-theme="amoled"|data-theme="dark"|localStorage/);
});
test('Rust Light fixes all known dark legacy and Rust-only controls',()=>{
 const css=read('renderer/rust-light-consistency-v23-8-92.css');
 for(const key of ['.rust-browser-main','.rust-browser-card','.rust-browser-chip','.rust-browser-filters',
 '.rust-ai-card','.rust-ai-field select','.rust-cc-panel','.veh-card','.video-enhance-toggle',
 '.unified-ai-toggle','.epg-summary','.health-table','.doctor-v3-panel','.smart-panel',
 '.dvr-panel','.collector-progress','.source-hub','.settings-card']){
  assert.ok(css.includes(key),'Light rule missing: '+key);
 }
 assert.match(css,/\.player-box video/);
});
test('Rust retains original dark video and native themes',()=>{
 const css=read('renderer/rust-light-consistency-v23-8-92.css');
 assert.ok(css.includes('html[data-theme="light"] #page-tv :is(.player-box,.player-box video'));
 assert.ok(!css.includes('background:#000!important'));
});