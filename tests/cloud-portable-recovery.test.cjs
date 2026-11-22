'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../renderer/cloud-portable.js'),'utf8');
const start=source.indexOf("  const RECOVERY_DB='openiptv-portable-cloud-recovery-v1'");
const end=source.indexOf('  async function pull(',start);
assert.ok(start>0&&end>start,'Portable cloud recovery implementation must exist');
const implementation=source.slice(start,end);
const createHarness=({idbEnabled=true,localAllowed=true}={})=>{
 const state=new Map(),local=new Map(),listeners=new Map();
 let hasTable=false;const user={id:'alpha'};
 const db={
  objectStoreNames:{contains:()=>hasTable},
  createObjectStore:()=>{hasTable=true;},
  close:()=>{},
  transaction:()=>{
   const tx={error:null,oncomplete:null,onerror:null,onabort:null};
   tx.objectStore=()=>({
    put(item){state.set(item.key,item);const req={result:item.key,onsuccess:null};queueMicrotask(()=>{req.onsuccess?.();tx.oncomplete?.();});return req;},
    getAll(){const req={result:[...state.values()],onsuccess:null};queueMicrotask(()=>{req.onsuccess?.();tx.oncomplete?.();});return req;},
    delete(key){state.delete(key);queueMicrotask(()=>tx.oncomplete?.());}
   });
   return tx;
  }
 };
 const indexedDB=idbEnabled?{open:()=>{
  const req={result:db,onupgradeneeded:null,onsuccess:null,onerror:null};
  queueMicrotask(()=>{if(!hasTable)req.onupgradeneeded?.();req.onsuccess?.();});
  return req;
 }}:undefined;
 const localStorage={
  get length(){return local.size;},
  key:i=>[...local.keys()][i]||null,
  getItem:k=>local.has(k)?local.get(k):null,
  setItem:(k,v)=>{if(!localAllowed)throw Error('QuotaExceededError');local.set(k,v);}
 };
 const button={hidden:true,disabled:false,addEventListener:(name,fn)=>listeners.set(name,fn)};
 const document={
  createElement:()=>({...button}),
  body:{append:()=>{}}
 };
 const $=()=>({appendChild:()=>{}});
 const root={URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}}};
 const create=new Function('indexedDB','localStorage','document','user','$','root','copy','say','mode','setTimeout',
  implementation+'\nreturn {secureBackup,recoveryHistory,refreshRecovery};');
 const api=create(indexedDB,localStorage,document,user,$,root,v=>JSON.parse(JSON.stringify(v)),()=>{},'desktop',()=>{});
 return {api,user,state,local};
};
test('1286-channel cloud recovery is committed to IndexedDB before continuing',async()=>{
 const h=createHarness();
 await h.api.secureBackup({channels:Array.from({length:1286},(_,i)=>({id:String(i),url:'https://example.test/'+i}))},'before-cloud-pull');
 assert.equal((await h.api.recoveryHistory())[0].payload.channels.length,1286);
 assert.equal(h.local.size,0,'Do not duplicate large recovery payload in localStorage');
});
test('recoveries are per account and keep at most three committed snapshots',async()=>{
 const h=createHarness();
 for(let i=0;i<5;i++)await h.api.secureBackup({channels:[{id:String(i)}]},'before-cloud-push');
 assert.equal(h.state.size,3);
 assert.equal((await h.api.recoveryHistory()).length,3);
 h.user.id='beta';
 assert.equal((await h.api.recoveryHistory()).length,0);
});
test('quota fallback stops sync if both browser stores are unavailable',async()=>{
 const f=createHarness({idbEnabled:false,localAllowed:true});
 await f.api.secureBackup({channels:[{id:'ok'}]},'before-cloud-pull');
 assert.equal((await f.api.recoveryHistory()).length,1);
 const x=createHarness({idbEnabled:false,localAllowed:false});
 await assert.rejects(x.api.secureBackup({channels:[{id:'x'}]},'before-cloud-pull'),/Đồng bộ đã dừng/);
});
test('pull and push await recovery and download is an account-scoped user action',()=>{
 assert.match(source,/const recovery=await secureBackup\(prior,'before-cloud-pull'\)/);
 assert.match(source,/if\(row\)await secureBackup\(row\.payload,'before-cloud-push'\)/);
 assert.match(source,/portableCloudRecoveryDownload/);
 assert.match(source,/item\?\.userId===user\.id/);
});
