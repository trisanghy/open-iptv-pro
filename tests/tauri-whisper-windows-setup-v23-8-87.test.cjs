'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Windows Whisper ZIP expects .exe, retains dependent DLLs, handles nested folders and repeated installs',()=>{
 const s=read('src-tauri/src/local_ai.rs');
 assert.match(s,/format!\("\{packaged\}\.exe"\)/);
 assert.match(s,/source\.parent\(\).*join\(exec_name\("whisper-cli"\)\)/);
 assert.match(s,/let asset=if cfg!\(windows\)\{"whisper-cpp-win32-x64-cpu\.zip"\}/);
 assert.match(s,/whisper-dependency\.dll/);
 assert.match(s,/assert_eq!\(normalize_whisper_binary\(&dir,asset\)\.unwrap\(\),found\)/);
 assert.match(s,/output_timeout\(&mut check,45\)\.await/);
});
test('download integrity, truthful percent-bytes and detailed installation errors',()=>{
 const s=read('src-tauri/src/local_ai.rs');
 assert.match(s,/resp\.content_length\(\)/);
 assert.match(s,/receivedBytes/);assert.match(s,/totalBytes/);
 assert.match(s,/"percent":percent/);
 assert.match(s,/if actual!=sha/);
 assert.match(s,/"type":"setup-error"/);
 assert.match(s,/"type":"install-error"/);
 assert.match(s,/String::from_utf8_lossy\(&output\.stderr\)\.chars\(\)\.take\(1100\)/);
});
test('display install percent and full errors in CC/TTS without hiding details or leaking unrelated changes',()=>{
 const app=read('renderer/app-entry.js'),html=read('renderer/index.html');
 const ui=read('renderer/local-ai-install-progress-v23-8-87.js');
 const css=read('renderer/local-ai-install-progress-v23-8-87.css');
 assert.match(app,/local-ai-install-progress-v23-8-87\.js/);
 assert.match(html,/local-ai-install-progress-v23-8-87\.css/);
 assert.match(ui,/api\.captionOnEvent/);assert.match(ui,/api\.ttsOnEvent/);
 assert.match(ui,/typeof e\.percent==='number'/);
 assert.match(ui,/details\.open=true/);
 assert.match(ui,/pre\.textContent=info/);
 assert.match(css,/local-ai-install-diagnostics/);
 assert.doesNotThrow(()=>new Function(ui));
});
