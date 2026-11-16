'use strict';
// v4.23.44 - offline Whisper-English -> Argos target -> Piper speech; optional source duck.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,video=$('video'),toggle=$('liveTtsToggle');
 const target=$('liveTtsLanguage'),voice=$('liveTtsVoice'),duck=$('liveTtsDuck'),install=$('liveTtsInstall'),info=$('liveTtsStatus');
 const captions=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),output=$('liveCaptionOutput');
 if(!toggle||!target||!voice||!duck||!install||!info||!api?.ttsStatus||!video)return;
 let enabled=false,playing=null,taskId=0,busy=false,queued='',sourceId='',ducked=false,baseVolume=0.8,validSession=0;

 const VOICES=Object.freeze({
  vi:[['vi_VN-25hours_single-low','25Hours · nhẹ'],['vi_VN-vais1000-medium','VAIS1000 · chất lượng vừa'],['vi_VN-vivos-x_low','VIVOS · siêu nhẹ']],
  en:[['en_US-lessac-low','Lessac · nhẹ'],['en_US-amy-medium','Amy · chất lượng vừa']],
  es:[['es_ES-mls_10246-low','MLS 10246']],fr:[['fr_FR-siwis-low','Siwis']],
  de:[['de_DE-thorsten-low','Thorsten']],zh:[['zh_CN-huayan-x_low','Huayan']],
  pt:[['pt_BR-edresson-low','Edresson']],it:[['it_IT-riccardo-x_low','Riccardo']],
  ru:[['ru_RU-irina-medium','Irina']],id:[['id_ID-news_tts-medium','News TTS']]
 });
 function setVoiceChoices(){
  const options=VOICES[target.value]||[];
  const key='openiptv-tts-voice-'+target.value;
  let preferred='';try{preferred=localStorage.getItem(key)||'';}catch{}
  voice.replaceChildren(...options.map(([id,title])=>{
   const opt=document.createElement('option');opt.value=id;opt.textContent=title;return opt;
  }));
  if(options.some(([id])=>id===preferred))voice.value=preferred;
 }
 setVoiceChoices();
 voice.addEventListener('change',()=>{
  try{localStorage.setItem('openiptv-tts-voice-'+target.value,voice.value);}catch{}
  resetPlayback();void refresh();
 });

 const status=s=>{info.textContent=String(s||'').slice(0,170);info.title=info.textContent;};
 const volumeInput=$('volume');
 const source=()=>String(window.IPTVState?.getCurrent?.()?.lastPlayableUrl||window.IPTVState?.getCurrent?.()?.url||video.currentSrc||'');
 function restore(){
  if(!ducked)return;
  ducked=false;
  try{video.volume=Math.max(0,Math.min(1,baseVolume));}catch{}
 }
 function attenuate(){
  if(ducked)return;
  baseVolume=Number.isFinite(video.volume)?video.volume:((Number(volumeInput?.value)||80)/100);
  const percent=Math.max(0,Math.min(100,Number(duck.value)||0));
  if(percent>=100)return;
  ducked=true;
  try{video.volume=baseVolume*percent/100;}catch{ducked=false;}
 }
 volumeInput?.addEventListener('input',()=>{
  if(!ducked)return;
  baseVolume=(Number(volumeInput.value)||0)/100;
  try{video.volume=baseVolume*Math.max(0,Math.min(100,Number(duck.value)||0))/100;}catch{}
 });
 duck.addEventListener('change',()=>{
  if(ducked){
   const percent=Math.max(0,Math.min(100,Number(duck.value)||0));
   try{video.volume=baseVolume*percent/100;}catch{}
  }
 });
 function resetPlayback(){
  taskId++;queued='';busy=false;
  const audio=playing;playing=null;
  if(audio){try{audio.pause();audio.src='';audio.load();}catch{}}
  restore();
  try{void api.ttsStop?.();}catch{}
 }
 async function refresh(){
  try{
   const d=await api.ttsStatus(target.value,voice.value);
   install.disabled=!!d.installing;install.textContent=d.installing?'Đang cài…':d.ready?'Đã cài ✓':'Cài mô hình tự động';
   status(d.ready?'Giọng '+target.value+' sẵn sàng (offline)':d.reason||'Nhấn Cài mô hình tự động');
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
   const result=await api.ttsSynthesize({target:lang,voice:voice.value,text:text.slice(0,360)});
   if(!enabled||generation!==taskId||source()!==src)return;
   if(!result?.audioBase64||result.mime!=='audio/wav')throw Error('Không nhận được WAV từ Piper');
   const url='data:audio/wav;base64,'+result.audioBase64;
   const audio=new Audio(url);playing=audio;
   audio.volume=1;
   audio.addEventListener('ended',()=>{if(playing!==audio)return;playing=null;restore();
    status('Đã đọc xong ('+lang+')');if(queued){const pending=queued;queued='';void speak(pending);}}, {once:true});
   audio.addEventListener('error',()=>{if(playing!==audio)return;playing=null;restore();status('Lỗi phát âm thanh TTS');},{once:true});
   // Reduce only the IPTV source, never the separately generated speech.
   attenuate();
   await audio.play();
   if(output&&result.translatedText&&lang!=='en'){
    output.hidden=false;
    output.textContent='Dịch '+lang+': '+result.translatedText.slice(0,320);
   }
   status('Đang đọc '+lang+' · Tiếng gốc '+duck.value+'%');
  }catch(e){
   restore();if(playing){try{playing.pause();}catch{}playing=null;}
   if(enabled&&generation===taskId)status('TTS: '+String(e.message||e).slice(0,130));
  }finally{busy=false;}
 }
 function updateSession(){
  const id=source();
  if(id!==sourceId){sourceId=id;validSession++;resetPlayback();}
 }
 toggle.addEventListener('change',async()=>{
  enabled=toggle.checked;
  if(!enabled){resetPlayback();status('Đã tắt TTS');return;}
  updateSession();
  ensureTranslate();
  if(!await refresh())status('Nhấn “Cài mô hình tự động” để sử dụng giọng '+target.value);
 });
 target.addEventListener('change',()=>{
  resetPlayback();setVoiceChoices();if(enabled)ensureTranslate();void refresh();
 });
 install.addEventListener('click',async()=>{
  if(install.disabled)return;
  install.disabled=true;install.textContent='Đang cài…';
  status('Đang tải công cụ và mô hình giọng '+target.value+' (cần internet một lần)…');
  try{
   const result=await api.ttsInstall(target.value,voice.value);
   if(!result.installed)throw Error('Bộ mô hình chưa cài hoàn chỉnh');
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
  const text=String(e.englishText||e.text).trim();
  if(!text)return;
  if(busy||playing){queued=text;return;}
  void speak(text);
 });
 document.addEventListener('openiptv:media-info',updateSession);
 video.addEventListener('emptied',()=>{if(enabled)resetPlayback();});
 video.addEventListener('pause',()=>{if(enabled)resetPlayback();});
 window.addEventListener('pagehide',resetPlayback);
 setInterval(updateSession,1800);
 void refresh();
})();
