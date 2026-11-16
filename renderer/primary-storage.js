/* Tauri primary store: first import legacy localStorage, then read/write in the
 * Rust app-data directory. No 5MB WebKit quota for 1200+ playlist entries.
 * The bootstrap loads before the rest of the IPTV UI initializes. */
'use strict';
(() => {
 const api=window.streamleaf;
 const native=!!(api?.storeRead&&api?.storeWrite);
 const service={nativeReady:false,initialRaw:null,ready:null,enqueue,flush,loadFailure:null};
 window.IPTVPrimaryPersistence=service;
 let queued=null,timer=null,writePromise=Promise.resolve(),lastWarning=0;
 function warn(error){
  console.error('IPTV native storage error:',error);
  if(Date.now()-lastWarning>60000){
   lastWarning=Date.now();
   const area=document.getElementById('toastArea');
   if(area){const el=document.createElement('div');el.className='toast err';el.textContent='Lưu dữ liệu kênh trên ổ đĩa thất bại: '+String(error?.message||error).slice(0,160);area.append(el);setTimeout(()=>el.remove(),8000);}
  }
 }
 function valid(raw){if(typeof raw!=='string'||!raw)return false;try{const v=JSON.parse(raw);return v&&typeof v==='object'&&Array.isArray(v.channels)&&Array.isArray(v.sources);}catch{return false;}}
 function enqueue(raw){if(!service.nativeReady)return false;queued=raw;service.initialRaw=raw;
  if(timer)clearTimeout(timer);timer=setTimeout(()=>{void flush().catch(warn);},350);
  return true;
 }
 function flush(){
  if(!service.nativeReady||window.__openIPTVRestoringBackup)return writePromise;
  if(timer){clearTimeout(timer);timer=null;}
  if(queued!==null){
   const content=queued;queued=null;
   writePromise=writePromise.catch(()=>{}).then(async()=>{
    // If a later save is queued while this one is writing, it will be written
    // by a subsequent flush; writes are serialized to prevent stale overwrites.
    await api.storeWrite(content);
   });
  }
  return writePromise;
 }
 service.ready=(async()=>{
  if(!native)return;
  let onDisk;
  try{onDisk=await api.storeRead();}
  catch(e){service.loadFailure=String(e?.message||e);warn(e);return;}
  const local=localStorage.getItem('open-iptv-pro-4')||localStorage.getItem('streamleaf-3');
  if(valid(onDisk))service.initialRaw=onDisk;
  else if(valid(local)){
   // Never delete the local copy before native migration has succeeded.
   try{await api.storeWrite(local);service.initialRaw=local;}
   catch(e){service.loadFailure=String(e?.message||e);warn(e);return;}
  }else{service.initialRaw=null;}
  service.nativeReady=true;
  if(service.initialRaw){
   // Free WebKit storage after a confirmed, recoverable native copy exists.
   try{localStorage.removeItem('open-iptv-pro-4');}catch{}
  }
 })();
 window.addEventListener('pagehide',()=>{if(service.nativeReady&&!window.__openIPTVRestoringBackup)void flush().catch(warn);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&service.nativeReady)void flush().catch(warn);});
})();
