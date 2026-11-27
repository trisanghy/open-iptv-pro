'use strict';
/* Web channel search: diacritics-insensitive, typo-tolerant and XMLTV-aware.
 * Never changes M3U/EPG or creates remote network requests. EPG is indexed
 * once per guide revision, rather than rescanned on every keystroke. */
(function(root,build){
 const api=build();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVChannelSearch=api;
})(typeof window!=='undefined'?window:null,function(){
 const emptyIndex={byId:new Map(),aliases:new Map()};
 const cache=new WeakMap();
 function normalize(text){
  return String(text||'').normalize('NFD')
   .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D')
   .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 }
 function compact(text){return normalize(text).replace(/\s+/g,'');}
 function words(text){return normalize(text).split(' ').filter(Boolean);}
 function tidy(text){
  return normalize(text).replace(/\b(?:hd|fhd|uhd|4k|1080p|720p)\b/g,'').replace(/\s+/g,'');
 }
 function distance(a,b,limit=1){
  if(a===b)return 0;
  if(!a||!b||Math.abs(a.length-b.length)>limit)return limit+1;
  // Bounded Damerau-Levenshtein, including adjacent swapped letters.
  const matrix=Array.from({length:a.length+1},()=>new Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++)matrix[i][0]=i;
  for(let j=0;j<=b.length;j++)matrix[0][j]=j;
  for(let i=1;i<=a.length;i++){
   let min=limit+1;
   for(let j=1;j<=b.length;j++){
    let cost=a[i-1]===b[j-1]?0:1;
    let value=Math.min(matrix[i-1][j]+1,matrix[i][j-1]+1,matrix[i-1][j-1]+cost);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])value=Math.min(value,matrix[i-2][j-2]+1);
    matrix[i][j]=value;
    if(value<min)min=value;
   }
   if(min>limit)return limit+1;
  }
  return matrix[a.length][b.length];
 }
 function near(queryTokens,textTokens){
  if(!queryTokens.length||!textTokens.length)return false;
  const set=new Set(textTokens);
  const allowShort=queryTokens.length>1;
  return queryTokens.every(q=>{
   if(set.has(q)||textTokens.some(t=>t.startsWith(q)&&q.length>=3))return true;
   if(q.length<(allowShort?2:4))return false;
   const edits=q.length>=8?2:1;
   return textTokens.some(t=>Math.abs(t.length-q.length)<=edits&&distance(q,t,edits)<=edits);
  });
 }
 function indexGuide(guide,now=Date.now()){
  if(!guide||!Array.isArray(guide.programmes))return emptyIndex;
  const programmes=guide.programmes;
  const hour=Math.floor(now/3600000);
  const old=cache.get(guide);
  if(old&&old.programmes===programmes&&old.count===programmes.length&&old.hour===hour)return old.index;
  const byId=new Map(),aliases=new Map();
  const min=now-3600000,max=now+8*86400000;
  // Only future/current titles from the bounded XMLTV schedule are indexed.
  for(const programme of programmes){
   if(!programme||typeof programme.id!=='string'||!programme.id||typeof programme.title!=='string')continue;
   if(!Number.isFinite(programme.start)||!Number.isFinite(programme.end)||programme.end<min||programme.start>max)continue;
   let bucket=byId.get(programme.id);
   if(!bucket){bucket={entries:[],text:'',tokens:[]};byId.set(programme.id,bucket);}
   if(bucket.entries.length>=650)continue;
   const text=normalize(programme.title+' '+String(programme.description||'').slice(0,96));
   if(!text)continue;
   bucket.entries.push({title:programme.title,start:programme.start,end:programme.end,text,tokens:words(text)});
  }
  for(const bucket of byId.values()){
   bucket.text=bucket.entries.map(p=>p.text).join(' | ');
   bucket.tokens=[...new Set(bucket.entries.flatMap(p=>p.tokens))];
  }
  for(const [id,labels] of Object.entries(guide.aliasesById||{})){
   const candidates=[id,...(Array.isArray(labels)?labels:[])];
   for(const label of candidates){const key=tidy(label);if(key&&!aliases.has(key))aliases.set(key,id);}
  }
  const index={byId,aliases};
  cache.set(guide,{programmes,count:programmes.length,hour,index});
  return index;
 }
 function programmeBucket(index,guide,channel){
  const mapping=guide?.manualMappings?.[channel.id];
  const tvg=String(channel.tvgId||'');
  const names=guide?.names||{};
  const lookup=[mapping,tvg,names[tidy(tvg)],names[tidy(channel.name)],index.aliases.get(tidy(tvg)),index.aliases.get(tidy(channel.name))];
  for(const id of lookup){if(id&&index.byId.has(id))return index.byId.get(id);}
  return null;
 }
 function exactProgramme(bucket,query,queryTokens){
  if(!bucket)return null;
  if(!bucket.text.includes(query)){
   // Match all words in the SAME programme; never combine unrelated titles.
   return bucket.entries.find(entry=>queryTokens.every(w=>entry.tokens.some(t=>t===w||t.startsWith(w)&&w.length>=3)))||null;
  }
  return bucket.entries.find(entry=>entry.text.includes(query))||
   bucket.entries.find(entry=>queryTokens.every(w=>entry.tokens.some(t=>t===w||t.startsWith(w)&&w.length>=3)))||null;
 }
 function approximateProgramme(bucket,queryTokens){
  if(!bucket)return null;
  if(!near(queryTokens,bucket.tokens))return null;
  return bucket.entries.find(entry=>near(queryTokens,entry.tokens))||null;
 }
 function search(channels,query,guide,{clock=Date.now(),categoryFor=null}={}){
  const list=Array.isArray(channels)?channels:[];
  const q=normalize(query),qcompact=compact(query),qTokens=words(query);
  if(!q)return {channels:list,matches:new Map(),approximate:false,usedEPG:false};
  const index=indexGuide(guide,clock);
  const exact=[],candidates=[],fuzzy=[],matches=new Map();
  let usedEPG=false;
  for(const channel of list){
   const title=normalize(channel.name),group=normalize(channel.group);
   const id=normalize(channel.tvgId);
   const extra=typeof categoryFor==='function'?normalize(categoryFor(channel)):'';
   const metadata=[title,group,id,extra].filter(Boolean);
   const exactMeta=metadata.some(text=>text.includes(q))||
    (qcompact.length>=3&&metadata.some(text=>text.replace(/\s+/g,'').includes(qcompact)))||
    qTokens.every(t=>metadata.some(text=>words(text).some(w=>w===t||w.startsWith(t)&&t.length>=3)));
   const bucket=programmeBucket(index,guide,channel);
   const programme=exactProgramme(bucket,q,qTokens);
   if(exactMeta||programme){
    const match={type:exactMeta?'channel':'epg',programme:programme?.title||'',start:programme?.start||0};
    exact.push(channel);matches.set(String(channel.id),match);
    if(programme)usedEPG=true;
    continue;
   }
   candidates.push({channel,metadata,bucket});
  }
  // Do not run fuzzy edit-distance calculations at all when exact matches exist.
  if(exact.length)return {channels:exact,matches,approximate:false,usedEPG};
  for(const {channel,metadata,bucket} of candidates){
   const metadataTokens=[...new Set(metadata.flatMap(words))];
   if(near(qTokens,metadataTokens)){
    fuzzy.push({channel,match:{type:'near',programme:'',start:0}});
    continue;
   }
   const nearby=approximateProgramme(bucket,qTokens);
   if(nearby)fuzzy.push({channel,match:{type:'near-epg',programme:nearby.title,start:nearby.start}});
  }
  return {channels:fuzzy.map(x=>x.channel),matches:new Map(fuzzy.map(x=>[String(x.channel.id),x.match])),
   approximate:fuzzy.length>0,usedEPG:fuzzy.some(x=>x.match.type==='near-epg')};
 }
 return Object.freeze({normalize,compact,words,distance,near,indexGuide,search});
});
