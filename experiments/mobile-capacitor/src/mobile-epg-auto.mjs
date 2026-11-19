// Default EPG sources align with Open IPTV Pro Web's Vietnamese guide builder.
// Only guide metadata is fetched. No IPTV channels or unlicensed streams are bundled.
export const EPG_DEFAULT_SOURCES=Object.freeze([
 {id:'epgshare-vn',name:'EPGShare01 · Việt Nam',url:'https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz',enabled:true},
 {id:'xmltv-vn',name:'xmltv.live · Việt Nam',url:'https://xmltv.live/epg/vn.xml.gz',enabled:true},
 {id:'web-vn',name:'Việt Nam · Web/Rust Lab (XMLTV)',url:'https://raw.githubusercontent.com/trisanghy/open-iptv-pro/web/online/epg/vn.xml',enabled:true},
]);
export function guideSources(existing){
 const saved=Array.isArray(existing)?existing:[];
 const byID=new Map(saved.filter(x=>x&&typeof x.id==='string').map(x=>[x.id,x]));
 const defaults=EPG_DEFAULT_SOURCES.map(x=>({...x,enabled:byID.has(x.id)?byID.get(x.id).enabled!==false:x.enabled}));
 const extra=saved.filter(x=>x&&typeof x.id==='string'&&!EPG_DEFAULT_SOURCES.some(d=>d.id===x.id)&&typeof x.url==='string');
 return [...defaults,...extra.slice(0,12)];
}
export function sanitizeGuideURL(value){
 const u=new URL(String(value||'').trim());
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('URL EPG phải là HTTP/HTTPS không chứa thông tin đăng nhập');
 return u.href;
}
export function epgKey(v){
 // VTV3 (Nguồn 1), VTV3 [Source 2], and VTV3 HD must all match XMLTV VTV3.
 return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/\b(?:hd|fhd|uhd|4k)\b/g,'')
  .replace(/(?:\s*[([]\s*)?(?:nguon|source|server|link)\s*\d+(?:\s*[)\]])?\s*$/gi,'')
  .replace(/[^a-z0-9]/g,'');
}
export function matchGuideChannel(cache,channel){
 if(!cache||!channel)return '';
 const keys=[channel.tvgId,channel.name].flatMap(value=>{
  const id=String(value||'').trim(),normalized=epgKey(id);
  return [normalized,epgKey(id.replace(/\.(?:vn|tv)$/i,''))].filter(Boolean);
 });
 const known=new Set((cache.items||[]).map(x=>x.channel));
 // An unknown tvg-id must not override a recognizable channel name.
 for(const key of keys){const alias=cache.aliases?.[key];if(alias&&(!known.size||known.has(alias)))return alias;}
 if(channel.tvgId&&known.has(channel.tvgId))return channel.tvgId;
 return '';
}
export function resumeChannel(channels,resumeURL,autoplay=true){
 if(!autoplay||!resumeURL||!Array.isArray(channels))return null;
 return channels.find(c=>c.url===resumeURL)||null;
}
export function makeEPGCache(xml,parseDate,clock=Date.now(),maxProgrammes=5000){
 if(typeof xml!=='string'||!/<tv(?:\s|>)/i.test(xml)||xml.length>35*1024*1024)throw Error('EPG không phải XMLTV hợp lệ hoặc quá 35MB');
 const doc=new DOMParser().parseFromString(xml,'application/xml');
 if(doc.querySelector('parsererror')||doc.documentElement?.localName!=='tv')throw Error('XMLTV không đúng định dạng');
 const aliases={};
 for(const c of doc.getElementsByTagName('channel')){
  const id=c.getAttribute('id')||'';if(!id)continue;
  for(const value of [id,...[...c.getElementsByTagName('display-name')].map(n=>n.textContent?.trim()||'')]){
   const key=epgKey(value);if(key&&!aliases[key])aliases[key]=id;
  }
 }
 const rows=[],low=clock-2*86400000,high=clock+7*86400000;
 for(const p of doc.getElementsByTagName('programme')){
  const start=p.getAttribute('start')||'',stop=p.getAttribute('stop')||'',dt=parseDate(start);
  if(!dt||!Number.isFinite(dt.getTime())||dt.getTime()<low||dt.getTime()>high)continue;
  const end=parseDate(stop);
  if(end&&Number.isFinite(end.getTime())&&end.getTime()<clock-12*3600000)continue;
  const channel=p.getAttribute('channel')||'',title=p.getElementsByTagName('title')[0]?.textContent?.trim()||'Chưa có tên';
  if(!channel)continue;
  rows.push({channel,start,stop,title:title.slice(0,220)});
  // Collect all relevant programmes first, then cap using time proximity; do not
  // discard later XMLTV channels just because earlier channels fill the cap.
 }
 // Prefer current/future schedules while retaining some recent entries for each channel.
 // A single large channel must not crowd out all other channel guides.
 const buckets=new Map();
 for(const item of rows){if(!buckets.has(item.channel))buckets.set(item.channel,[]);buckets.get(item.channel).push(item);}
 const channelLimit=Math.max(8,Math.floor(maxProgrammes/Math.max(1,buckets.size)));
 const selected=[],overflow=[];
 for(const list of buckets.values()){
  list.sort((a,b)=>Math.abs(parseDate(a.start).getTime()-clock)-Math.abs(parseDate(b.start).getTime()-clock));
  selected.push(...list.slice(0,channelLimit));overflow.push(...list.slice(channelLimit));
 }
 if(selected.length<maxProgrammes)selected.push(...overflow.sort((a,b)=>Math.abs(parseDate(a.start).getTime()-clock)-Math.abs(parseDate(b.start).getTime()-clock)).slice(0,maxProgrammes-selected.length));
 selected.sort((a,b)=>parseDate(a.start).getTime()-parseDate(b.start).getTime());
 return {items:selected.slice(0,maxProgrammes),aliases,updatedAt:new Date(clock).toISOString()};
}

/**
 * Detect an outdated XMLTV feed. Successful HTTP/parse is not evidence of a
 * usable TV guide; guides must contain programs spanning now or upcoming.
 */
export function guideCoverage(guide,now=Date.now(),parseDate){
 let current=0,upcoming=0,latest=0;
 for(const p of guide?.items||[]){
  const start=parseDate(p.start)?.getTime(),stop=parseDate(p.stop)?.getTime();
  if(!Number.isFinite(start))continue;
  if(Number.isFinite(stop))latest=Math.max(latest,stop);
  if(start<=now && Number.isFinite(stop)&&stop>now)current++;
  else if(start>now && start<now+36*3600000)upcoming++;
 }
 return {current,upcoming,latest,usable:current>0||upcoming>0};
}
