'use strict';
/* Desktop transport adapter for the exact Web Cast V2 three-tab dialog.
   Pairing remains the Web ECDH/AES-GCM controller; Cast and AirPlay use IPC. */
(function(root){
 if(!root?.document)return;
 const d=root.document,api=root.streamleaf,$=id=>d.getElementById(id);
 let channel=null,source='',devices=[],chosen='',active=false,activeName='',serial=0;
 let isMac=/Mac/i.test(root.navigator?.platform||root.navigator?.userAgent||'');
 let scanned=false,capabilityProbe=null;
 const v2=()=>root.OpenIPTVWebCastV2;
 const message=e=>String(e?.message||e||'Lỗi không xác định');
 const currentDevice=()=>devices.find(x=>x.id===chosen);
 const feedback=(s,error=false)=>v2()?.setCastFeedback?.(s,error);
 const sync=()=>v2()?.syncCast?.();
 function validUrl(){
  try{const url=new URL(String(source||'').trim());
   return /^https?:$/.test(url.protocol)&&!url.username&&!url.password?url.href:'';
  }catch{return '';}
 }
 async function capabilities(){
  if(capabilityProbe)return capabilityProbe;
  capabilityProbe=(async()=>{
   try{if(api?.capabilities){const result=await api.capabilities();isMac=result?.platform==='darwin';}}
   catch{/* Navigator remains the platform fallback. */}
   v2()?.syncAirplayState?.();
   return isMac;
  })();
  try{return await capabilityProbe;}finally{capabilityProbe=null;}
 }
 function picker(){
  const pane=$('cxPaneCast');
  if(!pane||$('cxDesktopDevices'))return;
  const card=pane.querySelector('.cx-grid .cx-card.cx-feature');
  const buttons=card?.querySelector('.cx-inline');
  if(!buttons)return;
  const box=d.createElement('div');box.className='cx-desktop-device-wrap';
  const label=d.createElement('label');label.htmlFor='cxDesktopDevices';label.className='cx-label';
  label.textContent='TV Google Cast trong mạng nội bộ';
  const select=d.createElement('select');select.id='cxDesktopDevices';
  select.className='cx-desktop-device-select';select.setAttribute('aria-label','Chọn Chromecast / Google TV');
  select.add(new Option('Nhấn Tìm thiết bị để dò TV',''));
  select.addEventListener('change',()=>{chosen=select.value;sync();});
  box.append(label,select);card.insertBefore(box,buttons);
  pane.querySelector('.cx-sectionhead p').textContent='Dò Chromecast và Google TV qua LAN bằng ứng dụng desktop.';
  const air=$('cxPaneAir');
  if(air)air.querySelector('.cx-sectionhead p').textContent='Mở Safari trên macOS và chọn TV qua AirPlay.';
 }
 async function scan(){
  if(typeof api?.castDiscover!=='function')throw Error('Thiếu API quét TV native.');
  const raw=await api.castDiscover();
  devices=(Array.isArray(raw)?raw:[]).filter(x=>x&&x.id&&x.name)
   .map(x=>({id:String(x.id),name:String(x.name)}));
  if(!devices.some(x=>x.id===chosen))chosen=devices[0]?.id||'';
  const select=$('cxDesktopDevices');
  if(select){
   select.replaceChildren();
   if(!devices.length)select.add(new Option('Không tìm thấy thiết bị',''));
   for(const device of devices)select.add(new Option(device.name,device.id));
   select.value=chosen;
  }
  scanned=true;sync();
  feedback(devices.length?'Đã tìm thấy '+devices.length+' TV. Chọn thiết bị rồi nhấn Phát.':'Không tìm thấy TV. Kiểm tra mạng LAN và TV.',!devices.length);
  return devices;
 }
 async function stop(){
  ++serial;
  if(api?.castStop)await api.castStop();
  active=false;activeName='';sync();feedback('Đã dừng Google Cast.');
  return true;
 }
 async function play(){
  const device=currentDevice();
  if(!device)throw Error('Cần tìm và chọn Chromecast / Google TV trước.');
  const url=validUrl();if(!url)throw Error('Luồng phát phải có URL HTTP/HTTPS hợp lệ.');
  if(typeof api?.castPlay!=='function')throw Error('Thiếu API phát Google Cast native.');
  if(v2()?.getStatus?.().pair)await v2().disconnectPair();
  const token=++serial;
  try{
   const result=await api.castPlay(device.id,url,String(channel?.name||'Open IPTV Pro'));
   if(token!==serial)return result;
   active=true;activeName=String(result?.active?.name||device.name);
   d.dispatchEvent(new root.CustomEvent('openiptv:remote-player-attached',{detail:{method:'cast'}}));
   sync();feedback('Đã gửi luồng đến '+activeName+'.');
   return result;
  }catch(e){if(token===serial){active=false;sync();}feedback('Cast thất bại: '+message(e),true);throw e;}
 }
 async function airplayPicker(){
  await capabilities();
  if(!isMac)throw Error('AirPlay qua Safari chỉ khả dụng trên macOS.');
  if(typeof api?.openAirplay!=='function')throw Error('Thiếu API mở Safari.');
  const url=validUrl();if(!url)throw Error('Hãy chọn kênh có URL HTTP/HTTPS trước.');
  if(v2()?.getStatus?.().pair)await v2().disconnectPair();
  if(active)await stop();
  await api.openAirplay(url);
  return true; // Safari opening does not establish that a TV has connected.
 }
 function changeChannel(ch,url){
  if(ch)channel=ch;source=url||ch?.url||source;
  if(!active||!chosen)return;
  const next=validUrl();
  if(!next){void stop().catch(e=>feedback(message(e),true));return;}
  const token=++serial;
  Promise.resolve(api.castPlay(chosen,next,String(channel?.name||'Open IPTV Pro')))
   .then(result=>{if(token!==serial)return;
    activeName=String(result?.active?.name||currentDevice()?.name||activeName);
    d.dispatchEvent(new root.CustomEvent('openiptv:remote-player-attached',{detail:{method:'cast'}}));
    sync();feedback('Đã chuyển kênh trên '+activeName+'.');
   }).catch(e=>{if(token!==serial)return;active=false;sync();feedback('Lỗi đổi kênh Cast: '+message(e),true);});
 }
 root.OpenIPTVWebCast=Object.freeze({
  getState:()=>({initialized:typeof api?.castDiscover==='function',connected:active,
    active,selected:currentDevice()?.name||'',name:activeName}),
  getAirplayState:()=>({connected:false}),scan,play,stop,airplayPicker,
  transportRemote:async()=>false,setReceiverVolume:async()=>false
 });
 root.OpenIPTVDesktopCastNative=Object.freeze({supportsAirplay:()=>isMac,scan,play,stop,changeChannel});
 // The existing desktop player checks this compatibility API before decoding.
 // Treat an active Cast as remote-owned as well as an encrypted paired TV.
 root.OpenIPTVDesktopTVPair=Object.freeze({
  isConnected:()=>!!v2()?.getStatus?.().pair||active,
  getStatus:()=>({connected:!!v2()?.getStatus?.().pair||active,state:v2()?.getStatus?.().remoteState||'stopped'}),
  setCurrent:(ch,url)=>{if(ch)channel=ch;source=url||ch?.url||source;},
  onChannelChanged:(ch,url)=>v2()?.onChannelChanged?.(ch,url),
  onVolume:(vol,muted)=>v2()?.onLocalVolumeChanged?.(vol,muted),
  onLocalStop:()=>{void v2()?.onLocalStop?.();if(active)void stop().catch(e=>feedback(message(e),true));},
  toggle:()=>{if(active){feedback('Chưa hỗ trợ Tạm dừng Cast qua API native; dùng Dừng trong tab Cast.',true);return Promise.resolve(false);}return v2()?.toggleRemotePlayback?.()||Promise.resolve(false);},
  disconnect:()=>active?stop():v2()?.disconnectPair?.()
 });
 root.OpenIPTVCastUI=Object.freeze({
  open:(ch,url)=>{
   if(ch)channel=ch;source=url||ch?.url||source;
   v2()?.open?.({channel:ch,source});picker();sync();void capabilities();
  },
  onChannelChanged:(ch,url)=>{v2()?.onChannelChanged?.(ch,url);changeChannel(ch,url);},
  stopOnLocalStop:()=>{void v2()?.onLocalStop?.();if(active)void stop().catch(e=>feedback(message(e),true));},
  isRemoteActive:()=>!!v2()?.getStatus?.().pair||active
 });
})(typeof window==='undefined'?null:window);
