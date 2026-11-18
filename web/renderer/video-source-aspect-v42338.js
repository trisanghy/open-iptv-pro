'use strict';
/* Display-aspect aware video frame. No network calls and no playback changes.
   videoWidth/videoHeight reflect the browser's display dimensions for frames. */
(() => {
  const DEFAULT = Object.freeze({width:16,height:9,numeric:16/9});
  function ratioForSource(width,height){
    const w=Number(width),h=Number(height);
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return DEFAULT;
    const numeric=w/h;
    // Reject obviously corrupt metadata. Portrait, 4:3 and ultra-wide are valid.
    if(numeric<0.25||numeric>5)return DEFAULT;
    return {width:w,height:h,numeric};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={ratioForSource};
  if(typeof document==='undefined')return;
  const frame=document.getElementById('playerBox');
  const video=document.getElementById('video');
  if(!frame||!video)return;
  let previous='';
  function applyAspect(){
    const {width,height,numeric}=ratioForSource(video.videoWidth,video.videoHeight);
    const key=width+'/'+height;
    if(previous===key)return;
    previous=key;
    frame.style.setProperty('--source-video-ratio',`${width} / ${height}`);
    frame.style.setProperty('--source-video-ratio-factor',String(numeric));
    frame.dataset.videoAspect=key;
  }
  function resetAspect(){
    previous='';
    frame.style.setProperty('--source-video-ratio','16 / 9');
    frame.style.setProperty('--source-video-ratio-factor',String(16/9));
    frame.dataset.videoAspect='16/9';
  }
  // Source changes: promptly return to 16:9 until native dimensions arrive.
  for(const event of ['emptied','loadstart'])video.addEventListener(event,resetAspect);
  // HLS/DASH resolution may change while a stream is playing.
  for(const event of ['loadedmetadata','loadeddata','resize'])video.addEventListener(event,applyAspect);
  resetAspect();
})();
