'use strict';
/* Web-only iOS audio unlock. Chrome on iOS and Safari use WebKit but differ
 * in how a muted autoplay stream is promoted to audible playback.
 * Only a direct click may request audible playback; no hidden autoplay loop. */
(function(root){
 if(!root?.document||root.streamleaf)return;
 const doc=root.document;
 const ua=String(root.navigator?.userAgent||'');
 const chromeIOS=/CriOS\/\d+/i.test(ua)&&/iPhone|iPad|iPod/i.test(ua);
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
  }
  if(chromeIOS&&typeof box.insertAdjacentElement==='function'){
   // Chrome iOS can let the native video surface consume overlay taps.
   // Place the one-tap action immediately BELOW the video on Chrome only.
   assist.classList.add('web-unmute-assist-chrome-ios');
   box.insertAdjacentElement('afterend',assist);
  }else if(assist.parentElement!==box)box.appendChild(assist);
  let lastSource='',needsRetry=false,attempt=0,lastGestureAt=0;
  const playingSource=()=>String(video.currentSrc||video.src||'');
  function refresh(){
   const url=playingSource();
   if(url!==lastSource){lastSource=url;needsRetry=false;attempt++;}
   const silent=Boolean(video.muted)||Number(video.volume)===0;
   if(!silent&&!video.paused)needsRetry=false;
   const live=Boolean(url)&&(Number(video.readyState)>=2||!video.paused||needsRetry);
   assist.hidden=!(live&&(silent||needsRetry));
   mute.setAttribute('aria-pressed',String(silent));
   mute.setAttribute('aria-label',silent?'Bật tiếng':'Tắt tiếng');
   if(cast){cast.hidden=false;cast.setAttribute('aria-label','Cast / AirPlay lên TV');}
   if(pip){pip.hidden=false;pip.setAttribute('aria-label','PiP · cửa sổ nổi');}
  }
  function onError(error,id){
   if(id!==attempt)return;
   needsRetry=true;
   assist.hidden=false;
   const message=String(error?.message||error?.name||'trình duyệt không cho phép phát tiếng').slice(0,140);
   root.IPTVState?.toast?.('Không thể phát tiếng: '+message,'warn');
   refresh();
  }
  function requestAudioFromGesture(){
   const url=playingSource();
   if(!url){refresh();return;}
   const id=++attempt;
   needsRetry=false;
   lastGestureAt=Date.now();
   // Volume on iOS can be hardware-only; do not let an unsupported setter
   // prevent the subsequent synchronous play() call.
   try{if(Number(video.volume)===0)video.volume=.8;}catch{}
   try{video.defaultMuted=false;video.muted=false;}catch(error){onError(error,id);return;}
   // IMPORTANT: Chrome iOS may pause a muted autoplay stream AS IT IS UNMUTED.
   // Request play in this same user gesture even when it appeared to be playing.
   if(chromeIOS||video.paused){
    let result;
    try{result=video.play();}catch(error){onError(error,id);return;}
    if(result?.then)result.then(()=>{
     if(id!==attempt)return;
     if(video.paused){needsRetry=true;}
     refresh();
    },error=>onError(error,id));
   }
   refresh();
  }
  assist.addEventListener('click',requestAudioFromGesture);
  doc.addEventListener('openiptv:autoplay-muted',refresh);
  for(const event of ['volumechange','playing','pause','loadeddata','emptied']){
   video.addEventListener(event,()=>{
    if(chromeIOS&&event==='pause'&&!video.muted&&Date.now()-lastGestureAt<5000)needsRetry=true;
    refresh();
   });
  }
  // The toolbar mute control must also activate playback in the SAME tap,
  // after web-volume.js has already updated the muted state.
  mute.addEventListener('click',()=>{
   if(chromeIOS&&!video.muted&&playingSource())requestAudioFromGesture();
   else refresh();
  });
  refresh();
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window==='undefined'?null:window);
