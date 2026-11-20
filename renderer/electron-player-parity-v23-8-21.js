'use strict';
// Electron v4.23.68 player control parity. Move controls with their handlers intact.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root.document,root);
})(typeof window!=='undefined'?window:null,function(){
 function classifyWidth(width){
  const w=Number(width)||1200;
  return w<=450?'tiny':w<=720?'narrow':w<=1020?'compact':'wide';
 }
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
  const icon=doc.createElement('label');icon.htmlFor='volume';icon.textContent='';icon.setAttribute('aria-label','Âm lượng');
  icon.title='Điều chỉnh âm lượng kênh';master.append(icon,volume);top.append(master);
  const epg=$('epgCurrent'),guide=$('openGuideBtn');
  if(epg&&guide){
   guide.classList.remove('screen-reader-only');guide.removeAttribute('tabindex');
   guide.classList.add('electron-parity-guide');guide.textContent='';
   guide.title='Xem EPG';guide.setAttribute('aria-label','Mở lịch phát sóng');
   epg.append(guide);
  }
  const source=$('manualLinkSelect');
  if(source)source.title='Chọn link gốc hoặc dự phòng của kênh đang phát';
  const cc=$('rustSubtitleOptionsButton');
  if(cc){cc.textContent='CC · Tùy chỉnh';cc.title='Chỉnh phụ đề trên video';}
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
  shot.textContent='Chụp ảnh';body.append(shot);
  const btn=doc.createElement('button');btn.type='button';btn.id='electronParityFfmpeg';
  btn.textContent='FFmpeg dự phòng';btn.title='Thử bộ phát FFmpeg H.264/AAC';
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
  // Keep recognition status and Tools on their own slim row, as in the
  // confirmed Electron layout. Move original DOM nodes; do not clone handlers.
  const aiFooter=doc.createElement('div');aiFooter.className='caption-ai-footer';
  const recognitionStatus=$('liveCaptionStatus'),retry=$('captionRetry');
  if(recognitionStatus)aiFooter.append(recognitionStatus);
  if(retry)aiFooter.append(retry);
  aiFooter.append(menu);ai.append(aiFooter);
  // The whole TTS control set must fit on one row at desktop widths. The
  // spoken-status message sits underneath, never forcing 'Gốc' to wrap.
  const speechStatus=$('liveTtsStatus');
  if(speechStatus){
   const speechFooter=doc.createElement('div');
   speechFooter.className='caption-tts-footer';
   speechFooter.append(speechStatus);tts.append(speechFooter);
  }
  // The card can be 600–800px wide even inside a 1500px Mac window.
  // ResizeObserver watches its width; all original event listeners remain.
  const cast=$('castBtn'),fullCastLabel=cast?.textContent||'▣ Cast / AirPlay';
  if(cast&&!cast.getAttribute('aria-label'))cast.setAttribute('aria-label','Cast / AirPlay lên TV');
  function adaptPlayerWidth(){
   const width=card.getBoundingClientRect?.().width||card.clientWidth||1200;
   const compact=classifyWidth(width);
   card.dataset.playerWidth=compact;
   if(cast){
    const label=compact==='wide'?fullCastLabel:'▣ Cast';
    if(cast.textContent!==label)cast.textContent=label;
   }
  }
  adaptPlayerWidth();
  if(typeof win.ResizeObserver==='function'){
   const resize=new win.ResizeObserver(adaptPlayerWidth);
   resize.observe(card);
  }else win.addEventListener?.('resize',adaptPlayerWidth);
  return true;
 }
 return {mount,classifyWidth};
});
