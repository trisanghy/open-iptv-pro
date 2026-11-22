'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const catalog=require('../renderer/watchflow-model-catalog-v23-8-112.js');
const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
const html=fs.readFileSync('renderer/index.html','utf8');
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
test('Standard includes real under-20MB Bayes; 18MB fastText is not installed',()=>{
 assert.equal(catalog.MAX_STANDARD_MB,20);
 assert.equal(catalog.STANDARD.find(x=>x.id==='naive-bayes').active,true);
 assert.equal(catalog.STANDARD.find(x=>x.id==='fasttext-quantized').active,false);
 assert.match(ui,/Naive Bayes nhẹ, tự phân loại toàn bộ kênh và EPG offline/);
});
test('Smart has five described candidates and strict under-200MiB activation policy',()=>{
 assert.equal(catalog.MAX_SMART_MB,200);
 assert.deepEqual(catalog.SMART.map(m=>m.id),['tinybert-4l-int8','mobilebert-int8','multilingual-e5-small-int8','multilingual-minilm-int8','phobert-base-int8']);
 for(const m of catalog.SMART){assert.ok(m.advantage.length>=40);assert.ok(m.note);assert.match(m.size,/MB/);assert.equal(catalog.canActivate(m.id,false,160*1024*1024,true),false);}
 assert.equal(catalog.canActivate('tinybert-4l-int8',true,199*1024*1024,true),true);
 assert.equal(catalog.canActivate('tinybert-4l-int8',true,200*1024*1024,true),false);
 assert.equal(catalog.canActivate('invalid',true,30*1024*1024,true),false);
});
test('User can save Smart preference, not activate an unverified model',()=>{
 const s=storage();assert.equal(catalog.read(s),'tinybert-4l-int8');
 assert.equal(catalog.save(s,'multilingual-e5-small-int8'),true);
 assert.equal(catalog.read(s),'multilingual-e5-small-int8');
 assert.equal(catalog.save(s,'invalid'),false);
 assert.equal(catalog.canActivate('multilingual-e5-small-int8',true,128*1024*1024,false),false);
});
test('Smart UI is wired before preview; Intelligence installer remains separate',()=>{
 assert.ok(html.indexOf('watchflow-model-catalog-v23-8-112.js')<html.indexOf('watchflow-ai-demo-v23-8-102.js'));
 assert.match(ui,/wfSmartModelSelect/);assert.match(ui,/item\.advantage/);
 assert.match(ui,/smartArea\.hidden=mode!=='smart'/);
 assert.match(ui,/modelArea\.hidden=mode!=='intelligence'/);
 assert.match(ui,/chưa kích hoạt mô hình Smart/);
 assert.match(ui,/native\.aiInstallModel\(key\)/);
 assert.doesNotMatch(ui,/installSmartModel|downloadSmartModel/);
});
