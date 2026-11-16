'use strict';
(function(root){
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/\b(?:hd|fhd|uhd|4k|1080p|720p)\b/g,'').replace(/[^a-z0-9]+/g,'');
 const recent=(date,at=Date.now(),ms=24*3600000)=>{const n=Date.parse(date||'');return Number.isFinite(n)&&n<=at&&at-n<=ms;};
 const validURL=s=>{try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
 function grade(channel,history=[],now=Date.now()){
  const valid=(Array.isArray(history)?history:[]).filter(e=>e&&recent(e.date,now,7*86400000));
  const samples=valid.filter(e=>['probe','playback','live','error','freeze'].includes(e.type));
  const proofs=samples.filter(e=>e.status==='alive'&&['probe','playback','live'].includes(e.type));
  const lastPositive=proofs.findLast(e=>recent(e.date,now));
  const failures=samples.filter(e=>e.status==='dead'||e.type==='error'||e.level==='freeze-confirmed');
  const starts=samples.filter(e=>Number.isFinite(e.startupMs)&&e.startupMs>=0).map(e=>e.startupMs);
  const latencies=samples.filter(e=>Number.isFinite(e.latencyMs)&&e.latencyMs>=0).map(e=>e.latencyMs);
  const latency=latencies.length?Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length):null;
  const startup=starts.length?Math.round(starts.reduce((a,b)=>a+b,0)/starts.length):null;
  const stalls=samples.reduce((n,e)=>n+(Number.isInteger(e.stalls)&&e.stalls>0?Math.min(e.stalls,50):0),0);
  const confirmedRecent=Boolean(lastPositive)||(channel.status==='alive'&&recent(channel.checkedAt,now));
  // Ranking is an evidence-weighted heuristic, NOT a measured uptime percentage.
  let score=35+(confirmedRecent?35:0)+Math.min(15,proofs.length*3)-Math.min(35,failures.length*8)-Math.min(12,stalls*2);
  if(latency!==null)score-=latency>8000?14:latency>3500?8:latency>1500?3:-5;
  if(startup!==null)score-=startup>15000?12:startup>7000?7:startup>3000?3:-5;
  score=Math.max(0,Math.min(100,Math.round(score)));
  return {score,confidence:samples.length>=5?'moderate':samples.length>=2?'low':'insufficient',sampleCount:samples.length,proofCount:proofs.length,failureCount:failures.length,latencyMs:latency,startupMs:startup,stalls,recentAlive:confirmedRecent,label:confirmedRecent?'Đã xác minh gần đây':channel.status==='dead'?'Cần kiểm tra lại':'Chưa xác minh'};
 }
 function sameChannel(a,b){
  if(!a||!b||a.id===b.id||a.url===b.url)return false;
  const aid=normalize(a.tvgId),bid=normalize(b.tvgId),an=normalize(a.name),bn=normalize(b.name);
  if(aid.length>=3&&bid.length>=3)return aid===bid;
  const aGroup=normalize(a.group),bGroup=normalize(b.group);
  const aLogo=String(a.logo||''),bLogo=String(b.logo||'');
  return an.length>=8&&an===bn&&((aGroup.length>=4&&aGroup===bGroup)||(aLogo&&aLogo===bLogo));
 }
 function suggestions(channels=[],health={},now=Date.now()){
  const report=channels.map(c=>({channel:c,metric:grade(c,health[c.url],now)}));
  const found=[];
  const byId=new Map(),byName=new Map();
  const index=(map,key,value)=>{if(!key)return;const list=map.get(key)||[];list.push(value);map.set(key,list);};
  for(const entry of report){
   const c=entry.channel;
   const id=normalize(c.tvgId),name=normalize(c.name);
   if(id.length>=3)index(byId,id,entry);
   if(name.length>=8)index(byName,name,entry);
  }
  for(const left of report){
   const c=left.channel;const id=normalize(c.tvgId),name=normalize(c.name);
   const pool=[...(id.length>=3?byId.get(id)||[]:[]),...(name.length>=8?byName.get(name)||[]:[])];
   const checked=new Set(),options=[];
   for(const right of pool){if(checked.has(right.channel.id))continue;checked.add(right.channel.id);
    if(sameChannel(c,right.channel)&&validURL(right.channel.url)&&right.metric.recentAlive)options.push(right);
   }
   options.sort((a,b)=>b.metric.score-a.metric.score);
   if(options.length&&(!left.metric.recentAlive||left.metric.score+12<options[0].metric.score)){
    found.push({kind:'backup',channelId:c.id,targetId:options[0].channel.id,url:options[0].channel.url,score:options[0].metric.score,reason:'Nguồn cùng tên/tvg-id đã được xác minh trong 24 giờ; chỉ đề xuất thêm link dự phòng, không thay URL chính'});
   }
   if(c.status==='dead'&&left.metric.recentAlive){found.push({kind:'recheck',channelId:c.id,score:92,reason:'Nhật ký phát gần đây mâu thuẫn với trạng thái Die; hãy kiểm tra lại'});}
   if(!c.tvgId){found.push({kind:'metadata',channelId:c.id,score:35,reason:'Thiếu tvg-id để ghép EPG'});}
  }
  return {ranked:report.sort((a,b)=>b.metric.score-a.metric.score),actions:found.sort((a,b)=>b.score-a.score)};
 }
 const api={normalize,recent,validURL,grade,sameChannel,suggestions};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.OpenIPTVDoctorV3=api;
})(typeof window!=='undefined'?window:globalThis);
