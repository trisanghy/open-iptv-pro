'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createLocalModelStorage,ITEMS}=require('../src/local-ai-storage.cjs');
const {createHyMTService}=require('../src/hymt-service.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v4.23.60: all 3 AI settings use one gear, no duplicate installer buttons',()=>{
 const h=read('renderer/index.html');
 assert.equal((h.match(/id="liveCaptionSetup"/g)||[]).length,1);
 assert.equal((h.match(/id="liveCaptionSetupPanel"/g)||[]).length,1);
 for(const id of ['liveTtsInstall','liveTtsPreview','aiTranslationEngine',
  'aiResourceMode','aiModelList','aiStorageTotal','aiHeatWarning','aiSettingsStatus']){
  assert.equal((h.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 const panel=h.slice(h.indexOf('id="liveCaptionSetupPanel"'));
 assert.match(panel,/id="captionChooseBinary"/);
 assert.match(panel,/id="captionTestTranslate"/);
 assert.match(panel,/id="liveTtsInstall"/);
 assert.match(panel,/id="aiModelList"/);
 assert.equal((h.match(/unified-ai-settings-v42356.js/g)||[]).length,1);
 assert.ok(h.indexOf('id="liveCaptionSetup"')<h.indexOf('id="aiModelList"'));
});
test('v4.23.60: 4 selectable real engines, 3 resource priorities and warning not claimed as thermometer',()=>{
 const html=read('renderer/index.html'),script=read('renderer/unified-ai-settings-v42356.js');
 for(const value of ['auto','argos','hymt18','hymt7','balanced','saver','quality'])
  assert.match(html,new RegExp('value="'+value+'"'));
 assert.match(script,/concurrent>=2/);
 assert.match(script,/không phải số đo nhiệt độ phần cứng/);
 assert.match(script,/openiptv:ai-translate-settings-changed/);
 const cap=read('renderer/live-captions-v42343.js');
 assert.match(cap,/window.AISettings\?\.getEngine/);
 assert.match(cap,/openiptv:ai-translate-settings-changed/);
});
test('v4.23.60: preload delegates only allowlisted model operations and app chooses engine',()=>{
 const main=read('src/main.cjs'),preload=read('src/preload.cjs');
 for(const method of ['ai:modelStatus','ai:install','ai:delete','ai:testTranslation']){
  assert.ok(main.includes(method));
 }
 for(const method of ['aiModelStatus','aiInstallModel','aiDeleteModel','aiOnEvent']){
  assert.ok(preload.includes(method));
 }
 assert.match(main,/resolveAIEngine/);
 assert.match(main,/localHyMT.translate\(text,target,source,engine\)/);
 assert.match(main,/localAIStorage\.remove\(id\)/);
 assert.match(main,/localHyMT\?\.stop/);
 const service=read('src/live-caption-service.cjs');
 assert.match(service,/engine:s.engine/);
 assert.match(service,/resourceMode:s.resourceMode/);
});
test('v4.23.60: storage enumeration lists own AI folders and prevents outside deletion',async()=>{
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-ai-delete-'));
 const outside=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-protected-'));
 try{
  const preserved=path.join(dataDir,'playlists.json');
  const evil=path.join(outside,'protected.txt');
  fs.writeFileSync(evil,'IMPORTANT');
  fs.writeFileSync(preserved,'NO DELETE IPTV');
  const modelDir=path.join(dataDir,'local-tts','voices');
  fs.mkdirSync(modelDir,{recursive:true});
  fs.writeFileSync(path.join(modelDir,'voice.onnx'),Buffer.alloc(12000));
  let stopped=0;
  const manager=createLocalModelStorage({dataDir,onBeforeDelete:async()=>{stopped++;}});
  assert.equal(manager.inspect().find(x=>x.id==='piper').bytes,12000);
  await assert.rejects(manager.remove('../../outside'),/Unknown managed AI item/);
  await manager.remove('piper');
  assert.equal(fs.existsSync(modelDir),false);
  assert.equal(stopped,1);
  assert.equal(fs.readFileSync(preserved,'utf8'),'NO DELETE IPTV');
  assert.equal(fs.readFileSync(evil,'utf8'),'IMPORTANT');
 }finally{fs.rmSync(dataDir,{recursive:true,force:true});fs.rmSync(outside,{recursive:true,force:true});}
});
test('v4.23.60: refusing symlink for managed folder protects external files',async()=>{
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-ai-link-'));
 const elsewhere=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-never-'));
 try{
  fs.writeFileSync(path.join(elsewhere,'keep.txt'),'KEEP');
  fs.mkdirSync(path.join(dataDir,'local-tts'),{recursive:true});
  fs.symlinkSync(elsewhere,path.join(dataDir,'local-tts','voices'),'dir');
  const svc=createLocalModelStorage({dataDir});
  await assert.rejects(svc.remove('piper'),/symbolic link/);
  assert.equal(fs.readFileSync(path.join(elsewhere,'keep.txt'),'utf8'),'KEEP');
 }finally{fs.rmSync(dataDir,{recursive:true,force:true});fs.rmSync(elsewhere,{recursive:true,force:true});}
});
test('v4.23.60: supported hardware gated; weights validated correctly, model root isolated',()=>{
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-mlx-'));
 try{
  const svc=createHyMTService({dataDir,installer:{},platform:'darwin',arch:'arm64'});
  const folder=path.join(dataDir,'ai-translate','models','hymt18','weights');
  assert.equal(svc.state('hymt18').installed,false);
  fs.mkdirSync(folder,{recursive:true});
  fs.writeFileSync(path.join(folder,'config.json'),Buffer.alloc(1600));
  fs.writeFileSync(path.join(folder,'tokenizer.json'),Buffer.alloc(200000));
  fs.writeFileSync(path.join(folder,'model.safetensors'),Buffer.alloc(10010000));
  assert.equal(svc.state('hymt18').installed,true);
  assert.equal(svc.state('hymt18').runtimeReady,false,'Model remains while separate runtime was deleted');
  assert.equal(svc.state('hymt7').installed,false);
  const intel=createHyMTService({dataDir,installer:{},platform:'darwin',arch:'x64'});
  assert.equal(intel.state('hymt18').supported,false);
  assert.equal(svc.root.startsWith(dataDir),true);
  assert.equal(svc.state('hymt18').bytes>10000000,true);
 }finally{fs.rmSync(dataDir,{recursive:true,force:true});}
});
test('v4.23.60: no global cache writes and app retains native DMG-only outputs',()=>{
 const service=read('src/hymt-service.cjs'),bridge=read('src/hymt-bridge.py');
 assert.match(service,/HF_HOME:/);
 assert.match(service,/if\(installed\(key\)&&runtimeReady\(\)\)return state\(key\)/);
 assert.match(service,/Đã khôi phục runtime MLX/);
 assert.match(read('renderer/unified-ai-settings-v42356.js'),/Sửa bộ chạy MLX/);
 assert.match(bridge,/snapshot_download/);
 assert.match(bridge,/mlx_lm import generate, load/);
 assert.match(bridge,/mlx-community\/Hy-MT2-1\.8B-4bit/);
 assert.match(bridge,/mlx-community\/Hy-MT2-7B-4bit/);
 assert.match(read('src/local-ai-autoinstall.cjs'),/prepareUv/);
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.70');
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
 for(const id of ['whisper','argos','piper','vieneu','hymt18','hymt7','cache','runtimes'])
  assert.ok(Object.hasOwn(ITEMS,id));
});
