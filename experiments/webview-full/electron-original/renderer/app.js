'use strict';
(()=>{
 const native=!!window.streamleaf;
 const core=window.StreamLeafCore;
 const favCore=window.OpenIPTVFavorites;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const seed={sources:[],channels:[],favorites:[],snapshots:{},folders:[],groupOrder:[],collapsedGroups:[],current:'',volume:.8,videoFit:'contain'};
 let store;
 try{store={...seed,...JSON.parse(localStorage.getItem('open-iptv-pro-4')||localStorage.getItem('streamleaf-3')||'{}')};}catch{store={...seed};}
 if(!Array.isArray(store.channels))store.channels=[];
 if(!Array.isArray(store.favorites))store.favorites=[];
 if(!Array.isArray(store.sources))store.sources=[];
 if(!store.snapshots||typeof store.snapshots!=='object')store.snapshots={};
 if(!Array.isArray(store.folders))store.folders=[];
 if(!Array.isArray(store.groupOrder))store.groupOrder=[];
 if(!Array.isArray(store.collapsedGroups))store.collapsedGroups=[];
 // Each job has its own saved concurrency. Never trust stale/corrupt localStorage values.
 const safeConcurrency=(value,defaultValue=4)=>{
  const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=32?n:defaultValue;
 };
 store.snapshotConcurrency=safeConcurrency(store.snapshotConcurrency);
 store.checkConcurrency=safeConcurrency(store.checkConcurrency);
 if(typeof store.snapshotSkipExisting!=='boolean')store.snapshotSkipExisting=true;
 favCore.migrate(store);
 // The previous checker produced false Die results for HLS streams and Range rejections.
 // Do not keep those historical negative classifications after this checker upgrade.
 const upgradedChecker=store.checkerVersion!==2;
 if(upgradedChecker){for(const ch of store.channels){if(ch.status==='dead'){ch.status='uncertain';ch.reason='Die từ bản kiểm tra cũ chưa đáng tin; cần kiểm tra lại';ch.checkedAt='';}}store.checkerVersion=2;}

 let playbackProofTimer=0,playbackProofUrl='',filter='all',page='tv',hls=null,current=null,playGeneration=0,playCandidates=[],playCandidateIndex=0,playMode='live',failoverTimer=null,modalHandler=null,snapshotBase='',mediaRecoveryCount=0;
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
 function save(){try{localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));}catch(e){console.warn('Storage full',e);}}
 function textStatus(t){$('#footerText').textContent=t;$('#miniStatus').textContent=t;}
 function toast(message,type='ok'){const node=document.createElement('div');node.className='toast'+(type==='error'?' err':type==='warn'?' warn':'');node.textContent=message;$('#toastArea').append(node);setTimeout(()=>node.remove(),5500);}
 function setPage(p){if(p==='collector')p='sources';if(window.IPTVProAdvanced?.canEnterPage?.(p)===false){toast('Trang này bị khóa trong hồ sơ trẻ em','warn');return;}const last=page;page=p;if(last!==p){const scrolling=$('.content');if(scrolling)scrolling.scrollTop=0;}$$('.nav[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));$$('.page').forEach(x=>x.classList.remove('active-page'));$('#page-'+p)?.classList.add('active-page');$('#pageTitle').textContent=({tv:'Xem truyền hình',fav:'Kênh yêu thích',shots:'Ảnh chụp kênh',sources:'Quản lý nguồn',folders:'Thư mục kênh',epg:'Lịch phát sóng EPG',settings:'Cài đặt'})[p]||'Open IPTV Pro';render();window.IPTVExtras?.onPage?.(p);window.IPTVProAdvanced?.onPage?.(p,last);window.IPTVCollectorUI?.refresh?.();}
 function closeModal(){$('#modal').classList.add('hidden');modalHandler=null;}
 function openModal(title,html,onSubmit,confirmText='Xác nhận'){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalConfirm').textContent=confirmText;modalHandler=onSubmit;$('#modal').classList.remove('hidden');setTimeout(()=>$('#modalBody input:not([type=radio])')?.focus(),40);}
 function groupName(c){return core.cleanGroup?core.cleanGroup(c.group||'Khác'):(c.group||'Khác').replace(/\s*\|\s*Kiểm tra:.+$/i,'').trim()||'Khác';}
 function visibleGroupOrder(){const seen=new Set(),ordered=[];for(const c of enabledChannels()){const g=groupName(c);if(!seen.has(g)){seen.add(g);ordered.push(g);}}return ordered;}
 function syncGroupOrder(){const visible=visibleGroupOrder();const keep=new Set([...store.folders,...visible]);const ordered=[];for(const g of store.groupOrder){if(keep.has(g)&&!ordered.includes(g))ordered.push(g);}for(const g of [...store.folders,...visible]){if(!ordered.includes(g))ordered.push(g);}store.groupOrder=ordered;return ordered;}
 function groupNames(){return syncGroupOrder().slice();}
 function groupCount(name){return enabledChannels().filter(c=>groupName(c)===name).length;}
 function preserveListScroll(){const list=$('#channelList');return {top:list?.scrollTop||0,left:list?.scrollLeft||0};}
 function restoreListScroll(pos){const list=$('#channelList');if(!list||!pos)return;requestAnimationFrame(()=>{list.scrollTop=Math.min(pos.top,Math.max(0,list.scrollHeight-list.clientHeight));list.scrollLeft=Math.min(pos.left,Math.max(0,list.scrollWidth-list.clientWidth));});}
 function scrollGroupIntoView(group){requestAnimationFrame(()=>{document.querySelectorAll('.folder-header').forEach(x=>{if(x.dataset.group===group)x.scrollIntoView({block:'nearest'});});});}
 function reorderGroup(moved,target){if(window.IPTVProAdvanced?.canEdit?.()===false)return;if(!moved||!target||moved===target)return;const order=groupNames().filter(Boolean);const from=order.indexOf(moved),to=order.indexOf(target);if(from<0||to<0)return;order.splice(from,1);order.splice(to,0,moved);store.groupOrder=order.concat(store.groupOrder.filter(g=>!order.includes(g)));save();renderList(true);renderFolders();toast(`Đã sắp xếp: ${moved} → vị trí mới`);}
 const CHANNEL_DRAG_MIME='application/x-open-iptv-channel';
 let draggedChannelId='';
 function hasChannelPayload(e){return !!draggedChannelId||Array.from(e.dataTransfer?.types||[]).includes(CHANNEL_DRAG_MIME);}
 function moveDroppedChannel(e,group){
  if(!hasChannelPayload(e))return false;
  e.preventDefault();e.stopPropagation();
  const id=e.dataTransfer?.getData(CHANNEL_DRAG_MIME)||draggedChannelId;
  draggedChannelId='';
  const channel=store.channels.find(c=>c.id===id);
  if(!channel){toast('Không tìm thấy kênh để chuyển','warn');return true;}
  if(window.IPTVProAdvanced?.canEdit?.()===false){toast('Hồ sơ trẻ em không được chuyển kênh','warn');return true;}
  if(!groupNames().includes(group)){toast('Thư mục đích không tồn tại','warn');return true;}
  const from=groupName(channel);
  if(from===group)return true;
  channel.group=group;
  save();renderList(true);renderFolders();
  if(page==='shots')renderShots();
  toast(`Đã chuyển ${channel.name} từ ${from} sang ${group}`);
  return true;
 }
 function channelDragStart(e,c){
  if(window.IPTVProAdvanced?.canEdit?.()===false){e.preventDefault();return;}
  if(e.target.closest('button')){e.preventDefault();return;}
  draggedChannelId=c.id;e.dataTransfer?.setData(CHANNEL_DRAG_MIME,c.id);
  e.dataTransfer.effectAllowed='move';e.currentTarget.classList.add('channel-dragging');
 }
 function folderChannelDragOver(e,element){
  if(!hasChannelPayload(e))return false;
  e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='move';element.classList.add('channel-drop-target');return true;
 }
 function snapshotSrc(s){if(!s)return '';if(s.file)return snapshotBase?snapshotBase+encodeURIComponent(s.file):'';return s.data||'';}
 function channelThumb(c){const shot=store.snapshots[c.url];const url=snapshotSrc(shot);return url?`<img loading="lazy" src="${escape(url)}" alt="Ảnh chụp ${escape(c.name)}"/>`:icon(c);}
 function createFolder(){if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được sửa thư mục','warn');openModal('Tạo thư mục kênh',`<label class="modal-label">Tên thư mục mới</label><input class="modal-input" id="folderName" maxlength="90" placeholder="Ví dụ: Kênh thể thao"/>`,()=>{const value=$('#folderName').value.trim();if(!value||value.length>90)throw Error('Nhập tên thư mục (tối đa 90 ký tự)');if(groupNames().includes(value))throw Error('Thư mục này đã tồn tại');store.folders.push(value);syncGroupOrder();save();render();},'Tạo thư mục');}
 function moveChannelToFolder(c){if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được chuyển kênh','warn');const options=groupNames().map(n=>`<option value="${escape(n)}" ${groupName(c)===n?'selected':''}>${escape(n)}</option>`).join('');openModal('Chuyển kênh vào thư mục',`<p class="hint">Kênh: <b>${escape(c.name)}</b>. Thay đổi chỉ lưu trên máy cho tới khi xuất M3U.</p><label class="modal-label">Thư mục</label><select class="modal-input" id="folderSelect">${options}</select>`,()=>{const g=$('#folderSelect').value;if(!g)throw Error('Chọn thư mục');c.group=g;save();render();toast('Đã chuyển '+c.name+' tới '+g);},'Chuyển kênh');}
 function renameFolder(old){if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được đổi tên thư mục','warn');openModal('Đổi tên thư mục',`<label class="modal-label">Tên thư mục</label><input class="modal-input" id="folderRename" maxlength="90" value="${escape(old)}"/>`,()=>{const name=$('#folderRename').value.trim();if(!name)throw Error('Nhập tên thư mục');if(name!==old&&groupNames().includes(name))throw Error('Tên thư mục đã tồn tại');store.channels.filter(c=>groupName(c)===old).forEach(c=>{c.group=name});store.folders=store.folders.filter(x=>x!==old);if(!store.folders.includes(name))store.folders.push(name);store.groupOrder=groupNames().map(x=>x===old?name:x);store.collapsedGroups=store.collapsedGroups.map(x=>x===old?name:x);save();render();},'Lưu');}
 function deleteFolder(group){if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được xóa thư mục','warn');const count=groupCount(group);if(count&&!confirm(`Thư mục ${group} đang chứa ${count} kênh. Chuyển các kênh sang Khác rồi xóa thư mục?`))return;if(!count&&!confirm(`Xóa thư mục trống ${group}?`))return;store.channels.filter(c=>groupName(c)===group).forEach(c=>{c.group='Khác'});store.folders=store.folders.filter(x=>x!==group);store.groupOrder=groupNames().filter(x=>x!==group);store.collapsedGroups=store.collapsedGroups.filter(x=>x!==group);save();render();}
 function renderFolders(){const root=$('#folderManager');root.replaceChildren();const groups=groupNames();if(!groups.length){root.innerHTML='<div class="empty-list">Chưa có thư mục. Nhập M3U để lấy nhóm có sẵn hoặc tạo thư mục mới.</div>';return;}groups.forEach(g=>{const card=document.createElement('div');card.className='folder-card';card.draggable=true;card.dataset.group=g;card.innerHTML=`<h3>▤ ${escape(g)}</h3><p>${groupCount(g)} kênh trong thư mục</p><div class="folder-card-actions"><button class="folder-open">▶ Xem kênh</button><button class="folder-rename">✎ Đổi tên</button><button class="folder-delete">✕ Xóa</button></div>`;card.addEventListener('dragstart',e=>{card.classList.add('dragging');e.dataTransfer?.setData('text/plain',g);e.dataTransfer.effectAllowed='move';});card.addEventListener('dragend',()=>card.classList.remove('dragging'));card.addEventListener('dragover',e=>{if(folderChannelDragOver(e,card))return;e.preventDefault();card.classList.add('drag-over');});card.addEventListener('dragleave',()=>card.classList.remove('drag-over','channel-drop-target'));card.addEventListener('drop',e=>{card.classList.remove('drag-over','channel-drop-target');if(moveDroppedChannel(e,g))return;e.preventDefault();reorderGroup(e.dataTransfer?.getData('text/plain')||document.querySelector('.folder-card.dragging')?.dataset.group,g);});card.querySelector('.folder-open').onclick=()=>{store.collapsedGroups=store.collapsedGroups.filter(x=>x!==g);save();setPage('tv');$('#searchBox').value='';renderList(true);scrollGroupIntoView(g);};card.querySelector('.folder-rename').onclick=()=>renameFolder(g);card.querySelector('.folder-delete').onclick=()=>deleteFolder(g);root.append(card)});}
 function icon(c){return c.logo?`<img loading="lazy" src="${escape(c.logo)}" alt="" onerror="this.style.display='none';this.parentNode.textContent='TV'" />`:'TV';}
 function channelView(){let a=filter==='fav'?favCore.visible(store):enabledChannels();
  const query=$('#searchBox').value.trim().toLowerCase();if(query)a=a.filter(c=>(c.name+' '+c.group).toLowerCase().includes(query));
  if(['alive','dead','uncertain'].includes(filter))a=a.filter(c=>c.status===filter);
  return a;
 }
 function renderList(preserve=false){
  syncGroupOrder();
  const prev=preserve?preserveListScroll():null;
  const result=channelView();$('#channelMeta').textContent=`${result.length} / ${store.channels.length} kênh`;
  const target=$('#channelList');target.replaceChildren();
  if(!result.length){target.innerHTML=`<div class="empty-list">${store.channels.length?'Không thấy kênh phù hợp.':'Chưa có kênh. Dùng Mở file M3U hoặc Thêm URL để nhập danh sách.'}</div>`;restoreListScroll(prev);return;}
  const groups=new Map();result.forEach(c=>{const g=groupName(c);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(c)});
  const showEmpty=filter==='all'&&!$('#searchBox').value.trim();
  const orderedGroups=groupNames().filter(g=>showEmpty||groups.has(g)).concat([...groups.keys()].filter(g=>!groupNames().includes(g)));
  const f=document.createDocumentFragment();
  orderedGroups.forEach(group=>{
    const entries=groups.get(group)||[],collapsed=store.collapsedGroups.includes(group)&&!$('#searchBox').value.trim();
    const header=document.createElement('button');header.type='button';header.className='folder-header';header.dataset.group=group;header.draggable=!$('#searchBox').value.trim();
    header.innerHTML=`<span class="folder-arrow">${collapsed?'▸':'▾'}</span><span class="folder-emoji">📁</span><span>${escape(group)}</span><span class="folder-size">${entries.length}</span>`;
    header.addEventListener('click',()=>{const pos=preserveListScroll();if(store.collapsedGroups.includes(group))store.collapsedGroups=store.collapsedGroups.filter(x=>x!==group);else store.collapsedGroups.push(group);save();renderList();restoreListScroll(pos)});
    header.addEventListener('dragstart',e=>{header.classList.add('dragging');e.dataTransfer?.setData('text/plain',group);e.dataTransfer.effectAllowed='move';});
    header.addEventListener('dragend',()=>header.classList.remove('dragging'));
    header.addEventListener('dragover',e=>{if(folderChannelDragOver(e,header))return;if(!$('#searchBox').value.trim()){e.preventDefault();header.classList.add('drag-over');}});
    header.addEventListener('dragleave',()=>header.classList.remove('drag-over','channel-drop-target'));
    header.addEventListener('drop',e=>{header.classList.remove('drag-over','channel-drop-target');if(moveDroppedChannel(e,group))return;if($('#searchBox').value.trim())return;e.preventDefault();reorderGroup(e.dataTransfer?.getData('text/plain')||document.querySelector('.folder-header.dragging')?.dataset.group,group);});
    f.append(header);
    if(collapsed)return;
    entries.forEach(c=>{
      const row=document.createElement('div');const shot=store.snapshots[c.url];row.className='channel-item'+(current?.id===c.id?' current':'');row.dataset.channelId=c.id;
      row.innerHTML=`<div class="chan-logo ${snapshotSrc(shot)?'snapshot-thumb':''}">${channelThumb(c)}</div><div class="channel-text"><b>${escape(c.name)}</b><small><i class="mini-pill ${escape(c.status||'')}"></i><span class="channel-health ${escape(c.status||'')}">${c.status==='alive'?'Sống · ':c.status==='dead'?'Die · ':c.status==='uncertain'?'Chưa rõ · ':''}</span>${shot?'📸 Đã có ảnh • ':''}${escape(groupName(c))}</small></div><button class="channel-move" title="Chuyển thư mục">▤</button><button type="button" class="channel-star ${favCore.has(store,c)?'marked':''}" aria-pressed="${favCore.has(store,c)}" title="${favCore.has(store,c)?'Bỏ yêu thích':'Thêm yêu thích'}">${favCore.has(store,c)?'★':'☆'}</button>`;
      row.draggable=true;row.title='Kéo kênh thả vào tiêu đề thư mục khác để chuyển';
      row.addEventListener('dragstart',e=>channelDragStart(e,c));
      row.addEventListener('dragend',()=>{row.classList.remove('channel-dragging');draggedChannelId='';});
      row.addEventListener('click',()=>playChannel(c.id));row.querySelector('.channel-star').addEventListener('click',e=>{e.stopPropagation();favorite(c);});row.querySelector('.channel-move').addEventListener('click',e=>{e.stopPropagation();moveChannelToFolder(c);});window.IPTVExtras?.decorateRow?.(c,row);window.IPTVProAdvanced?.decorateRow?.(c,row);f.append(row);
    });
  });target.append(f);restoreListScroll(prev);
 }
 function renderSources(){const list=$('#sourcesList');list.replaceChildren();if(!store.sources.length){list.innerHTML='<div class="empty-list">Chưa có nguồn. Thêm URL playlist hoặc file M3U từ máy.</div>';return;}
  for(const s of store.sources){const n=store.channels.filter(c=>c.sourceId===s.id).length;const d=document.createElement('article');d.className='source-card';d.innerHTML=`<div class="source-top"><h3>${escape(s.name)}</h3><label title="Bật / tắt nguồn"><input class="toggle" type="checkbox" ${s.enabled!==false?'checked':''}/></label></div><div class="source-url" title="${escape(s.origin||'')}">${escape(s.origin||'File M3U')}</div><div class="source-meta">${n} kênh • ${s.type==='url'?'Nguồn URL':'File cục bộ'}</div><div class="source-actions"><button class="src-refresh" ${s.type!=='url'?'disabled':''}>↻ Tải lại</button><button class="src-rename">✎ Đổi tên</button><button class="src-delete remove">✕ Xóa</button></div>`;
   d.querySelector('.toggle').addEventListener('change',e=>{s.enabled=e.target.checked;save();render();});
   d.querySelector('.src-refresh').addEventListener('click',()=>refreshSource(s));
   d.querySelector('.src-rename').addEventListener('click',()=>renameSource(s));
   d.querySelector('.src-delete').addEventListener('click',()=>deleteSource(s));list.append(d);
  }
 }
 function renderShots(){
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
   for(const {channel,shot} of items){
    const card=document.createElement('article');card.className='shot-card';if(channel)card.dataset.channelId=channel.id;
    card.innerHTML=`<img loading="lazy" src="${escape(snapshotSrc(shot))}" alt="Ảnh chụp ${escape(channel?.name||shot.name||'Kênh')}"/><b title="${escape(channel?.name||shot.name||'Kênh')}">${escape(channel?.name||shot.name||'Kênh')}</b><small title="${escape(shot.date||'')}">${escape(shot.date||'')} · ${escape(shot.method||'FFmpeg')}</small>`;
    if(channel){
     card.classList.add('clickable');card.tabIndex=0;card.title='Rê chuột xem trước không tiếng; nhấn để mở kênh '+channel.name;
     card.addEventListener('click',()=>{setPage('tv');playChannel(channel.id);});
     card.addEventListener('keydown',e=>{if(e.key==='Enter'){setPage('tv');playChannel(channel.id);}});
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
  const src={id:sourceId,name,origin,type,enabled:true,addedAt:new Date().toISOString()};store.sources.push(src);store.channels.push(...parsed);syncGroupOrder();favCore.sync(store);save();render();toast(`Đã thêm ${parsed.length} kênh từ ${name}`);textStatus(`Đã thêm ${parsed.length} kênh mới`);setPage('tv');}
 async function loadFile(){
  if(native){try{const file=await window.streamleaf.openM3U();if(file)addSource(file.name,file.name,file.content,'file');}catch(e){toast(e.message,'error');}return;}
  $('#fileInput').click();
 }
 async function importFromInput(file){if(!file)return;try{addSource(file.name,file.name,await file.text(),'file');}catch(e){toast(e.message,'error');}}
 function openURL(){openModal('Thêm playlist bằng URL',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="urlName" placeholder="Ví dụ: Kênh truyền hình Việt Nam" value="IPTV từ URL"/><label class="modal-label">Đường dẫn M3U</label><input class="modal-input" id="urlValue" placeholder="https://example.com/iptv.m3u" type="url"/><p class="hint">Nhập liên kết tới file M3U chứa nhiều kênh. Bản ứng dụng dùng trình tải tích hợp; bản trình duyệt có thể bị giới hạn CORS.</p>`,async()=>{
    const name=$('#urlName').value.trim()||'IPTV từ URL';const url=$('#urlValue').value.trim();if(!/^https?:\/\//i.test(url))throw Error('URL phải bắt đầu bằng http:// hoặc https://');
    textStatus('Đang tải danh sách từ URL...');const content=native?(await window.streamleaf.loadURL(url)).content:await (await fetch(url)).text();addSource(name,url,content,'url');},'Tải danh sách');}
 async function refreshSource(source){if(!native&&source.type==='url')toast('Chế độ trình duyệt chỉ tải URL khi máy chủ cho phép CORS','warn');try{if(!source.origin?.startsWith('http'))throw Error('Nguồn không phải URL');textStatus('Đang tải lại '+source.name+'...');const content=native?(await window.streamleaf.loadURL(source.origin)).content:await (await fetch(source.origin)).text();const fresh=core.parseM3U(content,source.id);if(!fresh.length)throw Error('Không nhận được kênh nào; giữ nguyên bản cũ');
   const old=store.channels.filter(c=>c.sourceId===source.id);const states=new Map(old.map(c=>[c.url,{status:c.status,checkedAt:c.checkedAt,reason:c.reason,group:c.group}]));
   fresh.forEach(c=>Object.assign(c,states.get(c.url)||{}));store.channels=store.channels.filter(c=>c.sourceId!==source.id).concat(fresh);syncGroupOrder();favCore.sync(store);save();render();toast(`Đã làm mới ${fresh.length} kênh từ ${source.name}`);textStatus('Tải lại thành công');}
   catch(e){toast('Không thể tải lại: '+e.message,'error');textStatus('Tải lại thất bại; đã giữ dữ liệu cũ');}}
 async function refreshAll(){if(tasks.check.running||tasks.shots.running){toast('Hãy đợi hai tác vụ đang chạy xong trước khi làm mới nguồn','warn');return;}const sources=store.sources.filter(s=>s.type==='url'&&s.enabled!==false);if(!sources.length){toast('Chưa có nguồn URL để tải lại','warn');return;}for(const s of sources)await refreshSource(s);}
 function renameSource(s){openModal('Đổi tên nguồn',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="renameValue" value="${escape(s.name)}"/>`,()=>{s.name=$('#renameValue').value.trim()||s.name;save();render();});}
 function deleteSource(s){if(!confirm(`Xóa nguồn "${s.name}" và tất cả kênh của nguồn này?`))return;store.sources=store.sources.filter(x=>x.id!==s.id);store.channels=store.channels.filter(c=>c.sourceId!==s.id);if(current?.sourceId===s.id)stopPlayer();syncGroupOrder();favCore.sync(store);save();render();toast('Đã xóa nguồn');}
 function enabledChannels(){const s=new Set(store.sources.filter(s=>s.enabled!==false).map(s=>s.id));return store.channels.filter(c=>s.has(c.sourceId));}
 function stopPlayer(){playGeneration++;clearTimeout(failoverTimer);window.IPTVProAdvanced?.onStop?.();if(hls){hls.destroy();hls=null;}player.pause();player.removeAttribute('src');player.load();current=null;$('#playingTitle').textContent='Chưa chọn kênh';$('#playingSubtitle').textContent='Chọn kênh để phát';$('#playBtn').textContent='▶';$('#emptyPlayer').classList.remove('hidden');$('#playingIcon').textContent='TV';updatePlayerFavorite();renderList();window.IPTVExtras?.onChannel?.(null);}
 async function loadHlsLib(){if(window.Hls)return window.Hls;if(native)throw Error('Ứng dụng chưa đóng gói hls.js. Hãy chạy npm install rồi đóng gói lại.');return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';script.onload=()=>window.Hls?resolve(window.Hls):reject(Error('Thiếu thư viện hls.js'));script.onerror=()=>reject(Error('Không tải được hls.js từ CDN để phát HLS trên trình duyệt này'));document.head.append(script);});}
 async function tryPlayback(url,generation){
  if(generation!==playGeneration)return;
  if(hls){hls.destroy();hls=null;}
  mediaRecoveryCount=0;
  player.pause();player.removeAttribute('src');player.load();
  if(/^(rtsp|rtmp|udp):/i.test(url))throw Error('Luồng RTSP/RTMP/UDP không hỗ trợ; hãy dùng HLS hoặc MP4.');
  const actual=native?await window.streamleaf.proxy(url):url;
  if(generation!==playGeneration)return;
  let looksHls=/\.m3u8?(?:\?|$)/i.test(url);
  if(native&&!looksHls)try{looksHls=(await window.streamleaf.mediaKind(url)).hls;}catch{}
  if(generation!==playGeneration)return;
  if(looksHls && player.canPlayType('application/vnd.apple.mpegurl')){player.crossOrigin=native?'anonymous':null;player.src=actual;}
  else if(looksHls){const H=await loadHlsLib();if(generation!==playGeneration)return;if(!H.isSupported())throw Error('Thiết bị không hỗ trợ HLS MediaSource');
   hls=new H({enableWorker:true,lowLatencyMode:false,capLevelToPlayerSize:true,...(window.IPTVProAdvanced?.hlsOptions?.()||{maxBufferLength:12,backBufferLength:6,maxBufferSize:18*1000*1000})});hls.loadSource(actual);hls.attachMedia(player);
   hls.on(H.Events.LEVEL_SWITCHED,(_ev,data)=>{const level=hls?.levels?.[data.level];if(level)window.IPTVProAdvanced?.onQuality?.(current,{bitrate:level.bitrate||0,width:level.width||0,height:level.height||0});});
   hls.on(H.Events.ERROR,(_e,data)=>{if(generation!==playGeneration)return;if(data.fatal){if(data.type===H.ErrorTypes.MEDIA_ERROR&&mediaRecoveryCount<1){mediaRecoveryCount++;hls?.recoverMediaError();return;}window.IPTVProAdvanced?.onStreamError?.(current,'HLS '+data.details);recoverPlayback(generation,data.details);}});
  }else{player.crossOrigin=native?'anonymous':null;player.src=actual;}
  $('#streamInfo').textContent=looksHls?'HLS • Đang kết nối':'Video • Đang kết nối';
  const started=Date.now();window.IPTVProAdvanced?.onLoadStart?.(current,url,started);
  failoverTimer=setTimeout(()=>{if(generation===playGeneration&&player.readyState<2)recoverPlayback(generation,'Kết nối quá thời gian');},15000);
  const promise=player.play();if(promise?.catch)promise.catch(e=>{if(generation===playGeneration&&e?.name!=='AbortError')recoverPlayback(generation,e.message);});
  $('#playBtn').textContent='Ⅱ';textStatus('Đang kết nối: '+current.name);
 }
 async function recoverPlayback(generation,reason){
  if(generation!==playGeneration)return;
  clearTimeout(failoverTimer);
  window.IPTVProAdvanced?.onStreamError?.(current,reason);
  if(playCandidateIndex+1>=playCandidates.length){textStatus('Không có link dự phòng còn lại: '+reason);toast('Không thể phát: '+reason,'warn');return;}
  playCandidateIndex++;
  const next=playCandidates[playCandidateIndex];
  toast('Auto Failover: thử link '+(playCandidateIndex+1)+'/'+playCandidates.length+' của '+current.name,'warn');
  try{await tryPlayback(next,generation);}catch(e){recoverPlayback(generation,e.message);}
 }
 async function playChannel(chId,override=null,opts={}){
  const found=enabledChannels().find(c=>c.id===chId);if(!found){toast('Kênh không tồn tại hoặc nguồn đang tắt','warn');return;}
  if(window.IPTVProAdvanced?.allowChannel && !(await window.IPTVProAdvanced.allowChannel(found)))return;
  if(!opts.buffer)window.streamleaf?.stopTimeshift?.().catch(()=>{});
  playGeneration++;const generation=playGeneration;clearTimeout(failoverTimer);
  playMode=opts.mode||(override?'catchup':'live');
  playCandidates=override?[override]:(window.OpenIPTVAdvancedCore?.alternatives(found,enabledChannels(),store.alternates||{})||[found.url]);
  playCandidateIndex=0;
  current=found;store.current=chId;save();renderList(true);
  $('#playingTitle').textContent=found.name;$('#playingSubtitle').textContent=found.group+' • '+(playMode==='catchup'?'Xem lại':playMode==='timeshift'?'Bộ đệm 5 phút':'Đang phát trực tiếp');$('#playingIcon').textContent=found.name.slice(0,2).toUpperCase();$('#emptyPlayer').classList.add('hidden');$('#streamInfo').textContent='Đang kết nối...';updatePlayerFavorite();
  window.IPTVExtras?.onChannel?.(found);window.IPTVProAdvanced?.onChannel?.(found,playMode);
  try{await tryPlayback(playCandidates[0],generation);}catch(e){recoverPlayback(generation,e.message);}
 }
 async function playToggle(){if(!current){const first=enabledChannels()[0];if(first)await playChannel(first.id);else toast('Hãy thêm file M3U hoặc URL trước','warn');return;}
  if(player.paused){try{await player.play();$('#playBtn').textContent='Ⅱ';}catch(e){toast('Không thể phát: '+e.message,'error');}}
  else{player.pause();$('#playBtn').textContent='▶';}}
 function switchChannel(dir){const all=enabledChannels();if(!all.length)return;let index=all.findIndex(c=>c.id===current?.id);index=(index+dir+all.length)%all.length;playChannel(all[index].id);}
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
 }
 function taskStart(type,total){const t=tasks[type];t.running=true;t.cancel=false;t.visible=true;t.total=total;t.done=0;t.alive=0;t.dead=0;t.uncertain=0;t.success=0;t.failed=0;t.skipped=0;t.results=[];t.latest='';t.workers=0;updateTaskUI(type);$('#taskDock').classList.remove('hidden');}
 function taskEnd(type){const t=tasks[type];t.running=false;updateTaskUI(type);if(!Object.values(tasks).some(x=>x.visible))$('#taskDock').classList.add('hidden');}
 function requestCancel(type){const t=tasks[type];if(t.running){t.cancel=true;textStatus(`Đã yêu cầu hủy ${type==='check'?'kiểm tra link':'chụp ảnh'} sau lượt hiện tại`);}else{t.visible=false;updateTaskUI(type);if(!Object.values(tasks).some(x=>x.visible))$('#taskDock').classList.add('hidden');}}
 function markPlaybackVerified(){
  const ch=current,url=playCandidates[playCandidateIndex];
  if(!ch||!url||player.readyState<2||player.paused||!(player.videoWidth>0||player.audioTracks?.length>0))return;
  if(playbackProofUrl===url&&Date.now()-playbackProofTimer<60000)return;
  playbackProofTimer=Date.now();playbackProofUrl=url;
  ch.lastPlayableUrl=url;ch.lastPlaybackAt=new Date().toISOString();
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
  store.snapshots[c.url]={...(result.file?{file:result.file}:{data:result.data}),name:c.name,date:new Date().toLocaleString('vi-VN'),method:result.method||'FFmpeg'};if(!quiet)save();if(!quiet){renderShots();renderList();toast('Đã chụp ảnh kênh '+c.name);}return result;
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
 async function exportFile(){const all=enabledChannels();if(!all.length)return toast('Không có kênh để xuất','warn');const content=core.exportM3U(all);
  try{if(native){const dest=await window.streamleaf.export('iptv.m3u',content);if(dest)toast('Đã lưu: '+dest);}else{const blob=new Blob([content],{type:'audio/x-mpegurl;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='iptv.m3u';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);toast('Đã tải file iptv.m3u');}}
  catch(e){toast('Không xuất được: '+e.message,'error');}}
 async function modalSubmit(){if(!modalHandler)return;const cb=modalHandler;const button=$('#modalConfirm');button.disabled=true;const old=button.textContent;button.textContent='Đang xử lý...';try{await cb();closeModal();}catch(e){toast(e.message||String(e),'error');}finally{button.disabled=false;button.textContent=old;}}
 function wire(){
  const bind=(ids,fn)=>ids.forEach(id=>$('#'+id)?.addEventListener('click',fn));
  bind(['fileBtn','emptyFileBtn','sourcesFileBtn'],loadFile);bind(['urlBtn','emptyUrlBtn','sourcesUrlBtn'],openURL);
  bind(['sourceCheckAllBtn'],checkAll);bind(['quickChecks'],()=>{setPage('sources');document.getElementById('sourceRepairSection')?.scrollIntoView({block:'start'});});bind(['quickShots','shotsAllBtn'],snapshotAll);bind(['quickExport','exportNav'],exportFile);
  document.querySelectorAll('[data-nav-to]').forEach(button=>button.addEventListener('click',()=>{
    const destination=button.dataset.navTo;
    document.querySelector(`.nav[data-page="${destination}"]`)?.click();
    const target=button.dataset.navTarget;
    if(target)document.getElementById(target)?.scrollIntoView({block:'start',behavior:'smooth'});
  }));
  bind(['folderCreateBtn','newFolderFromList'],createFolder);bind(['expandFolderBtn'],()=>{const pos=preserveListScroll();store.collapsedGroups=[];save();renderList();restoreListScroll(pos);});bind(['collapseFolderBtn'],()=>{const pos=preserveListScroll();store.collapsedGroups=groupNames();save();renderList();restoreListScroll(pos);});
  bind(['refreshAllBtn'],refreshAll);bind(['prevBtn'],()=>switchChannel(-1));bind(['nextBtn'],()=>switchChannel(1));bind(['stopBtn'],stopPlayer);bind(['playBtn'],playToggle);
  bind(['favCurrentBtn'],()=>{const channel=currentChannel();if(channel)favorite(channel);});
  bind(['shotBtn'],async()=>{if(!current)return toast('Chưa chọn kênh','warn');try{await snapshotOne(current);}catch(e){toast(e.message,'error');}});
  bind(['fullscreenBtn'],()=>{if(!document.fullscreenElement)$('#playerBox').requestFullscreen?.();else document.exitFullscreen?.();});
  bind(['modalClose','modalCancel'],closeModal);bind(['modalConfirm'],modalSubmit);bind(['cancelCheckBtn'],()=>requestCancel('check'));bind(['cancelShotsBtn'],()=>requestCancel('shots'));bind(['taskDockMinimize'],()=>{$('#taskDock').classList.toggle('collapsed');});
  $$('.nav[data-page]').forEach(x=>x.addEventListener('click',()=>setPage(x.dataset.page)));
  $$('[data-source-jump]').forEach(x=>x.addEventListener('click',()=>{const target=document.getElementById(x.dataset.sourceJump);target?.scrollIntoView({behavior:'smooth',block:'start'});}));
  $$('.filter-tab').forEach(x=>x.addEventListener('click',()=>{filter=x.dataset.filter;$$('.filter-tab').forEach(y=>y.classList.toggle('active',x===y));renderList();}));
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
    for(const el of controls){
      el.value=String(store[key]);
      el.addEventListener('change',()=>{
        const n=safeConcurrency(el.value);
        store[key]=n;
        controls.forEach(control=>{control.value=String(n);});
        save();
      });
    }
  }
  const snapshotSkipControls=['snapshotSkipQuick','snapshotSkipSetting'];
  for(const id of snapshotSkipControls){const el=$('#'+id);if(!el)continue;el.checked=store.snapshotSkipExisting;el.addEventListener('change',()=>{
    store.snapshotSkipExisting=el.checked;snapshotSkipControls.forEach(x=>{if($('#'+x))$('#'+x).checked=el.checked;});save();
  });}
  $('#searchBox').addEventListener('input',renderList);$('#volume').addEventListener('input',e=>{player.volume=e.target.value/100;store.volume=player.volume;save();});
  player.volume=store.volume??.8;$('#volume').value=Math.round(player.volume*100);
  const fit=['contain','cover','fill','none'].includes(store.videoFit)?store.videoFit:'contain';$('#videoFit').value=fit;player.className='fit-'+fit;$('#videoFit').addEventListener('change',e=>{store.videoFit=e.target.value;player.className='fit-'+store.videoFit;save();});
  player.addEventListener('playing',()=>{clearTimeout(failoverTimer);setTimeout(markPlaybackVerified,1800);window.IPTVProAdvanced?.onPlaying?.(current,playCandidates[playCandidateIndex]);$('#streamInfo').textContent='● Đang phát';$('#playBtn').textContent='Ⅱ';textStatus('Đang xem: '+(current?.name||''));});
  player.addEventListener('timeupdate',markPlaybackVerified);
  player.addEventListener('loadeddata',()=>setTimeout(markPlaybackVerified,1500));
  player.addEventListener('pause',()=>{$('#playBtn').textContent='▶';});
  player.addEventListener('error',()=>{if(current){$('#streamInfo').textContent='Lỗi phát video';recoverPlayback(playGeneration,'Trình phát báo lỗi');}});
  player.addEventListener('waiting',()=>{const token=playGeneration;setTimeout(()=>{if(token===playGeneration&&!player.paused&&player.readyState<3)recoverPlayback(token,'Đứng hình quá 12 giây');},12000);});
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.target.tagName==='INPUT')return;if(e.key===' '){e.preventDefault();playToggle();}});
  const chooser=document.createElement('input');chooser.type='file';chooser.id='fileInput';chooser.accept='.m3u,.m3u8,.txt';chooser.className='hidden';chooser.addEventListener('change',async()=>{await importFromInput(chooser.files?.[0]);chooser.value='';});document.body.append(chooser);
 }
 window.IPTVState=Object.freeze({getStore:()=>store,getCurrent:()=>current,getChannels:()=>enabledChannels(),setPage,save,toast,textStatus,player,renderList,render,playChannel,stopPlayer,openModal,loadHlsLib,getPlayMode:()=>playMode,tryNextLink:()=>{if(playMode!=='live'||playCandidateIndex+1>=playCandidates.length)return false;void recoverPlayback(playGeneration,'Giám sát xác nhận đứng hình');return true;},importSource:addSource});
 wire();render();if(upgradedChecker)save();
 $('#appMode').textContent=native?'Ứng dụng • Desktop':'Bản xem thử • Web';
 $('#miniStatus').textContent=native?'Không cần Python / VLC':'Safari phát HLS trực tiếp';
 if(native)window.streamleaf.capabilities().then(x=>{snapshotBase=x.snapshotBase||'';window.__snapshotBase=snapshotBase;render();textStatus('Sẵn sàng • FFmpeg tích hợp: '+(x.ffmpegExists?'đã sẵn sàng':'không khả dụng; vui lòng cài lại bản Full'));}).catch(()=>textStatus('Không đọc được thông tin môi trường'));
 else textStatus('Bản trình duyệt: URL/CORS và snapshot hàng loạt có giới hạn');
})();
