'use strict';
// Safe M3U merge core. No remote network access or GitHub credentials required.
(function(root){
 const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/\b(?:full hd|fhd|hd|sd|uhd|4k|1080p|720p)\b/g,'').replace(/[^a-z0-9]+/g,'').trim();
 const urlOK=s=>{try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
 const pick=(a,b)=>!a&&b?b:a;
 function idFor(key){let h=2166136261;for(let i=0;i<key.length;i++){h=Math.imul(h^key.charCodeAt(i),16777619);}return 'merged|'+(h>>>0).toString(36);}
 function keyFor(c){const name=clean(c.name),id=clean(c.tvgId);if(id.length>=3)return 'id:'+id;
  // Generic channel names are not safe to merge across separate groups.
  const group=clean(c.group);return 'name:'+(name.length<=4?group+'|':'')+name;}
 function rank(ch){return (ch.status==='alive'?100:ch.status==='unchecked'?50:ch.status==='uncertain'?20:0)+(ch.tvgId?10:0)+(ch.logo?5:0);}
 function merge(channels=[]){const out=[],lookup=new Map(),stats={input:channels.length,duplicates:0,alternates:0,invalid:0};
  for(const source of channels){if(!urlOK(source.url)){stats.invalid++;continue;}
   const key=keyFor(source);if(!key.replace(/^(name:|id:)/,'').trim())continue;
   let ch=lookup.get(key);
   if(!ch){ch={...source,id:idFor(key),sourceId:'collector_merged',url:source.url,alternates:[],origins:[source.sourceId||'unknown'],status:source.status||'unchecked'};lookup.set(key,ch);out.push(ch);continue;}
   stats.duplicates++;
   if(!ch.origins.includes(source.sourceId))ch.origins.push(source.sourceId||'unknown');
   const possibilities=new Set([ch.url,...ch.alternates,source.url,...(source.alternates||[])]);
   const winner=rank(source)>rank(ch)?source:ch;
   if(winner===source){ch.url=source.url;ch.status=source.status||'unchecked';ch.checkedAt=source.checkedAt||'';}
   ch.tvgId=pick(ch.tvgId,source.tvgId);ch.logo=pick(ch.logo,source.logo);ch.name=ch.name||source.name;
   ch.alternates=[...possibilities].filter(u=>u!==ch.url && urlOK(u)).slice(0,15);
  }
  stats.unique=out.length;stats.alternates=out.reduce((n,c)=>n+c.alternates.length,0);
  return {channels:out,stats};
 }
 function repaired(ch,results){const checked=results.filter(r=>['alive','dead','uncertain'].includes(r.status));const live=checked.filter(r=>r.status==='alive').sort((a,b)=>(a.latencyMs??1e9)-(b.latencyMs??1e9));
  if(live.length){const winner=live[0],rest=[ch.url,...(Array.isArray(ch.alternates)?ch.alternates:[])].filter(x=>x!==winner.url);return {...ch,url:winner.url,alternates:[...new Set(rest)].slice(0,15),status:'alive',reason:'Đã xác minh luồng; chọn link đang hoạt động',checkedAt:new Date().toISOString()};}
  return {...ch,status:checked.every(r=>r.status==='dead')&&checked.length===1+(ch.alternates||[]).length?'dead':'uncertain',reason:'Không xác minh được link dự phòng; chưa thay đổi URL',checkedAt:new Date().toISOString()};
 }
 function repoURL(raw){const u=new URL(raw);if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password)throw Error('Chỉ nhận URL repository công khai dạng https://github.com/owner/repo');
  const parts=u.pathname.split('/').filter(Boolean);if(parts.length<2||!parts.slice(0,2).every(x=>/^[\w.-]{1,100}$/.test(x)))throw Error('Đường dẫn GitHub chưa đúng');return {owner:parts[0],repo:parts[1].replace(/\.git$/,'')};}
 const api={clean,urlOK,merge,repaired,repoURL,keyFor,idFor};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.OpenIPTVCollector=api;
})(typeof window!=='undefined'?window:globalThis);
