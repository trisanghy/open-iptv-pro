'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const backup=require('../src/backup-service.cjs');
const data=Buffer.from([0xff,0xd8,0xff,0xe0,0x31,0x32,0x33,0x34,0xff,0xd9]);
const makeStorage=(file='hello.jpg')=>({
 'open-iptv-pro-4':JSON.stringify({sources:[{id:'s1',name:'Demo',type:'url',origin:'https://example.com/test.m3u',enabled:true}],channels:[{id:'a',sourceId:'s1',name:'Kênh 1',url:'https://example.com/stream.m3u8'}],favorites:['https://example.com/stream.m3u8'],snapshots:{'https://example.com/stream.m3u8':{file,name:'Kênh 1'}},folders:[],current:'a'}),
 'open-iptv-pro-advanced-v1':JSON.stringify({profiles:[{id:'admin',name:'Người lớn'}]}),
 'open-iptv-pro-language':'vi',
 'open-iptv-doctor-v2-settings':'{}'
});
async function withTemp(fn){const root=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-backup-test-'));try{return await fn(root);}finally{fs.rmSync(root,{recursive:true,force:true});}}
test('complete backup roundtrip preserves sources/favorites/profiles and restores physical snapshots',async()=>withTemp(async root=>{
 const imgs=path.join(root,'shots');fs.mkdirSync(imgs);fs.writeFileSync(path.join(imgs,'hello.jpg'),data);
 const initial=makeStorage();const {output,summary}=await backup.createBackup(initial,imgs,{appVersion:'4.22.2',includeSnapshots:true});
 assert.equal(summary.images,1);assert.equal(summary.sourceCount,1);assert.equal(summary.channelCount,1);
 const file=path.join(root,'backup.iptvbackup');await backup.saveAtomic(file,output);
 const inspected=await backup.readBackup(file);assert.equal(inspected.summary.images,1);
 const restored=await backup.restoreBackup(inspected.data,path.join(root,'new-shots'));
 const state=JSON.parse(restored.storage['open-iptv-pro-4']);
 assert.deepEqual(state.favorites,['https://example.com/stream.m3u8']);
 assert.equal(JSON.parse(restored.storage['open-iptv-pro-advanced-v1']).profiles[0].name,'Người lớn');
 const importedName=state.snapshots['https://example.com/stream.m3u8'].file;
 assert.match(importedName,/^restored_[0-9a-f]{16}_hello\.jpg$/);
 assert.deepEqual(fs.readFileSync(path.join(root,'new-shots',importedName)),data);
 assert.deepEqual(fs.readFileSync(path.join(imgs,'hello.jpg')),data);
 await backup.discardImportedImages(restored.createdFiles,path.join(root,'new-shots'));
 assert.equal(fs.existsSync(path.join(root,'new-shots',importedName)),false);
}));
test('backup without snapshots removes dangling file references, keeps playlists',async()=>withTemp(async root=>{
 const result=await backup.createBackup(makeStorage(),root,{includeSnapshots:false});
 assert.equal(result.summary.images,0);
 const state=JSON.parse(JSON.parse(result.output).storage['open-iptv-pro-4']);
 assert.equal(state.channels.length,1);
 assert.deepEqual(state.snapshots,{});
}));
test('missing snapshots are omitted instead of broken restore references',async()=>withTemp(async root=>{
 const result=await backup.createBackup(makeStorage(),root,{includeSnapshots:true});
 assert.equal(result.summary.missingImages,1);
 const parsed=JSON.parse(result.output);assert.deepEqual(JSON.parse(parsed.storage['open-iptv-pro-4']).snapshots,{});
}));
test('reject invalid storage / traversal / tampered snapshot digests',async()=>withTemp(async root=>{
 assert.throws(()=>backup.checkedStorage({'evil-key':'x'}),/khóa dữ liệu|thiếu dữ liệu/);
 const snaps=path.join(root,'snaps');fs.mkdirSync(snaps);fs.writeFileSync(path.join(snaps,'hello.jpg'),data);
 const valid=JSON.parse((await backup.createBackup(makeStorage(),snaps)).output.toString());
 for(const kind of ['../hack.jpg','x.jpg']){
  const altered=structuredClone(valid);const entry=altered.snapshotFiles['hello.jpg'];delete altered.snapshotFiles['hello.jpg'];altered.snapshotFiles[kind]=entry;
  if(kind==='x.jpg')altered.snapshotFiles[kind].sha256='0'.repeat(64);
  const file=path.join(root,kind==='x.jpg'?'tampered.iptvbackup':'traversal.iptvbackup');
  fs.writeFileSync(file,JSON.stringify(altered));
  await assert.rejects(backup.readBackup(file),/Snapshot/);
 }
}));
test('reject unsupported backup format without changing existing storage',async()=>withTemp(async root=>{
 const filename=path.join(root,'bad.iptvbackup');fs.writeFileSync(filename,JSON.stringify({magic:'wrong',formatVersion:999}));
 await assert.rejects(backup.readBackup(filename),/định dạng/);
}));
