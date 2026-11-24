'use strict';
/* TV-side receiver. Streams are played on the TV, not "cast" from the Web tab.
 * The browser/TV must be able to fetch and decode the supplied media itself.
 */
(function(root){
 const d=root.document,$=id=>d.getElementById(id);
 let receiver=null,hls=null,dash=null,busy=false,accepted=false,playingName='',playingId='',suppressPause=true,fullscreenAttempted=false;

 // Keep only the 50 most recently played channels on this TV/browser.
 // Sources remain local to the TV; pairing and Supabase are not used for storage.
 const HISTORY_KEY='openiptv-tv-history-v1',HISTORY_LIMIT=50;
 let playingUrl='',watchHistory=[];
 let selectedHistoryIndex=0,historyKeyboardActive=false;
 const safeHistoryUrl=value=>root.OpenIPTVTVPair?.validateUrl?.(value)||'';
 function normalizeHistory(row){
  if(!row||typeof row!=='object')return null;
  const url=safeHistoryUrl(row.url);
  if(!url)return null;
  return {url,name:String(row.name||'Kênh không tên').slice(0,100),
   mediaId:String(row.mediaId||'').slice(0,320),
   watchedAt:Number.isFinite(row.watchedAt)&&row.watchedAt>0?row.watchedAt:Date.now()};
 }
 const sameChannel=(a,b)=>a.url===b.url||!!(a.mediaId&&b.mediaId&&a.mediaId===b.mediaId);
 function readHistory(){
  try{
   const rows=JSON.parse(root.localStorage.getItem(HISTORY_KEY)||'[]');
   if(!Array.isArray(rows))return [];
   const unique=[];
   for(const row of rows.slice(0,250)){
    const entry=normalizeHistory(row);
    if(entry&&!unique.some(item=>sameChannel(item,entry)))unique.push(entry);
    if(unique.length===HISTORY_LIMIT)break;
   }
   return unique;
  }catch{return [];}
 }
 function historyTime(timestamp){
  try{return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(timestamp));}
  catch{return 'Đã xem';}
 }
 function historyCards(){return Array.from($('tvHistoryGrid')?.querySelectorAll('.tv-history-card')||[]);}
 function historyColumns(){
  const width=Number(root.innerWidth||d.documentElement?.clientWidth||950);
  return width<=350?1:width<=600?2:width<=850?3:4;
 }
 function focusHistory(index){
  const cards=historyCards();
  if(!cards.length)return false;
  selectedHistoryIndex=Math.max(0,Math.min(cards.length-1,index));
  historyKeyboardActive=true;
  cards.forEach((card,i)=>{card.tabIndex=i===selectedHistoryIndex?0:-1;card.dataset.keyboardSelected=i===selectedHistoryIndex?'true':'false';});
  const selected=cards[selectedHistoryIndex];
  selected.focus?.({preventScroll:true});
  selected.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'auto'});
  historyNavigating=true;pinGestureScroll=Math.max(pinGestureScroll,160);
  requestPinResize();
  return true;
 }
 function renderHistory(){
  const grid=$('tvHistoryGrid');
  if(!grid)return;
  const hadFocus=!!grid.contains?.(d.activeElement);
  const fragment=d.createDocumentFragment();
  selectedHistoryIndex=Math.max(0,Math.min(watchHistory.length-1,selectedHistoryIndex));
  watchHistory.forEach((entry,index)=>{
   const card=d.createElement('button');card.type='button';card.className='tv-history-card';
   card.tabIndex=index===selectedHistoryIndex?0:-1;
   card.dataset.keyboardSelected=historyKeyboardActive&&index===selectedHistoryIndex?'true':'false';
   card.title='Phát '+entry.name;card.setAttribute('aria-label','Phát kênh '+entry.name);
   if(playingUrl&&entry.url===playingUrl)card.dataset.current='true';
   const icon=d.createElement('span');icon.className='tv-history-icon';icon.textContent='▶';icon.setAttribute('aria-hidden','true');
   const detail=d.createElement('span');detail.className='tv-history-details';
   const name=d.createElement('span');name.className='tv-history-name';name.textContent=entry.name;
   const meta=d.createElement('span');meta.className='tv-history-meta';
   meta.textContent=playingUrl&&entry.url===playingUrl?'Đang phát':'Xem '+historyTime(entry.watchedAt);
   detail.append(name,meta);card.append(icon,detail);
   card.addEventListener('focus',()=>{selectedHistoryIndex=index;});
   card.addEventListener('click',()=>{
    selectedHistoryIndex=index;historyKeyboardActive=true;
    show('tvPlayer');void loadVideo(entry.url,entry.name,entry.mediaId);
   });
   fragment.append(card);
  });
  grid.replaceChildren(fragment);
  if(hadFocus&&watchHistory.length)focusHistory(selectedHistoryIndex);
  $('tvHistoryCount').textContent=watchHistory.length+'/'+HISTORY_LIMIT;
  $('tvHistoryEmpty').hidden=watchHistory.length>0;
  $('tvClearHistory').disabled=watchHistory.length===0;
 }
 function rememberChannel(url,name,mediaId){
  const entry=normalizeHistory({url,name,mediaId,watchedAt:Date.now()});
  if(!entry)return;
  watchHistory=[entry,...watchHistory.filter(item=>!sameChannel(entry,item))].slice(0,HISTORY_LIMIT);
  selectedHistoryIndex=0;
  try{root.localStorage.setItem(HISTORY_KEY,JSON.stringify(watchHistory));}catch{}
  renderHistory();
 }

 // TV browsers sometimes scroll inside an element or report swipes without window.scrollY.
 let pinGestureScroll=0,lastTouchY=null,lastScrollOffset=0,historyNavigating=false;
 const clampPin=(n,min,max)=>Math.max(min,Math.min(max,n));
 function scrollOffset(event){
  const target=event?.target;
  return Math.max(0,Number(root.scrollY||0),Number(root.pageYOffset||0),
   Number(d.documentElement?.scrollTop||0),Number(d.body?.scrollTop||0),Number(target?.scrollTop||0));
 }
 function resizePairPin(event){
  const pin=$('tvPairPin');
  if(!pin||!pin.style)return;
  const measured=scrollOffset(event);
  if(measured<lastScrollOffset-3){
   pinGestureScroll=Math.min(pinGestureScroll,measured);
   if(measured<12)historyNavigating=false;
  }
  lastScrollOffset=measured;
  const width=Math.max(320,Number(root.innerWidth||d.documentElement?.clientWidth||950));
  const height=Math.max(350,Number(root.innerHeight||d.documentElement?.clientHeight||800));
  const distance=Math.min(260,Math.max(135,height*.31));
  const offset=Math.max(measured,pinGestureScroll,historyNavigating?distance*.82:0);
  const progress=clampPin(offset/distance,0,1);
  const large=clampPin(width*.057,52,72);
  const compact=clampPin(width*.034,32,42);
  const size=large-(large-compact)*progress;
  const margin=25-19*progress;
  pin.style.fontSize=size.toFixed(1)+'px';
  pin.style.marginTop=margin.toFixed(1)+'px';
  pin.style.marginBottom=margin.toFixed(1)+'px';
  pin.dataset.compact=progress>=.98?'true':'false';
 }
 let resizePairPinPending=false;
 function requestPinResize(event){
  if(resizePairPinPending)return;
  resizePairPinPending=true;
  const update=()=>{resizePairPinPending=false;resizePairPin(event);};
  if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(update);
  else update();
 }
 function nudgePin(delta){
  if(!Number.isFinite(delta)||delta===0)return;
  pinGestureScroll=clampPin(pinGestureScroll+delta,0,400);
  if(delta<0&&pinGestureScroll<16)historyNavigating=false;
  requestPinResize();
 }
 root.addEventListener('scroll',requestPinResize,{passive:true,capture:true});
 d.addEventListener('scroll',requestPinResize,true);
 root.addEventListener('resize',requestPinResize);
 d.addEventListener('wheel',event=>nudgePin(Number(event.deltaY||0)),{passive:true});
 d.addEventListener('touchstart',event=>{
  lastTouchY=Number(event.touches?.[0]?.clientY);
  if(!Number.isFinite(lastTouchY))lastTouchY=null;
 },{passive:true});
 d.addEventListener('touchmove',event=>{
  const y=Number(event.touches?.[0]?.clientY);
  if(Number.isFinite(y)&&lastTouchY!==null)nudgePin(lastTouchY-y);
  if(Number.isFinite(y))lastTouchY=y;
 },{passive:true});
 d.addEventListener('touchend',()=>{lastTouchY=null;},{passive:true});
 d.addEventListener('focusin',event=>{
  if($('tvHistory')?.contains?.(event.target)){
   historyNavigating=true;
   pinGestureScroll=Math.max(pinGestureScroll,160);
   requestPinResize();
  }
 });
 d.addEventListener('keydown',event=>{
  // The history navigator owns arrows and Space when a channel is focused.
  if(d.body.classList.contains('tv-cinema')||$('tvHistoryGrid')?.contains?.(event.target))return;
  if(['ArrowDown','PageDown'].includes(event.key))nudgePin(event.key==='ArrowDown'?55:170);
  else if(['ArrowUp','PageUp','Home'].includes(event.key))nudgePin(event.key==='ArrowUp'?-55:-400);
 });
 $('tvHistory')?.addEventListener('pointerenter',()=>{
  historyNavigating=true;pinGestureScroll=Math.max(pinGestureScroll,150);requestPinResize();
 },{passive:true});
 const cinemaButton=$('tvExitFullscreen');
 const video=$('tvVideo');
 const status=text=>{$('tvStatus').textContent=String(text||'');};
 const show=id=>{
  for(const x of ['tvPairing','tvRequest','tvPlayer'])$(x).hidden=x!==id;
 };
 function theme(value){
  const name=['light','dark','amoled'].includes(value)?value:'dark';
  d.body.dataset.theme=name;
  d.querySelectorAll('[data-tv-theme]').forEach(button=>button.dataset.active=String(button.dataset.tvTheme===name));
  try{root.localStorage.setItem('openiptv-tv-theme',name);}catch{}
 }
 d.querySelectorAll('[data-tv-theme]').forEach(button=>button.addEventListener('click',()=>theme(button.dataset.tvTheme)));
 try{theme(root.localStorage.getItem('openiptv-tv-theme')||'dark');}catch{theme('dark');}
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
 function handleCommand(command){
  if(!accepted)return;
  switch(command.action){
   case 'play':show('tvPlayer');void loadVideo(command.url,command.name,command.mediaId);break;
   case 'pause':suppressPause=false;video.pause();status('Đã tạm dừng phát theo lệnh từ máy tính.');break;
   case 'resume':void video.play().catch(error=>{
     status('TV chưa tiếp tục phát: '+String(error?.message||error)+'. Thử nhấn Phát trên TV.');
     void receiver?.reportPlayback(error?.name==='NotAllowedError'?'paused':'error',playingName,playingId).catch(()=>{});
    });break;
   case 'stop':cleanupPlayer();status('Đã dừng kênh. Chọn kênh mới trên máy tính.');void receiver?.reportPlayback('stopped',playingName,playingId).catch(()=>{});break;
   case 'volume':
    if(command.volume!==null)try{video.volume=command.volume;}catch{}
    video.muted=!!command.muted;
    break;
   case 'disconnect':accepted=false;cleanupPlayer();show('tvPairing');status('Máy tính đã ngắt kết nối. Tạo mã mới để tiếp tục.');break;
  }
 }
 async function boot(){
  if(busy)return;busy=true;
  accepted=false;show('tvPairing');cleanupPlayer();$('tvPairPin').textContent='••• •••';
  $('tvNewPin').disabled=true;status('Đang kết nối đến dịch vụ ghép đôi…');
  try{
   await receiver?.close();
   if(!root.OpenIPTVTVPair)throw Error('Thiếu thư viện ghép đôi.');
   receiver=root.OpenIPTVTVPair.createReceiver({
    autoApprove:true,
    onStatus:status,
    onRequest:request=>{
     // No confirmation popup: possessing the one-time, expiring TV code is sufficient.
     if(!request&&!accepted)show('tvPairing');
    },
    onCommand:handleCommand,
    onConnected:()=>{accepted=true;show('tvPlayer');$('tvPlayingTitle').textContent='TV đã được ghép đôi';status('Đã kết nối. Chọn kênh trên Open IPTV Pro.');}
   });
   await receiver.start();
   const code=receiver.code;
   $('tvPairPin').textContent=code.slice(0,3)+' '+code.slice(3);
   status('Nhập mã 6 số trên Web; TV tự ghép đôi, không cần bấm Cho phép.');
  }catch(error){
   status('Không thể tạo mã ghép đôi: '+String(error.message||error)+'. Hãy kiểm tra Internet rồi thử lại.');
  }finally{busy=false;$('tvNewPin').disabled=false;}
 }
 watchHistory=readHistory();
 renderHistory();
 requestPinResize();
 $('tvClearHistory').addEventListener('click',()=>{
  watchHistory=[];
  try{root.localStorage.removeItem(HISTORY_KEY);}catch{}
  renderHistory();
  status('Đã xóa lịch sử xem trên TV này.');
 });
 $('tvNewPin').addEventListener('click',()=>void boot());
 $('tvAllow').addEventListener('click',async()=>{
  $('tvAllow').disabled=true;
  try{await receiver?.approve();}catch(error){status('TV không thể chấp thuận: '+String(error.message||error));}
  finally{$('tvAllow').disabled=false;}
 });
 $('tvDeny').addEventListener('click',()=>receiver?.deny());
 $('tvDisconnect').addEventListener('click',async()=>{
  accepted=false;cleanupPlayer();await receiver?.close();receiver=null;
  await boot();
 });
 $('tvLocalPlay').addEventListener('click',()=>{
  // Use this explicit TV remote action if fullscreen was rejected during automatic playback.
  fullscreenAttempted=false;
  enterCinema();
  if(!playbackEngineReady){status('Đang chờ bộ phát tải xong dữ liệu trước khi phát…');return;}
  void video.play().catch(error=>{
   if(error?.name!=='NotAllowedError')playbackIssue(error?.message||error,playbackGeneration,stageGeneration);
  });
 });
 cinemaButton?.addEventListener('click',leaveCinema);
 // Direction keys and Enter/OK work on computers and Samsung TV remotes.
 function navKey(event){
  const key=String(event.key||'');
  if(key&&key!=='Unidentified')return key;
  const keys={37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter',
   32:' ',27:'Escape',8:'Backspace',10009:'Back'};
  return keys[event.keyCode]||'';
 }
 d.addEventListener('keydown',event=>{
  const key=navKey(event),cinema=d.body.classList.contains('tv-cinema');
  const back=key==='Escape'||key==='Backspace'||key==='Back'||event.keyCode===10009;
  if(back&&cinema){
   event.preventDefault?.();
   leaveCinema();
   // Keep playback in the embedded video and return focus to the current channel.
   focusHistory(selectedHistoryIndex);
   return;
  }
  if(cinema)return;
  const grid=$('tvHistoryGrid'),cards=historyCards();
  if(!cards.length)return;
  const active=d.activeElement;
  const withinGrid=!!grid?.contains?.(active);
  const keyTarget=event.target;
  if(withinGrid){
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)){
    event.preventDefault?.();
    const index=Math.max(0,cards.indexOf(active));
    const columns=historyColumns();
    const delta=key==='ArrowLeft'?-1:key==='ArrowRight'?1:key==='ArrowUp'?-columns:columns;
    focusHistory(index+delta);
    return;
   }
   if(key==='Enter'||key===' '){
    event.preventDefault?.();
    cards[Math.max(0,cards.indexOf(active))]?.click?.();
    return;
   }
   if(back){
    event.preventDefault?.();
    $('tvNewPin')?.focus?.();
    return;
   }
  }
  // From the pairing screen, Down starts browsing without needing a mouse.
  if(key==='ArrowDown'&&!withinGrid&&!grid?.contains?.(keyTarget)
     &&keyTarget?.tagName!=='INPUT'&&keyTarget?.tagName!=='TEXTAREA'
     &&keyTarget?.tagName!=='VIDEO'){
   event.preventDefault?.();
   focusHistory(selectedHistoryIndex);
  }
 });
 $('tvLocalPause').addEventListener('click',()=>video.pause());
 video.addEventListener('pause',()=>{if(accepted&&!video.ended&&!suppressPause)void receiver?.reportPlayback('paused',playingName,playingId).catch(()=>{});});
 video.addEventListener('ended',()=>{if(accepted)void receiver?.reportPlayback('stopped',playingName,playingId).catch(()=>{});});
 root.addEventListener('pagehide',()=>{void receiver?.close();cleanupPlayer();});
 /* TV Web: local entry point only. All original receiver functions and media events above remain unchanged. */
 function bootLocalChannel(){
  const target='https://trisanghy.github.io/open-iptv-pro/tv-web-v065.html';
  const back=()=>{
   try{root.sessionStorage.removeItem('openiptv-tv-web-handoff-v1');}catch{}
   const fromList=d.referrer===target;
   if(fromList&&root.history.length>1)root.history.back();
   else root.location.replace(target);
  };
  $('tvBackToList').addEventListener('click',back);
  let actualFullscreen=false,leaving=false;
  function exitToList(){if(leaving)return;leaving=true;back();}
  root.addEventListener('keydown',event=>{
   const key=String(event.key||'');
   if(key==='Back'||key==='Escape'||key==='Backspace'||event.keyCode===10009||event.keyCode===27){
    event.preventDefault();event.stopImmediatePropagation();exitToList();return;
   }
   if(key==='Enter'||key==='OK'||event.keyCode===13){
    if(event.target===$('tvBackToList')||event.target===$('tvLocalPlay'))return;
    if(video.paused&&pendingUserGesture){
     event.preventDefault();event.stopImmediatePropagation();$('tvLocalPlay').click();
    }
   }
  },true);
  const fullChanged=()=>{
   if(d.fullscreenElement||d.webkitFullscreenElement){actualFullscreen=true;return;}
   if(actualFullscreen){actualFullscreen=false;exitToList();}
  };
  d.addEventListener('fullscreenchange',fullChanged);
  d.addEventListener('webkitfullscreenchange',fullChanged);
  video.addEventListener('webkitendfullscreen',exitToList);
  cinemaButton?.addEventListener('click',exitToList);
  let payload=null;
  try{payload=JSON.parse(root.sessionStorage.getItem('openiptv-tv-web-handoff-v1')||'null');root.sessionStorage.removeItem('openiptv-tv-web-handoff-v1');}catch{}
  const valid=payload&&safeHistoryUrl(payload.url);
  show('tvPlayer');
  if(!valid||!Number.isFinite(payload.createdAt)||Math.abs(Date.now()-payload.createdAt)>120000){
   status('Chưa chọn kênh. Nhấn Back để về danh sách.');$('tvBackToList').focus();return;
  }
  video.addEventListener('playing',()=>{
   try{root.sessionStorage.setItem('openiptv-tv-web-played-v1',String(payload.id||''));}catch{}
  });
  // Same call as clicking an original receiver history card. No extra engine.
  void loadVideo(valid,payload.name,payload.id);
 }
 bootLocalChannel();
})(window);
