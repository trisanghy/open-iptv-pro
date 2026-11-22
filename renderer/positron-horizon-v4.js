'use strict';
/* Positron Horizon / WatchFlow UI. Uses only enabled native IPTV channels.
 * No autoplay, playlist editing, extra permissions, HTTP calls or fake EPG.
 */
(()=>{
 const d=document,root=d.documentElement,byId=id=>d.getElementById(id);
 if(root.dataset.positron!=='true'||!byId('page-tv')||!byId('positronBar'))return;
 root.classList.add('po-horizon');
 const core=window.PositronWatchFlowCore;
 if(!core)return;
 const actions=d.querySelector('#positronBar .p-actions')||byId('positronBar');
 const toggle=d.createElement('button');
 toggle.type='button';toggle.id='poWatchFlowToggle';toggle.className='po-watchflow-toggle';
 toggle.setAttribute('aria-controls','poWatchFlowPanel');
 toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-haspopup','dialog');
 toggle.title='WatchFlow · Gợi ý kênh theo sở thích và tình trạng nguồn';
 toggle.setAttribute('aria-label','Mở WatchFlow, gợi ý kênh từ nguồn hiện có');
 const spark=d.createElement('span');spark.className='po-watchflow-spark';spark.setAttribute('aria-hidden','true');spark.textContent='✦';
 const word=d.createElement('span');word.className='po-watchflow-word';word.textContent='WatchFlow';
 toggle.append(spark,word);actions.prepend(toggle);

 const panel=d.createElement('section');panel.id='poWatchFlowPanel';panel.className='po-watchflow-panel';panel.hidden=true;
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
 panel.setAttribute('aria-labelledby','poWatchFlowTitle');
 panel.innerHTML=`
 <header class="po-watchflow-head"><div><span class="po-watchflow-kicker">KHÁM PHÁ KÊNH CỦA BẠN</span><h2 id="poWatchFlowTitle">Xem gì bây giờ?</h2><p>Chọn theo chủ đề, ưu tiên kênh có bằng chứng hoạt động. Không cần tải dữ liệu bên ngoài.</p></div><button type="button" id="poWatchFlowClose" aria-label="Đóng gợi ý kênh" title="Đóng"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></header>
 <div class="po-watchflow-modes" role="group" aria-label="Chủ đề gợi ý">
 <button type="button" data-po-mode="all" aria-pressed="true">Dành cho bạn</button>
 <button type="button" data-po-mode="news" aria-pressed="false">Tin tức</button>
 <button type="button" data-po-mode="sport" aria-pressed="false">Thể thao</button>
 <button type="button" data-po-mode="cinema" aria-pressed="false">Phim</button>
 <button type="button" data-po-mode="music" aria-pressed="false">Âm nhạc</button>
 <button type="button" data-po-mode="kids" aria-pressed="false">Thiếu nhi</button>
 </div>
 <div class="po-watchflow-subhead"><strong id="poWatchFlowCount">Kênh đề xuất</strong><button type="button" id="poWatchFlowNext">Gợi ý khác <span aria-hidden="true">↻</span></button></div>
 <div class="po-watchflow-results" id="poWatchFlowResults" aria-live="polite"></div>
 <p class="po-watchflow-note">Gợi ý dựa trên tên/nhóm kênh, lịch sử phát và bằng chứng kiểm tra đã lưu. Không khẳng định kênh đang trực tuyến hoặc đang chiếu chương trình cụ thể.</p>`;
 d.body.append(panel);
 let mode='all',seen=[],last=[],open=false;
 const showEmpty=(message,hasChannels)=>{
  const box=d.createElement('div');box.className='po-watchflow-empty';
  const title=d.createElement('strong');title.textContent=message;
  const detail=d.createElement('p');detail.textContent=hasChannels?'Hãy chọn chủ đề khác, hoặc kiểm tra nguồn trong Smart IPTV Doctor.':'Chỉ sử dụng playlist M3U hoặc URL mà bạn có quyền truy cập.';
  box.append(title,detail);
  if(!hasChannels){
   const button=d.createElement('button');button.type='button';button.textContent='Thêm nguồn IPTV';
   button.addEventListener('click',()=>{
    close();window.IPTVState?.setPage?.('sources');
   });
   box.append(button);
  }
  return box;
 };
 const draw=()=>{
  const target=byId('poWatchFlowResults');if(!target)return;
  const channels=window.IPTVState?.getChannels?.()||[];
  // Empty-source suggestions must leave the native playlist-import actions visible.
  panel.dataset.emptyPlaylist=String(channels.length===0);
  const ranking=core.rank(channels,{mode,seen,limit:3});
  target.replaceChildren();
  last=ranking.items;
  byId('poWatchFlowCount').textContent=ranking.available+' kênh phù hợp';
  byId('poWatchFlowNext').disabled=!ranking.available;
  if(!ranking.available){
   target.append(showEmpty(channels.length?'Không có kênh phù hợp chủ đề này':'Chưa có danh sách kênh',channels.length>0));
   return;
  }
  for(const [index,ch] of ranking.items.entries()){
   const card=d.createElement('article');card.className='po-watchflow-card';
   const n=d.createElement('span');n.className='po-watchflow-rank';n.textContent=String(index+1).padStart(2,'0');
   const details=d.createElement('div');details.className='po-watchflow-card-body';
   const label=d.createElement('strong');label.textContent=ch.name;
   const group=d.createElement('small');group.textContent=ch.group||'Chưa phân loại';
   const reason=d.createElement('p');reason.textContent=ch.reason;
   details.append(label,group,reason);
   const button=d.createElement('button');button.type='button';button.className='po-watchflow-play';button.textContent='Xem';
   button.setAttribute('aria-label','Xem kênh '+ch.name);
   button.addEventListener('click',()=>{
    const current=window.IPTVState;
    if(!current?.getChannels?.().some(c=>String(c.id)===ch.id))return draw();
    seen.push(ch.id);seen=seen.slice(-150);
    close();current.setPage?.('tv');
    void Promise.resolve(current.playChannel(ch.id)).catch(()=>{current.toast?.('Không thể phát kênh đã chọn','error');});
   });
   card.append(n,details,button);target.append(card);
  }
 };
 const close=()=>{
  const focusWasInside=panel.contains(d.activeElement);
  open=false;panel.hidden=true;toggle.setAttribute('aria-expanded','false');
  if(focusWasInside)toggle.focus();
 };
 const openPanel=()=>{
  if(!byId('page-tv').classList.contains('active-page'))return;
  open=true;panel.hidden=false;toggle.setAttribute('aria-expanded','true');draw();
  // Dialog is appended after the main app: focus its first useful action
  // instead of leaving keyboard users on the topbar trigger.
  const focusTarget=panel.dataset.emptyPlaylist==='true'
   ?panel.querySelector('.po-watchflow-empty button')
   :panel.querySelector('[data-po-mode][aria-pressed="true"]');
  (focusTarget||byId('poWatchFlowClose')).focus();
 };
 toggle.addEventListener('click',()=>open?close():openPanel());
 byId('poWatchFlowClose').addEventListener('click',()=>{close();toggle.focus();});
 byId('poWatchFlowNext').addEventListener('click',()=>{
  if(!last.length)return;seen.push(...last.map(x=>x.id));seen=seen.slice(-150);
  const channels=window.IPTVState?.getChannels?.()||[];
  if(core.rank(channels,{mode,seen,limit:1}).exhausted)seen=[];
  draw();
 });
 panel.querySelectorAll('[data-po-mode]').forEach(button=>{
  button.addEventListener('click',()=>{
   mode=button.dataset.poMode;
   panel.querySelectorAll('[data-po-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   seen=[];draw();
  });
 });
 d.addEventListener('keydown',event=>{
  if(!open||event.key!=='Escape')return;
  event.stopPropagation();close();toggle.focus();
 });
 d.addEventListener('pointerdown',event=>{
  if(open&&!panel.contains(event.target)&&!toggle.contains(event.target))close();
 });
 const count=byId('navCount');
 if(count)new MutationObserver(()=>{if(open)draw();}).observe(count,{childList:true,characterData:true,subtree:true});
 // P5.1.71: TV-only WatchFlow; restore keyboard focus to a visible action.
 const tvPage=byId('page-tv');
 const syncTVAvailability=()=>{
  const onTV=tvPage.classList.contains('active-page');
  if(!onTV&&open)close();
  toggle.hidden=!onTV;
  if(!onTV&&d.activeElement===toggle)
   (byId('positronOpen')||d.querySelector('#positronBar .p-actions button:not([hidden])'))?.focus();
 };
 new MutationObserver(syncTVAvailability).observe(tvPage,{attributes:true,attributeFilter:['class']});
 syncTVAvailability();
 // Source management contains five in-page actions: expose the selected section
 // for pointer, keyboard and screen-reader users without altering native jumps.
 const sourceJumps=[...d.querySelectorAll('#page-sources .sources-hub-nav [data-source-jump]')];
 const markSourceJump=destination=>{
  sourceJumps.forEach(jump=>{
   const active=jump.dataset.sourceJump===destination;
   jump.classList.toggle('po-source-jump-active',active);
   if(active)jump.setAttribute('aria-current','location');
   else jump.removeAttribute('aria-current');
  });
 };
 sourceJumps.forEach(jump=>jump.addEventListener('click',()=>markSourceJump(jump.dataset.sourceJump)));
 if(sourceJumps.length)markSourceJump(sourceJumps[0].dataset.sourceJump);
 // P5.1.73: keep the full native recording path available to hover and
 // assistive technologies even when a long device path is visually ellipsized.
 const recordingDirectory=byId('dvrDirectory');
 if(recordingDirectory){
  const syncDirectoryTitle=()=>{
   const full=recordingDirectory.textContent.trim();
   if(recordingDirectory.title!==full)recordingDirectory.title=full;
  };
  new MutationObserver(syncDirectoryTitle).observe(recordingDirectory,{childList:true,characterData:true,subtree:true});
  syncDirectoryTitle();
 }
 // P5.1.76: no playlist means the Doctor analysis dashboards have no
 // meaningful inputs. Hide them until native channels exist, preserving DOM,
 // saved reports and full functionality after import.
 const doctorPage=byId('page-doctor'),doctorCount=byId('navCount');
 if(doctorPage&&doctorCount&&window.IPTVState?.getChannels){
  const syncDoctorAvailability=()=>{
   doctorPage.dataset.poEmptyDoctor=String(window.IPTVState.getChannels().length===0);
  };
  new MutationObserver(syncDoctorAvailability).observe(doctorCount,{childList:true,subtree:true,characterData:true});
  syncDoctorAvailability();
 }
 // P5.1.84: real P5.1.83 empty TV sidebar had only a passive instruction.
 // Preserve native playlist renderer and expose direct source management only
 // while its authoritative channel array is genuinely empty.
 const nativeChannelList=byId('channelList');
 if(nativeChannelList&&window.IPTVState?.getChannels){
  const syncEmptySidebarSource=()=>{
   if(window.IPTVState.getChannels().length>0)return;
   const empty=nativeChannelList.querySelector('.empty-list');
   if(!empty||empty.querySelector('#poEmptySourceAction'))return;
   empty.classList.add('po-empty-channel-onboarding');
   empty.replaceChildren();
   const heading=d.createElement('strong');heading.textContent='Chưa có nguồn IPTV';
   const hint=d.createElement('p');hint.textContent='Thêm danh sách M3U hoặc URL để bắt đầu xem.';
   const action=d.createElement('button');action.type='button';action.id='poEmptySourceAction';
   action.textContent='Thêm nguồn IPTV';
   action.setAttribute('aria-label','Mở trang Nguồn để thêm danh sách IPTV');
   action.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'));
   empty.append(heading,hint,action);
  };
  new MutationObserver(syncEmptySidebarSource).observe(nativeChannelList,{childList:true});
  syncEmptySidebarSource();
 }

 // P5.1.88: when native sources already provide usable channels, the TV
 // empty player must not keep asking to reimport a playlist. No autoplay.
 const nativeEmptyPlayer=byId('emptyPlayer'),nativeChannelMeta=byId('channelMeta');
 if(nativeEmptyPlayer&&nativeChannelMeta&&window.IPTVState?.getChannels){
  const heading=nativeEmptyPlayer.querySelector('h2');
  const hint=nativeEmptyPlayer.querySelector('p');
  const buttons=nativeEmptyPlayer.querySelector('.empty-actions');
  const fileAction=byId('emptyFileBtn'),urlAction=byId('emptyUrlBtn');
  if(heading&&hint&&buttons&&fileAction&&urlAction){
   const playerSubtitle=byId('playingSubtitle');
   const originalHeading=heading.textContent,originalHint=hint.textContent;
   const start=d.createElement('button');start.type='button';
   start.id='poFirstChannelAction';start.className='btn btn-primary';
   start.textContent='Xem kênh đầu tiên';
   start.setAttribute('aria-label','Phát kênh đầu tiên trong danh sách nguồn hiện có');
   start.hidden=true;
   start.addEventListener('click',()=>{
    const first=window.IPTVState?.getChannels?.().find(c=>c?.id&&c?.url&&c.status!=='dead');
    if(!first)return;
    Promise.resolve(window.IPTVState.playChannel(first.id)).catch(e=>window.IPTVState?.toast?.(e.message||String(e),'error'));
   });

   // P204: explicit discovery action. Never auto-starts playback on open;
   // excludes unusable channels and avoids repeating the current selection.
   const random=d.createElement('button');random.type='button';
   random.id='poRandomChannelAction';random.className='btn btn-subtle';
   random.textContent='Khám phá kênh ngẫu nhiên';
   random.setAttribute('aria-label','Chọn và phát một kênh ngẫu nhiên có thể xem');
   random.hidden=true;
   // P206: session-only pool prevents random repeats until choices run out.
   const randomSeenIds=new Set();
   const switchRandomChannel=()=>{
    const candidates=window.IPTVState?.getChannels?.().filter(c=>c?.id&&c?.url&&c.status!=='dead')||[];
    if(!candidates.length)return;
    const currentId=window.IPTVState?.getCurrent?.()?.id;
    const other=candidates.filter(c=>c.id!==currentId);
    // Keep playlist unchanged; prune removed IDs from session-only memory.
    const activeIds=new Set(candidates.map(c=>c.id));
    for(const id of randomSeenIds)if(!activeIds.has(id))randomSeenIds.delete(id);
    const eligible=other.length?other:candidates;
    const unseen=eligible.filter(c=>!randomSeenIds.has(c.id));
    if(!unseen.length)randomSeenIds.clear();
    const available=unseen.length?unseen:eligible;
    const selected=available[Math.floor(Math.random()*available.length)];
    if(!selected)return;
    randomSeenIds.add(selected.id);
    resetRandom.hidden=false;
    const badge=nextRandom.querySelector('.po-random-count');
    if(badge){badge.hidden=false;badge.textContent=String(randomSeenIds.size);}
    nextRandom.dataset.poDiscoverCount=String(randomSeenIds.size);
    syncRandomProgress();
    Promise.resolve(window.IPTVState.playChannel(selected.id))
     .catch(e=>window.IPTVState?.toast?.(e.message||String(e),'error'));
   };
   random.addEventListener('click',switchRandomChannel);
   buttons.prepend(start,random);
   // P205: offer the same explicit discovery action while watching.
   const nextRandom=d.createElement('button');nextRandom.type='button';
   nextRandom.id='poNextRandomChannel';nextRandom.className='control-sm po-switch-random';
   nextRandom.title='Đổi sang kênh ngẫu nhiên khác';
   nextRandom.setAttribute('aria-label','Đổi sang kênh ngẫu nhiên khác');
   nextRandom.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/></svg><span class="po-random-label">Bất kỳ</span><span class="po-random-count" hidden aria-hidden="true"></span><span class="po-random-progress" hidden aria-hidden="true"></span>';
   nextRandom.hidden=true;
   // P209: Show how many of the eligible channels have been explored.
   // Session-only information; never starts playback or changes sources.
   const syncRandomProgress=()=>{
    // P210: source edits can remove previously discovered channels.
    // Drop stale session IDs when the native channel list changes, not only
    // when the next random button is pressed. Never mutate the playlist.
    const eligible=window.IPTVState?.getChannels?.().filter(c=>c?.id&&c?.url&&c.status!=='dead')||[];
    const activeIds=new Set(eligible.map(c=>c.id));
    for(const id of randomSeenIds)if(!activeIds.has(id))randomSeenIds.delete(id);
    const total=eligible.length,count=randomSeenIds.size;
    const badge=nextRandom.querySelector('.po-random-count');
    if(badge){badge.hidden=count===0;badge.textContent=count?String(count):'';}
    nextRandom.dataset.poDiscoverCount=String(count);
    const progress=nextRandom.querySelector('.po-random-progress');
    if(progress){progress.textContent=total>1?'/'+total:'';progress.hidden=total<2||count===0;}
    nextRandom.title=count?'Đã khám phá '+count+'/'+total+' kênh':'Đổi sang kênh ngẫu nhiên khác';
    nextRandom.setAttribute('aria-label',count?'Đã khám phá '+count+' trong '+total+' kênh; nhấn để xem kênh khác':'Đổi sang kênh ngẫu nhiên khác');
    const reset=byId('poRandomCycleReset');
    if(reset)reset.hidden=nextRandom.hidden||count===0;
   };
   nextRandom.addEventListener('click',switchRandomChannel);
   byId('nextBtn')?.parentElement?.append(nextRandom);
   // P207: explicit accessible reset for the session-only discovery cycle.
   const resetRandom=d.createElement('button');resetRandom.type='button';
   resetRandom.id='poRandomCycleReset';resetRandom.className='control-sm po-random-reset';
   resetRandom.textContent='↻';resetRandom.title='Làm mới lượt khám phá kênh ngẫu nhiên';
   resetRandom.setAttribute('aria-label','Làm mới lượt khám phá kênh ngẫu nhiên');
   resetRandom.hidden=true;
   resetRandom.addEventListener('click',()=>{
    // Keep keyboard/remote focus on an actionable control after hiding reset.
    const restoreKeyboardFocus=d.activeElement===resetRandom;
    randomSeenIds.clear();
    const badge=nextRandom.querySelector('.po-random-count');
    if(badge){badge.hidden=true;badge.textContent='';}
    nextRandom.dataset.poDiscoverCount='0';
    syncRandomProgress();
    nextRandom.title='Đổi sang kênh ngẫu nhiên khác';
    nextRandom.setAttribute('aria-label','Đổi sang kênh ngẫu nhiên khác');
    resetRandom.hidden=true;
    if(restoreKeyboardFocus&&!nextRandom.hidden)nextRandom.focus();
   });
   byId('nextBtn')?.parentElement?.append(resetRandom);
   const syncPlayerIntro=()=>{
    const channels=window.IPTVState.getChannels();
    const hasChannels=channels.length>0;
    const first=channels.find(c=>c?.id&&c?.url&&c.status!=='dead');
    nativeEmptyPlayer.dataset.poHasChannels=String(hasChannels);
    heading.textContent=hasChannels?'Chọn kênh để xem':originalHeading;
    hint.textContent=hasChannels?(first?
     'Đã có '+channels.length+' kênh. Chọn trong danh sách bên trái hoặc bắt đầu với kênh đầu tiên.':
     'Đã có '+channels.length+' kênh, nhưng chưa tìm thấy link có thể thử phát. Hãy kiểm tra nguồn.'):originalHint;
    fileAction.hidden=hasChannels&&!!first;urlAction.hidden=hasChannels&&!!first;
    start.hidden=!first;
    random.hidden=!first;
    nextRandom.hidden=channels.filter(c=>c?.id&&c?.url&&c.status!=='dead').length<2;
    resetRandom.hidden=nextRandom.hidden||randomSeenIds.size===0;
    syncRandomProgress();
    // P5.1.89: the native player subtitle should not say "import a
    // playlist" after enabled channels are present; preserve stop/playback
    // captions, which are owned by the native player state machine.
    if(playerSubtitle&&!window.IPTVState.getCurrent()?.id){
     const text=playerSubtitle.textContent.trim();
     if(text==='Nhập danh sách để bắt đầu'||text==='Chọn kênh để bắt đầu')
      playerSubtitle.textContent=hasChannels?'Chọn kênh để bắt đầu':'Nhập danh sách để bắt đầu';
    }
   };
   new MutationObserver(syncPlayerIntro).observe(nativeChannelMeta,{childList:true,characterData:true,subtree:true});
   syncPlayerIntro();
  }
 }

 // P5.1.90: Video Lab is an experimental UI without verified AI backend.
 // Do not show a dead-end control when no native channel is selected.
 const captionRow=byId('captionThirdRow'),selectedTitle=byId('playingTitle');
 if(captionRow&&selectedTitle){
  const syncVideoLabAvailability=()=>{
   const trigger=byId('videoEnhanceToggle');if(!trigger)return;
   const hasSelection=!!window.IPTVState?.getCurrent?.()?.id;
   trigger.hidden=!hasSelection;
   if(!hasSelection){
    const panel=byId('videoEnhancePanel');if(panel)panel.hidden=true;
    trigger.setAttribute('aria-expanded','false');
   }
  };
  new MutationObserver(syncVideoLabAvailability).observe(captionRow,{childList:true});
  new MutationObserver(syncVideoLabAvailability).observe(selectedTitle,{childList:true,subtree:true,characterData:true});
  d.addEventListener('openiptv:renderer-ready',syncVideoLabAvailability);
  d.addEventListener('openiptv:unified-ai-ready',syncVideoLabAvailability);
  syncVideoLabAvailability();
 }
 root.dataset.poWatchFlow='ready';
 window.PositronWatchFlow=Object.freeze({open:openPanel,close,refresh:draw});
})();
