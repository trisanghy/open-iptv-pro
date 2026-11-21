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

 // P5.1.119: P5.1.118 screenshot shows a starred channel but no count on
 // the Favorites chooser tab. Create the badge AFTER the SVG icon pass,
 // which replaces tab children during initialization; expose the same count
 // through a full accessible label without shifting cramped mobile tabs.
 const favTabButton=root.querySelector('[data-chooser-tab="fav"]');
 const favCountBadge=document.createElement('span');
 favCountBadge.className='po-favorite-count';favCountBadge.setAttribute('aria-hidden','true');
 favCountBadge.hidden=true;favTabButton?.append(favCountBadge);
 const $=id=>document.getElementById(id);
 const grid=$('webChooserGrid'),groups=$('webChooserGroups'),search=$('webChooserSearch'),group=$('webChooserGroup'),sort=$('webChooserSort'),status=$('webChooserStatus');
 const prev=$('webChooserPrev'),next=$('webChooserNext'),pageLabel=$('webChooserPage'),favGrid=$('webChooserFavorites'),recentGrid=$('webChooserRecent');
 // P5.1.129: actual P5.1.128 Electron screenshot shows a clipped category
 // letter to the RIGHT of the pinned All reset. Track native scroll state.
 const syncPinnedResetMask=()=>groups.classList.toggle('po-groups-scrolled',groups.scrollLeft>4);
 groups.addEventListener('scroll',syncPinnedResetMask,{passive:true});
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
 // P5.1.131: Unicode NFD does NOT decompose Vietnamese đ/Đ. Without the
 // explicit mapping, ASCII "dia phuong" cannot find "TH địa phương".
 // Apply it consistently to both query and channel/group metadata.
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/đ/g,'d');
 const filterGroups=[['all','Tất cả'],['VTV','VTV'],['VTC','VTC'],['HTV','HTV'],['K+','K+'],['TH','TH địa phương'],['Quốc tế','Quốc tế'],['Phim','Phim'],['Thiếu nhi','Thiếu nhi'],['Thể thao','Thể thao'],['Tin tức','Tin tức']];
 function favoritesList(){return favorites.visible(store());}
 function recentList(){return recent.visible(store(),channels(),favorites.key);}
 function candidates(){
  let result=tab==='fav'?favoritesList():tab==='recent'?recentList():channels();
  // P5.1.135: viewer-entered terms may appear in any order in a channel's
  // local name or group (e.g. "001 Channel QA" finds "QA Channel 001").
  // Never search private stream URLs, and never load any external source.
  const terms=normalize(search.value.trim()).split(/\s+/).filter(Boolean),g=group.value;
  if(terms.length)result=result.filter(c=>{
   const searchable=normalize(c.name+' '+(c.group||''));
   return terms.every(term=>searchable.includes(term));
  });
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
  // P5.1.118: P5.1.117 screenshot has a full-width channel tile, but users
  // cannot bookmark from that tile without first playing the channel.
  // Keep the original native play button untouched; place a separate
  // keyboard-operable favorite button beside it, never nested inside it.
  if(compact)return card;
  const frame=document.createElement('div');frame.className='web-chooser-card-wrap';
  frame.append(card);
  const star=document.createElement('button');star.type='button';
  star.className='web-chooser-favorite';star.dataset.channelId=String(ch.id);
  const isFavorite=favorites.has(store(),ch);
  // P5.1.134: genuine P5.1.133 Electron 450px screenshot showed tiny
  // font-dependent outlined stars. Use an invariant stroke-based native SVG
  // while retaining the original separate, accessible Favorite button.
  const svgNS='http://www.w3.org/2000/svg';
  const starSvg=document.createElementNS(svgNS,'svg');
  starSvg.setAttribute('viewBox','0 0 24 24');
  starSvg.setAttribute('width','20');starSvg.setAttribute('height','20');
  starSvg.setAttribute('fill','none');starSvg.setAttribute('stroke','currentColor');
  starSvg.setAttribute('stroke-width','1.8');starSvg.setAttribute('stroke-linejoin','round');
  starSvg.setAttribute('aria-hidden','true');starSvg.setAttribute('focusable','false');
  const starPath=document.createElementNS(svgNS,'path');
  starPath.setAttribute('d','M12 2.6 14.88 8.43 21.32 9.37 16.66 13.9 17.76 20.3 12 17.28 6.24 20.3 7.34 13.9 2.68 9.37 9.12 8.43Z');
  starSvg.append(starPath);star.replaceChildren(starSvg);
  star.setAttribute('aria-pressed',String(isFavorite));
  star.setAttribute('aria-label',(isFavorite?'Bỏ khỏi yêu thích: ':'Thêm vào yêu thích: ')+(ch.name||'Kênh'));
  star.title=isFavorite?'Bỏ yêu thích':'Thêm yêu thích';
  // P5.1.134 genuinely new shortcut: when the channel card itself has focus,
  // pressing F saves/removes a Favorite WITHOUT starting video. Event is
  // scoped to this card, so typing in search and application shortcuts stay
  // unchanged. Replaced cards recover focus after the native save/redraw.
  let fromFavoriteShortcut=false;
  card.addEventListener('keydown',event=>{
   if(!/^[fF]$/.test(event.key)||event.ctrlKey||event.metaKey||event.altKey||event.repeat)return;
   event.preventDefault();event.stopPropagation();
   fromFavoriteShortcut=true;star.click();
  });
  star.addEventListener('click',()=>{
   const restoreCardFocus=fromFavoriteShortcut;fromFavoriteShortcut=false;
   const s=store(),oldKeys=Array.isArray(s.favoriteKeys)?[...s.favoriteKeys]:null;
   const oldUrls=Array.isArray(s.favorites)?[...s.favorites]:[];
   const added=favorites.toggle(s,ch);
   if(!state.save?.()){
    if(oldKeys)s.favoriteKeys=oldKeys;else delete s.favoriteKeys;
    s.favorites=oldUrls;state.render?.();
    state.toast?.('Không lưu được kênh yêu thích. Hãy kiểm tra bộ nhớ ứng dụng.','error');
    return;
   }
   state.render?.();
   render();
   // Native render() and Favorites change events can both redraw the tile;
   // focus after their scheduled refresh so keyboard users remain oriented.
   requestAnimationFrame(()=>{
    const replacement=[...grid.querySelectorAll('.web-chooser-favorite')]
     .find(b=>b.dataset.channelId===String(ch.id));
    const replacementCard=restoreCardFocus
     ?[...grid.querySelectorAll('button.web-chooser-card')].find(b=>b.dataset.channelId===String(ch.id)):null;
    (replacementCard||replacement||root.querySelector('[data-chooser-tab="fav"]'))?.focus({preventScroll:true});
   });
   state.toast?.((added?'Đã thêm yêu thích: ':'Đã bỏ yêu thích: ')+(ch.name||'Kênh'));
  });
  frame.append(star);
  return frame;
 }
 function empty(target,message){const p=document.createElement('p');p.className='web-chooser-empty';p.textContent=message;target.append(p);}
 // P5.1.124: Native desktop wheel navigation with boundary escape.
 groups.addEventListener('wheel',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
  if(groups.scrollWidth<=groups.clientWidth+1)return;
  const factor=event.deltaMode===1?16:event.deltaMode===2?groups.clientWidth:1;
  const max=groups.scrollWidth-groups.clientWidth;
  const next=Math.max(0,Math.min(max,groups.scrollLeft+event.deltaY*factor));
  if(Math.abs(next-groups.scrollLeft)<.5)return;
  groups.scrollLeft=next;
  event.preventDefault();
 },{passive:false});
 // P5.1.127: Use arrow/Home/End keys on native quick-group chips.
 // Only focus moves; user must press Enter/Space to select a channel group.
 groups.addEventListener('keydown',event=>{
  const buttons=[...groups.querySelectorAll('button[data-po-quick-group]')];
  const index=buttons.indexOf(document.activeElement);
  if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const nextIndex=event.key==='Home'?0:event.key==='End'?buttons.length-1:
   (index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
  const target=buttons[nextIndex];
  target.focus({preventScroll:true});
  target.scrollIntoView({block:'nearest',inline:'nearest'});
 });
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
  syncPinnedResetMask();
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
   // P5.1.132: P5.1.131 real compact Electron screenshot shows the channel
   // search clearly, but a typo/no-match on the All tab previously stranded
   // the user on a generic empty card with no direct reset action.
   // Use the existing native empty-state button style; never mutate source data.
   if(tab==='all'&&(search.value.trim()||group.value)){
    const clear=document.createElement('button');clear.type='button';
    clear.id='poChooserClearFilters';clear.className='po-chooser-empty-action';
    clear.textContent='Xóa bộ lọc và xem tất cả kênh';
    clear.addEventListener('click',()=>{
     search.value='';group.value='';page=0;render();
     search.focus({preventScroll:true});
    });
    grid.append(clear);
   }
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
  const favCount=favoriteItems.length;
  favCountBadge.textContent=String(favCount);
  favCountBadge.hidden=favCount===0;
  favTabButton?.setAttribute('aria-label','Yêu thích, '+favCount+' kênh');
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
 // P5.1.136: Enter selects the first matching native channel button by focus.
 // Playback still requires an explicit second Enter on the focused button.
 search.addEventListener('keydown',event=>{
  if(event.key!=='Enter'||event.isComposing||event.repeat||
   event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||!search.value.trim())return;
  event.preventDefault();
  render(); // Flush pending search input and find the actual first match.
  const first=grid.querySelector('button.web-chooser-card');
  if(!first)return; // No match: keep keyboard focus in search.
  first.focus({preventScroll:true});
  first.scrollIntoView({block:'nearest',inline:'nearest'});
 });

 // P5.1.137: Navigate actual native tiles using Arrow keys, Home and End.
 // Respect the current grid/list geometry; never trigger click or playback.
 grid.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)||
   !event.target?.matches?.('button.web-chooser-card')||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
  const cards=[...grid.querySelectorAll('button.web-chooser-card')];
  const index=cards.indexOf(event.target);
  if(index<0)return;
  let target=null;
  if(event.key==='Home')target=cards[0];
  else if(event.key==='End')target=cards[cards.length-1];
  else {
   const current=cards[index].getBoundingClientRect();
   const cx=(current.left+current.right)/2,cy=(current.top+current.bottom)/2;
   let best=Infinity;
   for(const candidate of cards){
    if(candidate===event.target)continue;
    const rect=candidate.getBoundingClientRect();
    const dx=(rect.left+rect.right)/2-cx,dy=(rect.top+rect.bottom)/2-cy;
    const sameRow=Math.abs(dy)<=Math.max(current.height,rect.height)*0.6;
    const horizontal=event.key==='ArrowLeft'||event.key==='ArrowRight';
    if(horizontal&&(!sameRow||(event.key==='ArrowLeft'?dx>=-2:dx<=2)))continue;
    if(!horizontal&&(event.key==='ArrowUp'?dy>=-2:dy<=2))continue;
    const score=horizontal?Math.abs(dx)+Math.abs(dy)*4:Math.abs(dy)*100+Math.abs(dx);
    if(score<best){best=score;target=candidate;}
   }
  }
  if(!target)return;
  event.preventDefault();
  target.focus({preventScroll:true});
  target.scrollIntoView({block:'nearest',inline:'nearest'});
 });
 // P5.1.138: PageDown/PageUp navigate entire filtered channel library.
 // Unlike Arrow navigation, this moves to an adjacent page (18 entries)
 // while retaining the native search/group/layout and without autoplay.
 grid.addEventListener('keydown',event=>{
  if(!['PageDown','PageUp'].includes(event.key)||
   !event.target?.matches?.('button.web-chooser-card')||event.repeat||
   event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  const direction=event.key==='PageDown'?1:-1;
  const pages=Math.max(1,Math.ceil(candidates().length/18));
  const destination=page+direction;
  if(destination<0||destination>=pages)return;
  event.preventDefault();event.stopPropagation();
  page=destination;render();
  const cards=[...grid.querySelectorAll('button.web-chooser-card')];
  const target=direction>0?cards[0]:cards[cards.length-1];
  target?.focus({preventScroll:true});
  target?.scrollIntoView({block:'nearest',inline:'nearest'});
 });
 grid.setAttribute('aria-keyshortcuts','PageDown PageUp');
 grid.title='PageDown: trang tiếp; PageUp: trang trước, không tự phát kênh';
 search.title='Nhập tên kênh rồi nhấn Enter để chọn kết quả đầu tiên';
 search.addEventListener('input',()=>{page=0;schedule();});
 // P5.1.128: when the user selects a group from the native advanced dropdown,
 // reveal its matching quick chip instead of leaving the active state offscreen.
 // Native chip clicks keep their existing restored horizontal position.
 group.addEventListener('change',()=>{
  page=0;render();
  const active=groups.querySelector('button.web-chooser-chip.active');
  if(!group.value)groups.scrollLeft=0;
  else active?.scrollIntoView({block:'nearest',inline:'nearest'});
  requestAnimationFrame(syncPinnedResetMask);
 });sort.addEventListener('change',()=>{page=0;render();});
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
