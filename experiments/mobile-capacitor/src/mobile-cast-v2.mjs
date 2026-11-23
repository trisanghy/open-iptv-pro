/* Open IPTV Pro Mobile — Web Cast V2 native transport adapter.
 * Same 3-tab UI as web/online, without inventing device discovery/connection.
 * TV pairing uses the original ECDH/AES-GCM Web TV controller.
 */
export function mobileCastCapabilities({platform='web',remoteState='disconnected',wireless=false,hasRemotePrompt=false,hasAirplayPicker=false}={}){
 const apple=platform==='ios';
 return Object.freeze({
  googleCastAvailable:platform==='android'||(!apple&&hasRemotePrompt),
  googleCastConnected:!apple&&remoteState==='connected',
  airplayAvailable:apple&&(hasAirplayPicker||hasRemotePrompt),
  airplayConnected:apple&&(wireless||remoteState==='connected')
 });
}
export function installMobileCastV2({getVideo,getChannel,getSource,platform='web',native=false,launchAndroidCast=async()=>{},notify=()=>{}}){
 const root=window,doc=document;
 const video=()=>getVideo?.()||doc.getElementById('webVideo');
 const isIOS=platform==='ios',isAndroidNative=native&&platform==='android';
 let remoteConnecting=false;
 const web=()=>root.OpenIPTVWebCastV2;
 const remote=()=>video()?.remote;
 const isWireless=()=>!!video()?.webkitCurrentPlaybackTargetIsWireless;
 const state=()=>mobileCastCapabilities({
  platform,remoteState:remote()?.state||'disconnected',wireless:isWireless(),
  hasRemotePrompt:typeof remote()?.prompt==='function',
  hasAirplayPicker:typeof video()?.webkitShowPlaybackTargetPicker==='function'
 });
 const notifyCast=(message,isError=false)=>{web()?.setCastFeedback?.(message,isError);notify(message,isError?'error':'ok');};
 const update=()=>{
  web()?.syncCast?.();web()?.syncAirplayState?.();
  const v=video();if(v)web()?.onLocalVolumeChanged?.(v.volume,v.muted);
 };
 // Web V2's original volume control expects an HTML input beside the video.
 // Mobile has a compact speaker icon, so keep an invisible range bridge only.
 const bridge=doc.createElement('input');
 bridge.id='mobileCastVolumeBridge';bridge.type='range';bridge.min='0';bridge.max='100';
 bridge.value='80';bridge.hidden=true;bridge.setAttribute('aria-hidden','true');
 bridge.tabIndex=-1;doc.body.append(bridge);
 bridge.addEventListener('input',()=>{
  const v=video();if(!v)return;
  const level=Math.max(0,Math.min(1,(Number(bridge.value)||0)/100));
  v.volume=level;v.muted=level===0;update();
 });
 const v=video();
 v?.addEventListener('volumechange',()=>{
  bridge.value=String(Math.round((v.volume||0)*100));
  update();
 });
 for(const name of ['connect','disconnect','connecting']){
  remote()?.addEventListener?.(name,()=>{
   update();
   if(name==='connect')notifyCast('Đã kết nối bằng bộ chọn phát từ xa của hệ thống.');
  });
 }
 v?.addEventListener('webkitcurrentplaybacktargetiswirelesschanged',update);
 async function scan(){
  if(isAndroidNative){
   // The installed Android native video player exposes Cast in its own UI.
   // It does not offer a JS device enumeration API. Do not fake scan results.
   if(!getChannel?.())throw Error('Hãy chọn kênh trước khi mở Google Cast.');
   web()?.close?.();
   notifyCast('Đang mở trình phát Android; chạm biểu tượng Chromecast trong trình phát.');
   await launchAndroidCast();
   return [];
  }
  if(state().googleCastAvailable&&typeof remote()?.prompt==='function'){
   if(remoteConnecting)return [];
   remoteConnecting=true;
   try{
    await remote().prompt();update();
    notifyCast(remote()?.state==='connected'?'Thiết bị đã kết nối.':'Đã mở bộ chọn phát từ xa; hãy chọn TV.');
    return [];
   }finally{remoteConnecting=false;}
  }
  throw Error(isIOS?'Google Cast không được hỗ trợ trực tiếp trong WKWebView iOS. Hãy dùng tab AirPlay hoặc ghép đôi TV.':
   'Trình duyệt chưa hỗ trợ chọn Google Cast. Hãy dùng Chrome Android hoặc ghép đôi TV.');
 }
 async function play(){
  if(!state().googleCastConnected){
   if(isAndroidNative)return scan();
   throw Error('Hãy chọn TV qua Tìm thiết bị trước.');
  }
  const v=video();if(!v)throw Error('Không tìm thấy trình phát video.');
  if(v.paused)await v.play();
  update();
  notifyCast('Đang dùng bộ chọn phát từ xa của hệ thống. Trạng thái kết nối đã được xác nhận.');
  return true;
 }
 async function stop(){
  if(!state().googleCastConnected)throw Error('Chưa kết nối Google Cast.');
  const v=video();if(!v)throw Error('Không tìm thấy trình phát video.');
  v.pause();update();
  notifyCast('Đã tạm dừng video trên thiết bị phát. Ngắt kết nối trong bộ chọn hệ thống nếu muốn.');
  return true;
 }
 function airplayPicker(){
  if(!isIOS)throw Error('AirPlay trong ứng dụng hỗ trợ iPhone/iPad; Android hãy dùng Google Cast hoặc ghép đôi TV.');
  const v=video();
  if(!v?.currentSrc)throw Error('Chọn và phát một kênh trước khi dùng AirPlay.');
  v.disableRemotePlayback=false;
  v.setAttribute('x-webkit-airplay','allow');
  // Must be invoked synchronously from cxAirOpen click; no await before picker.
  if(typeof v.webkitShowPlaybackTargetPicker==='function'){
   v.webkitShowPlaybackTargetPicker();return true;
  }
  if(typeof remote()?.prompt==='function')return remote().prompt().then(()=>true);
  throw Error('WKWebView chưa hỗ trợ bộ chọn AirPlay; hãy thử Safari hoặc Phản chiếu màn hình.');
 }
 const cast=Object.freeze({
  getState:()=>({initialized:state().googleCastAvailable,
   connected:state().googleCastConnected,active:state().googleCastConnected,
   name:state().googleCastConnected?'TV đã chọn từ hệ thống':''}),
  getAirplayState:()=>({connected:state().airplayConnected}),
  scan,play,stop,airplayPicker,
  transportRemote:async()=>false,
  setReceiverVolume:async()=>false
 });
 root.OpenIPTVWebCast=cast;
 root.OpenIPTVMobileCastNative=Object.freeze({state,scan,airplayPicker});
 return Object.freeze({
  open(){
   const channel=getChannel?.()||null,source=getSource?.()||channel?.url||'';
   if(!web()?.open)throw Error('Giao diện Web Cast V2 chưa được tải.');
   web().open({channel,source});
   const scanButton=doc.getElementById('cxCastScan');
   if(scanButton&&isAndroidNative)scanButton.textContent='◫ Mở trình phát để Cast';
   const status=doc.getElementById('cxCastDevice');
   if(status&&isAndroidNative&&!state().googleCastConnected){
    status.textContent='Android: chọn Chromecast trong trình phát native. Ứng dụng không báo đã kết nối khi chưa có xác nhận.';
   }
   const airLabel=doc.querySelector('#cxPaneAir .cx-sectionhead p');
   if(airLabel&&isIOS)airLabel.textContent='Dùng bộ chọn AirPlay thật của iPhone hoặc iPad.';
   update();
  },
  onChannelChanged(ch,url){web()?.onChannelChanged?.(ch,url);},
  onLocalStop(){return web()?.onLocalStop?.();},
  getStatus(){return web()?.getStatus?.()||{pair:false,cast:false,airplay:false};}
 });
}
