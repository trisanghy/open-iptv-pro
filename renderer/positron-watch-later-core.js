'use strict';
/* Positron Watch Later: local-only, channel identity bookmarks.
 * Storage contains only an opaque source fingerprint, normalized non-URL
 * name/guide ID and timestamp; never M3U, stream URLs or credentials.
 */
(function(root){
 const STORAGE_KEY='positron.watch-later.v1',LIMIT=80;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\b(?:ultra\s*hd|full\s*hd|fhd|uhd|hd|sd|1080p|720p|4k)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 function fingerprint(value){let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16).padStart(8,'0');}
 function identity(channel){
  const source=String(channel?.sourceId??'').trim();
  if(!source)return null;
  const keyFromFavorites=root?.OpenIPTVFavorites?.key?.(channel);
  const name=norm(channel?.name),id=norm(channel?.tvgId);
  const key=typeof keyFromFavorites==='string'&&/^(?:name|id):[a-z0-9 ]{2,140}$/.test(keyFromFavorites)
   ?keyFromFavorites:name.length>=2?'name:'+name:id?'id:'+id:null;
  return key?{source:fingerprint(source),key:key.slice(0,150)}:null;
 }
 function compact(rows){
  const seen=new Set(),result=[];
  for(const e of Array.isArray(rows)?rows:[]){
   if(!e||typeof e!=='object'||typeof e.source!=='string'||!/^[a-f0-9]{8}$/.test(e.source)
    ||typeof e.key!=='string'||!/^(?:name|id):[a-z0-9 ]{2,140}$/.test(e.key))continue;
   const token=e.source+'|'+e.key;
   if(seen.has(token))continue;
   seen.add(token);
   const parsed=Date.parse(e.savedAt||'');
   result.push({source:e.source,key:e.key,savedAt:Number.isFinite(parsed)?new Date(parsed).toISOString():''});
   if(result.length>=LIMIT)break;
  }
  return result;
 }
 function has(rows,channel){const id=identity(channel);return !!id&&compact(rows).some(e=>e.source===id.source&&e.key===id.key);}
 function toggle(rows,channel,at=new Date().toISOString()){
  const before=compact(rows),id=identity(channel);
  if(!id)return {ok:false,saved:false,rows:before};
  const exists=before.some(e=>e.source===id.source&&e.key===id.key);
  // P5.1.103: never silently evict a saved bookmark at capacity.
  if(!exists&&before.length>=LIMIT)return {ok:false,saved:false,rows:before,reason:'full'};
  const updated=before.filter(e=>!(e.source===id.source&&e.key===id.key));
  if(!exists)updated.unshift({...id,savedAt:Number.isFinite(Date.parse(at))?new Date(at).toISOString():''});
  return {ok:true,saved:!exists,rows:compact(updated)};
 }
 function visible(rows,channels,limit=8){
  const lookup=new Map();
  for(const channel of Array.isArray(channels)?channels:[]){
   const id=identity(channel);
   if(!id||channel.status==='dead'||!channel.id||typeof channel.url!=='string'||!channel.url.trim())continue;
   const token=id.source+'|'+id.key;
   if(!lookup.has(token)||channel.status==='alive')lookup.set(token,channel);
  }
  const seen=new Set(),out=[];
  for(const entry of compact(rows)){
   const channel=lookup.get(entry.source+'|'+entry.key);
   if(!channel||seen.has(String(channel.id)))continue;
   seen.add(String(channel.id));out.push(channel);
   if(out.length>=Math.min(80,Math.max(1,Math.trunc(limit)||8)))break;
  }
  return out;
 }
 // P5.1.102: multi-term local search across saved channel names and groups.
 // Resolution tokens (HD, 4K) remain searchable, unlike bookmark identity.
 // Never inspect stream URLs, credentials, guide links or hidden channels.
 function searchText(value){return String(value??'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase()
  .replace(/[^a-z0-9]+/g,' ').trim();}
 function search(rows,channels,query,limit=LIMIT){
  const raw=String(query??'').trim();
  const terms=raw?searchText(raw).split(/\s+/).filter(Boolean):[];
  const matches=visible(rows,channels,LIMIT).filter(ch=>{
   if(!raw)return true;
   if(!terms.length)return false;
   const searchable=searchText(String(ch.name||'')+' '+String(ch.group||''));
   return terms.every(term=>searchable.includes(term));
  });
  const take=Math.min(LIMIT,Math.max(1,Math.trunc(limit)||LIMIT));
  return matches.slice(0,take);
 }
 const api=Object.freeze({STORAGE_KEY,LIMIT,identity,compact,has,toggle,visible,search});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PositronWatchLaterCore=api;
})(typeof globalThis!=='undefined'?globalThis:null);
