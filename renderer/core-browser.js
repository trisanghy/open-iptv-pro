'use strict';
(function(){
 function attrs(s){let o={};for(const m of s.matchAll(/([\w-]+)="([^"]*)"/g))o[m[1]]=m[2];return o;}
 function parseM3U(content,sourceId='file'){
  const lines=String(content||'').replace(/^\uFEFF/,'').split(/\r?\n/);if(!lines.some(s=>/^#EXTM3U\b|^#EXTINF:/i.test(s.trim())))throw Error('File không phải danh sách M3U hợp lệ');
  const out=[];let meta=null;for(const s0 of lines){const s=s0.trim();if(/^#EXTINF:/i.test(s)){const p=s.indexOf(',');const a=attrs(p>0?s.slice(0,p):s);meta={name:(p>0?s.slice(p+1).trim():'')||'Kênh chưa có tên',group:a['group-title']||'Khác',logo:a['tvg-logo']||'',tvgId:a['tvg-id']||'',status:'unchecked',checkedAt:''};}else if(meta&&s&&!s.startsWith('#')){try{const u=new URL(s);if(!['http:','https:','rtsp:','rtmp:','udp:'].includes(u.protocol)){meta=null;continue;}}catch{meta=null;continue}out.push({...meta,url:s,sourceId,id:sourceId+'|'+out.length});meta=null;}}
  return out;
 }
 function stamp(){return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).replace(',','');}
 function exportM3U(channels,onlyAlive=false){const out=['#EXTM3U'];for(const c of channels){if(onlyAlive&&c.status!=='alive')continue;let group=c.status==='dead'?'99 - KÊNH LỖI':(c.group||'Khác').replace(/\s*\|\s*(?:Kiểm tra|Kiem tra):?.*$/i,'').trim();if(group==='03 - LIVE EVENTS 🔴' && c.checkedAt){const d=new Date(c.checkedAt);if(!Number.isNaN(d.getTime()))group+=' | Kiểm tra: '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d).replace(',','');}const safe=s=>String(s||'').replace(/["\r\n]/g,' ');out.push(`#EXTINF:-1 tvg-id="${safe(c.tvgId)}" tvg-logo="${safe(c.logo)}" group-title="${safe(group)}",${safe(c.name)}`);out.push(c.url);}return out.join('\n')+'\n';}
 window.StreamLeafCore={parseM3U,exportM3U,cleanGroup:g=>String(g||'Khác').replace(/\s*\|\s*(?:Kiểm tra|Kiem tra):?.*$/i,'').trim()||'Khác'};
})();
