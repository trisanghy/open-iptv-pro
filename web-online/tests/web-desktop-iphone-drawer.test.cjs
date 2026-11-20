'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const js=fs.readFileSync(path.join(root,'web-desktop-viewport-fix.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-desktop-viewport-fix.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
test('rollback restores previous phone desktop layout without the overlay navigation drawer',()=>{
 assert.doesNotMatch(js,/iptvDesktopPhoneMenuButton|iptvDesktopPhoneMenuVeil|data-iptv-handheld-menu|showDrawer/);
 assert.doesNotMatch(css,/iptvDesktopPhoneMenuButton|iptvDesktopPhoneMenuVeil|data-iptv-handheld-menu/);
 assert.match(js,/--iptv-desktop-usable-height/);
 assert.match(css,/--iptv-desktop-usable-height/);
 assert.match(html,/web-desktop-viewport-fix\.js\?v=desktop-phone-rollback-20261120b/);
 assert.match(html,/web-desktop-viewport-fix\.css\?v=desktop-phone-rollback-20261120b/);
 assert.match(builder,/desktop_viewport_version='desktop-phone-rollback-20261120b'/);
});
test('sidebar persistence and UI tabs are not modified by this rollback',()=>{
 assert.doesNotMatch(js,/sidebarVisible|localStorage\.setItem/);
 assert.doesNotMatch(css,/\.nav\[data-page\]|sidebar-edge-toggle/);
 for(const page of ['tv','fav','epg','profiles','settings','sources']){
  assert.match(html,new RegExp('id="page-'+page+'"'));
 }
});
