'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {alternatives,catchup,diagnostics,seekRange,healthLine,epgSearch}=require('../renderer/advanced-core.js');
test('Auto Failover yields distinct validated URLs in preferred order',()=>{
 const a={id:'a',name:'VTV 1 HD',url:'https://cdn-a.test/live.m3u8'},b={id:'b',name:'VTV1',url:'https://cdn-b.test/live.m3u8'};
 assert.deepEqual(alternatives(a,[a,b],{a:['https://backup.test/vtv1.m3u8','ftp://unsupported.test','https://backup.test/vtv1.m3u8']}),['https://cdn-a.test/live.m3u8','https://backup.test/vtv1.m3u8','https://cdn-b.test/live.m3u8']);
});
test('Catch-up only uses explicitly configured source template',()=>{
 assert.equal(catchup({catchupSource:'https://example.org/replay?start={start}&duration={duration}'},{start:100000,end:160000}), 'https://example.org/replay?start=100&duration=60');
 assert.equal(catchup({catchupSource:''},{start:100000,end:160000}),null);
 assert.equal(catchup({catchupSource:'file:///etc/passwd'},{start:100000,end:160000}),null);
});
test('Doctor enumerates duplicates and missing metadata without editing channels',()=>{
 const input=[{name:'A',url:'https://a.test',status:'alive'},{name:'B',url:'https://a.test',tvgId:'b',logo:'https://logo.test',status:'dead'}];
 const before=JSON.stringify(input),report=diagnostics(input,1);
 assert.equal(report.duplicateUrls,1);assert.equal(report.missingEpgId,1);assert.equal(report.dead,1);assert.equal(JSON.stringify(input),before);
});
test('Seek window respects last 5 minutes and does not claim data outside buffer',()=>{
 const r=seekRange({seekable:{length:1,start:()=>0,end:()=>500}},300);assert.deepEqual(r,{start:200,end:500,available:300});
 assert.equal(seekRange({seekable:{length:0}}),null);
});
test('EPG search and health summaries',()=>{
 assert.equal(epgSearch({programmes:[{title:'Thời sự 19h',description:'Tin tức'},{title:'Phim truyện'}]},'thoi su').length,1);
 assert.equal(healthLine([{status:'alive'},{status:'dead'}]).uptime,50);
});

test('M3U catch-up fields are read and preserved in exported playlist',()=>{
 const {parseM3U,exportM3U}=require('../src/core.cjs');
 const source='#EXTM3U\n#EXTINF:-1 tvg-id="VTV1.vn" catchup="default" catchup-days="2" catchup-source="https://catchup.example.org/play?start={start}&duration={duration}" group-title="VTV",VTV1\nhttps://live.example.org/1.m3u8\n';
 const list=parseM3U(source);assert.equal(list[0].catchup,'default');assert.equal(list[0].catchupDays,'2');assert.match(exportM3U(list),/catchup-source="https:\/\/catchup.example.org/);
});
test('EPG manual mapping overrides channel-name mismatch and applies time correction',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),script=fs.readFileSync(require('node:path').join(__dirname,'../renderer/epg.js'),'utf8');
 const env={window:{}};vm.runInNewContext(script,env);const guide={names:{other:'x'},programmes:[{id:'channel.abc',start:100000,end:200000,title:'Phim thử'}],manualMappings:{'ch-1':'channel.abc'},offsetMinutes:60};
 const out=env.window.IPTVGuide.find(guide,{id:'ch-1',name:'VTV1'});assert.equal(out.length,1);assert.equal(out[0].start,100000+3600000);
});
