'use strict';
// Browser + node test compatible utilities. Do not use remote data or execute playlist metadata.
(function(root){
 const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(hd|fhd|uhd|4k|1080p|720p)\b/g,'').replace(/[^a-z0-9]/g,'');
 const validURL=s=>{try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
 function alternatives(channel,channels=[],manual={}){
  if(!channel)return [];
  const primary=channel.url;const same=channels.filter(c=>c.id!==channel.id&&clean(c.name)===clean(channel.name)).map(c=>c.url);
  return [...new Set([primary,...(manual[channel.id]||[]),...same].filter(validURL))].slice(0,10);
 }
 function catchup(channel,program){
  if(!channel||!program||!channel.catchupSource||!validURL(channel.catchupSource))return null;
  if(!Number.isFinite(program.start)||!Number.isFinite(program.end)||program.end<=program.start)return null;
  const start=Math.floor(program.start/1000),end=Math.floor(program.end/1000),duration=end-start;
  let url=channel.catchupSource;
  const values={start,end,duration,utc:start,lutc:start,timestamp:start};
  // Replace only documented numeric placeholders, never evaluate arbitrary templates.
  url=url.replace(/\{(start|end|duration|utc|lutc|timestamp)\}/gi,(all,key)=>String(values[key.toLowerCase()]));
  return !/[{}]/.test(url)&&validURL(url)?url:null;
 }
 function diagnostics(channels=[],epgMatches=0){
  const urls=new Map(),names=new Map(),issueList=[];
  for(const c of channels){
   const key=clean(c.name);if(!urls.has(c.url))urls.set(c.url,[]);urls.get(c.url).push(c);
   if(!names.has(key))names.set(key,[]);names.get(key).push(c);
   if(!c.tvgId)issueList.push({name:c.name,type:'Thiếu tvg-id',fix:'Thêm mã EPG chính xác vào M3U'});
   if(!c.logo)issueList.push({name:c.name,type:'Thiếu logo',fix:'Thêm tvg-logo nếu có'});
   if(c.status==='dead')issueList.push({name:c.name,type:'Link Die',fix:'Chọn link dự phòng hoặc kiểm tra lại'});
  }
  const duplicateUrls=[...urls.entries()].filter(([,a])=>a.length>1);
  const duplicateNames=[...names.entries()].filter(([,a])=>a.length>1);
  return {total:channels.length,alive:channels.filter(c=>c.status==='alive').length,dead:channels.filter(c=>c.status==='dead').length,uncertain:channels.filter(c=>c.status==='uncertain').length,missingEpgId:channels.filter(c=>!c.tvgId).length,duplicateUrls:duplicateUrls.length,duplicateNames:duplicateNames.length,epgMatches,issues:issueList.slice(0,500)};
 }
 function healthLine(history=[]){const valid=history.filter(e=>['alive','dead','uncertain'].includes(e.status));const n=valid.length;return {checks:n,uptime:n?Math.round(valid.filter(x=>x.status==='alive').length/n*100):null,latest:valid.at(-1)||null};}
 function seekRange(video,seconds=300){if(!video?.seekable?.length)return null;const end=video.seekable.end(video.seekable.length-1),start=video.seekable.start(0);return {start:Math.max(start,end-seconds),end,available:Math.max(0,Math.min(seconds,end-start))};}
 function epgSearch(guide,query){const needle=clean(query);if(!needle)return [];return (guide?.programmes||[]).filter(p=>clean(p.title+' '+(p.description||'')).includes(needle)).slice(0,200);}
 const api={clean,validURL,alternatives,catchup,diagnostics,healthLine,seekRange,epgSearch};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.OpenIPTVAdvancedCore=api;
})(typeof window!=='undefined'?window:globalThis);
