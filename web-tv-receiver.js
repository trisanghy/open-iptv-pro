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
 function renderHistory(){
  const grid=$('tvHistoryGrid');
  if(!grid)return;
  const fragment=d.createDocumentFragment();
  watchHistory.forEach(entry=>{
   const card=d.createElement('button');card.type='button';card.className='tv-history-card';
   card.title='Phát '+entry.name;card.setAttribute('aria-label','Phát kênh '+entry.name);
   if(playingUrl&&entry.url===playingUrl)card.dataset.current='true';
   const icon=d.createElement('span');icon.className='tv-history-icon';icon.textContent='▶';icon.setAttribute('aria-hidden','true');
   const detail=d.createElement('span');detail.className='tv-history-details';
   const name=d.createElement('span');name.className='tv-history-name';name.textContent=entry.name;
   const meta=d.createElement('span');meta.className='tv-history-meta';
   meta.textContent=playingUrl&&entry.url===playingUrl?'Đang phát':'Xem '+historyTime(entry.watchedAt);
   detail.append(name,meta);card.append(icon,detail);
   card.addEventListener('click',()=>{show('tvPlayer');void loadVideo(entry.url,entry.name,entry.mediaId);});
   fragment.append(card);
  });
  grid.replaceChildren(fragment);
  $('tvHistoryCount').textContent=watchHistory.length+'/'+HISTORY_LIMIT;
  $('tvHistoryEmpty').hidden=watchHistory.length>0;
  $('tvClearHistory').disabled=watchHistory.length===0;
 }
 function rememberChannel(url,name,mediaId){
  const entry=normalizeHistory({url,name,mediaId,watchedAt:Date.now()});
  if(!entry)return;
  watchHistory=[entry,...watchHistory.filter(item=>!sameChannel(entry,item))].slice(0,HISTORY_LIMIT);
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
  if(['ArrowDown','PageDown',' '].includes(event.key))nudgePin(event.key==='ArrowDown'?55:170);
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
 function cleanupPlayer(){
  suppressPause=true;playingUrl='';
  renderHistory();
  leaveCinema();
  try{video.pause();}catch{}
  try{hls?.destroy();}catch{}hls=null;
  try{dash?.reset();}catch{}dash=null;
  video.removeAttribute('src');
  try{video.load();}catch{}
 }
 async function loadVideo(url,name,mediaId=''){
  cleanupPlayer();
  playingId=String(mediaId||'').slice(0,320);
  fullscreenAttempted=false;playingName=String(name||'Open IPTV Pro');
  $('tvPlayingTitle').textContent=name||'Open IPTV Pro';
  const safeUrl=safeHistoryUrl(url);
  if(!safeUrl){status('Đường dẫn kênh không hợp lệ.');return;}
  playingUrl=safeUrl;
  const u=new URL(safeUrl);
  if(u.protocol==='http:'&&root.location.protocol==='https:'){
   status('Nguồn đang dùng HTTP. Trình duyệt TV có thể chặn nội dung không an toàn; hãy dùng HTTPS hoặc ứng dụng Electron.');
    void receiver?.reportPlayback('error',playingName,playingId).catch(()=>{});
   return;
  }
  const isHls=/\.m3u8?(?:[?#]|$)/i.test(url);
  const isDash=/\.mpd(?:[?#]|$)/i.test(url);
  if(isHls&&video.canPlayType('application/vnd.apple.mpegurl')){
   video.src=url;
  }else if(isHls&&root.Hls?.isSupported?.()){
   hls=new root.Hls({enableWorker:true,lowLatencyMode:true});
   hls.attachMedia(video);
   hls.on(root.Hls.Events.MEDIA_ATTACHED,()=>hls.loadSource(url));
   hls.on(root.Hls.Events.ERROR,(_event,data)=>{
    if(data.fatal){
      status('Không phát được HLS trên TV: '+String(data.details||data.type||'lỗi nguồn'));
      void receiver?.reportPlayback('error',playingName,playingId).catch(()=>{});
     }
   });
  }else if(isDash&&root.dashjs?.MediaPlayer){
   dash=root.dashjs.MediaPlayer().create();
   dash.initialize(video,url,true);
  }else{
   video.src=url;
  }
  try{
   await video.play();
   status('Đang phát '+(name||'kênh')+' trên TV.');
  }catch(error){
   if(error?.name==='NotAllowedError'){
     status('TV đã chặn tự phát. Nhấn ▶ Phát trực tiếp trên TV bằng điều khiển TV.');
     void receiver?.reportPlayback('paused',playingName,playingId).catch(()=>{});
    }else{
     status('TV chưa phát được '+(name||'kênh')+': '+String(error?.message||error));
     void receiver?.reportPlayback('error',playingName,playingId).catch(()=>{});
    }
  }
 }
 video.addEventListener('playing',()=>{
  if(!playingUrl)return;
  suppressPause=false;
  enterCinema();
  status('Đang phát '+playingName+' trên TV.');
  rememberChannel(playingUrl,playingName,playingId);
  if(accepted)void receiver?.reportPlayback('playing',playingName,playingId).catch(()=>{});
 });
 video.addEventListener('error',()=>{
  if(!video.error)return;
  status('TV không giải mã hoặc tải được luồng. Thử kênh khác, kiểm tra HTTPS và định dạng video.');
  if(accepted)void receiver?.reportPlayback('error',playingName,playingId).catch(()=>{});
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
  void video.play().catch(()=>status('Không phát được luồng trên trình duyệt TV.'));
 });
 cinemaButton?.addEventListener('click',leaveCinema);
 d.addEventListener('keydown',event=>{
  if(event.key==='Escape'||event.key==='Backspace'||event.keyCode===10009){
   if(d.body.classList.contains('tv-cinema')){event.preventDefault();leaveCinema();}
  }
 });
 $('tvLocalPause').addEventListener('click',()=>video.pause());
 video.addEventListener('pause',()=>{if(accepted&&!video.ended&&!suppressPause)void receiver?.reportPlayback('paused',playingName,playingId).catch(()=>{});});
 video.addEventListener('ended',()=>{if(accepted)void receiver?.reportPlayback('stopped',playingName,playingId).catch(()=>{});});
 root.addEventListener('pagehide',()=>{void receiver?.close();cleanupPlayer();});
 void boot();
})(window);
