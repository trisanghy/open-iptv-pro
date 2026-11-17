'use strict';
/** One settings icon for caption, translate and TTS; model storage stays app-private. */
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf;
 const panel=$('liveCaptionSetupPanel'),trigger=$('liveCaptionSetup');
 const picker=$('aiTranslationEngine'),mode=$('aiResourceMode'),modelList=$('aiModelList');
 const warning=$('aiHeatWarning'),inlineWarning=$('aiHeatWarningInline'),status=$('aiSettingsStatus');
 if(!panel||!trigger||!picker||!mode||!modelList||!warning||!status)return;
 const googleKeys=['tg4','tg12','tg27','gem3_1','gem3_4','gem4_e2','gem4_e4','gem4_12','gem4_26'];
 const googleSet=new Set(googleKeys);
 const modelKeys=['hymt18','hymt18q8','hymt7','hymt7q8','qwen06','qwen17','qwen4','qwen8',...googleKeys];
 const modelSet=new Set(modelKeys);
 const validEngines=new Set(['auto','argos',...modelKeys]);
 const validModes=new Set(['balanced','saver','quality']);
 const read=(key,fallback,allow)=>{
  try{const value=localStorage.getItem(key);return allow.has(value)?value:fallback;}catch{return fallback;}
 };
 picker.value=read('openiptv:translation-engine','auto',validEngines);
 mode.value=read('openiptv:ai-resource-mode','balanced',validModes);

 function buildLayout(){
  // Reparent existing, already-bound controls: moving a DOM node preserves its listeners.
  if(panel.dataset.aiLayout==='v55')return;
  panel.dataset.aiLayout='v55';
  panel.classList.add('ai-settings-grid');
  const create=(tag,cls,content)=>{
   const node=document.createElement(tag);
   node.className=cls;
   if(content!==undefined)node.textContent=content;
   return node;
  };
  const heading=create('div','ai-panel-heading');
  const headingWords=create('div','ai-panel-heading-copy');
  headingWords.append(create('strong','ai-panel-title','Cài đặt AI trên thiết bị'));
  headingWords.append(create('small','ai-panel-subtitle','Tùy chỉnh nhận diện, dịch, giọng đọc và quản lý dung lượng.'));
  heading.append(headingWords);
  const nearby=create('small','ai-panel-privacy','Chạy trên máy · Mô hình tải theo yêu cầu');
  heading.append(nearby);
  panel.insertBefore(heading,panel.firstChild);

  const translation=picker.closest('.ai-settings-section');
  const voice=$('liveTtsInstall')?.closest('.ai-settings-section');
  const storage=modelList.closest('.ai-settings-section');
  const recognition=create('section','ai-settings-section ai-recognition');
  recognition.setAttribute('aria-label','Nhận diện giọng nói');
  const title=create('div','ai-card-heading');
  title.append(create('span','ai-section-index','01'));
  title.append(create('h4','', 'Nhận diện giọng nói · Whisper'));
  recognition.append(title);
  const actions=create('div','ai-recognition-actions');
  for(const id of ['captionAutoInstall','captionChooseBinary','captionChooseModel','captionTestTranslate']){
   const button=$(id);
   if(button)actions.append(button);
  }
  recognition.append(actions);
  const originalHint=Array.from(panel.children).find(node=>
   node.tagName==='SMALL'&&node.id!=='aiSettingsStatus');
  if(originalHint){
   originalHint.classList.add('ai-card-hint');
   recognition.append(originalHint);
  }
  panel.insertBefore(recognition,translation||panel.firstChild);

  const decorate=(section,index,kind)=>{
   if(!section)return;
   section.classList.add(kind);
   const header=section.querySelector('h4');
   if(header){
    const bar=create('div','ai-card-heading');
    bar.append(create('span','ai-section-index',index));
    section.insertBefore(bar,header);
    bar.append(header);
   }
  };
  decorate(translation,'02','ai-translation');
  decorate(voice,'03','ai-voice');
  decorate(storage,'04','ai-storage');
  if(translation){
   for(const id of ['aiTranslationEngine','aiResourceMode']){
    const select=$(id);
    const label=translation.querySelector('label[for="'+id+'"]');
    if(!select||!label)continue;
    const field=create('div','ai-field');
    translation.insertBefore(field,label);
    field.append(label,select);
   }
  }
  if(storage){
   const total=$('aiStorageTotal');
   if(total)total.classList.add('ai-total-size');
   const details=create('details','ai-storage-details');
   details.id='aiStorageDetails';
   const summary=create('summary','ai-storage-toggle','Xem mô hình đã tải và giải phóng dung lượng');
   details.append(summary);
   details.append(modelList);
   const hint=Array.from(storage.children).find(node=>node.tagName==='SMALL'&&!node.id);
   if(hint){hint.classList.add('ai-card-hint');details.append(hint);}
   storage.append(details);
  }
  // Keep warning and status at the bottom. Both span the entire responsive grid.
  if(warning)panel.append(warning);
  panel.append(status);
 }
 buildLayout();
 const getEngine=()=>validEngines.has(picker.value)?picker.value:'auto';
 const getMode=()=>validModes.has(mode.value)?mode.value:'balanced';
 const notifyChange=()=>{
  try{localStorage.setItem('openiptv:translation-engine',getEngine());
      localStorage.setItem('openiptv:ai-resource-mode',getMode());}catch{}
  window.dispatchEvent(new CustomEvent('openiptv:ai-translate-settings-changed',{detail:{engine:getEngine(),mode:getMode()}}));
  showHeatWarning();
 };
 picker.addEventListener('change',notifyChange);
 mode.addEventListener('change',notifyChange);
 window.AISettings=Object.freeze({getEngine,getMode,refresh:()=>refresh()});
 const human=bytes=>!bytes?'0 MB':bytes>1073741824?(bytes/1073741824).toFixed(2)+' GB':Math.max(0.01,bytes/1048576).toFixed(1)+' MB';
 const setStatus=(message,failed=false)=>{
  status.textContent=String(message||'').slice(0,400);
  status.dataset.error=failed?'true':'false';
 };
 let latest=null,busy=false,confirmKey='',confirmAt=0,licenseKey='',licenseAt=0;
 const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),tts=$('liveTtsToggle');
 let heatTimer=null,heatFadeTimer=null,lastHeatSignature='';
 const heatNodes=[warning,inlineWarning].filter(Boolean);
 function hideHeatWarning(immediate=false){
  if(heatTimer!==null)clearTimeout(heatTimer);
  if(heatFadeTimer!==null)clearTimeout(heatFadeTimer);
  heatTimer=null;heatFadeTimer=null;
  if(immediate){
   for(const node of heatNodes){node.hidden=true;node.classList.remove('ai-alert-leaving');}
   return;
  }
  for(const node of heatNodes)node.classList.add('ai-alert-leaving');
  heatFadeTimer=setTimeout(()=>{
   for(const node of heatNodes){node.hidden=true;node.classList.remove('ai-alert-leaving');}
   heatFadeTimer=null;
  },250);
 }
 function showHeatWarning(){
  const activeSpeech=!!caption?.checked||!!translate?.checked;
  const localTranslate=!!translate?.checked;
  const localVoice=!!tts?.checked;
  const heavy=['hymt7','hymt7q8','qwen8','tg12','tg27','gem4_12','gem4_26'].includes(getEngine())||(getEngine()==='auto'&&getMode()==='quality'&&(latest?.models?.hymt7?.installed||latest?.models?.hymt7q8?.installed));
  const concurrent=(activeSpeech?1:0)+(localTranslate?1:0)+(localVoice?1:0);
  const intense=heavy&&(localTranslate||localVoice);
  const visible=intense||concurrent>=2;
  const signature=visible?[activeSpeech,localTranslate,localVoice,heavy].map(Number).join(':'):'';
  if(!visible){
   lastHeatSignature='';
   hideHeatWarning(true);
   return;
  }
  // A status refresh or opening the panel must NOT re-show the dismissed alert.
  if(signature===lastHeatSignature)return;
  lastHeatSignature=signature;
  hideHeatWarning(true);
  warning.textContent='⚠️ Nhiều AI đang hoạt động'+(heavy?' (có mô hình 7B)':'')+
   ': máy có thể nóng hơn, tốn RAM và hao pin. Chọn mô hình nhẹ hoặc tắt AI không cần thiết. '+
   'Cảnh báo tải xử lý, không phải số đo nhiệt độ phần cứng.';
  if(inlineWarning)inlineWarning.textContent=
   '⚠️ Nhiều AI đang bật: máy có thể nóng và hao pin. Nhấn ⚙ để chọn mô hình nhẹ.';
  for(const node of heatNodes)node.hidden=false;
  // Shown for ~10 seconds, fading for the final 250ms.
  heatTimer=setTimeout(()=>{heatTimer=null;hideHeatWarning();},9750);
 }
 for(const el of [caption,translate,tts])el?.addEventListener('change',showHeatWarning);
 window.addEventListener('pagehide',()=>hideHeatWarning(true));
 async function refresh(){
  if(!api?.aiModelStatus){setStatus('Cần Open IPTV Pro Desktop để quản lý AI.',true);return;}
  try{
   latest=await api.aiModelStatus();
   render();
   showHeatWarning();
  }catch(e){setStatus('Lỗi đọc trạng thái AI: '+String(e?.message||e),true);}
 }
 function button(text,action){
  const b=document.createElement('button');b.type='button';b.textContent=text;
  b.className='ai-model-action';b.addEventListener('click',action);return b;
 }
 function render(){
  modelList.replaceChildren();
  if(latest?.googleRuntime&&!latest.googleRuntime.online){
   const setup=document.createElement('div');
   setup.className='ai-ollama-setup';
   const help=document.createElement('div');
   help.textContent='Google AI cần Ollama chạy trên máy. Nếu đã cài, nhấn Tải mô hình để ứng dụng thử khởi chạy. Chỉ tải model khi bạn yêu cầu; không có dịch vụ đám mây.';
   const link=button('Cài Ollama miễn phí',()=>{void api.aiOpenOllamaDownload?.();});
   setup.append(help,link);modelList.append(setup);
  }
  const inventory=Array.isArray(latest?.storage)?latest.storage:[];
  const available=!!latest?.supported;
  const byId=Object.fromEntries(inventory.map(item=>[item.id,item]));
  const order=['whisper','argos','piper','vieneu','vietvoice','f5vi','viettts-runtime',...modelKeys,'cache','runtimes'];
  for(const id of order){
   const item=byId[id];if(!item)continue;
   if(['hymt18','qwen06','tg4','gem3_1','gem4_e2'].includes(id)){
    const heading=document.createElement('div');
    heading.className='ai-model-category';
    heading.textContent=({hymt18:'Dịch chuyên dụng · Hy-MT2',qwen06:'AI đa năng · Qwen3 (MLX)',tg4:'Google TranslateGemma · chuyên dịch (Ollama)',gem3_1:'Google Gemma 3 · đa ngữ (Ollama)',gem4_e2:'Google Gemma 4 · Apache 2.0 (Ollama)'})[id];
    modelList.append(heading);
   }
   const line=document.createElement('div');line.className='ai-model-card';
   const left=document.createElement('div');left.className='ai-model-description';
   const name=document.createElement('strong');name.textContent=item.label||id;
   const detail=document.createElement('small');
   const modelState=latest?.models?.[id]||latest?.hyMT?.[id];
   const modelReady=modelSet.has(id)?!!modelState?.installed:!!item.present;
   const hint=modelState?.approxBytes?' · tải khoảng '+human(modelState.approxBytes):'';
   detail.textContent=(modelReady?'Đã cài':item.present?'Tải chưa hoàn chỉnh':'Chưa tải')+
     ' · hiện dùng '+human(item.bytes)+(modelSet.has(id)?hint:'')+
     (modelSet.has(id)&&!googleSet.has(id)&&!available?' · chỉ Mac Apple Silicon':'');
   left.append(name,detail);
   const baseHardware={
    whisper:{minRamGB:4,recRamGB:8,device:'macOS/Windows'},argos:{minRamGB:4,recRamGB:8,device:'macOS/Windows'},
    piper:{minRamGB:4,recRamGB:8,device:'macOS/Windows'},vieneu:{minRamGB:12,recRamGB:24,device:'Mac Apple Silicon'},
    vietvoice:{minRamGB:8,recRamGB:16,device:'macOS/Windows · ONNX'},
    f5vi:{minRamGB:16,recRamGB:32,device:'Mac Apple Silicon / Windows GPU'}
   };
   const hardware=modelState||baseHardware[id];
   if(hardware?.minRamGB){
    const advice=document.createElement('small');
    advice.className='ai-hardware-hint';
    const current=Number(latest?.system?.totalRamGB)||0;
    const min=hardware.minRamGB,rec=hardware.recRamGB;
    const platform=googleSet.has(id)?'macOS/Windows + Ollama':(hardware.device||'Mac Apple Silicon');
    const fit=current?(current<min?' · Máy này có thể thiếu RAM':
      current<rec?' · Máy này nên dùng mô hình nhẹ hơn':' · RAM máy đạt mức khuyên dùng'):'';
    advice.textContent='Thiết bị: '+platform+' · RAM tối thiểu '+min+
      ' GB · khuyên dùng '+rec+' GB'+fit;
    left.append(advice);
   }
   if(id==='f5vi'){
    const licensing=document.createElement('small');licensing.className='ai-model-license';
    licensing.textContent='F5-TTS Vietnamese · CC-BY-NC-4.0 · chỉ phi thương mại; cần âm thanh mẫu có quyền sử dụng';
    left.append(licensing);
   }
   if(googleSet.has(id)){
    const licensing=document.createElement('small');
    licensing.className='ai-model-license';
    licensing.textContent=modelState?.license==='apache-2.0'?
      'Giấy phép Apache 2.0 · lưu trong Ollama (các ứng dụng khác cũng có thể dùng)':
      'Điều khoản Google Gemma · dữ liệu mô hình nằm trong Ollama dùng chung';
    left.append(licensing);
   }
   line.append(left);
   const right=document.createElement('div');right.className='ai-model-actions';
   const runtimeNeedsRepair=modelSet.has(id)&&!googleSet.has(id)&&modelReady&&!modelState?.runtimeReady;
   if(modelSet.has(id)&&(!modelReady||runtimeNeedsRepair)){
    const install=button(runtimeNeedsRepair?'Sửa bộ chạy MLX':item.present?'Tải tiếp':'Tải mô hình',async()=>{
     if(busy)return;
     if(googleSet.has(id)&&modelState?.license==='gemma-terms'&&
        (licenseKey!==id||Date.now()-licenseAt>20000)){
      licenseKey=id;licenseAt=Date.now();
      install.textContent='Chấp nhận điều khoản & tải';
      setStatus('Google Gemma có điều khoản sử dụng riêng. Xem và chấp nhận tại ai.google.dev/gemma/terms, sau đó bấm lần nữa trong 20 giây để tải '+item.label);
      void api.aiOpenGemmaTerms?.();
      return;
     }
     licenseKey='';busy=true;install.disabled=true;
     setStatus(runtimeNeedsRepair?'Đang cài lại môi trường MLX, giữ nguyên mô hình '+item.label+'…':
      'Đang tải '+item.label+' · yêu cầu mạng và dung lượng trống; Google AI dùng bộ chạy Ollama…');
     try{await api.aiInstallModel(id);await refresh();setStatus('Đã cài '+item.label);}
     catch(e){setStatus('Không cài được: '+String(e?.message||e),true);}
     finally{busy=false;install.disabled=false;}
    });
    install.disabled=(!googleSet.has(id)&&!available)||busy;right.append(install);
   }
   if(item.present&&item.bytes>=0){
    const remove=button('Xóa',async()=>{
     if(busy)return;
     const now=Date.now();
     if(confirmKey!==id||now-confirmAt>12000){
      confirmKey=id;confirmAt=now;remove.textContent='Xác nhận xóa';
      setStatus('Xóa '+item.label+' ('+human(item.bytes)+')? '+(googleSet.has(id)?'Mô hình nằm trong Ollama dùng chung, ứng dụng khác cũng có thể bị ảnh hưởng. ':'')+'Bấm Xác nhận xóa lần nữa trong 12 giây. Không xóa playlist IPTV.');
      return;
     }
     confirmKey='';busy=true;remove.disabled=true;
     try{
      const result=await api.aiDeleteModel(id);
      await refresh();setStatus('Đã giải phóng khoảng '+human(result.freed)+' từ '+item.label);
     }catch(e){setStatus('Không thể xóa: '+String(e?.message||e),true);}
     finally{busy=false;}
    });
    right.append(remove);
   }
   line.append(right);modelList.append(line);
  }
  const used=inventory.reduce((sum,item)=>sum+(Number(item.bytes)||0),0);
  const label=$('aiStorageTotal');if(label)label.textContent='Dung lượng AI đã tải: '+human(used)+' (gồm mô hình Google dùng chung trong Ollama)';
 }
 trigger.title='Cài đặt chung: Live Caption · Live Translate · TTS · Quản lý bộ nhớ AI';
 const originalClick=()=>{if(!panel.hidden)void refresh();};
 trigger.addEventListener('click',originalClick);
 if(api?.aiOnEvent)api.aiOnEvent(ev=>{
  if(ev?.type==='ai-progress'&&ev.message)setStatus(ev.message);
 });
 showHeatWarning();
 void refresh();
})();
