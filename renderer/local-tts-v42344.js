'use strict';
// v4.23.44 - offline Whisper-English -> Argos target -> Piper speech; optional source duck.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,video=$('video'),toggle=$('liveTtsToggle');
 const target=$('liveTtsLanguage'),voice=$('liveTtsVoice'),speed=$('liveTtsSpeed'),duck=$('liveTtsDuck'),install=$('liveTtsInstall'),info=$('liveTtsStatus');
 const captions=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),output=$('liveCaptionOutput');
 if(!toggle||!target||!voice||!speed||!duck||!install||!info||!api?.ttsStatus||!video)return;
 let enabled=false,playing=null,previewAudio=null,sourceId='',ducked=false,baseVolume=0.8,validSession=0,lastApplied=null,lastCaptionSeq=0,cancelSpeechAudio=null;
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
 const EXTRA_VI_VOICES=[
  ['vietvoice:female:northern','VietVoice · Nữ miền Bắc (ONNX)'],
  ['vietvoice:female:central','VietVoice · Nữ miền Trung (ONNX)'],
  ['vietvoice:female:southern','VietVoice · Nữ miền Nam (ONNX)'],
  ['vietvoice:male:northern','VietVoice · Nam miền Bắc (ONNX)'],
  ['vietvoice:male:central','VietVoice · Nam miền Trung (ONNX)'],
  ['vietvoice:male:southern','VietVoice · Nam miền Nam (ONNX)'],
  ['f5vi:clone','F5-TTS · Giọng mẫu riêng (phi thương mại)']
 ];
 const referenceBox=$('liveTtsReferenceConfig'),referenceText=$('liveTtsReferenceText'),
  referenceConsent=$('liveTtsReferenceConsent'),referenceChoose=$('liveTtsChooseReference'),
  referenceStatus=$('liveTtsReferenceStatus');
 function referenceUI(){if(referenceBox)referenceBox.hidden=voice.value!=='f5vi:clone';}
 referenceChoose?.addEventListener('click',async()=>{
  if(!referenceConsent?.checked){
   if(referenceStatus)referenceStatus.textContent='Vui lòng xác nhận có quyền sử dụng giọng mẫu.';
   return;
  }
  const transcript=String(referenceText?.value||'').trim();
  if(transcript.length<5){
   if(referenceStatus)referenceStatus.textContent='Hãy nhập lời thoại mẫu trước khi chọn file WAV.';
   return;
  }
  referenceChoose.disabled=true;
  try{
   const result=await api.ttsChooseReference(transcript,true);
   if(result?.canceled)return;
   if(referenceStatus)referenceStatus.textContent='Đã lưu mẫu giọng '+result.name+' ('+result.duration+' giây) trên máy.';
   await refresh();
  }catch(e){
   if(referenceStatus)referenceStatus.textContent=String(e.message||e);
  }finally{referenceChoose.disabled=false;}
 });
 const VOICES=Object.freeze({
  vi:[['vi_VN-25hours_single-low','25Hours · nhẹ'],['vi_VN-vais1000-medium','VAIS1000 · chất lượng vừa'],['vi_VN-vivos-x_low','VIVOS · siêu nhẹ']].concat(VIENEU_PRESETS.map(name=>['vieneu:'+name,'VieNeu · '+name+' (48 kHz)']),EXTRA_VI_VOICES),
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
  const vietvoice=document.createElement('optgroup');vietvoice.label='VietVoice · Bắc / Trung / Nam';
  const f5=document.createElement('optgroup');f5.label='F5-TTS Vietnamese · cần giọng mẫu';
  for(const [id,title] of options){
   const opt=document.createElement('option');opt.value=id;opt.textContent=title;
   (id.startsWith('vieneu:')?premium:
    id.startsWith('vietvoice:')?vietvoice:
    id.startsWith('f5vi:')?f5:standard).append(opt);
  }
  if(standard.children.length)groups.push(standard);
  if(premium.children.length)groups.push(premium);
  if(vietvoice.children.length)groups.push(vietvoice);
  if(f5.children.length)groups.push(f5);
  voice.replaceChildren(...groups);
  if(options.some(([id])=>id===preferred))voice.value=preferred;
  referenceUI();
 }
 setVoiceChoices();
 voice.addEventListener('change',()=>{
  try{localStorage.setItem('openiptv-tts-voice-'+target.value,voice.value);}catch{}
  resetForModelChange();referenceUI();void refresh();
 });

 const status=s=>{const message=String(s||'');info.textContent=message.slice(0,200);info.title=message;info.dataset.error=/lỗi|error|fail|không|thiếu/i.test(message)?'true':'false';};
 const volumeInput=$('volume');
 const source=()=>String(window.IPTVState?.getCurrent?.()?.lastPlayableUrl||window.IPTVState?.getCurrent?.()?.url||video.currentSrc||'');
 const mediaActive=()=>!video.paused&&!video.ended&&video.readyState>=2;
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
 function resetPlayback({stopSynthesis=true}={}){validSession++;speechQueue.reset({stopSynthesis});if(enabled&&mediaActive())applyDuck();}
 function resetForModelChange(){
  const previewBusy=previewCoordinator?.isActive()||false;
  if(previewBusy)void previewCoordinator.cancel();
  resetPlayback({stopSynthesis:!previewBusy});
  recentLines.clear();lastCaptionSeq=0;
 }
 async function refresh(){
  try{
   const d=await api.ttsStatus(target.value,voice.value);
   const installed=!!(d.installed||d.install?.installed||d.ready);
   install.disabled=!!d.install?.installing;
   install.textContent=d.install?.installing?'Đang cài…':installed?'Đã cài ✓':'Cài mô hình tự động';
   if(voice.value==='f5vi:clone'&&referenceStatus){
    referenceStatus.textContent=d.referenceReady?'Giọng mẫu '+d.referenceName+' đã sẵn sàng.':
     'Cần chọn mẫu WAV có quyền sử dụng và nhập lời thoại chính xác.';
   }
   status(d.ready?'Giọng '+voice.value+' sẵn sàng (offline)':d.reason||'Nhấn Cài mô hình tự động');
   return d.ready===true;
  }catch(e){status('Lỗi kiểm tra TTS: '+e.message);return false;}
 }
 function ensureTranslate(){
  // Preserve user's independent original Caption visibility choice.
  if(translate&&!translate.checked){translate.checked=true;translate.dispatchEvent(new Event('change',{bubbles:true}));}
 }
 // New text never interrupts a sentence that the user is already hearing.
 // Only the most recent NOT-YET-PLAYED subtitle is kept, to avoid old backlogs.
 const speechQueue=window.OpenIPTVSpeechQueue.createSpeechQueue({
  maxPendingAgeMs:18000,
  maxSynthAgeMs:25000,
  notify:message=>{if(enabled)status(message);},
  synthesize:async payload=>{
   if(!enabled||source()!==payload.streamUrl||!mediaActive())throw Error('Video không còn phát');
   const chunks=window.OpenIPTVTTSChunks?.split?.(payload.text,{first:58,rest:105,max:360})||[payload.text.slice(0,360)];
   if(!chunks.length)throw Error('Câu phụ đề trống');
   // Live Translate has ALREADY produced target-language text. Do not run a
   // second expensive Argos / MLX translation inside the voice worker.
   const result=await api.ttsSynthesize({
    target:payload.lang,voice:payload.voiceId,text:chunks[0],
    sourceLanguage:payload.sourceLanguage,alreadyTranslated:payload.alreadyTranslated===true
   });
   return {...result,followUpChunks:chunks.slice(1)};
  },
  play:async(result,payload,onEnded)=>{
   if(!enabled||source()!==payload.streamUrl||!mediaActive())return onEnded();
   if(!result?.audioBase64||result.mime!=='audio/wav')
    throw Error('Không nhận được tệp WAV hợp lệ từ bộ đọc');
   const generation=validSession;
   const chunks=Array.isArray(result.followUpChunks)?result.followUpChunks:[];
   let completed=false;
   const complete=()=>{
    if(completed)return;completed=true;
    if(generation===validSession){applyDuck();onEnded();}
   };
   const playChunk=wav=>new Promise((resolve,reject)=>{
    if(!wav?.audioBase64||wav.mime!=='audio/wav')return reject(Error('WAV không hợp lệ'));
    if(generation!==validSession||!mediaActive())return resolve(false);
    const audio=new Audio('data:audio/wav;base64,'+wav.audioBase64);
    playing=audio;audio.volume=1;applySpeechRate(audio);
    let finished=false;
    const finish=(error)=>{
     if(finished)return;finished=true;
     if(playing===audio)playing=null;
     if(cancelSpeechAudio===cancel)cancelSpeechAudio=null;
     try{audio.pause();audio.removeAttribute('src');audio.load();}catch{}
     error?reject(error):resolve(true);
    };
    const cancel=()=>finish();
    cancelSpeechAudio=cancel;
    audio.addEventListener('ended',()=>finish(),{once:true});
    audio.addEventListener('error',()=>finish(Error('Không thể phát giọng TTS')),{once:true});
    applyDuck();
    Promise.resolve(audio.play()).then(()=>{
     if(generation===validSession&&playing===audio)
      status('Đang đọc phụ đề '+payload.lang+' · '+playbackSpeed()+'× · Tiếng gốc '+duck.value+'%');
    }).catch(finish);
   });
   try{
    let wav=result,prefetch=null;
    for(let i=0;i<=chunks.length;i++){
     if(generation!==validSession||!enabled||source()!==payload.streamUrl||!mediaActive())break;
     // Start the next synthesized WAV while the current chunk plays.
     if(i<chunks.length&&!speechQueue.status().pending){
      const text=chunks[i];
      prefetch=Promise.resolve().then(()=>api.ttsSynthesize({
       target:payload.lang,voice:payload.voiceId,text,
       sourceLanguage:payload.sourceLanguage,alreadyTranslated:payload.alreadyTranslated===true
      })).then(value=>({ok:true,value}),error=>({ok:false,error}));
     }
     await playChunk(wav);
     // If translation is ahead, finish this audible phrase and speak the NEW
     // subtitle rather than reading an old multi-chunk backlog.
     if(i===chunks.length||speechQueue.status().pending)break;
     if(!prefetch)break;
     const next=await prefetch;
     if(!next.ok)throw next.error;
     wav=next.value;prefetch=null;
    }
   }finally{complete();}
  },
  cancelAudio:()=>{
   const cancel=cancelSpeechAudio;cancelSpeechAudio=null;
   if(cancel)try{cancel();}catch{}
   const audio=playing;playing=null;
   if(audio){try{audio.pause();audio.removeAttribute('src');audio.load();}catch{}}
  },
  cancelSynthesis:()=>api.ttsStop?.()
 });
 function updateSession(){
  const id=source();
  if(id!==sourceId){sourceId=id;validSession++;lastCaptionSeq=0;recentLines.clear();resetPlayback();}
 }
 toggle.addEventListener('change',async()=>{
  if(!toggle.checked)void previewCoordinator.cancel();
  enabled=toggle.checked;
  speechQueue.setEnabled(enabled);
  if(!enabled){restore();status('Đã tắt TTS');return;}
  speechQueue.setPaused(!mediaActive());
  if(mediaActive())applyDuck();
  else status('Video đang dừng · TTS chờ phát lại');
  updateSession();
  ensureTranslate();
  if(!await refresh())status('Nhấn “Cài mô hình tự động” để sử dụng giọng '+target.value);
 });
 target.addEventListener('change',()=>{
  resetForModelChange();setVoiceChoices();if(enabled)ensureTranslate();void refresh();
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
 const previewCoordinator=window.OpenIPTVPreviewCoordinator.createPreviewCoordinator({
  queue:speechQueue,stopSynthesis:()=>api.ttsStop?.(),timeoutMs:90000,
  onState:state=>{
   if(preview)preview.disabled=state!=='idle';
   if(state==='synthesizing')status('Đang tổng hợp câu nghe thử (đổi mô hình sẽ hủy)…');
   if(state==='playing')status('Đang nghe thử '+voice.value+' · '+playbackSpeed()+'×');
  },
  onError:error=>status('Nghe thử lỗi: '+String(error?.message||error).slice(0,160)),
  synthesize:async ({language,voiceId})=>{
   const ready=await api.ttsStatus(language,voiceId);
   if(!ready?.ready)throw Error(ready?.reason||'Giọng chưa được cài');
   const phrase=language==='vi'?'Xin chào, đây là giọng đọc tiếng Việt của Open IPTV Pro.':
    language==='en'?'Hello. This is your Open IPTV Pro voice test.':'Hello';
   const res=await api.ttsSynthesize({target:language,voice:voiceId,text:phrase,alreadyTranslated:true});
   if(!res?.audioBase64||res.mime!=='audio/wav')throw Error('Chưa tạo được file WAV nghe thử');
   return res;
  },
  play:(result,registerStop)=>new Promise((resolve,reject)=>{
   if(previewAudio){try{previewAudio.pause();previewAudio.removeAttribute('src');previewAudio.load();}catch{}}
   const audio=new Audio('data:audio/wav;base64,'+result.audioBase64);
   previewAudio=audio;applySpeechRate(audio);
   let done=false;
   const finish=error=>{
    if(done)return;done=true;
    if(previewAudio===audio)previewAudio=null;
    try{audio.pause();audio.removeAttribute('src');audio.load();}catch{}
    error?reject(error):resolve();
   };
   registerStop(()=>finish());
   audio.addEventListener('ended',()=>finish(),{once:true});
   audio.addEventListener('error',()=>finish(Error('Không thể phát WAV nghe thử')),{once:true});
   Promise.resolve(audio.play()).catch(finish);
  })
 });
 preview?.addEventListener('click',()=>{
  if(previewCoordinator.isActive())return;
  // Wait for backend stop before starting sample; incoming subtitles remain queued.
  resetPlayback({stopSynthesis:false});
  void previewCoordinator.run({language:target.value,voiceId:voice.value});
 });
 window.addEventListener('openiptv:ai-translate-settings-changed',()=>{
  resetForModelChange();
  if(enabled)status('Đã đổi mô hình dịch · chờ phụ đề mới để đọc');
 });
 if(api.ttsOnEvent)api.ttsOnEvent(e=>{
  if(!e)return;
  if(e.type==='progress'){if(e.target===target.value)status(e.message||'Đang cài…');return;}
  if(e.type==='status'&&enabled&&!previewCoordinator.isActive())status(e.message||'TTS đang xử lý…');
 });
 if(api.captionOnEvent)api.captionOnEvent(e=>{
  if(!enabled||!translate?.checked||!mediaActive()||!e||e.type!=='segment'||!e.text)return;
  updateSession();
  const number=Number(e.sequence)||0;
  if(number&&number<lastCaptionSeq)return;
  if(number)lastCaptionSeq=Math.max(number,lastCaptionSeq);
  // Raw/interim recognition stays internal and NEVER cancels audible TTS.
  if(!e.translated)return;
  // If spoken and subtitle languages match, the UI text is ALREADY translated:
  // synthesize it directly without another Argos/MLX pass. If they differ,
  // translate once into the requested voice language (prefer English pivot
  // when the backend already provided one).
  const sameLanguage=e.language===target.value;
  const englishIntermediate=String(e.englishText||'').trim();
  const sourceLanguage=sameLanguage?target.value:(englishIntermediate?'en':e.language);
  const text=String(sameLanguage?e.text:(englishIntermediate||e.text)).trim();
  if(!text||!rememberOnce(e.utteranceKey||text))return;
  const payload={text,sourceLanguage,alreadyTranslated:sourceLanguage===target.value,
   sequence:number,lang:target.value,voiceId:voice.value,streamUrl:source()};
  const wasBusy=speechQueue.status();
  speechQueue.enqueue(payload);
  if(wasBusy.playing)status('Đang đọc hết câu hiện tại · đã cập nhật câu chờ');
  else if(wasBusy.busy)status('Đang tổng hợp giọng · ưu tiên phụ đề mới nhất');
 });
 document.addEventListener('openiptv:media-info',updateSession);
 const haltSpeech=()=>{
  if(!enabled)return;
  resetPlayback();speechQueue.setPaused(true);restore();
  void previewCoordinator.cancel();
  status('Video đã dừng · TTS và phụ đề tạm ngừng');
 };
 let stallTimer=null;
 const clearStall=()=>{if(stallTimer!==null){clearTimeout(stallTimer);stallTimer=null;}};
 for(const event of ['pause','ended','emptied','seeking'])
  video.addEventListener(event,()=>{clearStall();haltSpeech();});
 for(const event of ['playing','seeked'])video.addEventListener(event,()=>{
  clearStall();
  if(enabled&&mediaActive()){speechQueue.setPaused(false);applyDuck();}
 });
 for(const event of ['waiting','stalled'])video.addEventListener(event,()=>{
  clearStall();
  stallTimer=setTimeout(()=>{
   stallTimer=null;
   if(!video.paused&&!video.ended&&video.readyState<3)haltSpeech();
  },1500);
 });
 translate?.addEventListener('change',()=>{
  // If users disable translation, TTS no longer has its prerequisite.
  // Do not re-enable Translate or the separate original Caption switch.
  if(!translate.checked&&toggle.checked){
   toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}));
  }
 });
 window.addEventListener('pagehide',()=>{
  clearStall();enabled=false;void previewCoordinator.cancel();resetPlayback();restore();
  if(previewAudio){try{previewAudio.pause();}catch{}previewAudio=null;}
 });
 setInterval(()=>{updateSession();if(enabled&&mediaActive())applyDuck();},700);
 void refresh();
})();
