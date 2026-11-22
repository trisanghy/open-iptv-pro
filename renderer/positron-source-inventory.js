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
 // P257: expand a read-only breakdown with each source's channel count.
 const toggle=d.createElement('button');
 toggle.id='poSourceInventoryToggle';
 toggle.type='button';
 toggle.className='po-source-inventory-toggle';
 toggle.textContent='Chi tiết nguồn';
 toggle.setAttribute('aria-expanded','false');
 toggle.setAttribute('aria-controls','poSourceInventoryDetails');
 heading.append(toggle);
 const details=d.createElement('ul');
 details.id='poSourceInventoryDetails';
 details.className='po-source-inventory-details';
 details.setAttribute('aria-label','Danh sách nguồn và số kênh');
 details.hidden=true;
 heading.append(details);
 const renderDetails=()=>{
  const store=state.getStore(),sources=Array.isArray(store?.sources)?store.sources:[],
        channels=Array.isArray(store?.channels)?store.channels:[];
  const countBySource=new Map();
  for(const channel of channels)countBySource.set(String(channel.sourceId),1+(countBySource.get(String(channel.sourceId))||0));
  details.replaceChildren();
  for(const source of sources.slice(0,30)){
   const li=d.createElement('li');
   li.dataset.sourceId=String(source.id);
   li.dataset.channelCount=String(countBySource.get(String(source.id))||0);
   const name=d.createElement('span');
   name.textContent=(source.name||'Nguồn chưa đặt tên')+' · '+li.dataset.channelCount+' kênh';
   const status=d.createElement('strong');
   status.dataset.enabled=String(source.enabled!==false);
   status.textContent=source.enabled===false?'Tắt':'Bật';
   li.append(name,status);
   details.append(li);
  }
  if(sources.length>30){
   const more=d.createElement('li');
   more.textContent='Còn '+(sources.length-30)+' nguồn. Xem danh sách bên dưới.';
   details.append(more);
  }
  return sources.length;
 };
 toggle.addEventListener('click',()=>{
  const expanded=details.hidden;
  details.hidden=!expanded;
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.textContent=expanded?'Ẩn chi tiết':'Chi tiết nguồn';
  if(expanded)renderDetails();
 });
 const refresh=()=>{
  const store=state.getStore();
  const sources=Array.isArray(store?.sources)?store.sources:[];
  const channels=Array.isArray(store?.channels)?store.channels:[];
  const enabled=sources.filter(item=>item?.enabled!==false).length;
  summary.textContent=enabled+'/'+sources.length+' nguồn bật · '+channels.length+' kênh';
  summary.dataset.sourceCount=String(sources.length);
  summary.dataset.channelCount=String(channels.length);
  if(!details.hidden)renderDetails();
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
