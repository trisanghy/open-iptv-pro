'use strict';
/* Touch-only drag sorting for the Web player.
 * Existing desktop pointer + HTML5 drag support stays in app.js.
 * Touch works in mobile and desktop-site layouts; logo/folder icon is a drag handle.
 * Short taps play/open, swipes scroll, and nested action buttons remain intact. */
(function(w,d){
 const api=w.IPTVState,order=w.OpenIPTVChannelOrder;
 const channelList=d.getElementById('channelList'),folderManager=d.getElementById('folderManager');
 if(!api||!order||!channelList)return;
 const isMobile=()=>d.documentElement?.dataset?.iptvDevice==='mobile';
 const canEdit=()=>w.IPTVProAdvanced?.canEdit?.()!==false;
 const selector='#channelList .folder-header[data-group],#folderManager .folder-card[data-group],#channelList .channel-item[data-channel-id]';
 const HOLD_MS=500;
 const HANDLE_HOLD_MS=180;
 const handleSelector='.chan-logo,.folder-emoji,#folderManager .folder-card h3';
 const markTouch=()=>{
  d.documentElement.classList.add('web-touch-capable');
  const hint=d.querySelector('#page-tv .channel-drag-hint');
  if(hint)hint.textContent='↕ Giữ logo kênh / biểu tượng thư mục rồi kéo để sắp xếp; kéo kênh vào thư mục khác để chuyển. Vuốt phần tên để cuộn.';
 };
 if(w.navigator?.maxTouchPoints>0||w.matchMedia?.('(any-pointer: coarse)')?.matches)markTouch();
 const CANCEL_SLOP=14;
 let gesture=null,ghost=null,highlight=null,scrollFrame=0,suppressClickUntil=0,suppressClickSource=null;
 // No extra drag icons: long press anywhere on a channel or folder.
 // A short tap retains the existing play/expand behavior; normal scroll cancels
 // the pending hold. Use cancellable touchmove for reliable iPhone Safari drag.
 const decorate=()=>{};
 const touchAt=(event,id)=>Array.from(event.changedTouches||[]).find(t=>t.identifier===id)||null;
 function dragSource(element){
  const row=element?.closest?.(selector);
  if(!row)return null;
  if(!channelList.contains(row)&&!folderManager?.contains(row))return null;
  const interactive=element.closest('button,a,input,select,textarea,label,[contenteditable="true"]');
  // The folder header itself is a button and must be a draggable surface.
  if(interactive&&interactive!==row)return null;
  return row;
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
  const g=gesture;if(!g||g.started||!g.source.isConnected)return;
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
  if(!target||!target.isConnected)return;
  const isRow=target.classList.contains('channel-item');
  if(g.kind==='folder'&&isRow)return;
  const group=target.dataset.group;
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
  const list=gesture?.source?.closest('#folderManager')||channelList;
  for(let node=list;node&&node!==d.body;node=node.parentElement){
   const style=w.getComputedStyle(node);
   if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+5)return node;
  }
  return d.scrollingElement||d.documentElement;
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
 d.addEventListener('touchstart',e=>{
  if(gesture){if(e.touches.length!==1)reset();return;}
  if(e.touches.length!==1)return;
  markTouch();
  suppressClickUntil=0;
  const source=dragSource(e.target);
  if(!source)return;
  const touch=e.changedTouches[0];
  const kind=source.classList.contains('channel-item')?'channel':'folder';
  const id=kind==='channel'?source.dataset.channelId:source.dataset.group;
  if(!id||(kind==='folder'&&d.getElementById('searchBox')?.value?.trim()))return;
  const handle=!!e.target.closest(handleSelector);
  gesture={identifier:touch.identifier,source,kind,id,handle,x:touch.clientX,y:touch.clientY,
   lastX:touch.clientX,lastY:touch.clientY,started:false,drop:null,timer:0};
  gesture.timer=w.setTimeout(startDrag,handle?HANDLE_HOLD_MS:HOLD_MS);
 },{capture:true,passive:true});
 function handleActiveDragMove(e){
  const g=gesture;if(!g?.started)return;
  if(e.touches.length!==1){reset();return;}
  const touch=touchAt(e,g.identifier);if(!touch)return;
  g.lastX=touch.clientX;g.lastY=touch.clientY;
  if(e.cancelable)e.preventDefault();
  positionGhost(touch.clientX,touch.clientY);dropTarget(touch.clientX,touch.clientY);
  if(!scrollFrame)scrollFrame=w.requestAnimationFrame(scrollStep);
 }
 // Install a non-passive listener before the gesture begins: Safari can
 // otherwise commit to native scrolling before a late listener is attached.
 d.addEventListener('touchmove',e=>{
  const g=gesture;if(!g)return;
  if(e.touches.length!==1){reset();return;}
  const touch=touchAt(e,g.identifier);if(!touch)return;
  g.lastX=touch.clientX;g.lastY=touch.clientY;
  if(!g.started){
   const distance=Math.hypot(g.lastX-g.x,g.lastY-g.y);
   if(g.handle&&distance>=6)startDrag();
   else if(distance>CANCEL_SLOP){reset();return;}
  }
  if(gesture?.started)handleActiveDragMove(e);
 },{capture:true,passive:false});
 d.addEventListener('touchend',e=>{
  const g=gesture;if(!g)return;
  const touch=touchAt(e,g.identifier);if(!touch)return;
  const finished=g.started,id=g.id,kind=g.kind,source=g.source;
  // Re-evaluate the drop where the finger was released, including after auto-scroll.
  if(finished)dropTarget(touch.clientX,touch.clientY);
  const drop=g.drop;
  reset();
  if(!finished)return;
  if(e.cancelable)e.preventDefault();
  suppressClickUntil=Date.now()+900;suppressClickSource=source;
  if(drop){if(kind==='channel')commitChannel(id,drop);else commitFolder(id,drop);}
 },{capture:true,passive:false});
 d.addEventListener('touchcancel',reset,true);
 d.addEventListener('contextmenu',e=>{
  if(gesture&&gesture.source.contains(e.target)){e.preventDefault();e.stopPropagation();}
 },true);
 w.addEventListener('blur',reset);
 // Long-press release must not subsequently play a channel or collapse a folder.
 d.addEventListener('click',e=>{
  if(Date.now()>=suppressClickUntil)return;
  const source=e.target?.closest?.(selector);
  if(source&&(
   source===suppressClickSource||
   source.dataset.channelId===suppressClickSource?.dataset?.channelId&&!!source.dataset.channelId||
   source.dataset.group===suppressClickSource?.dataset?.group&&!!source.dataset.group
  )){
   e.preventDefault();e.stopImmediatePropagation();suppressClickUntil=0;
  }
 },true);
 // Route vertical swipes starting in the fixed channel header to the PAGE,
 // never to the channel list or panel. Native horizontal filter swipes remain.
 let headerSwipe=null;
 const headerZone='.channel-panel .panel-header,.channel-panel .filter-box,.channel-panel .folder-actions,.channel-panel .filter-tabs';
 function pageScrollTarget(el){
  for(let node=el?.parentElement;node&&node!==d.body;node=node.parentElement){
   if(node.matches?.('.channel-panel,#channelList'))continue;
   const style=w.getComputedStyle(node);
   if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+3)return node;
  }
  return d.scrollingElement||d.documentElement;
 }
 d.addEventListener('touchstart',e=>{
  if(!isMobile()||e.touches.length!==1||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  const zone=e.target.closest(headerZone);
  if(!zone||!d.getElementById('page-tv')?.contains(zone))return;
  const t=e.touches[0];
  headerSwipe={id:t.identifier,x:t.clientX,y:t.clientY,lastY:t.clientY,
   axis:null,scroll:pageScrollTarget(zone),filter:!!e.target.closest('.filter-tabs')};
 },{capture:true,passive:true});
 d.addEventListener('touchmove',e=>{
  const g=headerSwipe;if(!g)return;
  const t=touchAt(e,g.id);if(!t)return;
  const dx=t.clientX-g.x,dy=t.clientY-g.y;
  if(!g.axis&&Math.hypot(dx,dy)>7)g.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';
  if(g.axis==='x'){headerSwipe=null;return;}
  if(g.axis!=='y')return;
  const delta=g.lastY-t.clientY;g.lastY=t.clientY;
  const port=g.scroll;
  if(port&&Math.abs(delta)>.1){
   if(e.cancelable)e.preventDefault();
   port.scrollTop+=delta;
  }
 },{capture:true,passive:false});
 d.addEventListener('touchend',e=>{if(headerSwipe&&touchAt(e,headerSwipe.id))headerSwipe=null;},{capture:true,passive:true});
 d.addEventListener('touchcancel',()=>{headerSwipe=null;},true);
 w.OpenIPTVMobileTouchSort=Object.freeze({decorate,commitChannel,commitFolder,isMobile});
})(window,document);
