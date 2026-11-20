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
