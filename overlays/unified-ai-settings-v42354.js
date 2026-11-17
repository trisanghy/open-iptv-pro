'use strict';
/** One settings icon for caption, translate and TTS; model storage stays app-private. */
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf;
 const panel=$('liveCaptionSetupPanel'),trigger=$('liveCaptionSetup');
 const picker=$('aiTranslationEngine'),mode=$('aiResourceMode'),modelList=$('aiModelList');
 const warning=$('aiHeatWarning'),inlineWarning=$('aiHeatWarningInline'),status=$('aiSettingsStatus');
 if(!panel||!trigger||!picker||!mode||!modelList||!warning||!status)return;
 const validEngines=new Set(['auto','argos','hymt18','hymt7']);
 const validModes=new Set(['balanced','saver','quality']);
 const read=(key,fallback,allow)=>{
  try{const value=localStorage.getItem(key);return allow.has(value)?value:fallback;}catch{return fallback;}
 };
 picker.value=read('openiptv:translation-engine','auto',validEngines);
 mode.value=read('openiptv:ai-resource-mode','balanced',validModes);
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
 let latest=null,busy=false,confirmKey='',confirmAt=0;
 const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),tts=$('liveTtsToggle');
 function showHeatWarning(){
  const activeSpeech=!!caption?.checked||!!translate?.checked;
  const localTranslate=!!translate?.checked;
  const localVoice=!!tts?.checked;
  const heavy=getEngine()==='hymt7'||(getEngine()==='auto'&&getMode()==='quality'&&!!latest?.hyMT?.hymt7?.installed);
  const concurrent=(activeSpeech?1:0)+(localTranslate?1:0)+(localVoice?1:0);
  const intense=heavy&&(localTranslate||localVoice);
  const visible=intense||concurrent>=3;
  warning.hidden=!visible;
  warning.textContent=visible?
   '⚠️ Đang bật nhiều tác vụ AI offline'+(heavy?' và mô hình 7B':'')+
   ': máy có thể nóng hơn, dùng nhiều RAM/GPU, hao pin và chạy phụ đề chậm. '+
   'Nên chọn Argos hoặc Hy-MT2 1.8B và tắt các AI không dùng. Đây là cảnh báo tải xử lý, không phải số đo nhiệt độ phần cứng.':'';
  if(inlineWarning){
   inlineWarning.hidden=!visible;
   inlineWarning.textContent=visible?'⚠️ Nhiều AI đang bật: máy có thể nóng và hao pin hơn. Nhấn ⚙ để chọn mô hình nhẹ.':'';
  }
 }
 for(const el of [caption,translate,tts])el?.addEventListener('change',showHeatWarning);
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
  const inventory=Array.isArray(latest?.storage)?latest.storage:[];
  const available=!!latest?.supported;
  const byId=Object.fromEntries(inventory.map(item=>[item.id,item]));
  const order=['whisper','argos','piper','vieneu','hymt18','hymt7','cache','runtimes'];
  for(const id of order){
   const item=byId[id];if(!item)continue;
   const line=document.createElement('div');line.className='ai-model-card';
   const left=document.createElement('div');left.className='ai-model-description';
   const name=document.createElement('strong');name.textContent=item.label||id;
   const detail=document.createElement('small');
   detail.textContent=(item.present?'Đã tải':'Chưa tải')+' · '+human(item.bytes)+
     ((id==='hymt18'||id==='hymt7')&&!available?' · chỉ hỗ trợ Mac Apple Silicon':'');
   left.append(name,detail);line.append(left);
   const right=document.createElement('div');right.className='ai-model-actions';
   if(['hymt18','hymt7'].includes(id)&&!item.present){
    const install=button('Tải mô hình',async()=>{
     if(busy)return;
     busy=true;install.disabled=true;
     setStatus('Đang tải '+item.label+'; yêu cầu kết nối mạng và vài GB dung lượng trống…');
     try{await api.aiInstallModel(id);await refresh();setStatus('Đã cài '+item.label);}
     catch(e){setStatus('Không cài được: '+String(e?.message||e),true);}
     finally{busy=false;install.disabled=false;}
    });
    install.disabled=!available||busy;right.append(install);
   }
   if(item.present&&item.bytes>=0){
    const remove=button('Xóa',async()=>{
     if(busy)return;
     const now=Date.now();
     if(confirmKey!==id||now-confirmAt>12000){
      confirmKey=id;confirmAt=now;remove.textContent='Xác nhận xóa';
      setStatus('Xóa '+item.label+' ('+human(item.bytes)+')? Bấm “Xác nhận xóa” lần nữa trong 12 giây. Không xóa danh sách IPTV.');
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
  const label=$('aiStorageTotal');if(label)label.textContent='Dung lượng AI đã tải: '+human(used);
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
