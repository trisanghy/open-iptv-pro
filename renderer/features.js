'use strict';
(() => {
 const ctx=window.IPTVState, guideLib=window.IPTVGuide;
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const today=(t)=>new Date(t).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
 const notifyWatchFlow=()=>document.dispatchEvent(new Event('openiptv:watchflow-epg-changed'));
 const defaultSources=[
  {name:'Việt Nam • VNEPG · Gzip (mặc định)',url:'https://epg.io.vn/epg.xml.gz',enabled:true},
  {name:'Việt Nam • VNEPG · XML tiêu chuẩn',url:'https://epg.io.vn/epg.xml',enabled:false},
  {name:'Việt Nam • VNEPG · Gzip Việt hóa',url:'https://epg.io.vn/epgu.xml.gz',enabled:false},
  {name:'Việt Nam • EPGShare01 (dự phòng)',url:'https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz',enabled:false},
  {name:'Singapore • IPTV-EPG.org',url:'https://iptv-epg.org/files/epg-sg.xml',enabled:false},
  {name:'Thái Lan • IPTV-EPG.org',url:'https://iptv-epg.org/files/epg-th.xml',enabled:false},
  {name:'Anh • IPTV-EPG.org',url:'https://iptv-epg.org/files/epg-gb.xml',enabled:false},
  {name:'Malaysia • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_MY1.xml.gz',enabled:false},
  {name:'Singapore • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_SG1.xml.gz',enabled:false},
  {name:'Nhật Bản • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_JP1.xml.gz',enabled:false},
  {name:'Hàn Quốc • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_KR1.xml.gz',enabled:false},
  {name:'Philippines • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_PH2.xml.gz',enabled:false},
  {name:'Úc • IPTV-EPG.org',url:'https://iptv-epg.org/files/epg-au.xml',enabled:false},
  {name:'New Zealand • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_NZ1.xml.gz',enabled:false},
  {name:'Mỹ (Thể thao) • EPGShare01',url:'https://epgshare01.online/epgshare01/epg_ripper_US_SPORTS1.xml.gz',enabled:false},
  {name:'Việt Nam • EPG.pw (dự phòng)',url:'https://epg.pw/xmltv/epg_VN.xml',enabled:false}
 ];
 let config;
 try{config=JSON.parse(localStorage.getItem('open-iptv-pro-settings-v1')||'{}')}catch{config={}};
 if(!Array.isArray(config.sources))config.sources=defaultSources.map(s=>({...s}));
 else{
  const known=new Set(config.sources.map(s=>s?.url).filter(Boolean));
  for(const preset of defaultSources)if(!known.has(preset.url))config.sources.push({...preset});
 }
 // Revert the exclusive EPG.pw policy: the feed is opt-in only.
 // Retain every user-added feed and do not undo the user's startup preference.
 const epgSourcePolicy='epg-pw-disabled-backup-20261119';
 if(config.epgSourcePolicy!==epgSourcePolicy){
  const wasExclusive=config.epgSourcePolicy==='epg-pw-vn-only-20261119';
  const isEPGPW=url=>/^https:\/\/epg\.pw\/xmltv\/epg_VN\.xml(?:\?.*)?$/i.test(String(url||''));
  const others=config.sources.filter(s=>s&&typeof s.url==='string'&&!isEPGPW(s.url));
  const main=others.find(s=>s.url==='https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz');
  // Previous exclusive migration switched off the old primary; enable it again.
  if(main&&wasExclusive)main.enabled=true;
  config.sources=[...(main?[main]:[]),...others.filter(s=>s!==main),{...defaultSources[defaultSources.length-1]}];
  config.epgSourcePolicy=epgSourcePolicy;
 }
 // One-time default switch for new and existing Web installations.
 // Keep all user-added feeds, mappings, startup preferences and subsequent
 // manual checkbox changes. Old EPGShare01 stays available as opt-in backup.
 const vnepgSourcePolicy='vnepg-gzip-default-20261120';
 if(config.vnepgSourcePolicy!==vnepgSourcePolicy){
  const vnepgPresets=defaultSources.slice(0,3);
  const vnepgURLs=new Set(vnepgPresets.map(s=>s.url));
  const preserved=config.sources.filter(s=>s&&typeof s.url==='string'&&!vnepgURLs.has(s.url.split(/[?#]/,1)[0]));
  for(const source of preserved){
   if(source.url==='https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz')source.enabled=false;
  }
  config.sources=[...vnepgPresets.map(s=>({...s})),...preserved];
  config.vnepgSourcePolicy=vnepgSourcePolicy;
 }
 const presetEPGURLs=new Set(defaultSources.map(s=>s.url));
 if(!/^#[0-9a-fA-F]{6}$/.test(config.accent||''))config.accent='#bc7cff';
 if(typeof config.accentCustom!=='boolean')config.accentCustom=config.accent.toLowerCase()!=='#bc7cff';
 if(!['light','dark','amoled','auto'].includes(config.appearanceMode))config.appearanceMode='auto';
 if(!['sidebar','compact'].includes(config.uiNavLayout))config.uiNavLayout='sidebar';
 if(typeof config.repo!=='string')config.repo='';
 if(!config.manualMappings||typeof config.manualMappings!=='object')config.manualMappings={};
 if(!Number.isFinite(Number(config.offsetMinutes)))config.offsetMinutes=0;
 // Do not re-enable auto EPG on a version upgrade if the user turned it off.
 if(typeof config.autoRefreshEPGOnStartup!=='boolean')config.autoRefreshEPGOnStartup=true;
 config.epgStartupDefaultVersion='4.23.13';
 const saveConfig=()=>{try{localStorage.setItem('open-iptv-pro-settings-v1',JSON.stringify(config))}catch{}};
 const systemColorScheme=window.matchMedia?.('(prefers-color-scheme: dark)');
 function resolvedAppearance(){return config.appearanceMode==='auto'?(systemColorScheme?.matches?'dark':'light'):config.appearanceMode;}
 function updateAppearance(persist=true){
   const appearance=resolvedAppearance();
   document.documentElement.dataset.theme=appearance;
   document.documentElement.dataset.appearance=config.appearanceMode;
   document.querySelectorAll('input[name="appearanceMode"]').forEach(el=>{el.checked=el.value===config.appearanceMode;});
   document.documentElement.dataset.navLayout=config.uiNavLayout;
   document.querySelectorAll('input[name="uiNavLayout"]').forEach(el=>{el.checked=el.value===config.uiNavLayout;});
   const msg=$('#appearanceState');if(msg)msg.textContent=config.appearanceMode==='auto'?`Tự động theo hệ thống · Hiện tại: ${appearance==='light'?'Sáng':appearance==='amoled'?'AMOLED':'Tối'}`:`Đã chọn giao diện ${appearance==='light'?'Sáng':appearance==='amoled'?'AMOLED':'Tối'}`;
   if(persist)saveConfig();
 }

 let guide={names:{},programmes:[],aliasesById:{},manualMappings:config.manualMappings,offsetMinutes:config.offsetMinutes},updatedAt='',loading=false,epgRequestedInSession=false,currentVersion='4.23.13';
 const legacyGuideKey='open-iptv-pro-epg-v1',largeGuideDB='open-iptv-pro-epg-cache-v2';
 let guideCacheGeneration=0,guideCacheQueue=Promise.resolve();
 // The existing localStorage cache remains a migration/fallback source.
 // Large XMLTV guides are primarily stored in IndexedDB on mobile browsers.
 try{const cached=JSON.parse(localStorage.getItem(legacyGuideKey)||'null');if(cached?.guide&&Array.isArray(cached.guide.programmes)){guide=cached.guide;guide.manualMappings=config.manualMappings;guide.offsetMinutes=config.offsetMinutes;updatedAt=cached.updatedAt||'';}}catch{}
 // Keep only one persisted EPG guide; gzip reduces Safari IndexedDB usage.
 async function encodeGuideSnapshot(snapshot){
  if(typeof CompressionStream!=='function'||typeof DecompressionStream!=='function'
   ||typeof Blob!=='function'||typeof Response!=='function')return snapshot;
  try{
   const bytes=new Uint8Array(await new Response(
    new Blob([JSON.stringify(snapshot)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
   if(!bytes.byteLength)throw Error('EPG nén rỗng');
   return {format:'gzip-json-v1',data:bytes,updatedAt:snapshot.updatedAt};
  }catch{return snapshot;}
 }
 async function decodeGuideSnapshot(saved){
  if(!saved||saved.format!=='gzip-json-v1')return saved;
  if(typeof DecompressionStream!=='function'||typeof Blob!=='function'||typeof Response!=='function')
   throw Error('Trình duyệt không hỗ trợ EPG nén');
  const value=JSON.parse(await new Response(new Blob([saved.data])
   .stream().pipeThrough(new DecompressionStream('gzip'))).text());
  if(!Array.isArray(value?.guide?.programmes))throw Error('EPG cache không hợp lệ');
  return value;
 }
 function openGuideDatabase(){
  return new Promise((resolve,reject)=>{
   if(typeof indexedDB==='undefined'){reject(Error('IndexedDB không khả dụng'));return;}
   let req;
   try{req=indexedDB.open(largeGuideDB,1);}catch(e){reject(e);return;}
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('guides'))req.result.createObjectStore('guides');};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Không thể mở bộ nhớ EPG'));
   req.onblocked=()=>reject(Error('Bộ nhớ EPG đang được sử dụng ở tab khác'));
  });
 }
 async function saveGuideInDatabase(snapshot){
  if(!Array.isArray(snapshot?.guide?.programmes)||!snapshot.guide.programmes.length)
   throw Error('Không lưu EPG rỗng');
  const stored=await encodeGuideSnapshot(snapshot);
  const db=await openGuideDatabase();
  try{await new Promise((resolve,reject)=>{
   let tx;
   try{
    tx=db.transaction('guides','readwrite');
    const onlyEPG=tx.objectStore('guides');
    // Clear old XMLTV rows and write the valid new guide atomically.
    // IDB abort rolls the deletion back when quota or writing fails.
    onlyEPG.clear();
    onlyEPG.put(stored,'current');
   }catch(e){try{tx?.abort();}catch{}reject(e);return;}
   tx.oncomplete=()=>resolve();
   tx.onabort=()=>reject(tx.error||Error('Không thể thay thế EPG'));
   tx.onerror=()=>reject(tx.error||Error('Lỗi bộ nhớ EPG'));
  });}finally{db.close();}
 }
 async function loadGuideFromDatabase(){
  const db=await openGuideDatabase();let saved;
  try{saved=await new Promise((resolve,reject)=>{
   let tx,req;
   try{tx=db.transaction('guides','readonly');req=tx.objectStore('guides').get('current');}
   catch(e){reject(e);return;}
   req.onsuccess=()=>resolve(req.result||null);
   req.onerror=()=>reject(req.error||Error('Không thể đọc EPG'));
   tx.onabort=()=>reject(tx.error||Error('Không thể đọc EPG'));
  });}finally{db.close();}
  return decodeGuideSnapshot(saved);
 }
 async function restoreGuideCache(){
  const generation=guideCacheGeneration;
  try{
   const cached=await loadGuideFromDatabase();
   // Do not overwrite a newer download or a manual change made during reading.
   if(!cached?.guide||!Array.isArray(cached.guide.programmes)||generation!==guideCacheGeneration||epgRequestedInSession)return;
   if(updatedAt&&Date.parse(cached.updatedAt||'')<Date.parse(updatedAt))return;
   guide={...cached.guide,manualMappings:config.manualMappings,offsetMinutes:config.offsetMinutes};
   updatedAt=cached.updatedAt||'';
   renderGuidePages();ctx.renderList();notifyWatchFlow();
  }catch{} // Private browsing may block IndexedDB; retain local fallback.
 }
 function cacheGuide(){
  guideCacheGeneration++;
  const snapshot={guide:{names:guide.names,aliasesById:guide.aliasesById,programmes:guide.programmes},updatedAt};
  // Never overwrite the last good cache with an invalid/empty XMLTV file.
  if(!Array.isArray(snapshot.guide.programmes)||!snapshot.guide.programmes.length)return Promise.resolve(false);
  guideCacheQueue=guideCacheQueue.catch(()=>{}).then(async()=>{
   try{
    await saveGuideInDatabase(snapshot);
    // Remove the old smaller cache ONLY once a durable write completes.
    try{localStorage.removeItem(legacyGuideKey);}catch{}
    return true;
   }catch{
    try{localStorage.setItem(legacyGuideKey,JSON.stringify(snapshot));return true;}
    catch{ctx.toast('Bộ nhớ EPG đã đầy; lịch vẫn xem được trong phiên này. EPG cũ được giữ để khôi phục.','warn');return false;}
   }
  });
  return guideCacheQueue;
 }
 function applyColor(color,persist=true,fromUser=true){if(!/^#[0-9a-fA-F]{6}$/.test(color))return;config.accent=color;
   if(fromUser)config.accentCustom=true;document.documentElement.dataset.customAccent=config.accentCustom?'true':'false';
   document.documentElement.style.setProperty('--accent',color);
   window.OpenIPTVUIStyle?.syncAccent?.(color,config.accentCustom);
   $('#themePicker').value=color;
   document.querySelectorAll('#accentSidebar .accent-choice').forEach(button=>{
    const selected=button.dataset.color.toLowerCase()===color.toLowerCase();
    button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
   });
   const preview=$('#accentPreviewSample'),hex=$('#accentCurrentHex');
   if(preview)preview.style.setProperty('--accent-preview',color);
   if(hex)hex.textContent=color.toUpperCase();
   const state=$('#accentChoiceState');if(state)state.textContent='Màu đã chọn: '+color.toUpperCase();
   document.documentElement.style.setProperty('--icon-filter',`drop-shadow(0 10px 18px ${color}55)`);
   if(persist)saveConfig();
 }
 function renderSources(){const root=$('#epgSources');root.replaceChildren();config.sources.forEach((s,i)=>{
   const row=document.createElement('div');row.className='epg-source-row';row.innerHTML=`<label><input type="checkbox" ${s.enabled?'checked':''}/> <span>${esc(s.name)}<small title="${esc(s.url)}">${esc(s.url)}</small></span></label>${!presetEPGURLs.has(s.url)?'<button class="del-epg" title="Xóa nguồn">✕</button>':''}`;
   row.querySelector('input').onchange=e=>{s.enabled=e.target.checked;saveConfig();};
   row.querySelector('.del-epg')?.addEventListener('click',()=>{config.sources.splice(i,1);saveConfig();renderSources();});
   root.append(row);
 });}
 function renderLiveProgress(item,clock){
  const root=$('#epgLiveProgress'),bar=$('#epgLiveTrack');
  if(!root||!bar)return;
  const valid=Number.isFinite(item?.start)&&Number.isFinite(item?.end)&&item.end>item.start&&clock>=item.start&&clock<item.end;
  const percent=valid?Math.max(0,Math.min(100,(clock-item.start)/(item.end-item.start)*100)):0;
  root.hidden=!valid;bar.value=percent;
  root.style.setProperty('--epg-progress',percent+'%');
 }
 function renderNow(){
  const target=$('#epgNowText');if(!target)return;
  const clock=Date.now(),c=ctx.getCurrent(), current=c?guideLib.current(guide,c,clock):{now:null,next:null};
  const {now,next}=current;
  renderLiveProgress(now,clock);
  target.textContent=!c?'Chọn kênh để xem chương trình hiện tại':now?`${today(now.start)}–${today(now.end)} · ${now.title}${next?'  |  Tiếp: '+next.title:''}`:'Chưa có EPG khớp với '+c.name;
  const update=(titleId,timeId,item,fallback)=>{
   const title=$(titleId),time=$(timeId);
   if(title){title.textContent=item?.title||fallback;title.title=item?.title||fallback;}
   if(time)time.textContent=item?`${today(item.start)} – ${today(item.end)}`:'—';
  };
  update('#ipvpNowTitle','#ipvpNowTime',now,c?'Chưa có EPG':'Chưa chọn kênh');
  update('#ipvpNextTitle','#ipvpNextTime',next,'Chưa có chương trình tiếp theo');
 }
 function renderEPG(){const root=$('#epgGuide');root.replaceChildren();const channels=ctx.getChannels(),clock=Date.now();const filter=$('#epgSearch')?.value?.toLowerCase().trim()||'';
  const matched=channels.filter(c=>guideLib.find(guide,c).length>0).filter(c=>!filter||(c.name+' '+c.tvgId).toLowerCase().includes(filter)).slice(0,250);
  $('#epgSummary').innerHTML=updatedAt?`Dữ liệu cập nhật: <b>${esc(new Date(updatedAt).toLocaleString('vi-VN'))}</b> • ${guide.programmes.length} chương trình • ${matched.length} kênh khớp`:'Chưa tải EPG. Vào Cài đặt và bấm “Cập nhật EPG ngay”.';
  if(!matched.length){root.innerHTML='<div class="empty-list">Không tìm thấy lịch khớp với kênh trong playlist. Thử nguồn EPG khác hoặc thêm tvg-id vào M3U.</div>';return;}
  const frag=document.createDocumentFragment();matched.forEach(c=>{const items=guideLib.find(guide,c).filter(x=>x.end>clock-24*3600000).slice(-8);
   const card=document.createElement('article');card.className='epg-row';const lines=items.map((p,i)=>`<div class="epg-program ${p.start<=clock&&p.end>clock?'on-air':''}"><time>${today(p.start)}–${today(p.end)}</time><div><b>${esc(p.title)}</b>${p.description?`<small>${esc(p.description)}</small>`:''}</div>${p.end>clock+60_000?`<button type="button" class="epg-record" data-index="${i}">⏺ Ghi</button>`:''}${p.end<clock&&c.catchupSource?`<button class="epg-catchup" data-index="${i}">↶ Xem lại</button>`:''}</div>`).join('')||'<div class="epg-program">Chưa có chương trình phù hợp</div>';
   card.innerHTML=`<header>▣ <b>${esc(c.name)}</b></header>${lines}`;card.querySelectorAll('.epg-catchup').forEach(button=>button.addEventListener('click',()=>window.IPTVProAdvanced?.playCatchup?.(c,items[Number(button.dataset.index)])));card.querySelectorAll('.epg-record').forEach(button=>button.addEventListener('click',()=>window.IPTVDVR?.scheduleFromEPG?.(c,items[Number(button.dataset.index)])));window.IPTVProAdvanced?.decorateRow?.(c,card);frag.append(card);
  });root.append(frag);
 }
 async function fetchXML(url){if(window.streamleaf?.fetchEPG)return (await window.streamleaf.fetchEPG(url)).xml;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{const resp=await fetch(url,{signal:controller.signal});if(!resp.ok)throw Error('HTTP '+resp.status);if(url.endsWith('.gz'))throw Error('XMLTV .gz cần bản desktop để giải nén; hãy chọn nguồn .xml trong bản web');const txt=await resp.text();if(txt.length>35*1024*1024)throw Error('EPG quá lớn');return txt;}finally{clearTimeout(timer);}
 }
 async function refreshEPG({startup=false}={}){if(loading)return;const active=config.sources.filter(s=>s.enabled);if(!active.length)return ctx.toast('Chưa bật nguồn EPG nào','warn');if(!ctx.getChannels().length){if(!startup)ctx.toast('Hãy nhập playlist M3U trước để ghép EPG với kênh','warn');return;}
  epgRequestedInSession=true;loading=true;$('#epgLoadBtn').disabled=true;$('#epgRefreshBtn').disabled=true;$('#epgLoadBtn').textContent='Đang tải XMLTV...';let sourcesLoaded=0,errors=[],combined={names:{},aliasesById:{},programmes:[]};const programmeKeys=new Set();
  try{for(const source of active){try{ctx.textStatus('Đang tải EPG: '+source.name);const xml=await fetchXML(source.url);const parsed=guideLib.parse(xml,ctx.getChannels());
    for(const [key,id] of Object.entries(parsed.names))if(!combined.names[key])combined.names[key]=id;
    Object.assign(combined.aliasesById,parsed.aliasesById||{});
    // Earlier EPG sources take priority for same id and time window.
    for(const p of parsed.programmes){const k=`${p.id}|${p.start}`;if(!programmeKeys.has(k)){combined.programmes.push(p);programmeKeys.add(k);}}
    sourcesLoaded++;
   }catch(e){errors.push(source.name+': '+e.message);}}
   if(sourcesLoaded&&combined.programmes.length){guide={names:combined.names,aliasesById:combined.aliasesById,programmes:combined.programmes,manualMappings:config.manualMappings,offsetMinutes:config.offsetMinutes};updatedAt=new Date().toISOString();await cacheGuide();ctx.toast(`Đã tải ${guide.programmes.length} lịch từ ${sourcesLoaded} nguồn`);}
   else ctx.toast('Không có chương trình khớp. Dữ liệu EPG cũ được giữ nguyên. '+errors.join(' | '),'warn');
   if(errors.length)ctx.toast('Một số nguồn EPG lỗi: '+errors.join(' | ').slice(0,350),'warn');
   renderNow();renderGuidePages();ctx.renderList();notifyWatchFlow();
  }finally{loading=false;$('#epgLoadBtn').disabled=false;$('#epgLoadBtn').textContent='↻ Tải EPG từ URL ngay';$('#epgRefreshBtn').disabled=false;ctx.textStatus('Đã hoàn tất kiểm tra EPG');}
 }
 async function importLocalEPG(){
  if(loading){ctx.toast('Đang tải EPG, hãy thử lại sau','warn');return;}
  if(!window.streamleaf?.importEPGFile){ctx.toast('Nhập file XMLTV cần chạy trong ứng dụng desktop','warn');return;}
  if(!ctx.getChannels().length){ctx.toast('Hãy nhập danh sách kênh M3U trước khi nhập EPG','warn');return;}
  loading=true;$('#epgImportFileBtn').disabled=true;$('#epgImportStatus').textContent='Đang chọn và kiểm tra file XMLTV…';
  try{
   const result=await window.streamleaf.importEPGFile();
   if(!result){$('#epgImportStatus').textContent='Đã hủy chọn file; dữ liệu EPG hiện tại được giữ nguyên.';return;}
   const parsed=guideLib.parse(result.xml,ctx.getChannels());
   if(!parsed.programmes?.length)throw Error('Không có chương trình hợp lệ trong khoảng 7 ngày trước/sau thời điểm hiện tại.');
   const msg=`Nhập ${parsed.programmes.length} chương trình từ file "${result.name}"?\nDữ liệu EPG hiện tại sẽ được thay thế. Danh sách kênh và lịch ghi hình đã đặt không thay đổi.`;
   if(!window.confirm(msg)){$('#epgImportStatus').textContent='Đã hủy nhập; giữ nguyên EPG hiện tại.';return;}
   guide={names:parsed.names,aliasesById:parsed.aliasesById,programmes:parsed.programmes,manualMappings:config.manualMappings,offsetMinutes:config.offsetMinutes};
   updatedAt=new Date().toISOString();const saved=await cacheGuide();renderGuidePages();ctx.renderList();notifyWatchFlow();
   $('#epgImportStatus').textContent=saved?`Đã nhập ${guide.programmes.length} chương trình từ ${result.name}.`:`Đã mở ${guide.programmes.length} chương trình từ ${result.name}, nhưng bộ nhớ đầy: dữ liệu chỉ giữ trong phiên hiện tại.`;
   ctx.toast(saved?'Nhập file EPG thành công':'Đã nhập EPG nhưng chưa lưu bền vững vì bộ nhớ đầy',saved?'ok':'warn');
  }catch(e){$('#epgImportStatus').textContent='Nhập EPG thất bại: '+String(e?.message||e).slice(0,170);ctx.toast('Không thể nhập EPG: '+String(e?.message||e),'warn');}
  finally{loading=false;$('#epgImportFileBtn').disabled=false;}
 }
 function renderGuidePages(){renderNow();renderEPG();$('#epgUpdatedLabel').textContent=updatedAt?'Cập nhật lần cuối: '+new Date(updatedAt).toLocaleString('vi-VN'):'Chưa tải EPG';}
 function decorateRow(c,row){const {now}=guideLib.current(guide,c);if(!now)return;const small=row.querySelector('.channel-text small');if(small){small.title=`EPG: ${now.title}`;const s=document.createElement('div');s.className='channel-epg';s.textContent='▤ '+now.title;small.after(s);}}
 async function pictureInPicture(){const video=ctx.player;
  try{if(document.pictureInPictureElement){await document.exitPictureInPicture();return;}
   if(video.readyState<2)throw Error('Chọn và phát một kênh trước khi mở PiP');
   if(document.pictureInPictureEnabled&&video.requestPictureInPicture){await video.requestPictureInPicture();return;}
   if(typeof video.webkitSetPresentationMode==='function'){video.webkitSetPresentationMode('picture-in-picture');return;}
   throw Error('Thiết bị hoặc video hiện tại không hỗ trợ Picture-in-Picture');
  }catch(e){ctx.toast('PiP: '+e.message,'warn');}
 }
 const officialRepo='trisanghy/open-iptv-pro';
 function setUpdateBusy(on){$('#updateCheckBtn').disabled=!!on;$('#updateDownloadBtn').disabled=!!on;}
 function drawUpdateState(state){
  if(!state)return;
  const phase=state.phase||'idle';
  $('#updateResult').textContent=state.message||'Chưa có thông tin cập nhật';
  $('#updateResult').dataset.phase=phase;
  $('#updateDownloadBtn').hidden=phase!=='available';
  $('#updateDownloadBtn').textContent=state.mode==='automatic'?'Tải và chuẩn bị cài đặt':'Tải bản cài đã xác minh';
  $('#updateInstallBtn').hidden=phase!=='downloaded';
  $('#updateManualBtn').hidden=phase!=='manual-ready';
  $('#updateProgressBox').hidden=!['downloading','downloaded','manual-ready','installing'].includes(phase);
  const progress=Number(state.progress)||0;
  $('#updateProgressBar').value=Math.max(0,Math.min(100,progress));
  $('#updateProgressLabel').textContent=phase==='downloading'?`Tiến độ tải: ${progress}%`:`${progress}%`;
  setUpdateBusy(phase==='checking'||phase==='downloading'||phase==='installing');
 }
 async function updateCheck({silent=false}={}){
  if(!window.streamleaf?.checkUpdate){
   $('#updateResult').textContent='Chức năng cài đặt tự động chỉ hoạt động trong bản desktop đã đóng gói.';
   return;
  }
  if(!silent)drawUpdateState({phase:'checking',message:'Đang kiểm tra GitHub Releases...'});
  try{
   const result=await window.streamleaf.checkUpdate();drawUpdateState(result);
   if(result.phase==='available'){
    if(silent)ctx.toast(`Có bản cập nhật Open IPTV Pro ${result.latest}. Mở Cài đặt → Cập nhật phiên bản.`, 'success');
    if(config.autoDownloadUpdates)await downloadNewVersion();
   }
   if(result.phase==='manual-ready')ctx.toast('Bản cập nhật đã tải xong. Mở bộ cài để hoàn tất.', 'success');
  }catch(e){drawUpdateState({phase:'error',message:'Không kiểm tra được: '+e.message});}
 }
 async function downloadNewVersion(){
  if(!window.streamleaf?.downloadUpdate)return;
  drawUpdateState({phase:'downloading',message:'Đang chuẩn bị tải...',progress:0});
  try{const state=await window.streamleaf.downloadUpdate();drawUpdateState(state);if(state.phase==='manual-ready')ctx.toast('Đã tải bản mới. Bấm Mở bộ cài đã tải để cập nhật.', 'success');if(state.phase==='downloaded')ctx.toast('Đã tải bản mới. Xác nhận cài đặt để hoàn tất.', 'success');}
  catch(e){drawUpdateState({phase:'error',message:'Không tải được phiên bản mới: '+e.message});}
 }
 async function installNewVersion(){
  if(!window.streamleaf?.installUpdate)return;
  if(!confirm('Ứng dụng sẽ thoát để cài bản cập nhật. Tiếp tục?'))return;
  try{drawUpdateState(await window.streamleaf.installUpdate());}
  catch(e){drawUpdateState({phase:'error',message:'Không thể cài đặt: '+e.message});}
 }
 async function openDownloadedInstaller(){
  try{const result=await window.streamleaf.openDownloadedUpdate();if(result)ctx.toast('Không mở được bộ cài: '+result,'warn');}
  catch(e){ctx.toast('Không mở được bộ cài: '+e.message,'warn');}
 }
 $('#epgSources')?.addEventListener('change',()=>{});
 $('#pipBtn').addEventListener('click',pictureInPicture);
 $('#openGuideBtn').addEventListener('click',()=>ctx.setPage('epg'));
 $('#ipvpNowProgram')?.addEventListener('click',()=>ctx.setPage('epg'));
 $('#ipvpNextProgram')?.addEventListener('click',()=>ctx.setPage('epg'));
 $('#epgSettingsBtn').addEventListener('click',()=>ctx.setPage('settings'));
 $('#epgRefreshBtn').addEventListener('click',()=>refreshEPG());
 $('#epgSearch').addEventListener('input',renderEPG);
 $('#epgLoadBtn').addEventListener('click',()=>refreshEPG());
 $('#epgImportFileBtn').addEventListener('click',importLocalEPG);
 $('#epgAutoRefreshStart').checked=config.autoRefreshEPGOnStartup;
 $('#epgAutoRefreshStart').addEventListener('change',e=>{config.autoRefreshEPGOnStartup=!!e.target.checked;saveConfig();$('#epgAutoHint').textContent=config.autoRefreshEPGOnStartup?'Đã bật. EPG sẽ được cập nhật từ URL khi mở ứng dụng lần sau.':'Đã tắt. Có thể tải EPG thủ công bất cứ lúc nào.';});
 $('#epgAddSourceBtn').addEventListener('click',()=>{
  const val=$('#customEPG').value.trim();try{const u=new URL(val);if(u.protocol!=='https:')throw Error('URL phải dùng HTTPS');if(config.sources.some(s=>s.url===val))throw Error('Nguồn đã tồn tại');config.sources.push({name:'EPG tùy chỉnh '+(config.sources.length-defaultSources.length+1),url:val,enabled:true});saveConfig();renderSources();$('#customEPG').value='';ctx.toast('Đã thêm nguồn EPG');}catch(e){ctx.toast('Nguồn EPG không hợp lệ: '+e.message,'warn');}
 });
 document.querySelectorAll('input[name="appearanceMode"]').forEach(radio=>radio.addEventListener('change',e=>{if(!e.target.checked)return;config.appearanceMode=e.target.value;updateAppearance();}));
 if(systemColorScheme){const handler=()=>{if(config.appearanceMode==='auto')updateAppearance(false)};if(systemColorScheme.addEventListener)systemColorScheme.addEventListener('change',handler);else systemColorScheme.addListener?.(handler);}
 updateAppearance(false);
 $('#themePicker').addEventListener('input',e=>applyColor(e.target.value));
 document.querySelectorAll('#accentSidebar .accent-choice').forEach(button=>{
  button.addEventListener('click',()=>applyColor(button.dataset.color));
 });
 document.querySelectorAll('input[name="uiNavLayout"]').forEach(input=>input.addEventListener('change',e=>{
  if(!e.target.checked||!['sidebar','compact'].includes(e.target.value))return;
  config.uiNavLayout=e.target.value;
  document.documentElement.dataset.navLayout=config.uiNavLayout;
  saveConfig();
 }));
 $('#resetThemeBtn').onclick=()=>applyColor('#bc7cff');
 config.repo=officialRepo;
 if(typeof config.autoCheckUpdates!=='boolean')config.autoCheckUpdates=true;
 if(typeof config.autoDownloadUpdates!=='boolean')config.autoDownloadUpdates=true;
 $('#autoCheckUpdates').checked=config.autoCheckUpdates;
 $('#autoDownloadUpdates').checked=config.autoDownloadUpdates;
 $('#autoCheckUpdates').addEventListener('change',e=>{config.autoCheckUpdates=!!e.target.checked;saveConfig();});
 $('#autoDownloadUpdates').addEventListener('change',e=>{config.autoDownloadUpdates=!!e.target.checked;saveConfig();});
 $('#updateCheckBtn').addEventListener('click',()=>updateCheck());
 $('#updateDownloadBtn').addEventListener('click',downloadNewVersion);
 $('#updateInstallBtn').addEventListener('click',installNewVersion);
 $('#updateManualBtn').addEventListener('click',openDownloadedInstaller);
 $('#updateReleaseBtn').addEventListener('click',()=>window.streamleaf?.openReleases?.() || window.open('https://github.com/trisanghy/open-iptv-pro/releases','_blank'));
 window.streamleaf?.onUpdateStatus?.(drawUpdateState);
 window.streamleaf?.updateStatus?.().then(drawUpdateState).catch(()=>{});
 if(config.autoCheckUpdates&&window.streamleaf?.checkUpdate)setTimeout(()=>updateCheck({silent:true}),3500);
 saveConfig();applyColor(config.accent,false,false);renderSources();renderGuidePages();void restoreGuideCache();
 // Once per launch, after playlist restoration. Avoid duplicate refresh if a manual request has already started.
 if(config.autoRefreshEPGOnStartup){
  // Earlier code tried once at 2.2s and never retried if the playlist had not loaded.
  let attempted=false;
  const autoLoadWhenReady=()=>{
   if(attempted||epgRequestedInSession||loading||!config.autoRefreshEPGOnStartup)return;
   if(!ctx.getChannels().length)return;
   attempted=true;
   void refreshEPG({startup:true}).catch(e=>ctx.toast('Tự tải EPG gặp lỗi: '+String(e?.message||e),'warn'));
  };
  window.setTimeout(autoLoadWhenReady,2200);
  const awaitingPlaylist=window.setInterval(()=>{
   if(attempted||epgRequestedInSession||!config.autoRefreshEPGOnStartup){
    window.clearInterval(awaitingPlaylist);return;
   }
   autoLoadWhenReady();
  },3500);
 }
 window.IPTVExtras={render:renderNow,onChannel:renderNow,onPage:p=>{if(p==='settings')renderSources();if(p==='epg')renderGuidePages();},decorateRow,getGuide:()=>guide,setMapping:(id,epgId)=>{if(epgId)config.manualMappings[id]=epgId;else delete config.manualMappings[id];guide.manualMappings=config.manualMappings;saveConfig();void cacheGuide();renderGuidePages();ctx.renderList();notifyWatchFlow();},setOffset:minutes=>{config.offsetMinutes=Math.max(-720,Math.min(720,Number(minutes)||0));guide.offsetMinutes=config.offsetMinutes;saveConfig();void cacheGuide();renderGuidePages();ctx.renderList();notifyWatchFlow();},getOffset:()=>config.offsetMinutes};
 window.setInterval(()=>{if($('#page-tv')?.classList.contains('active-page'))renderNow();},15000);
 window.setInterval(()=>{renderNow();if(document.querySelector('#page-epg').classList.contains('active-page'))renderEPG();},60000);
})();
