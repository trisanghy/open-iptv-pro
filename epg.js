'use strict';
// XMLTV parsing and matching. No remote HTML is injected into the page.
(function(root){
 const tidy=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s*\((?:nguon|source)\s*\d+\)\s*$/,'').replace(/\b(?:hd|fhd|uhd|4k|1080p|720p)\b/g,'').replace(/[^a-z0-9]/g,'').trim();
 function when(raw){
  const m=String(raw||'').match(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*(Z|[+-]\d{4})?/);
  if(!m)return NaN;
  let offset=0;
  if(m[7] && m[7]!=='Z'){const n=m[7];offset=(n[0]==='-'?-1:1)*(Number(n.slice(1,3))*60+Number(n.slice(3,5)));}
  return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))-offset*60000;
 }
 function firstText(el,name){return el.getElementsByTagName(name)[0]?.textContent?.trim()||'';}
 // VNEPG often carries the film's actual name/episode in <desc> while
 // <title> contains only a generic category such as "Phim truyện".
 // Prefer a clearly identified film title; never turn a plot synopsis into one.
 function detailedTitle(title,description,subtitle=''){
  const label=String(title||'').trim()||'Chưa có tên';
  if(!/^phim(?:\s+(?:truy[eệ]n|vi[eệ]t|n[uư]ớc ngo[aạ]i|ho[aạ]t h[iì]nh))?(?:\s*\([^)\n]{1,35}\))?$/iu.test(label))return label;
  for(const raw of [subtitle,description]){
   const candidate=String(raw||'').trim().replace(/^t[eê]n phim\s*[:\-]\s*/iu,'').replace(/^phim truy[eệ]n\s*:\s*/iu,'').trim();
   // A specific episode marker and series name are strong enough evidence.
   if(candidate.length<9||candidate.length>150||/[\r\n!?;]/.test(candidate)||/[.]\s+\S/u.test(candidate))continue;
   if(!/^.{4,110}\s*[-–—:]\s*(?:t[aậ]p|ph[aầ]n)\s*\d{1,4}(?:$|[\s,.):\-–—])/iu.test(candidate))continue;
   return label+': '+candidate;
  }
  return label;
 }
 function parse(xml,playlist=[]){
  const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror')||doc.documentElement?.tagName!=='tv')throw Error('XMLTV sai định dạng');
  const wanted=new Set();for(const c of playlist){wanted.add(tidy(c.tvgId));wanted.add(tidy(c.name));}wanted.delete('');
  const names={},aliasesById={},matched=new Set();const chans=doc.getElementsByTagName('channel');
  for(const ch of chans){const id=ch.getAttribute('id')||'';const aliases=[id,...Array.from(ch.getElementsByTagName('display-name')).map(el=>el.textContent.trim())].filter(Boolean);
   aliasesById[id]=aliases;
   if(aliases.some(n=>wanted.has(tidy(n))))matched.add(id);
   for(const n of aliases){const key=tidy(n);if(key && !names[key])names[key]=id;}
  }
  for(const c of playlist){if(c.tvgId && aliasesById[c.tvgId])matched.add(c.tvgId);}
  const now=Date.now(),min=now-7*86400000,max=now+7*86400000,out=[];const items=doc.getElementsByTagName('programme');
  // Process the entire validated time window; XML ordering must not hide later channels.
  for(const p of items){const ch=p.getAttribute('channel')||'';
   if(!matched.has(ch) && aliasesById[ch]===undefined)continue;
   const start=when(p.getAttribute('start')),end=when(p.getAttribute('stop'));
   if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end<min||start>max)continue;
   const description=firstText(p,'desc').slice(0,450);
   const title=detailedTitle(firstText(p,'title').slice(0,220),description,firstText(p,'sub-title').slice(0,150));
   out.push({id:ch,start,end,title,description});
  }
  out.sort((a,b)=>a.start-b.start);return {names,aliasesById,programmes:out,matchedChannels:matched.size};
 }
 function resolveId(guide,channel){
  if(!guide||!channel)return '';
  const targets=[tidy(channel.tvgId),tidy(channel.name)].filter(Boolean);
  if(targets[0]&&guide.names?.[targets[0]])return guide.names[targets[0]];
  if(targets[1]&&guide.names?.[targets[1]])return guide.names[targets[1]];
  let bestId=channel.tvgId||'',bestScore=0;
  for(const [id,aliases] of Object.entries(guide.aliasesById||{})){
   for(const raw of aliases){const alias=tidy(raw);if(!alias)continue;let score=0;
    if(targets[0] && (alias===targets[0]||tidy(id)===targets[0]))score=Math.max(score,120);
    if(targets[1] && alias===targets[1])score=Math.max(score,100);
    if(targets[1] && (alias.startsWith(targets[1])||targets[1].startsWith(alias)))score=Math.max(score,80);
    if(targets[1] && (alias.includes(targets[1])||targets[1].includes(alias)))score=Math.max(score,65);
    if(score>bestScore){bestScore=score;bestId=id;}
   }
  }
  return bestId;
 }
 const programmeIndexes=new WeakMap();
 function programmesByChannel(guide){
  const programmes=guide.programmes||[];
  const cached=programmeIndexes.get(guide);
  if(cached&&cached.programmes===programmes&&cached.length===programmes.length)return cached.index;
  const index=new Map();
  for(const programme of programmes){
   if(!index.has(programme.id))index.set(programme.id,[]);
   index.get(programme.id).push(programme);
  }
  for(const list of index.values())list.sort((a,b)=>a.start-b.start);
  programmeIndexes.set(guide,{programmes,length:programmes.length,index});
  return index;
 }
 function find(guide,channel){
  if(!guide||!channel)return [];
  const id=guide.manualMappings?.[channel.id]||resolveId(guide,channel);
  const adjust=Math.max(-720,Math.min(720,Number(guide.offsetMinutes)||0))*60000;
  const programmes=programmesByChannel(guide).get(id)||[];
  // Upgrade older cached guides in memory without forcing a network refresh.
  return programmes.map(p=>{
   const title=detailedTitle(p.title,p.description,p.subtitle);
   return adjust||title!==p.title?{...p,title,start:p.start+adjust,end:p.end+adjust}:p;
  });
 }
 function current(guide,channel,clock=Date.now()){const list=find(guide,channel);return {now:list.find(p=>p.start<=clock&&p.end>clock)||null,next:list.find(p=>p.start>clock)||null};}
 root.IPTVGuide={parse,find,current,when,tidy,detailedTitle};
})(typeof window!=='undefined'?window:globalThis);
