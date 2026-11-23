'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const catalog=require('../renderer/watchflow-model-catalog-v23-8-112.js');
const smart=require('../renderer/watchflow-smart-runtime-v23-8-126.js');
const autoload=require('../renderer/watchflow-smart-auto-v23-8-126.js');
test('Standard is already packaged; 18MB fastText remains accurately unavailable',()=>{
 assert.deepEqual(catalog.STANDARD.map(m=>m.id),['naive-bayes','fasttext-quantized']);
 assert.equal(catalog.STANDARD[0].active,true);
 assert.equal(catalog.STANDARD[1].active,false);
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 assert.match(ui,/id="wfStandardModels"/);
 assert.match(ui,/id="wfStandardInstalled"/);
 assert.match(ui,/Naive Bayes \(đang dùng\)/);
 assert.match(ui,/fastText Quantized ~18 MB/);
 assert.match(ui,/Chưa khả dụng/);
});
test('Exactly two genuine multilingual quantized Smart models have verified Hub sources',()=>{
 assert.equal(catalog.SMART.length,5);
 const verified=catalog.SMART.filter(m=>m.downloadable);
 assert.deepEqual(verified.map(m=>m.id),['multilingual-e5-small-int8','multilingual-minilm-int8']);
 assert.deepEqual(verified.map(m=>m.modelRepo),[
  'Xenova/multilingual-e5-small','Xenova/paraphrase-multilingual-MiniLM-L12-v2'
 ]);
 assert.ok(verified.every(m=>m.bytes>100_000_000&&m.bytes<200*1024*1024));
 assert.ok(catalog.SMART.filter(m=>!m.downloadable).every(m=>!smart.supported(m.id)));
 assert.ok(catalog.canActivate(verified[0].id,true,118_000_000,true));
 assert.equal(catalog.canActivate('tinybert-4l-int8',true,118_000_000,true),false);
});
test('Smart weight caching is separate from playlists and unverified models cannot be loaded',async()=>{
 assert.equal(smart.cacheName('multilingual-e5-small-int8'),'openiptv-watchflow-smart-multilingual-e5-small-int8');
 assert.equal(smart.supported('phobert-base-int8'),null);
 const storage={indexedDB:null,caches:{open:async()=>({keys:async()=>[]}),has:async()=>false}};
 assert.equal(await smart.installed(storage,'multilingual-e5-small-int8'),false);
 await assert.rejects(smart.install(storage,'tinybert-4l-int8'),/Chỉ E5 Small/);
 assert.equal(smart.cacheName('../unsafe'),'openiptv-watchflow-smart-unsafe'); // sanitizes the key
});
test('Similarity uses normalized vector scores and preserves on-device classification',()=>{
 assert.ok(Math.abs(smart.cosine([1,0],[1,0])-1)<0.00001);
 assert.ok(Math.abs(smart.cosine([1,0],[0,1]))<0.00001);
 assert.ok(smart.cosine([1,1],[1,0])>0);
 assert.equal(Object.keys(smart.descriptions).length,17);
});
test('Download and delete controls invoke real local model operations only after user action',()=>{
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 const auto=fs.readFileSync('renderer/watchflow-smart-auto-v23-8-126.js','utf8');
 const browser=fs.readFileSync('renderer/watchflow-smart-runtime-v23-8-126.js','utf8');
 assert.match(ui,/id="wfSmartInstall"/);
 assert.match(ui,/id="wfSmartRemove"/);
 assert.match(ui,/smartInstall\.addEventListener\('click',async/);
 assert.match(ui,/smartRemove\.addEventListener\('click',\(\)=>/);
 assert.match(ui,/smartDeleteYes\.addEventListener\('click',async/);
 assert.match(ui,/await smartRuntime\.install\(root,id,update\)/);
 assert.match(ui,/await smartRuntime\.remove\(root,id\)/);
 assert.doesNotMatch(ui,/root\.confirm\?\.\('Tải '/);
 assert.doesNotMatch(ui,/root\.confirm\?\.\('Xóa '\+model\.label/);
 assert.match(ui,/id="wfSmartDeleteConfirm"/);
 assert.match(ui,/id="wfStandardStatus"/);
 assert.match(auto,/setNativeTopics/);
 assert.match(auto,/setSmartProgrammeLabels/);
 assert.match(auto,/smart-results:/);
 assert.match(browser,/pipeline\('feature-extraction'/);
 assert.match(browser,/device:'wasm',dtype:'q8'/);
 assert.match(browser,/useCustomCache=true/);
 assert.doesNotMatch(browser,/ai:installModel/);
});
test('Bundled Transformers.js vendor files are pinned and loaded from local app resources',()=>{
 const html=fs.readFileSync('renderer/index.html','utf8');
 const prepare=fs.readFileSync('scripts/prepare-renderer.cjs','utf8');
 const entry='watchflow-smart-runtime-v23-8-126.js';
 assert.ok(html.indexOf('watchflow-model-catalog-v23-8-112.js')<html.indexOf(entry));
 assert.ok(html.indexOf(entry)<html.indexOf('watchflow-ai-demo-v23-8-102.js'));
 assert.ok(html.indexOf('watchflow-ai-demo-v23-8-102.js')<html.indexOf('watchflow-smart-auto-v23-8-126.js'));
 assert.match(prepare,/@huggingface\/transformers@3\.8\.1/);
 assert.match(prepare,/ort-wasm-simd-threaded\.jsep\.wasm/);
 assert.match(prepare,/transformers\.min\.js/);
 assert.match(fs.readFileSync('renderer/watchflow-smart-runtime-v23-8-126.js','utf8'),/import\('\.\/vendor\/transformers\.min\.js'\)/);
});
