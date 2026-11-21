'use strict';
// Electron-only Web-style channel chooser below Quick Tools.
// Reads the existing enabled playlist, favorite identities and verified recent history.
(()=>{
 const state=window.IPTVState,favorites=window.OpenIPTVFavorites,recent=window.OpenIPTVRecentChannels;
 const root=document.getElementById('webChannelChooser');
 if(!state||!favorites||!recent||!root)return;
 root.innerHTML="\n       <div class=\"web-chooser-main\">\n        <div class=\"web-chooser-heading\">\n         <div class=\"web-chooser-tabs\" role=\"tablist\" aria-label=\"Bộ lọc kênh\">\n          <button type=\"button\" class=\"active\" data-chooser-tab=\"all\" role=\"tab\" aria-selected=\"true\">▣ Chọn kênh</button>\n          <button type=\"button\" data-chooser-tab=\"fav\" role=\"tab\" aria-selected=\"false\">☆ Yêu thích</button>\n          <button type=\"button\" data-chooser-tab=\"recent\" role=\"tab\" aria-selected=\"false\">◷ Xem gần đây</button>\n         </div>\n         <div class=\"web-chooser-layout\" role=\"group\" aria-label=\"Chế độ hiển thị\">\n          <button type=\"button\" data-chooser-layout=\"grid\" class=\"active\" title=\"Dạng lưới\">▦</button>\n          <button type=\"button\" data-chooser-layout=\"list\" title=\"Dạng danh sách\">☷</button>\n         </div>\n        </div>\n        <div class=\"web-chooser-chips\" id=\"webChooserGroups\" aria-label=\"Nhóm kênh phổ biến\"></div>\n        <div class=\"web-chooser-filters\">\n         <input id=\"webChooserSearch\" type=\"search\" placeholder=\"Tìm kiếm kênh...\" aria-label=\"Tìm kênh\"/>\n         <label>Nhóm <select id=\"webChooserGroup\" aria-label=\"Lọc theo nhóm\"><option value=\"\">Tất cả nhóm</option></select></label>\n         <label>Sắp xếp <select id=\"webChooserSort\" aria-label=\"Sắp xếp kênh\"><option value=\"asc\">Tên A → Z</option><option value=\"desc\">Tên Z → A</option></select></label>\n        </div>\n        <div id=\"webChooserStatus\" class=\"screen-reader-only\" role=\"status\" aria-live=\"polite\"></div>\n        <div id=\"webChooserGrid\" class=\"web-chooser-grid\" aria-label=\"Kênh có thể chọn\"></div>\n        <div class=\"web-chooser-pager\"><button id=\"webChooserPrev\" type=\"button\" aria-label=\"Trang trước\">‹</button><span id=\"webChooserPage\">1 / 1</span><button id=\"webChooserNext\" type=\"button\" aria-label=\"Trang tiếp\">›</button></div>\n       </div>\n       <div class=\"web-chooser-side\">\n        <section aria-label=\"Kênh yêu thích\"><header><strong>★ Yêu thích</strong><button type=\"button\" class=\"web-chooser-see\" data-chooser-see=\"fav\">Xem tất cả ›</button></header><div class=\"web-chooser-mini\" id=\"webChooserFavorites\"></div></section>\n        <section aria-label=\"Kênh vừa xem\"><header><strong>◷ Xem gần đây</strong><button type=\"button\" class=\"web-chooser-see\" data-chooser-see=\"recent\">Xem tất cả ›</button></header><div class=\"web-chooser-mini\" id=\"webChooserRecent\"></div></section>\n       </div>\n";

 // P5.1.107: system text glyphs in this old channel chooser rendered as tiny
 // tofu/squares in actual 450px and 540px Electron screenshots. Use local,
 // deterministic inline SVG icons; do not touch channel filtering/playback.
 const chooserIconSpecs=[
  ['[data-chooser-tab="all"]','Chọn kênh','<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>'],
  ['[data-chooser-tab="fav"]','Yêu thích','<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z"/>'],
  ['[data-chooser-tab="recent"]','Xem gần đây','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>'],
  ['[data-chooser-layout="grid"]','Dạng lưới','<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>'],
  ['[data-chooser-layout="list"]','Dạng danh sách','<path d="M9 6h12M9 12h12M9 18h12"/><path d="M3 6h2M3 12h2M3 18h2"/>']
 ];
 for(const [selector,label,paths] of chooserIconSpecs){
  const b=root.querySelector(selector);if(!b)continue;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');
  svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');
  svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
  svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  svg.innerHTML=paths; // static trusted vector geometry only, never playlist content
  b.textContent=selector.includes('data-chooser-tab')?label:'';
  if(!selector.includes('data-chooser-tab'))b.setAttribute('aria-label',label);
  b.prepend(svg);
 }

 const $=id=>document.getElementById(id);
 const grid=$('webChooserGrid'),groups=$('webChooserGroups'),search=$('webChooserSearch'),group=$('webChooserGroup'),sort=$('webChooserSort'),status=$('webChooserStatus');
 const prev=$('webChooserPrev'),next=$('webChooserNext'),pageLabel=$('webChooserPage'),favGrid=$('webChooserFavorites'),recentGrid=$('webChooserRecent');
 // P5.1.111 same-round screenshot QA: one-row chips alone did not raise the
 // first channel card above the fold. Preserve native group/sort controls in
 // an accessible disclosure on 450px; keep them expanded on desktop.
 const filterControls=root.querySelector('.web-chooser-filters');
 const chooserAdvanced=document.createElement('details');
 chooserAdvanced.id='webChooserAdvanced';chooserAdvanced.className='web-chooser-advanced';
 const chooserAdvancedSummary=document.createElement('summary');
 chooserAdvancedSummary.textContent='Bộ lọc';chooserAdvancedSummary.title='Nhóm và sắp xếp kênh';
 chooserAdvanced.append(chooserAdvancedSummary);
 [...filterControls.querySelectorAll('label')].forEach(label=>chooserAdvanced.append(label));
 filterControls.append(chooserAdvanced);
 const compactFilterMedia=window.matchMedia('(max-width:600px)');
 const syncAdvancedDisclosure=()=>{chooserAdvanced.open=!compactFilterMedia.matches;};
 if(compactFilterMedia.addEventListener)compactFilterMedia.addEventListener('change',syncAdvancedDisclosure);
 else compactFilterMedia.addListener(syncAdvancedDisclosure);
 syncAdvancedDisclosure();
 // P5.1.113: standard native chooser tablist keyboard support.
 const chooserTabs=[...root.querySelectorAll('[data-chooser-tab][role="tab"]')];
 chooserTabs.forEach(b=>b.setAttribute('aria-controls','webChooserGrid'));
 let tab='all',page=0,layout='grid',queued=false;
 const store=()=>state.getStore?.()||{};
 const channels=()=>state.getChannels?.()||[];
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
 const filterGroups=[['all','Tất cả'],['VTV','VTV'],['VTC','VTC'],['HTV','HTV'],['K+','K+'],['TH','TH địa phương'],['Quốc tế','Quốc tế'],['Phim','Phim'],['Thiếu nhi','Thiếu nhi'],['Thể thao','Thể thao'],['Tin tức','Tin tức']];
 function favoritesList(){return favorites.visible(store());}
 function recentList(){return recent.visible(store(),channels(),favorites.key);}
 function candidates(){
  let result=tab==='fav'?favoritesList():tab==='recent'?recentList():channels();
  const q=normalize(search.value.trim()),g=group.value;
  if(q)result=result.filter(c=>normalize(c.name+' '+(c.group||'')).includes(q));
  if(g)result=result.filter(c=>normalize(c.group||'').includes(normalize(g))||normalize(c.name).startsWith(normalize(g)));
  if(tab!=='recent'){const dir=sort.value==='desc'?-1:1;result=[...result].sort((a,b)=>dir*String(a.name||'').localeCompare(String(b.name||''),'vi',{numeric:true,sensitivity:'base'}));}
  return result;
 }
 function channelCard(ch,compact=false){
  const card=document.createElement('button');card.type='button';card.className='web-chooser-card'+(compact?' compact':'');
  card.dataset.channelId=ch.id;card.title='Xem '+(ch.name||'Kênh');
  const active=state.getCurrent?.()?.id===ch.id;card.classList.toggle('active',active);
  const face=document.createElement('span');face.className='web-chooser-art';
  if(ch.logo){const img=document.createElement('img');img.src=ch.logo;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.remove();face.textContent='TV';},{once:true});face.append(img);}else face.textContent='TV';
  const name=document.createElement('span');name.className='web-chooser-name';name.textContent=ch.name||'Không tên';
  card.append(face,name);
  if(active){const flag=document.createElement('span');flag.className='web-chooser-playing';flag.textContent='▶';card.append(flag);}
  card.addEventListener('click',()=>{void state.playChannel(ch.id);render();});
  return card;
 }
 function empty(target,message){const p=document.createElement('p');p.className='web-chooser-empty';p.textContent=message;target.append(p);}
 function renderGroups(){
  const existing=group.value;
  const groupNames=[...new Set(channels().map(c=>String(c.group||'Khác').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'vi'));
  group.replaceChildren(new Option('Tất cả nhóm',''));
  for(const name of groupNames)group.append(new Option(name,name));
  group.value=groupNames.includes(existing)?existing:'';
  // P5.1.116: P5.1.115 Electron screenshot showed VTV/VTC/K+ quick chips
  // with only QA Channel metadata in unrelated groups. The old code exposed
  // every preset whenever any channel existed, and selecting an absent group
  // silently reset to All. Show only actual imported groups and preserve
  // keyboard focus when replacing the filtered chips.
  const groupForChip=value=>groupNames.find(name=>{
   const n=normalize(name),needle=normalize(value);
   // "TH" means the separate TH/local group, NOT every "The thao" group.
   return value==='TH'?/(^|[^a-z0-9])th([^a-z0-9]|$)/.test(n):n.includes(needle);
  })||'';
  const previousChipsScroll=groups.scrollLeft;
  groups.replaceChildren();
  for(const [value,label] of filterGroups){
   const match=value==='all'?'':groupForChip(value);
   if(value!=='all'&&!match)continue;
   const btn=document.createElement('button');btn.type='button';
   btn.dataset.poQuickGroup=value;btn.textContent=label;
   const active=value==='all'?!group.value:group.value===match;
   btn.className='web-chooser-chip'+(active?' active':'');
   btn.setAttribute('aria-pressed',String(active));
   btn.addEventListener('click',()=>{
    group.value=value==='all'?'':match;
    page=0;render();
    // Browser focus would otherwise land on BODY when renderGroups removes
    // the clicked chip; restore focus to the replacement native button.
    [...groups.querySelectorAll('button[data-po-quick-group]')]
     .find(x=>x.dataset.poQuickGroup===value)?.focus({preventScroll:true});
   });
   groups.append(btn);
  }
  groups.scrollLeft=previousChipsScroll;
 }
 function renderSide(target,list,label){target.replaceChildren();if(!list.length){empty(target,'Chưa có kênh '+label);return;}list.slice(0,6).forEach(c=>target.append(channelCard(c,true)));}
 function render(){
  const all=channels();renderGroups();
  const data=candidates(),pages=Math.max(1,Math.ceil(data.length/18));page=Math.min(page,pages-1);
  grid.classList.toggle('list',layout==='list');grid.replaceChildren();
  if(!all.length)empty(grid,'Chưa có nguồn kênh. Hãy nhập playlist M3U để bắt đầu.');
  else if(!data.length){
   // P5.1.114: real P5.1.113 Electron screenshot showed an empty Favorites tab
   // with 552 imported channels but an incorrect generic "not found" message.
   // Explain true first-use states; retain filters/data and offer a reversible
   // one-click path back to browsing without starting playback.
   let message='Không tìm thấy kênh phù hợp với bộ lọc hiện tại.';
   if(tab==='fav')message=favoritesList().length
    ?'Không có kênh yêu thích phù hợp với bộ lọc.'
    :'Chưa có kênh yêu thích. Nhấn biểu tượng sao ở một kênh để lưu vào đây.';
   if(tab==='recent')message=recentList().length
    ?'Không có kênh xem gần đây phù hợp với bộ lọc.'
    :'Chưa xem kênh nào gần đây. Chọn một kênh và bắt đầu phát để hiển thị ở đây.';
   empty(grid,message);
   if(tab==='fav'||tab==='recent'){
    const back=document.createElement('button');back.type='button';
    back.className='po-chooser-empty-action';back.textContent='Xem tất cả kênh';
    back.addEventListener('click',()=>{
     tab='all';page=0;search.value='';group.value='';
     render();chooserTabs.find(b=>b.dataset.chooserTab==='all')?.focus();
    });
    grid.append(back);
   }
  }
  else data.slice(page*18,page*18+18).forEach(c=>grid.append(channelCard(c)));
  pageLabel.textContent=(page+1)+' / '+pages;prev.disabled=page<=0;next.disabled=page>=pages-1;
  pageLabel.closest('.web-chooser-pager').hidden=pages<=1;
  status.textContent=data.length+' kênh';
  const favoriteItems=favoritesList(),recentItems=recentList();
  renderSide(favGrid,favoriteItems,'yêu thích');renderSide(recentGrid,recentItems,'xem gần đây');
  // P5.1.115: real 450px screenshot of P5.1.114 shows the empty Favorites
  // instruction twice: once in the active chooser grid, again in the mini
  // sidebar directly below. Hide only the redundant mini widget on compact
  // screens. Preserve it on All, other tabs, desktop and whenever populated.
  const favoriteMini=favGrid.closest('section'),recentMini=recentGrid.closest('section');
  if(favoriteMini)favoriteMini.dataset.poDuplicateEmpty=String(tab==='fav'&&!favoriteItems.length);
  if(recentMini)recentMini.dataset.poDuplicateEmpty=String(tab==='recent'&&!recentItems.length);
  root.querySelectorAll('[data-chooser-tab]').forEach(b=>{const active=b.dataset.chooserTab===tab;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  root.querySelectorAll('[data-chooser-layout]').forEach(b=>b.classList.toggle('active',b.dataset.chooserLayout===layout));
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}
 chooserTabs.forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.chooserTab;page=0;render();}));
 root.querySelector('.web-chooser-tabs')?.addEventListener('keydown',event=>{
  const index=chooserTabs.indexOf(document.activeElement);
  if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const nextIndex=event.key==='Home'?0:event.key==='End'?chooserTabs.length-1:
   (index+(event.key==='ArrowRight'?1:-1)+chooserTabs.length)%chooserTabs.length;
  const target=chooserTabs[nextIndex];
  target.click();target.focus();
 });
 root.querySelectorAll('[data-chooser-layout]').forEach(b=>b.addEventListener('click',()=>{layout=b.dataset.chooserLayout;render();}));
 search.addEventListener('input',()=>{page=0;schedule();});
 group.addEventListener('change',()=>{page=0;render();});sort.addEventListener('change',()=>{page=0;render();});
 prev.addEventListener('click',()=>{page=Math.max(0,page-1);render();});
 next.addEventListener('click',()=>{page++;render();});
 root.querySelectorAll('[data-chooser-see]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.chooserSee;page=0;render();root.scrollIntoView({behavior:'smooth',block:'nearest'});}));
 const channelList=$('channelList');if(channelList)new MutationObserver(schedule).observe(channelList,{childList:true});
 const title=$('playingTitle');if(title)new MutationObserver(schedule).observe(title,{childList:true,subtree:true});
 document.getElementById('video')?.addEventListener('playing',schedule);
 window.addEventListener('openiptv:favorites-changed',schedule);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
 render();
})();
