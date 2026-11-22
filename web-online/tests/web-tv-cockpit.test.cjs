'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const ui=read('web-cast-v2.js'),css=read('web-tv-cockpit.css'),index=read('index.html');
test('approved paired-screen controls and link are present and old step 3 is removed',()=>{
 for(const id of ['cxWebShort','cxTvVerified','cxTvControls','cxTvPrev','cxTvToggle','cxTvStop','cxTvNext','cxTvMute','cxTvVolume','cxTvFeedback'])
  assert.ok(ui.includes(id),id);
 assert.match(ui,/https:\/\/is\.gd\/openiptv/);
 assert.match(ui,/set\('cxTvCode','ĐÃ KẾT NỐI'\)/);
 assert.match(ui,/set\('cxTvChip','● Phiên được mã hóa'\)/);
 assert.doesNotMatch(ui,/Chọn “Cho phép” trên màn hình TV/);
 assert.match(ui,/overlay\.querySelector\('\.cx-tvbadge'\)\?\.remove\(\)/);
});
test('TV playback and channel controls reuse actual app transport and state',()=>{
 assert.match(ui,/\$\('prevBtn'\)\?\.click\(\)/);
 assert.match(ui,/\$\('nextBtn'\)\?\.click\(\)/);
 assert.match(ui,/toggleRemotePlayback\(\)/);
 assert.match(ui,/\$\('cxRemoteStop'\)\?\.click\(\)/);
 assert.match(ui,/original\.dispatchEvent\(new root\.Event\('input'/);
 assert.match(ui,/setTvIcon\(toggle,playing\?'pause':'play'\)/);
});
test('pairing expands TV screen without a second visible controller, responsive CSS is loaded',()=>{
 assert.match(css,/#cxPanePair\[data-paired="true"\] \.cx-grid/);
 assert.match(css,/\.cx-tv-controls\[hidden\]/);
 assert.match(css,/@media\(max-width:420px\)/);
 assert.match(index,/web-tv-cockpit\.css\?v=20261122a/);
 assert.match(index,/web-cast-v2\.js\?v=tv-cockpit-20261122a/);
});
