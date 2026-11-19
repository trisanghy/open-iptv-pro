// Adapted from Web background audio mode: explicit action, HTMLAudioElement,
// HLS, Media Session and screen-lock media buttons. Not a native OS bypass.
export function validBackgroundStream(value){
 try{const url=new URL(value);return (url.protocol==='https:'||url.protocol==='http:')&&!!url.hostname;}catch{return false;}
}
export function backgroundAudioAllowed(settings){return settings?.backgroundAudioEnabled!==false;}
export function createMobileBackgroundAudio({video,getChannel,getStreamURL,getSettings,
 onStateChange=()=>{},onStatus=()=>{},onNavigate=()=>{},onStop=()=>{},
 documentRef=globalThis.document,navigatorRef=globalThis.navigator,HlsImpl=null,translate=key=>key}={}){
 const t=key=>translate(key)||key;
 const session=navigatorRef?.mediaSession||null;
 let audio=null,hls=null,active=false,current=null,streamUrl='',transition=0,ownsAudioSession=false;
 const enabled=()=>backgroundAudioAllowed(getSettings());
 const notify=()=>onStateChange({active,paused:!audio||audio.paused,muted:!!audio?.muted});
 const refresh=()=>{try{if(session)session.playbackState=active&&audio?(audio.paused?'paused':'playing'):'none';}catch{}notify();};
 const action=(name,fn)=>{try{session?.setActionHandler?.(name,fn);}catch{}};
 function audioSession(on){
  if(on){try{if(navigatorRef?.audioSession){navigatorRef.audioSession.type='playback';ownsAudioSession=true;}}catch{}}
  else if(ownsAudioSession){try{navigatorRef.audioSession.type='auto';}catch{}ownsAudioSession=false;}
 }
 function metadata(channel){
  if(!channel||!session)return;
  const info={title:String(channel.name||'Kênh TV'),artist:String(channel.group||'Open IPTV Pro'),album:'Open IPTV Pro'};
  if(validBackgroundStream(channel.logo))info.artwork=[{src:channel.logo}];
  try{session.metadata=typeof globalThis.MediaMetadata==='function'?new globalThis.MediaMetadata(info):info;}catch{}
 }
 function register(){
  action('play',()=>{void togglePlayback(true).catch(e=>onStatus(t('Màn hình khóa')+': '+t(e.message),'error'));});
  action('pause',()=>{void togglePlayback(false);});
  action('stop',()=>onStop());
  action('previoustrack',()=>{void Promise.resolve(onNavigate(-1)).catch(e=>onStatus(t('Kênh trước')+': '+t(e.message),'error'));});
  action('nexttrack',()=>{void Promise.resolve(onNavigate(1)).catch(e=>onStatus(t('Kênh tiếp')+': '+t(e.message),'error'));});
 }
 function unregister(){
  for(const key of ['play','pause','stop','previoustrack','nexttrack'])action(key,null);
  try{if(session){session.metadata=null;session.playbackState='none';}}catch{}
 }
 function detach(){
  transition++;
  try{hls?.destroy();}catch{}hls=null;
  const old=audio;audio=null;
  if(old)try{old.pause();old.removeAttribute('src');old.load?.();old.remove?.();}catch{}
 }
 function makeAudio(){
  const node=documentRef.createElement('audio');
  node.id='openIPTVMobileBackgroundAudio';node.preload='auto';node.autoplay=false;node.controls=false;
  node.muted=false;node.volume=video?.volume??1;
  node.setAttribute('playsinline','');
  node.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
  for(const name of ['play','playing','pause','ended','volumechange'])
   node.addEventListener(name,()=>{if(active&&audio===node)refresh();});
  node.addEventListener('error',()=>{if(active&&audio===node)onStatus(t('Âm thanh nền bị lỗi. Hãy thử kênh hoặc link khác.'),'error');});
  documentRef.body.append(node);return node;
 }
 function source(channel){
  const link=getStreamURL(channel);
  if(!validBackgroundStream(link))throw Error(t('Nguồn âm thanh phải là URL HTTP/HTTPS hợp lệ'));
  return link;
 }
 function startStream(node,url){
  try{hls?.destroy();}catch{}hls=null;
  node.pause();node.removeAttribute('src');node.load?.();
  if(/\.m3u8(?:$|[?#&])/i.test(url)&&!node.canPlayType?.('application/vnd.apple.mpegurl')){
   if(!HlsImpl?.isSupported?.())throw Error(t('WebView không hỗ trợ âm thanh HLS của kênh này'));
   hls=new HlsImpl({enableWorker:false,maxBufferLength:10});
   hls.attachMedia(node);hls.loadSource(url);
  }else{node.src=url;node.load?.();}
  // Start play during the originating user action; iOS rejects delayed first play.
  return node.play();
 }
 async function activate(){
  if(active)return true;
  if(!enabled()){onStatus(t('Hãy bật Nghe nền trong phần Cài đặt.'),'error');return false;}
  if(documentRef.visibilityState==='hidden'){onStatus(t('Bật Nghe nền khi ứng dụng đang mở.'),'error');return false;}
  const channel=getChannel();
  if(!channel||!video||video.paused){onStatus(t('Phát một kênh trong khung TV trước khi nghe nền.'),'error');return false;}
  let url;try{url=source(channel);}catch(e){onStatus(e.message,'error');return false;}
  const token=++transition;
  audio=makeAudio();active=true;current=channel;streamUrl=url;
  register();metadata(channel);audioSession(true);
  let task;try{task=startStream(audio,url);}catch(e){deactivate(false);onStatus(e.message,'error');return false;}
  try{
   await task;if(token!==transition)return false;
   video.pause();refresh();onStatus(t('Đang nghe nền · có thể khóa màn hình nếu thiết bị hỗ trợ.'),'ok');return true;
  }catch(e){
   if(token!==transition)return false;
   deactivate(false);onStatus(t('Không bật được Nghe nền')+': '+t(e.message||String(e))+'. '+t('Vẫn giữ video trong khung.'),'error');
   return false;
  }
 }
 async function switchChannel(channel){
  if(!active)return false;
  let url;try{url=source(channel);}catch(e){onStatus(e.message,'error');return false;}
  if(current?.url===channel.url&&streamUrl===url)return true;
  const old={channel:current,url:streamUrl},token=++transition;
  current=channel;streamUrl=url;metadata(channel);
  try{await startStream(audio,url);if(token!==transition)return false;refresh();return true;}
  catch(e){
   if(token!==transition)return false;
   onStatus(t('Kênh mới không có tiếng')+': '+t(e.message||String(e))+'. '+t('Đang khôi phục kênh cũ.'),'error');
   current=old.channel;streamUrl=old.url;metadata(current);
   try{await startStream(audio,old.url);}catch{onStatus(t('Không thể khôi phục âm thanh cũ.'),'error');}
   refresh();return false;
  }
 }
 function deactivate(restoreVideo=false){
  if(!active&&!audio)return;
  active=false;current=null;streamUrl='';detach();unregister();audioSession(false);notify();
  if(restoreVideo&&video?.currentSrc){
   try{Promise.resolve(video.play()).catch(()=>onStatus(t('Nhấn Phát để tiếp tục xem TV.'),'error'));}
   catch{onStatus(t('Nhấn Phát để tiếp tục xem TV.'),'error');}
  }
 }
 async function togglePlayback(force){
  if(!active||!audio)return false;
  if(typeof force==='boolean'?force:audio.paused){audioSession(true);await audio.play();}
  else audio.pause();
  refresh();return true;
 }
 function setMuted(value){if(active&&audio){audio.muted=!!value;refresh();}}
 function toggle(){return active?(deactivate(true),Promise.resolve(false)):activate();}
 return Object.freeze({get active(){return active;},get paused(){return !audio||audio.paused;},
  get muted(){return !!audio?.muted;},activate,deactivate,switchChannel,togglePlayback,setMuted,toggle,
  disable(){deactivate(false);},refreshMetadata(){if(active)metadata(current);}});
}
