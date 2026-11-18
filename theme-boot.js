// Apply the saved preference before the stylesheet loads, avoiding theme flash.
(()=>{
 const key='open-iptv-pro-settings-v1';
 let mode='auto';
 try { const obj=JSON.parse(localStorage.getItem(key)||'{}');mode=['light','dark','amoled','auto'].includes(obj.appearanceMode)?obj.appearanceMode:'auto'; }catch{}
 const dark=!!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
 document.documentElement.dataset.theme=mode==='auto'?(dark?'dark':'light'):mode;
 document.documentElement.dataset.appearance=mode;
 try {const cfg=JSON.parse(localStorage.getItem(key)||'{}');document.documentElement.dataset.navLayout='sidebar';document.documentElement.dataset.sidebarVisible=cfg.sidebarVisible===false?'false':'true';}catch{document.documentElement.dataset.navLayout='sidebar';document.documentElement.dataset.sidebarVisible='true';}
 try { const cfg=JSON.parse(localStorage.getItem(key)||'{}'); document.documentElement.dataset.customAccent=cfg.accentCustom===true?'true':'false'; if(cfg.accentCustom && /^#[0-9a-f]{6}$/i.test(cfg.accent||''))document.documentElement.style.setProperty('--accent',cfg.accent); } catch {}
 try {
  const saved=localStorage.getItem('open-iptv-pro-ui-style-v1');
  const allowed=['current','minimal','material3','hig','liquid','cinema','fluent','glass','broadcast','bento','swiss'];
  document.documentElement.dataset.uiStyle=allowed.includes(saved)?saved:'current';
 } catch { document.documentElement.dataset.uiStyle='current'; }
 try { const d=localStorage.getItem('open-iptv-pro-ui-density-v1'); document.documentElement.dataset.uiDensity=d==='compact'?'compact':'comfort'; } catch { document.documentElement.dataset.uiDensity='comfort'; }
})();

/* Mobile-first critical bootstrap (2026-11-18).
   Executed in <head> before desktop styles and user-saved sidebar state.
   Keeps the page accessible if the deferred mobile module or its CSS fails. */
;(function(root,doc){
 if(!root||!doc?.documentElement)return;
 function isMobile(){
  const nav=root.navigator||{},ua=String(nav.userAgent||'');
  if(/iPhone|iPad|iPod|Android.+Mobile|Mobile.+Android|Windows Phone|Opera Mini/i.test(ua)||
     nav.userAgentData?.mobile===true)return true;
  const screenShort=Math.min(Number(root.screen?.width||Infinity),Number(root.screen?.height||Infinity));
  const touch=Number(nav.maxTouchPoints||0)>0;
  const inner=Number(root.innerWidth||Infinity);
  // Responsive desktop windows deliberately use the compact layout too.
  if(inner<=820)return true;
  try{if(root.matchMedia?.('(max-width: 820px)')?.matches)return true;}catch{}
  if(screenShort<=820&&touch)return true;
  try{if(root.matchMedia?.('(max-width: 1024px) and (pointer: coarse)')?.matches)return true;}catch{}
  return false;
 }
 function refresh(){
  const active=isMobile(),el=doc.documentElement;
  el.setAttribute('data-iptv-device',active?'mobile':'desktop');
  el.classList.toggle('iptv-mobile',active);
  return active;
 }
 root.OpenIPTVDevice=Object.freeze({isMobile,refresh});
 refresh();
 // Fallback layout is intentionally small and scoped to phones. The full
 // web-mobile-player.css overrides these rules when loaded successfully.
 const style=doc.createElement('style');
 style.id='iptv-mobile-critical-layout';
 style.textContent=`
 html[data-iptv-device="mobile"],html[data-iptv-device="mobile"] body{
  width:100%!important;max-width:100%!important;overflow:hidden!important
 }
 html[data-iptv-device="mobile"] body #appShell{
  display:flex!important;flex-direction:column!important;position:relative!important;
  width:100%!important;max-width:100%!important;height:100dvh!important;overflow:hidden!important
 }
 html[data-iptv-device="mobile"] body #appShell>#appSidebar{
  position:fixed!important;inset:auto 0 0!important;display:flex!important;
  flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;
  justify-content:space-around!important;width:100%!important;min-width:0!important;
  max-width:100%!important;height:calc(65px + env(safe-area-inset-bottom,0px))!important;
  min-height:0!important;overflow-x:auto!important;overflow-y:hidden!important;
  padding:5px 8px max(5px,env(safe-area-inset-bottom,0px))!important;
  margin:0!important;z-index:850!important;
  transform:none!important;visibility:visible!important;
 }
 html[data-iptv-device="mobile"] body #appShell>#appSidebar .brand,
 html[data-iptv-device="mobile"] body #appShell>#appSidebar .aside-caption,
 html[data-iptv-device="mobile"] body #appShell>#appSidebar #sidebarToggleBtn{
  display:none!important
 }
 html[data-iptv-device="mobile"] body #appShell>#appSidebar .nav{
  flex:1 0 48px!important;min-width:48px!important;max-width:none!important;
  height:52px!important;min-height:52px!important;
  margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important
 }
 html[data-iptv-device="mobile"] body #appShell>.main{
  display:flex!important;flex-direction:column!important;position:relative!important;
  order:0!important;flex:1 1 auto!important;width:100%!important;
  min-width:0!important;max-width:100%!important;height:auto!important;min-height:0!important;
  margin:0!important;padding:0!important;overflow:hidden!important;
  transform:none!important;visibility:visible!important;opacity:1!important
 }
 html[data-iptv-device="mobile"] body #appShell>.main>.content{
  display:block!important;flex:1 1 auto!important;position:relative!important;
  width:100%!important;min-width:0!important;max-width:100%!important;
  height:auto!important;min-height:0!important;overflow-x:hidden!important;overflow-y:auto!important;
  padding:10px 10px calc(86px + env(safe-area-inset-bottom,0px))!important;
  -webkit-overflow-scrolling:touch!important
 }
 html[data-iptv-device="mobile"] body #appShell>.main>.content>.page.active-page{
  display:block!important;width:100%!important;min-height:100%!important;overflow:visible!important
 }
 html[data-iptv-device="mobile"] body #page-tv .tv-layout{
  display:flex!important;flex-direction:column!important;width:100%!important;
  min-width:0!important;max-width:100%!important;height:auto!important;gap:10px!important
 }
 html[data-iptv-device="mobile"] body #page-tv .watch-panel{
  display:flex!important;flex-direction:column!important;width:100%!important;min-width:0!important
 }
 html[data-iptv-device="mobile"] body #page-tv .player-box,
 html[data-iptv-device="mobile"] body #page-tv .player-control-card{
  width:100%!important;min-width:0!important;max-width:100%!important
 }
 html[data-iptv-device="mobile"] body #appShell>.main>.footer{display:none!important}
 `;
 doc.head.appendChild(style);
 root.addEventListener?.('pageshow',refresh);
 root.addEventListener?.('resize',refresh,{passive:true});
 root.addEventListener?.('orientationchange',refresh,{passive:true});
 doc.addEventListener?.('visibilitychange',()=>{if(!doc.hidden)refresh();});
})(window,document);
