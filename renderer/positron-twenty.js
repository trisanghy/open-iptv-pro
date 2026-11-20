'use strict';
/* Positron P5 incremental UI and accessibility layer.
   No changes to IPTVState storage, playlist playback or streaming pipeline. */
(()=>{
 const d=document,root=d.documentElement;
 if(root.dataset.positron!=='true'||!d.getElementById('positronBar'))return;
 const byId=id=>d.getElementById(id);
 const maxStage=20;
 let stage=0,previous=null;
 const setStage=(target,feedback=null)=>{
   const next=Math.max(0,Math.min(maxStage,Number(target)||0));
   for(let i=1;i<=maxStage;i++)root.classList.toggle('p20-'+String(i).padStart(2,'0'),i<=next);
   stage=next;
   root.dataset.p20Stage=String(next);
   if(feedback&&typeof feedback==='object'){
     previous={round:Number(feedback.round)||null,overflow:!!feedback.overflow,sha256:String(feedback.sha256||'')};
     root.dataset.p20Feedback=previous.overflow?'overflow':'ok';
   }
   return {stage,fromRound:previous?.round??null};
 };
 setStage(20);
 // All labels below are additive. Native handlers and stream controls stay intact.
 const metadata=[
  ['playBtn','Phát hoặc tạm dừng kênh'],['stopBtn','Dừng phát kênh'],
  ['fullscreenBtn','Bật toàn màn hình'],['castBtn','Phát lên TV qua Cast hoặc AirPlay'],
  ['pipBtn','Chế độ hình trong hình'],['refreshAllBtn','Làm mới danh sách nguồn IPTV'],
  ['positronHelpBtn','Hướng dẫn phím tắt'],['positronFiltersToggle','Hiển thị bộ lọc kênh'],
  ['positronToolsToggle','Hiển thị công cụ phát nâng cao']
 ];
 for(const [id,label] of metadata){const node=byId(id);if(node){node.setAttribute('aria-label',label);if(!node.title)node.title=label;}}
 for(const [id,controls] of [['positronToolsToggle','playbackExtra'],['positronFiltersToggle','channelList'],['positronMorePages','appSidebar']]){
  const node=byId(id);if(node)node.setAttribute('aria-controls',controls);
 }
 const search=byId('searchBox');
 if(search)search.setAttribute('aria-keyshortcuts','/');
 // Slash focuses the original channel finder on TV; it never searches private data remotely.
 d.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
  if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  if(byId('positronPalette')?.hidden===false||byId('positronStudioMenu')?.hidden===false||byId('positronHelpDialog')?.open)return;
  if(!d.querySelector('#page-tv.active-page'))return;
  if(event.key==='/'){event.preventDefault();search?.focus();}
 });
 // Make hidden-label compact rail buttons accessible even after dynamic nav updates.
 const sidebar=byId('appSidebar');
 if(sidebar){
  const labelNav=()=>{
   for(const b of sidebar.querySelectorAll('button.nav')){
    if(b.hasAttribute('aria-label'))continue;
    const text=(b.textContent||'').replace(/\s+/g,' ').trim();
    if(text){b.setAttribute('aria-label',text);if(!b.title)b.title=text;}
   }
  };
  labelNav();
  new MutationObserver(labelNav).observe(sidebar,{childList:true,subtree:true});
 }
 window.OpenIPTVPositronTwenty=Object.freeze({
  setStage,getStage:()=>stage,getFeedback:()=>previous
 });
})();
