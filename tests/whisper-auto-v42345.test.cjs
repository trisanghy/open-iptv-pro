'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const w=require('../src/whisper-autoinstall.cjs');
test('v4.23.45 Whisper auto setup pins CPU-specific community binaries and original multilingual model hash',()=>{
 for(const key of ['darwin-arm64','darwin-x64','win32-x64'])assert.equal(w.BINARIES[key][1].length,64);
 assert.equal(w.MODEL_SHA,'60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe');
 assert.match(w.MODEL_URL,/ggerganov\/whisper.cpp/);
});
test('v4.23.45 no download or installation before explicit setup click',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-whisper-test-'));
 try{const x=w.createWhisperAutoInstaller({dataDir:tmp,platform:'darwin',arch:'arm64'});
 assert.equal(x.status().installed,false);assert.equal(x.status().available,true);
 assert.equal(fs.existsSync(path.join(tmp,'live-caption','auto')),false);
 x.cancel();}finally{fs.rmSync(tmp,{force:true,recursive:true});}
});
test('v4.23.45 Whisper and multilingual TTS both available from third toolbar row, preserving core controls',()=>{
 const html=read('renderer/index.html'),ui=read('renderer/whisper-auto-v42345.js');
 assert.ok(html.indexOf('id="captionAutoInstall"')>html.indexOf('id="captionThirdRow"'));
 assert.ok(html.indexOf('id="captionAutoInstall"')<html.indexOf('id="video-seekbar"')||html.indexOf('id="video-seekbar"')===-1);
 assert.match(html,/id="liveTtsInstall"/);
 assert.match(ui,/captionAutoInstall/);
 assert.ok(html.lastIndexOf('whisper-auto-v42345.js')>html.lastIndexOf('local-tts-v42344.js'));
});
test('v4.23.45 Whisper setup IPC connects only to pinned installer and local model settings',()=>{
 const main=read('src/main.cjs'),pre=read('src/preload.cjs');
 assert.match(main,/ipcMain.handle\('caption:install'/);
 assert.match(main,/liveCaptionService.setFile\('binary'/);assert.match(main,/liveCaptionService.setFile\('model'/);
 assert.match(main,/whisperModelInstaller\?\.cancel\(\)/);
 assert.match(pre,/captionAutoInstall/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.71');
});
