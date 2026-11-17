'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createHyMTService,MODELS}=require('../src/hymt-service.cjs');
const {createLocalModelStorage,ITEMS}=require('../src/local-ai-storage.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=['hymt18','hymt7','hymt18q8','hymt7q8','qwen06','qwen17','qwen4','qwen8'];
test('v4.23.60: eight real Hugging Face MLX models with explicit variants and no arbitrary repo IDs',()=>{
 assert.equal(Object.keys(MODELS).length,8);
 for(const id of catalog){
  assert.ok(Object.hasOwn(MODELS,id),id);
  assert.ok(Object.hasOwn(ITEMS,id),'missing storage route '+id);
  assert.match(MODELS[id].repo,/^mlx-community\/(Hy-MT2-(1\.8B|7B)-(4bit|8bit)|Qwen3-(0\.6B|1\.7B|4B|8B)-4bit)$/);
  assert.ok(MODELS[id].approxBytes>300000000);
  assert.ok(['hymt','qwen'].includes(MODELS[id].family));
 }
 const html=read('renderer/index.html');
 for(const id of catalog)assert.equal((html.match(new RegExp('value="'+id+'"','g'))||[]).length,1,id);
 assert.match(html,/value="auto"/);
 assert.match(html,/value="argos"/);
});
test('v4.23.60: Qwen and Hy-MT allowlisted models are present in Python download worker',()=>{
 const py=read('src/hymt-bridge.py');
 for(const id of catalog)assert.ok(py.includes('"'+id+'": "'+MODELS[id].repo+'"'),id);
 assert.match(py,/snapshot_download/);
 assert.match(py,/model\.safetensors\.index\.json/);
 assert.match(py,/if key\.startswith\("qwen"\)/);
 assert.match(py,/no_think/);
 assert.doesNotMatch(py,/trust_remote_code=True/);
});
test('v4.23.60: sharded weights must be fully present to be considered installed',()=>{
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-shard-check-'));
 try{
  const svc=createHyMTService({dataDir,installer:{},platform:'darwin',arch:'arm64'});
  const weights=path.join(dataDir,'ai-translate','models','hymt7q8','weights');
  fs.mkdirSync(weights,{recursive:true});
  fs.writeFileSync(path.join(weights,'config.json'),Buffer.alloc(1200));
  fs.writeFileSync(path.join(weights,'tokenizer.json'),Buffer.alloc(200000));
  const index={weight_map:{'layer.1':'model-00001-of-00002.safetensors','layer.2':'model-00002-of-00002.safetensors'}};
  fs.writeFileSync(path.join(weights,'model.safetensors.index.json'),JSON.stringify(index));
  fs.writeFileSync(path.join(weights,'model-00001-of-00002.safetensors'),Buffer.alloc(6500000));
  assert.equal(svc.state('hymt7q8').installed,false,'Must reject half-downloaded sharded model');
  fs.writeFileSync(path.join(weights,'model-00002-of-00002.safetensors'),Buffer.alloc(6500000));
  assert.equal(svc.state('hymt7q8').installed,true);
  assert.equal(svc.state('qwen8').installed,false);
 }finally{fs.rmSync(dataDir,{force:true,recursive:true});}
});
test('v4.23.60: each model folder has isolated deletion; media playlists stay untouched',async()=>{
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-eight-models-'));
 try{
  fs.writeFileSync(path.join(dataDir,'playlists.json'),'PRESERVE');
  const manager=createLocalModelStorage({dataDir});
  for(const id of catalog){
   const dir=path.join(dataDir,'ai-translate','models',id);
   fs.mkdirSync(dir,{recursive:true});
   fs.writeFileSync(path.join(dir,'data.safetensors'),Buffer.alloc(15000));
  }
  assert.equal(manager.inspect().filter(x=>catalog.includes(x.id)&&x.present).length,8);
  const result=await manager.remove('qwen17');
  assert.equal(result.freed,15000);
  assert.ok(!fs.existsSync(path.join(dataDir,'ai-translate','models','qwen17')));
  assert.ok(fs.existsSync(path.join(dataDir,'ai-translate','models','hymt18')));
  assert.equal(fs.readFileSync(path.join(dataDir,'playlists.json'),'utf8'),'PRESERVE');
  await assert.rejects(manager.remove('not-allowed'),/Unknown managed AI item/);
 }finally{fs.rmSync(dataDir,{recursive:true,force:true});}
});
test('v4.23.60: engine selectors, Auto routing, runtime and UI status are end-to-end',()=>{
 const main=read('src/main.cjs'),ui=read('renderer/unified-ai-settings-v42356.js');
 const voices=read('renderer/local-tts-v42344.js');
 assert.match(main,/Object\.hasOwn\(localHyMT\.MODELS,choice\)/);
 assert.match(main,/Object\.hasOwn\(localHyMT\.MODELS,key\)/);
 assert.match(main,/Object\.keys\(localHyMT\.MODELS\)\.map/);
 assert.match(main,/hymt18q8/);
 assert.match(main,/hymt7q8/);
 assert.match(main,/qwen06/);
 assert.match(main,/qwen8/);
 assert.match(ui,/modelKeys=\[/);
 assert.match(ui,/modelSet\.has\(id\)/);
 assert.match(ui,/Tải tiếp/);
 assert.match(ui,/runtimeNeedsRepair/);
 assert.match(ui,/Sửa bộ chạy MLX/);
 assert.match(ui,/9750/);
 assert.match(voices,/openiptv-tts-playback-speed/);
});
test('v4.23.60: stays Mac-only MLX; no accidental commercial license restricted NLLB in installer',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.64');
 assert.deepEqual(pkg.build.mac.target,['dmg']);
 assert.equal(pkg.build.dmg.writeUpdateInfo,false);
 const python=read('src/hymt-bridge.py');
 assert.doesNotMatch(python,/nllb-200-distilled-600M/);
 const service=read('src/hymt-service.cjs');
 assert.match(service,/platform==='darwin'&&arch==='arm64'/);
});
