// Persisted, source-independent display ordering for Capacitor Mobile.
// Never modify raw imported M3U rows, channel URLs, favourites or EPG identifiers.
const normalized = v => String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'');
const groupLabel = v => String(v||'Khác').trim()||'Khác';
export function baseChannelKey(ch){
 return String(ch?.sourceId||'unknown')+'|'+(normalized(ch?.tvgId)||normalized(ch?.name)||normalized(ch?.url)||'channel')+'|'+normalized(ch?.name||'');
}
export function identifyOrderKeys(channels){
 const list=Array.isArray(channels)?channels:[];
 const counts=new Map(),same=new Map();
 for(const c of list){const k=baseChannelKey(c);counts.set(k,(counts.get(k)||0)+1);}
 return list.map(c=>{
  const base=baseChannelKey(c);let key=base;
  if(counts.get(base)>1){
   // Same-name/tvg-id duplicates must not silently swap places on playlist refresh.
   key=base+'|'+String(c.url||'');
   const occurrence=same.get(key)||0;same.set(key,occurrence+1);
   if(occurrence)key+='|duplicate:'+occurrence;
  }
  return {...c,orderKey:key};
 });
}
export function displayGroup(store,ch){
 return groupLabel(store?.channelGroupOverrides?.[ch?.orderKey]||ch?.group);
}
export function reconcileOrder(store,allChannels){
 if(!store||typeof store!=='object')throw Error('Missing channel store');
 const items=identifyOrderKeys(allChannels);
 const valid=new Set(items.map(c=>c.orderKey));
 const previous=store.channelOrder&&typeof store.channelOrder==='object'&&!Array.isArray(store.channelOrder)?store.channelOrder:{};
 const groups=new Map();
 for(const c of items){const g=displayGroup(store,c);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(c.orderKey);}
 const next={};
 for(const [g,ids] of groups){
  const set=new Set(ids),ordered=[];
  for(const id of Array.isArray(previous[g])?previous[g]:[])if(set.has(id)&&!ordered.includes(id))ordered.push(id);
  for(const id of ids)if(!ordered.includes(id))ordered.push(id);
  next[g]=ordered;
 }
 store.channelOrder=next;
 const savedGroups=Array.isArray(store.groupOrder)?store.groupOrder:[];
 store.groupOrder=[...new Set([...savedGroups.filter(g=>groups.has(g)),...groups.keys()])];
 const overrides=store.channelGroupOverrides&&typeof store.channelGroupOverrides==='object'?store.channelGroupOverrides:{};
 store.channelGroupOverrides=Object.fromEntries(Object.entries(overrides).filter(([k,g])=>valid.has(k)&&groups.has(groupLabel(g))));
 return items.map(c=>({...c,group:displayGroup(store,c)}));
}
export function orderedChannels(store,channels){
 const groupIndex=new Map((store?.groupOrder||[]).map((g,i)=>[g,i]));
 const orderMaps=new Map(Object.entries(store?.channelOrder||{}).map(([g,list])=>[g,new Map((list||[]).map((id,i)=>[id,i]))]));
 return (channels||[]).map((c,i)=>({c,i})).sort((a,b)=>{
  const ga=displayGroup(store,a.c),gb=displayGroup(store,b.c);
  const rank=(groupIndex.get(ga)??999999)-(groupIndex.get(gb)??999999);
  if(rank)return rank;
  if(ga!==gb)return a.i-b.i;
  const order=orderMaps.get(ga);
  const pa=order?.get(a.c.orderKey)??(100000+a.i),pb=order?.get(b.c.orderKey)??(100000+b.i);
  return pa-pb||a.i-b.i;
 }).map(({c})=>({...c,group:displayGroup(store,c)}));
}
export function moveChannel(store,channels,key,targetGroup,{anchorKey='',after=false}={}){
 const items=identifyOrderKeys(channels),selected=items.find(c=>c.orderKey===key);
 const group=groupLabel(targetGroup);
 if(!selected||!group||!items.some(c=>displayGroup(store,c)===group))return false;
 const anchor=anchorKey&&items.find(c=>c.orderKey===anchorKey);
 if(anchorKey&&(!anchor||displayGroup(store,anchor)!==group||anchorKey===key))return false;
 reconcileOrder(store,channels);
 const before=JSON.stringify({order:store.channelOrder,groups:store.groupOrder,overrides:store.channelGroupOverrides});
 if(group===groupLabel(selected.group))delete store.channelGroupOverrides[key];
 else store.channelGroupOverrides[key]=group;
 const target=[];
 for(const [g,ids] of Object.entries(store.channelOrder)){
  const remaining=ids.filter(id=>id!==key);
  store.channelOrder[g]=remaining;
  if(g===group)target.push(...remaining);
 }
 const at=anchorKey?Math.max(0,target.indexOf(anchorKey)+(after?1:0)):target.length;
 target.splice(at,0,key);
 store.channelOrder[group]=target;
 return before!==JSON.stringify({order:store.channelOrder,groups:store.groupOrder,overrides:store.channelGroupOverrides});
}
export function moveFolder(store,from,to,after=false){
 const old=Array.isArray(store.groupOrder)?store.groupOrder:[];
 if(!old.includes(from)||!old.includes(to)||from===to)return false;
 const next=old.filter(g=>g!==from),at=next.indexOf(to)+(after?1:0);
 next.splice(at,0,from);
 if(next.every((g,i)=>g===old[i]))return false;
 store.groupOrder=next;return true;
}
