'use strict';
// Web only: bounded recent channel history, stored with normal IPTV settings.
(function(build){
 const api=build();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(typeof window!=='undefined')window.OpenIPTVRecentChannels=api;
})(function(){
 const LIMIT=24;
 function normalize(value){
  if(!Array.isArray(value))return [];
  const seen=new Set(),result=[];
  for(const raw of value){
   if(typeof raw!=='string'||!raw||raw.length>512||seen.has(raw))continue;
   seen.add(raw);result.push(raw);
   if(result.length>=LIMIT)break;
  }
  return result;
 }
 function push(history,id){
  if(typeof id!=='string'||!id||id.length>512)return normalize(history);
  return normalize([id,...normalize(history)]);
 }
 function select(history,channels){
  const available=new Map((Array.isArray(channels)?channels:[]).map(c=>[c.id,c]));
  return normalize(history).map(id=>available.get(id)).filter(Boolean);
 }
 return Object.freeze({LIMIT,normalize,push,select});
});
