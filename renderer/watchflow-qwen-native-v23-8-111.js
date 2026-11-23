'use strict';
/* WatchFlow native Qwen3: background, single-worker and cached per-device.
 * Only local channel name/group + bounded EPG titles are supplied to local MLX.
 * Qwen3 runs only if the user selected Intelligence and already installed it.
 */
(function(root,factory){const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root);
})(typeof window==='undefined'?null:window,function(){
 const STORE='watchflow:qwen-channel-cache-v2',CACHE_MS=7*86400000;
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
 function read(storage){try{const saved=JSON.parse(storage?.getItem(STORE)||'null');return saved&&saved.version===2&&saved.entries&&typeof saved.entries==='object'?saved.entries:{};}catch{return {};}}
 function save(storage,cache){try{const latest=Object.entries(cache).sort((a,b)=>(b[1].at||0)-(a[1].at||0)).slice(0,2400);
  storage?.setItem(STORE,JSON.stringify({version:2,entries:Object.fromEntries(latest)}));return true;
 }catch{return false;}}
 function mount(win){
  const doc=win.document;let busy=false,round=0,scheduled=false,lastLog='',active=false;
  function attach(){
   const panel=doc.getElementById('wfIntelligenceModels');
   if(!panel)return false;
   if(doc.getElementById('wfQwenStatus'))return true;
   const status=doc.createElement('small');status.id='wfQwenStatus';status.setAttribute('role','status');
   status.textContent='Qwen3 sẽ tự kiểm tra các kênh khi chọn Intelligence và đã cài mô hình.';
   const details=doc.createElement('small');details.id='wfQwenInfo';
   details.textContent='Không giới hạn 8 kênh · kết quả xuất hiện trong Chủ đề kênh, không tạo playlist mới.';
   panel.append(status,details);
   return true;
  }
  const notify=(msg)=>{const el=doc.getElementById('wfQwenStatus');if(el)el.textContent=msg;};
  const mode=()=>{try{return win.localStorage?.getItem('watchflow:demo-mode')||'standard';}catch{return 'standard';}};
  const installed=async()=>{
   const native=win.streamleaf;
   if(!native?.aiModelStatus||!native?.aiClassifyChannel)return '';
   const inventory=await native.aiModelStatus();
   const choice=doc.getElementById('wfModelSelect')?.value||'auto';
   return select(choice,inventory?.models);
  };
  async function start(){
   if(busy||mode()!=='intelligence')return;
   busy=true;active=true;const token=++round;
   try{
    const native=win.streamleaf,model=await installed();
    if(!model){notify('Chưa có Qwen3 sẵn sàng; bộ phân loại Standard và thư mục EPG vẫn hoạt động.');return;}
    const all=(win.IPTVState?.getChannels?.()||[]).filter(c=>c?.id);
    if(!all.length){notify('Chưa có playlist. Sau khi nhập kênh, hệ thống tự phân tích.');return;}
    const guide=win.IPTVExtras?.getGuide?.();
    const auto=win.OpenIPTVWatchFlowAuto;
    const analysis=auto?.getBackgroundAnalysis?.(win)||new Map();
    const cached=read(win.localStorage);
    // Prioritize unknown/generic channels; all remaining channels are eligible afterwards.
    const priority=ch=>{
     const m=analysis.get(String(ch.id)),tags=m?.labels||[];
     return !m||m.label==='Chưa phân loại'||!tags.length?0:
      tags.every(x=>x==='Địa phương'||x==='Truyền hình tổng hợp')?1:2;
    };
    const sorted=[...all].sort((a,b)=>priority(a)-priority(b));
    let done=0,skipped=0,classified=0,errors=0;
    for(const channel of sorted){
     if(token!==round||mode()!=='intelligence')break;
     const meta=metadata(channel,guide,win.IPTVGuide);
     const id=fingerprint(model+'|'+String(channel.id)+'|'+meta);
     const saved=cached[id];
     let tags;
     if(saved&&Date.now()-saved.at<CACHE_MS&&Array.isArray(saved.labels)){
      tags=labelsFrom(saved);skipped++;
     }else{
      notify('Qwen3 '+model+' · '+(done+1)+'/'+sorted.length+' kênh · '+classified+' đã xác định · '+errors+' lỗi');
      try{
       const result=await native.aiClassifyChannel(model,meta);
       tags=labelsFrom(result);
       cached[id]={at:Date.now(),labels:tags};
       if(done%8===0)save(win.localStorage,cached);
      }catch(error){
       errors++;lastLog=String(error?.message||error).slice(0,120);
       if(errors>=3){notify('Qwen3 tạm dừng sau lỗi: '+lastLog+' · Standard vẫn phân loại.');break;}
       done++;continue;
      }
     }
     if(tags?.length&&auto?.setNativeTopics?.(win,channel,tags))classified++;
     done++;
     if(done%8===0)save(win.localStorage,cached);
     // Yield to playback and UI. One native inference at a time.
     await new Promise(resolve=>win.setTimeout(resolve,150));
    }
    save(win.localStorage,cached);
    if(errors<3)notify('Qwen3 '+model+' · đã kiểm tra '+done+'/'+sorted.length+' kênh ('+skipped+
     ' từ bộ nhớ); '+classified+' kết quả bổ sung vào các chủ đề. '+(errors?'Lỗi: '+errors:''));
   }catch(error){lastLog=String(error?.message||error).slice(0,140);
    notify('Chưa thể chạy Qwen3: '+lastLog+' · AI Standard vẫn tự phân loại.');
   }finally{busy=false;active=false;}
  }
  function schedule(){
   if(scheduled)return;
   scheduled=true;
   win.setTimeout(()=>{scheduled=false;void start();},900);
  }
  if(!attach()){
   doc.addEventListener('openiptv:unified-ai-ready',attach);
   doc.addEventListener('openiptv:renderer-ready',attach);
  }
  doc.addEventListener('openiptv:watchflow-auto-update',event=>{
   if(event.detail?.local&&event.detail?.complete)schedule();
  });
  doc.addEventListener('openiptv:renderer-ready',schedule);
  doc.addEventListener('change',event=>{
   if(event.target?.id==='wfModelSelect')schedule();
  });
  doc.addEventListener('click',event=>{
   if(event.target?.closest?.('[data-wf-mode="intelligence"]'))schedule();
  });
  win.setTimeout(schedule,2400);
  return true;
 }
 return Object.freeze({compatible,select,metadata,labelsFrom,fingerprint,read,save,mount});
});
