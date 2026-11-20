'use strict';
/* Fix Safari/Chrome Request Desktop Website on an iPhone.
 * A 1024px virtual width shrinks the whole desktop layout, but 100vh can
 * remain measured in unscaled CSS pixels; the app-shell then covers only
 * part of the physical screen. Preserve the desktop layout and compensate
 * just the vertical shell extent, not the width or video aspect ratio. */
(function(root,doc){
 if(!root||!doc?.documentElement)return;
 const html=doc.documentElement;
 let queued=false;
 function refresh(){
  const screenWidth=Number(root.screen?.width||0);
  const screenHeight=Number(root.screen?.height||0);
  const layoutWidth=Math.max(Number(root.innerWidth||0),Number(html.clientWidth||0));
  const desktop=html.getAttribute('data-iptv-device')==='desktop';
  const isPhonePortrait=screenWidth>0&&screenHeight>screenWidth&&screenWidth<=650;
  const isVirtualDesktop=layoutWidth>=820&&layoutWidth>screenWidth*1.45;
  if(!desktop||!isPhonePortrait||!isVirtualDesktop){
   html.removeAttribute('data-iptv-handheld-desktop');
   html.style.removeProperty('--iptv-desktop-usable-height');
   return false;
  }
  const ordinaryHeight=Math.max(Number(root.innerHeight||0),Number(html.clientHeight||0),620);
  const ratio=layoutWidth/screenWidth;
  const standalone=!!root.navigator?.standalone||
   !!root.matchMedia?.('(display-mode: standalone)')?.matches;
  // In browser mode reserve room for iOS status/address/bottom controls.
  // In Home Screen standalone mode no browser toolbar is present.
  const chrome=standalone?0:Math.min(140,Math.max(70,screenHeight*0.15));
  const fullScreenHeight=(screenHeight-chrome)*ratio;
  const visualHeight=Number(root.visualViewport?.height||0);
  // Some iOS WebKit versions expose already-correct visualViewport.height;
  // others return an unscaled value. Use it only if demonstrably larger.
  const corrected=Math.ceil(Math.max(ordinaryHeight,fullScreenHeight,
   visualHeight>ordinaryHeight*1.25?visualHeight:0));
  html.style.setProperty('--iptv-desktop-usable-height',corrected+'px');
  html.setAttribute('data-iptv-handheld-desktop','true');
  return true;
 }
 function schedule(){
  if(queued)return;
  queued=true;
  const raf=typeof root.requestAnimationFrame==='function'
   ?root.requestAnimationFrame.bind(root):fn=>fn();
  raf(()=>{queued=false;refresh();});
 }
 root.addEventListener?.('resize',schedule);
 root.addEventListener?.('orientationchange',schedule);
 root.addEventListener?.('pageshow',schedule);
 root.visualViewport?.addEventListener?.('resize',schedule);
 doc.addEventListener?.('DOMContentLoaded',schedule);
 refresh();
 root.OpenIPTVDesktopViewportFix=Object.freeze({refresh});
})(typeof window==='undefined'?null:window,typeof document==='undefined'?null:document);


/* iPhone requesting desktop layout: replace the persistent compact icon rail
 * with a temporary, full-label navigation drawer. Never persist this toggle. */
(function(root,doc){
 if(!root||!doc?.documentElement)return;
 const html=doc.documentElement;
 let opener=null,veil=null,sidebar=null,edge=null;
 const active=()=>html.getAttribute('data-iptv-device')==='desktop'&&
  html.getAttribute('data-iptv-handheld-desktop')==='true';
 const isOpen=()=>html.getAttribute('data-iptv-handheld-menu')==='open';
 function toggle(open){
  const next=!!open&&active();
  if(!active())html.removeAttribute('data-iptv-handheld-menu');
  else html.setAttribute('data-iptv-handheld-menu',next?'open':'closed');
  opener?.setAttribute('aria-expanded',String(next));
  edge?.setAttribute('aria-expanded',String(next));
  if(veil)veil.hidden=!next;
 }
 function sync(){
  root.OpenIPTVDesktopViewportFix?.refresh?.();
  if(!active()){toggle(false);return;}
  const deviceWidth=Number(root.screen?.width||0);
  const layoutWidth=Math.max(Number(root.innerWidth||0),Number(html.clientWidth||0));
  const scale=deviceWidth>0?Math.min(3,Math.max(1,layoutWidth/deviceWidth)):2.5;
  html.style.setProperty('--iptv-phone-tap',Math.round(scale*48)+'px');
  html.style.setProperty('--iptv-phone-gap',Math.round(scale*12)+'px');
  html.style.setProperty('--iptv-phone-font',Math.round(scale*14)+'px');
  if(!html.hasAttribute('data-iptv-handheld-menu'))
   html.setAttribute('data-iptv-handheld-menu','closed');
 }
 function mount(){
  if(opener||typeof doc.getElementById!=='function'||typeof doc.createElement!=='function')return;
  const shell=doc.getElementById('appShell');
  sidebar=doc.getElementById('appSidebar');
  edge=doc.getElementById('sidebarToggleBtn');
  if(!shell||!sidebar||!edge)return;
  opener=doc.createElement('button');
  opener.type='button';opener.id='iptvDesktopPhoneMenuButton';
  opener.setAttribute('aria-label','Mở danh mục');
  opener.setAttribute('title','Mở danh mục');
  opener.setAttribute('aria-controls','appSidebar');
  opener.setAttribute('aria-expanded','false');
  opener.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  veil=doc.createElement('div');veil.id='iptvDesktopPhoneMenuVeil';
  veil.hidden=true;veil.setAttribute('aria-hidden','true');
  shell.append(opener,veil);
  opener.addEventListener('click',()=>toggle(true));
  veil.addEventListener('click',()=>toggle(false));
  // Capture only when using desktop-on-phone. Keep desktop's existing saved
  // sidebar toggle handler and stored preference completely untouched.
  edge.addEventListener('click',event=>{
   if(!active())return;
   event.preventDefault();
   event.stopImmediatePropagation();
   toggle(false);opener.focus?.();
  },true);
  sidebar.addEventListener('click',event=>{
   if(!active())return;
   if(event.target?.closest?.('.nav[data-page],.software-download-nav,#exportNav'))
    toggle(false);
  });
  doc.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&active()&&isOpen()){
    toggle(false);opener.focus?.();
   }
  });
  sync();
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
 root.addEventListener('resize',()=>root.requestAnimationFrame?.(sync));
 root.addEventListener('orientationchange',()=>root.requestAnimationFrame?.(sync));
 root.addEventListener('pageshow',sync);
 doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)sync();});
})(typeof window==='undefined'?null:window,typeof document==='undefined'?null:document);
