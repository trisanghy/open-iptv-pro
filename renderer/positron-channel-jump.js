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
 function setOpen(open){
  panel.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  if(open){
   const count=state.getChannels().length;
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
 number.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();jump();}
 });
 panel.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();setOpen(false);}
 });

 // P5.1.228 — Keyboard-only traversal of existing channel rows.
 // Focus never starts playback: Enter/Space remain native playback actions.
 const channelList=d.getElementById('channelList');
 if(channelList){
  channelList.setAttribute('aria-label','Danh sách kênh, dùng lên/xuống để duyệt; trái/phải để chuyển nhóm; Home, End, Page Up và Page Down để nhảy vị trí');
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
   const keys=['ArrowUp','ArrowDown','Home','End','PageUp','PageDown','ArrowLeft','ArrowRight'];
   const favoriteKey=(event.key==='f'||event.key==='F')&&!event.ctrlKey&&!event.altKey&&!event.metaKey;
   if(!favoriteKey&&!keys.includes(event.key))return;
   const current=event.target;
   if(!(current instanceof HTMLElement)||!current.matches('.channel-item'))return;
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
  if(event.altKey&&!event.ctrlKey&&!event.metaKey&&event.key.toLowerCase()==='j'&&
   d.getElementById('page-tv')?.classList.contains('active-page')){
   event.preventDefault();
   setOpen(true);
  }
 });
 toggle.setAttribute('aria-keyshortcuts','Alt+J');
 toggle.title='Nhảy tới kênh theo số (Alt+J)';
 window.OpenIPTVPositronChannelJump=Object.freeze({open:()=>setOpen(true)});
})();
