'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const catalog=require('../renderer/watchflow-model-catalog-v23-8-112.js');
const standard=require('../renderer/watchflow-intelligence-v23-8-105.js');
const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
function installer(){
 const marker="smartInstall.addEventListener('click',async()=>{";
 const start=ui.indexOf(marker);assert.ok(start>0);
 const end=ui.indexOf('\n  });',start+marker.length);
 assert.ok(end>start);
 const body=ui.slice(start+marker.length,end);
 return new Function('smartSelect','modelCatalog','smartRuntime','smartProgress',
  'smartInstall','smartRemove','smartBusy','doc','root','refreshSmartUI','Event',
  'return async()=>{'+body+'}');
}
test('Smart download click calls the actual installer without WebView confirmation',async()=>{
 const called=[],events=[],id='multilingual-minilm-int8';
 const progress={textContent:''},button={disabled:false,textContent:''},remove={disabled:false};
 const runtime={install:async (_root,model,onProgress)=>{
  called.push(model);onProgress({status:'progress',progress:42.5});return{installed:true,model};
 }};
 const root={confirm:()=>{throw Error('confirm is unsupported in the WebView');}};
 const click=installer()({value:id},catalog,runtime,progress,button,remove,false,
  {dispatchEvent:e=>events.push(e.type)},root,async()=>{},
  class Event{constructor(type){this.type=type;}});
 await click();
 assert.deepEqual(called,[id]);
 assert.match(progress.textContent,/Đã tải và chạy thử thành công/);
 assert.deepEqual(events,['openiptv:watchflow-smart-installed']);
});
test('A failed model download reports a visible error instead of doing nothing',async()=>{
 const progress={textContent:''},button={disabled:false,textContent:''},remove={disabled:false};
 const click=installer()({value:'multilingual-e5-small-int8'},catalog,
  {install:async()=>{throw Error('ONNX WASM HTTP 403');}},progress,button,remove,false,
  {dispatchEvent:()=>{}},{confirm:()=>false},async()=>{},class Event{});
 await click();
 assert.match(progress.textContent,/Tải\/kiểm tra thất bại/);
 assert.match(progress.textContent,/403/);
});
test('Unavailable loaders and unverified model weights show actionable errors',async()=>{
 const progress={textContent:''},button={disabled:false},remove={disabled:false};
 let click=installer()({value:'multilingual-minilm-int8'},catalog,null,
  progress,button,remove,false,{dispatchEvent:()=>{}},{},async()=>{},class Event{});
 await click();assert.match(progress.textContent,/Thiếu bộ tải ONNX/);
 click=installer()({value:'tinybert-4l-int8'},catalog,{install:()=>{}},
  progress,button,remove,false,{dispatchEvent:()=>{}},{},async()=>{},class Event{});
 await click();assert.match(progress.textContent,/chưa có bộ chạy ONNX/);
});
test('Standard is already installed, can be tested and has no fake fastText download',()=>{
 assert.equal(catalog.STANDARD[0].active,true);
 assert.equal(catalog.STANDARD[1].active,false);
 const prediction=standard.predict('Trực tiếp bóng đá đội tuyển giải vô địch');
 assert.equal(prediction.label,'Thể thao');
 assert.ok(prediction.confidence>0);
 assert.ok(ui.includes("$('wfStandardInstalled').addEventListener('click'"));
 assert.ok(ui.includes('id="wfStandardStatus"'));
 assert.ok(ui.includes('id="wfStandardInstalled" type="button">▶ Kiểm tra'));
 assert.ok(!ui.includes("root.confirm?.('Tải '"));
 assert.ok(ui.includes('id="wfSmartDeleteConfirm"'));
});
test('Model verification accepts different ONNX filenames',()=>{
 const runtime=fs.readFileSync('renderer/watchflow-smart-runtime-v23-8-126.js','utf8');
 assert.ok(runtime.includes('model_q8'));
 assert.ok(runtime.includes('request?.url'));
});
