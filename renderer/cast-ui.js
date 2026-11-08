'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const api=window.streamleaf;
 const hasNative=!!api?.castDiscover;
 let source=null, channel=null, busy=false,casting=false,selectedTarget=null,airplayScanning=false,macOS=false;
 const status=(message,error=false)=>{$('castStatus').textContent=message;$('castStatus').classList.toggle('cast-error',error);};
 const t=s=>window.OpenIPTVI18n?.t?.(s)||s;
 const close=()=>{$('castModal').classList.add('hidden');};
 function open(ch,url){
  channel=ch;source=url||ch?.url;
  $('castChannel').textContent=(ch?.name||'')+' · '+(ch?.group||'');
  $('castUrl').value='';$('castCopy').disabled=true;
  $('castModal').classList.remove('hidden');
  $('airplaySection').classList.toggle('hidden',navigator.platform?.toLowerCase().includes('mac')===false);
  if(!hasNative){status('Chức năng Cast chỉ có trong bản ứng dụng đã cài cho Windows hoặc Mac.',true);$('castScan').disabled=true;$('castPlay').disabled=true;$('castAirplay').disabled=true;$('castLink').disabled=true;return;}
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
 async function airplay(){return action(async()=>{
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
 $('castScan').addEventListener('click',scan);
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
 window.OpenIPTVCastUI=Object.freeze({open,stopOnLocalStop,onChannelChanged});
})();
