'use strict';
/* Web player icon states. Actual glyphs are vector CSS masks, never emoji.
   Existing button IDs, click handlers, captions, player UX and iOS fullscreen
   implementation are preserved. No network requests or storage access. */
(function(factory){
 const root=typeof window==='undefined'?null:window;
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(function(root){
 const derive=video=>({
  playing:!!video&&!video.paused&&!video.ended,
  muted:!!video&&(!!video.muted||Number(video.volume)===0)
 });
 function init(){
  const doc=root?.document;if(!doc)return;
  const video=doc.getElementById('video');if(!video)return;
  const play=doc.getElementById('playBtn');
  const full=doc.getElementById('fsPlay');
  const mute=doc.getElementById('webVolumeMute');
  function sync(){
   const state=derive(video);
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
  return {sync};
 }
 if(root?.document){
  if(root.document.readyState==='loading')
   root.document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
 }
 return Object.freeze({derive,init});
});
