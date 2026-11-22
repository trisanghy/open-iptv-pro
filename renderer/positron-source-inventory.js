'use strict';
/* P5.1.256: read-only Source inventory in the heading, refreshed when the
   existing native footer counts change. Never modifies IPTV data. */
(()=>{
 const d=document,heading=d.querySelector('#page-sources .section-heading>div:first-child');
 const state=window.IPTVState;
 if(!heading||!state?.getStore||d.getElementById('poSourceInventorySummary'))return;
 const summary=d.createElement('output');
 summary.id='poSourceInventorySummary';
 summary.className='po-source-inventory-summary';
 summary.setAttribute('role','status');
 summary.setAttribute('aria-live','polite');
 summary.setAttribute('title','Nguồn đang bật / tất cả nguồn và tổng số kênh trong thư viện');
 heading.append(summary);
 const refresh=()=>{
  const store=state.getStore();
  const sources=Array.isArray(store?.sources)?store.sources:[];
  const channels=Array.isArray(store?.channels)?store.channels:[];
  const enabled=sources.filter(item=>item?.enabled!==false).length;
  summary.textContent=enabled+'/'+sources.length+' nguồn bật · '+channels.length+' kênh';
  summary.dataset.sourceCount=String(sources.length);
  summary.dataset.channelCount=String(channels.length);
  return summary.textContent;
 };
 refresh();
 const footer=d.getElementById('footerCounts');
 if(footer&&typeof MutationObserver==='function'){
  const observer=new MutationObserver(refresh);
  observer.observe(footer,{childList:true,subtree:true,characterData:true});
 }
 window.addEventListener('focus',refresh);
 window.OpenIPTVPositronSourceInventory=Object.freeze({refresh});
})();
