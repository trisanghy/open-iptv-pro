'use strict';
/* Optional premium-style features implemented locally; no subscription, telemetry or external account. */
(()=>{
 const ctx=window.IPTVState,lib=window.OpenIPTVAdvancedCore;
 const $=q=>document.querySelector(q), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key='open-iptv-pro-advanced-v1';
 const defaults={alternates:{},health:{},reminders:[],optimizer:'balanced',autoTimeshift:false,profiles:[{id:'admin',name:'Người lớn',child:false,favorites:[]}],profileId:'admin',restrictedGroups:[],pin:null};
 let state;try{state={...defaults,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{state={...defaults}};
 if(!Array.isArray(state.profiles)||!state.profiles.length)state.profiles=defaults.profiles;
 if(!state.alternates||typeof state.alternates!=='object')state.alternates={};
 if(!state.health||typeof state.health!=='object')state.health={};
 if(!Array.isArray(state.reminders))state.reminders=[];
 state.autoTimeshift=state.autoTimeshift===true;
 ctx.getStore().alternates=state.alternates;
 const save=()=>{ctx.getStore().alternates=state.alternates;try{localStorage.setItem(key,JSON.stringify(state))}catch{ctx.toast('Đầy bộ nhớ cấu hình nâng cao','warn')}};
 let pendingHealthSave=null;function scheduleHealthSave(){if(pendingHealthSave)return;pendingHealthSave=setTimeout(()=>{pendingHealthSave=null;save();},1500);}
 window.addEventListener('beforeunload',()=>{if(pendingHealthSave){clearTimeout(pendingHealthSave);save();}});
 const channels=()=>ctx.getChannels();
 const profile=()=>state.profiles.find(p=>p.id===state.profileId)||state.profiles[0];
 function snapshot(channel){const raw=ctx.getStore().snapshots[channel?.url];if(!raw)return '';if(raw.data)return raw.data;if(raw.file&&window.__snapshotBase)return window.__snapshotBase+encodeURIComponent(raw.file);return channel?.logo||'';}
 function setStatus(s){if($('#bufferInfo'))$('#bufferInfo').textContent=s;}
 // ====== Multiview: four independent players, only hovered tile is audible. ======
 const multi=[null,null,null,null];let audioTile=-1;
 function quietTiles(active=-1){audioTile=active;for(let i=0;i<4;i++){const v=multi[i]?.video;if(v){v.muted=i!==active;if(i===active)v.volume=Math.max(.05,ctx.player.volume||.8);}const card=multi[i]?.root;if(card)card.classList.toggle('audible',i===active);}}
 function stopTile(i){const old=multi[i];if(!old)return;try{old.video.pause();old.hls?.destroy();old.video.removeAttribute('src');old.video.load();}catch{}multi[i]=null;}
 function stopMulti(){for(let i=0;i<4;i++)stopTile(i);quietTiles();}
 async function startTile(i,ch){stopTile(i);const card=$(`#multiTile${i}`),video=card.querySelector('video'),status=card.querySelector('.multi-status');
  multi[i]={root:card,video,hls:null,channel:ch};video.muted=true;video.playsInline=true;video.preload='auto';status.textContent='Đang kết nối…';
  const original=ch.url;try{const url=window.streamleaf?.proxy?await window.streamleaf.proxy(original):original;if(multi[i]?.channel!==ch)return;
   const hls=/\.m3u8?(?:$|\?)/i.test(original);
   if(hls&&!video.canPlayType('application/vnd.apple.mpegurl')){const H=await ctx.loadHlsLib();if(!H.isSupported())throw Error('Không hỗ trợ HLS');const instance=new H({enableWorker:true,maxBufferLength:8,backBufferLength:4});multi[i].hls=instance;instance.loadSource(url);instance.attachMedia(video);instance.on(H.Events.ERROR,(_,e)=>{if(e.fatal)status.textContent='Luồng lỗi: '+e.details;});}
   else video.src=url;
   video.addEventListener('playing',()=>status.textContent=ch.name+' · Đang phát',{once:true});video.addEventListener('error',()=>status.textContent='Không phát được');
   await video.play().catch(()=>{status.textContent='Nhấn ▶ để phát';});
  }catch(e){status.textContent='Lỗi: '+e.message;}
 }
 function renderMulti(){const root=$('#multiGrid');if(!root)return;const all=channels();const selected=multi.map(x=>x?.channel?.id||'');root.replaceChildren();
  for(let i=0;i<4;i++){
   const tile=document.createElement('article');tile.className='multi-tile';tile.id='multiTile'+i;
   tile.innerHTML=`<div class="multi-head"><strong>Ô ${i+1}</strong><select aria-label="Chọn kênh ô ${i+1}"><option value="">Chọn kênh…</option>${all.map(c=>`<option value="${esc(c.id)}" ${selected[i]===c.id?'selected':''}>${esc(c.name)} (${esc(c.group)})</option>`).join('')}</select></div><video muted playsinline preload="none"></video><div class="multi-bottom"><span class="multi-status">Chưa chọn kênh</span><button class="multi-play" aria-label="Phát ô ${i+1}">▶</button><button class="multi-clear" aria-label="Dừng ô ${i+1}">■</button></div>`;
   root.append(tile);const picker=tile.querySelector('select'),video=tile.querySelector('video');
   picker.onchange=async()=>{const ch=all.find(x=>x.id===picker.value);if(!ch){stopTile(i);tile.querySelector('.multi-status').textContent='Chưa chọn';return;}if(!(await allowChannel(ch))){picker.value='';return;}startTile(i,ch);};
   tile.querySelector('.multi-play').onclick=()=>{if(multi[i]?.video)multi[i].video.play().catch(()=>{});};
   tile.querySelector('.multi-clear').onclick=()=>{stopTile(i);picker.value='';tile.querySelector('.multi-status').textContent='Đã dừng';};
   tile.addEventListener('mouseenter',()=>quietTiles(i));tile.addEventListener('mouseleave',()=>quietTiles());
   video.addEventListener('volumechange',()=>{if(multi[i]?.video===video&&audioTile!==i)video.muted=true;});
  }
  // Recreate players only when no active streams (e.g. initial page open).
  if(!all.length)$('#multiGrid').insertAdjacentHTML('beforeend','<p class="hint">Nhập playlist trước rồi chọn kênh cho từng ô.</p>');
 }
 $('#multiStop').onclick=()=>{stopMulti();renderMulti();};
 // ====== Hover preview: snapshot first, otherwise one muted video. ======
 let previewTimer=null,previewHls=null,previewVideo=null,previewId='',previousMainMuted=false;const preview=$('#channelPreview');
 function hidePreview(){clearTimeout(previewTimer);previewTimer=null;previewId='';if(previewVideo){previewVideo.pause();previewVideo.removeAttribute('src');previewVideo.load();}previewHls?.destroy();previewVideo=null;previewHls=null;preview.classList.add('hidden');preview.replaceChildren();}
 async function openPreview(ch,anchor){if(previewId!==ch.id)return;
  const r=anchor.getBoundingClientRect();preview.style.left=Math.min(r.right+12,window.innerWidth-300)+'px';preview.style.top=Math.min(Math.max(75,r.top),window.innerHeight-235)+'px';
  preview.replaceChildren();const picture=snapshot(ch),title=document.createElement('b');title.textContent='Xem trước (không tiếng) · '+ch.name;preview.append(title);
  const video=document.createElement('video');if(picture)video.poster=picture;video.muted=true;video.defaultMuted=true;video.volume=0;video.autoplay=true;video.playsInline=true;video.preload='metadata';preview.append(video);previewVideo=video;preview.classList.remove('hidden');
  try{const url=window.streamleaf?.proxy?await window.streamleaf.proxy(ch.url):ch.url;if(previewId!==ch.id)return;
   if(/\.m3u8?(?:$|\?)/i.test(ch.url)&&!video.canPlayType('application/vnd.apple.mpegurl')){const H=await ctx.loadHlsLib();if(previewId!==ch.id)return;previewHls=new H({enableWorker:true,maxBufferLength:3,backBufferLength:0});previewHls.loadSource(url);previewHls.attachMedia(video);}else video.src=url;
   video.play().catch(()=>{});
  }catch{title.textContent='Không xem trước được: '+ch.name;}
 }
 function decorateRow(c,row){if(!c||!row||row.dataset.previewAttached==='1')return;row.dataset.previewAttached='1';row.addEventListener('mouseenter',()=>{clearTimeout(previewTimer);hidePreview();previewId=c.id;previewTimer=setTimeout(()=>openPreview(c,row),550);});row.addEventListener('mouseleave',hidePreview);}
 // ====== Auto Failover settings & Health ======
 function hlsOptions(){const len=({fast:8,balanced:20,stable:45})[state.optimizer]||20;return {maxBufferLength:len,maxMaxBufferLength:len*2,backBufferLength:8,manifestLoadingMaxRetry:2,levelLoadingMaxRetry:3,fragLoadingMaxRetry:3};}
 function record(ch,obj){if(!ch)return;const list=state.health[ch.url]||(state.health[ch.url]=[]);list.push({date:new Date().toISOString(),...obj});if(list.length>12)list.splice(0,list.length-12);scheduleHealthSave();}
 let loadStart=0,stallCount=0;
 function onLoadStart(ch,url,at){loadStart=at;stallCount=0;}
 function onPlaying(ch,url){if(!ch)return;record(ch,{status:'alive',type:'playback',startupMs:loadStart?Date.now()-loadStart:null,width:ctx.player.videoWidth||0,height:ctx.player.videoHeight||0,stalls:stallCount,url});maybeAutoBuffer(ch);}
 function onQuality(ch,quality){if(ch)record(ch,{status:'alive',type:'quality',bitrate:quality.bitrate,width:quality.width,height:quality.height});}
 let lastHealthRender=0;function onCheck(ch,res){record(ch,{status:res.status||'uncertain',type:'probe',reason:res.reason||'',latencyMs:res.latencyMs??null});if($('#page-health').classList.contains('active-page')&&Date.now()-lastHealthRender>1800){lastHealthRender=Date.now();renderHealth();}}
 function onStreamError(ch,reason){record(ch,{status:'uncertain',type:'error',reason});}
 ctx.player.addEventListener('waiting',()=>{stallCount++;});
 let lastHealthSample=0;setInterval(()=>{const ch=ctx.getCurrent(),v=ctx.player;if(!ch||v.paused||!v.videoWidth||Date.now()-lastHealthSample<14000)return;lastHealthSample=Date.now();const q=v.getVideoPlaybackQuality?.();record(ch,{type:'live',status:'alive',width:v.videoWidth,height:v.videoHeight,stalls:stallCount,droppedFrames:q?.droppedVideoFrames??null});},15000);
 function renderHealth(){const select=$('#backupChannel');const currentChoice=select.value||ctx.getCurrent()?.id||'';select.replaceChildren();
  for(const c of channels()){const opt=document.createElement('option');opt.value=c.id;opt.textContent=c.name+' · '+c.group;select.append(opt);}if(channels().some(c=>c.id===currentChoice))select.value=currentChoice;
  const current=channels().find(c=>c.id===select.value);$('#backupURLs').value=(state.alternates[current?.id]||[]).join('\n');$('#bufferPreset').value=state.optimizer;
  const all=channels(),live=all.filter(c=>c.status==='alive').length,dead=all.filter(c=>c.status==='dead').length;
  $('#healthOverview').textContent=`Đã kiểm tra: ${live} sống · ${dead} Die · ${all.length-live-dead} chưa xác minh`;
  const root=$('#healthTable');root.replaceChildren();const table=document.createElement('table');table.innerHTML='<thead><tr><th>Kênh</th><th>Trạng thái</th><th>Kiểm tra gần nhất</th><th>Khởi phát</th><th>Độ phân giải</th><th>Bitrate HLS</th></tr></thead>';
  const body=document.createElement('tbody');for(const c of all.slice(0,300)){const list=state.health[c.url]||[],v=list.findLast(x=>x.type==='playback'),q=list.findLast(x=>x.type==='quality'),last=list.at(-1),tr=document.createElement('tr');
   for(const val of [c.name,c.status==='alive'?'Sống':c.status==='dead'?'Die':'Chưa rõ',last?.date?new Date(last.date).toLocaleString('vi-VN'):'—',v?.startupMs!=null?v.startupMs+' ms':'—',v?.width?v.width+'×'+v.height:'—',q?.bitrate?Math.round(q.bitrate/1000)+' kbps':'—']){const td=document.createElement('td');td.textContent=val;tr.append(td);}decorateRow(c,tr);body.append(tr);}
  table.append(body);root.append(table);
 }
 $('#backupChannel').onchange=()=>{$('#backupURLs').value=(state.alternates[$('#backupChannel').value]||[]).join('\n');};
 $('#backupSave').onclick=()=>{const ch=channels().find(c=>c.id===$('#backupChannel').value);if(!ch)return ctx.toast('Chưa chọn kênh','warn');const raw=$('#backupURLs').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(raw.length>9||raw.some(u=>!lib.validURL(u)))return ctx.toast('Tối đa 9 URL hợp lệ dùng HTTP(S)','warn');state.alternates[ch.id]=[...new Set(raw.filter(u=>u!==ch.url))];save();ctx.toast('Đã lưu '+state.alternates[ch.id].length+' link dự phòng');};
 $('#bufferPreset').onchange=e=>{state.optimizer=e.target.value;save();ctx.toast('Đã lưu chế độ bộ đệm');};
 $('#healthRefresh').onclick=renderHealth;
 // ====== Local timeshift / remote DVR ======
 let buffering=false,bufferId='',bufferStarting=false,bufferRequest=0;
 let activeChannelId='',autoAttemptedId='',autoSuppressedId='';
 const autoSetting=$('#autoTimeshiftSetting'),autoLabel=$('#autoTimeshiftState');
 function describeAutoSetting(){autoSetting.checked=!!state.autoTimeshift;autoLabel.textContent=state.autoTimeshift?(window.streamleaf?.startTimeshift?'Đã bật: tự dùng bộ đệm khi mở kênh LIVE.':'Đã lưu: sẽ tự bật khi chạy bản desktop có FFmpeg.'):'Mặc định: tắt (bật thủ công trong Xem TV).';}
 autoSetting.addEventListener('change',()=>{state.autoTimeshift=autoSetting.checked;save();describeAutoSetting();ctx.toast(state.autoTimeshift?'Đã bật Timeshift mặc định cho các kênh LIVE tiếp theo':'Đã tắt Timeshift mặc định');});
 describeAutoSetting();
 function maybeAutoBuffer(ch){
  if(!state.autoTimeshift||!window.streamleaf?.startTimeshift||!ch||ctx.getPlayMode?.()!=='live'||buffering||bufferStarting)return;
  if(autoAttemptedId===ch.id||autoSuppressedId===ch.id)return;
  autoAttemptedId=ch.id;
  // Start only after real playback begins; do not auto-start for catch-up, PiP or MultiView.
  void toggleBuffer(false);
 }
 async function safeStopOwned(id){try{if(!id)return;const status=await window.streamleaf?.timeshiftStatus?.();if(status?.id===id)await window.streamleaf.stopTimeshift();}catch{}}
 async function toggleBuffer(manual=true){
  const ch=ctx.getCurrent();
  if(buffering){bufferRequest++;buffering=false;const oldId=bufferId;bufferId='';if(manual)autoSuppressedId=ch?.id||'';await safeStopOwned(oldId);setStatus('Đã tắt bộ đệm; trở về LIVE');$('#bufferToggle').textContent='Bật bộ đệm';if(ch)void ctx.playChannel(ch.id);return;}
  if(bufferStarting)return;
  if(!ch)return ctx.toast('Chọn kênh trước khi bật Timeshift','warn');
  if(ctx.getPlayMode?.()!=='live')return ctx.toast('Timeshift chỉ dùng với kênh đang phát LIVE','warn');
  if(!window.streamleaf?.startTimeshift)return ctx.toast('Bộ đệm cục bộ chỉ hỗ trợ ứng dụng desktop có FFmpeg','warn');
  if(manual){autoSuppressedId='';autoAttemptedId=ch.id;}
  const ticket=++bufferRequest;bufferStarting=true;let createdId='';
  setStatus('Đang tạo bộ đệm 5 phút; cần đợi segment đầu tiên…');$('#bufferToggle').disabled=true;
  try{
   const out=await window.streamleaf.startTimeshift(ch.url);createdId=out.id;bufferId=out.id;
   const stale=()=>ticket!==bufferRequest||ctx.getCurrent()?.id!==ch.id||ctx.getPlayMode?.()!=='live';
   if(stale())return;
   let ready=false;
   for(let tries=0;tries<25;tries++){
    if(stale())return;
    try{const r=await fetch(out.url,{cache:'no-store'});if(r.ok&&/#EXTINF:/.test(await r.text())){ready=true;break;}}catch(e){if(stale())return;}
    await new Promise(ok=>setTimeout(ok,750));
   }
   if(stale())return;
   if(!ready)throw Error('Nguồn không tạo được segment, vẫn tiếp tục phát LIVE');
   buffering=true;$('#bufferToggle').textContent='Tắt bộ đệm';
   await ctx.playChannel(ch.id,out.url,{buffer:true,mode:'timeshift'});
   setStatus('Đệm tối đa ~5 phút kể từ khi bật; có thể tua −30 giây.');
  }catch(e){if(ticket===bufferRequest){buffering=false;ctx.toast('Timeshift: '+e.message,'warn');setStatus('Chưa thể bật bộ đệm, kênh vẫn phát LIVE');}}
  finally{
   if(!buffering)await safeStopOwned(createdId);
   if(ticket===bufferRequest){bufferStarting=false;$('#bufferToggle').disabled=false;}
   else{bufferStarting=false;$('#bufferToggle').disabled=false;const next=ctx.getCurrent();if(next&&ctx.getPlayMode?.()==='live')maybeAutoBuffer(next);}
  }
 }
 $('#bufferToggle').onclick=()=>toggleBuffer(true);
 $('#bufferRewind').onclick=()=>{const v=ctx.player,r=lib.seekRange(v,300);if(!r||r.available<2)return ctx.toast('Chưa có đủ dữ liệu DVR/Timeshift để tua','warn');v.currentTime=Math.max(r.start,v.currentTime-30);setStatus('Đang xem lại trong khoảng '+Math.round(r.available)+' giây đã có');};
 $('#bufferRewind5').onclick=()=>{const v=ctx.player,r=lib.seekRange(v,300);if(!r||r.available<2)return ctx.toast('Chưa có dữ liệu tua ngược','warn');v.currentTime=r.start;setStatus('Đã tua về mốc cũ nhất có sẵn (~'+Math.round(r.available)+' giây)');};
 $('#bufferLive').onclick=()=>{const ch=ctx.getCurrent();if(!ch)return;bufferRequest++;buffering=false;bufferStarting=false;autoSuppressedId=ch.id;const id=bufferId;bufferId='';void safeStopOwned(id);$('#bufferToggle').textContent='Bật bộ đệm';$('#bufferToggle').disabled=false;setStatus('Đang xem LIVE');void ctx.playChannel(ch.id);};
 function onStop(){bufferRequest++;buffering=false;bufferStarting=false;bufferId='';activeChannelId='';autoAttemptedId='';autoSuppressedId='';$('#bufferToggle').textContent='Bật bộ đệm';$('#bufferToggle').disabled=false;window.streamleaf?.stopTimeshift?.().catch(()=>{});}
 // ====== EPG search, reminders, catch-up and mapping ======
 const epg=()=>window.IPTVExtras?.getGuide?.()||{names:{},programmes:[]};
 function renderEpgSearch(){const root=$('#epgSearchResults'),q=$('#epgGlobalSearch').value.trim();root.replaceChildren();if(!q){root.textContent='Nhập tên chương trình để tìm trên lịch đã tải';return;}
  const timeOffset=Number(window.IPTVExtras?.getOffset?.()||0)*60000;const matches=lib.epgSearch(epg(),q).map(p=>({...p,start:p.start+timeOffset,end:p.end+timeOffset}));if(!matches.length){root.textContent='Chưa tìm thấy chương trình trong dữ liệu EPG đã tải';return;}
  const ids=new Map();for(const c of channels()){const entries=window.IPTVGuide.find(epg(),c);if(entries.length)ids.set(entries[0].id,c);}
  const table=document.createElement('div');table.className='epg-results-list';for(const p of matches.slice(0,80)){
   const c=ids.get(p.id),row=document.createElement('div');row.className='epg-result';
   row.innerHTML=`<div><b>${esc(p.title)}</b><small>${esc(c?.name||p.id)} · ${new Date(p.start).toLocaleString('vi-VN')} – ${new Date(p.end).toLocaleTimeString('vi-VN')}</small></div>`;
   const btn=document.createElement('button');btn.className='btn btn-subtle';
   if(p.start>Date.now()){btn.textContent='🔔 Nhắc trước 10 phút';btn.onclick=()=>remind(p,c);}
   else if(p.end<Date.now()&&c?.catchupSource){btn.textContent='↶ Xem lại';btn.onclick=()=>playCatchup(c,p);}
   else{btn.textContent='Không hỗ trợ xem lại';btn.disabled=true;}
   row.append(btn);if(c)decorateRow(c,row);table.append(row);
  }root.append(table);
 }
 function remind(p,c){if(state.reminders.some(x=>x.id===`${p.id}|${p.start}`))return ctx.toast('Đã có nhắc lịch này');state.reminders.push({id:`${p.id}|${p.start}`,title:p.title,channel:c?.name||p.id,start:p.start,done:false});save();ctx.toast('Đã lưu lịch nhắc: '+p.title);if('Notification' in window&&Notification.permission==='default')Notification.requestPermission().catch(()=>{});}
 async function playCatchup(c,p){const url=lib.catchup(c,p);if(!url)return ctx.toast('Nguồn không có mẫu catchup-source hợp lệ','warn');ctx.setPage('tv');ctx.playChannel(c.id,url,{mode:'catchup'});}
 async function checkReminders(){const now=Date.now();let edited=false;for(const r of state.reminders){if(r.done)continue;if(r.start-10*60000<=now&&r.start>=now-60000){r.done=true;edited=true;try{if(window.streamleaf?.notifyReminder)await window.streamleaf.notifyReminder('Open IPTV Pro · Sắp chiếu',r.channel+' · '+r.title);else if('Notification' in window&&Notification.permission==='granted')new Notification('Open IPTV Pro · Sắp chiếu',{body:r.channel+' · '+r.title});else ctx.toast('Sắp chiếu: '+r.channel+' · '+r.title,'warn');}catch{ctx.toast('Sắp chiếu: '+r.title,'warn');}}if(r.start<now-86400000){r.done=true;edited=true;}}if(edited)save();}
 $('#epgSearchGo').onclick=renderEpgSearch;$('#epgGlobalSearch').onkeydown=e=>{if(e.key==='Enter')renderEpgSearch();};
 $('#epgOffset').value=window.IPTVExtras?.getOffset?.()||0;
 $('#epgOffset').onchange=e=>{window.IPTVExtras?.setOffset?.(e.target.value);ctx.toast('Đã lưu độ lệch EPG');renderEpgSearch();};
 $('#epgManualMap').onclick=()=>{const g=epg(),all=channels();const ids=[...new Set((g.programmes||[]).map(p=>p.id))].sort();if(!ids.length)return ctx.toast('Tải nguồn EPG trước','warn');
  const current=ctx.getCurrent()||all[0];if(!current)return ctx.toast('Chưa có kênh','warn');
  ctx.openModal('Ghép EPG thủ công',`<p class="hint">Gắn mã XMLTV vào một kênh (ưu tiên cao hơn ghép tự động).</p><label class="modal-label">Kênh IPTV</label><select id="matchChannel" class="modal-input">${all.map(c=>`<option value="${esc(c.id)}" ${c.id===current.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><label class="modal-label">ID chương trình trong XMLTV</label><select id="matchId" class="modal-input"><option value="">Tự động nhận diện</option>${ids.map(id=>`<option value="${esc(id)}">${esc(id)}</option>`).join('')}</select>`,()=>{window.IPTVExtras?.setMapping($('#matchChannel').value,$('#matchId').value);ctx.toast('Đã lưu ghép EPG thủ công');},'Lưu ghép EPG');
 };
 // ====== Profiles: local PIN with PBKDF2 when WebCrypto is available. ======
 async function hashPIN(pin,salt){if(!crypto?.subtle)throw Error('Máy không hỗ trợ WebCrypto');const data=new TextEncoder().encode(pin),input=await crypto.subtle.importKey('raw',data,'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},input,256);return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 async function verifyPIN(){if(!state.pin)return false;const pin=prompt('Nhập PIN quản trị để mở khóa');if(pin===null)return false;return (await hashPIN(pin,state.pin.salt))===state.pin.hash;}
 async function allowChannel(ch){const prof=profile();if(!prof.child)return true;if(!(state.restrictedGroups||[]).includes(ch.group))return true;try{if(await verifyPIN())return true;}catch{}ctx.toast('Kênh thuộc nhóm bị khóa trong hồ sơ trẻ em','warn');return false;}
 function applyProfileUI(){const child=profile().child;const selectors=['.nav[data-page="sources"]','.nav[data-page="folders"]','.nav[data-page="settings"]','.nav[data-page="health"]','.nav[data-page="doctor"]','#exportNav','#fileBtn','#urlBtn','#newFolderFromList','#refreshAllBtn','#folderCreateBtn','#quickExport','#emptyFileBtn','#emptyUrlBtn','#sourcesFileBtn','#sourcesUrlBtn'];for(const selector of selectors){const el=$(selector);if(el){el.disabled=child;el.title=child?'Hãy nhập PIN và chuyển sang hồ sơ người lớn':'';}}for(const selector of ['#profileCreate','#pinSave','#profileName','#profileChild','#profilePin']){const el=$(selector);if(el)el.disabled=child;}$('#profileGroupLocks').querySelectorAll('input').forEach(x=>x.disabled=child);document.body.classList.toggle('child-profile',child);}
 function renderProfiles(){const sel=$('#profileChoice');sel.replaceChildren();for(const pr of state.profiles){const o=document.createElement('option');o.value=pr.id;o.textContent=pr.name+(pr.child?' · Trẻ em':' · Người lớn');sel.append(o);}sel.value=profile().id;
  $('#profileStatus').textContent='Đang dùng: '+profile().name+' · Các nhóm bị khóa: '+state.restrictedGroups.length;
  const root=$('#profileGroupLocks');root.replaceChildren();const legend=document.createElement('p');legend.textContent='Nhóm không cho trẻ xem:';root.append(legend);for(const g of [...new Set(channels().map(c=>c.group))].slice(0,120)){
   const label=document.createElement('label');label.className='lock-row';const input=document.createElement('input');input.type='checkbox';input.disabled=profile().child;input.checked=state.restrictedGroups.includes(g);input.onchange=()=>{if(input.checked)state.restrictedGroups.push(g);else state.restrictedGroups=state.restrictedGroups.filter(x=>x!==g);save();};label.append(input,document.createTextNode(' '+g));root.append(label);
  }applyProfileUI();
 }
 $('#profileCreate').onclick=()=>{const name=$('#profileName').value.trim();if(!name||name.length>40)return ctx.toast('Tên hồ sơ phải từ 1–40 ký tự','warn');const id='p'+Date.now();state.profiles.push({id,name,child:$('#profileChild').checked,favorites:[]});save();renderProfiles();$('#profileName').value='';ctx.toast('Đã tạo hồ sơ '+name);};
 $('#profileSwitch').onclick=async()=>{const target=state.profiles.find(x=>x.id===$('#profileChoice').value);if(!target)return;if(target.child&&!state.pin){ctx.toast('Đặt PIN quản trị trước khi chuyển sang hồ sơ trẻ em','warn');renderProfiles();return;}if(profile().child&&!target.child&&!(await verifyPIN())){ctx.toast('Không thể vào hồ sơ người lớn khi chưa xác minh PIN','warn');renderProfiles();return;}
  profile().favorites=[...ctx.getStore().favorites];profile().favoriteKeys=[...(ctx.getStore().favoriteKeys||[])];
  state.profileId=target.id;ctx.getStore().favorites=[...(target.favorites||[])];
  if(Array.isArray(target.favoriteKeys))ctx.getStore().favoriteKeys=[...target.favoriteKeys];
  else delete ctx.getStore().favoriteKeys; // migrate the previous URL-only format for this profile
  window.OpenIPTVFavorites?.migrate(ctx.getStore());window.OpenIPTVFavorites?.sync(ctx.getStore());
  save();ctx.save();ctx.stopPlayer();ctx.render();renderProfiles();applyProfileUI();ctx.toast('Đã chuyển hồ sơ: '+target.name);
 };
 $('#pinSave').onclick=async()=>{const pin=$('#profilePin').value.trim();if(!/^\d{4,8}$/.test(pin))return ctx.toast('PIN phải gồm 4–8 chữ số','warn');try{if(state.pin && !(await verifyPIN()))return;const salt=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(x=>x.toString(16).padStart(2,'0')).join('');state.pin={salt,hash:await hashPIN(pin,salt)};$('#profilePin').value='';save();ctx.toast('Đã lưu PIN quản trị');}catch(e){ctx.toast(e.message,'warn');}};
 // ====== Doctor: deterministic offline audit with explicit user action for real tests. ======
 let lastReport=null;
 function doctor(){const g=epg(),matches=channels().filter(c=>window.IPTVGuide.find(g,c).length).length;lastReport=lib.diagnostics(channels(),matches);
  const r=lastReport,root=$('#doctorReport');root.replaceChildren();const summary=document.createElement('div');summary.className='doctor-metrics';
  for(const [name,num] of [['Tổng kênh',r.total],['Sống',r.alive],['Die',r.dead],['URL trùng',r.duplicateUrls],['Thiếu tvg-id',r.missingEpgId],['Khớp EPG',matches]]){const div=document.createElement('article');div.innerHTML=`<b>${num}</b><span>${name}</span>`;summary.append(div);}root.append(summary);
  const b=document.createElement('div');b.className='settings-card';b.innerHTML='<h2>Đề xuất sửa</h2><p>Không tự xóa hoặc thay link. Kiểm tra thủ công trước khi xuất danh sách.</p>';
  const list=document.createElement('div');list.className='doctor-issues';for(const item of r.issues.slice(0,120)){const row=document.createElement('div');row.textContent=`${item.name} — ${item.type}: ${item.fix}`;list.append(row);}b.append(list);root.append(b);
  return r;
 }
 $('#doctorDeepCheck').onclick=()=>{ctx.setPage('sources');document.getElementById('sourceRepairSection')?.scrollIntoView({block:'start'});document.getElementById('sourceCheckAllBtn')?.click();};
 $('#doctorRun').onclick=()=>{doctor();ctx.toast('Đã chẩn đoán M3U; vào Quản lý nguồn → Kiểm tra & sửa để kiểm tra luồng thực');};
 $('#doctorExport').onclick=()=>{const report=lastReport||doctor();const payload=JSON.stringify({...report,generatedAt:new Date().toISOString()},null,2);const u=URL.createObjectURL(new Blob([payload],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='open-iptv-doctor-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 // Keep each profile in step with the one canonical Favorites store.
 function onFavoritesChanged(){
  const active=profile();
  const store=ctx.getStore();
  active.favorites=[...(store.favorites||[])];
  active.favoriteKeys=[...(store.favoriteKeys||[])];
  save();
 }
 function onChannel(ch,mode){if(mode==='timeshift')return;if(ch?.id!==activeChannelId){activeChannelId=ch?.id||'';autoAttemptedId='';autoSuppressedId='';}if(buffering||bufferStarting){bufferRequest++;buffering=false;bufferId='';$('#bufferToggle').textContent='Bật bộ đệm';setStatus('Bộ đệm bị dừng khi chuyển kênh');}}
 function onPage(p,last){hidePreview();if(last==='multiview'&&p!=='multiview'){stopMulti();ctx.player.muted=previousMainMuted;}if(p==='multiview'){previousMainMuted=ctx.player.muted;ctx.player.muted=true;renderMulti();}if(p==='health')renderHealth();if(p==='doctor')doctor();if(p==='profiles')renderProfiles();if(p==='epg')renderEpgSearch();applyProfileUI();}
 $('#epgSearchResults').textContent='Nhập tên chương trình để tìm và đặt nhắc lịch.';
 $('#bufferPreset').value=state.optimizer;
 window.IPTVProAdvanced={decorateRow,allowChannel,onCheck,onPlaying,onLoadStart,onQuality,onStreamError,onChannel,onStop,onPage,onFavoritesChanged,hlsOptions,doctor,playCatchup,remind,setAlternates:(id,urls)=>{state.alternates[id]=[...new Set(urls)].slice(0,15);save();},canEdit:()=>!profile().child,canEnterPage:p=>!profile().child||!['sources','folders','settings','health','doctor'].includes(p)};
 onFavoritesChanged();
 applyProfileUI();
 setInterval(checkReminders,30000);checkReminders();
})();
