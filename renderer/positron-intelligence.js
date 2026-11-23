'use strict';
/* WatchFlow Intelligence: explicit, local ML opt-in; Wikipedia lookup only on click.
 * Uses existing IPTVState and XMLTV resolver. No automatic channel playback.
 */
(()=>{
 const d=document,win=window,core=win.PositronIntelligenceCore,byId=id=>d.getElementById(id);
 const panel=byId('poWatchFlowPanel'),toolbar=panel?.querySelector('.po-flowplus-nav');
 if(!core||!panel||!toolbar||!win.IPTVState?.getChannels)return;
 const KEY='positron-intelligence-preferences-v1',WEB_KEY='positron-intelligence-web-v1';
 const state=()=>win.IPTVState,channels=()=>state()?.getChannels?.()||[];
 const guide=()=>{try{return win.IPTVExtras?.getGuide?.()||null;}catch{return null;}};
 const load=(key)=>{try{return JSON.parse(win.localStorage.getItem(key)||'null');}catch{return null;}};
 let record=load(KEY);
 let enabled=record?.enabled===true,model=core.sanitizedModel(record?.model),bandit=core.sanitizedBandit(record?.bandit),categoryModel=core.sanitizedCategoryModel(record?.categoryModel),active=null,aiOpen=false;
 let alertEnabled=enabled&&record?.alertEnabled===true;const notified=new Set();
 const taughtIds=new Set((Array.isArray(record?.taughtIds)?record.taughtIds:[]).slice(-1000)
  .filter(x=>typeof x==='string'&&x.length<=160));
 let activeStatusMessage='',activeTeachIndex=0;const sessionSkippedIds=new Set();
  // P281: retain one reversible Naive Bayes training snapshot, only in RAM.
  let lastActiveTeachUndo=null;
 let web=load(WEB_KEY);if(!web||typeof web!=='object'||Array.isArray(web))web={};
 const webValid=()=>{
  const live={};const now=Date.now();
  for(const [name,item] of Object.entries(web).slice(-90)){
   if(item&&item.at&&now-item.at<30*86400000&&item.data?.articleUrl&&item.data?.title)
    live[name]=item.data;
  }
  return live;
 };
 const save=()=>{try{win.localStorage.setItem(KEY,JSON.stringify({enabled,alertEnabled,model,bandit,categoryModel,taughtIds:[...taughtIds].slice(-1000)}));return true;}catch{return false;}};
 const saveWeb=()=>{try{
  const entries=Object.entries(web).sort((a,b)=>(b[1]?.at||0)-(a[1]?.at||0)).slice(0,60);
  web=Object.fromEntries(entries);win.localStorage.setItem(WEB_KEY,JSON.stringify(web));return true;
 }catch{return false;}};
 const tab=d.createElement('button');
 tab.type='button';tab.id='poFlowPlusAI';tab.className='po-ai-tab';
 tab.textContent='✦ AI hợp gu';tab.title='Học sở thích xem và phân loại theo EPG';
 tab.setAttribute('aria-label','WatchFlow Intelligence: học máy sở thích và chủ đề theo EPG');
 tab.setAttribute('aria-pressed','false');
 const aiSlot=d.createElement('div');aiSlot.id='poAIEntry';aiSlot.className='po-ai-entry';
 // P310: user-controlled wide view, no changes to learned weights or M3U.
 let wideAI=false;
 const wideButton=d.createElement('button');wideButton.type='button';wideButton.id='poAIWide';
 wideButton.textContent='Đọc rộng';wideButton.title='Mở rộng báo cáo AI trên desktop';
 wideButton.hidden=true;wideButton.setAttribute('aria-pressed','false');
 aiSlot.append(tab,wideButton);toolbar.after(aiSlot);
 const area=d.createElement('section');area.id='poIntelligenceResults';area.className='po-ai-panel';
 area.hidden=true;area.setAttribute('aria-live','polite');
 panel.querySelector('#poFlowPlusResults')?.after(area);
 // P321: local, accessible navigation back to the AI overview after scrolling
 // a long model explanation. No playback, learning, or playlist mutation.
 const backTop=d.createElement('button');backTop.type='button';
 backTop.id='poAIBackTop';backTop.textContent='↑ Đầu AI';
 backTop.title='Về đầu bảng WatchFlow AI';
 backTop.setAttribute('aria-label','Về đầu bảng WatchFlow AI');
 backTop.hidden=true;
 panel.querySelector('.po-watchflow-head #poWatchFlowClose')?.before(backTop);
 const syncAIBackTop=()=>{backTop.hidden=panel.hidden||!aiOpen||panel.scrollTop<=120;};
 panel.addEventListener('scroll',syncAIBackTop,{passive:true});
 backTop.addEventListener('click',()=>{
  if(!aiOpen||panel.hidden)return;
  panel.scrollTop=0;syncAIBackTop();tab.focus({preventScroll:true});
 });

 const title=d.createElement('div');title.className='po-ai-heading';
 const name=d.createElement('h3');name.textContent='WatchFlow Intelligence';
 const desc=d.createElement('p');desc.textContent='AI học trực tuyến trên thiết bị · Phân loại chương trình từ EPG thật · Tra cứu Wikipedia khi bạn yêu cầu';
 title.append(name,desc);
 const controls=d.createElement('div');controls.className='po-ai-controls';
 const checkLabel=d.createElement('label');checkLabel.className='po-ai-check';
 const check=d.createElement('input');check.type='checkbox';check.id='poAIMLConsent';check.checked=enabled;
 const checkText=d.createElement('span');checkText.textContent='Bật học sở thích từ thời lượng xem và phản hồi';
 checkLabel.append(check,checkText);
 const clear=d.createElement('button');clear.type='button';clear.id='poAIReset';
 clear.textContent='Quản lý mô hình';clear.title='Xem các mô hình học AI, dung lượng và chọn dữ liệu muốn xóa';clear.setAttribute('aria-expanded','false');
 controls.append(checkLabel,clear);
 // P276: Three built-in, locally learned algorithms (no external model download).
 const modelManager=d.createElement('details');modelManager.id='poAIModelManager';modelManager.className='po-ai-model-manager';
 modelManager.hidden=true;modelManager.open=true; // Open only after explicit user request, outside recommendation flow.
 const modelToggle=d.createElement('summary');modelToggle.textContent='Mô hình AI trên máy';
 const modelRows=d.createElement('div');modelRows.className='po-ai-model-rows';modelRows.id='poAIModelRows';
 const modelStatus=d.createElement('p');modelStatus.className='po-ai-model-status';modelStatus.id='poAIModelStatus';
 modelStatus.setAttribute('role','status');modelStatus.setAttribute('aria-live','polite');
 // P318: show all three model differences where the backup is actually selected.
 const modelDiagnostics=d.createElement('section');modelDiagnostics.id='poAIModelVerifyDiagnostics';
 modelDiagnostics.className='po-ai-verify-diagnostics';modelDiagnostics.hidden=true;
 modelDiagnostics.setAttribute('role','group');
 modelDiagnostics.setAttribute('aria-label','Chi tiết khác biệt của ba mô hình AI');
 const modelHint=d.createElement('small');modelHint.textContent='Tiêu chuẩn và Smart tích hợp sẵn, không cần tải. Xóa trọng số học không xóa nguồn, kênh hoặc EPG.';
 const backup=d.createElement('button');backup.type='button';backup.id='poAIBackup';
 backup.className='po-ai-backup';backup.textContent='Sao lưu mô hình AI (.json)';
 backup.title='Tải các trọng số học AI về máy; không có playlist hoặc URL';
 // P313: verify the actual reselected file, never infer download success from anchor click.
 let lastBackupSnapshot=null,lastVerifyDetails=null;
 // P317: old AI backups can be checked against currently loaded local ML after restart.
 const verifyBackup=d.createElement('button');verifyBackup.type='button';verifyBackup.id='poAIVerifyBackup';
 verifyBackup.className='po-ai-backup po-ai-verify';verifyBackup.hidden=false;
 verifyBackup.textContent='Đối chiếu JSON với AI đang dùng (chỉ đọc)';
 verifyBackup.title='Đối chiếu bản sao cũ với mô hình hiện tại, không nhập hay thay dữ liệu';
 const verifyFile=d.createElement('input');verifyFile.type='file';verifyFile.id='poAIVerifyBackupFile';
 verifyFile.hidden=true;verifyFile.accept='.json,application/json';
 verifyFile.setAttribute('aria-label','Chọn lại tệp JSON vừa tải để kiểm tra trọng số AI');
 const importButton=d.createElement('button');importButton.type='button';importButton.id='poAIImport';
 importButton.className='po-ai-import';importButton.textContent='Khôi phục mô hình AI (.json)';
 importButton.title='Chọn bản sao AI đã xuất; chỉ thay trọng số khi xác nhận';
 const importFile=d.createElement('input');importFile.type='file';importFile.id='poAIImportFile';
 importFile.accept='.json,application/json';importFile.hidden=true;
 importFile.setAttribute('aria-label','Chọn tệp sao lưu mô hình AI JSON');
 const importPreview=d.createElement('section');importPreview.id='poAIImportPreview';
 importPreview.className='po-ai-compare';importPreview.hidden=true;
 importPreview.setAttribute('aria-label','So sánh trọng số học AI hiện tại với tệp sao lưu');
 const importConfirm=d.createElement('button');importConfirm.type='button';importConfirm.id='poAIImportConfirm';
 importConfirm.className='po-ai-import-confirm';importConfirm.hidden=true;
 importConfirm.textContent='Xác nhận khôi phục trọng số AI';
 const undoImport=d.createElement('button');undoImport.type='button';undoImport.id='poAIUndoImport';
 undoImport.className='po-ai-undo-import';undoImport.hidden=true;
 undoImport.textContent='Hoàn tác lần khôi phục AI vừa rồi';
 undoImport.title='Hoàn tác trọng số AI gần nhất trong phiên, không sửa playlist';
 const bulk=d.createElement('button');bulk.type='button';bulk.id='poAIClearAll';
 bulk.className='po-ai-clear-all';bulk.textContent='Xóa toàn bộ dữ liệu học';bulk.title='Xóa tất cả ba mô hình học sau khi xác nhận hai lần';
 modelManager.append(modelToggle,modelRows,backup,verifyBackup,verifyFile,importButton,importFile,importPreview,importConfirm,undoImport,bulk,modelStatus,modelDiagnostics,modelHint);
 let pendingModel='',pendingAt=0;
 const modelBytes=value=>new TextEncoder().encode(JSON.stringify(value||{})).byteLength;
 const learnedInventory=()=>[
  {id:'preference',name:'Tiêu chuẩn · Gợi ý sở thích (Logistic ML)',count:model.observations,unit:'phản hồi',data:model},
  {id:'category',name:'Smart · Phân loại chủ đề (Naive Bayes)',count:categoryModel.examples,unit:'nhãn',data:categoryModel},
  {id:'explore',name:'Smart · Khám phá (UCB)',count:Object.values(bandit).reduce((n,v)=>n+Math.max(0,Number(v?.visits??v)||0),0),unit:'quan sát',data:bandit}
 ];
 const confirmDelete=(key,button,action,label)=>{
  const now=Date.now();
  if(pendingModel!==key||now-pendingAt>12000){
   pendingModel=key;pendingAt=now;button.textContent='Xác nhận xóa';
   modelStatus.textContent='Bấm “Xác nhận xóa” lần nữa trong 12 giây để xóa '+label+'.';return;
  }
  pendingModel='';pendingAt=0;action();
  const stored=save();render();
  modelStatus.textContent=stored?'Đã xóa '+label+'. Playlist, EPG và Favorites vẫn giữ nguyên.':
   'Đã xóa trong phiên nhưng không lưu được thay đổi; kiểm tra quyền lưu.';
  state()?.toast?.(modelStatus.textContent,stored?'info':'warn');
 };
 function renderModelManager(){
  const models=learnedInventory();modelRows.replaceChildren();
  for(const item of models){
   const row=d.createElement('div');row.className='po-ai-model-row';
   const left=d.createElement('div');left.className='po-ai-model-copy';
   const title=d.createElement('strong');title.textContent=item.name;
   const subtitle=d.createElement('small');
   subtitle.textContent=item.count+' '+item.unit+' · '+modelBytes(item.data)+' byte · '+(item.count?'Đã có dữ liệu học':'Chưa học');
   left.append(title,subtitle);
   const remove=d.createElement('button');remove.type='button';remove.dataset.modelDelete=item.id;
   remove.textContent=pendingModel===item.id&&Date.now()-pendingAt<=12000?'Xác nhận xóa':'Xóa mô hình';
   remove.disabled=!item.count;remove.title=item.count?'Xóa trọng số riêng của mô hình này':'Chưa có dữ liệu để xóa';
   remove.addEventListener('click',()=>{
    if(!item.count)return;
    confirmDelete(item.id,remove,()=>{
     if(item.id==='preference'){model=core.emptyModel();active=null;notified.clear();}
     if(item.id==='category'){categoryModel=core.emptyCategoryModel();taughtIds.clear();activeStatusMessage='';lastActiveTeachUndo=null;}
     if(item.id==='explore')bandit={};
    },item.name);
   });
   row.append(left,remove);modelRows.append(row);
  }
  modelToggle.textContent='Mô hình AI trên máy · '+models.length+' thuật toán · '+models.reduce((n,x)=>n+modelBytes(x.data),0)+' byte';
  backup.disabled=!models.some(x=>x.count>0);bulk.disabled=!models.some(x=>x.count>0);bulk.textContent=pendingModel==='all'?'Xác nhận xóa':'Xóa toàn bộ dữ liệu học';
 }
 const modeBar=d.createElement('div');modeBar.className='po-ai-modes';
 const channelsMode=d.createElement('button');channelsMode.type='button';channelsMode.id='poAIChannels';
 channelsMode.textContent='Kênh hợp gu';channelsMode.setAttribute('aria-pressed','true');
 const upcomingMode=d.createElement('button');upcomingMode.type='button';upcomingMode.id='poAIUpcoming';
 upcomingMode.textContent='Lịch EPG hợp gu';upcomingMode.setAttribute('aria-pressed','false');
 const planMode=d.createElement('button');planMode.type='button';planMode.id='poAIPlan';
 planMode.textContent='Lịch AI 24h';planMode.setAttribute('aria-pressed','false');

 const exploreMode=d.createElement('button');exploreMode.type='button';exploreMode.id='poAIExplore';
 exploreMode.textContent='Khám phá AI';exploreMode.setAttribute('aria-pressed','false');exploreMode.disabled=!enabled;
 modeBar.append(channelsMode,upcomingMode,planMode,exploreMode);
 let upcomingOpen=false,planOpen=false,exploreOpen=false,foldersOpen=false,programmesOpen=false;
 let programmeQuery='';
 channelsMode.addEventListener('click',()=>{upcomingOpen=false;planOpen=false;exploreOpen=false;foldersOpen=false;programmesOpen=false;render();});
 upcomingMode.addEventListener('click',()=>{upcomingOpen=true;planOpen=false;exploreOpen=false;foldersOpen=false;programmesOpen=false;render();});
 planMode.addEventListener('click',()=>{upcomingOpen=false;planOpen=true;exploreOpen=false;foldersOpen=false;programmesOpen=false;render();});
 exploreMode.addEventListener('click',()=>{if(!enabled)return;upcomingOpen=false;planOpen=false;exploreOpen=true;foldersOpen=false;programmesOpen=false;render();});
 const foldersMode=d.createElement('button');foldersMode.type='button';foldersMode.id='poAIEPGFolders';
 foldersMode.textContent='Thư mục EPG';foldersMode.setAttribute('aria-pressed','false');
 modeBar.append(foldersMode);
 foldersMode.addEventListener('click',()=>{upcomingOpen=false;planOpen=false;exploreOpen=false;foldersOpen=true;programmesOpen=false;render();});
 const programmesMode=d.createElement('button');programmesMode.type='button';programmesMode.id='poAIEPGProgrammes';
 programmesMode.textContent='Chương trình EPG';programmesMode.setAttribute('aria-pressed','false');
 modeBar.append(programmesMode);
 programmesMode.addEventListener('click',()=>{upcomingOpen=false;planOpen=false;exploreOpen=false;foldersOpen=false;programmesOpen=true;render();});
 const alertRow=d.createElement('label');alertRow.className='po-ai-alerts';
 const alertCheck=d.createElement('input');alertCheck.type='checkbox';alertCheck.id='poAIAlerts';
 alertCheck.checked=alertEnabled;alertCheck.disabled=!enabled;
 const alertLabel=d.createElement('span');
 alertLabel.textContent='Nhắc trong ứng dụng khi AI tìm thấy chương trình hợp gu sắp phát (không tự mở kênh)';
 alertRow.append(alertCheck,alertLabel);
 const summary=d.createElement('p');summary.className='po-ai-summary';summary.id='poAISummary';
 const list=d.createElement('div');list.id='poAICards';list.className='po-ai-cards';
 const privacy=d.createElement('p');privacy.className='po-ai-privacy';
 privacy.textContent='Mặc định KHÔNG học. Khi bật: chỉ lưu trọng số sở thích trong máy; học sau ≥35 giây phát có hình/tiếng, không tải stream hay lịch sử lên mạng. Tra cứu web chỉ gửi tên kênh, không gửi playlist/URL/hành vi. Bạn có thể xóa mô hình.';
 area.append(title,controls,alertRow,modeBar,summary,list,privacy,modelManager);

 // P322: context-aware accessible header; preserve native wording for non-AI.
 const watchTitle=byId('poWatchFlowTitle'),watchKicker=panel.querySelector('.po-watchflow-kicker');
 const originalWatchTitle=watchTitle?.textContent||'Xem gì bây giờ?';
 const originalWatchKicker=watchKicker?.textContent||'KHÁM PHÁ KÊNH CỦA BẠN';
 const syncWatchHeader=()=>{
  const isAI=aiOpen&&!panel.hidden;
  if(watchTitle)watchTitle.textContent=isAI?'AI hợp gu':originalWatchTitle;
  if(watchKicker)watchKicker.textContent=isAI?'WATCHFLOW INTELLIGENCE':originalWatchKicker;
 };
 const extras=[panel.querySelector('.po-watchflow-modes'),panel.querySelector('.po-watchflow-subhead'),
  byId('poWatchFlowResults'),panel.querySelector('.po-watchflow-note')].filter(Boolean);
 const originals=[byId('poFlowPlusResults'),byId('poWatchLaterSearchRow'),panel.querySelector('.po-flowplus-privacy')].filter(Boolean);
 // Native WatchFlow Plus refreshes Mix on every reopen, which previously
 // surfaced five non-AI cards above the AI panel. Re-apply the exclusive
 // panel mode on reopen AND enforce it in CSS so an async refresh cannot
 // shadow AI controls underneath a scrollable card list.
 function syncAIView(){
  if(!aiOpen||panel.hidden)return;
  panel.dataset.poAiActive='true';panel.dataset.poAiWide=String(wideAI);
  wideButton.hidden=false;area.hidden=false;
  tab.setAttribute('aria-pressed','true');
  for(const button of toolbar.querySelectorAll('button[data-flowplus-mode]'))button.setAttribute('aria-pressed','false');
  for(const el of extras)el.classList.add('po-flowplus-hidden');
  for(const el of originals)el.hidden=true;
  panel.scrollTop=0;syncAIBackTop();syncWatchHeader();
 }
 function showAI(){aiOpen=true;syncAIView();render();}
 function hideAI(){
  aiOpen=false;wideAI=false;wideButton.hidden=true;
  wideButton.setAttribute('aria-pressed','false');wideButton.textContent='Đọc rộng';
  delete panel.dataset.poAiActive;delete panel.dataset.poAiTraining;
  delete panel.dataset.poAiWide;area.hidden=true;
  tab.setAttribute('aria-pressed','false');syncAIBackTop();syncWatchHeader();
 }
 wideButton.addEventListener('click',()=>{
  if(!aiOpen||panel.hidden)return;
  wideAI=!wideAI;panel.dataset.poAiWide=String(wideAI);
  wideButton.setAttribute('aria-pressed',String(wideAI));
  wideButton.textContent=wideAI?'Thu gọn':'Đọc rộng';
 });
 // P328: direct TV-only WatchFlow AI keyboard access without new buttons.
 tab.setAttribute('aria-keyshortcuts','F6 Alt+Shift+W');
 tab.title=(tab.title?tab.title+' · ':'')+'Phím tắt: F6 hoặc Alt+Shift+W';
 d.addEventListener('keydown',event=>{
  const f6=event.key==='F6'&&!event.altKey&&!event.shiftKey&&!event.ctrlKey&&!event.metaKey;
  const chord=event.altKey&&event.shiftKey&&!event.ctrlKey&&!event.metaKey&&
   (event.code==='KeyW'||String(event.key).toLowerCase()==='w');
  if((!f6&&!chord)||event.defaultPrevented||event.repeat||event.isComposing)return;
  // P330: guard plaintext-only and empty contenteditable fields, preserving P328 input checks.
  if([event.target,d.activeElement].some(el=>el?.isContentEditable||el?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable],[role="textbox"]')))return;
  if(!byId('page-tv')?.classList.contains('active-page'))return;
  // Never stack WatchFlow AI above the native source or Cast dialog.
  if(d.querySelector('.modal-backdrop:not(.hidden):not([hidden])'))return;
  const palette=byId('positronPalette');
  if(palette&&!palette.hidden)return;
  event.preventDefault();event.stopPropagation();
  // P329: a second shortcut dismisses the visible AI panel and returns focus.
  // Never toggle playback, the AI preference model, or a source playlist.
  if(!panel.hidden&&aiOpen){
   win.PositronWatchFlow?.close?.();
   const opener=byId('poWatchFlowToggle');
   if(panel.hidden&&opener?.getClientRects().length)
    opener.focus({preventScroll:true});
   return;
  }
  if(panel.hidden)win.PositronWatchFlow?.open?.();
  if(panel.hidden)return;
  if(!aiOpen)showAI();
  else syncAIView();
  tab.focus({preventScroll:true});
 });
 tab.addEventListener('click',()=>{if(aiOpen){toolbar.querySelector('[data-flowplus-mode="discover"]')?.click();return;}showAI();});
 toolbar.addEventListener('click',event=>{if(event.target.closest('[data-flowplus-mode]'))hideAI();},true);
 const learnedSource=(channel,cache=null)=>{
  const sources=cache||webValid(),wiki=sources[String(channel.name)];
  if(wiki)return wiki;
  if(!enabled)return null;
  return core.predictCategory(categoryModel,channel);
 };
 const metadata=(channel)=>core.topicFor(channel,guide(),win.IPTVGuide,Date.now(),learnedSource(channel));
 const profileFor=(collection)=>{
  const result=webValid();
  if(enabled)for(const channel of collection){
   const name=String(channel.name);
   if(result[name])continue;
   const predicted=core.predictCategory(categoryModel,channel);
   if(predicted)result[name]=predicted;
  }
  return result;
 };
 function feedback(channel,label,programmeTopic=null,programmeStart=0){
  if(!enabled){state()?.toast?.('Bật học sở thích trước khi đánh giá kênh','info');return;}
  const topic=programmeTopic||metadata(channel);
  const when=Number.isFinite(programmeStart)&&programmeStart>0?new Date(programmeStart):new Date();
  const vector=core.features(channel,topic,when);
  model=core.learn(model,vector,label);bandit=core.observeBandit(bandit,topic.key);
  if(!save())state()?.toast?.('Không lưu được sở thích trên thiết bị','warn');
  render();
 }



 // P275: EPG topic indexing runs once for each source/guide signature,
 // rather than every render, navigation update or new AI notification.
 // No playlist, stream address or viewing history is cached.
 const indexCache={key:'',folders:null,programmes:null,folderScans:0,programmeScans:0};
 let scanNotice='';
 const channelSignature=collection=>(Array.isArray(collection)?collection:[]).map(c=>
  [c?.id,c?.name,c?.group,c?.groupTitle].join(':')).join('\u001f');
 function guideSignature(g){
  if(!g)return 'no-epg';
  const list=g.programmes;
  const size=Array.isArray(list)?list.length:(list&&typeof list==='object'?Object.keys(list).length:0);
  const first=Array.isArray(list)?list[0]:null,last=Array.isArray(list)?list[list.length-1]:null;
  const hint=x=>[x?.id,x?.channel,x?.start,x?.end,x?.title].join(':');
  return [g.version,g.updatedAt,g.loadedAt,g.revision,size,hint(first),hint(last)].join('|');
 }
 function indexed(kind,collection){
  const g=guide(),clock=Date.now();
  const key=channelSignature(collection)+'||'+guideSignature(g)+'||'+Math.floor(clock/3600000);
  if(indexCache.key!==key){
   if(indexCache.key)scanNotice='';
   indexCache.key=key;indexCache.folders=null;indexCache.programmes=null;
  }
  if(kind==='folders'){
   if(!indexCache.folders){
    indexCache.folders=core.epgFolders(collection,g,win.IPTVGuide,{clock});
    indexCache.folderScans++;
   }
   return indexCache.folders;
  }
  if(!indexCache.programmes){
   indexCache.programmes=core.programmeFolders(collection,g,win.IPTVGuide,{clock,hours:24});
   indexCache.programmeScans++;
  }
  return indexCache.programmes;
 }
 function scanTools(){
  const box=d.createElement('div');box.className='po-ai-scan-tools';
  const btn=d.createElement('button');btn.type='button';btn.id='poAIRescan';
  btn.textContent='Quét lại EPG';btn.title='Làm mới chỉ mục chủ đề theo EPG hiện đã nạp; không tải Internet';
  btn.addEventListener('click',()=>{
   indexCache.key='';indexCache.folders=null;indexCache.programmes=null;
   scanNotice='Đã quét lại từ EPG trên máy';
   render();byId('poAIRescan')?.focus();
  });
  const status=d.createElement('small');
  status.textContent=scanNotice||'Chỉ mục tự làm mới khi nguồn, EPG hoặc thời điểm đổi';
  box.append(btn,status);list.append(box);
 }

 function renderEPGProgrammes(collection){
  const catalog=indexed('programmes',collection);
  summary.textContent='Chương trình EPG 24h · '+catalog.total+' chương trình · '+
   catalog.groups.length+' chủ đề · '+catalog.scanned+' kênh đã kiểm tra';
  const note=d.createElement('p');note.className='po-ai-privacy';
  note.textContent='Tên và giờ phát thực tế từ XMLTV đã nạp. Một chương trình có thể ở nhiều chủ đề; không tải thêm dữ liệu Internet.';
  list.append(note);scanTools();
  const row=d.createElement('label');row.className='po-ai-programme-search';
  const lab=d.createElement('span');lab.textContent='Tìm trong lịch EPG';
  const search=d.createElement('input');search.type='search';search.id='poAIProgrammeSearch';
  search.placeholder='Tên chương trình, kênh hoặc chủ đề…';
  search.setAttribute('aria-label','Tìm chương trình EPG không dấu, theo kênh hoặc chủ đề');
  search.maxLength=160;search.value=programmeQuery;
  row.append(lab,search);
  const resultArea=d.createElement('div');resultArea.className='po-ai-programme-results';
  list.append(row,resultArea);
  const add=(key,label,items,open)=>{
   const folder=d.createElement('details');folder.className='po-ai-folder po-ai-programme-folder';
   folder.dataset.programmeTopic=key;folder.open=open;
   const heading=d.createElement('summary');heading.textContent=label+' · '+items.length+' chương trình';
   folder.append(heading);
   const rows=d.createElement('div');rows.className='po-ai-folder-items';
   for(const item of items){
    const row=d.createElement('div');row.className='po-ai-folder-row';
    const when=new Date(item.programme.start).toLocaleString('vi-VN',
     {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    const title=d.createElement('strong');title.textContent=when+' · '+item.programme.title;
    const channel=d.createElement('small');channel.textContent=item.channel.name;
    const play=d.createElement('button');play.type='button';play.className='po-ai-folder-channel';
    play.textContent='▶ Xem kênh';
    play.setAttribute('aria-label','Xem '+item.channel.name+' có chương trình '+item.programme.title);
    play.addEventListener('click',()=>{
     if(!channels().some(c=>String(c.id)===String(item.channel.id)))return render();
     win.PositronWatchFlow?.close?.();state()?.setPage?.('tv');
     Promise.resolve(state()?.playChannel?.(item.channel.id)).catch(()=>state()?.toast?.('Không thể phát kênh','error'));
    });
    row.append(title,channel,play);rows.append(row);
   }
   folder.append(rows);resultArea.append(folder);
  };
  const paint=()=>{
   resultArea.replaceChildren();
   if(programmeQuery.trim()){
    const match=core.searchProgrammes(catalog,programmeQuery,{limit:160});
    const count=d.createElement('p');count.className='po-ai-privacy';
    count.textContent='Tìm được '+match.total+' chương trình từ XMLTV'+
     (match.truncated?' · hiển thị 160 kết quả đầu':'')+' · sắp theo giờ phát';
    resultArea.append(count);
    if(match.items.length)add('search','Kết quả tìm kiếm',match.items,true);
    else{
     const empty=d.createElement('p');empty.className='po-ai-empty';
     empty.textContent='Không tìm thấy chương trình phù hợp trong EPG 24 giờ tới.';
     resultArea.append(empty);
    }
    return;
   }
   for(const [i,group] of catalog.groups.entries())add(group.key,group.label,group.items,i===0);
   if(catalog.uncategorized.length)add('other','Chương trình chưa rõ chủ đề',catalog.uncategorized,false);
   if(!catalog.total){
    const empty=d.createElement('p');empty.className='po-ai-empty';
    empty.textContent='Chưa có chương trình XMLTV hợp lệ trong 24 giờ tới; hãy nhập EPG để khám phá theo chủ đề.';
    resultArea.append(empty);
   }
  };
  search.addEventListener('input',()=>{programmeQuery=search.value.slice(0,160);paint();});
  paint();
  if(catalog.truncated){
   const warning=d.createElement('p');warning.className='po-ai-privacy';
   warning.textContent='Đã đạt giới hạn chương trình để giữ ứng dụng phản hồi; không tải thêm nguồn hay tự phát.';
   list.append(warning);
  }
 }

 function renderEPGFolders(collection){
  const catalog=indexed('folders',collection);
  summary.textContent='Thư mục EPG ảo · '+catalog.groups.length+' chủ đề · '+catalog.scanned+
   ' kênh được rà soát · '+catalog.uncategorized.length+' chưa đủ chủ đề';
  const notice=d.createElement('p');notice.className='po-ai-privacy';
  notice.textContent='Tự phân nhóm từ tên và mô tả chương trình XMLTV đã nạp. Một kênh có thể thuộc nhiều chủ đề; không sửa playlist, không tự tải Internet hay tự phát.';
  list.append(notice);scanTools();
  const addFolder=(key,label,items,open)=>{
   const folder=d.createElement('details');folder.className='po-ai-folder';folder.dataset.topic=key;
   folder.open=open;
   const heading=d.createElement('summary');heading.textContent=label+' · '+items.length+' kênh';
   folder.append(heading);
   const rows=d.createElement('div');rows.className='po-ai-folder-items';
   for(const item of items){
    const ch=item.channel,entry=d.createElement('button');
    entry.type='button';entry.className='po-ai-folder-channel';
    entry.textContent=ch.name;entry.title='Chọn phát kênh '+ch.name;
    entry.setAttribute('aria-label','Xem kênh '+ch.name+' trong chủ đề '+label);
    entry.addEventListener('click',()=>{
     if(!channels().some(c=>String(c.id)===String(ch.id)))return render();
     win.PositronWatchFlow?.close?.();state()?.setPage?.('tv');
     Promise.resolve(state()?.playChannel?.(ch.id)).catch(()=>state()?.toast?.('Không thể phát kênh','error'));
    });
    const meta=d.createElement('small');
    meta.textContent=item.topic?.nowTitle?'Đang chiếu: '+item.topic.nowTitle:
     item.topic?.nextTitle?'Sắp tới: '+item.topic.nextTitle:'Chưa có chương trình phù hợp trong khung giờ';
    const wrap=d.createElement('div');wrap.className='po-ai-folder-row';wrap.append(entry,meta);rows.append(wrap);
   }
   // P277: learn only after explicit selection. Preserve EPG virtual folders and M3U playlist.
   if(key==='other'&&enabled){
    const candidates=core.rankUnclassified(items,categoryModel,{limit:5,excludeIds:[...taughtIds,...sessionSkippedIds]});
    const trainer=d.createElement('section');trainer.id='poAIActiveLearning';trainer.className='po-ai-active-learning';
    // P309: return to pending import review without ever applying its weights.
    if(panel.dataset.poAiTraining==='true'&&pendingLearningImport&&!importPreview.hidden){
     const returnToImport=d.createElement('button');returnToImport.type='button';returnToImport.id='poAIBackToImport';
     returnToImport.textContent='← Trở lại kiểm tra bản sao AI';
     returnToImport.title='Xem lại bản so sánh trước khi chọn khôi phục; dữ liệu vẫn chưa được áp dụng';
     returnToImport.addEventListener('click',()=>{
      delete panel.dataset.poAiTraining;
      upcomingOpen=false;planOpen=false;exploreOpen=false;foldersOpen=false;programmesOpen=false;
      render();
      importPreview.scrollIntoView({block:'center',behavior:'instant'});
      (byId('poAIConfidenceGapExamples')?.querySelector('summary')||importConfirm)?.focus({preventScroll:true});
     });
     trainer.append(returnToImport);
    }

    const heading=d.createElement('strong');heading.textContent='Dạy AI nhanh · '+candidates.length+' kênh ưu tiên'+(sessionSkippedIds.size?' · '+sessionSkippedIds.size+' đã bỏ qua trong phiên':'');
    const hint=d.createElement('p');hint.textContent='AI ưu tiên tên chưa đủ chắc chắn. Chọn chủ đề đúng để mô hình Naive Bayes học tại máy; không tự thay đổi thư mục gốc.';
    // P312: a failed local model write must not look like AI-training success.
    const failedSave=activeStatusMessage.startsWith('Không lưu được nhãn AI.');
    const status=d.createElement('p');status.id='poAIActiveStatus';
    status.classList.toggle('po-ai-save-error',failedSave||activeStatusMessage.startsWith('Không kiểm chứng được')||activeStatusMessage.startsWith('Tệp sao lưu không khớp'));
    status.setAttribute('role',failedSave?'alert':'status');
    status.setAttribute('aria-live',failedSave?'assertive':'polite');
    // P314: mismatched backup is an actionable warning, not a success toast.
    if(activeStatusMessage.startsWith('Tệp sao lưu không khớp')){
     status.setAttribute('role','alert');status.setAttribute('aria-live','assertive');
    }
    status.tabIndex=-1;status.textContent=activeStatusMessage;
    trainer.append(heading,hint,status);
    if(failedSave){
     const rescue=d.createElement('button');rescue.type='button';rescue.id='poAIActiveBackupRecovery';
     rescue.textContent='Sao lưu trọng số AI đang dùng (.json)';
     rescue.title='Xuất trọng số AI tại máy, không xóa mô hình hay dữ liệu kênh';
     rescue.disabled=backup.disabled;
     rescue.addEventListener('click',()=>{
      modelStatus.textContent='';
      backup.click(); // User-initiated reuse of existing local-only export.
      activeStatusMessage=modelStatus.textContent.includes('Đã yêu cầu')
       ?'Đã yêu cầu tải bản sao trọng số AI (.json). Giữ tệp trước khi dọn bộ nhớ; chưa thử ghi nhãn lại.'
       :'Không thể tạo bản sao AI; mô hình hiện tại vẫn giữ nguyên. Kiểm tra quyền tải tệp rồi thử lại.';
      render();
      const feedback=byId('poAIActiveStatus');
      feedback?.scrollIntoView({block:'center',behavior:'instant'});
      feedback?.focus({preventScroll:true});
     });
     trainer.append(rescue);
    }
    // P313: verification remains available after quota-recovery feedback rerenders.
    if(lastBackupSnapshot){
     const verify=d.createElement('button');verify.type='button';verify.id='poAIActiveVerifyRecovery';
     verify.className='po-ai-backup po-ai-verify';
     verify.textContent='Kiểm tra tệp JSON vừa tải (không nhập mô hình)';
     verify.addEventListener('click',()=>verifyFile.click());
     trainer.append(verify);
    }
    // P314: show independent Logistic / Naive Bayes / UCB diagnostics for a mismatched file.
    if(lastVerifyDetails?.ok&&!lastVerifyDetails.match){
     const diagnostics=d.createElement('div');diagnostics.id='poAIActiveVerifyDiagnostics';
     diagnostics.className='po-ai-verify-diagnostics';
     diagnostics.setAttribute('aria-label','Chẩn đoán ba mô hình AI trong bản sao');
     for(const item of lastVerifyDetails.details){
      const row=d.createElement('div');row.className='po-ai-verify-diagnostic';
      row.dataset.algorithm=item.id;row.dataset.match=String(item.match);
      const name=d.createElement('strong');name.textContent=item.label;
      const result=d.createElement('span');
      result.textContent=(item.match?'Khớp':'Khác')+' · '+item.countBefore+' → '+item.countAfter+
       ' '+item.unit+(!item.match?' · '+item.changedFields+' trường AI thay đổi':'');
      row.append(name,result);diagnostics.append(row);
     }
     trainer.append(diagnostics);
    }
    // P281: undo the latest confirmed label without deleting earlier training data.
    if(lastActiveTeachUndo){
     const undo=d.createElement('button');undo.type='button';undo.id='poAIActiveUndoLabel';
     undo.textContent='Hoàn tác nhãn AI vừa dạy';
     undo.title='Khôi phục trọng số trước khi dạy kênh '+lastActiveTeachUndo.name;
     undo.addEventListener('click',()=>{
      if(!lastActiveTeachUndo)return;
      const previous=lastActiveTeachUndo;lastActiveTeachUndo=null;
      categoryModel=core.sanitizedCategoryModel(previous.model);
      taughtIds.clear();for(const id of previous.taughtIds)taughtIds.add(id);
      activeTeachIndex=0;
      activeStatusMessage='Đã hoàn tác nhãn cho '+previous.name+'; giữ nguyên các nhãn AI cũ.';
      const stored=save();render();
      // Rerender can reset the modal scroll; leave the restored feedback visible.
      byId('poAIActiveStatus')?.scrollIntoView({block:'center',behavior:'instant'});
      if(!stored)state()?.toast?.('Chưa lưu được thao tác hoàn tác nhãn AI','warn');
     });
     trainer.append(undo);
    }
    // P280: session-only exclusions, never persisted as a label or preference.
    if(sessionSkippedIds.size){
     const restore=d.createElement('button');restore.type='button';restore.id='poAIActiveResetSkips';
     restore.textContent='Xem lại '+sessionSkippedIds.size+' kênh đã bỏ qua';
     restore.title='Khôi phục kênh bỏ qua trong phiên, giữ nguyên nhãn AI đã dạy';
     restore.addEventListener('click',()=>{
      sessionSkippedIds.clear();activeTeachIndex=0;
      activeStatusMessage='Đã khôi phục hàng đợi, các nhãn đã dạy được giữ nguyên.';
      render();
     });
     trainer.append(restore);
    }
    if(!candidates.length){
     const empty=d.createElement('p');empty.textContent='Chưa có kênh phù hợp để dạy; đã hoàn thành những kênh ưu tiên hiện có.';trainer.append(empty);
    }
    // P278: teach exactly one uncertainty-ranked channel, then advance.
    // The remaining 500+ channel rows are behind a separate disclosure.
    if(candidates.length){
     const index=activeTeachIndex%candidates.length,suggestion=candidates[index];
     const progress=d.createElement('p');progress.id='poAIActiveProgress';
     progress.textContent='Kênh '+(index+1)+'/'+candidates.length+' · Bạn quyết định chủ đề';
     const row=d.createElement('div');row.className='po-ai-active-row';row.id='poAIActiveRow0';
     const text=d.createElement('span');text.textContent=suggestion.channel.name+' · '+suggestion.reason;
     text.title=text.textContent;
     const actions=d.createElement('div');actions.className='po-ai-active-controls';
     const select=d.createElement('select');select.id='poAIActiveSelect0';select.setAttribute('aria-label','Chủ đề chính xác của '+suggestion.channel.name);
     const placeholder=d.createElement('option');placeholder.value='';placeholder.textContent='Chọn chủ đề…';select.append(placeholder);
     for(const [kind,label] of Object.entries(core.KINDS)){
      if(kind==='other')continue;const opt=d.createElement('option');opt.value=kind;opt.textContent=label;select.append(opt);
     }
     const teach=d.createElement('button');teach.type='button';teach.id='poAIActiveButton0';teach.textContent='Ghi nhãn & tiếp';teach.disabled=true;
     select.addEventListener('change',()=>{teach.disabled=!core.KINDS[select.value]||select.value==='other';});
     teach.addEventListener('click',()=>{
      if(!enabled||!core.KINDS[select.value]||select.value==='other')return;
      const count=categoryModel.examples;
      const previousModel=core.sanitizedCategoryModel(categoryModel),previousTaughtIds=[...taughtIds];
      categoryModel=core.teachCategory(categoryModel,suggestion.channel,select.value);
      if(categoryModel.examples<=count){state()?.toast?.('Không thể học nhãn: cần tên kênh có thông tin','warn');return;}
      taughtIds.add(String(suggestion.channel.id).slice(0,160));
      while(taughtIds.size>1000)taughtIds.delete(taughtIds.values().next().value);
      // P311: keep training state atomic when local model persistence fails.
      const previousUndo=lastActiveTeachUndo;
      if(!save()){
       categoryModel=previousModel;
       taughtIds.clear();for(const id of previousTaughtIds)taughtIds.add(id);
       lastActiveTeachUndo=previousUndo;
       activeStatusMessage='Không lưu được nhãn AI. Mô hình và hàng đợi đã khôi phục như trước; kiểm tra bộ nhớ rồi thử lại.';
       render();
       byId('poAIActiveStatus')?.scrollIntoView({block:'center',behavior:'instant'});
       state()?.toast?.('Nhãn AI chưa được lưu; mô hình đã hoàn tác','warn');
       return;
      }
      lastActiveTeachUndo={model:previousModel,taughtIds:previousTaughtIds,name:String(suggestion.channel.name).slice(0,120)};
      activeStatusMessage='Đã học nhãn '+core.KINDS[select.value]+' cho '+suggestion.channel.name+'.';
      render();
     });
     const skip=d.createElement('button');skip.type='button';skip.id='poAIActiveSkip';skip.textContent='Bỏ qua';
     skip.title='Chuyển sang kênh tiếp theo mà không lưu bất kỳ nhãn nào';
     skip.addEventListener('click',()=>{
      sessionSkippedIds.add(String(suggestion.channel.id).slice(0,160));
      while(sessionSkippedIds.size>1000)sessionSkippedIds.delete(sessionSkippedIds.values().next().value);
      activeTeachIndex=0;
      activeStatusMessage='Đã bỏ qua kênh trong phiên; AI chọn ứng viên khác mà không ghi nhãn.';
      render();
     });
     actions.append(select,teach,skip);row.append(text,actions);trainer.append(progress,row);
      // P282: read-only, opt-in evidence from the local trained Naive Bayes model.
      const explanation=core.explainCategory(categoryModel,suggestion.channel);
      const why=d.createElement('details');why.id='poAIActiveExplain';why.className='po-ai-active-explain';
      const toggle=d.createElement('summary');toggle.textContent='AI dựa vào đâu để gợi ý?';
      toggle.title='Xem số nhãn học, độ tin cậy và từ khóa mô hình đã gặp';
      const modelInfo=d.createElement('p');
      modelInfo.textContent='Đã học '+explanation.examples+' nhãn thuộc '+explanation.kinds+' chủ đề.';
      const result=d.createElement('p');
      result.textContent=explanation.prediction
       ?'Ước lượng: '+core.KINDS[explanation.prediction.key]+' ('+explanation.prediction.confidence+'%). Bạn vẫn quyết định nhãn.'
       :'Chưa đủ bằng chứng từ các nhãn đã xác nhận để dự đoán chủ đề kênh này.';
      const words=d.createElement('small');
      words.textContent=explanation.matches.length
       ?'Từ khóa đã học trùng tên kênh: '+explanation.matches.join(', ')
       :'Không có từ khóa trùng nhãn đã học. AI không tự suy đoán.';
      // P283: measure the training balance rather than pretending the ML is ready.
      const health=core.categoryLearningHealth(categoryModel);
      const healthBox=d.createElement('section');healthBox.id='poAIActiveHealth';
      const healthTitle=d.createElement('strong');
      healthTitle.textContent='Độ phủ dữ liệu AI · '+health.covered+'/'+health.total+' chủ đề';
      const gauge=d.createElement('progress');gauge.max=health.total;gauge.value=health.covered;
      gauge.setAttribute('aria-label','Số chủ đề đã có nhãn AI');
      const concentration=d.createElement('p');
      concentration.textContent=health.examples
       ?'Nhãn đã xác nhận: '+health.examples+' · Chủ đề nhiều mẫu nhất chiếm '+health.concentrated+'%.'
       :'Chưa có nhãn nào được xác nhận.';
      const advice=d.createElement('p');advice.textContent=health.advice;
      const missing=d.createElement('small');
      missing.textContent=health.missing.length
       ?'Chủ đề chưa có ví dụ (chỉ dạy nếu có kênh phù hợp): '+health.missing.map(k=>core.KINDS[k]).join(', ')
       :'Cả chín chủ đề đều đã có nhãn; vẫn cần kiểm chứng độ chính xác.';
      healthBox.append(healthTitle,gauge,concentration,advice,missing);
      why.append(toggle,modelInfo,result,words,healthBox);trainer.append(why);
    }
    folder.append(trainer);

   }
   if(key==='other'&&enabled){
    const channelDisclosure=d.createElement('details');channelDisclosure.className='po-ai-folder-raw';
    const disclosureLabel=d.createElement('summary');
    disclosureLabel.textContent='Xem danh sách đầy đủ '+items.length+' kênh chưa phân loại';
    channelDisclosure.append(disclosureLabel,rows);folder.append(channelDisclosure);
   }else folder.append(rows);
   list.append(folder);
  };
  for(const [index,group] of catalog.groups.entries())
   addFolder(group.key,group.label,group.items,index===0);
  if(!catalog.groups.length){
   const empty=d.createElement('p');empty.className='po-ai-empty';
   empty.textContent='Chưa có nhóm từ chương trình EPG thực. Nhập XMLTV hợp lệ để tự phân loại, không đoán chủ đề khi thiếu dữ liệu.';
   list.append(empty);
  }
  if(catalog.uncategorized.length)addFolder('other','Chưa có chủ đề EPG',catalog.uncategorized,false);
  if(catalog.unscanned){
   const more=d.createElement('p');more.className='po-ai-empty';
   more.textContent='Còn '+catalog.unscanned+' kênh ngoài giới hạn phân tích trong lượt này.';
   list.append(more);
  }
 }

 function render(){
  if(!aiOpen)return;
  if(!foldersOpen)delete panel.dataset.poAiTraining;
  renderModelManager();
  const collection=channels();const profile=profileFor(collection);
  channelsMode.setAttribute('aria-pressed',String(!upcomingOpen&&!planOpen&&!exploreOpen&&!foldersOpen&&!programmesOpen));
  upcomingMode.setAttribute('aria-pressed',String(upcomingOpen));
  planMode.setAttribute('aria-pressed',String(planOpen));
  exploreMode.setAttribute('aria-pressed',String(exploreOpen));exploreMode.disabled=!enabled;
  foldersMode.setAttribute('aria-pressed',String(foldersOpen));
  programmesMode.setAttribute('aria-pressed',String(programmesOpen));
  summary.textContent=(enabled?'● Đang học':'○ Chưa bật học')+(alertEnabled?' · Nhắc lịch AI bật':'')+' · '+model.observations+
   ' phản hồi · '+categoryModel.examples+' nhãn AI · '+collection.length+' kênh · Web chỉ tra khi nhấn';

  // P279: restore nested unclassified lists as well as their EPG parent folders.
  const disclosureKey=el=>{
   if(el.classList.contains('po-ai-folder-raw')){
    const parent=el.closest('details.po-ai-folder');
    return 'raw:'+(parent?.dataset.topic||'');
   }
   return (el.dataset.programmeTopic?'p:':'f:')+(el.dataset.programmeTopic||el.dataset.topic||'');
  };
  const previousOpen=new Map([...list.querySelectorAll('details.po-ai-folder, details.po-ai-folder-raw')]
   .map(el=>[disclosureKey(el),el.open]));
  const restoreFolders=()=>{
   for(const el of list.querySelectorAll('details.po-ai-folder, details.po-ai-folder-raw')){
    const key=disclosureKey(el);
    if(previousOpen.has(key))el.open=previousOpen.get(key);
   }
  };
  list.dataset.mode=(foldersOpen||programmesOpen)?'folders':'cards';
  list.replaceChildren();
  if(!collection.length){
   const empty=d.createElement('p');empty.className='po-ai-empty';
   empty.textContent='Chưa có nguồn IPTV. Hãy thêm playlist hợp lệ và EPG để phân loại, sau đó bật học nếu muốn.';
   list.append(empty);return;
  }
  if(foldersOpen){renderEPGFolders(collection);restoreFolders();return;}
  if(programmesOpen){renderEPGProgrammes(collection);restoreFolders();return;}
  const ranked=exploreOpen
   ?core.exploreWithBandit(collection,guide(),win.IPTVGuide,model,profile,bandit,{limit:8,clock:Date.now()})
   :planOpen
   ?core.planForYou(collection,guide(),win.IPTVGuide,model,profile,{limit:8,clock:Date.now(),hours:24})
   :upcomingOpen
   ?core.upcomingForYou(collection,guide(),win.IPTVGuide,model,profile,{limit:8,clock:Date.now(),hours:8})
   :core.recommend(collection,guide(),win.IPTVGuide,model,profile,
    {limit:8,clock:Date.now(),excludeId:''});
  if((upcomingOpen||planOpen)&&!ranked.length){
   const empty=d.createElement('p');empty.className='po-ai-empty';
   empty.textContent=planOpen
    ?'Chưa có lịch 24 giờ tới từ EPG đã nhập. Hãy tải XMLTV hợp lệ; AI không tự đoán lịch hoặc tự bật kênh.'
    :'Chưa có chương trình sắp phát trong 8 giờ tới từ EPG đã nhập. Hãy tải XMLTV hợp lệ; AI không tự đoán lịch.';
   list.append(empty);return;
  }
  for(const [index,item] of ranked.entries()){
   const ch=item.channel,topic=item.topic;
   const card=d.createElement('article');card.className='po-ai-card';
   const header=d.createElement('div');header.className='po-ai-card-header';
   const chName=d.createElement('strong');chName.textContent=(index+1)+'. '+ch.name;
   const metric=d.createElement('small');
   // P326: a 4-feedback model score is an estimate, not measured accuracy.
   // Keep the ranking unchanged; disclose small-sample uncertainty in text,
   // hover title and accessible name without consuming a new mobile row.
   const earlySample=model.observations>=2&&model.observations<10;
   const scoreText=model.observations>=2?' · '+Math.round(item.probability*100)+'% hợp gu'+
    (earlySample?' (sơ bộ)':''):'';
   metric.textContent=topic.label+' · '+(topic.source==='epg'?'EPG':topic.source==='web'?'Wikipedia':topic.source==='ml'?'AI học nhãn':
    topic.key==='other'?'Chưa rõ chủ đề':'Tên/nhóm')+scoreText;
   if(earlySample){
    const caveat='Điểm hợp gu là ước tính ban đầu từ '+model.observations+
     ' phản hồi; không phải độ chính xác được kiểm chứng.';
    metric.title=caveat;
    metric.setAttribute('aria-label',metric.textContent+'. '+caveat);
    metric.dataset.aiSample='provisional';
   }
   header.append(chName,metric);card.append(header);
   if((upcomingOpen||planOpen)&&item.programme){
    const schedule=d.createElement('p');schedule.className='po-ai-programme';
    const time=new Date(item.programme.start).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    schedule.textContent=(planOpen?new Date(item.programme.start).toLocaleDateString('vi-VN')+' · ':'')+
     time+' · '+item.programme.title;
    schedule.title='Lịch XMLTV, không xác nhận chương trình đang phát: '+item.programme.title;
    card.append(schedule);
   }
   if(topic.nowTitle||topic.nextTitle){
    const onAir=d.createElement('p');onAir.className='po-ai-epg';
    onAir.textContent=topic.nowTitle?'EPG đang chiếu: '+topic.nowTitle:'EPG sắp tới: '+topic.nextTitle;
    card.append(onAir);
   }
   const why=d.createElement('p');why.className='po-ai-why';why.textContent=item.reason;card.append(why);
   // P320: keep essential player/feedback controls above the expandable
   // logistic explanation; a long explanation must never bury the Play button.
   let preferenceDetails=null;
   // P319: actionable, privacy-safe logistic ML explanation, never a made-up EPG reason.
   if(!exploreOpen){
    const explanation=core.explainPreference(model,ch,topic,Date.now(),{limit:3});
    const details=d.createElement('details');details.className='po-ai-preference-explain';
    const toggle=d.createElement('summary');toggle.textContent='Vì sao AI gợi ý?';
    details.append(toggle);
    const note=d.createElement('p');note.textContent=explanation.ready
     ?'Đã học '+explanation.observations+' phản hồi trên máy. '+explanation.note
     :explanation.note;
    details.append(note);
    for(const factor of explanation.factors){
     const line=d.createElement('p');line.className='po-ai-preference-factor';
     line.textContent=factor.label+' · '+factor.trend+' điểm ('+factor.impact.toFixed(3)+')';
     details.append(line);
    }
    preferenceDetails=details;
   }
   const citation=profile[String(ch.name)];
   if(citation?.articleUrl){
    const link=d.createElement('a');link.href=citation.articleUrl;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Nguồn Wikipedia: '+citation.title;link.className='po-ai-link';card.append(link);
   }
   const actions=d.createElement('div');actions.className='po-ai-actions';
   const play=d.createElement('button');play.type='button';play.textContent='▶ Xem';
   if(upcomingOpen||planOpen)play.textContent='▶ Xem kênh';
   play.addEventListener('click',()=>{
    if(!channels().some(c=>String(c.id)===String(ch.id)))return render();
    win.PositronWatchFlow?.close?.();state()?.setPage?.('tv');
    Promise.resolve(state()?.playChannel?.(ch.id)).catch(()=>state()?.toast?.('Không thể phát kênh','error'));
   });
   const like=d.createElement('button');like.type='button';like.textContent='👍 Hợp gu';
   like.title='Dạy mô hình tăng hạng những nội dung tương tự';like.disabled=!enabled;
   like.addEventListener('click',()=>feedback(ch,1,item.programme?topic:null,item.programme?.start||0));
   const dislike=d.createElement('button');dislike.type='button';dislike.textContent='Không hợp';
   dislike.title='Dạy mô hình giảm hạng những nội dung tương tự';dislike.disabled=!enabled;
   dislike.addEventListener('click',()=>feedback(ch,0,item.programme?topic:null,item.programme?.start||0));
   const lookup=d.createElement('button');lookup.type='button';lookup.textContent='Tra cứu web';
   lookup.title='Chỉ gửi tên kênh lên Wikipedia khi bạn nhấn';
   lookup.addEventListener('click',async()=>{
    const query=core.cleanQuery(ch.name);
    if(!query){state()?.toast?.('Tên kênh không phù hợp để tra cứu','warn');return;}
    lookup.disabled=true;lookup.textContent='Đang tra cứu…';
    const url=new URL('https://vi.wikipedia.org/w/api.php');
    const args={action:'query',list:'search',srsearch:query,srlimit:'3',srprop:'snippet',format:'json',origin:'*'};
    for(const [key,value] of Object.entries(args))url.searchParams.set(key,value);
    try{
     const response=await fetch(url.toString(),{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',
      signal:AbortSignal.timeout(8000)});
     if(!response.ok)throw Error('HTTP '+response.status);
     const result=core.readWikiSearch(query,await response.json(),'vi');
     if(!result){state()?.toast?.('Chưa xác minh được chủ đề của kênh này trên Wikipedia','info');}
     else{web[String(ch.name)]={at:Date.now(),data:result};saveWeb();state()?.toast?.('Đã tìm được trang Wikipedia trùng tên kênh','info');}
    }catch(e){state()?.toast?.('Không tra cứu được Wikipedia: '+String(e.message||e).slice(0,90),'warn');}
    finally{lookup.disabled=false;lookup.textContent='Tra cứu web';if(aiOpen)render();}
   });
   actions.append(play,like,dislike,lookup);card.append(actions);
   // P320: expanding the explanation is secondary and cannot displace controls.
   if(preferenceDetails)card.append(preferenceDetails);
   if(enabled&&topic.source!=='epg'){
    const teach=d.createElement('label');teach.className='po-ai-teacher';
    const title=d.createElement('span');title.textContent='Dạy AI phân loại:';
    const select=d.createElement('select');select.id='poAITeach-'+index;
    select.setAttribute('aria-label','Dạy AI thể loại cho '+ch.name);
    const empty=d.createElement('option');empty.value='';empty.textContent='Chọn thể loại';select.append(empty);
    for(const [key,label] of Object.entries(core.KINDS)){
     if(key==='other')continue;
     const option=d.createElement('option');option.value=key;option.textContent=label;select.append(option);
    }
    select.addEventListener('change',()=>{
     if(!enabled||!select.value)return;
     lastActiveTeachUndo=null;categoryModel=core.teachCategory(categoryModel,ch,select.value);
     if(!save())state()?.toast?.('Không lưu được nhãn học AI','warn');
     else state()?.toast?.('AI đã học thể loại từ nhãn xác nhận','info');
     render();
    });
    teach.append(title,select);card.append(teach);
   }
   list.append(card);
  }
 }
 check.addEventListener('change',()=>{
  enabled=check.checked;active=null;
  if(!enabled){alertEnabled=false;exploreOpen=false;}
  alertCheck.checked=alertEnabled;alertCheck.disabled=!enabled;
  if(!save())state()?.toast?.('Không lưu được quyền học trên máy','warn');render();
 });
 alertCheck.addEventListener('change',()=>{
  alertEnabled=enabled&&alertCheck.checked;alertCheck.checked=alertEnabled;
  if(!save())state()?.toast?.('Không lưu được cài đặt nhắc lịch AI','warn');
  if(alertEnabled)checkAlerts();
  if(aiOpen)render();
 });
 clear.addEventListener('click',()=>{
  modelManager.hidden=!modelManager.hidden;
  clear.setAttribute('aria-expanded',String(!modelManager.hidden));
  clear.textContent=modelManager.hidden?'Quản lý mô hình':'Đóng quản lý mô hình';
  if(!modelManager.hidden){modelManager.open=true;modelManager.scrollIntoView({block:'nearest',behavior:'instant'});}
  else clear.focus();
 });
 // Export only after explicit user action; Blob URL never sends data to the network.
 backup.addEventListener('click',()=>{
  if(backup.disabled)return;
  try{
   const snapshot=core.buildLearningBackup({model,categoryModel,bandit});
   const bytes=new Blob([JSON.stringify(snapshot,null,2)+'\n'],{type:'application/json;charset=utf-8'});
   const url=win.URL.createObjectURL(bytes),a=d.createElement('a');
   a.href=url;a.download='positron-ai-models-'+new Date().toISOString().slice(0,10)+'.json';
   a.hidden=true;d.body.append(a);a.click();a.remove();
   win.setTimeout(()=>win.URL.revokeObjectURL(url),30000);
   lastBackupSnapshot={data:snapshot,filename:a.download,size:bytes.size};
   lastVerifyDetails=null;modelDiagnostics.replaceChildren();modelDiagnostics.hidden=true;
   verifyBackup.hidden=false;
   modelStatus.textContent='Đã yêu cầu lưu bản sao '+a.download+' ('+bytes.size+' byte). Chọn lại tệp để kiểm tra; chưa xác nhận tải thành công.';
  }catch{
   modelStatus.textContent='Không tạo được tệp sao lưu AI; kiểm tra quyền tải tệp rồi thử lại.';
  }
 });
 // P313: reselect the exported JSON, compare three learned models locally; never restore automatically.
 verifyBackup.addEventListener('click',()=>verifyFile.click());
 verifyFile.addEventListener('change',async()=>{
  const file=verifyFile.files?.[0];verifyFile.value='';if(!file)return;
  let message;lastVerifyDetails=null;
  if(file.size>512000)message='Không kiểm chứng được: tệp JSON vượt 500 KB.';
  else{
   try{
    const content=JSON.parse(await file.text());
    // P317: if no snapshot was exported this session, compare with the currently
    // persisted models. Never assume the selected file was successfully downloaded.
    const currentReference=!lastBackupSnapshot;
    const reference=currentReference?core.buildLearningBackup({model,categoryModel,bandit}):lastBackupSnapshot.data;
    const check=core.verifyLearningBackupSnapshot(reference,content);
    if(check.ok)lastVerifyDetails=check;
    message=!check.ok?'Không kiểm chứng được: '+check.reason:
     check.match?(currentReference
      ?'Đã đối chiếu tệp '+file.name+' ('+file.size+' byte): trọng số khớp mô hình AI đang dùng trên máy. Không tự khôi phục.'
      :'Đã kiểm tra tệp '+file.name+' ('+file.size+' byte): cấu trúc và trọng số AI khớp bản vừa xuất (không phụ thuộc thứ tự khóa JSON). Không tự khôi phục.'):
     (currentReference
      ?'Tệp sao lưu khác mô hình AI đang dùng: '+check.matched+'/3 mô hình khớp. Chưa nhập hay ghi đè dữ liệu.'
      :'Tệp sao lưu không khớp bản vừa xuất: '+check.matched+'/3 mô hình khớp. Chưa nhập hay ghi đè dữ liệu.');
   }catch{message='Không kiểm chứng được: không đọc được JSON hợp lệ.';}
  }
  // P318: immediately expose per-algorithm read-only diagnostics beside file picker.
  modelDiagnostics.replaceChildren();
  modelDiagnostics.hidden=!(lastVerifyDetails?.ok&&!lastVerifyDetails.match);
  if(!modelDiagnostics.hidden)for(const item of lastVerifyDetails.details){
   const row=d.createElement('div');row.className='po-ai-verify-diagnostic';
   row.dataset.algorithm=item.id;row.dataset.match=String(item.match);
   const title=d.createElement('strong');title.textContent=item.label;
   const result=d.createElement('span');
   result.textContent=(item.match?'Khớp':'Khác')+' · '+item.countBefore+' → '+item.countAfter+
    ' '+item.unit+(!item.match?' · '+item.changedFields+' trường AI thay đổi':'');
   row.append(title,result);modelDiagnostics.append(row);
  }
  modelStatus.textContent=message;activeStatusMessage=message;
  render();
  const feedback=byId('poAIActiveStatus')||modelStatus;
  feedback?.scrollIntoView({block:'center',behavior:'instant'});
  feedback?.focus?.({preventScroll:true});
 });
 // P285: validate and preview a chosen local backup, then require second confirmation.
 let pendingLearningImport=null,importSequence=0,lastImportUndo=null;
 const importFingerprint=()=>JSON.stringify({model,categoryModel,bandit,taughtIds:[...taughtIds]});
 undoImport.addEventListener('click',()=>{
  if(!lastImportUndo)return;
  if(importFingerprint()!==lastImportUndo.applied){
   lastImportUndo=null;undoImport.hidden=true;
   modelStatus.textContent='Mô hình đã thay đổi sau lần khôi phục; không hoàn tác để tránh ghi đè dữ liệu học mới.';return;
  }
  const current={model,categoryModel,bandit,taughtIds:[...taughtIds]};
  const previous=lastImportUndo.previous;
  model=previous.model;categoryModel=previous.categoryModel;bandit=previous.bandit;
  taughtIds.clear();for(const id of previous.taughtIds)taughtIds.add(id);
  if(!save()){
   model=current.model;categoryModel=current.categoryModel;bandit=current.bandit;
   taughtIds.clear();for(const id of current.taughtIds)taughtIds.add(id);
   modelStatus.textContent='Không lưu được bản hoàn tác; dữ liệu AI hiện tại vẫn giữ nguyên.';return;
  }
  lastImportUndo=null;undoImport.hidden=true;pendingLearningImport=null;
  importConfirm.hidden=true;importConfirm.classList.remove('po-ai-confirm-risk');importConfirm.removeAttribute('aria-describedby');importPreview.hidden=true;importPreview.replaceChildren();
  active=null;activeTeachIndex=0;sessionSkippedIds.clear();lastActiveTeachUndo=null;
  activeStatusMessage='Đã hoàn tác lần nhập mô hình AI gần nhất trong phiên.';
  render();modelStatus.textContent='Đã hoàn tác khôi phục AI: trọng số cũ trở lại. Playlist, EPG và Favorites không thay đổi.';
  modelStatus.scrollIntoView({block:'nearest',behavior:'instant'});
 });
 importButton.addEventListener('click',()=>{
  ++importSequence;pendingLearningImport=null;importConfirm.hidden=true;importConfirm.classList.remove('po-ai-confirm-risk');importConfirm.removeAttribute('aria-describedby');importPreview.hidden=true;importPreview.replaceChildren();
  importFile.click();
 });
 importFile.addEventListener('change',async()=>{
  const file=importFile.files?.[0];importFile.value='';
  const sequence=++importSequence;pendingLearningImport=null;importConfirm.hidden=true;importConfirm.classList.remove('po-ai-confirm-risk');importConfirm.removeAttribute('aria-describedby');importPreview.hidden=true;importPreview.replaceChildren();
  if(!file)return;
  if(file.size>512000){modelStatus.textContent='Tệp sao lưu vượt giới hạn 500 KB; dữ liệu hiện tại chưa thay đổi.';return;}
  try{
   const raw=JSON.parse(await file.text());if(sequence!==importSequence)return;
   const parsed=core.parseLearningBackup(raw);
   if(!parsed.ok){modelStatus.textContent='Không thể khôi phục: '+parsed.reason+' Dữ liệu hiện tại vẫn giữ nguyên.';return;}
   const comparison=core.compareLearningBackup({model,categoryModel,bandit},parsed);
   if(!comparison.ok){modelStatus.textContent='Không thể so sánh: '+comparison.reason;return;}
   const heading=d.createElement('strong');heading.textContent='So sánh với mô hình đang dùng';
   importPreview.append(heading);
   for(const row of comparison.rows){
    const line=d.createElement('div');line.className='po-ai-compare-row';
    if(row.delta<0)line.classList.add('po-ai-compare-loss');
    const label=d.createElement('span');label.textContent=row.label;
    const counts=d.createElement('span');counts.className='po-ai-compare-count';
    counts.textContent=row.before+' → '+row.after+' '+row.unit+' ('+(row.delta>0?'+':'')+row.delta+')';
    line.append(label,counts);importPreview.append(line);
   }
   const warning=d.createElement('p');warning.id='poAIImportWarning';
   warning.className=comparison.lossCount?'po-ai-compare-warning po-ai-compare-risk':'po-ai-compare-warning';
   warning.textContent=comparison.warning+' '+comparison.caution;
   importPreview.append(warning);importPreview.hidden=false;

   const impact=core.previewLearningImpact({model},parsed,channels(),guide(),win.IPTVGuide,
    {clock:Date.now(),limit:3});
   if(impact.ok){
    const forecast=d.createElement('div');forecast.id='poAIImportImpact';
    forecast.className='po-ai-impact';
    const heading=d.createElement('strong');heading.textContent='AI thử thứ hạng trước khi khôi phục';
    const describe=(rows,placeholder)=>rows.length
     ?rows.map((row,index)=>(index+1)+'. '+row.name).join(' · '):placeholder;
    const before=d.createElement('p');before.textContent='Đang dùng: '+
     describe(impact.before,'Chưa có kênh để so sánh');
    const after=d.createElement('p');after.textContent='Nếu nhập JSON: '+
     describe(impact.after,'Chưa có kênh để so sánh');
    const caution=d.createElement('small');
    caution.textContent=(impact.changedPositions
     ?'Có '+impact.changedPositions+' vị trí thay đổi trong gợi ý thử. '
     :'Thứ tự ba gợi ý chưa thay đổi. ')+impact.caution;
    forecast.append(heading,before,after,caution);importPreview.append(forecast);
   }


   const categoryImpact=core.previewCategoryImpact({categoryModel},parsed,channels(),{limit:4});
   if(categoryImpact.ok){
    const details=d.createElement('details');details.id='poAICategoryImpact';
    details.className='po-ai-category-impact';
    const summary=d.createElement('summary');
    summary.textContent='Naive Bayes dự báo: '+categoryImpact.relabeled+' đổi chủ đề · '+
     categoryImpact.confidenceTransitions+' đổi độ chắc chắn (xem chi tiết)';
    const stats=d.createElement('p');
    stats.textContent='Đã thử '+categoryImpact.scanned+' kênh. Phân loại đủ chắc chắn: '+
     categoryImpact.classifiedBefore+' → '+categoryImpact.classifiedAfter+' kênh.';
    const breakdown=d.createElement('p');breakdown.id='poAICategoryBreakdown';
    breakdown.className='po-ai-category-breakdown';
    breakdown.textContent='Đổi chủ đề khi cả hai mô hình đủ chắc chắn: '+categoryImpact.relabeled+
     ' · Mới đủ chắc chắn: '+categoryImpact.newlyClassified+
     ' · Không còn đủ chắc chắn: '+categoryImpact.becameUncertain+'.';
    details.append(summary,stats,breakdown);
    if(!categoryImpact.differences.length){
     const empty=d.createElement('p');empty.textContent='Chưa thấy nhãn thay đổi trong mẫu kiểm tra.';
     details.append(empty);
    }
    for(const row of categoryImpact.differences){
     const line=d.createElement('div');line.className='po-ai-category-diff';
     line.textContent=row.name+': '+row.before+' → '+row.after;
     details.append(line);
    }
    // P304: keep topic migration as a sibling disclosure, not inside the
    // already long P289 impact details (which must fit the scroll viewport).
    let topicShiftPanel=null;
    // P304: show topic migration separately from loss of classifier coverage.
    const topicShifts=core.previewCategoryTopicShifts({categoryModel},parsed,channels(),{limit:6,maxChannels:1000});
    if(topicShifts.ok){
     const shifts=d.createElement('details');shifts.id='poAICategoryTopicShifts';
     shifts.className='po-ai-category-impact';
     const caption=d.createElement('summary');
     // P305: zero comparable predictions is insufficient evidence, NOT a 0% topic shift.
     caption.textContent=topicShifts.comparable
      ?'AI kiểm tra đổi chủ đề: '+topicShifts.changed+'/'+topicShifts.comparable+
       ' kênh đủ chắc chắn ('+topicShifts.shiftRate+'%) · Xem chủ đề trước/sau'
      :'AI chưa đủ dữ liệu đối chiếu chủ đề ('+topicShifts.scanned+' kênh đã thử) · Xem lý do';
     shifts.append(caption);
     const explanation=d.createElement('p');explanation.id='poAICategoryShiftSummary';
     explanation.textContent='Đã thử '+topicShifts.scanned+' kênh trên máy. Đang dùng phân loại đủ chắc chắn: '+
      topicShifts.confidentBefore+'; bản sao: '+topicShifts.confidentAfter+
      '; cả hai đều chắc chắn: '+topicShifts.comparable+'. '+
      (topicShifts.comparable
       ?topicShifts.changed+' kênh đổi sang chủ đề khác trong số các kênh có thể đối chiếu.'
       :'Chưa đủ dự đoán trùng kênh để kết luận về tỷ lệ đổi chủ đề; cần thêm nhãn do người xem xác nhận trước khi so sánh.')+
      ' Đây chỉ là dự báo cục bộ, không làm mất kênh khỏi playlist.';
     shifts.append(explanation);
     if(!topicShifts.transitions.length){
      const empty=d.createElement('p');empty.id='poAINoTopicMigrationEvidence';
      empty.textContent=topicShifts.comparable
       ?'Trong '+topicShifts.comparable+' kênh có dự đoán đủ chắc chắn từ cả hai mô hình, chưa phát hiện đổi chủ đề.'
       :'Không có kênh nào được cả hai mô hình dự đoán đủ chắc chắn; chưa thể kết luận có hay không có chuyển chủ đề.';
      shifts.append(empty);
     }
     for(const row of topicShifts.transitions){
      const line=d.createElement('p');line.className='po-ai-category-diff';
      line.textContent=row.from+' → '+row.to+': '+row.count+' kênh'+
       (row.examples.length?' · Ví dụ: '+row.examples.join(' · '):'');
      shifts.append(line);
     }
     // P306: actionable, read-only Naive Bayes confidence-gap evidence.
     // Disclose only names (never channel IDs/URLs), hidden until clicked.
     const gap=d.createElement('details');gap.id='poAIConfidenceGapExamples';
     gap.className='po-ai-category-impact';
     gap.dataset.lost=String(topicShifts.lostConfident);
     gap.dataset.gained=String(topicShifts.newlyConfident);
     gap.dataset.uncertain=String(topicShifts.bothUncertain);
     gap.dataset.comparable=String(topicShifts.comparable);
     const gapCaption=d.createElement('summary');
     gapCaption.textContent='AI kiểm tra độ chắc chắn: '+topicShifts.lostConfident+
      ' kênh giảm · '+topicShifts.newlyConfident+' kênh tăng · Xem tên mẫu';
     gap.append(gapCaption);
     const cohort=d.createElement('p');cohort.className='po-ai-category-breakdown';
     cohort.textContent='Đối chiếu '+topicShifts.scanned+' kênh: '+topicShifts.lostConfident+
      ' mất độ chắc chắn, '+topicShifts.newlyConfident+' mới đủ chắc chắn, '+
      topicShifts.bothUncertain+' chưa đủ ở cả hai, '+topicShifts.comparable+
      ' đủ chắc chắn ở cả hai mô hình.';
     gap.append(cohort);
     const showGapExamples=(title,names)=>{
      const p=d.createElement('p');p.className='po-ai-category-diff';
      p.textContent=title+(names.length?names.join(' · '):'Chưa có kênh mẫu trong nhóm này.');
      gap.append(p);
     };
     showGapExamples('Mất độ chắc chắn: ',topicShifts.lostExamples);
     showGapExamples('Mới đủ chắc chắn: ',topicShifts.gainedExamples);
     showGapExamples('Chưa đủ chắc chắn ở cả hai: ',topicShifts.unresolvedExamples);
     // P308: explicit journey from low-confidence names to manual AI labeling.
     const review=d.createElement('button');review.type='button';review.id='poAIReviewUncertain';
     review.className='po-ai-review-uncertain';review.textContent='Dạy AI cho kênh chưa phân loại';
     review.title='Mở hàng đợi gán nhãn thủ công, không tự bật học hoặc phát video';
     review.addEventListener('click',()=>{
      if(!enabled){
       modelStatus.textContent='Hãy tự bật quyền học trên máy trước khi dạy AI. Chưa có nhãn nào được lưu.';
       check.scrollIntoView({block:'center',behavior:'instant'});check.focus();
       return;
      }
      panel.dataset.poAiTraining='true';
      upcomingOpen=false;planOpen=false;exploreOpen=false;foldersOpen=true;programmesOpen=false;
      activeTeachIndex=0;render();
      const trainer=byId('poAIActiveLearning');
      if(trainer){
       const folder=trainer.closest('details.po-ai-folder');if(folder)folder.open=true;
       trainer.scrollIntoView({block:'center',behavior:'instant'});
       (byId('poAIActiveSelect0')||trainer.querySelector('button'))?.focus({preventScroll:true});
      }else{
       byId('poAICards')?.scrollIntoView({block:'nearest',behavior:'instant'});
       state()?.toast?.('Không có kênh phù hợp trong hàng đợi dạy AI hiện tại.','info');
      }
     });
     gap.append(review);
     const gapNote=d.createElement('small');
     gapNote.textContent='Đây là chênh lệch dự đoán Naive Bayes trên máy, không phải lỗi luồng phát và không thay đổi kênh, mô hình hay playlist.';
     gap.append(gapNote);shifts.append(gap);
     const caution=d.createElement('small');caution.textContent=topicShifts.caution;
     shifts.append(caution);topicShiftPanel=shifts;
    }
    // P293: independent local preview balanced across channel groups.
    const balanced=core.previewCategoryImpact({categoryModel},parsed,channels(),{limit:4,strategy:'balanced'});
    if(balanced.ok&&balanced.totalGroups>1){
     const diversity=d.createElement('p');diversity.id='poAICategoryBalancedSample';
     diversity.className='po-ai-category-breakdown';
     diversity.textContent='Kiểm tra chéo theo nhóm: '+balanced.scanned+' kênh thuộc '+
      balanced.sampledGroups+'/'+balanced.totalGroups+' nhóm; độ bao phủ '+
      balanced.coverageBefore+'% → '+balanced.coverageAfter+'%. '+
      (balanced.coverageRisk==='high'?'Mẫu đa nhóm cũng cảnh báo suy giảm mạnh.':
       'Chưa thấy suy giảm mạnh trên mẫu đa nhóm.')+
      ' Đây là mẫu phân tầng, không phải đánh giá độ chính xác trên toàn bộ thư viện.';
     details.append(diversity);
     // P294: compare the actual two local prediction samples before import.
     const comparison=core.compareCategorySamples(categoryImpact,balanced);
     if(comparison.ok){
      const cross=d.createElement('p');cross.id='poAICategorySampleDisagreement';
      cross.className=comparison.divergent?'po-ai-coverage-risk':'po-ai-category-breakdown';
      if(comparison.divergent)cross.setAttribute('role','alert');
      cross.textContent='Đối chiếu hai mẫu: chênh lệch mức suy giảm '+comparison.dropGap+
       ' điểm %, tỷ lệ phân loại trước khác '+comparison.beforeGap+
       ' điểm %, sau khác '+comparison.afterGap+' điểm %. '+
       (comparison.divergent
        ?'Cảnh báo: hai mẫu đưa ra kết quả khác biệt lớn; nên kiểm tra nhóm kênh trước khi thay mô hình.'
        :'Hai mẫu chưa có bất đồng lớn ở ngưỡng 20 điểm %. ')+comparison.caution;
      details.append(cross);
     }
    }
    // P295: show the most affected library groups only when explicitly expanded.
    const groupsRisk=core.previewCategoryGroupRisks({categoryModel},parsed,channels(),{limit:5,maxChannels:1000});
    if(groupsRisk.ok&&groupsRisk.totalGroups){
     const riskDetails=d.createElement('details');riskDetails.id='poAICategoryGroupRisks';
     riskDetails.className='po-ai-category-impact';
     const riskSummary=d.createElement('summary');
     riskSummary.textContent='Nhóm bị ảnh hưởng khi thay mô hình · '+groupsRisk.totalGroups+' nhóm (xem chi tiết)';
     riskDetails.append(riskSummary);
     const overall=d.createElement('p');
     overall.textContent='Đã phân tích '+groupsRisk.scanned+' kênh; '+groupsRisk.lostTotal+
      ' kênh có thể mất dự đoán đủ chắc chắn khi nhập mô hình.';
     riskDetails.append(overall);
     // P297: let viewers compare absolute loss with the proportion affected.
     // Sorting is read-only and never applies/retrains the imported model.
     const riskSort=d.createElement('button');riskSort.type='button';
     riskSort.id='poAICategoryRiskSort';riskSort.className='po-ai-risk-sort';
     const riskSmall=d.createElement('button');riskSmall.type='button';
     riskSmall.id='poAICategorySampleFilter';riskSmall.className='po-ai-risk-sort';
     const riskOnly=d.createElement('button');riskOnly.type='button';
     riskOnly.id='poAICategoryRiskOnly';riskOnly.className='po-ai-risk-sort';
     const sampleNote=d.createElement('small');sampleNote.id='poAICategorySampleNote';
     const namesToggle=d.createElement('button');namesToggle.type='button';
     namesToggle.id='poAICategoryNamesToggle';namesToggle.className='po-ai-risk-sort';
     const riskRows=d.createElement('div');riskRows.id='poAICategoryRiskRows';
     riskDetails.append(riskSort,riskSmall,riskOnly,namesToggle,sampleNote,riskRows);
     let rateMode=false,hideSmall=false,namesVisible=false,onlyAtRisk=false;
     const renderRiskRows=()=>{
      const ranked=core.previewCategoryGroupRisks({categoryModel},parsed,channels(),{
       limit:5,maxChannels:1000,sortBy:rateMode?'rate':'count',minGroupSize:hideSmall?5:1,onlyAtRisk});
      riskRows.replaceChildren();
      for(const group of ranked.groups){
       const line=d.createElement('p');line.className='po-ai-category-diff';
       line.textContent=group.label+': '+group.lost+'/'+group.count+
        ' kênh có thể mất dự đoán ('+group.lossRate+'% của nhóm) · '+
        group.relabeled+' đổi chủ đề · '+group.gained+' mới đủ chắc chắn.';
       // P300: optional read-only inspection of channel names implicated by
       // genuine local Naive Bayes prediction drift, never the stream URLs.
       const examples=d.createElement('small');examples.className='po-ai-category-samples';
       examples.hidden=!namesVisible;
       examples.textContent=group.lostExamples.length
        ?'Kênh cần kiểm tra: '+group.lostExamples.join(' · ')
        :'Không có kênh mất dự đoán đủ chắc chắn trong nhóm đã lấy mẫu.';
       line.append(examples);
       riskRows.append(line);
      }
      // P303: direct filter based on the actual local Naive Bayes loss tally.
      riskOnly.setAttribute('aria-pressed',String(onlyAtRisk));
      riskOnly.textContent=onlyAtRisk
       ?'Đang chỉ hiện nhóm có nguy cơ ('+ranked.eligibleGroups+') · Hiện tất cả'
       :'Chỉ nhóm mất phân loại';
      riskOnly.title=onlyAtRisk?'Bỏ lọc rủi ro, hiện lại mọi nhóm đã lấy mẫu':'Ẩn nhóm không có kênh mất dự đoán đủ chắc chắn';
      riskSort.textContent=rateMode?'Đang ưu tiên tỷ lệ % · Xem theo số kênh':
       'Theo số kênh · Xem theo tỷ lệ %';
      riskSort.setAttribute('aria-pressed',String(rateMode));
      riskSmall.setAttribute('aria-pressed',String(hideSmall));
      riskSmall.textContent=hideSmall?'Đang ẩn nhóm <5 kênh · Hiện tất cả':'Ẩn nhóm dưới 5 kênh';
      namesToggle.textContent=namesVisible?'Ẩn tên kênh cần kiểm tra':'Xem tên kênh cần kiểm tra';
      namesToggle.setAttribute('aria-pressed',String(namesVisible));
      sampleNote.textContent=hideSmall
       ?'Đã ẩn '+ranked.excludedSmallGroups+' nhóm có dưới 5 kênh trong thư viện kiểm tra. Nhóm nhỏ không đủ đại diện để so sánh tỷ lệ.'
       :'Có thể ẩn nhóm dưới 5 kênh để tránh so sánh tỷ lệ 100% từ chỉ một vài kênh.';
     };
     riskSort.addEventListener('click',()=>{rateMode=!rateMode;renderRiskRows();});
     riskSmall.addEventListener('click',()=>{hideSmall=!hideSmall;renderRiskRows();});
     riskOnly.addEventListener('click',()=>{onlyAtRisk=!onlyAtRisk;renderRiskRows();});
     namesToggle.addEventListener('click',()=>{namesVisible=!namesVisible;renderRiskRows();});
     renderRiskRows();
     const riskNote=d.createElement('small');riskNote.textContent=groupsRisk.caution;
     riskDetails.append(riskNote);details.append(riskDetails);
     // P299: warn about a single high-loss channel group before any model
     // replacement, even if whole-playlist coverage conceals its decline.
     if(groupsRisk.criticalGroups?.length){
      const groupAlert=d.createElement('p');
      groupAlert.id='poAICategoryGroupRiskAlert';
      groupAlert.className='po-ai-coverage-risk';
      groupAlert.setAttribute('role','alert');
      groupAlert.textContent='Cảnh báo AI theo nhóm: '+
       groupsRisk.criticalGroups.map(g=>g.label+' có '+g.lost+'/'+g.count+
        ' kênh có thể mất phân loại đủ chắc chắn ('+g.lossRate+'%)').join('; ')+
       '. Hãy kiểm tra các nhóm này trước khi xác nhận khôi phục. Đây chỉ là dự báo dựa trên mô hình Naive Bayes cục bộ, không phải độ chính xác thực tế hay chất lượng luồng phát.';
      // Keep the important warning ABOVE the potentially long, expanded
      // group list. The sticky Confirm button must never cover the alert.
      // P302: the explicit AI warning can lead straight to evidence rather
      // than forcing viewers to hunt through a long nested preview.
      const jump=d.createElement('button');jump.type='button';
      jump.id='poAIInspectRisk';jump.className='po-ai-risk-jump';
      jump.textContent='Mở ngay tên kênh có nguy cơ';
      jump.setAttribute('aria-controls','poAICategoryRiskRows');
      jump.addEventListener('click',()=>{
       details.open=true;riskDetails.open=true;
       if(!namesVisible){namesVisible=true;renderRiskRows();}
       const sample=riskRows.querySelector('.po-ai-category-samples:not([hidden])');
       sample?.scrollIntoView({block:'center',behavior:'instant'});
      });
      groupAlert.append(jump);
      details.insertBefore(groupAlert,riskDetails);
     }
    }
    const note=d.createElement('small');note.textContent=categoryImpact.caution;
    // Show the new P304 disclosure BEFORE the long existing P289 group details.
    // This keeps the interactive summary reachable without forcing the user
    // to scroll past hundreds of rows before checking topic migrations.
    details.append(note);
    if(topicShiftPanel)importPreview.append(topicShiftPanel);
    importPreview.append(details);
    if(topicShifts.ok&&topicShifts.significant){
     const relabelAlert=d.createElement('p');relabelAlert.id='poAICategoryShiftRisk';
     relabelAlert.className='po-ai-coverage-risk';
     relabelAlert.setAttribute('role','alert');
     relabelAlert.textContent='Cảnh báo AI đổi chủ đề: '+topicShifts.changed+'/'+topicShifts.comparable+
      ' kênh ('+topicShifts.shiftRate+'%) có thể đổi nhãn phân loại đủ chắc chắn sau khi khôi phục. '+
      'Hãy mở phần “AI kiểm tra đổi chủ đề” trước khi xác nhận. Đây là dự đoán cục bộ, không phải độ chính xác thật.';
     importPreview.insertBefore(relabelAlert,details);
    }
    if(categoryImpact.coverageRisk==='high'){
     const risk=d.createElement('p');risk.id='poAICategoryCoverageRisk';
     risk.className='po-ai-coverage-risk';risk.setAttribute('role','alert');
     risk.textContent='Cảnh báo AI: độ bao phủ phân loại đủ chắc chắn giảm từ '+
      categoryImpact.coverageBefore+'% xuống '+categoryImpact.coverageAfter+
      '% (giảm '+categoryImpact.coverageDropPoints+' điểm % trong '+
      categoryImpact.scanned+' kênh được thử). Đây chỉ là dự báo theo tên/nhóm kênh; không phải lỗi phát video hay thước đo độ chính xác thực.';
     // P301: a severe model warning must precede long expanded details.
     importPreview.insertBefore(risk,details);
    }
   }

   // P301: make every concrete restore warning readable by screen readers.
   const warningIds=[...importPreview.querySelectorAll('[role="alert"][id]')].map(el=>el.id);
   importConfirm.classList.toggle('po-ai-confirm-risk',warningIds.length>0);
   if(warningIds.length)importConfirm.setAttribute('aria-describedby',warningIds.join(' '));
   else importConfirm.removeAttribute('aria-describedby');
   pendingLearningImport=parsed;importConfirm.hidden=false;
   modelStatus.textContent='Xem trước: '+parsed.summary.preferenceObservations+' phản hồi, '
    +parsed.summary.categoryLabels+' nhãn và '+parsed.summary.exploredTopics
    +' chủ đề UCB. Nhấn xác nhận để thay thế trọng số AI đang học; playlist, EPG và Favorites giữ nguyên.';
  }catch{
   if(sequence!==importSequence)return;
   modelStatus.textContent='Không thể đọc JSON sao lưu; dữ liệu AI hiện tại vẫn giữ nguyên.';
  }
  modelStatus.scrollIntoView({block:'nearest',behavior:'instant'});
 });
 importConfirm.addEventListener('click',()=>{
  if(!pendingLearningImport)return;
  const next=pendingLearningImport,previous={model,categoryModel,bandit,taughtIds:[...taughtIds]};
  model=next.model;categoryModel=next.categoryModel;bandit=next.bandit;taughtIds.clear();
  if(!save()){
   model=previous.model;categoryModel=previous.categoryModel;bandit=previous.bandit;
   for(const id of previous.taughtIds)taughtIds.add(id);
   modelStatus.textContent='Không thể lưu dữ liệu khôi phục; mô hình cũ đã được giữ nguyên.';
   return;
  }
  pendingLearningImport=null;importConfirm.hidden=true;importConfirm.classList.remove('po-ai-confirm-risk');importConfirm.removeAttribute('aria-describedby');importPreview.hidden=true;importPreview.replaceChildren();
  lastImportUndo={previous,applied:importFingerprint()};undoImport.hidden=false;
  active=null;activeTeachIndex=0;sessionSkippedIds.clear();lastActiveTeachUndo=null;
  activeStatusMessage='Đã khôi phục trọng số AI đã xác nhận từ tệp JSON.';
  render();
  modelStatus.textContent='Đã khôi phục '+next.summary.preferenceObservations
   +' phản hồi và '+next.summary.categoryLabels+' nhãn AI. Playlist, EPG và Favorites không thay đổi.';
  modelStatus.scrollIntoView({block:'nearest',behavior:'instant'});
 });
 bulk.addEventListener('click',()=>confirmDelete('all',bulk,()=>{
  model=core.emptyModel();bandit={};categoryModel=core.emptyCategoryModel();taughtIds.clear();activeStatusMessage='';lastActiveTeachUndo=null;active=null;alertEnabled=false;alertCheck.checked=false;
  notified.clear();
 },'toàn bộ dữ liệu học AI trên máy'));
 // Opt-in, in-app alert only: score actual imported EPG against locally
 // trained preferences, no URLs sent out and never start playback.
 function checkAlerts(){
  if(!enabled||!alertEnabled||model.observations<3)return;
  const now=Date.now();
  const items=core.startingForYou(channels(),guide(),win.IPTVGuide,model,webValid(),
   {clock:now,windowMinutes:2,threshold:0.62,limit:3});
  for(const entry of items){
   const key=String(entry.channel.id)+'|'+entry.programme.start+'|'+entry.programme.title;
   if(notified.has(key))continue;
   notified.add(key);
   if(notified.size>90)notified.delete(notified.values().next().value);
   const text='AI hợp gu · Sắp phát: '+entry.programme.title.slice(0,65)
    +' · '+String(entry.channel.name).slice(0,50);
   state()?.toast?.(text,'info');
  }
 }
 win.setInterval(checkAlerts,60000);
 // Only a real decoded/playable frame triggers tracking. Switching, pausing
 // or a stalled player does not count as a long viewing session.
 const player=byId('video');
 function tick(){
  if(!enabled||!player||player.paused||player.readyState<2||!player.currentSrc){
   active=null;return;
  }
  const ch=state()?.getCurrent?.(),now=Date.now();
  if(!ch?.id)return;
  if(!active||active.id!==String(ch.id)){
   active={id:String(ch.id),seconds:0,last:now,first:false,second:false};return;
  }
  const elapsed=Math.max(0,Math.min(5,(now-active.last)/1000));active.last=now;active.seconds+=elapsed;
  if((active.seconds>=35&&!active.first)||(active.seconds>=180&&!active.second)){
   const isSecond=active.seconds>=180;
   if(isSecond)active.second=true;else active.first=true;
   const topic=metadata(ch),vector=core.features(ch,topic,new Date(now));
   model=core.learn(model,vector,1,{rate:isSecond?0.18:0.42});
   bandit=core.observeBandit(bandit,topic.key);save();if(aiOpen)render();
  }
 }
 if(player){
  player.addEventListener('playing',tick);
  player.addEventListener('pause',()=>{active=null;});
  player.addEventListener('ended',()=>{active=null;});
  player.addEventListener('error',()=>{active=null;});
  win.setInterval(tick,4000);
 }
 const count=byId('navCount');
 if(count)new MutationObserver(()=>{if(aiOpen&&!panel.hidden)render();}).observe(count,{childList:true,characterData:true,subtree:true});
 // P327: restore keyboard focus to visible AI tab on panel reopen.
 // Native WatchFlow can focus a mode hidden by the AI-only view.
 new MutationObserver(()=>{syncWatchHeader();if(aiOpen&&!panel.hidden){
  syncAIView();render();
  const active=d.activeElement;
  if(!active||!panel.contains(active)||!active.getClientRects().length)
   tab.focus({preventScroll:true});
 }}).observe(panel,{attributes:true,attributeFilter:['hidden']});
 win.PositronIntelligence=Object.freeze({render,getProfile:()=>({enabled,observations:model.observations}),
  recommend:()=>core.recommend(channels(),guide(),win.IPTVGuide,model,webValid()),
  upcoming:()=>core.upcomingForYou(channels(),guide(),win.IPTVGuide,model,webValid()),
  plan:()=>core.planForYou(channels(),guide(),win.IPTVGuide,model,webValid()),
  explore:()=>enabled?core.exploreWithBandit(channels(),guide(),win.IPTVGuide,model,profileFor(channels()),bandit):[],
  categoryProfile:()=>({enabled,examples:categoryModel.examples}),
  modelInventory:()=>learnedInventory().map(({id,count})=>({id,count})),
  epgFolders:()=>core.epgFolders(channels(),guide(),win.IPTVGuide),
  programmeFolders:()=>indexed('programmes',channels()),
  scanStats:()=>({folderScans:indexCache.folderScans,programmeScans:indexCache.programmeScans}),
  alerts:()=>({enabled:alertEnabled,candidates:alertEnabled?core.startingForYou(channels(),guide(),win.IPTVGuide,model,webValid()):[]}),
  getTopic:metadata});
})();
