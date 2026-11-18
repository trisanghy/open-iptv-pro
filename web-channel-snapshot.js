'use strict';
/* Real video-frame snapshots for web, respecting browser CORS, autoplay, DRM. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)root.OpenIPTVWebSnapshot=api;
})(typeof window!=='undefined'?window:null,function(root){
 const abortError=()=>Object.assign(new Error('Đã hủy chụp ảnh'),{name:'AbortError'});
 const isHLS=url=>/\.m3u8(?:[?#]|$)/i.test(url);
 const isDASH=url=>/\.mpd(?:[?#]|$)/i.test(url);
 function isSafeURL(url){
  try{
   const u=new URL(url,root?.location?.href);
   return (u.protocol==='https:'||(u.protocol==='http:'&&root?.location?.protocol!=='https:'))&&!u.username&&!u.password;
  }catch{return false;}
 }
 function frame(video,doc){
  if(!doc?.createElement||!video||video.readyState<2||!video.videoWidth||!video.videoHeight)
   throw Error('Chưa có khung hình video thực để chụp');
  const cv=doc.createElement('canvas');
  cv.width=Math.max(1,Math.min(360,video.videoWidth));
  cv.height=Math.max(1,Math.round(cv.width*video.videoHeight/video.videoWidth));
  const ctx=cv.getContext?.('2d');
  if(!ctx)throw Error('Thiết bị không hỗ trợ Canvas');
  try{
   ctx.drawImage(video,0,0,cv.width,cv.height);
   const data=cv.toDataURL('image/jpeg',0.55);
   if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]{80,}/.test(data))throw Error('Không có ảnh JPEG hợp lệ');
   if(data.length>100000)throw Error('Ảnh quá lớn cho bộ nhớ Web');
   return {data,method:'Web Video',width:cv.width,height:cv.height};
  }catch(e){
   if(/securityerror|taint|cors|cross.origin|drm/i.test(String(e?.name||'')+' '+String(e?.message||'')))
    throw Error('Không thể chụp vì luồng video bị chặn CORS/DRM');
   throw e;
  }
 }
 function captureURL(url,{doc,signal,timeoutMs,host}){
  return new Promise((resolve,reject)=>{
   const video=doc.createElement('video');
   let hls,dash,timer,settled=false,playStarted=false;
   const cleanup=(error,value)=>{
    if(settled)return;
    settled=true;clearTimeout(timer);
    signal?.removeEventListener?.('abort',cancel);
    for(const [type,fn] of events)video.removeEventListener?.(type,fn);
    try{hls?.destroy?.();}catch{}
    try{dash?.reset?.();}catch{}
    try{video.pause?.();video.removeAttribute?.('src');video.load?.();video.remove?.();}catch{}
    if(error)reject(error);else resolve(value);
   };
   const cancel=()=>cleanup(abortError());
   const onFrame=()=>{
    if(settled||!video.videoWidth||!video.videoHeight||video.readyState<2)return;
    try{cleanup(null,frame(video,doc));}catch(e){cleanup(e);}
   };
   const play=()=>{
    if(playStarted||settled)return;
    playStarted=true;
    try{
     const p=video.play?.();
     p?.catch?.(e=>{
      if(settled||e?.name==='AbortError')return;
      cleanup(Error(e?.name==='NotAllowedError'
       ?'Safari chặn video chạy ngầm; hãy mở kênh và chụp khi có hình'
       :'Không phát được video để chụp: '+(e?.message||e)));
     });
    }catch(e){cleanup(e);}
   };
   const onError=()=>cleanup(Error('Không tải được khung hình (codec, kết nối, token hoặc CORS)'));
   const events=[['loadeddata',onFrame],['playing',onFrame],['timeupdate',onFrame],['canplay',play],['error',onError]];
   events.forEach(([name,fn])=>video.addEventListener?.(name,fn));
   signal?.addEventListener?.('abort',cancel,{once:true});
   timer=setTimeout(()=>cleanup(Error('Hết thời gian chờ khung hình ('+Math.round(timeoutMs/1000)+' giây)')),timeoutMs);
   try{
    video.muted=true;video.defaultMuted=true;video.playsInline=true;
    video.preload='auto';video.crossOrigin='anonymous';
    video.setAttribute?.('playsinline','');video.setAttribute?.('webkit-playsinline','');
    if(video.style)video.style.cssText='position:fixed;left:-8px;bottom:-8px;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1';
    doc.body?.appendChild?.(video);
    if(isHLS(url)&&host?.Hls?.isSupported?.()){
     hls=new host.Hls({enableWorker:false,maxBufferLength:5,maxMaxBufferLength:8});
     hls.on?.(host.Hls.Events?.ERROR,(_e,data)=>{
      if(data?.fatal)cleanup(Error('HLS lỗi: '+(data.details||data.type||'không rõ')));
     });
     hls.loadSource(url);hls.attachMedia(video);
    }else if(isDASH(url)){
     if(!host?.dashjs?.MediaPlayer)throw Error('Thiếu bộ phát DASH trên trình duyệt');
     dash=host.dashjs.MediaPlayer().create();dash.initialize(video,url,false);
    }else{
     video.src=url;video.load?.();
    }
    if(!isHLS(url)||video.canPlayType?.('application/vnd.apple.mpegurl'))play();
   }catch(e){cleanup(e);}
  });
 }
 async function capture(channel,opts={}){
  const doc=opts.document||root?.document,signal=opts.signal;
  if(signal?.aborted)throw abortError();
  if(!doc?.createElement)throw Error('Không có Canvas/Video trong trình duyệt');
  if(opts.currentVideo?.videoWidth>0&&opts.currentVideo.readyState>=2){
   try{return frame(opts.currentVideo,doc);}catch(e){if(opts.currentOnly)throw e;}
  }
  const links=[...new Set([...(opts.links||[]),channel?.url].filter(isSafeURL))].slice(0,2);
  if(!links.length)throw Error('Không có liên kết HTTPS/HTTP hợp lệ');
  const timeoutMs=Math.max(2500,Math.min(16000,Number(opts.timeoutMs)||9500));
  let last;
  for(const url of links){
   if(signal?.aborted)throw abortError();
   try{return await captureURL(url,{doc,signal,timeoutMs,host:opts.root||root});}
   catch(e){if(signal?.aborted||e?.name==='AbortError')throw abortError();last=e;}
  }
  throw Error(last?.message||'Chưa lấy được hình từ nguồn video');
 }
 return Object.freeze({capture,frame,isSafeURL});
});
