'use strict';
(()=>{
 const native=!!window.streamleaf;
 const core=window.StreamLeafCore;
 const favCore=window.OpenIPTVFavorites;
 const recentCore=window.OpenIPTVRecentChannels;
 const sourceEdit=window.OpenIPTVSourceEdit;
 const channelOrderCore=window.OpenIPTVChannelOrder;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const seed={sources:[],channels:[],favorites:[],snapshots:{},folders:[],groupOrder:[],channelOrder:{},collapsedGroups:[],current:'',volume:.8,videoFit:'contain'};
 let store;
 try{store={...seed,...JSON.parse(localStorage.getItem('open-iptv-pro-4')||localStorage.getItem('streamleaf-3')||'{}')};}catch{store={...seed};}
 if(!Array.isArray(store.channels))store.channels=[];
 if(!Array.isArray(store.favorites))store.favorites=[];
 if(!Array.isArray(store.sources))store.sources=[];
 if(!store.snapshots||typeof store.snapshots!=='object')store.snapshots={};
 if(!Array.isArray(store.folders))store.folders=[];
 if(!Array.isArray(store.groupOrder))store.groupOrder=[];
 if(!Array.isArray(store.collapsedGroups))store.collapsedGroups=[];
 if(!store.channelOrder||typeof store.channelOrder!=='object'||Array.isArray(store.channelOrder))store.channelOrder={};
 channelOrderCore.reconcile(store);
 // Each job has its own saved concurrency. Never trust stale/corrupt localStorage values.
 const safeConcurrency=(value,defaultValue=4)=>{
  const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=32?n:defaultValue;
 };
 store.snapshotConcurrency=safeConcurrency(store.snapshotConcurrency);
 store.checkConcurrency=safeConcurrency(store.checkConcurrency);
 if(typeof store.snapshotSkipExisting!=='boolean')store.snapshotSkipExisting=true;
 favCore.migrate(store);
 recentCore.migrate(store,favCore.key);
 // The previous checker produced false Die results for HLS streams and Range rejections.
 // Do not keep those historical negative classifications after this checker upgrade.
 const upgradedChecker=store.checkerVersion!==2;
 if(upgradedChecker){for(const ch of store.channels){if(ch.status==='dead'){ch.status='uncertain';ch.reason='Die từ bản kiểm tra cũ chưa đáng tin; cần kiểm tra lại';ch.checkedAt='';}}store.checkerVersion=2;}

 let mediaInfo={hls:false,mode:'unknown',seekable:false};
 let channelRequestedAt=0,firstFrameReported=false,firstFrameDurationMs=0,playbackStartStage='',playbackPreferenceUsed=false;
 let activeEngine='html5',nativeHlsTried=new Set(),startupNoteTimer=null;
 let playbackProofTimer=0,playbackProofUrl='',attemptedTransports=new Set(),playAttemptSerial=0,playRequestSerial=0,lastStoppedChannelId='',pausedFallbackNeedsRestart=false,pausedByUser=false,filter='all',page='tv',hls=null,dash=null,mpegtsInstance=null,mpegtsLoadPromise=null,mpegtsMetadataListener=null,current=null,playGeneration=0,playCandidates=[],playCandidateIndex=0,playMode='live',failoverTimer=null,stallTimer=null,ffmpegTried=false,ffmpegFallbackId='',activeTransport='relay',modalHandler=null,snapshotBase='',mediaRecoveryCount=0;
 const tasks={
  check:{running:false,cancel:false,visible:false,total:0,done:0,alive:0,dead:0,uncertain:0,results:[]},
  shots:{running:false,cancel:false,visible:false,total:0,done:0,success:0,failed:0,skipped:0,latest:''}
 };
 const player=$('#video');
 let lastFavoriteSignature='';
 function currentChannel(){
  if(!current)return null;
  const active=enabledChannels();
  const replacement=active.find(ch=>ch.id===current.id)||active.find(ch=>ch.sourceId===current.sourceId&&favCore.key(ch)===favCore.key(current))||active.find(ch=>favCore.key(ch)===favCore.key(current));
  if(replacement)current=replacement;
  return replacement||null;
 }
 let lastStorageWarning=0;
 function save(){try{localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));return true;}
  catch(e){
   console.warn('Không thể lưu dữ liệu IPTV',e);
   if(Date.now()-lastStorageWarning>15000){
    lastStorageWarning=Date.now();
    toast('Không lưu được dữ liệu (bộ nhớ ứng dụng có thể đã đầy). Hãy sao lưu và giảm số kênh/ảnh.', 'error');
   }
   return false;
  }
 }
 function textStatus(t){$('#footerText').textContent=t;$('#miniStatus').textContent=t;}
 function toast(message,type='ok'){const node=document.createElement('div');node.className='toast'+(type==='error'?' err':type==='warn'?' warn':'');node.textContent=message;$('#toastArea').append(node);setTimeout(()=>node.remove(),5500);}
 function setPage(p){if(p==='collector'||p==='discovery')p='sources';if(window.IPTVProAdvanced?.canEnterPage?.(p)===false){toast('Trang này bị khóa trong hồ sơ trẻ em','warn');return;}const last=page;if(last!==p||p==='tv')window.OpenIPTVAutoPiP?.onPageChange(p,last);page=p;if(last!==p){const scrolling=$('.content');if(scrolling)scrolling.scrollTop=0;}$$('.nav[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));$$('.page').forEach(x=>x.classList.remove('active-page'));$('#page-'+p)?.classList.add('active-page');$('#pageTitle').textContent=({tv:'Xem truyền hình',fav:'Kênh yêu thích',shots:'Ảnh chụp kênh',sources:'Quản lý nguồn',discovery:'Smart Discovery',doctor:'Smart IPTV Doctor 3.0',health:'Sức khỏe kênh',folders:'Thư mục kênh',epg:'Lịch phát sóng EPG',settings:'Cài đặt'})[p]||'Open IPTV Pro';render();window.IPTVExtras?.onPage?.(p);window.IPTVProAdvanced?.onPage?.(p,last);window.IPTVDVR?.onPage?.(p);window.IPTVCollectorUI?.refresh?.();}
 function closeModal(){$('#modal').classList.add('hidden');modalHandler=null;}
 function openModal(title,html,onSubmit,confirmText='Xác nhận'){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalConfirm').textContent=confirmText;modalHandler=onSubmit;$('#modal').classList.remove('hidden');setTimeout(()=>$('#modalBody input:not([type=radio])')?.focus(),40);}
 function groupName(c){return core.cleanGroup?core.cleanGroup(c.group||'Khác'):(c.group||'Khác').replace(/\s*\|\s*Kiểm tra:.+$/i,'').trim()||'Khác';}
 function visibleGroupOrder(){const seen=new Set(),ordered=[];for(const c of enabledChannels()){const g=groupName(c);if(!seen.has(g)){seen.add(g);ordered.push(g);}}return ordered;}
 function syncGroupOrder(){const visible=visibleGroupOrder();const keep=new Set([...store.folders,...visible]);const ordered=[];for(const g of store.groupOrder){if(keep.has(g)&&!ordered.includes(g))ordered.push(g);}for(const g of [...store.folders,...visible]){if(!ordered.includes(g))ordered.push(g);}store.groupOrder=ordered;return ordered;}
 function groupNames(){return syncGroupOrder().slice();}
 function sortedChannels(channels){return channelOrderCore.ordered(store,channels,groupNames());}
 function groupCount(name){return enabledChannels().filter(c=>groupName(c)===name).length;}
 function preserveListScroll(){const list=$('#channelList');return {top:list?.scrollTop||0,left:list?.scrollLeft||0};}
 function restoreListScroll(pos){const list=$('#channelList');if(!list||!pos)return;requestAnimationFrame(()=>{list.scrollTop=Math.min(pos.top,Math.max(0,list.scrollHeight-list.clientHeight));list.scrollLeft=Math.min(pos.left,Math.max(0,list.scrollWidth-list.clientWidth));});}
 function scrollGroupIntoView(group){requestAnimationFrame(()=>{document.querySelectorAll('.folder-header').forEach(x=>{if(x.dataset.group===group)x.scrollIntoView({block:'nearest'});});});}
 function reorderGroup(moved,target){
  if(window.IPTVProAdvanced?.canEdit?.()===false)return;
  const names=groupNames();if(!names.includes(moved)||!names.includes(target))return;
  const originalOrder=[...store.groupOrder];
  if(!channelOrderCore.moveFolder(store,moved,target))return;
  if(!save()){
   store.groupOrder=originalOrder;
   toast('Không lưu được thứ tự thư mục; chưa áp dụng thay đổi','error');return;
  }
  renderList(true);renderFolders();toast(`Đã chuyển vị trí thư mục: ${moved}`);
 }
 function shiftFolder(group,delta){
  const names=groupNames(),i=names.indexOf(group),next=names[i+delta];
  if(next)reorderGroup(group,next);
 }
 const CHANNEL_DRAG_MIME='application/x-open-iptv-channel';
 let draggedChannelIds=[],draggedFolder='';
 const selectedChannelIds=new Set();
 let lastSelectionAnchorId='';
 function pruneSelected(){
  const keep=channelOrderCore.pruneSelection([...selectedChannelIds],store);
  selectedChannelIds.clear();for(const id of keep)selectedChannelIds.add(id);
 }
 function hasChannelPayload(e){return draggedChannelIds.length>0||Array.from(e.dataTransfer?.types||[]).includes(CHANNEL_DRAG_MIME);}
 function dragIds(e){
  if(draggedChannelIds.length)return [...draggedChannelIds];
  try{const parsed=JSON.parse(e.dataTransfer?.getData(CHANNEL_DRAG_MIME)||'[]');return Array.isArray(parsed)?parsed.filter(x=>typeof x==='string'):[];}catch{return [];}
 }
 function applyChannelMove(ids,group,{anchorId='',after=false,index=null}={}){
  if(window.IPTVProAdvanced?.canEdit?.()===false){toast('Hồ sơ trẻ em không được sắp xếp kênh','warn');return false;}
  if(!groupNames().includes(group)){toast('Thư mục đích không tồn tại','warn');return false;}
  // Never claim a successful move if the new order cannot be persisted.
  // Keep a small rollback snapshot, without copying playlist URLs or snapshots.
  const previousOrder=Object.fromEntries(Object.entries(store.channelOrder).map(([g,order])=>[g,[...order]]));
  const previousGroups=new Map(store.channels.map(ch=>[ch.id,ch.group]));
  const previousCollapsed=[...store.collapsedGroups];
  const rollback=()=>{
   store.channelOrder=previousOrder;
   for(const ch of store.channels)ch.group=previousGroups.get(ch.id);
   store.collapsedGroups=previousCollapsed;
  };
  try{
   const moved=channelOrderCore.move(store,ids,group,{anchorId,after,index});
   if(!moved)return false;
   store.collapsedGroups=store.collapsedGroups.filter(g=>g!==group);
   if(!save()){rollback();toast('Không đủ dung lượng lưu thay đổi; vị trí cũ đã được khôi phục','error');return false;}
   selectedChannelIds.clear();lastSelectionAnchorId='';renderList(true);renderFolders();if(page==='shots')renderShots();
   toast(`Đã sắp xếp/chuyển ${moved} kênh vào ${group}`);
   return true;
  }catch(error){rollback();toast('Không sắp xếp được: '+error.message,'warn');return false;}
 }
 function moveDroppedChannel(e,group,anchorId='',after=false){
  if(!hasChannelPayload(e))return false;
  e.preventDefault();e.stopPropagation();
  const ids=dragIds(e);draggedChannelIds=[];
  if(ids.length)applyChannelMove(ids,group,{anchorId,after});
  return true;
 }
 function channelDragStart(e,c){
  if(window.IPTVProAdvanced?.canEdit?.()===false||e.target.closest('button,input,label')){e.preventDefault();return;}
  const ids=selectedChannelIds.has(c.id)?[...selectedChannelIds]:[c.id];
  draggedChannelIds=channelOrderCore.ordered(store,store.channels.filter(ch=>ids.includes(ch.id)),groupNames()).map(ch=>ch.id);
  if(e.dataTransfer){e.dataTransfer.setData(CHANNEL_DRAG_MIME,JSON.stringify(draggedChannelIds));e.dataTransfer.effectAllowed='move';}
  e.currentTarget.classList.add('channel-dragging');
 }
 function folderChannelDragOver(e,element){
  if(!hasChannelPayload(e))return false;
  e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='move';element.classList.add('channel-drop-target');return true;
 }
 function setSelected(id,checked){
  if(checked)selectedChannelIds.add(id);else selectedChannelIds.delete(id);
  lastSelectionAnchorId=id;
  updateSelectionBar();
  document.querySelectorAll('.channel-item[data-channel-id]').forEach(row=>{
   if(row.dataset.channelId!==id)return;
   row.classList.toggle('channel-selected',checked);
   row.setAttribute('aria-label',`Kênh ${store.channels.find(c=>c.id===id)?.name||''}${checked?' (đã chọn)':''}`);
  });
 }
 function selectChannelRange(id,checked){
  const visible=[...document.querySelectorAll('#channelList .channel-item[data-channel-id]')].map(row=>row.dataset.channelId);
  const a=visible.indexOf(lastSelectionAnchorId),b=visible.indexOf(id);
  if(a<0||b<0)return false;
  for(let i=Math.min(a,b);i<=Math.max(a,b);i++){
   if(checked)selectedChannelIds.add(visible[i]);else selectedChannelIds.delete(visible[i]);
  }
  lastSelectionAnchorId=id;
  renderList(true);
  return true;
 }
 function updateSelectionBar(){
  const bar=$('#channelSelectionBar');if(!bar)return;
  pruneSelected();const count=selectedChannelIds.size;
  bar.classList.toggle('hidden',count===0);
  const label=$('#channelSelectionCount');if(label)label.textContent=`Đã chọn ${count} kênh`;
  const select=$('#channelBatchFolder');if(select){
   const previous=select.value;select.replaceChildren();for(const g of groupNames()){const opt=document.createElement('option');opt.value=g;opt.textContent=g;select.append(opt);}if(groupNames().includes(previous))select.value=previous;
  }
 }
 function snapshotSrc(s){if(!s)return '';if(s.file&&snapshotBase)return snapshotBase+encodeURIComponent(s.file);return s.data||'';}
 function attachSnapshotFallback(img,shot,logo=''){if(!img)return;const paths=[shot?.data,logo].filter(x=>typeof x==='string'&&/^(?:https?:|data:image\/)/i.test(x));let step=0;img.addEventListener('error',()=>{if(step<paths.length){img.src=paths[step++];img.closest?.('.chan-logo,.shot-card')?.classList?.add('snapshot-fallback');}else{img.style.display='none';if(img.parentNode?.classList?.contains('chan-logo'))img.parentNode.textContent='TV';}});}
 function channelThumb(c){const shot=store.snapshots[c.url];const url=snapshotSrc(shot);return url?`<img loading="lazy" src="${escape(url)}" alt="Ảnh chụp ${escape(c.name)}"/>`:icon(c);}
 function mountChannelArt(container,channel){
  if(window.OpenIPTVChannelArt?.mount){
   window.OpenIPTVChannelArt.mount(container,{
    channel,snapshots:store.snapshots,snapshotBase,doc:document,eager:false
   });
   return;
  }
  attachSnapshotFallback(container?.querySelector('img'),store.snapshots[channel.url],channel.logo);
 }
 function createFolder(){if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được sửa thư mục','warn');openModal('Tạo thư mục kênh',`<label class="modal-label">Tên thư mục mới</label><input class="modal-input" id="folderName" maxlength="90" placeholder="Ví dụ: Kênh thể thao"/>`,()=>{const value=$('#folderName').value.trim();if(!value||value.length>90)throw Error('Nhập tên thư mục (tối đa 90 ký tự)');if(groupNames().includes(value))throw Error('Thư mục này đã tồn tại');store.folders.push(value);syncGroupOrder();save();render();},'Tạo thư mục');}
 function moveChannelToFolder(c){
  if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được chuyển kênh','warn');
  const group=groupName(c),groupChannels=sortedChannels(store.channels.filter(x=>groupName(x)===group));
  const index=groupChannels.findIndex(x=>x.id===c.id)+1;
  const options=groupNames().map(n=>`<option value="${escape(n)}" ${n===group?'selected':''}>${escape(n)}</option>`).join('');
  openModal('Chuyển / sắp xếp vị trí kênh',`<p class="hint">Kênh: <b>${escape(c.name)}</b>. Có thể chọn lại chính thư mục này để đổi thứ tự.</p><label class="modal-label" for="folderSelect">Thư mục đích</label><select class="modal-input" id="folderSelect">${options}</select><label class="modal-label" for="channelPosition">Vị trí trong thư mục (1 = đầu tiên)</label><input class="modal-input" id="channelPosition" type="number" min="1" max="${Math.max(1,store.channels.length)}" value="${index}"/><p class="hint">Kéo thả trực tiếp cũng thay đổi thứ tự và tự lưu.</p>`,()=>{
   const to=$('#folderSelect').value,position=Math.trunc(Number($('#channelPosition').value));
   if(!Number.isInteger(position)||position<1)throw Error('Vị trí phải từ 1 trở lên');
   applyChannelMove([c.id],to,{index:position-1});
  },'Lưu vị trí');
 }
 function renameFolder(old){
  if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được đổi tên thư mục','warn');
  openModal('Đổi tên thư mục',`<label class="modal-label">Tên thư mục</label><input class="modal-input" id="folderRename" maxlength="90" value="${escape(old)}"/>`,()=>{
   const name=$('#folderRename').value.trim();if(!name)throw Error('Nhập tên thư mục');
   if(name!==old&&groupNames().includes(name))throw Error('Tên thư mục đã tồn tại');
   channelOrderCore.renameFolder(store,old,name);
   store.folders=store.folders.map(x=>x===old?name:x);
   store.groupOrder=store.groupOrder.map(x=>x===old?name:x);
   store.collapsedGroups=store.collapsedGroups.map(x=>x===old?name:x);
   save();render();
  },'Lưu');
 }
 function deleteFolder(group){
  if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được xóa thư mục','warn');
  const count=groupCount(group);if(!confirm(count?`Thư mục ${group} đang chứa ${count} kênh. Chuyển các kênh sang Khác rồi xóa thư mục?`:`Xóa thư mục trống ${group}?`))return;
  const ids=store.channels.filter(c=>groupName(c)===group).map(c=>c.id);
  if(ids.length)channelOrderCore.move(store,ids,'Khác');
  delete store.channelOrder[group];store.folders=store.folders.filter(x=>x!==group);
  store.groupOrder=store.groupOrder.filter(g=>g!==group);
  store.collapsedGroups=store.collapsedGroups.filter(x=>x!==group);
  save();render();
 }
 function renderFolders(){
  const root=$('#folderManager');root.replaceChildren();const groups=groupNames();
  if(!groups.length){root.innerHTML='<div class="empty-list">Chưa có thư mục. Nhập M3U để lấy nhóm có sẵn hoặc tạo thư mục mới.</div>';return;}
  groups.forEach((g,i)=>{
   const card=document.createElement('div');card.className='folder-card';card.draggable=true;card.dataset.group=g;
   card.innerHTML=`<h3>▤ ${escape(g)}</h3><p>${groupCount(g)} kênh trong thư mục • Vị trí ${i+1}</p><div class="folder-card-actions"><button class="folder-up" title="Đưa lên trên" ${i===0?'disabled':''}>↑ Lên</button><button class="folder-down" title="Đưa xuống dưới" ${i===groups.length-1?'disabled':''}>↓ Xuống</button><button class="folder-open">▶ Xem kênh</button><button class="folder-rename">✎ Đổi tên</button><button class="folder-delete">✕ Xóa</button></div>`;
   card.addEventListener('dragstart',e=>{if(e.target.closest('button')){e.preventDefault();return;}card.classList.add('dragging');draggedFolder=g;e.dataTransfer?.setData('text/plain',g);e.dataTransfer.effectAllowed='move';});
   card.addEventListener('dragend',()=>{card.classList.remove('dragging');draggedFolder='';});
   card.addEventListener('dragover',e=>{if(folderChannelDragOver(e,card))return;e.preventDefault();card.classList.add('drag-over');});
   card.addEventListener('dragleave',()=>card.classList.remove('drag-over','channel-drop-target'));
   card.addEventListener('drop',e=>{card.classList.remove('drag-over','channel-drop-target');if(moveDroppedChannel(e,g))return;e.preventDefault();reorderGroup(e.dataTransfer?.getData('text/plain')||draggedFolder,g);});
   card.querySelector('.folder-up').onclick=()=>shiftFolder(g,-1);
   card.querySelector('.folder-down').onclick=()=>shiftFolder(g,1);
   card.querySelector('.folder-open').onclick=()=>{store.collapsedGroups=store.collapsedGroups.filter(x=>x!==g);save();setPage('tv');$('#searchBox').value='';renderList(true);scrollGroupIntoView(g);};
   card.querySelector('.folder-rename').onclick=()=>renameFolder(g);card.querySelector('.folder-delete').onclick=()=>deleteFolder(g);
   root.append(card);
  });
 }
 function icon(c){return c.logo?`<img loading="lazy" src="${escape(c.logo)}" alt="" onerror="this.style.display='none';this.parentNode.textContent='TV'" />`:'TV';}
 function channelView(){let a=filter==='recent'?recentCore.visible(store,enabledChannels(),favCore.key):filter==='fav'?favCore.visible(store):enabledChannels();
  const query=$('#searchBox').value.trim().toLowerCase();if(query)a=a.filter(c=>(c.name+' '+c.group).toLowerCase().includes(query));
  if(['alive','dead','uncertain'].includes(filter))a=a.filter(c=>c.status===filter);
  return filter==='recent'?a:sortedChannels(a);
 }
 function renderList(preserve=false){
  syncGroupOrder();
  const prev=preserve?preserveListScroll():null;
  const result=channelView(),isRecent=filter==='recent';$('#channelMeta').textContent=`${result.length} / ${store.channels.length} kênh`;
  const target=$('#channelList');target.replaceChildren();
  if(!result.length){updateSelectionBar();target.innerHTML=`<div class="empty-list">${isRecent?'Chưa có kênh vừa xem. Kênh phát thành công sẽ tự xuất hiện ở đây.':store.channels.length?'Không thấy kênh phù hợp.':'Chưa có kênh. Dùng Mở file M3U hoặc Thêm URL để nhập danh sách.'}</div>`;restoreListScroll(prev);return;}
  const groups=new Map();if(isRecent)groups.set('Kênh vừa xem',result);else result.forEach(c=>{const g=groupName(c);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(c)});
  const showEmpty=filter==='all'&&!$('#searchBox').value.trim();
  const orderedGroups=isRecent?['Kênh vừa xem']:groupNames().filter(g=>showEmpty||groups.has(g)).concat([...groups.keys()].filter(g=>!groupNames().includes(g)));
  const f=document.createDocumentFragment();
  orderedGroups.forEach(group=>{
    const entries=groups.get(group)||[],collapsed=!isRecent&&store.collapsedGroups.includes(group)&&!$('#searchBox').value.trim();
    const header=document.createElement(isRecent?'div':'button');if(!isRecent)header.type='button';header.className='folder-header'+(isRecent?' recent-header':'');header.dataset.group=group;header.draggable=!isRecent&&!$('#searchBox').value.trim();
    header.innerHTML=`<span class="folder-arrow">${collapsed?'▸':'▾'}</span><span class="folder-emoji">📁</span><span>${escape(group)}</span><span class="folder-size">${entries.length}</span>`;
    if(isRecent){header.querySelector('.folder-emoji').textContent='🕘';header.querySelector('.folder-arrow').textContent='';}
    if(!isRecent){
    header.addEventListener('click',()=>{const pos=preserveListScroll();if(store.collapsedGroups.includes(group))store.collapsedGroups=store.collapsedGroups.filter(x=>x!==group);else store.collapsedGroups.push(group);save();renderList();restoreListScroll(pos)});
    header.addEventListener('dragstart',e=>{header.classList.add('dragging');draggedFolder=group;e.dataTransfer?.setData('text/plain',group);e.dataTransfer.effectAllowed='move';});
    header.addEventListener('dragend',()=>{header.classList.remove('dragging');draggedFolder='';});
    header.addEventListener('dragover',e=>{if(folderChannelDragOver(e,header))return;if(!$('#searchBox').value.trim()){e.preventDefault();header.classList.add('drag-over');}});
    header.addEventListener('dragleave',()=>header.classList.remove('drag-over','channel-drop-target'));
    header.addEventListener('drop',e=>{header.classList.remove('drag-over','channel-drop-target');if(moveDroppedChannel(e,group))return;if($('#searchBox').value.trim())return;e.preventDefault();reorderGroup(e.dataTransfer?.getData('text/plain')||draggedFolder,group);});
    }
    f.append(header);
    if(collapsed)return;
    entries.forEach(c=>{
      const row=document.createElement('div');const shot=store.snapshots[c.url];row.className='channel-item'+(current?.id===c.id?' current':'')+(selectedChannelIds.has(c.id)?' channel-selected':'');row.dataset.channelId=c.id;
      row.innerHTML=`<div class="chan-logo ${snapshotSrc(shot)?'snapshot-thumb':''}">${channelThumb(c)}</div><div class="channel-text"><b>${escape(c.name)}</b><small><i class="mini-pill ${escape(c.status||'')}"></i><span class="channel-health ${escape(c.status||'')}">${c.status==='alive'?'Sống · ':c.status==='dead'?'Die · ':c.status==='uncertain'?'Chưa rõ · ':''}</span>${shot?'📸 Đã có ảnh • ':''}${escape(groupName(c))}</small></div><button class="channel-move" title="Chuyển thư mục">▤</button><button type="button" class="channel-star ${favCore.has(store,c)?'marked':''}" aria-pressed="${favCore.has(store,c)}" title="${favCore.has(store,c)?'Bỏ yêu thích':'Thêm yêu thích'}">${favCore.has(store,c)?'★':'☆'}</button>`;
      row.draggable=!isRecent;row.tabIndex=0;row.title=isRecent?'Bấm để xem lại · Giữ Shift để chọn nhiều kênh':'Bấm để xem · Giữ Shift và bấm để chọn nhiều kênh · Kéo để sắp xếp';
      row.setAttribute('aria-label',`Kênh ${c.name}${selectedChannelIds.has(c.id)?' (đã chọn)':''}`);
      row.addEventListener('dragstart',e=>channelDragStart(e,c));
      row.addEventListener('dragend',()=>{row.classList.remove('channel-dragging');draggedChannelIds=[];});
      row.addEventListener('dragover',e=>{if(!hasChannelPayload(e))return;e.preventDefault();e.stopPropagation();row.classList.remove('channel-drop-before','channel-drop-after');row.classList.add(e.clientY<row.getBoundingClientRect().top+row.getBoundingClientRect().height/2?'channel-drop-before':'channel-drop-after');if(e.dataTransfer)e.dataTransfer.dropEffect='move';});
      row.addEventListener('dragleave',()=>row.classList.remove('channel-drop-before','channel-drop-after'));
      row.addEventListener('drop',e=>{const after=row.classList.contains('channel-drop-after');row.classList.remove('channel-drop-before','channel-drop-after');moveDroppedChannel(e,group,c.id,after);});
      mountChannelArt(row.querySelector('.chan-logo'),c);
      // Shift+click marks a full range; click a selected row again with Shift to remove just that row.
      // Ctrl/Cmd+click toggles individual non-adjacent channels. A plain click still plays the channel.
      // Mousedown cancellation avoids OS text selection during Shift+click, without blocking drag normally.
      const interactiveTarget=e=>e.target.closest('button,input,label,select,textarea,a');
      const selectFromRow=e=>{
       if(e.shiftKey){
        if(selectedChannelIds.has(c.id))setSelected(c.id,false);
        else if(!selectChannelRange(c.id,true))setSelected(c.id,true);
       }else{setSelected(c.id,!selectedChannelIds.has(c.id));}
      };
      row.addEventListener('mousedown',e=>{if(e.button===0&&e.shiftKey&&!interactiveTarget(e))e.preventDefault();});
      row.addEventListener('click',e=>{
       if(interactiveTarget(e))return;
       if(e.shiftKey||e.metaKey||e.ctrlKey){e.preventDefault();selectFromRow(e);return;}
       lastSelectionAnchorId=c.id;playChannel(c.id);
      });
      row.addEventListener('keydown',e=>{
       if(e.target!==row||!['Enter',' '].includes(e.key))return;
       e.preventDefault();
       if(e.shiftKey||e.metaKey||e.ctrlKey)selectFromRow(e);
       else{lastSelectionAnchorId=c.id;playChannel(c.id);}
      });
      row.querySelector('.channel-star').addEventListener('click',e=>{e.stopPropagation();favorite(c);});
      row.querySelector('.channel-move').addEventListener('click',e=>{e.stopPropagation();moveChannelToFolder(c);});
      window.IPTVExtras?.decorateRow?.(c,row);window.IPTVProAdvanced?.decorateRow?.(c,row);f.append(row);
    });
  });target.append(f);updateSelectionBar();restoreListScroll(prev);
 }
 function renderSources(){const list=$('#sourcesList');list.replaceChildren();if(!store.sources.length){list.innerHTML='<div class="empty-list">Chưa có nguồn. Thêm URL playlist hoặc file M3U từ máy.</div>';return;}
  for(const s of store.sources){const n=store.channels.filter(c=>c.sourceId===s.id).length;const d=document.createElement('article');d.className='source-card';d.innerHTML=`<div class="source-top"><h3${s.id==='collector_merged'&&s.name==='⧉ Playlist đã hợp nhất'?' data-i18n-ui="merged-playlist"':''}>${escape(s.name)}</h3><label title="Bật / tắt nguồn"><input class="toggle" type="checkbox" ${s.enabled!==false?'checked':''}/></label></div><div class="source-url" title="${escape(s.origin||'')}">${escape(s.origin||'File M3U')}</div><div class="source-meta">${n} kênh • ${s.type==='url'?'Nguồn URL':'File cục bộ'}</div><div class="source-actions"><button class="src-refresh" ${s.type!=='url'?'disabled':''}>↻ Tải lại</button><button class="src-edit" ${s.type!=='url'?'disabled title="Chỉ sửa được nguồn URL"':''}>✎ Sửa link</button><button class="src-rename">✎ Đổi tên</button><button class="src-delete remove">✕ Xóa</button></div>`;
   d.querySelector('.toggle').addEventListener('change',e=>{s.enabled=e.target.checked;save();render();});
   d.querySelector('.src-refresh').addEventListener('click',()=>refreshSource(s));
   d.querySelector('.src-edit').addEventListener('click',()=>editSourceUrl(s));
   d.querySelector('.src-rename').addEventListener('click',()=>renameSource(s));
   d.querySelector('.src-delete').addEventListener('click',()=>deleteSource(s));list.append(d);
  }
 }
 // Snapshot cards may outlive a source toggle or playlist refresh. Resolve the
 // current channel before navigation; never silently re-enable a disabled source.
 async function openSnapshotChannel({id='',url='',name=''}={}){
  const enabled=enabledChannels();
  let found=enabled.find(c=>c.id===id)||(url?enabled.find(c=>c.url===url):null);
  if(!found)found=store.channels.find(c=>c.id===id)||(url?store.channels.find(c=>c.url===url):null);
  if(!found&&name){
   const normalized=String(name).trim().toLocaleLowerCase();
   const matches=store.channels.filter(c=>String(c.name||'').trim().toLocaleLowerCase()===normalized);
   // Old snapshots can keep the title after a source refresh changes the URL.
   // A name alone is not a safe identity when more than one channel matches.
   if(matches.length===1){
    if(!confirm(`Ảnh cũ của ${name} không còn liên kết URL. Mở kênh cùng tên hiện có?`))return false;
    found=matches[0];
   }
  }
  if(!found){toast(`Ảnh Snapshot của ${name||'kênh'} không còn liên kết với nguồn M3U hiện tại. Hãy cập nhật nguồn hoặc chụp lại ảnh.`, 'warn');return false;}
  const source=store.sources.find(s=>s.id===found.sourceId);
  if(!source){toast(`Không tìm thấy nguồn M3U của ${found.name}. Hãy cập nhật nguồn trước khi xem.`, 'warn');return false;}
  if(source.enabled===false){
   const activeTwin=enabled.find(c=>c.url===found.url);
   if(activeTwin)found=activeTwin;
   else{
    if(!confirm(`Nguồn "${source.name}" đang tắt. Bật nguồn này rồi xem kênh "${found.name}"?`))return false;
    source.enabled=true;
    if(!save()){source.enabled=false;toast('Không lưu được trạng thái nguồn; chưa thay đổi danh sách.', 'error');return false;}
   }
  }
  // The selected channel must be visible to the regular player and failover.
  if(!enabledChannels().some(c=>c.id===found.id)){toast('Không thể mở kênh từ ảnh Snapshot.', 'warn');return false;}
  window.IPTVProAdvanced?.closePreview?.();
  setPage('tv');
  if(page!=='tv')return false;
  await playChannel(found.id);
  return true;
 }
 function renderShots(){
  window.IPTVProAdvanced?.closePreview?.();
  const target=$('#shotList');target.replaceChildren();
  const channels=store.channels.filter(c=>snapshotSrc(store.snapshots[c.url]));
  const knownUrls=new Set(store.channels.map(c=>c.url));
  const orphanEntries=Object.entries(store.snapshots).filter(([url,shot])=>snapshotSrc(shot)&&!knownUrls.has(url));
  if(!channels.length&&!orphanEntries.length){target.innerHTML='<div class="empty-list">Chưa có ảnh chụp. Bấm “Chụp toàn bộ” hoặc chọn kênh rồi bấm nút ▣.</div>';return;}
  const groups=new Map();
  for(const c of channels){const name=groupName(c);if(!groups.has(name))groups.set(name,[]);groups.get(name).push({channel:c,shot:store.snapshots[c.url]});}
  if(orphanEntries.length)groups.set('Ảnh từ kênh đã xóa',orphanEntries.map(([url,shot])=>({channel:null,shot,url})));
  const order=[...groupNames(),...groups.keys()].filter((name,index,array)=>array.indexOf(name)===index&&groups.has(name));
  const fragment=document.createDocumentFragment();
  for(const name of order){const items=groups.get(name);
   const section=document.createElement('section');section.className='shot-group';section.dataset.group=name;
   const title=document.createElement('div');title.className='shot-group-heading';
   const heading=document.createElement('h2');heading.textContent='📁 '+name;
   const count=document.createElement('span');count.textContent=`${items.length} ảnh`;
   title.append(heading,count);section.append(title);
   const grid=document.createElement('div');grid.className='shots-grid';
   for(const {channel,shot,url} of items){
    const card=document.createElement('article');card.className='shot-card';if(channel)card.dataset.channelId=channel.id;
    card.innerHTML=`<img loading="lazy" src="${escape(snapshotSrc(shot))}" alt="Ảnh chụp ${escape(channel?.name||shot.name||'Kênh')}"/><b title="${escape(channel?.name||shot.name||'Kênh')}">${escape(channel?.name||shot.name||'Kênh')}</b><small title="${escape(shot.date||'')}">${escape(shot.date||'')} · ${escape(shot.method||'FFmpeg')}</small>`;
    const shotTarget={id:channel?.id||'',url:channel?.url||url||'',name:channel?.name||shot.name||'Kênh'};
    card.classList.add('clickable');card.tabIndex=0;card.setAttribute('role','button');
    card.setAttribute('aria-label','Mở kênh '+shotTarget.name+' từ Snapshot');
    card.title=channel?'Rê chuột xem trước không tiếng; nhấn để xem '+channel.name:'Ảnh cũ: nhấn để tìm kênh tương ứng';
    card.addEventListener('click',()=>{void openSnapshotChannel(shotTarget);});
    card.addEventListener('keydown',e=>{if(e.target!==card)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();void openSnapshotChannel(shotTarget);}});
    attachSnapshotFallback(card.querySelector('img'),shot);
    if(channel){
     const isFav=favCore.has(store,channel);
     const star=document.createElement('button');star.type='button';star.className='snapshot-star'+(isFav?' marked':'');
     star.textContent=isFav?'★':'☆';star.title=isFav?'Bỏ yêu thích':'Thêm yêu thích';star.setAttribute('aria-label',star.title);
     star.setAttribute('aria-pressed',String(isFav));
     star.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();favorite(channel);});
     star.addEventListener('keydown',e=>e.stopPropagation());
     card.append(star);window.IPTVProAdvanced?.decorateRow?.(channel,card);
    }

    grid.append(card);
   }
   section.append(grid);fragment.append(section);
  }
  target.append(fragment);
 }
 function renderFavorites(){
  const target=$('#favoriteList');target.replaceChildren();
  const favorites=favCore.visible(store);
  if(!favorites.length){target.innerHTML='<div class="empty-list">Không có kênh yêu thích từ các nguồn đang bật. Khi thêm lại một nguồn có kênh đã lưu, kênh sẽ tự xuất hiện.</div>';return;}
  favorites.forEach(c=>{const div=document.createElement('div');div.className='fav-card';div.dataset.channelId=c.id;
   div.innerHTML=`<div class="chan-logo ${snapshotSrc(store.snapshots[c.url])?'snapshot-thumb':''}">${channelThumb(c)}</div><div><h3>${escape(c.name)}</h3><small>${escape(c.group)} · ${escape(store.sources.find(s=>s.id===c.sourceId)?.name||'Nguồn IPTV')}</small></div><button>▶ Xem</button><button type="button" class="fav-unstar" aria-pressed="true" title="Bỏ yêu thích">★</button>`;
   mountChannelArt(div.querySelector('.chan-logo'),c);
   div.querySelector('button:not(.fav-unstar)').onclick=()=>{setPage('tv');playChannel(c.id)};
   div.querySelector('.fav-unstar').onclick=()=>favorite(c);
   window.IPTVProAdvanced?.decorateRow?.(c,div);target.append(div);
  });
 }
 function updatePlayerFavorite(){
  const selected=currentChannel();
  const button=$('#favCurrentBtn'),marked=!!selected&&favCore.has(store,selected);
  button.textContent=marked?'★':'☆';button.classList.toggle('marked',marked);
  button.setAttribute('aria-pressed',String(marked));
  button.setAttribute('aria-label',marked?'Bỏ khỏi yêu thích':'Thêm vào yêu thích');
  button.title=marked?'Bỏ khỏi yêu thích':'Thêm vào yêu thích';
 }
 function notifyFavorites(){
  const signature=JSON.stringify([store.favoriteKeys||[],store.favorites||[]]);
  if(lastFavoriteSignature===signature)return;
  lastFavoriteSignature=signature;
  window.IPTVProAdvanced?.onFavoritesChanged?.();
  window.dispatchEvent(new CustomEvent('openiptv:favorites-changed',{detail:{count:favCore.visible(store).length}}));
 }
 function render(preserveScroll=false){
  syncGroupOrder();
  const visibleFavorites=favCore.sync(store);
  const enabled=store.sources.filter(s=>s.enabled!==false);const visible=store.channels.filter(c=>enabled.some(s=>s.id===c.sourceId));
  $('#navCount').textContent=visible.length;$('#favCount').textContent=visibleFavorites.length;$('#sourceCount').textContent=store.sources.length;$('#footerCounts').textContent=`${store.channels.length} kênh • ${store.sources.length} nguồn`;
  $('#activeSourceTag').textContent=store.sources.length?`${store.sources.length} nguồn M3U`:'Chưa có nguồn';
  renderList(preserveScroll);renderSources();renderShots();renderFavorites();renderFolders();$('#folderCount').textContent=groupNames().length;
  updatePlayerFavorite();notifyFavorites();window.IPTVExtras?.render?.();
 }
 function updateFavoriteButton(button,channel){
  const marked=favCore.has(store,channel);
  button.textContent=marked?'★':'☆';button.classList.toggle('marked',marked);
  button.setAttribute('aria-pressed',String(marked));
  button.title=marked?'Bỏ yêu thích':'Thêm yêu thích';
 }
 function refreshFavoriteViews(){
  // Do not reconstruct thousands of snapshot/source rows for one star click.
  const visible=favCore.sync(store);
  $('#favCount').textContent=String(visible.length);
  if(filter==='fav')renderList(true);
  else {
   const channelsById=new Map(store.channels.map(ch=>[ch.id,ch]));
   for(const row of $$('.channel-item[data-channel-id]')){
    const c=channelsById.get(row.dataset.channelId),button=row.querySelector('.channel-star');
    if(c&&button)updateFavoriteButton(button,c);
   }
  }
  renderFavorites();
  const channelsById=new Map(store.channels.map(ch=>[ch.id,ch]));
  for(const card of $$('.shot-card[data-channel-id]')){
   const c=channelsById.get(card.dataset.channelId),button=card.querySelector('.snapshot-star');
   if(c&&button){updateFavoriteButton(button,c);button.setAttribute('aria-label',button.title);}
  }
  updatePlayerFavorite();notifyFavorites();
 }
 function favorite(channel){
  if(!channel)return;
  const added=favCore.toggle(store,channel);
  save();refreshFavoriteViews();
  toast(`${added?'Đã thêm':'Đã bỏ'} yêu thích: ${channel.name}`);
 }
 function id(){return 'src_'+Date.now().toString(36)+'_'+Math.floor(Math.random()*1e8).toString(36);}
 function addSource(name,origin,content,type){const sourceId=id();const parsed=core.parseM3U(content,sourceId);if(!parsed.length)throw new Error('Không tìm thấy kênh hợp lệ trong M3U');
  // Import is atomic even when localStorage quota is exceeded. Previously the
  // UI claimed success while all newly added channels vanished on restart.
  const before={sources:store.sources,channels:store.channels,groupOrder:store.groupOrder,channelOrder:store.channelOrder,favorites:store.favorites};
  const src={id:sourceId,name,origin,type,enabled:true,addedAt:new Date().toISOString()};
  try{
   store.sources=[...store.sources,src];store.channels=[...store.channels,...parsed];
   store.groupOrder=[...store.groupOrder];store.favorites=[...store.favorites];
   syncGroupOrder();channelOrderCore.reconcile(store);favCore.sync(store);
   if(!save())throw new Error('Bộ nhớ lưu trữ không đủ. Danh sách chưa được nhập; hãy xuất Backup và xóa bớt dữ liệu cũ.');
  }catch(e){Object.assign(store,before);throw e;}
  render();toast(`Đã thêm ${parsed.length} kênh từ ${name}`);textStatus(`Đã thêm ${parsed.length} kênh mới`);setPage('tv');}
 async function loadFile(){
  // Native file picker must not open until explicit legal-use acknowledgment.
  if(native&&!(await window.OpenIPTVSourceConsent?.requestImport?.('file')))return;
  if(native){try{const file=await window.streamleaf.openM3U();if(file)addSource(file.name,file.name,file.content,'file');}catch(e){toast(e.message,'error');}return;}
  $('#fileInput').click();
 }
 async function importFromInput(file){if(!file)return;
  // Browser file selection is not import consent. Ask before reading file bytes.
  if(!(await window.OpenIPTVSourceConsent?.requestImport?.('file')))return;
  try{addSource(file.name,file.name,await file.text(),'file');}catch(e){toast(e.message,'error');}}
 async function openURL(){if(!(await window.OpenIPTVSourceConsent?.requestImport?.('url')))return;
  openModal('Thêm playlist bằng URL',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="urlName" placeholder="Ví dụ: Kênh truyền hình Việt Nam" value="IPTV từ URL"/><label class="modal-label">Đường dẫn M3U</label><input class="modal-input" id="urlValue" placeholder="https://example.com/iptv.m3u" type="url"/><p class="hint">Nhập liên kết tới file M3U chứa nhiều kênh. Bản ứng dụng dùng trình tải tích hợp; bản trình duyệt có thể bị giới hạn CORS.</p>`,async()=>{
    const name=$('#urlName').value.trim()||'IPTV từ URL';const url=$('#urlValue').value.trim();if(!/^https?:\/\//i.test(url))throw Error('URL phải bắt đầu bằng http:// hoặc https://');
    textStatus('Đang tải danh sách từ URL...');const content=native?(await window.streamleaf.loadURL(url)).content:await (await fetch(url)).text();addSource(name,url,content,'url');},'Tải danh sách');}
 async function readSourceURL(url){
  if(native)return (await window.streamleaf.loadURL(url)).content;
  const r=await fetch(url);if(!r.ok)throw Error('Máy chủ trả HTTP '+r.status);return r.text();
 }
 async function replaceURLSource(source,newUrl,newName,mode='edit'){
  // Replacing a URL also introduces a new third-party playlist. Auto refresh does not.
  if(mode==='edit'&&!(await window.OpenIPTVSourceConsent?.requestImport?.('url')))throw Error('Chưa xác nhận quyền sử dụng liên kết M3U mới');
  if(window.IPTVProAdvanced?.canEdit?.()===false)throw Error('Hồ sơ trẻ em không được sửa nguồn');
  if(tasks.check.running||tasks.shots.running)throw Error('Hãy đợi tác vụ kiểm tra/chụp ảnh hoàn thành rồi sửa nguồn');
  const url=sourceEdit.validatePlaylistUrl(newUrl);
  if(!store.sources.some(s=>s.id===source.id))throw Error('Nguồn này đã bị xóa');
  textStatus('Đang xác minh nguồn M3U mới...');
  const content=await readSourceURL(url);
  const fresh=core.parseM3U(content,source.id);
  if(!fresh.length)throw Error('Link mới không có kênh hợp lệ; đã giữ nguyên nguồn cũ');
  const oldCount=store.channels.filter(c=>c.sourceId===source.id).length;
  if(mode==='edit'&&oldCount>5&&fresh.length<oldCount/2&&!confirm(`Playlist mới chỉ có ${fresh.length}/${oldCount} kênh. Bạn vẫn muốn thay nguồn?`))throw Error('Đã hủy thay nguồn');
  const oldCurrent=current&&current.sourceId===source.id?current.id:null;
  const before=JSON.stringify(store);
  let result;
  try{
   result=sourceEdit.replaceSourceInStore(store,source.id,url,fresh);
   source.name=String(newName||'').trim()||source.name;
   syncGroupOrder();channelOrderCore.reconcile(store);favCore.sync(store);
   if(!save())throw Error('Không đủ bộ nhớ lưu trữ để cập nhật nguồn. Đã giữ nguyên nguồn cũ.');
  }catch(e){store=JSON.parse(before);throw e;}
  pruneSelected();render();
  if(oldCurrent){const replacement=store.channels.find(c=>c.id===oldCurrent);if(replacement){if(current?.url!==replacement.url)await playChannel(replacement.id);else current=replacement;}else stopPlayer();}
  toast(`Nguồn đã cập nhật: ${fresh.length} kênh • giữ thông tin ${result.matched} kênh cũ`);
  textStatus('Đã lưu URL nguồn mới và giữ các kênh trùng khớp');return result;
 }
 function editSourceUrl(source){
  if(source.type!=='url')return toast('Nguồn này là file M3U, không có URL để sửa','warn');
  if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được sửa nguồn','warn');
  openModal('Sửa URL nguồn M3U',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="sourceEditName" value="${escape(source.name)}" maxlength="140"/><label class="modal-label">Link nguồn M3U mới</label><input class="modal-input" id="sourceEditURL" type="url" value="${escape(source.origin)}" autocomplete="off" spellcheck="false"/><p class="hint">Ứng dụng sẽ tải và kiểm tra link mới trước khi thay nguồn cũ. Giữ kênh yêu thích, thư mục tùy chỉnh và trạng thái kênh khớp. Nếu tải lỗi, không ghi đè.</p>`,async()=>{
   await replaceURLSource(source,$('#sourceEditURL').value,$('#sourceEditName').value);
  },'Kiểm tra và lưu');
 }
 async function refreshSource(source){
  try{await replaceURLSource(source,source.origin,source.name,'refresh');}
  catch(e){toast('Không thể tải lại: '+e.message,'error');textStatus('Tải lại thất bại; đã giữ dữ liệu cũ');}
 }
 async function refreshAll(){if(tasks.check.running||tasks.shots.running){toast('Hãy đợi hai tác vụ đang chạy xong trước khi làm mới nguồn','warn');return;}const sources=store.sources.filter(s=>s.type==='url'&&s.enabled!==false);if(!sources.length){toast('Chưa có nguồn URL để tải lại','warn');return;}for(const s of sources)await refreshSource(s);}
 function renameSource(s){openModal('Đổi tên nguồn',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="renameValue" value="${escape(s.name)}"/>`,()=>{s.name=$('#renameValue').value.trim()||s.name;save();render();});}
 function deleteSource(s){if(!confirm(`Xóa nguồn "${s.name}" và tất cả kênh của nguồn này?`))return;store.sources=store.sources.filter(x=>x.id!==s.id);store.channels=store.channels.filter(c=>c.sourceId!==s.id);if(current?.sourceId===s.id)stopPlayer();syncGroupOrder();channelOrderCore.reconcile(store);favCore.sync(store);save();render();toast('Đã xóa nguồn');}
 function enabledChannels(){const s=new Set(store.sources.filter(s=>s.enabled!==false).map(s=>s.id));return store.channels.filter(c=>s.has(c.sourceId));}
 function currentAvailableLinks(channel){
  return window.OpenIPTVAdvancedCore?.alternatives(channel,enabledChannels(),store.alternates||{})||[channel?.url].filter(Boolean);
 }
 function updateManualLinkPicker(){
  const picker=$('#manualStreamSelect');if(!picker)return;
  const ch=current,urls=ch?currentAvailableLinks(ch):[];
  const actual=playCandidates[playCandidateIndex]||ch?.url||'';
  picker.replaceChildren();picker.disabled=!ch||!urls.length;
  if(!ch){picker.add(new Option('Chưa chọn kênh',''));return;}
  if(!urls.length){picker.add(new Option('Không có link hợp lệ',''));return;}
  urls.forEach((url,i)=>{
   let host='';try{host=new URL(url).host;}catch{}
   const label=(i===0?'Link chính':'Dự phòng '+i)+(host?' · '+host:'');
   const option=new Option(label,url);picker.add(option);
  });
  // Playback may use a catch-up URL that isn't in the Live playlist.
  picker.value=urls.includes(actual)?actual:ch.url;
  picker.title='Chọn link phát thủ công · '+urls.length+' link cho '+ch.name;
 }
 function stopPlayer(){
  // A full stop must abort transport readers, not merely pause the <video>.
  pausedFallbackNeedsRestart=false;pausedByUser=false;
  if(current?.id)lastStoppedChannelId=current.id;
  ++playRequestSerial; // Invalidates any pending allowChannel decision.
  ++playGeneration;++playAttemptSerial;
  clearTimeout(failoverTimer);clearTimeout(stallTimer);clearTimeout(startupNoteTimer);
  failoverTimer=null;stallTimer=null;startupNoteTimer=null;
  attemptedTransports.clear();nativeHlsTried.clear();
  playbackProofUrl='';playbackProofTimer=0;
  const oldFallback=ffmpegFallbackId;ffmpegFallbackId='';
  void window.OpenIPTVAutoPiP?.stopPlayback?.();
  window.OpenIPTVCastUI?.stopOnLocalStop?.();
  window.IPTVProAdvanced?.onStop?.();
  if(hls){
   try{hls.stopLoad?.();}catch(e){console.warn('Stop HLS loading:',e);}
   try{hls.destroy();}catch(e){console.warn('Destroy HLS:',e);}
   hls=null;
  }
  if(dash){
   try{dash.pause?.();}catch(e){console.warn('Pause DASH:',e);}
   try{dash.reset();}catch(e){console.warn('Destroy DASH:',e);}
   dash=null;
  }
  destroyMpegts();
  try{player.pause();}catch{}
  try{
   const stream=player.srcObject;
   if(stream?.getTracks)for(const track of stream.getTracks())try{track.stop();}catch{}
   if(stream)player.srcObject=null;
  }catch(e){console.warn('Stop media stream:',e);}
  player.removeAttribute('src');player.load();
  if(oldFallback)window.streamleaf?.stopPlaybackFallback?.(oldFallback).catch(()=>{});
  current=null;store.current=null;save();
  playCandidates=[];playCandidateIndex=0;playMode='live';
  mediaInfo={hls:false,mode:'unknown',seekable:false};
  document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));
  $('#playingTitle').textContent='Chưa chọn kênh';
  $('#playingSubtitle').textContent='Đã dừng · chọn ▶ để xem lại';
  $('#playBtn').textContent='▶';$('#streamInfo').textContent='Đã dừng hoàn toàn';
  $('#emptyPlayer').classList.remove('hidden');$('#playingIcon').textContent='TV';
  updatePlayerFavorite();updateManualLinkPicker();renderList();
  window.IPTVExtras?.onChannel?.(null);
  textStatus('Đã dừng phát · ngắt tải ngầm và xóa bộ đệm video');
 }

 function destroyMpegts(){
  // Also safe when legacy isolated Stop tests evaluate this helper without app state.
  if(typeof mpegtsMetadataListener!=='undefined'&&mpegtsMetadataListener){
   player.removeEventListener?.('loadedmetadata',mpegtsMetadataListener);mpegtsMetadataListener=null;
  }
  const engine=typeof mpegtsInstance==='undefined'?null:mpegtsInstance;
  if(typeof mpegtsInstance!=='undefined')mpegtsInstance=null;
  if(!engine)return;
  for(const action of ['pause','unload','detachMediaElement','destroy'])try{engine[action]?.();}catch(e){console.warn('MPEG-TS cleanup:',action,e);}
 }
 async function loadMpegtsLib(){
  if(window.mpegts?.createPlayer)return window.mpegts;
  if(!mpegtsLoadPromise){
   mpegtsLoadPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='mpegts.min.js';
    script.onload=()=>window.mpegts?.createPlayer?resolve(window.mpegts):reject(Error('Thiếu mpegts.js trong gói'));
    script.onerror=()=>reject(Error('Không tải được mpegts.js đã đóng gói'));
    document.head.append(script);
   }).catch(e=>{mpegtsLoadPromise=null;throw e;});
  }
  return mpegtsLoadPromise;
 }
 function isMpegtsStream(url){
  const kind=window.IPTVPlaybackRoutePolicy?.format(url);
  return kind==='mpegts'||kind==='flv'||/\.(?:ts|m2ts|mpegts|flv)(?:[?#]|$)/i.test(String(url||''));
 }
 async function loadHlsLib(){if(window.Hls)return window.Hls;if(native)throw Error('Ứng dụng chưa đóng gói hls.js. Hãy chạy npm install rồi đóng gói lại.');return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';script.onload=()=>window.Hls?resolve(window.Hls):reject(Error('Thiếu thư viện hls.js'));script.onerror=()=>reject(Error('Không tải được hls.js từ CDN để phát HLS trên trình duyệt này'));document.head.append(script);});}
 function isInternalMediaUrl(raw){return /^https?:\/\/127\.0\.0\.1:\d+\/(?:stream|buffer|snapshot|playback-fallback)\b/i.test(String(raw||''));}
 function isTimeshiftUrl(raw){return /^https?:\/\/127\.0\.0\.1:\d+\/buffer\b/i.test(String(raw||''))||/[?&]file=rolling\.m3u8(?:$|[&#])/i.test(String(raw||''));}
 function looksLikeHlsUrl(raw){return /\.m3u8(?:$|[?#&])/i.test(String(raw||''))||/[?&](?:file|url)=[^#]*\.m3u8(?:$|[&#])/i.test(String(raw||''));}
 async function tryPlayback(url,generation,transport='relay'){
  if(generation!==playGeneration)return;
  if(transport==='relay'&&playMode==='live'&&isMpegtsStream(url)&&!attemptedTransports.has('mpegts'))
   return tryPlayback(url,generation,'mpegts');
  const attempt=++playAttemptSerial;
  attemptedTransports.add(transport);
  activeTransport=transport;
  playbackStartStage=transport==='ffmpeg'?'ffmpeg-start':'relay-start';activeEngine=transport==='ffmpeg'?'ffmpeg':'html5';
  clearTimeout(stallTimer);clearTimeout(startupNoteTimer);
  const oldFallback=ffmpegFallbackId;ffmpegFallbackId='';
  if(oldFallback)window.streamleaf?.stopPlaybackFallback?.(oldFallback).catch(()=>{});
  if(hls){try{hls.destroy();}catch{}hls=null;}
  if(dash){try{dash.reset();}catch{}dash=null;}destroyMpegts();
  clearTimeout(failoverTimer);
  mediaRecoveryCount=0;
  player.pause();player.removeAttribute('src');player.load();
  if(/^(rtsp|rtmp|udp):/i.test(url))throw Error('Luồng RTSP/RTMP/UDP không hỗ trợ; hãy dùng HLS hoặc MP4.');
  // The FFmpeg route reads the approved stream directly; do not spend an IPC
  // round trip creating a Chromium proxy URL that FFmpeg never uses.
  let actual=transport!=='ffmpeg'&&native&&!isInternalMediaUrl(url)?await window.streamleaf.proxy(url):url;
  if(generation!==playGeneration||attempt!==playAttemptSerial)return;
  playbackStartStage=transport==='ffmpeg'?'ffmpeg-preparing':'proxy-ready';
  let looksHls=looksLikeHlsUrl(url);
  let details={hls:looksHls,mode:'unknown',seekable:false};
  if(transport==='ffmpeg'){
   if(!native||!window.streamleaf?.startPlaybackFallback)throw Error('Trình phát FFmpeg chỉ có trong bản desktop Full');
   textStatus('FFmpeg đang chuẩn bị hình ảnh cho '+(current?.name||'kênh')+'…');
   const out=await window.streamleaf.startPlaybackFallback(url);
   if(generation!==playGeneration||attempt!==playAttemptSerial){window.streamleaf.stopPlaybackFallback(out.id).catch(()=>{});return;}
   ffmpegFallbackId=out.id;actual=out.url;looksHls=true;details={hls:true,dash:false,mode:'live',seekable:false};
  }else{
   // For an opaque URL, use the format that actually produced decoded video
   // recently on this SAME URL. A prior HTTP link check cannot supply this.
   const cachedFormat=playbackPreferenceUsed&&current?.lastPlayableUrl===url&&
    current?.lastPlayableTransport==='relay'?current.lastPlayableFormat:null;
   if(cachedFormat==='hls')details={hls:true,dash:false,mode:'unknown',seekable:false};
   else if(cachedFormat==='dash')details={hls:false,dash:true,mode:'unknown',seekable:false};
   else if(cachedFormat==='mp4')details={hls:false,dash:false,mode:'vod',seekable:true};
   else {
    // Explicit .m3u8/.mpd/.mp4 URLs need no network MIME probe.
    const quick=window.IPTVStartupPolicy;
    if(native && quick?.inspectQuick)details=await quick.inspectQuick(url,u=>window.streamleaf.mediaKind(u),{timeoutMs:2200});
   }
   looksHls=looksHls||!!details.hls;
  }
  if(generation!==playGeneration||attempt!==playAttemptSerial)return;
  // An extensionless endpoint can return raw MPEG-TS: Chromium video.src and
  // hls.js cannot decode that container directly. Remux immediately, not after 24 s.
  if(transport==='relay'&&playMode==='live'&&['ts','mpegts','flv'].includes(details.format)&&!attemptedTransports.has('mpegts'))
   return tryPlayback(url,generation,'mpegts');
  playbackStartStage=transport==='ffmpeg'?'ffmpeg-segments-ready':'format-ready';
  const looksDash=transport==='ffmpeg'?false:!!details.dash||/\.mpd(?:[?#]|$)/i.test(url);
  mediaInfo={...details,hls:looksHls&&!looksDash,dash:looksDash};
  if((details.mode==='vod'||details.mode==='event')&&playMode==='live'){
   playMode=details.mode;
   $('#playingSubtitle').textContent=(current?.group||'')+' • '+(playMode==='vod'?'Video có thể tua':'Sự kiện • chọn phân đoạn');
  }
  document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));
  const isCurrent=()=>generation===playGeneration&&attempt===playAttemptSerial;
  const startPlaying=()=>{
   if(!isCurrent()||pausedByUser)return;
   const promise=player.play();
   if(promise?.catch)promise.catch(e=>{
    if(!isCurrent()||e?.name==='AbortError')return;
    if(e?.name==='NotAllowedError'){
     $('#streamInfo').textContent='Nhấn Phát để tiếp tục';
     toast('Trình phát yêu cầu thao tác Phát của người dùng','warn');
    }else recoverPlayback(generation,e.message||'Lỗi video',attempt);
   });
  };
  if(transport==='mpegts'){
   activeEngine='mpegts';
   const lib=await loadMpegtsLib();if(!isCurrent())return;
   if(!lib?.isSupported?.()||!(window.MediaSource||window.ManagedMediaSource))
    throw Error('MPEG-TS: MediaSource/codec không hỗ trợ');
   const engine=lib.createPlayer({
    type:/\.flv(?:[?#]|$)/i.test(url)?'flv':'mse',url:actual,isLive:true
   },{
    enableWorker:false,enableStashBuffer:true,stashInitialSize:128*1024,
    lazyLoad:false,autoCleanupSourceBuffer:true,
    autoCleanupMaxBackwardDuration:20,autoCleanupMinBackwardDuration:8
   });
   mpegtsInstance=engine;
   const onMetadata=()=>{
    player.removeEventListener('loadedmetadata',onMetadata);
    if(mpegtsMetadataListener===onMetadata)mpegtsMetadataListener=null;
    if(isCurrent())startPlaying();
   };
   mpegtsMetadataListener=onMetadata;
   player.addEventListener('loadedmetadata',onMetadata);
   if(lib.Events?.ERROR)engine.on(lib.Events.ERROR,(type,detail,info)=>{
    if(!isCurrent()||engine!==mpegtsInstance)return;
    recoverPlayback(generation,'MPEG-TS: '+String(detail||type||info?.msg||'lỗi luồng').slice(0,130),attempt);
   });
   mediaInfo={...mediaInfo,hls:false,dash:false,mode:'live',seekable:false};
   document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));
   engine.attachMediaElement(player);engine.load();
  }else if(looksDash){
   activeEngine='dashjs';
   const Dash=window.dashjs;
   if(!Dash?.MediaPlayer)throw Error('Thiếu dash.js trong gói ứng dụng; cài lại đầy đủ phụ thuộc npm.');
   if(!window.MediaSource && !window.ManagedMediaSource)throw Error('MPEG-DASH yêu cầu trình duyệt hỗ trợ Media Source Extensions');
   const engine=Dash.MediaPlayer().create();dash=engine;
   const events=Dash.MediaPlayer.events;
   engine.on(events.STREAM_INITIALIZED,()=>{
    if(!isCurrent())return;
    const live=!!engine.isDynamic?.();
    mediaInfo={...mediaInfo,mode:live?'live':'vod',seekable:!live};
    if(playMode==='live'&&!live)playMode='vod';
    document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));
    startPlaying();
   });
   engine.on(events.ERROR,event=>{
    if(!isCurrent())return;
    const reason='DASH: '+String(event?.error?.message||event?.message||event?.error?.code||'Không tải được manifest/segment').slice(0,160);
    recoverPlayback(generation,reason,attempt);
   });
   if(native){
    const proxyTemplate=new URL(actual);
    engine.extend('RequestModifier',()=>({
     modifyRequestHeader:xhr=>xhr,
     modifyRequestURL:requested=>{
      try{
       const address=new URL(requested,url);
       if(address.origin===proxyTemplate.origin&&address.pathname==='/stream')return address.href;
       if(!['http:','https:'].includes(address.protocol))return requested;
       const proxied=new URL(proxyTemplate.href);proxied.searchParams.set('url',address.href);return proxied.href;
      }catch{return requested;}
     }
    }),true);
   }
   engine.initialize(player,native?url:actual,false);
  }else if(looksHls && transport!=='ffmpeg' && window.IPTVPlaybackRoutePolicy?.preferNativeHls({format:'hls',hasNativeSupport:!!player.canPlayType('application/vnd.apple.mpegurl'),isTimeshift:playMode==='timeshift'||isTimeshiftUrl(url),wasHlsJs:nativeHlsTried.has(url)})){
   activeEngine='native-hls';nativeHlsTried.add(url);
   player.crossOrigin=native?'anonymous':null;
   player.src=actual;startPlaying();
  }else if(looksHls){
   activeEngine=transport==='ffmpeg'?'ffmpeg':'hlsjs';
   const H=await loadHlsLib();if(!isCurrent())return;
   if(!H.isSupported())throw Error('Thiết bị không hỗ trợ HLS MediaSource');
   const opts={...(window.IPTVProAdvanced?.hlsOptions?.()||{maxBufferLength:12,backBufferLength:6,maxBufferSize:18*1000*1000})};
   // Prefer early first-frame playback for ordinary LIVE; Timeshift/VOD retain
   // the larger history they require for seeking and independent buffering.
   if(playMode==='live'&&mediaInfo.mode!=='event'&&mediaInfo.mode!=='vod'&&transport!=='ffmpeg'){
    opts.startFragPrefetch=true;
    opts.liveSyncDurationCount=2;
    opts.liveMaxLatencyDurationCount=5;
   }
   if(mediaInfo.mode==='event'||mediaInfo.mode==='vod'||playMode==='timeshift'||transport==='ffmpeg'||isTimeshiftUrl(url)){
    opts.backBufferLength=Math.max(600,opts.backBufferLength||0);
    opts.maxBufferLength=Math.max(playMode==='timeshift'?60:transport==='ffmpeg'?25:45,opts.maxBufferLength||0);
    opts.maxMaxBufferLength=Math.max(playMode==='timeshift'?90:transport==='ffmpeg'?40:60,opts.maxMaxBufferLength||0);
    opts.liveSyncDurationCount=Math.min(2,Math.max(1,opts.liveSyncDurationCount||2));
   }
   const engine=new H({enableWorker:true,lowLatencyMode:false,capLevelToPlayerSize:true,...opts});
   hls=engine;
   // IMPORTANT: play() before MANIFEST_PARSED can reject NotSupportedError,
   // causing false failover and repeated manifestLoadError on valid VOD HLS.
   engine.on(H.Events.MANIFEST_PARSED,()=>{if(isCurrent()){playbackStartStage='manifest-ready';startPlaying();}});
   engine.on(H.Events.FRAG_BUFFERED,()=>{if(isCurrent())playbackStartStage='fragment-buffered';});
   engine.on(H.Events.LEVEL_LOADED,(_ev,data)=>{
    if(!isCurrent())return;
    const type=String(data?.details?.type||'').toLowerCase();
    const next=type==='event'?'event':type==='vod'||data?.details?.live===false?'vod':'live';
    mediaInfo={...mediaInfo,mode:next,seekable:next==='vod'||next==='event'};
    if(playMode==='live'&&next!=='live')playMode=next;
    document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));
   });
   engine.on(H.Events.LEVEL_SWITCHED,(_ev,data)=>{if(!isCurrent())return;const level=engine.levels?.[data.level];if(level)window.IPTVProAdvanced?.onQuality?.(current,{bitrate:level.bitrate||0,width:level.width||0,height:level.height||0});});
   engine.on(H.Events.ERROR,(_e,data)=>{
    if(!isCurrent()||!data.fatal)return;
    if(data.type===H.ErrorTypes.MEDIA_ERROR&&mediaRecoveryCount<1){mediaRecoveryCount++;engine.recoverMediaError();return;}
    const code=data.response?.code||data.networkDetails?.status||0;
    const detail=String(data.details||'unknown');
    const reason=code?`HLS ${detail} (HTTP ${code})`:`HLS ${detail}`;
    recoverPlayback(generation,reason,attempt);
   });
   engine.attachMedia(player);
   engine.loadSource(actual);
  }else{
   activeEngine=transport==='ffmpeg'?'ffmpeg':'html5';
   player.crossOrigin=native?'anonymous':null;player.src=actual;startPlaying();
  }
  $('#streamInfo').textContent=transport==='mpegts'?'MPEG-TS • Đang kết nối':transport==='ffmpeg'?'FFmpeg • Đang phát qua bộ tương thích':looksDash?'DASH • Đang kết nối':looksHls?'HLS • Đang kết nối':'Video • Đang kết nối';
  const started=Date.now();window.IPTVProAdvanced?.onLoadStart?.(current,url,started);
  // Fail fast instead of waiting 20 s before launching the compatibility
  // player. Do not shorten user-requested Timeshift initialization.
  // Warn without cancelling a healthy slow source at the old fixed 13-second threshold.
  // Network/decoder errors still fail immediately; a genuine blank startup gets a longer ceiling.
  startupNoteTimer=setTimeout(()=>{if(isCurrent()&&player.readyState<2)textStatus('Đang đợi dữ liệu video từ nguồn • '+(current?.name||'kênh'));},7500);
  failoverTimer=setTimeout(()=>{if(isCurrent()&&player.readyState<2)recoverPlayback(generation,playMode==='timeshift'?'Bộ đệm chưa tải kịp dữ liệu':'Kết nối quá thời gian',attempt);},playMode==='timeshift'?30000:transport==='mpegts'?12000:activeEngine==='native-hls'?6500:transport==='ffmpeg'?19000:24000);
  $('#playBtn').textContent='Ⅱ';textStatus('Đang kết nối: '+current.name);
 }
 function serverDenied(reason){return /\bHTTP\s+(?:401|403)\b/i.test(String(reason||''));}
 async function recoverPlayback(generation,reason,attempt=playAttemptSerial){
  // A delayed segment error may not auto-restart a user-paused player.
  if(pausedByUser||generation!==playGeneration||attempt!==playAttemptSerial)return;
  // A failed attempt is terminal. Clear its listeners before trying another engine.
  playAttemptSerial++;
  clearTimeout(failoverTimer);clearTimeout(stallTimer);clearTimeout(startupNoteTimer);
  if(hls){try{hls.destroy();}catch{}hls=null;}
  if(dash){try{dash.reset();}catch{}dash=null;}destroyMpegts();
  const oldFallback=ffmpegFallbackId;ffmpegFallbackId='';
  if(oldFallback)window.streamleaf?.stopPlaybackFallback?.(oldFallback).catch(()=>{});
  player.pause();player.removeAttribute('src');player.load();
  window.IPTVProAdvanced?.onStreamError?.(current,reason);
  const candidate=playCandidates[playCandidateIndex];
  // A cached FFmpeg-first route MUST be able to return to Chromium on failure.
  // Each candidate gets at most one attempt per transport; no retry loops.
  const canFfmpeg=playMode!=='timeshift'&&native&&!!window.streamleaf?.startPlaybackFallback&&
   /^https?:/i.test(candidate||'')&&!isInternalMediaUrl(candidate);
  if(activeEngine==='native-hls'&&candidate){
   textStatus('Đường phát native gặp lỗi, thử HLS.js cho cùng kênh…');
   try{await tryPlayback(candidate,generation,'relay');return;}
   catch(e){if(generation!==playGeneration)return;reason+='; HLS.js: '+String(e?.message||e).slice(0,110);}
  }
  const canAutoFfmpeg=canFfmpeg&&window.IPTVPlaybackRoutePolicy?.shouldAutoFfmpeg(reason,{mode:playMode,url:candidate,alreadyTried:attemptedTransports.has('ffmpeg')});
  const other=activeTransport==='mpegts'&&canFfmpeg&&!attemptedTransports.has('ffmpeg')&&!/\bHTTP\s*(?:401|403|404|410|429|451|503)\b/i.test(reason)?'ffmpeg':
    activeTransport==='mpegts'&&!attemptedTransports.has('relay')?'relay':
    activeTransport==='ffmpeg'&&!attemptedTransports.has('relay')?'relay':
    activeTransport==='relay'&&canAutoFfmpeg?'ffmpeg':null;
  if(other){
   playbackPreferenceUsed=false;
   ffmpegTried=other==='ffmpeg';
   textStatus((other==='ffmpeg'?'Trình phát lỗi, thử FFmpeg':other==='relay'?'Thử HTML5 trên cùng link':'Đang thử trình phát khác')+' trên cùng link…');
   try{await tryPlayback(candidate,generation,other);return;}
   catch(e){if(generation!==playGeneration)return;reason+='; '+other+': '+String(e?.message||e).slice(0,105);}
  }
  if(playCandidateIndex+1>=playCandidates.length){
   const msg=serverDenied(reason)?'Máy chủ từ chối tải video (HTTP 401/403). Snapshot và kiểm tra link không xác nhận phát được toàn bộ luồng.':`Không thể phát: ${reason}`;
   $('#streamInfo').textContent=msg;textStatus(msg);toast(msg,'warn');return;
  }
  playCandidateIndex++;ffmpegTried=false;playbackPreferenceUsed=false;attemptedTransports.clear();
  updateManualLinkPicker();
  const next=playCandidates[playCandidateIndex];
  toast('Auto Failover: thử link '+(playCandidateIndex+1)+'/'+playCandidates.length+' của '+current.name,'warn');
  try{await tryPlayback(next,generation);}catch(e){recoverPlayback(generation,e.message);}
 }
 async function playChannel(chId,override=null,opts={}){
  const intent=++playRequestSerial;
  const found=enabledChannels().find(c=>c.id===chId);if(!found){toast('Kênh không tồn tại hoặc nguồn đang tắt','warn');return;}
  if(window.IPTVProAdvanced?.allowChannel && !(await window.IPTVProAdvanced.allowChannel(found)))return;
  if(intent!==playRequestSerial)return;
  lastStoppedChannelId='';pausedFallbackNeedsRestart=false;pausedByUser=false;
  if(!opts.buffer)window.streamleaf?.stopTimeshift?.().catch(()=>{});
  playGeneration++;const generation=playGeneration;clearTimeout(failoverTimer);clearTimeout(stallTimer);clearTimeout(startupNoteTimer);ffmpegTried=false;
  const manualUrl=typeof opts.manualUrl==='string'?opts.manualUrl:'';
  playMode=opts.mode||(override?'catchup':'live');
  const allCandidates=override?[override]:currentAvailableLinks(found);
  // A manual selection must be one of this channel's known URLs, not an arbitrary URL.
  // It takes precedence over remembered playback and auto failover, without editing the playlist.
  const ordered=window.IPTVManualStreamSelection.prioritize(allCandidates,manualUrl);
  if(!ordered){toast('Link được chọn không còn trong danh sách của kênh','warn');return;}
  const pref=!override&&!manualUrl&&playMode==='live'?window.IPTVPlaybackPreference?.choose(found,allCandidates):null;
  playbackPreferenceUsed=!!pref?.remembered;
  playCandidates=manualUrl?ordered:(pref?.urls?.length?pref.urls:ordered);
  const selectedRoute=window.IPTVPlaybackRoutePolicy?.initialTransport(playCandidates[0],{savedTransport:pref?.remembered?pref.transport:'',savedDurationMs:found.lastStartupDurationMs})||'relay';
  const preferredTransport=native&&window.streamleaf?.startPlaybackFallback?selectedRoute:selectedRoute==='mpegts'?'mpegts':'relay';
  playCandidateIndex=0;attemptedTransports.clear();nativeHlsTried.clear();
  if(pref?.remembered&&found.lastPlayableEngine==='hlsjs'&&found.lastPlayableUrl===playCandidates[0])nativeHlsTried.add(playCandidates[0]);
  playbackProofUrl='';playbackProofTimer=0;
  current=found;channelRequestedAt=performance.now();firstFrameReported=false;firstFrameDurationMs=0;store.current=chId;mediaInfo={hls:false,mode:'unknown',seekable:false};document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));save();window.OpenIPTVCastUI?.onChannelChanged?.(found,playCandidates[0]);renderList(true);
  $('#playingTitle').textContent=found.name;$('#playingSubtitle').textContent=found.group+' • '+(playMode==='catchup'?'Xem lại':playMode==='timeshift'?'Tua lại '+(window.IPTVProAdvanced?.getReplayMinutes?.()||10)+' phút':'Đang phát trực tiếp');$('#playingIcon').textContent=found.name.slice(0,2).toUpperCase();$('#emptyPlayer').classList.add('hidden');$('#streamInfo').textContent='Đang kết nối...';updatePlayerFavorite();updateManualLinkPicker();
  window.IPTVExtras?.onChannel?.(found);window.IPTVProAdvanced?.onChannel?.(found,playMode);
  if(window.OpenIPTVDesktopTVPair?.isConnected?.()){
   if(hls){try{hls.stopLoad?.();hls.destroy();}catch{}hls=null;}
   if(dash){try{dash.pause?.();dash.reset();}catch{}dash=null;}
   const old=ffmpegFallbackId;ffmpegFallbackId='';if(old)window.streamleaf?.stopPlaybackFallback?.(old).catch(()=>{});
   try{player.pause();player.removeAttribute('src');player.load();}catch{}
   $('#streamInfo').textContent='● Đang điều khiển TV đã ghép đôi';
   $('#playingSubtitle').textContent=(found.group||'')+' • Phát trên TV';
   return; // Native video decoder must not start while TV is the owner.
  }
  try{await tryPlayback(playCandidates[0],generation,preferredTransport);}catch(e){recoverPlayback(generation,e.message);}
 }
 async function playToggle(){
  if(window.OpenIPTVDesktopTVPair?.isConnected?.())return window.OpenIPTVDesktopTVPair.toggle();
  if(!current){
   // Only the explicit Stop button clears the selected channel.
   const channels=sortedChannels(enabledChannels());
   const chosen=channels.find(ch=>ch.id===lastStoppedChannelId)||channels[0];
   if(chosen)await playChannel(chosen.id);
   else toast('Hãy thêm file M3U hoặc URL trước','warn');
   return;
  }
  if(player.paused){
   pausedByUser=false;
   if(pausedFallbackNeedsRestart){
    // FFmpeg's ingestion process was stopped while the current frame
    // stayed frozen. Restart that same selected channel on user Play.
    pausedFallbackNeedsRestart=false;
    await playChannel(current.id);
    return;
   }
   try{
    hls?.startLoad?.(-1);
    dash?.play?.();
    await player.play();
    $('#playBtn').textContent='Ⅱ';
    if(playMode==='live')$('#playingSubtitle').textContent=(current?.group||'')+' • Đang phát trực tiếp';
   }catch(e){
    // Failed resume must not silently restart background segment downloading.
    pausedByUser=true;
    try{hls?.stopLoad?.();}catch{}
    try{dash?.pause?.();}catch{}
    toast('Không thể phát: '+e.message,'error');
   }
   return;
  }
  // Pause is NOT Stop: keep HTMLVideoElement attached, leaving its decoded
  // current frame visible and the channel selected. Never call load(),
  // remove src, clear current, or show #emptyPlayer from this action.
  pausedByUser=true;
  player.pause();
  clearTimeout(stallTimer);clearTimeout(failoverTimer);clearTimeout(startupNoteTimer);
  try{hls?.stopLoad?.();}catch{}
  try{
   // dash.js schedules segments WHILE paused by default. Opt out before pause.
   dash?.updateSettings?.({streaming:{scheduling:{scheduleWhilePaused:false}}});
   dash?.pause?.();
  }catch(e){console.warn('Pause DASH:',e);}
  // FFmpeg runs outside the browser video element. Stop that separate
  // network/decoder process without destroying the paused MSE video frame.
  if(playMode==='live'&&activeTransport==='ffmpeg'&&ffmpegFallbackId){
   const oldId=ffmpegFallbackId;ffmpegFallbackId='';
   pausedFallbackNeedsRestart=true;
   window.streamleaf?.stopPlaybackFallback?.(oldId).catch(()=>{});
  }
  $('#playBtn').textContent='▶';
  if(playMode==='live')$('#playingSubtitle').textContent=(current?.group||'')+' • Tạm dừng';
  $('#streamInfo').textContent='⏸ Đã tạm dừng · khung hình được giữ nguyên';
  textStatus('Tạm dừng: '+(current?.name||'kênh')+' · bấm ▶ để tiếp tục');
 }
 function switchChannel(dir){const all=sortedChannels(enabledChannels());if(!all.length)return;let index=all.findIndex(c=>c.id===current?.id);index=(index+dir+all.length)%all.length;playChannel(all[index].id);}
 function updateTaskUI(type){
  const task=tasks[type],panel=$('#task-'+type);if(!panel)return;
  panel.classList.toggle('hidden',!task.visible);
  const bar=panel.querySelector('.task-meter');bar.style.width=`${task.total?Math.round(task.done/task.total*100):0}%`;
  panel.querySelector('.task-count').textContent=`${task.done}/${task.total} kênh`;
  const cancelBtn=panel.querySelector('.task-cancel');cancelBtn.textContent=task.running?(task.cancel?'Đang dừng…':'Hủy tác vụ'):'Đóng';cancelBtn.disabled=task.running&&task.cancel;
  const status=panel.querySelector('.task-status');
  if(type==='check'){
   status.textContent=`● Sống ${task.alive}  ·  ● Die ${task.dead}  ·  ● Chưa rõ ${task.uncertain}`;
   const feed=panel.querySelector('.task-live-results');feed.replaceChildren();
   for(const item of task.results.slice(-12).reverse()){
    const row=document.createElement('div');row.className='check-result '+item.status;
    const label=document.createElement('span');label.className='check-result-label';label.textContent=item.status==='alive'?'Sống':item.status==='dead'?'Die':'Chưa rõ';
    const name=document.createElement('span');name.className='check-result-name';name.textContent=item.name;name.title=item.name+' · '+(item.reason||'');
    row.append(label,name);feed.append(row);
   }
  }else{status.textContent=`✓ Mới ${task.success}  ·  ↻ Giữ ảnh ${task.skipped||0}  ·  ✕ Lỗi ${task.failed}`;panel.querySelector('.task-current').textContent=task.latest||'Đang chuẩn bị chụp ảnh…';}
  panel.querySelector('.task-title').textContent=(type==='check'?'Kiểm tra link trực tiếp':'Chụp Snapshot')+(task.workers?' · '+task.workers+' luồng':'')+(task.running?' · Đang chạy':task.cancel?' · Đã dừng':' · Hoàn tất');
  const summaries=Object.values(tasks).filter(t=>t.visible).map(t=>`${t.done}/${t.total} kênh${t.running?' · đang chạy':' · xong'}`);
  const summary=$('#taskDockSummary');if(summary)summary.textContent=summaries.join(' | ')||'Không có tác vụ';
 }
 function taskStart(type,total){const t=tasks[type];t.running=true;t.cancel=false;t.visible=true;t.total=total;t.done=0;t.alive=0;t.dead=0;t.uncertain=0;t.success=0;t.failed=0;t.skipped=0;t.results=[];t.latest='';t.workers=0;updateTaskUI(type);$('#taskDock').classList.remove('hidden');}
 function taskEnd(type){const t=tasks[type];t.running=false;updateTaskUI(type);if(!Object.values(tasks).some(x=>x.visible))$('#taskDock').classList.add('hidden');}
 function requestCancel(type){const t=tasks[type];if(t.running){t.cancel=true;textStatus(`Đã yêu cầu hủy ${type==='check'?'kiểm tra link':'chụp ảnh'} sau lượt hiện tại`);}else{t.visible=false;updateTaskUI(type);if(!Object.values(tasks).some(x=>x.visible))$('#taskDock').classList.add('hidden');}}
 function markPlaybackVerified(){
  const ch=current,url=playCandidates[playCandidateIndex];
  if(!ch||!url||player.readyState<2||player.paused||!(player.videoWidth>0||player.audioTracks?.length>0))return;
  const proofKey=ch.id+'|'+activeTransport+'|'+url;
  if(playbackProofUrl===proofKey&&Date.now()-playbackProofTimer<60000)return;
  playbackProofTimer=Date.now();playbackProofUrl=proofKey;
  ch.lastPlayableUrl=url;ch.lastPlayableTransport=['ffmpeg','mpegts'].includes(activeTransport)?activeTransport:'relay';ch.lastPlayableEngine=activeEngine;
  if(activeTransport==='mpegts')ch.lastPlayableFormat='ts';
   if(activeTransport==='relay')ch.lastPlayableFormat=mediaInfo.dash?'dash':mediaInfo.hls?'hls':window.IPTVStartupPolicy?.knownMedia?.(url)?.format==='mp4'?'mp4':'';
  ch.lastPlaybackAt=new Date().toISOString();
  recentCore.record(store,ch,favCore.key);
  if(firstFrameDurationMs>0)ch.lastStartupDurationMs=Math.round(firstFrameDurationMs);
  if(ch.url===url){ch.status='alive';ch.reason='Đã phát được video thực tế trong trình phát';ch.checkedAt=ch.lastPlaybackAt;updateChannelStatus(ch);}
  else{ch.status='uncertain';ch.reason='Đang phát qua link dự phòng; link chính cần kiểm tra lại';ch.checkedAt=ch.lastPlaybackAt;updateChannelStatus(ch);}
  window.IPTVProAdvanced?.onCheck?.(ch,{status:ch.status,reason:ch.reason});
  favCore.sync(store);save();
  if(filter!=='all')renderList(true);
 }
 function updateChannelStatus(ch){
  const row=[...document.querySelectorAll('.channel-item')].find(x=>x.dataset.channelId===ch.id);
  if(!row)return;
  const dot=row.querySelector('.mini-pill'),label=row.querySelector('.channel-health');
  if(dot)dot.className='mini-pill '+(ch.status||'');
  if(label){label.className='channel-health '+(ch.status||'');label.textContent=ch.status==='alive'?'Sống · ':ch.status==='dead'?'Die · ':'Chưa rõ · ';label.title=(ch.reason||'')+(ch.checkedAt?' • Kiểm tra: '+new Date(ch.checkedAt).toLocaleString('vi-VN'):'');}
 }
 async function checkOne(url){if(!native){try{const r=await fetch(url,{method:'GET',signal:AbortSignal.timeout(7000)});if(!r.ok)return {status:'uncertain',reason:'HTTP '+r.status+' • Trình duyệt không đủ bằng chứng để kết luận Die'};return {status:'uncertain',reason:'Trình duyệt không kiểm tra được segment do CORS'};}catch(e){return {status:'uncertain',reason:'CORS / mạng: '+e.message};}}return await window.streamleaf.check(url);}
 async function checkAll(){const t=tasks.check;if(t.running)return toast('Kiểm tra link đang chạy rồi','warn');const all=enabledChannels().slice();if(!all.length)return toast('Chưa có kênh để kiểm tra','warn');
  if(!native)toast('Kiểm tra sâu chỉ có trên bản cài. Trình duyệt có thể bị giới hạn CORS.','warn');
  // Snapshot the configured limit at job start: modifying Settings affects only the next run.
  const concurrency=Math.min(safeConcurrency(store.checkConcurrency),all.length);
  taskStart('check',all.length);t.workers=concurrency;updateTaskUI('check');let cursor=0;
  textStatus(`Kiểm tra ${all.length} kênh với ${concurrency} luồng song song`);
  async function worker(){while(!t.cancel&&cursor<all.length){const ch=all[cursor++];let result;
    try{result=await checkOne(ch.url);}catch(e){result={status:'uncertain',reason:e.message};}
    // Do not classify a failure as a dead stream unless the checker returns dead.
    const verifiedUrl=ch.lastPlayableUrl===ch.url;
    const recentPlayback=verifiedUrl&&ch.lastPlaybackAt&&Date.now()-Date.parse(ch.lastPlaybackAt)<5*60*1000;
    if(result.status==='dead'&&recentPlayback){result={...result,status:'alive',reason:'Đã phát được thực tế gần đây; kết quả kiểm tra HTTP mâu thuẫn, giữ Sống'};}
    // Không hạ Sống xuống Die khi chỉ có bằng chứng HTTP yếu hoặc mạng chập chờn.
    if(result.status==='dead'&&ch.status==='alive'&&!result.confirmedDead){result={...result,status:'uncertain',reason:'Nguồn từng phát được; kiểm tra lại trước khi kết luận Die: '+(result.reason||'')};}
    ch.status=['alive','dead'].includes(result.status)?result.status:'uncertain';ch.reason=result.reason||'';ch.checkedAt=new Date().toISOString();
    if(ch.status==='alive')t.alive++;else if(ch.status==='dead')t.dead++;else t.uncertain++;
    t.done++;t.results.push({name:ch.name,status:ch.status,reason:ch.reason});
    updateChannelStatus(ch);updateTaskUI('check');window.IPTVProAdvanced?.onCheck?.(ch,result);
    if(t.done%6===0){save();if(filter==='alive')renderList(true);}
  }}
  try{await Promise.all(Array.from({length:concurrency},()=>worker()));save();renderList(true);updateTaskUI('check');toast(`Đã kiểm tra ${t.done} kênh: ${t.alive} sống • ${t.dead} die • ${t.uncertain} chưa rõ`);textStatus(`Link: ${t.alive} sống / ${t.dead} die / ${t.uncertain} chưa rõ`);}finally{taskEnd('check');}
 }
 async function snapshotOne(c,quiet=false){let result;
  if(native){try{result=await window.streamleaf.snapshot(c.url,c.name);}catch(e){/* A visible, playable channel can be captured directly without FFmpeg. */}}
  if(!result&&current?.id===c.id&&player.videoWidth){try{const cvs=document.createElement('canvas');cvs.width=480;cvs.height=Math.max(1,Math.round(480*player.videoHeight/player.videoWidth));cvs.getContext('2d').drawImage(player,0,0,cvs.width,cvs.height);result={data:cvs.toDataURL('image/jpeg',.68),method:'Video'};}catch{}}
  if(!result)throw Error('Không lấy được khung hình (luồng lỗi, bảo vệ nội dung hoặc CORS)');
  const stored={name:c.name,date:new Date().toLocaleString('vi-VN'),method:result.method||'FFmpeg'};
  if(result.file)stored.file=result.file;
  if(result.data)stored.data=result.data;
  store.snapshots[c.url]=stored;if(!quiet)save();if(!quiet){renderShots();renderList();toast('Đã chụp ảnh kênh '+c.name);}return result;
 }
 async function snapshotAll(){

  const t=tasks.shots;
  if(t.running)return toast('Đang chụp toàn bộ kênh rồi','warn');
  const all=enabledChannels().slice();if(!all.length)return toast('Chưa có kênh để chụp','warn');
  if(!native)return toast('Chụp hàng loạt chỉ hỗ trợ trong ứng dụng đã đóng gói (có FFmpeg).','warn');
  const seen=new Set(),pending=[];let skipped=0;
  for(const c of all){
    if(seen.has(c.url)||(store.snapshotSkipExisting&&!!(store.snapshots[c.url]?.file||store.snapshots[c.url]?.data))){skipped++;continue;}
    seen.add(c.url);pending.push(c);
  }
  if(!pending.length)return toast(`Đã có đủ ảnh (${skipped} kênh). Tắt “Bỏ qua kênh đã có ảnh” nếu muốn chụp mới.`);
  const workers=Math.min(safeConcurrency(store.snapshotConcurrency),pending.length);
  if(pending.length>70&&!confirm(`Cần chụp ${pending.length} luồng (${skipped} kênh giữ ảnh cũ), dùng ${workers} luồng FFmpeg cùng lúc. Tiếp tục?`))return;
  taskStart('shots',all.length);t.workers=workers;t.skipped=skipped;t.done=skipped;
  t.latest=`Đang chuẩn bị ${workers} tác vụ chụp ảnh`;updateTaskUI('shots');
  let cursor=0,lastRefresh=0;
  function refreshProgress(force=false){
    const now=Date.now();if(force||now-lastRefresh>850){
      save();if(page==='shots')renderShots();if(page==='tv')renderList(true);lastRefresh=now;
    }
  }
  async function worker(){
    while(!t.cancel&&cursor<pending.length){
      const c=pending[cursor++];t.latest=`Đang chụp ${c.name} • ${workers} luồng song song`;
      try{await snapshotOne(c,true);t.success++;}
      catch(e){t.failed++;console.warn('Snapshot:',c.name,String(e.message||e));}
      t.done++;updateTaskUI('shots');refreshProgress();
    }
  }
  try{
    await Promise.all(Array.from({length:workers},()=>worker()));
    refreshProgress(true);updateTaskUI('shots');
    toast(`${t.cancel?'Đã dừng':'Đã xong'}: ${t.success} ảnh mới • ${t.skipped} ảnh giữ nguyên • ${t.failed} lỗi`);
    textStatus(`Snapshot ${t.done}/${t.total}: ${t.success} ảnh mới, ${t.skipped} giữ nguyên, ${t.failed} lỗi`);
  }finally{taskEnd('shots');}
 }
 async function exportFile(){const all=sortedChannels(enabledChannels());if(!all.length)return toast('Không có kênh để xuất','warn');const content=core.exportM3U(all,false,{respectGroups:true});
  try{if(native){const dest=await window.streamleaf.export('iptv.m3u',content);if(dest)toast('Đã lưu: '+dest);}else{const blob=new Blob([content],{type:'audio/x-mpegurl;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='iptv.m3u';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);toast('Đã tải file iptv.m3u');}}
  catch(e){toast('Không xuất được: '+e.message,'error');}}
 async function modalSubmit(){if(!modalHandler)return;const cb=modalHandler;const button=$('#modalConfirm');button.disabled=true;const old=button.textContent;button.textContent='Đang xử lý...';try{await cb();closeModal();}catch(e){toast(e.message||String(e),'error');}finally{button.disabled=false;button.textContent=old;}}
 function wire(){
  const bind=(ids,fn)=>ids.forEach(id=>$('#'+id)?.addEventListener('click',fn));
  bind(['fileBtn','emptyFileBtn','sourcesFileBtn'],loadFile);bind(['urlBtn','emptyUrlBtn','sourcesUrlBtn'],openURL);
  bind(['sourceCheckAllBtn','quickChecks'],checkAll);bind(['quickShots','shotsAllBtn'],snapshotAll);bind(['quickExport','exportNav'],exportFile);
  document.querySelectorAll('[data-nav-to]').forEach(button=>button.addEventListener('click',()=>{
    const destination=button.dataset.navTo;
    document.querySelector(`.nav[data-page="${destination}"]`)?.click();
    const target=button.dataset.navTarget;
    if(target)document.getElementById(target)?.scrollIntoView({block:'start',behavior:'smooth'});
  }));
  bind(['folderCreateBtn','newFolderFromList'],createFolder);bind(['expandFolderBtn'],()=>{const pos=preserveListScroll();store.collapsedGroups=[];save();renderList();restoreListScroll(pos);});bind(['collapseFolderBtn'],()=>{const pos=preserveListScroll();store.collapsedGroups=groupNames();save();renderList();restoreListScroll(pos);});
  bind(['castBtn'],()=>{const ch=currentChannel();window.OpenIPTVCastUI?.open?.(ch,playCandidates[playCandidateIndex]||ch?.url);});
  bind(['refreshAllBtn'],refreshAll);bind(['prevBtn'],()=>switchChannel(-1));bind(['nextBtn'],()=>switchChannel(1));bind(['stopBtn'],stopPlayer);bind(['playBtn'],playToggle);
  bind(['favCurrentBtn'],()=>{const channel=currentChannel();if(channel)favorite(channel);});
  bind(['shotBtn'],async()=>{if(!current)return toast('Chưa chọn kênh','warn');try{await snapshotOne(current);}catch(e){toast(e.message,'error');}});
  bind(['fullscreenBtn'],()=>{if(!document.fullscreenElement){void window.OpenIPTVAutoPiP?.exit?.();$('#playerBox').requestFullscreen?.();}else document.exitFullscreen?.();});
  bind(['modalClose','modalCancel'],closeModal);bind(['modalConfirm'],modalSubmit);bind(['cancelCheckBtn'],()=>requestCancel('check'));bind(['cancelShotsBtn'],()=>requestCancel('shots'));const dock=$('#taskDock');
  function toggleTaskPopup(forceClosed=false){const collapsed=forceClosed?true:!dock.classList.contains('collapsed');dock.classList.toggle('collapsed',collapsed);const btn=$('#taskDockMinimize');btn.setAttribute('aria-expanded',String(!collapsed));btn.textContent=collapsed?'▴':'▾';}
  bind(['taskDockMinimize'],()=>toggleTaskPopup());
  dock.querySelector('.task-dock-head')?.addEventListener('click',e=>{if(!e.target.closest('button'))toggleTaskPopup();});
  document.addEventListener('pointerdown',e=>{if(!dock.classList.contains('collapsed')&&!dock.contains(e.target))toggleTaskPopup(true);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dock.classList.contains('collapsed'))toggleTaskPopup(true);});
  $$('.nav[data-page]').forEach(x=>x.addEventListener('click',()=>setPage(x.dataset.page)));
  $$('[data-source-jump]').forEach(x=>x.addEventListener('click',()=>{const target=document.getElementById(x.dataset.sourceJump);target?.scrollIntoView({behavior:'smooth',block:'start'});}));
  $$('.filter-tab').forEach(x=>x.addEventListener('click',()=>{filter=x.dataset.filter;$$('.filter-tab').forEach(y=>y.classList.toggle('active',x===y));renderList();}));
  $('#channelBatchMove')?.addEventListener('click',()=>{
    const group=$('#channelBatchFolder').value;
    if(!selectedChannelIds.size)return toast('Hãy chọn ít nhất một kênh','warn');
    const input=$('#channelBatchPosition'),raw=input?.value.trim()||'';
    const position=raw===''?null:Number(raw);
    if(position!==null&&(!Number.isSafeInteger(position)||position<1)){
     toast('Vị trí phải là số nguyên từ 1 trở lên hoặc để trống để chuyển xuống cuối','warn');input?.focus();return;
    }
    if(applyChannelMove([...selectedChannelIds],group,{index:position===null?null:position-1})&&input)input.value='';
  });
  $('#channelClearSelection')?.addEventListener('click',()=>{selectedChannelIds.clear();lastSelectionAnchorId='';renderList(true);});
  $('#channelList').addEventListener('dragover',e=>{
    if(!hasChannelPayload(e))return;
    const list=e.currentTarget,rect=list.getBoundingClientRect(),edge=48;
    if(e.clientY<rect.top+edge)list.scrollTop-=20;
    else if(e.clientY>rect.bottom-edge)list.scrollTop+=20;
  });
  // Snapshot and health-check limits are independent, persistent, and bounded to 1–32.
  const concurrencyControls=[
    {key:'snapshotConcurrency',ids:['snapshotWorkersQuick','snapshotWorkersSetting']},
    {key:'checkConcurrency',ids:['checkWorkersSetting','checkWorkersQuick']}
  ];
  for(const {key,ids} of concurrencyControls){
    const controls=ids.map(id=>$('#'+id)).filter(Boolean);
    const select=$('#'+(key==='snapshotConcurrency'?'snapshotConcurrencySelect':'checkConcurrencySelect'));
    const statusId=key==='snapshotConcurrency'?'snapshotConcurrencyState':'checkConcurrencyState';
    function updateChoice(value){
      if(select)select.value=String(value);
      const label=$('#'+statusId);if(label)label.textContent='Đang dùng: '+value+' luồng';
    }
    updateChoice(store[key]);
    select?.addEventListener('change',()=>{
      const n=safeConcurrency(select.value);
      store[key]=n;controls.forEach(control=>{control.value=String(n);});
      updateChoice(n);save();
    });
    for(const el of controls){
      el.value=String(store[key]);
      el.addEventListener('change',()=>{
        const n=safeConcurrency(el.value);
        store[key]=n;
        controls.forEach(control=>{control.value=String(n);});
        updateChoice(n);
        save();
      });
    }
  }
  const snapshotSkipControls=['snapshotSkipQuick','snapshotSkipSetting'];
  for(const id of snapshotSkipControls){const el=$('#'+id);if(!el)continue;el.checked=store.snapshotSkipExisting;el.addEventListener('change',()=>{
    store.snapshotSkipExisting=el.checked;snapshotSkipControls.forEach(x=>{if($('#'+x))$('#'+x).checked=el.checked;});save();
  });}
  $('#tryFfmpegBtn')?.addEventListener('click',async()=>{
   const ch=current;if(!ch)return toast('Hãy chọn một kênh trước','warn');
   if(!native||!window.streamleaf?.startPlaybackFallback)return toast('FFmpeg chỉ hỗ trợ bản desktop Full','warn');
   const url=playCandidates[playCandidateIndex]||ch.url;
   if(!/^https?:/i.test(url)||isInternalMediaUrl(url))return toast('Nguồn này không hỗ trợ phát qua FFmpeg','warn');
   ffmpegTried=true;const generation=playGeneration;
   textStatus('Đang thử FFmpeg cho '+ch.name);
   try{await tryPlayback(url,generation,'ffmpeg');}
   catch(e){if(generation===playGeneration)recoverPlayback(generation,'FFmpeg: '+String(e?.message||e));}
  });
  $('#searchBox').addEventListener('input',renderList);$('#volume').addEventListener('input',e=>{player.volume=e.target.value/100;store.volume=player.volume;save();window.OpenIPTVDesktopTVPair?.onVolume?.(player.volume,player.muted);});
  document.addEventListener('openiptv:remote-player-attached',()=>{
   if(hls){try{hls.stopLoad?.();hls.destroy();}catch{}hls=null;}
   if(dash){try{dash.pause?.();dash.reset();}catch{}dash=null;}
   const old=ffmpegFallbackId;ffmpegFallbackId='';if(old)window.streamleaf?.stopPlaybackFallback?.(old).catch(()=>{});
   try{player.pause();player.removeAttribute('src');player.load();}catch{}
  });
  player.volume=store.volume??.8;$('#volume').value=Math.round(player.volume*100);
  const fit=['contain','cover','fill','none'].includes(store.videoFit)?store.videoFit:'contain';$('#videoFit').value=fit;player.className='fit-'+fit;$('#videoFit').addEventListener('change',e=>{store.videoFit=e.target.value;player.className='fit-'+store.videoFit;save();});
  player.addEventListener('playing',()=>{if(!current)return;if(pausedByUser){player.pause();return;}clearTimeout(failoverTimer);clearTimeout(stallTimer);clearTimeout(startupNoteTimer);markPlaybackVerified();window.IPTVProAdvanced?.onPlaying?.(current,playCandidates[playCandidateIndex]);$('#streamInfo').textContent='● Đang phát';$('#playBtn').textContent='Ⅱ';textStatus('Đang xem: '+(current?.name||''));});
  player.addEventListener('timeupdate',markPlaybackVerified);
  player.addEventListener('loadeddata',()=>{if(!current)return;clearTimeout(startupNoteTimer);
   if(current&&!firstFrameReported&&channelRequestedAt){
    firstFrameReported=true;
    firstFrameDurationMs=performance.now()-channelRequestedAt;
    const seconds=(firstFrameDurationMs/1000).toFixed(1);
    $('#streamInfo').textContent='● Có hình sau '+seconds+' giây ('+(activeTransport==='ffmpeg'?'FFmpeg':'trình phát trực tiếp')+')';
    console.info('IPTV playback first frame',seconds+'s',activeTransport,'phase='+playbackStartStage); // no stream URLs/tokens
    textStatus('Đang xem: '+current.name+' • Lên hình '+seconds+'s • '+(activeTransport==='ffmpeg'?'FFmpeg':'HLS/DASH')+(playbackPreferenceUsed?' • Đường phát đã nhớ':''));
   }
   // Record genuine first decoded frame immediately. Waiting 1.5s loses the
   // cache when the viewer switches away quickly after picture appears.
   markPlaybackVerified();
  });
  player.addEventListener('pause',()=>{clearTimeout(stallTimer);$('#playBtn').textContent='▶';});
  player.addEventListener('error',()=>{if(pausedByUser)return;if(current&&player.currentSrc&&(hls||dash||player.hasAttribute('src'))){$('#streamInfo').textContent='Lỗi phát video';recoverPlayback(playGeneration,'Trình phát báo lỗi',playAttemptSerial);}});
  player.addEventListener('waiting',()=>{if(pausedByUser)return;const token=playGeneration,attempt=playAttemptSerial;const delay=playMode==='timeshift'?20000:12000;clearTimeout(stallTimer);stallTimer=setTimeout(()=>{if(token===playGeneration&&attempt===playAttemptSerial&&current&&!!player.currentSrc&&!player.paused&&player.readyState<3)recoverPlayback(token,'Đứng hình quá '+Math.round(delay/1000)+' giây',attempt);},delay);});
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.target.tagName==='INPUT')return;if(e.key===' '){e.preventDefault();playToggle();}});
  const chooser=document.createElement('input');chooser.type='file';chooser.id='fileInput';chooser.accept='.m3u,.m3u8,.txt';chooser.className='hidden';chooser.addEventListener('change',async()=>{await importFromInput(chooser.files?.[0]);chooser.value='';});document.body.append(chooser);
 }
 $('#manualStreamSelect')?.addEventListener('change',e=>{
  const ch=current,url=e.currentTarget.value;if(!ch||!url)return;
  if(playMode!=='live'){toast('Đã chuyển về phát trực tiếp theo link được chọn');}
  void playChannel(ch.id,null,{manualUrl:url,mode:'live'});
 });
 updateManualLinkPicker();
 window.IPTVState=Object.freeze({getStore:()=>store,isBusy:()=>tasks.check.running||tasks.shots.running,getCurrent:()=>current,getChannels:()=>enabledChannels(),openSnapshotChannel,setPage,save,toast,textStatus,player,renderList,render,playChannel,stopPlayer,refreshManualLinks:updateManualLinkPicker,openModal,loadHlsLib,getPlayMode:()=>playMode,getMediaInfo:()=>mediaInfo,tryNextLink:()=>{if(playMode!=='live'||playCandidateIndex+1>=playCandidates.length)return false;void recoverPlayback(playGeneration,'Giám sát xác nhận đứng hình');return true;},importSource:addSource});
 wire();render();if(upgradedChecker)save();
 $('#appMode').textContent=native?'Ứng dụng • Desktop':'Bản xem thử • Web';
 $('#miniStatus').textContent=native?'Không cần Python / VLC':'Safari phát HLS trực tiếp';
 if(native)window.streamleaf.capabilities().then(x=>{snapshotBase=x.snapshotBase||'';window.__snapshotBase=snapshotBase;render();textStatus('Sẵn sàng • FFmpeg tích hợp: '+(x.ffmpegExists?'đã sẵn sàng':'không khả dụng; vui lòng cài lại bản Full'));}).catch(()=>textStatus('Không đọc được thông tin môi trường'));
 else textStatus('Bản trình duyệt: URL/CORS và snapshot hàng loạt có giới hạn');
})();
