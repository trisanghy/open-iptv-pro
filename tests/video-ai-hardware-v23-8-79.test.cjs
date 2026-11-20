'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const core=require('../renderer/video-enhancement-v23-8-70.js');
const native=read('src-tauri/src/video_enhance.rs');
const app=read('renderer/app.js');
const ui=read('renderer/video-enhancement-v23-8-70.js');
test('native AI capability probes macOS 26 VideoToolbox hardware instead of guessing from model name',()=>{
 assert.match(native,/VTLowLatencySuperResolutionScalerConfiguration/);
 assert.match(native,/objc_getClass/);
 assert.match(native,/isSupported/);
 assert.match(native,/fn ai_capabilities\(\)->Value/);
 assert.match(native,/"livePipelineImplemented":false/);
 assert.match(native,/"aiBenchmarkAvailable":false/);
 assert.match(read('src-tauri/src/bridge.rs'),/"video:aiCapabilities"=>Ok\(video_enhance::ai_capabilities\(\)\)/);
 assert.match(read('renderer/tauri-bridge.js'),/videoAiCapabilities: 'video:aiCapabilities'/);
});
test('native support never silently enables AI inference or downloads models',()=>{
 assert.match(ui,/veh-ai-probe/);
 assert.match(ui,/videoAiCapabilities/);
 assert.match(ui,/chưa nối AI lên luồng phát/);
 assert.doesNotMatch(ui,/fetch\(.+\.onnx/);
 assert.equal(core.defaults.upscale,false);
 assert.doesNotThrow(()=>new Function(ui));
});
test('motion auto-protection needs sustained high dropped-frame proportion',()=>{
 assert.equal(core.severeDrop(44,44),false);
 assert.equal(core.severeDrop(100,10),false);
 assert.equal(core.severeDrop(100,25),true);
 assert.equal(core.severeDrop(80,20),true);
 assert.equal(core.severeDrop(80,-10),false);
 assert.match(app,/motionGuardTimer=setInterval/);
 assert.match(app,/if\(bad>=2\)/);
 assert.match(app,/recoverPlayback\(generation,'Nội suy quá tải: rớt nhiều khung hình'/);
 assert.match(app,/if\(motionEnhanced\)startMotionGuard\(playGeneration\)/);
 assert.match(app,/function disposeActiveMedia\(\)\{\s*stopMotionGuard\(\)/);
});
test('720p resolution cap is now 1280x720 rather than misleading 720x406',()=>{
 assert.match(native,/scale=w=min\(1280/);
 assert.match(native,/h=min\(720/);
 assert.doesNotMatch(native,/scale=w=min\(720/);
});
