'use strict';
// Open IPTV Pro v4.23.63: reuse the *existing* video element for native PiP.
// No duplicate HLS decoder, audio element, channel request or playback restart.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.bootstrap(root);
})(typeof window!=='undefined'?window:null,function(){
 const KEYS=Object.freeze({
  navigate:'openiptv-pip-on-navigation-v1',
  minimize:'openiptv-pip-on-minimize-v1',
  blur:'openiptv-pip-on-blur-v1'
 });
 function createController({video,doc,storage,getPage,notify=()=>{}}){
  let pending=null,sequence=0,reason='';
  // Keep the original player/decoder. Only its already-decoded frames are
  // mirrored into native PiP when on-video CC is enabled.
  const compositor=doc.defaultView?.OpenIPTVCCPiPCompositor?.createController?.({
   video,doc,getState:()=>doc.defaultView?.OpenIPTVCaptionSurface?.getPiPState?.(),
   onPiPEvent:type=>{
    if(type==='leave'){
     reason='';
     // Native "Return to app" closes the PiP window by itself.
     // Release mirrored capture so no hidden video/timer remains.
     compositor?.stop?.();
    }
   }
  });
  const captionsRequested=()=>!!(
   doc.getElementById?.('liveCaptionToggle')?.checked||
   doc.getElementById?.('liveTranslateToggle')?.checked)&&
   doc.getElementById?.('subtitleShow')?.checked!==false;
  const enabled=type=>{
   try{
    const saved=storage?.getItem(KEYS[type]);
    return saved===null||saved===undefined ? type==='navigate' : saved==='true';
   }catch{return type==='navigate';}
  };
  const saveOption=(type,value)=>{
   if(!Object.hasOwn(KEYS,type))throw Error('Unknown PiP setting');
   storage?.setItem(KEYS[type],String(!!value));
  };
  const inPiP=()=>!!video&&(!!doc.pictureInPictureElement||
   video.webkitPresentationMode==='picture-in-picture');
  const eligible=()=>!!video&&video.readyState>=2&&!video.paused&&!video.ended;
  function nativeExit(){
   if(!inPiP())return Promise.resolve(false);
   try{
    // The native PiP element may be a canvas mirror whose readyState is
    // no longer usable. Exit the actual PiP window regardless of element.
    if(doc.pictureInPictureElement&&
       typeof doc.exitPictureInPicture==='function')
     return Promise.resolve(doc.exitPictureInPicture()).then(()=>true);
    if(typeof video.webkitSetPresentationMode==='function'){
     video.webkitSetPresentationMode('inline');return Promise.resolve(true);
    }
   }catch(e){return Promise.reject(e);}
   return Promise.resolve(false);
  }
  function enter(kind,{quiet=true}={}){
   if(!eligible())return Promise.resolve(false);
   if(inPiP())return Promise.resolve(true);
   if(pending)return pending;
   const ticket=++sequence;
   let result,pipVideo=video;
   try{
    // Synchronous invocation preserves user gesture for sidebar/manual button;
    // native minimize/blur invokes this via executeJavaScript(userGesture=true).
    if(captionsRequested())compositor?.prepare?.();
    pipVideo=captionsRequested()?compositor?.getVideo?.()||video:video;
    if(captionsRequested()&&pipVideo===video&&!quiet)
     notify('CC chưa thể ghép vào PiP của luồng này; đang dùng PiP gốc.','warn');
    if(doc.pictureInPictureEnabled&&typeof pipVideo.requestPictureInPicture==='function')
     result=pipVideo.requestPictureInPicture();
    else if(typeof video.webkitSetPresentationMode==='function'){
     video.webkitSetPresentationMode('picture-in-picture');result=true;
    }else throw Error('Trình phát hiện tại không hỗ trợ PiP');
   }catch(error){
    if(pipVideo!==video&&doc.pictureInPictureEnabled&&
       typeof video.requestPictureInPicture==='function'){
     try{result=video.requestPictureInPicture();pipVideo=video;
      if(!quiet)notify('CC không tương thích PiP hiện tại; đã chuyển sang PiP gốc.','warn');}
     catch(fallbackError){
      if(!quiet)notify('PiP: '+String(fallbackError.message||fallbackError),'warn');
      return Promise.resolve(false);
     }
    }else{
     if(!quiet)notify('PiP: '+String(error.message||error),'warn');
     return Promise.resolve(false);
    }
   }
   const job=Promise.resolve(result).then(async()=>{
    if(ticket!==sequence || (kind==='navigation'&&getPage()==='tv')){
     await nativeExit().catch(()=>{});
     return false;
    }
    reason=kind;
    return inPiP();
   }).catch(async error=>{
    if(pipVideo!==video&&ticket===sequence&&doc.pictureInPictureEnabled&&
       typeof video.requestPictureInPicture==='function'){
     try{await video.requestPictureInPicture();reason=kind;
      if(!quiet)notify('CC không tương thích PiP hiện tại; đã chuyển sang PiP gốc.','warn');
      return inPiP();}
     catch(fallbackError){error=fallbackError;}
    }
    if(!quiet)notify('PiP: '+String(error.message||error),'warn');
    return false;
   }).finally(()=>{if(pending===job)pending=null;});
   pending=job;
   return job;
  }
  function exit({quiet=true}={}){
   const hadPiP=inPiP()||!!pending;
   ++sequence;reason='';
   return nativeExit().catch(error=>{
    if(!quiet)notify('PiP: '+String(error.message||error),'warn');
    return false;
   }).finally(()=>{
    // Focus/TV events are frequent even without PiP. Avoid destroying
    // a prewarmed CC mirror unless there was an actual PiP to close.
    if(hadPiP)compositor?.stop?.();
   });
  }
  function manual(){
   if(inPiP()||pending)return exit({quiet:false});
   return enter('manual',{quiet:false});
  }
  function onPageChange(next,last){
   if(next==='tv'){void exit();return;}
   if(last==='tv'&&enabled('navigate'))void enter('navigation');
  }
  function onNativeEvent(type){
   if(type==='focus'){
    // Returning to the main TV player must close ANY PiP, including
    // manually opened, automatically opened and mirrored-caption PiP.
    if(getPage()==='tv')return exit();
    return Promise.resolve(false);
   }
   if(type==='minimize'&&enabled('minimize'))return enter('background');
   if(type==='blur'&&enabled('blur'))return enter('background');
   return Promise.resolve(false);
  }
  video?.addEventListener?.('leavepictureinpicture',()=>{reason='';});
  doc.addEventListener?.('fullscreenchange',()=>{
   const fullscreen=doc.fullscreenElement;
   if(fullscreen&&(fullscreen===video||fullscreen.contains?.(video))){
    void exit();
   }else if(!fullscreen&&captionsRequested()&&eligible()){
    // The user can return from fullscreen and then open CC PiP again.
    // Recreate the prewarmed mirror without waiting for a new play event.
    compositor?.prepare?.();
   }
  });
  const warmMirror=()=>{
   if(captionsRequested()&&eligible())compositor?.prepare?.();
   else if(!inPiP())compositor?.stop?.();
  };
  video?.addEventListener?.('playing',warmMirror);
  video?.addEventListener?.('loadeddata',warmMirror);
  for(const id of ['liveCaptionToggle','liveTranslateToggle','subtitleShow'])
   doc.getElementById?.(id)?.addEventListener?.('change',warmMirror);
  warmMirror();
  const stopPlayback=()=>{
   ++sequence;reason='';
   // Invalidate pending PiP entry, close any floating window, then stop
   // the canvas capture tracks/timer so video cannot keep rendering secretly.
   return nativeExit().catch(()=>false).finally(()=>compositor?.stop?.());
  };
  const dispose=()=>stopPlayback();
  return Object.freeze({enter,exit,manual,onPageChange,onNativeEvent,dispose,stopPlayback,
   getOption:enabled,setOption:saveOption,inPiP,hasPending:()=>!!pending});
 }
 function bootstrap(win){
  const doc=win.document,video=doc.getElementById('video');
  if(!video||win.OpenIPTVAutoPiP)return;
  const notify=(message,type)=>win.IPTVState?.toast?.(message,type);
  const getPage=()=>doc.getElementById('page-tv')?.classList.contains('active-page')?'tv':'other';
  const control=createController({video,doc,storage:win.localStorage,getPage,notify});
  for(const name of Object.keys(KEYS)){
   const input=doc.getElementById('pipAuto'+name[0].toUpperCase()+name.slice(1));
   if(!input)continue;
   input.checked=control.getOption(name);
   input.addEventListener('change',()=>{
    control.setOption(name,input.checked);
    const status=doc.getElementById('pipAutoStatus');
    if(status)status.textContent='Đã lưu thiết lập PiP tự động.';
   });
  }
  win.addEventListener?.('pagehide',()=>{void control.dispose();});
  win.OpenIPTVAutoPiP=control;
 }
 return {createController,bootstrap,KEYS};
});
