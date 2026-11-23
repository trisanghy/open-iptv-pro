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
  const fallback=online?{key:online.key,source:online.source==='ml'?'ml':'web',confidence:Math.min(0.95,online.confidence)}:base;
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
  const horizon=clock+Math.max(1,Math.min(24,Number(hours)||8))*3600000;
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
  return rows.slice(0,Math.max(1,Math.min(2000,Math.trunc(limit)||8)));
 }





 // P5.1.271: user-supervised local Multinomial Naive Bayes classifier.
 // Learns category-level token frequencies, not URLs or full channel names.
 function categoryTokens(channel){
  const terms=normalize([channel?.name,channel?.group,channel?.groupTitle].filter(Boolean).join(' '));
  const ignored=new Set(['tv','hd','sd','kenh','channel','channels','main','online','iptv','stream','full','qa']);
  return [...new Set(terms.split(' ').filter(t=>t.length>=3&&t.length<=22&&!ignored.has(t)))].slice(0,20);
 }
 function emptyCategoryModel(){return {version:1,examples:0,docs:Object.create(null),tokens:Object.create(null)};}
 function sanitizedCategoryModel(raw){
  const out=emptyCategoryModel();if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const key of Object.keys(KINDS)){
   if(key==='other')continue;
   const docs=Number(raw.docs?.[key]);
   if(!Number.isFinite(docs)||docs<=0)continue;
   out.docs[key]=Math.min(1000,Math.trunc(docs));
   const bag=Object.create(null);
   for(const [token,amount] of Object.entries(raw.tokens?.[key]||{}).slice(0,150)){
    if(!/^[a-z0-9]{3,22}$/.test(token))continue;
    const n=Number(amount);if(Number.isFinite(n)&&n>0)bag[token]=Math.min(1000,Math.trunc(n));
   }
   out.tokens[key]=bag;
  }
  out.examples=Object.values(out.docs).reduce((a,b)=>a+b,0);
  return out;
 }
 function teachCategory(raw,channel,key){
  const model=sanitizedCategoryModel(raw);
  if(!KINDS[key]||key==='other'||model.examples>=1500)return model;
  const tokens=categoryTokens(channel);if(!tokens.length)return model;
  model.docs[key]=Math.min(1000,(model.docs[key]||0)+1);
  model.tokens[key]||=Object.create(null);
  for(const token of tokens)if(Object.keys(model.tokens[key]).length<150||token in model.tokens[key])
   model.tokens[key][token]=Math.min(1000,(model.tokens[key][token]||0)+1);
  model.examples=Object.values(model.docs).reduce((a,b)=>a+b,0);
  return model;
 }
 function predictCategory(raw,channel,{threshold=0.72}={}){
  const model=sanitizedCategoryModel(raw),tokens=categoryTokens(channel);
  const kinds=Object.keys(model.docs).filter(k=>model.docs[k]>0);
  if(model.examples<2||kinds.length<2||!tokens.length)return null;
  const vocabulary=new Set();
  for(const key of kinds)for(const token of Object.keys(model.tokens[key]||{}))vocabulary.add(token);
  const size=Math.max(1,vocabulary.size),scores=[];
  for(const key of kinds){
   const bag=model.tokens[key]||{},total=Object.values(bag).reduce((a,b)=>a+b,0);
   let log=Math.log((model.docs[key]+1)/(model.examples+kinds.length));
   for(const token of tokens)log+=Math.log(((bag[token]||0)+1)/(total+size));
   scores.push({key,log});
  }
  scores.sort((a,b)=>b.log-a.log);const max=scores[0].log;
  const denom=scores.reduce((n,row)=>n+Math.exp(row.log-max),0);
  const confidence=1/denom;
  const min=Math.max(0.55,Math.min(0.95,Number(threshold)||0.72));
  return confidence>=min?{key:scores[0].key,confidence,source:'ml'}:null;
 }


 // P283: evaluate the balance of user-confirmed training samples; no inference
 // from streams, EPG, identifiers or private viewing behavior.
 function categoryLearningHealth(raw){
  const model=sanitizedCategoryModel(raw),available=Object.keys(KINDS).filter(key=>key!=='other');
  const trained=available.map(key=>({key,count:model.docs[key]||0})).filter(row=>row.count>0);
  trained.sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
  const covered=trained.length,largest=trained[0]||null;
  const concentrated=model.examples&&largest?Math.round(largest.count*100/model.examples):0;
  const missing=available.filter(key=>!model.docs[key]).slice(0,3);
  const advice=!model.examples?'Hãy ghi nhãn vài kênh có tên rõ nghĩa để bắt đầu học.':
   covered<2?'Mô hình mới biết một chủ đề. Cần thêm nhãn thuộc chủ đề khác trước khi tin vào dự đoán.':
   concentrated>=75?'Mẫu học lệch về '+KINDS[largest.key]+'. Hãy xác nhận thêm kênh ở chủ đề ít ví dụ.':
   model.examples<8?'Đã có nhiều chủ đề hơn nhưng vẫn thiếu ví dụ. Tiếp tục xác nhận nhãn đúng.':
   'Mẫu học đa dạng hơn, nhưng mọi gợi ý vẫn cần người dùng xác nhận.';
  return {examples:model.examples,covered,total:available.length,concentrated,
   dominant:largest?.key||null,trained,missing,advice};
 }

 // P284: offline backup contains learned weights only, not playlist, URL, ID or viewing history.
 function buildLearningBackup(raw){
  const v=raw&&typeof raw==='object'?raw:{};
  const preference=sanitizedModel(v.model),category=sanitizedCategoryModel(v.categoryModel),explore=sanitizedBandit(v.bandit);
  return {format:'open-iptv-positron-ai-weights',schemaVersion:1,
   models:{preference,category,explore},
   summary:{preferenceObservations:preference.observations,categoryLabels:category.examples,
    exploredTopics:Object.keys(explore).length},
   note:'Chỉ chứa trọng số và từ khóa học AI, không có M3U, URL, lịch sử xem hoặc ID kênh.'};
 }

 // P282: explain learned Naive Bayes evidence using only channel-name tokens.
 // Never show a prediction from shared generic group names or unsupervised web data.
 function explainCategory(raw,channel){
  const model=sanitizedCategoryModel(raw),terms=categoryTokens({name:channel?.name});
  const kinds=Object.keys(model.docs).filter(key=>model.docs[key]>0&&KINDS[key]);
  const matches=terms.filter(token=>kinds.some(key=>(model.tokens[key]?.[token]||0)>0)).slice(0,5);
  const guess=kinds.length>=2&&matches.length
   ?predictCategory(model,channel,{threshold:0.55}):null;
  return {examples:model.examples,kinds:kinds.length,matches,
   prediction:guess?{key:guess.key,confidence:Math.round(guess.confidence*100)}:null};
 }

 // P277: deterministic local active learning queue. Prioritize uncertain
 // unclassified channels, but NEVER assign a label without user action.
 function rankUnclassified(items,raw,{limit=5,excludeIds=[]}={}){
  const model=sanitizedCategoryModel(raw);
  const excluded=new Set((Array.isArray(excludeIds)?excludeIds:[]).slice(-1500).map(x=>String(x).slice(0,160)));
  const rows=[],seen=new Set(),maximum=Math.max(1,Math.min(12,Math.trunc(Number(limit))||5));
  for(const item of (Array.isArray(items)?items:[]).slice(0,5000)){
   const ch=item?.channel;if(!ch?.id||!ch.name||ch.status==='dead')continue;
   const id=String(ch.id).slice(0,160);
   if(seen.has(id)||excluded.has(id))continue;seen.add(id);
   const tokens=categoryTokens(ch);if(!tokens.length)continue;
   const guess=predictCategory(model,ch,{threshold:0.55});
   const uncertain=guess?1-guess.confidence:1;
   const descriptive=tokens.filter(t=>/[a-z]{3}/.test(t)).length;
   const priority=uncertain*100+Math.min(5,descriptive);
   rows.push({channel:ch,prediction:guess,priority,
    reason:guess?'Cần xác minh '+KINDS[guess.key]+' ('+Math.round(guess.confidence*100)+'% từ nhãn AI)':
     'AI chưa đủ nhãn để phân loại, cần người xem xác nhận'});
  }
  rows.sort((a,b)=>b.priority-a.priority||String(a.channel.name).localeCompare(String(b.channel.name),'vi'));
  return rows.slice(0,maximum);
 }

 // P5.1.272: virtual, multi-label EPG folders. Every matching XMLTV topic
 // gets the same channel reference; the original playlist is never modified.
 function epgFolders(channels,guide,api,{clock=Date.now(),limit=5000}={}){
  const input=Array.isArray(channels)?channels:[];
  const maximum=Math.max(1,Math.min(10000,Math.trunc(limit)||5000));
  const buckets=new Map(Object.entries(KINDS).filter(([key])=>key!=='other')
   .map(([key,label])=>[key,{key,label,items:[]}]));
  const uncategorized=[];let scanned=0;
  for(const channel of input.slice(0,maximum)){
   if(!channel?.id||!channel.name||channel.status==='dead')continue;
   scanned++;
   const topic=topicFor(channel,guide,api,clock);
   const keys=topic.source==='epg'?[...new Set(topic.topics.map(t=>t.key))]:[];
   if(!keys.length){uncategorized.push({channel,topic});continue;}
   for(const key of keys)if(buckets.has(key))
    buckets.get(key).items.push({channel,topic});
  }
  const groups=[...buckets.values()].filter(g=>g.items.length);
  return {groups,uncategorized,scanned,unscanned:Math.max(0,input.length-maximum)};
 }


 // P5.1.273: complete, time-bounded programme topics from imported XMLTV.
 // Programmes may appear in multiple virtual topics; this is rule-based,
 // never fabricated from channel names or network lookups.
 function programmeFolders(channels,guide,api,{clock=Date.now(),hours=24,limit=5000,maxItems=1600}={}){
  const result={groups:[],uncategorized:[],scanned:0,total:0,truncated:false};
  if(!guide||typeof api?.find!=='function'||!Number.isFinite(clock))return result;
  const maxChannels=Math.max(1,Math.min(15000,Math.trunc(limit)||5000));
  const maxRecords=Math.max(1,Math.min(10000,Math.trunc(maxItems)||1600));
  const horizon=clock+Math.max(1,Math.min(168,Number(hours)||24))*3600000;
  const buckets=new Map(Object.entries(KINDS).filter(([key])=>key!=='other')
   .map(([key,label])=>[key,{key,label,items:[]}]));
  const seen=new Set();
  for(const channel of (Array.isArray(channels)?channels:[]).slice(0,maxChannels)){
   if(!channel?.id||!channel.name||channel.status==='dead')continue;
   result.scanned++;
   let entries=[];try{entries=api.find(guide,channel)||[];}catch{continue;}
   if(!Array.isArray(entries))continue;
   let count=0;
   for(const row of entries){
    if(!Number.isFinite(row?.start)||!Number.isFinite(row?.end)||row.end<=row.start
      ||row.end<=clock||row.start>horizon)continue;
    if(++count>80)break;
    const title=String(row.title||'').trim().replace(/\s+/g,' ').slice(0,140);
    if(!title)continue;
    const signature=String(channel.id)+'|'+row.start+'|'+normalize(title);
    if(seen.has(signature))continue;
    seen.add(signature);
    const kinds=Object.keys(subject(title+' '+String(row.description||'').slice(0,220)));
    const entry={channel,programme:{title,start:row.start,end:row.end},kinds};
    if(!kinds.length)result.uncategorized.push(entry);
    else for(const kind of kinds)if(buckets.has(kind))buckets.get(kind).items.push(entry);
    result.total++;
    if(result.total>=maxRecords){result.truncated=true;break;}
   }
   if(result.truncated)break;
  }
  const sort=(a,b)=>a.programme.start-b.programme.start||
   String(a.channel.name).localeCompare(String(b.channel.name),'vi');
  result.groups=[...buckets.values()].filter(g=>g.items.length);
  for(const group of result.groups)group.items.sort(sort);
  result.uncategorized.sort(sort);
  return result;
 }


 // P274: local, cross-topic XMLTV programme search; multi-label entries are deduplicated.
 function searchProgrammes(catalog,query,{limit=160}={}){
  const terms=normalize(String(query||'').slice(0,160)).split(' ').filter(Boolean).slice(0,8);
  const out={items:[],total:0,truncated:false};
  if(!terms.length||!catalog)return out;
  const unique=new Map();
  const groups=[...(Array.isArray(catalog.groups)?catalog.groups:[]),
   {label:KINDS.other,items:catalog.uncategorized||[]}];
  for(const group of groups)for(const item of (Array.isArray(group.items)?group.items:[])){
   if(!item?.channel?.id||!Number.isFinite(item?.programme?.start))continue;
   const labels=(item.kinds||[]).map(k=>KINDS[k]||'').join(' ');
   const text=normalize([item.programme.title,item.channel.name,labels,group.label].join(' '));
   if(!terms.every(t=>text.includes(t)))continue;
   const key=String(item.channel.id)+'|'+item.programme.start+'|'+normalize(item.programme.title);
   if(!unique.has(key))unique.set(key,item);
  }
  const sorted=[...unique.values()].sort((a,b)=>a.programme.start-b.programme.start||
   String(a.channel.name).localeCompare(String(b.channel.name),'vi'));
  const max=Math.max(1,Math.min(500,Math.trunc(limit)||160));
  out.total=sorted.length;out.truncated=sorted.length>max;out.items=sorted.slice(0,max);
  return out;
 }

 // P5.1.270: consent-based contextual bandit. Genre-level UCB bonuses shrink
 // as the user explicitly rates/watches a category; no channel history stored.
 function sanitizedBandit(raw){
  const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const key of Object.keys(KINDS)){
   const n=Number(raw[key]);if(Number.isFinite(n)&&n>0)out[key]=Math.min(10000,Math.trunc(n));
  }
  return out;
 }
 function observeBandit(raw,key){
  const out=sanitizedBandit(raw);
  if(KINDS[key])out[key]=Math.min(10000,(out[key]||0)+1);
  return out;
 }
 function banditBonus(count,total){
  const visits=Math.max(0,Math.min(10000,Number(count)||0)),n=Math.max(0,Math.min(100000,Number(total)||0));
  return Math.min(0.3,0.11*Math.sqrt(Math.log(n+10)/(visits+1)));
 }
 function exploreWithBandit(channels,guide,api,model,webMap={},history={},{limit=8,clock=Date.now()}={}){
  const m=sanitizedModel(model),bandit=sanitizedBandit(history);
  const total=Object.values(bandit).reduce((a,b)=>a+b,0),rows=[];
  for(const ch of Array.isArray(channels)?channels:[]){
   if(!ch?.id||!ch.name||!ch.url||ch.status==='dead')continue;
   const topic=topicFor(ch,guide,api,clock,webMap[String(ch.name)]||null);
   const probability=predict(m,features(ch,topic,new Date(clock)));
   const bonus=banditBonus(bandit[topic.key]||0,total);
   const score=(m.observations>=2?probability:0.5)+bonus+(topic.source==='epg'?0.02:0);
   rows.push({channel:ch,topic,score,probability,bonus,
    reason:(m.observations>=2?'AI học từ '+m.observations+' phản hồi':'Chưa học đủ hành vi')
    +' · '+(bandit[topic.key]||0)+' lượt đánh giá chủ đề · Khám phá có kiểm soát'});
  }
  rows.sort((a,b)=>b.score-a.score||String(a.channel.name).localeCompare(String(b.channel.name),'vi'));
  const chosen=[],counts=new Map(),max=Math.max(1,Math.min(20,Math.trunc(limit)||8));
  while(chosen.length<max&&rows.length){
   let best=0,value=-Infinity;
   for(let i=0;i<rows.length;i++){
    const rank=rows[i].score-0.07*(counts.get(rows[i].topic.key)||0);
    if(rank>value){best=i;value=rank;}
   }
   const item=rows.splice(best,1)[0];chosen.push(item);
   counts.set(item.topic.key,(counts.get(item.topic.key)||0)+1);
  }
  return chosen;
 }

 // P5.1.269: local 24h watch schedule. XMLTV candidates are scored by the
 // existing learned logistic model; weighted interval scheduling chooses a
 // conflict-free set. No guide means no invented broadcasts or playback.
 function planForYou(channels,guide,api,model,webMap={}, {clock=Date.now(),hours=24,limit=8}={}){
  if(!Number.isFinite(clock)||!guide||typeof api?.find!=='function')return [];
  const span=Math.max(1,Math.min(24,Number(hours)||24));
  const horizon=clock+span*3600000;
  const candidates=upcomingForYou(channels,guide,api,model,webMap,
   {clock,hours:span,limit:2000});
  const buckets=new Map();
  for(const item of candidates){
   const p=item.programme;
   if(!Number.isFinite(p.start)||!Number.isFinite(p.end)||
    p.start<=clock||p.end>horizon||p.end<=p.start)continue;
   const bucket=Math.floor((p.start-clock)/3600000);
   const rows=buckets.get(bucket)||[];
   if(rows.length<12){rows.push(item);buckets.set(bucket,rows);}
  }
  const items=[...buckets.values()].flat()
   .sort((a,b)=>a.programme.end-b.programme.end||a.programme.start-b.programme.start);
  const n=items.length,wanted=Math.max(1,Math.min(8,Math.trunc(limit)||8));
  if(!n)return [];
  const ends=items.map(item=>item.programme.end);
  const prev=items.map((item,i)=>{
   let left=0,right=i;
   while(left<right){const mid=(left+right)>>>1;
    if(ends[mid]<=item.programme.start)left=mid+1;else right=mid;}
   return left; // number of programmes compatible before this one
  });
  const dp=Array.from({length:n+1},()=>new Float64Array(wanted+1));
  const chosen=Array.from({length:n+1},()=>new Uint8Array(wanted+1));
  for(let i=1;i<=n;i++)for(let k=1;k<=wanted;k++){
   const row=items[i-1],duration=Math.max(1,(row.programme.end-row.programme.start)/60000);
   const reward=Math.max(0.01,row.score)*(0.65+0.35*Math.min(90,duration)/90);
   const take=dp[prev[i-1]][k-1]+reward,skip=dp[i-1][k];
   if(take>skip+1e-9){dp[i][k]=take;chosen[i][k]=1;}
   else dp[i][k]=skip;
  }
  const selected=[];
  for(let i=n,k=wanted;i>0&&k>0;){
   if(chosen[i][k]){selected.push(items[i-1]);i=prev[i-1];k--;}
   else i--;
  }
  return selected.reverse();
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
  sanitizedModel,predict,learn,recommend,emptyCategoryModel,sanitizedCategoryModel,teachCategory,predictCategory,explainCategory,categoryLearningHealth,buildLearningBackup,sanitizedBandit,observeBandit,banditBonus,exploreWithBandit,upcomingForYou,planForYou,startingForYou,rankUnclassified,epgFolders,programmeFolders,searchProgrammes,cleanQuery,readWikiSearch});
});
