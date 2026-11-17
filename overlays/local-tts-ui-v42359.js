'use strict';
// v4.23.44 - offline Whisper-English -> Argos target -> Piper speech; optional source duck.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,video=$('video'),toggle=$('liveTtsToggle');
 const target=$('liveTtsLanguage'),voice=$('liveTtsVoice'),speed=$('liveTtsSpeed'),duck=$('liveTtsDuck'),install=$('liveTtsInstall'),info=$('liveTtsStatus');
 const captions=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),output=$('liveCaptionOutput');
 if(!toggle||!target||!voice||!speed||!duck||!install||!info||!api?.ttsStatus||!video)return;
 let enabled=false,playing=null,previewAudio=null,sourceId='',ducked=false,baseVolume=0.8,validSession=0,lastApplied=null,lastCaptionSeq=0;
 const recentLines=new Map();
 // Playback speed belongs to generated TTS audio only, never the IPTV video.
 // Preserve pitch so voices stay natural at faster/slower playback.
 const ALLOWED_SPEEDS=new Set(['0.60','0.75','0.85','1.00','1.10','1.25','1.50','1.75','2.00']);
 const SPEED_STORAGE_KEY='openiptv-tts-playback-speed';
 let savedSpeed='1.00';
 try{savedSpeed=localStorage.getItem(SPEED_STORAGE_KEY)||'1.00';}catch{}
 speed.value=ALLOWED_SPEEDS.has(savedSpeed)?savedSpeed:'1.00';
 const playbackSpeed=()=>ALLOWED_SPEEDS.has(speed.value)?Number(speed.value):1;
 function applySpeechRate(audio){
  if(!audio)return;
  const rate=playbackSpeed();
  audio.defaultPlaybackRate=rate;
  audio.playbackRate=rate;
  if('preservesPitch' in audio)audio.preservesPitch=true;
  if('webkitPreservesPitch' in audio)audio.webkitPreservesPitch=true;
 }
 speed.addEventListener('change',()=>{
  if(!ALLOWED_SPEEDS.has(speed.value))speed.value='1.00';
  try{localStorage.setItem(SPEED_STORAGE_KEY,speed.value);}catch{}
  applySpeechRate(playing);
  applySpeechRate(previewAudio);
  status('Tốc độ đọc '+speed.value.replace(/0$/,'')+'×');
 });

 const VIENEU_PRESETS=[
 'Adam bựa','Trúc Ly','Thiện Minh','Mai Anh','Hải Đăng','Thùy Dung','Thiền Tâm Đức',
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
  speechQueue.reset();
  if(enabled)applyDuck();
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
 // New text never interrupts a sentence that the user is already hearing.
 // Only the most recent NOT-YET-PLAYED subtitle is kept, to avoid old backlogs.
 const speechQueue=window.OpenIPTVSpeechQueue.createSpeechQueue({
  maxPendingAgeMs:18000,
  maxSynthAgeMs:25000,
  notify:message=>{if(enabled)status(message);},
  synthesize:async payload=>{
   if(!enabled||source()!==payload.streamUrl)throw Error('Đã đổi nguồn phát');
   return api.ttsSynthesize({
    target:payload.lang,voice:payload.voiceId,
    text:payload.text.slice(0,360),
    sourceLanguage:payload.sourceLanguage,
    alreadyTranslated:payload.alreadyTranslated===true
   });
  },
  play:async(result,payload,onEnded)=>{
   if(!enabled||source()!==payload.streamUrl)return onEnded();
   if(!result?.audioBase64||result.mime!=='audio/wav')
    throw Error('Không nhận được tệp WAV hợp lệ từ bộ đọc');
   const audio=new Audio('data:audio/wav;base64,'+result.audioBase64);
   playing=audio;
   audio.volume=1;applySpeechRate(audio);
   let completed=false;
   const complete=()=>{
    if(completed)return;completed=true;
    if(playing===audio)playing=null;
    applyDuck();
    onEnded();
   };
   audio.addEventListener('ended',()=>{
    // Audio ends naturally, even if 3 new subtitles have arrived meanwhile.
    if(playing===audio)status('Đã đọc hết câu · tiếp tục câu phụ đề mới nhất');
    complete();
   },{once:true});
   audio.addEventListener('error',()=>{
    if(playing===audio)status('Lỗi phát giọng đọc');
    complete();
   },{once:true});
   applyDuck();
   try{
    await audio.play();
    if(playing===audio){
     status('Đang đọc trọn câu '+payload.lang+' · '+playbackSpeed()+'× · Tiếng gốc '+duck.value+'%');
    }
   }catch(error){complete();throw error;}
  },
  cancelAudio:()=>{
   const audio=playing;playing=null;
   if(audio){try{audio.pause();audio.removeAttribute('src');audio.load();}catch{}}
  },
  cancelSynthesis:()=>{try{void api.ttsStop?.();}catch{}}
 });
 function updateSession(){
  const id=source();
  if(id!==sourceId){sourceId=id;validSession++;lastCaptionSeq=0;recentLines.clear();resetPlayback();}
 }
 toggle.addEventListener('change',async()=>{
  enabled=toggle.checked;
  speechQueue.setEnabled(enabled);
  if(!enabled){restore();status('Đã tắt TTS');return;}
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
  resetPlayback(); // User explicitly requested preview: cancel ordinary speech.
  try{
   const ready=await api.ttsStatus(target.value,voice.value);
   if(!ready?.ready)throw Error(ready?.reason||'Giọng chưa được cài');
   const phrase=target.value==='vi'?'Xin chào, đây là giọng đọc tiếng Việt của Open IPTV Pro.':
     target.value==='en'?'Hello. This is your Open IPTV Pro voice test.':'Hello';
   const res=await api.ttsSynthesize({target:target.value,voice:voice.value,
     text:phrase,alreadyTranslated:true});
   if(!res?.audioBase64||res.mime!=='audio/wav')throw Error('Chưa tạo được file WAV nghe thử');
   if(previewAudio){try{previewAudio.pause();previewAudio.src='';}catch{}}
   const audio=new Audio('data:audio/wav;base64,'+res.audioBase64);
   previewAudio=audio;
   applySpeechRate(audio);
   audio.addEventListener('ended',()=>{if(previewAudio===audio)previewAudio=null;},{once:true});
   await audio.play();
   status('Đang nghe thử '+voice.value+' · '+playbackSpeed()+'× (offline)');
  }catch(e){status('Nghe thử lỗi: '+String(e.message||e));}
  finally{preview.disabled=false;}
 });
 if(api.ttsOnEvent)api.ttsOnEvent(e=>{
  if(!e)return;
  if(e.type==='progress'){if(e.target===target.value)status(e.message||'Đang cài…');return;}
  if(e.type==='status'&&enabled)status(e.message||'TTS đang xử lý…');
 });
 if(api.captionOnEvent)api.captionOnEvent(e=>{
  if(!enabled||!translate?.checked||!e||e.type!=='segment'||!e.text)return;
  updateSession();
  const number=Number(e.sequence)||0;
  if(number&&number<lastCaptionSeq)return;
  if(number)lastCaptionSeq=Math.max(number,lastCaptionSeq);
  // Raw/interim recognition stays internal and NEVER cancels audible TTS.
  if(!e.translated)return;
  const sameLanguage=e.language===target.value;
  const englishIntermediate=String(e.englishText||'').trim();
  const sourceLanguage=sameLanguage?target.value:(englishIntermediate?'en':e.language);
  const text=String(sameLanguage?e.text:(englishIntermediate||e.text)).trim();
  if(!text||!rememberOnce(e.utteranceKey||text))return;
  const payload={text,sourceLanguage,alreadyTranslated:!!sameLanguage,
   sequence:number,lang:target.value,voiceId:voice.value,streamUrl:source()};
  const wasBusy=speechQueue.status();
  speechQueue.enqueue(payload);
  if(wasBusy.playing)status('Đang đọc hết câu hiện tại · đã cập nhật câu chờ');
  else if(wasBusy.busy)status('Đang tổng hợp giọng · ưu tiên phụ đề mới nhất');
 });
 document.addEventListener('openiptv:media-info',updateSession);
 video.addEventListener('emptied',()=>{if(enabled)resetPlayback();});
 video.addEventListener('pause',()=>{if(enabled)resetPlayback();});
 window.addEventListener('pagehide',()=>{enabled=false;resetPlayback();restore();if(previewAudio){try{previewAudio.pause();}catch{}previewAudio=null;}});
 setInterval(()=>{updateSession();if(enabled)applyDuck();},700);
 void refresh();
})();
