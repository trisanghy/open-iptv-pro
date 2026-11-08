// Apply the saved preference before the stylesheet loads, avoiding theme flash.
(()=>{
 const key='open-iptv-pro-settings-v1';
 let mode='auto';
 try { const obj=JSON.parse(localStorage.getItem(key)||'{}');mode=['light','dark','auto'].includes(obj.appearanceMode)?obj.appearanceMode:'auto'; }catch{}
 const dark=!!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
 document.documentElement.dataset.theme=mode==='auto'?(dark?'dark':'light'):mode;
 document.documentElement.dataset.appearance=mode;
})();
