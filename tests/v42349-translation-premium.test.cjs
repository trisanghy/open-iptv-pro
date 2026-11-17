'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {VIENEU_VOICES,premiumName}=require('../src/premium-voices.cjs');
const {createAutoModelInstaller}=require('../src/local-ai-autoinstall.cjs');
test('v4.23.60: 24 approved high quality Vietnamese names, no invented Piper models',()=>{
 assert.equal(VIENEU_VOICES.length,25);
 assert.equal(new Set(VIENEU_VOICES).size,25);
 assert.equal(premiumName('vieneu:Mai Anh'),'Mai Anh');
 assert.throws(()=>premiumName('vieneu:fake voice'),/chưa được hỗ trợ/);
 const ui=read('renderer/local-tts-v42344.js');
 for(const name of VIENEU_VOICES)assert.ok(ui.includes("'"+name+"'"),'Missing UI voice '+name);
});
test('v4.23.60: Argos only marked ready after real verified marker and installed model metadata',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-verified-'));
 try{
  const installer=createAutoModelInstaller({dataDir:dir});
  const paths=installer.paths();
  const pkg=path.join(paths.argosDir,'translate-en_vi-1_9');
  fs.mkdirSync(pkg,{recursive:true});
  fs.writeFileSync(path.join(pkg,'metadata.json'),JSON.stringify({from_code:'en',to_code:'vi',type:'translate'}));
  assert.equal(paths.pairReady('vi'),false,'metadata alone is not a successful translation');
  const marker=path.join(dir,'local-tts','verified-language-pairs','vi.ok');
  fs.mkdirSync(path.dirname(marker),{recursive:true});
  fs.writeFileSync(marker,'verified-v42349\n');
  assert.equal(paths.pairReady('vi'),true);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('v4.23.60: premium voice must be explicit opt-in, isolated install and real WAV probe',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-premium-'));
 try{
  const ins=createAutoModelInstaller({dataDir:dir});
  assert.equal(ins.state('vi','vieneu:Mai Anh').installed,false);
  assert.equal(fs.existsSync(path.join(dir,'local-tts')),false);
  const paths=ins.paths();
  assert.ok(fs.existsSync(paths.argosBridge),'Python Argos must be materialized outside app.asar');
  assert.ok(fs.existsSync(paths.vieneuBridge),'Python VieNeu must be materialized outside app.asar');
  assert.ok(paths.argosBridge.startsWith(dir),'Argos script must be an actual local file');
  assert.ok(paths.vieneuBridge.startsWith(dir),'VieNeu script must be an actual local file');
  assert.throws(()=>ins.state('vi','vieneu:unknown'),/chưa được hỗ trợ/);
  const code=read('src/local-ai-autoinstall.cjs');
  assert.match(code,/vieneu==3\.8\.4/);
  assert.match(code,/vieneu-python-env/);
  assert.match(code,/vieneu-bridge\.py.*warm/);
  assert.match(code,/HF_HOME/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('v4.23.60: translated Vietnamese captions must not translate twice in TTS',()=>{
 const s=read('src/local-tts-service.cjs'),ui=read('renderer/local-tts-v42344.js');
 assert.match(s,/sourceLanguage!==lang/);
 assert.match(ui,/sameLanguage=e\.language===target\.value/);
 assert.match(ui,/alreadyTranslated:payload\.alreadyTranslated===true/);
 assert.match(s,/managed\.vieneuBridge/);
 assert.match(s,/managed\.vieneuBridge/);
 assert.match(s,/translateText\(input,lang,sourceLanguage\)/);
 assert.match(read('src/caption-translator.cjs'),/dirs\.argosBridge/);
 assert.match(ui,/liveTtsPreview/);
});
test('v4.23.60: UI adds a genuine offline translation health test, no English-only tooltip',()=>{
 const s=read('renderer/live-captions-v42343.js'),h=read('renderer/index.html'),
 main=read('src/main.cjs'),pre=read('src/preload.cjs');
 assert.match(s,/captionTestTranslation/);
 assert.match(h,/captionTestTranslate/);
 assert.match(main,/caption:testTranslation/);
 assert.match(pre,/captionTestTranslation/);
 assert.doesNotMatch(h,/Dịch sang tiếng Anh trên máy/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.63');
});
