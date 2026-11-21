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
 root.dataset.poWatchFlow='ready';
 window.PositronWatchFlow=Object.freeze({open:openPanel,close,refresh:draw});
})();
