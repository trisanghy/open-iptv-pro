'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
const css=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.css','utf8');
test('Standard routes Naive Bayes EPG analysis, independent of Smart',()=>{
 assert.match(ui,/Naive Bayes nhẹ, tự phân loại toàn bộ kênh và EPG offline/);
 assert.match(ui,/const category=c=>analysis\.has\(String\(c\.id\)\)/);
 assert.match(ui,/Dưới 20 MB · Naive Bayes đang chạy/);
});
test('Smart offers a selector and honest installed/available ONNX status',()=>{
 assert.match(ui,/Dưới 200 MB · tự chọn mô hình/);
 assert.match(ui,/wfSmartModelSelect/);
 assert.match(ui,/modelCatalog\.save\(root\.localStorage,smartChoice\)/);
 assert.match(ui,/Smart bổ sung chủ đề từ mô hình ONNX đã tải/);
 assert.match(ui,/await smartRuntime.install\(root,id,update\)/);
 assert.match(ui,/Chưa có trọng số\/bộ chạy được xác minh/);
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
 assert.match(win,/actions\/upload-artifact@v4/);assert.doesNotMatch(win,/gh release create/);
});
