'use strict';
/* Positron Intelligence: EPG-grounded topics + bounded, explainable online logistic model.
 * Offline by default. No stream URL, M3U or viewing history is sent to network.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PositronIntelligenceCore=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const KINDS=Object.freeze({
  news:'Tin tức',sport:'Thể thao',cinema:'Phim',kids:'Thiếu nhi',
  music:'Âm nhạc',documentary:'Tài liệu',education:'Giáo dục',
  lifestyle:'Đời sống',entertainment:'Giải trí',other:'Khác'
 });
 const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d')
  .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const RULES={
  news:/\b(tin tuc|thoi su|news|ban tin|chinh tri|thoi tiet|economy|kinh te|breaking|bao chi)\b/,
  sport:/\b(the thao|bong da|football|soccer|tennis|nba|cau long|vo thuat|bong chuyen|the van hoi|premier league|champions league|f1|giai dau|sport)\b/,
  cinema:/\b(phim|movie|cinema|film|drama|dien anh|truyen hinh dai tap|tinh cam|hanh dong)\b/,
  kids:/\b(thieu nhi|hoat hinh|cartoon|kids|children|disney|manga|anime|mam non)\b/,
  music:/\b(am nhac|ca nhac|music|concert|bai hat|giai dieu|karaoke|live show)\b/,
  documentary:/\b(tai lieu|documentary|thien nhien|dong vat hoang da|kham pha the gioi|science|khoa hoc)\b/,
  education:/\b(giao duc|hoc tap|hoc tieng|education|bai giang|truong hoc|hoc sinh|sinh vien)\b/,
  lifestyle:/\b(am thuc|nau an|du lich|travel|suc khoe|gia dinh|noi that|lifestyle|lam dep|doi song)\b/,
  entertainment:/\b(giai tri|game show|truyen hinh thuc te|reality show|hai kich|gameshow|talk show|comedy)\b/
 };
 const keys=Object.keys(RULES);
 function subject(text){
  const value=normalize(text),result={};
  if(!value)return result;
  for(const key of keys)if(RULES[key].test(value))result[key]=1;
  return result;
 }
 function metadataTopic(channel){
  const clues=subject([channel?.group,channel?.groupTitle,channel?.name].filter(Boolean).join(' '));
  // Metadata is only a fallback and must never be presented as an EPG fact.
  const key=Object.keys(clues)[0]||'other';
  return {key,confidence:key==='other'?0:0.35,source:'metadata'};
 }
 function topicFor(channel,guide,api,clock=Date.now(),web=null){
  const base=metadataTopic(channel),topics={};
  let count=0,nowTitle='',nextTitle='',epgMatched=false;
  if(guide&&typeof api?.find==='function'){
   let entries=[];try{entries=api.find(guide,channel)||[];}catch{}
   for(const row of entries){
    if(!row||!Number.isFinite(row.start)||!Number.isFinite(row.end)||row.end<=row.start
     ||row.end<=clock||row.start>clock+8*3600000)continue;
    if(++count>24)break;
    epgMatched=true;
    const live=row.start<=clock&&row.end>clock;
    if(live&&!nowTitle)nowTitle=String(row.title||'').slice(0,140);
    else if(row.start>clock&&!nextTitle)nextTitle=String(row.title||'').slice(0,140);
    const found=subject(String(row.title||'')+' '+String(row.description||'').slice(0,220));
    const value=live?4:1.5;
    for(const kind of Object.keys(found))topics[kind]=(topics[kind]||0)+value;
   }
  }
  const ordered=Object.entries(topics).sort((a,b)=>b[1]-a[1]);
  if(ordered.length){
   const total=ordered.reduce((sum,x)=>sum+x[1],0);
   return {key:ordered[0][0],label:KINDS[ordered[0][0]],confidence:Math.min(0.96,ordered[0][1]/total),
    source:'epg',epgMatched,count,nowTitle,nextTitle,topics:ordered.slice(0,3).map(([key,value])=>({key,value}))};
  }
  const online=web&&typeof web==='object'&&web.key&&KINDS[web.key]&&web.confidence>=0.7?web:null;
  const fallback=online?{key:online.key,source:'web',confidence:Math.min(0.85,online.confidence)}:base;
  return {...fallback,label:KINDS[fallback.key],epgMatched,count,nowTitle,nextTitle,topics:[]};
 }
 function features(channel,topic,date=new Date()){
  const d=date instanceof Date&&Number.isFinite(date.getTime())?date:new Date();
  const hour=d.getHours(),weekday=d.getDay(),group=normalize(channel?.group||channel?.groupTitle||'').slice(0,35);
  const slot=hour<6?'dem':hour<11?'sang':hour<16?'trua':hour<20?'toi':'khuya';
  const vector={'bias':1,['topic:'+topic.key]:1,['slot:'+slot]:0.65,['day:'+(weekday===0||weekday===6?'weekend':'weekday')]:0.4};
  if(group)vector['group:'+group]=0.35;
  if(topic.source==='epg')vector['epg:'+topic.key]=0.7;
  return vector;
 }
 function emptyModel(){return {version:1,observations:0,weights:{}};}
 function sanitizedModel(raw){
  const out=emptyModel();
  if(!raw||raw.version!==1||typeof raw.weights!=='object'||!raw.weights)return out;
  out.observations=Math.min(5000,Math.max(0,Math.trunc(Number(raw.observations)||0)));
  for(const [key,value] of Object.entries(raw.weights).slice(0,160)){
   if(key.length>80||!Number.isFinite(value))continue;
   out.weights[key]=Math.max(-5,Math.min(5,value));
  }
  return out;
 }
 const sigmoid=z=>1/(1+Math.exp(-Math.max(-16,Math.min(16,z))));
 function predict(model,vector){
  const m=sanitizedModel(model);
  let score=0;
  for(const [key,value] of Object.entries(vector||{}))score+=(m.weights[key]||0)*(Number(value)||0);
  return sigmoid(score);
 }
 function learn(model,vector,label,{rate=0.42}={}){
  const before=sanitizedModel(model);
  if(label!==0&&label!==1)return before;
  const target=Math.max(0,Math.min(1,Number(label)));
  const diff=target-predict(before,vector);
  const out={version:1,observations:Math.min(5000,before.observations+1),weights:{...before.weights}};
  for(const [name,value] of Object.entries(vector||{})){
   if(name.length>80||!Number.isFinite(value)||value===0)continue;
   const old=out.weights[name]||0;
   out.weights[name]=Math.max(-5,Math.min(5,old+rate*diff*value-0.001*old));
  }
  // Bound local storage and prevent oversized/personal string features.
  const entries=Object.entries(out.weights);
  if(entries.length>120)out.weights=Object.fromEntries(entries.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,120));
  return out;
 }
 function recommend(channels,guide,api,model,webMap={}, {limit=6,clock=Date.now(),excludeId=''}={}){
  const date=new Date(clock),m=sanitizedModel(model);
  const rows=[];
  for(const ch of Array.isArray(channels)?channels:[]){
   if(!ch?.id||!ch.name||!ch.url||ch.status==='dead'||String(ch.id)===String(excludeId))continue;
   const saved=webMap[String(ch.name)]||null;
   const topic=topicFor(ch,guide,api,clock,saved),vector=features(ch,topic,date);
   const predicted=predict(m,vector);
   // No invented preference on cold start; EPG evidence is a discovery cue.
   const quality=(ch.status==='alive'?0.04:0)+(topic.source==='epg'?0.025:0);
   const score=(m.observations>=2?predicted:0.5)+quality;
   const reason=m.observations>=2
    ?'Học từ '+m.observations+' phản hồi xem tại máy'+(topic.source==='epg'?' · Chủ đề từ EPG':'')
    :topic.source==='epg'?'Chủ đề từ EPG thật':'Gợi ý khám phá, chưa học đủ hành vi';
   rows.push({channel:ch,topic,probability:predicted,score,reason});
  }
  rows.sort((a,b)=>b.score-a.score||String(a.channel.name).localeCompare(String(b.channel.name),'vi'));
  return rows.slice(0,Math.max(1,Math.min(20,Math.trunc(limit)||6)));
 }

 // P5.1.267: rank actual future XMLTV programmes with learned preferences.
 // Topic words are explicitly rule-based; personalized scoring is logistic ML.
 function upcomingForYou(channels,guide,api,model,webMap={}, {limit=8,clock=Date.now(),hours=8}={}){
  if(!guide||typeof api?.find!=='function'||!Number.isFinite(clock))return [];
  const m=sanitizedModel(model),seen=new Set(),rows=[];
  const horizon=clock+Math.max(1,Math.min(12,Number(hours)||8))*3600000;
  for(const ch of (Array.isArray(channels)?channels:[]).slice(0,900)){
   if(!ch?.id||!ch.name||!ch.url||ch.status==='dead')continue;
   let programmes=[];
   try{programmes=api.find(guide,ch)||[];}catch{continue;}
   if(!Array.isArray(programmes))continue;
   // XMLTV.find is sorted but may include hundreds of expired items;
   // the first 120 entries can all be stale. Bound FUTURE candidates, not
   // the raw head of the guide, so a long archive cannot hide tomorrow.
   let futureCount=0;
   for(const p of programmes){
    if(Number.isFinite(p?.start)&&p.start>clock&&p.start<=horizon&&++futureCount>120)break;
    if(!Number.isFinite(p?.start)||!Number.isFinite(p?.end)
     ||p.end<=p.start||p.start<=clock||p.start>horizon)continue;
    const title=String(p.title||'').trim().replace(/\s+/g,' ').slice(0,140);
    if(!title)continue;
    const id=String(ch.id)+'|'+p.start+'|'+normalize(title);
    if(seen.has(id))continue;
    seen.add(id);
    const matched=Object.keys(subject(title+' '+String(p.description||'').slice(0,220)))[0];
    const fallback=metadataTopic(ch);
    const saved=webMap[String(ch.name)]||null;
    const webKey=saved?.key&&KINDS[saved.key]&&saved.confidence>=0.7?saved.key:null;
    const key=matched||webKey||fallback.key;
    const topic={key,label:KINDS[key],source:matched?'epg':webKey?'web':'metadata',
     confidence:matched?0.85:webKey?0.7:fallback.confidence};
    const probability=predict(m,features(ch,topic,new Date(p.start)));
    const score=(m.observations>=2?probability:0.5)
     +(matched?0.025:0)+(ch.status==='alive'?0.02:0);
    const reason=(m.observations>=2
     ?'Học từ '+m.observations+' phản hồi xem trên máy'
     :'Chưa học đủ hành vi · Lịch từ XMLTV')
     +(matched?' · Chủ đề từ EPG':' · Chưa xác minh chủ đề từ EPG');
    rows.push({channel:ch,programme:{title,start:p.start,end:p.end},topic,probability,score,reason});
   }
  }
  rows.sort((a,b)=>b.score-a.score||a.programme.start-b.programme.start
   ||String(a.channel.name).localeCompare(String(b.channel.name),'vi'));
  return rows.slice(0,Math.max(1,Math.min(20,Math.trunc(limit)||8)));
 }


 // P5.1.268: local, model-scored on-air-soon alerts. Never infer schedules
 // without an imported XMLTV guide; do not create OS/network notifications.
 function startingForYou(channels,guide,api,model,webMap={}, {clock=Date.now(),windowMinutes=2,threshold=0.62,limit=3}={}){
  const m=sanitizedModel(model);
  if(m.observations<3||!guide||typeof api?.find!=='function'||!Number.isFinite(clock))return [];
  const minutes=Math.max(1,Math.min(5,Number(windowMinutes)||2));
  const cutoff=clock+minutes*60000;
  const minScore=Math.max(0.6,Math.min(0.95,Number(threshold)||0.62));
  // Look back 90s so minute-level polling still catches a programme that
  // began just before the tick, as long as it has not finished.
  const found=upcomingForYou(channels,guide,api,m,webMap,{clock:clock-90000,hours:1,limit:20});
  return found.filter(row=>row.programme.start<=cutoff&&row.programme.end>clock
   &&row.probability>=minScore).slice(0,Math.max(1,Math.min(3,Math.trunc(limit)||3)));
 }

 function cleanQuery(name){
  const s=String(name||'').trim();
  if(!s||s.length>70||/[:\\/]/.test(s)||/https?\b|@|[<>]/i.test(s))return '';
  return s.replace(/[\t\r\n]+/g,' ').slice(0,70);
 }
 function readWikiSearch(name,response,lang='vi'){
  const query=cleanQuery(name),items=response?.query?.search;
  if(!query||!Array.isArray(items))return null;
  const normalized=normalize(query);
  let best=null;
  for(const item of items.slice(0,5)){
   const title=String(item.title||'').slice(0,150),n=normalize(title);
   const exact=n===normalized;
   const strong=normalized.length>=5&&(n.startsWith(normalized+' ')||n.includes(' '+normalized+' '));
   if(!exact&&!strong)continue;
   const excerpt=String(item.snippet||'').replace(/<[^>]*>/g,' ').replace(/&[^;\s]{1,12};/g,' ').slice(0,500);
   const clues=subject(title+' '+excerpt);
   const kind=Object.keys(clues)[0]||'other';
   const score=exact?1:0.75;
   if(!best||score>best.confidence)best={key:kind,confidence:score,source:'wikipedia',
    title,excerpt,articleUrl:'https://'+(lang==='en'?'en':'vi')+'.wikipedia.org/?curid='+Math.max(0,Number(item.pageid)||0)};
  }
  return best;
 }
 return Object.freeze({KINDS,normalize,subject,metadataTopic,topicFor,features,emptyModel,
  sanitizedModel,predict,learn,recommend,upcomingForYou,startingForYou,cleanQuery,readWikiSearch});
});
