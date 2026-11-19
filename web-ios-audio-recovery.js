'use strict';
/* Safari/Chrome iOS: preserve ONE sound-permission banner above the video.
 * It appears only after a confirmed autoplay policy restriction. */
(function(root){
 if(!root?.document||root.streamleaf)return;
 const doc=root.document;
 const chromeIOS=/CriOS\/\d+/i.test(String(root.navigator?.userAgent||''))&&/iPhone|iPad|iPod/i.test(String(root.navigator?.userAgent||''));
 function init(){
  // Remove stale lower unmute actions left by earlier iPhone scripts.
  doc.getElementById?.('webUnmuteAssist')?.remove?.();
  doc.getElementById?.('web-resume-panel')?.remove?.();
  doc.querySelectorAll?.('#page-tv .web-unmute-assist,#page-tv .web-unmute-assist-chrome-ios')?.forEach(node=>node.remove?.());
  // Never duplicate the requested top banner on repeated script execution.
  if(doc.getElementById?.('webAudioPermissionBanner'))return;
  const video=doc.getElementById?.('video'),mute=doc.getElementById?.('webVolumeMute'),box=doc.getElementById?.('playerBox');
  if(!video||!mute||!box)return;
  const banner=doc.createElement('div'),message=doc.createElement('span'),button=doc.createElement('button');
  banner.id='webAudioPermissionBanner';banner.className='web-audio-permission-banner';
  banner.hidden=true;banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');
  message.textContent='Trình duyệt yêu cầu thao tác để phát có tiếng.';
  button.type='button';button.textContent='Bật âm thanh';
  button.setAttribute('aria-label','Bật tiếng cho kênh đang phát');
  banner.append(message,button);box.append(banner);
  let needsGesture=false;
  const source=()=>String(video.currentSrc||video.src||'');
  function refresh(){
   const wantAudio=root.IPTVState?.getStore?.()?.autoEnableAudio!==false;
   // Do not dismiss on paused=false alone: a rejected Safari play() can
   // leave that flag stale even though audible playback never started.
   banner.hidden=!(needsGesture&&wantAudio&&!root.OpenIPTVBackgroundAudio?.active&&!!source());
  }
  function retrySound(){
   if(!source())return;
   try{video.defaultMuted=false;video.muted=false;}catch{}
   let p;
   try{p=video.play();}catch{needsGesture=true;refresh();return;}
   p?.then?.(()=>{needsGesture=!!video.paused||!!video.muted;refresh()},()=>{needsGesture=true;refresh()});
   refresh();
  }
  button.addEventListener('click',retrySound);
  // The normal toolbar volume button remains available. Chrome iOS must
  // resume native HLS in the SAME user gesture as unmute.
  if(chromeIOS)mute.addEventListener('click',()=>{
   if(video.muted||!source())return;
   let p;try{p=video.play()}catch{return}
   p?.catch?.(()=>{
    const status=doc.getElementById?.('streamInfo');
    if(status&&video.paused)status.textContent='Nhấn Phát để tiếp tục';
   });
  });
  function restricted(event){
   const id=event?.detail?.channelId;
   if(id&&id!==root.IPTVState?.getCurrent?.()?.id)return;
   needsGesture=true;refresh();
  }
  doc.addEventListener('openiptv:autoplay-muted',restricted);
  doc.addEventListener('openiptv:autoplay-blocked',restricted);
  doc.addEventListener('openiptv:media-info',()=>{needsGesture=false;refresh()});
  video.addEventListener('playing',()=>{
   if(!video.muted&&!video.paused&&Number(video.volume)!==0)needsGesture=false;
   refresh();
  });
  for(const type of ['volumechange','emptied'])video.addEventListener(type,refresh);
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window==='undefined'?null:window);
