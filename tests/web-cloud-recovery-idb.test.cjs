'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const recovery=require('../cloud-recovery-storage.js');
const sync=fs.readFileSync(path.join(__dirname,'../cloud-sync.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');

test('recovery history filters accounts and sorts newest first',()=>{
 const entries=[
  {key:'a1',userId:'a',savedAt:'2026-11-21T00:00:00Z',payload:{channels:[1]}},
  {key:'b1',userId:'b',savedAt:'2026-11-22T00:00:00Z',payload:{channels:[2]}},
  {key:'a2',userId:'a',savedAt:'2026-11-22T01:00:00Z',payload:{channels:[3]}}
 ];
 assert.deepEqual(recovery.selectLatest(entries,'a').map(x=>x.key),['a2','a1']);
 assert.deepEqual(recovery.selectLatest(entries,'b').map(x=>x.key),['b1']);
 assert.deepEqual(recovery.selectLatest(null,'a'),[]);
});

test('conflicting edits are backed up before syncing or replacing local state',()=>{
 assert.match(sync,/if\(conflicts\.length && !await saveRecoveryCopy\(originalId,local,conflicts\)\)/);
 assert.match(sync,/!await saveRecoveryCopy\(originalId,local,\['legacy-conflict'\]\)/);
 assert.match(sync,/!await saveRecoveryCopy\(uid,remote\.payload,\['before-project-switch-restore'\]\)/);
 assert.match(sync,/await recoveryStore\.save\(id,record\.payload,fields\)/);
 assert.match(sync,/localStorage\.setItem\(RECOVERY\(id\)/);
});
test('recovery script and cloud sync are loaded in correct order with new cache keys',()=>{
 const ix=html.indexOf('cloud-recovery-storage.js?v=cloud-idb-recovery-20261122a');
 const sx=html.indexOf('cloud-sync.js?v=cloud-idb-recovery-20261122a');
 assert.ok(ix>=0&&sx>ix);
 assert.match(sync,/cloudRecoveryDownload/);
 assert.match(sync,/URL\.createObjectURL/);
 assert.match(sync,/open-iptv-pro-backup/);
});
