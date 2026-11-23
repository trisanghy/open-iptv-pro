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
 let web=load(WEB_KEY);if(!web||typeof web!=='object'||Array.isArray(web))web={};
 const webValid=()=>{
  const live={};const now=Date.now();
  for(const [name,item] of Object.entries(web).slice(-90)){
   if(item&&item.at&&now-item.at<30*86400000&&item.data?.articleUrl&&item.data?.title)
    live[name]=item.data;
  }
  return live;
 };
 const save=()=>{try{win.localStorage.setItem(KEY,JSON.stringify({enabled,alertEnabled,model,bandit,categoryModel}));return true;}catch{return false;}};
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
 aiSlot.append(tab);toolbar.after(aiSlot);
 const area=d.createElement('section');area.id='poIntelligenceResults';area.className='po-ai-panel';
 area.hidden=true;area.setAttribute('aria-live','polite');
 panel.querySelector('#poFlowPlusResults')?.after(area);
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
 const modelHint=d.createElement('small');modelHint.textContent='Tiêu chuẩn và Smart tích hợp sẵn, không cần tải. Xóa trọng số học không xóa nguồn, kênh hoặc EPG.';
 const bulk=d.createElement('button');bulk.type='button';bulk.id='poAIClearAll';
 bulk.className='po-ai-clear-all';bulk.textContent='Xóa toàn bộ dữ liệu học';bulk.title='Xóa tất cả ba mô hình học sau khi xác nhận hai lần';
 modelManager.append(modelToggle,modelRows,bulk,modelStatus,modelHint);
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
     if(item.id==='category')categoryModel=core.emptyCategoryModel();
     if(item.id==='explore')bandit={};
    },item.name);
   });
   row.append(left,remove);modelRows.append(row);
  }
  modelToggle.textContent='Mô hình AI trên máy · '+models.length+' thuật toán · '+models.reduce((n,x)=>n+modelBytes(x.data),0)+' byte';
  bulk.disabled=!models.some(x=>x.count>0);bulk.textContent=pendingModel==='all'?'Xác nhận xóa':'Xóa toàn bộ dữ liệu học';
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
 const extras=[panel.querySelector('.po-watchflow-modes'),panel.querySelector('.po-watchflow-subhead'),
  byId('poWatchFlowResults'),panel.querySelector('.po-watchflow-note')].filter(Boolean);
 const originals=[byId('poFlowPlusResults'),byId('poWatchLaterSearchRow'),panel.querySelector('.po-flowplus-privacy')].filter(Boolean);
 // Native WatchFlow Plus refreshes Mix on every reopen, which previously
 // surfaced five non-AI cards above the AI panel. Re-apply the exclusive
 // panel mode on reopen AND enforce it in CSS so an async refresh cannot
 // shadow AI controls underneath a scrollable card list.
 function syncAIView(){
  if(!aiOpen||panel.hidden)return;
  panel.dataset.poAiActive='true';area.hidden=false;
  tab.setAttribute('aria-pressed','true');
  for(const button of toolbar.querySelectorAll('button[data-flowplus-mode]'))button.setAttribute('aria-pressed','false');
  for(const el of extras)el.classList.add('po-flowplus-hidden');
  for(const el of originals)el.hidden=true;
  panel.scrollTop=0;
 }
 function showAI(){aiOpen=true;syncAIView();render();}
 function hideAI(){
  aiOpen=false;delete panel.dataset.poAiActive;area.hidden=true;
  tab.setAttribute('aria-pressed','false');
 }
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
   folder.append(rows);list.append(folder);
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

  const previousOpen=new Map([...list.querySelectorAll('details.po-ai-folder')].map(el=>[
   (el.dataset.programmeTopic?'p:':'f:')+(el.dataset.programmeTopic||el.dataset.topic||''),el.open
  ]));
  const restoreFolders=()=>{
   for(const el of list.querySelectorAll('details.po-ai-folder')){
    const key=(el.dataset.programmeTopic?'p:':'f:')+(el.dataset.programmeTopic||el.dataset.topic||'');
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
   metric.textContent=topic.label+' · '+(topic.source==='epg'?'EPG':topic.source==='web'?'Wikipedia':topic.source==='ml'?'AI học nhãn':
    topic.key==='other'?'Chưa rõ chủ đề':'Tên/nhóm')+(model.observations>=2?' · '+Math.round(item.probability*100)+'% hợp gu':'');
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
     categoryModel=core.teachCategory(categoryModel,ch,select.value);
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
 bulk.addEventListener('click',()=>confirmDelete('all',bulk,()=>{
  model=core.emptyModel();bandit={};categoryModel=core.emptyCategoryModel();active=null;alertEnabled=false;alertCheck.checked=false;
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
 new MutationObserver(()=>{if(aiOpen&&!panel.hidden){syncAIView();render();}}).observe(panel,{attributes:true,attributeFilter:['hidden']});
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
