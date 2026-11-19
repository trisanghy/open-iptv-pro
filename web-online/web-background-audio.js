'use strict';
/* Web-only: lock-screen audio for Safari and Android Chromium browsers.
 * Dedicated foreground-started HTMLAudioElement, not a silent loop or OS bypass.
 * Never publishes stream URLs in Media Session metadata. */
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
 const txt=(value,fallback)=>String(value==null?'':value).trim().slice(0,160)||fallback;
 function metadataFor(channel){
  if(!channel||typeof channel!=='object')return null;
  return {title:txt(channel.name,'Kênh IPTV'),artist:txt(channel.group,'Open IPTV Pro'),
   album:'Open IPTV Pro',artwork:[{src:'assets/icon.png',sizes:'512x512',type:'image/png'}]};
 }
 function isAllowedStream(url,origin){
  try{
   const v=new URL(String(url||''),origin);
   return !v.username&&!v.password&&
    (v.protocol==='https:'||(v.protocol==='http:'&&origin?.startsWith('http:')));
  }catch{return false;}
 }
 function install({win,doc,nav}={}){
  if(!doc||!nav||win?.streamleaf)return null;
  const app=win?.IPTVState,video=doc.getElementById?.('video'),
   setting=doc.getElementById?.('webBackgroundAudio'),
   statusText=doc.getElementById?.('webBackgroundAudioStatus'),
   toggle=doc.getElementById?.('webBackgroundAudioToggle'),
   modeState=doc.getElementById?.('webBackgroundAudioModeStatus');
  if(!app?.getStore||!app?.getCurrent||!video||!setting)return null;
  const store=app.getStore();
  if(!store||typeof store!=='object')return null;
  const session=nav.mediaSession||null;
  const enabled=()=>store.backgroundAudioEnabled!==false;
  const say=msg=>{if(modeState)modeState.textContent=msg;};
  const info=msg=>{if(statusText)statusText.textContent=msg;};
  let audio=null,hls=null,dash=null,active=false,transition=0,streamKey='',lastTitle='',ownsAudioSession=false,installed=false;
  let pausedBeforeTransition=false,needsVideoRestore=false;
  const sourceFor=channel=>{
   if(!channel)return '';
   const select=doc.getElementById?.('manualStreamSelect');
   const possibles=[channel.url,...(Array.isArray(channel.alternates)?channel.alternates:[])];
   const selected=possibles.includes(select?.value)?select.value:null;
   const candidates=[selected,channel.lastPlayableUrl,channel.url];
   return candidates.find(url=>isAllowedStream(url,win?.location?.href||'https://localhost/'))||'';
  };
  const isHls=url=>/\.m3u8(?:$|[?#&])/i.test(url)||/[?&](?:file|url)=[^#]*\.m3u8(?:$|[&#])/i.test(url);
  const isDash=url=>/\.mpd(?:$|[?#&])/i.test(url);
  function applyAudioType(){
   if(!enabled()||!nav.audioSession)return;
   try{nav.audioSession.type='playback';ownsAudioSession=nav.audioSession.type==='playback';}catch{}
  }
  function releaseAudioType(){
   if(!ownsAudioSession)return;
   try{if(nav.audioSession?.type==='playback')nav.audioSession.type='auto';}catch{}
   ownsAudioSession=false;
  }
  function safeAction(key,fn){
   if(typeof session?.setActionHandler!=='function')return;
   try{session.setActionHandler(key,fn);}catch{}
  }
  const media=()=>active&&audio?audio:video;
  function refreshState(){
   if(!enabled())return;
   if(session)try{session.playbackState=app.getCurrent?.()?(media().paused?'paused':'playing'):'none';}catch{}
  }
  function refreshButton(){
   if(!toggle)return;
   toggle.classList.toggle('active',active);
   toggle.setAttribute('aria-pressed',String(active));
   toggle.disabled=!enabled();
   const label=active?'Quay lại xem TV':'Nghe nền · khóa màn hình';
   toggle.setAttribute('aria-label',label);
   const name=toggle.querySelector?.('.background-audio-name');
   if(name)name.textContent=active?'Xem TV':'Nghe nền';
  }
  function disposeAudio(){
   transition++;
   const node=audio;audio=null;streamKey='';
   try{hls?.destroy?.();}catch{}hls=null;
   try{dash?.reset?.();}catch{}dash=null;
   if(node){
    try{node.pause?.();node.removeAttribute?.('src');node.load?.();node.remove?.();}catch{}
   }
  }
  function deactivate(restoreVideo=false){
   const wasActive=active;
   active=false;needsVideoRestore=false;
   disposeAudio();
   refreshButton();
   if(restoreVideo&&wasActive){
    const channel=app.getCurrent?.();
    if(channel&&typeof app.playChannel==='function'){
     try{Promise.resolve(app.playChannel(channel.id)).catch(()=>say('Không thể tiếp tục hình, hãy nhấn Phát.'));}catch{}
    }else if(channel){
     try{video.play?.()?.catch?.(()=>say('Nhấn Phát để tiếp tục xem TV.'));}catch{}
    }
    say('Đã quay lại chế độ xem TV.');
   }
   refreshState();
  }
  function clearSession(){
   deactivate(false);
   if(installed){for(const action of ACTIONS)safeAction(action,null);}
   installed=false;lastTitle='';
   if(session)try{session.metadata=null;session.playbackState='none';}catch{}
   releaseAudioType();
  }
  function register(){
   if(installed||!session)return;
   safeAction('play',()=>{
    if(!enabled()||!app.getCurrent?.())return;
    applyAudioType();
    try{media().play?.()?.catch?.(()=>say('Hãy mở trình duyệt rồi nhấn Phát để tiếp tục nghe.'));}catch{}
   });
   safeAction('pause',()=>{if(enabled())media().pause?.();});
   safeAction('stop',()=>{if(enabled())doc.getElementById?.('stopBtn')?.click?.();});
   safeAction('previoustrack',()=>{if(enabled())doc.getElementById?.('prevBtn')?.click?.();});
   safeAction('nexttrack',()=>{if(enabled())doc.getElementById?.('nextBtn')?.click?.();});
   installed=true;
  }
  function sync(){
   const channel=app.getCurrent?.();
   if(!enabled()||!channel){clearSession();if(enabled())applyAudioType();return;}
   register();
   const data=metadataFor(channel),key=channel.id+'|'+data.title+'|'+data.artist;
   if(session&&key!==lastTitle){
    try{session.metadata=typeof win.MediaMetadata==='function'?new win.MediaMetadata(data):data;lastTitle=key;}catch{lastTitle='';}
   }
   if(active&&audio){
    const nextKey=channel.id+'|'+sourceFor(channel);
    if(nextKey!==streamKey){
     // Playback has changed channel via the existing app. Restart dedicated audio,
     // but do not touch the source/player when the page is hidden.
     if(doc.visibilityState!=='hidden')void activate();
     else say('Kênh mới cần mở lại trình duyệt trước khi tiếp tục nghe.');
    }
   }
   if(!media().paused)applyAudioType();
   refreshButton();refreshState();
  }
  function makeAudio(){
   const node=doc.createElement?.('audio');
   if(!node)throw Error('Trình duyệt không hỗ trợ trình phát âm thanh.');
   node.id='openIPTVBackgroundAudio';
   node.preload='auto';
   node.autoplay=false;
   node.controls=false;
   node.setAttribute?.('playsinline','');
   node.style && (node.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none');
   node.volume=video.volume??store.volume??1;
   node.muted=Boolean(video.muted);
   for(const type of ['play','playing','pause','ended']){
    node.addEventListener?.(type,()=>{
     if(active&&audio===node){
      const b=doc.getElementById?.('playBtn');
      if(b)b.textContent=node.paused?'▶':'Ⅱ';
      refreshState();
     }
    });
   }
   doc.body?.append?.(node);
   return node;
  }
  async function startAudio(node,url,token){
   const play=async()=>{
    if(token!==transition)throw Error('Đã chuyển kênh.');
    const result=node.play?.();
    if(result?.then)await result;
    if(token!==transition)throw Error('Đã chuyển kênh.');
   };
   const nativeHls=!!node.canPlayType?.('application/vnd.apple.mpegurl');
   if(isHls(url)&&!nativeHls){
    const Hls=win.Hls;
    if(!Hls?.isSupported?.())throw Error('Trình duyệt không hỗ trợ HLS âm thanh nền cho nguồn này.');
    const instance=new Hls({enableWorker:false,maxBufferLength:10,maxMaxBufferLength:20});
    hls=instance;
    let settled=false;
    await new Promise((resolve,reject)=>{
     const finish=(err)=>{
      if(settled)return;settled=true;
      if(err)reject(err);else resolve();
     };
     instance.on?.(Hls.Events?.MANIFEST_PARSED,()=>finish());
     instance.on?.(Hls.Events?.ERROR,(_event,data)=>{
      if(data?.fatal)finish(Error('HLS: '+(data.details||data.type||'không thể phát')));
     });
     try{instance.attachMedia(node);instance.loadSource(url);}catch(e){finish(e);}
     // Hls.js events normally fire quickly; never leave a pending transition forever.
     win.setTimeout?.(()=>finish(Error('Hết thời gian chờ dữ liệu HLS.')),10000);
    });
    await play();
    return;
   }
   if(isDash(url)){
    if(!win.dashjs?.MediaPlayer)throw Error('Nguồn DASH này không hỗ trợ nghe nền trên trình duyệt.');
    dash=win.dashjs.MediaPlayer().create();dash.initialize(node,url,false);
    await play();
    return;
   }
   node.src=url;node.load?.();
   await play();
  }
  async function activate(){
   if(!enabled()){say('Bật Âm thanh khi khóa màn hình trong Cài đặt trước.');return false;}
   const channel=app.getCurrent?.();
   if(!channel){say('Hãy phát một kênh có tiếng trước khi bật Nghe nền.');return false;}
   const url=sourceFor(channel);
   if(!url){say('Không tìm thấy link phát HLS/HTTPS thích hợp để nghe nền.');return false;}
   // Prepare from a user gesture in the visible tab; background-starting fresh
   // streams is forbidden or unreliable on iOS/Android.
   if(doc.visibilityState==='hidden'){say('Mở lại trình duyệt để bắt đầu chế độ nghe nền.');return false;}
   if(active&&streamKey===channel.id+'|'+url&&audio)return true;
   const priorActive=active;
   pausedBeforeTransition=Boolean(video.paused);
   disposeAudio();
   const token=transition;
   active=true;needsVideoRestore=!priorActive;
   streamKey=channel.id+'|'+url;
   refreshButton();applyAudioType();
   try{
    audio=makeAudio();
    // Only one audible media at a time. The video stays available for returning
    // to TV, but does not continuously decode or play while audio mode is active.
    video.pause?.();
    await startAudio(audio,url,token);
    if(token!==transition)return false;
    say('Đang nghe nền · có thể khóa màn hình. Nhấn Xem TV để trở lại hình ảnh.');
    refreshState();
    return true;
   }catch(e){
    if(token!==transition)return false;
    const error=String(e?.message||e||'không rõ').slice(0,180);
    const restoreVideo=needsVideoRestore&&!pausedBeforeTransition;
    active=false;disposeAudio();refreshButton();
    say('Không bật được Nghe nền: '+error+'. Hãy thử kênh khác hoặc nhấn Phát.');
    if(restoreVideo){
     try{video.play?.()?.catch?.(()=>{});}catch{}
    }
    refreshState();
    return false;
   }
  }
  function toggleMode(){
   if(active)deactivate(true);
   else void activate();
  }
  setting.checked=enabled();
  setting.addEventListener('change',()=>{
   const old=store.backgroundAudioEnabled;
   store.backgroundAudioEnabled=!!setting.checked;
   if(app.save?.()===false){
    store.backgroundAudioEnabled=old;setting.checked=enabled();
    info('Không lưu được cài đặt; hãy kiểm tra dung lượng trình duyệt.');return;
   }
   if(!enabled()){clearSession();info('Đã tắt chế độ nghe nền và điều khiển màn hình khóa.');}
   else{applyAudioType();sync();info('Đã bật. Khi đang xem, nhấn Nghe nền rồi khóa màn hình.');}
   refreshButton();
  });
  toggle?.addEventListener('click',toggleMode);
  const playButton=doc.getElementById?.('playBtn');
  playButton?.addEventListener?.('click',event=>{
   if(!active)return;
   event.preventDefault?.();event.stopImmediatePropagation?.();
   if(audio?.paused)audio.play?.()?.catch?.(()=>say('Mở lại trang để phát tiếng.'));
   else audio?.pause?.();
  },true);
  for(const type of ['play','playing','pause','ended']){
   video.addEventListener?.(type,()=>{
    if(active&&type==='play'){video.pause?.();return;}
    if(!active)sync();
   });
  }
  doc.addEventListener?.('openiptv:media-info',sync);
  doc.addEventListener?.('visibilitychange',()=>{
   // Never start/stop media just because the screen locked.
   if(doc.visibilityState!=='hidden')sync();
  });
  win.addEventListener?.('pageshow',sync);
  // Safari needs the playback audio session type set early, before interruptions.
  if(enabled())applyAudioType();
  info(!enabled()?'Đã tắt nghe nền.':session?'Đã bật. Nhấn Nghe nền khi đang xem TV, sau đó mới khóa màn hình. Trình duyệt/nguồn IPTV có thể giới hạn phát nền.':'Trình duyệt này không có Media Session; nút màn hình khóa có thể không hoạt động, nhưng vẫn có thể thử Nghe nền.');
  refreshButton();sync();
  return Object.freeze({sync,clearSession,activate,deactivate,get active(){return active;}});
 }
 return Object.freeze({metadataFor,isAllowedStream,install});
});
