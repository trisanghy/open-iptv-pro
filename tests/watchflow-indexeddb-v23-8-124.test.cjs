'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const db=require('../renderer/watchflow-persistence-v23-8-124.js');
const auto=require('../renderer/watchflow-auto-discovery-v23-8-106.js');
const qwen=require('../renderer/watchflow-qwen-native-v23-8-111.js');
function fakeIDB(){
 const data=new Map(),stores=new Set(),dbObject={
  objectStoreNames:{contains:key=>stores.has(key)},
  createObjectStore:key=>stores.add(key),
  close(){},
  transaction(name,mode){
   if(!stores.has(name))throw Error('Missing object store');
   const tx={oncomplete:null,onabort:null,onerror:null,objectStore:()=>({
    get:key=>{
     const request={result:undefined,onsuccess:null,onerror:null};
     queueMicrotask(()=>{request.result=data.get(key);request.onsuccess?.();tx.oncomplete?.();});
     return request;
    },
    put:(value,key)=>{
     const snapshot=JSON.parse(JSON.stringify(value));
     queueMicrotask(()=>{data.set(key,snapshot);tx.oncomplete?.();});
    }
   })};
   return tx;
  }
 };
 return {
  open(name,version){
   assert.equal(name,db.DB_NAME);assert.equal(version,db.DB_VERSION);
   const req={result:dbObject,onupgradeneeded:null,onsuccess:null,onerror:null,onblocked:null};
   queueMicrotask(()=>{if(!stores.has(db.STORE))req.onupgradeneeded?.();req.onsuccess?.();});
   return req;
  },
  data
 };
}
function localStorageFull(){
 const values=new Map();
 return {getItem:key=>values.get(key)||null,setItem:()=>{throw Error('QuotaExceededError');},
  removeItem:key=>values.delete(key),values};
}
test('IndexedDB persists every channel when localStorage is completely full',async()=>{
 const indexedDB=fakeIDB(),localStorage=localStorageFull(),window={indexedDB,localStorage},entries={};
 localStorage.values.set('openiptv:playlist','private existing playlist');
 for(let n=0;n<560;n++){
  const p=Array.from({length:40},(_,i)=>({key:'row'+i,title:'Bản tin '+i,start:1,end:2,labels:['Tin tức']}));
  entries['ch'+n]={signature:'sig'+n,base:{name:{label:'Tin tức',confidence:90}},
   snapshot:{label:'Tin tức',labels:['Tin tức'],programmes:p},programmeTopics:p};
 }
 assert.equal(await auto.persistChannelCache(window,entries),'indexeddb');
 const restarted={indexedDB,localStorage};
 const restored=await auto.loadPersistentCache(restarted);
 assert.equal(Object.keys(restored).length,560);
 assert.equal(restored.ch559.snapshot.programmes.length,40);
 assert.equal(restored.ch559.snapshot.label,'Tin tức');
 assert.equal(localStorage.values.get('openiptv:playlist'),'private existing playlist');
 assert.equal(localStorage.values.has(auto.CHANNEL_CACHE),false);
});
test('Old WatchFlow localStorage cache is migrated and only its own obsolete key is removed',async()=>{
 const indexedDB=fakeIDB(),values=new Map(),localStorage={
  getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 values.set('iptv:channels','KEEP PLAYLIST');
 const entry={a:{signature:'x',base:{name:{label:'Thể thao',confidence:85}},
  snapshot:{label:'Thể thao',labels:['Thể thao'],programmes:[]}}};
 assert.equal(auto.saveChannelCache(localStorage,entry),true);
 assert.deepEqual(await auto.loadPersistentCache({indexedDB,localStorage}),entry);
 assert.equal(await auto.persistChannelCache({indexedDB,localStorage},entry),'indexeddb');
 assert.equal(values.has(auto.CHANNEL_CACHE),false);
 assert.equal(values.get('iptv:channels'),'KEEP PLAYLIST');
 assert.deepEqual(await auto.loadPersistentCache({indexedDB,localStorage}),entry);
});
test('Qwen3 results survive app restart even when localStorage quota is already exhausted',async()=>{
 const indexedDB=fakeIDB(),localStorage=localStorageFull();
 const ch={id:'1',name:'Food Network',group:'Ẩm thực'};
 const key=qwen.channelKey('qwen17',ch),win={indexedDB,localStorage};
 assert.equal(await qwen.persist(win,{[key]:{at:1763946000000,labels:['Ẩm thực']}}),'indexeddb');
 assert.deepEqual((await qwen.loadPersistent({indexedDB,localStorage}))[key].labels,['Ẩm thực']);
 assert.equal(localStorage.values.has('watchflow:qwen-channel-cache-v2'),false);
});
test('Without IndexedDB, channel memory fallback remains usable and failures are not masked',async()=>{
 const store=localStorageFull(),win={localStorage:store};
 assert.equal(await auto.persistChannelCache(win,{a:{signature:'a',snapshot:{label:'Tin tức',programmes:[]}}}),'memory');
 assert.deepEqual(await auto.loadPersistentCache(win),{});
 assert.equal(await qwen.persist(win,{a:{at:1,labels:['Tin tức']}}),'memory');
 assert.ok(fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8').includes('x.warning'));
 assert.match(fs.readFileSync('renderer/watchflow-auto-discovery-v23-8-106.js','utf8'),/storage:persisted/);
});
test('Close control has explicit contrasting foreground in dark and light themes',()=>{
 const css=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.css','utf8');
 assert.match(css,/#page-tv \.watchflow-demo #wfClose\{/);
 assert.match(css,/-webkit-text-fill-color:#51306d!important/);
 assert.match(css,/-webkit-text-fill-color:#f5e8ff!important/);
 const ui=fs.readFileSync('renderer/watchflow-ai-demo-v23-8-102.js','utf8');
 assert.match(ui,/id="wfClose"/);
 assert.match(ui,/aria-label="Đóng"/);
});
test('Persistence module loaded before classification and Qwen modules',()=>{
 const html=fs.readFileSync('renderer/index.html','utf8');
 const path='watchflow-persistence-v23-8-124.js';
 assert.ok(html.includes(path));
 assert.ok(html.indexOf(path)<html.indexOf('watchflow-auto-discovery-v23-8-106.js'));
 assert.ok(html.indexOf(path)<html.indexOf('watchflow-qwen-native-v23-8-111.js'));
});
