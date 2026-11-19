'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const features=fs.readFileSync(path.join(root,'features.js'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const begin=features.indexOf(' async function encodeGuideSnapshot(');
const end=features.indexOf(' function rgbToHsv(',begin);
assert.ok(begin>=0&&end>begin,'missing current EPG cache implementation');
const codeUnderTest=features.slice(begin,end);
function fixture(previous,{failWrite=false,failLocal=false,compress=true}={}){
 const records=new Map();
 if(previous)records.set('current',previous);
 records.set('obsolete-epg',{guide:{programmes:[{id:'expired'}]}});
 const local=new Map([['open-iptv-pro-epg-v1','legacy guide']]);
 const alerts=[],ops=[];
 const indexedDB={open(){
  const db={objectStoreNames:{contains:()=>true},close(){},transaction(_name,mode){
   const staging=new Map(records);
   const tx={error:null,objectStore(){return{
    clear(){staging.clear();ops.push('clear')},
    put(value,key){staging.set(key,value);ops.push('put')},
    get(key){const r={};queueMicrotask(()=>{r.result=staging.get(key);r.onsuccess?.()});return r;}
   }},abort(){this.error=new Error('aborted');this.onabort?.()}};
   if(mode==='readwrite')queueMicrotask(()=>{
    if(failWrite){tx.error=new Error('QuotaExceededError');tx.onabort?.();return;}
    records.clear();for(const [k,v] of staging)records.set(k,v);
    tx.oncomplete?.();
   });
   return tx;
  }};
  const request={result:db};
  queueMicrotask(()=>request.onsuccess?.());
  return request;
 }};
 const env={
  indexedDB,Blob,Response,Date,Promise,queueMicrotask,console,
  CompressionStream:compress?globalThis.CompressionStream:undefined,
  DecompressionStream:compress?globalThis.DecompressionStream:undefined,
  localStorage:{
   getItem:k=>local.get(k)||null,
   removeItem:k=>{local.delete(k);ops.push('remove-legacy')},
   setItem:(k,v)=>{if(failLocal)throw new Error('QuotaExceededError');local.set(k,v);}
  },
  largeGuideDB:'open-iptv-pro-epg-cache-v2',legacyGuideKey:'open-iptv-pro-epg-v1',
  guideCacheQueue:Promise.resolve(),guideCacheGeneration:0,
  guide:{names:{},aliasesById:{},programmes:[{id:'vtv1',title:'New EPG',start:Date.now(),end:Date.now()+3600000}]},
  updatedAt:'2026-11-20T05:00:00.000Z',
  epgRequestedInSession:false,config:{manualMappings:{},offsetMinutes:0},
  ctx:{toast:s=>alerts.push(s),renderList(){}},
  renderGuidePages(){}
 };
 vm.runInNewContext(codeUnderTest+
  'globalThis.cacheTest={cacheGuide,loadGuideFromDatabase,encodeGuideSnapshot,decodeGuideSnapshot,setGuide(v){guide=v}};',env);
 return {api:env.cacheTest,records,local,alerts,ops};
}
test('new valid EPG is compressed; old cache removed after successful IndexedDB commit',{
 skip:typeof CompressionStream!=='function'||typeof DecompressionStream!=='function'
},async()=>{
 const x=fixture({guide:{programmes:[{id:'older'}]}});
 assert.equal(await x.api.cacheGuide(),true);
 assert.equal(x.records.size,1,'only the new current record remains');
 assert.equal(x.records.get('current').format,'gzip-json-v1');
 assert.equal(x.local.has('open-iptv-pro-epg-v1'),false);
 assert.equal((await x.api.loadGuideFromDatabase()).guide.programmes[0].title,'New EPG');
 assert.deepEqual(x.ops,['clear','put','remove-legacy']);
});
test('failed write/quota rollback retains prior cache and prior localStorage fallback',async()=>{
 const prior={guide:{programmes:[{id:'old',title:'Last usable EPG'}]},updatedAt:'2026-11-19'};
 const x=fixture(prior,{failWrite:true,failLocal:true});
 assert.equal(await x.api.cacheGuide(),false);
 assert.equal(x.records.get('current'),prior);
 assert.equal(x.local.has('open-iptv-pro-epg-v1'),true);
 assert.match(x.alerts[0],/EPG cũ được giữ/);
 assert.equal(x.records.has('obsolete-epg'),true,'transaction abort rolls back cleanup');
});
test('empty incoming programmes must not erase usable EPG',async()=>{
 const old={guide:{programmes:[{id:'old'}]}};
 const x=fixture(old);
 x.api.setGuide({names:{},aliasesById:{},programmes:[]});
 assert.equal(await x.api.cacheGuide(),false);
 assert.equal(x.records.get('current'),old);
 assert.deepEqual(x.ops,[]);
});
test('legacy plain EPG can still be read and replaced without CompressionStream',async()=>{
 const plain={guide:{programmes:[{id:'old',title:'Plain old guide'}]}};
 const x=fixture(plain,{compress:false});
 assert.equal((await x.api.loadGuideFromDatabase()).guide.programmes[0].title,'Plain old guide');
 assert.equal(await x.api.cacheGuide(),true);
 assert.equal(x.records.size,1);
 assert.equal(x.records.get('current').guide.programmes[0].title,'New EPG');
});
test('new cache touches only EPG storage keys, not playlist or user preferences',()=>{
 assert.match(codeUnderTest,/onlyEPG\.clear\(\)/);
 assert.match(codeUnderTest,/onlyEPG\.put\(stored,'current'\)/);
 assert.match(codeUnderTest,/localStorage\.removeItem\(legacyGuideKey\)/);
 assert.doesNotMatch(codeUnderTest,/localStorage\.clear\(|indexedDB\.deleteDatabase\(/);
 assert.match(builder,/Cannot copy atomic compressed EPG cache into Web build/);
 assert.match(builder,/web_features\[cache_src:cache_src_end\]/);
 assert.match(html,/features\.js\?v=epg-player-details-20261120a/);
});
