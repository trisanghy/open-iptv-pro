'use strict';
/* One-click AI. Selecting a mode authorizes its first-time model download.
 * No filenames, weights, CLI commands or extra confirmations needed.
 * Smart: verified ONNX multilingual E5/MiniLM. Intelligence: installed Qwen3
 * or smallest supported Mac MLX model. Offline Standard always survives.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root);
})(typeof window==='undefined'?null:window,function(){
 const CONSENT='watchflow:easy-setup-consent-v1';
 const qwen=['qwen06','qwen17','qwen4','qwen8'];
 const smartChoice=(catalog,current,installed=[])=>{
  const available=(catalog?.SMART||[]).filter(x=>x.downloadable&&x.modelRepo);
  return available.find(x=>x.id===current&&installed.includes(x.id))?.id||
    available.find(x=>installed.includes(x.id))?.id||
    available.find(x=>x.id===current)?.id||
    available.find(x=>x.id==='multilingual-e5-small-int8')?.id||available[0]?.id||'';
 };
 const qwenChoice=(models,pref='auto')=>
  (qwen.includes(pref)&&models?.[pref]?.installed&&models[pref].runtimeReady?pref:'')||
  qwen.find(x=>models?.[x]?.installed&&models[x]?.runtimeReady)||'';
 function controller(win,{catalog=win?.OpenIPTVWatchFlowModelCatalog,
   smart=win?.OpenIPTVWatchFlowSmart,native=win?.streamleaf,report}={}){
  const doc=win?.document,store=win?.localStorage;
  const note=report||((message,state='info')=>{
   const target=doc?.getElementById('wfAutoSetupStatus');
   if(target){target.textContent=message;target.dataset.state=state;}
  });
  const emit=type=>doc?.dispatchEvent?.(new win.Event(type));
  let smartPromise,heavyPromise;
  async function startSmart(){
   if(smartPromise)return smartPromise;
   smartPromise=(async()=>{
    note('Smart · đang kiểm tra AI đã có trên máy...');
    if(!smart?.installed||!smart?.install)throw Error('Thiếu bộ chạy Smart; Tiêu chuẩn vẫn hoạt động.');
    const supported=(catalog?.SMART||[]).filter(x=>x.downloadable&&x.modelRepo),already=[];
    for(const item of supported)if(await smart.installed(win,item.id))already.push(item.id);
    const select=doc?.getElementById('wfSmartModelSelect');
    const id=smartChoice(catalog,select?.value||catalog?.read?.(store),already);
    if(!id)throw Error('Chưa có bộ Smart phù hợp được xác minh.');
    catalog?.save?.(store,id);
    if(select&&select.value!==id){
     select.value=id;select.dispatchEvent(new win.Event('change',{bubbles:true}));
    }
    const model=catalog.getSmart(id);
    if(already.includes(id)){
     note('✓ Smart đã sẵn sàng · dùng lại AI đã tải, không tải lần nữa.','ready');
     emit('openiptv:watchflow-smart-installed');
     return{id,reused:true,installed:true};
    }
    if(!win?.caches?.open)throw Error('Thiết bị chưa hỗ trợ lưu AI để dùng offline.');
    note('Smart · tự tải AI đa ngôn ngữ lần đầu (khoảng '+model.size+').');
    await smart.install(win,id,event=>{
     const p=Number(event?.progress);
     if(event?.status==='progress'&&Number.isFinite(p))note('Smart · đang tải '+Math.max(0,Math.min(100,Math.round(p)))+'% · '+model.label);
     else if(event?.status)note('Smart · đang chuẩn bị '+model.label+' · '+String(event.status).slice(0,44));
    });
    if(!await smart.installed(win,id))throw Error('Đã tải nhưng chưa kiểm tra được chế độ dùng offline.');
    note('✓ Smart đã sẵn sàng · ứng dụng tự phân loại kênh/EPG mới.','ready');
    emit('openiptv:watchflow-smart-installed');
    return{id,reused:false,installed:true};
   })().catch(e=>{
    note('Smart chưa sẵn sàng: '+String(e?.message||e).slice(0,140)+'. Tiêu chuẩn vẫn hoạt động; chọn Smart để thử lại.','error');
    return{installed:false,error:String(e?.message||e)};
   }).finally(()=>{smartPromise=null;});
   return smartPromise;
  }
  async function startIntelligence(){
   if(heavyPromise)return heavyPromise;
   heavyPromise=(async()=>{
    note('Intelligence · kiểm tra AI Qwen3 đã tải...');
    if(!native?.aiModelStatus)throw Error('Không có bộ chạy Qwen3; Tiêu chuẩn vẫn hoạt động.');
    const state=await native.aiModelStatus();
    if(!state?.supported)throw Error('Qwen3 MLX hiện chỉ hỗ trợ Mac Apple Silicon; Smart có thể chạy trên Windows.');
    const choice=doc?.getElementById('wfModelSelect')?.value||'auto';
    let id=qwenChoice(state.models,choice);
    if(id){
     note('✓ Intelligence sử dụng lại Qwen3 '+id+' đã có, không tải trùng.','ready');
     emit('openiptv:watchflow-model-installed');
     return{id,reused:true,installed:true};
    }
    if(!native?.aiInstallModel)throw Error('Không có chức năng tự tải Qwen3.');
    id='qwen06';
    note('Intelligence · đang chuẩn bị AI Qwen3 nhỏ gọn (~360 MB) và bộ chạy...');
    await native.aiInstallModel(id);
    const check=await native.aiModelStatus();
    if(!check?.models?.[id]?.installed||!check?.models?.[id]?.runtimeReady)
     throw Error('Qwen3 đã tải nhưng chưa sẵn sàng chạy.');
    note('✓ Intelligence sẵn sàng · Qwen3 '+id+' dùng chung với AI đã cài.','ready');
    emit('openiptv:watchflow-model-installed');
    return{id,reused:false,installed:true};
   })().catch(e=>{
    note('Intelligence chưa sẵn sàng: '+String(e?.message||e).slice(0,150)+' Tiêu chuẩn vẫn hoạt động.','error');
    return{installed:false,error:String(e?.message||e)};
   }).finally(()=>{heavyPromise=null;});
   return heavyPromise;
  }
  return Object.freeze({startSmart,startIntelligence});
 }
 function mount(win){
  const doc=win?.document;if(!doc)return false;
  if(win.__watchflowEasySetupMounted)return true;
  win.__watchflowEasySetupMounted=true;
  let api=null;
  function ensure(){
   const area=doc.getElementById('watchflowDemo');
   if(!area)return false;
   if(!doc.getElementById('wfAutoSetupStatus')){
    const line=doc.createElement('p');line.id='wfAutoSetupStatus';line.className='wf-easy-status';
    line.setAttribute('role','status');line.setAttribute('aria-live','polite');
    line.textContent='Tiêu chuẩn đã có sẵn. Chọn Smart hoặc Intelligence là ứng dụng tự chuẩn bị AI.';
    (area.querySelector('.wf-local-banner')||area).append(line);
   }
   api??=controller(win);
   return true;
  }
  const activate=mode=>{
   if(!ensure())return;
   try{win.localStorage?.setItem(CONSENT,mode);}catch{}
   if(mode==='smart')void api.startSmart();
   if(mode==='intelligence')void api.startIntelligence();
  };
  doc.addEventListener('click',event=>{
   const selected=event.target?.closest?.('[data-wf-mode]')?.dataset?.wfMode;
   if(selected==='smart'||selected==='intelligence')activate(selected);
  });
  doc.addEventListener('openiptv:unified-ai-ready',ensure);
  doc.addEventListener('openiptv:renderer-ready',ensure);
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
  win.setTimeout?.(()=>{
   try{const mode=win.localStorage?.getItem('watchflow:demo-mode');
    if(win.localStorage?.getItem(CONSENT)===mode&&(mode==='smart'||mode==='intelligence'))activate(mode);
   }catch{}
  },2800);
  return true;
 }
 return Object.freeze({CONSENT,smartChoice,qwenChoice,controller,mount});
});
