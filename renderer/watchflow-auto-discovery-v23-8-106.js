'use strict';
/* WatchFlow background metadata discovery: bounded, transparent and revocable.
 * Searches only public channel names and topic labels; never sends stream URLs
 * or downloads/imports playlists. Runs while the application is open. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OpenIPTVWatchFlowAuto=api;})(typeof window==='undefined'?globalThis:window,function(){
 const KEY='watchflow:auto-catalog-v1',OPT='watchflow:auto-discovery-enabled';
 const backgroundAnalysis=new WeakMap();
 const TOPICS={'Tin tức':'news television channel','Thể thao':'sports television channel','Phim truyện':'movie television channel','Thiếu nhi':'children television channel','Giải trí':'entertainment television channel','Khoa học':'science documentary television channel'};
 const DAY_LIMIT=72,RUN_LIMIT=6,CACHE_MS=48*3600*1000,PAUSE_MS=2*60*1000;
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
 const publicName=value=>{let s=String(value||'').trim();if(/https?:|www\.|[/?=&@]|password|token|m3u|access[_ -]?key|bearer/i.test(s))return '';s=s.replace(/\[[^\]]*(?:geo|block|region)[^\]]*\]/ig,'').replace(/\([^)]*(?:geo|block|region|\d{3,4}p)[^)]*\)/ig,'').replace(/\b(?:UHD|FHD|HD|SD|1080p|720p|4K|geo.blocked)\b/ig,'').replace(/\s+/g,' ').trim();return s.length>=3&&s.length<=60?s:'';};
 const isTv=item=>/television|tv channel|tv network|tv station|broadcaster|broadcasting|broadcast station|radio|phát thanh|truyền hình|đài tiếng nói|đài truyền thanh|truy[eề]n h[iì]nh|k[eê]nh truy[eề]n h[iì]nh|đ[aà]i truy[eề]n h[iì]nh|t[eế]l[eé]vision/i.test(String(item?.description||'')+' '+String(item?.name||''));
 const validPublicUrl=url=>/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(String(url||''))||
   /^https:\/\/vi\.wikipedia\.org\/wiki\/[A-Za-z0-9_%().,~!'-]+$/.test(String(url||''));
 function matchesName(name,item){
  const a=normalize(publicName(name)),b=normalize(publicName(item?.name));
  if(!a||!b||a.length<3||b.length<3)return false;
  if(a===b)return true;
  const longer=a.length>b.length?a:b,shorter=a.length>b.length?b:a;
  return shorter.length>=7&&longer.startsWith(shorter)&&shorter.length/longer.length>=.64;
 }
 const enabled=storage=>{try{return storage?.getItem(OPT)!=='false';}catch{return true;}};
 const setEnabled=(storage,on)=>{try{storage?.setItem(OPT,on?'true':'false');return true;}catch{return false;}};
 const fresh=()=>({version:1,day:'',used:0,queries:{},error:'',updatedAt:0});
 function read(storage){let raw;try{raw=JSON.parse(storage?.getItem(KEY)||'null');}catch{}if(!raw||raw.version!==1||!raw.queries||typeof raw.queries!=='object')return fresh();
  const o=fresh();o.day=String(raw.day||'');o.used=Math.max(0,Math.min(DAY_LIMIT,Number(raw.used)||0));o.updatedAt=Number(raw.updatedAt)||0;o.error=String(raw.error||'').slice(0,180);
  for(const [q,v]of Object.entries(raw.queries).slice(-900)){if(typeof q!=='string'||q.length>70||!v||!Array.isArray(v.items))continue;
   o.queries[q]={at:Number(v.at)||0,failed:v.failed===true,sourcesChecked:v.sourcesChecked===true,items:v.items.slice(0,8).filter(x=>validPublicUrl(x.url)).map(x=>({name:String(x.name||'').slice(0,120),description:String(x.description||'').slice(0,180),url:x.url}))};}return o;
 }
 const save=(storage,s)=>{try{storage?.setItem(KEY,JSON.stringify({...s,queries:Object.fromEntries(Object.entries(s.queries).slice(-900))}));return true;}catch{return false;}};

 // Public display-name coverage only. A search result does NOT imply a
 // playable stream, and failed requests never count as researched.
 function internetProgress(storage,channels=[],clock=Date.now()){
  const state=read(storage),names=[...new Set((channels||[]).map(c=>publicName(c?.name).toLowerCase()).filter(Boolean))];
  let searched=0,matched=0,failed=0;
  for(const name of names){
   const entry=state.queries[name];if(!entry)continue;
   if(entry.failed){failed++;continue;}
   if(clock-entry.at>=CACHE_MS)continue;
   searched++;
   if(entry.items.some(x=>isTv(x)&&matchesName(name,x)))matched++;
  }
  const used=state.day===new Date(clock).toISOString().slice(0,10)?state.used:0;
  return{total:names.length,searched,matched,noMatch:searched-matched,failed,remaining:Math.max(0,names.length-searched),
   used,limit:DAY_LIMIT,error:state.error,enabled:enabled(storage)};
 }

 function collect(storage,channels=[],engine){const state=read(storage),lookup=new Set(channels.map(c=>normalize(publicName(c.name)))),result=new Map(),learned=engine?.read?.(storage)?.seconds||{};
  for(const [query,entry] of Object.entries(state.queries)){if(Date.now()-entry.at>CACHE_MS)continue;
   for(const item of entry.items){if(!isTv(item)||lookup.has(normalize(publicName(item.name))))continue;
    const predicted=engine?.predict?.(item.name+' '+item.description)||{label:'Chưa phân loại',confidence:0};
    const candidate={...item,category:predicted.confidence>=35?predicted.label:'Chưa phân loại',confidence:predicted.confidence,source:'Wikidata',query};
    const key=item.url;if(!result.has(key)||candidate.confidence>result.get(key).confidence)result.set(key,candidate);
   }
  }
  return [...result.values()].sort((a,b)=>(Number(learned[b.category])||0)-(Number(learned[a.category])||0)||b.confidence-a.confidence).slice(0,35);
 }
 const topicCatalog=typeof window!=='undefined'?window.OpenIPTVWatchFlowTopics:
  typeof require==='function'?require('./watchflow-topic-catalog-v23-8-117.js'):null;
 function enrich(analysis,channels,storage,engine){
  const cache=read(storage).queries,map=new Map(analysis||[]);
  for(const c of channels){
   const q=publicName(c.name).toLowerCase(),record=cache[q];
   if(!q||!record||record.failed||Date.now()-record.at>CACHE_MS)continue;
   const match=record.items.find(x=>matchesName(c.name,x)&&isTv(x)&&validPublicUrl(x.url));
   if(!match)continue; // Never classify a different channel just because it appeared in a web search.
   const desc=String(match.description||'');
   const labels=topicCatalog?.fromText(desc)||[];
   if(!labels.length)continue;
   const id=String(c.id),prior=map.get(id)||{};
   const oldLabels=Array.isArray(prior.labels)?prior.labels:prior.label&&prior.label!=='Chưa phân loại'?[prior.label]:[];
   const merged=topicCatalog?.mergeLabels(oldLabels,labels)||[...new Set([...oldLabels,...labels])];
   const best=prior?.from==='EPG'&&prior?.label!=='Chưa phân loại'?prior.label:
    prior?.label&&prior.label!=='Chưa phân loại'?prior.label:topicCatalog?.primary(merged)||labels[0];
   map.set(id,{...prior,label:best,labels:merged,confidence:Math.max(Number(prior.confidence)||0,70),
    from:prior?.from==='EPG'?'EPG':oldLabels.length?prior.from||'Tên/nhóm':'Internet/Wikidata',
    sourceUrl:match.url});
  }
  return map;
 }
 async function scanInternal({storage,channels=[],analysis=new Map(),engine,lookup,clock=Date.now,budget=RUN_LIMIT,onUpdate=()=>{}}={}){
  if(!enabled(storage))return {disabled:true,requests:0,discovered:collect(storage,channels,engine)};
  if(!engine||typeof lookup!=='function')return{error:'Search service unavailable',requests:0,discovered:[]};
  const now=clock(),date=new Date(now).toISOString().slice(0,10),state=read(storage);
  if(state.day!==date){state.day=date;state.used=0;}
  // Search unclassified channels first, then work through the remaining catalog on later runs.
  const ordered=[...channels].filter(c=>c?.id).sort((a,b)=>{
   const score=c=>{const m=analysis.get(String(c.id))||{};
    return (m.label==='Chưa phân loại'||!m.label?0:m.from==='Tên/nhóm'?1:2);};
   return score(a)-score(b);
  });
  const priorityFor=q=>{
   const v=state.queries[q];
   // Empty legacy results had only searched Wikidata in Vietnamese.
   if(v&&!v.failed&&!v.sourcesChecked&&!v.items.length)return -1;
   return v?.at||0;
  };
  const unique=[...new Set(ordered.map(c=>publicName(c.name).toLowerCase()).filter(Boolean))]
   .sort((a,b)=>priorityFor(a)-priorityFor(b)).slice(0,18);
  const interest=engine.read?.(storage)?.seconds||{};
  const rankedTopics=Object.keys(TOPICS).sort((a,b)=>(Number(interest[b])||0)-(Number(interest[a])||0));
  const topics=rankedTopics.slice(0,3).map(x=>TOPICS[x]);
  const queue=[...unique,...topics].filter((q,i,all)=>all.indexOf(q)===i);
  let requests=0,errors=0;state.error='';
  for(const q of queue){
   if(!enabled(storage)||state.used>=DAY_LIMIT||requests>=Math.min(RUN_LIMIT,budget))break;
   const previous=state.queries[q],legacy=previous&&!previous.failed&&!previous.sourcesChecked&&!previous.items.length;
   if(previous&&!legacy&&now-previous.at<(previous.failed?5*60*1000:previous.items.length?CACHE_MS:2*60*60*1000))continue;
   try{const raw=await lookup(q);const items=(Array.isArray(raw)?raw:[]).slice(0,8).filter(x=>validPublicUrl(x.url)&&isTv(x)&&matchesName(q,x)).map(x=>({name:String(x.name||'').slice(0,120),description:String(x.description||'').slice(0,180),url:x.url}));
    state.queries[q]={at:now,items,failed:false,sourcesChecked:true};
   }catch(error){state.error='Tra cứu tạm lỗi: '+String(error?.message||error).slice(0,100);errors++;state.queries[q]={at:now,items:[],failed:true,sourcesChecked:false};}
   requests++;state.used++;state.updatedAt=now;save(storage,state);onUpdate({requests,used:state.used,limit:DAY_LIMIT});
  }
  const results=collect(storage,channels,engine);onUpdate({done:true,discovered:results.length,errors,error:state.error});
  return{requests,used:state.used,limit:DAY_LIMIT,discovered:results,errors,error:state.error};
 }
 // Serialize concurrent background/manual searches sharing the same storage.
 // This prevents consuming the same daily quota twice or losing cached results.
 const activeScans=new WeakMap();
 function scan(args={}){
  const storage=args?.storage;
  if(!storage||typeof storage!=='object')return scanInternal(args);
  const active=activeScans.get(storage);
  if(active)return active;
  let task;
  task=scanInternal(args).finally(()=>{if(activeScans.get(storage)===task)activeScans.delete(storage);});
  activeScans.set(storage,task);
  return task;
 }
 // Channel labels are immutable until their name/group/EPG ID changes or a user rescans.
 const CHANNEL_CACHE='watchflow:classified-channels-v4',CHANNEL_CACHE_VERSION=4;
 const durable=typeof window!=='undefined'?window.OpenIPTVWatchFlowPersistence:
  typeof require==='function'?require('./watchflow-persistence-v23-8-124.js'):null;
 function readChannelCache(storage){
  try{
   const data=JSON.parse(storage?.getItem(CHANNEL_CACHE)||'null');
   if(data?.version!==CHANNEL_CACHE_VERSION||!data.entries||typeof data.entries!=='object')return {};
   return data.entries;
  }catch{return {};}
 }
 function saveChannelCache(storage,entries){
  if(typeof storage?.setItem!=='function')return false;
  // WebView localStorage can be quota-limited. Keep channel labels at all costs,
  // shedding only past/extra programme cache when the EPG list is very large.
  const limits=[[160,40],[80,20],[40,10],[16,5],[0,0]];
  for(const [maxTopics,maxProgrammes] of limits){
   const compact={};
   for(const [id,entry] of Object.entries(entries)){
    const snapshot=entry?.snapshot||{};
    compact[id]={...entry,
     programmeTopics:maxTopics?(entry.programmeTopics||[]).slice(-maxTopics):[],
     snapshot:{...snapshot,programmes:maxProgrammes?
      (snapshot.programmes||[]).slice(0,maxProgrammes):[]}};
   }
   try{
    storage.setItem(CHANNEL_CACHE,JSON.stringify({version:CHANNEL_CACHE_VERSION,entries:compact}));
    return true;
   }catch{}
  }
  return false;
 }
 // Prefer IndexedDB, which does not share the 5MB localStorage quota used by
 // playlists, preferences and guide cache. Legacy localStorage cache is migrated
 // without deleting any unrelated application data.
 async function loadPersistentCache(win){
  let saved=null;
  try{saved=await durable?.read(win,'channels');}catch{}
  if(saved?.version===CHANNEL_CACHE_VERSION&&saved.entries&&typeof saved.entries==='object')
   return saved.entries;
  return readChannelCache(win?.localStorage);
 }
 async function persistChannelCache(win,entries){
  try{
   if(await durable?.write(win,'channels',{version:CHANNEL_CACHE_VERSION,entries,updatedAt:Date.now()})){
    // Remove *only* the old WatchFlow cache, after the replacement is safely saved.
    try{win?.localStorage?.removeItem(CHANNEL_CACHE);}catch{}
    return 'indexeddb';
   }
  }catch{}
  if(saveChannelCache(win?.localStorage,entries))return 'localstorage';
  return 'memory'; // Session still has correct results; warning is surfaced to user.
 }
 function channelSignature(channel){
  let hash=2166136261;
  const input=String(channel?.id||'')+'|'+String(channel?.name||'')+'|'+
   String(channel?.group||channel?.groupTitle||'')+'|'+String(channel?.tvgId||'');
  for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return (hash>>>0).toString(36);
 }
 function cachedSnapshot(old,clock=Date.now()){
  const snapshot=old?.snapshot;
  if(!snapshot||typeof snapshot!=='object')return null;
  const programmes=(snapshot.programmes||[]).filter(p=>Number(p.end)>clock).slice(0,40);
  return {...snapshot,programmes,epgCount:programmes.length,
   epgMatched:programmes.length>0,programme:String(programmes[0]?.title||'')};
 }
 function cacheEntry(result,signature,clock,previous=null){
  // The latest 40 future/current entries are sufficient to restore the programme UI instantly.
  const programmes=(result.programmes||[]).filter(p=>p.end>clock).slice(0,40).map(p=>({
   key:String(p.key||''),title:String(p.title||'').slice(0,180),start:p.start,end:p.end,
   labels:p.labels||[],confidence:p.confidence,from:p.from
  }));
  const snapshot={label:result.label,labels:result.labels,confidence:result.confidence,
   from:result.from,programme:result.programme,epgCount:result.epgCount,
   epgMatched:result.epgMatched,topics:result.topics,programmes};
  // Keep per-title classification separately from changing air dates.
  const known=new Map((previous?.programmeTopics||[]).filter(p=>p?.key).map(p=>[p.key,p]));
  for(const p of result.programmes||[]){
   if(!p.key)continue;
   known.delete(p.key);
   known.set(p.key,{key:p.key,labels:p.labels||[],confidence:p.confidence,from:p.from});
  }
  return {signature,base:result.base,snapshot,programmeTopics:[...known.values()].slice(-160),updatedAt:clock};
 }
 // Local scan visits the playlist but never repeats channel inference for identical metadata.
 // Only EPG rows absent from the compact on-device cache need topic inference.
 async function scanLocal({channels=[],guide=null,guideLib=null,engine,clock=Date.now(),
  yieldNow=()=>new Promise(resolve=>setTimeout(resolve,0)),onProgress=()=>{},shouldStop=()=>false,
  batchSize=32,cache={},force=false}={}){
  const list=Array.isArray(channels)?channels:[],analysis=new Map(),entries={};
  const total=list.length,guideProgrammes=Array.isArray(guide?.programmes)?guide.programmes.length:0;
  let processed=0,classified=0,epgChannels=0,epgProgrammes=0,newChannels=0,newProgrammes=0,lastYield=Date.now();
  const snapshot=()=>({analysis,entries,total,processed,classified,epgChannels,epgProgrammes,
   guideProgrammes,newChannels,newProgrammes,manual:force});
  for(const channel of list){
   if(shouldStop())return {...snapshot(),cancelled:true};
   if(channel?.id){
    const id=String(channel.id),signature=channelSignature(channel);
    const previous=!force&&cache[id]?.signature===signature?cache[id]:null;
    if(!previous)newChannels++;
    let result=null;
    try{
     const cachedProgrammes=new Map([...(previous?.programmeTopics||[]),...(previous?.snapshot?.programmes||[])]
      .filter(p=>p?.key).map(p=>[p.key,p]));
     const options={base:previous?.base,programmes:cachedProgrammes};
     // If EPG hasn't loaded yet, keep the last known valid schedule; never invent rows.
     if(!guide&&previous?.snapshot){
      result=cachedSnapshot(previous,clock)||engine?.analyzeChannel?.(channel,null,null,clock,options);
     }else{
      result=typeof engine?.analyzeChannel==='function'
       ?engine.analyzeChannel(channel,guide,guideLib,clock,options)
       :engine?.analyze?.([channel],guide,guideLib,clock)?.get(id);
     }
     if(result&&Array.isArray(result.programmes)){
      newProgrammes+=new Set(result.programmes.filter(p=>p.key&&!cachedProgrammes.has(p.key)).map(p=>p.key)).size;
     }
    }catch{}
    if(result){
     analysis.set(id,result);
     entries[id]=cacheEntry({...result,base:result.base||previous?.base},signature,clock,previous);
     if(result.label&&result.label!=='Chưa phân loại')classified++;
     if(result.epgMatched||result.epgCount>0)epgChannels++;
     epgProgrammes+=Math.max(0,Number(result.epgCount)||0);
    }
   }
   processed++;
   if(processed%Math.max(1,batchSize)===0||Date.now()-lastYield>18){
    onProgress(snapshot());await yieldNow();lastYield=Date.now();
   }
  }
  onProgress(snapshot());
  return {...snapshot(),cancelled:false};
 }
 function fingerprint(channels){
  let hash=2166136261;
  for(const ch of channels){
   const str=String(ch?.id||'')+'|'+String(ch?.tvgId||'')+'|'+String(ch?.name||'')+'|'+String(ch?.group||ch?.groupTitle||'');
   for(let i=0;i<str.length;i++){hash^=str.charCodeAt(i);hash=Math.imul(hash,16777619);}
  }
  return channels.length+':'+(hash>>>0);
 }
 const nativeOverrides=new WeakMap();
 function setNativeTopics(win,channel,values,{silent=false,source='Qwen3 offline'}={}){
  const id=String(channel?.id||'');if(!id)return false;
  const labels=topicCatalog?.distinct(values)||[];
  if(!labels.length)return false;
  const base=backgroundAnalysis.get(win)||new Map(),prior=base.get(id)||{};
  const explicit=topicCatalog?.channelLabels(channel)||[];
  // If the channel's own branding establishes a specific topic, do not allow
  // unrelated model guesses to override it (e.g. Food Network -> Thiếu nhi).
  const specific=explicit.filter(x=>!['Địa phương','Truyền hình tổng hợp'].includes(x));
  const usable=specific.length?labels.filter(x=>specific.includes(x)||prior?.programmes?.some(p=>p.labels?.includes(x))):labels;
  if(!usable.length)return false;
  const store=nativeOverrides.get(win)||new Map();
  const old=store.get(id)||[];
  store.set(id,topicCatalog?.mergeLabels(old,usable)||[...new Set([...old,...usable])]);
  nativeOverrides.set(win,store);
  const merged=topicCatalog?.mergeLabels(prior.labels||[prior.label],store.get(id))||store.get(id);
  const label=prior.label&&prior.label!=='Chưa phân loại'?prior.label:topicCatalog?.primary(merged)||merged[0];
  backgroundAnalysis.set(win,new Map(base).set(id,{...prior,label,labels:merged,
   from:prior.label&&prior.label!=='Chưa phân loại'?prior.from||'Tên/nhóm':source}));
  if(!silent)win?.document?.dispatchEvent?.(new win.CustomEvent('openiptv:watchflow-auto-update',
   {detail:{native:true,complete:true,channel:id}}));
  return true;
 }
 function mergeSavedNative(win,analysis){
  const overrides=nativeOverrides.get(win);if(!overrides?.size)return analysis;
  const map=new Map(analysis);
  for(const [id,add] of overrides){
   const prior=map.get(id);if(!prior)continue;
   const labels=topicCatalog?.mergeLabels(prior.labels,add)||add;
   map.set(id,{...prior,labels,label:prior.label==='Chưa phân loại'?(topicCatalog?.primary(labels)||labels[0]):prior.label});
  }
  return map;
 }
 function setSmartProgrammeLabels(win,channelId,programmeKey,newLabels,{silent=true}={}){
  const existing=backgroundAnalysis.get(win)||new Map();
  const id=String(channelId),record=existing.get(id);
  if(!record?.programmes?.length||!programmeKey)return false;
  const labels=topicCatalog?.distinct(newLabels)||[];
  if(!labels.length)return false;
  let found=false;
  const programmes=record.programmes.map(p=>{
   if(p.key!==programmeKey)return p;
   found=true;
   return {...p,labels:topicCatalog?.mergeLabels(p.labels,labels)||[...new Set([...(p.labels||[]),...labels])],
    from:'Smart ONNX offline'};
  });
  if(!found)return false;
  backgroundAnalysis.set(win,new Map(existing).set(id,{...record,programmes}));
  if(!silent)win.document.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail:{smart:true,complete:true}}));
  return true;
 }
 const statusByWindow=new WeakMap();
 function start(win,engine){
  if(!win?.document||!engine)return false;
  const tag='__watchflowAutoStarted';
  if(win[tag])return true;win[tag]=true;
  let lastKey='',lastGuide=null,guideVersion=0,generation=0,webBusy=false,lastInternet=0,webFollowup=false;
  const status={running:false,processed:0,total:0,classified:0,epgChannels:0,epgProgrammes:0,
   guideProgrammes:0,newChannels:0,newProgrammes:0,updatedAt:0,error:'',warning:'',storage:'loading'};
  statusByWindow.set(win,status);
  const notify=detail=>win.document.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail}));
  const channels=()=>win.IPTVState?.getChannels?.()||[];
  const guide=()=>{try{return win.IPTVExtras?.getGuide?.()||null;}catch{return null;}};
  const yieldNow=()=>new Promise(resolve=>win.setTimeout(resolve,0));
  let sessionEntries=readChannelCache(win.localStorage);
  function restoreCached(entries=sessionEntries){
   const list=channels(),map=new Map();
   for(const channel of list){
    if(!channel?.id)continue;
    const old=entries[String(channel.id)];
    if(old?.signature!==channelSignature(channel))continue;
    const item=cachedSnapshot(old);
    if(item)map.set(String(channel.id),item);
   }
   if(map.size){
    backgroundAnalysis.set(win,map);
    Object.assign(status,{total:list.length,processed:map.size,classified:[...map.values()].filter(x=>x.label!=='Chưa phân loại').length,
     updatedAt:Date.now()});
    notify({local:true,restored:true,...status});
   }
  }
  restoreCached(); // Display legacy cache immediately, if present.
  const cacheReady=loadPersistentCache(win).then(entries=>{
   sessionEntries=entries;
   restoreCached(entries); // IndexedDB cache is loaded before a fresh EPG scan.
   return entries;
  }).catch(()=>sessionEntries);
  async function runLocal(list,epg,{force=false}={}){
   const token=++generation;
   await cacheReady;
   if(token!==generation)return;
   const retained=backgroundAnalysis.get(win)||new Map();
   const alive=new Set(list.map(ch=>String(ch?.id)));
   const partial=new Map([...retained].filter(([id])=>alive.has(id)));
   const oldCache=sessionEntries;
   Object.assign(status,{running:true,processed:0,total:list.length,classified:0,epgChannels:0,
    epgProgrammes:0,newChannels:0,newProgrammes:0,guideProgrammes:epg?.programmes?.length||0,error:'',warning:''});
   backgroundAnalysis.set(win,partial);notify({local:true,...status});
   let lastNotify=0;
   try{
    const result=await scanLocal({channels:list,guide:epg,guideLib:win.IPTVGuide,engine,
     cache:oldCache,force,shouldStop:()=>token!==generation,yieldNow,onProgress:progress=>{
      if(token!==generation)return;
      backgroundAnalysis.set(win,mergeSavedNative(win,new Map([...partial,...progress.analysis])));
      Object.assign(status,{processed:progress.processed,total:progress.total,
       classified:progress.classified,epgChannels:progress.epgChannels,epgProgrammes:progress.epgProgrammes,
       newChannels:progress.newChannels,newProgrammes:progress.newProgrammes,guideProgrammes:progress.guideProgrammes});
      if(Date.now()-lastNotify>=250||progress.processed===progress.total){
       lastNotify=Date.now();notify({local:true,...status});
      }
     }});
    if(token!==generation||result.cancelled)return;
    backgroundAnalysis.set(win,mergeSavedNative(win,enrich(result.analysis,list,win.localStorage,engine)));
    const persisted=await persistChannelCache(win,result.entries);
    if(token!==generation)return;
    sessionEntries=result.entries;
    Object.assign(status,{running:false,error:'',storage:persisted,
     warning:persisted==='memory'?'Kết quả vẫn dùng được, nhưng chưa lưu được để mở lại ứng dụng. Hãy giải phóng dung lượng ứng dụng khi có thể.':'',
     processed:result.processed,total:result.total,
     newChannels:result.newChannels,newProgrammes:result.newProgrammes,updatedAt:Date.now()});
    notify({local:true,complete:true,manual:force,newChannels:result.newChannels,newProgrammes:result.newProgrammes,...status});
    if(result.newChannels>0)void runInternet();
   }catch(error){
    if(token!==generation)return;
    Object.assign(status,{running:false,error:String(error?.message||error).slice(0,180)});
    notify({local:true,complete:true,...status});
   }
  }
  function inspect({force=false}={}){
   const list=channels(),epg=guide();
   if(epg!==lastGuide){lastGuide=epg;guideVersion++;}
   const mapping=JSON.stringify(epg?.manualMappings||{});
   // No 30-minute forced reclassification. A changed EPG only checks new programme rows.
   const key=fingerprint(list)+'|'+guideVersion+'|'+(epg?.programmes?.length||0)
    +'|'+(epg?.offsetMinutes||0)+'|'+mapping;
   if(!force&&key===lastKey)return;
   lastKey=key;void runLocal(list,epg,{force});
  }
  async function runInternet(){
   if(webBusy||!enabled(win.localStorage))return;
   if(Date.now()-lastInternet<PAUSE_MS)return;
   webBusy=true;lastInternet=Date.now();notify({internet:true,running:true});
   try{
    const list=channels();
    const lookupResult=await scan({storage:win.localStorage,channels:list,analysis:backgroundAnalysis.get(win)||new Map(),engine,lookup:q=>(engine.searchChannelMetadata||engine.searchInternet)(q),
     onUpdate:info=>notify({internet:true,...info,...internetProgress(win.localStorage,list)})});
    const metrics=internetProgress(win.localStorage,list);
    notify({internet:true,complete:true,...metrics,requests:lookupResult.requests,errors:lookupResult.errors});
    const current=backgroundAnalysis.get(win);
    if(current?.size){
     backgroundAnalysis.set(win,mergeSavedNative(win,enrich(current,channels(),win.localStorage,engine)));
     notify({internet:true,complete:true});
    }
   }catch(error){notify({internet:true,error:String(error?.message||error).slice(0,140)});}
   finally{
     webBusy=false;
     const metrics=internetProgress(win.localStorage,channels());
     notify({internet:true,running:false,...metrics});
     // Intelligence automatically resumes bounded Wikidata research while
     // running, never more than six queries/batch or 72 per local day.
     if(win.localStorage?.getItem('watchflow:demo-mode')==='intelligence'&&
       metrics.enabled&&metrics.remaining>0&&metrics.used<metrics.limit&&!webFollowup){
      webFollowup=true;
      win.setTimeout(()=>{
       webFollowup=false;
       if(win.localStorage?.getItem('watchflow:demo-mode')!=='intelligence'||!enabled(win.localStorage))return;
       lastInternet=0;void runInternet();
      },PAUSE_MS);
     }
    }
  }
  // Local classification starts without a panel click and reruns on every playlist/EPG change.
  win.setTimeout(inspect,200);
  win.setInterval(inspect,3000);
  win.document.addEventListener('openiptv:watchflow-epg-changed',()=>{lastKey='';inspect();});
  win.document.addEventListener('openiptv:watchflow-manual-rescan',()=>{
   // A deliberate click is the only action that forces every channel's local analysis.
   nativeOverrides.delete(win);
   inspect({force:true});
   lastInternet=0;void runInternet();
  });
  win.document.addEventListener('openiptv:watchflow-auto-rescan',()=>{lastKey='';inspect();lastInternet=0;void runInternet();});
  win.addEventListener?.('openiptv:channel-browser-refresh',inspect);
  win.setTimeout(()=>{void runInternet();},1800);
  // Internet checks no longer poll constantly: startup, new channels or a manual scan only.
  return true;
 }
 return Object.freeze({setNativeTopics,setSmartProgrammeLabels,CHANNEL_CACHE,readChannelCache,saveChannelCache,loadPersistentCache,persistChannelCache,channelSignature,cachedSnapshot,getBackgroundAnalysis:win=>backgroundAnalysis.get(win)||new Map(),getLocalStatus:win=>({...statusByWindow.get(win)}),KEY,OPT,DAY_LIMIT,publicName,isTv,matchesName,validPublicUrl,read,enabled,setEnabled,collect,enrich,scan,internetProgress,scanLocal,fingerprint,start});
});
