'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('CC settings are independently persisted and loaded with the renderer',()=>{
 const js=read('renderer/rust-subtitle-controls-v23-8-5.js'),css=read('renderer/rust-subtitle-controls-v23-8-5.css');
 const entry=read('renderer/app-entry.js'),html=read('renderer/index.html');
 for(const id of ['rustSubtitleOptionsButton','rustSubtitleOptionsPanel','rustSubtitleShow','rustSubtitleDisplay',
  'rustSubtitleSize','rustSubtitlePosition','rustSubtitleOutline','rustSubtitleBackground','rustSubtitleOpacity',
  'rustSubtitleCustomColor'])assert.ok(js.includes(id),id);
 assert.ok(js.includes('rustlab:subtitle-display-v1'));
 assert.ok(js.includes('localStorage.setItem(KEY,JSON.stringify(settings))'));
 assert.ok(js.includes("document.addEventListener('rustlab:caption-segment'"));
 assert.ok(entry.includes('rust-subtitle-controls-v23-8-5.js'));
 assert.ok(html.includes('rust-subtitle-controls-v23-8-5.css'));
 assert.ok(css.includes('-webkit-line-clamp:unset!important'));
 assert.ok(!css.includes('-webkit-line-clamp:2'));
 assert.ok(css.includes('white-space:pre-line!important'));
 assert.ok(css.includes('overflow-wrap:anywhere!important'));
 assert.ok(css.includes('width:92%!important'));
 assert.ok(!css.includes('max-height:min(34%,210px)'));
 assert.ok(!read('renderer/rust-electron-parity-v23-4.js').includes('overlay.textContent=text'));
});
test('Video pause terminates recognition, cancels old TTS audio and prevents new words',()=>{
 const cap=read('renderer/live-captions-v42343.js'),tts=read('renderer/local-tts-v42344.js');
 assert.ok(cap.includes("video.addEventListener(event,()=>{clearStall();halt();})"));
 assert.ok(cap.includes("video.addEventListener('playing'"));
 assert.ok(cap.includes('ticket!==lifecycle'));
 assert.ok(cap.includes('!mediaActive()'));
 assert.ok(cap.includes("new CustomEvent('rustlab:caption-clear')"));
 assert.ok(tts.includes("video.addEventListener(event,()=>{clearStall();suspendSpeech();})"));
 assert.ok(tts.includes('video.paused||video.ended'));
 assert.ok(tts.includes('resetPlayback();recentSpeech.clear();restore()'));
 assert.ok(tts.includes('generation!==taskId'));
});
test('Immutable Rust Lab build and GitHub DMG/ZIP release kept separate',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const version=pkg.version.split('-tauri.')[1];
 const builder=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.ok(require('node:fs').readFileSync(require('node:path').join(__dirname,'../scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8').includes('SOURCE_REF="refs/heads/${BRANCH}"'));
 assert.ok(builder.includes('--bundles app'));
 const workflow=read('.github/workflows/rust-lab-version-tags.yml');
 assert.ok(workflow.includes('--target universal-apple-darwin --bundles dmg'));
 assert.ok(workflow.includes('dist/*Source.zip'));
});
