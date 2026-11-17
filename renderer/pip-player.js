'use strict';
(()=>{
 const video=document.getElementById('mini'),hint=document.getElementById('hint');
 const invoke=(op,...args)=>window.__TAURI__.core.invoke('bridge',{op,args});
 let session=null,reported=false,hls=null,dash=null;
 const message=(text,error=false)=>{
  hint.hidden=!text;hint.textContent=String(text||'').slice(0,260);hint.style.color=error?'#ffb5b9':'#fff';
 };
 video.addEventListener('playing',()=>{
  if(!session||reported)return;reported=true;message('');
  void invoke('pip:playing',{id:session.id}).catch(console.warn);
 });
 video.addEventListener('error',()=>{
  const msg='Nguồn không phát được ở cửa sổ nổi ('+(video.error?.code||'?')+').';
  message(msg,true);if(session)void invoke('pip:failed',{id:session.id,message:msg}).catch(()=>{});
 });
 document.getElementById('play').onclick=()=>{void video.play().catch(()=>message('Nhấn Phát trực tiếp trên video để cho phép phát.',true));};
 document.getElementById('close').onclick=()=>{void invoke('pip:close').catch(()=>window.close());};
 window.addEventListener('pagehide',()=>{try{hls?.destroy();dash?.reset();}catch{}});
 async function start(){
  try{
   session=await invoke('pip:session');
   document.getElementById('title').textContent=String(session.title||'Open IPTV Pro').slice(0,90);
   video.muted=!!session.muted;video.volume=Math.min(1,Math.max(0,Number(session.volume)||0));
   const src=await invoke('media:proxy',session.url);
   const kind=await invoke('media:kind',session.url).catch(()=>({}));
   const isHls=!!kind.hls||/\.m3u8?(?:[?#]|$)/i.test(session.url);
   const isDash=!!kind.dash||/\.mpd(?:[?#]|$)/i.test(session.url);
   if(isDash){
    if(!window.dashjs?.MediaPlayer)throw Error('Không hỗ trợ MPEG-DASH');
    dash=window.dashjs.MediaPlayer().create();dash.initialize(video,src,false);
   }else if(isHls&&video.canPlayType('application/vnd.apple.mpegurl'))video.src=src;
   else if(isHls&&window.Hls?.isSupported?.()){
    hls=new window.Hls({maxBufferLength:12,backBufferLength:6});
    hls.loadSource(src);hls.attachMedia(video);
   }else video.src=src;
   if(Number(session.position)>0)video.addEventListener('loadedmetadata',()=>{
    try{if(video.seekable?.length&&session.position<=video.seekable.end(video.seekable.length-1))
     video.currentTime=session.position;}catch{}
   },{once:true});
   await video.play().catch(()=>message('Cần nhấn ▶ Phát trong Mini Player để cho phép phát.'));
  }catch(error){
   const text=String(error?.message||error);message(text,true);
   if(session)void invoke('pip:failed',{id:session.id,message:text}).catch(()=>{});
  }
 }
 void start();
})();
