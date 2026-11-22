'use strict';
// Positron P5.1.121 — actual 450px Electron QA showed the last success toast
// covering a channel card for 5.5 seconds without any manual dismiss action.
// Improve native notifications without altering the native toast function,
// persistence, playback, warning severity, or its existing expiration timer.
(()=>{
 const area=document.getElementById('toastArea');
 if(!area)return;
 // P5.1.122: Keep the last native focus target outside notifications.
 let returnFocus=null;
 document.addEventListener('focusin',event=>{
  const target=event.target;
  if(target instanceof HTMLElement&&!area.contains(target))returnFocus=target;
 },true);
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
   const restore=document.activeElement===button?returnFocus:null;
   node.remove();
   if(restore?.isConnected&&typeof restore.focus==='function'&&!restore.disabled)
    restore.focus({preventScroll:true});
  });
  node.append(button);
  node.dataset.poDismissReady='true';
 }
 // P5.1.150: A native, temporary notification centre. Only the most recent
 // successful notice stays on screen by default. The viewer may expand all
 // still-live successes, then collapse them; warnings/errors remain visible.
 // No history is stored, and the original 5.5s timer remains authoritative.
 const showMore=document.createElement('button');
 showMore.type='button';showMore.className='po-toast-history-toggle';
 showMore.hidden=true;showMore.setAttribute('aria-expanded','false');
 showMore.setAttribute('aria-label','Xem các thông báo thành công gần đây');
 let expanded=false;
 const successes=()=>[...area.children].filter(node=>node.classList?.contains('toast')
  &&!node.classList.contains('err')&&!node.classList.contains('warn'));
 const syncHistory=()=>{
  // Other legacy modules/tests may replace all children to reset messages.
  // Reattach the control to the live native container, never to an old node.
  if(showMore.parentElement!==area)area.prepend(showMore);
  const count=Math.max(0,successes().length-1);
  if(count===0)expanded=false;
  const restore=count===0&&document.activeElement===showMore?returnFocus:null;
  showMore.hidden=count===0;
  showMore.setAttribute('aria-expanded',String(expanded));
  showMore.textContent=expanded?'Thu gọn thông báo':'Xem thêm '+count+' thông báo';
  area.classList.toggle('po-toast-history-open',expanded);
  if(restore?.isConnected&&!restore.disabled)restore.focus({preventScroll:true});
 };
 showMore.addEventListener('click',()=>{
  expanded=!expanded;syncHistory();
 });
 area.prepend(showMore);
 [...area.children].forEach(enhance);
 new MutationObserver(records=>{
  for(const record of records)
   for(const node of record.addedNodes)enhance(node);
  syncHistory();
 }).observe(area,{childList:true});
 syncHistory();
})();
