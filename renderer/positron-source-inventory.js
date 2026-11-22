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
 // P258: search across all sources, not only the first 30 in the preview.
 const search=d.createElement('input');
 search.id='poSourceInventorySearch';
 search.type='search';
 search.className='po-source-inventory-search';
 search.placeholder='Tìm nguồn theo tên…';
 search.setAttribute('aria-label','Tìm trong chi tiết nguồn IPTV');
 search.setAttribute('autocomplete','off');
 search.hidden=true;
 heading.append(search);
 const foldSourceName=value=>String(value??'').trim().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLocaleLowerCase('vi');
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
  for(const channel of channels){
   if(!channel||typeof channel!=='object')continue;
   const key=String(channel.sourceId);
   countBySource.set(key,1+(countBySource.get(key)||0));
  }
  const needle=foldSourceName(search.value);
  const filtered=sources.filter(source=>source&&foldSourceName(source.name||'Nguồn chưa đặt tên').includes(needle));
  details.replaceChildren();
  for(const source of filtered.slice(0,30)){
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
  if(!filtered.length){
   const empty=d.createElement('li');
   empty.textContent='Không tìm thấy nguồn phù hợp.';
   details.append(empty);
  }
  if(filtered.length>30){
   const more=d.createElement('li');
   more.textContent='Còn '+(filtered.length-30)+' nguồn phù hợp. Hãy tìm tên cụ thể hơn.';
   details.append(more);
  }
  return sources.length;
 };
 toggle.addEventListener('click',()=>{
  const expanded=details.hidden;
  details.hidden=!expanded;
  search.hidden=!expanded;
  if(!expanded)search.value='';
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.textContent=expanded?'Ẩn chi tiết':'Chi tiết nguồn';
  if(expanded)renderDetails();
 });
 search.addEventListener('input',()=>{if(!details.hidden)renderDetails();});
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
