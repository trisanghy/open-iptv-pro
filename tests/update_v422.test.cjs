'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {checkUpdate,compatibleAsset,versionFromText}=require('../src/update-check.cjs');
const {identifyInstaller,OFFICIAL_REPO}=require('../src/update-manager.cjs');
const repo='trisanghy/open-iptv-pro';
const url=(tag,name)=>`https://github.com/${repo}/releases/download/${tag}/${name}`;
const item=(name,tag='release_4.23.0')=>({name,browser_download_url:url(tag,name),size:100,digest:'sha256:'+'a'.repeat(64)});
const release=(tag,assets,extra={})=>({id:1,tag_name:tag,name:'Open IPTV Pro',assets,html_url:`https://github.com/${repo}/releases`,...extra});
function api(latest,list){return async uri=>({ok:true,status:200,json:async()=>uri.endsWith('/releases/latest')?latest:list});}
test('v4.22: recognizes non-standard GitHub tag using macOS installer version',async()=>{
 const r=release('full-desktop-release',[
  item('Open-IPTV-Pro-4.23.0-mac-arm64.dmg'),item('Open-IPTV-Pro-4.23.0-mac-x64.dmg'),item('Open-IPTV-Pro-Setup-4.23.0-x64.exe')
 ]);
 const result=await checkUpdate(repo,'4.22.0',api(r,[r]),'darwin','arm64');
 assert.equal(result.latest,'v4.23.0');assert.equal(result.newer,true);
 assert.equal(identifyInstaller(result.assets,'darwin','arm64').name,'Open-IPTV-Pro-4.23.0-mac-arm64.dmg');
});
test('v4.22: selected Windows installer never resolves to Mac asset',async()=>{
 const r=release('v4.23.0',[item('Open-IPTV-Pro-4.23.0-mac-arm64.dmg'),item('Open-IPTV-Pro-Setup-4.23.0-x64.exe')]);
 const result=await checkUpdate(repo,'4.22.0',api(r,[r]),'win32','x64');
 assert.equal(result.newer,true);assert.equal(identifyInstaller(result.assets,'win32','x64').name,'Open-IPTV-Pro-Setup-4.23.0-x64.exe');
});
test('v4.22: skips source-only latest release for older compatible but still newer installer release',async()=>{
 const source=release('source-only-2026-11-08',[],{id:12});
 const binary=release('production_4.22.2',[item('Open-IPTV-Pro-4.22.2-mac-arm64.dmg','production_4.22.2')],{id:11});
 const result=await checkUpdate(repo,'4.22.0',api(source,[source,binary]),'darwin','arm64');
 assert.equal(result.latest,'v4.22.2');assert.equal(result.newer,true);
});
test('v4.22: never incorrectly offer a downgrade',async()=>{
 const r=release('desktop_4.20.0',[item('Open-IPTV-Pro-4.20.0-mac-arm64.dmg','desktop_4.20.0')]);
 const result=await checkUpdate(repo,'4.22.0',api(r,[r]),'darwin','arm64');
 assert.equal(result.newer,false);
});
test('v4.22: parse flexible release names while still choosing compatible arch',()=>{
 assert.equal(versionFromText('OPEN_IPTV_PRO.release-v4.25.1-full'),'4.25.1');
 assert.equal(compatibleAsset([{name:'Open-IPTV-Pro-4.23.0-mac-x64.dmg',url:'https://x'}],'darwin','arm64'),null);
 assert.equal(compatibleAsset([{name:'Open-IPTV-Pro-4.23.0-mac-arm64.dmg',url:'https://x'}],'darwin','arm64').name,'Open-IPTV-Pro-4.23.0-mac-arm64.dmg');
 assert.equal(OFFICIAL_REPO,repo);
});
test('v4.22: repository is display-only and graphical icon pack ships with app',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
 assert.doesNotMatch(html,/id="releaseRepo"/);assert.match(html,/trisanghy\/open-iptv-pro/);
 assert.match(html,/app-icons\.js/);
 assert.match(fs.readFileSync(path.join(__dirname,'../renderer/app-icons.js'),'utf8'),/macos-nav-symbol/);
});
