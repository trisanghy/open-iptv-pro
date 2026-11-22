'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'cloud-sync.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const recovery=require('../cloud-recovery-storage.js');
test('Tizen branch Web copy protects cloud conflict before merge or restore',()=>{
 assert.match(script,/!await saveRecoveryCopy\(originalId,local,conflicts\)/);
 assert.match(script,/await recoveryStore\.save\(id,record\.payload,fields\)/);
 assert.match(script,/Đồng bộ tạm dừng để bảo vệ dữ liệu/);
 const x=html.indexOf('cloud-recovery-storage.js?v=cloud-idb-recovery-20261122a');
 const y=html.indexOf('cloud-sync.js?v=cloud-idb-recovery-20261122a');
 assert.ok(x>=0&&y>x);
});
test('recovery history does not mix users',()=>{
 const rows=[
  {key:'u1',userId:'a',savedAt:'2026-11-21T00:00:00Z',payload:{channels:[1]}},
  {key:'u2',userId:'b',savedAt:'2026-11-22T00:00:00Z',payload:{channels:[2]}}
 ];
 assert.deepEqual(recovery.selectLatest(rows,'a').map(x=>x.key),['u1']);
});
