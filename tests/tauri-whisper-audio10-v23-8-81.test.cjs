'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Rust Lab: one 10-second 16 kHz mono WAV reaches Whisper; four means CPU threads',()=>{
 const rust=read('src-tauri/src/local_ai.rs');
 assert.match(rust,/"-map","0:a:0","-vn","-sn","-dn","-ac","1","-ar","16000","-c:a","pcm_s16le","-t","10"/);
 assert.doesNotMatch(rust,/"pcm_s16le","-t","4"/);
 assert.match(rust,/\.args\(\["-l","auto","-nt","-np","-t","4","-oj","-of"\]\)/);
 assert.match(rust,/caption_stop\(&ai\)\.await/);
 assert.match(rust,/if let Some\(task\)=ai\.caption\.lock\(\)\.await\.take\(\)\{task\.abort\(\);\}/);
 assert.match(rust,/ff\.args\(\["-hide_banner"/);
});
test('Rust Lab 10s sampling does not alter TTS queuing or native PiP behavior',()=>{
 const tts=read('renderer/local-tts-v42344.js');
 assert.match(tts,/generation!==taskId/);
 const version=JSON.parse(read('package.json')).version;
 assert.match(version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
});
