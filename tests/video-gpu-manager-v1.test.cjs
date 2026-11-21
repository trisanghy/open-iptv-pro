'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createVideoGPUService}=require('../src/video-gpu-service.cjs');
test('GPU prepare correctly distinguishes bundled FFmpeg from AI upscaling',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gpu-probe-'));
 try{
  const s=createVideoGPUService({dataDir:root,getFFmpeg:()=>null});
  const p=s.prepare();
  assert.equal(p.ready,false);assert.equal(p.liveAiUpscale,false);
  assert.equal(p.modelReady,false);
  assert.deepEqual(s.storage().items.map(x=>x.bytes),[0,0,0]);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('GPU memory deletion is restricted to app-owned allowlisted folders',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gpu-storage-'));
 try{
  const s=createVideoGPUService({dataDir:root,getFFmpeg:()=>null});
  const owned=path.join(root,'video-gpu-assets','cache');
  fs.mkdirSync(owned,{recursive:true});fs.writeFileSync(path.join(owned,'temp.bin'),'GPU cache');
  fs.writeFileSync(path.join(root,'keep-user-data.txt'),'keep');
  assert.ok(s.storage().totalBytes>0);
  assert.throws(()=>s.remove('../keep-user-data.txt'),/không được xóa/i);
  assert.equal(s.remove('cache').totalBytes,0);
  assert.ok(fs.existsSync(path.join(root,'keep-user-data.txt')));
  const outside=fs.mkdtempSync(path.join(os.tmpdir(),'gpu-outside-'));
  try{
   fs.symlinkSync(outside,owned,'dir');
   assert.throws(()=>s.remove('cache'),/symlink/i);
   assert.ok(fs.existsSync(outside));
  }finally{fs.rmSync(outside,{recursive:true,force:true});}
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('GPU benchmark does not claim GPU/AI without hardware encoder',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gpu-bench-'));
 try{
  const r=await createVideoGPUService({dataDir:root,getFFmpeg:()=>null}).benchmark();
  assert.equal(r.available,false);assert.equal(r.aiUpscaleAvailable,false);
  assert.equal(r.kind,'gpu-h264-encode-only');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('renderer offers opt-in benchmark and explicit recommendation dialog',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../renderer/video-gpu-manager-v1.js'),'utf8');
 assert.match(code,/videoGpuBenchmark/);assert.match(code,/showModal/);
 assert.match(code,/GPU mã hóa/);assert.match(code,/videoGpuDelete/);
 assert.doesNotThrow(()=>new Function(code));
});
