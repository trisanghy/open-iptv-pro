'use strict';
// v4.23.44 - offline Whisper-English -> Argos target -> Piper speech; optional source duck.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf,video=$('video'),toggle=$('liveTtsToggle');
 const target=$('liveTtsLanguage'),duck=$('liveTtsDuck'),install=$('liveTtsInstall'),info=$('liveTtsStatus');
 const voice=$('liveTtsVoice'),preview=$('liveTtsVoicePreview'),speed=$('liveTtsSpeed');
 const captions=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),output=$('liveCaptionOutput');
 if(!toggle||!target||!duck||!install||!info||!api?.ttsStatus||!video)return;
 let enabled=false,playing=null,previewAudio=null,taskId=0,busy=false,queued='',sourceId='',ducked=false,baseVolume=0.8,validSession=0,previewInFlight=false,previewTicket=0,releasePlayback=null;
 const recentSpeech=new Map(),DEDUP_MS=45000;
 const bounded=async(promise,ms)=>{let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Quá thời gian tổng hợp giọng')),ms);})]);}finally{clearTimeout(timer);}};
 const playbackSpeed=()=>{const n=Number(speed?.value||1);return Number.isFinite(n)?Math.max(.6,Math.min(2,n)):1;};
 if(speed){try{const saved=localStorage.getItem('rustlab-tts-speed-v23-4');if([...speed.options].some(o=>o.value===saved))speed.value=saved;}catch{}}
 speed?.addEventListener('change',()=>{try{localStorage.setItem('rustlab-tts-speed-v23-4',speed.value);}catch{}if(playing)playing.playbackRate=playbackSpeed();if(previewAudio)previewAudio.playbackRate=playbackSpeed();});
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
 const selectedVoice=()=>target.value==='vi'?(voice?.value||'piper:25hours'):'piper:default';
 const updateVoiceVisibility=()=>{if(voice)voice.hidden=target.value!=='vi';if(preview)preview.hidden=target.value!=='vi';};
 const status=s=>{info.textContent=String(s||'').slice(0,170);info.title=info.textContent;};
 // Unlike installing a model, prewarming never contacts a network or changes user choices.
 const prewarm=()=>{
  if(!enabled||target.value!=='vi'||!api.ttsPrewarm||video.ended)return;
  const chosen=selectedVoice();
  void api.ttsPrewarm(chosen).then(result=>{
   if(enabled&&chosen===selectedVoice()&&result?.ready)status('Đã nạp sẵn giọng · sẵn sàng đọc nhanh');
  }).catch(error=>{if(enabled)console.warn('TTS warmup:',error);});
 };
 const speechChunks=value=>{
  const parts=[],words=String(value||'').trim().match(/\S+\s*/gu)||[];
  let chunk='';
  for(const word of words){
   // Start speaking with a short complete phrase; remaining chunks can be longer.
   const limit=parts.length===0?60:105;
   if(chunk&&chunk.length+word.length>limit){parts.push(chunk.trim());chunk='';}
   chunk+=word;
   if(chunk.length>=45&&/[.!?…;:]\s*$/u.test(word)){parts.push(chunk.trim());chunk='';}
  }
  if(chunk.trim())parts.push(chunk.trim());
  return parts; // Keep the whole phrase; newer captions may interrupt stale chunks.
 };
 const ttsEvent=(type,detail={})=>document.dispatchEvent(new CustomEvent('rustlab:'+type,{detail}));
 const volumeInput=$('volume');
 const source=()=>String(window.IPTVState?.getCurrent?.()?.lastPlayableUrl||window.IPTVState?.getCurrent?.()?.url||video.currentSrc||'');
 const clamp=x=>Math.min(1,Math.max(0,x));
 const duckRatio=()=>Math.min(100,Math.max(0,Number(duck.value)||0))/100;
 function sliderBase(){
  const n=Number(volumeInput?.value);
  return volumeInput&&Number.isFinite(n)?clamp(n/100):clamp(video.volume);
 }
 function applyDuck(){
  if(!enabled||video.paused||video.ended)return;
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
 video.addEventListener('playing',()=>{if(enabled)status('Đang chờ phụ đề để đọc giọng dịch…');});
 video.addEventListener('playing',()=>{if(enabled)applyDuck();});
 video.addEventListener('loadedmetadata',()=>{if(enabled)applyDuck();});
 function resetPlayback(){
  taskId++;previewTicket++;previewInFlight=false;queued='';busy=false;
  if(releasePlayback){const done=releasePlayback;releasePlayback=null;done();}
  ttsEvent('tts-end');
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
 function ensureCaptionSource(){
  if(!captions?.checked&&!translate?.checked&&captions){captions.checked=true;captions.dispatchEvent(new Event('change',{bubbles:true}));}
 }
 async function speak(input){
  if(!enabled||video.paused||video.ended||busy||playing||previewInFlight||previewAudio||!input||input.enqueuedAt&&Date.now()-input.enqueuedAt>12000)return;
  const payload=typeof input==='string'?{text:input,sourceLanguage:'en'}:input;
  const text=String(payload.text||'').trim();if(!text)return;
  const chunks=speechChunks(text.slice(0,360));if(!chunks.length)return;
  busy=true;
  const generation=taskId,lang=target.value,src=source(),began=Date.now();
  try{
   let nextAudioResult=null;
   const synthesizeChunk=part=>bounded(api.ttsSynthesize({
    target:lang,voice:selectedVoice(),text:part,
    sourceLanguage:payload.sourceLanguage,englishFallbackText:payload.englishFallbackText||''
   }),45000);
   for(let i=0;i<chunks.length;i++){
    if(!enabled||video.paused||video.ended||generation!==taskId||source()!==src)break;
    if(i>0&&queued)break; // New subtitle wins over an old phrase's remaining chunks.
    const chunk=chunks[i];
    // While speech audio plays, render the NEXT WAV concurrently to avoid
    // pauses between words. A new subtitle always wins over old unfinished work.
    const pending=nextAudioResult;nextAudioResult=null;
    const response=pending?await pending:{ok:true,value:await synthesizeChunk(chunk)};
    if(!response.ok)throw response.error;
    const result=response.value;
    if(Date.now()-began>25000&&i===0)return;
    if(!enabled||video.paused||video.ended||generation!==taskId||source()!==src)return;
    if(!result?.audioBase64||result.mime!=='audio/wav')throw Error('Không nhận được WAV từ bộ đọc');
    const audio=new Audio('data:audio/wav;base64,'+result.audioBase64);
    playing=audio;audio.volume=1;audio.playbackRate=playbackSpeed();
    await new Promise((resolve,reject)=>{
     let settled=false;
     const done=()=>{
      if(settled)return;settled=true;if(playing===audio)playing=null;
      if(releasePlayback===done)releasePlayback=null;
      ttsEvent('tts-end');resolve();
     };
     releasePlayback=done;
     audio.addEventListener('ended',done,{once:true});
     audio.addEventListener('error',()=>{done();status('Lỗi phát âm thanh TTS');},{once:true});
     applyDuck();
     audio.play().then(()=>{
      if(generation!==taskId||video.paused||video.ended){done();return;}
      if(i+1<chunks.length&&!queued){
       nextAudioResult=synthesizeChunk(chunks[i+1]).then(
        value=>({ok:true,value}),error=>({ok:false,error}));
      }
      const spoken=String(result.translatedText||chunk).trim();
      ttsEvent('tts-start',{text:spoken,originalText:payload.originalText||'',
       language:lang,sourceLanguage:payload.sourceLanguage});
      status('Đang đọc đồng bộ phụ đề · Tiếng gốc '+duck.value+'%');
     }).catch(error=>{done();reject(error);});
    });
   }
  }catch(error){
   if(playing){try{playing.pause();playing.src='';playing.load();}catch{}playing=null;}
   if(enabled&&generation===taskId)status('TTS: '+String(error.message||error).slice(0,130));
  }finally{
   if(generation===taskId){
    busy=false;
    if(enabled&&!video.paused&&!video.ended&&!playing&&!previewAudio&&!previewInFlight&&queued){
     const next=queued;queued='';void speak(next);
    }
   }
  }
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
  ensureCaptionSource();
  // Launch model warmup without blocking recognition or waiting for the first caption.
  prewarm();
  const ready=await refresh();
  if(enabled&&!ready)status('Nhấn “Cài mô hình tự động” để sử dụng giọng '+target.value);
 });
 target.addEventListener('change',()=>{
  resetPlayback();updateVoiceVisibility();if(enabled){ensureCaptionSource();prewarm();}void refresh();
 });
 voice?.addEventListener('change',()=>{resetPlayback();if(enabled)prewarm();void refresh();});
 preview?.addEventListener('click',async()=>{
  if(target.value!=='vi'||!api.ttsSynthesize)return;
  resetPlayback();const ticket=++previewTicket;previewInFlight=true;
  preview.disabled=true;
  try{
   const ready=await refresh();
   if(!ready){status('Chọn Cài mô hình tự động để tải giọng trước');return;}
   status('Đang tạo đoạn nghe thử giọng '+(voice.selectedOptions?.[0]?.textContent||'')+'…');
   const sample='Xin chào bạn! Đây là giọng đọc tiếng Việt được tạo trực tiếp trên máy.';
   const data=await bounded(api.ttsSynthesize({target:'vi',voice:selectedVoice(),text:sample,sourceLanguage:'vi'}),90000);
   if(ticket!==previewTicket)return;
   if(!data?.audioBase64||data.mime!=='audio/wav')throw Error('Không có âm thanh nghe thử');
   const audio=new Audio('data:audio/wav;base64,'+data.audioBase64);
   previewAudio=audio;audio.playbackRate=playbackSpeed();
   audio.addEventListener('ended',()=>{if(previewAudio!==audio)return;previewAudio=null;if(enabled&&queued){const next=queued;queued='';void speak(next);}},{once:true});
   audio.addEventListener('error',()=>{if(previewAudio!==audio)return;previewAudio=null;if(enabled&&queued){const next=queued;queued='';void speak(next);}},{once:true});
   await audio.play();
   status('Đang nghe thử '+(voice.selectedOptions?.[0]?.textContent||'giọng Việt'));
  }catch(e){if(ticket===previewTicket){try{void api.ttsStop?.();}catch{}if(previewAudio){try{previewAudio.pause();}catch{}previewAudio=null;}status('Nghe thử lỗi: '+String(e.message||e).slice(0,125));}}
  finally{if(ticket===previewTicket){previewInFlight=false;preview.disabled=false;if(enabled&&!previewAudio&&queued){const next=queued;queued='';void speak(next);}}}
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
  finally{install.disabled=false;await refresh();if(enabled)prewarm();}
 });
 if(api.ttsOnEvent)api.ttsOnEvent(e=>{
  if(!e)return;
  if(e.type==='progress'){if(e.target===target.value)status(e.message||'Đang cài…');return;}
  if(e.type==='status'&&enabled)status(e.message||'TTS đang xử lý…');
 });
 if(api.captionOnEvent)api.captionOnEvent(e=>{
  if(!enabled||video.paused||video.ended||!(captions?.checked||translate?.checked)||!e||e.type!=='segment'||!e.text)return;
  if(window.OpenIPTVCaptionSpeechSession&&!window.OpenIPTVCaptionSpeechSession(e))return;
  if(e.route==='mlx-error')return;
  updateSession();
  const direct=!translate?.checked;
  const rawLanguage=String(e.sourceLanguage||e.language||'').trim().toLowerCase().split(/[-_]/)[0];
  if(direct){
   if(e.translated||e.interim||!captions?.checked)return;
   if(rawLanguage!==target.value){
    status('Đọc phụ đề gốc: chọn giọng '+(rawLanguage&&rawLanguage!=='auto'&&rawLanguage!=='unknown'?rawLanguage:'đúng ngôn ngữ nhận diện')+' (không dịch).');
    return;
   }
  }

  // Use the actual language of the text, bypass translation when the voice already matches.
  const to=String(target.value||'').toLowerCase(),spoken=String(e.sourceLanguage||'').toLowerCase();
  const visibleLang=String(e.language||'').toLowerCase(),original=String(e.originalText||'').trim();
  const englishFallback=String(e.englishText||'').trim();
  let text=String(e.text||'').trim(),sourceLanguage=visibleLang;
  if(direct){text=original||text;sourceLanguage=to;}
  else if(visibleLang===to){sourceLanguage=to;}
  else if(spoken===to&&original){text=original;sourceLanguage=to;}
  else if(spoken&&original){text=original;sourceLanguage=spoken;}
  else if(englishFallback){text=englishFallback;sourceLanguage='en';}
  if(!text||!sourceLanguage)return;
  if(!acceptSpeech(sourceLanguage+' '+text))return;
  const payload={text,sourceLanguage,englishFallbackText:direct?'':englishFallback,originalText:original,enqueuedAt:Date.now()};
  if(busy||playing||previewInFlight||previewAudio){queued=payload;return;}
  void speak(payload);
 });
 const captionModeChanged=()=>{
  if(!enabled)return;
  if(!captions?.checked&&!translate?.checked){toggle.checked=false;toggle.dispatchEvent(new Event('change',{bubbles:true}));return;}
  resetPlayback();recentSpeech.clear();
  status(translate?.checked?'Đang chờ phụ đề dịch…':'Đang chờ đọc phụ đề gốc · không dịch…');
 };
 translate?.addEventListener('change',captionModeChanged);
 captions?.addEventListener('change',()=>{if(!translate?.checked)captionModeChanged();});
 document.addEventListener('openiptv:media-info',updateSession);
 const suspendSpeech=()=>{
  // Cancel outstanding synthesis, queued speech and the audio player, but remember the enabled preference.
  resetPlayback();recentSpeech.clear();restore();
  if(enabled)status('Video tạm dừng · TTS đã ngắt');
 };
 let stallTimer=null;
 const clearStall=()=>{if(stallTimer){clearTimeout(stallTimer);stallTimer=null;}};
 const scheduleStall=()=>{
  clearStall();
  stallTimer=setTimeout(()=>{
   stallTimer=null;
   if(!video.paused&&!video.ended&&video.readyState<3)suspendSpeech();
  },1400);
 };
 for(const event of ['pause','ended','emptied','seeking'])
  video.addEventListener(event,()=>{clearStall();suspendSpeech();});
 for(const event of ['waiting','stalled'])video.addEventListener(event,scheduleStall);
 video.addEventListener('playing',clearStall);
 window.addEventListener('pagehide',()=>{clearStall();enabled=false;resetPlayback();restore();});
 setInterval(()=>{updateSession();if(enabled&&!video.paused&&!video.ended)applyDuck();},1800);
 updateVoiceVisibility();void refresh();
})();