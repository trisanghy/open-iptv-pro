'use strict';
/* Touch-only drag sorting for the Web player.
 * Existing desktop pointer + HTML5 drag support stays in app.js.
 * On iOS/Android only the dedicated grip captures touch, so scrolling the
 * channel list, tapping a channel and tapping Favorite work normally. */
(function(w,d){
 const api=w.IPTVState,order=w.OpenIPTVChannelOrder;
 const channelList=d.getElementById('channelList'),folderManager=d.getElementById('folderManager');
 if(!api||!order||!channelList)return;
 const isMobile=()=>d.documentElement?.dataset?.iptvDevice==='mobile';
 const canEdit=()=>w.IPTVProAdvanced?.canEdit?.()!==false;
 const ICON='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/><circle cx="3" cy="7" r=".6" fill="currentColor"/><circle cx="3" cy="12" r=".6" fill="currentColor"/><circle cx="3" cy="17" r=".6" fill="currentColor"/></svg>';
 const selector='#channelList .folder-header[data-group],#folderManager .folder-card[data-group],#channelList .channel-item[data-channel-id]';
 let gesture=null,ghost=null,highlight=null,scrollFrame=0,suppressClickUntil=0,suppressClickSource=null;
 function decorate(){
  if(!isMobile())return;
  for(const row of channelList.querySelectorAll('.channel-item[data-channel-id]')){
   const grip=row.querySelector('.channel-move');
   if(!grip||grip.dataset.touchSort)return;
   grip.dataset.touchSort='channel';grip.innerHTML=ICON;
   grip.title='Chạm để chọn thư mục · giữ rồi kéo để sắp xếp kênh';
   grip.setAttribute('aria-label','Chuyển hoặc kéo để sắp xếp kênh');
  }
  for(const root of [channelList,folderManager].filter(Boolean)){
   for(const item of root.querySelectorAll(root===channelList?'.folder-header[data-group]':'.folder-card[data-group]')){
    if(item.querySelector('.folder-sort-grip'))continue;
    const handle=d.createElement('span');
    handle.className='folder-sort-grip';handle.dataset.touchSort='folder';
    handle.tabIndex=0;handle.setAttribute('role','button');handle.setAttribute('aria-label','Giữ và kéo để sắp xếp thư mục '+item.dataset.group);
    handle.title='Giữ và kéo để sắp xếp thư mục';handle.innerHTML=ICON;
    if(item.classList.contains('folder-header'))item.insertBefore(handle,item.querySelector('.folder-size')||null);
    else item.insertBefore(handle,item.firstChild);
   }
  }
 }
 function reset(){
  if(gesture?.timer)w.clearTimeout(gesture.timer);
  gesture?.source?.classList.remove('touch-sorting');
  if(highlight){highlight.classList.remove('touch-sort-before','touch-sort-after','touch-sort-into');highlight=null;}
  if(ghost){ghost.remove();ghost=null;}
  if(scrollFrame){w.cancelAnimationFrame(scrollFrame);scrollFrame=0;}
  gesture=null;
 }
 function startDrag(){
  const g=gesture;if(!g||g.started||!isMobile())return;
  if(!canEdit()){api.toast('Hồ sơ trẻ em không được thay đổi thứ tự','warn');reset();return;}
  g.started=true;g.source.classList.add('touch-sorting');
  ghost=d.createElement('div');ghost.className='web-touch-sort-ghost';
  ghost.textContent=g.kind==='channel'?(api.getStore().channels.find(c=>c.id===g.id)?.name||'Kênh'):g.id;
  ghost.setAttribute('aria-hidden','true');d.body.append(ghost);
  positionGhost(g.lastX,g.lastY);
  if(w.navigator?.vibrate)try{w.navigator.vibrate(12);}catch{}
 }
 function positionGhost(x,y){if(ghost){ghost.style.left=(x+12)+'px';ghost.style.top=(y+12)+'px';}}
 function dropTarget(x,y){
  const target=d.elementFromPoint(x,y)?.closest?.(selector)||null;
  const g=gesture;if(!g)return;
  if(highlight){highlight.classList.remove('touch-sort-before','touch-sort-after','touch-sort-into');highlight=null;}
  g.drop=null;
  if(!target)return;
  const isRow=target.classList.contains('channel-item');
  if(g.kind==='folder'&&isRow)return;
  const group=isRow?target.dataset.group:target.dataset.group;
  const store=api.getStore();
  const available=new Set([...store.groupOrder,...store.folders,...store.channels.map(c=>order.groupOf(c))]);
  if(!available.has(group))return;
  if(g.kind==='folder'&&group===g.id)return;
  if(g.kind==='channel'&&isRow&&target.dataset.channelId===g.id)return;
  if(g.kind==='folder'&&d.getElementById('searchBox')?.value?.trim())return;
  const bounds=target.getBoundingClientRect();
  const after=isRow||g.kind==='folder'?y>bounds.top+bounds.height/2:false;
  target.classList.add(isRow||g.kind==='folder'?(after?'touch-sort-after':'touch-sort-before'):'touch-sort-into');
  highlight=target;
  g.drop={kind:g.kind,group,anchorId:isRow?target.dataset.channelId:'',after};
 }
 function scrollPort(){
  const list=channelList;
  if(list.scrollHeight>list.clientHeight+5)return list;
  return d.querySelector('#page-tv .content, .content')||list;
 }
 function scrollStep(){
  scrollFrame=0;const g=gesture;if(!g?.started)return;
  const scroll=scrollPort(),r=scroll.getBoundingClientRect(),y=g.lastY;
  let amount=0;
  if(y>r.bottom-42&&y<r.bottom+30)amount=17;
  else if(y<r.top+42&&y>r.top-30)amount=-17;
  if(amount){scroll.scrollTop+=amount;dropTarget(g.lastX,g.lastY);}
  scrollFrame=w.requestAnimationFrame(scrollStep);
 }
 function commitChannel(id,drop){
  const store=api.getStore(),channel=store.channels.find(c=>c.id===id);
  if(!channel||!drop)return false;
  const beforeOrder=Object.fromEntries(Object.entries(store.channelOrder||{}).map(([name,ids])=>[name,[...ids]]));
  const beforeGroups=new Map(store.channels.map(c=>[c.id,c.group]));
  const beforeCollapsed=[...store.collapsedGroups];
  try{
   const moved=order.move(store,[id],drop.group,{anchorId:drop.anchorId,after:drop.after});
   if(!moved)return false;
   store.collapsedGroups=store.collapsedGroups.filter(g=>g!==drop.group);
   if(!api.save())throw Error('Không đủ bộ nhớ để lưu thứ tự kênh');
   api.render(true);api.toast('Đã chuyển/sắp xếp kênh: '+channel.name);return true;
  }catch(e){
   store.channelOrder=beforeOrder;
   store.collapsedGroups=beforeCollapsed;
   for(const ch of store.channels)ch.group=beforeGroups.get(ch.id);
   api.render(true);api.toast('Không lưu được thay đổi: '+String(e.message||e),'warn');return false;
  }
 }
 function commitFolder(id,drop){
  const store=api.getStore(),old=Array.isArray(store.groupOrder)?[...store.groupOrder]:[];
  if(!drop||id===drop.group)return false;
  const from=old.indexOf(id),to=old.indexOf(drop.group);
  if(from<0||to<0)return false;
  const next=old.filter(g=>g!==id),pos=next.indexOf(drop.group)+(drop.after?1:0);
  next.splice(pos,0,id);
  if(next.every((g,i)=>old[i]===g))return false;
  store.groupOrder=next;
  if(!api.save()){
   store.groupOrder=old;api.toast('Không lưu được thứ tự thư mục; dữ liệu cũ được giữ lại','warn');return false;
  }
  api.render(true);api.toast('Đã sắp xếp thư mục: '+id);return true;
 }
 d.addEventListener('pointerdown',e=>{
  if(!isMobile()||e.pointerType!=='touch'||e.isPrimary===false||gesture)return;
  const grip=e.target.closest?.('[data-touch-sort]');
  if(!grip||!channelList.contains(grip)&&!folderManager?.contains(grip))return;
  const row=grip.closest('.channel-item[data-channel-id],.folder-header[data-group],.folder-card[data-group]');
  if(!row)return;
  const kind=grip.dataset.touchSort;
  const id=kind==='channel'?row.dataset.channelId:row.dataset.group;
  if(!id)return;
  gesture={pointerId:e.pointerId,grip,source:row,kind,id,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,started:false,drop:null,timer:0};
  try{grip.setPointerCapture(e.pointerId);}catch{}
  gesture.timer=w.setTimeout(startDrag,280);
 },true);
 d.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||e.pointerId!==g.pointerId)return;
  g.lastX=e.clientX;g.lastY=e.clientY;
  if(!g.started){
   if(Math.hypot(g.lastX-g.x,g.lastY-g.y)>14)reset();
   return;
  }
  if(e.cancelable)e.preventDefault();
  positionGhost(e.clientX,e.clientY);dropTarget(e.clientX,e.clientY);
  if(!scrollFrame)scrollFrame=w.requestAnimationFrame(scrollStep);
 },{capture:true,passive:false});
 d.addEventListener('pointerup',e=>{
  const g=gesture;if(!g||e.pointerId!==g.pointerId)return;
  const finished=g.started,id=g.id,kind=g.kind,drop=g.drop,source=g.grip;
  reset();
  if(!finished)return;
  if(e.cancelable)e.preventDefault();
  suppressClickUntil=Date.now()+800;suppressClickSource=source;
  if(drop){if(kind==='channel')commitChannel(id,drop);else commitFolder(id,drop);}
 },true);
 d.addEventListener('pointercancel',reset,true);
 w.addEventListener('blur',reset);
 d.addEventListener('click',e=>{
  const grip=e.target?.closest?.('[data-touch-sort]');
  if(!grip)return;
  if(grip.classList.contains('folder-sort-grip')||Date.now()<suppressClickUntil&&grip===suppressClickSource){
   e.preventDefault();e.stopImmediatePropagation();
  }
 },true);
 d.addEventListener('keydown',e=>{
  if(e.target.closest?.('.folder-sort-grip')&&['Enter',' '].includes(e.key)){e.preventDefault();}
 },true);
 const observer=new MutationObserver(decorate);
 observer.observe(channelList,{childList:true});
 if(folderManager)observer.observe(folderManager,{childList:true});
 decorate();
 w.OpenIPTVMobileTouchSort=Object.freeze({decorate,commitChannel,commitFolder,isMobile});
})(window,document);
