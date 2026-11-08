'use strict';const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'frontend','index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'frontend','webview-bridge.js'),'utf8');
const preload=fs.readFileSync(path.join(root,'electron-original','src','preload.cjs'),'utf8');
const main=fs.readFileSync(path.join(root,'backend','main.cjs'),'utf8');
const conf=JSON.parse(fs.readFileSync(path.join(root,'src-tauri','tauri.conf.json'),'utf8'));
test('v4.19 renderer preserved, native bridge loads before application',()=>{assert.ok(html.indexOf('webview-bridge.js')<html.indexOf('app.js'));assert.match(html,/multiview/i);assert.match(html,/timeshift/i);});
test('all original preload API are exposed',()=>{
 const funcs=['capabilities','startTimeshift','stopTimeshift','timeshiftStatus','notifyReminder','fetchEPG','checkUpdate','updateStatus','downloadUpdate','installUpdate','openDownloadedUpdate','onUpdateStatus','openRelease','openReleases','openM3U','loadURL','proxy','mediaKind','check','snapshot','export','listRepoPlaylists','vlcWebsite'];
 for(const key of funcs){assert.match(preload,new RegExp(`\\b${key}:`));assert.ok(new RegExp(`\\b${key}(?::|\\b)`).test(js),key)}
});
test('all backend IPC actions remain',()=>{
 const keys=['timeshift:start','timeshift:stop','timeshift:status','epg:fetch','update:check','update:status','update:download','update:install','update:openDownloaded','app:capabilities','source:readUrl','media:proxy','media:kind','link:check','snapshot:make','source:listRepo'];
 for(const k of keys)assert.ok(main.includes(`'${k}'`),k)
});
test('native binaries and non-webview update safety',()=>{
 assert.deepEqual(conf.bundle.externalBin,['binaries/iptv-node','binaries/ffmpeg','binaries/ffprobe']);
 assert.equal(conf.bundle.targets,'all');
 const source=fs.readFileSync(path.join(root,'backend','webview-updates.cjs'),'utf8');assert.match(source,/webview/i);
});
