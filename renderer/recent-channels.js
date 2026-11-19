'use strict';
// Local, bounded playback history. Only decoded playback is added by the caller.
// Does not persist playback URLs, credentials, or copies of M3U content.
(function(root){
 const LIMIT=30;
 function valid(entry){
  return entry&&typeof entry==='object'&&typeof entry.sourceId==='string'&&entry.sourceId.length>0
   &&typeof entry.id==='string'&&entry.id.length>0&&typeof entry.key==='string'&&entry.key.length>0;
 }
 function entryOf(channel,keyOf,at){
  return {sourceId:String(channel.sourceId),id:String(channel.id),key:String(keyOf(channel)),watchedAt:at};
 }
 function compact(entries){
  const result=[],seen=new Set();
  for(const entry of entries){
   if(!valid(entry))continue;
   const unique=entry.sourceId+'\0'+entry.key;
   if(seen.has(unique))continue;
   seen.add(unique);
   result.push({sourceId:entry.sourceId,id:entry.id,key:entry.key,watchedAt:String(entry.watchedAt||'')});
   if(result.length>=LIMIT)break;
  }
  return result;
 }
 function migrate(store,keyOf){
  if(Array.isArray(store.recentChannels)){
   store.recentChannels=compact(store.recentChannels);
   return store.recentChannels;
  }
  // Upgrade from existing v4.23.70 evidence without inventing failed plays.
  const played=(store.channels||[]).filter(c=>c&&c.id&&c.sourceId&&
   typeof c.lastPlaybackAt==='string'&&Number.isFinite(Date.parse(c.lastPlaybackAt)));
  played.sort((a,b)=>Date.parse(b.lastPlaybackAt)-Date.parse(a.lastPlaybackAt));
  store.recentChannels=compact(played.map(c=>entryOf(c,keyOf,c.lastPlaybackAt)));
  return store.recentChannels;
 }
 function record(store,channel,keyOf,at=new Date().toISOString()){
  migrate(store,keyOf);
  if(!channel||!channel.sourceId||!channel.id)return store.recentChannels;
  const next=entryOf(channel,keyOf,at);
  if(!valid(next))return store.recentChannels;
  store.recentChannels=compact([next,...store.recentChannels.filter(old=>!(
   old.sourceId===next.sourceId&&(old.id===next.id||old.key===next.key)
  ))]);
  return store.recentChannels;
 }
 function visible(store,enabled,keyOf){
  migrate(store,keyOf);
  const ids=new Map(),keys=new Map();
  for(const channel of enabled||[]){
   if(!channel||!channel.sourceId||!channel.id)continue;
   ids.set(channel.sourceId+'\0'+channel.id,channel);
   const key=channel.sourceId+'\0'+keyOf(channel);
   if(!keys.has(key))keys.set(key,channel);
  }
  const result=[],seen=new Set();
  for(const entry of store.recentChannels){
   const exact=ids.get(entry.sourceId+'\0'+entry.id);
   const found=(exact&&keyOf(exact)===entry.key?exact:null)||keys.get(entry.sourceId+'\0'+entry.key);
   if(!found||seen.has(found.id))continue;
   seen.add(found.id);
   result.push(found);
  }
  return result;
 }
 const api={LIMIT,migrate,record,visible};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.OpenIPTVRecentChannels=api;
})(typeof window!=='undefined'?window:globalThis);
