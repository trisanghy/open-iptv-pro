'use strict';
/* WatchFlow ranking: channel and upcoming EPG recommendations on device only. */
(function(root,factory){const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVWatchFlowRecommendations=api;
})(typeof window==='undefined'?globalThis:window,function(){
 const hours=36*60*60*1000;
 const asNumber=v=>Number.isFinite(Number(v))?Number(v):0;
 function channels(channels,analysis,learning={},recent=[],current=null,now=Date.now(),limit=8){
  const list=Array.isArray(channels)?channels:[];
  const seen=new Map((Array.isArray(recent)?recent:[]).map((r,i)=>[String(r?.id||r),i]));
  const seconds=learning?.seconds||{},hour=String(new Date(now).getHours());
  const currentHours=learning?.hours?.[hour]||{};
  const total=Math.max(1,...Object.values(seconds).map(asNumber));
  const hTotal=Math.max(1,...Object.values(currentHours).map(asNumber));
  return list.map((channel,index)=>{
   const meta=analysis?.get?.(String(channel.id))||{};
   const labels=Array.isArray(meta.labels)&&meta.labels.length?meta.labels:[meta.label].filter(Boolean);
   const affinity=Math.max(0,...labels.map(l=>asNumber(seconds[l])/total));
   const time=Math.max(0,...labels.map(l=>asNumber(currentHours[l])/hTotal));
   const recentScore=seen.has(String(channel.id))?Math.max(0,28-seen.get(String(channel.id))*2):0;
   const score=affinity*45+time*20+recentScore+((meta.programme||meta.epgCount)?8:0)+(channel.id===current?.id?4:0);
   const reason=affinity>.1?'Theo sở thích '+labels.join(', '):time>.1?'Hợp khung giờ':recentScore>0?'Đã xem gần đây':meta.programme?'Đang có EPG':'Có trong danh sách';
   return {channel,meta,score,reason,index};
  }).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,Math.max(0,limit));
 }
 function programmes(analysis,allChannels,learning={},recent=[],now=Date.now(),limit=8){
  const byId=new Map((allChannels||[]).map(c=>[String(c.id),c]));
  const recentIds=new Set((recent||[]).map(c=>String(c.id||c)));
  const scores=learning?.seconds||{},max=Math.max(1,...Object.values(scores).map(asNumber));
  const hour=new Date(now).getHours(),hourPref=learning?.hours?.[String(hour)]||{};
  const maxHour=Math.max(1,...Object.values(hourPref).map(asNumber));
  const output=[];
  for(const [channelId,entry] of analysis||[]){
   const channel=byId.get(String(channelId));if(!channel)continue;
   for(const item of entry?.programmes||[]){
    if(!Number.isFinite(item.start)||!Number.isFinite(item.end)||item.end<=now||item.start>now+hours)continue;
    const labels=Array.isArray(item.labels)?item.labels:[];
    const affinity=Math.max(0,...labels.map(l=>asNumber(scores[l])/max));
    const time=Math.max(0,...labels.map(l=>asNumber(hourPref[l])/maxHour));
    const live=item.start<=now;
    const until=Math.max(0,(item.start-now)/60000);
    const freshness=live?35:Math.max(0,26-until/60);
    const score=affinity*50+time*20+freshness+(recentIds.has(channelId)?8:0)+(labels.length?4:0);
    const reason=affinity>.12?'Hợp sở thích '+labels.join(', '):live?'Đang phát sóng':
     time>.12?'Hợp khung giờ':labels.length?'Chủ đề '+labels.join(', '):'Có trong lịch phát';
    output.push({channel,channelId,programme:item,score,reason,live});
   }
  }
  const ids=new Set();
  return output.sort((a,b)=>b.score-a.score||a.programme.start-b.programme.start).filter(x=>{
   const unique=x.channelId+'|'+x.programme.start+'|'+x.programme.title;
   if(ids.has(unique))return false;ids.add(unique);return true;
  }).slice(0,Math.max(0,limit));
 }
 return Object.freeze({channels,programmes});
});
