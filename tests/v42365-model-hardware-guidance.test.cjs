'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const advice=require('../renderer/ai-hardware-advice-v42365.js');
const {ITEMS}=require('../src/local-ai-storage.cjs');
const {MODELS}=require('../src/hymt-service.cjs');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
test('v4.23.67: every AI storage entry has a visible hardware hint or a maintenance explanation',()=>{
 for(const id of Object.keys(ITEMS)){
  const result=advice.forModel(id,{platform:'darwin',arch:'arm64',ramGB:16});
  assert.ok(result,'missing '+id);
  assert.ok(result.summary.length>12,id);
  assert.ok(result.detail.length>12,id);
 }
 assert.equal(advice.forModel('nonexistent'),null);
 assert.equal(Object.keys(MODELS).length,8);
});
test('v4.23.67: MLX models are Mac Apple Silicon only; low-RAM hint does not falsely claim impossible',()=>{
 const low=advice.forModel('qwen8',{platform:'darwin',arch:'arm64',ramGB:8});
 assert.equal(low.recommendedRAM,24);
 assert.match(low.fit,/RAM máy thấp hơn mức gợi ý/);
 const enough=advice.forModel('qwen8',{platform:'darwin',arch:'arm64',ramGB:32});
 assert.match(enough.fit,/RAM máy đạt mức gợi ý/);
 const intel=advice.forModel('qwen06',{platform:'darwin',arch:'x64',ramGB:32});
 assert.match(intel.fit,/Không hỗ trợ MLX/);
 const windows=advice.forModel('hymt18',{platform:'win32',arch:'x64',ramGB:32});
 assert.match(windows.fit,/Không hỗ trợ MLX/);
 assert.match(advice.forModel('piper',{platform:'win32',arch:'x64',ramGB:4}).summary,/CPU/);
});
test('v4.23.67: F5 licensing and voice-clone input are called out, no false numbers for cache',()=>{
 const f5=advice.forModel('f5vi',{platform:'darwin',arch:'arm64',ramGB:16});
 assert.match(f5.detail,/phi thương mại/);
 assert.ok(advice.forModel('f5sample').summary.includes('WAV'));
 for(const key of ['cache','runtimes','f5sample'])assert.equal(advice.forModel(key).kind,'aux');
 assert.match(advice.hardwareLabel({platform:'darwin',arch:'arm64',ramGB:16}),/Apple Silicon · 16 GB RAM/);
 assert.match(advice.hardwareLabel({}),/Chưa xác định/);
});
test('v4.23.67: UI shows CPU/GPU, RAM, disk and actual machine info using the secured native status',()=>{
 const main=read('src/main.cjs'),ui=read('renderer/unified-ai-settings-v42356.js');
 const html=read('renderer/index.html');
 assert.match(main,/hardware:\{platform:process\.platform,arch:process\.arch,ramGB:/);
 assert.match(ui,/hardwareAdvice\?\.forModel\(id,latest\?\.hardware/);
 assert.match(ui,/Gợi ý cấu hình:/);
 assert.match(ui,/ai-model-hardware/);
 assert.match(html,/ai-hardware-advice-v42365\.js/);
 assert.match(html,/ai-hardware-advice-v42365\.css/);
 assert.ok(html.indexOf('ai-hardware-advice-v42365.js')<html.indexOf('unified-ai-settings-v42356.js'));
 assert.equal(require('../package.json').version,'4.23.71');
});
test('v4.23.67: personal build still produces only native app, opens Finder and cleans source',()=>{
 const s=read('build-mac-v42366.sh');
 assert.match(s,/--dir/);
 assert.match(s,/open "\$OUT"/);
 assert.match(s,/rm -rf "\$TMP"/);
 assert.doesNotMatch(s,/electron-builder --mac dmg/);
});
