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
})(typeof window==='undefined'?null:window);
