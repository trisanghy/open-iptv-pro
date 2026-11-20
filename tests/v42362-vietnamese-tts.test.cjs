'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {extraVietnameseVoice,VIETVOICE_VOICES,F5_VOICES}=require('../src/extra-vietnamese-tts.cjs');
const {createAutoModelInstaller}=require('../src/local-ai-autoinstall.cjs');
const {createLocalSpeechService}=require('../src/local-tts-service.cjs');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v4.23.67: seven extra Vietnamese voice choices are strictly allowlisted',()=>{
 assert.equal(VIETVOICE_VOICES.length,6);
 assert.equal(F5_VOICES.length,1);
 assert.equal(extraVietnameseVoice('vietvoice:female:northern').area,'northern');
 assert.equal(extraVietnameseVoice('f5vi:clone').requiresReference,true);
 assert.equal(extraVietnameseVoice('vieneu:Adam'),null);
 assert.throws(()=>extraVietnameseVoice('vietvoice:anything'),/chưa được hỗ trợ/);
 assert.throws(()=>extraVietnameseVoice('f5vi:malicious'),/chưa được hỗ trợ/);
 for(const [id] of [...VIETVOICE_VOICES,...F5_VOICES])
  assert.ok(read('renderer/local-tts-v42344.js').includes("'"+id+"'"),id);
});

test('v4.23.67: separate opt-in installers and no fabricated ready state',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-v42362-'));
 try{
  const mgr=createAutoModelInstaller({dataDir:dir});
  const managed=mgr.paths();
  const speech=createLocalSpeechService({dataDir:dir,managed});
  assert.equal(mgr.state('vi','vietvoice:female:northern').installed,false);
  assert.equal(mgr.state('vi','f5vi:clone').installed,false);
  assert.equal(speech.availability('vi','f5vi:clone').ready,false);
  assert.match(speech.availability('vi','f5vi:clone').reason,/Chưa cài/);
  assert.ok(fs.existsSync(managed.extraBridge));
  assert.ok(managed.extraBridge.startsWith(dir));
  assert.ok(managed.extraPath('vietvoice').python.includes('vietvoice'));
  assert.notEqual(managed.extraPath('vietvoice').python,managed.premiumPython);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('v4.23.67: F5 reference needs valid local WAV and actual transcript',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-f5sample-'));
 try{
  const wav=path.join(dir,'sample.wav'),data=Buffer.alloc(44+24000*2*4);
  data.write('RIFF',0,'ascii');data.writeUInt32LE(data.length-8,4);
  data.write('WAVE',8,'ascii');data.write('fmt ',12,'ascii');
  data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);
  data.writeUInt32LE(24000,24);data.writeUInt32LE(48000,28);
  data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);
  data.write('data',36,'ascii');data.writeUInt32LE(data.length-44,40);
  fs.writeFileSync(wav,data);
  const speech=createLocalSpeechService({dataDir:dir,managed:{}});
  assert.throws(()=>speech.setReference(wav,''),/Nhập lời thoại/);
  const result=speech.setReference(wav,'Xin chào, đây là giọng nói mẫu dùng cho TTS.');
  assert.equal(result.ready,true);
  const state=speech.availability('vi','f5vi:clone');
  assert.equal(state.referenceReady,true);
  assert.equal(state.ready,false);
  assert.ok(fs.existsSync(path.join(dir,'local-tts','f5-reference.wav')));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('v4.23.67: hashes, offline worker and consent IPC are connected',()=>{
 const installer=read('src/local-ai-autoinstall.cjs');
 const bridge=read('src/extra-vietnamese-tts-bridge.py');
 const main=read('src/main.cjs'),pre=read('src/preload.cjs');
 const html=read('renderer/index.html'),ui=read('renderer/local-tts-v42344.js');
 assert.match(installer,/f5-tts==1\.1\.22/);
 assert.match(installer,/installExtra/);
 assert.match(bridge,/hashlib\.sha256/);
 assert.match(bridge,/HF_HUB_OFFLINE/);
 assert.match(bridge,/model_latest\.safetensors/);
 assert.match(main,/tts:reference:choose/);
 assert.match(pre,/ttsChooseReference/);
 assert.match(ui,/referenceConsent/);
 assert.match(html,/id="liveTtsReferenceConsent"/);
 assert.match(require('../package.json').version,/^4\.23\.\d+$/);
});
