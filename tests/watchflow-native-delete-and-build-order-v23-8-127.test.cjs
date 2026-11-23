'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
const css=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.css','utf8');
const win=fs.readFileSync('.github/workflows/rustlab-windows-exe-on-push.yml','utf8');
const all=fs.readFileSync('.github/workflows/rust-lab-version-tags.yml','utf8').replace(/\r\n/g,'\n');
function chronological(source,items){
 let prev=-1;
 for(const item of items){const index=source.indexOf(item);assert.ok(index>prev,'Missing or out of order: '+item);prev=index;}
}
test('Clicking remove opens an in-panel confirmation, not an unreliable WebView confirm dialog',()=>{
 const native=ui.slice(ui.indexOf("const remove=el('button','wf-model-remove'"),ui.indexOf('const previous=modelSelect.value'));
 assert.match(native,/remove\.addEventListener\('click',\(\)=>/);
 assert.match(native,/wf-delete-confirm/);
 assert.match(native,/wf-delete-question/);
 assert.match(native,/wf-delete-cancel/);
 assert.match(native,/wf-delete-yes/);
 assert.match(native,/confirmation\.hidden=false/);
 assert.match(native,/confirm\.focus\(\)/);
 assert.doesNotMatch(native,/root\.confirm/);
 assert.doesNotMatch(native,/if\(modelOperation\|\|modelRefreshing/);
 assert.match(native,/confirm\.addEventListener\('click',async/);
 assert.match(native,/await native\.aiRemoveModel\(id\)/);
 assert.match(native,/result\?\.freed/);
 assert.match(native,/Không thể xóa/);
 assert.ok(native.indexOf("confirm.addEventListener('click',async")<native.indexOf('await native.aiRemoveModel(id)'));
});
test('Inline delete offers a real cancel path without triggering removal',()=>{
 const native=ui.slice(ui.indexOf("const remove=el('button','wf-model-remove'"),ui.indexOf('const previous=modelSelect.value'));
 const cancel=native.slice(native.indexOf("cancel.addEventListener('click'"),native.indexOf("remove.addEventListener('click'"));
 assert.match(cancel,/hideConfirmation\(\)/);
 assert.match(cancel,/Đã hủy xóa/);
 assert.doesNotMatch(cancel,/aiRemoveModel/);
 assert.match(css,/\.wf-delete-confirm\[hidden\]\{display:none!important\}/);
 assert.match(css,/\.wf-delete-yes/);
 assert.match(css,/:focus-visible/);
});
test('Rust native delete is allowlisted and reports actual freed bytes',()=>{
 const local=fs.readFileSync('src-tauri/src/local_ai.rs','utf8');
 const bridge=fs.readFileSync('src-tauri/src/bridge.rs','utf8');
 assert.match(local,/pub async fn ai_remove_model/);
 assert.match(local,/ai_asset_location\(ai,id\)\?/);
 assert.match(local,/"freed":freed/);
 assert.match(bridge,/"ai:removeModel"=>local_ai::ai_remove_model/);
});
test('Branch Windows workflow strictly builds/validates before NSIS packaging',()=>{
 chronological(win,['Run renderer and app regression tests',
  'Priority 1 — compile Windows x64 app without packaging',
  'Verify compiled Windows x64 application',
  'Priority 2 — package verified Windows x64 binary into NSIS EXE',
  'Upload downloadable Windows EXE']);
 assert.match(win,/npx tauri build --no-bundle --target x86_64-pc-windows-msvc --ci/);
 assert.match(win,/npx tauri bundle --bundles nsis --target x86_64-pc-windows-msvc --ci/);
 assert.match(win,/if-no-files-found: error/);
});
test('Automatic Rust workflows compile verified binaries before DMG and EXE packaging',()=>{
 chronological(all,['Fast renderer regression tests','Priority 1 — compile macOS Universal application',
  'Verify compiled macOS Universal executable',
  'Priority 2 — package verified Universal application into DMG']);
 const windows=all.slice(all.indexOf('\n  windows:\n'));
 chronological(windows,['Fast renderer regression tests','Priority 1 — compile Windows x64 application',
  'Verify compiled Windows application','Priority 2 — package verified x64 application into NSIS EXE']);
 assert.match(all,/npx tauri bundle --target universal-apple-darwin --bundles dmg --ci --no-sign/);
 assert.match(all,/npx tauri bundle --bundles nsis --ci/);
 assert.match(all,/if: false # Branch build artifacts only; main Stable release policy/);
});
