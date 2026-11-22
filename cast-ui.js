'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const api=window.streamleaf;
 const hasNative=!!api?.castDiscover;
 let source=null, channel=null, busy=false,casting=false,selectedTarget=null,airplayScanning=false,macOS=false;
 const status=(message,error=false)=>{$('castStatus').textContent=message;$('castStatus').classList.toggle('cast-error',error);};
 const t=s=>window.OpenIPTVI18n?.t?.(s)||s;
 const close=()=>{$('castModal').classList.add('hidden');};
 const isAppleMobile=()=>{
  const ua=String(navigator.userAgent||'');
  return /iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&Number(navigator.maxTouchPoints||0)>1);
 };
 const isAndroid=()=>/Android/i.test(String(navigator.userAgent||''));
 // Browser-managed device discovery is available on some Android Chrome builds.
 // prompt() must be called synchronously within the user's Cast tap.
 function showAndroidRemoteHelp(error){
  const video=$('video'),canRetry=typeof video?.remote?.prompt==='function';
  $('castTitle').textContent='Truyền hình lên TV trên Android';
  $('castModal').dataset.airplayMobile='false';
  $('castModal').classList.remove('hidden');
  $('airplaySection').classList.add('hidden');
  for(const id of ['castPlay','castAirplay','castLink','castStop'])$(id).disabled=true;
  $('castScan').disabled=!canRetry;
  $('castScan').textContent=canRetry?'Chọn TV bằng Chrome':'Tìm TV';
  $('castScan').setAttribute('aria-label',canRetry?'Thử chọn TV bằng Chrome':'Tìm TV');
  const kind=String(error?.name||'');
  if(!error&&canRetry){
   status('Nhấn “Chọn TV bằng Chrome” để mở danh sách TV. Nếu Chrome không hỗ trợ luồng IPTV này, hãy thử kênh khác hoặc Truyền màn hình từ Android.',false);
  }else if(kind==='NotSupportedError'){
   status('Chrome nhận diện được TV nhưng không hỗ trợ truyền trực tiếp luồng đang phát. Hãy thử kênh khác hoặc dùng Truyền màn hình trên Android.',true);
  }else if(kind==='NotAllowedError'||kind==='AbortError'){
   status('Chrome đã hủy hoặc từ chối mở bộ chọn TV. Nhấn “Chọn TV bằng Chrome” để thử lại, hoặc dùng Truyền màn hình của Android.',true);
  }else if(kind==='NotFoundError'){
   status('Chrome không tìm được thiết bị tương thích với video hiện tại. Hãy kiểm tra điện thoại và TV cùng mạng Wi-Fi, sau đó thử lại.',true);
  }else if(!canRetry){
   status('Trình duyệt này không cung cấp bộ chọn TV cho trang web. Hãy mở bằng Chrome có hỗ trợ phát từ xa hoặc dùng Truyền màn hình trong Cài đặt nhanh Android.',false);
  }else{
   status('Không mở được bộ chọn TV của Chrome'+(kind?' ('+kind+')':'')+'. Hãy thử lại hoặc dùng Truyền màn hình trên Android.',true);
  }
 }
 function requestAndroidRemotePicker(){
  const video=$('video');
  if(typeof video?.remote?.prompt!=='function')return false;
  video.disableRemotePlayback=false;
  // This function is called only from the dedicated, user-tapped Chrome button.
  // Keep the Cast dialog visible: Chrome can leave prompt() pending without opening a picker.
  status('Đang yêu cầu Chrome mở bộ chọn TV…');
  try{
   const pending=video.remote.prompt();
   pending?.catch?.(error=>showAndroidRemoteHelp(error));
  }catch(error){showAndroidRemoteHelp(error);}
  return true;
 }
 // Called synchronously inside the user's Cast tap; Safari requires activation.
 function requestAirPlayPicker(){
  const video=$('video');if(!video)return false;
  video.disableRemotePlayback=false;
  video.setAttribute?.('x-webkit-airplay','allow');
  try{
   if(typeof video.webkitShowPlaybackTargetPicker==='function'){
    video.webkitShowPlaybackTargetPicker();return true;
   }
   if(typeof video.remote?.prompt==='function'){
    const pending=video.remote.prompt();
    pending?.catch?.(()=>showMobileAirPlayGuide());
    return true;
   }
  }catch(e){console.warn('AirPlay picker unavailable',e);}
  return false;
 }
 function showMobileAirPlayGuide(){
  $('castModal').dataset.airplayMobile='true';
  $('castTitle').textContent='AirPlay trên iPhone / iPad';
  $('airplaySection').classList.remove('hidden');
  $('airplayMobileHelp').hidden=false;
  $('castAirplay').textContent='Thử mở AirPlay';
  $('castAirplay').disabled=!(typeof $('video')?.webkitShowPlaybackTargetPicker==='function'||typeof $('video')?.remote?.prompt==='function');
  $('castModal').classList.remove('hidden');
  status('Trình duyệt hiện tại không mở được AirPlay. Hãy mở website trực tiếp trong Safari; nếu cần, dùng Phản chiếu màn hình trong Trung tâm điều khiển iPhone.',true);
 }
 function open(ch,url){
  channel=ch;source=url||ch?.url;
  $('castChannel').textContent=(ch?.name||'')+' · '+(ch?.group||'');
  $('castUrl').value='';$('castCopy').disabled=true;
  // Always present a visible Cast action on Android. A Remote Playback prompt
  // can be a no-op or pending forever; never hide the entire Cast UI behind it.
  if(isAndroid()&&!hasNative){
   showAndroidRemoteHelp();return;
  }
  // AirPlay device selection is owned by WebKit, not the desktop Cast backend.
  if(isAppleMobile()&&!hasNative){
   if(requestAirPlayPicker())return;
   showMobileAirPlayGuide();return;
  }
  $('castTitle').textContent='▣ Phát lên TV / thiết bị khác';
  $('castModal').dataset.airplayMobile='false';
  $('castModal').classList.remove('hidden');
  $('airplaySection').classList.toggle('hidden',navigator.platform?.toLowerCase().includes('mac')===false);
  if(!hasNative){
   $('castScan').disabled=true;$('castPlay').disabled=true;$('castAirplay').disabled=true;$('castLink').disabled=true;$('castStop').disabled=true;
   $('airplaySection').classList.add('hidden');
   $('castTitle').textContent='Phát lên TV / thiết bị khác';
   status('Trình duyệt hiện tại không hỗ trợ tìm TV trực tiếp. Google Cast trong ứng dụng desktop cần backend native; trên iPhone/iPad hãy dùng Safari và AirPlay.',false);
   return;
  }
  api.capabilities().then(c=>{macOS=c.platform==='darwin';$('airplaySection').classList.toggle('hidden',!macOS);if(macOS)scanAirplay();}).catch(()=>{});
  status('Google Cast và AirPlay là hai loại thiết bị khác nhau. Có thể tìm AirPlay ở mục bên dưới.');
  scan();
 }
 async function action(fn){if(busy)return;busy=true;
  const ids=['castScan','castPlay','castAirplay','castLink','castStop'];ids.forEach(id=>{$(id).disabled=true;});
  try{await fn();}catch(e){status(String(e.message||e),true);}
  finally{busy=false;ids.forEach(id=>{$(id).disabled=false;});}
 }
 function scan(){return action(async()=>{
  status('Đang tìm Chromecast / Google TV trong mạng nội bộ…');
  const found=await api.castDiscover();const select=$('castDevices');select.replaceChildren();
  if(!found.length){select.add(new Option('Không thấy thiết bị Google Cast',''));status('Không tìm thấy Chromecast / Google Cast. Nếu Safari thấy TV, hãy xem mục AirPlay bên dưới (hai giao thức riêng).');return;}
  for(const d of found)select.add(new Option(d.name,d.id));
  status('Đã tìm thấy '+found.length+' TV. Chọn TV rồi nhấn Phát.');
 });}
 async function scanAirplay(){
  if(airplayScanning||!api?.airplayDiscover)return;
  airplayScanning=true;const button=$('airplayScan'),list=$('airplayDeviceList');button.disabled=true;
  list.textContent='Đang tìm thiết bị AirPlay qua Bonjour trên macOS…';
  try{
   const devices=await api.airplayDiscover();list.replaceChildren();
   if(!devices.length){list.textContent='Chưa tìm thấy thiết bị AirPlay. Safari vẫn có thể dò riêng; hãy thử nút mở Safari.';return;}
   for(const device of devices){const item=document.createElement('div');item.className='airplay-device';item.textContent='◉ '+device.name+' · AirPlay';list.appendChild(item);}
  }catch(e){list.textContent='Không quét được AirPlay: '+String(e.message||e)+' · Vẫn có thể thử Safari.';}
  finally{airplayScanning=false;button.disabled=false;}
 }
 async function play(){return action(async()=>{
  const device=$('castDevices').value;if(!device)throw Error('Hãy chọn thiết bị Cast trước');
  status('Đang chuẩn bị luồng phát và kết nối TV…');
  const response=await api.castPlay(device,source,channel?.name||'IPTV');
  casting=true;selectedTarget='cast';status('Đã gửi luồng đến '+(response?.active?.name||'TV')+'. Nếu TV đen hình, hãy kiểm tra định dạng video hoặc mạng LAN.');
  document.getElementById('video')?.pause();
 });}
 async function airplay(){
  if(isAppleMobile()&&!hasNative){
   if(!requestAirPlayPicker())showMobileAirPlayGuide();
   return;
  }
  return action(async()=>{
  status('Đang mở Safari trên Mac…');
  await api.openAirplay(source);casting=true;selectedTarget='airplay';
  status('Đã mở Safari. Chọn TV bằng nút AirPlay trong trình phát Safari; ứng dụng chưa chọn TV thay bạn.');
 });}
 async function link(){return action(async()=>{
  status('Đang tạo liên kết phát trên mạng LAN…');
  const result=await api.castLan(source);
  casting=true;selectedTarget='lan';$('castUrl').value=result.page;$('castCopy').disabled=false;
  status('Mở liên kết bằng trình duyệt trên TV cùng mạng. Link sẽ ngừng hoạt động khi dừng truyền hoặc tắt ứng dụng.');
 });}
 async function stop(){return action(async()=>{
  await api.castStop();casting=false;selectedTarget=null;$('castCopy').disabled=true;$('castUrl').value='';status('Đã dừng truyền luồng.');
 });}
 function stopOnLocalStop(){if(!hasNative||!casting)return;casting=false;selectedTarget=null;api.castStop().catch(()=>{});}
 function onChannelChanged(ch){if(!casting||!channel||ch.id===channel.id)return;
  stopOnLocalStop();status('Đã đổi kênh: phiên Cast cũ được dừng. Mở Cast để phát kênh mới.');
 }
 $('castBtn')?.addEventListener('click',()=>{ /* wired by app.js with current channel */ });
 $('castClose').addEventListener('click',close);$('castDone').addEventListener('click',close);
 $('castModal').addEventListener('click',e=>{if(e.target===$('castModal'))close();});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('castModal').classList.contains('hidden'))close();});
 $('castScan').addEventListener('click',()=>{
  if(isAndroid()&&!hasNative){if(!requestAndroidRemotePicker())showAndroidRemoteHelp();return;}
  scan();
 });
 $('airplayScan').addEventListener('click',scanAirplay);
 $('castPlay').addEventListener('click',play);
 $('castAirplay').addEventListener('click',airplay);
 $('castLink').addEventListener('click',link);
 $('castStop').addEventListener('click',stop);
 $('castCopy').addEventListener('click',async()=>{
  const input=$('castUrl');if(!input.value)return;
  try{await navigator.clipboard.writeText(input.value);status('Đã sao chép địa chỉ xem trên TV.');}
  catch{input.focus();input.select();try{document.execCommand('copy');status('Đã chọn địa chỉ. Sao chép để mở trên TV.');}catch{status('Hãy sao chép link trong ô phía trên.');}}
 });
 window.OpenIPTVCastUI=Object.freeze({open,stopOnLocalStop,onChannelChanged,isAppleMobile,requestAirPlayPicker});
})();
