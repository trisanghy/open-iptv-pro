'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const api=require(path.join(root,'web-desktop-download.js'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'web-desktop-download.css'),'utf8');
const js=fs.readFileSync(path.join(root,'web-desktop-download.js'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const example={tag_name:'v4.23.70',assets:[
  'Open-IPTV-Pro-Setup-4.23.70-x64.exe',
  'Open-IPTV-Pro-4.23.70-x64.exe',
  'Open-IPTV-Pro-4.23.70-mac-arm64.dmg',
  'Open-IPTV-Pro-4.23.70-mac-x64.dmg',
  'OpenIPTVPro-RustLab-v23.8.30-mac-universal.dmg',
  'OpenIPTVPro_Web_Online_v4.23.70.zip'
 ].map(name=>({name,size:120*1048576,browser_download_url:'https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.70/'+name}))};
test('latest official release shows Windows installers and both Mac DMGs, not Rust/web',()=>{
 const r=api.resolveRelease(example);
 assert.equal(r.version,'v4.23.70');
 assert.deepEqual(r.items.map(x=>x.id),['win','mac-arm','mac-intel','win-portable']);
 assert.ok(r.items.every(x=>api.safeAssetUrl(x.url)));
});
test('untrusted, insecure or secret-bearing URLs do not become download links',()=>{
 for(const url of ['javascript:alert(1)','https://evil.example/file',
  'http://github.com/trisanghy/open-iptv-pro/releases/download/v1/file.exe',
  'https://github.com/other/repo/releases/download/v1/file.exe',
  'https://github.com/trisanghy/open-iptv-pro/releases/download/v1/file.exe?token=secret']){
   assert.equal(api.safeAssetUrl(url),false,url);
 }
 assert.equal(api.resolveRelease({tag_name:'fake',assets:[{name:'Open-IPTV-Pro-Setup-1.2-x64.exe',browser_download_url:'https://evil.example/file'}]}).items.length,0);
});
test('Windows and Mac order installers conveniently without guessing CPU architecture',()=>{
 const list=api.resolveRelease(example).items;
 assert.equal(api.sortFor(list,'Mozilla/5.0 (Windows NT 10.0)')[0].id,'win');
 assert.deepEqual(api.sortFor(list,'Mozilla/5.0 (Macintosh; Intel Mac OS X)').slice(0,2).map(x=>x.id),['mac-arm','mac-intel']);
});
test('desktop topbar and mobile TV banner each have one visible entry',()=>{
 for(const id of ['desktopDownloadBtn','desktopDownloadMobileBtn'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.ok(html.includes('web-desktop-download.css?v=desktop-download-20261119a'));
 assert.ok(html.includes('web-desktop-download.js?v=desktop-download-20261119a'));
 assert.match(css,/html\[data-iptv-device="mobile"\] #page-tv>\.desktop-download-banner/);
 assert.match(css,/html\[data-iptv-device="mobile"\] \.desktop-download-top\{display:none!important\}/);
});
test('the mobile More menu and builder use the same functional release picker',()=>{
 assert.match(js,/data-mobile-more-click="desktopDownloadBtn"/);
 assert.match(js,/moreGrid\.append\(button\)/);
 assert.ok(builder.includes("'web-desktop-download.css','web-desktop-download.js'"));
 assert.ok(builder.includes('desktop_button='));
 assert.ok(builder.includes('mobile_button='));
 assert.ok(builder.includes('web-desktop-download.js?v=desktop-download-20261119a'));
 assert.ok(js.includes('github.com/trisanghy/open-iptv-pro/releases/latest'));
});
