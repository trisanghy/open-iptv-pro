'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const rust=read('src-tauri/src/local_ai.rs'),cap=read('renderer/live-captions-v42343.js'),ui=read('renderer/local-tts-v42344.js'),bridge=read('src-tauri/src/bridge.rs');
test('Whisper detects source spoken language from JSON before translation',()=>{
 assert.match(rust,/report\["result"\]\["language"\]/);
 assert.match(rust,/args\(\["-l","auto","-nt","-np","-t","4","-oj","-of"\]\)/);
 assert.match(rust,/source!=target/);
 assert.match(rust,/route="same"/);
 assert.match(rust,/type":"needs-model"/);
 assert.doesNotMatch(rust,/if translate&&translation_status\(&ai,target\)/);
});
test('Direct pairs preferred, fallback only when no direct model installed',()=>{
 assert.match(rust,/async fn argos_plan\(/);
 assert.match(rust,/async fn argos_translate\(/);
 assert.match(rust,/match route\.as_str\(\)/);
 assert.match(rust,/"direct"\|"pivot"/);
 assert.match(rust,/"whisper"/);
 assert.match(rust,/include_str!\("\.\.\/resources\/argos_direct_router\.py"\)/);
});
test('TTS source match bypasses Argos without losing volume or duplicate protection',()=>{
 assert.match(rust,/let speech=if source_language==lang\{phrase\.clone\(\)\}/);
 assert.match(rust,/source_language=="vi"\{phrase\.clone\(\)\}/);
 assert.match(ui,/if\(visibleLang===to\)/);
 assert.match(ui,/sourceLanguage:payload\.sourceLanguage/);
 assert.match(ui,/function acceptSpeech\(/);
 assert.match(ui,/function applyDuck\(/);
 assert.match(bridge,/item\(&args,1\)\.as_str\(\)\.unwrap_or\("en"\)/);
 assert.match(cap,/e\.type==='needs-model'/);
});
test('v23 immutable Mac build tracks own independent release tag',()=>{
 const p=JSON.parse(read('package.json')),sh=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(p.version,/^4\.23\.17-tauri\.\d+(?:\.\d+)*$/);
 assert.ok(sh.includes('TAG="rust-lab/v'+p.version.split('-tauri.')[1]+'"'));
});
