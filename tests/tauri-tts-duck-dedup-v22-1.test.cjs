'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'renderer/local-tts-v42344.js'),'utf8');
test('source attenuation starts with TTS enable and is held between phrases',()=>{
 assert.match(ui,/updateSession\(\);applyDuck\(\);/);
 assert.match(ui,/if\(enabled\)applyDuck\(\);/);
 assert.match(ui,/video\.addEventListener\('volumechange'/);
 assert.match(ui,/video\.addEventListener\('playing'/);
 assert.doesNotMatch(ui,/playing=null;restore\(\)/);
 assert.doesNotMatch(ui,/audio\.addEventListener\('ended'[^\n]*restore\(/);
});
test('user slider and duck selection determine effective video volume continuously',()=>{
 assert.match(ui,/baseVolume\*duckRatio\(\)/);
 assert.match(ui,/volumeInput\?\.addEventListener\('input'/);
 assert.match(ui,/duck\.addEventListener\('change'/);
 assert.match(ui,/if\(!enabled\)\{resetPlayback\(\);recentSpeech\.clear\(\);restore\(\)/);
});
test('duplicate caption text is filtered before queueing or synthesis',()=>{
 assert.match(ui,/DEDUP_MS=45000/);
 assert.match(ui,/function normalizeSpeech\(/);
 assert.match(ui,/function acceptSpeech\(/);
 assert.match(ui,/if\(!acceptSpeech\(text\)\)return/);
 assert.match(ui,/recentSpeech\.clear\(\)/);
 assert.match(ui,/recentSpeech\.size>80/);
});
test('one-command builder remains pinned to own immutable minor version',()=>{
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const sh=fs.readFileSync(path.join(root,'scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8');
 assert.equal(pkg.version,'4.23.17-tauri.22.1');
 assert.ok(sh.includes('TAG="rust-lab/v22.1"'));
});
