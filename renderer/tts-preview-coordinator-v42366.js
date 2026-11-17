'use strict';
/**
 * v4.23.66 — voice-preview is an exclusive, bounded session.
 * Its synthesis never races the caption queue or leaves it permanently paused.
 * The next live subtitle remains eligible while the user is hearing a sample.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)root.OpenIPTVPreviewCoordinator=api;
})(typeof window!=='undefined'?window:null,function(){
 function createPreviewCoordinator({
  queue,stopSynthesis,synthesize,play,onState=()=>{},onError=()=>{},
  timeoutMs=90000,setTimer=setTimeout,clearTimer=clearTimeout
 }={}){
  if(!queue?.setPaused||typeof stopSynthesis!=='function'||
   typeof synthesize!=='function'||typeof play!=='function')
   throw Error('Invalid preview coordinator dependencies');
  let generation=0,active=false,abortNow=null,stopAudio=null,stopPending=Promise.resolve();
  function stopBackend(){
   try{stopPending=Promise.resolve(stopSynthesis()).catch(()=>{});}
   catch{stopPending=Promise.resolve();}
   return stopPending;
  }
  function cancel(){
   const wasActive=active;
   const token=++generation;
   active=false;
   if(abortNow){abortNow();abortNow=null;}
   if(stopAudio){try{stopAudio();}catch{}stopAudio=null;}
   // Wait for IPC stop BEFORE resuming the live queue, never cancel the next subtitle.
   const finishing=wasActive?stopBackend():stopPending;
   void finishing.finally(()=>{
    if(token===generation){queue.setPaused(false);onState('idle');}
   });
   return finishing;
  }
  async function run(payload){
   if(active)return false;
   const token=++generation;
   active=true;
   queue.setPaused(true);
   onState('synthesizing');
   let timer=null;
   const cancelled=new Promise((_,reject)=>{
    abortNow=()=>{const error=Error('Đã hủy nghe thử');error.code='PREVIEW_CANCELLED';reject(error);};
   });
   const limit=new Promise((_,reject)=>{
    timer=setTimer(()=>{
     const error=Error('Nghe thử quá thời hạn; đã nhường bộ đọc cho phụ đề mới');
     error.code='PREVIEW_TIMEOUT';reject(error);
    },Math.max(1000,timeoutMs));
   });
   try{
    // Wait for any prior abort, then clear stale synthesis before starting sample.
    await stopPending;
    await stopBackend();
    if(token!==generation)return false;
    const wav=await Promise.race([Promise.resolve().then(()=>synthesize(payload)),cancelled,limit]);
    if(token!==generation)return false;
    onState('playing');
    await Promise.race([
     Promise.resolve().then(()=>play(wav,stop=>{stopAudio=stop;})),cancelled,limit
    ]);
    return token===generation;
   }catch(error){
    if(token===generation){
     if(error?.code==='PREVIEW_TIMEOUT')await stopBackend();
     if(error?.code!=='PREVIEW_CANCELLED')onError(error);
    }
    return false;
   }finally{
    if(timer!==null)clearTimer(timer);
    if(token===generation){
     active=false;abortNow=null;stopAudio=null;
     queue.setPaused(false);onState('idle');
    }
   }
  }
  return Object.freeze({run,cancel,isActive:()=>active});
 }
 return {createPreviewCoordinator};
});
