'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Argos uses MINISBD and never calls translate on a missing model object',()=>{
 const py=read('src-tauri/resources/argos_direct_router.py'),rust=read('src-tauri/src/local_ai.rs');
 assert.match(py,/ARGOS_CHUNK_TYPE"\] = "MINISBD"/);
 assert.match(py,/engine is None/);
 assert.match(py,/def smoke\(/);
 assert.match(py,/def fetch_direct\(/);
 assert.match(py,/repair=True/);
 assert.match(rust,/ARGOS_CHUNK_TYPE","MINISBD"/);
 assert.match(rust,/argos_direct_router_v23_8\.py/);
});
test('Model catalog matches Electron eight model IDs, with actual MLX setup and workers',()=>{
 const py=read('src-tauri/resources/hymt_bridge.py'),rust=read('src-tauri/src/local_ai/mlx_ai.rs');
 for(const id of ['hymt18','hymt18q8','hymt7','hymt7q8','qwen06','qwen17','qwen4','qwen8']){
  assert.ok(py.includes('"'+id+'"'),id);
  assert.ok(rust.includes('"'+id+'"'),id);
 }
 assert.match(rust,/cfg!\(all\(target_os="macos", target_arch="aarch64"\)\)/);
 assert.match(rust,/mlx-lm","huggingface-hub"/);
 assert.match(rust,/download_verified/);
 assert.match(rust,/HF_HUB_DISABLE_TELEMETRY/);
 assert.match(rust,/write_bridge\(/);
 assert.match(rust,/output_timeout/);
 assert.match(rust,/fn has_weights\(/);
 assert.match(rust,/async fn translate\(/);
});
test('Rust bridge and model settings connect real backends and manage model files',()=>{
 const local=read('src-tauri/src/local_ai.rs'),bridge=read('src-tauri/src/bridge.rs'),shim=read('renderer/tauri-bridge.js');
 const ui=read('renderer/rust-ai-settings-v23-6.js'),caption=read('renderer/live-captions-v42343.js');
 for(const method of ['mlx_status','mlx_install','ai_test_translation','mlx_ai::translate','mlx_ai::select_auto'])assert.ok(local.includes(method));
 for(const command of ['ai:modelStatus','ai:installModel','ai:storage','ai:removeModel'])assert.ok(bridge.includes('"'+command+'"'));
 for(const symbol of ['aiModelStatus','aiInstallModel','aiOnEvent'])assert.ok(shim.includes(symbol));
 for(const symbol of ['hymt18','hymt7','qwen06','qwen17','qwen4','qwen8','mode.addEventListener','api.aiInstallModel(id)','mlxAvailable'])assert.ok(ui.includes(symbol));
 assert.match(caption,/resourceMode:window\.AISettings/);
 assert.match(caption,/engine:window\.AISettings/);
 assert.match(caption,/captionTestTranslation\(target\.value,engine/);
 assert.doesNotMatch(caption,/engine:'argos'/);
});
test('Only local Mac produces app and CI continues DMG + source ZIP',()=>{
 const pkg=JSON.parse(read('package.json')),builder=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 const ci=read('.github/workflows/rust-lab-version-tags.yml');
 assert.match(pkg.version,/^4\.23\.17-tauri\.\d+(?:\.\d+)*$/);
 assert.ok(builder.includes('TAG="rust-lab/v'+pkg.version.split('-tauri.')[1]+'"'));
 assert.match(builder,/npm run build -- --bundles app/);
 assert.doesNotMatch(builder,/cp "\$TMP\/source\.zip" "\$DEST/);
 assert.match(ci,/--target universal-apple-darwin --bundles dmg/);
 assert.match(ci,/dist\/\*Source\.zip/);
});
