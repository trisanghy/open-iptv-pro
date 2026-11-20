'use strict';
/* Web player icon states. Actual glyphs are vector CSS masks, never emoji.
   Existing button IDs, click handlers, captions, player UX and iOS fullscreen
   implementation are preserved. No network requests or storage access. */
(function(factory){
 const root=typeof window==='undefined'?null:window;
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(function(root){
 // When background listening is enabled, the VIDEO is intentionally paused.
 // The audio player must own the icon state; otherwise the controls appear
 // stopped while the stream is audible and do not update on subsequent taps.
 const derive=(video,background)=>{
  const state=background?.active?background.getPlaybackState?.():null;
  if(state)return {playing:!!state.playing,muted:!!state.muted};
  return {
   playing:!!video&&!video.paused&&!video.ended,
   muted:!!video&&(!!video.muted||Number(video.volume)===0)
  };
 };
 // App legacy handlers still set button.textContent = '▶', 'Ⅱ', '★' etc.
 // Scrub only direct decorative text nodes (not icon labels or aria attrs).
 // Keep DOM elements and event listeners; observe future textContent writes.
 const glyphButtons=Object.freeze([
  'prevBtn','playBtn','stopBtn','nextBtn','castBtn','pipBtn',
  'fullscreenBtn','fsPrev','fsPlay','fsNext','fsExit',
  'openGuideBtn','favCurrentBtn'
 ]);
 function stripLegacyGlyphs(button){
  if(!button)return false;
  let changed=false;
  for(const node of Array.from(button.childNodes||[])){
   if(node.nodeType===3 && node.nodeValue){
    node.nodeValue='';changed=true;
   }
  }
  if(!button.getAttribute?.('aria-label')){
   const title=button.getAttribute?.('title');
   if(title)button.setAttribute?.('aria-label',title);
  }
  return changed;
 }
 function observeLegacyButtons(doc){
  const observers=[];
  for(const id of glyphButtons){
   const button=doc.getElementById(id);if(!button)continue;
   stripLegacyGlyphs(button);
   if(typeof root?.MutationObserver==='function'){
    const observer=new root.MutationObserver(()=>stripLegacyGlyphs(button));
    observer.observe(button,{childList:true,characterData:true,subtree:true});
    observers.push(observer);
   }
  }
  return observers;
 }
 function init(){
  const doc=root?.document;if(!doc)return;
  const video=doc.getElementById('video');if(!video)return;
  const play=doc.getElementById('playBtn');
  const full=doc.getElementById('fsPlay');
  const mute=doc.getElementById('webVolumeMute');
  observeLegacyButtons(doc);
  function sync(){
   const state=derive(video,root.OpenIPTVBackgroundAudio);
   for(const button of [play,full]){
    if(!button)continue;
    button.dataset.iptvPlaying=String(state.playing);
    button.setAttribute('aria-label',state.playing?'Tạm dừng':'Phát');
    button.setAttribute('title',state.playing?'Tạm dừng':'Phát');
   }
   if(mute)mute.dataset.iptvMuted=String(state.muted);
   return state;
  }
  for(const event of ['play','playing','pause','ended','emptied','loadedmetadata','volumechange'])
   video.addEventListener(event,sync,{passive:true});
  // Remove decorative legacy text from action labels but retain text and
  // number spans, avoiding innerHTML rewrites and missing click listeners.
  const section=doc.querySelector('#page-tv .timeshift-actions>b');
  if(section?.firstChild?.nodeType===3)
   section.firstChild.nodeValue=section.firstChild.nodeValue.replace(/⏪\s*/g,'');
  for(const id of ['dvrQuickToggle','dvrQuickManage']){
   const button=doc.getElementById(id);
   if(button?.firstChild?.nodeType===3)
    button.firstChild.nodeValue=button.firstChild.nodeValue.replace(/^[⏺▤]\s*/,'');
  }
  const summary=doc.querySelector('#quickTools>summary');
  if(summary?.firstChild?.nodeType===3)
   summary.firstChild.nodeValue=summary.firstChild.nodeValue.replace(/^▤\s*/,'');
  sync();
  // Background audio updates this hook on each actual play/pause event.
  // Only icon state is modified; the existing playback handlers are untouched.
  root.OpenIPTVPlayerIcons=Object.freeze({sync});
  return {sync};
 }
 if(root?.document){
  if(root.document.readyState==='loading')
   root.document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
 }
 return Object.freeze({derive,init,stripLegacyGlyphs,glyphButtons,observeLegacyButtons});
});
