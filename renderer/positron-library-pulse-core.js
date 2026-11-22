'use strict';
/* Positron Library Pulse: read-only, local metadata analysis.
 * Never fetch playlists, stream URLs, images or trigger playback.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PositronLibraryPulseCore=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const clean=v=>String(v??'').trim();
 function summarize(input){
  const channels=(Array.isArray(input)?input:[]).filter(c=>c&&typeof c==='object');
  const groups=new Map(),sources=new Map();
  let logoMeta=0,epgId=0,alive=0,dead=0;
  for(const c of channels){
   const group=clean(c.group||c.groupTitle)||'Chưa phân nhóm';
   const source=clean(c.sourceId);
   groups.set(group,(groups.get(group)||0)+1);
   if(source)sources.set(source,(sources.get(source)||0)+1);
   if(clean(c.logo))logoMeta++;
   if(clean(c.tvgId))epgId++;
   if(c.status==='alive')alive++;
   if(c.status==='dead')dead++;
  }
  const sort=(map)=>[...map].map(([name,count])=>({name,count}))
   .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'vi'));
  return {total:channels.length,sources:sources.size,groups:groups.size,
   withLogoMeta:logoMeta,withEpgId:epgId,knownAlive:alive,knownDead:dead,
   groupBreakdown:sort(groups),sourceBreakdown:sort(sources)};
 }
 function pageGroups(groups,limit=5){
  const values=Array.isArray(groups)?groups:[];
  const size=Number.isFinite(limit)?Math.max(0,Math.floor(limit)):5;
  return {rows:values.slice(0,size),remaining:Math.max(0,values.length-size)};
 }
 // P5.1.158: liệt kê kênh thiếu logo bằng metadata đã có, không tải ảnh/mạng.
 function missingLogos(input,{offset=0,limit=10}={}){
  const rows=(Array.isArray(input)?input:[]).filter(c=>c&&typeof c==='object'&&
   clean(c.name)&&!clean(c.logo));
  const start=Number.isFinite(offset)?Math.max(0,Math.floor(offset)):0;
  const count=Number.isFinite(limit)?Math.min(50,Math.max(1,Math.floor(limit))):10;
  return {total:rows.length,offset:start,limit:count,
   rows:rows.slice(start,start+count).map(c=>({
    name:clean(c.name),group:clean(c.group||c.groupTitle)||'Chưa phân nhóm'
   }))};
 }
 return Object.freeze({summarize,pageGroups,missingLogos});
});
