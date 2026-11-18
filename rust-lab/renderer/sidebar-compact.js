/* Rust Lab v8 — compact navigation rail, no dependency on Tauri backend. */
(function(){
 'use strict';
 const root=document.documentElement;
 const button=document.getElementById('sidebarToggle');
 const sidebar=document.getElementById('appSidebar');
 if(!button||!sidebar)return;
 const KEY='openiptv:rustlab:sidebar-collapsed';
 const getSaved=()=>{try{return localStorage.getItem(KEY)==='true';}catch(_){return false;}};
 function setCollapsed(value,save=true){
  const collapsed=!!value;
  root.dataset.sidebarCollapsed=String(collapsed);
  button.setAttribute('aria-expanded',String(!collapsed));
  button.setAttribute('aria-label',collapsed?'Mở rộng sidebar':'Thu gọn sidebar');
  button.title=collapsed?'Mở rộng sidebar':'Thu gọn sidebar';
  // Keep the icon bar keyboard navigable and screen-reader labelled.
  if(save){try{localStorage.setItem(KEY,String(collapsed));}catch(_){/* quota exceeded: still change UI */}}
 }
 setCollapsed(getSaved(),false);
 button.addEventListener('click',()=>setCollapsed(root.dataset.sidebarCollapsed!=='true'));
 window.IPTVSidebarCompact={setCollapsed,isCollapsed:()=>root.dataset.sidebarCollapsed==='true'};
})();
