'use strict';
/* Browser-only Google Cast Web Sender and Safari AirPlay adapter.
 * Electron continues using its native Bonjour/mDNS + LAN relay in cast-ui.js.
 * The browser never claims to expose native device discovery or a local relay.
 */
(function(root){
 if(!root?.document || root.streamleaf?.castDiscover)return;
 const doc=root.document, $=id=>doc.getElementById(id);
 const SDK='https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
 let context=null, sdkFailed=false, initialized=false, source='', channel=null, active=false, busy=false;
 const el=id=>$(id);
 const video=()=>el('video');
 const validSource=value=>{
  try{const u=new URL(String(value||''),root.location?.href);
   if(!/^https?:$/.test(u.protocol)||u.username||u.password)return '';
   if(/^(localhost|127\.|0\.0\.0\.0$|\[::1\]$)/i.test(u.hostname))return '';
   return u.href;
  }catch{return '';}
 };
 const setStatus=(message,error=false)=>{
  const node=el('castStatus');
  if(node){node.textContent=message;node.classList.toggle('cast-error',!!error);}
  root.OpenIPTVWebCastV2?.setCastFeedback?.(message,!!error);
 };
 const currentSession=()=>context?.getCurrentSession?.()||null;
 const getName=session=>session?.getCastDevice?.()?.friendlyName||'TV đã kết nối';
 const isAppleMobile=()=>/iPhone|iPad|iPod/i.test(root.navigator?.userAgent||'')||
  (/Macintosh/i.test(root.navigator?.userAgent||'')&&Number(root.navigator?.maxTouchPoints||0)>1);
 const isMac=()=>/Macintosh|Mac OS X/i.test(root.navigator?.userAgent||'');
 const isSafari=()=>/Safari/i.test(root.navigator?.userAgent||'')&&!/Chrome|Chromium|CriOS|Edg|OPR/i.test(root.navigator?.userAgent||'');
 const hasAirPlay=()=>isSafari()&&!!(video()&&(typeof video().webkitShowPlaybackTargetPicker==='function'||
   typeof video().remote?.prompt==='function'));
 function selectDevice(){
  const select=el('castDevices');if(!select)return;
  const session=currentSession();
  select.replaceChildren();
  if(session){const option=new Option(getName(session),'connected');select.add(option);select.value='connected';}
  else select.add(new Option(initialized?'Chọn TV bằng nút Tìm TV':'Đang khởi tạo Google Cast',''));
  select.disabled=true; // The Google Cast SDK owns device selection; HTML must not imply LAN scanning.
 }
 function sync(){
  const session=currentSession();
  const scan=el('castScan'),play=el('castPlay'),stop=el('castStop');
  if(scan)scan.disabled=!initialized||busy;
  if(play)play.disabled=!initialized||busy;
  if(stop)stop.disabled=!session||busy;
  selectDevice();
  root.OpenIPTVWebCastV2?.syncCast?.();
 }
 function initCast(){
  if(initialized||!root.cast?.framework?.CastContext||!root.chrome?.cast?.media)return false;
  try{
   const framework=root.cast.framework, chromeCast=root.chrome.cast;
   context=framework.CastContext.getInstance();
   context.setOptions({
    receiverApplicationId:chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy:chromeCast.AutoJoinPolicy?.ORIGIN_SCOPED
   });
   initialized=true;sdkFailed=false;
   if(framework.CastContextEventType?.SESSION_STATE_CHANGED)
    context.addEventListener(framework.CastContextEventType.SESSION_STATE_CHANGED,()=>{
     sync();
     const session=currentSession();
     if(session)setStatus('Đã kết nối '+getName(session)+'. Nhấn Phát trên TV để gửi kênh đang xem.');
     else if(active){active=false;setStatus('Đã ngắt kết nối Google Cast.');}
    });
   sync();
   setStatus('Google Cast đã sẵn sàng. Nhấn Tìm TV để chọn Chromecast / Google TV.');
   return true;
  }catch(error){sdkFailed=true;setStatus('Không khởi tạo được Google Cast: '+String(error?.message||error),true);return false;}
 }
 const previousCallback=root.__onGCastApiAvailable;
 root.__onGCastApiAvailable=function(available){
  if(typeof previousCallback==='function')try{previousCallback(available);}catch{}
  if(available)initCast();
  else{sdkFailed=true;sync();setStatus('Trình duyệt không hỗ trợ Google Cast. Trong Chrome có thể thử menu ⋮ > Truyền.',true);}
 };
 function loadSdk(){
  if(root.cast?.framework?.CastContext){initCast();return;}
  if(!doc.head?.appendChild)return;
  const script=doc.createElement('script');
  script.async=true;script.src=SDK;script.dataset.iptvCastSdk='true';
  script.onerror=()=>{sdkFailed=true;sync();setStatus('Không tải được Google Cast SDK. Kiểm tra kết nối hoặc dùng menu Truyền của Chrome.',true);};
  doc.head.appendChild(script);
 }
 function airplayPicker(){
  const media=video();if(!media)return false;
  media.disableRemotePlayback=false;
  media.setAttribute?.('x-webkit-airplay','allow');
  try{
   if(typeof media.webkitShowPlaybackTargetPicker==='function'){media.webkitShowPlaybackTargetPicker();return true;}
   if(typeof media.remote?.prompt==='function'){
    Promise.resolve(media.remote.prompt()).catch(error=>setStatus('Chưa thể chọn TV: '+String(error?.message||error),true));
    return true;
   }
  }catch(error){setStatus('Không mở được AirPlay: '+String(error?.message||error),true);}
  return false;
 }
 function renderBrowser(){
  el('castModal').dataset.airplayMobile='false';
  el('castModal').dataset.webCast='true';
  el('castTitle').textContent='Cast / AirPlay lên TV';
  el('castChannel').textContent=(channel?.name||'')+' · '+(channel?.group||'');
  const googleHint=el('castGoogleHint');
  if(googleHint)googleHint.textContent='Chromecast / Google TV: chọn TV bằng bộ chọn bảo mật của Chrome. TV và máy tính cần chung Wi-Fi. Không quét địa chỉ IP như ứng dụng Electron.';
  el('castScan').textContent='⌕ Tìm TV';
  el('castPlay').textContent='▶ Phát trên TV đã chọn';
  const airSection=el('airplaySection');
  airSection.classList.toggle('hidden',!hasAirPlay()&&!isAppleMobile()&&!isMac());
  el('airplayScan').hidden=true; // Bonjour discovery needs the Electron native process.
  el('airplayDeviceList').textContent=hasAirPlay()?'Safari tự hiển thị TV AirPlay trong bộ chọn; website không thể đọc danh sách Bonjour.':'AirPlay cần Safari trên Mac/iPhone/iPad. Nếu dùng Chrome, mở trang này trong Safari hoặc dùng Phản chiếu màn hình.';
  el('castAirplay').textContent='◉ Chọn TV bằng AirPlay';
  el('castAirplay').disabled=!hasAirPlay();
  el('airplayMobileHelp').hidden=hasAirPlay();
  const lanHint=el('castLanHint');
  if(lanHint)lanHint.textContent='Web không thể tạo máy chủ LAN như Electron. Có thể lấy URL luồng trực tiếp nếu TV tự mở được nguồn HTTP/HTTPS và bạn có quyền chia sẻ.';
  el('castLink').textContent='Lấy URL nguồn trực tiếp';
  el('castLink').disabled=!validSource(source);
  el('castCopy').disabled=true;
  el('castUrl').value='';
  sync();
  el('castModal').classList.remove('hidden');
  if(currentSession())setStatus('Đã kết nối '+getName(currentSession())+'. Nhấn Phát trên TV.');
  else if(initialized)setStatus('Nhấn Tìm TV để mở bộ chọn Google Cast của Chrome.');
  else setStatus(sdkFailed?'Không dùng được Google Cast SDK. Có thể dùng menu ⋮ > Truyền tab trong Chrome.':'Đang khởi tạo Google Cast SDK… Nếu không có thiết bị, hãy thử menu ⋮ > Truyền tab trong Chrome.',sdkFailed);
 }
 function open(ch,url){
  channel=ch;source=url||ch?.url||'';
  if(root.OpenIPTVWebCastV2?.open){root.OpenIPTVWebCastV2.open({channel:ch,source});return;}
  renderBrowser();
 }
 function castPicker(){
  if(!initialized||!context){setStatus('Google Cast chưa sẵn sàng. Dùng Chrome có hỗ trợ Cast, kiểm tra mạng và tải lại trang.',true);return Promise.resolve(null);}
  // Must call requestSession synchronously from a real click; browser requires user activation.
  let request;
  try{request=context.requestSession();}
  catch(error){setStatus('Không mở được bộ chọn Google Cast: '+String(error?.message||error),true);return Promise.resolve(null);}
  return Promise.resolve(request).then(()=>{
   const session=currentSession();
   sync();
   if(session)setStatus('Đã tìm thấy và kết nối '+getName(session)+'. Nhấn Phát trên TV.');
   else setStatus('Chưa chọn được TV. Hãy kiểm tra TV và Chrome cùng mạng Wi-Fi.',true);
   return session;
  }).catch(error=>{sync();setStatus('Chưa chọn TV: '+String(error?.message||error),true);return null;});
 }
 function scan(){return castPicker();}
 function mediaType(href){
  if(/\.m3u8?(?:$|[?#])/i.test(href))return 'application/x-mpegURL';
  if(/\.mpd(?:$|[?#])/i.test(href))return 'application/dash+xml';
  if(/\.mp4(?:$|[?#])/i.test(href))return 'video/mp4';
  if(/\.webm(?:$|[?#])/i.test(href))return 'video/webm';
  if(/\.ts(?:$|[?#])/i.test(href))return 'video/mp2t';
  return 'application/x-mpegURL';
 }
 // Retain user activation for requestSession; await only after calling it.
 async function play(){
  if(busy)return;
  const href=validSource(source);
  if(!href){setStatus('Luồng hiện tại là URL nội bộ/blob hoặc không phải HTTP(S). Web không thể relay luồng như Electron.',true);return;}
  if(!initialized){setStatus('Google Cast chưa sẵn sàng. Vui lòng dùng trình duyệt có hỗ trợ Google Cast.',true);return;}
  let session=currentSession();
  if(!session)session=await castPicker();
  if(!session)return;
  busy=true;sync();
  try{
   const chromeCast=root.chrome.cast;
   const media=new chromeCast.media.MediaInfo(href,mediaType(href));
   media.streamType=chromeCast.media.StreamType?.LIVE||'LIVE';
   if(typeof chromeCast.media.GenericMediaMetadata==='function'){
    media.metadata=new chromeCast.media.GenericMediaMetadata();
    media.metadata.title=String(channel?.name||'Open IPTV Pro').slice(0,120);
   }
   const request=new chromeCast.media.LoadRequest(media);
   request.autoplay=true;
   await session.loadMedia(request);
   active=true;
   setStatus('Đã gửi '+(channel?.name||'kênh')+' lên '+getName(session)+'. Nếu TV không phát, nguồn có thể bị giới hạn quyền truy cập hoặc codec.');
   video()?.pause?.();
  }catch(error){setStatus('Không phát được trên TV: '+String(error?.message||error),true);}
  finally{busy=false;sync();}
 }
 async function stop(){
  if(!context||!currentSession())return;
  try{await Promise.resolve(context.endCurrentSession(true));active=false;sync();setStatus('Đã dừng phiên Google Cast trên TV.');}
  catch(error){setStatus('Không dừng được Cast: '+String(error?.message||error),true);}
 }
 function link(){
  const href=validSource(source);
  if(!href){setStatus('Nguồn không có URL HTTP/HTTPS trực tiếp để chia sẻ.',true);return;}
  el('castUrl').value=href;el('castCopy').disabled=false;
  setStatus('Đây là URL nguồn trực tiếp, KHÔNG phải máy chủ LAN. URL có thể chứa mã truy cập riêng; chỉ chia sẻ với thiết bị tin cậy.');
 }
 async function copy(){
  const input=el('castUrl');if(!input.value)return;
  try{await root.navigator.clipboard.writeText(input.value);setStatus('Đã sao chép URL nguồn.');}
  catch{input.focus?.();input.select?.();setStatus('Đã chọn URL; hãy sao chép thủ công.');}
 }
 function stopOnLocalStop(){if(!active)return;void stop();}
 function onChannelChanged(next,selectedUrl){
  if(!next)return;
  const wasDifferent=next.id!==channel?.id||(selectedUrl||next.url||'')!==source;
  channel=next;source=selectedUrl||next.url||source;
  root.OpenIPTVWebCastV2?.onChannelChanged?.(next,source);
  // Changing channels must replace the remote media, not disconnect the Cast session.
  if(wasDifferent&&active&&currentSession())void play();
 }
 function initControls(){
  el('castScan')?.addEventListener('click',scan);
  el('castPlay')?.addEventListener('click',()=>{void play();});
  el('castAirplay')?.addEventListener('click',()=>{if(!airplayPicker())setStatus('Trình duyệt này không mở được bộ chọn AirPlay. Hãy dùng Safari hoặc Phản chiếu màn hình.',true);});
  el('castLink')?.addEventListener('click',link);
  el('castCopy')?.addEventListener('click',()=>{void copy();});
  el('castStop')?.addEventListener('click',()=>{void stop();});
 }
 initControls();
 loadSdk();
 const getAirplayState=()=>{
  const media=video();
  const connected=isSafari()&&!!(media&&(media.webkitCurrentPlaybackTargetIsWireless===true||
   media.remote?.state==='connected'));
  return {connected,name:connected?'AirPlay TV':''};
 };
 function initAirplayWatcher(){
  const media=video();if(!media)return;
  const update=()=>root.OpenIPTVWebCastV2?.syncAirplayState?.();
  media.addEventListener?.('webkitcurrentplaybacktargetiswirelesschanged',update);
  media.remote?.addEventListener?.('connect',update);
  media.remote?.addEventListener?.('disconnect',update);
  media.remote?.addEventListener?.('connecting',update);
  update();
 }
 async function transportRemote(action){
  const session=currentSession(),remote=session?.getMediaSession?.();
  if(!session||!remote||!['pause','resume','stop'].includes(action))return false;
  const method=action==='resume'?'play':action;
  const methodName=action==='resume'?'PlayRequest':action==='pause'?'PauseRequest':'StopRequest';
  const Request=root.chrome?.cast?.media?.[methodName];
  const request=typeof Request==='function'?new Request():{};
  try{
   await new Promise((resolve,reject)=>remote[method](request,resolve,reject));
   if(action==='stop')active=false;
   root.OpenIPTVWebCastV2?.syncCast?.();
   return true;
  }catch(error){setStatus('Không điều khiển được TV qua Google Cast: '+String(error?.message||error),true);return false;}
 }
 initAirplayWatcher();
 const getState=()=>({initialized,connected:!!currentSession(),name:currentSession()?getName(currentSession()):'',active});
 root.OpenIPTVWebCast=Object.freeze({open,scan,play,stop,stopOnLocalStop,onChannelChanged,airplayPicker,validSource,mediaType,getState,getAirplayState,transportRemote});
})(typeof window==='undefined'?null:window);
