'use strict';
// Preserve source identity, manually selected groups and favorites when an M3U URL changes.
// No mutation is performed until the caller has downloaded and parsed a valid replacement.
function nameKey(ch){return String(ch?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
function indexUnique(rows, key){
 const counts=new Map(),result=new Map();
 for(const row of rows){const k=key(row);if(k)counts.set(k,(counts.get(k)||0)+1);}
 for(const row of rows){const k=key(row);if(k&&counts.get(k)===1)result.set(k,row);}
 return result;
}
function validatePlaylistUrl(raw){
 const value=String(raw||'').trim();let u;
 try{u=new URL(value);}catch{throw Error('URL không hợp lệ');}
 if(!['https:','http:'].includes(u.protocol)||!u.hostname)throw Error('Nguồn M3U phải dùng HTTP hoặc HTTPS');
 if(u.username||u.password)throw Error('Không hỗ trợ mật khẩu đặt trực tiếp trong địa chỉ URL');
 return value;
}
function planReplacement(oldChannels,newChannels,sourceId,otherChannels=[]){
 if(!Array.isArray(newChannels)||!newChannels.length)throw Error('Playlist mới không có kênh hợp lệ');
 const old=oldChannels.filter(c=>c.sourceId===sourceId);
 const oldByUrl=indexUnique(old,c=>c.url), oldByTvg=indexUnique(old,c=>String(c.tvgId||'').trim().toLowerCase()),oldByName=indexUnique(old,nameKey);
 const newByUrl=indexUnique(newChannels,c=>c.url),newByTvg=indexUnique(newChannels,c=>String(c.tvgId||'').trim().toLowerCase()),newByName=indexUnique(newChannels,nameKey);
 const claimed=new Set(),usedIds=new Set(otherChannels.map(c=>c.id));
 let counter=0,matched=0;
 const channels=newChannels.map(fresh=>{
  const tvg=String(fresh.tvgId||'').trim().toLowerCase(), nk=nameKey(fresh);
  // URL match is strongest. Only accept unique IDs/names in BOTH playlists.
  const candidates=[newByUrl.get(fresh.url)===fresh?oldByUrl.get(fresh.url):null,tvg&&newByTvg.get(tvg)===fresh?oldByTvg.get(tvg):null,nk&&newByName.get(nk)===fresh?oldByName.get(nk):null];
  const prev=candidates.find(c=>c&&!claimed.has(c));
  const result={...fresh,sourceId};
  if(prev){claimed.add(prev);matched++;
   if(!usedIds.has(prev.id))result.id=prev.id;
   result.group=prev.group||result.group;
   // A changed URL may carry a different stream; old alive/dead evidence is invalid.
   if(prev.url===result.url){for(const k of ['status','checkedAt','reason'])if(prev[k]!==undefined)result[k]=prev[k];}
  }
  if(!result.id||usedIds.has(result.id)){
   do{result.id=`${sourceId}|${counter++}`;}while(usedIds.has(result.id));
  }
  usedIds.add(result.id);
  return result;
 });
 return {channels,matched,removed:old.length-matched,added:channels.length-matched};
}
function replaceSourceInStore(store,sourceId,url,newChannels){
 const source=store.sources.find(s=>s.id===sourceId);
 if(!source||source.type!=='url')throw Error('Chỉ có thể sửa nguồn dạng URL');
 const normalized=validatePlaylistUrl(url);
 const others=store.channels.filter(c=>c.sourceId!==sourceId);
 const next=planReplacement(store.channels,newChannels,sourceId,others);
 source.origin=normalized;
 store.channels=others.concat(next.channels);
 return next;
}
const api={nameKey,indexUnique,validatePlaylistUrl,planReplacement,replaceSourceInStore};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(typeof window!=="undefined")window.OpenIPTVSourceEdit=api;
