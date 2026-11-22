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

 // P5.1 screenshot review: neutral monochrome SVGs replace platform-colored
 // transport emoji without replacing button nodes, playback listeners or state.
 const ns='http://www.w3.org/2000/svg';
 // P5.1.32: actual P5.1.31 TV 450px screenshot uses platform font '◈'.
 // Preserve the original Studio button and all native click/keyboard handlers.
 // P5.1.40: in the actual P5.1.39 no-playlist Electron TV screenshot,
 // the large decorative purple Play triangle looks tappable while native
 // Play is correctly disabled. Replace only static empty-state artwork.
 const emptyPicture=byId('emptyPlayer')?.querySelector('.empty-icon');
 if(emptyPicture&&!emptyPicture.querySelector('svg')){
  const svg=d.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('class','positron-empty-tv');
  svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  const body=d.createElementNS(ns,'rect');body.setAttribute('x','3');body.setAttribute('y','4');body.setAttribute('width','18');body.setAttribute('height','14');body.setAttribute('rx','2');
  const stem=d.createElementNS(ns,'path');stem.setAttribute('d','M12 18v3m-4 0h8');
  svg.append(body,stem);
  emptyPicture.replaceChildren(svg);
  emptyPicture.setAttribute('aria-hidden','true');
 }
 const themeControl=byId('positronStudioBtn');
 if(themeControl&&!themeControl.querySelector('svg')){
  const vector=d.createElementNS(ns,'svg');vector.setAttribute('viewBox','0 0 24 24');
  vector.setAttribute('aria-hidden','true');vector.setAttribute('focusable','false');
  vector.setAttribute('class','positron-theme-vector');
  const outer=d.createElementNS(ns,'circle');outer.setAttribute('cx','12');outer.setAttribute('cy','12');outer.setAttribute('r','9');
  const half=d.createElementNS(ns,'path');half.setAttribute('d','M12 3a9 9 0 0 1 0 18Z');half.setAttribute('class','theme-half');
  vector.append(outer,half);
  const word=d.createElement('span');word.textContent='Chủ đề';
  themeControl.replaceChildren(vector,word);
 }

 const iconDefinitions=[
  ['prevBtn','M6 5v14 M20 5 9 12l11 7V5z','Kênh trước'],
  ['stopBtn','M6 6h12v12H6z','Dừng phát'],
  ['nextBtn','M18 5v14 M4 5l11 7-11 7V5z','Kênh sau'],
  ['fsPrev','M6 5v14 M20 5 9 12l11 7V5z','Kênh trước'],
  ['fsNext','M18 5v14 M4 5l11 7-11 7V5z','Kênh sau'],
  ['fullscreenBtn','M8 3H3v5 M16 3h5v5 M8 21H3v-5 M16 21h5v-5','Bật toàn màn hình']
 ];
 for(const [name,shape,label] of iconDefinitions){
  const button=byId(name);if(!button)continue;
  const svg=d.createElementNS(ns,'svg'),path=d.createElementNS(ns,'path');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','19');
  svg.setAttribute('height','19');svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  path.setAttribute('d',shape);svg.append(path);
  button.replaceChildren(svg);button.dataset.p20Vector='true';
  button.setAttribute('aria-label',label);button.title=label;
 }

 
 // P5.1.9 round 02: Empty Favorites had no path to manage sources in
 // the actual P5.1.8 600px Electron screenshot. Preserve original list.
 const favoriteList=byId('favoriteList');
 if(favoriteList){
  const syncFavoriteSourceAction=()=>{
   const empty=favoriteList.querySelector('.empty-list');
   if(!empty)return;
   // Write only the native message text node; never replace the Favorites list or its button.
   const num=Number((byId('sourceCount')?.textContent||'0').replace(/[^0-9]/g,''))||0;
   const guidance=num===0
    ?'Chưa có nguồn IPTV. Hãy mở Quản lý nguồn IPTV để thêm playlist M3U hoặc URL, sau đó đánh dấu sao những kênh muốn lưu.'
    :'Chưa có kênh yêu thích trong các nguồn đang bật. Đánh dấu sao để lưu kênh hoặc kiểm tra những nguồn đã tắt trong Quản lý nguồn IPTV.';
   const copy=empty.firstChild;
   if(copy?.nodeType===3&&copy.textContent!==guidance)copy.textContent=guidance;
   // P5.1.174: có kênh sẵn nhưng chưa có Favorites thì đưa người dùng về TV để bấm sao.
   // Chỉ khi chưa có kênh mới giữ lối dẫn vào Quản lý nguồn IPTV.
   const channels=window.IPTVState?.getChannels?.()||[];
   const hasChannels=channels.length>0;
   let button=empty.querySelector('#positronFavoritesSources');
   if(!button){
    button=d.createElement('button');button.id='positronFavoritesSources';
    button.type='button';button.className='btn btn-primary po-fav-action';
    button.addEventListener('click',()=>{
     if((window.IPTVState?.getChannels?.()||[]).length){
      window.IPTVState?.setPage?.('tv');
      const search=byId('searchBox');
      if(search?.value){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
      search?.focus({preventScroll:true});
     }else window.IPTVState?.setPage?.('sources');
    });
    empty.append(button);
   }
   const actionText=hasChannels?'Xem kênh để đánh dấu ★':'Quản lý nguồn IPTV';
   const actionTitle=hasChannels?
    'Mở TV và bấm sao bên cạnh kênh muốn yêu thích':
    'Mở trang quản lý và thêm nguồn IPTV';
   if(button.textContent!==actionText)button.textContent=actionText;
   if(button.title!==actionTitle)button.title=actionTitle;
   // P5.1.175: thêm nhanh một kênh yêu thích ngay tại trang trống.
   // Chỉ lấy tên/nhóm từ các kênh đã được bật; không nạp stream hoặc gọi mạng.
   const suggestionId='positronFavoriteQuickAdd';
   if(hasChannels&&!empty.querySelector('#'+suggestionId)&&window.OpenIPTVFavorites){
    const wrap=d.createElement('div');wrap.id=suggestionId;wrap.className='po-fav-quick';
    const heading=d.createElement('strong');heading.textContent='Thêm nhanh vào Yêu thích';
    heading.className='po-fav-quick-heading';
    const hint=d.createElement('small');hint.textContent='Chọn một kênh đã có để đánh dấu sao, không phát video.';
    const grid=d.createElement('div');grid.className='po-fav-quick-grid';
    const favorites=window.OpenIPTVFavorites;
    const store=window.IPTVState?.getStore?.();
    const picks=channels.filter(ch=>ch&&ch.id&&!favorites.has(store,ch)).slice(0,6);
    for(const candidate of picks){
     const chip=d.createElement('button');chip.type='button';
     chip.className='po-fav-quick-chip';chip.textContent='☆ '+String(candidate.name||'Kênh');
     chip.setAttribute('aria-label','Thêm '+String(candidate.name||'kênh')+' vào Yêu thích');
     chip.addEventListener('click',()=>{
      const active=window.IPTVState?.getChannels?.().find(ch=>ch.id===candidate.id);
      const current=window.IPTVState?.getStore?.();
      if(!active||!current||favorites.has(current,active))return;
      favorites.toggle(current,active);
      window.IPTVState?.save?.();
      window.IPTVState?.render?.();
      window.IPTVState?.setPage?.('fav');
     });
     grid.append(chip);
    }
    wrap.append(heading,hint,grid);empty.append(wrap);
   }
  };
  new MutationObserver(syncFavoriteSourceAction).observe(favoriteList,{childList:true,subtree:true});
  const countNode=byId('sourceCount');
  if(countNode)new MutationObserver(syncFavoriteSourceAction).observe(countNode,{childList:true,subtree:true,characterData:true});
  syncFavoriteSourceAction();
  // P5.1.176: Favorites đã có kênh vẫn gợi ý thêm các kênh khác.
  // Thanh này nằm ngoài danh sách nên không bị renderFavorites() xóa.
  const more=d.createElement('section');more.id='positronFavoriteMore';
  more.className='po-fav-more';more.hidden=true;
  favoriteList.after(more);
  let moreCursor=0,moreQuery='',morePageSize=6,moreGroup='',moreSort='source';
  const foldMore=value=>String(value||'').normalize('NFD')
   .replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
  const syncFavoriteMore=()=>{
   const populated=Boolean(favoriteList.querySelector('.fav-card'));
   more.hidden=!populated;
   if(!populated)return;
   const state=window.IPTVState,fav=window.OpenIPTVFavorites;
   const store=state?.getStore?.(),channels=state?.getChannels?.()||[];
   const available=store&&fav?channels.filter(ch=>ch&&ch.id&&!fav.has(store,ch)):[];
   more.replaceChildren();
   if(!available.length){more.hidden=true;return;}
   // P5.1.184: combine chosen group with the existing accent-insensitive search.
   const groupCounts=new Map();
   for(const channel of available){
    const group=String(channel.group||'Không phân nhóm');
    groupCounts.set(group,(groupCounts.get(group)||0)+1);
   }
   const groups=[...groupCounts.keys()].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
   if(moreGroup&&!groups.includes(moreGroup))moreGroup='';
   const words=foldMore(moreQuery).split(/\s+/).filter(Boolean);
   const filtered=available.filter(ch=>
    (!moreGroup||String(ch.group||'Không phân nhóm')===moreGroup) &&
    (!words.length||words.every(word=>foldMore((ch.name||'')+' '+(ch.group||'')).includes(word))));
   // P5.1.189: opt-in display sorting; preserves playlist and stored Favorite order.
   if(moreSort!=='source'){
    const collator=new Intl.Collator('vi',{sensitivity:'base',numeric:true});
    filtered.sort((a,b)=>moreSort==='name-desc'
     ?collator.compare(String(b.name||''),String(a.name||''))
     :collator.compare(String(a.name||''),String(b.name||'')));
   }
   // P5.1.186: stable, non-overlapping pages; the final page may be smaller.
   const pageCount=Math.max(1,Math.ceil(filtered.length/morePageSize));
   const pageIndex=Math.min(pageCount-1,Math.max(0,Math.floor(moreCursor/morePageSize)));
   moreCursor=pageIndex*morePageSize;
   const picks=filtered.slice(moreCursor,moreCursor+morePageSize);
   const toolbar=d.createElement('div');toolbar.className='po-fav-more-top';
   const heading=d.createElement('h3');heading.textContent='Gợi ý thêm vào Yêu thích';
   const prev=d.createElement('button');prev.type='button';prev.className='po-fav-more-prev';
   prev.textContent='← Trước';
   prev.setAttribute('aria-label','Xem trang gợi ý trước');
   prev.hidden=pageCount<=1;
   prev.addEventListener('click',()=>{
    moreCursor=((pageIndex+pageCount-1)%pageCount)*morePageSize;
    syncFavoriteMore();
    more.querySelector('.po-fav-more-prev')?.focus();
   });
   const pageStatus=d.createElement('span');pageStatus.className='po-fav-more-page';
   pageStatus.setAttribute('role','status');pageStatus.setAttribute('aria-live','polite');
   pageStatus.textContent='Trang '+(pageIndex+1)+'/'+pageCount;
   // P5.1.187: jump to a specific page without repeated Next/Previous clicks.
   const jumpLabel=d.createElement('label');jumpLabel.htmlFor='positronFavoriteJump';
   jumpLabel.textContent='Đến trang';jumpLabel.hidden=pageCount<=1;
   const jump=d.createElement('input');jump.id='positronFavoriteJump';
   jump.type='number';jump.min='1';jump.max=String(pageCount);jump.step='1';
   jump.value=String(pageIndex+1);jump.hidden=pageCount<=1;
   jump.setAttribute('aria-label','Đi thẳng tới trang gợi ý');
   const jumpToPage=()=>{
    const requested=Math.trunc(Number(jump.value));
    const target=Number.isFinite(requested)?Math.max(1,Math.min(pageCount,requested)):pageIndex+1;
    moreCursor=(target-1)*morePageSize;
    syncFavoriteMore();
    more.querySelector('#positronFavoriteJump')?.focus();
   };
   jump.addEventListener('change',jumpToPage);
   jump.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();jumpToPage();}});
   const next=d.createElement('button');next.type='button';next.className='po-fav-more-next';
   next.textContent='Gợi ý khác →';
   next.setAttribute('aria-label','Xem trang gợi ý tiếp');
   next.hidden=pageCount<=1;
   next.addEventListener('click',()=>{
    moreCursor=((pageIndex+1)%pageCount)*morePageSize;
    syncFavoriteMore();
    more.querySelector('.po-fav-more-next')?.focus();
   });
   // P5.1.180: chỉ khi người dùng bấm mới lưu hàng loạt các kênh được gợi ý.
   const bulk=d.createElement('button');bulk.type='button';bulk.className='po-fav-more-bulk';
   bulk.textContent='Lưu cả '+picks.length+' kênh';
   bulk.setAttribute('aria-label','Thêm tất cả '+picks.length+' kênh gợi ý hiện tại vào Yêu thích');
   bulk.hidden=picks.length<2;
   bulk.addEventListener('click',()=>{
    const current=state.getStore(),enabled=state.getChannels();
    let added=0;
    for(const candidate of picks){
     const active=enabled.find(ch=>String(ch.id)===String(candidate.id));
     if(!active||fav.has(current,active))continue;
     fav.toggle(current,active);added++;
    }
    if(!added)return;
    state.save();state.render();state.setPage('fav');
   });
   // P5.1.183: viewer controls the number of suggestion cards.
   const pageLabel=d.createElement('label');pageLabel.htmlFor='positronFavoritePageSize';
   pageLabel.textContent='Số kênh';
   const pageSize=d.createElement('select');pageSize.id='positronFavoritePageSize';
   pageSize.setAttribute('aria-label','Số kênh gợi ý hiển thị');
   for(const amount of [6,12,24]){
    const option=d.createElement('option');option.value=String(amount);
    option.textContent=amount+' kênh';pageSize.append(option);
   }
   pageSize.value=String(morePageSize);
   pageSize.addEventListener('change',()=>{
    morePageSize=Number(pageSize.value)||6;moreCursor=0;
    syncFavoriteMore();more.querySelector('#positronFavoritePageSize')?.focus();
   });
   toolbar.append(heading,pageLabel,pageSize,prev,pageStatus,jumpLabel,jump,next,bulk);
   const searchRow=d.createElement('div');searchRow.className='po-fav-more-search-row';
   const searchLabel=d.createElement('label');searchLabel.htmlFor='positronFavoriteMoreSearch';
   searchLabel.textContent='Tìm kênh để thêm';
   const moreInput=d.createElement('input');moreInput.id='positronFavoriteMoreSearch';
   moreInput.type='search';moreInput.placeholder='Tên kênh hoặc nhóm, có thể không dấu…';
   moreInput.setAttribute('autocomplete','off');moreInput.value=moreQuery;
   moreInput.addEventListener('input',()=>{
    const caret=moreInput.selectionStart??moreInput.value.length;
    moreQuery=moreInput.value;moreCursor=0;syncFavoriteMore();
    const focus=d.getElementById('positronFavoriteMoreSearch');
    if(focus){focus.focus();focus.setSelectionRange(caret,caret);}
   });
   // Group controls are derived exclusively from currently enabled playlist metadata.
   const groupLabel=d.createElement('label');groupLabel.htmlFor='positronFavoriteMoreGroup';
   groupLabel.textContent='Nhóm';
   const groupSelect=d.createElement('select');groupSelect.id='positronFavoriteMoreGroup';
   groupSelect.setAttribute('aria-label','Lọc gợi ý Yêu thích theo nhóm kênh');
   for(const [value,label] of [['','Tất cả nhóm ('+available.length+')'],...groups.map(group=>[group,group+' ('+groupCounts.get(group)+')'])]){
    const option=d.createElement('option');option.value=value;option.textContent=label;groupSelect.append(option);
   }
   groupSelect.value=moreGroup;
   groupSelect.addEventListener('change',()=>{
    moreGroup=groupSelect.value;moreCursor=0;syncFavoriteMore();
    more.querySelector('#positronFavoriteMoreGroup')?.focus();
   });
   // P5.1.189: sort suggestions without changing source order or storage.
   const sortMoreLabel=d.createElement('label');sortMoreLabel.htmlFor='positronFavoriteMoreSort';
   sortMoreLabel.textContent='Thứ tự';
   const sortMore=d.createElement('select');sortMore.id='positronFavoriteMoreSort';
   sortMore.setAttribute('aria-label','Sắp xếp kênh gợi ý chưa yêu thích');
   for(const [value,text] of [['source','Theo nguồn'],['name-asc','Tên A–Z'],['name-desc','Tên Z–A']]){
    const option=d.createElement('option');option.value=value;option.textContent=text;sortMore.append(option);
   }
   sortMore.value=moreSort;
   sortMore.addEventListener('change',()=>{
    moreSort=sortMore.value;moreCursor=0;syncFavoriteMore();
    more.querySelector('#positronFavoriteMoreSort')?.focus();
   });
   searchRow.append(searchLabel,moreInput,groupLabel,groupSelect,sortMoreLabel,sortMore);
   // P5.1.185: one-click most populated groups, with live count and pressed state.
   const quickRow=d.createElement('div');quickRow.className='po-fav-group-quick';
   quickRow.setAttribute('role','group');
   quickRow.setAttribute('aria-label','Nhóm kênh gợi ý truy cập nhanh');
   const sortedGroups=[...groups].sort((a,b)=>groupCounts.get(b)-groupCounts.get(a)||a.localeCompare(b,'vi'));
   const featured=sortedGroups.slice(0,4);
   if(moreGroup&&!featured.includes(moreGroup))featured.push(moreGroup);
   for(const [value,label,count] of [['','Tất cả',available.length],...featured.map(group=>[group,group,groupCounts.get(group)])]){
    const chip=d.createElement('button');chip.type='button';chip.className='po-fav-group-chip';
    chip.dataset.poFavGroupValue=value;
    chip.textContent=label+' · '+count;
    chip.setAttribute('aria-pressed',String(moreGroup===value));
    chip.addEventListener('click',()=>{
     moreGroup=value;moreCursor=0;syncFavoriteMore();
     [...more.querySelectorAll('.po-fav-group-chip')].find(node=>node.dataset.poFavGroupValue===value)?.focus();
    });
    quickRow.append(chip);
   }
   const hint=d.createElement('p');
   hint.textContent='Tìm thấy '+filtered.length+' / '+available.length+' kênh chưa yêu thích. Bấm ☆ để lưu, không tự phát video.';
   const grid=d.createElement('div');grid.className='po-fav-more-grid';
   if(!filtered.length){
    const noMatch=d.createElement('p');noMatch.className='po-fav-more-empty';
    noMatch.textContent='Không có kênh chưa yêu thích phù hợp. Hãy thử từ khóa khác.';
    grid.append(noMatch);
   }
   for(const candidate of picks){
    const chip=d.createElement('button');chip.type='button';
    chip.className='po-fav-more-chip';chip.textContent='☆ '+String(candidate.name||'Kênh');
    chip.setAttribute('aria-label','Thêm '+String(candidate.name||'kênh')+' vào Yêu thích');
    chip.addEventListener('click',()=>{
     const current=state.getStore(),active=state.getChannels().find(ch=>ch.id===candidate.id);
     if(!active||fav.has(current,active))return;
     fav.toggle(current,active);state.save();state.render();state.setPage('fav');
    });
    grid.append(chip);
   }
   more.append(toolbar,searchRow,quickRow,hint,grid);
  };
  new MutationObserver(syncFavoriteMore).observe(favoriteList,{childList:true,subtree:true});
  syncFavoriteMore();

  // P5.1.177: tìm tên/nhóm trong Yêu thích đã lưu, không tác động TV hay source.
  const favFilter=d.createElement('section');favFilter.id='positronFavoriteFilter';
  favFilter.className='po-fav-filter';favFilter.hidden=true;
  const filterLabel=d.createElement('label');filterLabel.htmlFor='positronFavoriteSearch';
  filterLabel.textContent='Tìm trong Yêu thích';
  const favSearch=d.createElement('input');favSearch.id='positronFavoriteSearch';
  favSearch.type='search';favSearch.placeholder='Tìm theo tên kênh hoặc nhóm…';
  favSearch.setAttribute('autocomplete','off');
  const favCountText=d.createElement('small');favCountText.id='positronFavoriteVisibleCount';
  favCountText.setAttribute('role','status');favCountText.setAttribute('aria-live','polite');
  const noResults=d.createElement('p');noResults.id='positronFavoriteNoResults';
  noResults.textContent='Không có kênh Yêu thích phù hợp';noResults.hidden=true;
  // P5.1.182: switch only the visible card order; do not change stored Favorites.
  const sortLabel=d.createElement('label');sortLabel.htmlFor='positronFavoriteSort';
  sortLabel.textContent='Sắp xếp';
  const favSort=d.createElement('select');favSort.id='positronFavoriteSort';
  favSort.setAttribute('aria-label','Sắp xếp kênh yêu thích');
  for(const [value,title] of [['source','Thứ tự ban đầu'],['name-asc','Tên A–Z'],['name-desc','Tên Z–A']]){
   const opt=d.createElement('option');opt.value=value;opt.textContent=title;favSort.append(opt);
  }
  favFilter.append(filterLabel,favSearch,sortLabel,favSort,favCountText,noResults);favoriteList.before(favFilter);
  const foldFav=value=>String(value||'').normalize('NFD')
   .replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
  const updateFavFilter=()=>{
   const cards=[...favoriteList.querySelectorAll('.fav-card')];
   favFilter.hidden=!cards.length;
   if(!cards.length)return;
   // CSS presentation order changes without modifying source order or persistence.
   const ranked=cards.slice(),selected=favSort.value;
   if(selected!=='source'){
    const collator=new Intl.Collator('vi',{sensitivity:'base',numeric:true});
    ranked.sort((a,b)=>{
     const byName=collator.compare(a.querySelector('h3')?.textContent||'',b.querySelector('h3')?.textContent||'');
     return selected==='name-desc'?-byName:byName;
    });
   }
   ranked.forEach((card,index)=>{card.style.order=String(index);});
   const words=foldFav(favSearch.value).split(/\s+/).filter(Boolean);
   let visible=0;
   for(const card of cards){
    const name=foldFav(card.querySelector('h3')?.textContent);
    const group=foldFav(card.querySelector('small')?.textContent);
    const matches=words.every(word=>(name+' '+group).includes(word));
    card.hidden=!matches;if(matches)visible++;
   }
   favCountText.textContent='Hiển thị '+visible+' / '+cards.length+' kênh yêu thích';
   noResults.hidden=visible!==0;
  };
  favSearch.addEventListener('input',updateFavFilter);
  favSort.addEventListener('change',updateFavFilter);
  new MutationObserver(updateFavFilter).observe(favoriteList,{childList:true});
  updateFavFilter();
 }

 // P5.1.12 / round 05: real 1360px Settings screenshot shows the old
 // search label cut off ("Tìm kênh, trang, công cu..."), with a tiny font glyph
 // instead of a recognizable search icon. Preserve button event and shortcut.
 const searchButton=byId('positronOpen');
 if(searchButton){
  const glyph=searchButton.querySelector('span:first-child');
  if(glyph&&!glyph.querySelector('svg')){
   const svg=d.createElementNS(ns,'svg');
   svg.setAttribute('viewBox','0 0 24 24');
   svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   const circle=d.createElementNS(ns,'circle');
   circle.setAttribute('cx','10.5');circle.setAttribute('cy','10.5');circle.setAttribute('r','6.5');
   const handle=d.createElementNS(ns,'path');handle.setAttribute('d','M16 16l5 5');
   svg.append(circle,handle);glyph.replaceChildren(svg);
  }
  const label=searchButton.querySelector('.p-command-label');
  if(label)label.textContent='Tìm kênh / trang';
  searchButton.setAttribute('aria-label','Tìm kiếm kênh, trang và công cụ');
 }
 // P5.1.13 round 06: keep full native FFmpeg readiness/status accessible.
 // The original sidebar text updates during runtime; never cache or replace it.
 const statusLabel=byId('miniStatus');
 if(statusLabel){
  const syncStatusTitle=()=>{const value=statusLabel.textContent||'';if(statusLabel.title!==value)statusLabel.title=value;};
  new MutationObserver(syncStatusTitle).observe(statusLabel,{childList:true,subtree:true,characterData:true});
  syncStatusTitle();
 }
 // P5.1.14: the real P5.1.13 Sources screenshot at 720px showed
 // the unlimited native scan option clipped. Keep value='all' unchanged.
 const smartLimit=byId('smartLimit');
 if(smartLimit){
  const unlimited=smartLimit.querySelector('option[value="all"]');
  if(unlimited){
   unlimited.textContent='Tất cả kênh';
   unlimited.title='Kiểm tra tất cả (không giới hạn)';
  }
 }
 // P5.1.15 / new round 07: live Electron Doctor shows six zero metrics
 // with no route to import sources. Add a non-destructive recovery action.
 const doctorPage=byId('page-doctor');
 if(doctorPage&&!byId('positronDoctorEmptyHint')){
  const hint=d.createElement('div');hint.id='positronDoctorEmptyHint';
  const copy=d.createElement('div');copy.className='po-doctor-start-copy';
  const kicker=d.createElement('span');kicker.className='po-doctor-start-label';kicker.textContent='CHƯA CÓ DANH SÁCH KÊNH';
  const heading=d.createElement('strong');heading.textContent='Bắt đầu chẩn đoán với nguồn của bạn';
  const explanation=d.createElement('p');explanation.textContent='Thêm playlist M3U hoặc URL hợp lệ. Doctor sẽ giúp kiểm tra kênh trùng, ghép EPG và link dự phòng khi có dữ liệu.';
  copy.append(kicker,heading,explanation);
  const action=d.createElement('button');action.type='button';action.id='positronDoctorSources';
  action.className='btn btn-primary';action.textContent='Quản lý nguồn IPTV';
  action.title='Mở trang quản lý nguồn IPTV';
  action.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'));
  hint.append(copy,action);
  doctorPage.querySelector('.section-heading')?.insertAdjacentElement('afterend',hint);
  const count=byId('navCount');
  const updateHint=()=>{hint.hidden=(Number((count?.textContent||'0').replace(/[^0-9]/g,''))||0)>0;};
  if(count)new MutationObserver(updateHint).observe(count,{childList:true,subtree:true,characterData:true});
  updateHint();
 }
 // P5.1.16: P5.1.15 actual Electron 450px TV screenshot still
 // shows OS-dependent '◖))' speaker text unlike vector transport icons.
 // Keep the native label and the original range input event handlers.
 const volumeLabel=d.querySelector('#page-tv label.volume-icon[for="volume"]');
 if(volumeLabel&&!volumeLabel.querySelector('svg')){
  const svg=d.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  for(const shape of ['M11 5 6 9H3v6h3l5 4z','M15 9a4 4 0 0 1 0 6','M18 6a8 8 0 0 1 0 12']){
   const path=d.createElementNS(ns,'path');
   path.setAttribute('d',shape);svg.append(path);
  }
  volumeLabel.replaceChildren(svg);
 }
 // P5.1.17: Actual P5.1.16 Electron TV 450px screenshot revealed
 // Cast and PiP buttons still have tiny platform-dependent box glyphs.
 // Keep original button nodes, native click handlers and accessible labels.
 const outputIcons=[
  {id:'castBtn',caption:'Cast / AirPlay',paths:['M5 7V5h15v14h-4','M4 12a7 7 0 0 1 7 7','M4 16a3 3 0 0 1 3 3']},
  {id:'pipBtn',caption:'PiP',rects:[[3,4,18,16,2],[11,11,7,6,1]]}
 ];
 for(const spec of outputIcons){
  const button=byId(spec.id);if(!button||button.querySelector('svg'))continue;
  const svg=d.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  for(const pathText of spec.paths||[]){
   const path=d.createElementNS(ns,'path');path.setAttribute('d',pathText);svg.append(path);
  }
  for(const [x,y,width,height,rx] of spec.rects||[]){
   const rect=d.createElementNS(ns,'rect');
   for(const [key,value] of Object.entries({x,y,width,height,rx}))rect.setAttribute(key,String(value));
   svg.append(rect);
  }
  const label=d.createElement('span');label.textContent=spec.caption;
  button.replaceChildren(svg,label);
 }
 // P5.1.24: real Electron 720px EPG image revealed an OS-colored recording emoji.
 // Keep the original localized label and DVR handlers; only replace the decorative glyph.
 const dvrTitle=d.querySelector('#dvrPanel .dvr-heading h2');
 if(dvrTitle){
  const ensureDvrVector=()=>{
   if(dvrTitle.querySelector('svg'))return;
   const caption=(dvrTitle.textContent||'').replace(/^[\s⏺🔴🟠•]+/u,'').trim();
   const icon=d.createElementNS(ns,'svg');icon.setAttribute('viewBox','0 0 24 24');
   icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');
   const outer=d.createElementNS(ns,'circle');outer.setAttribute('cx','12');outer.setAttribute('cy','12');outer.setAttribute('r','9');
   const core=d.createElementNS(ns,'circle');core.setAttribute('cx','12');core.setAttribute('cy','12');core.setAttribute('r','3.5');core.setAttribute('class','record-dot');
   icon.append(outer,core);const label=d.createElement('span');label.textContent=caption;
   dvrTitle.replaceChildren(icon,label);
  };
  ensureDvrVector();new MutationObserver(ensureDvrVector).observe(dvrTitle,{childList:true,subtree:true,characterData:true});
 }
 // P5.1.25: the actual P5.1.24 EPG 720px screenshot shows a blank
 // enabled DVR channel select even though no playlists/channels exist.
 // Preserve native DVR scheduling, but clearly expose no-channel state.
 // P5.1.35: P5.1.34 actual Electron EPG screenshot still rendered a tiny
 // OS-dependent record glyph on the disabled submit. Replace only the
 // decorative glyph, preserving native form submission and channel guards.
 const nativeDvrSubmit=byId('dvrAdd');
 if(nativeDvrSubmit&&!nativeDvrSubmit.querySelector('svg')){
  const icon=d.createElementNS(ns,'svg');icon.setAttribute('viewBox','0 0 24 24');
  icon.setAttribute('class','positron-dvr-record-icon');
  icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');
  const outer=d.createElementNS(ns,'circle');outer.setAttribute('cx','12');outer.setAttribute('cy','12');outer.setAttribute('r','9');
  const center=d.createElementNS(ns,'circle');center.setAttribute('cx','12');center.setAttribute('cy','12');center.setAttribute('r','4');center.setAttribute('class','record-dot');
  icon.append(outer,center);
  const label=d.createElement('span');
  label.textContent=(nativeDvrSubmit.textContent||'').replace(/^[\s⏺🔴🟠•]+/u,'').trim()||'Đặt lịch ghi';
  nativeDvrSubmit.replaceChildren(icon,label);
 }
 const dvrChannel=byId('dvrChannel');
 if(dvrChannel){
  const syncDvrChannel=()=>{
   const hasChannels=Array.from(dvrChannel.options).some(o=>o.value!=='');
   if(!hasChannels&&dvrChannel.options.length===0){
    const option=d.createElement('option');option.value='';option.textContent='Chưa có kênh để ghi hình';
    dvrChannel.append(option);
   }
   dvrChannel.disabled=!hasChannels;
   dvrChannel.setAttribute('aria-label',hasChannels?'Chọn kênh để ghi hình':'Chưa có kênh để hẹn giờ ghi hình');
   // P5.1.30: EPG real screenshot shows enabled submit without any channel.
   const schedule=byId('dvrAdd');
   if(schedule){
    if(!hasChannels){
     if(!schedule.disabled)schedule.setAttribute('data-positron-no-channels','true');
     schedule.disabled=true;
     schedule.setAttribute('aria-describedby','dvrChannel');
    }else if(schedule.getAttribute('data-positron-no-channels')==='true'){
     schedule.disabled=false;
     schedule.removeAttribute('data-positron-no-channels');
     schedule.removeAttribute('aria-describedby');
    }
   }

  };
  syncDvrChannel();
  new MutationObserver(syncDvrChannel).observe(dvrChannel,{childList:true});
 }



 // P5.1.191: one-click recording duration presets, additive only.
 // No automatic DVR schedule is created; the native form still requires Submit.
 const dvrLocalDateTime=date=>{
  const pad=value=>String(value).padStart(2,'0');
  return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())
   +'T'+pad(date.getHours())+':'+pad(date.getMinutes());
 };
 const attachDvrPresets=(startId,endId,rowId)=>{
  const start=byId(startId),end=byId(endId);
  if(!start||!end||byId(rowId))return;
  const row=d.createElement('div');row.id=rowId;row.className='po-dvr-presets';
  row.setAttribute('role','group');row.setAttribute('aria-label','Đặt nhanh thời lượng ghi hình');
  for(const minutes of [30,60,120]){
   const button=d.createElement('button');button.type='button';
   button.dataset.durationMinutes=String(minutes);
   button.textContent='+'+minutes+' phút';
   button.setAttribute('aria-label','Chọn ghi hình '+minutes+' phút từ giờ bắt đầu');
   button.addEventListener('click',()=>{
    const from=new Date(start.value);
    if(!start.value||!Number.isFinite(from.getTime())){
     start.focus();window.IPTVState?.toast?.('Chọn giờ bắt đầu ghi hình trước','warn');return;
    }
    const until=new Date(from.getTime()+minutes*60000);
    end.value=dvrLocalDateTime(until);
    end.dispatchEvent(new Event('input',{bubbles:true}));
    end.dispatchEvent(new Event('change',{bubbles:true}));
   });
   row.append(button);
  }
  end.parentElement.append(row);
 };
 attachDvrPresets('dvrStart','dvrEnd','poDvrDurationPresets');
 attachDvrPresets('dvrQuickStart','dvrQuickEnd','poDvrQuickDurationPresets');

 // P5.1.192: live duration feedback; informational only, never submits a DVR job.
 const attachDvrDurationStatus=(startId,endId,statusId)=>{
  const start=byId(startId),end=byId(endId);
  if(!start||!end||byId(statusId))return;
  const status=d.createElement('output');status.id=statusId;
  status.className='po-dvr-duration-status';status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  end.parentElement.append(status);
  // P5.1.193: press state matches the actual time window (no DVR submission).
  const presets=end.parentElement.querySelector('.po-dvr-presets');
  const syncPreset=minutes=>{
   for(const button of presets?.querySelectorAll('button[data-duration-minutes]')||[])
    button.setAttribute('aria-pressed',String(Number(button.dataset.durationMinutes)===minutes));
  };
  const refresh=()=>{
   syncPreset(NaN);
   if(!start.value||!end.value){
    status.dataset.state='idle';status.textContent='Chọn giờ bắt đầu và kết thúc để xem thời lượng ghi.';
    return;
   }
   const startMs=new Date(start.value).getTime(),endMs=new Date(end.value).getTime();
   if(!Number.isFinite(startMs)||!Number.isFinite(endMs)){
    status.dataset.state='error';status.textContent='Thời gian ghi hình không hợp lệ.';
    return;
   }
   const minutes=Math.round((endMs-startMs)/60000);
   if(minutes>0&&minutes<=480)syncPreset(minutes);
   if(minutes<=0){
    status.dataset.state='error';status.textContent='Giờ kết thúc phải sau giờ bắt đầu.';
   }else if(minutes>480){
    status.dataset.state='error';status.textContent='Vượt giới hạn ghi hình 8 giờ ('+minutes+' phút).';
   }else{
    status.dataset.state='valid';
    const hours=Math.floor(minutes/60),remainder=minutes%60;
    status.textContent='Thời lượng ghi: '+(hours?hours+' giờ'+(remainder?' '+remainder+' phút':''):minutes+' phút');
   }
  };
  for(const input of [start,end]){
   input.addEventListener('input',refresh);
   input.addEventListener('change',refresh);
  }
  refresh();
 };
 attachDvrDurationStatus('dvrStart','dvrEnd','poDvrDurationStatus');
 attachDvrDurationStatus('dvrQuickStart','dvrQuickEnd','poDvrQuickDurationStatus');

 // P5.1.194: quick local recording start presets. Keep a previously chosen
 // legal duration (1..480 min); use 60 min when Start/End are incomplete.
 // These three buttons never submit, play, or edit the IPTV playlist.
 const attachDvrQuickStart=(startId,endId,rowId)=>{
  const start=byId(startId),end=byId(endId);
  if(!start||!end||byId(rowId))return;
  const row=d.createElement('div');
  row.id=rowId;row.className='po-dvr-quick-start';
  row.setAttribute('role','group');row.setAttribute('aria-label','Đặt nhanh giờ bắt đầu ghi hình');
  for(const offset of [5,15,30]){
   const button=d.createElement('button');button.type='button';
   button.dataset.startAfterMinutes=String(offset);
   button.textContent='Sau '+offset+' phút';
   button.setAttribute('aria-label','Bắt đầu ghi hình sau '+offset+' phút');
   button.addEventListener('click',()=>{
    const oldStart=start.value?new Date(start.value).getTime():NaN;
    const oldEnd=end.value?new Date(end.value).getTime():NaN;
    const currentDuration=Math.round((oldEnd-oldStart)/60000);
    const duration=Number.isFinite(currentDuration)&&currentDuration>0&&currentDuration<=480?currentDuration:60;
    const now=Date.now();
    const nextStart=new Date(Math.ceil(now/60000)*60000+offset*60000);
    start.value=dvrLocalDateTime(nextStart);
    end.value=dvrLocalDateTime(new Date(nextStart.getTime()+duration*60000));
    for(const field of [start,end]){
     field.dispatchEvent(new Event('input',{bubbles:true}));
     field.dispatchEvent(new Event('change',{bubbles:true}));
    }
   });
   row.append(button);
  }
  start.parentElement.append(row);
 };
 attachDvrQuickStart('dvrStart','dvrEnd','poDvrQuickStartPresets');
 attachDvrQuickStart('dvrQuickStart','dvrQuickEnd','poDvrQuickStartQuickPresets');

 // P5.1.33: real P5.1.32 TV 450px screenshot shows an actionable
 // favorite star beside 'Chưa chọn kênh'. Use the native selection API,
 // not an empty-state string, to protect existing playlist semantics.
 // P5.1.37: actual P5.1.36 Electron TV 450px screenshot shows an active
 // purple Play button next to a 0-channel empty state. Native Play only
 // displays a no-playlist warning in this case. Preserve it for future
 // playlist updates and never interfere with a selected playing channel.
 const mainPlay=byId('playBtn'),channelCount=byId('navCount');
 if(mainPlay&&channelCount){
  const syncPlayAvailability=()=>{
   const count=Number((channelCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   const canPlay=count>0||!!window.IPTVState?.getCurrent?.();
   if(!canPlay){
    if(!mainPlay.hasAttribute('data-positron-no-channels')){
     if(mainPlay.disabled)return; // another native guard takes precedence
     mainPlay.setAttribute('data-positron-no-channels','true');
    }
    mainPlay.disabled=true;
    mainPlay.setAttribute('aria-describedby','playingSubtitle');
   }else if(mainPlay.getAttribute('data-positron-no-channels')==='true'){
    mainPlay.disabled=false;
    mainPlay.removeAttribute('data-positron-no-channels');
    mainPlay.removeAttribute('aria-describedby');
   }
  };
  new MutationObserver(syncPlayAvailability).observe(channelCount,{childList:true,subtree:true,characterData:true});
  const playing=byId('playingTitle');
  if(playing)new MutationObserver(syncPlayAvailability).observe(playing,{childList:true,subtree:true,characterData:true});
  syncPlayAvailability();
 }
 // P5.1.38: P5.1.37 real Electron TV 450px empty-state screenshot
 // shows Prev, Stop, Next available even with zero channels. Stop is only
 // meaningful while a current channel exists, while navigation is available
 // as soon as a playlist supplies channels. Preserve original event nodes.
 const transportActions=['prevBtn','stopBtn','nextBtn'];
 const transportCount=byId('navCount');
 if(transportCount){
  const syncTransportAvailability=()=>{
   const count=Number((transportCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   const hasCurrent=!!window.IPTVState?.getCurrent?.();
   for(const id of transportActions){
    const button=byId(id);if(!button)continue;
    const unavailable=id==='stopBtn'?!hasCurrent:count===0;
    if(unavailable){
     if(!button.hasAttribute('data-positron-inactive')){
      if(button.disabled)continue;
      button.setAttribute('data-positron-inactive','true');
     }
     button.disabled=true;
     button.setAttribute('aria-describedby','playingSubtitle');
    }else if(button.getAttribute('data-positron-inactive')==='true'){
     button.disabled=false;button.removeAttribute('data-positron-inactive');
     button.removeAttribute('aria-describedby');
    }
   }
  };
  new MutationObserver(syncTransportAvailability).observe(transportCount,{childList:true,subtree:true,characterData:true});
  const currentTitle=byId('playingTitle');
  if(currentTitle)new MutationObserver(syncTransportAvailability).observe(currentTitle,{childList:true,subtree:true,characterData:true});
  syncTransportAvailability();
 }
 // P5.1.39: actual P5.1.38 Electron TV 450px screenshot shows Cast/PiP
 // still active when there is no selected channel. Cast's native handler
 // only emits a warning without a channel; PiP needs video. Preserve native
 // handlers and any platform feature-support disabled flags.
 const idleOutputActions=['castBtn','pipBtn'];
 const outputTitle=byId('playingTitle');
 if(outputTitle){
  const syncOutputAvailability=()=>{
   const hasCurrent=!!window.IPTVState?.getCurrent?.();
   for(const id of idleOutputActions){
    const b=byId(id);if(!b)continue;
    if(!hasCurrent){
     if(!b.hasAttribute('data-positron-no-current')){
      if(b.disabled)continue;
      b.setAttribute('data-positron-no-current','true');
     }
     b.disabled=true;b.setAttribute('aria-describedby','playingTitle');
    }else if(b.getAttribute('data-positron-no-current')==='true'){
     b.disabled=false;
     b.removeAttribute('data-positron-no-current');
     b.removeAttribute('aria-describedby');
    }
   }
  };
  new MutationObserver(syncOutputAvailability).observe(outputTitle,{childList:true,subtree:true,characterData:true});
  window.addEventListener('openiptv:media-info',syncOutputAvailability);
  syncOutputAvailability();
 }
 const currentFavorite=byId('favCurrentBtn'),currentLabel=byId('playingTitle');
 if(currentFavorite&&currentLabel){
  const syncFavoriteAvailability=()=>{
   const hasCurrent=!!window.IPTVState?.getCurrent?.();
   if(!hasCurrent){
    if(!currentFavorite.disabled)currentFavorite.setAttribute('data-positron-no-current','true');
    currentFavorite.disabled=true;
    currentFavorite.setAttribute('aria-describedby','playingTitle');
   }else if(currentFavorite.getAttribute('data-positron-no-current')==='true'){
    currentFavorite.disabled=false;
    currentFavorite.removeAttribute('data-positron-no-current');
    currentFavorite.removeAttribute('aria-describedby');
   }
  };
  new MutationObserver(syncFavoriteAvailability).observe(currentLabel,{childList:true,subtree:true,characterData:true});
  new MutationObserver(syncFavoriteAvailability).observe(currentFavorite,{attributes:true,attributeFilter:['aria-pressed']});
  syncFavoriteAvailability();
 }

 // P5.1.26–27: the real Doctor screenshots show active analysis
 // buttons next to zero channel metrics, despite the existing source CTA.
 // Disable no-input operations only; never remove listeners or prior reports.
 const doctorAvailabilityCount=byId('navCount');
 if(doctorPage&&doctorAvailabilityCount){
  const analysisButtons=['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify'];
  const syncDoctorAvailability=()=>{
   const count=Number((doctorAvailabilityCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   for(const id of analysisButtons){
    const button=byId(id);if(!button)continue;
    if(count===0){
     if(!button.hasAttribute('data-positron-no-channels')){
      if(button.disabled)continue; // preserve independently disabled native states
      button.setAttribute('data-positron-no-channels','true');
     }
     button.disabled=true;
     button.setAttribute('aria-describedby','positronDoctorEmptyHint');
    }else if(button.getAttribute('data-positron-no-channels')==='true'){
     button.disabled=false;
     button.removeAttribute('data-positron-no-channels');
     button.removeAttribute('aria-describedby');
    }
   }
  };
  new MutationObserver(syncDoctorAvailability).observe(doctorAvailabilityCount,{childList:true,subtree:true,characterData:true});
  syncDoctorAvailability();
 }

 // P5.1.46 — the verified EPG 720px and 1360px Electron screenshots show
 // an unusable DVR schedule form dominating the page when no source channels exist.
 // Collapse only the unavailable form/help; keep folder controls, existing jobs,
 // native handlers and all field values intact for when channels arrive.
 const compactDvrPanel=byId('dvrPanel'),compactDvrForm=byId('dvrForm'),compactDvrSelect=byId('dvrChannel');
 if(compactDvrPanel&&compactDvrForm&&compactDvrSelect&&!byId('positronDvrNoChannels')){
  const prompt=d.createElement('div');
  prompt.id='positronDvrNoChannels';prompt.className='p46-dvr-empty';prompt.setAttribute('role','status');
  const message=d.createElement('span');message.textContent='Chưa có kênh';
  const sourceButton=d.createElement('button');sourceButton.type='button';sourceButton.className='btn btn-subtle';
  sourceButton.id='positronDvrGoSources';sourceButton.textContent='Quản lý nguồn IPTV';
  sourceButton.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'));
  prompt.append(message,sourceButton);
  compactDvrForm.insertAdjacentElement('beforebegin',prompt);
  // P5.1.47: the actual P5.1.46 screenshots still said 'ready to schedule'
  // while there are zero channels. Only conceal that exact idle copy: native
  // errors, live recording, history and other status changes remain visible.
  const dvrNativeStatus=byId('dvrStatus');
  const idleReadyCopy="Sẵn sàng đặt lịch ghi. Ứng dụng cần đang mở đúng giờ; chỉ hỗ trợ luồng bạn có quyền ghi.";
  const syncCompactDvr=()=>{
   const available=Array.from(compactDvrSelect.options).some(o=>o.value!=='');
   compactDvrPanel.classList.toggle('p46-no-channels',!available);
   prompt.hidden=available;
   const nativeText=dvrNativeStatus?.textContent?.trim()||'';
   const translated=window.OpenIPTVI18n?.t?.(idleReadyCopy)||idleReadyCopy;
   const isIdle=(nativeText===idleReadyCopy||nativeText===translated)&&!dvrNativeStatus?.classList.contains('dvr-error');
   compactDvrPanel.classList.toggle('p47-hide-idle-status',!available&&isIdle);
  };
  new MutationObserver(syncCompactDvr).observe(compactDvrSelect,{childList:true});
  if(dvrNativeStatus)new MutationObserver(syncCompactDvr).observe(dvrNativeStatus,{childList:true,subtree:true,characterData:true});
  syncCompactDvr();
 }

 // P5.1.49: real P5.1.48 EPG empty screenshot still presents Reload EPG
 // as available with zero channels. Do not allow a no-op warning click;
 // reenable only the state disabled by this guard once channels exist.
 const epgReload=byId('epgRefreshBtn'),epgChannelCount=byId('navCount');
 if(epgReload&&epgChannelCount){
  const syncReloadAvailability=()=>{
   const count=Number((epgChannelCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   if(count===0){
    if(!epgReload.disabled){
     epgReload.setAttribute('data-positron-epg-no-channels','true');
     epgReload.disabled=true;
     if(!epgReload.hasAttribute('aria-describedby')){
      epgReload.setAttribute('aria-describedby','epgGuide');
      epgReload.setAttribute('data-positron-epg-described','true');
     }
    }
   }else if(epgReload.getAttribute('data-positron-epg-no-channels')==='true'){
    epgReload.removeAttribute('data-positron-epg-no-channels');
    if(epgReload.getAttribute('data-positron-epg-described')==='true'){
     epgReload.removeAttribute('aria-describedby');
     epgReload.removeAttribute('data-positron-epg-described');
    }
    if(!byId('epgLoadBtn')?.disabled)epgReload.disabled=false;
   }
  };
  new MutationObserver(syncReloadAvailability).observe(epgChannelCount,{childList:true,subtree:true,characterData:true});
  new MutationObserver(syncReloadAvailability).observe(epgReload,{attributes:true,attributeFilter:['disabled']});
  syncReloadAvailability();
 }

 // P5.1.52: On the verified P5.1.51 EPG 720px screenshot the advanced
 // programme search, mapping and offset tools occupy space before any guide
 // exists. Keep their original nodes, handlers and user-entered values,
 // and reveal them as soon as the native EPG summary refreshes with data.
 const epgPage=byId('page-epg'),epgSummary=byId('epgSummary');
 if(epgPage&&epgSummary){
  const syncEpgToolVisibility=()=>{
   const guide=window.IPTVExtras?.getGuide?.();
   const hasProgrammes=Array.isArray(guide?.programmes)&&guide.programmes.length>0;
   const wasCollapsed=epgPage.hasAttribute('data-positron-no-epg-programmes');
   epgPage.toggleAttribute('data-positron-no-epg-programmes',!hasProgrammes);
   // A guide can finish loading while this page stays open. Refresh the
   // original advanced-search result so it no longer says "no EPG data".
   if(hasProgrammes&&wasCollapsed&&epgPage.classList.contains('active-page')){
    window.IPTVProAdvanced?.onPage?.('epg');
   }
  };
  new MutationObserver(syncEpgToolVisibility).observe(epgSummary,{childList:true,subtree:true,characterData:true});
  syncEpgToolVisibility();
 }

 window.OpenIPTVPositronTwenty=Object.freeze({
  setStage,getStage:()=>stage,getFeedback:()=>previous
 });
})();
