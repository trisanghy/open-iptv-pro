'use strict';
// Player UX v4.23.14: genuine seekable windows, fullscreen controls, shortcuts,
// and last-channel restore. Does not create a second player or alter playlists.
(()=>{
 const context=window.IPTVState;
 if(!context)return;
 const video=context.player, box=document.getElementById('playerBox');
 const seekWrap=document.getElementById('videoSeekWrap');
 const seek=document.getElementById('videoSeek'),fsSeek=document.getElementById('fsSeek');
 const fs=document.getElementById('fullscreenUX');
 let media={mode:'unknown',hls:false,seekable:false},hideTimer=0,dragging=false,fsDragging=false;
 const $=id=>document.getElementById(id);
 const clock=sec=>{if(!Number.isFinite(sec)||sec<0)return '00:00';const v=Math.floor(sec);return (v>=3600?String(Math.floor(v/3600)).padStart(2,'0')+':':'')+String(Math.floor(v%3600/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0');};
 function playbackRange(){
  try{
   // Ordinary LIVE is not a VOD, even if Chromium exposes a rolling seekable range.
   if(!['event','vod','timeshift','catchup'].includes(media.mode))return null;
   if(!video.seekable?.length)return null;
   const first=video.seekable.start(0),last=video.seekable.end(video.seekable.length-1);
   if(!Number.isFinite(first)||!Number.isFinite(last)||last-first<1)return null;

   return {start:first,end:last,length:last-first};
  }catch{return null;}
 }
 function refresh(){
  const range=playbackRange(),ch=context.getCurrent?.();
  const allowed=!!ch&&!!range&&['event','vod','timeshift','catchup'].includes(media.mode);
  seekWrap.hidden=!allowed;
  fsSeek.disabled=!allowed;
  fsSeek.hidden=!allowed;
  $('fsChannel').textContent=ch?.name||'Open IPTV Pro';
  $('fsPlay').textContent=video.paused?'▶':'Ⅱ';
  if(!allowed){$('fsPosition').textContent='LIVE';return;}
  const ratio=Math.max(0,Math.min(1,(video.currentTime-range.start)/range.length));
  if(!dragging)seek.value=String(Math.round(ratio*1000));
  if(!fsDragging)fsSeek.value=String(Math.round(ratio*1000));
  $('videoElapsed').textContent=clock(Math.max(0,video.currentTime-range.start));
  $('videoDuration').textContent=clock(range.length);
  $('fsPosition').textContent=clock(Math.max(0,video.currentTime-range.start))+' / '+clock(range.length);
  $('videoSeekHint').textContent=media.mode==='event'?'Chọn phân đoạn sự kiện':media.mode==='vod'?'Video theo yêu cầu':'Tua trong vùng có dữ liệu';
 }
 function jump(slider){
  const r=playbackRange();if(!r)return;
  try{video.currentTime=Math.min(r.end-.05,Math.max(r.start,r.start+r.length*Number(slider.value)/1000));}
  catch(e){console.warn('Seek denied',e);}
  refresh();
 }
 for(const [el,name] of [[seek,'main'],[fsSeek,'fs']]){
  const setDrag=value=>{if(name==='main')dragging=value;else fsDragging=value;};
  el.addEventListener('pointerdown',()=>setDrag(true));
  el.addEventListener('pointerup',()=>{jump(el);setDrag(false);});
  el.addEventListener('change',()=>{jump(el);setDrag(false);});
  el.addEventListener('input',()=>{jump(el);});
 }
 const wake=()=>{
  if(document.fullscreenElement!==box)return;
  box.classList.remove('player-idle');
  clearTimeout(hideTimer);
  hideTimer=setTimeout(()=>{
   if(fs.matches(':focus-within')||fsDragging)return;
   if(document.fullscreenElement===box)box.classList.add('player-idle');
  },2800);
 };
 document.addEventListener('fullscreenchange',()=>{
  const active=document.fullscreenElement===box;
  box.classList.toggle('fullscreen-mode',active);
  if(active)wake();else {clearTimeout(hideTimer);box.classList.remove('player-idle');}
  refresh();
 });
 box.addEventListener('pointermove',wake,{passive:true});
 box.addEventListener('pointerdown',wake,{passive:true});
 fs.addEventListener('focusin',wake);
 $('fsPlay').addEventListener('click',()=>document.getElementById('playBtn')?.click());
 $('fsPrev').addEventListener('click',()=>document.getElementById('prevBtn')?.click());
 $('fsNext').addEventListener('click',()=>document.getElementById('nextBtn')?.click());
 $('fsExit').addEventListener('click',()=>document.exitFullscreen?.());
 // Preserve ordinary editor / form / modal keyboard behavior.
 document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.isComposing)return;
  if(!document.getElementById('page-tv')?.classList.contains('active-page')&&document.fullscreenElement!==box)return;
  if(document.getElementById('modal')&&!document.getElementById('modal').classList.contains('hidden'))return;
  const focus=event.target;
  if(focus?.closest?.('input,select,textarea,[contenteditable="true"],[role="slider"]'))return;
  const key=event.key;
  if(key==='ArrowLeft'||key==='ArrowRight'){
   event.preventDefault();document.getElementById(key==='ArrowLeft'?'prevBtn':'nextBtn')?.click();
  }else if(key==='ArrowUp'||key==='ArrowDown'){
   event.preventDefault();const slider=$('volume');
   const n=Math.max(0,Math.min(100,Number(slider.value)+(key==='ArrowUp'?5:-5)));
   slider.value=String(n);slider.dispatchEvent(new Event('input',{bubbles:true}));
   if(video.muted&&n>0)video.muted=false;
  }
 });
 document.addEventListener('openiptv:media-info',ev=>{media=ev.detail||{mode:'unknown'};refresh();});
 for(const e of ['loadedmetadata','durationchange','progress','timeupdate','seeked','playing','pause','emptied'])video.addEventListener(e,refresh);
 // Restore only a channel present in an enabled source. Never auto-add a URL.
 // A short delay lets extension modules finish registering their state handlers.
 setTimeout(()=>{
  if(!window.streamleaf)return; // Only desktop startup, not the browser theme preview.
  const state=context.getStore?.(),id=state?.current;
  if(!id||context.getCurrent?.())return;
  const ch=context.getChannels?.().find(c=>c.id===id);
  if(!ch)return;
  void context.playChannel(id).catch(e=>console.warn('Last channel restore:',e.message));
 },500);
 refresh();
})();
