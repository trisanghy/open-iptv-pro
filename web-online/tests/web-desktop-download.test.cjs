'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const api=require(path.join(root,'web-desktop-download.js'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'web-desktop-download.css'),'utf8');
const js=fs.readFileSync(path.join(root,'web-desktop-download.js'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const github='https://github.com/trisanghy/open-iptv-pro/releases/download/';
const sampleDesktop={tag_name:'v4.23.70',assets:[
 'Open-IPTV-Pro-Setup-4.23.70-x64.exe',
 'Open-IPTV-Pro-4.23.70-x64.exe',
 'Open-IPTV-Pro-4.23.70-mac-arm64.dmg',
 'Open-IPTV-Pro-4.23.70-mac-x64.dmg',
 'OpenIPTVPro-RustLab-v23.8.30-mac-universal.dmg',
 'OpenIPTVPro-RustLab-v23.8.30-Windows-Setup-x64.exe',
 'OpenIPTVPro-RustLab-v23.8.30-Windows-Portable-x64.zip',
 'OpenIPTVPro_Web_Online_v4.23.70.zip'
].map(name=>({name,size:100000000,browser_download_url:github+'v4.23.70/'+name}))};
const mobileNames=['OpenIPTVPro-Mobile-4.23.17-mobile.8-debug.apk','OpenIPTVPro-Mobile-4.23.17-mobile.8-unsigned.ipa'];
const sampleMobile={tag_name:'mobile/v4.23.17.8',published_at:'2026-11-18T15:29:55Z',
 assets:mobileNames.map(name=>({name,size:10000000,browser_download_url:github+'mobile/v4.23.17.8/'+name}))};
test('GitHub latest release lists all verified Electron and Rust desktop installers',()=>{
 const r=api.resolveRelease(sampleDesktop);
 assert.equal(r.version,'v4.23.70');
 assert.deepEqual(r.items.map(x=>x.id),['win','mac-arm','mac-intel','win-portable','rust-win','rust-mac','rust-portable']);
 assert.ok(r.items.every(x=>api.safeAssetUrl(x.url)));
});
test('latest mobile tag provides real Android debug APK and unsigned iOS IPA',()=>{
 const old={...sampleMobile,tag_name:'mobile/v4.23.17.7',published_at:'2026-11-17T10:00:00Z'};
 const r=api.resolveMobileRelease([old,{...sampleMobile,draft:true},sampleMobile]);
 assert.equal(r.version,'mobile/v4.23.17.8');
 assert.deepEqual(r.items.map(x=>x.id),['android','ios']);
 assert.ok(r.items.every(x=>x.url.includes('mobile/v4.23.17.8/')));
 assert.equal(api.resolveMobileRelease([]),null);
 assert.equal(api.resolveMobileRelease([{tag_name:'mobile/v2',assets:[]}]),null);
});
test('only safe GitHub release assets appear (no malicious or unsigned URL rewriting)',()=>{
 for(const url of ['javascript:alert(1)','https://evil.example/file',
  'http://github.com/trisanghy/open-iptv-pro/releases/download/v1/file.exe',
  'https://github.com/other/repo/releases/download/mobile/v1/file.apk',
  'https://github.com/trisanghy/open-iptv-pro/releases/download/v1/file.exe?token=secret',
  'https://github.com/trisanghy/open-iptv-pro/releases/download/other/v1/evil.apk'])
  assert.equal(api.safeAssetUrl(url),false,url);
 assert.equal(api.resolveRelease({tag_name:'fake',assets:[{name:'Open-IPTV-Pro-Setup-1.2-x64.exe',browser_download_url:'https://evil.example/file'}]}).items.length,0);
});
test('selection recommends current platform without hiding other platforms',()=>{
 const items=[...api.resolveRelease(sampleDesktop).items,...api.resolveMobileRelease([sampleMobile]).items];
 assert.equal(api.sortFor(items,'Mozilla/5.0 (Windows NT 10.0)')[0].id,'win');
 assert.equal(api.sortFor(items,'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')[0].id,'ios');
 assert.equal(api.sortFor(items,'Mozilla/5.0 (Linux; Android 15)')[0].id,'android');
 assert.equal(api.sortFor(items,'Mozilla/5.0 (Macintosh; Intel Mac OS X)')[0].id,'mac-arm');
 assert.equal(api.sortFor(items,'Android').length,9);
});
test('first-visit banner is persisted across reloads and never reappears after close',()=>{
 const values=new Map();
 const store={getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,v)};
 assert.equal(api.firstVisit(store),true);
 assert.equal(values.get(api.INTRO_KEY),'seen');
 assert.equal(api.firstVisit(store),false);
 assert.equal(api.firstVisit({getItem(){throw Error('storage unavailable')}}),false);
});
test('desktop software entry is directly after Settings and mobile intro has real X',()=>{
 for(const id of ['desktopDownloadBtn','desktopDownloadMobileBtn','softwareDownloadNav','softwareDownloadIntroClose'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.match(html,/data-page="settings"[^<]*<span>⚙<\/span> Cài đặt<\/button>\s*<button[^>]+id="softwareDownloadNav"/);
 assert.ok(html.includes('id="softwareDownloadIntro" class="desktop-download-intro" hidden'));
 assert.ok(html.includes('web-desktop-download.css?v=ios-shortcut-20261119a'));
 assert.ok(html.includes('web-desktop-download.js?v=ios-shortcut-20261119a'));
 assert.match(css,/\.desktop-download-intro\[hidden\]\{display:none!important\}/);
 assert.match(css,/html\[data-iptv-device="mobile"\] #page-tv>\.desktop-download-intro:not\(\[hidden\]\)/);
 assert.match(css,/html\[data-iptv-device="mobile"\] \.desktop-download-top\{display:none!important\}/);
});
test('More menu always retains software downloads even after intro is dismissed',()=>{
 assert.match(js,/data-mobile-more-click="softwareDownloadNav"/);
 assert.match(js,/Tải xuống phần mềm/);
 assert.match(js,/settings\.after\(button\)/);
 assert.match(js,/introClose\?\.addEventListener/);
 assert.match(js,/getAttribute\('data-iptv-device'\)==='mobile'/);
 assert.match(js,/IPA trên iOS chưa ký/);
 assert.ok(builder.includes("'web-desktop-download.css','web-desktop-download.js'"));
 assert.ok(builder.includes('sidebar_button='));
 assert.ok(builder.includes('desktop_button='));
 assert.ok(builder.includes('mobile_button='));
 assert.ok(builder.includes('web-desktop-download.js?v=ios-shortcut-20261119a'));
 assert.equal(fs.readFileSync(path.join(root,'web-online/web-desktop-download.js'),'utf8'),js);
 assert.equal(fs.readFileSync(path.join(root,'web-online/web-desktop-download.css'),'utf8'),css);
});

test('download modal always offers iOS shortcut with Safari and Chrome Share steps',()=>{
 assert.match(js,/id="iosShortcutInstall"/);
 assert.match(js,/Cài app cho iOS \(không cần ký\)/);
 assert.match(js,/Safari hoặc Chrome/);
 assert.match(js,/Chia sẻ/);
 assert.match(js,/Thêm vào Màn hình chính/);
 assert.match(js,/Add to Home Screen/);
 assert.match(js,/không phải file IPA/);
 assert.match(js,/https:\/\/trisanghy\.github\.io\/open-iptv-pro\//);
 assert.match(js,/iosShortcut\.open=true/);
 assert.match(css,/desktop-download-ios-shortcut/);
 assert.match(css,/min-height:54px/);
});
test('shortcut is separate from unsigned IPA and loads independently of GitHub API',()=>{
 const start=js.indexOf('<details class="desktop-download-ios-shortcut"');
 const end=js.indexOf('</details>',start);
 assert.ok(start>=0&&end>start);
 const card=js.slice(start,end);
 assert.doesNotMatch(card,/\.ipa|releases\/download|await root\.fetch/);
 assert.match(js,/IPA unsigned · cần ký để cài đặt/);
 assert.match(js,/data-mobile-more-click="softwareDownloadNav"/);
 assert.ok(js.indexOf('id="iosShortcutInstall"')<js.indexOf('id="desktopDownloadStatus"'));
 assert.equal((js.match(/id="iosShortcutInstall"/g)||[]).length,1);
});
