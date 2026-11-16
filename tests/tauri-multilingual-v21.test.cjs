'use strict';
// Rust Lab v21: verified HF CDN redirects + offline caption targets.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const rust=read('src-tauri/src/local_ai.rs'),bridge=read('src-tauri/src/bridge.rs');
const shim=read('renderer/tauri-bridge.js'),ui=read('renderer/live-captions-v42343.js');
const html=read('renderer/index.html'),tts=read('renderer/local-tts-v42344.js');
test('Hugging Face Xet and CDN redirects retain HTTPS and SHA-256 checks',()=>{
 assert.match(rust,/host\.ends_with\("\.hf\.co"\)/);
 assert.match(rust,/attempt\.url\(\)\.scheme\(\)!="https"/);
 assert.match(rust,/Sha256::new\(\)/);
});
test('21 translation targets, Vietnamese default, own Argos installer',()=>{
 for(const lang of ['vi','en','zh','ja','ko','th','es','fr','de','pt','it','ru','id','ar','hi','tr','nl','pl','uk','sv','ms']){
  assert.ok(html.includes('<option value="'+lang+'"'),lang);
  assert.ok(rust.includes('"'+lang+'"'),lang);
 }
 assert.match(html,/id="captionTranslationInstall"/);
 assert.match(html,/<option value="vi" selected>/);
});
test('backend exposes offline translation status/install separate from TTS voice',()=>{
 for(const op of ['caption:translationStatus','caption:translationInstall'])assert.ok(bridge.includes('"'+op+'"'),op);
 assert.ok(shim.includes("captionTranslationStatus: 'caption:translationStatus'"));
 assert.ok(shim.includes("captionTranslationInstall: 'caption:translationInstall'"));
 assert.match(rust,/async fn ensure_argos_runtime\(/);
 assert.match(rust,/pub async fn translation_install\(/);
 assert.match(rust,/pub fn translation_status\(/);
});
test('Whisper English intermediate is retained for optional Piper voiceover',()=>{
 assert.match(bridge,/opts\["target"\]/);
 assert.ok(ui.includes('captionStart({url,translate:translate.checked,target:lang})'));
 assert.match(rust,/originalText/);
 assert.ok(tts.includes('e.originalText||e.text'));
 assert.match(rust,/translate_caption_text\(&ai_clone,&target,&phrase\)\.await\?/);
});

test('slow Hugging Face model downloads use long total deadline with stall detection',()=>{
 assert.ok(rust.includes('connect_timeout(Duration::from_secs(25))'));
 assert.ok(rust.includes('read_timeout(Duration::from_secs(75))'));
 assert.ok(rust.includes('timeout(Duration::from_secs(1800))'));
});
