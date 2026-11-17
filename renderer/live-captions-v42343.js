'use strict';
// v23.8: shared recognition, repaired Argos and selectable native MLX translate engines.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,ctx=window.IPTVState;
 const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),status=$('liveCaptionStatus');
 const box=$('liveCaptionOutput'),video=$('video'),target=$('liveTranslateTarget');
 const setup=$('liveCaptionSetup'),panel=$('liveCaptionSetupPanel');
 const pickWhisper=$('captionChooseBinary'),pickModel=$('captionChooseModel');
 const installTranslation=$('captionTranslationInstall'),retry=$('captionRetry');
 const testTranslate=$('captionTestTranslate');
 if(!api?.captionStart||!caption||!translate||!status||!box||!video||!target)return;
 let activeId=0,currentURL='',busy=false,queued=false,lastTranslate=false,lastTarget='',lastDetected='';
 let installingPair='',failedPair='',lifecycle=0;
 const mediaActive=()=>!video.paused&&!video.ended&&!!video.currentSrc;
 const preference='rustlab:live-translate-target';
 try{const saved=localStorage.getItem(preference);if([...target.options].some(o=>o.value===saved))target.value=saved;}catch{}
 const setStatus=(s,error=false)=>{
  status.textContent=String(s||'').slice(0,200);status.title=status.textContent;
  status.dataset.error=error?'true':'false';
  if(retry)retry.hidden=!error;
 };
 const preferredURL=()=>{
  const c=ctx?.getCurrent?.(),manual=$('manualLinkSelect');
  const link=manual?.value&&/^https?:\/\//i.test(manual.value)?manual.value:
   (c&&String(c.lastPlayableUrl||c.url||'')||'');
  return /^https?:\/\//i.test(link)?link:'';
 };
 function hideWords(){
  document.dispatchEvent(new CustomEvent('rustlab:caption-clear'));
  box.hidden=true;box.textContent='';
  // The shared CC controller clears its own native video text track via the
  // rustlab:caption-clear event above. Never create a competing track here.
 }
 function showWords(value,translated,language){
  const cleaned=String(value||'').trim();if(!cleaned)return;
  box.hidden=!!translate.checked;
  const label=[...target.options].find(o=>o.value===language)?.textContent||language||'';
  box.textContent=(translated?'Dịch '+label+': ':'Phụ đề: ')+cleaned;
  // Native fullscreen/PiP cues are rendered by the unified CC controller;
  // it knows original/translated/bilingual settings and handles transitions.
 }
 async function stop(){
  activeId=0;currentURL='';hideWords();
  try{await api.captionStop();}catch(e){setStatus('Không dừng được Whisper: '+String(e.message||e),true);}
 }
 async function refreshState(){
  try{
   const data=await api.captionStatus();
   if(data?.available){setStatus('Whisper sẵn sàng · '+(data.modelName||'offline'));return true;}
   setStatus((data?.reason||'Chưa có Whisper')+' · bật phụ đề để tự cài hoặc nhấn ⚙');
   return false;
  }catch(e){setStatus('Lỗi trạng thái Whisper: '+String(e.message||e),true);return false;}
 }
 async function reconcile(force=false){
  if(busy){queued=true;return;}
  const want=caption.checked||translate.checked;
  const ticket=lifecycle;
  const url=preferredURL(),lang=translate.checked?target.value:'auto';
  if(!want){if(activeId||currentURL)await stop();else hideWords();setStatus('Đã tắt phụ đề');return;}
  if(!mediaActive()){if(activeId||currentURL)await stop();else hideWords();setStatus('Video đã tạm dừng · phụ đề ngắt');return;}
  if(!url){setStatus('Chưa có URL phát, chọn kênh có tiếng trước',true);return;}
  if(!force&&activeId&&currentURL===url&&lastTranslate===translate.checked&&lastTarget===lang)return;
  busy=true;
  try{
   if(activeId||currentURL)await stop();
   let ready=await api.captionStatus();
   if(ticket!==lifecycle||!mediaActive())return;
   if(!ready?.available){
    if(!api.captionAutoInstall)throw Error(ready?.reason||'Thiếu Whisper local');
    setStatus('Đang tự cài Whisper offline (chỉ tải lần đầu)…');
    const installed=await api.captionAutoInstall();
    ready=await api.captionStatus();
    if(ticket!==lifecycle||!mediaActive())return;
    if(!installed?.installed||!ready?.available)throw Error(ready?.reason||'Cài Whisper chưa hoàn chỉnh');
   }
   if(!(caption.checked||translate.checked)||ticket!==lifecycle||!mediaActive())return;
   const actual=preferredURL(),selected=translate.checked?target.value:'auto';
   if(!actual){setStatus('Kênh hiện tại không có URL âm thanh',true);return;}
   const result=await api.captionStart({url:actual,translate:translate.checked,target:selected,
    engine:window.AISettings?.getEngine?.()||'auto',
    resourceMode:window.AISettings?.getMode?.()||'balanced'});
   if(!(caption.checked||translate.checked)||ticket!==lifecycle||!mediaActive()){await api.captionStop();return;}
   activeId=result.id;currentURL=actual;lastTranslate=translate.checked;lastTarget=selected;
   setStatus(translate.checked?'Đang nhận diện ngôn ngữ → dịch '+(target.selectedOptions?.[0]?.textContent||selected)+'…':'Đang nghe để tạo phụ đề…');
  }catch(e){
   activeId=0;currentURL='';
   if(ticket!==lifecycle||!mediaActive())return;
   // Do not silently clear checkboxes; error and explicit retry match Electron behavior.
   setStatus('Không bật được: '+String(e.message||e).slice(0,150),true);
  }finally{
   busy=false;
   if(queued){queued=false;void reconcile(true);}
  }
 }
 const halt=()=>{
  lifecycle++;activeId=0;currentURL='';lastDetected='';queued=false;hideWords();
  void api.captionStop().catch(error=>console.warn('Pause: Whisper cancellation',error));
  setStatus('Video tạm dừng · nhận diện và dịch đã ngắt');
 };
 let stallTimer=null;
 const clearStall=()=>{if(stallTimer){clearTimeout(stallTimer);stallTimer=null;}};
 const scheduleStall=()=>{
  clearStall();
  // Short HLS buffering spikes should not restart Whisper. Cancel only when
  // no future frames have arrived for 1400ms.
  stallTimer=setTimeout(()=>{
   stallTimer=null;
   if(!video.paused&&!video.ended&&video.readyState<3)halt();
  },1400);
 };
 for(const event of ['pause','ended','emptied','seeking'])
  video.addEventListener(event,()=>{clearStall();halt();});
 for(const event of ['waiting','stalled'])video.addEventListener(event,scheduleStall);
 video.addEventListener('playing',()=>{clearStall();if(caption.checked||translate.checked)void reconcile(true);});
 video.addEventListener('seeked',()=>{if(mediaActive()&&(caption.checked||translate.checked))void reconcile(true);});
 // Three-mode group: enabling TTS from OFF enables the whole pipeline;
 // disabling its leading Caption switch shuts down Caption/Translate/TTS together.
 // The visible Caption preference remains independent when only Translate changes.
 const tts=$('liveTtsToggle');
 const changed=event=>{
  if(event?.target===caption&&!caption.checked){
   const wasTranslated=translate.checked,wasSpeaking=!!tts?.checked;
   // Set all values before sending events so observers/localStorage see the
   // final consistent OFF state and TTS audio is stopped immediately.
   translate.checked=false;
   if(tts)tts.checked=false;
   if(wasSpeaking)tts.dispatchEvent(new Event('change',{bubbles:true}));
   if(wasTranslated)translate.dispatchEvent(new Event('change',{bubbles:true}));
   document.dispatchEvent(new CustomEvent('rustlab:caption-visibility-changed',{detail:{enabled:false}}));
   if(!wasTranslated)void reconcile(true);
   return;
  }
  // When Translate is already running, showing original captions is a visual
  // change only: don't restart the Whisper stream.
  if(event?.target===caption&&translate.checked){
   document.dispatchEvent(new CustomEvent('rustlab:caption-visibility-changed',{detail:{enabled:caption.checked}}));
   return;
  }
  // Turning off Translate also turns off voice-over, but retains Caption.
  if(event?.target===translate&&!translate.checked&&tts?.checked){
   tts.checked=false;
   tts.dispatchEvent(new Event('change',{bubbles:true}));
  }
  void reconcile(true);
 };
 caption.addEventListener('change',changed);translate.addEventListener('change',changed);
 tts?.addEventListener('change',()=>{
  if(!tts.checked)return;
  // One-click TTS ON: enable the full recognition → translation → speech chain.
  const needsCaption=!caption.checked,needsTranslate=!translate.checked;
  caption.checked=true;translate.checked=true;
  if(needsCaption)caption.dispatchEvent(new Event('change',{bubbles:true}));
  if(needsTranslate)translate.dispatchEvent(new Event('change',{bubbles:true}));
 });
 target.addEventListener('change',()=>{
  try{localStorage.setItem(preference,target.value);}catch{}
  failedPair='';lastDetected='';
  if(translate.checked)void reconcile(true);
  else setStatus('Ngôn ngữ đích: '+(target.selectedOptions?.[0]?.textContent||target.value));
 });
 retry?.addEventListener('click',()=>{failedPair='';void reconcile(true);});
 setup?.addEventListener('click',async()=>{
  panel.hidden=!panel.hidden;setup.setAttribute('aria-expanded',String(!panel.hidden));
  if(!panel.hidden)await refreshState();
 });
 async function choose(kind){
  try{
   const result=await api.captionChooseFile(kind);
   if(result?.canceled)return;
   await refreshState();if(caption.checked)void reconcile(true);
  }catch(e){setStatus('Thiết lập Whisper lỗi: '+String(e.message||e),true);}
 }
 pickWhisper?.addEventListener('click',()=>void choose('binary'));
 pickModel?.addEventListener('click',()=>void choose('model'));
 installTranslation?.addEventListener('click',async()=>{
  const to=target.value,from=lastDetected&&lastDetected!==to?lastDetected:(to==='en'?'vi':'en');
  if(lastDetected===to){setStatus('Cùng ngôn ngữ, không cần bộ dịch');return;}
  installTranslation.disabled=true;
  try{
   setStatus('Đang cài Argos '+from+' → '+to+' (tải một lần)…');
   const result=await api.captionTranslationInstall(to,from);
   if(!result?.ready)throw Error('Không cài được cặp ngôn ngữ');
   failedPair='';setStatus('Sẵn sàng '+from+' → '+to+' ('+(result.route||'offline')+')');
   if(translate.checked)void reconcile(true);
  }catch(e){setStatus('Cài dịch lỗi: '+String(e.message||e).slice(0,150),true);}
  finally{installTranslation.disabled=false;}
 });
 testTranslate?.addEventListener('click',async()=>{
  if(!api.captionTestTranslation)return setStatus('Chưa có chức năng kiểm tra',true);
  testTranslate.disabled=true;
  try{
   const engine=window.AISettings?.getEngine?.()||'auto';
   setStatus('Đang chạy bản dịch thử với '+engine+' offline…');
   const result=await api.captionTestTranslation(target.value,engine,
    window.AISettings?.getMode?.()||'balanced');
   if(!result?.translatedText)throw Error('Không có văn bản đầu ra');
   setStatus('Dịch mẫu thành công ('+result.sourceLanguage+' → '+target.value+'): '+result.translatedText);
  }catch(e){setStatus('Dịch mẫu lỗi: '+String(e.message||e).slice(0,140),true);}
  finally{testTranslate.disabled=false;}
 });
 if(api.captionOnEvent)api.captionOnEvent(e=>{
  if(!e||!activeId||e.id!==activeId||!mediaActive())return;
  if(e.type==='segment'){
   lastDetected=String(e.sourceLanguage||'');
   status.dataset.sourceLanguage=lastDetected;
   if(e.route==='mlx-error'){
    hideWords();setStatus('MLX chưa dịch được · mở ⚙ và tải/sửa mô hình đã chọn',true);return;
   }
   showWords(e.text,e.translated,e.language);
   document.dispatchEvent(new CustomEvent('rustlab:caption-segment',{detail:{text:e.text,originalText:e.originalText,translated:e.translated,language:e.language,sourceLanguage:e.sourceLanguage}}));
   setStatus(e.route==='same'&&translate.checked?'Đang nói tiếng '+lastDetected+' · không cần dịch':
    e.translated?'Live Translate · '+lastDetected+' → '+(e.target||target.value)+' ('+(e.route||'offline')+')':
    'Live Caption · '+lastDetected);
  }
  if(e.type==='needs-model'){
   const engine=window.AISettings?.getEngine?.()||'auto';
   if(engine!=='auto'&&engine!=='argos'){
    setStatus('Mô hình MLX đã chọn chưa hoạt động; mở ⚙ để cài/sửa',true);return;
   }
   const from=String(e.sourceLanguage||'').toLowerCase(),to=String(e.target||target.value).toLowerCase();
   if(!from||!to||from===to)return;
   lastDetected=from;status.dataset.sourceLanguage=from;
   const key=from+'→'+to;
   if(installingPair===key||failedPair===key)return;
   const auto=$('autoInstallTranslation');
   if(auto&&!auto.checked){setStatus('Cần mô hình '+key+' · mở ⚙ để cài',true);return;}
   installingPair=key;setStatus('Đang cài Argos '+key+' theo ngôn ngữ gốc thực tế…');
   Promise.resolve(api.captionTranslationInstall(to,from)).then(result=>{
    if(!result?.ready)throw Error('Bộ dịch chưa sẵn sàng');
    installingPair='';failedPair='';
    if(translate.checked&&target.value===to)void reconcile(true);
   }).catch(err=>{
    installingPair='';failedPair=key;
    setStatus('Cài bộ dịch '+key+' lỗi: '+String(err.message||err).slice(0,110),true);
   });
  }
  if(e.type==='status')setStatus(e.message||'');
  if(e.type==='error'){activeId=0;setStatus(e.message||'Lỗi nhận diện',true);}
  if(e.type==='stopped'&&e.id===activeId)activeId=0;
 });
 let observed='';
 setInterval(()=>{
  const url=preferredURL();
  if(url!==observed){observed=url;if(mediaActive()&&(caption.checked||translate.checked))void reconcile(true);else if(activeId)void stop();}
 },1400);
 window.addEventListener('rustlab:ai-settings-changed',()=>{if(translate.checked)void reconcile(true);});
 window.addEventListener('pagehide',()=>{clearStall();halt();});
 document.addEventListener('openiptv:media-info',()=>{if(!ctx?.getCurrent?.()&&activeId)void stop();});
 void refreshState();
})();