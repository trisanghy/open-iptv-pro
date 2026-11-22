'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
const css=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.css','utf8');
test('Standard routes Naive Bayes EPG analysis, independent of Smart',()=>{
 assert.match(ui,/Standard: phân loại bằng Naive Bayes/);
 assert.match(ui,/const category=c=>analysis\.has\(String\(c\.id\)\)/);
 assert.match(ui,/Dưới 1 MB · tích hợp sẵn/);
});
test('Smart is fastText ~18MB and never pretends Bayes is fastText',()=>{
 assert.match(ui,/fastText · Mô hình chủ đề đã huấn luyện/);
 assert.match(ui,/≈18 MB · Chưa tích hợp/);
 assert.match(ui,/fastText ≈18 MB chưa được cài/);
 assert.match(ui,/bảng này vẫn là kết quả Naive Bayes của Standard/);
});
test('Intelligence native inventory is reused, and new model installs need an explicit click',()=>{
 assert.match(ui,/native\.aiStorageStatus\(\)/);
 assert.match(ui,/modelInventory=inventory\?\.models\|\|\{\}/);
 assert.match(ui,/modelInventory\[id\]\?\.installed/);
 assert.match(ui,/installButton\.addEventListener\('click',async/);
 assert.match(ui,/native\.aiInstallModel\(key\)/);
 assert.match(ui,/selectionKey='watchflow:intelligence-model-v1'/);
 assert.match(ui,/không tải/);
 assert.match(css,/wf-model-picker\[hidden\]/);
});
test('Existing release workflows are strictly prerelease',()=>{
 const release=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8');
 const win=fs.readFileSync('.github/workflows/rustlab-windows-exe-on-push.yml','utf8');
 assert.match(release,/prerelease: true/);assert.match(release,/make_latest: false/);
 assert.match(win,/--prerelease --latest=false/);
});
