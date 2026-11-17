'use strict';
/**
 * Open IPTV Pro v4.23.58
 * One subtitle renderer on the VIDEO, never the third-row transcript.
 * Primary: native Chromium VTTCue text-track (supports video fullscreen / PiP).
 * Fallback: one absolute overlay anchored to the video parent.
 */
(function(root,factory){
 const exported=factory();
 if(typeof module==='object'&&module.exports)module.exports=exported;
 if(root)root.OpenIPTVVideoCaptions=exported;
})(typeof window!=='undefined'?window:null,function(){
 function createVideoCaptionRenderer({video,doc}={}){
  if(!video||!doc)throw Error('A video element and document are required');
  let track=null,cue=null,currentLanguage='',overlay=null,anchor=null,lastText='',mode='off';
  const clean=()=>{if(track&&cue){try{track.removeCue(cue);}catch{}}cue=null;};
  const disable=()=>{
   clean();
   if(track){try{track.mode='disabled';}catch{}}
   track=null;currentLanguage='';
  };
  const hideFallback=()=>{
   if(overlay){overlay.textContent='';overlay.hidden=true;}
  };
  function fallback(text){
   const parent=video.parentElement;
   if(!parent||typeof parent.appendChild!=='function')throw Error('No video parent for subtitle overlay');
   if(anchor!==parent){
    if(overlay?.parentElement){try{overlay.parentElement.removeChild(overlay);}catch{}}
    overlay=null;anchor=parent;
   }
   if(!overlay){
    overlay=doc.createElement('div');
    overlay.className='openiptv-video-translation-overlay';
    overlay.setAttribute('role','text');
    overlay.setAttribute('aria-live','polite');
    parent.classList?.add('openiptv-video-translation-anchor');
    parent.appendChild(overlay);
   }
   overlay.textContent=text;overlay.hidden=false;mode='overlay';
  }
  function show(text,language){
   const line=String(text||'').trim().slice(0,1800);
   if(!line){clear();return 'off';}
   const lang=String(language||'und').slice(0,12);
   lastText=line;
   const Cue=(typeof VTTCue!=='undefined'?VTTCue:null);
   // For Chromium HTMLVideoElement, VTT shows in video fullscreen too.
   if(Cue&&typeof video.addTextTrack==='function'&&Number.isFinite(video.currentTime)){
    try{
     if(!track||currentLanguage!==lang){
      disable();
      track=video.addTextTrack('subtitles','Open IPTV Pro · '+lang,lang);
      currentLanguage=lang;
     }
     clean();
     track.mode='showing';
     const start=Math.max(0,video.currentTime);
     cue=new Cue(start,start+12,line);
     cue.align='center';
     track.addCue(cue);
     hideFallback();
     mode='native';
     return mode;
    }catch{
     disable();
    }
   }
   fallback(line);
   return mode;
  }
  function clear(){
   disable();hideFallback();
   lastText='';mode='off';
  }
  function destroy(){
   clear();
   if(overlay?.parentElement){try{overlay.parentElement.removeChild(overlay);}catch{}}
   overlay=null;anchor=null;
  }
  return Object.freeze({show,clear,destroy,getMode:()=>mode,getText:()=>lastText});
 }
 return {createVideoCaptionRenderer};
});
