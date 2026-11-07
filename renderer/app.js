'use strict';
(()=>{
 const native=!!window.streamleaf;
 const core=window.StreamLeafCore;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 const seed={sources:[],channels:[],favorites:[],snapshots:{},folders:[],collapsedGroups:[],current:'',volume:.8,videoFit:'contain'};
 let store;
 try{store={...seed,...JSON.parse(localStorage.getItem('open-iptv-pro-4')||localStorage.getItem('streamleaf-3')||'{}')};}catch{store={...seed};}
 if(!Array.isArray(store.channels))store.channels=[];
 if(!Array.isArray(store.favorites))store.favorites=[];
 if(!Array.isArray(store.sources))store.sources=[];
 if(!store.snapshots||typeof store.snapshots!=='object')store.snapshots={};
 if(!Array.isArray(store.folders))store.folders=[];
 if(!Array.isArray(store.collapsedGroups))store.collapsedGroups=[];
 let filter='all',page='tv',hls=null,current=null,modalHandler=null,busy=false,cancel=false,awaitingSrc=false,snapshotBase='';
 const player=$('#video');
 function save(){try{localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));}catch(e){console.warn('Storage full',e);}}
 function textStatus(t){$('#footerText').textContent=t;$('#miniStatus').textContent=t;}
 function toast(message,type='ok'){const node=document.createElement('div');node.className='toast'+(type==='error'?' err':type==='warn'?' warn':'');node.textContent=message;$('#toastArea').append(node);setTimeout(()=>node.remove(),5500);}
 function setPage(p){page=p;$$('.nav[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));$$('.page').forEach(x=>x.classList.remove('active-page'));$('#page-'+p)?.classList.add('active-page');$('#pageTitle').textContent=({tv:'Xem truyền hình',fav:'Kênh yêu thích',shots:'Ảnh chụp kênh',sources:'Quản lý nguồn',folders:'Thư mục kênh',epg:'Lịch phát sóng EPG',settings:'Cài đặt'})[p]||'Open IPTV Pro';render();window.IPTVExtras?.onPage?.(p);}
 function closeModal(){$('#modal').classList.add('hidden');modalHandler=null;}
 function openModal(title,html,onSubmit,confirmText='Xác nhận'){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalConfirm').textContent=confirmText;modalHandler=onSubmit;$('#modal').classList.remove('hidden');setTimeout(()=>$('#modalBody input:not([type=radio])')?.focus(),40);}
 function groupName(c){return core.cleanGroup?core.cleanGroup(c.group||'Khác'):(c.group||'Khác').replace(/\s*\|\s*Kiểm tra:.+$/i,'').trim()||'Khác';}
 function groupNames(){return [...new Set([...store.folders,...enabledChannels().map(groupName)])].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));}
 function groupCount(name){return enabledChannels().filter(c=>groupName(c)===name).length;}
 function snapshotSrc(s){if(!s)return '';if(s.file)return snapshotBase?snapshotBase+encodeURIComponent(s.file):'';return s.data||'';}
 function channelThumb(c){const shot=store.snapshots[c.url];const url=snapshotSrc(shot);return url?`<img loading="lazy" src="${escape(url)}" alt="Ảnh chụp ${escape(c.name)}"/>`:icon(c);}
 function createFolder(){openModal('Tạo thư mục kênh',`<label class="modal-label">Tên thư mục mới</label><input class="modal-input" id="folderName" maxlength="90" placeholder="Ví dụ: Kênh thể thao"/>`,()=>{const value=$('#folderName').value.trim();if(!value||value.length>90)throw Error('Nhập tên thư mục (tối đa 90 ký tự)');if(groupNames().includes(value))throw Error('Thư mục này đã tồn tại');store.folders.push(value);save();render();},'Tạo thư mục');}
 function moveChannelToFolder(c){const options=groupNames().map(n=>`<option value="${escape(n)}" ${groupName(c)===n?'selected':''}>${escape(n)}</option>`).join('');openModal('Chuyển kênh vào thư mục',`<p class="hint">Kênh: <b>${escape(c.name)}</b>. Thay đổi chỉ lưu trên máy cho tới khi xuất M3U.</p><label class="modal-label">Thư mục</label><select class="modal-input" id="folderSelect">${options}</select>`,()=>{const g=$('#folderSelect').value;if(!g)throw Error('Chọn thư mục');c.group=g;save();render();toast('Đã chuyển '+c.name+' tới '+g);},'Chuyển kênh');}
 function renameFolder(old){openModal('Đổi tên thư mục',`<label class="modal-label">Tên thư mục</label><input class="modal-input" id="folderRename" maxlength="90" value="${escape(old)}"/>`,()=>{const name=$('#folderRename').value.trim();if(!name)throw Error('Nhập tên thư mục');if(name!==old&&groupNames().includes(name))throw Error('Tên thư mục đã tồn tại');store.channels.filter(c=>groupName(c)===old).forEach(c=>{c.group=name});store.folders=store.folders.filter(x=>x!==old);if(!store.folders.includes(name))store.folders.push(name);store.collapsedGroups=store.collapsedGroups.map(x=>x===old?name:x);save();render();},'Lưu');}
 function deleteFolder(group){const count=groupCount(group);if(count&&!confirm(`Thư mục ${group} đang chứa ${count} kênh. Chuyển các kênh sang Khác rồi xóa thư mục?`))return;if(!count&&!confirm(`Xóa thư mục trống ${group}?`))return;store.channels.filter(c=>groupName(c)===group).forEach(c=>{c.group='Khác'});store.folders=store.folders.filter(x=>x!==group);store.collapsedGroups=store.collapsedGroups.filter(x=>x!==group);save();render();}
 function renderFolders(){const root=$('#folderManager');root.replaceChildren();const groups=groupNames();if(!groups.length){root.innerHTML='<div class="empty-list">Chưa có thư mục. Nhập M3U để lấy nhóm có sẵn hoặc tạo thư mục mới.</div>';return;}groups.forEach(g=>{const card=document.createElement('div');card.className='folder-card';card.innerHTML=`<h3>▤ ${escape(g)}</h3><p>${groupCount(g)} kênh trong thư mục</p><div class="folder-card-actions"><button class="folder-open">▶ Xem kênh</button><button class="folder-rename">✎ Đổi tên</button><button class="folder-delete">✕ Xóa</button></div>`;card.querySelector('.folder-open').onclick=()=>{store.collapsedGroups=store.collapsedGroups.filter(x=>x!==g);save();setPage('tv');$('#searchBox').value='';renderList();document.querySelectorAll('.folder-header').forEach(x=>{if(x.dataset.group===g)x.scrollIntoView({block:'nearest'});});};card.querySelector('.folder-rename').onclick=()=>renameFolder(g);card.querySelector('.folder-delete').onclick=()=>deleteFolder(g);root.append(card)});}
 function icon(c){return c.logo?`<img loading="lazy" src="${escape(c.logo)}" alt="" onerror="this.style.display='none';this.parentNode.textContent='TV'" />`:'TV';}
 function channelView(){let a=enabledChannels();
  const query=$('#searchBox').value.trim().toLowerCase();if(query)a=a.filter(c=>(c.name+' '+c.group).toLowerCase().includes(query));
  if(filter==='fav')a=a.filter(c=>store.favorites.includes(c.url));
  if(filter==='alive')a=a.filter(c=>c.status==='alive');
  return a;
 }
 function renderList(){
  const result=channelView();$('#channelMeta').textContent=`${result.length} / ${store.channels.length} kênh`;
  const target=$('#channelList');target.replaceChildren();
  if(!result.length){target.innerHTML=`<div class="empty-list">${store.channels.length?'Không thấy kênh phù hợp.':'Chưa có kênh. Dùng Mở file M3U hoặc Thêm URL để nhập danh sách.'}</div>`;return;}
  const groups=new Map();result.forEach(c=>{const g=groupName(c);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(c)});
  const f=document.createDocumentFragment();
  [...groups.keys()].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true})).forEach(group=>{
    const entries=groups.get(group),collapsed=store.collapsedGroups.includes(group)&&!$('#searchBox').value.trim();
    const header=document.createElement('button');header.type='button';header.className='folder-header';header.dataset.group=group;
    header.innerHTML=`<span class="folder-arrow">${collapsed?'▸':'▾'}</span><span class="folder-emoji">📁</span><span>${escape(group)}</span><span class="folder-size">${entries.length}</span>`;
    header.addEventListener('click',()=>{if(store.collapsedGroups.includes(group))store.collapsedGroups=store.collapsedGroups.filter(x=>x!==group);else store.collapsedGroups.push(group);save();renderList()});f.append(header);
    if(collapsed)return;
    entries.forEach(c=>{
      const row=document.createElement('div');const shot=store.snapshots[c.url];row.className='channel-item'+(current?.id===c.id?' current':'');
      row.innerHTML=`<div class="chan-logo ${snapshotSrc(shot)?'snapshot-thumb':''}">${channelThumb(c)}</div><div class="channel-text"><b>${escape(c.name)}</b><small><i class="mini-pill ${escape(c.status||'')}"></i>${shot?'📸 Đã có ảnh • ':''}${escape(groupName(c))}</small></div><button class="channel-move" title="Chuyển thư mục">▤</button><button class="channel-star ${store.favorites.includes(c.url)?'marked':''}" title="Yêu thích">${store.favorites.includes(c.url)?'★':'☆'}</button>`;
      row.addEventListener('click',()=>playChannel(c.id));row.querySelector('.channel-star').addEventListener('click',e=>{e.stopPropagation();favorite(c.url);});row.querySelector('.channel-move').addEventListener('click',e=>{e.stopPropagation();moveChannelToFolder(c);});window.IPTVExtras?.decorateRow?.(c,row);f.append(row);
    });
  });target.append(f);
 }
 function renderSources(){const list=$('#sourcesList');list.replaceChildren();if(!store.sources.length){list.innerHTML='<div class="empty-list">Chưa có nguồn. Thêm URL playlist hoặc file M3U từ máy.</div>';return;}
  for(const s of store.sources){const n=store.channels.filter(c=>c.sourceId===s.id).length;const d=document.createElement('article');d.className='source-card';d.innerHTML=`<div class="source-top"><h3>${escape(s.name)}</h3><label title="Bật / tắt nguồn"><input class="toggle" type="checkbox" ${s.enabled!==false?'checked':''}/></label></div><div class="source-url" title="${escape(s.origin||'')}">${escape(s.origin||'File M3U')}</div><div class="source-meta">${n} kênh • ${s.type==='url'?'Nguồn URL':'File cục bộ'}</div><div class="source-actions"><button class="src-refresh" ${s.type!=='url'?'disabled':''}>↻ Tải lại</button><button class="src-rename">✎ Đổi tên</button><button class="src-delete remove">✕ Xóa</button></div>`;
   d.querySelector('.toggle').addEventListener('change',e=>{s.enabled=e.target.checked;save();render();});
   d.querySelector('.src-refresh').addEventListener('click',()=>refreshSource(s));
   d.querySelector('.src-rename').addEventListener('click',()=>renameSource(s));
   d.querySelector('.src-delete').addEventListener('click',()=>deleteSource(s));list.append(d);
  }
 }
 function renderShots(){const target=$('#shotList');target.replaceChildren();const entries=Object.entries(store.snapshots).filter(x=>snapshotSrc(x[1]));
  if(!entries.length){target.innerHTML='<div class="empty-list">Chưa có ảnh chụp. Bấm “Chụp toàn bộ” hoặc chọn kênh rồi bấm nút ▣.</div>';return;}
  entries.slice().reverse().forEach(([url,shot])=>{const c=store.channels.find(x=>x.url===url);const div=document.createElement('div');div.className='shot-card';div.innerHTML=`<img src="${escape(snapshotSrc(shot))}" alt="Ảnh kênh"/><b>${escape(c?.name||shot.name||'Kênh')}</b><small>${escape(shot.date||'')} • Chụp bằng ${escape(shot.method||'FFmpeg')}</small>`;div.addEventListener('click',()=>{if(c)playChannel(c.id);setPage('tv');});target.append(div);});
 }
 function renderFavorites(){const target=$('#favoriteList');target.replaceChildren();const favorites=store.channels.filter(c=>store.favorites.includes(c.url));if(!favorites.length){target.innerHTML='<div class="empty-list">Chưa có kênh yêu thích. Bấm dấu ☆ bên cạnh một kênh để lưu.</div>';return;}
  favorites.forEach(c=>{const div=document.createElement('div');div.className='fav-card';div.innerHTML=`<div class="chan-logo ${snapshotSrc(store.snapshots[c.url])?'snapshot-thumb':''}">${channelThumb(c)}</div><div><h3>${escape(c.name)}</h3><small>${escape(c.group)}</small></div><button>▶ Xem</button>`;div.querySelector('button').onclick=()=>{setPage('tv');playChannel(c.id)};target.append(div);});
 }
 function render(){
  const enabled=store.sources.filter(s=>s.enabled!==false);const visible=store.channels.filter(c=>enabled.some(s=>s.id===c.sourceId));
  $('#navCount').textContent=visible.length;$('#favCount').textContent=store.favorites.length;$('#sourceCount').textContent=store.sources.length;$('#footerCounts').textContent=`${store.channels.length} kênh • ${store.sources.length} nguồn`;
  $('#activeSourceTag').textContent=store.sources.length?`${store.sources.length} nguồn M3U`:'Chưa có nguồn';
  renderList();renderSources();renderShots();renderFavorites();renderFolders();$('#folderCount').textContent=groupNames().length;
  $('#favCurrentBtn').textContent=current&&store.favorites.includes(current.url)?'★':'☆';window.IPTVExtras?.render?.();
 }
 function favorite(url){const p=store.favorites.indexOf(url);if(p>=0)store.favorites.splice(p,1);else store.favorites.push(url);save();render();}
 function id(){return 'src_'+Date.now().toString(36)+'_'+Math.floor(Math.random()*1e8).toString(36);}
 function addSource(name,origin,content,type){const sourceId=id();const parsed=core.parseM3U(content,sourceId);if(!parsed.length)throw new Error('Không tìm thấy kênh hợp lệ trong M3U');
  const src={id:sourceId,name,origin,type,enabled:true,addedAt:new Date().toISOString()};store.sources.push(src);store.channels.push(...parsed);save();render();toast(`Đã thêm ${parsed.length} kênh từ ${name}`);textStatus(`Đã thêm ${parsed.length} kênh mới`);setPage('tv');}
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
   fresh.forEach(c=>Object.assign(c,states.get(c.url)||{}));store.channels=store.channels.filter(c=>c.sourceId!==source.id).concat(fresh);save();render();toast(`Đã làm mới ${fresh.length} kênh từ ${source.name}`);textStatus('Tải lại thành công');}
   catch(e){toast('Không thể tải lại: '+e.message,'error');textStatus('Tải lại thất bại; đã giữ dữ liệu cũ');}}
 async function refreshAll(){if(busy)return;const sources=store.sources.filter(s=>s.type==='url'&&s.enabled!==false);if(!sources.length){toast('Chưa có nguồn URL để tải lại','warn');return;}for(const s of sources)await refreshSource(s);}
 function renameSource(s){openModal('Đổi tên nguồn',`<label class="modal-label">Tên nguồn</label><input class="modal-input" id="renameValue" value="${escape(s.name)}"/>`,()=>{s.name=$('#renameValue').value.trim()||s.name;save();render();});}
 function deleteSource(s){if(!confirm(`Xóa nguồn "${s.name}" và tất cả kênh của nguồn này?`))return;store.sources=store.sources.filter(x=>x.id!==s.id);store.channels=store.channels.filter(c=>c.sourceId!==s.id);if(current?.sourceId===s.id)stopPlayer();save();render();toast('Đã xóa nguồn');}
 function enabledChannels(){const s=new Set(store.sources.filter(s=>s.enabled!==false).map(s=>s.id));return store.channels.filter(c=>s.has(c.sourceId));}
 function stopPlayer(){if(hls){hls.destroy();hls=null;}player.pause();player.removeAttribute('src');player.load();current=null;$('#playingTitle').textContent='Chưa chọn kênh';$('#playingSubtitle').textContent='Chọn kênh để phát';$('#playBtn').textContent='▶';$('#emptyPlayer').classList.remove('hidden');$('#playingIcon').textContent='TV';renderList();window.IPTVExtras?.onChannel?.(null);}
 async function loadHlsLib(){if(window.Hls)return window.Hls;if(native)throw Error('Ứng dụng chưa đóng gói hls.js. Hãy chạy npm install rồi đóng gói lại.');return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';script.onload=()=>window.Hls?resolve(window.Hls):reject(Error('Thiếu thư viện hls.js'));script.onerror=()=>reject(Error('Không tải được hls.js từ CDN để phát HLS trên trình duyệt này'));document.head.append(script);});}
 async function playChannel(chId){const found=enabledChannels().find(c=>c.id===chId);if(!found){toast('Kênh đã tắt nguồn hoặc không còn tồn tại','warn');return;}
  current=found;store.current=chId;save();renderList();$('#playingTitle').textContent=found.name;$('#playingSubtitle').textContent=found.group+' • '+(found.status==='alive'?'Đã kiểm tra':'Chưa xác minh');$('#playingIcon').textContent=found.name.slice(0,2).toUpperCase();$('#emptyPlayer').classList.add('hidden');$('#streamInfo').textContent='Đang kết nối...';$('#favCurrentBtn').textContent=store.favorites.includes(found.url)?'★':'☆';window.IPTVExtras?.onChannel?.(found);
  try {
   if(hls){hls.destroy();hls=null;}player.pause();player.removeAttribute('src');player.load();
   if(/^(rtsp|rtmp|udp):/i.test(found.url))throw Error('Luồng RTSP/RTMP/UDP chưa hỗ trợ trực tiếp. Hãy dùng luồng HLS (.m3u8) hoặc MP4.');
   const url=native?await window.streamleaf.proxy(found.url):found.url;
   let looksHls=/\.m3u8?(?:\?|$)/i.test(found.url) || /m3u8/i.test(found.name);
   if(native&&!looksHls)try{looksHls=(await window.streamleaf.mediaKind(found.url)).hls;}catch{}
   // HLS.js is the primary decoder in Electron Chromium; Safari supports HLS natively.
   if(looksHls && player.canPlayType('application/vnd.apple.mpegurl')){player.crossOrigin=native?'anonymous':null;player.src=url;}
   else if(looksHls){const H=await loadHlsLib();if(!H.isSupported())throw Error('Thiết bị không hỗ trợ MediaSource phát HLS');hls=new H({enableWorker:true,maxBufferLength:12,lowLatencyMode:true,backBufferLength:8});hls.loadSource(url);hls.attachMedia(player);hls.on(H.Events.ERROR,(_ev,data)=>{if(data.fatal){toast('Lỗi phát kênh: '+data.details,'error');textStatus('Lỗi HLS: '+data.details);}});}
   else {player.crossOrigin=native?'anonymous':null;player.src=url;}
   $('#streamInfo').textContent=looksHls?'HLS • Đang kết nối':'Video • Đang kết nối';
   const p=player.play();if(p?.catch)p.catch(()=>{textStatus('Đã nạp kênh, bấm ▶ để phát');});
   $('#playBtn').textContent='Ⅱ';textStatus('Đang kết nối: '+found.name);
  }catch(e){toast(e.message,'error');textStatus(e.message);$('#emptyPlayer').classList.remove('hidden');}
 }
 async function playToggle(){if(!current){const first=enabledChannels()[0];if(first)await playChannel(first.id);else toast('Hãy thêm file M3U hoặc URL trước','warn');return;}
  if(player.paused){try{await player.play();$('#playBtn').textContent='Ⅱ';}catch(e){toast('Không thể phát: '+e.message,'error');}}
  else{player.pause();$('#playBtn').textContent='▶';}}
 function switchChannel(dir){const all=enabledChannels();if(!all.length)return;let index=all.findIndex(c=>c.id===current?.id);index=(index+dir+all.length)%all.length;playChannel(all[index].id);}
 function taskStart(title,total){busy=true;cancel=false;$('#taskBox').classList.remove('hidden');$('#taskTitle').textContent=title;taskUpdate(0,total);}
 function taskUpdate(n,total){$('#progressBar').style.width=(total?Math.floor(n/total*100):0)+'%';$('#taskProgress').textContent=`${n}/${total}`;}
 function taskEnd(){busy=false;$('#taskBox').classList.add('hidden');}
 async function checkOne(url){if(!native){try{const r=await fetch(url,{method:'GET',signal:AbortSignal.timeout(7000)});if(!r.ok)return {status:'dead',reason:'HTTP '+r.status};return {status:'uncertain',reason:'Trình duyệt không kiểm tra được segment do CORS'};}catch(e){return {status:'uncertain',reason:'CORS / mạng: '+e.message};}}return await window.streamleaf.check(url);}
 async function checkAll(){if(busy){toast('Đang chạy một tác vụ khác','warn');return;}const all=enabledChannels();if(!all.length){toast('Chưa có kênh để kiểm tra','warn');return;}
  if(!native)toast('Kiểm tra sâu chỉ có trên bản cài. Trình duyệt có thể bị giới hạn CORS.','warn');
  taskStart('Kiểm tra nhiều vòng các kênh',all.length);let cursor=0,completed=0,alive=0,dead=0,uncertain=0;
  async function worker(){while(!cancel&&cursor<all.length){const ch=all[cursor++];try{const res=await checkOne(ch.url);ch.status=res.status;ch.reason=res.reason;ch.checkedAt=new Date().toISOString();if(res.status==='alive')alive++;else if(res.status==='dead')dead++;else uncertain++;}catch(e){ch.status='uncertain';ch.reason=e.message;ch.checkedAt=new Date().toISOString();uncertain++;}completed++;taskUpdate(completed,all.length);if(completed%5===0){save();renderList();}}}
  try{await Promise.all(Array.from({length:Math.min(3,all.length)},()=>worker()));save();render();toast(`Kiểm tra ${completed} kênh: ${alive} sống • ${dead} lỗi • ${uncertain} chưa chắc chắn`);textStatus(`Kiểm tra xong: ${alive} sống / ${dead} lỗi / ${uncertain} chưa rõ`);}finally{taskEnd();}
 }
 async function snapshotOne(c,quiet=false){let result;
  if(native){try{result=await window.streamleaf.snapshot(c.url,c.name);}catch(e){if(!quiet)toast('FFmpeg: '+e.message,'warn');}}
  if(!result&&current?.id===c.id&&player.videoWidth){try{const cvs=document.createElement('canvas');cvs.width=480;cvs.height=Math.max(1,Math.round(480*player.videoHeight/player.videoWidth));cvs.getContext('2d').drawImage(player,0,0,cvs.width,cvs.height);result={data:cvs.toDataURL('image/jpeg',.68),method:'Video'};}catch{}}
  if(!result)throw Error('Không lấy được khung hình (luồng lỗi, bảo vệ nội dung hoặc CORS)');
  store.snapshots[c.url]={...(result.file?{file:result.file}:{data:result.data}),name:c.name,date:new Date().toLocaleString('vi-VN'),method:result.method||'FFmpeg'};save();if(!quiet){renderShots();renderList();toast('Đã chụp ảnh kênh '+c.name);}return result;
 }
 async function snapshotAll(){if(busy)return toast('Tác vụ khác đang chạy','warn');const all=enabledChannels();if(!all.length)return toast('Chưa có kênh để chụp','warn');
  if(!native)return toast('Chụp hàng loạt chỉ hỗ trợ trong ứng dụng đã đóng gói (có FFmpeg).','warn');
  if(all.length>70&&!confirm(`Có ${all.length} kênh. Chụp toàn bộ có thể mất nhiều thời gian; tiếp tục?`))return;
  taskStart('Chụp ảnh từng kênh bằng FFmpeg',all.length);let done=0,good=0;
  try{for(const c of all){if(cancel)break;try{await snapshotOne(c,true);good++;}catch(e){}done++;taskUpdate(done,all.length);if(done%4===0){renderShots();renderList();}}renderShots();renderList();toast(`Chụp xong ${good}/${done} kênh`);textStatus(`Snapshot: ${good} ảnh thành công / ${done} kênh`);}finally{taskEnd();}
 }
 async function exportFile(){const all=enabledChannels();if(!all.length)return toast('Không có kênh để xuất','warn');const content=core.exportM3U(all);
  try{if(native){const dest=await window.streamleaf.export('iptv.m3u',content);if(dest)toast('Đã lưu: '+dest);}else{const blob=new Blob([content],{type:'audio/x-mpegurl;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='iptv.m3u';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);toast('Đã tải file iptv.m3u');}}
  catch(e){toast('Không xuất được: '+e.message,'error');}}
 function openGit(){if(!native)return toast('Đăng GitHub chỉ hỗ trợ bản ứng dụng cài đặt','warn');if(!enabledChannels().length)return toast('Chưa có kênh để đăng','warn');
  const statuses=enabledChannels().reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});const checked=Object.keys(statuses).filter(x=>x!=='unchecked');
  openModal('Cập nhật GitHub / Gist',`<p class="hint">Chỉ gửi sau khi bạn nhấn xác nhận lần cuối. Token không được lưu hoặc tự động dùng lại. Nên sao lưu file M3U tốt trước khi ghi đè.</p>
  <label class="modal-label">Đích lưu</label><div class="radio-set"><label><input type="radio" name="gitType" value="gist" checked/> Gist</label><label><input type="radio" name="gitType" value="repo"/> Repository</label></div>
  <div id="gitGist"><label class="modal-label">Gist ID</label><input id="gistID" class="modal-input" placeholder="ID dài trong đường dẫn gist.github.com/..."/></div>
  <div id="gitRepo" class="hidden"><label class="modal-label">Tên tài khoản / tổ chức</label><input id="repoOwner" class="modal-input" placeholder="username"/><label class="modal-label">Tên kho mã (repository)</label><input id="repoName" class="modal-input" placeholder="iptv-playlist"/><label class="modal-label">Nhánh</label><input id="repoBranch" class="modal-input" value="main"/></div>
  <label class="modal-label">Tên file trên Git</label><input id="gitFile" class="modal-input" value="iptv.m3u"/>
  <label class="modal-label">Personal Access Token (chỉ dùng lần này)</label><input id="gitToken" type="password" class="modal-input" placeholder="github_pat_..." autocomplete="off"/>
  <p class="hint">Hiện có <b>${statuses.alive||0}</b> kênh sống, <b>${statuses.dead||0}</b> kênh lỗi, <b>${statuses.uncertain||0}</b> chưa xác minh, <b>${statuses.unchecked||0}</b> chưa kiểm tra. Không có thao tác tự động cập nhật Git.</p>`,async()=>{
   const type=$('input[name="gitType"]:checked').value;
   const config={type,id:$('#gistID').value.trim(),owner:$('#repoOwner').value.trim(),repo:$('#repoName').value.trim(),branch:$('#repoBranch').value.trim(),filename:$('#gitFile').value.trim(),token:$('#gitToken').value.trim()};
   if(!config.token)throw Error('Bạn chưa nhập token');
   const all=enabledChannels();const live=all.filter(c=>c.status==='alive').length;
   if(all.length>=10&&live>0&&live/all.length<.2)throw Error('Tỷ lệ kênh sống dưới 20%, đã chặn đăng để tránh ghi đè playlist tốt.');
   if(!confirm(`XÁC NHẬN CẬP NHẬT GITHUB?\n\nĐích: ${type==='gist'?'Gist '+config.id:config.owner+'/'+config.repo}\nFile: ${config.filename}\n${all.length} kênh\n\nThao tác sẽ ghi đè nội dung file đích nếu file tồn tại.`))return;
   const data=await window.streamleaf.publish(config,core.exportM3U(all));toast(data.message+' • '+data.url);textStatus(data.message);
  },'Xem và xác nhận');
  $$('input[name="gitType"]').forEach(r=>r.addEventListener('change',()=>{$('#gitGist').classList.toggle('hidden',r.value==='repo'&&r.checked||$('input[name="gitType"]:checked').value==='repo');$('#gitRepo').classList.toggle('hidden',$('input[name="gitType"]:checked').value!=='repo');}));
 }
 async function modalSubmit(){if(!modalHandler)return;const cb=modalHandler;const button=$('#modalConfirm');button.disabled=true;const old=button.textContent;button.textContent='Đang xử lý...';try{await cb();closeModal();}catch(e){toast(e.message||String(e),'error');}finally{button.disabled=false;button.textContent=old;}}
 function wire(){
  const bind=(ids,fn)=>ids.forEach(id=>$('#'+id)?.addEventListener('click',fn));
  bind(['fileBtn','emptyFileBtn','sourcesFileBtn'],loadFile);bind(['urlBtn','emptyUrlBtn','sourcesUrlBtn'],openURL);
  bind(['quickChecks','checkNav'],checkAll);bind(['quickShots','shotsAllBtn'],snapshotAll);bind(['quickExport','exportNav'],exportFile);bind(['gitNav'],openGit);
  bind(['folderCreateBtn','newFolderFromList'],createFolder);bind(['expandFolderBtn'],()=>{store.collapsedGroups=[];save();renderList();});bind(['collapseFolderBtn'],()=>{store.collapsedGroups=groupNames();save();renderList();});
  bind(['refreshAllBtn'],refreshAll);bind(['prevBtn'],()=>switchChannel(-1));bind(['nextBtn'],()=>switchChannel(1));bind(['stopBtn'],stopPlayer);bind(['playBtn'],playToggle);
  bind(['favCurrentBtn'],()=>{if(current)favorite(current.url);});
  bind(['shotBtn'],async()=>{if(!current)return toast('Chưa chọn kênh','warn');try{await snapshotOne(current);}catch(e){toast(e.message,'error');}});
  bind(['fullscreenBtn'],()=>{if(!document.fullscreenElement)$('#playerBox').requestFullscreen?.();else document.exitFullscreen?.();});
  bind(['modalClose','modalCancel'],closeModal);bind(['modalConfirm'],modalSubmit);bind(['cancelTaskBtn'],()=>{cancel=true;textStatus('Đã yêu cầu hủy tác vụ');});
  $$('.nav[data-page]').forEach(x=>x.addEventListener('click',()=>setPage(x.dataset.page)));
  $$('.filter-tab').forEach(x=>x.addEventListener('click',()=>{filter=x.dataset.filter;$$('.filter-tab').forEach(y=>y.classList.toggle('active',x===y));renderList();}));
  $('#searchBox').addEventListener('input',renderList);$('#volume').addEventListener('input',e=>{player.volume=e.target.value/100;store.volume=player.volume;save();});
  player.volume=store.volume??.8;$('#volume').value=Math.round(player.volume*100);
  const fit=['contain','cover','fill','none'].includes(store.videoFit)?store.videoFit:'contain';$('#videoFit').value=fit;player.className='fit-'+fit;$('#videoFit').addEventListener('change',e=>{store.videoFit=e.target.value;player.className='fit-'+store.videoFit;save();});
  player.addEventListener('playing',()=>{$('#streamInfo').textContent='● Đang phát';$('#playBtn').textContent='Ⅱ';textStatus('Đang xem: '+(current?.name||''));});
  player.addEventListener('pause',()=>{$('#playBtn').textContent='▶';});
  player.addEventListener('error',()=>{if(current){$('#streamInfo').textContent='Lỗi phát video';textStatus('Không phát được kênh. Thử link khác hoặc kiểm tra link.');}});
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.target.tagName==='INPUT')return;if(e.key===' '){e.preventDefault();playToggle();}});
  const chooser=document.createElement('input');chooser.type='file';chooser.id='fileInput';chooser.accept='.m3u,.m3u8,.txt';chooser.className='hidden';chooser.addEventListener('change',async()=>{await importFromInput(chooser.files?.[0]);chooser.value='';});document.body.append(chooser);
 }
 window.IPTVState=Object.freeze({getStore:()=>store,getCurrent:()=>current,getChannels:()=>enabledChannels(),setPage,save,toast,textStatus,player,renderList});
 wire();render();
 $('#appMode').textContent=native?'Ứng dụng • Desktop':'Bản xem thử • Web';
 $('#miniStatus').textContent=native?'Không cần Python / VLC':'Safari phát HLS trực tiếp';
 if(native)window.streamleaf.capabilities().then(x=>{snapshotBase=x.snapshotBase||'';render();textStatus('Sẵn sàng • FFmpeg tích hợp: '+(x.ffmpegExists?'có':'chưa khả dụng'));}).catch(()=>textStatus('Không đọc được thông tin môi trường'));
 else textStatus('Bản trình duyệt: URL/CORS và snapshot hàng loạt có giới hạn');
})();
