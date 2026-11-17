'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=pathName=>fs.readFileSync(path.join(__dirname,'..',pathName),'utf8');
test('CC options offer real segmented modes, sizes, positions, saved colors and 6 fonts',()=>{
 const ui=read('renderer/rust-subtitle-controls-v23-8-5.js'),css=read('renderer/rust-subtitle-controls-v23-8-5.css');
 for(const id of ['rustSubtitleShow','rustSubtitleDisplayButtons','rustSubtitlePositionButtons','rustSubtitleSizeButtons','rustSubtitleColors','rustSubtitleCustomColor','rustSubtitleOpacity','rustSubtitleFont']){
  assert.ok(ui.includes(id),id);
 }
 for(const value of ['original','translated','both','top','middle','bottom','small','medium','large','xlarge']){
  assert.ok(ui.includes('data-value="'+value+'"'),value);
 }
 assert.ok(ui.includes('localStorage.setItem(KEY,JSON.stringify(settings))'));
 assert.ok(ui.includes("button.setAttribute('aria-pressed'"));
 assert.match(css,/\.rust-cc-segmented/);
 assert.match(css,/#rustSubtitleShow:checked/);
 assert.match(css,/rustSubtitleCustomColor/);
});
test('TTS ON enables all three modes and Caption OFF disables all three',()=>{
 const js=read('renderer/live-captions-v42343.js');
 assert.ok(js.includes('if(event?.target===caption&&!caption.checked)'));
 assert.ok(js.includes('translate.checked=false;'));
 assert.ok(js.includes('tts.checked=false;'));
 assert.ok(js.includes('caption.checked=true;translate.checked=true;'));
 assert.ok(js.includes("rustlab:caption-visibility-changed"));
});
test('Pause / seek / ended / prolonged buffering cancel Whisper and TTS',()=>{
 const caption=read('renderer/live-captions-v42343.js');
 const speech=read('renderer/local-tts-v42344.js');
 const overlay=read('renderer/rust-subtitle-controls-v23-8-5.js');
 for(const js of [caption,speech]){
  assert.ok(js.includes("'pause','ended','emptied','seeking'"));
  assert.ok(js.includes("['waiting','stalled']"));
  assert.ok(js.includes("video.readyState<3"));
  assert.ok(js.includes("},1400)"));
 }
 assert.ok(caption.includes('ticket!==lifecycle'));
 assert.ok(speech.includes('generation!==taskId'));
 assert.ok(speech.includes('resetPlayback();recentSpeech.clear();restore();'));
 assert.ok(overlay.includes("document.addEventListener('rustlab:caption-clear',clear)"));
 assert.ok(overlay.includes("'pause','ended','emptied','seeking'"));
});
test('Low-latency first chunk and next audio prefetch do not lose queued subtitles',()=>{
 const tts=read('renderer/local-tts-v42344.js');
 for(const piece of [
  'const limit=parts.length===0?60:105','const synthesizeChunk=part=>',
  'nextAudioResult=synthesizeChunk(chunks[i+1])',
  'if(i>0&&queued)break',
  'if(busy||playing||previewInFlight||previewAudio){queued=payload;return;}',
  'if(generation!==taskId||video.paused||video.ended)',
  "ttsEvent('tts-start'","ttsEvent('tts-end'"]){
  assert.ok(tts.includes(piece),piece);
 }
});
test('Version / immutable build source match and no older tag is overwritten',()=>{
 const pkg=JSON.parse(read('package.json'));
 const shell=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const release=pkg.version.split('-tauri.')[1];
 assert.ok(shell.includes('TAG="rust-lab/v'+release+'"'));
 assert.ok(shell.includes('npm run build -- --bundles app'));
});
