'use strict';
/* WatchFlow native Qwen3: background, single-worker and cached per-device.
 * Only local channel name/group + bounded EPG titles are supplied to local MLX.
 * Qwen3 runs only if the user selected Intelligence and already installed it.
 */
(function(root,factory){const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root);
})(typeof window==='undefined'?null:window,function(){
 const STORE='watchflow:qwen-channel-cache-v2'; // No expiry for a stable channel/model identity.
 const durable=typeof window!=='undefined'?window.OpenIPTVWatchFlowPersistence:
  typeof require==='function'?require('./watchflow-persistence-v23-8-124.js'):null;
 const sessionCache=new WeakMap();
 const compatible=k=>/^qwen(?:06|17|4|8)$/.test(String(k));
 const select=(key,models)=>compatible(key)&&models?.[key]?.installed&&models?.[key]?.runtimeReady?key:
  key==='auto'?['qwen06','qwen17','qwen4','qwen8'].find(k=>models?.[k]?.installed&&models?.[k]?.runtimeReady)||'':'';
 const topics=()=>typeof window!=='undefined'?window.OpenIPTVWatchFlowTopics:null;
 const known=new Set(['Tin tức','Thể thao','Phim truyện','Thiếu nhi','Giải trí','Khoa học',
  'Ẩm thực','Du lịch','Văn hóa','Âm nhạc','Giáo dục','Kinh tế','Pháp luật',
  'Địa phương','Tài liệu','Phong cách sống','Truyền hình tổng hợp']);
 function verifiedInternet(ch,queries,auto,clock=Date.now()){
  if(!auto?.publicName||!auto?.isTv)return '';
  const name=auto.publicName(ch?.name).toLowerCase(),entry=queries?.[name];
  if(!name||!entry||entry.failed||clock-entry.at>=48*3600*1000)return '';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
  const match=(entry.items||[]).find(x=>/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(String(x.url||''))&&
   auto.isTv(x)&&norm(auto.publicName(x.name))===norm(name));
  if(!match)return '';
  return (String(match.name||'').slice(0,80)+' — '+String(match.description||'').slice(0,145))
   .replace(/https?:\/\/\S+|[\r\n]/gi,' ').slice(0,205);
 }
 function metadata(ch,guide,lib,webEvidence=''){
  const names=[];
  try{
   const now=lib?.current?.(guide,ch),rows=lib?.find?.(guide,ch)||[];
   for(const p of [now?.now,now?.next,...rows]){
    if(p?.title&&!names.includes(p.title))names.push(String(p.title).slice(0,105));
    if(names.length>=4)break;
   }
  }catch{}
  const scrub=s=>String(s||'').replace(/https?:\/\/\S+/gi,'').slice(0,120);
  const verified=String(webEvidence||'').replace(/https?:\/\/\S+/gi,'').slice(0,205);
  return ('Kênh: '+scrub(ch?.name)+'\nNhóm: '+scrub(ch?.group||ch?.groupTitle)+
   (verified?'\nDữ kiện Internet (Wikidata): '+verified:'')+
   '\nChương trình EPG: '+names.join(' | ').slice(0,240)).slice(0,590);
 }
 function labelsFrom(result){
  const values=Array.isArray(result?.labels)?result.labels:Array.isArray(result)?result:
   typeof result==='string'?result.split(/[,;|]/):[result?.label];
  return [...new Set(values.filter(x=>known.has(x)))].slice(0,4);
 }
 function fingerprint(value){let hash=2166136261;for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}
 function channelKey(model,channel,webEvidence=''){
  // EPG refreshes never invalidate Qwen. Verified Internet facts do.
  return fingerprint('v3|'+model+'|'+String(channel?.id||'')+'|'+String(channel?.name||'')+'|'+
   String(channel?.group||channel?.groupTitle||'')+'|'+String(channel?.tvgId||'')+
   (webEvidence?'|web:'+fingerprint(webEvidence):''));
 }
 function read(storage){try{const saved=JSON.parse(storage?.getItem(STORE)||'null');return saved&&saved.version===2&&saved.entries&&typeof saved.entries==='object'?saved.entries:{};}catch{return {};}}
 function save(storage,cache){try{const latest=Object.entries(cache).sort((a,b)=>(b[1].at||0)-(a[1].at||0)).slice(0,2400);
  storage?.setItem(STORE,JSON.stringify({version:2,entries:Object.fromEntries(latest)}));return true;
 }catch{return false;}}
 async function loadPersistent(win){
  const legacy=read(win?.localStorage);
  let saved=null;
  try{saved=await durable?.read(win,'qwen');}catch{}
  const stored=saved?.version===2&&saved.entries&&typeof saved.entries==='object'?saved.entries:{};
  const combined={...legacy,...stored,...(sessionCache.get(win)||{})};
  sessionCache.set(win,combined);
  return combined;
 }
 async function persist(win,cache){
  sessionCache.set(win,{...cache});
  try{
   if(await durable?.write(win,'qwen',{version:2,entries:cache,updatedAt:Date.now()})){
    // Only remove the legacy WatchFlow key after a successful IndexedDB write.
    try{win?.localStorage?.removeItem(STORE);}catch{}
    return 'indexeddb';
   }
  }catch{}
  return save(win?.localStorage,cache)?'localstorage':'memory';
 }
 function mount(win){
  const doc=win.document;
  let busy=false,scheduled=false,pending=false,pendingForce=false,manualWaiting=false,lastLog='';
  function attach(){
   const panel=doc.getElementById('wfIntelligenceModels');
   if(!panel)return false;
   if(doc.getElementById('wfQwenStatus'))return true;
   const net=doc.createElement('small');net.id='wfInternetResearchStatus';
   net.setAttribute('role','status');net.setAttribute('aria-live','polite');
   net.textContent='Internet/Wikidata: đang đọc số lượng đã tra cứu.';
   panel.append(net);
   const status=doc.createElement('small');status.id='wfQwenStatus';status.setAttribute('role','status');
   status.textContent='Qwen3: dùng kết quả kênh đã lưu. Kênh mới sẽ được phân loại tự động.';
   panel.append(status);
   const details=doc.createElement('small');details.id='wfQwenInfo';
   details.textContent='EPG cập nhật riêng · chỉ phân loại lại kênh khi bạn nhấn Quét lại.';
   panel.append(details);
   return true;
  }
  const notify=msg=>{const el=doc.getElementById('wfQwenStatus');if(el)el.textContent=msg;};
  function updateInternetStatus(){
   const el=doc.getElementById('wfInternetResearchStatus'),auto=win.OpenIPTVWatchFlowAuto;
   if(!el)return;
   const p=auto?.internetProgress?.(win.localStorage,win.IPTVState?.getChannels?.()||[]);
   if(!p){el.textContent='Internet: chưa có dữ liệu nghiên cứu.';return;}
   el.textContent=p.enabled?
    'Internet/Wikidata: đã tra '+p.searched+'/'+p.total+' tên kênh · '+p.matched+' khớp · '+p.used+'/'+p.limit+' lượt hôm nay'+
    (p.error?' · Lỗi: '+p.error:'')+(p.remaining>0?' · tiếp tục tự tra cứu khi chọn Intelligence.':''):
    'Tra cứu Internet đang TẮT trong Tùy chọn nâng cao. Qwen3 chỉ phân loại offline.';
  }
  const mode=()=>{try{return win.localStorage?.getItem('watchflow:demo-mode')||'standard';}catch{return 'standard';}};
  const selection=()=>doc.getElementById('wfModelSelect')?.value||
   win.localStorage?.getItem('watchflow:intelligence-model-v1')||'auto';
  const installed=async()=>{
   const native=win.streamleaf;
   if(!native?.aiModelStatus||!native?.aiClassifyChannel)return '';
   const inventory=await native.aiModelStatus();
   return select(selection(),inventory?.models);
  };
  function stored(cache,model,channel,guide,lib,webEvidence=''){
   const key=channelKey(model,channel,webEvidence);
   const old=fingerprint(model+'|'+String(channel.id)+'|'+metadata(channel,guide,lib));
   // Offline-only answers cannot masquerade as informed-by-Internet results.
   return {key,entry:cache[key]||(!webEvidence?cache[old]:null)};
  }
  async function start({force=false}={}){
   if(busy){pending=true;pendingForce=pendingForce||force;return;}
   busy=true;
   try{
    const native=win.streamleaf,all=(win.IPTVState?.getChannels?.()||[]).filter(c=>c?.id);
    if(!all.length){notify('Chưa có playlist; kênh mới sẽ tự phân loại sau khi nhập.');return;}
    const guide=win.IPTVExtras?.getGuide?.(),auto=win.OpenIPTVWatchFlowAuto;
    const queries=auto?.enabled?.(win.localStorage)===false?{}:auto?.read?.(win.localStorage)?.queries||{};
    const evidence=new Map(all.map(ch=>[String(ch.id),verifiedInternet(ch,queries,auto)]));
    updateInternetStatus();
    const cache=await loadPersistent(win),models=['qwen06','qwen17','qwen4','qwen8'];
    const active=await installed().catch(()=>''),preferred=active||models.find(key=>all.some(ch=>cache[channelKey(key,ch)]))||models[0];
    const analysis=auto?.getBackgroundAnalysis?.(win)||new Map();
    const priority=ch=>{
     const m=analysis.get(String(ch.id)),labels=m?.labels||[];
     return !m||m.label==='Chưa phân loại'||!labels.length?0:
      labels.every(x=>x==='Địa phương'||x==='Truyền hình tổng hợp')?1:2;
    };
    const ordered=[...all].sort((a,b)=>Number(!!evidence.get(String(b.id)))-Number(!!evidence.get(String(a.id)))||priority(a)-priority(b));
    const toClassify=[],restored=[];
    // Restore saved user channel classifications first, even when Standard is selected.
    for(const channel of ordered){
     let selected=null,model=preferred;
     if(!force){
      for(const candidate of [preferred,...models.filter(x=>x!==preferred)]){
       const item=stored(cache,candidate,channel,guide,win.IPTVGuide,evidence.get(String(channel.id))||'');
       if(item.entry&&Array.isArray(item.entry.labels)){
        model=candidate;selected=item;break;
       }
      }
     }
     if(selected){
      const values=labelsFrom(selected.entry);
      if(values.length)auto?.setNativeTopics?.(win,channel,values,{silent:true});
      // Upgrade legacy EPG-based keys so subsequent EPG refreshes never trigger Qwen.
      cache[channelKey(model,channel,evidence.get(String(channel.id))||'')]={at:selected.entry.at||Date.now(),labels:values};
      restored.push(channel);
     }else toClassify.push(channel);
    }
    await persist(win,cache);
    if(restored.length)doc.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',
     {detail:{native:true,complete:true,restored:restored.length}}));
    if(mode()!=='intelligence'){
     notify('Đã dùng lại '+restored.length+' kênh từ bộ nhớ · AI tự quét chỉ kênh mới khi chọn Intelligence.');
     return;
    }
    if(!active){notify('Đã phục hồi '+restored.length+' kênh. Chưa có Qwen3 sẵn sàng; Standard vẫn cập nhật EPG.');return;}
    // Cache from another Qwen model can be reused; explicit rescan always uses selected model.
    const pendingChannels=force?ordered:toClassify;
    if(!pendingChannels.length){
     notify('Qwen3 · '+all.length+'/'+all.length+' kênh đã lưu · không quét lại. EPG cập nhật riêng.');
     return;
    }
    let done=0,classified=0,errors=0;
    const nextBatch=pendingChannels.slice(0,24);
   for(const channel of nextBatch){
     if(mode()!=='intelligence')break;
     notify('Qwen3 '+active+' · '+(done+1)+'/'+pendingChannels.length+' kênh mới/cần quét · '+errors+' lỗi');
     try{
      const facts=evidence.get(String(channel.id))||'';
     const result=await native.aiClassifyChannel(active,metadata(channel,guide,win.IPTVGuide,facts));
      const tags=labelsFrom(result);
      cache[channelKey(active,channel,facts)]={at:Date.now(),labels:tags};
      if(tags.length&&auto?.setNativeTopics?.(win,channel,tags,{silent:true}))classified++;
      done++;
      if(done%4===0){
       await persist(win,cache);
       doc.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail:{native:true,progress:true,processed:done,total:pendingChannels.length}}));
      }
     }catch(error){
      errors++;lastLog=String(error?.message||error).slice(0,120);
      if(errors>=3){notify('Qwen3 dừng sau lỗi: '+lastLog+' · không bỏ kết quả kênh đã lưu.');break;}
      done++;
     }
     await new Promise(resolve=>win.setTimeout(resolve,150));
    }
    const storeMode=await persist(win,cache);
    doc.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail:{native:true,complete:true,processed:done,total:pendingChannels.length}}));
    if(errors<3)notify('Qwen3 '+active+' · '+done+'/'+pendingChannels.length+
     ' kênh cần phân loại · '+classified+' bổ sung. '+restored.length+' kênh cũ giữ nguyên.'+
     (storeMode==='memory'?' Lưu tạm trong phiên vì bộ nhớ chưa sẵn sàng.':'')+
     ' · '+[...evidence.values()].filter(Boolean).length+' kênh có thông tin Internet.');
   if(errors<3&&pendingChannels.length>nextBatch.length&&mode()==='intelligence')schedule();
   }catch(error){
    lastLog=String(error?.message||error).slice(0,140);
    notify('Qwen3: '+lastLog+' · kết quả đã lưu vẫn có thể sử dụng.');
   }finally{
    busy=false;
    if(pending){const forceNext=pendingForce;pending=false;pendingForce=false;schedule(forceNext);}
   }
  }
  function schedule(force=false){
   pendingForce=pendingForce||force;
   if(busy){pending=true;return;}
   if(scheduled)return;
   scheduled=true;
   win.setTimeout(()=>{
    scheduled=false;const forceNow=pendingForce;pendingForce=false;
    void start({force:forceNow});
   },900);
  }
  if(!attach()){
   doc.addEventListener('openiptv:unified-ai-ready',attach);
   doc.addEventListener('openiptv:renderer-ready',attach);
  }
  doc.addEventListener('openiptv:watchflow-auto-update',event=>{
   if(event.detail?.internet){
    updateInternetStatus();
    if(event.detail.complete&&mode()==='intelligence')schedule();
    return;
   }
   if(!event.detail?.local||!event.detail?.complete)return;
   if(manualWaiting){manualWaiting=false;schedule(true);}
   else if(event.detail?.newChannels>0)schedule();
   // EPG updates never enqueue Qwen inference for existing channels.
  });
  doc.addEventListener('openiptv:watchflow-manual-rescan',()=>{manualWaiting=true;});
  doc.addEventListener('openiptv:renderer-ready',()=>schedule());
  doc.addEventListener('openiptv:watchflow-model-installed',()=>schedule());
  doc.addEventListener('change',event=>{if(event.target?.id==='wfModelSelect'){updateInternetStatus();schedule();}});
  doc.addEventListener('click',event=>{if(event.target?.closest?.('[data-wf-mode="intelligence"]')){updateInternetStatus();schedule();}});
  win.setTimeout(()=>schedule(),2400);
  return true;
 }
 return Object.freeze({compatible,select,verifiedInternet,metadata,labelsFrom,fingerprint,channelKey,read,save,loadPersistent,persist,mount});
});
