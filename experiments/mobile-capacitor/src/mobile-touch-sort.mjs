// Mobile Web-parity long-press sorting: 800 ms hold, scroll/swipe safe.
// Works only within #channelList; channel play/favorite controls stay independent.
export function installChannelTouchSort({list,doc=globalThis.document,win=globalThis.window,onMoveChannel,onMoveFolder,onStatus=()=>{}}={}){
 if(!list||!doc||!win)return ()=>{};
 const selector='.channel[data-order-key],.folder-heading[data-order-group]';
 const HOLD=800,SLOP=14;
 let gesture=null,ghost=null,highlight=null,frame=0,suppressed=null,suppressUntil=0;
 const touchOf=(event,id)=>Array.from(event.changedTouches||[]).find(t=>t.identifier===id);
 const sourceFor=element=>{
  const row=element?.closest?.(selector);
  if(!row||!list.contains(row))return null;
  const control=element.closest?.('button,a,input,select,textarea,label,[contenteditable="true"]');
  if(control&&control!==row)return null;
  return row;
 };
 function unmark(){
  highlight?.classList.remove('sort-before','sort-after','sort-into');
  highlight=null;
 }
 function cleanup(){
  if(gesture?.timer)win.clearTimeout(gesture.timer);
  gesture?.source?.classList.remove('sort-dragging');
  unmark();ghost?.remove();ghost=null;
  if(frame)win.cancelAnimationFrame?.(frame);
  frame=0;gesture=null;
 }
 function ghostPosition(x,y){if(ghost){ghost.style.left=(x+12)+'px';ghost.style.top=(y+12)+'px';}}
 function begin(){
  if(!gesture||gesture.started)return;
  gesture.started=true;gesture.source.classList.add('sort-dragging');
  ghost=doc.createElement('div');ghost.className='mobile-sort-ghost';ghost.textContent=gesture.label;
  ghost.setAttribute('aria-hidden','true');doc.body.append(ghost);
  ghostPosition(gesture.x,gesture.y);
  try{win.navigator?.vibrate?.(12);}catch{}
 }
 function targetAt(x,y){
  unmark();if(!gesture)return;
  gesture.drop=null;
  const target=doc.elementFromPoint?.(x,y)?.closest?.(selector);
  if(!target||!list.contains(target)||target===gesture.source)return;
  const isChannel=!!target.dataset.orderKey;
  if(gesture.kind==='folder'&&isChannel)return;
  if(isChannel&&gesture.kind==='channel'&&gesture.key===target.dataset.orderKey)return;
  const bounds=target.getBoundingClientRect();
  const after=y>bounds.top+bounds.height/2;
  const group=isChannel?target.closest('.channel-folder')?.querySelector('.folder-heading')?.dataset.orderGroup:target.dataset.orderGroup;
  if(!group||gesture.kind==='folder'&&gesture.key===group)return;
  target.classList.add(gesture.kind==='channel'&&!isChannel?'sort-into':after?'sort-after':'sort-before');
  highlight=target;
  gesture.drop={group,anchorKey:isChannel?target.dataset.orderKey:'',after,isChannel};
 }
 function scrollFrame(){
  frame=0;if(!gesture?.started)return;
  const y=gesture.y;
  const page=doc.scrollingElement||doc.documentElement;
  const viewport=win.innerHeight||doc.documentElement?.clientHeight||0;
  const delta=y<90?-16:y>viewport-125?16:0;
  if(delta){if(typeof win.scrollBy==='function')win.scrollBy(0,delta);else page.scrollTop+=delta;}
  targetAt(gesture.x,gesture.y);
  frame=win.requestAnimationFrame?.(scrollFrame)||0;
 }
 function down(e){
  if(gesture||e.touches?.length!==1)return;
  const row=sourceFor(e.target);if(!row)return;
  const touch=e.changedTouches[0];
  const kind=row.dataset.orderKey?'channel':'folder';
  gesture={source:row,kind,key:kind==='channel'?row.dataset.orderKey:row.dataset.orderGroup,
   label:row.querySelector('.ch-info b,.folder-name')?.textContent||'Kênh',
   id:touch.identifier,x:touch.clientX,y:touch.clientY,startX:touch.clientX,startY:touch.clientY,
   started:false,drop:null,timer:win.setTimeout(begin,HOLD)};
 }
 function move(e){
  const g=gesture;if(!g)return;
  if(e.touches?.length!==1){cleanup();return;}
  const touch=touchOf(e,g.id);if(!touch)return;
  g.x=touch.clientX;g.y=touch.clientY;
  if(!g.started){if(Math.hypot(g.x-g.startX,g.y-g.startY)>SLOP)cleanup();return;}
  if(e.cancelable)e.preventDefault();
  ghostPosition(g.x,g.y);targetAt(g.x,g.y);
  if(!frame&&win.requestAnimationFrame)frame=win.requestAnimationFrame(scrollFrame);
 }
 function up(e){
  const g=gesture;if(!g)return;
  const touch=touchOf(e,g.id);if(!touch)return;
  if(g.started)targetAt(touch.clientX,touch.clientY);
  const {kind,key,drop,started}=g;
  cleanup();
  if(!started)return;
  if(e.cancelable)e.preventDefault();
  suppressed={kind,key};suppressUntil=Date.now()+1100;
  if(!drop)return;
  try{
   const success=kind==='channel'?onMoveChannel?.(key,drop):onMoveFolder?.(key,drop);
   if(success===false)onStatus('Không thể sắp xếp kênh tại vị trí này');
  }catch(err){onStatus('Không thể lưu thứ tự: '+String(err?.message||err));}
 }
 function click(e){
  if(!suppressed||Date.now()>suppressUntil)return;
  const row=e.target?.closest?.(selector);
  if(!row)return;
  if(row.dataset.orderKey===suppressed.key&&suppressed.kind==='channel'||
      row.dataset.orderGroup===suppressed.key&&suppressed.kind==='folder'){
   e.preventDefault();e.stopImmediatePropagation();suppressed=null;
  }
 }
 function contextMenu(e){if(gesture?.started&&gesture.source.contains(e.target))e.preventDefault();}
 list.addEventListener('touchstart',down,{capture:true,passive:true});
 doc.addEventListener('touchmove',move,{capture:true,passive:false});
 doc.addEventListener('touchend',up,{capture:true,passive:false});
 doc.addEventListener('touchcancel',cleanup,true);
 doc.addEventListener('click',click,true);
 doc.addEventListener('contextmenu',contextMenu,true);
 win.addEventListener('blur',cleanup);
 return ()=>{
  cleanup();list.removeEventListener('touchstart',down,true);
  doc.removeEventListener('touchmove',move,true);doc.removeEventListener('touchend',up,true);
  doc.removeEventListener('touchcancel',cleanup,true);
  doc.removeEventListener('click',click,true);doc.removeEventListener('contextmenu',contextMenu,true);
  win.removeEventListener('blur',cleanup);
 };
}
