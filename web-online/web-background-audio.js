'use strict';
/* Web-only lock-screen controls: Android Chrome/Edge and compatible Safari.
 * Playback continues through the SAME #video element. No silent audio loops,
 * wake locks, duplicate streams, or attempts to override OS background policy. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document){
  const boot=()=>api.install({win:root,doc:root.document,nav:root.navigator});
  if(root.document.readyState==='loading')
   root.document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
 }
})(typeof window!=='undefined'?window:null,function(){
 const ACTIONS=['play','pause','stop','previoustrack','nexttrack'];
 const shortText=(v,fallback)=>String(v==null?'':v).trim().slice(0,160)||fallback;
 function metadataFor(channel){
  if(!channel||typeof channel!=='object')return null;
  return {title:shortText(channel.name,'Kênh IPTV'),
   artist:shortText(channel.group,'Open IPTV Pro'),album:'Open IPTV Pro',
   artwork:[{src:'assets/icon.png',sizes:'512x512',type:'image/png'}]};
 }
 function install({win,doc,nav}={}){
  if(!doc||!nav||win?.streamleaf)return null;
  const app=win?.IPTVState,video=doc.getElementById?.('video'),
   toggle=doc.getElementById?.('webBackgroundAudio'),
   label=doc.getElementById?.('webBackgroundAudioStatus');
  if(!app?.getStore||!app?.getCurrent||!video||!toggle)return null;
  const store=app.getStore();
  if(!store||typeof store!=='object')return null;
  const session=nav.mediaSession||null;
  const enabled=()=>store.backgroundAudioEnabled!==false;
  const notify=s=>{if(label)label.textContent=s;};
  let ownsAudioSession=false,installed=false,lastTitle='';
  const applyAudioType=()=>{
   if(!enabled()||!app.getCurrent?.())return;
   if(!nav.audioSession)return;
   try{
    nav.audioSession.type='playback';
    ownsAudioSession=nav.audioSession.type==='playback';
   }catch{} // Optional experimental Safari API; never break playback.
  };
  const releaseAudioType=()=>{
   if(!ownsAudioSession)return;
   try{if(nav.audioSession?.type==='playback')nav.audioSession.type='auto';}catch{}
   ownsAudioSession=false;
  };
  const safeAction=(action,handler)=>{
   if(typeof session?.setActionHandler!=='function')return;
   try{session.setActionHandler(action,handler);}catch{} // NotSupportedError varies by browser.
  };
  const setPlaybackState=()=>{
   if(!enabled()||!session)return;
   try{session.playbackState=app.getCurrent?.()?(video.paused?'paused':'playing'):'none';}catch{}
  };
  const doPlay=()=>{
   if(!enabled()||!app.getCurrent?.())return;
   applyAudioType();
   try{
    const promise=video.play();
    promise?.catch?.(()=>notify('Trình duyệt yêu cầu mở trang và nhấn Phát trước khi nghe khi khóa màn hình.'));
   }catch{notify('Không thể phát từ màn hình khóa. Hãy mở trình duyệt để phát.');}
  };
  const clickControl=id=>{
   if(!enabled()||!app.getCurrent?.())return;
   doc.getElementById?.(id)?.click?.();
  };
  function clearSession(){
   if(installed){for(const action of ACTIONS)safeAction(action,null);}
   installed=false;lastTitle='';
   if(session){
    try{session.metadata=null;session.playbackState='none';}catch{}
   }
   releaseAudioType();
  }
  function register(){
   if(installed||!session)return;
   safeAction('play',doPlay);
   safeAction('pause',()=>{if(enabled())video.pause?.();});
   safeAction('stop',()=>clickControl('stopBtn'));
   safeAction('previoustrack',()=>clickControl('prevBtn'));
   safeAction('nexttrack',()=>clickControl('nextBtn'));
   installed=true;
  }
  function sync(){
   if(!enabled()){clearSession();return;}
   const channel=app.getCurrent?.();
   if(!channel){clearSession();return;}
   register();
   const data=metadataFor(channel);
   // Metadata is rebuilt only when channel changes; never expose M3U links.
   const key=channel.id+'|'+data.title+'|'+data.artist;
   if(session&&key!==lastTitle){
    try{
     if(typeof win.MediaMetadata==='function')
      session.metadata=new win.MediaMetadata(data);
     else session.metadata=data;
     lastTitle=key;
    }catch{lastTitle='';}
   }
   if(!video.paused)applyAudioType();
   setPlaybackState();
  }
  toggle.checked=enabled();
  toggle.addEventListener('change',()=>{
   const before=store.backgroundAudioEnabled;
   store.backgroundAudioEnabled=!!toggle.checked;
   if(app.save?.()===false){
    store.backgroundAudioEnabled=before;
    toggle.checked=enabled();
    notify('Không lưu được cài đặt; vui lòng kiểm tra bộ nhớ trình duyệt.');
    return;
   }
   sync();
   status();
  });
  function status(){
   if(!enabled()){
    notify('Đã tắt điều khiển màn hình khóa. Việc phát nhạc nền vẫn do trình duyệt quyết định.');
   }else if(session){
    notify('Đã bật. Hãy bắt đầu phát kênh có tiếng rồi khóa màn hình. Có thể điều khiển từ màn hình khóa/thông báo media nếu trình duyệt cho phép.');
   }else{
    notify('Trình duyệt này không có Media Session; có thể phát tiếng nền theo khả năng của hệ điều hành, nhưng không bảo đảm nút khóa màn hình.');
   }
  }
  video.addEventListener?.('play',sync);
  video.addEventListener?.('playing',sync);
  video.addEventListener?.('pause',sync);
  video.addEventListener?.('ended',sync);
  // The player emits this AFTER changing the selected channel and after Stop.
  doc.addEventListener?.('openiptv:media-info',sync);
  // Never force video.pause() or reload HLS when the screen locks or tab hides.
  doc.addEventListener?.('visibilitychange',sync);
  win.addEventListener?.('pageshow',sync);
  status();sync();
  return Object.freeze({sync,clearSession,doPlay});
 }
 return Object.freeze({metadataFor,install});
});
