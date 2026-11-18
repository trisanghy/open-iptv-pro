'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const discovery=require('../src/smart-discovery.cjs');
const doctor=require('../renderer/doctor-v3-core.js');
const pkg=require('../package.json');
test('Discovery country codes are strict; URL always uses fixed public origin',()=>{
 assert.equal(discovery.playlistURL('vn'),'https://iptv-org.github.io/iptv/countries/vn.m3u');
 for(const bad of ['v/','VN/../../foo','vn?x','', 'localhost'])assert.throws(()=>discovery.countryCode(bad));
});
test('Discovery stream checks avoid loopback and private IPs even with redirects',async()=>{
 const blocked=['http://127.0.0.1:3000/secret','http://192.168.1.1/admin','http://10.1.2.3/','http://169.254.169.254/','http://172.16.0.1','http://host.local/api','http://[::1]/','http://2130706433/'];
 for(const url of blocked)assert.throws(()=>discovery.safeStreamURL(url),undefined,url);
 assert.equal(discovery.safeStreamURL('https://media.example.com/live.m3u8').href,'https://media.example.com/live.m3u8');
 const calls=[];
 const redirected=async url=>{calls.push(url);return new Response(null,{status:302,headers:{location:'http://127.0.0.1:1000/secret'}});};
 await assert.rejects(discovery.safeStreamFetch('https://media.example.com/live.m3u8',{},redirected),/nội bộ/);
 assert.equal(calls.length,1,'must refuse redirect before next fetch');
});
test('Discovery catalog sanitizes names and keeps ISO countries only',()=>{
 const items=discovery.parseCountryList(JSON.stringify([{name:'Vietnam',code:'VN',flag:'🇻🇳'},{name:'Duplicate',code:'VN'},{name:'Fake',code:'a9'},{name:'United States',code:'US',flag:'🇺🇸'}]));
 assert.deepEqual(items.map(x=>x.code),['VN','US']);
});
test('Discovery accepts valid public M3U and rejects HTML, empty or malformed sources',()=>{
 const s='#EXTM3U\n#EXTINF:-1 tvg-id="v1",VTV1\nhttps://media.example/live.m3u8\n#EXTINF:-1,Other\nhttps://media.example/live.m3u8\n#EXTINF:-1,Local\nfile:///secret\n';
 assert.equal(discovery.inspectPlaylist(s).channels,1);
 for(const s of ['<html>404</html>','#EXTM3U\n#EXTINF:-1,Name\nfile:///secret','#EXTM3U\n#EXTINF:-1,Foo'])assert.throws(()=>discovery.inspectPlaylist(s));
});
test('Discovery fails closed on redirects, content size and external final URL',async()=>{
 const m3u='#EXTM3U\n#EXTINF:-1,Demo\nhttps://media.example/test.m3u8\n';
 const response=(url,opts={})=>({ok:opts.ok??true,status:opts.status??200,url:opts.url??url,headers:{get:()=>opts.length||''},text:async()=>m3u});
 const country=await discovery.loadCountry('VN',{fetcher:async url=>response(url)});
 assert.equal(country.channels,1);assert.equal(country.country,'VN');
 await assert.rejects(discovery.loadCountry('VN',{fetcher:async url=>response(url,{status:302})}),/chuyển hướng/);
 await assert.rejects(discovery.loadCountry('VN',{fetcher:async url=>response(url,{url:'http://localhost/hijack'})}),/ngoài danh mục/);
 await assert.rejects(discovery.loadCountry('VN',{fetcher:async url=>response(url,{length:3_000_010})}),/giới hạn/);
});
test('Doctor 3 evidence ranking is not a fabricated uptime percentage',()=>{
 const now=Date.parse('2026-11-08T10:00:00.000Z');
 const c={id:'1',name:'VTV1',url:'https://example.com/1',status:'unchecked'};
 const empty=doctor.grade(c,[],now);assert.equal(empty.recentAlive,false);assert.equal(empty.confidence,'insufficient');
 const good=doctor.grade(c,[{date:'2026-11-08T09:59:00Z',type:'probe',status:'alive',latencyMs:500},{date:'2026-11-08T09:58:00Z',type:'playback',status:'alive',startupMs:1200}],now);
 assert.ok(good.score>empty.score);assert.equal(good.recentAlive,true);assert.equal(good.confidence,'low');
 const bad=doctor.grade(c,[{date:'2026-11-08T09:59:00Z',type:'error',status:'uncertain'},{date:'2026-11-08T09:58:00Z',type:'freeze',level:'freeze-confirmed'}],now);
 assert.ok(bad.score<empty.score);
});
test('Doctor 3 does not confuse generic named channels or cross-ID sources',()=>{
 const a={id:'a',name:'VTV1 HD',tvgId:'VTV1.vn',group:'VN',url:'https://ex.com/1'};
 const b={id:'b',name:'VTV1',tvgId:'VTV1.vn',group:'Different',url:'https://ex.com/2'};
 const c={id:'c',name:'News',group:'World',url:'https://ex.com/3'};
 const d={id:'d',name:'News',group:'World',url:'https://ex.com/4'};
 const mismatch={id:'e',name:'VTV1',tvgId:'Others.tv',url:'https://ex.com/5'};
 assert.equal(doctor.sameChannel(a,b),true);
 assert.equal(doctor.sameChannel(c,d),false);
 assert.equal(doctor.sameChannel(a,mismatch),false);
 assert.equal(doctor.sameChannel(a,{...a,id:'x',url:a.url}),false);
});
test('Doctor 3 proposes backup only if counterpart was recently verified',()=>{
 const now=Date.parse('2026-11-08T10:00:00Z');
 const channels=[{id:'a',name:'VTV1',tvgId:'VTV1.vn',url:'https://example.com/a',status:'uncertain'},
 {id:'b',name:'VTV1',tvgId:'VTV1.vn',url:'https://example.com/b',status:'alive',checkedAt:'2026-11-08T09:30:00Z'}];
 assert.equal(doctor.suggestions(channels,{},now).actions.filter(x=>x.kind==='backup').length,1);
 assert.equal(doctor.suggestions(channels,{},now+2*86400000).actions.filter(x=>x.kind==='backup').length,0);
});
test('Desktop integration exposes bounded IPC, page, data backup and intact existing controls',()=>{
 assert.equal(pkg.version,'4.23.17');
 const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
 for(const id of ['smartDiscoverySection','smartCountry','smartFind','smartVerify','smartCancel','smartImportAlive','smartImportAll','doctor3Refresh','doctor3Verify','doctor3Undo','doctorVisualScan','backupExportBtn','backupImportBtn','multiGrid','castModal'])assert.ok(html.includes(`id="${id}"`),id);
 const pre=fs.readFileSync(path.join(__dirname,'../src/preload.cjs'),'utf8');
 const main=fs.readFileSync(path.join(__dirname,'../src/main.cjs'),'utf8');
 for(const ipc of ['smart:countries','smart:country','smart:check'])assert.ok(pre.includes(ipc)&&main.includes(ipc));
 const backup=fs.readFileSync(path.join(__dirname,'../src/backup-service.cjs'),'utf8');
 assert.match(backup,/open-iptv-doctor-v3-/);
 const ui=fs.readFileSync(path.join(__dirname,'../renderer/smart-discovery-ui.js'),'utf8');
 assert.match(ui,/collectEnabled=false/);
 assert.match(ui,/\.proof/);
 const doctorUI=fs.readFileSync(path.join(__dirname,'../renderer/doctor-v3.js'),'utf8');
 assert.match(doctorUI,/confirm\(/);
 assert.match(doctorUI,/setAlternates/);
});
