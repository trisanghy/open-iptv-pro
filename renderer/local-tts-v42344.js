'use strict';
// v4.23.44 - offline Whisper-English -> Argos target -> Piper speech; optional source duck.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,video=$('video'),toggle=$('liveTtsToggle');
 const target=$('liveTtsLanguage'),duck=$('liveTtsDuck'),install=$('liveTtsInstall'),info=$('liveTtsStatus');
 const voice=$('liveTtsVoice'),preview=$('liveTtsVoicePreview');
 const captions=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),output=$('liveCaptionOutput');
 if(!toggle||!target||!duck||!install||!info||!api?.ttsStatus||!video)return;
 let enabled=false,playing=null,previewAudio=null,taskId=0,busy=false,queued='',sourceId='',ducked=false,baseVolume=0.8,validSession=0;
 const recentSpeech=new Map(),DEDUP_MS=45000;
 function normalizeSpeech(value){
  return String(value||'').normalize('NFKC').toLocaleLowerCase()
   .replace(/[\\p{P}\\p{S}]/gu,' ').replace(/\\s+/g,' ').trim();
 }
 function acceptSpeech(value){
  const key=normalizeSpeech(value);if(!key)return false;
  const now=Date.now();
  for(const [old,t] of recentSpeech){if(now-t>DEDUP_MS)recentSpeech.delete(old);}
  for(const [old,t] of recentSpeech){
   if(old===key||(now-t<18000&&Math.min(old.length,key.length)>=18&&
      (old.includes(key)||key.includes(old))))return false;
  }
  recentSpeech.set(key,now);
  if(recentSpeech.size>80)recentSpeech.delete(recentSpeech.keys().next().value);
  return true;
 }
 const selectedVoice=()=>target.value==='vi'?(voice?.value||'piper:25hours'):'piper:default';
 const updateVoiceVisibility=()=>{if(voice)voice.hidden=target.value!=='vi';if(preview)preview.hidden=target.value!=='vi';};
 const status=s=>{info.textContent=String(s||'').slice(0,170);info.title=info.textContent;};
 const volumeInput=$('volume');
 const source=()=>String(window.IPTVState?.getCurrent?.()?.lastPlayableUrl||window.IPTVState?.getCurrent?.()?.url||video.currentSrc||'');
 const clamp=x=>Math.min(1,Math.max(0,x));
 const duckRatio=()=>Math.min(100,Math.max(0,Number(duck.value)||0))/100;
 function sliderBase(){
  const n=Number(volumeInput?.value);
  return volumeInput&&Number.isFinite(n)?clamp(n/100):clamp(video.volume);
 }
 function applyDuck(){
  if(!enabled)return;
  if(!ducked){baseVolume=sliderBase();ducked=true;}
  const wanted=clamp(baseVolume*duckRatio());
  if(Math.abs(video.volume-wanted)>0.003)video.volume=wanted;
 }
 function restore(){
  if(!ducked)return;
  ducked=false;
  baseVolume=sliderBase();
  if(Math.abs(video.volume-baseVolume)>0.003)video.volume=baseVolume;
 }
 volumeInput?.addEventListener('input',()=>{
  baseVolume=sliderBase();
  if(enabled)applyDuck();
 });
 duck.addEventListener('change',()=>{if(enabled)applyDuck();});
 // Playback itself may reset volume during channel switches and media loading.
 // Re-apply the selected ratio without changing the saved, user-selected master volume.
 video.addEventListener('volumechange',()=>{if(enabled)applyDuck();});
 video.addEventListener('playing',()=>{if(enabled)applyDuck();});
 video.addEventListener('loadedmetadata',()=>{if(enabled)applyDuck();});
 function resetPlayback(){
  taskId++;queued='';busy=false;
  const audio=playing;playing=null;
  if(audio){try{audio.pause();audio.src='';audio.load();}catch{}}
  if(previewAudio){try{previewAudio.pause();previewAudio.src='';previewAudio.load();}catch{}previewAudio=null;}
  // Keeping TTS enabled means source attenuation remains active between phrases.
  try{void api.ttsStop?.();}catch{}
 }
 async function refresh(){
  try{
   updateVoiceVisibility();
   const d=target.value==='vi'&&api.ttsVoiceStatus
    ? await api.ttsVoiceStatus(selectedVoice()) : await api.ttsStatus(target.value);
   install.disabled=!!d.installing;install.textContent=d.installing?'Đang cài…':d.ready?'Đã cài ✓':'Cài mô hình tự động';
   if(preview)preview.disabled=!!d.installing;
   const selectedLabel=target.value==='vi'?(voice?.selectedOptions?.[0]?.textContent||'Tiếng Việt'):target.value;
   status(d.ready?'Giọng '+selectedLabel+' sẵn sàng (offline)':d.reason||'Nhấn Cài mô hình tự động');
   return d.ready===true;
  }catch(e){status('Lỗi kiểm tra TTS: '+e.message);return false;}
 }
 function ensureTranslate(){
  if(captions&&!captions.checked){captions.checked=true;captions.dispatchEvent(new Event('change',{bubbles:true}));}
  if(translate&&!translate.checked){translate.checked=true;translate.dispatchEvent(new Event('change',{bubbles:true}));}
 }
 async function speak(text){
  if(!enabled||busy||playing||!text)return;
  busy=true;const generation=taskId,lang=target.value,src=source();
  try{
   const result=await api.ttsSynthesize({target:lang,voice:selectedVoice(),text:text.slice(0,360)});
   if(!enabled||generation!==taskId||source()!==src)return;
   if(!result?.audioBase64||result.mime!=='audio/wav')throw Error('Không nhận được WAV từ Piper');
   const url='data:audio/wav;base64,'+result.audioBase64;
   const audio=new Audio(url);playing=audio;
   audio.volume=1;
   audio.addEventListener('ended',()=>{if(playing!==audio)return;playing=null;
    status('Đã đọc xong ('+lang+')');if(queued){const pending=queued;queued='';void speak(pending);}}, {once:true});
   audio.addEventListener('error',()=>{if(playing!==audio)return;playing=null;status('Lỗi phát âm thanh TTS');},{once:true});
   // Reduce only the IPTV source, never the separately generated speech.
   applyDuck();
   await audio.play();
   if(output&&result.translatedText&&lang!=='en'){
    output.hidden=false;
    output.textContent='Dịch '+lang+': '+result.translatedText.slice(0,320);
   }
   status('Đang đọc '+lang+' · Tiếng gốc '+duck.value+'%');
  }catch(e){
   if(playing){try{playing.pause();}catch{}playing=null;}
   if(enabled&&generation===taskId)status('TTS: '+String(e.message||e).slice(0,130));
  }finally{busy=false;}
 }
 function updateSession(){
  const id=source();
  if(id!==sourceId){sourceId=id;validSession++;recentSpeech.clear();resetPlayback();if(enabled)applyDuck();}
 }
 toggle.addEventListener('change',async()=>{
  enabled=toggle.checked;
  if(!enabled){resetPlayback();recentSpeech.clear();restore();status('Đã tắt TTS');return;}
  recentSpeech.clear();
  updateSession();applyDuck();
  ensureTranslate();
  if(!await refresh())status('Nhấn “Cài mô hình tự động” để sử dụng giọng '+target.value);
 });
 target.addEventListener('change',()=>{
  resetPlayback();updateVoiceVisibility();if(enabled)ensureTranslate();void refresh();
 });
 voice?.addEventListener('change',()=>{resetPlayback();void refresh();});
 preview?.addEventListener('click',async()=>{
  if(target.value!=='vi'||!api.ttsSynthesize)return;
  resetPlayback();
  preview.disabled=true;
  try{
   const ready=await refresh();
   if(!ready){status('Chọn Cài mô hình tự động để tải giọng trước');return;}
   status('Đang tạo đoạn nghe thử giọng '+(voice.selectedOptions?.[0]?.textContent||'')+'…');
   const sample='Xin chào bạn! Đây là giọng đọc tiếng Việt được tạo trực tiếp trên máy.';
   const data=await api.ttsSynthesize({target:'vi',voice:selectedVoice(),text:sample,sourceLanguage:'vi'});
   if(!data?.audioBase64||data.mime!=='audio/wav')throw Error('Không có âm thanh nghe thử');
   const audio=new Audio('data:audio/wav;base64,'+data.audioBase64);
   previewAudio=audio;
   audio.addEventListener('ended',()=>{if(previewAudio===audio)previewAudio=null;},{once:true});
   await audio.play();
   status('Đang nghe thử '+(voice.selectedOptions?.[0]?.textContent||'giọng Việt'));
  }catch(e){status('Nghe thử lỗi: '+String(e.message||e).slice(0,125));}
  finally{preview.disabled=false;}
 });
 install.addEventListener('click',async()=>{
  if(install.disabled)return;
  install.disabled=true;install.textContent='Đang cài…';
  status('Đang tải công cụ và mô hình giọng '+target.value+' (cần internet một lần)…');
  try{
   const result=target.value==='vi'&&api.ttsVoiceInstall
    ? await api.ttsVoiceInstall(selectedVoice()) : await api.ttsInstall(target.value);
   if(!(result.installed||result.ready))throw Error('Bộ mô hình chưa cài hoàn chỉnh');
   status('Đã cài xong · Có thể dùng khi mất mạng');
  }catch(e){status('Cài TTS lỗi: '+String(e.message||e).slice(0,125));}
  finally{install.disabled=false;await refresh();}
 });
 if(api.ttsOnEvent)api.ttsOnEvent(e=>{
  if(!e)return;
  if(e.type==='progress'){if(e.target===target.value)status(e.message||'Đang cài…');return;}
  if(e.type==='status'&&enabled)status(e.message||'TTS đang xử lý…');
 });
 if(api.captionOnEvent)api.captionOnEvent(e=>{
  if(!enabled||!translate?.checked||!e||e.type!=='segment'||!e.translated||!e.text)return;
  updateSession();
  // Whisper reports intermediate English even when displayed captions use a different target.
  const text=String(e.originalText||e.text).trim();
  if(!text)return;
  if(!acceptSpeech(text))return;
  if(busy||playing){queued=text;return;}
  void speak(text);
 });
 document.addEventListener('openiptv:media-info',updateSession);
 video.addEventListener('emptied',()=>{if(enabled)resetPlayback();});
 video.addEventListener('pause',()=>{if(enabled)resetPlayback();});
 window.addEventListener('pagehide',()=>{enabled=false;resetPlayback();restore();});
 setInterval(()=>{updateSession();if(enabled)applyDuck();},1800);
 updateVoiceVisibility();void refresh();
})();