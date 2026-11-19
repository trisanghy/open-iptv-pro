'use strict';
/* Web-only snapshot planner: never truncate a playlist by an arbitrary batch cap. */
(function(factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(typeof window!=='undefined')window.OpenIPTVSnapshotBatch=api;
})(function(){
 function plan(channels,snapshots,skipExisting){
  const pending=[],seen=new Set();
  let skipped=0;
  for(const channel of Array.isArray(channels)?channels:[]){
   const url=typeof channel?.url==='string'?channel.url:'';
   if(!url||seen.has(url)){skipped++;continue;}
   seen.add(url);
   const old=snapshots?.[url];
   if(skipExisting&&(old?.data||old?.file)){skipped++;continue;}
   pending.push(channel);
  }
  return {pending,skipped,total:pending.length+skipped};
 }
 function isStorageFull(error){
  return /Không đủ dung lượng lưu Snapshot|QuotaExceededError|quota.exceeded|storage.full/i.test(
   String(error?.name||'')+' '+String(error?.message||error||''));
 }
 return Object.freeze({plan,isStorageFull});
});
