/* Rust Lab v9: reliable pointer drag/drop in WKWebView and Windows WebView2.
   No HTML DragEvent/dataTransfer: the WebKit macOS path often fails on button
   headings or channel rows containing images. Both lists use event delegation.
   A drag must move >= 7 px; a normal click still plays or opens a folder. */
'use strict';
(function(root,factory){
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.IPTVPointerDnD=api;
})(typeof window!=='undefined'?window:null,function(){
 const classes=['channel-dragging','dragging','channel-drop-position','channel-drop-after','channel-drop-target','folder-drop-before','folder-drop-after'];
 const findSource=(el,host,folders)=>{
  if(!(el&&typeof el.closest==='function'))return null;
  const row=el.closest('.channel-item[data-channel-id]');
  if(row&&host.contains(row))return {kind:'channel',id:row.dataset.channelId,element:row};
  const group=el.closest('.folder-header[data-group],.folder-card[data-group]');
  if(group&&(host.contains(group)||folders?.contains(group)))return {kind:'folder',id:group.dataset.group,element:group};
  return null;
 };
 const getDrop=(el,kind,ids,host,folders,y)=>{
  if(!(el&&typeof el.closest==='function'))return null;
  const row=el.closest('.channel-item[data-channel-id]');
  if(kind==='channel'&&row&&host.contains(row)){
   if(ids.includes(row.dataset.channelId))return null;
   const rect=row.getBoundingClientRect();
   const header=row.previousElementSibling?.closest?.('.folder-header'); // not relied upon
   let sibling=row.previousElementSibling;
   while(sibling&&!sibling.matches('.folder-header[data-group]'))sibling=sibling.previousElementSibling;
   const group=sibling?.dataset.group;
   if(!group)return null;
   return {kind:'channel-row',group,targetId:row.dataset.channelId,after:y>rect.top+rect.height/2,element:row};
  }
  const folder=el.closest('.folder-header[data-group],.folder-card[data-group]');
  if(folder&&(host.contains(folder)||folders?.contains(folder))){
   const rect=folder.getBoundingClientRect();
   return {kind:'folder',group:folder.dataset.group,after:y>rect.top+rect.height/2,element:folder};
  }
  return null;
 };
 function create({document:doc,host,folders,enabled,selectedIds,onChannelDrop,onFolderDrop,onSelectionCancelled}){
  if(!doc||!host)throw new Error('Channel pointer organizer requires document + #channelList');
  let pending=null,active=null,target=null,ghost=null,scrollFrame=0,lastPointer={x:0,y:0},stopNextClick=false,clickTimer=0;
  const window=doc.defaultView;
  function clearHints(){
   for(const el of [active?.element,target?.element])if(el?.classList)classes.forEach(name=>el.classList.remove(name));
   target=null;
  }
  function stopScroll(){if(scrollFrame){window.cancelAnimationFrame(scrollFrame);scrollFrame=0;}}
  function cleanup(){
   stopScroll();clearHints();ghost?.remove();ghost=null;
   doc.documentElement.classList.remove('iptv-dnd-active');
   active=null;pending=null;
  }
  function insideRoot(el){return !!el&&(host.contains(el)||folders?.contains(el));}
  function cursorTarget(x,y){
   const at=doc.elementFromPoint(x,y);
   return active?getDrop(at,active.kind,active.ids,host,folders,y):null;
  }
  function updateHint(drop){
   if(target?.element)classes.forEach(name=>target.element.classList.remove(name));
   target=drop;
   if(!drop)return;
   if(drop.kind==='channel-row'){
    drop.element.classList.add('channel-drop-position');
    drop.element.classList.toggle('channel-drop-after',drop.after);
   }else if(active?.kind==='folder'){
    if(drop.group===active.id){target=null;return;}
    drop.element.classList.toggle('folder-drop-after',drop.after);
    drop.element.classList.toggle('folder-drop-before',!drop.after);
   }else drop.element.classList.add('channel-drop-target');
  }
  function dragLabel(source,ids){
   if(source.kind==='folder')return `📁 ${source.id}`;
   const name=source.element.querySelector('.channel-text b')?.textContent||'Kênh';
   return ids.length>1?`↕ ${ids.length} kênh đã chọn`:`↕ ${name}`;
  }
  function moveGhost(x,y){if(ghost)ghost.style.transform=`translate(${Math.round(x+14)}px, ${Math.round(y+14)}px)`;}
  function scrollTick(){
   if(!active)return;
   const r=host.getBoundingClientRect();
   const {x,y}=lastPointer;
   if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){
    const edge=53,amount=y<r.top+edge?-14:y>r.bottom-edge?14:0;
    if(amount){
     const previous=host.scrollTop;
     host.scrollTop=Math.max(0,host.scrollTop+amount);
     if(host.scrollTop!==previous)updateHint(cursorTarget(x,y));
    }
   }
   scrollFrame=window.requestAnimationFrame(scrollTick);
  }
  function down(event){
   // A new genuine pointerdown must never inherit click suppression from a prior drag.
   if(stopNextClick){stopNextClick=false;window.clearTimeout(clickTimer);}
   if(event.button!==0||!event.isPrimary||event.ctrlKey||event.metaKey||event.altKey)return;
   if(!enabled())return;
   if(event.target.closest('button:not(.folder-header),input,select,textarea,a,[contenteditable="true"]'))return;
   const source=findSource(event.target,host,folders);
   if(!source)return;
   pending={...source,x:event.clientX,y:event.clientY,pointerId:event.pointerId};
  }
  function move(event){
   if(!pending||event.pointerId!==pending.pointerId)return;
   lastPointer={x:event.clientX,y:event.clientY};
   if(!active){
    if(Math.hypot(event.clientX-pending.x,event.clientY-pending.y)<7)return;
    const ids=pending.kind==='channel'?selectedIds(pending.id):[];
    active={...pending,ids};
    active.element.classList.add(active.kind==='folder'?'dragging':'channel-dragging');
    doc.documentElement.classList.add('iptv-dnd-active');
    ghost=doc.createElement('div');ghost.className='iptv-dnd-ghost';ghost.textContent=dragLabel(active,ids);
    ghost.setAttribute('aria-hidden','true');doc.body.appendChild(ghost);
    scrollFrame=window.requestAnimationFrame(scrollTick);
   }
   event.preventDefault();moveGhost(event.clientX,event.clientY);
   updateHint(cursorTarget(event.clientX,event.clientY));
  }
  function up(event){
   if(!pending||event.pointerId!==pending.pointerId)return;
   if(active){
    // Prevent synthetic click from opening a channel or collapsing a folder.
    stopNextClick=true;
    window.clearTimeout(clickTimer);
    clickTimer=window.setTimeout(()=>{stopNextClick=false;},350);
    const drop=cursorTarget(event.clientX,event.clientY);
    try{
     if(drop&&enabled()){
      if(active.kind==='folder'&&drop.kind==='folder'&&drop.group!==active.id){onFolderDrop({source:active.id,target:drop.group,after:drop.after});}
      if(active.kind==='channel'){
       if(drop.kind==='folder')onChannelDrop({ids:active.ids,group:drop.group,targetId:null,after:drop.after});
       if(drop.kind==='channel-row')onChannelDrop({ids:active.ids,group:drop.group,targetId:drop.targetId,after:drop.after});
      }
     }
    }finally{cleanup();onSelectionCancelled?.();}
   }else pending=null;
  }
  function cancel(){cleanup();}
  // Capture before row click handlers, then cancel exactly one synthetic click.
  doc.addEventListener('click',event=>{
   if(stopNextClick&&insideRoot(event.target)){
    event.preventDefault();event.stopImmediatePropagation();stopNextClick=false;window.clearTimeout(clickTimer);
   }
  },true);
  doc.addEventListener('pointerdown',down,true);
  doc.addEventListener('pointermove',move,{capture:true,passive:false});
  doc.addEventListener('pointerup',up,true);
  doc.addEventListener('pointercancel',cancel,true);
  doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&pending){cancel();onSelectionCancelled?.();}});
  // Disable native image or text dragging inside these controls.
  doc.addEventListener('dragstart',event=>{if(insideRoot(event.target))event.preventDefault();},true);
  return {cancel,active:()=>!!active};
 }
 return {create,getDrop,findSource};
});
