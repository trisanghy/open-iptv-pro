'use strict';
/* WatchFlow background metadata discovery: bounded, transparent and revocable.
 * Searches only public channel names and topic labels; never sends stream URLs
 * or downloads/imports playlists. Runs while the application is open. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OpenIPTVWatchFlowAuto=api;})(typeof window==='undefined'?globalThis:window,function(){
 const KEY='watchflow:auto-catalog-v1',OPT='watchflow:auto-discovery-enabled';
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
   const guess=engine?.predict?.(matching.name+' '+matching.description);const prior=map.get(String(c.id));
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
 function start(win,engine){if(!win?.document||!engine)return false;const tag='__watchflowAutoStarted';if(win[tag])return true;win[tag]=true;
  let busy=false,last=0;
  const notify=detail=>win.document.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail}));
  const run=async(force=false)=>{
   if(busy||!enabled(win.localStorage))return;
   if(!force&&Date.now()-last<PAUSE_MS)return;busy=true;last=Date.now();notify({running:true});
   try{const channels=win.IPTVState?.getChannels?.()||[];
    await scan({storage:win.localStorage,channels,engine,lookup:q=>engine.searchInternet(q),onUpdate:notify});
   }catch(error){notify({error:String(error?.message||error).slice(0,140)});}
   finally{busy=false;notify({running:false,discovered:collect(win.localStorage,win.IPTVState?.getChannels?.()||[],engine).length});}
  };
  win.setTimeout(()=>{void run();},1800);
  win.setInterval(()=>{void run();},PAUSE_MS);
  win.document.addEventListener('openiptv:watchflow-auto-rescan',()=>{last=0;void run(true);});
  return true;
 }
 return Object.freeze({KEY,OPT,DAY_LIMIT,publicName,isTv,read,enabled,setEnabled,collect,enrich,scan,start});
});
