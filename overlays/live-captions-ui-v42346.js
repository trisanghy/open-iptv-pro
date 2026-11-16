'use strict';
// v4.23.46 - durable Live Caption + multilingual offline Live Translate UI.
// Checkbox intent stays selected after setup/network failures, with visible retry.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,ctx=window.IPTVState;
 const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),lang=$('liveTranslateTarget');
 const status=$('liveCaptionStatus'),out=$('liveCaptionOutput'),video=$('video');
 const setup=$('liveCaptionSetup'),setupPanel=$('liveCaptionSetupPanel');
 const chooseBinary=$('captionChooseBinary'),chooseModel=$('captionChooseModel'),retry=$('captionRetry');
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
 let lastError='',lastLang=lang.value;
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
 const outputWords=(txt,target,translated)=>{
  const text=String(txt||'').trim();if(!text)return;
  out.hidden=false;out.textContent=text;
  out.setAttribute('lang',translated?target:'auto');
  out.title=translated?'Phụ đề dịch: '+LANGUAGE_NAMES[target]:'Phụ đề nguyên ngữ';
  // Native Chromium text-track captions are best-effort; content is always
  // visible in the row-3 subtitle area even when PiP does not render tracks.
  try{
   if(typeof VTTCue==='undefined'||!Number.isFinite(video.currentTime))return;
   if(!track||lastLang!==target){
    if(track)track.mode='disabled';
    track=video.addTextTrack('captions','Open IPTV Pro · '+LANGUAGE_NAMES[target],translated?target:'en');
    track.mode='showing';oldCue=null;lastLang=target;
   }
   if(oldCue){track.removeCue(oldCue);oldCue=null;}
   const start=Math.max(0,video.currentTime);
   oldCue=new VTTCue(start,start+16,text);
   track.addCue(oldCue);
  }catch{}
 };
 const clearOutput=()=>{
  out.hidden=true;out.textContent='';
  if(track&&oldCue){try{track.removeCue(oldCue);}catch{}oldCue=null;}
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
  const wanted=signature();
  if(!force&&activeId&&wanted===activeSignature)return;
  busy=true;
  const seq=++epoch;
  try{
   if(activeId)await stopCurrent();
   message('Đang kiểm tra công cụ nhận diện…');
   await getWhisper();
   if(seq!==epoch||!(caption.checked||translate.checked))return;
   if(translate.checked)await getTranslationLanguage(lang.value);
   if(seq!==epoch||!(caption.checked||translate.checked))return;
   const res=await api.captionStart({
    url:selectedUrl(),translate:translate.checked,target:translate.checked?lang.value:'auto'
   });
   if(seq!==epoch||!(caption.checked||translate.checked)){
    await api.captionStop();
    return;
   }
   activeId=res?.id||0;activeUrl=url;activeSignature=signature();lastLang='';
   message(translate.checked?'Đang nghe → dịch '+LANGUAGE_NAMES[lang.value]:'Đang nghe để tạo phụ đề…');
  }catch(e){
   // Don't silently untick user's choices. Show reason with retry.
   activeId=0;activeSignature='';activeUrl='';
   message('Không bật được: '+String(e.message||e).slice(0,150),true);
  }finally{
   busy=false;
   if(queued){queued=false;void reconcile(true);}
  }
 }
 const changed=()=>{
  if(translate.checked)caption.checked=true;
  if(!caption.checked)translate.checked=false;
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
 setup?.addEventListener('click',async()=>{
  if(setupPanel){
   setupPanel.hidden=!setupPanel.hidden;
   setup.setAttribute('aria-expanded',String(!setupPanel.hidden));
  }
  try{const s=await api.captionStatus();message(s.available?'Whisper đã sẵn sàng':s.reason||'Chưa sẵn sàng',!s.available);}
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
  if(ev.type==='segment'){
   outputWords(ev.text,ev.language||lang.value,!!ev.translated);
   message(ev.translated?'Đang dịch → '+LANGUAGE_NAMES[ev.language||lang.value]:'Live Caption đang nhận diện');
  }
  if(ev.type==='status')message(ev.message||'Đang xử lý âm thanh…');
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
 const sourceWatcher=setInterval(()=>{
  const url=selectedUrl();
  if(url===lastSource)return;
  lastSource=url;
  if(caption.checked||translate.checked)void reconcile(true);
  else if(activeId)void stopCurrent();
 },1600);
 window.addEventListener('pagehide',()=>{
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
