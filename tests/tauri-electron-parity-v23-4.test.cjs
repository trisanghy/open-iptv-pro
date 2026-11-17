'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('v23.4 Electron compact AI and PiP adaptation wired',()=>{
 const html=read('renderer/index.html'),entry=read('renderer/app-entry.js');
 for(const id of ['caption-ai-main','caption-tts-main','liveTtsSpeed','rustTranslatedCaption','pipAutoMinimize'])assert.ok(html.includes(id));
 assert.match(entry,/auto-pip-v42363\.js/);assert.match(entry,/rust-electron-parity-v23-4\.js/);
 assert.match(read('renderer/app.js'),/OpenIPTVAutoPiP\?\.onPageChange/);
});
test('translated overlay only shows selected target and hides lower original line',()=>{
 assert.match(read('renderer/rust-electron-parity-v23-4.js'),/language!==expected/);
 assert.match(read('renderer/rust-electron-parity-v23-4.css'),/#liveTranslateToggle:checked/);
});
test('TTS rate, timeout, preview and latest queued line',()=>{
 const src=read('renderer/local-tts-v42344.js');
 for(const term of ['45000','90000','previewInFlight','playbackSpeed()','enqueuedAt','Date.now()-began>25000'])assert.ok(src.includes(term));
});
test('immutable new version and Mac build source tag',()=>{
 assert.equal(JSON.parse(read('package.json')).version,'4.23.17-tauri.23.4');
 assert.match(read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),/rust-lab\/v23\.4/);
});
