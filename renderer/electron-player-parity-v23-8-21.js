'use strict';
// Electron v4.23.68 player control parity. Move controls with their handlers intact.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root.document,root);
})(typeof window!=='undefined'?window:null,function(){
 function mount(doc,win){
  if(doc.getElementById('electronParityTools'))return false;
  const $=id=>doc.getElementById(id);
  const card=doc.querySelector('#page-tv .player-control-card');
  const top=card?.querySelector('.ipvp-main-row'),ai=card?.querySelector('.caption-ai-main'),tts=card?.querySelector('.caption-tts-main');
  const volume=$('volume'),shot=$('shotBtn');
  if(!card||!top||!ai||!tts||!volume||!shot)return false;
  card.classList.add('electron-parity-player');
  const master=doc.createElement('div');master.className='electron-parity-volume';
  master.setAttribute('role','group');master.setAttribute('aria-label','Âm lượng kênh');
  const icon=doc.createElement('label');icon.htmlFor='volume';icon.textContent='◖))';
  icon.title='Điều chỉnh âm lượng kênh';master.append(icon,volume);top.append(master);
  const epg=$('epgCurrent'),guide=$('openGuideBtn');
  if(epg&&guide){
   guide.classList.remove('screen-reader-only');guide.removeAttribute('tabindex');
   guide.classList.add('electron-parity-guide');guide.textContent='▤';
   guide.title='Xem EPG';guide.setAttribute('aria-label','Mở lịch phát sóng');
   epg.append(guide);
  }
  const source=$('manualLinkSelect');
  if(source)source.title='Chọn link gốc hoặc dự phòng của kênh đang phát';
  const cc=$('rustSubtitleOptionsButton');
  if(cc){cc.textContent='▣ CC · Tùy chỉnh';cc.title='Chỉnh phụ đề trên video';}
  const voice=$('liveTtsVoice');
  if(voice&&!tts.querySelector('label[for="liveTtsVoice"]')){
   const label=doc.createElement('label');label.htmlFor='liveTtsVoice';
   label.textContent='Giọng';label.className='tts-duck-label';voice.before(label);
  }
  const duck=tts.querySelector('label[for="liveTtsDuck"]');
  if(duck){duck.textContent='Gốc';duck.title='Âm lượng tiếng gốc khi TTS đọc';}
  const mode=tts.querySelector('label.tts-mode');
  if(mode)for(const child of mode.childNodes){if(child.nodeType===3){child.textContent=' 🔊 Giọng dịch';break;}}
  const menu=doc.createElement('details');menu.id='electronParityTools';menu.className='electron-parity-tools';
  const heading=doc.createElement('summary');heading.textContent='Công cụ  ⌄';
  heading.title='Chụp ảnh, FFmpeg, nghe thử và cài giọng';menu.append(heading);
  const body=doc.createElement('div');body.className='electron-parity-tools-body';menu.append(body);
  shot.textContent='▣ Chụp ảnh';body.append(shot);
  const btn=doc.createElement('button');btn.type='button';btn.id='electronParityFfmpeg';
  btn.textContent='↻ FFmpeg dự phòng';btn.title='Thử bộ phát FFmpeg H.264/AAC';
  btn.addEventListener('click',()=>{
   if(typeof win.IPTVState?.tryFfmpegManually!=='function')
    return win.IPTVState?.toast?.('FFmpeg chưa sẵn sàng','warn');
   btn.disabled=true;
   Promise.resolve().then(()=>win.IPTVState.tryFfmpegManually())
    .catch(error=>win.IPTVState?.toast?.('FFmpeg: '+String(error?.message||error),'warn'))
    .finally(()=>{btn.disabled=false;});
  });
  body.append(btn);
  for(const id of ['liveTtsVoicePreview','liveTtsInstall']){
   const el=$(id);if(el)body.append(el);
  }
  ai.append(menu);
  return true;
 }
 return {mount};
});
