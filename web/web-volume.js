'use strict';
/* Web-only volume presentation. Reuses #volume and app.js' existing persisted handler. */
(() => {
 if (window.streamleaf) return;
 const video=document.getElementById('video');
 const range=document.getElementById('volume');
 const mute=document.getElementById('webVolumeMute');
 if (!video || !range || !mute) return;
 let lastAudible=Math.max(.15,Number(video.volume)||0.8);
 const clamp=value=>Math.max(0,Math.min(1,Number.isFinite(Number(value))?Number(value):0));
 function update(){
  const v=clamp(video.volume);
  range.value=String(Math.round(v*100));
  if(v>0) lastAudible=v;
  const silent=!!video.muted||v===0;
  mute.firstElementChild.textContent=silent?'🔇':'🔊';
  mute.setAttribute('aria-pressed',String(silent));
  mute.setAttribute('aria-label',silent?'Bật tiếng':'Tắt tiếng');
  mute.title=silent?'Bật tiếng':'Tắt tiếng';
 }
 mute.addEventListener('click',()=>{
  const silent=!!video.muted||clamp(video.volume)===0;
  if(silent){
   if(clamp(video.volume)===0){
    range.value=String(Math.round(Math.max(.15,lastAudible)*100));
    range.dispatchEvent(new Event('input',{bubbles:true}));
   }
   video.muted=false;
  }else video.muted=true;
  update();
 });
 range.addEventListener('input',()=>{
  const next=clamp(Number(range.value)/100);
  if(next>0){lastAudible=next;video.muted=false;}
  else video.muted=true;
  update();
 });
 video.addEventListener('volumechange',update);
 update();
})();
