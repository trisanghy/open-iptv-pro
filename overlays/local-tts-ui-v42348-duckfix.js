'use strict';
// v4.23.44 - offline Whisper-English -> Argos target -> Piper speech; optional source duck.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,video=$('video'),toggle=$('liveTtsToggle');
 const target=$('liveTtsLanguage'),voice=$('liveTtsVoice'),duck=$('liveTtsDuck'),install=$('liveTtsInstall'),info=$('liveTtsStatus');
 const captions=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),output=$('liveCaptionOutput');
 if(!toggle||!target||!voice||!duck||!install||!info||!api?.ttsStatus||!video)return;
 let enabled=false,playing=null,taskId=0,busy=false,queued='',sourceId='',ducked=false,baseVolume=0.8,validSession=0;
 const recentSpeech=new Map(),DEDUP_MS=45000;
 function normalizeSpeech(value){
  return String(value||'').normalize('NFKC').toLocaleLowerCase()
   .replace(/[\p{P}\p{S}]/gu,' ').replace(/\s+/g,' ').trim();
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
 volumeInput?.addEventListener('input',()=>{baseVolume=sliderBase();if(enabled)applyDuck();});
 duck.addEventListener('change',()=>{if(enabled)applyDuck();});
 video.addEventListener('volumechange',()=>{if(enabled)applyDuck();});
 video.addEventListener('playing',()=>{if(enabled)applyDuck();});
 video.addEventListener('loadedmetadata',()=>{if(enabled)applyDuck();});
 function resetPlayback(){
  taskId++;queued='';busy=false;
  const audio=playing;playing=null;
  if(audio){try{audio.pause();audio.src='';audio.load();}catch{}}
  // Preserve source attenuation while TTS remains enabled, even between segments.
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
  if(!acceptSpeech(text))return;
  if(busy||playing){queued=text;return;}
  void speak(text);
 });
 document.addEventListener('openiptv:media-info',updateSession);
 video.addEventListener('emptied',()=>{if(enabled)resetPlayback();});
 video.addEventListener('pause',()=>{if(enabled)resetPlayback();});
 window.addEventListener('pagehide',()=>{enabled=false;resetPlayback();restore();});
 setInterval(()=>{updateSession();if(enabled)applyDuck();},1800);
 void refresh();
})();
