'use strict';
/* Smart ONNX classification: only user-installed models, only new channel metadata
 * and fresh EPG titles, cache each result in IndexedDB, never touch playback URLs.
 */
(function(root,factory){const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root);
})(typeof window==='undefined'?null:window,function(){
 const smart=()=>typeof window!=='undefined'?window.OpenIPTVWatchFlowSmart:null;
 const db=()=>typeof window!=='undefined'?window.OpenIPTVWatchFlowPersistence:null;
 let mounted=false;
 function mount(win){
  if(!win?.document||mounted)return false;mounted=true;
  const doc=win.document;let busy=false,queued=false,scheduled=false,forcePending=false;
  const mode=()=>{
   const active=doc.querySelector?.('[data-wf-mode="smart"].wf-active');
   if(active)return true;
   try{return win.localStorage?.getItem('watchflow:demo-mode')==='smart';}catch{return false;}
  };
  const modelId=()=>doc.getElementById('wfSmartModelSelect')?.value||'multilingual-e5-small-int8';
  const notify=msg=>{const target=doc.getElementById('wfSmartProgress');if(target)target.textContent=msg;};
  async function classify({force=false}={}){
   if(busy){queued=true;forcePending=forcePending||force;return;}
   if(!mode())return;
   busy=true;
   try{
    const id=modelId(),lib=smart(),auto=win.OpenIPTVWatchFlowAuto,model=lib?.supported(id);
    if(!model){notify('Chưa có gói ONNX được xác minh cho lựa chọn này; Standard vẫn hoạt động.');return;}
    if(!await lib.installed(win,id)){notify('Chưa tải '+model.label+'. Nhấn ↓ Tải mô hình để bắt đầu.');return;}
    const channels=(win.IPTVState?.getChannels?.()||[]).filter(x=>x?.id);
    if(!channels.length){notify('Chưa có kênh trong playlist.');return;}
    const saved=!force?await db()?.read(win,'smart-results:'+id).catch(()=>null):null;
    const cached=saved?.entries&&typeof saved.entries==='object'?saved.entries:{};
    const analysis=auto?.getBackgroundAnalysis?.(win)||new Map();
    let complete=0,analysed=0,epgNew=0,skipped=0,errors=0;
    const entries={};
    // Preserve previously confirmed model labels for unchanged channels immediately.
    for(const channel of channels){
     const signature=auto?.channelSignature?.(channel),key=String(channel.id),old=cached[key];
     if(old?.signature===signature){
      entries[key]={...old};
      if(old.labels?.length)auto?.setNativeTopics?.(win,channel,old.labels,{silent:true,source:'Smart ONNX offline'});
     }
    }
    for(const channel of channels){
     if(!mode()||modelId()!==id)break;
     const key=String(channel.id),signature=auto?.channelSignature?.(channel),previous=entries[key];
     let result=previous;
     if(!result){
      notify('Smart '+model.label+' · '+(complete+1)+'/'+channels.length+' kênh · '+errors+' lỗi');
      try{
       const metadata=('Tên: '+String(channel.name||'')+'. Nhóm: '+String(channel.group||channel.groupTitle||'')).slice(0,240);
       const match=await lib.classify(win,id,metadata);
       result={signature,labels:match.labels,programmeTopics:{},updatedAt:Date.now()};
       entries[key]=result;analysed++;
       if(match.labels?.length)auto?.setNativeTopics?.(win,channel,match.labels,{silent:true,source:'Smart ONNX offline'});
      }catch(err){errors++;if(errors>=3){notify('Smart dừng sau lỗi: '+String(err?.message||err).slice(0,140));break;}complete++;continue;}
     }else skipped++;
     // Standard has already classified full EPG. Smart refines only current/next
     // programme semantics, then caches by content hash (not broadcast time).
     const record=analysis.get(key);
     const programmeRecords=(record?.programmes||[]).filter(p=>p?.end>Date.now()).slice(0,2);
     for(const p of programmeRecords){
      if(!p.key||!p.title)continue;
      let tags=result.programmeTopics?.[p.key];
      if(!tags){
       try{
        const classified=await lib.classify(win,id,String(p.title)+' · '+String(p.description||''));
        tags=classified.labels;result.programmeTopics[p.key]=tags;epgNew++;
       }catch{continue;}
      }
      if(tags?.length)auto?.setSmartProgrammeLabels?.(win,key,p.key,tags,{silent:true});
     }
     complete++;
     if(complete%8===0){
      const persisted=await db()?.write(win,'smart-results:'+id,{version:1,entries,updatedAt:Date.now()});
      notify('Smart '+model.label+' · '+complete+'/'+channels.length+' kênh · '+analysed+' kênh mới · '+epgNew+' chương trình EPG mới'+(!persisted?' · chưa lưu được':''));
      doc.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail:{smart:true,progress:true}}));
      await new Promise(resolve=>win.setTimeout(resolve,30));
     }
    }
    const ok=await db()?.write(win,'smart-results:'+id,{version:1,entries,updatedAt:Date.now()});
    notify('Smart '+model.label+' · '+complete+'/'+channels.length+' kênh · '+skipped+' kết quả cũ · '+analysed+' kênh mới · '+epgNew+' EPG mới'+(!ok?' · chưa lưu được':''));
    doc.dispatchEvent(new win.CustomEvent('openiptv:watchflow-auto-update',{detail:{smart:true,complete:true}}));
   }catch(err){notify('Smart ONNX: '+String(err?.message||err).slice(0,160));}
   finally{busy=false;if(queued){const force=forcePending;queued=false;forcePending=false;schedule(force);}}
  }
  function schedule(force=false){
   forcePending=forcePending||force;
   if(busy){queued=true;return;}
   if(scheduled)return;
   scheduled=true;
   win.setTimeout(()=>{scheduled=false;const force=forcePending;forcePending=false;void classify({force});},650);
  }
  doc.addEventListener('openiptv:watchflow-smart-installed',()=>schedule());
  doc.addEventListener('openiptv:watchflow-auto-update',event=>{
   if(event.detail?.local&&event.detail?.complete&&(event.detail.newChannels>0||event.detail.newProgrammes>0))schedule();
  });
  doc.addEventListener('openiptv:watchflow-manual-rescan',()=>schedule(true));
  doc.addEventListener('change',event=>{if(event.target?.id==='wfSmartModelSelect')schedule();});
  doc.addEventListener('click',event=>{if(event.target?.closest?.('[data-wf-mode="smart"]'))schedule();});
  doc.addEventListener('openiptv:renderer-ready',()=>schedule());
  win.setTimeout(()=>schedule(),2500);
  return true;
 }
 return Object.freeze({mount});
});
