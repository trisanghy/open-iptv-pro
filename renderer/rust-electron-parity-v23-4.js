'use strict';
// Rust Lab v23.4: Electron v4.23.66 player UX features adapted to Tauri.
(()=>{
 const $=id=>document.getElementById(id),video=$('video'),translate=$('liveTranslateToggle'),target=$('liveTranslateTarget'),caption=$('liveCaptionToggle');
 const overlay=$('rustTranslatedCaption'),controller=window.OpenIPTVAutoPiP;let latest='';
 const clear=()=>{latest='';if(overlay){overlay.textContent='';overlay.hidden=true;}};
 window.streamleaf?.captionOnEvent?.(event=>{
  if(event?.type==='segment'&&overlay&&translate?.checked){
   const language=String(event.language||'').toLowerCase(),expected=String(target?.value||'').toLowerCase(),text=String(event.text||'').trim();
   if(!text||language!==expected||text===latest)return; // target only; never interim/source text
   latest=text;overlay.textContent=text.slice(0,520);overlay.hidden=false;
  }else if(event?.type==='stopped'||event?.type==='error')clear();
 });
 for(const field of [translate,target,caption])field?.addEventListener('change',clear);
 video?.addEventListener('emptied',clear);video?.addEventListener('ended',clear);
 video?.addEventListener('enterpictureinpicture',()=>{
  for(const track of video.textTracks||[])if(track.label==='Open IPTV Pro Live Caption')track.mode='showing';
 });
 video?.addEventListener('leavepictureinpicture',()=>{
  for(const track of video.textTracks||[])if(track.label==='Open IPTV Pro Live Caption'&&translate?.checked)track.mode='hidden';
 });
 if(controller){
  const nativeWindow=window.__TAURI__?.window?.getCurrentWindow?.();
  window.addEventListener('blur',()=>{
   // The OS/WebView can reject background PiP without user activation.
   void (async()=>{
    try{const minimized=typeof nativeWindow?.isMinimized==='function'&&await nativeWindow.isMinimized();await controller.onNativeEvent(minimized?'minimize':'blur');}
    catch{await controller.onNativeEvent('blur');}
   })();
  });
  window.addEventListener('focus',()=>{void controller.onNativeEvent('focus');});
  if(typeof nativeWindow?.onResized==='function')
   Promise.resolve(nativeWindow.onResized(async()=>{try{if(await nativeWindow.isMinimized())await controller.onNativeEvent('minimize');}catch{}})).catch(()=>{});
 }
 const list=$('rustAIHardwareList'),advice=window.OpenIPTVHardwareAdvice;
 if(list&&advice)for(const [id,title] of [['whisper','Whisper · nhận diện'],['argos','Argos · dịch'],['piper','Piper · đọc nhẹ'],['vieneu','VieNeu · 25 giọng']]){
  const m=advice.forModel(id);if(!m)continue;
  const card=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('small');
  card.className='rust-ai-hardware-item';strong.textContent=title;small.textContent=m.summary+' · '+m.detail;card.append(strong,small);list.append(card);
 }
})();
