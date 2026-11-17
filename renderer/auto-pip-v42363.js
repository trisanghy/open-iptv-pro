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
   video,doc,getState:()=>doc.defaultView?.OpenIPTVCaptionSurface?.getPiPState?.()
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
  const inPiP=()=>!!video&&(doc.pictureInPictureElement===video||
   (!!compositor?.getVideo?.()&&doc.pictureInPictureElement===compositor.getVideo())||
   video.webkitPresentationMode==='picture-in-picture');
  const eligible=()=>!!video&&video.readyState>=2&&!video.paused&&!video.ended;
  function nativeExit(){
   if(!inPiP())return Promise.resolve(false);
   try{
    if((doc.pictureInPictureElement===video||
        (!!compositor?.getVideo?.()&&doc.pictureInPictureElement===compositor.getVideo()))&&
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
   let result;
   try{
    // Synchronous invocation preserves user gesture for sidebar/manual button;
    // native minimize/blur invokes this via executeJavaScript(userGesture=true).
    if(captionsRequested())compositor?.prepare?.();
    const pipVideo=captionsRequested()?compositor?.getVideo?.()||video:video;
    if(doc.pictureInPictureEnabled&&typeof pipVideo.requestPictureInPicture==='function')
     result=pipVideo.requestPictureInPicture();
    else if(typeof video.webkitSetPresentationMode==='function'){
     video.webkitSetPresentationMode('picture-in-picture');result=true;
    }else throw Error('Trình phát hiện tại không hỗ trợ PiP');
   }catch(error){
    if(!quiet)notify('PiP: '+String(error.message||error),'warn');
    return Promise.resolve(false);
   }
   const job=Promise.resolve(result).then(async()=>{
    if(ticket!==sequence || (kind==='navigation'&&getPage()==='tv')){
     await nativeExit().catch(()=>{});
     return false;
    }
    reason=kind;
    return inPiP();
   }).catch(error=>{
    if(!quiet)notify('PiP: '+String(error.message||error),'warn');
    return false;
   }).finally(()=>{if(pending===job)pending=null;});
   pending=job;
   return job;
  }
  function exit({quiet=true}={}){
   ++sequence;reason='';
   return nativeExit().catch(error=>{
    if(!quiet)notify('PiP: '+String(error.message||error),'warn');
    return false;
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
    // Only background-initiated PiP is dismissed on returning to TV.
    if(getPage()==='tv'&&reason==='background')return exit();
    return Promise.resolve(false);
   }
   if(type==='minimize'&&enabled('minimize'))return enter('background');
   if(type==='blur'&&enabled('blur'))return enter('background');
   return Promise.resolve(false);
  }
  video?.addEventListener?.('leavepictureinpicture',()=>{reason='';});
  const warmMirror=()=>{if(captionsRequested()&&eligible())compositor?.prepare?.();};
  video?.addEventListener?.('playing',warmMirror);
  video?.addEventListener?.('loadeddata',warmMirror);
  for(const id of ['liveCaptionToggle','liveTranslateToggle','subtitleShow'])
   doc.getElementById?.(id)?.addEventListener?.('change',warmMirror);
  warmMirror();
  return Object.freeze({enter,exit,manual,onPageChange,onNativeEvent,
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
  win.OpenIPTVAutoPiP=control;
 }
 return {createController,bootstrap,KEYS};
});
