'use strict';
// v23.8.13: native Picture-in-Picture, with Tauri floating Mini Player fallback.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.bootstrap(root);
})(typeof window!=='undefined'?window:null,function(){
 const KEYS=Object.freeze({navigate:'openiptv-pip-on-navigation-v1',minimize:'openiptv-pip-on-minimize-v1',blur:'openiptv-pip-on-blur-v1'});
 function createController({video,doc,storage,getPage,notify=()=>{},bridge=null,getStream=()=>null}){
  let pending=null,sequence=0,reason='',mini=false,miniId='',pausedByMini=false;
  const getOption=type=>{
   const value=storage?.getItem(KEYS[type]);return value==null?type==='navigate':value==='true';
  };
  const setOption=(type,value)=>{
   if(!Object.hasOwn(KEYS,type))throw Error('Unknown PiP setting');
   storage?.setItem(KEYS[type],String(!!value));
  };
  const nativeActive=()=>!!video&&(doc.pictureInPictureElement===video||video.webkitPresentationMode==='picture-in-picture');
  const inPiP=()=>nativeActive()||mini;
  const eligible=()=>video&&video.readyState>=2&&!video.paused&&!video.ended;
  async function nativeExit(){
   if(!nativeActive())return false;
   if(doc.pictureInPictureElement===video&&doc.exitPictureInPicture){await doc.exitPictureInPicture();return true;}
   if(video.webkitSetPresentationMode){video.webkitSetPresentationMode('inline');return true;}
   return false;
  }
  async function fallback(kind){
   if(!bridge?.pipOpen)throw Error('Trình phát không hỗ trợ cửa sổ nổi');
   const s=getStream(),url=String(s?.url||'');
   if(!/^https?:\/\//i.test(url))throw Error('Không có URL kênh để mở Mini Player');
   const opened=await bridge.pipOpen({url,title:s.title,volume:video.volume,muted:video.muted,position:video.currentTime,kind});
   if(!opened?.opened)throw Error('Không tạo được cửa sổ Mini Player');
   mini=true;miniId=String(opened.id||'');reason=kind;return true;
  }
  async function nativeEnter(kind){
   if(doc.pictureInPictureEnabled&&typeof video.requestPictureInPicture==='function')
    await video.requestPictureInPicture();
   else if(typeof video.webkitSetPresentationMode==='function')video.webkitSetPresentationMode('picture-in-picture');
   else throw Error('WebView không hỗ trợ PiP gốc');
   if(!nativeActive())throw Error('WebView từ chối PiP');
   reason=kind;return true;
  }
  async function enter(kind,{quiet=true}={}){
   if(inPiP())return true;
   if(!eligible())return false;
   if(pending)return pending;
   const ticket=++sequence;
   const job=(async()=>{
    try{
     if(kind==='manual'){try{await nativeEnter(kind);}catch{await fallback(kind);}}
     else if(bridge?.pipOpen)await fallback(kind);else await nativeEnter(kind);
     if(ticket!==sequence||(kind==='navigation'&&getPage()==='tv')){
      await exit();return false;
     }
     return inPiP();
    }catch(error){if(!quiet)notify('PiP: '+String(error.message||error),'warn');return false;}
   })();
   pending=job;void job.finally(()=>{if(pending===job)pending=null;});
   return job;
  }
  async function exit({quiet=true}={}){
   ++sequence;
   try{if(mini&&bridge?.pipClose){await bridge.pipClose();return true;}return await nativeExit();}
   catch(error){if(!quiet)notify('PiP: '+String(error.message||error),'warn');return false;}
  }
  const manual=()=>inPiP()?exit({quiet:false}):enter('manual',{quiet:false});
  const onPageChange=(next,last)=>{
   if(next==='tv'){if(inPiP())void exit();else resume();return;}
   if(last==='tv'&&getOption('navigate'))void enter('navigation');
  };
  function resume(){
   if(!pausedByMini||mini||getPage()!=='tv'||doc.visibilityState==='hidden')return;
   pausedByMini=false;
   if(video.paused)void video.play().catch(error=>notify('Phát lại video: '+error.message,'warn'));
  }
  function onNativeEvent(type){
   if(type==='focus'){if(getPage()==='tv'&&reason==='background')return exit();resume();return Promise.resolve(false);}
   if(mini||pending)return Promise.resolve(false);
   if(type==='minimize'&&getOption('minimize'))return enter('background');
   if(type==='blur'&&getOption('blur'))return enter('background');
   return Promise.resolve(false);
  }
  function onMiniEvent(event){
   if(!event)return;
   if(event.type==='playing'&&mini&&event.id===miniId){
    if(!video.paused){pausedByMini=true;video.pause();}
   }else if(event.type==='failed'&&mini&&event.id===miniId)notify('Mini Player: '+(event.message||'Không phát được'),'warn');
   else if(event.type==='closed'){mini=false;miniId='';reason='';resume();}
  }
  video?.addEventListener?.('leavepictureinpicture',()=>{reason='';});
  return Object.freeze({enter,exit,manual,onPageChange,onNativeEvent,onMiniEvent,
   getOption,setOption,inPiP,hasPending:()=>!!pending});
 }
 function bootstrap(win){
  const doc=win.document,video=doc.getElementById('video');
  if(!video||win.OpenIPTVAutoPiP)return;
  const ctx=()=>win.IPTVState;
  const ctrl=createController({video,doc,storage:win.localStorage,
   getPage:()=>doc.getElementById('page-tv')?.classList.contains('active-page')?'tv':'other',
   notify:(msg,kind)=>ctx()?.toast?.(msg,kind),
   bridge:win.streamleaf?.pipOpen?win.streamleaf:null,
   getStream:()=>{const ch=ctx()?.getCurrent?.();return {url:ctx()?.getActiveStreamURL?.()||ch?.url||'',title:ch?.name||'Open IPTV Pro'};}
  });
  for(const key of Object.keys(KEYS)){
   const box=doc.getElementById('pipAuto'+key[0].toUpperCase()+key.slice(1));
   if(!box)continue;box.checked=ctrl.getOption(key);
   box.addEventListener('change',()=>{
    ctrl.setOption(key,box.checked);
    const status=doc.getElementById('pipAutoStatus');
    if(status)status.textContent='Đã lưu thiết lập PiP tự động.';
   });
  }
  if(typeof win.__TAURI__?.event?.listen==='function')
   void Promise.resolve(win.__TAURI__.event.listen('pip:event',ev=>ctrl.onMiniEvent(ev.payload)))
    .catch(error=>console.warn('PiP event subscription:',error));
  win.OpenIPTVAutoPiP=ctrl;
 }
 return {createController,bootstrap,KEYS};
});
