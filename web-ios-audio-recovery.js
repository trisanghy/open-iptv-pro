'use strict';
/* Safari iOS audio recovery after standards-compliant muted autoplay.
   Never bypass browser activation requirements; unmute only on a real tap. */
(function(root){
 if(!root?.document||root.streamleaf)return;
 const doc=root.document;
 function init(){
  const video=doc.getElementById('video'),box=doc.getElementById('playerBox');
  const mute=doc.getElementById('webVolumeMute'),cast=doc.getElementById('castBtn'),pip=doc.getElementById('pipBtn');
  if(!video||!box||!mute)return;
  let assist=doc.getElementById('webUnmuteAssist');
  if(!assist){
   assist=doc.createElement('button');
   assist.id='webUnmuteAssist';assist.className='web-unmute-assist';
   assist.type='button';assist.hidden=true;
   assist.setAttribute('aria-label','Bật tiếng cho kênh đang phát');
   assist.textContent='🔊 Bật tiếng';
   box.appendChild(assist);
  }
  const refresh=()=>{
   const silent=video.muted || Number(video.volume)===0;
   const live=!!(video.currentSrc||video.src) && (video.readyState>=2||!video.paused);
   assist.hidden=!(silent&&live);
   mute.setAttribute('aria-pressed',String(silent));
   mute.setAttribute('aria-label',silent?'Bật tiếng':'Tắt tiếng');
   if(cast){cast.hidden=false;cast.setAttribute('aria-label','Cast / AirPlay lên TV');}
   if(pip){pip.hidden=false;pip.setAttribute('aria-label','PiP · cửa sổ nổi');}
  };
  // Clicking directly is essential: iOS refuses audio without user activation.
  assist.addEventListener('click',()=>{
   if(video.volume===0){
    try{video.volume=.8;}catch{} // iPhone may only allow its hardware volume buttons.
   }
   video.defaultMuted=false;video.muted=false;
   assist.hidden=true;
   if(video.paused && (video.currentSrc||video.src)){
    const promise=video.play();
    if(promise?.catch)promise.catch(error=>{
     root.IPTVState?.toast?.('Không thể phát tiếng: '+(error?.message||'Luồng không hỗ trợ trên Safari'),'warn');
     refresh();
    });
   }
   // Audio-less or unsupported-codec streams cannot be repaired by software volume.
   refresh();
  });
  doc.addEventListener('openiptv:autoplay-muted',refresh);
  for(const event of ['volumechange','playing','pause','loadeddata','emptied'])video.addEventListener(event,refresh);
  mute.addEventListener('click',()=>{queueMicrotask(refresh);});
  refresh();
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window==='undefined'?null:window);
