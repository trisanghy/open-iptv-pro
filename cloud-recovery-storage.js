'use strict';
/* Browser-only durable recovery snapshots for conflicting cloud edits.
 * Kept separate from localStorage's small synchronous quota; never uploads.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVCloudRecovery=api;
})(typeof window!=='undefined'?window:null,function(){
 const DB='openiptv-cloud-recovery-v1',STORE='snapshots',KEEP=3;
 function open(){
  return new Promise((resolve,reject)=>{
   if(typeof indexedDB==='undefined'){reject(Error('IndexedDB không khả dụng'));return;}
   let req;
   try{req=indexedDB.open(DB,1);}catch(e){reject(e);return;}
   req.onupgradeneeded=()=>{
    const db=req.result;
    if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'key'});
   };
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Không mở được IndexedDB'));
   req.onblocked=()=>reject(Error('IndexedDB đang bị chặn bởi tab khác'));
  });
 }
 async function transaction(mode,action){
  const db=await open();
  return new Promise((resolve,reject)=>{
   let tx,answer;
   const close=()=>{try{db.close();}catch(_){}};
   try{
    tx=db.transaction(STORE,mode);
    const request=action(tx.objectStore(STORE));
    if(request)request.onsuccess=()=>{answer=request.result;};
    tx.oncomplete=()=>{close();resolve(answer);};
    tx.onerror=()=>{close();reject(tx.error||Error('Ghi IndexedDB thất bại'));};
    tx.onabort=()=>{close();reject(tx.error||Error('Giao dịch IndexedDB bị hủy'));};
   }catch(e){close();reject(e);}
  });
 }
 function selectLatest(records,userId){
  return (Array.isArray(records)?records:[]).filter(x=>x&&x.userId===userId&&x.payload)
   .sort((a,b)=>String(b.savedAt).localeCompare(String(a.savedAt)));
 }
 async function list(userId){
  if(!userId)return [];
  return selectLatest(await transaction('readonly',store=>store.getAll()),userId);
 }
 async function latest(userId){return (await list(userId))[0]||null;}
 async function save(userId,payload,conflictedFields){
  if(typeof userId!=='string'||!userId||!payload||typeof payload!=='object')
   throw Error('Dữ liệu dự phòng không hợp lệ');
  const record={
   key:userId+':'+Date.now()+':'+Math.random().toString(36).slice(2),
   userId,savedAt:new Date().toISOString(),reason:'simultaneous-edit',
   conflictedFields:Array.isArray(conflictedFields)?conflictedFields.slice():[],
   payload
  };
  // A transaction complete event is the durable-write acknowledgement.
  await transaction('readwrite',store=>store.put(record));
  try{
   const old=(await list(userId)).slice(KEEP);
   if(old.length)await transaction('readwrite',store=>{
    for(const entry of old)store.delete(entry.key);
   });
  }catch(e){console.warn('Could not prune older cloud recovery snapshots',e);}
  return record;
 }
 return Object.freeze({save,list,latest,selectLatest});
});
