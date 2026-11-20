'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),get=p=>fs.readFileSync(path.join(root,p),'utf8');
const mobile=get('web-mobile-player.js'),css=get('web-mobile-player.css'),download=get('web-desktop-download.js');
const menu=mobile.split('<div class="mobile-more-grid">')[1]?.split('</div>')[0]||'';
test('More menu has nine fixed destinations and a tenth injected software download',()=>{
 assert.equal(menu.split('class="mobile-more-action"').length-1,9);
 assert.deepEqual([...menu.matchAll(/data-mobile-more-page="([^"]+)"/g)].map(x=>x[1]),['multiview','folders','health','doctor','profiles','settings']);
 assert.deepEqual([...menu.matchAll(/data-mobile-more-click="([^"]+)"/g)].map(x=>x[1]),['exportNav','cloudAccountQuick']);
 for(const bad of ['Ảnh chụp','Mở file M3U','Thêm URL','data-mobile-more-page="shots"','data-mobile-more-click="fileBtn"','data-mobile-more-click="urlBtn"'])
  assert.equal(menu.includes(bad),false,bad);
 assert.ok(download.includes('data-mobile-more-click="softwareDownloadNav"'));
 assert.ok(download.includes('settings.after(button)'));
 assert.ok(menu.includes('Hướng dẫn Web'));
});
test('SVG outline icons are uniform without colored backgrounds',()=>{
 assert.equal(menu.split("mobileMoreIcon('").length-1,9);
 assert.ok(mobile.includes('function mobileMoreIcon(name)'));
 assert.ok(mobile.includes('class="mobile-more-icon"'));
 assert.ok(download.includes("OpenIPTVMobileMoreIcon?.('download')"));
 assert.ok(css.includes('.mobile-more-action>.mobile-more-icon'));
 assert.ok(css.includes('--mobile-more-icon-color'));
 assert.ok(css.includes('backdrop-filter:blur(28px)'));
});
test('Other snapshot and playlist entry points remain intact',()=>{
 const html=get('index.html'),app=get('app.js');
 for(const id of ['fileBtn','urlBtn','shotBtn'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(app.includes('async function openURL()'));
 assert.ok(app.includes('snapshotOne(ch)'));
 assert.ok(mobile.includes('destination?.click()'));
});
test('Pages builder and HTML use identical cache-busting keys',()=>{
 const html=get('index.html'),builder=get('web-online/prepare-web.py');
 for(const name of ['web-mobile-player.js','web-mobile-player.css','web-desktop-download.js']){
  const key=name+'?v=apple-more-20261120a';
  assert.ok(html.includes(key),key);
  assert.ok(builder.includes(key),key);
 }
 assert.equal(download,get('web-online/web-desktop-download.js'));
});
