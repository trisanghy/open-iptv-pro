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
}
 // P5.1.151: Nhật ký thông báo còn xem được sau khi toast gốc tự hết hạn.
 // Chỉ lưu trong RAM (tối đa 30 mục), không ghi playlist, không gọi mạng.
 const topbar=document.querySelector('#positronBar .p-actions');
 if(topbar){
  const trigger=document.createElement('button');trigger.type='button';
  trigger.id='poArchiveToggle';trigger.className='po-archive-toggle';
  trigger.setAttribute('aria-controls','poArchivePanel');
  trigger.setAttribute('aria-expanded','false');
  const bell=document.createElementNS('http://www.w3.org/2000/svg','svg');
  bell.setAttribute('viewBox','0 0 24 24');bell.setAttribute('width','18');bell.setAttribute('height','18');
  bell.setAttribute('fill','none');bell.setAttribute('stroke','currentColor');
  bell.setAttribute('stroke-width','1.8');bell.setAttribute('aria-hidden','true');
  const bellPath=document.createElementNS('http://www.w3.org/2000/svg','path');
  bellPath.setAttribute('d','M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4');
  bell.append(bellPath);
  const label=document.createElement('span');label.className='po-archive-label';label.textContent='Thông báo';
  const count=document.createElement('span');count.className='po-archive-count';count.hidden=true;
  trigger.append(bell,label,count);topbar.prepend(trigger);
  const panel=document.createElement('section');panel.id='poArchivePanel';
  panel.className='po-archive-panel';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
  panel.setAttribute('aria-label','Nhật ký thông báo phiên hiện tại');
  const title=document.createElement('h2');title.textContent='Nhật ký thông báo';
  const hint=document.createElement('p');hint.textContent='Tối đa 30 thông báo trong phiên này; tự xóa khi thoát ứng dụng.';
  const entries=document.createElement('ol');entries.id='poArchiveEntries';
  const actions=document.createElement('div');actions.className='po-archive-actions';
  const clear=document.createElement('button');clear.type='button';clear.id='poArchiveClear';clear.textContent='Xóa lịch sử';
  const close=document.createElement('button');close.type='button';close.id='poArchiveClose';close.textContent='Đóng';
  actions.append(clear,close);panel.append(title,hint,entries,actions);document.body.append(panel);
  let history=[],isOpen=false;const seen=new WeakSet();
  const render=()=>{
   count.textContent=String(history.length);count.hidden=history.length===0;
   trigger.setAttribute('aria-label','Nhật ký thông báo, '+history.length+' mục');
   entries.replaceChildren();
   if(!history.length){
    const empty=document.createElement('li');empty.className='po-archive-empty';
    empty.textContent='Chưa có thông báo trong phiên này.';entries.append(empty);
   }
   for(const item of history){
    const li=document.createElement('li');li.className='po-archive-item po-archive-'+item.severity;
    const heading=document.createElement('strong');
    heading.textContent=(item.severity==='warn'?'Cảnh báo':item.severity==='err'?'Lỗi':'Hoàn thành')+' · '+item.time;
    const body=document.createElement('p');body.textContent=item.text;
    li.append(heading,body);entries.append(li);
   }
   clear.disabled=history.length===0;
  };
  const collect=node=>{
   if(!(node instanceof Element)||!node.classList.contains('toast')||seen.has(node))return;
   seen.add(node);
   const text=String(node.dataset.poToastMessage||node.textContent||'').replace(/\s*×\s*$/,'').trim();
   if(!text)return;
   const severity=node.classList.contains('err')?'err':node.classList.contains('warn')?'warn':'ok';
   const time=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
   history.unshift({text:text.slice(0,500),severity,time});history=history.slice(0,30);render();
  };
  const dismiss=()=>{
   if(!isOpen)return;
   const restore=panel.contains(document.activeElement);
   isOpen=false;panel.hidden=true;trigger.setAttribute('aria-expanded','false');
   if(restore)trigger.focus({preventScroll:true});
  };
  trigger.addEventListener('click',()=>{
   if(isOpen){dismiss();return;}
   isOpen=true;panel.hidden=false;trigger.setAttribute('aria-expanded','true');
   render();close.focus({preventScroll:true});
  });
  close.addEventListener('click',dismiss);
  clear.addEventListener('click',()=>{history=[];render();clear.focus({preventScroll:true});});
  document.addEventListener('keydown',event=>{
   if(isOpen&&event.key==='Escape'){event.preventDefault();dismiss();}
  });
  document.addEventListener('pointerdown',event=>{
   if(isOpen&&!panel.contains(event.target)&&!trigger.contains(event.target))dismiss();
  });
  [...area.children].forEach(collect);
  new MutationObserver(records=>{
   for(const record of records)for(const node of record.addedNodes)collect(node);
  }).observe(area,{childList:true});
  render();
 }
})();
