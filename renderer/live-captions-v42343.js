'use strict';
// v4.23.46 - durable Live Caption + multilingual offline Live Translate UI.
// Checkbox intent stays selected after setup/network failures, with visible retry.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,ctx=window.IPTVState;
 const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),lang=$('liveTranslateTarget');
 const status=$('liveCaptionStatus'),out=$('liveCaptionOutput'),video=$('video');
 const setup=$('liveCaptionSetup'),setupPanel=$('liveCaptionSetupPanel');
 const chooseBinary=$('captionChooseBinary'),chooseModel=$('captionChooseModel'),retry=$('captionRetry'),testTranslate=$('captionTestTranslate');
 if(!caption||!translate||!lang||!status||!out||!video)return;
 const LANGUAGE_NAMES={en:'English',vi:'Tiếng Việt',fr:'Français',es:'Español',de:'Deutsch',
   zh:'中文',ja:'日本語',ko:'한국어',pt:'Português',it:'Italiano',ru:'Русский',
   id:'Indonesia',ar:'العربية',hi:'हिन्दी',th:'ไทย'};
 const selectPersistKey='openiptv:live-translate-target';
 try{
  const saved=localStorage.getItem(selectPersistKey);
  if(saved&&Object.hasOwn(LANGUAGE_NAMES,saved))lang.value=saved;
 }catch{}
 if(!lang.value||!Object.hasOwn(LANGUAGE_NAMES,lang.value))lang.value='vi';
 let activeId=0,activeUrl='',activeSignature='',busy=false,queued=false,epoch=0,track=null,oldCue=null;
 let lastError='',lastLang=lang.value,lastTranslationFailureAt=0,lastShownSequence=0;
 const message=(s,isError=false)=>{
  status.textContent=String(s||'').slice(0,200);
  status.title=status.textContent;
  status.dataset.error=isError?'true':'false';
  status.setAttribute('aria-label',status.textContent);
  lastError=isError?status.textContent:'';
  if(retry)retry.hidden=!isError;
 };
 const selectedUrl=()=>{
  const channel=ctx?.getCurrent?.();
  if(!channel)return '';
  const manuallySelected=$('manualStreamSelect')?.value;
  // Use the link the player actually selected before stale per-channel history.
  const url=String(manuallySelected||channel.lastPlayableUrl||channel.url||'');
  return /^https?:\/\//i.test(url)?url:'';
 };
 const videoCaptions=window.OpenIPTVVideoCaptions?.createVideoCaptionRenderer?.({video,doc:document});
 const ccPreferences=window.OpenIPTVSubtitlePreferences?.attach?.({doc:document,storage:localStorage,renderer:videoCaptions});
 videoCaptions?.setOriginalVisible?.(caption.checked);
 const mediaActive=()=>!video.paused&&!video.ended&&video.readyState>=2&&!!selectedUrl();
 const outputWords=(txt,target,translated,sourceText='')=>{
  const text=String(txt||'').trim();
  if(!text)return;
  out.hidden=true;out.textContent='';
  if(!videoCaptions){message('Không tải được bộ hiển thị phụ đề trên video',true);return;}
  try{videoCaptions.show(text,target,{translated,sourceText});}
  catch(e){message('Lỗi phụ đề trên video: '+String(e.message||e).slice(0,100),true);}
 };
 const clearOutput=()=>{
  out.hidden=true;out.textContent='';
  videoCaptions?.clear();
 };
 async function stopCurrent(){
  activeId=0;activeUrl='';activeSignature='';clearOutput();
  try{await api?.captionStop?.();}catch(e){message('Không dừng được tiến trình phụ đề: '+e.message,true);}
 }
 async function getWhisper(){
  if(!api?.captionStatus)throw Error('Bản web không có bộ nhận diện giọng nói desktop');
  let info=await api.captionStatus();
  if(info.available)return info;
  if(!api.captionAutoInstall)throw Error(info.reason||'Chưa cài Whisper; mở ⚙ để thiết lập');
  message('Đang tự cài Whisper: '+(info.reason||'tải mô hình…'));
  const installed=await api.captionAutoInstall();
  info=await api.captionStatus();
  if(!info.available||!installed?.installed)throw Error(info.reason||'Không khởi động được bộ nhận diện Whisper');
  return info;
 }
 async function getTranslationLanguage(target){
  if(target==='en')return;
  if(!api?.captionLanguageStatus||!api?.captionInstallLanguage)
   throw Error('Phiên bản này chưa hỗ trợ dịch phụ đề nhiều ngôn ngữ');
  const ready=await api.captionLanguageStatus(target);
  if(ready?.ready)return;
  message('Đang tự cài Argos English → '+LANGUAGE_NAMES[target]+' (chỉ tải lần đầu)…');
  await api.captionInstallLanguage(target);
  const checked=await api.captionLanguageStatus(target);
  if(!checked?.ready)throw Error(checked?.reason||'Không cài được mô hình dịch '+LANGUAGE_NAMES[target]);
 }
 const signature=()=>selectedUrl()+'|'+(translate.checked?'translate':'caption')+'|'+lang.value;
 async function reconcile(force=false){
  if(busy){queued=true;return;}
  const hasIntent=caption.checked||translate.checked;
  if(!hasIntent){
   ++epoch;
   await stopCurrent();
   message('Đã tắt phụ đề');
   return;
  }
  const url=selectedUrl();
  if(!url){
   message('Chưa có URL phát. Hãy chọn một kênh IPTV trước.',true);
   return;
  }
  if(!mediaActive()){
   ++epoch;
   if(activeId)await stopCurrent();
   else clearOutput();
   message('Video đã dừng · phụ đề tạm ngừng');
   return;
  }
  const wanted=signature();
  if(!force&&activeId&&wanted===activeSignature)return;
  busy=true;
  const seq=++epoch;
  try{
   if(activeId)await stopCurrent();
   message('Đang kiểm tra công cụ nhận diện…');
   await getWhisper();
   if(seq!==epoch||!mediaActive()||!(caption.checked||translate.checked))return;
   // Let Whisper detect source before choosing a direct source→target Argos model.
   if(seq!==epoch||!mediaActive()||!(caption.checked||translate.checked))return;
   const res=await api.captionStart({
    url:selectedUrl(),translate:translate.checked,target:translate.checked?lang.value:'auto',engine:window.AISettings?.getEngine?.()||'auto',resourceMode:window.AISettings?.getMode?.()||'balanced'
   });
   if(seq!==epoch||!mediaActive()||!(caption.checked||translate.checked)){
    await api.captionStop();
    return;
   }
   activeId=res?.id||0;activeUrl=url;activeSignature=signature();lastLang='';lastShownSequence=0;
   message(translate.checked?'Đang xác định ngôn ngữ → ưu tiên dịch trực tiếp '+LANGUAGE_NAMES[lang.value]:'Đang nghe để tạo phụ đề…');
  }catch(e){
   // Don't silently untick user's choices. Show reason with retry.
   activeId=0;activeSignature='';activeUrl='';
   message('Không bật được: '+String(e.message||e).slice(0,150),true);
  }finally{
   busy=false;
   if(queued){queued=false;void reconcile(true);}
  }
 }
 const changed=event=>{
  // When ALL THREE switches are on, turning off Live Caption is the
  // explicit master-off shortcut. Turn off TTS first to stop speech NOW,
  // then Translate to stop the recognition worker. Other combinations
  // remain independently controllable.
  const tts=$('liveTtsToggle');
  if(event?.target===caption&&!caption.checked&&translate.checked&&tts?.checked){
   videoCaptions?.setOriginalVisible?.(false);
   tts.checked=false;
   tts.dispatchEvent(new Event('change',{bubbles:true}));
   translate.checked=false;
   translate.dispatchEvent(new Event('change',{bubbles:true}));
   clearOutput();
   message('Đã tắt Live Caption, Live Translate và TTS');
   return;
  }
  // In every other state, toggling Caption only changes source visibility.
  if(event?.target===caption&&translate.checked){
   videoCaptions?.setOriginalVisible?.(caption.checked);
   message(caption.checked?'Phụ đề gốc bật · dịch vẫn hoạt động':'Đã ẩn phụ đề gốc · dịch vẫn hoạt động');
   return;
  }
  if(!caption.checked&&!translate.checked)clearOutput();
  void reconcile(true);
 };
 caption.addEventListener('change',changed);
 translate.addEventListener('change',changed);
 lang.addEventListener('change',()=>{
  if(!Object.hasOwn(LANGUAGE_NAMES,lang.value)){lang.value='vi';}
  try{localStorage.setItem(selectPersistKey,lang.value);}catch{}
  if(translate.checked)void reconcile(true);
  else message('Ngôn ngữ dịch: '+LANGUAGE_NAMES[lang.value]);
 });
 retry?.addEventListener('click',()=>void reconcile(true));
 testTranslate?.addEventListener('click',async()=>{
  if(!api?.captionTestTranslation){message('Ứng dụng chưa hỗ trợ kiểm tra dịch mẫu',true);return;}
  testTranslate.disabled=true;
  try{
   const target=lang.value;
   await getTranslationLanguage(target);
   const engine=window.AISettings?.getEngine?.()||'auto';
   const sample=api.aiTestTranslation?await api.aiTestTranslation(target,engine,window.AISettings?.getMode?.()||'balanced'):await api.captionTestTranslation(target);
   if(!sample?.translatedText)throw Error('Bộ dịch không tạo văn bản');
   message('Dịch thử thành công: '+sample.translatedText);
  }catch(e){message('Dịch thử thất bại: '+String(e.message||e),true);}
  finally{testTranslate.disabled=false;}
 });
 setup?.addEventListener('click',async()=>{
  if(setupPanel){
   setupPanel.hidden=!setupPanel.hidden;
   setup.setAttribute('aria-expanded',String(!setupPanel.hidden));
  }
  try{
   const s=await api.captionStatus();
   if(!s.available){message(s.reason||'Whisper chưa sẵn sàng',true);return;}
   if(!['auto','argos'].includes(window.AISettings?.getEngine?.()||'auto')){message('Đã chọn mô hình MLX · mở quản lý mô hình để kiểm tra/cài');return;}
   const t=await api?.captionLanguageStatus?.(lang.value);
   message(lang.value==='en'?'Whisper sẵn sàng · Dịch English trực tiếp':
     'Whisper sẵn sàng · Argos '+LANGUAGE_NAMES[lang.value]+': '+(t?.ready?'đã kiểm tra':'cần cài/kiểm tra'));
  }
  catch(e){message('Lỗi kiểm tra Whisper: '+e.message,true);}
 });
 async function choose(kind){
  if(!api?.captionChooseFile)return;
  try{
   const result=await api.captionChooseFile(kind);
   if(result?.canceled)return;
   const state=await api.captionStatus();
   message(state.available?'Whisper đã sẵn sàng':state.reason||'Chưa chọn đủ tệp',!state.available);
   if(caption.checked)void reconcile(true);
  }catch(e){message('Lỗi thiết lập: '+e.message,true);}
 }
 chooseBinary?.addEventListener('click',()=>void choose('binary'));
 chooseModel?.addEventListener('click',()=>void choose('model'));
 if(api?.captionOnEvent)api.captionOnEvent(ev=>{
  if(!ev)return;
  if(ev.type==='setup-progress'){message(ev.message||'Đang cài Whisper…');return;}
  if(ev.id!==activeId||!activeId)return;
  // A running FFmpeg/Whisper worker can finish an old 8s window after Pause.
  // Never resurrect captions while the actual video element isn't playing.
  if(!mediaActive()){clearOutput();return;}
  if(ev.type==='segment'){
   const order=Number(ev.sequence)||0;
   if(order&&order<lastShownSequence)return;
   if(translate.checked){
    const target=lang.value;
    // Whisper's raw/interim segments drive audio but are never shown to viewers.
    if(!ev.translated||ev.language!==target){
     if(order&&order>lastShownSequence){
      lastShownSequence=order;
      clearOutput();
     }
     return;
    }
    if(order)lastShownSequence=order;
    outputWords(ev.text,target,true,ev.sourceText||'');
    message('Đã dịch → '+(LANGUAGE_NAMES[target]||target));
    return;
   }
   if(order)lastShownSequence=order;
   outputWords(ev.text,ev.language||lang.value,false);
   message('Live Caption đang nhận diện');
  }
  if(ev.type==='status'&&Date.now()-lastTranslationFailureAt>20000)message(ev.message||'Đang xử lý âm thanh…');
  if(ev.type==='translation-error'){
   clearOutput();
   lastTranslationFailureAt=Date.now();
   message('Live Translate: '+String(ev.message||'mô hình dịch lỗi').slice(0,180),true);
  }
  if(ev.type==='error'){
   activeId=0;activeSignature='';
   message('Lỗi nhận diện: '+String(ev.message||'không rõ').slice(0,155),true);
   // Preserve user intent; allow retry. No infinite automatic restart.
  }
  if(ev.type==='stopped'&&ev.id===activeId){activeId=0;activeSignature='';}
 });
 if(api?.ttsOnEvent)api.ttsOnEvent(ev=>{
  if(ev?.type==='progress'&&busy&&translate.checked&&ev.target===lang.value)
   message(ev.message||'Đang cài gói dịch offline…');
 });
 let lastSource='';
 let stallTimer=null;
 const clearStall=()=>{if(stallTimer!==null){clearTimeout(stallTimer);stallTimer=null;}};
 const haltMedia=()=>{
  clearStall();++epoch;lastShownSequence=0;
  clearOutput();
  // The checkbox is a saved preference; pausing media must not uncheck it.
  void stopCurrent();
 };
 const resumeMedia=()=>{clearStall();if(mediaActive()&&(caption.checked||translate.checked))void reconcile(true);};
 for(const event of ['pause','ended','emptied','seeking'])
  video.addEventListener(event,haltMedia);
 for(const event of ['playing','seeked','canplay'])video.addEventListener(event,resumeMedia);
 for(const event of ['waiting','stalled'])video.addEventListener(event,()=>{
  clearStall();
  stallTimer=setTimeout(()=>{stallTimer=null;if(!video.paused&&!video.ended&&video.readyState<3)haltMedia();},1500);
 });
 const sourceWatcher=setInterval(()=>{
  const url=selectedUrl();
  if(url===lastSource)return;
  lastSource=url;
  if(caption.checked||translate.checked)void reconcile(true);
  else if(activeId)void stopCurrent();
 },1600);
 window.addEventListener('openiptv:ai-translate-settings-changed',()=>{if(translate.checked)void reconcile(true);});
 window.addEventListener('pagehide',()=>{
  clearStall();
  clearInterval(sourceWatcher);
  void stopCurrent();
 });
 document.addEventListener('openiptv:media-info',()=>{
  if(!ctx?.getCurrent?.()&&activeId)void stopCurrent();
 });
 if(!api?.captionStatus){
  caption.disabled=true;translate.disabled=true;
  message('Phụ đề AI yêu cầu bản desktop (Electron)',true);
 }else{
  api.captionStatus().then(s=>message(s.available?'Whisper sẵn sàng · chọn Live Caption/Translate':s.reason+' · bật để tự cài'))
   .catch(e=>message('Lỗi: '+e.message,true));
 }
})();
