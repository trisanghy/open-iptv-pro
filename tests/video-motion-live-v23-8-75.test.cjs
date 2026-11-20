'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const app=read('renderer/app.js'),ui=read('renderer/video-enhancement-v23-8-70.js'),bridge=read('src-tauri/src/bridge.rs'),api=read('renderer/tauri-bridge.js');
const rust=read('src-tauri/src/video_enhance.rs'),compat=read('src-tauri/src/compat.rs');
const core=require('../renderer/video-enhancement-v23-8-70.js');
test('Opt-in motion uses original player and reuses authenticated compat HLS',()=>{
 assert.match(app,/window\.streamleaf\.videoEnhanceStart\(original,\{motion:true,fps:profile\.fps\}\)/);
 assert.match(app,/await tryPlayback\(session\.url,generation,\{compat:true\}\)/);
 assert.match(app,/if\(motionEnhanced\)/);
 assert.match(app,/await window\.streamleaf\?\.compatStop\?\.\(\)\.catch/);
 assert.match(compat,/start_enhanced\(state: &Arc<AppState>/);
 assert.match(compat,/start_with_motion\(state,raw,Some\(fps\)\)/);
 assert.match(api,/videoEnhanceStart: 'video:enhancementStart'/);
 assert.match(bridge,/"video:enhancementStart"=>compat::start_enhanced/);
});
test('Process filter is constrained to 60/90/120 and synthetic benchmark measures 720p output',()=>{
 assert.match(rust,/60\|90\|120/);
 assert.match(rust,/scale=w=min\(1280/);
 assert.match(rust,/minterpolate=fps=\{fps\}/);
 assert.match(rust,/testsrc2=size=1280x720:rate=30:duration=1\.5/);
 assert.match(rust,/aiUpscaleAvailable":false/);
 assert.match(compat,/aiUpscaleActive":false/);
 assert.match(compat,/filter_threads/);
});
test('AI preferences save but are not misrepresented as working neural upscaler',()=>{
 assert.doesNotThrow(()=>new Function(ui));
 assert.match(ui,/veh-apply/);
 assert.match(ui,/AI.*chưa hoạt động/);
 assert.match(ui,/state\.playChannel\(current\.id\)/);
 assert.match(ui,/setPlaybackState/);
 assert.equal(core.defaults.motion,false);
 assert.equal(core.defaults.upscale,false);
 assert.equal(core.recommend({motion:[{targetFps:60,ok:true,processingFps:90}]}),60);
});
test('Playback remains restricted to LIVE and switches back on failure',()=>{
 assert.match(app,/playMode==='live' && !override && !opts\.buffer/);
 assert.match(app,/if\(generation!==playGeneration\|\|selection!==selectionSerial\)return/);
 assert.match(app,/if\(motionEnhanced\)\{/);
 assert.match(app,/khôi phục video gốc sau lỗi bù chuyển động/);
 assert.match(app,/motionEnhanced=false;compatSource='';compatAttempted=false/);
});
