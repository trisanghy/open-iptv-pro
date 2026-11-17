'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createAutoModelInstaller,voiceOptions}=require('../src/local-ai-autoinstall.cjs');
const {createCaptionTranslator}=require('../src/caption-translator.cjs');
const {createLocalSpeechService}=require('../src/local-tts-service.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v4.23.60: stale Argos installed-pairs.json does not signal ready',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-argos-'));
 try{
  const installer=createAutoModelInstaller({dataDir:dir});
  const dirs=installer.paths();
  const status=installer.state('vi');
  assert.equal(status.translationModelInstalled,false);
  fs.mkdirSync(path.dirname(dirs.argosDir),{recursive:true});
  fs.writeFileSync(path.join(path.dirname(dirs.argosDir),'installed-pairs.json'),JSON.stringify({vi:true}));
  assert.equal(dirs.pairReady('vi'),false);
  const folder=path.join(dirs.argosDir,'translate-en_vi-1_9');
  fs.mkdirSync(folder,{recursive:true});
  fs.writeFileSync(path.join(folder,'metadata.json'),JSON.stringify({from_code:'en',to_code:'vi',type:'translate'}));
  assert.equal(dirs.pairReady('vi'),false);
  const verification=path.join(dir,'local-tts','verified-language-pairs');
  fs.mkdirSync(verification,{recursive:true});
  fs.writeFileSync(path.join(verification,'vi.ok'),'verified-v42349');
  assert.equal(dirs.pairReady('vi'),true);
  assert.equal(dirs.pairReady('fr'),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('v4.23.60: Piper selects only approved real voice IDs',()=>{
 assert.ok(voiceOptions('vi').includes('vi_VN-vais1000-medium'));
 assert.ok(voiceOptions('vi').includes('vi_VN-vivos-x_low'));
 assert.ok(voiceOptions('en').includes('en_US-amy-medium'));
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-voices-'));
 try{
  const installer=createAutoModelInstaller({dataDir:dir});
  assert.equal(installer.state('vi','vi_VN-vais1000-medium').voiceName,'vi_VN-vais1000-medium');
  assert.throws(()=>installer.state('vi','../../evil'),/Giọng đọc/);
  const service=createLocalSpeechService({dataDir:dir,managed:installer.paths()});
  assert.deepEqual(service.availability('vi','vi_VN-vivos-x_low').voiceOptions,voiceOptions('vi'));
  assert.throws(()=>service.availability('vi','bad-voice'),/Giọng đọc/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('v4.23.60: offline bridge drives captions, translation and TTS',()=>{
 const bridge=read('src/argos-bridge.py'),model=read('src/local-ai-autoinstall.cjs'),
       caption=read('src/caption-translator.cjs'),tts=read('src/local-tts-service.cjs');
 assert.match(bridge,/get_installed_packages/);
 assert.match(bridge,/get_installed_languages/);
 assert.match(bridge,/get_available_packages/);
 assert.match(model,/argos-bridge\.py/);
 assert.match(caption,/dirs\.argosBridge/);
 assert.match(tts,/translateText\(input,lang,sourceLanguage\)/);
 assert.doesNotMatch(caption,/spawnProcess\(dirs\.argos/);
 assert.doesNotMatch(tts,/invokeProcess\(tool\('argos'\)/);
});
test('v4.23.60: row 3 voice dropdown is fully connected end to end',()=>{
 const html=read('renderer/index.html'),ui=read('renderer/local-tts-v42344.js');
 assert.match(html,/id="liveTtsVoice"/);
 assert.match(ui,/ttsInstall\(target\.value,voice\.value\)/);
 assert.match(ui,/ttsStatus\(target\.value,voice\.value\)/);
 assert.match(ui,/voice:payload\.voiceId/);
 assert.match(read('src/preload.cjs'),/ttsInstall:\(lang,voice\)/);
 assert.match(read('src/main.cjs'),/localModelInstaller\.install\(lang,voice\)/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.65');
});
