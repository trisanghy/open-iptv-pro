'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('collapsed Rust sidebar uses no empty left gutter for TV but preserves full sidebar',()=>{
 const style=read('renderer/sidebar-gap-repair-v23-8-83.css');
 const html=read('renderer/index.html');
 assert.match(style,/data-sidebar-collapsed="true"/);
 assert.match(style,/\.content:has\(#page-tv\.active-page\)/);
 assert.match(style,/padding-left:4px!important/);
 assert.match(style,/#page-tv \.tv-layout/);
 assert.match(html,/sidebar-gap-repair-v23-8-83\.css/);
 assert.match(read('renderer/app-entry.js'),/video-enhancement-v23-8-70\.js/);
 assert.match(html,/unified-ai-inline-v1\.js/);
});
