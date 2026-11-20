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
 // Device mode is based on real mobile platforms as well as narrow touch
 // viewports. An iPhone requesting a desktop user agent still gets a usable UI.
 function isMobile(){
  // The head bootstrap is authoritative, including desktop-site browser mode.
  if(typeof root?.OpenIPTVDevice?.isMobile==='function')
   return root.OpenIPTVDevice.isMobile();
  const search=String(root?.location?.search||'');
  if(/(?:^|[?&])(?:view|layout)=desktop(?:&|$)/i.test(search)||/(?:^|[?&])desktop=1(?:&|$)/i.test(search))return false;
  if(/(?:^|[?&])(?:view|layout)=mobile(?:&|$)/i.test(search))return true;
  const ua=String(root?.navigator?.userAgent||'');
  if(/(?:Macintosh|Windows NT|X11|Linux x86_64|CrOS)/i.test(ua)&&
   !/iPhone|iPad|iPod|Android|Mobile|Windows Phone/i.test(ua))return false;
  if(Number(root?.innerWidth||0)>=960)return false;
  return /iPhone|iPad|iPod|Android.+Mobile|Windows Phone|Opera Mini/i.test(ua)||
   Number(root?.innerWidth||Infinity)<=820;
 }
 // Move task progress outside the desktop footer hidden by mobile styles.
 function syncTaskDock(){
  if(!doc?.getElementById)return;
  const dock=doc.getElementById('taskDock');if(!dock)return;
  const footer=doc.querySelector?.('.footer');
  if(isMobile()){
   if(dock.parentNode!==doc.body)doc.body?.appendChild?.(dock);
  }else if(footer&&dock.parentNode!==footer)footer.appendChild(dock);
 }
 function setupTaskDock(){
  const dock=doc?.getElementById?.('taskDock');
  if(!dock||dock.dataset?.mobileProgressReady)return;
  if(dock.dataset)dock.dataset.mobileProgressReady='true';
  syncTaskDock();
  if(!root?.MutationObserver)return;
  let hidden=dock.classList.contains('hidden');
  new root.MutationObserver(()=>{
   const next=dock.classList.contains('hidden');
   if(hidden&&!next&&isMobile()){
    dock.classList.remove('collapsed');
    const button=doc.getElementById('taskDockMinimize');
    button?.setAttribute('aria-expanded','true');
    if(button)button.textContent='▾';
   }
   hidden=next;
  }).observe(dock,{attributes:true,attributeFilter:['class']});
 }
 function syncDevice(){
  if(!doc)return false;
  const mobile=isMobile();
  const element=doc.documentElement;
  if(typeof root?.OpenIPTVDevice?.refresh==='function')root.OpenIPTVDevice.refresh();
  else{
   element?.setAttribute?.('data-iptv-device',mobile?'mobile':'desktop');
   element?.classList?.toggle?.('iptv-mobile',mobile);
  }
  syncTaskDock();
  return mobile;
 }
 function isIOS(){
  const ua=String(root?.navigator?.userAgent||'');
  return /iPhone|iPad|iPod/.test(ua) ||
   (/Macintosh/.test(ua) && Number(root?.navigator?.maxTouchPoints||0)>1);
 }
 // Fullscreen capability is independent of the selected desktop/mobile UI.
 // Safari on iPhone can request Desktop Website, including a spoofed Mac UA.
 function isHandheld(){
  if(isMobile()||isIOS())return true;
  const ua=String(root?.navigator?.userAgent||'');
  if(/Android|Windows Phone|Opera Mini/i.test(ua))return true;
  const narrowScreen=Math.min(Number(root?.screen?.width||Infinity),Number(root?.screen?.height||Infinity))<=820;
  return narrowScreen&&Number(root?.navigator?.maxTouchPoints||0)>1;
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
  if(!doc||!isHandheld())return false; // preserve real desktop fullscreen code
  const {box,video}=elements();if(!box||!video)return false;
  if(exitTheater())return true;
  if(doc.fullscreenElement||doc.webkitFullscreenElement){
   const exit=doc.exitFullscreen||doc.webkitExitFullscreen;
   try{
    const done=exit?.call(doc);
    done?.catch?.(e=>console.warn('Fullscreen exit:',e));
   }catch(e){console.warn('Fullscreen exit:',e);}
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
    if(p?.catch)p.catch(()=>{if(!doc.fullscreenElement&&!doc.webkitFullscreenElement)enterTheater();});
    update(true);return true;
   }catch(e){console.warn('Element fullscreen unavailable:',e);}
  }
  // Some embedded iOS browsers disallow native fullscreen entirely.
  // This covers the website viewport, but cannot remove Safari browser chrome.
  return enterTheater();
 }


 // Flat SF-style vector symbols with distinct pastel strokes and no icon tiles.
 const mobileMorePaths={"multiview":"<rect x=\"3\" y=\"3\" width=\"7.5\" height=\"7.5\" rx=\"1.6\"/><rect x=\"13.5\" y=\"3\" width=\"7.5\" height=\"7.5\" rx=\"1.6\"/><rect x=\"3\" y=\"13.5\" width=\"7.5\" height=\"7.5\" rx=\"1.6\"/><rect x=\"13.5\" y=\"13.5\" width=\"7.5\" height=\"7.5\" rx=\"1.6\"/>","folders":"<path d=\"M3 7.5V6a2 2 0 0 1 2-2h4l2.1 2.5H19a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z\"/>","health":"<path d=\"M20.5 8.4c0 5-8.5 10.7-8.5 10.7S3.5 13.4 3.5 8.4a4.7 4.7 0 0 1 8.5-2.6 4.7 4.7 0 0 1 8.5 2.6Z\"/>","doctor":"<path d=\"M12 4v16M4 12h16\"/>","profiles":"<circle cx=\"12\" cy=\"7.5\" r=\"3.3\"/><path d=\"M5.3 21v-1.8a6.7 6.7 0 0 1 13.4 0V21Z\"/>","export":"<path d=\"M12 3v12m-4-4 4 4 4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3\"/>","settings":"<circle cx=\"12\" cy=\"12\" r=\"3.3\"/><path d=\"M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M4.9 4.9l1.7 1.7m10.8 10.8 1.7 1.7m0-14.2-1.7 1.7M6.6 17.4l-1.7 1.7\"/>","download":"<path d=\"M12 3v12m-4-4 4 4 4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3\"/>","cloud":"<path d=\"M7.8 18.7H6.6a4.5 4.5 0 0 1-.7-8.9 6.4 6.4 0 0 1 12.3 1.1 4 4 0 0 1-.7 7.8h-.8\"/><path d=\"M9 14l3-3 3 3M12 11v9\"/>","guide":"<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 10.5v6.2\"/><circle cx=\"12\" cy=\"7.4\" r=\".5\" fill=\"currentColor\" stroke=\"none\"/>"};
 function mobileMoreIcon(name){
  const p=mobileMorePaths[name]||mobileMorePaths.guide;
  return '<svg class="mobile-more-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
 }
 if(root)root.OpenIPTVMobileMoreIcon=mobileMoreIcon;

 // Mobile has five navigation destinations; all advanced pages remain reachable
 // through a dialog, using the app's existing page and permission handlers.
 function setupMobileNavigation(){
  if(!doc?.createElement)return;
  const sidebar=doc.getElementById('appSidebar');
  if(!sidebar||doc.getElementById('iptvMobileMoreTrigger'))return;
  const primary=[['tv','TV'],['fav','Yêu thích'],['epg','Lịch'],['sources','Nguồn']];
  for(const [page,label] of primary){
   const nav=sidebar.querySelector('.nav[data-page="'+page+'"]');
   if(!nav)continue;
   if(!nav.querySelector('.mobile-tab-caption')){
    const caption=doc.createElement('span');
    caption.className='mobile-tab-caption';
    caption.textContent=label;
    caption.setAttribute('aria-hidden','true');
    nav.append(caption);
   }
   nav.setAttribute('aria-label',label);
  }
  const more=doc.createElement('button');
  more.type='button';
  more.id='iptvMobileMoreTrigger';
  more.className='nav mobile-more-trigger';
  more.setAttribute('aria-label','Thêm tính năng');
  more.setAttribute('aria-controls','iptvMobileMoreOverlay');
  more.setAttribute('aria-expanded','false');
  more.innerHTML='<span class="macos-nav-symbol" aria-hidden="true">⋯</span><span class="mobile-tab-caption" aria-hidden="true">Thêm</span>';
  sidebar.append(more);
  const overlay=doc.createElement('div');
  overlay.id='iptvMobileMoreOverlay';
  overlay.className='mobile-more-overlay';
  overlay.hidden=true;
  overlay.innerHTML=`
   <div class="mobile-more-backdrop" data-mobile-more-close="true"></div>
   <section class="mobile-more-panel" role="dialog" aria-modal="true" aria-labelledby="iptvMobileMoreHeading">
    <header class="mobile-more-heading"><h2 id="iptvMobileMoreHeading">Thêm tính năng</h2><button type="button" class="mobile-more-close" aria-label="Đóng menu" data-mobile-more-close="true">✕</button></header>
    <div class="mobile-more-grid">
     <button type="button" class="mobile-more-action" data-mobile-more-page="multiview">${mobileMoreIcon('multiview')}MultiView</button>
     <button type="button" class="mobile-more-action" data-mobile-more-page="folders">${mobileMoreIcon('folders')}Thư mục</button>
     <button type="button" class="mobile-more-action" data-mobile-more-page="health">${mobileMoreIcon('health')}Sức khỏe kênh</button>
     <button type="button" class="mobile-more-action" data-mobile-more-page="doctor">${mobileMoreIcon('doctor')}IPTV Doctor</button>
     <button type="button" class="mobile-more-action" data-mobile-more-page="profiles">${mobileMoreIcon('profiles')}Hồ sơ</button>
     <button type="button" class="mobile-more-action" data-mobile-more-click="exportNav">${mobileMoreIcon('export')}Xuất M3U</button>
     <button type="button" class="mobile-more-action" data-mobile-more-page="settings">${mobileMoreIcon('settings')}Cài đặt</button>
     <button type="button" class="mobile-more-action" data-mobile-more-click="cloudAccountQuick">${mobileMoreIcon('cloud')}Tài khoản & đồng bộ</button>
     <a class="mobile-more-action" href="huong-dan.html" target="_blank" rel="noopener noreferrer">${mobileMoreIcon('guide')}Hướng dẫn Web</a>
    </div>
   </section>`;
  doc.body.append(overlay);
  function syncActive(){
   const active=sidebar.querySelector('.nav[data-page].active');
   const page=active?.dataset?.page||'tv';
   const isPrimary=primary.some(row=>row[0]===page);
   more.classList.toggle('active',!isPrimary||!overlay.hidden);
  }
  function close(restoreFocus=true){
   if(overlay.hidden)return;
   overlay.hidden=true;
   more.setAttribute('aria-expanded','false');
   syncActive();
   if(restoreFocus&&isMobile())more.focus();
  }
  function open(){
   if(!isMobile())return;
   overlay.hidden=false;
   more.setAttribute('aria-expanded','true');
   syncActive();
   overlay.querySelector('.mobile-more-close')?.focus();
  }
  more.addEventListener('click',()=>overlay.hidden?open():close());
  overlay.addEventListener('click',event=>{
   if(event.target.closest('[data-mobile-more-close]')){close();return;}
   const action=event.target.closest('[data-mobile-more-page],[data-mobile-more-click]');
   if(!action)return;
   const page=action.dataset.mobileMorePage;
   const clickId=action.dataset.mobileMoreClick;
   const destination=page?sidebar.querySelector('.nav[data-page="'+page+'"]'):doc.getElementById(clickId);
   close(false);
   destination?.click();
   syncActive();
  });
  overlay.addEventListener('keydown',event=>{
   if(event.key==='Escape'){event.preventDefault();close();return;}
   if(event.key!=='Tab')return;
   const focusable=[...overlay.querySelectorAll('button,a[href]')].filter(x=>!x.disabled);
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}
  });
  sidebar.addEventListener('click',event=>{
   if(event.target.closest('.nav[data-page]')){close(false);syncActive();}
  });
  if(typeof root.MutationObserver==='function'){
   const observer=new root.MutationObserver(syncActive);
   for(const nav of sidebar.querySelectorAll('.nav[data-page]'))
    observer.observe(nav,{attributes:true,attributeFilter:['class']});
  }
  root.addEventListener?.('resize',()=>{if(!isMobile())close(false);});
  syncActive();
 }
 if(doc){
  syncDevice();
  setupMobileNavigation();
  setupTaskDock();
  if(isIOS())doc.documentElement?.classList.add('web-is-ios');
  root.addEventListener?.('resize',syncDevice,{passive:true});
  root.addEventListener?.('pageshow',syncDevice,{passive:true});
  doc.addEventListener?.('DOMContentLoaded',syncDevice,{once:true});
  root.addEventListener?.('orientationchange',syncDevice,{passive:true});
  root.visualViewport?.addEventListener?.('resize',syncDevice,{passive:true});
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
 return Object.freeze({isMobile,isIOS,isHandheld,syncDevice,toggle,enterTheater,exitTheater});
});
