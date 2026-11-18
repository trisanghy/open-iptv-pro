'use strict';
(()=>{
 const native=!!window.streamleaf;
 const isTauri=document.documentElement.dataset.desktopRuntime==='tauri2-rust';
 const core=window.StreamLeafCore;
 const favCore=window.OpenIPTVFavorites;
 const sourceEdit=window.OpenIPTVSourceEdit;
 const evidence=window.IPTVHealthEvidence;
 const adaptive=window.IPTVAdaptivePlayback;
 const reentry=window.IPTVPlaybackReentry;
 const shotPolicy=window.IPTVSnapshotPolicy;
 const organizer=window.IPTVChannelOrganizer;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const seed={sources:[],channels:[],favorites:[],snapshots:{},folders:[],groupOrder:[],channelOrder:{},collapsedGroups:[],current:'',volume:.8,videoFit:'contain'};
 let store;
 try{store={...seed,...JSON.parse(window.IPTVPrimaryPersistence?.initialRaw||localStorage.getItem('open-iptv-pro-4')||localStorage.getItem('streamleaf-3')||'{}')};}catch{store={...seed};}
 if(!Array.isArray(store.channels))store.channels=[];
 if(!Array.isArray(store.favorites))store.favorites=[];
 if(!Array.isArray(store.sources))store.sources=[];
 if(!store.snapshots||typeof store.snapshots!=='object')store.snapshots={};
 if(!Array.isArray(store.folders))store.folders=[];
 if(!Array.isArray(store.groupOrder))store.groupOrder=[];
 organizer.ensure(store);
 if(!Array.isArray(store.collapsedGroups))store.collapsedGroups=[];
 // Each job has its own saved concurrency. Never trust stale/corrupt localStorage values.
 const safeConcurrency=(value,defaultValue=4)=>{
  const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=32?n:defaultValue;
 };
 store.snapshotConcurrency=safeConcurrency(store.snapshotConcurrency);
 store.checkConcurrency=safeConcurrency(store.checkConcurrency);
 if(typeof store.snapshotSkipExisting!=='boolean')store.snapshotSkipExisting=true;
 if(typeof store.autoRefreshM3UOnStart!=='boolean')store.autoRefreshM3UOnStart=true;
 favCore.migrate(store);
 // The previous checker produced false Die results for HLS streams and Range rejections.
 // Do not keep those historical negative classifications after this checker upgrade.
 const upgradedChecker=store.checkerVersion!==3;
 if(upgradedChecker){for(const ch of store.channels){if(ch.status==='dead'){ch.status='uncertain';ch.reason='Die từ bản kiểm tra cũ chưa đáng tin; cần kiểm tra lại';ch.checkedAt='';}}store.checkerVersion=3;}

 const transientRetryKeys=new Set();
 const reentryRetryKeys=new Set(); // One short decoder restart on recent known-good channel.
 let selectionSerial=0, activeMediaSrc="", activeMediaGeneration=0, activeMediaAttempt=0, activeMediaUsesMSE=false, activeMediaBlobSrc="";
 const compatFailureCooldown=new Map(); // Avoid respawning FFmpeg repeatedly for broken streams.
 let mediaInfo={hls:false,mode:'unknown',seekable:false};
 let playbackProofTimer=0,playbackProofUrl='',playAttemptSerial=0,waitingSerial=0,stablePlayback={attempt:0,startedAt:0,mediaAt:0},filter='all',page='tv',hls=null,dash=null,current=null,playGeneration=0,playCandidates=[],playCandidateIndex=0,playMode='live',failoverTimer=null,modalHandler=null,snapshotBase='',mediaRecoveryCount=0,compatAttempted=false,compatSource='';
 const tasks={
  check:{running:false,cancel:false,visible:false,total:0,done:0,alive:0,dead:0,uncertain:0,results:[]},
  shots:{running:false,cancel:false,visible:false,total:0,done:0,success:0,failed:0,skipped:0,latest:''}
 };
 const player=$('#video');
 const manualPicker=window.IPTVManualLinkPicker;
 function manualChoices(ch=currentChannel()){
  return manualPicker?.choices(ch,enabledChannels(),store.alternates||{},window.OpenIPTVAdvancedCore?.alternatives,adaptive)||[];
 }
 function updateManualLinks(){
  const control=$('#manualLinkControl'),select=$('#manualLinkSelect');
  if(!control||!select)return;
  const ch=currentChannel(),items=ch&&playMode==='live'?manualChoices(ch):[];
  if(!items.length){control.classList.add('hidden');select.replaceChildren();return;}
  control.classList.remove('hidden');
  const currentUrl=playCandidates[playCandidateIndex]||items[0].url;
  const urls=items.map(item=>item.url);
  // Preserve the native select DOM while the player updates, so its popup
  // does not flicker or close when HLS emits events in rapid succession.
  if(select.options.length!==items.length||items.some((item,i)=>select.options[i]?.value!==item.url||select.options[i]?.dataset.preferred!==String(!!item.preferred))){
   const fragment=document.createDocumentFragment();
   for(const item of items){
    const opt=document.createElement('option');
    opt.value=item.url;
    opt.dataset.preferred=String(!!item.preferred);
    const label=item.url===ch.url?'Link chính':item.label;
    // item.host strips query strings and credentials; never show stream tokens.
    opt.textContent=`${label} · ${item.host||'Nguồn phát'}${item.preferred?' ★':''}`;
    fragment.append(opt);
   }
   select.replaceChildren(fragment);
  }
  const activeUrl=urls.includes(currentUrl)?currentUrl:items[0].url;
  if(select.value!==activeUrl)select.value=activeUrl;
  const active=items.find(item=>item.url===activeUrl);
  select.title=active?`${active.url===ch.url?'Link chính':active.label} · ${active.host}`:'Chọn link phát';
 }
 let lastFavoriteSignature='';
 function currentChannel(){
  if(!current)return null;
  const active=enabledChannels();
  const replacement=active.find(ch=>ch.id===current.id)||active.find(ch=>ch.sourceId===current.sourceId&&favCore.key(ch)===favCore.key(current))||active.find(ch=>favCore.key(ch)===favCore.key(current));
  if(replacement)current=replacement;
  return replacement||null;
 }
 let lastStorageWarning=0;
 function save(){
  try {
   const raw=JSON.stringify(store);
   if(isTauri && window.IPTVPrimaryPersistence?.nativeReady){
    // Avoid 5MB WebKit localStorage quota: Rust stores primary data on disk,
    // with debounced, serialized, atomic writes rather than writes per channel.
    window.IPTVPrimaryPersistence.enqueue(raw);
    return true;
   }
   localStorage.setItem('open-iptv-pro-4',raw);return true;
  }catch(e){
   console.warn('Không thể lưu dữ liệu IPTV',e);
   if(Date.now()-lastStorageWarning>60000){
    lastStorageWarning=Date.now();
    toast('Không lưu được dữ liệu. Hãy sao lưu và kiểm tra quyền ghi dữ liệu ứng dụng.', 'error');
   }
   return false;
  }
 }
 function textStatus(t){$('#footerText').textContent=t;$('#miniStatus').textContent=t;}
 const lastToastByMessage=new Map();
 function toast(message,type='ok'){
  const key=type+':'+String(message).slice(0,180),now=Date.now();
  if(now-(lastToastByMessage.get(key)||0)<10000)return;
  lastToastByMessage.set(key,now);if(lastToastByMessage.size>80)lastToastByMessage.delete(lastToastByMessage.keys().next().value);
  const node=document.createElement('div');node.className='toast'+(type==='error'?' err':type==='warn'?' warn':'');node.textContent=message;
  const area=$('#toastArea');while(area.children.length>=3)area.firstElementChild?.remove();area.append(node);setTimeout(()=>node.remove(),5500);
 }
 function setPage(p){if(p==='collector'||p==='discovery')p='sources';if(window.IPTVProAdvanced?.canEnterPage?.(p)===false){toast('Trang này bị khóa trong hồ sơ trẻ em','warn');return;}const last=page;page=p;if(last!==p){const scrolling=$('.content');if(scrolling)scrolling.scrollTop=0;}$$('.nav[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));$$('.page').forEach(x=>x.classList.remove('active-page'));$('#page-'+p)?.classList.add('active-page');if($('#pageTitle'))$('#pageTitle').textContent=({tv:'Xem truyền hình',fav:'Kênh yêu thích',shots:'Ảnh chụp kênh',sources:'Quản lý nguồn',discovery:'Smart Discovery',doctor:'Smart IPTV Doctor 3.0',health:'Sức khỏe kênh',folders:'Thư mục kênh',epg:'Lịch phát sóng EPG',settings:'Cài đặt'})[p]||'Open IPTV Pro';render();window.OpenIPTVAutoPiP?.onPageChange?.(p,last);window.IPTVExtras?.onPage?.(p);window.IPTVProAdvanced?.onPage?.(p,last);window.IPTVDVR?.onPage?.(p);window.IPTVCollectorUI?.refresh?.();}
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
 function reorderGroup(moved,target,after=false){
  if(window.IPTVProAdvanced?.canEdit?.()===false)return false;
  if(!moved||!target||moved===target)return false;
  const order=groupNames().filter(Boolean);const from=order.indexOf(moved),to=order.indexOf(target);
  if(from<0||to<0)return false;
  order.splice(from,1);const dest=order.indexOf(target)+(after?1:0);order.splice(dest,0,moved);
  store.groupOrder=order;save();renderList(true);renderFolders();toast(`Đã thay đổi vị trí thư mục: ${moved}`);return true;
 }
 // v9: WebKit-friendly pointer drag. Native HTML drag/drop events on buttons
 // and nested channel rows were unreliable in macOS WKWebView.
 let selectedChannelIds=new Set();
 function selectionEditable(){return window.IPTVProAdvanced?.canEdit?.()!==false;}
 function updateSelectionUI(){
  const existing=new Set(store.channels.map(c=>c.id));
  selectedChannelIds=new Set([...selectedChannelIds].filter(id=>existing.has(id)));
  document.querySelectorAll('.channel-item[data-channel-id]').forEach(row=>{
   const checked=selectedChannelIds.has(row.dataset.channelId);
   row.classList.toggle('channel-selected',checked);
   row.setAttribute('aria-selected',String(checked));
  });
  const hint=$('.channel-drag-hint');
  if(hint)hint.textContent=selectedChannelIds.size
   ?`Đã chọn ${selectedChannelIds.size} kênh · kéo một kênh được chọn vào thư mục đích. Giữ Shift + bấm để chọn/bỏ chọn thêm; Esc để hủy.`
   :'Kéo thả để sắp xếp kênh hoặc thư mục. Giữ Shift + bấm để chọn nhiều kênh, sau đó kéo vào thư mục đích.';
 }
 function toggleShiftSelection(id){
  if(!selectionEditable())return toast('Hồ sơ trẻ em không được sắp xếp kênh','warn');
  if(selectedChannelIds.has(id))selectedChannelIds.delete(id);else selectedChannelIds.add(id);
  updateSelectionUI();
 }
 function applyChannelMove(ids,group,beforeId=null){
  if(!selectionEditable()){toast('Hồ sơ trẻ em không được chuyển kênh','warn');return false;}
  if(!groupNames().includes(group)){toast('Thư mục đích không tồn tại','warn');return false;}
  const result=organizer.move(store,ids,group,beforeId);
  if(!result.changed)return false;
  selectedChannelIds.clear();
  store.collapsedGroups=store.collapsedGroups.filter(g=>g!==group);
  save();renderList(true);renderFolders();
  if(page==='shots')renderShots();
  toast(result.count===1?'Đã sắp xếp kênh':`Đã sắp xếp ${result.count} kênh`);
  return true;
 }
 function installChannelPointerDnD(){
  window.IPTVPointerDnD.create({
   document,host:$('#channelList'),folders:$('#folderManager'),
   enabled:selectionEditable,
   selectedIds:id=>selectedChannelIds.has(id)?[...selectedChannelIds]:[id],
   onChannelDrop:({ids,group,targetId,after})=>{
    if(!groupNames().includes(group))return false;
    if(targetId){
     const remaining=organizer.groupList(store,group).filter(id=>!ids.includes(id));
     const at=remaining.indexOf(targetId);
     if(at<0)return false;
     const before=after?(remaining[at+1]||null):targetId;
     return applyChannelMove(ids,group,before);
    }
    return applyChannelMove(ids,group);
   },
   onFolderDrop:({source,target,after})=>reorderGroup(source,target,after),
   onSelectionCancelled:()=>updateSelectionUI()
  });
 }
 function snapshotSrc(s){if(!s)return '';if(s.file)return snapshotBase?snapshotBase+encodeURIComponent(s.file):'';return s.data||'';}
 function channelThumb(c){const shot=store.snapshots[c.url];const url=snapshotSrc(shot);return url?`<img loading="lazy" src="${escape(url)}" alt="Ảnh chụp ${escape(c.name)}"/>`:icon(c);}
 function createFolder(){if(window.IPTVProAdvanced?.canEdit?.()===false)return toast('Hồ sơ trẻ em không được sửa thư mục','warn');openModal('Tạo thư mục kênh',`<label class="modal-label">Tên thư mục mới</label><input class="modal-input" id="folderName" maxlength="90" placeholder="Ví dụ: Kênh thể thao"/>`,()=>{const value=$('#folderName').value.trim();if(!value||value.length>90)throw Error('Nhập tên thư mục (tối đa 90 ký tự)');if(groupNames().includes(value))throw Error('Thư mục này đã tồn tại');store.folders.push(value);syncGroupOrder();save();render();},'Tạo thư mục');}
 function renameFolder(old){
  if(!selectionEditable())return toast('Hồ sơ trẻ em không được đổi tên thư mục','warn');
  openModal('Đổi tên thư mục',`<label class="modal-label">Tên thư mục</label><input class="modal-input" id="folderRename" maxlength="90" value="${escape(old)}"/>`,()=>{
   const name=$('#folderRename').value.trim();if(!name)throw Error('Nhập tên thư mục');
   if(name!==old&&groupNames().includes(name))throw Error('Tên thư mục đã tồn tại');
   if(name===old)return;
   const order=groupNames().map(g=>g===old?name:g);
   organizer.renameGroup(store,old,name);
   store.folders=store.folders.filter(g=>g!==old);if(!store.folders.includes(name))store.folders.push(name);
   store.groupOrder=order;store.collapsedGroups=store.collapsedGroups.map(g=>g===old?name:g);
   save();render();
  },'Lưu');
 }
 function deleteFolder(group){
  if(!selectionEditable())return toast('Hồ sơ trẻ em không được xóa thư mục','warn');
  const count=groupCount(group);
  if(!confirm(count?`Thư mục ${group} chứa ${count} kênh. Chuyển sang Khác rồi xóa?`:`Xóa thư mục trống ${group}?`))return;
  organizer.deleteGroup(store,group);
  store.folders=store.folders.filter(g=>g!==group);
  store.groupOrder=store.groupOrder.filter(g=>g!==group);
  store.collapsedGroups=store.collapsedGroups.filter(g=>g!==group);
  syncGroupOrder();save();render();
 }
 function renderFolders(){
  const root=$('#folderManager');root.replaceChildren();const groups=groupNames();
  if(!groups.length){root.innerHTML='<div class="empty-list">Chưa có thư mục. Nhập M3U hoặc tạo thư mục mới.</div>';return;}
  groups.forEach((g,index)=>{
   const card=document.createElement('div');card.className='folder-card';card.dataset.group=g;
   card.innerHTML=`<h3>▤ ${escape(g)}</h3><p>${groupCount(g)} kênh trong thư mục • Kéo thả tiêu đề thư mục để sắp xếp</p><div class="folder-card-actions"><button class="folder-open">▶ Xem kênh</button><button class="folder-up" ${index===0?'disabled':''} title="Lên một vị trí">↑</button><button class="folder-down" ${index===groups.length-1?'disabled':''} title="Xuống một vị trí">↓</button><button class="folder-rename">✎ Đổi tên</button><button class="folder-delete">✕ Xóa</button></div>`;
   card.querySelector('.folder-open').onclick=()=>{store.collapsedGroups=store.collapsedGroups.filter(x=>x!==g);save();setPage('tv');$('#searchBox').value='';renderList(true);scrollGroupIntoView(g);};
   card.querySelector('.folder-up').onclick=()=>reorderGroup(g,groups[index-1]);
   card.querySelector('.folder-down').onclick=()=>reorderGroup(g,groups[index+1],true);
   card.querySelector('.folder-rename').onclick=()=>renameFolder(g);
   card.querySelector('.folder-delete').onclick=()=>deleteFolder(g);
   root.append(card);
  });
 }
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
  if(!result.length){target.innerHTML=`<div class="empty-list">${store.channels.length?'Không thấy kênh phù hợp.':'Chưa có kênh. Dùng Mở file M3U hoặc Thêm URL để nhập danh sách.'}</div>`;restoreListScroll(prev);updateSelectionUI();return;}
  const groups=new Map();result.forEach(c=>{const g=groupName(c);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(c)});
  const showEmpty=filter==='all'&&!$('#searchBox').value.trim();
  const orderedGroups=groupNames().filter(g=>showEmpty||groups.has(g)).concat([...groups.keys()].filter(g=>!groupNames().includes(g)));
  const f=document.createDocumentFragment();
  orderedGroups.forEach(group=>{
    const entries=organizer.sorted(store,group,groups.get(group)||[]),collapsed=store.collapsedGroups.includes(group)&&!$('#searchBox').value.trim();
    const header=document.createElement('button');header.type='button';header.className='folder-header';header.dataset.group=group;
    header.innerHTML=`<span class="folder-arrow">${collapsed?'▸':'▾'}</span><span class="folder-emoji">📁</span><span>${escape(group)}</span><span class="folder-size">${entries.length}</span>`;
    header.addEventListener('click',()=>{const pos=preserveListScroll();if(store.collapsedGroups.includes(group))store.collapsedGroups=store.collapsedGroups.filter(x=>x!==group);else store.collapsedGroups.push(group);save();renderList();restoreListScroll(pos)});
    f.append(header);
    if(collapsed)return;
    entries.forEach(c=>{
      const row=document.createElement('div');const shot=store.snapshots[c.url];row.className='channel-item'+(current?.id===c.id?' current':'');row.dataset.channelId=c.id;
      row.innerHTML=`<div class="chan-logo ${snapshotSrc(shot)?'snapshot-thumb':''}">${channelThumb(c)}</div><div class="channel-text"><b>${escape(c.name)}</b><small><i class="mini-pill ${escape(c.status||'')}"></i><span class="channel-health ${escape(c.status||'')}">${c.status==='alive'?'Sống · ':c.status==='dead'?'Die · ':c.status==='uncertain'?'Chưa rõ · ':''}</span>${shot?'📸 Đã có ảnh • ':''}${escape(groupName(c))}</small></div><button type="button" class="channel-star ${favCore.has(store,c)?'marked':''}" aria-pressed="${favCore.has(store,c)}" title="${favCore.has(store,c)?'Bỏ yêu thích':'Thêm yêu thích'}">${favCore.has(store,c)?'★':'☆'}</button>`;
      row.title='Giữ Shift + bấm để chọn nhiều kênh; kéo thả để sắp xếp hoặc chuyển thư mục';
      row.setAttribute('aria-selected',String(selectedChannelIds.has(c.id)));
      row.classList.toggle('channel-selected',selectedChannelIds.has(c.id));
      row.querySelectorAll('img').forEach(img=>{img.draggable=false;});
      row.addEventListener('click',e=>{
       if(e.shiftKey){e.preventDefault();toggleShiftSelection(c.id);return;}
       if(selectedChannelIds.size){selectedChannelIds.clear();updateSelectionUI();}
       playChannel(c.id);
      });
      row.querySelector('.channel-star').addEventListener('click',e=>{e.stopPropagation();favorite(c);});
      window.IPTVExtras?.decorateRow?.(c,row);window.IPTVProAdvanced?.decorateRow?.(c,row);f.append(row);
    });
  });target.append(f);restoreListScroll(prev);updateSelectionUI();
 }
 function renderSources(){const list=$('#sourcesList');list.replaceChildren();if(!store.sources.length){list.innerHTML='<div class="empty-list">Chưa có nguồn. Thêm URL playlist hoặc file M3U từ máy.</div>';return;}
  for(const s of store.sources){const n=store.channels.filter(c=>c.sourceId===s.id).length;const d=document.createElement('article');d.className='source-card';d.innerHTML=`<div class="source-top"><h3>${escape(s.name)}</h3><label title="Bật / tắt nguồn"><input class="toggle" type="checkbox" ${s.enabled!==false?'checked':''}/></label></div><div class="source-url" title="${escape(s.origin||'')}">${escape(s.origin||'File M3U')}</div><div class="source-meta">${n} kênh • ${s.type==='url'?'Nguồn URL':'File cục bộ'}</div><div class="source-actions"><button class="src-refresh" ${s.type!=='url'?'disabled':''}>↻ Tải lại</button><button class="src-edit" ${s.type!=='url'?'disabled title="Chỉ sửa được nguồn URL"':''}>✎ Sửa link</button><button class="src-rename">✎ Đổi tên</button><button class="src-delete remove">✕ Xóa</button></div>`;
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
 // Reuse existing picture nodes; rebuilding a 1000-card gallery every time an
 // FFmpeg worker finishes makes the whole window flash and resets hover previews.
 const retiredSnapshotFiles=new Set();
 let retiredSnapshotTimer=0,backgroundShotsRunning=false;
 function retireOldSnapshot(file){
  if(!isTauri||!window.streamleaf?.snapshotDelete||!file)return;
  retiredSnapshotFiles.add(file);
  if(retiredSnapshotTimer)return;
  retiredSnapshotTimer=setTimeout(async()=>{
   retiredSnapshotTimer=0;
   try{await window.IPTVPrimaryPersistence?.flush?.();}
   catch(e){console.warn('Keep old snapshot until storage succeeds:',e);return;}
   for(const previous of [...retiredSnapshotFiles]){
    retiredSnapshotFiles.delete(previous);
    // Do not remove a JPEG that a backup/import/other channel still uses.
    if(Object.values(store.snapshots).some(x=>x?.file===previous))continue;
    try{await window.streamleaf.snapshotDelete(previous);}catch(e){console.warn('Old snapshot cleanup:',e);}
   }
  },45000);
 }
 function swapSnapshotImage(container,src,alt){
  if(!container||!src)return;
  const old=container.querySelector('img');
  if(old?.getAttribute('src')===src)return;
  const token=src;container.dataset.pendingShotSrc=token;
  // Preload outside the DOM. Keep the old frame visible until the replacement
  // has actually decoded; a failed download must not blank the thumbnail.
  const incoming=new Image();incoming.decoding='async';incoming.alt=alt||'';
  incoming.onload=()=>{
   if(!container.isConnected||container.dataset.pendingShotSrc!==token)return;
   const previous=container.querySelector('img');
   if(previous){previous.src=token;previous.alt=alt||previous.alt;}
   else{container.replaceChildren(incoming);}
   container.classList.add('snapshot-thumb');
  };
  incoming.onerror=()=>{if(container.dataset.pendingShotSrc===token)delete container.dataset.pendingShotSrc;};
  incoming.src=src;
 }
 function createShotCard(channel,shot,url){
  const card=document.createElement('article');card.className='shot-card clickable';
  if(channel)card.dataset.channelId=channel.id;
  card.dataset.snapshotUrl=url||channel?.url||'';
  card.innerHTML=`<img loading="lazy" src="${escape(snapshotSrc(shot))}" alt="Ảnh chụp ${escape(channel?.name||shot.name||'Kênh')}"/><b title="${escape(channel?.name||shot.name||'Kênh')}">${escape(channel?.name||shot.name||'Kênh')}</b><small title="${escape(shot.date||'')}">${escape(shot.date||'')} · ${escape(shot.method||'FFmpeg')}</small>`;
  const shotTarget={id:channel?.id||'',url:channel?.url||url||'',name:channel?.name||shot.name||'Kênh'};
  card.tabIndex=0;card.setAttribute('role','button');
  card.setAttribute('aria-label','Mở kênh '+shotTarget.name+' từ Snapshot');
  card.title=channel?'Rê chuột xem trước không tiếng; nhấn để xem '+channel.name:'Ảnh cũ: nhấn để tìm kênh tương ứng';
  card.addEventListener('click',()=>{void openSnapshotChannel(shotTarget);});
  card.addEventListener('keydown',e=>{if(e.target!==card)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();void openSnapshotChannel(shotTarget);}});
  if(channel){
   const isFav=favCore.has(store,channel);
   const star=document.createElement('button');star.type='button';star.className='snapshot-star'+(isFav?' marked':'');
   star.textContent=isFav?'★':'☆';star.title=isFav?'Bỏ yêu thích':'Thêm yêu thích';star.setAttribute('aria-label',star.title);
   star.setAttribute('aria-pressed',String(isFav));
   star.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();favorite(channel);});
   star.addEventListener('keydown',e=>e.stopPropagation());
   card.append(star);window.IPTVProAdvanced?.decorateRow?.(channel,card);
  }
  return card;
 }
 function createShotGroup(target,name){
  const section=document.createElement('section');section.className='shot-group';section.dataset.group=name;
  const title=document.createElement('div');title.className='shot-group-heading';
  const heading=document.createElement('h2');heading.textContent='📁 '+name;
  const count=document.createElement('span');count.textContent='0 ảnh';
  title.append(heading,count);section.append(title);
  const grid=document.createElement('div');grid.className='shots-grid';section.append(grid);
  target.append(section);return section;
 }
 function patchSnapshotView(channel,shot){
  const src=snapshotSrc(shot);if(!src)return;
  const label='Ảnh chụp '+channel.name;
  for(const row of document.querySelectorAll('.channel-item[data-channel-id]')){
   if(row.dataset.channelId!==channel.id)continue;
   const logo=row.querySelector('.chan-logo');swapSnapshotImage(logo,src,label);
  }
  for(const row of document.querySelectorAll('.fav-card[data-channel-id]')){
   if(row.dataset.channelId!==channel.id)continue;
   swapSnapshotImage(row.querySelector('.chan-logo'),src,label);
  }
  const target=$('#shotList');if(!target)return;
  let card=[...target.querySelectorAll('.shot-card')].find(node=>node.dataset.snapshotUrl===channel.url);
  if(card){
   swapSnapshotImage(card,src,label);
   const text=card.querySelector('small');if(text){text.textContent=`${shot.date||''} · ${shot.method||'FFmpeg'}`;text.title=shot.date||'';}
   return;
  }
  const group=groupName(channel);
  let section=[...target.querySelectorAll('.shot-group')].find(node=>node.dataset.group===group);
  if(!section){target.querySelector('.empty-list')?.remove();section=createShotGroup(target,group);}
  section.querySelector('.shots-grid').append(createShotCard(channel,shot,channel.url));
  const count=section.querySelector('.shot-group-heading span');
  if(count)count.textContent=section.querySelectorAll('.shot-card').length+' ảnh';
 }
 function renderShots(){
  // Called only on full page/source changes, not on every background capture.
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
  for(const name of order){
   const section=createShotGroup(target,name),grid=section.querySelector('.shots-grid');
   for(const {channel,shot,url} of groups.get(name))grid.append(createShotCard(channel,shot,url));
   section.querySelector('.shot-group-heading span').textContent=groups.get(name).length+' ảnh';
  }
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
  if($('#activeSourceTag'))$('#activeSourceTag').textContent=store.sources.length?`${store.sources.length} nguồn M3U`:'Chưa có nguồn';
  renderList(preserveScroll);renderSources();renderShots();renderFavorites();renderFolders();$('#folderCount').textContent=groupNames().length;
  updatePlayerFavorite();updateManualLinks();notifyFavorites();window.IPTVExtras?.render?.();
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
  const before={sources:store.sources,channels:store.channels,groupOrder:store.groupOrder,favorites:store.favorites};
  const src={id:sourceId,name,origin,type,enabled:true,addedAt:new Date().toISOString()};
  try{
   store.sources=[...store.sources,src];store.channels=[...store.channels,...parsed];
   store.groupOrder=[...store.groupOrder];store.favorites=[...store.favorites];
   syncGroupOrder();organizer.reconcile(store);favCore.sync(store);
   if(!save())throw new Error('Bộ nhớ lưu trữ không đủ. Danh sách chưa được nhập; hãy xuất Backup và xóa bớt dữ liệu cũ.');
  }catch(e){Object.assign(store,before);throw e;}
  render();toast(`Đã thêm ${parsed.length} kênh từ ${name}`);textStatus(`Đã thêm ${parsed.length} kênh mới`);setPage('tv');}
 async function loadFile(){
  if(native){try{const file=await window.streamleaf.openM3U();if(file)addSource(file.name,file.name,file.content,'file');}catch(e){toast(e.message,'error');}return;}
  $('#fileInput').click();
 }
 async function importFromInput(file){if(!file)return;try{addSource(file.name,file.name,await file.text(),'file');}catch(e){toast(e.message,'error');}}
 function openURL(){openModal('Thêm playlist bằng URL',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="urlName" placeholder="Ví dụ: Kênh truyền hình Việt Nam" value="IPTV từ URL"/><label class="modal-label">Đường dẫn M3U</label><input class="modal-input" id="urlValue" placeholder="https://example.com/iptv.m3u" type="url"/><p class="hint">Nhập liên kết tới file M3U chứa nhiều kênh. Bản ứng dụng dùng trình tải tích hợp; bản trình duyệt có thể bị giới hạn CORS.</p>`,async()=>{
    const name=$('#urlName').value.trim()||'IPTV từ URL';const url=$('#urlValue').value.trim();if(!/^https?:\/\//i.test(url))throw Error('URL phải bắt đầu bằng http:// hoặc https://');
    textStatus('Đang tải danh sách từ URL...');const content=native?(await window.streamleaf.loadURL(url)).content:await (await fetch(url)).text();addSource(name,url,content,'url');},'Tải danh sách');}
 async function readSourceURL(url){
  if(native)return (await window.streamleaf.loadURL(url)).content;
  const r=await fetch(url);if(!r.ok)throw Error('Máy chủ trả HTTP '+r.status);return r.text();
 }
 async function replaceURLSource(source,newUrl,newName,mode='edit'){
  if(window.IPTVProAdvanced?.canEdit?.()===false)throw Error('Hồ sơ trẻ em không được sửa nguồn');
  if(tasks.check.running||tasks.shots.running)throw Error('Hãy đợi tác vụ kiểm tra/chụp ảnh hoàn thành rồi sửa nguồn');
  const url=sourceEdit.validatePlaylistUrl(newUrl);
  if(!store.sources.some(s=>s.id===source.id))throw Error('Nguồn này đã bị xóa');
  if(mode!=='startup')textStatus('Đang xác minh nguồn M3U mới...');
  const content=await readSourceURL(url);
  const fresh=core.parseM3U(content,source.id);
  if(!fresh.length)throw Error('Link mới không có kênh hợp lệ; đã giữ nguyên nguồn cũ');
  const oldCount=store.channels.filter(c=>c.sourceId===source.id).length;
  if(mode==='edit'&&oldCount>5&&fresh.length<oldCount/2&&!confirm(`Playlist mới chỉ có ${fresh.length}/${oldCount} kênh. Bạn vẫn muốn thay nguồn?`))throw Error('Đã hủy thay nguồn');
  const oldCurrent=current&&current.sourceId===source.id?current.id:null;
  const silent=mode==='startup';
  if(silent&&oldCount>=10&&fresh.length<Math.ceil(oldCount*.65))throw Error('Playlist vừa tải thiếu quá nhiều kênh; giữ dữ liệu cũ');
  const before=JSON.stringify(store);
  let result;
  try{
   result=sourceEdit.replaceSourceInStore(store,source.id,url,fresh);
   source.name=String(newName||'').trim()||source.name;
   syncGroupOrder();organizer.reconcile(store);favCore.sync(store);
   if(!save())throw Error('Không đủ bộ nhớ lưu trữ để cập nhật nguồn. Đã giữ nguyên nguồn cũ.');
  }catch(e){store=JSON.parse(before);throw e;}
  source.lastRefreshedAt=new Date().toISOString();source.lastRefreshError='';
  save();if(!silent)render();
  if(oldCurrent){const replacement=store.channels.find(c=>c.id===oldCurrent);
   if(replacement){
    // Never interrupt a working picture merely because a background refresh
    // changed a signed URL. The new URL is used on the next channel open.
    if(!silent&&current?.url!==replacement.url)await playChannel(replacement.id);
    else current=replacement;
   }else if(!silent)stopPlayer();
  }
  if(!silent){toast(`Nguồn đã cập nhật: ${fresh.length} kênh • giữ thông tin ${result.matched} kênh cũ`);textStatus('Đã lưu URL nguồn mới và giữ các kênh trùng khớp');}
  return result;
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
 let startupRefreshStarted=false;
 async function refreshSourcesAtStartup(){
  if(startupRefreshStarted||!isTauri||store.autoRefreshM3UOnStart===false)return;
  if(tasks.check.running||tasks.shots.running){setTimeout(()=>void refreshSourcesAtStartup(),10000);return;}
  startupRefreshStarted=true;
  const sources=store.sources.filter(s=>s.type==='url'&&s.enabled!==false).slice();
  if(!sources.length)return;
  let updated=0,failed=0;
  const status=$('#autoRefreshM3UStatus');
  for(const source of sources){
   if(!store.sources.some(x=>x.id===source.id)||store.autoRefreshM3UOnStart===false)break;
   if(status)status.textContent=`Đang làm mới ${updated+failed+1}/${sources.length} nguồn M3U ở chế độ nền…`;
   try{await replaceURLSource(source,source.origin,source.name,'startup');updated++;}
   catch(error){failed++;console.warn('Startup M3U refresh retained existing source',source.id,String(error?.message||error).slice(0,120));}
  }
  if(updated)render();
  if(status)status.textContent=`Đã cập nhật ${updated}/${sources.length} nguồn M3U${failed?`; ${failed} nguồn lỗi được giữ nguyên`:''}. Link phát đã lưu vẫn được ưu tiên nếu còn hợp lệ.`;
  if(updated||failed)textStatus(`M3U: cập nhật ${updated} nguồn, giữ nguyên ${failed} nguồn lỗi`);
 }

 function renameSource(s){openModal('Đổi tên nguồn',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="renameValue" value="${escape(s.name)}"/>`,()=>{s.name=$('#renameValue').value.trim()||s.name;save();render();});}
 function deleteSource(s){if(!confirm(`Xóa nguồn "${s.name}" và tất cả kênh của nguồn này?`))return;store.sources=store.sources.filter(x=>x.id!==s.id);store.channels=store.channels.filter(c=>c.sourceId!==s.id);if(current?.sourceId===s.id)stopPlayer();syncGroupOrder();favCore.sync(store);save();render();toast('Đã xóa nguồn');}
 function enabledChannels(){const s=new Set(store.sources.filter(s=>s.enabled!==false).map(s=>s.id));return store.channels.filter(c=>s.has(c.sourceId));}
 function disposeActiveMedia(){
  // Invalidate a previous player's queued error/waiting/playing events *before*
  // awaiting Rust IPC; otherwise the old VTV3 failure may fail over the new VTV3.
  activeMediaSrc='';activeMediaGeneration=0;activeMediaAttempt=0;activeMediaUsesMSE=false;activeMediaBlobSrc='';
  clearTimeout(failoverTimer);waitingSerial++;
  if(hls){try{hls.destroy();}catch{}hls=null;}
  if(dash){try{dash.reset();}catch{}dash=null;}
  player.pause();player.removeAttribute('src');player.load();
 }
 function activeMediaEvent(){
  if(!activeMediaSrc||activeMediaGeneration!==playGeneration||activeMediaAttempt!==playAttemptSerial)return false;
  const actual=player.currentSrc||'';
  return actual===activeMediaSrc||(activeMediaUsesMSE&&!!activeMediaBlobSrc&&actual===activeMediaBlobSrc);
 }
 function stopPlayer(){window.OpenIPTVCastUI?.stopOnLocalStop?.();selectionSerial++;playGeneration++;transientRetryKeys.clear();reentryRetryKeys.clear();compatAttempted=false;compatSource='';disposeActiveMedia();if(isTauri)window.streamleaf?.compatStop?.().catch(()=>{});window.IPTVProAdvanced?.onStop?.();current=null;mediaInfo={hls:false,mode:'unknown',seekable:false};document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));$('#playingTitle').textContent='Chưa chọn kênh';$('#playingSubtitle').textContent='Chọn kênh để phát';$('#playBtn').textContent='▶';$('#emptyPlayer').classList.remove('hidden');$('#playingIcon').textContent='TV';updatePlayerFavorite();renderList();window.IPTVExtras?.onChannel?.(null);}
 async function loadHlsLib(){if(window.Hls)return window.Hls;if(native)throw Error('Ứng dụng chưa đóng gói hls.js. Hãy chạy npm install rồi đóng gói lại.');return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';script.onload=()=>window.Hls?resolve(window.Hls):reject(Error('Thiếu thư viện hls.js'));script.onerror=()=>reject(Error('Không tải được hls.js từ CDN để phát HLS trên trình duyệt này'));document.head.append(script);});}
 async function tryPlayback(url,generation,options={}){
  if(generation!==playGeneration)return;
  const attempt=++playAttemptSerial;
  stablePlayback={attempt,startedAt:0,mediaAt:0};
  disposeActiveMedia();
  mediaRecoveryCount=0;
  if(/^(rtsp|rtmp|udp):/i.test(url))throw Error('Luồng RTSP/RTMP/UDP không hỗ trợ; hãy dùng HLS hoặc MP4.');
  const proxied=options.compat?url:(native?await window.streamleaf.proxy(url):url);
  if(generation!==playGeneration||attempt!==playAttemptSerial)return;
  // Unique loopback URL forces WKWebView to load a new LIVE manifest when
  // returning to the exact same channel; the upstream signed URL is untouched.
  const actual=isTauri&&!options.compat&&reentry?reentry.freshProxy(proxied,`${generation}-${attempt}`):proxied;
  let looksHls=!!options.compat||/\.m3u8?(?:\?|$)/i.test(url);
  let details={hls:looksHls,mode:'unknown',seekable:false};
  if(options.compat){details={hls:true,dash:false,mode:'live',seekable:false};}
  else if(native){
   try{details=await window.streamleaf.mediaKind(url);looksHls=looksHls||!!details.hls;}catch{}
  }
  if(generation!==playGeneration||attempt!==playAttemptSerial)return;
  activeMediaSrc=actual;activeMediaGeneration=generation;activeMediaAttempt=attempt;
  const looksDash=!!details.dash||/\.mpd(?:[?#]|$)/i.test(url);
  mediaInfo={...details,hls:looksHls&&!looksDash,dash:looksDash};
  if((details.mode==='vod'||details.mode==='event')&&playMode==='live'){
   playMode=details.mode;
   $('#playingSubtitle').textContent=(current?.group||'')+' • '+(playMode==='vod'?'Video có thể tua':'Sự kiện • chọn phân đoạn');
  }
  document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));
  const isCurrent=()=>generation===playGeneration&&attempt===playAttemptSerial;
  const startPlaying=()=>{
   if(!isCurrent())return;
   const promise=player.play();
   if(promise?.catch)promise.catch(e=>{
    if(!isCurrent()||e?.name==='AbortError')return;
    if(e?.name==='NotAllowedError'){
     $('#streamInfo').textContent='Nhấn Phát để tiếp tục';
     toast('Trình phát yêu cầu thao tác Phát của người dùng','warn');
    }else recoverPlayback(generation,e.message||'Lỗi video',attempt);
   });
  };
  if(looksDash){
   const Dash=window.dashjs;
   if(!Dash?.MediaPlayer)throw Error('Thiếu dash.js trong gói ứng dụng; cài lại đầy đủ phụ thuộc npm.');
   if(!window.MediaSource && !window.ManagedMediaSource)throw Error('MPEG-DASH yêu cầu trình duyệt hỗ trợ Media Source Extensions');
   const engine=Dash.MediaPlayer().create();dash=engine;activeMediaUsesMSE=true;
   const events=Dash.MediaPlayer.events;
   engine.on(events.STREAM_INITIALIZED,()=>{
    if(!isCurrent())return;
    if(player.currentSrc.startsWith('blob:'))activeMediaBlobSrc=player.currentSrc;
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
   // Always load the proxied manifest first. The modifier handles DASH's subsequent URLs.
   engine.initialize(player,actual,false);
  }else if(looksHls && player.canPlayType('application/vnd.apple.mpegurl')){
   player.crossOrigin=native?'anonymous':null;player.src=actual;startPlaying();
  }else if(looksHls){
   const H=await loadHlsLib();if(!isCurrent())return;
   if(!H.isSupported())throw Error('Thiết bị không hỗ trợ HLS MediaSource');
   const opts={...(window.IPTVProAdvanced?.hlsOptions?.()||{maxBufferLength:12,backBufferLength:6,maxBufferSize:18*1000*1000})};
   if(mediaInfo.mode==='event'||mediaInfo.mode==='vod'){
    if(isTauri){
     // WebView runs out of decoder memory if it holds 10 minutes of video in MSE.
     // VOD seek relies on the server; long LIVE replay uses separate disk Timeshift.
     opts.backBufferLength=12;opts.maxBufferLength=Math.min(18,Math.max(10,opts.maxBufferLength||0));
     opts.maxMaxBufferLength=24;opts.maxBufferSize=12*1000*1000;
    }else{
     opts.backBufferLength=Math.max(600,opts.backBufferLength||0);
     opts.maxBufferLength=Math.max(45,opts.maxBufferLength||0);
    }
   }
   const engine=new H({enableWorker:true,lowLatencyMode:false,capLevelToPlayerSize:true,...opts});
   hls=engine;activeMediaUsesMSE=true;
   // IMPORTANT: play() before MANIFEST_PARSED can reject NotSupportedError,
   // causing false failover and repeated manifestLoadError on valid VOD HLS.
   engine.on(H.Events.MEDIA_ATTACHED,()=>{if(isCurrent()&&player.currentSrc.startsWith('blob:'))activeMediaBlobSrc=player.currentSrc;});
   engine.on(H.Events.MANIFEST_PARSED,()=>{if(isCurrent()){if(player.currentSrc.startsWith('blob:'))activeMediaBlobSrc=player.currentSrc;startPlaying();}});
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
    window.IPTVProAdvanced?.onStreamError?.(current,reason);
    recoverPlayback(generation,reason,attempt);
   });
   engine.attachMedia(player);
   engine.loadSource(actual);
  }else{
   player.crossOrigin=native?'anonymous':null;player.src=actual;startPlaying();
  }
  $('#streamInfo').textContent=looksDash?'DASH • Đang kết nối':looksHls?'HLS • Đang kết nối':'Video • Đang kết nối';
  const started=Date.now();window.IPTVProAdvanced?.onLoadStart?.(current,url,started);
  failoverTimer=setTimeout(()=>{if(isCurrent()&&player.readyState<2)recoverPlayback(generation,'Kết nối quá thời gian',attempt);},20000);
  $('#playBtn').textContent='Ⅱ';textStatus('Đang kết nối: '+current.name);
 }
 async function recoverPlayback(generation,reason,attempt=playAttemptSerial){
  if(generation!==playGeneration||attempt!==playAttemptSerial)return;
  // Invalidate callbacks from the previous HLS engine before trying a backup.
  playAttemptSerial++;
  clearTimeout(failoverTimer);
  window.IPTVProAdvanced?.onStreamError?.(current,reason);
  // Live CDN connections occasionally time out or drop one segment. One quiet
  // retry of this exact URL is cheaper than instantly moving to another feed.
  // Never retry explicitly denied HTTP codes or unsupported codecs endlessly.
  const transient=/Kết nối quá thời gian|Lỗi mạng|Đứng hình quá|HLS.*(timeout|fragLoadError|levelLoadError|manifestLoadError)/i.test(String(reason));
  const denied=/\bHTTP\s*(401|403|404|410|429|451|503)\b|MediaError\s*[34]|NotSupported/i.test(String(reason));
  const retryKey=playCandidateIndex;
  const candidate=playCandidates[retryKey];
  // macOS WebKit can reject a stream that decoded correctly moments ago when
  // its native decoder is still releasing the previous session. Restart once
  // with a fresh loopback manifest before declaring this URL unplayable.
  if(isTauri&&playMode==='live'&&!compatSource&&!reentryRetryKeys.has(retryKey)&&
     reentry?.shouldRetry(current?.id,candidate,reason)){
   reentryRetryKeys.add(retryKey);
   textStatus('Đang khởi tạo lại luồng vừa phát thành công: '+(current?.name||'kênh'));
   await new Promise(resolve=>setTimeout(resolve,550));
   if(generation!==playGeneration)return;
   try{await tryPlayback(candidate,generation);}catch(err){void recoverPlayback(generation,String(err?.message||err));}
   return;
  }
  if(playMode==='live'&&!compatSource&&transient&&!denied&&!transientRetryKeys.has(retryKey)){
   transientRetryKeys.add(retryKey);
   textStatus('Đang thử lại kết nối ngắt quãng cho '+(current?.name||'kênh'));
   await new Promise(resolve=>setTimeout(resolve,650));
   if(generation!==playGeneration)return;
   try{await tryPlayback(playCandidates[playCandidateIndex],generation);}catch(err){void recoverPlayback(generation,String(err?.message||err));}
   return;
  }
  if(playCandidateIndex+1>=playCandidates.length){
   // WKWebView/WebView2 cannot decode some valid MPEG-TS/HEVC streams.
   // Attempt one bounded FFmpeg H.264/AAC compatibility session per channel,
   // only after ordinary playback and all normal alternatives have failed.
   const ffmpegCandidate=playCandidates[playCandidateIndex];
   const upstreamDenied=/\bHTTP\s*(401|403|404|410|429|451|503)\b|\b(403|404)\s*Forbidden\b/i.test(String(reason));
   const cooldownUntil=compatFailureCooldown.get(ffmpegCandidate)||0;
   if(isTauri&&!compatAttempted&&window.streamleaf?.compatStart&&playMode==='live'&&!upstreamDenied&&Date.now()>=cooldownUntil){
    compatAttempted=true;
    const original=playCandidates[playCandidateIndex];
    textStatus('Đang thử bộ phát FFmpeg tương thích (H.264/AAC)…');
    try{
     const session=await window.streamleaf.compatStart(original);
     if(generation!==playGeneration)return;
     compatSource=original;
     toast('Đang thử bộ phát tương thích FFmpeg','warn');
     await tryPlayback(session.url,generation,{compat:true});
     return;
    }catch(err){
     if(generation!==playGeneration)return;
     compatFailureCooldown.set(original,Date.now()+5*60*1000);
     if(compatFailureCooldown.size>60)compatFailureCooldown.delete(compatFailureCooldown.keys().next().value);
     reason+=' • FFmpeg: '+String(err?.message||err).slice(0,220);
    }
   }
   if(generation!==playGeneration)return;
   textStatus('Không phát được kênh: '+reason);
   if(!player.dataset.errorToastGeneration||player.dataset.errorToastGeneration!==String(generation)){
    player.dataset.errorToastGeneration=String(generation);toast('Không thể phát: '+reason,'warn');
   }
   return;
  }
  playCandidateIndex++;
  const next=playCandidates[playCandidateIndex];
  updateManualLinks();
  textStatus('Auto Failover: thử link '+(playCandidateIndex+1)+'/'+playCandidates.length+' của '+current.name);
  try{await tryPlayback(next,generation);}catch(e){recoverPlayback(generation,e.message);}
 }
 async function tryFfmpegManually(){
  if(!current||playMode!=='live'){toast('Chọn kênh trực tiếp trước khi thử FFmpeg','warn');return false;}
  if(!isTauri||!window.streamleaf?.compatStart){toast('Chưa có bộ phát FFmpeg tích hợp','warn');return false;}
  const original=playCandidates[playCandidateIndex]||current.url,generation=playGeneration;
  if(!/^https?:\/\//i.test(String(original||''))){toast('URL nguồn phát không hợp lệ','warn');return false;}
  compatAttempted=true;
  textStatus('Đang khởi động FFmpeg H.264/AAC dự phòng…');
  try{
   const session=await window.streamleaf.compatStart(original);
   if(generation!==playGeneration)return false;
   if(!session?.url)throw Error('FFmpeg không trả về URL phát');
   compatSource=original;
   await tryPlayback(session.url,generation,{compat:true});
   if(generation!==playGeneration)return false;
   toast('Đã yêu cầu phát bằng FFmpeg dự phòng','ok');return true;
  }catch(error){
   if(generation===playGeneration){
    compatSource='';compatAttempted=false;
    toast('FFmpeg lỗi: '+String(error?.message||error).slice(0,130),'warn');
    try{await tryPlayback(original,generation);}catch(restore){textStatus('Khôi phục nguồn lỗi: '+String(restore?.message||restore));}
   }
   return false;
  }
 }
 async function playChannel(chId,override=null,opts={}){
  const selection=++selectionSerial;
  const found=enabledChannels().find(c=>c.id===chId);if(!found){toast('Kênh không tồn tại hoặc nguồn đang tắt','warn');return;}
  if(window.IPTVProAdvanced?.allowChannel && !(await window.IPTVProAdvanced.allowChannel(found)))return;
  if(selection!==selectionSerial)return; // A pending permission prompt must not revive an old selection.
  if(!opts.buffer)window.streamleaf?.stopTimeshift?.().catch(()=>{});
  playGeneration++;transientRetryKeys.clear();reentryRetryKeys.clear();const generation=playGeneration;compatAttempted=false;compatSource='';
  disposeActiveMedia(); // Release the old decoder immediately, BEFORE slow Rust IPC.
  if(isTauri)await window.streamleaf?.compatStop?.().catch(()=>{});
  if(generation!==playGeneration||selection!==selectionSerial)return;
  playMode=opts.mode||(override?'catchup':'live');
  playCandidates=override?[override]:(adaptive?.candidates(found,enabledChannels(),store.alternates||{},window.OpenIPTVAdvancedCore?.alternatives)||[found.url]);
  if(opts.manualUrl&&playMode==='live'&&manualPicker){
   // Manual selection is scoped to the active channel and valid known alternatives.
   // Keep other links available for automatic failover if the chosen one fails.
   playCandidates=manualPicker.prioritize(opts.manualUrl,playCandidates);
  }
  playCandidateIndex=0;
  current=found;store.current=chId;mediaInfo={hls:false,mode:'unknown',seekable:false};document.dispatchEvent(new CustomEvent('openiptv:media-info',{detail:mediaInfo}));save();window.OpenIPTVCastUI?.onChannelChanged?.(found);renderList(true);
  updateManualLinks();$('#playingTitle').textContent=found.name;$('#playingSubtitle').textContent=found.group+' • '+(playMode==='catchup'?'Xem lại':playMode==='timeshift'?'Tua lại '+(window.IPTVProAdvanced?.getReplayMinutes?.()||10)+' phút':'Đang phát trực tiếp');$('#playingIcon').textContent=found.name.slice(0,2).toUpperCase();$('#emptyPlayer').classList.add('hidden');$('#streamInfo').textContent='Đang kết nối...';updatePlayerFavorite();
  window.IPTVExtras?.onChannel?.(found);window.IPTVProAdvanced?.onChannel?.(found,playMode);
  try{await tryPlayback(playCandidates[0],generation);}catch(e){recoverPlayback(generation,e.message);}
 }
 async function playToggle(){if(!current){const first=enabledChannels()[0];if(first)await playChannel(first.id);else toast('Hãy thêm file M3U hoặc URL trước','warn');return;}
  if(player.paused){try{await player.play();$('#playBtn').textContent='Ⅱ';}catch(e){toast('Không thể phát: '+e.message,'error');}}
  else{player.pause();$('#playBtn').textContent='▶';}}
 function switchChannel(dir){const active=enabledChannels();const all=groupNames().flatMap(g=>organizer.sorted(store,g,active.filter(c=>groupName(c)===g))); if(!all.length)return;let index=all.findIndex(c=>c.id===current?.id);index=(index+dir+all.length)%all.length;playChannel(all[index].id);}
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
 function markPlaybackVerified(generation=playGeneration){
  if(generation!==playGeneration)return;
  const ch=current,url=playCandidates[playCandidateIndex];
  if(!ch||!url||!activeMediaEvent()||player.readyState<2||player.paused||!(player.videoWidth>0||player.audioTracks?.length>0))return;
  if(stablePlayback.attempt===playAttemptSerial&&stablePlayback.startedAt&&
     Date.now()-stablePlayback.startedAt>=3500&&(Number(player.currentTime)||0)-stablePlayback.mediaAt>=1){
   reentry?.notePlaying(ch.id,url);
  }
  // Only promote an alternative after 12 seconds of the same decoder actually
  // progressing for >=4 seconds, not merely from an HTTP check or old snapshot.
  if(playMode==='live'&&stablePlayback.attempt===playAttemptSerial&&stablePlayback.startedAt&&
     Date.now()-stablePlayback.startedAt>=12000&&Number.isFinite(player.currentTime)&&
     player.currentTime-stablePlayback.mediaAt>=4){
   const latest=store.channels.find(c=>c.id===ch.id);
   if(latest){
    // If the previously preferred backup failed, and the canonical source
    // subsequently proves stable, use canonical first next time.
    const recoveredOriginal=url===latest.url&&playCandidateIndex>0&&!!latest.preferredStreamUrl;
    const changed=recoveredOriginal?adaptive?.clearPreferred(latest):adaptive?.promote(latest,url,enabledChannels(),store.alternates||{},window.OpenIPTVAdvancedCore?.alternatives);
    if(changed){if(current?.id===latest.id)current=latest;save();textStatus(recoveredOriginal?'Đã quay về link gốc ổn định của '+latest.name:'Đã ghi nhớ link phát ổn định cho '+latest.name);}
   }
  }
  if(playbackProofUrl===url&&Date.now()-playbackProofTimer<60000)return;
  playbackProofTimer=Date.now();playbackProofUrl=url;
  evidence.noteProof(ch,'playback',url);
  if(ch.url===url){for(const other of store.channels){if(other!==ch&&other.url===url){evidence.noteProof(other,'playback',url);updateChannelStatus(other);}}}
  updateChannelStatus(ch);
  window.IPTVProAdvanced?.onCheck?.(ch,{status:ch.status,reason:ch.reason,positiveEvidence:true});
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
  const concurrency=Math.min(32,safeConcurrency(store.checkConcurrency),all.length);
  taskStart('check',all.length);t.workers=concurrency;updateTaskUI('check');let cursor=0;
  textStatus(`Kiểm tra ${all.length} kênh với ${concurrency} luồng song song`);
  async function worker(){while(!t.cancel&&cursor<all.length){const ch=all[cursor++];let result;
    try{result=await checkOne(ch.url);}catch(e){result={status:'uncertain',reason:e.message};}
    // Resolve against actual decoded playback / freshly captured frame.
    // A late scan result must never override evidence from a newer playback.
    // An older saved thumbnail is not proof of CURRENT playback, but it does
    // make an isolated HTTP 404 insufficient to say that the channel is dead.
    if(result.status==='dead'&&store.snapshots[ch.url]){
      result={...result,status:'uncertain',confirmedDead:false,
        reason:'Có ảnh Snapshot đã lưu (có thể cũ); HTTP lỗi chưa đủ để kết luận Die. Hãy thử phát hoặc chụp lại.'};
    }
    result=evidence.applyProbe(ch,result);
    if(ch.status==='alive')t.alive++;else if(ch.status==='dead')t.dead++;else t.uncertain++;
    t.done++;t.results.push({name:ch.name,status:ch.status,reason:ch.reason});
    updateChannelStatus(ch);updateTaskUI('check');window.IPTVProAdvanced?.onCheck?.(ch,result);
    if(t.done%40===0){save();if(filter==='alive')renderList(true);}
  }}
  try{await Promise.all(Array.from({length:concurrency},()=>worker()));save();renderList(true);updateTaskUI('check');toast(`Đã kiểm tra ${t.done} kênh: ${t.alive} sống • ${t.dead} die • ${t.uncertain} chưa rõ`);textStatus(`Link: ${t.alive} sống / ${t.dead} die / ${t.uncertain} chưa rõ`);}finally{taskEnd('check');}
 }
 async function snapshotOne(c,quiet=false){let result;
  let capturedUrl=c.url;
  if(native){
   // Match adaptive playback: a verified backup might be the only healthy CDN.
   const urls=[c.preferredStreamUrl,c.url].filter((url,index,array)=>/^https?:\/\//i.test(url||'')&&array.indexOf(url)===index);
   for(const url of urls){
    try{result=await window.streamleaf.snapshot(url,c.name);capturedUrl=url;break;}
    catch(e){console.debug('Snapshot source failed:',c.name,String(e?.message||e));}
   }
  }
  if(!result&&current?.id===c.id&&player.videoWidth){try{const cvs=document.createElement('canvas');cvs.width=480;cvs.height=Math.max(1,Math.round(480*player.videoHeight/player.videoWidth));cvs.getContext('2d').drawImage(player,0,0,cvs.width,cvs.height);result={data:cvs.toDataURL('image/jpeg',.68),method:'Video'};capturedUrl=playCandidates[playCandidateIndex]||c.url;}catch{}}
  if(!result)throw Error('Không lấy được khung hình (luồng lỗi, bảo vệ nội dung hoặc CORS)');
  const previous=store.snapshots[c.url],now=Date.now();
  const shot={...(result.file?{file:result.file}:{data:result.data}),name:c.name,capturedAt:now,lastAttemptAt:now,date:new Date(now).toLocaleString('vi-VN'),method:result.method||'FFmpeg'};
  store.snapshots[c.url]=shot;
  for(const other of store.channels){if(other.url===c.url){evidence.noteProof(other,'snapshot',capturedUrl);updateChannelStatus(other);patchSnapshotView(other,shot);}}
  if(previous?.file&&previous.file!==result.file)retireOldSnapshot(previous.file);
  if(!quiet){save();toast('Đã chụp ảnh kênh '+c.name);}
  return result;
 }
 async function snapshotAll(){
  const t=tasks.shots;
  if(t.running||backgroundShotsRunning)return toast('Đang có tác vụ chụp ảnh; thử lại khi hoàn thành','warn');
  const all=enabledChannels().slice();if(!all.length)return toast('Chưa có kênh để chụp','warn');
  if(!native)return toast('Chụp hàng loạt chỉ hỗ trợ trong ứng dụng đã đóng gói (có FFmpeg).','warn');
  const seen=new Set(),pending=[];let skipped=0;
  for(const c of all){
   const shot=store.snapshots[c.url];
   if(seen.has(c.url)||(store.snapshotSkipExisting&&shotPolicy?.hasImage(shot)&&!shotPolicy.isStale(shot))){skipped++;continue;}
   seen.add(c.url);pending.push(c);
  }
  if(!pending.length)return toast(`Đã có đủ ảnh mới trong 6 giờ (${skipped} kênh).`);
  const workers=Math.min(safeConcurrency(store.snapshotConcurrency),pending.length);
  if(pending.length>70&&!confirm(`Cần chụp ${pending.length} luồng (${skipped} kênh giữ ảnh còn mới), dùng ${workers} luồng FFmpeg cùng lúc. Tiếp tục?`))return;
  taskStart('shots',all.length);t.workers=workers;t.skipped=skipped;t.done=skipped;
  t.latest=`Đang chuẩn bị ${workers} tác vụ chụp ảnh`;updateTaskUI('shots');
  let cursor=0,lastSave=Date.now();
  async function worker(){
   while(!t.cancel&&cursor<pending.length){
    const c=pending[cursor++];t.latest=`Đang chụp ${c.name} • ${workers} luồng song song`;
    try{await snapshotOne(c,true);t.success++;}
    catch(e){t.failed++;console.warn('Snapshot:',c.name,String(e.message||e));}
    t.done++;updateTaskUI('shots');
    // Only the affected image DOM nodes change; never redraw the full gallery.
    if(Date.now()-lastSave>3000){lastSave=Date.now();save();}
   }
  }
  try{
   await Promise.all(Array.from({length:workers},()=>worker()));
   save();updateTaskUI('shots');
   toast(`${t.cancel?'Đã dừng':'Đã xong'}: ${t.success} ảnh mới • ${t.skipped} ảnh giữ nguyên • ${t.failed} lỗi`);
   textStatus(`Snapshot ${t.done}/${t.total}: ${t.success} ảnh mới, ${t.skipped} giữ nguyên, ${t.failed} lỗi`);
  }finally{taskEnd('shots');}
 }
 async function refreshStaleSnapshots(){
  // Bound background work to prevent thousands of FFmpeg processes or freezes.
  if(!native||!shotPolicy||!window.streamleaf?.snapshot||backgroundShotsRunning||tasks.shots.running||tasks.check.running||document.hidden||document.fullscreenElement)return;
  if(isTauri&&!snapshotBase)return;
  const now=Date.now(),seen=new Set(),stale=[];
  for(const c of enabledChannels()){
   if(seen.has(c.url))continue;seen.add(c.url);
   if(shotPolicy.eligible(store.snapshots[c.url],now))stale.push(c);
   if(stale.length>=18)break;
  }
  if(!stale.length)return;
  backgroundShotsRunning=true;
  let cursor=0,changed=0;
  // Keep ordinary playback smooth while restoring older photos in the background.
  const workers=Math.min(!player.paused?1:2,stale.length);
  async function worker(){
   while(cursor<stale.length&&!tasks.shots.running&&!document.hidden&&!document.fullscreenElement){
    const c=stale[cursor++],shot=store.snapshots[c.url];
    if(!shot||!shotPolicy.eligible(shot))continue;
    // Record unsuccessful attempts so permanently blocked sources won't loop.
    shot.lastAttemptAt=Date.now();
    try{await snapshotOne(c,true);changed++;}
    catch(e){console.debug('Stale snapshot retained:',c.name,String(e?.message||e));}
    if(cursor%5===0)save();
   }
  }
  try{await Promise.all(Array.from({length:workers},()=>worker()));save();}
  finally{backgroundShotsRunning=false;}
 }
 async function exportFile(){const active=enabledChannels();const groups=groupNames();const all=groups.flatMap(g=>organizer.sorted(store,g,active.filter(c=>groupName(c)===g)));if(!all.length)return toast('Không có kênh để xuất','warn');const content=core.exportM3U(all);
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
  bind(['castBtn'],()=>{const ch=currentChannel();if(!ch)return toast('Chọn kênh trước khi phát lên TV','warn');window.OpenIPTVCastUI?.open?.(ch,playCandidates[playCandidateIndex]||ch.url);});
  bind(['refreshAllBtn'],refreshAll);bind(['prevBtn'],()=>switchChannel(-1));bind(['nextBtn'],()=>switchChannel(1));bind(['stopBtn'],stopPlayer);bind(['playBtn'],playToggle);
  bind(['favCurrentBtn'],()=>{const channel=currentChannel();if(channel)favorite(channel);});
  $('#manualLinkSelect')?.addEventListener('change',e=>{
   const channel=currentChannel(),url=e.target.value;
   if(!channel||!manualChoices(channel).some(item=>item.url===url))return;
   void playChannel(channel.id,null,{mode:'live',manualUrl:url});
  });
  bind(['shotBtn'],async()=>{if(!current)return toast('Chưa chọn kênh','warn');try{await snapshotOne(current);}catch(e){toast(e.message,'error');}});
  bind(['fullscreenBtn'],()=>{if(!document.fullscreenElement)$('#playerBox').requestFullscreen?.();else document.exitFullscreen?.();});
  bind(['modalClose','modalCancel'],closeModal);bind(['modalConfirm'],modalSubmit);bind(['cancelCheckBtn'],()=>requestCancel('check'));bind(['cancelShotsBtn'],()=>requestCancel('shots'));const dock=$('#taskDock');
  function toggleTaskPopup(forceClosed=false){const collapsed=forceClosed?true:!dock.classList.contains('collapsed');dock.classList.toggle('collapsed',collapsed);const btn=$('#taskDockMinimize');btn.setAttribute('aria-expanded',String(!collapsed));btn.textContent=collapsed?'▴':'▾';}
  bind(['taskDockMinimize'],()=>toggleTaskPopup());
  dock.querySelector('.task-dock-head')?.addEventListener('click',e=>{if(!e.target.closest('button'))toggleTaskPopup();});
  document.addEventListener('pointerdown',e=>{if(!dock.classList.contains('collapsed')&&!dock.contains(e.target))toggleTaskPopup(true);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dock.classList.contains('collapsed'))toggleTaskPopup(true);});
  $$('.nav[data-page]').forEach(x=>x.addEventListener('click',()=>setPage(x.dataset.page)));
  $$('[data-source-jump]').forEach(x=>x.addEventListener('click',()=>{const target=document.getElementById(x.dataset.sourceJump);target?.scrollIntoView({behavior:'smooth',block:'start'});}));
  $$('.filter-tab').forEach(x=>x.addEventListener('click',()=>{filter=x.dataset.filter;$$('.filter-tab').forEach(y=>y.classList.toggle('active',x===y));renderList();}));
  installChannelPointerDnD();
  document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&selectedChannelIds.size){selectedChannelIds.clear();updateSelectionUI();}
  });
  // Snapshot and health-check limits are independent, persistent, and bounded to 1–32.
  const concurrencyControls=[
    {key:'snapshotConcurrency',ids:['snapshotWorkersQuick','snapshotWorkersSetting']},
    {key:'checkConcurrency',ids:['checkWorkersSetting','checkWorkersQuick']}
  ];
  for(const {key,ids} of concurrencyControls){
    const controls=ids.map(id=>$('#'+id)).filter(Boolean);
    const choiceName=key==='snapshotConcurrency'?'snapshotConcurrencyChoice':'checkConcurrencyChoice';
    const statusId=key==='snapshotConcurrency'?'snapshotConcurrencyState':'checkConcurrencyState';
    const choice=$('#'+choiceName);
    function updateChoice(value){
      if(choice)choice.value=String(value);
      const label=$('#'+statusId);if(label)label.textContent='Đang dùng: '+value+' luồng';
    }
    updateChoice(store[key]);
    choice?.addEventListener('change',()=>{
      const n=safeConcurrency(choice.value);
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
  const autoM3U=$('#autoRefreshM3UStart');
  if(autoM3U){autoM3U.checked=store.autoRefreshM3UOnStart!==false;autoM3U.addEventListener('change',()=>{store.autoRefreshM3UOnStart=autoM3U.checked;save();});}
  $('#searchBox').addEventListener('input',renderList);$('#volume').addEventListener('input',e=>{player.volume=e.target.value/100;store.volume=player.volume;save();});
  player.volume=store.volume??.8;$('#volume').value=Math.round(player.volume*100);
  const fit=['contain','cover','fill','none'].includes(store.videoFit)?store.videoFit:'contain';$('#videoFit').value=fit;player.className='fit-'+fit;$('#videoFit').addEventListener('change',e=>{store.videoFit=e.target.value;player.className='fit-'+store.videoFit;save();});
  player.addEventListener('playing',()=>{if(!activeMediaEvent())return;waitingSerial++;clearTimeout(failoverTimer);if(stablePlayback.attempt===playAttemptSerial&&!stablePlayback.startedAt){stablePlayback.startedAt=Date.now();stablePlayback.mediaAt=Number(player.currentTime)||0;}const generation=playGeneration;setTimeout(()=>markPlaybackVerified(generation),1800);window.IPTVProAdvanced?.onPlaying?.(current,playCandidates[playCandidateIndex]);$('#streamInfo').textContent=compatSource?'● FFmpeg tương thích • Đang phát':'● Đang phát';$('#playBtn').textContent='Ⅱ';textStatus('Đang xem: '+(current?.name||''));});
  // DOM listeners receive an Event argument. Passing markPlaybackVerified directly
  // mistakenly compared Event !== playGeneration and disabled all progress proofs.
  player.addEventListener('timeupdate',()=>markPlaybackVerified());
  player.addEventListener('loadeddata',()=>{if(!activeMediaEvent())return;const generation=playGeneration;setTimeout(()=>markPlaybackVerified(generation),1500);});
  player.addEventListener('pause',()=>{$('#playBtn').textContent='▶';});
  player.addEventListener('error',()=>{if(!current||!player.error||!activeMediaEvent())return;const code=player.error.code;const reason=({1:'Phát bị hủy',2:'Lỗi mạng',3:'Không giải mã được codec',4:'Định dạng hoặc URL video không được hỗ trợ'})[code]||'Trình phát báo lỗi';$('#streamInfo').textContent=reason;void recoverPlayback(activeMediaGeneration,reason+' (MediaError '+code+')',activeMediaAttempt);});
  player.addEventListener('waiting',()=>{if(!activeMediaEvent())return;stablePlayback.startedAt=0;const token=playGeneration,attempt=playAttemptSerial,serial=++waitingSerial,mediaAt=Number(player.currentTime)||0;setTimeout(()=>{if(token===playGeneration&&attempt===playAttemptSerial&&activeMediaEvent()&&serial===waitingSerial&&!player.paused&&player.readyState<3&&(Number(player.currentTime)||0)-mediaAt<.4)void recoverPlayback(token,'Đứng hình quá 12 giây',attempt);},12000);});
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.target.tagName==='INPUT')return;if(e.key===' '){e.preventDefault();playToggle();}});
  const chooser=document.createElement('input');chooser.type='file';chooser.id='fileInput';chooser.accept='.m3u,.m3u8,.txt';chooser.className='hidden';chooser.addEventListener('change',async()=>{await importFromInput(chooser.files?.[0]);chooser.value='';});document.body.append(chooser);
 }
 window.IPTVState=Object.freeze({getStore:()=>store,isBusy:()=>tasks.check.running||tasks.shots.running,getCurrent:()=>current,getChannels:()=>enabledChannels(),openSnapshotChannel,setPage,save,toast,textStatus,player,renderList,render,playChannel,stopPlayer,openModal,loadHlsLib,getPlayMode:()=>playMode,getMediaInfo:()=>mediaInfo,tryFfmpegManually,tryNextLink:()=>{if(playMode!=='live'||playCandidateIndex+1>=playCandidates.length)return false;void recoverPlayback(playGeneration,'Giám sát xác nhận đứng hình');return true;},importSource:addSource});
 wire();render();if(upgradedChecker)save();
 if(isTauri)setTimeout(()=>void refreshSourcesAtStartup(),2500);
 // Refresh only snapshots older than six hours; never pause video to do so.
 if(isTauri){setTimeout(()=>void refreshStaleSnapshots(),45000);setInterval(()=>void refreshStaleSnapshots(),4*60*1000);}

 $('#appMode').textContent=native?'Ứng dụng • Desktop':'Bản xem thử • Web';
 $('#miniStatus').textContent=native?'Không cần Python / VLC':'Safari phát HLS trực tiếp';
 if(native)window.streamleaf.capabilities().then(x=>{snapshotBase=x.snapshotBase||'';window.__snapshotBase=snapshotBase;render();textStatus('Sẵn sàng • FFmpeg tích hợp: '+(x.ffmpegExists?'đã sẵn sàng':'không khả dụng; vui lòng cài lại bản Full'));}).catch(()=>textStatus('Không đọc được thông tin môi trường'));
 else textStatus('Bản trình duyệt: URL/CORS và snapshot hàng loạt có giới hạn');
})();
