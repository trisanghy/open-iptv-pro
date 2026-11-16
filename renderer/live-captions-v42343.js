'use strict';
// v4.23.43: local Live Caption / English Live Translate controls in playback row 3.
(()=>{
 const $=id=>document.getElementById(id);
 const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),status=$('liveCaptionStatus'),box=$('liveCaptionOutput'),video=$('video');
 if(!caption||!translate||!status||!box||!video)return;
 const api=window.streamleaf,ctx=window.IPTVState;
 const setup=$('liveCaptionSetup'),picker=$('liveCaptionSetupPanel');
 const pickWhisper=$('captionChooseBinary'),pickModel=$('captionChooseModel'),target=$('liveTranslateTarget'),installTranslation=$('captionTranslationInstall');
 let activeId=0,currentURL='',busy=false,captionTrack=null,lastTrackCue=null,lastText='',lastTranslate=false,lastTarget='en';
 const setStatus=s=>{status.textContent=String(s||'').slice(0,170);status.title=status.textContent;};
 const preferredURL=()=>{
  const c=ctx?.getCurrent?.();
  return c&&String(c.lastPlayableUrl||c.url||'')||'';
 };
 function showWords(value,translated,language){
  const cleaned=String(value||'').trim();if(!cleaned)return;
  lastText=cleaned;lastTranslate=!!translated;
  box.hidden=false;
  const label=[...target.options].find(o=>o.value===language)?.textContent||language||'English';
  box.textContent=(translated?'Dịch '+label+': ':'Phụ đề: ')+cleaned;
  // Native PiP may render dynamic text track cues if supported by the Chromium build.
  // This is best-effort and never pretends to provide Chrome's proprietary caption UI.
  if(!('VTTCue' in window)||!Number.isFinite(video.currentTime))return;
  try{
   if(!captionTrack){captionTrack=video.addTextTrack('captions','Open IPTV Pro Live Caption',language||'en');captionTrack.mode='showing';}
   if(lastTrackCue)captionTrack.removeCue(lastTrackCue);
   const t=Math.max(0,video.currentTime);
   lastTrackCue=new window.VTTCue(t,t+13,cleaned);
   captionTrack.addCue(lastTrackCue);
  }catch{}
 }
 function hideWords(){
  box.hidden=true;box.textContent='';lastText='';lastTranslate=false;
  if(captionTrack&&lastTrackCue){try{captionTrack.removeCue(lastTrackCue);}catch{}lastTrackCue=null;}
 }
 async function stop(){
  activeId=0;currentURL='';hideWords();
  try{await api?.captionStop?.();}catch{}
 }
 async function refreshState(){
  if(!api?.captionStatus){
   caption.disabled=true;translate.disabled=true;setup.disabled=true;
   setStatus('Nhận diện giọng nói chỉ hỗ trợ bản desktop, không dùng tính năng Chrome.');
   return false;
  }
  try{
   const data=await api.captionStatus();
   if(data.available){setStatus('Sẵn sàng · '+(data.modelName||'Whisper local'));return true;}
   const msg=data.reason||'Cần thiết lập Whisper';
   setStatus(msg+' · nhấn ⚙');
   return false;
  }catch(e){setStatus(String(e.message||e));return false;}
 }
 async function reconcile(force=false){
  if(busy)return;
  const want=caption.checked||translate.checked,url=preferredURL();
  if(!want||!url){
   if(activeId||currentURL)await stop();
   if(want&&!url)setStatus('Chọn một kênh có tiếng để bật phụ đề');
   return;
  }
  const lang=translate.checked?(target?.value||'en'):'en';
  if(!force&&activeId&&currentURL===url&&translate.checked===lastTranslate&&lang===lastTarget)return;
  busy=true;
  try{
   await api.captionStop();
   activeId=0;currentURL='';hideWords();
   if(translate.checked&&lang!=='en'&&api.captionTranslationStatus){
    const state=await api.captionTranslationStatus(lang);
    if(!state.ready){
     picker.hidden=false;setup?.setAttribute('aria-expanded','true');
     throw Error('Cần cài mô hình dịch '+(target?.selectedOptions?.[0]?.textContent||lang)+' (nhấn Cài mô hình dịch)');
    }
   }
   const result=await api.captionStart({url,translate:translate.checked,target:lang});
   activeId=result.id;currentURL=url;lastTranslate=translate.checked;lastTarget=lang;
   setStatus(translate.checked?'Đang dịch sang '+(target?.selectedOptions?.[0]?.textContent||lang)+'…':'Đang nhận diện giọng nói…');
  }catch(e){
   setStatus('Chưa bật: '+String(e.message||e));
   // Keep the selected language on screen when only the offline pack is missing.
   if(!String(e.message||e).includes('Cần cài mô hình dịch')){caption.checked=false;translate.checked=false;}
  }finally{busy=false;}
 }
 caption.addEventListener('change',()=>{
  if(!caption.checked)translate.checked=false;
  void reconcile(true);
 });
 translate.addEventListener('change',()=>{
  if(translate.checked)caption.checked=true;
  void reconcile(true);
 });
 target?.addEventListener('change',()=>{if(translate.checked)void reconcile(true);});
 installTranslation?.addEventListener('click',async()=>{
  if(!api?.captionTranslationInstall)return;
  const lang=target?.value||'en';if(lang==='en'){setStatus('Dịch English đã có sẵn trong Whisper');return;}
  installTranslation.disabled=true;installTranslation.textContent='Đang cài dịch…';
  try{
   setStatus('Đang tự cài mô hình dịch '+(target?.selectedOptions?.[0]?.textContent||lang)+'…');
   const result=await api.captionTranslationInstall(lang);
   if(!result?.ready)throw Error('Mô hình chưa sẵn sàng');
   setStatus('Đã cài mô hình dịch '+lang+' · offline');
   if(translate.checked)await reconcile(true);
  }catch(e){setStatus('Cài dịch lỗi: '+String(e.message||e).slice(0,125));}
  finally{installTranslation.disabled=false;installTranslation.textContent='Cài mô hình dịch';}
 });
 setup?.addEventListener('click',async()=>{
  picker.hidden=!picker.hidden;
  setup.setAttribute('aria-expanded',String(!picker.hidden));
  await refreshState();
 });
 async function choose(which){
  try{
   const data=await api.captionChooseFile(which);
   if(data?.canceled)return;
   setStatus('Đã chọn '+(which==='model'?'mô hình':'whisper-cli'));
   await refreshState();
   if(caption.checked)await reconcile(true);
  }catch(e){setStatus('Thiết lập lỗi: '+String(e.message||e));}
 }
 pickWhisper?.addEventListener('click',()=>void choose('binary'));
 pickModel?.addEventListener('click',()=>void choose('model'));
 if(api?.captionOnEvent){
  api.captionOnEvent(e=>{
   if(!e||!activeId||e.id!==activeId)return;
   if(e.type==='segment'){showWords(e.text,e.translated,e.language);setStatus(e.translated?'Live Translate · '+(e.target||'en'):'Live Caption · Auto');}
   if(e.type==='status')setStatus(e.message||'');
   if(e.type==='error'){setStatus(e.message||'Lỗi nhận diện');activeId=0;caption.checked=false;translate.checked=false;}
   if(e.type==='stopped'&&e.id===activeId){activeId=0;}
  });
 }
 // Do not leave a stale voice process on channel changes, stop, or window close.
 let observed='';
 setInterval(()=>{
  const u=preferredURL();
  if(u!==observed){observed=u;if(caption.checked)void reconcile(true);else if(activeId)void stop();}
 },1400);
 window.addEventListener('pagehide',()=>{void stop();});
 document.addEventListener('openiptv:media-info',()=>{
  if(!ctx?.getCurrent?.()&&activeId)void stop();
 });
 void refreshState();
})();