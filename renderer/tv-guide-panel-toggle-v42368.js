'use strict';
/* UI-only: collapsible "Kênh hiện tại" guide in Cinema / Glass / Broadcast.
   No video element replacement, stream restart, or EPG data changes. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root&&root.document)api.bootstrap(root);
})(typeof window!=='undefined'?window:null,function(){
 const KEY='openiptv:tv-guide-panel-hidden:v1';
 const SUPPORTED=Object.freeze(['cinema','glass','broadcast']);
 function createController({doc,storage,win}={}){
  const page=doc?.getElementById?.('page-tv');
  const panel=doc?.getElementById?.('themeGuidePanel');
  const hideButton=doc?.getElementById?.('themeGuideHideBtn');
  const showButton=doc?.getElementById?.('themeGuideRestoreBtn');
  const root=doc?.documentElement;
  if(!page||!panel||!hideButton||!showButton||!root)return null;
  let hidden=false;
  try{hidden=storage?.getItem?.(KEY)==='1';}catch{}
  const refresh=()=>{
   root.dataset.tvGuideHidden=hidden?'true':'false';
   hideButton.setAttribute('aria-expanded',String(!hidden));
   hideButton.setAttribute('aria-label','Ẩn thanh Kênh hiện tại');
   hideButton.title='Ẩn thanh Kênh hiện tại';
   showButton.setAttribute('aria-expanded',String(!hidden));
   showButton.setAttribute('aria-label','Hiện thanh Kênh hiện tại');
   showButton.title='Hiện thanh Kênh hiện tại';
   // Do not mutate video/EPG; the existing caption reflow listens to resize.
   try{win?.dispatchEvent?.(new win.Event('resize'));}catch{}
  };
  function setHidden(value,{persist=true}={}){
   const next=!!value,changed=hidden!==next;
   hidden=next;
   if(persist){
    try{storage?.setItem?.(KEY,hidden?'1':'0');}catch{}
   }
   if(changed||!root.dataset.tvGuideHidden)refresh();
   return hidden;
  }
  const hide=()=>setHidden(true);
  const show=()=>setHidden(false);
  hideButton.addEventListener('click',hide);
  showButton.addEventListener('click',show);
  refresh();
  return Object.freeze({
   isHidden:()=>hidden,
   setHidden,
   dispose(){
    hideButton.removeEventListener('click',hide);
    showButton.removeEventListener('click',show);
   }
  });
 }
 function bootstrap(root){
  if(root.OpenIPTVTVGuideToggle)return root.OpenIPTVTVGuideToggle;
  const controller=createController({
   doc:root.document,storage:root.localStorage,win:root
  });
  if(controller)root.OpenIPTVTVGuideToggle=controller;
  return controller;
 }
 return Object.freeze({KEY,SUPPORTED,createController,bootstrap});
});
