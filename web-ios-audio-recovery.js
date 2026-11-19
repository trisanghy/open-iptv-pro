'use strict';
/* Chrome on iPhone can pause native HLS when the existing volume button
 * unmutes a muted-autoplay stream. Keep the volume button as the ONLY sound
 * control: resume in the same user click, without a duplicate overlay. */
(function(root){
 if(!root?.document||root.streamleaf)return;
 const doc=root.document;
 const ua=String(root.navigator?.userAgent||'');
 const chromeIOS=/CriOS\/\d+/i.test(ua)&&/iPhone|iPad|iPod/i.test(ua);
 function init(){
  // Clean up any legacy recovery button if scripts were reloaded in an SPA.
  doc.getElementById?.('webUnmuteAssist')?.remove?.();
  doc.getElementById?.('web-resume-panel')?.remove?.();
  if(!chromeIOS)return; // Safari stays on the native video/volume route.
  const video=doc.getElementById?.('video');
  const mute=doc.getElementById?.('webVolumeMute');
  if(!video||!mute)return;
  mute.addEventListener('click',()=>{
   // web-volume.js toggles mute first. An audible play() must be triggered
   // synchronously inside the same user gesture on iOS.
   if(video.muted||!String(video.currentSrc||video.src||''))return;
   let attempt;
   try{attempt=video.play();}catch{return;}
   attempt?.catch?.(()=>{
    const status=doc.getElementById?.('streamInfo');
    if(status&&video.paused)status.textContent='Nhấn Phát để tiếp tục';
   });
  });
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window==='undefined'?null:window);
