/* Load scripts strictly in original order, after Rust storage hydration. */
'use strict';
(async()=>{
 try{await window.IPTVPrimaryPersistence.ready;}
 catch(error){console.error('Storage bootstrap failed:',error);}
 const modules=[
  'video-source-aspect-v17.js','app.js','auto-pip-v42363.js','cast-ui.js','features.js','advanced.js','collector.js',
  'doctor-v2.js','smart-discovery-ui.js','doctor-v3.js','backup-ui.js',
  'dvr-ui.js','settings-ui.js','ui-style.js','theme-stage.js','player-ux.js','fullscreen-panels.js','fullscreen-web-parity-v23-8-59.js',
  'rust-ai-preferences-v23-8-4.js','live-captions-v42343.js','local-tts-v42344.js','whisper-auto-v42345.js',
  'ai-hardware-advice-v42365.js','rust-electron-parity-v23-4.js','rust-ai-settings-v23-6.js','rust-native-cc-v23-8-20.js','rust-subtitle-controls-v23-8-5.js','electron-player-parity-v23-8-21.js'
 ];
 for(const filename of modules){
  await new Promise((resolve,reject)=>{
   const s=document.createElement('script');s.src=filename;s.async=false;
   s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được '+filename));
   document.body.append(s);
  });
 }
 // Resume saved modes after Whisper, TTS, Argos/MLX modules have loaded.
 window.RustAiPreferences?.activate?.();
})().catch(error=>{
 console.error('IPTV renderer startup error:',error);
 const el=document.createElement('div');el.textContent='Không thể mở giao diện IPTV: '+error.message;
 el.style.cssText='position:fixed;inset:0;z-index:100000;background:#131820;color:#fff;padding:32px;font:16px sans-serif';
 document.body.append(el);
});