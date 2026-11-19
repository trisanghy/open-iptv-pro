// Saved opt-in for automatic Picture-in-Picture. Never starts a stream by itself.
// Android: the Activity owns the PiP lifecycle, so no JS calls are made after the app is stopped.
// iOS: WebKit may reject automatic PiP without user activation or system PiP enabled.
import {Capacitor, registerPlugin} from '@capacitor/core';

export const AUTO_PIP_SETTING='autoPiPOnBackground';
export function shouldArmAutoPiP(settings,playing,nativeFullscreen=false){
 return settings?.[AUTO_PIP_SETTING]===true&&playing===true&&!nativeFullscreen;
}
export function initialAutoPiPEnabled(settings){return settings?.[AUTO_PIP_SETTING]===true;}

const androidPiP = Capacitor.getPlatform()==='android'
 ? registerPlugin('OpenIPTVAutoPiP') : null;

export function createAutoPiPController({getVideo,getSettings,isPlaying,isNativeFullscreen,onWarning=()=>{}}){
 const platform=Capacitor.getPlatform();
 let lastAndroidConfig='',autoEnteredIOS=false,inFlight=Promise.resolve();

 async function sync(){
   const armed=shouldArmAutoPiP(getSettings(),isPlaying(),isNativeFullscreen());
   if(platform==='android'&&androidPiP){
     const key=armed?'1':'0';
     if(key===lastAndroidConfig)return;
     // Queue native calls so a stale "playing" notification cannot re-arm after Pause.
     inFlight=inFlight.catch(()=>{}).then(async()=>{
       const actual=shouldArmAutoPiP(getSettings(),isPlaying(),isNativeFullscreen());
       const result=await androidPiP.configure({enabled:initialAutoPiPEnabled(getSettings()),playing:actual});
       lastAndroidConfig=actual?'1':'0';
       if(result?.supported===false&&actual)onWarning('Máy Android không hỗ trợ PiP tự động.');
     });
     await inFlight.catch(e=>{lastAndroidConfig='';onWarning('Không cấu hình được PiP Android: '+(e?.message||e));});
   }
   if(platform==='ios'&&!armed&&autoEnteredIOS)restoreIOS();
 }
 function restoreIOS(){
   if(platform!=='ios'||!autoEnteredIOS)return;
   const video=getVideo();
   autoEnteredIOS=false;
   try{
     if(typeof video?.webkitSetPresentationMode==='function'&&video.webkitPresentationMode==='picture-in-picture')
        video.webkitSetPresentationMode('inline');
     else if(document.pictureInPictureElement===video&&document.exitPictureInPicture)
        document.exitPictureInPicture().catch(()=>{});
   }catch(e){onWarning('Không thể khôi phục PiP iOS: '+(e?.message||e));}
 }
 async function onBackground(){
   if(platform!=='ios'||!shouldArmAutoPiP(getSettings(),isPlaying(),isNativeFullscreen()))return;
   const video=getVideo();
   if(!video||video.paused)return;
   try{
     if(typeof video.webkitSupportsPresentationMode==='function'
        &&video.webkitSupportsPresentationMode('picture-in-picture')
        &&typeof video.webkitSetPresentationMode==='function'){
       video.webkitSetPresentationMode('picture-in-picture');
       autoEnteredIOS=video.webkitPresentationMode==='picture-in-picture';
     }else if(document.pictureInPictureEnabled&&typeof video.requestPictureInPicture==='function'){
       await video.requestPictureInPicture();autoEnteredIOS=true;
     }else onWarning('iOS/WebKit không hỗ trợ tự chuyển PiP cho nguồn video này.');
   }catch(e){
     onWarning('iOS không cho phép tự mở PiP: '+(e?.message||e));
   }
 }
 function onForeground(){restoreIOS();void sync();}
 function visibility(){
   if(document.visibilityState==='hidden')void onBackground();
   else onForeground();
 }
 if(platform==='ios'){
   document.addEventListener('visibilitychange',visibility);
   window.addEventListener('pagehide',onBackground);
   window.addEventListener('pageshow',onForeground);
 }
 if(platform==='android'){
   window.addEventListener('openiptv:pipchange',event=>{
     // PiP enter/exit UI is driven natively by Android's Activity callback.
     if(event.detail?.active===false)void sync();
   });
 }
 void sync();
 return {sync,restoreIOS,onBackground,onForeground};
}
