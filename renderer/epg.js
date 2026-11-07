'use strict';
// XMLTV parsing and matching. No remote HTML is injected into the page.
(function(root){
 const tidy=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(?:hd|fhd|uhd|4k|1080p|720p)\b/g,'').replace(/[^a-z0-9]/g,'').trim();
 function when(raw){
  const m=String(raw||'').match(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*(Z|[+-]\d{4})?/);
  if(!m)return NaN;
  let offset=0;
  if(m[7] && m[7]!=='Z'){const n=m[7];offset=(n[0]==='-'?-1:1)*(Number(n.slice(1,3))*60+Number(n.slice(3,5)));}
  return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))-offset*60000;
 }
 function firstText(el,name){return el.getElementsByTagName(name)[0]?.textContent?.trim()||'';}
 function parse(xml,playlist=[]){
  const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror')||doc.documentElement?.tagName!=='tv')throw Error('XMLTV sai định dạng');
  const allowed=new Set();for(const c of playlist){allowed.add(tidy(c.tvgId));allowed.add(tidy(c.name));}allowed.delete('');
  const names={},matched=new Set();const chans=doc.getElementsByTagName('channel');
  for(const ch of chans){const id=ch.getAttribute('id')||'';const aliases=[id,...Array.from(ch.getElementsByTagName('display-name')).map(el=>el.textContent.trim())];
   if(aliases.some(n=>allowed.has(tidy(n))))matched.add(id);
   for(const n of aliases){const key=tidy(n);if(key && !names[key])names[key]=id;}
  }
  // Fallback to tvg-id matching even when the XMLTV feed has no channel table.
  for(const c of playlist){if(c.tvgId)matched.add(c.tvgId);}
  const now=Date.now(),min=now-12*3600000,max=now+7*86400000,out=[];const items=doc.getElementsByTagName('programme');
  for(const p of items){if(out.length>=8000)break;const ch=p.getAttribute('channel')||'';
   if(!matched.has(ch))continue;
   const start=when(p.getAttribute('start')),end=when(p.getAttribute('stop'));
   if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end<min||start>max)continue;
   out.push({id:ch,start,end,title:firstText(p,'title').slice(0,220)||'Chưa có tên',description:firstText(p,'desc').slice(0,450)});
  }
  out.sort((a,b)=>a.start-b.start);return {names,programmes:out,matchedChannels:matched.size};
 }
 function find(guide,channel){if(!guide||!channel)return [];const id=guide.names?.[tidy(channel.tvgId)]||guide.names?.[tidy(channel.name)]||channel.tvgId;return (guide.programmes||[]).filter(p=>p.id===id);}
 function current(guide,channel,clock=Date.now()){const list=find(guide,channel);return {now:list.find(p=>p.start<=clock&&p.end>clock)||null,next:list.find(p=>p.start>clock)||null};}
 root.IPTVGuide={parse,find,current,when,tidy};
})(typeof window!=='undefined'?window:globalThis);
