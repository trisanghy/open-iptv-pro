'use strict';
/* Positron WatchFlow: local-only, deterministic channel suggestions.
 * No network calls, no synthetic EPG, no playlist mutations.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PositronWatchFlowCore=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const words={
  news:/\b(news|thoi su|tin tuc|vtv1|vtc1|cnn|bbc|cnbc|al jazeera|euronews)\b/,
  sport:/\b(sport|sports|the thao|bong da|football|soccer|tennis|espn|f1|nba|fox sports)\b/,
  cinema:/\b(film|films|phim|movie|cinema|hbo|starmovies|action movies|drama)\b/,
  kids:/\b(kids|child|children|thieu nhi|hoat hinh|cartoon|disney|nickelodeon|baby)\b/,
  music:/\b(music|am nhac|ca nhac|mtv|vh1|concert|karaoke)\b/
 };
 const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const category=channel=>{
  const value=normalize([channel?.group,channel?.groupTitle,channel?.name].filter(Boolean).join(' '));
  for(const [key,pattern] of Object.entries(words))if(pattern.test(value))return key;
  return 'other';
 };
 const valid=channel=>!!(channel&&channel.id&&String(channel.name||'').trim()&&typeof channel.url==='string'&&channel.url.trim());
 function rank(channels,{mode='all',seen=[],limit=3,now=Date.now()}={}){
  const history=new Set((Array.isArray(seen)?seen:[]).map(String));
  const eligible=(Array.isArray(channels)?channels:[]).filter(ch=>valid(ch)&&ch.status!=='dead'&&(mode==='all'||category(ch)===mode));
  const unseen=eligible.filter(ch=>!history.has(String(ch.id)));
  const pool=unseen.length?unseen:eligible;
  const result=pool.map(ch=>{
   const checked=Date.parse(ch.checkedAt||'');
   const played=Date.parse(ch.lastPlaybackAt||'');
   const fresh=Number.isFinite(checked)&&checked<=now&&now-checked<7*86400000;
   let score=ch.status==='alive'?100:ch.status==='uncertain'?45:55;
   if(ch.status==='alive'&&fresh)score+=18;
   if(Number.isFinite(played)&&played<=now){
    const days=(now-played)/86400000;
    score+=days<1?22:days<7?12:days<30?4:0;
   }
   const reasons=[];
   if(ch.status==='alive')reasons.push('Đã có bằng chứng phát được');
   else reasons.push('Chưa xác minh khả năng phát');
   if(Number.isFinite(played)&&played<=now&&now-played<30*86400000)reasons.push('Từng xem trên thiết bị');
   if(fresh&&ch.status==='alive')reasons.push('Kiểm tra gần đây');
   return {id:String(ch.id),name:String(ch.name),group:String(ch.group||ch.groupTitle||''),category:category(ch),status:ch.status||'unchecked',score,reason:reasons.join(' · ')};
  }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'vi'));
  const n=Math.min(6,Math.max(1,Math.trunc(Number(limit)||3)));
  return {items:result.slice(0,n),available:eligible.length,unseen:unseen.length,mode,exhausted:eligible.length>0&&unseen.length===0};
 }
 return Object.freeze({rank,normalize,category});
});
