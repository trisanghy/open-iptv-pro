'use strict';
// v4.23.45: one click installs the optional Whisper binary + multilingual model.
(()=>{
 const $=id=>document.getElementById(id),button=$('captionAutoInstall'),status=$('liveCaptionStatus');
 if(!button||!status||!window.streamleaf?.captionAutoInstall)return;
 const setMessage=s=>{status.textContent=String(s||'').slice(0,170);status.title=status.textContent;};
 if(window.streamleaf.captionOnEvent){
  window.streamleaf.captionOnEvent(ev=>{
   if(ev?.type==='setup-progress')setMessage(ev.message||'Đang cài Whisper…');
  });
 }
 button.addEventListener('click',async()=>{
  if(button.disabled)return;
  button.disabled=true;button.textContent='Đang cài Whisper…';
  setMessage('Đang tự tải bộ chạy + mô hình Whisper. Cần internet lần đầu (~150 MB)…');
  try{
   const result=await window.streamleaf.captionAutoInstall();
   if(!result?.installed)throw Error('Chưa đủ bộ chạy và mô hình Whisper');
   setMessage('Whisper đã cài xong · nhận diện offline');
   button.textContent='Whisper đã cài ✓';
  }catch(e){setMessage('Cài Whisper thất bại: '+String(e.message||e).slice(0,115));button.textContent='Thử cài lại Whisper';}
  finally{button.disabled=false;}
 });
})();
