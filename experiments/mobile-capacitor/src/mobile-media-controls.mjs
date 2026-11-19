// User-gesture-only media output actions for iOS WKWebView, Safari and Android.
// No pretend Chromecast scanning: on Android the native player owns the Cast button.
export function isMuted(video){return !!video&&(!!video.muted||Number(video.volume)===0);}
export function pipSupported(video,documentRef=globalThis.document){
 if(!video)return false;
 if(documentRef?.pictureInPictureEnabled && typeof video.requestPictureInPicture==='function')return true;
 return typeof video.webkitSupportsPresentationMode==='function'
   &&video.webkitSupportsPresentationMode('picture-in-picture')
   &&typeof video.webkitSetPresentationMode==='function';
}
export async function togglePiP(video,documentRef=globalThis.document){
 if(!video||!video.currentSrc||video.paused)throw Error('Hãy phát kênh trước khi dùng PiP');
 if(documentRef?.pictureInPictureElement===video){
   await documentRef.exitPictureInPicture();return 'inline';
 }
 if(video.webkitPresentationMode==='picture-in-picture'){
   video.webkitSetPresentationMode('inline');return 'inline';
 }
 if(!pipSupported(video,documentRef))throw Error('Thiết bị hoặc nguồn IPTV hiện tại không hỗ trợ PiP');
 if(documentRef?.pictureInPictureEnabled && typeof video.requestPictureInPicture==='function'){
   await video.requestPictureInPicture();return 'pip';
 }
 video.webkitSetPresentationMode('picture-in-picture');return 'pip';
}
export async function chooseCast(video,{isIOS=false,isAndroidNative=false,openAndroidNativeCast=()=>{},onUnavailable=()=>{}}={}){
 if(!video||!video.currentSrc)throw Error('Chọn và phát một kênh trước khi dùng Cast / AirPlay');
 // MUST run within the user's direct tap; do not defer behind a network request.
 if(isIOS){
   if(typeof video.webkitShowPlaybackTargetPicker==='function'){
     video.setAttribute('x-webkit-airplay','allow');
     video.webkitShowPlaybackTargetPicker();return 'airplay';
   }
   if(typeof video.remote?.prompt==='function'){
     await video.remote.prompt();return 'remote';
   }
   onUnavailable('WebKit chưa cung cấp bộ chọn AirPlay. Hãy mở trong Safari hoặc dùng Phản chiếu màn hình.');
   return 'unavailable';
 }
 if(isAndroidNative){await openAndroidNativeCast();return 'native';}
 if(typeof video.remote?.prompt==='function'){await video.remote.prompt();return 'remote';}
 onUnavailable('Trình duyệt không hỗ trợ Cast trực tiếp cho video này.');
 return 'unavailable';
}
