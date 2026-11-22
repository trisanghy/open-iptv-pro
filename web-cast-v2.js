'use strict';
/* Demo-approved Web Cast interface. Real SDK, Safari picker and encrypted TV pairing. */
(function(root){
 if(!root?.document)return;
 const d=root.document,$=id=>d.getElementById(id);
 let overlay=null,mode='pair',channel=null,source='',pair=null,pairPending=false;
 let remoteState='stopped',lastSentKey='',lastMediaId='',playSerial=0,commandQueue=Promise.resolve();
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 const tvUrl=()=> 'https://is.gd/IPTVTV';
 const tvOriginalUrl=()=> 'https://trisanghy.github.io/open-iptv-pro/tv.html';
 const validSource=()=>root.OpenIPTVTVPair?.validateUrl(source)||'';
 const set=(id,text)=>{if($(id))$(id).textContent=text;};
 function notice(id,text,kind=''){const n=$(id);if(n){n.textContent=text;n.dataset.kind=kind;}}
 function castState(){return root.OpenIPTVWebCast?.getState?.()||{initialized:false,connected:false,name:''};}
 function renderConnectionStatus(){
  const cast=castState(),air=root.OpenIPTVWebCast?.getAirplayState?.()||{connected:false};
  let label='Cast / AirPlay',detail='Cast / AirPlay lên TV',kind='none';
  if(air.connected){label='AirPlay · Đã kết nối';detail='Đã kết nối TV qua AirPlay';kind='airplay';}
  else if(cast.connected&&cast.active){label='Cast · Đã kết nối';detail='Đang phát trên Google Cast: '+cast.name;kind='cast';}
  else if(pair?.connected&&remoteState!=='stopped'){label='TV · Đã kết nối';detail='Đang điều khiển TV đã ghép đôi';kind='pair';}
  else if(cast.connected){label='Cast · Đã kết nối';detail='Đã kết nối Google Cast: '+cast.name;kind='cast';}
  else if(pair?.connected){label='TV · Đã kết nối';detail='Đã kết nối TV qua mã ghép đôi';kind='pair';}
  const button=$('castBtn');
  if(button){
   button.dataset.castConnection=kind;
   button.title=detail;
   button.setAttribute('aria-label',detail);
   const caption=button.querySelector('.cast-label');
   if(caption)caption.textContent=label;
   button.setAttribute('aria-pressed',String(kind!=='none'));
  }
  if(overlay){
   for(const [tab,connected] of [['cxTabPair',!!pair?.connected],['cxTabCast',!!cast.connected],['cxTabAir',!!air.connected]]){
    const node=$(tab);if(node)node.dataset.connected=String(connected);
   }
   const airBadge=$('cxAirBadge');
   if(airBadge){airBadge.dataset.ok=String(!!air.connected);airBadge.textContent=air.connected?'● AirPlay · Đã kết nối':'● AirPlay hệ thống';}
  }
 }
 function build(){
  if(overlay)return;
  overlay=d.createElement('div');overlay.id='iptvCastOverlay';overlay.hidden=true;
  overlay.innerHTML="\n<div id=\"iptvCastPanel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"cxTitle\">\n <header class=\"cx-head\"><div class=\"cx-title-line\"><span class=\"cx-icon\" aria-hidden=\"true\">▣</span><div>\n  <h2 id=\"cxTitle\">Cast / AirPlay lên TV</h2><p class=\"cx-sub\">Kết nối TV, phát kênh và điều khiển từ Open IPTV Pro</p>\n </div></div><button id=\"cxClose\" class=\"cx-close\" type=\"button\" aria-label=\"Đóng\">×</button></header>\n <nav class=\"cx-tabs\" role=\"tablist\" aria-label=\"Chọn phương thức kết nối\">\n  <button class=\"cx-tab\" role=\"tab\" aria-selected=\"true\" aria-controls=\"cxPanePair\" id=\"cxTabPair\" data-cx-mode=\"pair\">▣ Ghép đôi TV</button>\n  <button class=\"cx-tab\" role=\"tab\" aria-selected=\"false\" aria-controls=\"cxPaneCast\" id=\"cxTabCast\" data-cx-mode=\"cast\">◫ Google Cast</button>\n  <button class=\"cx-tab\" role=\"tab\" aria-selected=\"false\" aria-controls=\"cxPaneAir\" id=\"cxTabAir\" data-cx-mode=\"air\">◭ AirPlay</button>\n </nav>\n <div class=\"cx-main\">\n  <section id=\"cxPanePair\" class=\"cx-pane\" role=\"tabpanel\" aria-labelledby=\"cxTabPair\">\n   <div class=\"cx-sectionhead\"><div><h3>Ghép đôi TV bằng mã 6 số</h3>\n    <p>Điều khiển trình duyệt TV Samsung hoặc Smart TV mà không cần Chromecast.</p></div>\n    <span class=\"cx-chip\" id=\"cxPairBadge\"><span class=\"cx-dot\"></span><span id=\"cxPairBadgeText\">Chưa kết nối</span></span>\n   </div>\n   <div class=\"cx-grid\">\n    <div class=\"cx-card\"><span class=\"cx-eyebrow\">BƯỚC 01 · KẾT NỐI</span>\n     <h4>Mở Open IPTV Pro trên TV</h4>\n     <p class=\"cx-p\">Mở địa chỉ dưới đây bằng trình duyệt của TV. TV sẽ tự tạo mã 6 số.</p>\n     <div class=\"cx-link-stack\">\n      <div class=\"cx-link-row\"><span class=\"cx-link-type\">Link rút gọn</span><a id=\"cxTvUrl\" class=\"cx-link\" href=\"tv.html\" target=\"_blank\" rel=\"noopener noreferrer\">https://is.gd/IPTVTV</a><button id=\"cxCopyTv\" class=\"cx-button cx-button-secondary\" type=\"button\">⧉ Sao chép</button></div>\n      <div class=\"cx-link-row\"><span class=\"cx-link-type\">Link gốc dự phòng</span><a id=\"cxTvOriginalUrl\" class=\"cx-link\" href=\"tv.html\" target=\"_blank\" rel=\"noopener noreferrer\">https://trisanghy.github.io/open-iptv-pro/tv.html</a><button id=\"cxCopyTvOriginal\" class=\"cx-button cx-button-secondary\" type=\"button\">⧉ Sao chép</button></div>\n     </div>\n     <ol class=\"cx-steps\"><li><b>1</b> TV hiển thị mã 6 số.</li>\n      <li><b>2</b> Nhập mã vào ô bên dưới.</li>\n      <li><b>3</b> Chọn “Cho phép” trên màn hình TV.</li></ol>\n     <div id=\"cxPairForm\"><label class=\"cx-label\" for=\"cxPin\">Nhập mã ghép đôi trên TV</label>\n      <div class=\"cx-inline\"><input id=\"cxPin\" class=\"cx-pin\" inputmode=\"numeric\" autocomplete=\"one-time-code\" maxlength=\"7\" placeholder=\"000 000\" aria-label=\"Mã TV gồm 6 số\">\n       <button id=\"cxConnect\" class=\"cx-button cx-button-primary\" type=\"button\">↗ Kết nối</button></div></div>\n     <div class=\"cx-remote\" id=\"cxRemote\" hidden>\n      <span class=\"cx-eyebrow\">BƯỚC 02 · ĐIỀU KHIỂN</span>\n      <label class=\"cx-label\">Kênh hiện tại</label><div id=\"cxChannel\" class=\"cx-channelname\">Chưa chọn kênh</div>\n      <p class=\"cx-p\" style=\"margin:7px 0 13px\">Chọn kênh trên Open IPTV Pro, rồi nhấn Phát lên TV.</p>\n      <div class=\"cx-inline\">\n       <button id=\"cxRemotePlay\" class=\"cx-button cx-button-primary\" type=\"button\">▶ Phát lên TV</button>\n       <button id=\"cxRemotePause\" class=\"cx-button\" type=\"button\">Ⅱ Tạm dừng</button>\n       <button id=\"cxRemoteResume\" class=\"cx-button\" type=\"button\">▶ Tiếp tục</button>\n       <button id=\"cxRemoteStop\" class=\"cx-button\" type=\"button\">■ Dừng</button>\n       <button id=\"cxDisconnect\" class=\"cx-button cx-button-secondary\" type=\"button\">Ngắt kết nối</button>\n      </div>\n     </div>\n     <p id=\"cxPairNotice\" class=\"cx-notice\" role=\"status\" aria-live=\"polite\">Mở trang TV và nhập mã do thiết bị TV tạo để bắt đầu.</p>\n    </div>\n    <div class=\"cx-card cx-tvcard\"><div class=\"cx-toptv\"><span class=\"cx-eyebrow\">GIAO DIỆN TV</span><span class=\"cx-tvbadge\">SMART TV</span></div>\n     <div class=\"cx-tv\" aria-label=\"Minh họa trạng thái TV\"><div class=\"cx-tvcontent\">\n      <div class=\"cx-tvlogo\">▣ OPEN IPTV PRO · TV</div>\n      <div id=\"cxTvLine\" class=\"cx-tvdesc\">Mã do TV thật tạo khi mở trang TV</div>\n      <div class=\"cx-tvcode\" id=\"cxTvCode\">••• •••</div>\n      <div id=\"cxTvSub\" class=\"cx-tvdesc\">Không dùng mã cố định của bản demo</div>\n      <span id=\"cxTvChip\" class=\"cx-tvstatus\">● Đang chờ mã</span>\n     </div></div><div class=\"cx-tvstand\" aria-hidden=\"true\"></div>\n     <p class=\"cx-p\" style=\"margin-top:20px;text-align:center\">Mã thật chỉ xuất hiện trên TV. Trạng thái kết nối được cập nhật trực tiếp.</p>\n    </div>\n   </div>\n  </section>\n  <section id=\"cxPaneCast\" class=\"cx-pane\" role=\"tabpanel\" aria-labelledby=\"cxTabCast\" hidden>\n   <div class=\"cx-sectionhead\"><div><h3>Google Cast / Chromecast / Google TV</h3>\n    <p>Chọn TV qua bộ chọn của Chrome, không quét IP như Electron.</p></div>\n    <span class=\"cx-chip\" id=\"cxCastBadge\"><span class=\"cx-dot\"></span><span id=\"cxCastBadgeText\">Chưa kết nối</span></span></div>\n   <div class=\"cx-grid\"><div class=\"cx-card cx-feature\"><span class=\"cx-featureicon\">◫</span><h4>Chọn Chromecast / Google TV</h4>\n    <p class=\"cx-p\">TV cần hỗ trợ Google Cast và chung Wi-Fi. TV chỉ hỗ trợ AirPlay có thể không xuất hiện.</p>\n    <div class=\"cx-inline\" style=\"margin-top:20px\">\n     <button id=\"cxCastScan\" class=\"cx-button cx-button-primary\" type=\"button\">⌕ Tìm thiết bị</button>\n     <button id=\"cxCastPlay\" class=\"cx-button\" type=\"button\" disabled>▶ Phát trên TV</button>\n     <button id=\"cxCastStop\" class=\"cx-button\" type=\"button\" disabled>■ Dừng</button></div>\n    <p class=\"cx-notice\" id=\"cxCastNotice\" role=\"status\">Đang kiểm tra Google Cast SDK…</p></div>\n    <div class=\"cx-card cx-feature\"><span class=\"cx-eyebrow\">THIẾT BỊ THỰC</span>\n     <div class=\"cx-statuscard\" id=\"cxCastDevice\">Chưa có TV được chọn. Chrome sẽ mở danh sách thiết bị thực tế.</div>\n     <p class=\"cx-p\" style=\"margin-top:19px\">Luồng HTTP/HTTPS phải được TV truy cập và hỗ trợ codec. Web không có proxy LAN của Electron.</p></div>\n   </div>\n  </section>\n  <section id=\"cxPaneAir\" class=\"cx-pane\" role=\"tabpanel\" aria-labelledby=\"cxTabAir\" hidden>\n   <div class=\"cx-sectionhead\"><div><h3>AirPlay · Safari trên Mac / iPhone / iPad</h3>\n    <p>Giữ nguyên bộ chọn AirPlay của Safari và hệ điều hành.</p></div>\n    <span class=\"cx-chip\"><span class=\"cx-dot\"></span>AirPlay hệ thống</span></div>\n   <div class=\"cx-grid\"><div class=\"cx-card cx-feature\"><span class=\"cx-featureicon\">◭</span>\n    <h4>Phát lên Samsung TV bằng AirPlay</h4><p class=\"cx-p\">Safari sẽ tự hiển thị TV AirPlay thật. Chrome không quét Bonjour giống Electron.</p>\n    <div class=\"cx-inline\" style=\"margin-top:20px\"><button id=\"cxAirOpen\" class=\"cx-button cx-button-primary\" type=\"button\">◉ Chọn TV bằng AirPlay</button></div>\n    <p id=\"cxAirNotice\" class=\"cx-notice\" role=\"status\">Nhấn để mở AirPlay trong Safari.</p></div>\n    <div class=\"cx-card cx-feature\"><span class=\"cx-eyebrow\">THÔNG TIN KẾT NỐI</span>\n     <div class=\"cx-statuscard\">TV Samsung có AirPlay, Apple TV và thiết bị tương thích phải dùng chung mạng Wi-Fi. Safari quản lý kết nối.</div>\n     <p class=\"cx-p\" style=\"margin-top:18px\">Đang dùng Chrome? Mở trang trong Safari hoặc dùng Phản chiếu màn hình trên macOS.</p></div>\n   </div>\n  </section>\n </div>\n <footer class=\"cx-footer\"><span><b>Open IPTV Pro</b> · Một nút Cast, ba phương thức kết nối</span>\n <span id=\"cxFooter\">Ghép đôi TV · Xác nhận trên TV · Mã hóa</span></footer>\n</div>";
  d.body.appendChild(overlay);
  const airBadge=overlay.querySelector('#cxPaneAir .cx-chip');
  if(airBadge)airBadge.id='cxAirBadge';
  root.OpenIPTVCastIcons?.decorateModal?.(overlay);
  $('cxTvUrl').href=tvUrl();$('cxTvUrl').textContent=tvUrl();
  $('cxTvOriginalUrl').href=tvOriginalUrl();$('cxTvOriginalUrl').textContent=tvOriginalUrl();
  $('cxClose').addEventListener('click',close);
  overlay.addEventListener('mousedown',e=>{if(e.target===overlay)close();});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
  d.querySelectorAll('#iptvCastOverlay [data-cx-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.cxMode)));
  $('cxCopyTvOriginal').addEventListener('click',async()=>{
   try{await root.navigator.clipboard.writeText(tvOriginalUrl());notice('cxPairNotice','Đã sao chép link gốc dự phòng của TV.','ok');}
   catch{notice('cxPairNotice','Không sao chép được tự động; bạn có thể chọn và sao chép link gốc.','error');}
  });
  $('cxPin').addEventListener('input',e=>{
   const p=e.target.value.replace(/\D/g,'').slice(0,6);
   e.target.value=p.length>3?p.slice(0,3)+' '+p.slice(3):p;renderPair();
   if(p.length===6&&!pairPending&&!pair?.connected)void connect(); // TV opens automatically after the sixth digit.
  });
  $('cxPin').addEventListener('keydown',e=>{if(e.key==='Enter')void connect();});
  $('cxConnect').addEventListener('click',()=>void connect());
  $('cxCopyTv').addEventListener('click',async()=>{
   try{await root.navigator.clipboard.writeText(tvUrl());notice('cxPairNotice','Đã sao chép liên kết mở trên TV.','ok');}
   catch{notice('cxPairNotice','Không sao chép được; hãy sao chép địa chỉ TV thủ công.','error');}
  });
  $('cxRemotePlay').addEventListener('click',()=>void remote('play'));
  $('cxRemotePause').addEventListener('click',()=>void remote('pause'));
  $('cxRemoteResume').addEventListener('click',()=>void remote('resume'));
  $('cxRemoteStop').addEventListener('click',()=>void remote('stop'));
  $('cxDisconnect').addEventListener('click',()=>void disconnect());
  $('cxCastScan').addEventListener('click',()=>{
   const api=root.OpenIPTVWebCast;
   if(!api){notice('cxCastNotice','Google Cast SDK chưa được tải.','error');return;}
   Promise.resolve(api.scan()).then(syncCast).catch(e=>notice('cxCastNotice',clean(e.message),'error'));
  });
  $('cxCastPlay').addEventListener('click',async()=>{
   try{await root.OpenIPTVWebCast.play();syncCast();}
   catch(e){notice('cxCastNotice',clean(e.message),'error');}
  });
  $('cxCastStop').addEventListener('click',async()=>{await root.OpenIPTVWebCast.stop();syncCast();});
  $('cxAirOpen').addEventListener('click',()=>{
   if(root.OpenIPTVWebCast?.airplayPicker?.())
    notice('cxAirNotice','Đã yêu cầu Safari mở AirPlay. Chọn TV trong bộ chọn hệ thống.','ok');
   else notice('cxAirNotice','Trình duyệt này chưa mở được AirPlay. Hãy thử Safari.','error');
  });
 }
 function setMode(next){
  mode=next;build();
  for(const [name,id] of Object.entries({pair:'cxPanePair',cast:'cxPaneCast',air:'cxPaneAir'})){
   $(id).hidden=name!==next;
   $(name==='pair'?'cxTabPair':name==='cast'?'cxTabCast':'cxTabAir').setAttribute('aria-selected',String(name===next));
  }
  set('cxFooter',next==='pair'?'Ghép đôi TV · Mã 6 số · Tự kết nối · Mã hóa lệnh':next==='cast'?'Google Cast · Danh sách TV do Chrome chọn':'AirPlay · Safari chọn thiết bị');
  if(next==='cast')syncCast();if(next==='air')syncAir();
 }
 function renderPair(){
  renderConnectionStatus();
  if(!overlay)return;
  const p=$('cxPin').value.replace(/\D/g,'');
  $('cxPairBadge').dataset.ok=String(!!pair?.connected);
  set('cxPairBadgeText',pair?.connected?'Đã kết nối':'Chưa kết nối');
  $('cxRemote').hidden=!pair?.connected;
  $('cxPairForm').hidden=!!pair?.connected;
  set('cxChannel',channel?.name||'Chưa chọn kênh');
  if(pair?.connected){
   set('cxTvLine','TV đã kết nối bằng mã 6 số');
   set('cxTvCode','ĐÃ KẾT NỐI');
   $('cxTvCode').style.fontSize='clamp(22px,3vw,34px)';
   set('cxTvSub','Sẵn sàng nhận lệnh phát từ máy tính');
   set('cxTvChip','● Phiên được mã hóa');
  }else{
   set('cxTvLine','Nhập mã hiển thị trên TV thật');
   set('cxTvCode',p.length===6?p.slice(0,3)+' '+p.slice(3):'••• •••');
   $('cxTvCode').style.fontSize='';
   set('cxTvSub','TV tự kết nối khi mã hợp lệ');
   set('cxTvChip','● Chưa ghép đôi');
  }
 }
 async function connect(){
  if(pairPending||pair?.connected)return;
  const code=$('cxPin').value.replace(/\D/g,'');
  if(!/^\d{6}$/.test(code)){notice('cxPairNotice','Nhập đúng 6 chữ số trên màn hình TV.','error');return;}
  if(!root.OpenIPTVTVPair){notice('cxPairNotice','Chưa tải được bộ ghép đôi TV. Hãy tải lại trang.','error');return;}
  pairPending=true;$('cxConnect').disabled=true;
  try{
   if(pair)await pair.disconnect(false);
   pair=root.OpenIPTVTVPair.createController({
    onStatus:msg=>notice('cxPairNotice',msg),
    onConnected:()=>{pairPending=false;$('cxConnect').disabled=false;remoteState='stopped';renderPair();notice('cxPairNotice','Đã kết nối TV. Đang đồng bộ kênh được chọn…','ok');if(validSource())void sendRemotePlay(true);const local=$('video');if(local)onLocalVolumeChanged(local.volume,local.muted);},
    onPlayback:info=>{
     if(info.mediaId&&info.mediaId!==lastMediaId)return; // Ignore stale acknowledgements after changing channel.
     if(info.state==='playing'){
      remoteState='playing';
      const localVideo=$('video');
      try{if(localVideo&&!localVideo.paused)localVideo.pause();}catch{}
      notice('cxPairNotice','TV đang phát '+(info.name||'kênh')+'. Web đã tạm dừng video.','ok');
     }else if(info.state==='paused')remoteState='paused';
     else if(info.state==='stopped')remoteState='stopped';
     else if(info.state==='error'){
      remoteState='error';notice('cxPairNotice','TV không phát được luồng. Bạn có thể tiếp tục xem trên Web.','error');
     }
     updateRemoteTransport();
    },
    onDisconnected:()=>{pairPending=false;$('cxConnect').disabled=false;remoteState='stopped';lastSentKey='';playSerial++;renderPair();}
   });
   await pair.connect(code);
  }catch(e){notice('cxPairNotice','Lỗi ghép đôi: '+clean(e.message),'error');pairPending=false;$('cxConnect').disabled=false;}
 }
 function updateRemoteTransport(){
  if(!pair?.connected)return;
  const button=$('playBtn');
  if(button)button.textContent=remoteState==='playing'?'Ⅱ':'▶';
  renderConnectionStatus();
 }
 function enqueueCommand(fn){
  const task=commandQueue.catch(()=>{}).then(fn);
  commandQueue=task.catch(()=>{});
  return task;
 }
 function sendRemotePlay(force=false){
  if(!pair?.connected)return Promise.resolve(false);
  const url=validSource();
  if(!url){notice('cxPairNotice','Nguồn hiện tại không có URL HTTP/HTTPS mà TV truy cập được.','error');return Promise.resolve(false);}
  const key=String(channel?.id||'')+'|'+url;
  if(!force&&key===lastSentKey&&remoteState!=='stopped'&&remoteState!=='error')return Promise.resolve(true);
  const serial=++playSerial,controller=pair;
  remoteState='loading';updateRemoteTransport();
  return enqueueCommand(async()=>{
   if(serial!==playSerial||!controller.connected||pair!==controller)return false;
   lastMediaId=String(serial);
   await controller.command('play',{url,name:channel?.name||'Open IPTV Pro',mediaId:lastMediaId});
   lastSentKey=key;
   notice('cxPairNotice','Đã chuyển '+(channel?.name||'kênh')+' lên TV. Đang chờ TV xác nhận phát.','ok');
   return true;
  }).catch(error=>{remoteState='error';notice('cxPairNotice','Không gửi được kênh lên TV: '+clean(error.message),'error');return false;});
 }
 async function remote(action){
  try{
   if(!pair?.connected)throw Error('Chưa kết nối TV.');
   if(action==='play'){
    if(!validSource())throw Error('Nguồn phải là URL HTTP/HTTPS mà TV truy cập được. Blob/localhost không hỗ trợ.');
    await sendRemotePlay(true);
   }else{
    await enqueueCommand(()=>pair.command(action));
    remoteState=action==='pause'?'paused':action==='resume'?'playing':'stopped';
    if(action==='stop'){lastSentKey='';lastMediaId='';playSerial++;}
    updateRemoteTransport();
   }
   notice('cxPairNotice',action==='play'?'Đã gửi lệnh phát '+(channel?.name||'kênh')+' lên TV.':action==='pause'?'Đã tạm dừng trên TV.':action==='resume'?'Đã tiếp tục phát trên TV.':'Đã dừng phát trên TV.','ok');
  }catch(e){notice('cxPairNotice',clean(e.message),'error');}
 }
 async function disconnect(){
  if(pair)await pair.disconnect();
  pair=null;remoteState='stopped';lastSentKey='';lastMediaId='';playSerial++;$('cxPin').value='';renderPair();
  notice('cxPairNotice','Đã ngắt kết nối. TV cần ghép đôi lại trước khi nhận lệnh.','');
 }
 function syncCast(){
  renderConnectionStatus();
  if(!overlay)return;
  const state=castState();
  $('cxCastBadge').dataset.ok=String(!!state.connected);
  set('cxCastBadgeText',state.connected?'Đã kết nối':'Chưa kết nối');
  set('cxCastDevice',state.connected?'✓ '+state.name+' · Google Cast':'Chưa có TV được chọn. Nhấn Tìm thiết bị để Chrome mở danh sách TV tương thích.');
  $('cxCastPlay').disabled=!state.connected;$('cxCastStop').disabled=!state.connected;
  $('cxCastScan').disabled=!state.initialized;
  notice('cxCastNotice',state.connected?'TV đã kết nối. Nhấn Phát trên TV để gửi kênh đang chọn.':state.initialized?'Nhấn Tìm thiết bị để mở bộ chọn Google Cast của Chrome.':'Google Cast SDK chưa sẵn sàng hoặc Chrome không hỗ trợ.');
 }
 function syncAir(){
  renderConnectionStatus();
  const ua=root.navigator?.userAgent||'';
  const safari=/Safari/i.test(ua)&&!/Chrome|CriOS|Chromium|Edg|OPR/i.test(ua);
  $('cxAirOpen').disabled=!safari;
  notice('cxAirNotice',safari?'Safari đã sẵn sàng. Nhấn nút để chọn TV.':'AirPlay cần Safari. Chrome không thể tìm TV AirPlay qua Bonjour.');
 }
 function open({channel:ch,source:url}={}){
  channel=ch||channel;source=url||ch?.url||source;
  build();overlay.hidden=false;renderPair();syncCast();syncAir();setMode('pair');
  $('cxClose').focus();
 }
 function close(){if(overlay)overlay.hidden=true;}
 function onChannelChanged(ch,url){
  if(ch){channel=ch;source=url||ch.url||source;}
  renderPair();
  // Keep the same TV session when navigating the channel list, next/previous,
  // a folder, or a newly selected alternate stream.
  if(pair?.connected&&ch)void sendRemotePlay();
 }
 function onLocalStop(){
  if(!pair?.connected)return Promise.resolve(false);
  playSerial++;lastSentKey='';lastMediaId='';remoteState='stopped';updateRemoteTransport();
  return enqueueCommand(()=>pair.connected?pair.command('stop'):false).catch(()=>false);
 }
 async function toggleRemotePlayback(){
  if(pair?.connected){
   if(remoteState==='loading')return false;
   await remote(remoteState==='playing'?'pause':remoteState==='paused'?'resume':'play');
   return true;
  }
  const state=castState();
  if(state.connected){
   if(!state.active){await root.OpenIPTVWebCast?.play?.();return true;}
   const media=state.remotePaused?'resume':'pause';
   const ok=await root.OpenIPTVWebCast?.transportRemote?.(media);
   return !!ok;
  }
  return false;
 }
 function isRemoteActive(){const cast=castState();return !!pair?.connected||!!cast.connected;}
 function onLocalVolumeChanged(volume,muted){
  const level=Math.max(0,Math.min(1,Number(volume)||0));
  if(pair?.connected){void enqueueCommand(()=>pair?.connected?pair.command('volume',{volume:level,muted:!!muted}):false).catch(()=>{});return;}
  if(castState().connected)void root.OpenIPTVWebCast?.setReceiverVolume?.(level,!!muted);
 }
 function syncAirplayState(){renderConnectionStatus();}
 function getStatus(){const cast=castState(),air=root.OpenIPTVWebCast?.getAirplayState?.()||{};return {pair:!!pair?.connected,cast:!!cast.connected,airplay:!!air.connected,remoteState};}
 function setCastFeedback(message,error=false){if(overlay)notice('cxCastNotice',message,error?'error':'');}
 root.OpenIPTVWebCastV2=Object.freeze({open,close,onChannelChanged,syncCast,syncAirplayState,setCastFeedback,onLocalStop,toggleRemotePlayback,isRemoteActive,onLocalVolumeChanged,getStatus});
})(typeof window==='undefined'?null:window);
