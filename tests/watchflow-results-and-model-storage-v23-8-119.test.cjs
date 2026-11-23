'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const rec=require('../renderer/watchflow-recommendations-v23-8-119.js');
const src=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
const css=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.css','utf8');
const html=fs.readFileSync('renderer/index.html','utf8');
const native=fs.readFileSync('renderer/tauri-bridge.js','utf8');
const now=Date.UTC(2026,10,23,12,0);
const channels=[{id:'n',name:'Tin tức TV'},{id:'s',name:'Bóng đá TV'},{id:'f',name:'Ẩm thực TV'}];
const analysis=new Map([
 ['n',{label:'Tin tức',labels:['Tin tức'],programmes:[{start:now-3600000,end:now+3600000,title:'Thời sự 12h',labels:['Tin tức']}]}],
 ['s',{label:'Thể thao',labels:['Thể thao'],programmes:[{start:now+600000,end:now+4200000,title:'Trận bóng đá',labels:['Thể thao']}]}],
 ['f',{label:'Ẩm thực',labels:['Ẩm thực'],programmes:[{start:now+1800000,end:now+5400000,title:'Món ngon ẩm thực',labels:['Ẩm thực']}]}]
]);
test('Recommendations focus on preferences and EPG, not arbitrary channel order',()=>{
 const learned={seconds:{'Ẩm thực':110,'Tin tức':5},hours:{12:{'Ẩm thực':75}}};
 const ranked=rec.channels(channels,analysis,learned,[],null,now,3);
 assert.equal(ranked[0].channel.id,'f');
 assert.match(ranked[0].reason,/Ẩm thực/);
 assert.equal(new Set(ranked.map(r=>r.channel.id)).size,3);
 const programmes=rec.programmes(analysis,channels,learned,[],now,3);
 assert.equal(programmes[0].channel.id,'f');
 assert.equal(programmes.length,3);
 assert.ok(programmes.some(p=>p.live&&p.programme.title==='Thời sự 12h'));
});
test('No EPG means no invented show recommendation; expired and far-future programmes stay out',()=>{
 assert.deepEqual(rec.programmes(new Map(),channels,{},[],now,9),[]);
 const gone=new Map([['n',{programmes:[{title:'Đã hết',start:now-1000,end:now-10,labels:['Tin tức']},
  {title:'Tuần tới',start:now+50*3600000,end:now+51*3600000,labels:['Tin tức']}]}]]);
 assert.deepEqual(rec.programmes(gone,channels,{},[],now,9),[]);
});
test('WatchFlow starts with results, only four useful tabs and a compact advanced model manager',()=>{
 assert.match(src,/let mode='standard',tab='suggest'/);
 assert.equal((src.match(/data-wf-tab="/g)||[]).length,4);
 assert.ok(src.indexOf('id="wfSettings"')<src.indexOf('class="wf-tabs"'));
 assert.ok(src.indexOf('class="wf-tabs"')<src.indexOf('id="wfContents"'));
 assert.match(src,/recommender\?\.channels/);
 assert.match(src,/recommender\?\.programmes/);
 assert.match(src,/Chương trình phù hợp hôm nay/);
 assert.match(src,/wf-model-remove/);
 assert.match(css,/\.wf-settings/);
 assert.ok(html.indexOf('watchflow-recommendations-v23-8-119.js')<html.indexOf('watchflow-ai-demo-v23-8-102.js'));
});
test('Native installs and removals require user clicks/confirmation; storage shows actual byte sizes',()=>{
 assert.match(native,/aiStorageStatus: 'ai:storage'/);
 assert.match(native,/aiRemoveModel: 'ai:removeModel'/);
 assert.match(native,/aiInstallModel: 'ai:installModel'/);
 assert.match(src,/await native\.aiStorageStatus\(\)/);
 assert.match(src,/await native\.aiRemoveModel\(id\)/);
 assert.match(src,/await native\.aiInstallModel\(key\)/);
 assert.match(src,/confirm\.addEventListener\('click',async/);
 assert.match(src,/id="wfSmartDeleteConfirm"/);
 assert.match(src,/storageTotal\.textContent=human\(inventory\?\.totalBytes\|\|0\)/);
 assert.match(src,/modelOperation/);
 assert.doesNotMatch(src,/wfModelRefresh/);
});
test('Standard remains operational; Smart catalog is not falsely advertised as installed',()=>{
 assert.match(src,/Dưới 20 MB · Naive Bayes đang chạy/);
 assert.match(src,/Smart · tự chuẩn bị/);
 assert.match(src,/chưa kích hoạt mô hình Smart/);
 assert.match(src,/Hy-MT2 chuyên dịch/);
});
