'use strict';
// v23.8.20 — One video, one WebVTT track for native PiP / native video fullscreen.
// In ordinary playback and playerBox fullscreen the styled HTML CC overlay stays in control.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)root.RustNativeCaptions=api;
})(typeof window!=='undefined'?window:null,function(){
 function createController({video,doc,win}){
  let track=null,cue=null,currentText='',wanted=false;
  const isNativePresentation=()=>doc.pictureInPictureElement===video||
   video.webkitPresentationMode==='picture-in-picture'||
   video.webkitPresentationMode==='fullscreen'||
   video.webkitDisplayingFullscreen===true||
   doc.fullscreenElement===video||doc.webkitFullscreenElement===video;
  const clearCue=()=>{
   if(track&&cue)try{track.removeCue(cue);}catch{}
   cue=null;
  };
  const ensureTrack=()=>{
   if(track)return track;
   if(typeof video.addTextTrack!=='function')return null;
   try{
    track=video.addTextTrack('subtitles','Open IPTV Pro CC','vi');
    track.mode='hidden';
   }catch(error){console.warn('Cannot create native caption track:',error);track=null;}
   return track;
  };
  function sync(text,enabled){
   currentText=String(text||'').trim();
   wanted=!!enabled&&!!currentText;
   if(!wanted){
    clearCue();
    if(track)track.mode='disabled';
    return false;
   }
   const active=ensureTrack();
   if(!active||typeof win.VTTCue!=='function')return false;
   try{
    // Recreate the timed cue on the current video timeline (not wall-clock time).
    // Keep only one cue to avoid duplicate or stale captions after channel switches.
    clearCue();
    const time=Math.max(0,Number(video.currentTime)||0);
    cue=new win.VTTCue(Math.max(0,time-.4),time+14.5,currentText);
    try{cue.align='center';cue.position=50;cue.size=96;cue.line=-3;}catch{}
    active.mode=isNativePresentation()?'showing':'hidden';
    active.addCue(cue);
    return true;
   }catch(error){console.warn('Cannot update native subtitle cue:',error);return false;}
  }
  function refresh(){
   if(!wanted){
    if(track)track.mode='disabled';
    return;
   }
   const active=ensureTrack();
   if(!active)return;
   const now=Math.max(0,Number(video.currentTime)||0);
   if(!cue||now>cue.endTime||now<cue.startTime)return void sync(currentText,true);
   active.mode=isNativePresentation()?'showing':'hidden';
  }
  function clear(){
   wanted=false;currentText='';clearCue();
   if(track)track.mode='disabled';
  }
  // Events are emitted both for standards PiP and Apple's legacy presentation API.
  for(const name of ['enterpictureinpicture','leavepictureinpicture',
    'webkitpresentationmodechanged','webkitbeginfullscreen','webkitendfullscreen']){
   video.addEventListener(name,()=>{
    refresh();
    if(typeof win.requestAnimationFrame==='function')win.requestAnimationFrame(refresh);
   });
  }
  doc.addEventListener('fullscreenchange',refresh);
  doc.addEventListener('webkitfullscreenchange',refresh);
  video.addEventListener('playing',refresh);
  video.addEventListener('seeked',refresh);
  return Object.freeze({sync,refresh,clear,isNativePresentation,
   getMode:()=>track?.mode||'none',getText:()=>currentText});
 }
 return {createController};
});
