'use strict';
/* Positron P5 incremental UI and accessibility layer.
   No changes to IPTVState storage, playlist playback or streaming pipeline. */
(()=>{
 const d=document,root=d.documentElement;
 if(root.dataset.positron!=='true'||!d.getElementById('positronBar'))return;
 const byId=id=>d.getElementById(id);
 const maxStage=20;
 let stage=0,previous=null;
 const setStage=(target,feedback=null)=>{
   const next=Math.max(0,Math.min(maxStage,Number(target)||0));
   for(let i=1;i<=maxStage;i++)root.classList.toggle('p20-'+String(i).padStart(2,'0'),i<=next);
   stage=next;
   root.dataset.p20Stage=String(next);
   if(feedback&&typeof feedback==='object'){
     previous={round:Number(feedback.round)||null,overflow:!!feedback.overflow,sha256:String(feedback.sha256||'')};
     root.dataset.p20Feedback=previous.overflow?'overflow':'ok';
   }
   return {stage,fromRound:previous?.round??null};
 };
 setStage(20);
 // All labels below are additive. Native handlers and stream controls stay intact.
 const metadata=[
  ['playBtn','Phát hoặc tạm dừng kênh'],['stopBtn','Dừng phát kênh'],
  ['fullscreenBtn','Bật toàn màn hình'],['castBtn','Phát lên TV qua Cast hoặc AirPlay'],
  ['pipBtn','Chế độ hình trong hình'],['refreshAllBtn','Làm mới danh sách nguồn IPTV'],
  ['positronHelpBtn','Hướng dẫn phím tắt'],['positronFiltersToggle','Hiển thị bộ lọc kênh'],
  ['positronToolsToggle','Hiển thị công cụ phát nâng cao']
 ];
 for(const [id,label] of metadata){const node=byId(id);if(node){node.setAttribute('aria-label',label);if(!node.title)node.title=label;}}
 for(const [id,controls] of [['positronToolsToggle','playbackExtra'],['positronFiltersToggle','channelList'],['positronMorePages','appSidebar']]){
  const node=byId(id);if(node)node.setAttribute('aria-controls',controls);
 }
 const search=byId('searchBox');
 if(search)search.setAttribute('aria-keyshortcuts','/');
 // Slash focuses the original channel finder on TV; it never searches private data remotely.
 d.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
  if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  if(byId('positronPalette')?.hidden===false||byId('positronStudioMenu')?.hidden===false||byId('positronHelpDialog')?.open)return;
  if(!d.querySelector('#page-tv.active-page'))return;
  if(event.key==='/'){event.preventDefault();search?.focus();}
 });
 // Make hidden-label compact rail buttons accessible even after dynamic nav updates.
 const sidebar=byId('appSidebar');
 if(sidebar){
  const labelNav=()=>{
   for(const b of sidebar.querySelectorAll('button.nav')){
    if(b.hasAttribute('aria-label'))continue;
    const text=(b.textContent||'').replace(/\s+/g,' ').trim();
    if(text){b.setAttribute('aria-label',text);if(!b.title)b.title=text;}
   }
  };
  labelNav();
  new MutationObserver(labelNav).observe(sidebar,{childList:true,subtree:true});
 }

 // P5.1 screenshot review: neutral monochrome SVGs replace platform-colored
 // transport emoji without replacing button nodes, playback listeners or state.
 const ns='http://www.w3.org/2000/svg';
 // P5.1.32: actual P5.1.31 TV 450px screenshot uses platform font '◈'.
 // Preserve the original Studio button and all native click/keyboard handlers.
 // P5.1.40: in the actual P5.1.39 no-playlist Electron TV screenshot,
 // the large decorative purple Play triangle looks tappable while native
 // Play is correctly disabled. Replace only static empty-state artwork.
 const emptyPicture=byId('emptyPlayer')?.querySelector('.empty-icon');
 if(emptyPicture&&!emptyPicture.querySelector('svg')){
  const svg=d.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('class','positron-empty-tv');
  svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  const body=d.createElementNS(ns,'rect');body.setAttribute('x','3');body.setAttribute('y','4');body.setAttribute('width','18');body.setAttribute('height','14');body.setAttribute('rx','2');
  const stem=d.createElementNS(ns,'path');stem.setAttribute('d','M12 18v3m-4 0h8');
  svg.append(body,stem);
  emptyPicture.replaceChildren(svg);
  emptyPicture.setAttribute('aria-hidden','true');
 }
 const themeControl=byId('positronStudioBtn');
 if(themeControl&&!themeControl.querySelector('svg')){
  const vector=d.createElementNS(ns,'svg');vector.setAttribute('viewBox','0 0 24 24');
  vector.setAttribute('aria-hidden','true');vector.setAttribute('focusable','false');
  vector.setAttribute('class','positron-theme-vector');
  const outer=d.createElementNS(ns,'circle');outer.setAttribute('cx','12');outer.setAttribute('cy','12');outer.setAttribute('r','9');
  const half=d.createElementNS(ns,'path');half.setAttribute('d','M12 3a9 9 0 0 1 0 18Z');half.setAttribute('class','theme-half');
  vector.append(outer,half);
  const word=d.createElement('span');word.textContent='Chủ đề';
  themeControl.replaceChildren(vector,word);
 }

 const iconDefinitions=[
  ['prevBtn','M6 5v14 M20 5 9 12l11 7V5z','Kênh trước'],
  ['stopBtn','M6 6h12v12H6z','Dừng phát'],
  ['nextBtn','M18 5v14 M4 5l11 7-11 7V5z','Kênh sau'],
  ['fsPrev','M6 5v14 M20 5 9 12l11 7V5z','Kênh trước'],
  ['fsNext','M18 5v14 M4 5l11 7-11 7V5z','Kênh sau'],
  ['fullscreenBtn','M8 3H3v5 M16 3h5v5 M8 21H3v-5 M16 21h5v-5','Bật toàn màn hình']
 ];
 for(const [name,shape,label] of iconDefinitions){
  const button=byId(name);if(!button)continue;
  const svg=d.createElementNS(ns,'svg'),path=d.createElementNS(ns,'path');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','19');
  svg.setAttribute('height','19');svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  path.setAttribute('d',shape);svg.append(path);
  button.replaceChildren(svg);button.dataset.p20Vector='true';
  button.setAttribute('aria-label',label);button.title=label;
 }

 
 // P5.1.9 round 02: Empty Favorites had no path to manage sources in
 // the actual P5.1.8 600px Electron screenshot. Preserve original list.
 const favoriteList=byId('favoriteList');
 if(favoriteList){
  const syncFavoriteSourceAction=()=>{
   const empty=favoriteList.querySelector('.empty-list');
   if(!empty)return;
   // Write only the native message text node; never replace the Favorites list or its button.
   const num=Number((byId('sourceCount')?.textContent||'0').replace(/[^0-9]/g,''))||0;
   const guidance=num===0
    ?'Chưa có nguồn IPTV. Hãy mở Quản lý nguồn IPTV để thêm playlist M3U hoặc URL, sau đó đánh dấu sao những kênh muốn lưu.'
    :'Chưa có kênh yêu thích trong các nguồn đang bật. Đánh dấu sao để lưu kênh hoặc kiểm tra những nguồn đã tắt trong Quản lý nguồn IPTV.';
   const copy=empty.firstChild;
   if(copy?.nodeType===3&&copy.textContent!==guidance)copy.textContent=guidance;
   if(empty.querySelector('#positronFavoritesSources'))return;
   const button=d.createElement('button');
   button.id='positronFavoritesSources';button.type='button';
   button.className='btn btn-primary po-fav-action';
   button.textContent='Quản lý nguồn IPTV';
   button.title='Mở trang quản lý và thêm nguồn IPTV';
   button.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'));
   empty.append(button);
  };
  new MutationObserver(syncFavoriteSourceAction).observe(favoriteList,{childList:true,subtree:true});
  const countNode=byId('sourceCount');
  if(countNode)new MutationObserver(syncFavoriteSourceAction).observe(countNode,{childList:true,subtree:true,characterData:true});
  syncFavoriteSourceAction();
 }

 // P5.1.12 / round 05: real 1360px Settings screenshot shows the old
 // search label cut off ("Tìm kênh, trang, công cu..."), with a tiny font glyph
 // instead of a recognizable search icon. Preserve button event and shortcut.
 const searchButton=byId('positronOpen');
 if(searchButton){
  const glyph=searchButton.querySelector('span:first-child');
  if(glyph&&!glyph.querySelector('svg')){
   const svg=d.createElementNS(ns,'svg');
   svg.setAttribute('viewBox','0 0 24 24');
   svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   const circle=d.createElementNS(ns,'circle');
   circle.setAttribute('cx','10.5');circle.setAttribute('cy','10.5');circle.setAttribute('r','6.5');
   const handle=d.createElementNS(ns,'path');handle.setAttribute('d','M16 16l5 5');
   svg.append(circle,handle);glyph.replaceChildren(svg);
  }
  const label=searchButton.querySelector('.p-command-label');
  if(label)label.textContent='Tìm kênh / trang';
  searchButton.setAttribute('aria-label','Tìm kiếm kênh, trang và công cụ');
 }
 // P5.1.13 round 06: keep full native FFmpeg readiness/status accessible.
 // The original sidebar text updates during runtime; never cache or replace it.
 const statusLabel=byId('miniStatus');
 if(statusLabel){
  const syncStatusTitle=()=>{const value=statusLabel.textContent||'';if(statusLabel.title!==value)statusLabel.title=value;};
  new MutationObserver(syncStatusTitle).observe(statusLabel,{childList:true,subtree:true,characterData:true});
  syncStatusTitle();
 }
 // P5.1.14: the real P5.1.13 Sources screenshot at 720px showed
 // the unlimited native scan option clipped. Keep value='all' unchanged.
 const smartLimit=byId('smartLimit');
 if(smartLimit){
  const unlimited=smartLimit.querySelector('option[value="all"]');
  if(unlimited){
   unlimited.textContent='Tất cả kênh';
   unlimited.title='Kiểm tra tất cả (không giới hạn)';
  }
 }
 // P5.1.15 / new round 07: live Electron Doctor shows six zero metrics
 // with no route to import sources. Add a non-destructive recovery action.
 const doctorPage=byId('page-doctor');
 if(doctorPage&&!byId('positronDoctorEmptyHint')){
  const hint=d.createElement('div');hint.id='positronDoctorEmptyHint';
  const copy=d.createElement('span');copy.textContent='Chưa có kênh để chẩn đoán. Thêm hoặc bật nguồn IPTV trước khi chạy Doctor 3.0.';
  const action=d.createElement('button');action.type='button';action.id='positronDoctorSources';
  action.className='btn btn-primary';action.textContent='Quản lý nguồn IPTV';
  action.title='Mở trang quản lý nguồn IPTV';
  action.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'));
  hint.append(copy,action);
  doctorPage.querySelector('.section-heading')?.insertAdjacentElement('afterend',hint);
  const count=byId('navCount');
  const updateHint=()=>{hint.hidden=(Number((count?.textContent||'0').replace(/[^0-9]/g,''))||0)>0;};
  if(count)new MutationObserver(updateHint).observe(count,{childList:true,subtree:true,characterData:true});
  updateHint();
 }
 // P5.1.16: P5.1.15 actual Electron 450px TV screenshot still
 // shows OS-dependent '◖))' speaker text unlike vector transport icons.
 // Keep the native label and the original range input event handlers.
 const volumeLabel=d.querySelector('#page-tv label.volume-icon[for="volume"]');
 if(volumeLabel&&!volumeLabel.querySelector('svg')){
  const svg=d.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  for(const shape of ['M11 5 6 9H3v6h3l5 4z','M15 9a4 4 0 0 1 0 6','M18 6a8 8 0 0 1 0 12']){
   const path=d.createElementNS(ns,'path');
   path.setAttribute('d',shape);svg.append(path);
  }
  volumeLabel.replaceChildren(svg);
 }
 // P5.1.17: Actual P5.1.16 Electron TV 450px screenshot revealed
 // Cast and PiP buttons still have tiny platform-dependent box glyphs.
 // Keep original button nodes, native click handlers and accessible labels.
 const outputIcons=[
  {id:'castBtn',caption:'Cast / AirPlay',paths:['M5 7V5h15v14h-4','M4 12a7 7 0 0 1 7 7','M4 16a3 3 0 0 1 3 3']},
  {id:'pipBtn',caption:'PiP',rects:[[3,4,18,16,2],[11,11,7,6,1]]}
 ];
 for(const spec of outputIcons){
  const button=byId(spec.id);if(!button||button.querySelector('svg'))continue;
  const svg=d.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  for(const pathText of spec.paths||[]){
   const path=d.createElementNS(ns,'path');path.setAttribute('d',pathText);svg.append(path);
  }
  for(const [x,y,width,height,rx] of spec.rects||[]){
   const rect=d.createElementNS(ns,'rect');
   for(const [key,value] of Object.entries({x,y,width,height,rx}))rect.setAttribute(key,String(value));
   svg.append(rect);
  }
  const label=d.createElement('span');label.textContent=spec.caption;
  button.replaceChildren(svg,label);
 }
 // P5.1.24: real Electron 720px EPG image revealed an OS-colored recording emoji.
 // Keep the original localized label and DVR handlers; only replace the decorative glyph.
 const dvrTitle=d.querySelector('#dvrPanel .dvr-heading h2');
 if(dvrTitle){
  const ensureDvrVector=()=>{
   if(dvrTitle.querySelector('svg'))return;
   const caption=(dvrTitle.textContent||'').replace(/^[\s⏺🔴🟠•]+/u,'').trim();
   const icon=d.createElementNS(ns,'svg');icon.setAttribute('viewBox','0 0 24 24');
   icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');
   const outer=d.createElementNS(ns,'circle');outer.setAttribute('cx','12');outer.setAttribute('cy','12');outer.setAttribute('r','9');
   const core=d.createElementNS(ns,'circle');core.setAttribute('cx','12');core.setAttribute('cy','12');core.setAttribute('r','3.5');core.setAttribute('class','record-dot');
   icon.append(outer,core);const label=d.createElement('span');label.textContent=caption;
   dvrTitle.replaceChildren(icon,label);
  };
  ensureDvrVector();new MutationObserver(ensureDvrVector).observe(dvrTitle,{childList:true,subtree:true,characterData:true});
 }
 // P5.1.25: the actual P5.1.24 EPG 720px screenshot shows a blank
 // enabled DVR channel select even though no playlists/channels exist.
 // Preserve native DVR scheduling, but clearly expose no-channel state.
 // P5.1.35: P5.1.34 actual Electron EPG screenshot still rendered a tiny
 // OS-dependent record glyph on the disabled submit. Replace only the
 // decorative glyph, preserving native form submission and channel guards.
 const nativeDvrSubmit=byId('dvrAdd');
 if(nativeDvrSubmit&&!nativeDvrSubmit.querySelector('svg')){
  const icon=d.createElementNS(ns,'svg');icon.setAttribute('viewBox','0 0 24 24');
  icon.setAttribute('class','positron-dvr-record-icon');
  icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');
  const outer=d.createElementNS(ns,'circle');outer.setAttribute('cx','12');outer.setAttribute('cy','12');outer.setAttribute('r','9');
  const center=d.createElementNS(ns,'circle');center.setAttribute('cx','12');center.setAttribute('cy','12');center.setAttribute('r','4');center.setAttribute('class','record-dot');
  icon.append(outer,center);
  const label=d.createElement('span');
  label.textContent=(nativeDvrSubmit.textContent||'').replace(/^[\s⏺🔴🟠•]+/u,'').trim()||'Đặt lịch ghi';
  nativeDvrSubmit.replaceChildren(icon,label);
 }
 const dvrChannel=byId('dvrChannel');
 if(dvrChannel){
  const syncDvrChannel=()=>{
   const hasChannels=Array.from(dvrChannel.options).some(o=>o.value!=='');
   if(!hasChannels&&dvrChannel.options.length===0){
    const option=d.createElement('option');option.value='';option.textContent='Chưa có kênh để ghi hình';
    dvrChannel.append(option);
   }
   dvrChannel.disabled=!hasChannels;
   dvrChannel.setAttribute('aria-label',hasChannels?'Chọn kênh để ghi hình':'Chưa có kênh để hẹn giờ ghi hình');
   // P5.1.30: EPG real screenshot shows enabled submit without any channel.
   const schedule=byId('dvrAdd');
   if(schedule){
    if(!hasChannels){
     if(!schedule.disabled)schedule.setAttribute('data-positron-no-channels','true');
     schedule.disabled=true;
     schedule.setAttribute('aria-describedby','dvrChannel');
    }else if(schedule.getAttribute('data-positron-no-channels')==='true'){
     schedule.disabled=false;
     schedule.removeAttribute('data-positron-no-channels');
     schedule.removeAttribute('aria-describedby');
    }
   }

  };
  syncDvrChannel();
  new MutationObserver(syncDvrChannel).observe(dvrChannel,{childList:true});
 }



 // P5.1.33: real P5.1.32 TV 450px screenshot shows an actionable
 // favorite star beside 'Chưa chọn kênh'. Use the native selection API,
 // not an empty-state string, to protect existing playlist semantics.
 // P5.1.37: actual P5.1.36 Electron TV 450px screenshot shows an active
 // purple Play button next to a 0-channel empty state. Native Play only
 // displays a no-playlist warning in this case. Preserve it for future
 // playlist updates and never interfere with a selected playing channel.
 const mainPlay=byId('playBtn'),channelCount=byId('navCount');
 if(mainPlay&&channelCount){
  const syncPlayAvailability=()=>{
   const count=Number((channelCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   const canPlay=count>0||!!window.IPTVState?.getCurrent?.();
   if(!canPlay){
    if(!mainPlay.hasAttribute('data-positron-no-channels')){
     if(mainPlay.disabled)return; // another native guard takes precedence
     mainPlay.setAttribute('data-positron-no-channels','true');
    }
    mainPlay.disabled=true;
    mainPlay.setAttribute('aria-describedby','playingSubtitle');
   }else if(mainPlay.getAttribute('data-positron-no-channels')==='true'){
    mainPlay.disabled=false;
    mainPlay.removeAttribute('data-positron-no-channels');
    mainPlay.removeAttribute('aria-describedby');
   }
  };
  new MutationObserver(syncPlayAvailability).observe(channelCount,{childList:true,subtree:true,characterData:true});
  const playing=byId('playingTitle');
  if(playing)new MutationObserver(syncPlayAvailability).observe(playing,{childList:true,subtree:true,characterData:true});
  syncPlayAvailability();
 }
 // P5.1.38: P5.1.37 real Electron TV 450px empty-state screenshot
 // shows Prev, Stop, Next available even with zero channels. Stop is only
 // meaningful while a current channel exists, while navigation is available
 // as soon as a playlist supplies channels. Preserve original event nodes.
 const transportActions=['prevBtn','stopBtn','nextBtn'];
 const transportCount=byId('navCount');
 if(transportCount){
  const syncTransportAvailability=()=>{
   const count=Number((transportCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   const hasCurrent=!!window.IPTVState?.getCurrent?.();
   for(const id of transportActions){
    const button=byId(id);if(!button)continue;
    const unavailable=id==='stopBtn'?!hasCurrent:count===0;
    if(unavailable){
     if(!button.hasAttribute('data-positron-inactive')){
      if(button.disabled)continue;
      button.setAttribute('data-positron-inactive','true');
     }
     button.disabled=true;
     button.setAttribute('aria-describedby','playingSubtitle');
    }else if(button.getAttribute('data-positron-inactive')==='true'){
     button.disabled=false;button.removeAttribute('data-positron-inactive');
     button.removeAttribute('aria-describedby');
    }
   }
  };
  new MutationObserver(syncTransportAvailability).observe(transportCount,{childList:true,subtree:true,characterData:true});
  const currentTitle=byId('playingTitle');
  if(currentTitle)new MutationObserver(syncTransportAvailability).observe(currentTitle,{childList:true,subtree:true,characterData:true});
  syncTransportAvailability();
 }
 // P5.1.39: actual P5.1.38 Electron TV 450px screenshot shows Cast/PiP
 // still active when there is no selected channel. Cast's native handler
 // only emits a warning without a channel; PiP needs video. Preserve native
 // handlers and any platform feature-support disabled flags.
 const idleOutputActions=['castBtn','pipBtn'];
 const outputTitle=byId('playingTitle');
 if(outputTitle){
  const syncOutputAvailability=()=>{
   const hasCurrent=!!window.IPTVState?.getCurrent?.();
   for(const id of idleOutputActions){
    const b=byId(id);if(!b)continue;
    if(!hasCurrent){
     if(!b.hasAttribute('data-positron-no-current')){
      if(b.disabled)continue;
      b.setAttribute('data-positron-no-current','true');
     }
     b.disabled=true;b.setAttribute('aria-describedby','playingTitle');
    }else if(b.getAttribute('data-positron-no-current')==='true'){
     b.disabled=false;
     b.removeAttribute('data-positron-no-current');
     b.removeAttribute('aria-describedby');
    }
   }
  };
  new MutationObserver(syncOutputAvailability).observe(outputTitle,{childList:true,subtree:true,characterData:true});
  window.addEventListener('openiptv:media-info',syncOutputAvailability);
  syncOutputAvailability();
 }
 const currentFavorite=byId('favCurrentBtn'),currentLabel=byId('playingTitle');
 if(currentFavorite&&currentLabel){
  const syncFavoriteAvailability=()=>{
   const hasCurrent=!!window.IPTVState?.getCurrent?.();
   if(!hasCurrent){
    if(!currentFavorite.disabled)currentFavorite.setAttribute('data-positron-no-current','true');
    currentFavorite.disabled=true;
    currentFavorite.setAttribute('aria-describedby','playingTitle');
   }else if(currentFavorite.getAttribute('data-positron-no-current')==='true'){
    currentFavorite.disabled=false;
    currentFavorite.removeAttribute('data-positron-no-current');
    currentFavorite.removeAttribute('aria-describedby');
   }
  };
  new MutationObserver(syncFavoriteAvailability).observe(currentLabel,{childList:true,subtree:true,characterData:true});
  new MutationObserver(syncFavoriteAvailability).observe(currentFavorite,{attributes:true,attributeFilter:['aria-pressed']});
  syncFavoriteAvailability();
 }

 // P5.1.26–27: the real Doctor screenshots show active analysis
 // buttons next to zero channel metrics, despite the existing source CTA.
 // Disable no-input operations only; never remove listeners or prior reports.
 const doctorAvailabilityCount=byId('navCount');
 if(doctorPage&&doctorAvailabilityCount){
  const analysisButtons=['doctorRun','doctorDeepCheck','doctor3Refresh','doctor3Verify'];
  const syncDoctorAvailability=()=>{
   const count=Number((doctorAvailabilityCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   for(const id of analysisButtons){
    const button=byId(id);if(!button)continue;
    if(count===0){
     if(!button.hasAttribute('data-positron-no-channels')){
      if(button.disabled)continue; // preserve independently disabled native states
      button.setAttribute('data-positron-no-channels','true');
     }
     button.disabled=true;
     button.setAttribute('aria-describedby','positronDoctorEmptyHint');
    }else if(button.getAttribute('data-positron-no-channels')==='true'){
     button.disabled=false;
     button.removeAttribute('data-positron-no-channels');
     button.removeAttribute('aria-describedby');
    }
   }
  };
  new MutationObserver(syncDoctorAvailability).observe(doctorAvailabilityCount,{childList:true,subtree:true,characterData:true});
  syncDoctorAvailability();
 }

 // P5.1.46 — the verified EPG 720px and 1360px Electron screenshots show
 // an unusable DVR schedule form dominating the page when no source channels exist.
 // Collapse only the unavailable form/help; keep folder controls, existing jobs,
 // native handlers and all field values intact for when channels arrive.
 const compactDvrPanel=byId('dvrPanel'),compactDvrForm=byId('dvrForm'),compactDvrSelect=byId('dvrChannel');
 if(compactDvrPanel&&compactDvrForm&&compactDvrSelect&&!byId('positronDvrNoChannels')){
  const prompt=d.createElement('div');
  prompt.id='positronDvrNoChannels';prompt.className='p46-dvr-empty';prompt.setAttribute('role','status');
  const message=d.createElement('span');message.textContent='Chưa có kênh';
  const sourceButton=d.createElement('button');sourceButton.type='button';sourceButton.className='btn btn-subtle';
  sourceButton.id='positronDvrGoSources';sourceButton.textContent='Quản lý nguồn IPTV';
  sourceButton.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'));
  prompt.append(message,sourceButton);
  compactDvrForm.insertAdjacentElement('beforebegin',prompt);
  // P5.1.47: the actual P5.1.46 screenshots still said 'ready to schedule'
  // while there are zero channels. Only conceal that exact idle copy: native
  // errors, live recording, history and other status changes remain visible.
  const dvrNativeStatus=byId('dvrStatus');
  const idleReadyCopy="Sẵn sàng đặt lịch ghi. Ứng dụng cần đang mở đúng giờ; chỉ hỗ trợ luồng bạn có quyền ghi.";
  const syncCompactDvr=()=>{
   const available=Array.from(compactDvrSelect.options).some(o=>o.value!=='');
   compactDvrPanel.classList.toggle('p46-no-channels',!available);
   prompt.hidden=available;
   const nativeText=dvrNativeStatus?.textContent?.trim()||'';
   const translated=window.OpenIPTVI18n?.t?.(idleReadyCopy)||idleReadyCopy;
   const isIdle=(nativeText===idleReadyCopy||nativeText===translated)&&!dvrNativeStatus?.classList.contains('dvr-error');
   compactDvrPanel.classList.toggle('p47-hide-idle-status',!available&&isIdle);
  };
  new MutationObserver(syncCompactDvr).observe(compactDvrSelect,{childList:true});
  if(dvrNativeStatus)new MutationObserver(syncCompactDvr).observe(dvrNativeStatus,{childList:true,subtree:true,characterData:true});
  syncCompactDvr();
 }

 // P5.1.49: real P5.1.48 EPG empty screenshot still presents Reload EPG
 // as available with zero channels. Do not allow a no-op warning click;
 // reenable only the state disabled by this guard once channels exist.
 const epgReload=byId('epgRefreshBtn'),epgChannelCount=byId('navCount');
 if(epgReload&&epgChannelCount){
  const syncReloadAvailability=()=>{
   const count=Number((epgChannelCount.textContent||'0').replace(/[^0-9]/g,''))||0;
   if(count===0){
    if(!epgReload.disabled){
     epgReload.setAttribute('data-positron-epg-no-channels','true');
     epgReload.disabled=true;
     if(!epgReload.hasAttribute('aria-describedby')){
      epgReload.setAttribute('aria-describedby','epgGuide');
      epgReload.setAttribute('data-positron-epg-described','true');
     }
    }
   }else if(epgReload.getAttribute('data-positron-epg-no-channels')==='true'){
    epgReload.removeAttribute('data-positron-epg-no-channels');
    if(epgReload.getAttribute('data-positron-epg-described')==='true'){
     epgReload.removeAttribute('aria-describedby');
     epgReload.removeAttribute('data-positron-epg-described');
    }
    if(!byId('epgLoadBtn')?.disabled)epgReload.disabled=false;
   }
  };
  new MutationObserver(syncReloadAvailability).observe(epgChannelCount,{childList:true,subtree:true,characterData:true});
  new MutationObserver(syncReloadAvailability).observe(epgReload,{attributes:true,attributeFilter:['disabled']});
  syncReloadAvailability();
 }

 // P5.1.52: On the verified P5.1.51 EPG 720px screenshot the advanced
 // programme search, mapping and offset tools occupy space before any guide
 // exists. Keep their original nodes, handlers and user-entered values,
 // and reveal them as soon as the native EPG summary refreshes with data.
 const epgPage=byId('page-epg'),epgSummary=byId('epgSummary');
 if(epgPage&&epgSummary){
  const syncEpgToolVisibility=()=>{
   const guide=window.IPTVExtras?.getGuide?.();
   const hasProgrammes=Array.isArray(guide?.programmes)&&guide.programmes.length>0;
   const wasCollapsed=epgPage.hasAttribute('data-positron-no-epg-programmes');
   epgPage.toggleAttribute('data-positron-no-epg-programmes',!hasProgrammes);
   // A guide can finish loading while this page stays open. Refresh the
   // original advanced-search result so it no longer says "no EPG data".
   if(hasProgrammes&&wasCollapsed&&epgPage.classList.contains('active-page')){
    window.IPTVProAdvanced?.onPage?.('epg');
   }
  };
  new MutationObserver(syncEpgToolVisibility).observe(epgSummary,{childList:true,subtree:true,characterData:true});
  syncEpgToolVisibility();
 }

 window.OpenIPTVPositronTwenty=Object.freeze({
  setStage,getStage:()=>stage,getFeedback:()=>previous
 });
})();
