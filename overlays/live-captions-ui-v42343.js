'use strict';
// v4.23.43: local Live Caption / English Live Translate controls in playback row 3.
(()=>{
 const $=id=>document.getElementById(id);
 const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),status=$('liveCaptionStatus'),box=$('liveCaptionOutput'),video=$('video');
 if(!caption||!translate||!status||!box||!video)return;
 const api=window.streamleaf,ctx=window.IPTVState;
 const setup=$('liveCaptionSetup'),picker=$('liveCaptionSetupPanel');
 const pickWhisper=$('captionChooseBinary'),pickModel=$('captionChooseModel');
 let activeId=0,currentURL='',busy=false,captionTrack=null,lastTrackCue=null,lastText='',lastTranslate=false;
 const setStatus=s=>{status.textContent=String(s||'').slice(0,170);status.title=status.textContent;};
 const preferredURL=()=>{
  const c=ctx?.getCurrent?.();
  return c&&String(c.lastPlayableUrl||c.url||'')||'';
 };
 function showWords(value,translated){
  const cleaned=String(value||'').trim();if(!cleaned)return;
  lastText=cleaned;lastTranslate=!!translated;
  box.hidden=false;
  box.textContent=(translated?'Dịch tiếng Anh: ':'Phụ đề: ')+cleaned;
  // Native PiP may render dynamic text track cues if supported by the Chromium build.
  // This is best-effort and never pretends to provide Chrome's proprietary caption UI.
  if(!('VTTCue' in window)||!Number.isFinite(video.currentTime))return;
  try{
   if(!captionTrack){captionTrack=video.addTextTrack('captions','Open IPTV Pro Live Caption','en');captionTrack.mode='showing';}
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
  if(!force&&activeId&&currentURL===url&&translate.checked===lastTranslate)return;
  busy=true;
  try{
   await api.captionStop();
   activeId=0;currentURL='';hideWords();
   const result=await api.captionStart({url,translate:translate.checked});
   activeId=result.id;currentURL=url;lastTranslate=translate.checked;
   setStatus(translate.checked?'Đang dịch sang tiếng Anh…':'Đang nhận diện giọng nói…');
  }catch(e){
   setStatus('Chưa bật: '+String(e.message||e));
   caption.checked=false;translate.checked=false;
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
   if(e.type==='segment'){showWords(e.text,e.translated);setStatus(e.translated?'Live Translate · English':'Live Caption · Auto');}
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
