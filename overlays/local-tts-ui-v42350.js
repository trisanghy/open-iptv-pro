'use strict';
// v4.23.44 - offline Whisper-English -> Argos target -> Piper speech; optional source duck.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,video=$('video'),toggle=$('liveTtsToggle');
 const target=$('liveTtsLanguage'),voice=$('liveTtsVoice'),duck=$('liveTtsDuck'),install=$('liveTtsInstall'),info=$('liveTtsStatus');
 const captions=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),output=$('liveCaptionOutput');
 if(!toggle||!target||!voice||!duck||!install||!info||!api?.ttsStatus||!video)return;
 let enabled=false,playing=null,taskId=0,busy=false,queued='',sourceId='',ducked=false,baseVolume=0.8,validSession=0,lastApplied=null;
 const recentLines=new Map();

 const VIENEU_PRESETS=[
 'Trúc Ly','Thiện Minh','Mai Anh','Hải Đăng','Thùy Dung','Thiền Tâm Đức',
 'Ngọc Huyền','Quang Sơn','Ngọc Trân','Minh Đức','Phạm Tuyên',
 'Xuân Vĩnh','Thanh Bình','Ngọc Linh','Đoan Trang','Quỳnh Anh',
 'Quốc Tuấn','Adam','Thái Sơn','Thục Đoan','Minh Triết',
 'Mỹ Duyên','Đức Trí','Kim Thanh'
 ];
 const VOICES=Object.freeze({
  vi:[['vi_VN-25hours_single-low','25Hours · nhẹ'],['vi_VN-vais1000-medium','VAIS1000 · chất lượng vừa'],['vi_VN-vivos-x_low','VIVOS · siêu nhẹ']].concat(VIENEU_PRESETS.map(name=>['vieneu:'+name,'VieNeu · '+name+' (48 kHz)'])),
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
  const groups=[];
  const standard=document.createElement('optgroup');standard.label='Piper · tiết kiệm tài nguyên';
  const premium=document.createElement('optgroup');premium.label='VieNeu · chất lượng cao 48 kHz';
  for(const [id,title] of options){
   const opt=document.createElement('option');opt.value=id;opt.textContent=title;
   (id.startsWith('vieneu:')?premium:standard).append(opt);
  }
  if(standard.children.length)groups.push(standard);
  if(premium.children.length)groups.push(premium);
  voice.replaceChildren(...groups);
  if(options.some(([id])=>id===preferred))voice.value=preferred;
 }
 setVoiceChoices();
 voice.addEventListener('change',()=>{
  try{localStorage.setItem('openiptv-tts-voice-'+target.value,voice.value);}catch{}
  resetPlayback();void refresh();
 });

 const status=s=>{const message=String(s||'');info.textContent=message.slice(0,200);info.title=message;info.dataset.error=/lỗi|error|fail|không|thiếu/i.test(message)?'true':'false';};
 const volumeInput=$('volume');
 const source=()=>String(window.IPTVState?.getCurrent?.()?.lastPlayableUrl||window.IPTVState?.getCurrent?.()?.url||video.currentSrc||'');
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0.8));
 const scale=()=>Math.max(0,Math.min(100,Number(duck.value)||0))/100;
 function setPlayerVolume(value){
  const next=clamp(value);lastApplied=next;
  if(Math.abs(video.volume-next)>0.001)video.volume=next;
 }
 function applyDuck(){
  if(!enabled)return;
  if(!ducked){baseVolume=clamp(video.volume);ducked=true;}
  setPlayerVolume(baseVolume*scale());
 }
 function restore(){
  if(!ducked)return;
  const original=baseVolume;ducked=false;lastApplied=null;
  try{video.volume=clamp(original);}catch{}
 }
 // Keep attenuation active for the ENTIRE enabled TTS session, not just during playback.
 video.addEventListener('volumechange',()=>{
  if(!enabled||!ducked)return;
  const value=clamp(video.volume);
  if(lastApplied!==null&&Math.abs(value-lastApplied)<0.001)return;
  // An external player, Cast or volume slider changed video.volume;
  // treat that as the new original loudness, then immediately reapply reduction.
  baseVolume=value;applyDuck();
 });
 volumeInput?.addEventListener('input',()=>{
  if(!enabled)return;
  const num=Number(volumeInput.value);
  if(Number.isFinite(num)){baseVolume=clamp(num/100);ducked=true;applyDuck();}
 });
 duck.addEventListener('change',()=>{if(enabled)applyDuck();});
 function normalized(text){return String(text||'').toLocaleLowerCase()
   .normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim().slice(0,350);}
 function rememberOnce(text){
  const key=normalized(text),now=Date.now();
  if(!key)return false;
  const earlier=recentLines.get(key);
  if(earlier!==undefined&&now-earlier<60000)return false;
  recentLines.set(key,now);
  for(const [k,t] of recentLines)if(now-t>60000)recentLines.delete(k);
  if(recentLines.size>250)recentLines.delete(recentLines.keys().next().value);
  return true;
 }
 function resetPlayback(){
  taskId++;queued='';busy=false;
  const audio=playing;playing=null;
  if(audio){try{audio.pause();audio.src='';audio.load();}catch{}}
  if(enabled)applyDuck();
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
 async function speak(payload){
  if(!enabled||busy||playing||!payload?.text)return;
  busy=true;const generation=taskId,lang=target.value,src=source();
  try{
   const result=await api.ttsSynthesize({target:lang,voice:voice.value,
     text:payload.text.slice(0,360),sourceLanguage:payload.sourceLanguage,
     alreadyTranslated:payload.alreadyTranslated===true});
   if(!enabled||generation!==taskId||source()!==src)return;
   if(!result?.audioBase64||result.mime!=='audio/wav')throw Error('Không nhận được WAV từ Piper');
   const url='data:audio/wav;base64,'+result.audioBase64;
   const audio=new Audio(url);playing=audio;
   audio.volume=1;
   audio.addEventListener('ended',()=>{if(playing!==audio)return;playing=null;applyDuck();
    status('Đã đọc xong ('+lang+')');if(queued){const pending=queued;queued='';void speak(pending);}}, {once:true});
   audio.addEventListener('error',()=>{if(playing!==audio)return;playing=null;restore();status('Lỗi phát âm thanh TTS');},{once:true});
   // Reduce only the IPTV source, never the separately generated speech.
   applyDuck();
   await audio.play();
   if(output&&result.translatedText&&lang!=='en'){
    output.hidden=false;
    output.textContent='Dịch '+lang+': '+result.translatedText.slice(0,320);
   }
   status('Đang đọc '+lang+' · Tiếng gốc '+duck.value+'%');
  }catch(e){
   if(enabled)applyDuck();if(playing){try{playing.pause();}catch{}playing=null;}
   if(enabled&&generation===taskId)status('TTS: '+String(e.message||e).slice(0,130));
  }finally{busy=false;}
 }
 function updateSession(){
  const id=source();
  if(id!==sourceId){sourceId=id;validSession++;recentLines.clear();resetPlayback();}
 }
 toggle.addEventListener('change',async()=>{
  enabled=toggle.checked;
  if(!enabled){resetPlayback();restore();status('Đã tắt TTS');return;}
  applyDuck();
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
 const preview=$('liveTtsPreview');
 preview?.addEventListener('click',async()=>{
  if(preview.disabled)return;
  preview.disabled=true;
  status('Đang tạo một câu nghe thử giọng '+voice.value+'…');
  try{
   const ready=await api.ttsStatus(target.value,voice.value);
   if(!ready?.ready)throw Error(ready?.reason||'Giọng chưa được cài');
   const phrase=target.value==='vi'?'Xin chào, đây là giọng đọc tiếng Việt của Open IPTV Pro.':
     target.value==='en'?'Hello. This is your Open IPTV Pro voice test.':'Hello';
   const res=await api.ttsSynthesize({target:target.value,voice:voice.value,
     text:phrase,alreadyTranslated:true});
   if(!res?.audioBase64||res.mime!=='audio/wav')throw Error('Chưa tạo được file WAV nghe thử');
   const audio=new Audio('data:audio/wav;base64,'+res.audioBase64);
   await audio.play();
   status('Đang nghe thử giọng '+voice.value+' (offline)');
  }catch(e){status('Nghe thử lỗi: '+String(e.message||e));}
  finally{preview.disabled=false;}
 });
 if(api.ttsOnEvent)api.ttsOnEvent(e=>{
  if(!e)return;
  if(e.type==='progress'){if(e.target===target.value)status(e.message||'Đang cài…');return;}
  if(e.type==='status'&&enabled)status(e.message||'TTS đang xử lý…');
 });
 if(api.captionOnEvent)api.captionOnEvent(e=>{
  if(!enabled||!translate?.checked||!e||e.type!=='segment'||!e.translated||!e.text)return;
  updateSession();
  const sameLanguage=e.language===target.value;
  const englishIntermediate=String(e.englishText||'').trim();
  // Voice engine must know the ACTUAL language of the text it is speaking.
  const sourceLanguage=sameLanguage?target.value:(englishIntermediate?'en':e.language);
  const text=String(sameLanguage?e.text:(englishIntermediate||e.text)).trim();
  if(!text)return;
  const payload={text,sourceLanguage,alreadyTranslated:!!sameLanguage};
  if(!rememberOnce(e.utteranceKey||text))return;
  if(busy||playing){queued=payload;return;}
  void speak(payload);
 });
 document.addEventListener('openiptv:media-info',updateSession);
 video.addEventListener('emptied',()=>{if(enabled)resetPlayback();});
 video.addEventListener('pause',()=>{if(enabled)resetPlayback();});
 window.addEventListener('pagehide',()=>{enabled=false;resetPlayback();restore();});
 setInterval(()=>{updateSession();if(enabled)applyDuck();},700);
 void refresh();
})();
