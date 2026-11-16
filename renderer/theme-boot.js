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
