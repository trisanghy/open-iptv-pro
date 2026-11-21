'use strict';
// Positron P5.1.121 — actual 450px Electron QA showed the last success toast
// covering a channel card for 5.5 seconds without any manual dismiss action.
// Improve native notifications without altering the native toast function,
// persistence, playback, warning severity, or its existing expiration timer.
(()=>{
 const area=document.getElementById('toastArea');
 if(!area)return;
 function enhance(node){
  if(!(node instanceof Element)||!node.classList.contains('toast'))return;
  if(node.querySelector('.po-toast-dismiss'))return;
  const button=document.createElement('button');
  button.type='button';button.className='po-toast-dismiss';
  button.textContent='×';
  button.setAttribute('aria-label','Đóng thông báo / Dismiss notification');
  button.title='Đóng thông báo';
  button.addEventListener('click',event=>{
   event.preventDefault();event.stopPropagation();
   node.remove();
  });
  node.append(button);
  node.dataset.poDismissReady='true';
 }
 [...area.children].forEach(enhance);
 new MutationObserver(records=>{
  for(const record of records)
   for(const node of record.addedNodes)enhance(node);
 }).observe(area,{childList:true});
})();
