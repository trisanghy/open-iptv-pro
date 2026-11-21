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
test('screenshot review: active channel filter and navigation use legible Light colors',()=>{
 const css=read('renderer/rust-light-consistency-v23-8-92.css');
 assert.match(css,/\.channel-panel \.filter-tab\.active/);
 assert.match(css,/\.filter-tab\.active\s*\{[^}]*background:color-mix\([^}]*#ffffff\)!important/);
 assert.match(css,/\.sidebar \.nav\.active span/);
 assert.match(css,/\.timeshift-actions>b/);
 assert.match(css,/\.rust-browser-empty/);
 assert.match(css,/\.dvr-quick-status\.error/);
});

test('visual review: empty channel/EPG text and folder action buttons use readable Light colors',()=>{
 const css=read('renderer/rust-light-consistency-v23-8-92.css');
 assert.match(css,/html\[data-theme="light"\] \.empty-list\s*\{/);
 assert.match(css,/\.channel-panel \.folder-actions button\s*\{/);
 assert.match(css,/\.folder-actions button:hover\s*\{/);
});


test('Rust Light keeps warning, success and helper text readable without affecting Dark',()=>{
 const css=read('renderer/rust-light-consistency-v23-8-92.css');
 for(const selector of ['.dvr-error','.dvr-job-error','.dvr-running-warning',
  '.dvr-status','.dvr-job-meta','.dvr-quick-hint','.source-check-note',
  '.channel-drag-hint','.sidebar .nav.active','.rust-browser-empty']){
  assert.ok(css.includes(selector),'Missing Light contrast fix: '+selector);
 }
 assert.match(css,/\.dvr-error[^}]*color:#a12f44!important/);
 assert.match(css,/\.dvr-completed \.dvr-pill/);
 assert.match(css,/\.sidebar \.nav\.active :is\(\.nav-label/);
 assert.doesNotMatch(css,/html\[data-theme="(dark|amoled)"\]/);
});
