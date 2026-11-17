'use strict';
/** v4.23.59 — complete-utterance TTS playback with one fresh pending subtitle. */
(function(root,factory){
 const exported=factory();
 if(typeof module==='object'&&module.exports)module.exports=exported;
 if(root)root.OpenIPTVSpeechQueue=exported;
})(typeof window!=='undefined'?window:null,function(){
 function createSpeechQueue({synthesize,play,cancelAudio=()=>{},cancelSynthesis=()=>{},
  notify=()=>{},now=()=>Date.now(),maxPendingAgeMs=18000,maxSynthAgeMs=25000,maxSynthesisMs=45000}={}){
  if(typeof synthesize!=='function'||typeof play!=='function')throw Error('Speech queue requires synthesis and playback');
  let pending=null,active=false,playing=false,paused=false,epoch=0,serial=0,enabled=true,lastSeq=0;
  const status=()=>({pending:!!pending,busy:active,playing,paused,epoch,lastSeq});
  const fresh=(job,limit)=>now()-job.createdAt<=limit;
  function pump(){
   if(!enabled||paused||active||playing||!pending)return;
   const job=pending;pending=null;
   if(!fresh(job,maxPendingAgeMs)){notify('Bỏ qua câu chờ quá lâu để theo kịp phụ đề');pump();return;}
   active=true;
   const generation=epoch;
   // A stuck local model must not block all future subtitles forever.
  // Wait for the backend stop acknowledgment before moving to the next job.
  async function timedSynthesis(){
   let timer=null;
   try{
    return await Promise.race([
     Promise.resolve().then(()=>synthesize(job.payload)),
     new Promise((_,reject)=>{
      timer=setTimeout(()=>{
       const error=Error('Tổng hợp giọng quá thời hạn; thử câu phụ đề mới nhất');
       error.code='TTS_SYNTH_TIMEOUT';reject(error);
      },Math.max(1000,maxSynthesisMs));
     })
    ]);
   }catch(error){
    if(error?.code==='TTS_SYNTH_TIMEOUT'){
     try{await Promise.resolve(cancelSynthesis());}catch{}
    }
    throw error;
   }finally{if(timer!==null)clearTimeout(timer);}
  }
  timedSynthesis().then(async result=>{
    if(generation!==epoch||!enabled)return;
    // When synthesis was slower than the next subtitle, use that next line;
    // do not start playing an obsolete sentence.
    if(pending&&pending.serial>job.serial)return;
    if(!fresh(job,maxSynthAgeMs)){
     notify('Câu tổng hợp quá trễ; bỏ qua để đồng bộ video');return;
    }
    playing=true;
    let finished=false;
    const onEnded=()=>{
     if(finished)return;finished=true;
     if(generation!==epoch)return;
     playing=false;
     pump();
    };
    try{
     await play(result,job.payload,onEnded);
    }catch(error){
     onEnded();
     throw error;
    }
   }).catch(error=>{
    if(generation===epoch&&enabled)notify('TTS: '+String(error?.message||error).slice(0,130));
   }).finally(()=>{
    if(generation!==epoch)return;
    active=false;
    if(!playing)pump();
   });
  }
  function enqueue(payload){
   if(!enabled||!payload?.text)return false;
   const seq=Number(payload.sequence)||0;
   if(seq&&seq<lastSeq)return false;
   if(seq)lastSeq=Math.max(seq,lastSeq);
   // Latest pending line replaces only WAITING work, never audible speech.
   pending={payload,createdAt:now(),serial:++serial};
   pump();
   return true;
  }
  function reset({stopSynthesis=true}={}){
   epoch++;pending=null;active=false;playing=false;lastSeq=0;
   try{cancelAudio();}catch{}
   if(stopSynthesis)try{cancelSynthesis();}catch{}
  }
  function setPaused(value){
   paused=!!value;
   if(!paused)pump();
  }
  function setEnabled(value){
   const next=!!value;
   if(!next){enabled=false;reset();}else enabled=true;
  }
  return Object.freeze({enqueue,reset,setEnabled,setPaused,status});
 }
 return {createSpeechQueue};
});
