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
 const compatible=k=>/^qwen(?:06|17|4|8)$/.test(String(k));
 const select=(key,models)=>compatible(key)&&models?.[key]?.installed&&models?.[key]?.runtimeReady?key:
  key==='auto'?['qwen06','qwen17','qwen4','qwen8'].find(k=>models?.[k]?.installed&&models?.[k]?.runtimeReady)||'':'';
 const topics=()=>typeof window!=='undefined'?window.OpenIPTVWatchFlowTopics:null;
 const known=new Set(['Tin tức','Thể thao','Phim truyện','Thiếu nhi','Giải trí','Khoa học',
  'Ẩm thực','Du lịch','Văn hóa','Âm nhạc','Giáo dục','Kinh tế','Pháp luật',
  'Địa phương','Tài liệu','Phong cách sống','Truyền hình tổng hợp']);
 function metadata(ch,guide,lib){
  const names=[];
  try{
   const now=lib?.current?.(guide,ch),rows=lib?.find?.(guide,ch)||[];
   for(const p of [now?.now,now?.next,...rows]){
    if(p?.title&&!names.includes(p.title))names.push(String(p.title).slice(0,105));
    if(names.length>=4)break;
   }
  }catch{}
  const scrub=s=>String(s||'').replace(/https?:\/\/\S+/gi,'').slice(0,120);
  return ('Kênh: '+scrub(ch?.name)+'\nNhóm: '+scrub(ch?.group||ch?.groupTitle)+
   '\nChương trình EPG: '+names.join(' | ')).slice(0,590);
 }
 function labelsFrom(result){
  const values=Array.isArray(result?.labels)?result.labels:Array.isArray(result)?result:
   typeof result==='string'?result.split(/[,;|]/):[result?.label];
  return [...new Set(values.filter(x=>known.has(x)))].slice(0,4);
 }
 function fingerprint(value){let hash=2166136261;for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}
 function channelKey(model,channel){
  // Deliberately independent from EPG. A schedule refresh must never rerun channel AI.
  return fingerprint('v3|'+model+'|'+String(channel?.id||'')+'|'+String(channel?.name||'')+'|'+
   String(channel?.group||channel?.groupTitle||'')+'|'+String(channel?.tvgId||''));
 }
 function read(storage){try{const saved=JSON.parse(storage?.getItem(STORE)||'null');return saved&&saved.version===2&&saved.entries&&typeof saved.entries==='object'?saved.entries:{};}catch{return {};}}
 function save(storage,cache){try{const latest=Object.entries(cache).sort((a,b)=>(b[1].at||0)-(a[1].at||0)).slice(0,2400);
  storage?.setItem(STORE,JSON.stringify({version:2,entries:Object.fromEntries(latest)}));return true;
 }catch{return false;}}
 function mount(win){
  const doc=win.document;
  let busy=false,scheduled=false,pending=false,pendingForce=false,manualWaiting=false,lastLog='';
  function attach(){
   const panel=doc.getElementById('wfIntelligenceModels');
   if(!panel)return false;
   if(doc.getElementById('wfQwenStatus'))return true;
   const status=doc.createElement('small');status.id='wfQwenStatus';status.setAttribute('role','status');
   status.textContent='Qwen3: dùng kết quả kênh đã lưu. Kênh mới sẽ được phân loại tự động.';
   panel.append(status);
   const details=doc.createElement('small');details.id='wfQwenInfo';
   details.textContent='EPG cập nhật riêng · chỉ phân loại lại kênh khi bạn nhấn Quét lại.';
   panel.append(details);
   return true;
  }
  const notify=msg=>{const el=doc.getElementById('wfQwenStatus');if(el)el.textContent=msg;};
  const mode=()=>{try{return win.localStorage?.getItem('watchflow:demo-mode')||'standard';}catch{return 'standard';}};
  const selection=()=>doc.getElementById('wfModelSelect')?.value||
   win.localStorage?.getItem('watchflow:intelligence-model-v1')||'auto';
  const installed=async()=>{
   const native=win.streamleaf;
   if(!native?.aiModelStatus||!native?.aiClassifyChannel)return '';
   const inventory=await native.aiModelStatus();
   return select(selection(),inventory?.models);
  };
  function stored(cache,model,channel,guide,lib){
   const key=channelKey(model,channel),old=fingerprint(model+'|'+String(channel.id)+'|'+metadata(channel,guide,lib));
   // Migrate v23.8.118 cached results to an EPG-independent channel identity.
   return {key,entry:cache[key]||cache[old]};
  }
  async function start({force=false}={}){
   if(busy){pending=true;pendingForce=pendingForce||force;return;}
   busy=true;
   try{
    const native=win.streamleaf,all=(win.IPTVState?.getChannels?.()||[]).filter(c=>c?.id);
    if(!all.length){notify('Chưa có playlist; kênh mới sẽ tự phân loại sau khi nhập.');return;}
    const guide=win.IPTVExtras?.getGuide?.(),auto=win.OpenIPTVWatchFlowAuto;
    const cache=read(win.localStorage),models=['qwen06','qwen17','qwen4','qwen8'];
    const active=await installed().catch(()=>''),preferred=active||models.find(key=>all.some(ch=>cache[channelKey(key,ch)]))||models[0];
    const analysis=auto?.getBackgroundAnalysis?.(win)||new Map();
    const priority=ch=>{
     const m=analysis.get(String(ch.id)),labels=m?.labels||[];
     return !m||m.label==='Chưa phân loại'||!labels.length?0:
      labels.every(x=>x==='Địa phương'||x==='Truyền hình tổng hợp')?1:2;
    };
    const ordered=[...all].sort((a,b)=>priority(a)-priority(b));
    const toClassify=[],restored=[];
    // Restore saved user channel classifications first, even when Standard is selected.
    for(const channel of ordered){
     let selected=null,model=preferred;
     if(!force){
      for(const candidate of [preferred,...models.filter(x=>x!==preferred)]){
       const item=stored(cache,candidate,channel,guide,win.IPTVGuide);
       if(item.entry&&Array.isArray(item.entry.labels)){
        model=candidate;selected=item;break;
       }
      }
     }
     if(selected){
      const values=labelsFrom(selected.entry);
      if(values.length)auto?.setNativeTopics?.(win,channel,values,{silent:true});
      // Upgrade legacy EPG-based keys so subsequent EPG refreshes never trigger Qwen.
      cache[channelKey(model,channel)]={at:selected.entry.at||Date.now(),labels:values};
      restored.push(channel);
     }else toClassify.push(channel);
    }
    save(win.localStorage,cache);
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
    for(const channel of pendingChannels){
     if(mode()!=='intelligence')break;
     notify('Qwen3 '+active+' · '+(done+1)+'/'+pendingChannels.length+' kênh mới/cần quét · '+errors+' lỗi');
     try{
      const result=await native.aiClassifyChannel(active,metadata(channel,guide,win.IPTVGuide));
      const tags=labelsFrom(result);
      cache[channelKey(active,channel)]={at:Date.now(),labels:tags};
      if(tags.length&&auto?.setNativeTopics?.(win,channel,tags,{silent:true}))classified++;
      done++;
      if(done%4===0){
       save(win.localStorage,cache);
       doc.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail:{native:true,progress:true,processed:done,total:pendingChannels.length}}));
      }
     }catch(error){
      errors++;lastLog=String(error?.message||error).slice(0,120);
      if(errors>=3){notify('Qwen3 dừng sau lỗi: '+lastLog+' · không bỏ kết quả kênh đã lưu.');break;}
      done++;
     }
     await new Promise(resolve=>win.setTimeout(resolve,150));
    }
    save(win.localStorage,cache);
    doc.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail:{native:true,complete:true,processed:done,total:pendingChannels.length}}));
    if(errors<3)notify('Qwen3 '+active+' · '+done+'/'+pendingChannels.length+
     ' kênh cần phân loại · '+classified+' bổ sung. '+restored.length+' kênh cũ giữ nguyên.');
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
   if(!event.detail?.local||!event.detail?.complete)return;
   if(manualWaiting){manualWaiting=false;schedule(true);}
   else if(event.detail?.newChannels>0)schedule();
   // EPG updates never enqueue Qwen inference for existing channels.
  });
  doc.addEventListener('openiptv:watchflow-manual-rescan',()=>{manualWaiting=true;});
  doc.addEventListener('openiptv:renderer-ready',()=>schedule());
  doc.addEventListener('change',event=>{if(event.target?.id==='wfModelSelect')schedule();});
  doc.addEventListener('click',event=>{if(event.target?.closest?.('[data-wf-mode="intelligence"]'))schedule();});
  win.setTimeout(()=>schedule(),2400);
  return true;
 }
 return Object.freeze({compatible,select,metadata,labelsFrom,fingerprint,channelKey,read,save,mount});
});
