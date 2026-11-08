'use strict';
// Stable favorite identities independent from URL and playlist source.
// Public, pure helpers; safe to test in Node and load in the Electron renderer.
(function(root){
 function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\b(?:ultra\s*hd|full\s*hd|fhd|uhd|hd|sd|1080p|720p|4k)\b/g,'').replace(/[^a-z0-9]+/g,'').trim();}
 function key(channel){
  const name=normalize(channel?.name);
  if(name.length>=2)return `name:${name}`;
  const id=normalize(channel?.tvgId);if(id)return `id:${id}`;
  return 'url:'+String(channel?.url||'');
 }
 function migrate(store){
  if(!Array.isArray(store.favoriteKeys)){
   const old=new Set(Array.isArray(store.favorites)?store.favorites:[]);
   store.favoriteKeys=[...new Set([...old].map(url=>{const match=(store.channels||[]).find(ch=>ch.url===url);return match?key(match):(store.snapshots?.[url]?.name?key({name:store.snapshots[url].name}):null);}).filter(Boolean))];
  }
  store.favoriteKeys=[...new Set(store.favoriteKeys.filter(x=>typeof x==='string'&&x.length>0))];
  return store.favoriteKeys;
 }
 function enabledChannels(store){const ids=new Set((store.sources||[]).filter(s=>s.enabled!==false).map(s=>s.id));return (store.channels||[]).filter(c=>ids.has(c.sourceId));}
 function visible(store){
  const keys=migrate(store),chosen=new Map();
  const savedUrls=new Set(store.favorites||[]);
  for(const ch of enabledChannels(store)){
   const k=key(ch);if(!keys.includes(k))continue;
   const priority=(ch.status==='alive'?100:ch.status==='unchecked'?70:ch.status==='uncertain'?60:0)+(savedUrls.has(ch.url)?5:0);
   if(!chosen.has(k)||priority>chosen.get(k).priority)chosen.set(k,{channel:ch,priority});
  }
  return keys.map(k=>chosen.get(k)?.channel).filter(Boolean);
 }
 function sync(store){
  const keys=new Set(migrate(store));
  const urls=[...new Set(enabledChannels(store).filter(ch=>keys.has(key(ch))).map(ch=>ch.url))];
  store.favorites=urls;
  return visible(store);
 }
 function has(store,ch){return ch?migrate(store).includes(key(ch)):false;}
 function toggle(store,ch){if(!ch)return false;const favs=migrate(store),k=key(ch),i=favs.indexOf(k);if(i>=0)favs.splice(i,1);else favs.push(k);sync(store);return i<0;}
 const api={normalize,key,migrate,enabledChannels,visible,sync,has,toggle};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.OpenIPTVFavorites=api;
})(typeof window!=='undefined'?window:globalThis);
