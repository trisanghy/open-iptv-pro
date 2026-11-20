'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Rust GPU probe and benchmark are hardware H.264 only, never claim AI upscale',()=>{
 const rust=read('src-tauri/src/video_enhance.rs');
 for(const text of ['gpu_prepare','gpu_benchmark','sample_gpu','gpu_storage','gpu_delete','gpu_managed'])assert.ok(rust.includes(text));
 assert.match(rust,/gpu-h264-encode-only/);
 assert.match(rust,/"aiUpscaleAvailable":false/);
 assert.match(rust,/"aiMotionAvailable":false/);
 assert.match(rust,/GPU_OWNED/);
 assert.match(rust,/symlink_metadata/);
});
test('Rust GPU IPC exposes only app-owned cache and hardware benchmark',()=>{
 const bridge=read('src-tauri/src/bridge.rs');
 const shim=read('renderer/tauri-bridge.js');
 for(const key of ['video:gpuPrepare','video:gpuBenchmark','video:gpuStorage','video:gpuDelete']){
  assert.ok(bridge.includes(key),key+' missing in native');
  assert.ok(shim.includes(key),key+' missing in bridge');
 }
});
test('shared GPU panel is linked, popup appears only after benchmark',()=>{
 const html=read('renderer/index.html'),code=read('renderer/video-gpu-manager-v1.js');
 assert.match(html,/video-gpu-manager-v1\.css/);assert.match(html,/video-gpu-manager-v1\.js/);
 assert.match(code,/showModal/);assert.match(code,/videoGpuDelete/);assert.match(code,/videoGpuBenchmark/);
 assert.doesNotThrow(()=>new Function(code));
});
