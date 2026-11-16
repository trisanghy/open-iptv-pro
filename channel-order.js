'use strict';
/** Persistent, per-folder channel order. No DOM dependencies; safe for node and Electron. */
(function(root){
 const groupOf=c=>String(c?.group||'Khác').replace(/\s*\|\s*(?:Kiểm tra|Kiem tra):?.*$/i,'').trim()||'Khác';
 const unique=items=>[...new Set(items)];
 const validState=state=>state&&typeof state==='object'&&!Array.isArray(state);
 function reconcile(store){
  const prev=validState(store.channelOrder)?store.channelOrder:{};
  const byGroup=new Map();
  for(const ch of store.channels||[]){
   if(!ch||typeof ch.id!=='string')continue;
   const g=groupOf(ch);
   if(!byGroup.has(g))byGroup.set(g,[]);
   byGroup.get(g).push(ch.id);
  }
  const next=Object.create(null);
  for(const [g,ids] of byGroup){
   const allowed=new Set(ids),saved=Array.isArray(prev[g])?prev[g]:[];
   const existing=unique(saved.filter(id=>typeof id==='string'&&allowed.has(id)));
   const known=new Set(existing);
   for(const id of ids)if(!known.has(id)){existing.push(id);known.add(id);}
   next[g]=existing;
  }
  store.channelOrder=next;
  return next;
 }
 function ordered(store,channels,groupOrder){
  const byGroup=store.channelOrder||{},rank=new Map((groupOrder||store.groupOrder||[]).map((g,i)=>[g,i]));
  const orderMaps=new Map();
  const original=new Map((store.channels||[]).map((c,i)=>[c.id,i]));
  const indexed=channels.map((c,i)=>({c,i,g:groupOf(c)}));
  for(const {g} of indexed)if(!orderMaps.has(g))orderMaps.set(g,new Map((byGroup[g]||[]).map((id,i)=>[id,i])));
  indexed.sort((a,b)=>{
   const ga=rank.get(a.g)??Number.MAX_SAFE_INTEGER,gb=rank.get(b.g)??Number.MAX_SAFE_INTEGER;
   if(ga!==gb)return ga-gb;
   if(a.g!==b.g)return a.i-b.i;
   const order=orderMaps.get(a.g),ia=order.get(a.c.id)??(order.size+(original.get(a.c.id)??a.i));
   const ib=order.get(b.c.id)??(order.size+(original.get(b.c.id)??b.i));
   return ia-ib||a.i-b.i;
  });
  return indexed.map(x=>x.c);
 }
 /** Move IDs as one block before/after a channel, or at a zero-based position. */
 function move(store,ids,destination,{anchorId='',after=false,index=null}={}){
  if(!Array.isArray(ids)||!ids.length) return 0;
  const channelMap=new Map((store.channels||[]).map(ch=>[ch.id,ch]));
  const picked=unique(ids).filter(id=>channelMap.has(id));
  if(!picked.length)return 0;
  const dest=String(destination||'').trim();
  if(!dest)throw Error('Chưa chọn thư mục đích');
  reconcile(store);
  const orderedPicked=ordered(store,picked.map(id=>channelMap.get(id)),store.groupOrder).map(c=>c.id);
  const selected=new Set(orderedPicked);
  if(anchorId&&selected.has(anchorId))return 0;
  if(anchorId){const target=channelMap.get(anchorId);if(!target||groupOf(target)!==dest)throw Error('Kênh đích không thuộc thư mục đã chọn');}
  for(const g of Object.keys(store.channelOrder))store.channelOrder[g]=store.channelOrder[g].filter(id=>!selected.has(id));
  const targetOrder=store.channelOrder[dest]||[];
  let at=targetOrder.length;
  if(anchorId){at=targetOrder.indexOf(anchorId)+(after?1:0);}
  else if(index!==null){at=Math.min(targetOrder.length,Math.max(0,Math.trunc(Number(index)||0)));}
  targetOrder.splice(at,0,...orderedPicked);
  store.channelOrder[dest]=targetOrder;
  for(const id of orderedPicked)channelMap.get(id).group=dest;
  return orderedPicked.length;
 }
 function moveFolder(store,from,to){
  const order=Array.isArray(store.groupOrder)?store.groupOrder:[];
  const a=order.indexOf(from),b=order.indexOf(to);
  if(a<0||b<0||a===b)return false;
  const [group]=order.splice(a,1);order.splice(b,0,group);return true;
 }
 function renameFolder(store,from,to){
  if(from===to)return;
  reconcile(store);
  const prior=store.channelOrder[from]||[],existing=store.channelOrder[to]||[];
  for(const c of store.channels||[])if(groupOf(c)===from)c.group=to;
  delete store.channelOrder[from];
  store.channelOrder[to]=unique([...existing,...prior]);
  reconcile(store);
 }
 function pruneSelection(ids,store){const present=new Set((store.channels||[]).map(c=>c.id));return unique((ids||[]).filter(id=>present.has(id)));}
 const api={groupOf,reconcile,ordered,move,moveFolder,renameFolder,pruneSelection};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVChannelOrder=api;
})(typeof window!=='undefined'?window:null);
