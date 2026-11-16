/* Load scripts strictly in original order, after Rust storage hydration. */
'use strict';
(async()=>{
 try{await window.IPTVPrimaryPersistence.ready;}
 catch(error){console.error('Storage bootstrap failed:',error);}
 const modules=[
  'app.js','cast-ui.js','features.js','advanced.js','collector.js',
  'doctor-v2.js','smart-discovery-ui.js','doctor-v3.js','backup-ui.js',
  'dvr-ui.js','settings-ui.js','ui-style.js','theme-stage.js','player-ux.js','fullscreen-panels.js'
 ];
 for(const filename of modules){
  await new Promise((resolve,reject)=>{
   const s=document.createElement('script');s.src=filename;s.async=false;
   s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được '+filename));
   document.body.append(s);
  });
 }
})().catch(error=>{
 console.error('IPTV renderer startup error:',error);
 const el=document.createElement('div');el.textContent='Không thể mở giao diện IPTV: '+error.message;
 el.style.cssText='position:fixed;inset:0;z-index:100000;background:#131820;color:#fff;padding:32px;font:16px sans-serif';
 document.body.append(el);
});
