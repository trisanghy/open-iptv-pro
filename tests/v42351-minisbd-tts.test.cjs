'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
test('Argos 1.11.0 install, translation and TTS always use supported MINISBD and offline provider',()=>{
 for(const file of ['src/local-ai-autoinstall.cjs','src/caption-translator.cjs','src/local-tts-service.cjs']){
  const content=read(file);
  assert.match(content,/ARGOS_CHUNK_TYPE:'MINISBD'/,file);
  assert.match(content,/ARGOS_MODEL_PROVIDER:'OPENNMT'/,file);
  assert.doesNotMatch(content,/ARGOS_CHUNK_TYPE:'NONE'/,file);
 }
});
test('Python Argos bridge sets MINISBD BEFORE importing argostranslate',()=>{
 const script=read('src/argos-bridge.py');
 const envIndex=script.indexOf('os.environ["ARGOS_CHUNK_TYPE"] = "MINISBD"');
 const importIndex=script.indexOf('from argostranslate import');
 assert(envIndex>0&&importIndex>envIndex);
 assert.match(script,/os.environ\["ARGOS_MODEL_PROVIDER"\] = "OPENNMT"/);
 assert.match(script,/os.environ\["ARGOS_DEVICE_TYPE"\] = "cpu"/);
});
test('VieNeu install progress no longer exposes internal Python -u command',()=>{
 const script=read('src/local-ai-autoinstall.cjs');
 assert.doesNotMatch(script,/report\(args\[0\]\+' · '/);
 assert.match(script,/Đang tải\/kiểm tra giọng VieNeu/);
});
test('Offline Argos direct routing and working captions are preserved',()=>{
 const installer=read('src/local-ai-autoinstall.cjs');
 const bridge=read('src/argos-bridge.py');
 const caption=read('src/live-caption-service.cjs');
 assert.match(installer,/async function installPair\(from,to\)/);
 assert.match(bridge,/if direct_packages\(src, dst\)/);
 assert.match(caption,/type:'translation-error'/);
 assert.match(caption,/finalText=words;translated=false/);
});
test('Release version 4.23.61 and Mac DMG-only output are consistent',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.61');
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
});
