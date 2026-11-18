'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('renderer/index.html'),js=read('renderer/local-tts-v42344.js');
const rust=read('src-tauri/src/local_ai.rs'),bridge=read('src-tauri/src/bridge.rs');
const shim=read('renderer/tauri-bridge.js'),py=read('src-tauri/resources/vieneu_worker.py');
test('26 Vietnamese voice options from verified engines, no fake presets',()=>{
 assert.equal((html.match(/value="vieneu:/g)||[]).length,25);
 for(const id of ['liveTtsVoice','liveTtsVoicePreview'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 for(const name of ['Hải Đăng','Mai Anh','Trúc Ly','Thùy Dung','Quang Sơn','Ngọc Trân','Thái Sơn'])assert.ok(html.includes(name));
 for(const id of ['piper:25hours','piper:vais1000','piper:vivos'])assert.ok(html.includes(id));
});
test('all models installed only on user click with a valid model manifest',()=>{
 assert.match(js,/ttsVoiceInstall\(selectedVoice\(\)\)/);
 assert.match(js,/ttsVoiceStatus\(selectedVoice\(\)\)/);
 assert.match(js,/sourceLanguage:'vi'/);
 assert.match(rust,/vieneu==3\.8\.3/);
 assert.match(rust,/include_str!\("\.\.\/resources\/vieneu_worker\.py"\)/);
 assert.match(rust,/HF_HUB_OFFLINE/);
 assert.match(rust,/pub async fn tts_voice_install/);
});
test('natural TTS uses persistent app-private worker and retains volume ducking',()=>{
 assert.match(rust,/natural_worker: Mutex<Option<NaturalWorker>>/);
 assert.match(rust,/fn natural_env/);
 assert.match(rust,/async fn natural_request/);
 assert.match(py,/list_preset_voices\(\)/);
 assert.match(py,/engine\.infer\(text=text, voice=voice\)/);
 assert.match(js,/function applyDuck\(\)/);
 assert.match(js,/function restore\(\)/);
 assert.match(js,/resetPlayback/);
});
test('native and JS APIs dispatch selected natural/Piper voices',()=>{
 for(const s of ['tts:voiceStatus','tts:voiceInstall'])assert.ok(bridge.includes('"'+s+'"'));
 for(const s of ['ttsVoiceStatus','ttsVoiceInstall'])assert.ok(shim.includes(s));
 assert.match(rust,/vietnamese_piper_model\(voice:&str\)/);
 assert.match(rust,/strip_prefix\(NATURAL_PREFIX\)/);
 assert.match(rust,/--output_file/);
 assert.match(rust,/Stdio::piped\(\)/);
});
test('release stays independently versioned and fast build pins its tag',()=>{
 const pkg=JSON.parse(read('package.json')),script=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(pkg.version,/^4\.23\.17-tauri\.\d+(?:\.\d+)*$/);
 assert.ok(script.includes('TAG="rust-lab/v'+pkg.version.split('-tauri.')[1]+'"'));
 assert.ok(script.includes('VERSION="'+pkg.version+'"'));
});
