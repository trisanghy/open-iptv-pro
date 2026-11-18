'use strict';
// Web-only fullscreen adapter. iPhone Safari commonly does not support
// requestFullscreen() on arbitrary divs: use native video fullscreen first.
(function(build){
 const root=typeof window==='undefined'?null:window;
 const api=build(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)root.OpenIPTVMobilePlayer=api;
})(function(root){
 const doc=root?.document;
 function isMobile(){
  return !!(root?.matchMedia?.('(max-width: 760px)')?.matches ||
   root?.matchMedia?.('(pointer: coarse) and (max-width: 1000px)')?.matches);
 }
 function isIOS(){
  const ua=String(root?.navigator?.userAgent||'');
  return /iPhone|iPad|iPod/.test(ua) ||
   (/Macintosh/.test(ua) && Number(root?.navigator?.maxTouchPoints||0)>1);
 }
 function elements(){return {box:doc?.getElementById('playerBox'),video:doc?.getElementById('video'),button:doc?.getElementById('fullscreenBtn')};}
 function update(active){
  const {button}=elements();
  if(button){
   button.setAttribute('aria-pressed',String(!!active));
   button.setAttribute('aria-label',active?'Thoát toàn màn hình':'Toàn màn hình video');
   button.title=active?'Thoát toàn màn hình':'Toàn màn hình video';
  }
 }
 function enterTheater(){
  const {box}=elements();if(!box)return false;
  box.classList.add('mobile-theater');
  doc.documentElement?.classList.add('web-mobile-theater-open');
  update(true);
  return true;
 }
 function exitTheater(){
  const {box}=elements();
  if(!box?.classList.contains('mobile-theater'))return false;
  box.classList.remove('mobile-theater','player-idle');
  doc.documentElement?.classList.remove('web-mobile-theater-open');
  update(false);return true;
 }
 function toggle(){
  if(!doc||!isMobile())return false; // preserve desktop fullscreen code
  const {box,video}=elements();if(!box||!video)return false;
  if(exitTheater())return true;
  if(doc.fullscreenElement||doc.webkitFullscreenElement){
   const exit=doc.exitFullscreen||doc.webkitExitFullscreen;
   try{exit?.call(doc);}catch(e){console.warn('Fullscreen exit:',e);}
   update(false);return true;
  }
  if(isIOS() && video.webkitDisplayingFullscreen){
   try{video.webkitExitFullscreen?.();}catch(e){console.warn('iOS fullscreen exit:',e);}
   update(false);return true;
  }
  // Must run directly inside the original button click for browser user gesture.
  if(isIOS() && typeof video.webkitEnterFullscreen==='function' && video.readyState>=1){
   try{video.webkitEnterFullscreen();update(true);return true;}
   catch(e){console.warn('iOS native video fullscreen unavailable:',e);}
  }
  const req=box.requestFullscreen||box.webkitRequestFullscreen;
  if(typeof req==='function'){
   try{
    const p=req.call(box);
    if(p?.catch)p.catch(()=>enterTheater());
    update(true);return true;
   }catch(e){console.warn('Element fullscreen unavailable:',e);}
  }
  // Some embedded iOS browsers disallow native fullscreen entirely.
  // This covers the website viewport, but cannot remove Safari browser chrome.
  return enterTheater();
 }
 if(doc){
  if(isIOS())doc.documentElement?.classList.add('web-is-ios');
  doc.addEventListener('fullscreenchange',()=>{
   const {box}=elements();update(doc.fullscreenElement===box);
  });
  doc.getElementById('video')?.addEventListener?.('webkitendfullscreen',()=>update(false));
  doc.getElementById('video')?.addEventListener?.('webkitbeginfullscreen',()=>update(true));
  // Existing Player UX exits standard fullscreen; intercept only our fallback.
  root.addEventListener?.('click',event=>{
   if(!event.target?.closest?.('#fsExit'))return;
   if(exitTheater()){event.preventDefault?.();event.stopImmediatePropagation?.();}
  },true);
  doc.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&exitTheater())event.preventDefault?.();
  });
  for(const nav of doc.querySelectorAll?.('.sidebar .nav')||[]){
   if(!nav.getAttribute('aria-label'))nav.setAttribute('aria-label',nav.textContent.trim());
  }
 }
 return Object.freeze({isMobile,isIOS,toggle,enterTheater,exitTheater});
});
