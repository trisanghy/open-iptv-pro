'use strict';
/* WatchFlow background metadata discovery: bounded, transparent and revocable.
 * Searches only public channel names and topic labels; never sends stream URLs
 * or downloads/imports playlists. Runs while the application is open. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OpenIPTVWatchFlowAuto=api;})(typeof window==='undefined'?globalThis:window,function(){
 const KEY='watchflow:auto-catalog-v1',OPT='watchflow:auto-discovery-enabled';
 const backgroundAnalysis=new WeakMap();
 const TOPICS={'Tin tức':'news television channel','Thể thao':'sports television channel','Phim truyện':'movie television channel','Thiếu nhi':'children television channel','Giải trí':'entertainment television channel','Khoa học':'science documentary television channel'};
 const DAY_LIMIT=24,RUN_LIMIT=6,CACHE_MS=48*3600*1000,PAUSE_MS=15*60*1000;
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
 const publicName=value=>{let s=String(value||'').trim();if(/https?:|www\.|[/?=&@]|password|token|m3u|access[_ -]?key|bearer/i.test(s))return '';s=s.replace(/\b(?:UHD|FHD|HD|SD|1080p|720p|4K)\b/ig,'').replace(/\s+/g,' ').trim();return s.length>=3&&s.length<=60?s:'';};
 const isTv=item=>/television|tv channel|tv network|tv station|broadcaster|broadcasting|truy[eề]n h[iì]nh|k[eê]nh truy[eề]n h[iì]nh|đ[aà]i truy[eề]n h[iì]nh|t[eế]l[eé]vision/i.test(String(item?.description||'')+' '+String(item?.name||''));
 const enabled=storage=>{try{return storage?.getItem(OPT)!=='false';}catch{return true;}};
 const setEnabled=(storage,on)=>{try{storage?.setItem(OPT,on?'true':'false');return true;}catch{return false;}};
 const fresh=()=>({version:1,day:'',used:0,queries:{},error:'',updatedAt:0});
 function read(storage){let raw;try{raw=JSON.parse(storage?.getItem(KEY)||'null');}catch{}if(!raw||raw.version!==1||!raw.queries||typeof raw.queries!=='object')return fresh();
  const o=fresh();o.day=String(raw.day||'');o.used=Math.max(0,Math.min(DAY_LIMIT,Number(raw.used)||0));o.updatedAt=Number(raw.updatedAt)||0;o.error=String(raw.error||'').slice(0,180);
  for(const [q,v]of Object.entries(raw.queries).slice(-100)){if(typeof q!=='string'||q.length>70||!v||!Array.isArray(v.items))continue;
   o.queries[q]={at:Number(v.at)||0,items:v.items.slice(0,8).filter(x=>/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(String(x.url||''))).map(x=>({name:String(x.name||'').slice(0,120),description:String(x.description||'').slice(0,180),url:x.url}))};}return o;
 }
 const save=(storage,s)=>{try{storage?.setItem(KEY,JSON.stringify({...s,queries:Object.fromEntries(Object.entries(s.queries).slice(-80))}));return true;}catch{return false;}};
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
 function enrich(analysis,channels,storage,engine){const cache=read(storage).queries;const map=new Map(analysis||[]);for(const c of channels){const q=publicName(c.name).toLowerCase(),record=cache[q];if(!q||!record||Date.now()-record.at>CACHE_MS)continue;
   const matching=record.items.find(x=>normalize(publicName(x.name))===normalize(publicName(c.name))&&isTv(x));if(!matching)continue;
   // Explicit public-genre descriptions are high-quality evidence even when
   // a small Bayes vocabulary yields low confidence on short English metadata.
   const desc=String(matching.description||'');
   const strong=[
    ['Tin tức',/\bnews\b|\bcurrent affairs\b|thời sự|tin tức/i],
    ['Thể thao',/\bsports?\b|football|bóng đá|thể thao/i],
    ['Phim truyện',/\bmovies?\b|\bfilms?\b|cinema|phim truyện/i],
    ['Thiếu nhi',/\bchildren\b|\bkids?\b|cartoon|thiếu nhi/i],
    ['Khoa học',/\bscience\b|\bdocumentary\b|khám phá|khoa học/i],
    ['Giải trí',/\bentertainment\b|\bvariety\b|giải trí/i]
   ].find(([,re])=>re.test(desc));
   const bayes=engine?.predict?.(matching.name+' '+desc);
   const guess=strong?{label:strong[0],confidence:90}:bayes;const prior=map.get(String(c.id));
   if(!guess||guess.label==='Chưa phân loại'||guess.confidence<35||prior?.from==='EPG')continue;
   if(prior?.label!=='Chưa phân loại'&&Number(prior?.confidence||0)>=guess.confidence)continue;
   map.set(String(c.id),{...prior,label:guess.label,confidence:guess.confidence,from:'Internet/Wikidata',sourceUrl:matching.url});
 }return map;}
 async function scan({storage,channels=[],engine,lookup,clock=Date.now,budget=RUN_LIMIT,onUpdate=()=>{}}={}){
  if(!enabled(storage))return {disabled:true,requests:0,discovered:collect(storage,channels,engine)};
  if(!engine||typeof lookup!=='function')return{error:'Search service unavailable',requests:0,discovered:[]};
  const now=clock(),date=new Date(now).toISOString().slice(0,10),state=read(storage);
  if(state.day!==date){state.day=date;state.used=0;}
  const sorted=[...channels].map(c=>publicName(c.name)).filter(Boolean);
  const unique=[...new Set(sorted.map(s=>s.toLowerCase()))].sort((a,b)=>(state.queries[a]?.at||0)-(state.queries[b]?.at||0)).slice(0,12);
  const interest=engine.read?.(storage)?.seconds||{};
  const rankedTopics=Object.keys(TOPICS).sort((a,b)=>(Number(interest[b])||0)-(Number(interest[a])||0));
  const topics=rankedTopics.slice(0,3).map(x=>TOPICS[x]);
  const queue=[...unique,...topics].filter((q,i,all)=>all.indexOf(q)===i);
  let requests=0;
  for(const q of queue){
   if(!enabled(storage)||state.used>=DAY_LIMIT||requests>=Math.min(RUN_LIMIT,budget))break;
   if(state.queries[q]&&now-state.queries[q].at<CACHE_MS)continue;
   try{const raw=await lookup(q);const items=(Array.isArray(raw)?raw:[]).slice(0,8).filter(x=>/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(String(x.url||''))).map(x=>({name:String(x.name||'').slice(0,120),description:String(x.description||'').slice(0,180),url:x.url}));
    state.queries[q]={at:now,items};state.error='';
   }catch(error){state.error='Tra cứu tạm lỗi: '+String(error?.message||error).slice(0,100);state.queries[q]={at:now,items:[]};}
   requests++;state.used++;state.updatedAt=now;save(storage,state);onUpdate({requests,used:state.used,limit:DAY_LIMIT});
  }
  const results=collect(storage,channels,engine);onUpdate({done:true,discovered:results.length,error:state.error});
  return{requests,used:state.used,limit:DAY_LIMIT,discovered:results,error:state.error};
 }
 // Always-on local scan is independent from optional, rate-limited Wikidata lookups.
 async function scanLocal({channels=[],guide=null,guideLib=null,engine,clock=Date.now(),
  yieldNow=()=>new Promise(resolve=>setTimeout(resolve,0)),onProgress=()=>{},shouldStop=()=>false,batchSize=32}={}){
  const list=Array.isArray(channels)?channels:[],analysis=new Map();
  const total=list.length,guideProgrammes=Array.isArray(guide?.programmes)?guide.programmes.length:0;
  let processed=0,classified=0,epgChannels=0,epgProgrammes=0,lastYield=Date.now();
  const state=()=>({analysis,total,processed,classified,epgChannels,epgProgrammes,guideProgrammes});
  for(const channel of list){
   if(shouldStop())return {...state(),cancelled:true};
   if(channel?.id){
    let result=null;
    try{
     result=typeof engine?.analyzeChannel==='function'
      ?engine.analyzeChannel(channel,guide,guideLib,clock)
      :engine?.analyze?.([channel],guide,guideLib,clock)?.get(String(channel.id));
    }catch{}
    if(result){
     analysis.set(String(channel.id),result);
     if(result.label&&result.label!=='Chưa phân loại')classified++;
     if(result.epgMatched||result.epgCount>0)epgChannels++;
     epgProgrammes+=Math.max(0,Number(result.epgCount)||0);
    }
   }
   processed++;
   if(processed%Math.max(1,batchSize)===0||Date.now()-lastYield>18){
    onProgress(state());await yieldNow();lastYield=Date.now();
   }
  }
  onProgress(state());
  return {...state(),cancelled:false};
 }
 function fingerprint(channels){
  let hash=2166136261;
  for(const ch of channels){
   const str=String(ch?.id||'')+'|'+String(ch?.tvgId||'')+'|'+String(ch?.name||'')+'|'+String(ch?.group||ch?.groupTitle||'');
   for(let i=0;i<str.length;i++){hash^=str.charCodeAt(i);hash=Math.imul(hash,16777619);}
  }
  return channels.length+':'+(hash>>>0);
 }
 const statusByWindow=new WeakMap();
 function start(win,engine){
  if(!win?.document||!engine)return false;
  const tag='__watchflowAutoStarted';
  if(win[tag])return true;win[tag]=true;
  let lastKey='',lastGuide=null,guideVersion=0,generation=0,webBusy=false,lastInternet=0;
  const status={running:false,processed:0,total:0,classified:0,epgChannels:0,epgProgrammes:0,
   guideProgrammes:0,updatedAt:0,error:''};
  statusByWindow.set(win,status);
  const notify=detail=>win.document.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail}));
  const channels=()=>win.IPTVState?.getChannels?.()||[];
  const guide=()=>{try{return win.IPTVExtras?.getGuide?.()||null;}catch{return null;}};
  const yieldNow=()=>new Promise(resolve=>win.setTimeout(resolve,0));
  async function runLocal(list,epg){
   const token=++generation;
   Object.assign(status,{running:true,processed:0,total:list.length,classified:0,epgChannels:0,
    epgProgrammes:0,guideProgrammes:epg?.programmes?.length||0,error:''});
   backgroundAnalysis.set(win,new Map());notify({local:true,...status});
   let lastNotify=0;
   try{
    const result=await scanLocal({channels:list,guide:epg,guideLib:win.IPTVGuide,engine,
     shouldStop:()=>token!==generation,yieldNow,onProgress:progress=>{
      if(token!==generation)return;
      backgroundAnalysis.set(win,progress.analysis);
      Object.assign(status,{processed:progress.processed,total:progress.total,
       classified:progress.classified,epgChannels:progress.epgChannels,
       epgProgrammes:progress.epgProgrammes,guideProgrammes:progress.guideProgrammes});
      if(Date.now()-lastNotify>=250||progress.processed===progress.total){
       lastNotify=Date.now();notify({local:true,...status});
      }
     }});
    if(token!==generation||result.cancelled)return;
    backgroundAnalysis.set(win,enrich(result.analysis,list,win.localStorage,engine));
    Object.assign(status,{running:false,updatedAt:Date.now()});
    notify({local:true,complete:true,...status});
   }catch(error){
    if(token!==generation)return;
    Object.assign(status,{running:false,error:String(error?.message||error).slice(0,180)});
    notify({local:true,complete:true,...status});
   }
  }
  function inspect(){
   const list=channels(),epg=guide();
   if(epg!==lastGuide){lastGuide=epg;guideVersion++;}
   const mapping=JSON.stringify(epg?.manualMappings||{});
   const key=fingerprint(list)+'|'+guideVersion+'|'+(epg?.programmes?.length||0)
    +'|'+(epg?.offsetMinutes||0)+'|'+mapping+'|'+Math.floor(Date.now()/(30*60000));
   if(key===lastKey)return;
   lastKey=key;void runLocal(list,epg);
  }
  async function runInternet(){
   if(webBusy||!enabled(win.localStorage))return;
   if(Date.now()-lastInternet<PAUSE_MS)return;
   webBusy=true;lastInternet=Date.now();notify({internet:true,running:true});
   try{
    const list=channels();
    await scan({storage:win.localStorage,channels:list,engine,lookup:q=>engine.searchInternet(q),
     onUpdate:info=>notify({internet:true,...info})});
    const current=backgroundAnalysis.get(win);
    if(current?.size){
     backgroundAnalysis.set(win,enrich(current,channels(),win.localStorage,engine));
     notify({internet:true,complete:true});
    }
   }catch(error){notify({internet:true,error:String(error?.message||error).slice(0,140)});}
   finally{webBusy=false;notify({internet:true,running:false});}
  }
  // Local classification starts without a panel click and reruns on every playlist/EPG change.
  win.setTimeout(inspect,200);
  win.setInterval(inspect,3000);
  win.document.addEventListener('openiptv:watchflow-epg-changed',inspect);
  win.document.addEventListener('openiptv:watchflow-auto-rescan',()=>{
   lastKey='';inspect();lastInternet=0;void runInternet();
  });
  win.addEventListener?.('openiptv:channel-browser-refresh',inspect);
  win.setTimeout(()=>{void runInternet();},1800);
  win.setInterval(()=>{void runInternet();},PAUSE_MS);
  return true;
 }
 return Object.freeze({getBackgroundAnalysis:win=>backgroundAnalysis.get(win)||new Map(),getLocalStatus:win=>({...statusByWindow.get(win)}),KEY,OPT,DAY_LIMIT,publicName,isTv,read,enabled,setEnabled,collect,enrich,scan,scanLocal,fingerprint,start});
});
