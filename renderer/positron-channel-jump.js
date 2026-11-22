'use strict';
/* P5.1.226: accessible numeric jump in the real channel list.
   Never starts playback or changes playlist order. */
(()=>{
 const d=document;
 const state=window.IPTVState;
 const header=d.querySelector('#page-tv .channel-panel .panel-header .panel-header-actions');
 const panelHeader=d.querySelector('#page-tv .channel-panel .panel-header');
 if(!state?.getChannels||!header||!panelHeader||d.getElementById('poChannelJumpToggle'))return;
 const toggle=d.createElement('button');
 toggle.type='button';
 toggle.id='poChannelJumpToggle';
 toggle.className='po-channel-jump-toggle';
 toggle.setAttribute('title','Nhảy tới kênh theo số');
 toggle.setAttribute('aria-label','Nhảy tới kênh theo số');
 toggle.setAttribute('aria-expanded','false');
 toggle.setAttribute('aria-controls','poChannelJumpPanel');
 toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h7M3 10h7M3 15h7m9-11 6 6-6 6"/></svg>';
 header.prepend(toggle);
 const panel=d.createElement('div');
 panel.id='poChannelJumpPanel';
 panel.className='po-channel-jump-panel';
 panel.hidden=true;
 panel.innerHTML='<label for="poChannelJumpNumber">Đến kênh số</label><input type="number" id="poChannelJumpNumber" min="1" step="1" inputmode="numeric" aria-label="Nhập số thứ tự kênh"/><button type="button" id="poChannelJumpGo">Đi</button><p id="poChannelJumpStatus" role="status" aria-live="polite"></p>';
 panelHeader.after(panel);
 const number=panel.querySelector('#poChannelJumpNumber');
 const go=panel.querySelector('#poChannelJumpGo');
 const status=panel.querySelector('#poChannelJumpStatus');
 // P249: preserve the originating focused channel on Escape cancellation.
 let jumpOriginRow=null;
 // P5.1.231: direct group picker uses native rendered folder headers.
 // All option labels use textContent; stream URLs never enter this control.
 const groupRow=d.createElement('div');
 groupRow.id='poChannelGroupRow';
 groupRow.innerHTML='<label for="poChannelGroupSelect">Đến nhóm</label><select id="poChannelGroupSelect" aria-label="Chọn nhóm kênh đang hiển thị"></select><button type="button" id="poChannelGroupGo">Đến nhóm</button>';
 status.before(groupRow);
 const groupSelect=groupRow.querySelector('#poChannelGroupSelect');
 const groupGo=groupRow.querySelector('#poChannelGroupGo');
 // P232: searchable native group picker. Filter only local folder captions;
 // never inspect or expose playlist URLs, favorite state or playback metadata.
 const searchRow=d.createElement('div');
 searchRow.id='poChannelGroupSearchRow';
 searchRow.innerHTML='<label for="poChannelGroupSearch">Tìm nhóm</label><input id="poChannelGroupSearch" type="search" autocomplete="off" spellcheck="false" placeholder="Tên nhóm" aria-label="Lọc nhóm kênh theo tên"/><output id="poChannelGroupMatchCount" aria-live="polite"></output>';
 groupRow.before(searchRow);
 const groupSearch=searchRow.querySelector('#poChannelGroupSearch');
 const matchCount=searchRow.querySelector('#poChannelGroupMatchCount');
 const visibleHeaders=()=>[...d.querySelectorAll('#channelList .folder-header[data-group]')];
 const normalizeGroup=value=>String(value||'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').trim();
 function filterGroups(){
  const groups=visibleHeaders();
  const needle=normalizeGroup(groupSearch.value);
  const filtered=groups.filter(header=>{
   const label=header.querySelector('span:nth-child(3)')?.textContent||header.dataset.group;
   return !needle||normalizeGroup(label).includes(needle);
  });
  groupSelect.replaceChildren();
  filtered.forEach(header=>{
   const option=d.createElement('option');
   option.value=header.dataset.group;
   option.textContent=header.querySelector('span:nth-child(3)')?.textContent||header.dataset.group;
   groupSelect.append(option);
  });
  groupGo.disabled=!filtered.length;
  matchCount.textContent=filtered.length+'/'+groups.length;
  return filtered.length;
 }
 function refreshGroups(){
  groupSearch.value='';
  return filterGroups();
 }
 groupSearch.addEventListener('input',filterGroups);
 // P233: reversible, in-session folder navigation history. This is independent
 // of viewing/playback history and never writes a user's saved IPTV settings.
 const groupHistory=[];
 const forwardGroups=[]; // P236: in-session redo navigation, no persistence or playback
 let lastFocusedGroup='';
 let returningToHistory=false;
 // P247: show the keyboard-focused row index without replacing the native
 // source count. The label is presentation only, never a media action.
 const focusedPosition=d.createElement('output');
 focusedPosition.id='poFocusedPosition';
 focusedPosition.hidden=true;
 focusedPosition.setAttribute('aria-live','polite');
 focusedPosition.title='Vị trí trong danh sách kênh đang hiển thị';
 d.getElementById('channelMeta')?.after(focusedPosition);
 // P245: follow the focused row's group in the native picker without media changes.
 const syncFocusedGroupToPicker=()=>{
  if(lastFocusedGroup&&[...groupSelect.options].some(option=>option.value===lastFocusedGroup))
   groupSelect.value=lastFocusedGroup;
 };
 const focusList=d.getElementById('channelList');
 // P251: session-only bookmark of the most recently keyboard-focused channel.
 let lastVisitedRow=null;
 // P252: stable channel ID survives list re-render or hidden native filters.
 let lastVisitedChannelId=null;
 focusList?.addEventListener('focusin',event=>{
  const row=event.target.closest?.('.channel-item');
  if(!row)return;
  lastVisitedRow=row;
  lastVisitedChannelId=row.dataset.channelId||null;
  let header=row.previousElementSibling;
  while(header&&!header.matches('.folder-header'))header=header.previousElementSibling;
  lastFocusedGroup=header?.dataset.group||'';
  syncFocusedGroupToPicker();
  const visibleRows=[...focusList.querySelectorAll('.channel-item')];
  const index=visibleRows.indexOf(row)+1;
  focusedPosition.textContent=index>0?'Kênh '+index+'/'+visibleRows.length:'';
  focusedPosition.hidden=index<1;
 });
 // P250: hide the keyboard-focus position when focus leaves channel rows.
 // Retain the origin label while numeric-jump is open for Escape recovery.
 focusList?.addEventListener('focusout',event=>{
  if(!panel.hidden)return;
  if(event.relatedTarget instanceof Element&&focusList.contains(event.relatedTarget))return;
  focusedPosition.textContent='';
  focusedPosition.hidden=true;
 });
 const backRow=d.createElement('div');
 backRow.id='poChannelGroupHistoryRow';
 backRow.innerHTML='<button id="poChannelGroupBack" type="button" aria-label="Quay về nhóm kênh trước">↶ Nhóm trước</button><button id="poChannelGroupForward" type="button" aria-label="Tiến tới nhóm kênh vừa rời" hidden>↷ Nhóm sau</button><output id="poChannelGroupBackHint" aria-live="polite"></output>';
 status.before(backRow);
 const backButton=backRow.querySelector('#poChannelGroupBack');
 const forwardButton=backRow.querySelector('#poChannelGroupForward');
 backButton.setAttribute('aria-keyshortcuts','Alt+ArrowLeft');
 forwardButton.setAttribute('aria-keyshortcuts','Alt+ArrowRight');
 backButton.title='Về nhóm trước (Alt+←)';
 forwardButton.title='Tới nhóm sau (Alt+→)';
 const backHint=backRow.querySelector('#poChannelGroupBackHint');
 function updateBackRow(){
  // P235: never offer the current folder as its own Back destination.
  while(groupHistory.length&&groupHistory[groupHistory.length-1]===lastFocusedGroup)groupHistory.pop();
  while(forwardGroups.length&&forwardGroups[forwardGroups.length-1]===lastFocusedGroup)forwardGroups.pop();
  backRow.dataset.historyDepth=String(groupHistory.length);
  backRow.hidden=!groupHistory.length&&!forwardGroups.length;
  backButton.hidden=!groupHistory.length;
  forwardButton.hidden=!forwardGroups.length;
  backHint.textContent=groupHistory.length?groupHistory[groupHistory.length-1]:(forwardGroups.length?'Có thể tới nhóm sau':'');
 }
 backButton.addEventListener('click',()=>{
  const from=lastFocusedGroup;
  let previous='';
  while(groupHistory.length){
   const candidate=groupHistory.pop();
   if(candidate===lastFocusedGroup)continue; // skip stale self-references
   if(visibleHeaders().some(header=>header.dataset.group===candidate)){
    previous=candidate;break;
   }
  }
  if(!previous){updateBackRow();return;}
  if(from&&from!==previous){
   const old=forwardGroups.indexOf(from);
   if(old!==-1)forwardGroups.splice(old,1);
   forwardGroups.push(from);
   if(forwardGroups.length>10)forwardGroups.shift();
  }
  groupSearch.value='';
  filterGroups();
  groupSelect.value=previous;
  returningToHistory=true;
  try{jumpGroup();}finally{returningToHistory=false;}
  updateBackRow();
 });
 forwardButton.addEventListener('click',()=>{
  let next='';
  while(forwardGroups.length){
   const candidate=forwardGroups.pop();
   if(candidate===lastFocusedGroup)continue;
   if(visibleHeaders().some(header=>header.dataset.group===candidate)){
    next=candidate;break;
   }
  }
  if(!next){updateBackRow();return;}
  const from=lastFocusedGroup;
  if(from&&from!==next){
   const existing=groupHistory.indexOf(from);
   if(existing!==-1)groupHistory.splice(existing,1);
   groupHistory.push(from);
   if(groupHistory.length>10)groupHistory.shift();
  }
  groupSearch.value='';
  filterGroups();
  groupSelect.value=next;
  returningToHistory=true;
  try{jumpGroup();}finally{returningToHistory=false;}
  updateBackRow();
 });
 updateBackRow();
 function jumpGroup(){
  const group=groupSelect.value;
  const header=visibleHeaders().find(node=>node.dataset.group===group);
  if(!header){status.textContent='Không tìm thấy nhóm đang chọn.';return;}
  const count=Number(header.querySelector('.folder-size')?.textContent)||0;
  if(!count){status.textContent='Nhóm này chưa có kênh.';return;}
  let target=header.nextElementSibling;
  if(!target?.matches('.channel-item')){
   header.click(); // native collapsed-group toggle preserves its normal persistence.
   const fresh=visibleHeaders().find(node=>node.dataset.group===group);
   target=fresh?.nextElementSibling;
  }
  if(!target?.matches('.channel-item')){
   status.textContent='Không mở được danh sách kênh của nhóm.';return;
  }
  const list=d.getElementById('channelList');
  const box=list.getBoundingClientRect(),rect=target.getBoundingClientRect();
  list.scrollTop+=rect.top-box.top-(list.clientHeight-rect.height)/2;
  if(!returningToHistory&&lastFocusedGroup&&lastFocusedGroup!==group){
   forwardGroups.length=0; // new path invalidates redo, Back/Forward remain distinct
   const existing=groupHistory.indexOf(lastFocusedGroup);
   if(existing!==-1)groupHistory.splice(existing,1); // one entry per group in session
   groupHistory.push(lastFocusedGroup);
   if(groupHistory.length>10)groupHistory.shift();
  }
  target.focus({preventScroll:true});
  updateBackRow();
  status.textContent='Đã tới nhóm '+group+': '+count+' kênh. Nhấn Enter để phát kênh được chọn.';
 }
 groupGo.addEventListener('click',jumpGroup);
 groupSearch.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();if(!groupGo.disabled)jumpGroup();}
 });
 groupSelect.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();jumpGroup();}
 });
 function setOpen(open){
  if(open){
   const candidate=d.activeElement;
   jumpOriginRow=candidate?.matches?.('.channel-item')?candidate:null;
  }
  panel.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  if(open){
   const count=state.getChannels().length;
   refreshGroups();
   syncFocusedGroupToPicker();
   number.max=String(count);
   number.value='';
   status.textContent=count?'Có '+count+' kênh. Nhập số thứ tự để cuộn tới.':'Chưa có kênh để nhảy tới.';
   number.focus();
  }else toggle.focus();
 }
 function jump(){
  const channels=state.getChannels();
  const index=Number(number.value);
  if(!channels.length){status.textContent='Chưa có kênh để chọn.';return;}
  if(!number.value||!Number.isInteger(index)||index<1||index>channels.length){
   status.textContent='Nhập số từ 1 đến '+channels.length+'.';
   number.focus();
   return;
  }
  const search=d.getElementById('searchBox');
  if(search&&search.value){
   search.value='';
   search.dispatchEvent(new Event('input',{bubbles:true}));
  }
  const all=d.querySelector('#page-tv .filter-tab[data-filter="all"]');
  if(all&&!all.classList.contains('active'))all.click();
  const list=d.getElementById('channelList');
  if(!list){status.textContent='Không tìm thấy danh sách kênh.';return;}
  if(list.querySelectorAll('.channel-item').length<channels.length)
   d.getElementById('expandFolderBtn')?.click();
  const rows=[...list.querySelectorAll('.channel-item')];
  const target=rows[index-1];
  if(!target){
   status.textContent='Không tìm thấy kênh số '+index+' trong danh sách.';
   return;
  }
  // P227: scroll only #channelList, not the entire TV page.
  const listRect=list.getBoundingClientRect();
  const targetRect=target.getBoundingClientRect();
  list.scrollTop+=targetRect.top-listRect.top-(list.clientHeight-targetRect.height)/2;
  target.focus({preventScroll:true});
  const title=target.querySelector('.channel-text b')?.textContent||'';
  status.textContent='Đã tới kênh '+index+'/'+channels.length+': '+title+'. Chưa phát kênh.';
 }
 toggle.addEventListener('click',()=>setOpen(panel.hidden));
 go.addEventListener('click',jump);
 // P246: Ctrl+Enter goes to the requested channel and closes the jump tool,
 // restoring focus to the real channel row; normal Enter stays unchanged.
 number.title='Enter: đến kênh; Ctrl+Enter: đến kênh rồi thu gọn bảng';
 number.setAttribute('aria-keyshortcuts','Enter Control+Enter Meta+Enter');
 number.addEventListener('keydown',event=>{
  if(event.key!=='Enter')return;
  event.preventDefault();
  const quickClose=event.ctrlKey||event.metaKey;
  if(quickClose)event.stopPropagation();
  jump();
  if(quickClose){
   const row=d.activeElement;
   if(row?.matches?.('.channel-item')&&row.isConnected){
    setOpen(false);
    row.focus({preventScroll:true});
   }
  }
 });
 panel.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   event.preventDefault();
   // P249: cancellation returns to the row that opened the jump, not the
   // toolbar toggle; if no row originated it, preserve normal toggle focus.
   const origin=jumpOriginRow;
   setOpen(false);
   jumpOriginRow=null;
   if(origin?.isConnected&&origin.matches('.channel-item')&&origin.getClientRects().length)
    origin.focus({preventScroll:true});
  }
 });

 // P237: keyboard Back/Forward shortcuts work from a focused channel row
 // without starting video. Text inputs keep their native editing keys.
 const historyShortcut=event=>{
  if(!event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||
     (event.key!=='ArrowLeft'&&event.key!=='ArrowRight'))return false;
  if(!d.getElementById('page-tv')?.classList.contains('active-page')||panel.hidden)return false;
  if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return false;
  const control=event.key==='ArrowLeft'?backButton:forwardButton;
  if(control.hidden||backRow.hidden)return false;
  event.preventDefault();
  event.stopPropagation();
  control.click();
  return true;
 };

 // P5.1.228 — Keyboard-only traversal of existing channel rows.
 // Focus never starts playback: Enter/Space remain native playback actions.
 const channelList=d.getElementById('channelList');
 if(channelList){
  channelList.setAttribute('aria-label','Danh sách kênh, dùng lên/xuống để duyệt; trái/phải để chuyển nhóm; Home, End, Page Up và Page Down để nhảy vị trí');
  // P241: The native favorites tab is hidden under compact filters.
  // Show a directly actionable current-filter chip for keyboard users.
  const searchArea=d.querySelector('#page-tv .filter-box');
  if(searchArea){
   const chip=d.createElement('button');chip.type='button';
   chip.id='poFavoriteFilterChip';chip.className='po-favorite-filter-chip';chip.hidden=true;
   const label=d.createElement('span'),clear=d.createElement('strong');
   clear.textContent='Xem tất cả';chip.append(label,clear);searchArea.after(chip);
   const syncFavoriteChip=()=>{
    // P242: compact filters other than favorites can hide the entire list;
    // always identify the active native tab and offer one-click recovery.
    const activeTab=[...d.querySelectorAll('#page-tv .filter-tab')].find(tab=>tab.classList.contains('active'));
    const mode=activeTab?.dataset.filter||'all';
    chip.dataset.mode=mode;
    chip.hidden=mode==='all';
    // P243: make the empty recent-filter chip keyboard-reversible.
    if(mode==='recent'){chip.setAttribute('aria-keyshortcuts','Shift+R');chip.title='Nhấn Shift+R để xem tất cả';}
    else{chip.removeAttribute('aria-keyshortcuts');chip.removeAttribute('title');}
    if(chip.hidden)return;
    const count=Number(d.getElementById('channelMeta')?.textContent?.match(/^\s*(\d+)/)?.[1]||0);
    const title=(activeTab?.textContent||'Đang lọc').trim();
    label.textContent=title+' · '+count;
    chip.setAttribute('aria-label','Đang lọc '+count+' kênh: '+title+'. Nhấn để xem tất cả.');
   };
   chip.addEventListener('click',()=>{
    d.querySelector('#page-tv .filter-tab[data-filter="all"]')?.click();
    syncFavoriteChip();
    (channelList.querySelector('.channel-item')||d.getElementById('searchBox'))?.focus({preventScroll:true});
   });
   new MutationObserver(syncFavoriteChip).observe(channelList,{childList:true});
   syncFavoriteChip();
  }
  // P230: jump only between visible group boundaries, never touch playback.
  const groupBoundaryTarget=(row,direction)=>{
   let group=row.previousElementSibling;
   while(group&&!group.matches('.folder-header'))group=group.previousElementSibling;
   if(!group)return row;
   const headers=[...channelList.querySelectorAll('.folder-header')];
   for(let i=headers.indexOf(group)+direction;i>=0&&i<headers.length;i+=direction){
    const candidate=headers[i].nextElementSibling;
    if(candidate?.matches('.channel-item'))return candidate;
   }
   return row;
  };
  channelList.addEventListener('keydown',event=>{
   if(historyShortcut(event))return;
   // P239: Escape closes the jump panel from a channel row without playback
   // and restores focus to that same row after setOpen focuses the toggle.
   if(event.key==='Escape'&&!panel.hidden&&!event.altKey&&!event.ctrlKey&&!event.metaKey){
    const row=event.target;
    if(row instanceof HTMLElement&&row.matches('.channel-item')){
     event.preventDefault();event.stopPropagation();
     setOpen(false);
     if(row.isConnected)row.focus({preventScroll:true});
     return;
    }
   }
   // P244: direct numeric jump from a keyboard-focused channel row.
   if(!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&
      /^[0-9]$/.test(event.key)&&event.target instanceof HTMLElement&&
      event.target.matches('.channel-item')){
    event.preventDefault();event.stopPropagation();
    setOpen(true);
    number.value=event.key;
    status.textContent='Đang nhập số kênh '+event.key+'. Nhập tiếp hoặc Enter để nhảy; Escape để huỷ.';
    return;
   }
   if(event.altKey||event.ctrlKey||event.metaKey)return;
   const keys=['ArrowUp','ArrowDown','Home','End','PageUp','PageDown','ArrowLeft','ArrowRight'];
   // P240: Shift+F is a filter shortcut, not an accidental favorite toggle.
   const quickFavorites=(event.key==='f'||event.key==='F')&&event.shiftKey;
   const quickRecent=(event.key==='r'||event.key==='R')&&event.shiftKey;
   const favoriteKey=(event.key==='f'||event.key==='F')&&!event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey;
   if(!favoriteKey&&!quickFavorites&&!quickRecent&&!keys.includes(event.key))return;
   const current=event.target;
   if(!(current instanceof HTMLElement)||!current.matches('.channel-item'))return;
   if(quickFavorites){
    const fav=d.querySelector('#page-tv .filter-tab[data-filter="fav"]');
    const all=d.querySelector('#page-tv .filter-tab[data-filter="all"]');
    if(!fav||!all)return;
    event.preventDefault();event.stopPropagation();
    const returnToAll=fav.classList.contains('active');
    (returnToAll?all:fav).click(); // native list filter, no persistence mutation
    const first=channelList.querySelector('.channel-item');
    (first||d.getElementById('searchBox'))?.focus({preventScroll:true});
    status.textContent=returnToAll?'Đang xem tất cả kênh.':'Đang lọc các kênh yêu thích. Nhấn Shift+F để xem tất cả.';
    return;
   }
   if(quickRecent){
    // P243: switch to the recent filter without opening playback.
    const recent=d.querySelector('#page-tv .filter-tab[data-filter="recent"]');
    const all=d.querySelector('#page-tv .filter-tab[data-filter="all"]');
    if(!recent||!all)return;
    event.preventDefault();event.stopPropagation();
    const returnToAll=recent.classList.contains('active');
    (returnToAll?all:recent).click();
    const first=channelList.querySelector('.channel-item');
    if(first)first.focus({preventScroll:true});
    else{
     const chip=d.getElementById('poFavoriteFilterChip');
     if(chip){chip.hidden=false;chip.focus({preventScroll:true});}
    }
    status.textContent=returnToAll?'Đang xem tất cả kênh.':'Đang lọc kênh vừa xem. Nhấn Shift+R để xem tất cả.';
    return;
   }
   if(favoriteKey){
    const star=current.querySelector('.channel-star');
    if(!star)return;
    event.preventDefault();
    event.stopPropagation();
    const wasFavorite=star.getAttribute('aria-pressed')==='true';
    const id=current.dataset.channelId;
    // Invoke native favorite logic, including its save, feedback and syncing.
    // A plain F key must never trigger the channel's playback handler.
    star.click();
    const replacement=[...channelList.querySelectorAll('.channel-item')]
      .find(row=>row.dataset.channelId===id);
    if(replacement)replacement.focus({preventScroll:true});
    else (channelList.querySelector('.channel-item')||d.getElementById('searchBox'))?.focus({preventScroll:true});
    const title=current.querySelector('.channel-text b')?.textContent||'kênh';
    status.textContent=(wasFavorite?'Đã bỏ':'Đã thêm')+' yêu thích: '+title+'. Nhấn F để đảo lại.';
    return;
   }
   const rows=[...channelList.querySelectorAll('.channel-item')];
   const index=rows.indexOf(current);
   if(index<0)return;
   event.preventDefault();
   event.stopPropagation();
   const pageSize=Math.max(1,Math.floor(channelList.clientHeight/Math.max(35,current.getBoundingClientRect().height)));
   const groupMove=event.key==='ArrowLeft'||event.key==='ArrowRight';
   const targetIndex=groupMove?rows.indexOf(groupBoundaryTarget(current,event.key==='ArrowRight'?1:-1)):
    event.key==='Home'?0:event.key==='End'?rows.length-1:
    event.key==='ArrowDown'?Math.min(rows.length-1,index+1):
    event.key==='ArrowUp'?Math.max(0,index-1):
    event.key==='PageDown'?Math.min(rows.length-1,index+pageSize):
    Math.max(0,index-pageSize);
   const next=rows[targetIndex];
   const listRect=channelList.getBoundingClientRect();
   const nextRect=next.getBoundingClientRect();
   if(nextRect.top<listRect.top)channelList.scrollTop+=nextRect.top-listRect.top;
   else if(nextRect.bottom>listRect.bottom)channelList.scrollTop+=nextRect.bottom-listRect.bottom;
   next.focus({preventScroll:true});
   const name=next.querySelector('.channel-text b')?.textContent||'';
   status.textContent=(groupMove?'Đã chuyển nhóm. ':'')+'Đang chọn '+(targetIndex+1)+'/'+rows.length+': '+name+'. Nhấn Enter để phát.';
  });
 }
 d.addEventListener('keydown',event=>{
  if(historyShortcut(event))return;
  // P238: global group/jump shortcuts must not hijack text editing.
  // History shortcuts above already guard inputs; keep the same protection
  // for Alt+G and Alt+J, including native selects and contenteditable fields.
  if(event.defaultPrevented||event.isComposing||event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
  // P251: Alt+Shift+L resumes keyboard browsing at the last focused row,
  // even after visiting toolbar controls. Does not change playback or data.
  if(event.altKey&&event.shiftKey&&!event.ctrlKey&&!event.metaKey&&
     event.key.toLowerCase()==='l'&&panel.hidden){
   const list=focusList;
   if(!list||(!lastVisitedChannelId&&!lastVisitedRow))return;
   // P254: cross-page return to last focused channel with no autoplay.
   const tvPage=d.getElementById('page-tv');
   const returnFromAnotherPage=!tvPage?.classList.contains('active-page');
   if(returnFromAnotherPage)state.setPage('tv');
   if(!tvPage?.classList.contains('active-page'))return;
   // P252: if favorite/recent filters rebuilt the list, restore the
   // previous channel by its stable ID, expanding only the view filter.
   const available=row=>row?.isConnected&&row.matches('.channel-item')&&row.getClientRects().length;
   let row=lastVisitedRow,restoredAll=false;
   if(!available(row)&&lastVisitedChannelId){
    row=[...list.querySelectorAll('.channel-item')].find(el=>el.dataset.channelId===lastVisitedChannelId);
    if(!available(row)){
     const all=d.querySelector('#page-tv .filter-tab[data-filter="all"]');
     if(all&&!all.classList.contains('active')){
      all.click();restoredAll=true;
     }
     row=[...list.querySelectorAll('.channel-item')].find(el=>el.dataset.channelId===lastVisitedChannelId);
    }
   }
   if(!available(row))return;
   event.preventDefault();event.stopPropagation();
   // P253: center the restored row with context above and below it.
   // Native scrollTop clamps at the list edges; never scroll the main page.
   const box=list.getBoundingClientRect(),rect=row.getBoundingClientRect();
   list.scrollTop+=rect.top-box.top-(list.clientHeight-rect.height)/2;
   row.focus({preventScroll:true});
   const index=[...list.querySelectorAll('.channel-item')].indexOf(row)+1;
   status.textContent=(returnFromAnotherPage?'Đã về trang TV. ':'')+(restoredAll?'Đã xem tất cả để quay lại. ':'')+'Đã quay lại kênh '+index+'. Nhấn Enter để phát.';
   return;
  }
  // P243: when recent history is empty there are no channel rows to focus.
  // Shift+R on its visible status chip must still restore the full list.
  if(event.shiftKey&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&
     (event.key==='R'||event.key==='r')&&
     event.target===d.getElementById('poFavoriteFilterChip')&&
     d.querySelector('#page-tv .filter-tab[data-filter="recent"]')?.classList.contains('active')){
   event.preventDefault();event.stopPropagation();
   d.querySelector('#page-tv .filter-tab[data-filter="all"]')?.click();
   channelList?.querySelector('.channel-item')?.focus({preventScroll:true});
   return;
  }
  if(event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.key.toLowerCase()==='g'&&
   d.getElementById('page-tv')?.classList.contains('active-page')){
   event.preventDefault();
   setOpen(true);
   refreshGroups();
   groupSearch.focus();
   return;
  }
  // P248: Alt+Shift+J opens with the currently focused row's number.
  // Plain Alt+J keeps its existing blank-input behavior.
  if(event.altKey&&!event.ctrlKey&&!event.metaKey&&event.key.toLowerCase()==='j'&&
   d.getElementById('page-tv')?.classList.contains('active-page')){
   const row=event.target instanceof HTMLElement&&event.target.matches('.channel-item')?event.target:null;
   const selectedIndex=row&&channelList?[...channelList.querySelectorAll('.channel-item')].indexOf(row)+1:0;
   event.preventDefault();
   setOpen(true);
   if(event.shiftKey&&selectedIndex>0){
    number.value=String(selectedIndex);
    status.textContent='Đang chọn kênh '+selectedIndex+'. Sửa số rồi Enter để nhảy, Ctrl+Enter để nhảy và thu gọn.';
   }
  }
 });
 groupSelect.setAttribute('aria-keyshortcuts','Alt+G');
 groupSelect.title='Chọn nhóm kênh nhanh (Alt+G)';
 toggle.setAttribute('aria-keyshortcuts','Alt+J Alt+Shift+J');
 toggle.title='Alt+J: nhập số kênh; Alt+Shift+J: điền số hàng kênh đang chọn; Alt+Shift+L: trở lại kênh vừa duyệt';
 window.OpenIPTVPositronChannelJump=Object.freeze({open:()=>setOpen(true)});
})();
