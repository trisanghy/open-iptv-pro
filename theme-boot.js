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
 // Respect desktop-site requests: a desktop UA or wide layout viewport
 // takes precedence over physical screen size and touch capability.
 function preferredMode(){
  const search=String(root.location?.search||'');
  if(/(?:^|[?&])(?:view|layout)=desktop(?:&|$)/i.test(search)||/(?:^|[?&])desktop=1(?:&|$)/i.test(search))return 'desktop';
  if(/(?:^|[?&])(?:view|layout)=mobile(?:&|$)/i.test(search)||/(?:^|[?&])mobile=1(?:&|$)/i.test(search))return 'mobile';
  const nav=root.navigator||{},ua=String(nav.userAgent||'');
  const mobileUA=/iPhone|iPad|iPod|Android.+Mobile|Mobile.+Android|Windows Phone|Opera Mini/i.test(ua);
  const desktopUA=/(?:Macintosh|Windows NT|X11|Linux x86_64|CrOS)/i.test(ua)&&
   !/iPhone|iPad|iPod|Android|Mobile|Windows Phone|Opera Mini/i.test(ua);
  const width=Number(root.innerWidth||Infinity);
  if(desktopUA||(mobileUA&&width>=960))return 'desktop';
  if(mobileUA||nav.userAgentData?.mobile===true)return 'mobile';
  if(width<=820)return 'mobile';
  try{if(root.matchMedia?.('(max-width: 820px)')?.matches)return 'mobile';}catch{}
  return 'desktop';
 }
 function isMobile(){return preferredMode()==='mobile';}
 function syncViewport(mode){
  const meta=doc.querySelector?.('meta[name="viewport"]');
  if(!meta)return;
  const ua=String(root.navigator?.userAgent||'');
  const touch=Number(root.navigator?.maxTouchPoints||0)>0;
  const physical=Math.min(Number(root.screen?.width||Infinity),Number(root.screen?.height||Infinity));
  const desktopUA=/(?:Macintosh|Windows NT|X11|Linux x86_64|CrOS)/i.test(ua)&&
   !/iPhone|iPad|iPod|Android|Mobile|Windows Phone|Opera Mini/i.test(ua);
  const search=String(root.location?.search||'');
  const forced=/(?:^|[?&])(?:view|layout)=desktop(?:&|$)/i.test(search)||
   /(?:^|[?&])desktop=1(?:&|$)/i.test(search);
  const useDesktopWidth=mode==='desktop'&&physical<=820&&(touch||forced)&&(desktopUA||forced);
  const wanted=useDesktopWidth?'width=1024,initial-scale=1':'width=device-width,initial-scale=1';
  if(meta.getAttribute('content')!==wanted)meta.setAttribute('content',wanted);
 }
 function refresh(){
  const active=isMobile(),el=doc.documentElement;
  syncViewport(active?'mobile':'desktop');
  el.setAttribute('data-iptv-device',active?'mobile':'desktop');
  el.classList.toggle('iptv-mobile',active);
  return active;
 }
 root.OpenIPTVDevice=Object.freeze({isMobile,preferredMode,refresh});
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
