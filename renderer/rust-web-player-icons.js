'use strict';
/* Rust-specific volume glyph state; original Web masks and handlers are retained. */
(function(root){
 if(!root?.document)return;
 function init(){
  const doc=root.document,video=doc.getElementById('video');
  if(!video)return;
  const sync=()=>{
   const muted=!!video.muted||Number(video.volume)===0;
   const label=doc.querySelector('#page-tv .electron-parity-volume label[for="volume"]');
   if(label)label.dataset.iptvMuted=String(muted);
   const fullMute=doc.querySelector('#page-tv .fs-web-mute');
   if(fullMute){
    fullMute.dataset.iptvMuted=String(muted);
    fullMute.setAttribute('aria-label',muted?'Bật tiếng':'Tắt tiếng');
   }
  };
  video.addEventListener('volumechange',sync,{passive:true});
  doc.addEventListener('fullscreenchange',sync);
  doc.addEventListener('openiptv:media-info',sync);
  sync();
  root.OpenIPTVRustWebIconSync=Object.freeze({sync});
 }
 if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window==='undefined'?null:window);
