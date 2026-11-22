'use strict';
/* TV-side receiver. Streams are played on the TV, not "cast" from the Web tab.
 * The browser/TV must be able to fetch and decode the supplied media itself.
 */
(function(root){
 const d=root.document,$=id=>d.getElementById(id);
 let receiver=null,hls=null,dash=null,busy=false,accepted=false;
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
 function cleanupPlayer(){
  try{video.pause();}catch{}
  try{hls?.destroy();}catch{}hls=null;
  try{dash?.reset();}catch{}dash=null;
  video.removeAttribute('src');
  try{video.load();}catch{}
 }
 async function loadVideo(url,name){
  cleanupPlayer();
  $('tvPlayingTitle').textContent=name||'Open IPTV Pro';
  const u=new URL(url);
  if(u.protocol==='http:'&&root.location.protocol==='https:'){
   status('Nguồn đang dùng HTTP. Trình duyệt TV có thể chặn nội dung không an toàn; hãy dùng HTTPS hoặc ứng dụng Electron.');
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
    if(data.fatal)status('Không phát được HLS trên TV: '+String(data.details||data.type||'lỗi nguồn'));
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
   status('Đã nhận kênh '+(name||'')+'. Nhấn nút ▶ Phát trên TV bằng điều khiển TV nếu tự phát bị chặn.');
  }
 }
 video.addEventListener('error',()=>{
  if(!video.error)return;
  status('TV không giải mã hoặc tải được luồng. Thử kênh khác, kiểm tra HTTPS và định dạng video.');
 });
 function handleCommand(command){
  if(!accepted)return;
  switch(command.action){
   case 'play':show('tvPlayer');void loadVideo(command.url,command.name);break;
   case 'pause':video.pause();status('Đã tạm dừng phát theo lệnh từ máy tính.');break;
   case 'resume':void video.play().catch(()=>status('TV cần nhấn Phát để tiếp tục.'));break;
   case 'stop':cleanupPlayer();status('Đã dừng kênh. Chọn kênh mới trên máy tính.');break;
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
    onStatus:status,
    onRequest:request=>{
     if(request){
      $('tvRequestLabel').textContent=request.label||'Trình duyệt';
      show('tvRequest');status('Máy tính yêu cầu ghép đôi. Hãy kiểm tra và chấp thuận trên TV.');
     }else if(!accepted)show('tvPairing');
    },
    onCommand:handleCommand,
    onConnected:()=>{accepted=true;show('tvPlayer');$('tvPlayingTitle').textContent='TV đã được ghép đôi';status('Đã kết nối. Chọn kênh trên Open IPTV Pro.');}
   });
   await receiver.start();
   const code=receiver.code;
   $('tvPairPin').textContent=code.slice(0,3)+' '+code.slice(3);
   status('TV đã sẵn sàng. Nhập mã này ở mục Ghép đôi TV trên máy tính.');
  }catch(error){
   status('Không thể tạo mã ghép đôi: '+String(error.message||error)+'. Hãy kiểm tra Internet rồi thử lại.');
  }finally{busy=false;$('tvNewPin').disabled=false;}
 }
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
 $('tvLocalPlay').addEventListener('click',()=>void video.play().catch(()=>status('Không phát được luồng trên trình duyệt TV.')));
 $('tvLocalPause').addEventListener('click',()=>video.pause());
 root.addEventListener('pagehide',()=>{void receiver?.close();cleanupPlayer();});
 void boot();
})(window);
