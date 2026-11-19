// Pure helpers shared by Mobile controls and regression tests.
// URLs are never auto-discovered or supplied by the application.
export function streamOptions(channel, fallbackMap={}){
  if(!channel?.url)return [];
  const strings=[channel.url,...(Array.isArray(fallbackMap[channel.url])?fallbackMap[channel.url]:[])];
  const urls=[...new Set(strings.filter(s=>typeof s==='string'&&/^https?:\/\//i.test(s)))];
  return urls.slice(0,9).map((url,i)=>({url,label:i===0?'Link chính':'Link dự phòng '+i}));
}
export function epgNowNext(items,channelId,nowMillis,parseDate){
  const rows=(Array.isArray(items)?items:[]).filter(p=>(!channelId||p.channel===channelId))
    .map(p=>({...p,startMillis:parseDate(p.start)?.getTime(),stopMillis:parseDate(p.stop)?.getTime()}))
    .filter(p=>Number.isFinite(p.startMillis))
    .sort((a,b)=>a.startMillis-b.startMillis);
  const current=rows.find(p=>p.startMillis<=nowMillis && (Number.isFinite(p.stopMillis)?p.stopMillis>nowMillis:true))||null;
  const following=rows.find(p=>p.startMillis>nowMillis)||null;
  return {current,following};
}
