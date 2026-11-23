'use strict';
/* WatchFlow-only persistent storage for large classification/EPG caches.
 * No playback URLs, M3U, credentials, or video data. Does not touch app storage.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVWatchFlowPersistence=api;
})(typeof window==='undefined'?globalThis:window,function(){
 const DB_NAME='OpenIPTV-WatchFlow-Cache',DB_VERSION=1,STORE='catalog';
 const timeout=6000;
 function open(context){
  return new Promise(resolve=>{
   const idb=context?.indexedDB;
   if(typeof idb?.open!=='function'){resolve(null);return;}
   let settled=false,req=null;
   const timer=setTimeout(()=>finish(null),timeout);
   function finish(db){
    if(settled){try{db?.close?.();}catch{}return;}
    settled=true;clearTimeout(timer);resolve(db);
   }
   try{
    req=idb.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
     try{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);
     }catch{finish(null);}
    };
    req.onsuccess=()=>finish(req.result);
    req.onerror=()=>finish(null);
    req.onblocked=()=>finish(null);
   }catch{finish(null);}
  });
 }
 async function read(context,key){
  const db=await open(context);if(!db)return null;
  return new Promise(resolve=>{
   let settled=false;const timer=setTimeout(()=>finish(null),timeout);
   function finish(value){
    if(settled)return;
    settled=true;clearTimeout(timer);
    try{db.close();}catch{}
    resolve(value);
   }
   try{
    const tx=db.transaction(STORE,'readonly'),request=tx.objectStore(STORE).get(String(key));
    request.onsuccess=()=>finish(request.result??null);
    request.onerror=()=>finish(null);
    tx.onabort=()=>finish(null);
    tx.onerror=()=>finish(null);
   }catch{finish(null);}
  });
 }
 async function write(context,key,value){
  const db=await open(context);if(!db)return false;
  return new Promise(resolve=>{
   let settled=false;const timer=setTimeout(()=>finish(false),timeout);
   function finish(ok){
    if(settled)return;
    settled=true;clearTimeout(timer);
    try{db.close();}catch{}
    resolve(ok);
   }
   try{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put(value,String(key));
    tx.oncomplete=()=>finish(true);
    tx.onabort=()=>finish(false);
    tx.onerror=()=>finish(false);
   }catch{finish(false);}
  });
 }
 return Object.freeze({DB_NAME,DB_VERSION,STORE,open,read,write});
});
