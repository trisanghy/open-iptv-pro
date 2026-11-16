'use strict';
// Electron v4.23.45 feature parity regression for isolated Rust Lab v20.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('renderer/index.html'),bridge=read('src-tauri/src/bridge.rs'),native=read('src-tauri/src/local_ai.rs'),entry=read('renderer/app-entry.js'),shim=read('renderer/tauri-bridge.js'),lib=read('src-tauri/src/lib.rs');
test('AI toolbar adds one full row without reparenting v19.2 controls',()=>{
 for(const id of ['liveCaptionToggle','liveTranslateToggle','liveTtsToggle','liveTtsLanguage','liveTtsDuck','liveTtsInstall','liveCaptionSetup','captionAutoInstall','captionChooseBinary','captionChooseModel','liveCaptionOutput']){
   assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 assert.ok(html.indexOf('class="ipvp-second-row"')<html.indexOf('id="captionThirdRow"'));
 assert.ok(html.indexOf('id="captionThirdRow"')<html.indexOf('id="videoSeekWrap"'));
 for(const id of ['playingTitle','playBtn','stopBtn','prevBtn','nextBtn','videoFit','manualLinkSelect','favCurrentBtn','ipvpNowTitle','ipvpNextTitle'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.doesNotMatch(html,/control-bar-v16\.js/);
});
test('caption and TTS UI modules load after IPTVState initialization',()=>{
 const mods=['live-captions-v42343.js','local-tts-v42344.js','whisper-auto-v42345.js'];
 for(const m of mods){assert.match(entry,new RegExp(m.replaceAll('.','\\.')));assert.ok(fs.existsSync(path.join(root,'renderer',m)));}
 assert.ok(entry.indexOf('features.js')<entry.indexOf(mods[0]));
});
test('Tauri APIs call real Rust commands instead of placeholders',()=>{
 for(const op of ['caption:status','caption:install','caption:start','caption:stop','caption:chooseFile','tts:status','tts:install','tts:synthesize','tts:stop']){
  assert.ok(bridge.includes('"'+op+'"'),op);assert.ok(shim.includes("'"+op+"'"),op);
 }
 assert.match(lib,/mod local_ai;/);
 assert.match(shim,/api\.captionOnEvent/);assert.match(shim,/api\.ttsOnEvent/);
 assert.match(shim,/window\.__TAURI__\?\.event/);
});
test('Whisper and uv installers verify hashes and do not download without click',()=>{
 for(const hash of [
 '60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe',
 'd033bd3f590cad50f39957bf86354f87b44394cb001e3f78a7b47264358103e3'
 ]) assert.ok(native.includes(hash));
 assert.match(native,/Sha256::new\(\)/);
 assert.match(native,/allowed_download_host/);
 assert.match(native,/caption_install\(/);
 assert.match(native,/tts_install\(/);
 assert.doesNotMatch(entry,/autoInstall\(\)/);
});
test('local speech is limited, volatile and ducking restored',()=>{
 const voice=read('renderer/local-tts-v42344.js');
 assert.match(native,/\.take\(361\)/);
 assert.match(voice,/function restore\(\)/);
 assert.match(voice,/video\.volume=baseVolume/);
 assert.match(native,/kill_on_drop\(true\)/);
 assert.match(native,/ScopedFolder/);
});
test('v20.2 uses an immutable tag without modifying main',()=>{
 const pkg=JSON.parse(read('package.json'));
 const sh=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.equal(pkg.version,'4.23.17-tauri.20.2');
 assert.ok(sh.includes('TAG="rust-lab/v20.2"'));
 assert.ok(sh.includes('archive/refs/tags/${TAG}.zip'));
});

test('v20.1 auto-installer normalizes platform release file names to whisper-cli',()=>{
 assert.match(native,/fn normalize_whisper_binary\(/);
 assert.match(native,/asset\.strip_suffix\("\.zip"\)/);
 assert.match(native,/find_named\(dir,packaged,0\)/);
 assert.match(native,/fs::rename\(&source,&canonical\)/);
 assert.match(native,/normalize_whisper_binary\(&dir,asset\)\?/);
 assert.doesNotMatch(native,/ZIP Whisper không chứa công cụ phù hợp/);
});
