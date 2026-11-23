'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const engine=require('../renderer/watchflow-intelligence-v23-8-105.js');
test('Full local scan covers >2500 channels and all programme entries without a click',async()=>{
 const channels=Array.from({length:2701},(_,i)=>({id:'ch'+i,name:'Kênh '+i,group:'Tổng hợp'}));
 const clock=Date.UTC(2026,10,23,14),rows=Array.from({length:29},(_,i)=>({
  title:i%2?'Trực tiếp bóng đá thể thao':'Tin tức thời sự',description:'Chương trình truyền hình',
  start:clock+(i-12)*3600000,end:clock+(i-11)*3600000
 }));
 const guide={programmes:rows},lib={find:()=>rows};let yields=0;
 const result=await auto.scanLocal({channels,guide,guideLib:lib,engine,clock,batchSize:35,
  yieldNow:async()=>{yields++;}});
 assert.equal(result.cancelled,false);assert.equal(result.total,2701);
 assert.equal(result.processed,2701);assert.equal(result.analysis.size,2701);
 assert.equal(result.epgChannels,2701);assert.equal(result.epgProgrammes,2701*29);
 assert.equal(result.guideProgrammes,29);assert.ok(yields>=70,'must yield between batches');
 assert.equal(result.analysis.get('ch2700').epgCount,29);
 assert.equal(result.analysis.get('ch2700').epgMatched,true);
});
test('Local scan works even with no internet, EPG or Smart model weights',async()=>{
 const channels=[{id:'one',name:'VTV1',group:'Tin tức'}];
 const r=await auto.scanLocal({channels,engine,guide:null,guideLib:null,yieldNow:async()=>{}});
 assert.equal(r.processed,1);assert.equal(r.epgProgrammes,0);assert.equal(r.epgChannels,0);
 assert.equal(r.analysis.get('one').from,'Tên/nhóm');
});
test('Obsolete scan cancels before it can overwrite later data',async()=>{
 let stop=false,batches=0;const channels=Array.from({length:110},(_,i)=>({id:'x'+i,name:'Kênh '+i}));
 const r=await auto.scanLocal({channels,engine,guide:null,guideLib:null,batchSize:10,
  yieldNow:async()=>{if(++batches>=2)stop=true;},shouldStop:()=>stop});
 assert.equal(r.cancelled,true);assert.ok(r.processed<channels.length);
});
test('Automatic startup and EPG event rescan are independent of web lookup toggle and panel',()=>{
 const source=fs.readFileSync('renderer/watchflow-auto-discovery-v23-8-106.js','utf8');
 assert.match(source,/win\.setTimeout\(inspect,200\)/);
 assert.match(source,/win\.setInterval\(inspect,3000\)/);
 assert.match(source,/watchflow-epg-changed/);
 assert.match(source,/void runLocal\(list,epg,\{force\}\)/);
 assert.match(source,/if\(webBusy\|\|!enabled\(win\.localStorage\)\)return/);
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 assert.match(ui,/auto\?\.start\(root,engine\)/);
 assert.match(ui,/wfLocalScanProgress/);
 assert.doesNotMatch(ui,/id="wfRefresh"/);
 const epg=fs.readFileSync('renderer/features.js','utf8');
 assert.match(epg,/notifyWatchFlow\(\)/);
 assert.match(epg,/autoLoadWhenReady/);
});
test('Playlist fingerprint changes on rename/mapping, not stream URL',()=>{
 const a=[{id:'1',name:'Channel One',group:'News',tvgId:'foo',url:'https://secret.test/a'}];
 const b=[{...a[0],url:'https://secret.test/b'}];
 const c=[{...a[0],name:'Channel Two'}];
 assert.equal(auto.fingerprint(a),auto.fingerprint(b));
 assert.notEqual(auto.fingerprint(a),auto.fingerprint(c));
});
