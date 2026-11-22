'use strict';
/* TV pairing on desktop: same ECDH/AES-GCM broadcast protocol as the Web sender.
   Never report playback as successful until the receiver confirms "playing". */
(function(root){
 if(!root?.document)return;
 const d=root.document,$=id=>d.getElementById(id);
 const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
 let channel=null,source='',controller=null,busy=false,state='stopped',serial=0,mediaId='',lastKey='',lastAudible=.8,queued=Promise.resolve(),timeout=0,volumeTimeout=0,volumeValue=null;
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
 function copy(url){
  return root.navigator.clipboard?.writeText?.(url).then(()=>notice('Đã sao chép liên kết.')).catch(()=>notice('Không sao chép được. Chọn liên kết để sao chép thủ công.',true));
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
