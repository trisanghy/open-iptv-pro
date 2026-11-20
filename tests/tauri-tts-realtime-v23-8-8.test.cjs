'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Whisper samples audio in 10-second windows and keeps 4 CPU threads',()=>{
 const src=read('src-tauri/src/local_ai.rs');
 assert.ok(src.includes('"pcm_s16le","-t","10"'));
 assert.ok(src.includes('"-nt","-np","-t","4","-oj","-of"'));
});
test('VieNeu worker is preloaded without downloading and reused for successive phrases',()=>{
 const rust=read('src-tauri/src/local_ai.rs');
 assert.ok(rust.includes('async fn natural_warmup(ai:&LocalAi)'));
 assert.ok(rust.includes('pub async fn tts_prewarm(ai:&LocalAi,voice:&str)'));
 assert.ok(rust.includes('natural_warmup(ai).await?;'));
 assert.ok(rust.includes('if slot.is_some(){return Ok(());}'));
 assert.ok(read('src-tauri/src/bridge.rs').includes('"tts:prewarm"'));
 assert.ok(read('renderer/tauri-bridge.js').includes("ttsPrewarm: 'tts:prewarm'"));
});
test('TTS starts short chunks rapidly, drops stale backlog, resumes without ghost speech',()=>{
 const js=read('renderer/local-tts-v42344.js');
 for(const value of ['speechChunks=value=>','parts.length===0?60:105','prewarm();',
  'Date.now()-began>25000','generation!==taskId','if(i>0&&queued)break',
  "ttsEvent('tts-start'","ttsEvent('tts-end'",'releasePlayback=done','sourceLanguage:payload.sourceLanguage',
  'function applyDuck()', 'function acceptSpeech(', 'recentSpeech.clear()'])
  assert.ok(js.includes(value),value);
 assert.ok(js.includes('if(busy||playing||previewInFlight||previewAudio){queued=payload;return;}'));
 assert.match(js,/return parts; \/\/ Keep the whole phrase/);
 assert.ok(js.includes('nextAudioResult=synthesizeChunk(chunks[i+1])'));
});
test('On-video caption follows the phrase being spoken, and restores normal overlay afterwards',()=>{
 const src=read('renderer/rust-subtitle-controls-v23-8-5.js');
 assert.ok(src.includes("document.addEventListener('rustlab:tts-start'"));
 assert.ok(src.includes("document.addEventListener('rustlab:tts-end'"));
 assert.ok(src.includes('const active=spoken||last;'));
 assert.ok(src.includes('if(!spoken)render()'));
});
test('Version has a matching immutable tag and single .app Mac build',()=>{
 const p=JSON.parse(read('package.json')),builder=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(p.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const current=p.version.split('-tauri.')[1];
 assert.ok(require('node:fs').readFileSync(require('node:path').join(__dirname,'../scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8').includes('SOURCE_REF="refs/heads/${BRANCH}"'));
 assert.ok(builder.includes('npm run build -- --bundles app'));
});
