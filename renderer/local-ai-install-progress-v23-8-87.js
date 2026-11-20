'use strict';
/* Rust Lab: truthful per-download progress and complete install diagnostics.
 * No new player, model download, or interval. Reuses backend events and native install buttons. */
(()=>{
 const api=window.streamleaf,doc=document;
 if(!api?.captionOnEvent||!api?.ttsOnEvent)return;
 const byId=id=>doc.getElementById(id);
 function create(id,buttonId,prefix){
   const status=byId(id),trigger=byId(buttonId);
   if(!status)return null;
   const el=doc.createElement('div');el.className='local-ai-install-diagnostics';el.hidden=true;
   el.setAttribute('aria-live','polite');
   const line=doc.createElement('div');line.className='local-ai-install-line';
   const phase=doc.createElement('span');phase.className='local-ai-install-phase';
   const pct=doc.createElement('b');pct.className='local-ai-install-percent';
   line.append(phase,pct);
   const bar=doc.createElement('progress');bar.max=100;bar.className='local-ai-install-bar';bar.setAttribute('aria-label',prefix+' tiến trình cài đặt');
   const details=doc.createElement('details');details.className='local-ai-install-error';details.hidden=true;
   const summary=doc.createElement('summary');summary.textContent='Chi tiết lỗi cài đặt';
   const pre=doc.createElement('pre');details.append(summary,pre);
   el.append(line,bar,details);
   // Place just after its native status; do not move CC controls or change original listeners.
   status.insertAdjacentElement('afterend',el);
   if(trigger)trigger.addEventListener('click',()=>{el.hidden=false;phase.textContent='Bắt đầu cài đặt '+prefix+'…';pct.textContent='';bar.removeAttribute('value');details.hidden=true;details.open=false;});
   const appendError=e=>{
     const info=String(e?.details||e?.message||'Lỗi không xác định');
     el.hidden=false;details.hidden=false;details.open=true;pre.textContent=info;
     phase.textContent=prefix+' cài đặt thất bại';pct.textContent='Lỗi';
     bar.removeAttribute('value');
     // Full diagnostic stays visible when other one-line status labels truncate it.
     el.dataset.state='error';
   };
   const update=e=>{
     if(!e||!['setup-progress','progress','install-error','setup-error'].includes(e.type))return;
     if(e.type.endsWith('error')){appendError(e);return;}
     el.hidden=false;el.dataset.state=e.phase==='complete'?'complete':'installing';
     phase.textContent=String(e.message||'Đang cài đặt '+prefix);
     details.hidden=true;details.open=false;pre.textContent='';
     if(typeof e.percent==='number'&&Number.isFinite(e.percent)){
       const value=Math.max(0,Math.min(100,Math.round(e.percent)));
       bar.value=value;pct.textContent=value+'%';
     }else{
       bar.removeAttribute('value');pct.textContent='Đang xử lý';
     }
   };
   return {update,appendError};
 }
 const whisper=create('liveCaptionStatus','captionAutoInstall','Whisper');
 const voice=create('liveTtsStatus','liveTtsInstall','Giọng đọc');
 api.captionOnEvent(event=>{
   if(event?.type==='setup-progress'||event?.type==='setup-error')whisper?.update(event);
 });
 api.ttsOnEvent(event=>{
   if(event?.type==='progress'||event?.type==='install-error')voice?.update(event);
 });
})();
