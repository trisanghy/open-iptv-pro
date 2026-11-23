'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),catalog=require('../renderer/watchflow-model-catalog-v23-8-112.js');
const s=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
test('All 3 model groups remain visible regardless of selected mode',()=>{
 assert.match(s,/standardArea.hidden=false/);assert.match(s,/smartArea.hidden=false/);assert.match(s,/modelArea.hidden=false/);
 assert.doesNotMatch(s,/smartArea.hidden=mode!==/);assert.doesNotMatch(s,/modelArea.hidden=mode!==/);
 assert.match(s,/wf-model-current/);
});
test('Standard has 2 models and Smart has all 5 with honest availability',()=>{
 assert.equal(catalog.STANDARD.length,2);assert.equal(catalog.STANDARD.filter(x=>x.active).length,1);
 assert.equal(catalog.SMART.length,5);assert.equal(catalog.SMART.filter(x=>x.downloadable).length,2);
 assert.match(s,/So sánh cả 5 mô hình Smart/);assert.match(s,/class="wf-smart-details" open/);
 assert.match(s,/modelInventory=inventory\?\.models\|\|\{\}/);
});
test('No duplicates and preserve native model manager and prerelease',()=>{
 assert.equal((s.match(/data-wf-mode="standard"/g)||[]).length,1);
 assert.equal((s.match(/data-wf-mode="smart"/g)||[]).length,1);
 assert.equal((s.match(/data-wf-mode="intelligence"/g)||[]).length,1);
 assert.match(s,/await smartRuntime.install\(root,id,update\)/);
 assert.match(s,/native.aiInstallModel\(key\)/);
 const wf=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8');
 assert.match(wf,/prerelease: true/);assert.match(wf,/make_latest: false/);
});
