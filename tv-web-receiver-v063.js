'use strict';
/* Copied verbatim playback core from web-tv-receiver.js at 9944ee452c33f321c14420c18546d50e31d5eba6.
 * Only the UI/pairing boundary is adapted for the standalone TV website. */
(function(root){
 const d=root.document,$=id=>d.getElementById(id);
 const video=$('tvVideo');
 let receiver=null,hls=null,dash=null,accepted=false,playingName='',playingId='',suppressPause=true,fullscreenAttempted=false,playingUrl='';
 let hooks={},opened=false;
 const safeHistoryUrl=value=>root.OpenIPTVTVPair?.validateUrl?.(value)||'';
 const renderHistory=()=>{};
 const rememberChannel=(url,name,mediaId)=>{if(hooks.playing)hooks.playing(url,name,mediaId);};
 const status=text=>{
  text=String(text||'');
  if(hooks.status)hooks.status(text);
  if(/^(Không phát được|Đường dẫn kênh không hợp lệ|Nguồn HTTP|TV không hỗ trợ bộ phát)/.test(text)){
   const session=playbackGeneration;
   Promise.resolve().then(()=>{if(opened&&session===playbackGeneration&&hooks.error)hooks.error(text);});
  }
 };
 function leaveCinema(){
  d.body.classList.remove('tv-cinema');
  if(d.fullscreenElement&&typeof d.exitFullscreen==='function')void Promise.resolve(d.exitFullscreen()).catch(()=>{});
 }
 function enterCinema(){
  d.body.classList.add('tv-cinema'); // Guaranteed viewport-sized playback when native fullscreen is blocked.
  if(fullscreenAttempted)return;
  fullscreenAttempted=true;
  try{
   if(typeof video.requestFullscreen==='function')void Promise.resolve(video.requestFullscreen()).catch(()=>{});
   else if(typeof video.webkitEnterFullscreen==='function')video.webkitEnterFullscreen();
   else if(typeof d.documentElement?.requestFullscreen==='function')
    void Promise.resolve(d.documentElement.requestFullscreen()).catch(()=>{});
  }catch{} // TV browsers often require a remote-control gesture; CSS cinema remains usable.
 }
 // A new remote channel invalidates all callbacks from the previous HLS/DASH
 // session. Never report a failure until every compatible decoder was tried.
 let playbackGeneration=0,stageGeneration=0,playbackStages=[],stageIndex=-1;
 let playbackStage='',stageTimer=0,playbackStarted=false,stageError='',pendingUserGesture=false,playbackEngineReady=false;
 function clearStageTimer(){
  if(stageTimer){root.clearTimeout(stageTimer);stageTimer=0;}
 }
 function resetMedia(){
  clearStageTimer();
  try{hls?.destroy();}catch{}hls=null;
  try{dash?.reset();}catch{}dash=null;
  try{video.pause();}catch{}
  video.removeAttribute('src');
  try{video.load();}catch{}
 }
 function cleanupPlayer(){
  playbackGeneration++;stageGeneration++;playbackStages=[];stageIndex=-1;
  playbackStage='';playbackStarted=false;stageError='';pendingUserGesture=false;playbackEngineReady=false;
  suppressPause=true;playingUrl='';
  renderHistory();leaveCinema();
  resetMedia();
 }
 const stageAvailable=stage=>{
  if(stage==='hlsjs')return !!(root.Hls?.isSupported?.());
  if(stage==='dashjs')return !!(root.dashjs?.MediaPlayer);
  if(stage==='native-hls')return !!video.canPlayType?.('application/vnd.apple.mpegurl');
  return true;
 };
 function stagesFor(url){
  const path=new URL(url).pathname.toLowerCase();
  const isHls=/\.m3u8?$/.test(path),isDash=/\.mpd$/.test(path);
  const stages=isHls?['native-hls','hlsjs']:
   isDash?['dashjs','native']:
   /\.(?:mp4|m4v|webm|mp3|aac|m4a|ts)$/.test(path)?['native']:
   ['native','hlsjs','dashjs'];
  // Some Samsung devices advertise native HLS but reject specific channels.
  // Always keep a second engine for HLS where MSE is supported.
  return stages.filter(stageAvailable);
 }
 function playbackIssue(reason,session,attempt){
  if(session!==playbackGeneration||attempt!==stageGeneration||!playingUrl||playbackStarted)return;
  stageError=String(reason||'không hỗ trợ nguồn').slice(0,155);
  clearStageTimer();
  if(stageIndex+1<playbackStages.length){
   status('Bộ phát '+playbackStage+' không mở được. Đang thử '+playbackStages[stageIndex+1]+'…');
   nextStage(session);
  }else{
   let hostname='';
   try{hostname=new URL(playingUrl).hostname;}catch{}
   status('Không phát được '+playingName+(hostname?' ('+hostname+')':'')+': '+stageError+
    '. Kiểm tra HTTP/CORS, định dạng hoặc thử URL khác trong Open IPTV Pro.');
   if(accepted)void receiver?.reportPlayback('error',playingName,playingId).catch(()=>{});
  }
 }
 function playWhenReady(session,attempt){
  if(session!==playbackGeneration||attempt!==stageGeneration||!playingUrl)return;
  let promise;
  try{promise=video.play();}
  catch(error){playbackIssue(error?.message||error,session,attempt);return;}
  if(promise?.catch)promise.catch(error=>{
   if(session!==playbackGeneration||attempt!==stageGeneration)return;
   if(error?.name==='AbortError')return;
   if(error?.name==='NotAllowedError'){
    pendingUserGesture=true;
    clearStageTimer();
    status('TV chặn tự phát. Nhấn ▶ Phát trên TV bằng điều khiển.');
    if(accepted)void receiver?.reportPlayback('paused',playingName,playingId).catch(()=>{});
    return;
   }
   playbackIssue(error?.message||error,session,attempt);
  });
 }
 function nextStage(session){
  if(session!==playbackGeneration||!playingUrl)return;
  resetMedia();
  stageIndex++;stageGeneration++;
  const attempt=stageGeneration,mode=playbackStages[stageIndex],url=playingUrl;
  playbackStage=mode;playbackStarted=false;pendingUserGesture=false;playbackEngineReady=false;
  if(!mode){playbackIssue(stageError||'không có bộ phát phù hợp',session,attempt);return;}
  status('Đang thử '+mode+' cho '+playingName+'…');
  stageTimer=root.setTimeout(()=>{
   if(session===playbackGeneration&&attempt===stageGeneration&&!playbackStarted&&!pendingUserGesture)
    playbackIssue(mode+' không nhận dữ liệu sau 18 giây',session,attempt);
  },18000);
  try{
   if(mode==='hlsjs'){
    // hls.js first needs MEDIA_ATTACHED, then a parsed manifest.
    // Calling video.play() before MANIFEST_PARSED causes the observed
    // "Failed to load because no supported source was found" on Samsung.
    const engine=new root.Hls({enableWorker:false,lowLatencyMode:false,maxBufferLength:22});
    hls=engine;
    engine.on(root.Hls.Events.MEDIA_ATTACHED,()=>{
     if(session===playbackGeneration&&attempt===stageGeneration)engine.loadSource(url);
    });
    engine.on(root.Hls.Events.MANIFEST_PARSED,()=>{
     if(session===playbackGeneration&&attempt===stageGeneration){playbackEngineReady=true;playWhenReady(session,attempt);}
    });
    engine.on(root.Hls.Events.ERROR,(_event,data)=>{
     if(session!==playbackGeneration||attempt!==stageGeneration||!data?.fatal)return;
     const detail=String(data.details||data.type||'HLS không phát được');
     const code=Number(data.response?.code||0);
     playbackIssue(detail+(code?' HTTP '+code:'; có thể là CORS/mạng'),session,attempt);
    });
    engine.attachMedia(video);
    return;
   }
   if(mode==='dashjs'){
    const engine=root.dashjs.MediaPlayer().create();dash=engine;
    const eventName=root.dashjs.MediaPlayer.events?.STREAM_INITIALIZED||'streamInitialized';
    engine.on?.(eventName,()=>{playbackEngineReady=true;playWhenReady(session,attempt);});
    engine.on?.(root.dashjs.MediaPlayer.events?.ERROR||'error',data=>{
     playbackIssue('DASH: '+String(data?.error?.message||data?.event?.message||'không phát được'),session,attempt);
    });
    engine.initialize(video,url,false);
    return;
   }
   // Native and native-HLS have an actual src before play(), unlike MSE.
   video.src=url;
   playbackEngineReady=true;
   playWhenReady(session,attempt);
  }catch(error){
   playbackIssue(String(error?.message||error),session,attempt);
  }
 }
 function loadVideo(url,name,mediaId=''){
  cleanupPlayer();
  const session=playbackGeneration;
  playingId=String(mediaId||'').slice(0,320);
  fullscreenAttempted=false;playingName=String(name||'Open IPTV Pro');
  $('tvPlayingTitle').textContent=playingName;
  const safeUrl=safeHistoryUrl(url);
  if(!safeUrl){status('Đường dẫn kênh không hợp lệ.');return;}
  playingUrl=safeUrl;
  const u=new URL(safeUrl);
  if(u.protocol==='http:'&&root.location.protocol==='https:'){
   status('Nguồn HTTP có thể bị trình duyệt TV chặn trên trang HTTPS. Chọn nguồn HTTPS.');
   if(accepted)void receiver?.reportPlayback('error',playingName,playingId).catch(()=>{});
   return;
  }
  playbackStages=stagesFor(safeUrl);
  if(!playbackStages.length){
   status('TV không hỗ trợ bộ phát cho định dạng của kênh.');
   if(accepted)void receiver?.reportPlayback('error',playingName,playingId).catch(()=>{});
   return;
  }
  nextStage(session);
 }
 video.addEventListener('playing',()=>{
  if(!playingUrl)return;
  playbackStarted=true;pendingUserGesture=false;clearStageTimer();
  suppressPause=false;enterCinema();
  status('Đang phát '+playingName+' trên TV.');
  rememberChannel(playingUrl,playingName,playingId);
  if(accepted)void receiver?.reportPlayback('playing',playingName,playingId).catch(()=>{});
 });
 video.addEventListener('error',()=>{
  if(!playingUrl||playbackStarted)return;
  playbackIssue('HTML5: '+String(video.error?.message||'nguồn hoặc codec không hỗ trợ'),playbackGeneration,stageGeneration);
 });

 root.OpenIPTVTVWebPlayer=Object.freeze({
  open(url,name,id,callbacks){
   hooks=callbacks||{};opened=true;
   $('tvPlayer').hidden=false;
   loadVideo(url,name,id);
  },
  close(){opened=false;cleanupPlayer();$('tvPlayer').hidden=true;hooks={};},
  toggle(){
   if(!opened||!playingUrl)return;
   if(video.paused){if(playbackEngineReady)playWhenReady(playbackGeneration,stageGeneration);}
   else video.pause();
  }
 });
 root.addEventListener('pagehide',()=>root.OpenIPTVTVWebPlayer.close());
})(window);
