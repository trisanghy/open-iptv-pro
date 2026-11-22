'use strict';
/* TV pairing on desktop: same ECDH/AES-GCM broadcast protocol as the Web sender.
   Never report playback as successful until the receiver confirms "playing". */
(function(root){
 if(!root?.document)return;
 const d=root.document,$=id=>d.getElementById(id);
 const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
 let channel=null,source='',controller=null,busy=false,state='stopped',serial=0,mediaId='',lastKey='',lastAudible=.8,queued=Promise.resolve(),timeout=0,volumeTimeout=0,volumeValue=null;
 const mount=$('castChannel');
 if(mount&&!$('desktopTvPair')){
  const fragment=d.createElement('template');
  fragment.innerHTML="\n<section id=\"desktopTvPair\" class=\"cast-section dtv-section\" aria-labelledby=\"dtvHeader\" data-connected=\"false\">\n <div class=\"dtv-head\"><h3 id=\"dtvHeader\">Ghép đôi TV bằng mã 6 số</h3><button class=\"dtv-disconnect\" type=\"button\" id=\"dtvDisconnect\" hidden aria-label=\"Ngắt kết nối TV\">✕ Ngắt kết nối</button></div>\n <div id=\"dtvSetup\" class=\"dtv-setup\">\n  <p class=\"dtv-intro\">Mở trang TV, nhập mã 6 số. TV tự kết nối, không cần chọn “Cho phép”.</p>\n  <div class=\"dtv-links\" aria-label=\"Danh sách liên kết\">\n   <div class=\"dtv-link\"><span>Web · Link rút gọn</span><a href=\"https://is.gd/openiptv\" rel=\"noopener noreferrer\" target=\"_blank\">https://is.gd/openiptv</a><button type=\"button\" data-dtv-copy=\"https://is.gd/openiptv\">Sao chép</button></div>\n   <div class=\"dtv-link\"><span>TV · Link rút gọn</span><a href=\"https://is.gd/IPTVTV\" rel=\"noopener noreferrer\" target=\"_blank\">https://is.gd/IPTVTV</a><button type=\"button\" data-dtv-copy=\"https://is.gd/IPTVTV\">Sao chép</button></div>\n   <div class=\"dtv-link\"><span>TV · Link gốc dự phòng</span><a href=\"https://trisanghy.github.io/open-iptv-pro/tv.html\" rel=\"noopener noreferrer\" target=\"_blank\">https://trisanghy.github.io/open-iptv-pro/tv.html</a><button type=\"button\" data-dtv-copy=\"https://trisanghy.github.io/open-iptv-pro/tv.html\">Sao chép</button></div>\n  </div>\n  <div class=\"dtv-connect-form\"><label for=\"dtvPin\">Nhập mã hiển thị trên TV</label><input id=\"dtvPin\" maxlength=\"7\" inputmode=\"numeric\" autocomplete=\"one-time-code\" placeholder=\"000 000\" aria-label=\"Mã TV 6 số\"><button id=\"dtvConnect\" type=\"button\">Kết nối</button></div>\n </div>\n <div class=\"dtv-television\" aria-label=\"Trạng thái kết nối và điều khiển TV\" data-state=\"disconnected\">\n  <div class=\"dtv-brand\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2 17v4h4m-4-9a9 9 0 0 1 9 9M2 7a14 14 0 0 1 14 14M4 3h17v14h-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg> OPEN IPTV PRO · TV</div>\n  <div class=\"dtv-check\" aria-hidden=\"true\"><svg viewBox=\"0 0 80 80\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"10\" y=\"9\" width=\"60\" height=\"47\" rx=\"6\"/><path d=\"M30 32l8 8 15-16M28 67h24M40 56v11\"/></svg></div>\n  <div class=\"dtv-big\" id=\"dtvHeadline\">CHỜ KẾT NỐI</div>\n  <div class=\"dtv-crypto\" id=\"dtvCrypto\">Nhập mã ghép đôi từ TV</div>\n  <div class=\"dtv-controls\" id=\"dtvControls\" hidden role=\"group\" aria-label=\"Điều khiển TV\">\n    <button id=\"dtvPrev\" type=\"button\" title=\"Kênh trước\" aria-label=\"Kênh trước\" class=\"dtv-key\"><svg viewBox=\"0 0 24 24\"><path d=\"M5 5v14M19 5 8 12l11 7V5Z\"/></svg></button>\n    <button id=\"dtvToggle\" type=\"button\" title=\"Phát trên TV\" aria-label=\"Phát trên TV\" class=\"dtv-key dtv-main-key\"><svg viewBox=\"0 0 24 24\"><path d=\"M7 5 20 12 7 19Z\"/></svg></button>\n    <button id=\"dtvStop\" type=\"button\" title=\"Dừng trên TV\" aria-label=\"Dừng trên TV\" class=\"dtv-key\"><svg viewBox=\"0 0 24 24\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\"/></svg></button>\n    <button id=\"dtvNext\" type=\"button\" title=\"Kênh tiếp\" aria-label=\"Kênh tiếp\" class=\"dtv-key\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 5v14M5 5l11 7-11 7V5Z\"/></svg></button>\n    <span class=\"dtv-divider\" aria-hidden=\"true\"></span>\n    <button id=\"dtvMute\" type=\"button\" title=\"Tắt tiếng TV\" aria-label=\"Tắt tiếng TV\" class=\"dtv-key\"><svg viewBox=\"0 0 24 24\"><path d=\"M4 9h4l5-4v14l-5-4H4ZM16 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12\"/></svg></button>\n    <input type=\"range\" id=\"dtvVolume\" min=\"0\" max=\"100\" value=\"80\" step=\"1\" aria-label=\"Âm lượng TV\">\n  </div>\n </div>\n <p id=\"dtvStatus\" class=\"dtv-status\" role=\"status\" aria-live=\"polite\">Chưa ghép đôi TV.</p>\n</section>\n\n";
  mount.insertAdjacentElement('afterend',fragment.content.firstElementChild);
 }
 const stage=$('desktopTvPair'),panel=$('castModal');
 if(!stage||!panel)return;
 const set=(id,value)=>{const e=$(id);if(e)e.textContent=value;};
 const notice=(msg,error=false)=>{const el=$('dtvStatus');if(el){el.textContent=msg;el.dataset.error=String(error);}};
 const connected=()=>!!controller?.connected;
 const valid=()=>root.OpenIPTVTVPair?.validateUrl(source)||'';
 const clearWait=()=>{if(timeout){root.clearTimeout(timeout);timeout=0;}};
 const queue=fn=>{const task=queued.catch(()=>{}).then(fn);queued=task.catch(()=>{});return task;};
 function sync(){
  const live=connected(),playing=state==='playing',video=$('video');
  stage.dataset.connected=String(live);
  panel.dataset.tvConnected=String(live);
  $('dtvDisconnect').hidden=!live;
  $('dtvControls').hidden=!live;
  set('dtvHeadline',live?'ĐÃ KẾT NỐI':'CHỜ KẾT NỐI');
  set('dtvCrypto',live?'● Phiên được mã hóa':'Nhập mã ghép đôi từ TV');
  $('dtvToggle').title=playing?'Tạm dừng trên TV':state==='loading'?'TV đang tải, nhấn để thử lại':'Phát trên TV';
  $('dtvToggle').setAttribute('aria-label',$('dtvToggle').title);
  $('dtvToggle').innerHTML=playing?'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M7 5 20 12 7 19Z"/></svg>';
  const sound=!!video?.muted||Number(video?.volume)===0;
  $('dtvMute').setAttribute('aria-label',sound?'Bật tiếng TV':'Tắt tiếng TV');
  $('dtvMute').setAttribute('aria-pressed',String(sound));
  $('dtvMute').title=sound?'Bật tiếng TV':'Tắt tiếng TV';
  const amount=clamp(sound?0:video?.volume??.8);
  $('dtvVolume').value=String(Math.round(amount*100));
  if(amount>0)lastAudible=amount;
  $('dtvPin').disabled=busy||live;
  $('dtvConnect').disabled=busy||live;
  if(live){
   const b=$('playBtn');if(b){b.dataset.remotePlaying=String(playing);b.textContent=playing?'Ⅱ':'▶';b.title=$('dtvToggle').title;}
   const info=$('streamInfo');if(info)info.textContent=(state==='playing'?'● TV đang phát':state==='paused'?'● TV đã tạm dừng':state==='loading'?'● TV đang tải':state==='error'?'● TV chưa phát được':'● TV đã dừng')+(channel?.name?' · '+channel.name:'');
  }
  d.dispatchEvent(new root.CustomEvent('openiptv:remote-playback-state',{detail:{connected:live,state:live?state:'stopped',method:'pair'}}));
 }
 function awaitPlayback(expected,ctrl){
  clearWait();
  timeout=root.setTimeout(()=>{
   timeout=0;
   if(controller!==ctrl||!ctrl.connected||mediaId!==expected||state!=='loading')return;
   state='error';sync();notice('TV chưa xác nhận đang phát. Nhấn Phát để thử lại hoặc kiểm tra trình phát TV.',true);
  },20000);
 }
 function setCurrent(ch,url){
  if(ch)channel=ch;
  if(url)source=url;
  else if(ch?.url)source=ch.url;
 }
 function stopLocal(){
  const video=$('video');
  try{if(video&&!video.paused)video.pause();}catch{}
  d.dispatchEvent(new root.CustomEvent('openiptv:remote-player-attached',{detail:{method:'pair'}}));
 }
 function sendPlay(force=false){
  if(!connected())return Promise.resolve(false);
  const url=valid();
  if(!url){notice('Nguồn hiện tại không có URL HTTP/HTTPS TV truy cập được.',true);return Promise.resolve(false);}
  const key=String(channel?.id||'')+'|'+url;
  if(!force&&key===lastKey&&state!=='error'&&state!=='stopped')return Promise.resolve(true);
  const n=++serial,ctrl=controller;
  state='loading';sync();notice('Đang chuyển '+(channel?.name||'kênh')+' lên TV…');
  return queue(async()=>{
   if(n!==serial||ctrl!==controller||!ctrl.connected)return false;
   mediaId=String(n);
   awaitPlayback(mediaId,ctrl);
   await ctrl.command('play',{url,name:String(channel?.name||'Open IPTV Pro'),mediaId});
   if(n!==serial||ctrl!==controller)return false;
   lastKey=key;
   if(state==='loading')notice('TV đã nhận lệnh, đang chờ xác nhận phát.');
   return true;
  }).catch(error=>{
   if(n===serial&&ctrl===controller){clearWait();state='error';sync();notice('Không gửi được kênh: '+String(error?.message||error),true);}
   return false;
  });
 }
 async function connect(){
  if(busy||connected())return;
  const pin=$('dtvPin').value.replace(/\D/g,'');
  if(!/^\d{6}$/.test(pin)){notice('Nhập đúng mã TV 6 số.',true);return;}
  if(!root.OpenIPTVTVPair?.createController){notice('Không tải được bộ mã hóa ghép đôi TV.',true);return;}
  busy=true;sync();
  try{
   if(controller)await controller.disconnect(false);
   const c=root.OpenIPTVTVPair.createController({
    onStatus:msg=>{if(c===controller)notice(msg);},
    onConnected:()=>{
     if(c!==controller)return;
     busy=false;state='stopped';sync();notice('Đã ghép đôi an toàn. Lệnh được mã hóa.');
     stopLocal();
     const app=root.IPTVState;
     const active=app?.getCurrent?.();
     if(active)setCurrent(active,source||active.url);
     if(valid())void sendPlay(true);
    },
    onPlayback:info=>{
     if(c!==controller||info?.mediaId&&info.mediaId!==mediaId)return;
     if(!['playing','paused','stopped','error'].includes(info.state))return;
     clearWait();state=info.state;
     if(info.state==='playing'){const v=$('video');try{v?.pause();}catch{}}
     sync();notice(info.state==='error'?'TV không phát được luồng, hãy thử link khác.':'TV: '+(info.state==='playing'?'đang phát':info.state==='paused'?'tạm dừng':'đã dừng')+' '+(info.name||channel?.name||''),info.state==='error');
    },
    onDisconnected:()=>{if(c!==controller)return;clearWait();busy=false;state='stopped';mediaId='';lastKey='';++serial;sync();notice('TV đã ngắt kết nối.');}
   });
   controller=c;
   await c.connect(pin);
  }catch(error){busy=false;state='error';sync();notice('Không thể ghép đôi: '+String(error?.message||error),true);}
  finally{busy=false;sync();}
 }
 async function remote(action){
  if(!connected())return false;
  try{
   if(action==='play')return await sendPlay(true);
   const ctrl=controller;
   if(action==='resume'){state='loading';sync();awaitPlayback(mediaId,ctrl);}
   await queue(()=>ctrl.command(action));
   if(action==='pause'||action==='stop'){
    clearWait();state=action==='pause'?'paused':'stopped';
    if(action==='stop'){mediaId='';lastKey='';++serial;}
    sync();
   }
   notice(action==='resume'?'Đã gửi lệnh tiếp tục, đang chờ TV phát.':action==='pause'?'TV đã nhận lệnh tạm dừng.':'TV đã nhận lệnh dừng.');
   return true;
  }catch(error){clearWait();state='error';sync();notice('TV không xử lý được lệnh: '+String(error?.message||error),true);return false;}
 }
 async function disconnect(){
  const ctrl=controller;clearWait();root.clearTimeout(volumeTimeout);volumeTimeout=0;
  if(ctrl)try{await ctrl.disconnect();}catch{}
  if(ctrl===controller)controller=null;
  ++serial;state='stopped';mediaId='';lastKey='';busy=false;sync();
  notice('Đã ngắt kết nối TV.');
 }
 function onChannelChanged(ch,url){
  if(ch)setCurrent(ch,url);
  if(connected()&&ch)void sendPlay(false);
 }
 function onLocalStop(){if(connected())void remote('stop');}
 function toggle(){
  if(!connected())return Promise.resolve(false);
  return remote(state==='playing'?'pause':state==='paused'?'resume':'play');
 }
 function onVolume(volume,muted){
  if(!connected())return;
  const ctrl=controller;volumeValue={controller:ctrl,volume:clamp(volume),muted:!!muted};
  root.clearTimeout(volumeTimeout);
  volumeTimeout=root.setTimeout(()=>{
   const x=volumeValue;volumeValue=null;volumeTimeout=0;
   if(!x||x.controller!==controller||!x.controller.connected)return;
   void queue(()=>x.controller.command('volume',{volume:x.volume,muted:x.muted})).catch(error=>notice('TV không nhận âm lượng: '+String(error?.message||error),true));
  },240);
 }
 async function copy(url){
  try{
   if(!root.navigator.clipboard?.writeText)throw Error('Clipboard API chưa hỗ trợ');
   await root.navigator.clipboard.writeText(url);
   notice('Đã sao chép liên kết.');
  }catch{notice('Không sao chép được. Chọn liên kết để sao chép thủ công.',true);}
 }
 $('dtvPin').addEventListener('input',event=>{
  const pin=event.target.value.replace(/\D/g,'').slice(0,6);
  event.target.value=pin.length>3?pin.slice(0,3)+' '+pin.slice(3):pin;
  // TV accepts the one-time PIN without a second approval click.
  if(pin.length===6&&!busy&&!connected())void connect();
 });
 $('dtvPin').addEventListener('keydown',event=>{if(event.key==='Enter')void connect();});
 $('dtvConnect').addEventListener('click',()=>void connect());
 $('dtvDisconnect').addEventListener('click',()=>void disconnect());
 for(const button of stage.querySelectorAll('[data-dtv-copy]'))button.addEventListener('click',()=>void copy(button.dataset.dtvCopy));
 $('dtvPrev').addEventListener('click',()=>{if(connected())$('prevBtn')?.click();});
 $('dtvNext').addEventListener('click',()=>{if(connected())$('nextBtn')?.click();});
 $('dtvToggle').addEventListener('click',()=>void toggle());
 $('dtvStop').addEventListener('click',()=>void remote('stop'));
 $('dtvMute').addEventListener('click',()=>{
  if(!connected())return;
  const v=$('video'),input=$('volume');if(!v)return;
  if(v.muted||Number(v.volume)===0){
   if(Number(v.volume)===0&&input){input.value=String(Math.round(Math.max(.15,lastAudible)*100));input.dispatchEvent(new root.Event('input',{bubbles:true}));}
   v.muted=false;
  }else v.muted=true;
  onVolume(v.volume,v.muted);sync();
 });
 $('dtvVolume').addEventListener('input',event=>{
  if(!connected())return;
  const v=$('video'),input=$('volume');if(!v||!input)return;
  input.value=event.target.value;
  input.dispatchEvent(new root.Event('input',{bubbles:true}));
  v.muted=Number(event.target.value)===0;
  onVolume(v.volume,v.muted);sync();
 });
 $('video')?.addEventListener('volumechange',()=>{if(connected()){onVolume($('video').volume,$('video').muted);sync();}});
 root.addEventListener('beforeunload',()=>{if(controller)void controller.disconnect(false);});
 sync();
 root.OpenIPTVDesktopTVPair=Object.freeze({connect,disconnect,isConnected:connected,onChannelChanged,setCurrent,onLocalStop,toggle,onVolume,sendPlay,getStatus:()=>({connected:connected(),state,channel:channel?.name||''})});
})(typeof window==='undefined'?null:window);
