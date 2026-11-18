/* Rust Lab v17 — follow the source video's native display aspect ratio.
 * Default to 16:9 until metadata from the selected stream is available.
 * This changes the player FRAME, not the user's video object-fit selection. */
(function(root){
 'use strict';
 const doc=root.document;
 if(!doc)return;
 const video=doc.getElementById('video');
 const frame=doc.getElementById('playerBox');
 if(!video||!frame)return;
 const DEFAULT_ASPECT='16 / 9';
 function dimensions(width,height){
  const w=Number(width),h=Number(height);
  if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return null;
  // Avoid integer overflows or bogus metadata; 4:3, 16:9, 9:16 and ultrawide remain supported.
  return [Math.round(w),Math.round(h)];
 }
 function setFrameAspect(value,kind){
  frame.style.setProperty('--ipvp-source-video-aspect',value);
  frame.dataset.sourceAspect=kind;
 }
 function reset(){setFrameAspect(DEFAULT_ASPECT,'default');}
 function sync(){
  const natural=dimensions(video.videoWidth,video.videoHeight);
  // Reject late metadata and obsolete video dimensions between channel changes.
  if(!natural||video.readyState<1||!video.currentSrc){reset();return;}
  const [w,h]=natural;
  setFrameAspect(`${w} / ${h}`,'source');
 }
 // Reset immediately as the old decoder is released or new URL starts loading.
 video.addEventListener('emptied',reset);
 video.addEventListener('loadstart',reset);
 video.addEventListener('loadedmetadata',sync);
 // Adaptive HLS/DASH may change resolution (including aspect) mid-stream.
 video.addEventListener('resize',sync);
 video.addEventListener('loadeddata',sync);
 reset();
 root.IPTVSourceVideoAspect=Object.freeze({reset,sync,dimensions,DEFAULT_ASPECT});
})(typeof window!=='undefined'?window:undefined);