'use strict';
const GROUP_LIVE = '03 - LIVE EVENTS 🔴';
const DEAD_GROUP = '99 - KÊNH LỖI';
function attrs(t) { const o={}; const r=/([\w-]+)="([^"]*)"/g; let m; while((m=r.exec(t)))o[m[1]]=m[2]; return o; }
function parseM3U(content, sourceId='import') {
  const lines=String(content||'').replace(/^\uFEFF/,'').split(/\r?\n/);
  const valid=lines.some(x=>/^#EXTM3U\b/i.test(x.trim())||/^#EXTINF:/i.test(x.trim()));
  if (!valid) throw new Error('Không phải playlist M3U hợp lệ (thiếu #EXTM3U hoặc #EXTINF).');
  const channels=[]; let pending=null;
  for(let i=0;i<lines.length;i++) {
    const s=lines[i].trim();
    if(s.startsWith('#EXTINF:')) {
      const match=s.match(/,(.*)$/); const name=(match?match[1]:'').trim()||'Kênh không tên';
      const data=attrs(s.slice(0,s.indexOf(',')>=0?s.indexOf(','):s.length));
      pending={name,group:data['group-title']||'Khác',logo:data['tvg-logo']||'',tvgId:data['tvg-id']||'',catchup:data['catchup']||'',catchupSource:data['catchup-source']||'',catchupDays:data['catchup-days']||'',status:'unchecked',checkedAt:''};
    } else if(pending && s && !s.startsWith('#')) {
      try { const u=new URL(s); if(!['http:','https:','rtsp:','rtmp:','udp:'].includes(u.protocol)) {pending=null;continue;} } catch {pending=null;continue;}
      channels.push({...pending, url:s,sourceId,id:`${sourceId}|${channels.length}`}); pending=null;
    }
  }
  return channels;
}
function dateLabel(date=new Date()) {
  return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date).replace(',','');
}
function cleanGroup(group) {return String(group||'Khác').replace(/\s*\|\s*(?:Kiểm tra|Kiem tra):?.*$/i,'').trim()||'Khác';}
function exportM3U(channels, time=new Date(), opts={}) {
 const onlyAlive=!!opts.onlyAlive; const stamp=dateLabel(time);
 const out=['#EXTM3U'];
 for(const ch of channels) {
   if(onlyAlive && ch.status!=='alive')continue;
   let group=ch.status==='dead'?DEAD_GROUP:cleanGroup(ch.group);
   if(group===GROUP_LIVE && ch.checkedAt){
      const verified=new Date(ch.checkedAt);
      if(!Number.isNaN(verified.getTime()))group+=` | Kiểm tra: ${dateLabel(verified)}`;
   }
   const escapeAttr=t=>String(t||'').replace(/[\r\n"]/g,' ').trim();
   const name=String(ch.name||'Kênh').replace(/[\r\n]/g,' ');
   out.push(`#EXTINF:-1 tvg-id="${escapeAttr(ch.tvgId)}" tvg-logo="${escapeAttr(ch.logo)}" catchup="${escapeAttr(ch.catchup)}" catchup-source="${escapeAttr(ch.catchupSource)}" catchup-days="${escapeAttr(ch.catchupDays)}" group-title="${escapeAttr(group)}",${name}`);
   out.push(ch.url);
 }
 return out.join('\n')+'\n';
}
function rewriteHls(text, finalUrl, proxy) {
  return String(text).split(/\r?\n/).map(raw=>{
    const s=raw.trim(); if(!s)return raw;
    if(s.startsWith('#'))return raw.replace(/URI="([^"]+)"/g,(_,u)=>{try{return `URI="${proxy(new URL(u, finalUrl).href)}"`;}catch{return `URI="${u}"`;}});
    try{return proxy(new URL(s,finalUrl).href);}catch{return raw;}
  }).join('\n');
}
module.exports={parseM3U, exportM3U, rewriteHls, dateLabel, cleanGroup, GROUP_LIVE, DEAD_GROUP};
