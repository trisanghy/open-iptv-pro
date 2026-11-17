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
  let pending=null,sequence=0,reason='',floating=null;
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
  const inPiP=()=>!!video&&(!!floating||doc.pictureInPictureElement===video||
   video.webkitPresentationMode==='picture-in-picture');
  const eligible=()=>!!video&&video.readyState>=2&&!video.paused&&!video.ended;
  const captionsRequested=()=>!!(
   doc.getElementById?.('liveCaptionToggle')?.checked||
   doc.getElementById?.('liveTranslateToggle')?.checked)&&
   doc.getElementById?.('subtitleShow')?.checked!==false;
  const notifyCC=()=>{
   try{doc.defaultView?.dispatchEvent?.(new Event('openiptv:cc-surface-changed'));}catch{}
  };
  const docPiPAvailable=()=>typeof doc.defaultView?.documentPictureInPicture?.requestWindow==='function';
  const restoreFloating=({close=true}={})=>{
   const entry=floating;
   if(!entry)return false;
   floating=null;
   // Reattach the SAME video/decoder without changing its media source.
   try{
    if(entry.next?.parentNode===entry.parent)entry.parent.insertBefore(video,entry.next);
    else entry.parent.appendChild(video);
   }catch{try{entry.parent.appendChild(video);}catch{}}
   notifyCC();
   if(close){try{if(!entry.win.closed)entry.win.close();}catch{}}
   reason='';
   return true;
  };
  const attachFloating=win=>{
   if(!win?.document?.body||!video?.parentNode)throw Error('Cửa sổ PiP không sẵn sàng');
   const pipDoc=win.document,homeParent=video.parentNode,homeNext=video.nextSibling;
   const style=pipDoc.createElement('style');
   style.textContent=[
    'html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000;}',
    '#openiptv-cc-pip-surface{position:relative;width:100vw;height:100vh;overflow:hidden;background:#000;}',
    '#openiptv-cc-pip-surface>video{display:block;width:100%;height:100%;object-fit:contain;background:#000;}',
    '#openiptv-cc-pip-surface>.openiptv-video-translation-overlay{',
    'display:flex!important;flex-direction:column!important;position:absolute!important;',
    'z-index:80;left:3%;right:3%;bottom:4%;max-width:94%;',
    'justify-content:center;align-items:center;text-align:center;',
    'color:#fff;white-space:pre-wrap;overflow-wrap:anywhere;pointer-events:none;',
    'font-weight:650;line-height:1.32;box-sizing:border-box;}',
    '#openiptv-cc-pip-surface>.openiptv-video-translation-overlay[hidden]{display:none!important}',
    '#openiptv-cc-pip-surface>.openiptv-video-translation-overlay>span{',
    'display:block;max-width:100%;white-space:pre-wrap;overflow-wrap:anywhere;}'
   ].join('');
   (pipDoc.head||pipDoc.documentElement).appendChild(style);
   const holder=pipDoc.createElement('div');holder.id='openiptv-cc-pip-surface';
   pipDoc.body.appendChild(holder);
   try{holder.appendChild(video);}
   catch(error){
    try{homeParent.insertBefore(video,homeNext);}catch{}
    throw error;
   }
   floating={win,parent:homeParent,next:homeNext};
   win.addEventListener?.('pagehide',()=>{
    if(floating?.win===win)restoreFloating({close:false});
   });
   win.addEventListener?.('resize',notifyCC);
   notifyCC();
   return true;
  };
  const requestNativePiP=()=>{
   if(doc.pictureInPictureEnabled&&typeof video.requestPictureInPicture==='function')
    return video.requestPictureInPicture();
   if(typeof video.webkitSetPresentationMode==='function'){
    video.webkitSetPresentationMode('picture-in-picture');return true;
   }
   throw Error('Trình phát hiện tại không hỗ trợ PiP');
  };
  function nativeExit(){
   if(floating)return Promise.resolve(restoreFloating());
   if(!inPiP())return Promise.resolve(false);
   try{
    if(doc.pictureInPictureElement===video&&typeof doc.exitPictureInPicture==='function')
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
   // Standard video PiP does not include DOM captions. Document PiP moves
   // the ONE original player into a small window with its subtitle overlay.
   let usesDocument=captionsRequested()&&docPiPAvailable(),result;
   try{
    result=usesDocument
     ?doc.defaultView.documentPictureInPicture.requestWindow({
       width:Math.min(720,Math.max(360,Math.round(video.clientWidth||480))),
       height:Math.min(480,Math.max(220,Math.round(video.clientHeight||270)))
      })
     :requestNativePiP();
   }catch(error){
    if(usesDocument){
     usesDocument=false;
     try{result=requestNativePiP();}
     catch(fallbackError){
      if(!quiet)notify('PiP: '+String(fallbackError.message||fallbackError),'warn');
      return Promise.resolve(false);
     }
    }else{
     if(!quiet)notify('PiP: '+String(error.message||error),'warn');
     return Promise.resolve(false);
    }
   }
   const job=Promise.resolve(result).then(async opened=>{
    if(ticket!==sequence || (kind==='navigation'&&getPage()==='tv')){
     if(usesDocument)try{opened?.close?.();}catch{}
     else await nativeExit().catch(()=>{});
     return false;
    }
    if(usesDocument)attachFloating(opened);
    reason=kind;notifyCC();
    return inPiP();
   }).catch(async error=>{
    if(usesDocument&&ticket===sequence){
     // Unsupported Document PiP must not break the already-working native PiP.
     try{await requestNativePiP();reason=kind;notifyCC();return inPiP();}
     catch(fallbackError){error=fallbackError;}
    }
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
  video?.addEventListener?.('enterpictureinpicture',notifyCC);
  video?.addEventListener?.('leavepictureinpicture',()=>{reason='';notifyCC();});
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
