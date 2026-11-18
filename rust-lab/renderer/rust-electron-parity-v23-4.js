'use strict';
// Rust Lab v23.4: Electron v4.23.66 player UX features adapted to Tauri.
(()=>{
 const $=id=>document.getElementById(id),video=$('video'),translate=$('liveTranslateToggle'),target=$('liveTranslateTarget'),caption=$('liveCaptionToggle');
 // Single caption overlay is managed by RustSubtitleControls; legacy native segment renderer removed.
 const controller=window.OpenIPTVAutoPiP;
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
