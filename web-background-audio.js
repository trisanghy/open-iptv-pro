'use strict';
/* Web-only: lock-screen audio for Safari and Android Chromium browsers.
 * Dedicated foreground-started HTMLAudioElement, not a silent loop or OS bypass.
 * Never publishes stream URLs in Media Session metadata. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document){
  const boot=()=>{
   const controller=api.install({win:root,doc:root.document,nav:root.navigator});
   if(controller)root.OpenIPTVBackgroundAudio=controller;
  };
  if(root.document.readyState==='loading')
   root.document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
 }
})(typeof window!=='undefined'?window:null,function(){
 const ACTIONS=['play','pause','stop','previoustrack','nexttrack'];
 const txt=(value,fallback)=>String(value==null?'':value).trim().slice(0,160)||fallback;
 const ICON_ART={src:'assets/icon.png',sizes:'512x512',type:'image/png'};
 // Web snapshots are keyed by channel URL, logos are parsed from the M3U.
 function imageArt(raw){
  if(typeof raw!=='string'||!raw)return null;
  const src=raw.trim();
  if(src.length>3000000)return null;
  const encoded=/^data:image\/(jpeg|png|webp);base64,([a-z0-9+/]+={0,2})$/i.exec(src);
  if(encoded)return {src,type:'image/'+encoded[1].toLowerCase()};
  try{
   const url=new URL(src);
   if(url.protocol!=='https:'||url.username||url.password)return null;
   const ext=url.pathname.match(/\.(png|jpe?g|webp)$/i)?.[1]?.toLowerCase();
   const type=ext?'image/'+(ext==='jpg'?'jpeg':ext):null;
   return type?{src:url.href,type}:{src:url.href};
  }catch{return null;}
 }
 function artworkCandidates(channel,store){
  if(!channel)return [ICON_ART];
  const shots=store?.snapshots||{};
  const snap=shots[channel.url]||shots[channel.lastPlayableUrl];
  const images=[snap?.data,snap?.thumbnail,snap?.thumb,channel.thumbnail,channel.thumb,channel.logo];
  const artwork=[],seen=new Set();
  for(const raw of images){
   const art=imageArt(raw);
   if(art&&!seen.has(art.src)){seen.add(art.src);artwork.push(art);}
  }
  artwork.push(ICON_ART);
  return artwork;
 }
 function metadataFor(channel,store){
  if(!channel||typeof channel!=='object')return null;
  return {title:txt(channel.name,'Kênh IPTV'),artist:txt(channel.group,'Open IPTV Pro'),
   album:'Open IPTV Pro',artwork:[artworkCandidates(channel,store)[0]]};
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
  let audio=null,hls=null,dash=null,active=false,transition=0,streamKey='',lastTitle='',lastArtworkRequest='',artworkRevision=0,ownsAudioSession=false,installed=false;
  let pausedBeforeTransition=false,needsVideoRestore=false,retuning=false,lastRescue=null;
  let metadataRevision=0;
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
   const now=media(),playing=!!app.getCurrent?.()&&!!now&&!now.paused&&!now.ended;
   if(active&&audio){
    const label=playing?'Tạm dừng âm thanh':'Phát âm thanh';
    for(const id of ['playBtn','fsPlay']){
     const button=doc.getElementById?.(id);
     if(!button)continue;
     // The SVG/CSS pseudo-icons use data-iptv-playing, not textContent.
     // The audio element is now the single source of truth.
     if(button.dataset)button.dataset.iptvPlaying=String(playing);
     button.textContent=playing?'Ⅱ':'▶';
     button.setAttribute?.('aria-label',label);
     button.title=label;
    }
    const note=doc.getElementById?.('streamInfo');
    if(note)note.textContent=playing?'● Đang nghe nền':'● Nghe nền đang tạm dừng';
   }
   // Re-render vector icons on every background audio transition,
   // including deactivation, when ownership returns to the video player.
   win.OpenIPTVPlayerIcons?.sync?.();
   if(session)try{session.playbackState=app.getCurrent?.()?(playing?'playing':'paused'):'none';}catch{}
  }
  function refreshButton(){
   if(!toggle)return;
   toggle.classList.toggle('active',active);
   toggle.setAttribute('aria-pressed',String(active));
   toggle.disabled=!enabled();
   const label=active?'Quay lại xem TV':'Nghe nền · khóa màn hình';
   toggle.setAttribute('aria-label',label);
   toggle.title=label;
   const name=toggle.querySelector?.('.background-audio-name');
   if(name)name.textContent=active?'Xem TV':'Nghe nền';
  }
  function disposeAudio(){
   transition++;
   retuning=false;lastRescue=null;
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
   if(installed){
    for(const action of ACTIONS)safeAction(action,null);
    for(const action of ['seekbackward','seekforward','seekto'])safeAction(action,null);
   }
   installed=false;lastTitle='';lastArtworkRequest='';artworkRevision++;
   if(session)try{session.metadata=null;session.playbackState='none';}catch{}
   releaseAudioType();
  }
  function togglePlayback(force){
   if(!enabled()||!app.getCurrent?.())return false;
   const node=media();
   if(!node)return false;
   const play=typeof force==='boolean'?force:!!node.paused;
   if(!play){try{node.pause?.();}catch{}refreshState();return true;}
   applyAudioType();
   try{
    const task=node.play?.();
    task?.then?.(()=>refreshState(),()=>say('Nhấn Phát trong trình duyệt để tiếp tục nghe.'));
    task?.catch?.(()=>say('Nhấn Phát trong trình duyệt để tiếp tục nghe.'));
    refreshState();
   }catch{say('Không thể phát từ màn hình khóa. Hãy mở trình duyệt.');}
   return true;
  }
  function allowedLinks(channel){
   const list=typeof app.getAudioLinks==='function'?app.getAudioLinks(channel):[channel?.url,...(Array.isArray(channel?.alternates)?channel.alternates:[])];
   const urls=[...(Array.isArray(list)?list:[])].filter(url=>isAllowedStream(url,win?.location?.href||'https://localhost/'));
   return [...new Set(urls)];
  }
  async function retune(node,url,token){
   // A resolved play() is not evidence of a decodable stream. Verify the
   // 'playing' signal, and fail cleanly on media error or a bounded timeout.
   let timer=null,onPlaying,onError,settled=false;
   const ready=new Promise((resolve,reject)=>{
    const complete=error=>{
     if(settled)return;
     settled=true;
     if(timer!==null)win.clearTimeout?.(timer);
     node.removeEventListener?.('playing',onPlaying);
     node.removeEventListener?.('error',onError);
     if(error)reject(error);else resolve();
    };
    onPlaying=()=>{if(token===transition)complete();};
    onError=()=>{if(token===transition)complete(Error('Không nhận được luồng âm thanh'));};
    node.addEventListener?.('playing',onPlaying);
    node.addEventListener?.('error',onError);
    timer=win.setTimeout?.(()=>complete(Error('Kênh không có tín hiệu âm thanh')),10000)??null;
   });
   try{await Promise.all([ready,startAudio(node,url,token)]);}
   finally{
    if(timer!==null)win.clearTimeout?.(timer);
    node.removeEventListener?.('playing',onPlaying);
    node.removeEventListener?.('error',onError);
   }
  }
  async function navigateAudio(dir){
   const original=app.getCurrent?.();
   if(!active||!audio||!original||retuning)return;
   const order=typeof app.getPlaybackOrder==='function'?app.getPlaybackOrder():app.getChannels?.()||[];
   if(order.length<2)return;
   const originalKey=streamKey,separator=originalKey.indexOf('|');
   const oldUrl=separator>=0?originalKey.slice(separator+1):sourceFor(original);
   let index=order.findIndex(ch=>ch.id===original.id);
   if(index<0)return;
   retuning=true;
   let probes=0,skipped=0,lastFailure='';
   try{
    for(let step=0;step<Math.min(order.length-1,60)&&probes<5;step++){
     index=(index+dir+order.length)%order.length;
     const candidate=order[index];
     if(candidate.id===original.id)break;
     const links=allowedLinks(candidate);
     if(candidate.status==='dead'||!links.length){skipped++;continue;}
     // Use remembered working source first without inventing a stream URL.
     links.sort((a,b)=>(b===candidate.lastPlayableUrl?1:0)-(a===candidate.lastPlayableUrl?1:0));
     for(const url of links.slice(0,3)){
      if(probes>=5)break;
      probes++;
      transition++;
      const token=transition;
      try{hls?.destroy?.();}catch{}hls=null;
      try{dash?.reset?.();}catch{}dash=null;
      say('Đang kiểm tra kênh '+candidate.name+'…');
      try{
       await retune(audio,url,token);
       if(token!==transition||!active||app.getCurrent?.()?.id!==original.id)return;
       // Only commit the selected channel after audio is actually playing.
       streamKey=candidate.id+'|'+url;
       const result=await app.playChannel?.(candidate.id,null,{audioOnly:true,manualUrl:url});
       if(app.getCurrent?.()?.id!==candidate.id)throw Error('Không chuyển được kênh');
       lastRescue={id:original.id,url:oldUrl,at:Date.now()};
       say(skipped?'Đã bỏ qua '+skipped+' kênh không có nguồn phát.':'Đang nghe '+candidate.name);
       sync();reaffirmLockScreenAudio(audio,candidate.id);
       return;
      }catch(e){
       lastFailure=String(e?.message||e).slice(0,90);
       // Keep the media element (and therefore iOS lock-screen controls).
       // The app's current channel is still the last working one.
       if(app.getCurrent?.()?.id!==original.id){
        try{await app.playChannel?.(original.id,null,{audioOnly:true,manualUrl:oldUrl});}catch{}
       }
      }
     }
    }
    if(!active)return;
    if(probes===0){
     say('Không có kênh nào có nguồn phát phù hợp. Đang giữ '+original.name+'.');
     return;
    }
    transition++;
    const restoreToken=transition;
    try{
     hls?.destroy?.();hls=null;dash?.reset?.();dash=null;
     await retune(audio,oldUrl,restoreToken);
     streamKey=originalKey;sync();reaffirmLockScreenAudio(audio,original.id);
     say('Đã giữ kênh '+original.name+' vì các kênh tiếp theo chưa phát được'+(skipped?' ('+skipped+' kênh bỏ qua)':'')+'.');
    }catch(e){
     streamKey=originalKey;refreshState();
     say('Không đổi được kênh; hãy mở lại trang rồi nhấn Phát. '+(lastFailure||String(e?.message||e)).slice(0,80));
    }
   }finally{retuning=false;}
  }
  function navigate(dir){
   if(!enabled()||!app.getCurrent?.())return false;
   if(active&&audio&&typeof app.playChannel==='function'&&typeof app.getPlaybackOrder==='function'){
    void navigateAudio(dir).catch(()=>say('Không chuyển được kênh; vẫn giữ chế độ Nghe nền.'));
    return true;
   }
   if(active&&typeof app.switchChannel==='function'){
    try{Promise.resolve(app.switchChannel(dir,{audioOnly:true})).catch(()=>say('Không chuyển được kênh.'));}catch{say('Không chuyển được kênh.');}
    return true;
   }
   doc.getElementById?.(dir<0?'prevBtn':'nextBtn')?.click?.();
   return true;
  }
  function register(){
   if(installed||!session)return;
   safeAction('play',()=>togglePlayback(true));
   safeAction('pause',()=>togglePlayback(false));
   safeAction('stop',()=>{
    if(!enabled())return;
    if(active&&typeof app.stopPlayer==='function')app.stopPlayer();
    else doc.getElementById?.('stopBtn')?.click?.();
   });
   bindTrackControls();
   installed=true;
  }
  function bindTrackControls(){
   if(!session||!enabled()||!app.getCurrent?.())return;
   // iOS/WebKit may ignore playlist commands registered before the native
   // Now Playing session starts. Rebind on every real 'playing' event.
   safeAction('previoustrack',()=>navigate(-1));
   safeAction('nexttrack',()=>navigate(1));
   if(active&&audio){
    // Live IPTV should not offer +/-10 second seeking on the lock screen.
    // Suppress default seek commands so WebKit can present track navigation.
    safeAction('seekbackward',null);
    safeAction('seekforward',null);
    safeAction('seekto',null);
   }
  }
  function sync(){
   const channel=app.getCurrent?.();
   if(!enabled()||!channel){clearSession();if(enabled())applyAudioType();return;}
   register();
   const data=metadataFor(channel,store),key=channel.id+'|'+data.title+'|'+data.artist;
   const candidates=artworkCandidates(channel,store);
   const request=candidates[0]?.src||ICON_ART.src;
   const metadataChanged=!!session&&(key!==lastTitle||request!==lastArtworkRequest);
   if(metadataChanged){
    lastArtworkRequest=request;
    const revision=++artworkRevision;
    const setArtwork=index=>{
     if(revision!==artworkRevision||!enabled()||app.getCurrent?.()?.id!==channel.id)return;
     const art=candidates[index]||ICON_ART;
     const updated={...data,artwork:[art]};
     try{
      session.metadata=typeof win.MediaMetadata==='function'?new win.MediaMetadata(updated):updated;
      lastTitle=key;
     }catch{
      if(index+1<candidates.length)setArtwork(index+1);
      else lastTitle='';
      return;
     }
     // Broken snapshots can fall back to a channel logo, then to the app icon.
     // Preload once per change, never poll/refresh media on background visibility.
     if(index+1<candidates.length&&typeof win.Image==='function'){
      try{
       const img=new win.Image();
       img.onerror=()=>setArtwork(index+1);
       img.src=art.src;
      }catch{setArtwork(index+1);}
     }
    };
    setArtwork(0);
   }
   // App dispatches openiptv:audio-channel after updating channel and link
   // selection. Do not begin an outdated stream during its earlier metadata event.
   if(!media().paused)applyAudioType();
   refreshButton();refreshState();
   if(metadataChanged){
    // WebKit applies new title/artwork asynchronously, which can reset its
    // lock-screen control to Play after the new channel already became audible.
    const revision=++metadataRevision,now=media(),id=channel.id;
    Promise.resolve().then(()=>{
     if(revision===metadataRevision&&enabled()&&app.getCurrent?.()?.id===id
       &&media()===now&&!now.paused&&!now.ended){
      applyAudioType();refreshState();
     }
    });
   }
  }
  function reaffirmLockScreenAudio(node,id){
   if(!enabled()||!active||audio!==node||app.getCurrent?.()?.id!==id||node.paused||node.ended)return;
   // Reaffirm native Now Playing ownership AFTER replacing metadata. Reusing
   // the already audible element does not reload or duplicate an IPTV stream.
   applyAudioType();bindTrackControls();refreshState();
   if(doc.visibilityState!=='hidden')return;
   try{
    const result=node.play?.();
    result?.then?.(()=>{
     if(active&&audio===node&&app.getCurrent?.()?.id===id&&!node.paused)refreshState();
    },()=>{if(!node.paused)refreshState();});
   }catch{if(!node.paused)refreshState();}
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
     if(!active||audio!==node)return;
     if(type==='playing'){
      sync(); // channel metadata first
      bindTrackControls(); // bind after iOS Now Playing is active
     }
     refreshState();
    });
   }
   node.addEventListener?.('error',()=>{
    if(!active||audio!==node||retuning)return;
    const fallback=lastRescue;lastRescue=null;
    if(fallback&&Date.now()-fallback.at<20000&&fallback.url&&typeof app.playChannel==='function'){
     say('Kênh mới mất tín hiệu, đang trở về kênh trước…');
     try{Promise.resolve(app.playChannel(fallback.id,null,{audioOnly:true,manualUrl:fallback.url})).catch(()=>say('Không khôi phục được kênh trước.'));}catch{}
    }else{say('Nguồn phát âm thanh bị lỗi; thử chuyển sang kênh khác.');}
    refreshState();
   });
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
  async function activate(options={}){
   if(!enabled()){say('Bật Âm thanh khi khóa màn hình trong Cài đặt trước.');return false;}
   const channel=app.getCurrent?.();
   if(!channel){say('Hãy phát một kênh có tiếng trước khi bật Nghe nền.');return false;}
   const chosen=options.streamUrl;
   const url=chosen&&isAllowedStream(chosen,win?.location?.href||'https://localhost/')?chosen:sourceFor(channel);
   if(!url){say('Không tìm thấy link phát phù hợp để nghe nền.');return false;}
   const priorActive=active;
   // iOS needs the first audio play() to originate from a user gesture.
   // Once audio is active, Media Session next/previous may retune while locked.
   if(doc.visibilityState==='hidden'&&!priorActive){
    say('Mở trình duyệt và bật Nghe nền trước khi khóa máy.');return false;
   }
   const nextKey=channel.id+'|'+url;
   if(priorActive&&streamKey===nextKey&&audio){refreshState();return true;}
   if(!priorActive){
    pausedBeforeTransition=Boolean(video.paused);
    disposeAudio();
    active=true;needsVideoRestore=true;
   }else{
    // Keep the same audible element: rebuilding it during a locked-screen
    // command makes iOS lose the active audio session and buttons.
    transition++;
    if(hls){try{hls.destroy();}catch{}hls=null;}
    if(dash){try{dash.reset();}catch{}dash=null;}
   }
   const token=transition;
   streamKey=nextKey;
   refreshButton();applyAudioType();
   try{
    if(!audio)audio=makeAudio();
    if(!priorActive){
     if(typeof app.suspendVideoForBackground==='function')app.suspendVideoForBackground();
     else video.pause?.();
    }
    refreshState();
    await startAudio(audio,url,token);
    if(token!==transition)return false;
    say('Đang nghe nền · có thể khóa màn hình. Nhấn Xem TV để trở lại hình ảnh.');
    sync();refreshState();
    return true;
   }catch(e){
    if(token!==transition)return false;
    const error=String(e?.message||e||'không rõ').slice(0,180);
    const restoreVideo=!priorActive&&needsVideoRestore&&!pausedBeforeTransition;
    if(priorActive){
     say('Không chuyển được kênh nghe nền: '+error+'. Hãy mở lại trình duyệt và nhấn Phát.');
     refreshState();return false;
    }
    active=false;disposeAudio();refreshButton();
    say('Không bật được Nghe nền: '+error+'. Hãy thử kênh khác hoặc nhấn Phát.');
    if(restoreVideo){
     const ch=app.getCurrent?.();
     if(ch&&typeof app.playChannel==='function'){
      try{Promise.resolve(app.playChannel(ch.id)).catch(()=>{});}catch{}
     }else{try{video.play?.()?.catch?.(()=>{});}catch{}}
    }
    refreshState();return false;
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
  for(const type of ['play','playing','pause','ended']){
   video.addEventListener?.(type,()=>{
    if(active){if(type==='play')video.pause?.();refreshState();return;}
    sync();
    if(type==='playing')bindTrackControls();
   });
  }
  doc.addEventListener?.('openiptv:media-info',sync);
  doc.addEventListener?.('openiptv:audio-channel',event=>{
   if(!active||retuning)return;
   const wanted=event?.detail;
   if(wanted?.channelId!==app.getCurrent?.()?.id)return;
   void activate({streamUrl:wanted.url});
  });
  for(const id of ['prevBtn','nextBtn']){
   doc.getElementById?.(id)?.addEventListener?.('click',event=>{
    if(!active)return;
    event.preventDefault?.();event.stopImmediatePropagation?.();
    navigate(id==='prevBtn'?-1:1);
   },true);
  }
  video.addEventListener?.('volumechange',()=>{
   if(audio){audio.volume=video.volume;audio.muted=video.muted;}
  });
  doc.addEventListener?.('visibilitychange',()=>{
   // Never start/stop media just because the screen locked.
   if(doc.visibilityState!=='hidden')sync();
  });
  win.addEventListener?.('pageshow',sync);
  // Safari needs the playback audio session type set early, before interruptions.
  if(enabled())applyAudioType();
  info(!enabled()?'Đã tắt nghe nền.':session?'Đã bật. Nhấn Nghe nền khi đang xem TV, sau đó mới khóa màn hình. Trình duyệt/nguồn IPTV có thể giới hạn phát nền.':'Trình duyệt này không có Media Session; nút màn hình khóa có thể không hoạt động, nhưng vẫn có thể thử Nghe nền.');
  refreshButton();sync();
  return Object.freeze({
   sync,clearSession,activate,deactivate,togglePlayback,navigate,
   get active(){return active;},
   getPlaybackState(){
    if(!active)return null;
    return {
     playing:!!audio&&!audio.paused&&!audio.ended&&!!app.getCurrent?.(),
     muted:!!audio&&(!!audio.muted||Number(audio.volume)===0)
    };
   }
  });
 }
 return Object.freeze({metadataFor,artworkCandidates,imageArt,isAllowedStream,install});
});
