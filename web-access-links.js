'use strict';
/* Small link panel: show both short and original URLs without replacing either. */
(function(root){
 if(!root?.document)return;
 const d=root.document,details=d.getElementById('oipAccessLinks');
 if(!details)return;
 const status=d.getElementById('oipAccessCopyStatus');
 for(const btn of details.querySelectorAll('button[data-copy-url]')){
  btn.addEventListener('click',async()=>{
   const value=btn.dataset.copyUrl;
   if(!value)return;
   try{await root.navigator.clipboard.writeText(value);
    if(status)status.textContent='Đã sao chép: '+value;
   }catch{
    if(status)status.textContent='Không thể sao chép tự động. Chọn trực tiếp đường dẫn bên cạnh để sao chép.';
   }
  });
 }
 d.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&details.open){details.open=false;details.querySelector('summary')?.focus();}
 });
 d.addEventListener('pointerdown',event=>{
  if(details.open&&!details.contains(event.target))details.open=false;
 });
 // Mobile hides the desktop topbar. Mirror the same URL list inside More.
 let mobileOverlay=null;
 function closeMobile(){
  if(mobileOverlay)mobileOverlay.hidden=true;
 }
 function openMobile(){
  if(!mobileOverlay){
   mobileOverlay=d.createElement('div');
   mobileOverlay.id='oipMobileLinkOverlay';
   mobileOverlay.hidden=true;
   mobileOverlay.setAttribute('role','dialog');
   mobileOverlay.setAttribute('aria-modal','true');
   mobileOverlay.setAttribute('aria-label','Liên kết Web và TV');
   const panel=details.querySelector('.oip-links-pop').cloneNode(true);
   const heading=panel.querySelector('.oip-links-title');
   const close=d.createElement('button');
   close.className='oip-links-close';
   close.type='button';
   close.textContent='×';
   close.setAttribute('aria-label','Đóng đường dẫn');
   panel.insertBefore(close,heading);
   const result=panel.querySelector('#oipAccessCopyStatus');
   if(result)result.id='oipMobileAccessCopyStatus';
   mobileOverlay.appendChild(panel);
   d.body.appendChild(mobileOverlay);
   mobileOverlay.addEventListener('click',async event=>{
    if(event.target===mobileOverlay||event.target.closest('.oip-links-close')){closeMobile();return;}
    const button=event.target.closest('button[data-copy-url]');
    if(!button)return;
    try{
     await root.navigator.clipboard.writeText(button.dataset.copyUrl);
     if(result)result.textContent='Đã sao chép: '+button.dataset.copyUrl;
    }catch{
     if(result)result.textContent='Không thể sao chép tự động. Chọn liên kết để sao chép thủ công.';
    }
   });
  }
  mobileOverlay.hidden=false;
  mobileOverlay.querySelector('.oip-links-close')?.focus();
 }
 function mountMobile(){
  const grid=d.querySelector('#iptvMobileMoreOverlay .mobile-more-grid');
  if(!grid)return false;
  if(grid.querySelector('#oipMobileLinkAction'))return true;
  const button=d.createElement('button');
  button.type='button';button.id='oipMobileLinkAction';
  button.className='mobile-more-action';
  button.innerHTML='<svg class="mobile-more-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 1 0-7.1-7.1l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/></svg>Liên kết Web / TV';
  button.addEventListener('click',()=>{
   d.querySelector('#iptvMobileMoreOverlay .mobile-more-close')?.click();
   openMobile();
  });
  grid.appendChild(button);
  return true;
 }
 if(!mountMobile() && typeof root.MutationObserver==='function'){
  const observer=new root.MutationObserver(()=>{if(mountMobile())observer.disconnect();});
  observer.observe(d.body,{childList:true,subtree:true});
 }
 d.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileOverlay&&!mobileOverlay.hidden)closeMobile();});

})(typeof window==='undefined'?null:window);
