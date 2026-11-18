'use strict';
/* Autoplay fallback shared by HLS, DASH and HTML5. No attempt to bypass browser policy. */
(function(root,make){
 const api=make();
 if(typeof module==='object' && module.exports) module.exports=api;
 if(root) root.OpenIPTVWebAutoplay=api;
})(typeof window!=='undefined'?window:null,function(){
 async function start(video, options={}){
  const current=options.isCurrent||(()=>true);
  const fire=(name,...args)=>{if(current()&&typeof options[name]==='function') options[name](...args);};
  if(!current()) return {status:'cancelled'};
  try{
   await video.play();
   return {status:current()?(video.muted?'muted':'audible'):'cancelled'};
  }catch(e){
   if(!current() || e?.name==='AbortError') return {status:'cancelled'};
   if(e?.name!=='NotAllowedError'){
    fire('onError',e);return {status:'error',error:e};
   }
   // A previous play() attempt may reject after another one succeeded.
   if(!video.paused) return {status:video.muted?'muted':'audible'};
   if(!video.muted && options.allowMutedFallback!==false){
    video.defaultMuted=true;
    video.muted=true;
    try{
     await video.play();
     if(!current())return {status:'cancelled'};
     fire('onMuted');
     return {status:'muted',fallback:true};
    }catch(second){
     if(!current() || second?.name==='AbortError')return {status:'cancelled'};
     if(second?.name!=='NotAllowedError'){
      fire('onError',second);return {status:'error',error:second};
     }
     if(!video.paused)return {status:'muted'};
     fire('onBlocked',second);return {status:'blocked'};
    }
   }
   fire('onBlocked',e);return {status:'blocked'};
  }
 }
 return Object.freeze({start});
});
