'use strict';
/* WatchFlow native Standard Bayes with optional Smart configuration catalog; no simulated AI inference. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.initialize();
})(typeof window==='undefined'?null:window,function(root){
 const engine=root?.OpenIPTVWatchFlowEngine;
 const auto=root?.OpenIPTVWatchFlowAuto;
 const example=[{id:'ex1',name:'VTV1 HD',group:'Tin tức',demo:1},{id:'ex2',name:'K+ SPORT1',group:'Thể thao',demo:1},{id:'ex3',name:'HBO HD',group:'Phim truyện',demo:1},{id:'ex4',name:'HTV3',group:'Thiếu nhi',demo:1}];
 const rules=[
  ['Tin tức',/thời sự|tin tức|news|vtv1|thời tiết|chính trị|thoi su|tin tuc/i],
  ['Thể thao',/thể thao|sport|football|bóng đá|tennis|nba|bong da/i],
  ['Phim truyện',/phim|movie|cinema|cine|hbo|series|drama/i],
  ['Thiếu nhi',/thiếu nhi|kids|cartoon|disney|htv3|hoạt hình/i],
  ['Giải trí',/giải trí|show|music|âm nhạc|comedy|game show/i],
  ['Khoa học',/khoa học|discovery|documentary|tài liệu|nature/i]
 ];
 function classify(channel,epgTitle=''){
  for(const [label,re] of rules)if(epgTitle&&re.test(String(epgTitle)))return {label,from:'EPG'};
  for(const [label,re] of rules)if(re.test(String(channel?.name||'')+' '+String(channel?.group||'')))return {label,from:'Tên/nhóm'};
  return {label:'Chưa phân loại',from:'Thiếu dữ liệu'};
 }
 function recommend(channels,recent=[],currentId=''){
  const indices=new Map(recent.map((x,i)=>[String(x.id),i]));
  const weight=c=>(c.id===currentId?100:0)+(indices.has(String(c.id))?60-indices.get(String(c.id)):0);
  return [...channels].sort((a,b)=>weight(b)-weight(a));
 }
 function initialize(){
  const doc=root?.document, row=doc?.getElementById('captionThirdRow'),anchor=doc?.getElementById('unifiedAiToggle');
  if(!row||!anchor)return false;
  if(doc.getElementById('watchflowDemoToggle'))return true;
  const button=doc.createElement('button');button.type='button';button.id='watchflowDemoToggle';button.className='watchflow-demo-trigger';
  button.setAttribute('aria-controls','watchflowDemo');button.setAttribute('aria-expanded','false');
  button.textContent='✧ AI Phân tích kênh & Đề xuất';
  (doc.getElementById('videoEnhanceToggle')||anchor).insertAdjacentElement('afterend',button);
  const panel=doc.createElement('section');panel.id='watchflowDemo';panel.className='watchflow-demo';panel.hidden=true;
  panel.setAttribute('aria-label','WatchFlow tự động phân tích kênh và EPG');
  panel.innerHTML='<div class="wf-head"><div><small>WATCHFLOW · TỰ ĐỘNG</small><h2>Kênh & chương trình dành cho bạn</h2><p>AI tự quét playlist và EPG · không cần nhấn phân loại</p></div><button id="wfClose" type="button" aria-label="Đóng">×</button></div>'+
  '<div class="wf-local-banner"><div class="wf-scan-row"><span id="wfLocalScanStatus" role="status" aria-live="polite">Đang khôi phục kết quả kênh đã lưu…</span><button id="wfScanAgain" type="button" aria-label="Quét lại toàn bộ kênh và chương trình EPG">↻ Quét lại</button></div><progress id="wfLocalScanProgress" max="100" value="0" aria-label="Tiến độ phân loại"></progress></div>'+
  '<details id="wfSettings" class="wf-settings"><summary>⚙ Mô hình AI & dung lượng <small>Chọn · Tải · Xóa</small></summary><div class="wf-settings-body">'+
  '<h3>Chế độ AI</h3><div class="wf-modes" role="radiogroup" aria-label="Chế độ AI"><button type="button" data-wf-mode="standard" role="radio"><b>Tiêu chuẩn</b><small>Dưới 20 MB · Naive Bayes đang chạy</small></button><button type="button" data-wf-mode="smart" role="radio"><b>Smart · tự chuẩn bị</b><small>~118 MB lần đầu · không phải cài tay</small></button><button type="button" data-wf-mode="intelligence" role="radio"><b>Intelligence</b><small>Dùng AI đã có · tự tải nếu thiếu</small></button></div><p id="wfModeHint" class="wf-hint"></p>'+
  '<div id="wfStandardModels" class="wf-model-picker"><strong>① Tiêu chuẩn · 2 mô hình dưới 20 MB</strong><div class="wf-standard-list"><div><b>✓ Naive Bayes (đang dùng)</b><small>Đã tích hợp trong ứng dụng · không cần tải trọng số · hoạt động offline</small></div><button id="wfStandardInstalled" type="button">▶ Kiểm tra</button></div><div class="wf-standard-list"><div><b>fastText Quantized ~18 MB</b><small>Chưa có bộ trọng số tiếng Việt phân loại chương trình và bộ chạy được kiểm chứng. Không tự tải model không dùng được.</small></div><span class="wf-unavailable">Chưa hỗ trợ</span></div><small id="wfStandardStatus" role="status">Naive Bayes đã có sẵn · chỉ cần chọn Tiêu chuẩn để sử dụng. Không cần tải trọng số.</small></div>'+
  '<div id="wfSmartModels" class="wf-model-picker"><label for="wfSmartModelSelect">② Smart · 5 lựa chọn (2 có thể tải)</label><div class="wf-model-row"><select id="wfSmartModelSelect" aria-label="Chọn mô hình Smart"></select><button id="wfSmartInstall" type="button">↓ Tải mô hình</button><button id="wfSmartRemove" type="button" hidden>Xóa mô hình</button></div><small id="wfSmartProgress" role="status" aria-live="polite">Chọn Smart là ứng dụng tự chuẩn bị AI. Có thể tùy chỉnh mô hình tại đây nếu muốn.</small><div id="wfSmartDeleteConfirm" class="wf-delete-confirm" hidden><span id="wfSmartDeleteQuestion" class="wf-delete-question"></span><button id="wfSmartDeleteCancel" type="button" class="wf-delete-cancel">Hủy</button><button id="wfSmartDeleteYes" type="button" class="wf-delete-yes">Xác nhận xóa</button></div><p id="wfSmartModelBenefit" class="wf-model-benefit"></p><small id="wfSmartModelStatus" role="status"></small><details class="wf-smart-details" open><summary>So sánh cả 5 mô hình Smart · 2 khả dụng / 3 chưa hỗ trợ</summary><div id="wfSmartModelList" class="wf-smart-list"></div></details></div>'+
  '<div id="wfIntelligenceModels" class="wf-model-picker"><label for="wfModelSelect">③ Intelligence · các mô hình Qwen3 và Hy-MT2 dùng chung</label><small>Hiển thị mô hình đã tải và mô hình có thể cài từ kho AI của ứng dụng.</small><div class="wf-model-row"><select id="wfModelSelect" aria-label="Chọn mô hình AI đã có hoặc tải mới"><option value="auto">Tự chọn Qwen3 đã cài</option></select><button id="wfModelInstall" type="button" disabled>↓ Tải mô hình đã chọn</button></div><small id="wfModelStatus" role="status">Đang kiểm tra mô hình cục bộ…</small><small>Hy-MT2 chuyên dịch; Qwen3 dùng để phân loại trong Intelligence.</small></div>'+
  '<section class="wf-storage"><div class="wf-storage-head"><strong>Quản lý dung lượng AI</strong><b id="wfStorageTotal">Đang kiểm tra…</b></div><div id="wfStorageList" class="wf-storage-list"></div><small id="wfStorageStatus" role="status">Chỉ hiển thị dữ liệu AI thực tế đã lưu trên máy.</small></section>'+
  '<details class="wf-privacy"><summary>Tùy chọn nâng cao</summary><div class="wf-auto-banner"><label><input type="checkbox" id="wfAutoEnabled"/> Tra cứu thêm tên kênh công khai trên Internet</label><span id="wfAutoStatus" role="status"></span><small>Tra cứu Wikidata theo tên kênh, không gửi URL phát hay M3U.</small></div><div id="wfPrivacyControls"></div></details>'+
  '</div></details>'+
  '<nav class="wf-tabs" role="tablist" aria-label="Kết quả WatchFlow"><button type="button" data-wf-tab="suggest" role="tab">Dành cho bạn</button><button type="button" data-wf-tab="folders" role="tab">Chủ đề kênh</button><button type="button" data-wf-tab="programmes" role="tab">Chương trình EPG</button><button type="button" data-wf-tab="classify" role="tab">Tất cả kênh</button></nav>'+
  '<div id="wfContents" class="wf-contents" role="tabpanel" aria-live="polite"></div>'+
  '<footer class="wf-foot"><span id="wfOrigin">Tự động phân loại dữ liệu trên thiết bị.</span></footer>';
  row.insertAdjacentElement('afterend',panel);
  // The three primary modes belong in the main panel, not an advanced settings
  // drawer. Existing radio events, model configuration, and inference are reused.
  const mainModes=panel.querySelector('.wf-modes'),mainHint=panel.querySelector('#wfModeHint');
  const heading=panel.querySelector('.wf-settings-body > h3');
  if(heading?.textContent==='Chế độ AI')heading.remove();
  if(mainModes){
   const top=panel.querySelector('.wf-head');
   top?.insertAdjacentElement('afterend',mainModes);
   mainModes.insertAdjacentElement('afterend',mainHint);
   mainModes.setAttribute('aria-label','Chọn AI: Tiêu chuẩn, Smart, Intelligence');
  }

  const $=id=>doc.getElementById(id);
  const el=(name,cls='',text)=>{const x=doc.createElement(name);x.className=cls;if(text!==undefined)x.textContent=String(text);return x;};
  const modelCatalog=root.OpenIPTVWatchFlowModelCatalog,topicCatalog=root.OpenIPTVWatchFlowTopics,recommender=root.OpenIPTVWatchFlowRecommendations;
  let smartChoice=modelCatalog?.read(root.localStorage)||'tinybert-4l-int8';
  const smartSelect=$('wfSmartModelSelect'),smartList=$('wfSmartModelList');
  if(modelCatalog&&smartSelect){
   for(const item of modelCatalog.SMART){
    const option=el('option','',(item.downloadable?'↓ ':'• ')+item.label+' · '+item.size);
    option.value=item.id;smartSelect.append(option);
    const card=el('article','wf-smart-card');card.dataset.modelId=item.id;
    card.append(el('strong','',(item.downloadable?'Có thể tải: ':'Chưa khả dụng: ')+item.label+' · '+item.size),
     el('p','',item.advantage),el('small','',item.note));smartList.append(card);
   }
   smartSelect.value=smartChoice;
   smartSelect.addEventListener('change',()=>{
    if(!modelCatalog.getSmart(smartSelect.value))return;
    smartChoice=smartSelect.value;modelCatalog.save(root.localStorage,smartChoice);render();
   });
  }
  let mode='standard',tab='suggest';
  // Preserve disclosure state and how many entries were shown across background updates.
  const expandedFolders=new Set(),folderPageSizes=new Map();
  const folderKey=(kind,label)=>kind+':'+label;
  function rememberFolder(folder,key){
   if(folder.open)expandedFolders.add(key);else expandedFolders.delete(key);
  }
  try{const s=root.localStorage?.getItem('watchflow:demo-mode');if(['standard','smart','intelligence'].includes(s))mode=s;}catch{}
  const data=()=>{
   const st=root.IPTVState,channels=st?.getChannels?.()||[],current=st?.getCurrent?.()||null;
   const raw=st?.getStore?.()?.recentChannels||[];
   const title=$('ipvpNowTitle')?.textContent||'';
   const epg=/chưa có|chưa chọn|chương trình tiếp theo/i.test(title)?'':title;
   return {channels:Array.isArray(channels)?channels:[],recent:Array.isArray(raw)?raw:[],current,epg,guide:root.IPTVExtras?.getGuide?.()};
  };
  function rowFor(host,c,d,canPlay,reason=''){
   const item=el('article','wf-item');item.append(el('span','wf-icon',String(c.name||'TV').slice(0,2).toUpperCase()));
   const details=el('div','wf-item-main');
   const labels=topicCatalog?.distinct(d?.labels?.length?d.labels:[d?.label])||[d?.label||'Chưa phân loại'];
   details.append(el('strong','',c.name||'Kênh'),el('small','',labels.join(' · ')+' · '+(d.from||'Đang phân loại')));
   if(d?.epgCount)details.append(el('small','',d.epgCount+' chương trình EPG đã đọc'));
    if(reason)details.append(el('small','wf-reason',reason));
   item.append(details);
   if(c.demo)item.append(el('em','wf-sample','MINH HỌA'));
   else if(canPlay){const play=el('button','wf-play','▶ Xem');play.type='button';play.addEventListener('click',()=>{
     close();root.IPTVState?.playChannel?.(c.id);});item.append(play);}
   host.append(item);
  }
  function render(){
   const d=data(),real=d.channels.length>0,channels=real?d.channels:example;
   const local=auto?.getBackgroundAnalysis?.(root)||new Map();
    const analysis=local.size?local:(engine&&real?engine.analyze(d.channels.slice(0,24),d.guide,root.IPTVGuide):new Map());
    const learning=engine?.read(root.localStorage);
   // Standard uses bundled Naive Bayes; installed Smart ONNX can refine channel and EPG labels.
   const category=c=>analysis.has(String(c.id))?analysis.get(String(c.id)):classify(c,d.current?.id===c.id?d.epg:'');
   const learnedOrder=real?engine.rank(d.channels,analysis,learning,d.recent,Date.now(),mode):null;
   for(const x of panel.querySelectorAll('[data-wf-mode]')){const active=x.dataset.wfMode===mode;x.classList.toggle('wf-active',active);x.setAttribute('aria-checked',String(active));}
   for(const x of panel.querySelectorAll('[data-wf-tab]')){const active=x.dataset.wfTab===tab;x.classList.toggle('wf-active',active);x.setAttribute('aria-selected',String(active));}
   $('wfModeHint').textContent=mode==='standard'?'Standard · Naive Bayes nhẹ, tự phân loại toàn bộ kênh và EPG offline.':mode==='smart'?'Smart · Ứng dụng tự tải AI đa ngôn ngữ (~118 MB) lần đầu và tự quét. Không cần tìm tệp mô hình.':'Intelligence · Tự phân loại EPG bằng bộ nhẹ; Qwen3 native có thể phân tích sâu khi đã cài.';
   // Exclusive mode accordion: only the selected model family is expanded.
   const standardArea=$('wfStandardModels');if(standardArea){standardArea.hidden=mode!=='standard';standardArea.classList.toggle('wf-model-current',mode==='standard');}
   const name=standardArea?.querySelector('.wf-standard-list b');
   if(name)name.textContent=mode==='standard'?'✓ Naive Bayes (đang dùng)':'✓ Naive Bayes (đã tích hợp)';
   const smartArea=$('wfSmartModels');if(smartArea){smartArea.hidden=mode!=='smart';smartArea.classList.toggle('wf-model-current',mode==='smart');}
   void refreshSmartUI();
   if(modelCatalog){
    const selected=modelCatalog.getSmart(smartChoice);
    smartSelect.value=selected?.id||modelCatalog.SMART[0].id;
    $('wfSmartModelBenefit').textContent=selected?.advantage||'';
    $('wfSmartModelStatus').textContent=selected?.downloadable?
     'ONNX INT8 có nguồn xác minh · '+selected.size+' · chạy trên thiết bị sau khi tải. Không tự tải model.':
     'Đã lưu cấu hình: '+(selected?.label||'')+'. Chưa có trọng số/bộ chạy được xác minh — chưa kích hoạt mô hình Smart.';
    for(const card of smartList.children)card.classList.toggle('wf-smart-selected',card.dataset.modelId===smartChoice);
   }
   const modelArea=$('wfIntelligenceModels');if(modelArea){modelArea.hidden=mode!=='intelligence';modelArea.classList.toggle('wf-model-current',mode==='intelligence');}
   $('wfOrigin').textContent=real?'Quét tự động từ playlist/EPG đã nhập. Không tự phát kênh.':'Chưa có nguồn; thêm playlist là hệ thống tự quét.';
   const autoEnabled=$('wfAutoEnabled');if(autoEnabled)autoEnabled.checked=auto?.enabled(root.localStorage)!==false;
   const discovered=auto?.collect(root.localStorage,d.channels,engine)||[];
   const research=auto?.internetProgress?.(root.localStorage,d.channels);
   if($('wfAutoStatus'))$('wfAutoStatus').textContent=auto?.enabled(root.localStorage)===false?
    'Internet tắt · quét EPG trong máy vẫn chạy':
    research?'Internet: '+research.searched+'/'+research.total+' tên kênh đã tra · '+
     research.matched+' có nguồn khớp · '+research.failed+' lỗi · '+research.used+'/'+research.limit+
     ' lượt hôm nay. Tự tiếp tục khi còn hạn mức.':'Đang chuẩn bị tra cứu tên kênh công khai.';
   showLocalProgress();
   const main=$('wfContents');
   // Never collapse a folder when Qwen3/EPG delivers new labels.
   for(const folder of main.querySelectorAll('.wf-topic-folder[data-folder-key]')){
    rememberFolder(folder,folder.dataset.folderKey);
   }
   const preservedScroll=main.scrollTop;
   main.replaceChildren();main.append(el('p','wf-source',real?'Dữ liệu hiện có · '+d.channels.length+' kênh':'XEM TRƯỚC · DỮ LIỆU MINH HỌA'));
   main.scrollTop=preservedScroll;
   if(tab==='overview'){
    const metrics=el('div','wf-metrics'),known=[...analysis.values()].filter(x=>x.label!=='Chưa phân loại').length,localStatus=auto?.getLocalStatus?.(root)||{};
    for(const [title,value] of [['Tổng kênh',real?d.channels.length:'—'],['Đã phân loại',real?known:'—'],['EPG đã đọc',real?(localStatus.epgProgrammes||0):'—'],['Thời gian đã học',mode==='standard'?'Tắt':Math.floor(Object.values(learning?.seconds||{}).reduce((a,b)=>a+Number(b||0),0)/60)+' phút'],['Nguồn EPG',d.guide?.programmes?.length?'Có':'Chưa có']]){
     const tile=el('div','wf-metric');tile.append(el('strong','',value),el('small','',title));metrics.append(tile);}main.append(metrics,el('h3','','Nhóm nội dung'));
    const count=new Map();for(const record of analysis.values()){
     const labels=topicCatalog?.distinct(record.labels?.length?record.labels:[record.label])||[record.label||'Chưa phân loại'];
     for(const label of labels.length?labels:['Chưa phân loại'])count.set(label,(count.get(label)||0)+1);
    }
    for(const [name,n] of [...count].sort((a,b)=>b[1]-a[1]).slice(0,6)){
     const bar=el('div','wf-bar');bar.append(el('span','',name));const track=el('div','wf-track'),fill=el('i','wf-fill');
     fill.style.width=(100*n/Math.max(1,analysis.size))+'%';track.append(fill);bar.append(track,el('b','',n));main.append(bar);}
    main.append(el('p','wf-hint',mode==='standard'?'Naive Bayes dự đoán từ tên kênh + EPG.':mode==='smart'?'Smart bổ sung chủ đề từ mô hình ONNX đã tải; nếu chưa tải thì Naive Bayes vẫn phân loại.':'Intelligence vẫn dùng phân loại EPG cục bộ; Qwen3 đã cài sẽ bổ sung chủ đề cho các kênh trong nền.'));
   }else if(tab==='folders'){
    main.append(el('h3','','Thư mục chủ đề · một kênh có thể thuộc nhiều nhóm'));
    const categories=topicCatalog?.folders(d.channels,analysis)||[];
    if(!real||!categories.length)main.append(el('p','wf-hint','Chưa có playlist hoặc chưa có chủ đề. Hệ thống tự phân tích khi dữ liệu sẵn sàng.'));
    for(const [label,items] of categories){
     const folder=el('details','wf-topic-folder'),summary=el('summary','',label+' · '+items.length+' kênh');
     const key=folderKey('channel',label);folder.dataset.folderKey=key;
     folder.append(summary);const list=el('div','wf-list'),counter=el('small','wf-folder-count'),more=el('button','wf-more','Xem thêm');
     more.type='button';let limit=folderPageSizes.get(key)||24;
     const draw=()=>{
      list.replaceChildren();
      for(const ch of items.slice(0,limit))rowFor(list,ch,category(ch),real);
      counter.textContent='Hiển thị '+Math.min(limit,items.length)+'/'+items.length;
      more.hidden=limit>=items.length;
     };
     more.addEventListener('click',()=>{limit+=24;folderPageSizes.set(key,limit);draw();});
     folder.append(counter,list,more);
     folder.addEventListener('toggle',()=>{rememberFolder(folder,key);if(folder.open&&!list.children.length)draw();});
     if(expandedFolders.has(key)){folder.open=true;draw();}
     main.append(folder);
    }
   }else if(tab==='programmes'){
    main.append(el('h3','','Thư mục chương trình EPG · phân loại theo nội dung phát sóng'));
    const programmes=topicCatalog?.programmes(analysis)||[];
    if(!programmes.length){
     main.append(el('p','wf-hint',d.guide?.programmes?.length?
      'Có EPG nhưng chưa ghép được chương trình với kênh trong playlist. Kiểm tra tvg-id hoặc ánh xạ EPG.':
      'Chưa có EPG đã tải. Khi EPG được tải, các chương trình sẽ tự xuất hiện theo chủ đề.'));
    }else{
     const group=new Map([...(topicCatalog?.LABELS||[]),'Chưa phân loại'].map(x=>[x,[]]));
     for(const p of programmes){
      const labels=topicCatalog?.distinct(p.labels)||[];
      for(const label of labels.length?labels:['Chưa phân loại'])group.get(label)?.push(p);
     }
     const channelsById=new Map(d.channels.map(c=>[String(c.id),c]));
     for(const [label,items] of group){
      if(!items.length)continue;
      const folder=el('details','wf-topic-folder'),summary=el('summary','',label+' · '+items.length+' chương trình');
      const key=folderKey('epg',label);folder.dataset.folderKey=key;
      const list=el('div','wf-programme-list'),counter=el('small','wf-folder-count'),more=el('button','wf-more','Xem thêm chương trình');
      more.type='button';let limit=folderPageSizes.get(key)||24;
      const draw=()=>{
       list.replaceChildren();
       for(const p of items.slice(0,limit)){
        const ch=channelsById.get(String(p.channelId)),entry=el('article','wf-programme');
        const body=el('div','wf-item-main');
        const when=new Date(p.start).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
        body.append(el('strong','',p.title||'Chương trình chưa có tên'),
         el('small','',when+' · '+(ch?.name||'Kênh không rõ')+' · '+(p.labels||[]).join(', ')));
        entry.append(body);
        if(ch){const play=el('button','wf-play','▶ Xem kênh');play.type='button';
         play.addEventListener('click',()=>{close();root.IPTVState?.playChannel?.(ch.id);});entry.append(play);}
        list.append(entry);
       }
       counter.textContent='Hiển thị '+Math.min(limit,items.length)+'/'+items.length+' chương trình';
       more.hidden=limit>=items.length;
      };
      more.addEventListener('click',()=>{limit+=24;folderPageSizes.set(key,limit);draw();});
      folder.append(summary,counter,list,more);
      folder.addEventListener('toggle',()=>{rememberFolder(folder,key);if(folder.open&&!list.children.length)draw();});
      if(expandedFolders.has(key)){folder.open=true;draw();}
      main.append(folder);
     }
    }
   }else if(tab==='classify'||tab==='suggest'){
    main.append(el('h3','',tab==='classify'?'Tất cả kênh · tìm theo tên và chủ đề':'Gợi ý tự động từ EPG và thói quen xem'));
    const list=el('div','wf-list');if(tab==='classify')main.append(list);
    if(tab==='suggest'){
     const suggested=recommender?.channels?.(d.channels,analysis,learning,d.recent,d.current,Date.now(),8)||[];
     const ranked=suggested.length?suggested:learnedOrder?.slice(0,8).map(x=>({channel:x.channel,reason:x.reason}))||[];
     const top=el('section','wf-result-section');
     top.append(el('h3','','Kênh nên xem'));
     const channelList=el('div','wf-list');
     if(!real)channelList.append(el('p','wf-hint','Chưa nhập playlist. Khi có kênh, đề xuất sẽ tự cập nhật.'));
     for(const x of ranked)rowFor(channelList,x.channel,category(x.channel),real,x.reason);
     top.append(channelList);main.append(top);
     const upcoming=recommender?.programmes?.(analysis,d.channels,learning,d.recent,Date.now(),10)||[];
     const section=el('section','wf-result-section'),heading=el('h3','','Chương trình phù hợp hôm nay & sắp chiếu');
     section.append(heading);
     if(!upcoming.length)section.append(el('p','wf-hint',d.guide?.programmes?.length?
      'EPG chưa ghép được với kênh trong playlist. Kiểm tra tvg-id hoặc ánh xạ EPG.':
      'Chưa có lịch EPG để đề xuất chương trình. WatchFlow sẽ tự cập nhật khi tải được lịch.'));
     else{
      const schedule=el('div','wf-programme-list');
      for(const item of upcoming){
       const entry=el('article','wf-programme'),body=el('div','wf-item-main');
       const when=item.live?'Đang phát':new Date(item.programme.start).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
       body.append(el('strong','',item.programme.title||'Chương trình'),
        el('small','',when+' · '+String(item.channel.name||'Kênh')),
        el('small','wf-reason',item.reason));
       entry.append(body);
       if(item.channel?.id){
        const play=el('button','wf-play','▶ Xem kênh');play.type='button';
        play.addEventListener('click',()=>{close();root.IPTVState?.playChannel?.(item.channel.id);});
        entry.append(play);
       }
       schedule.append(entry);
      }
      section.append(schedule);
     }
     main.append(section);
    }else{
     const search=el('input','wf-channel-search');
     search.type='search';search.placeholder='Tìm tên kênh hoặc chủ đề trong toàn bộ danh sách…';
     search.setAttribute('aria-label','Tìm kênh đã phân loại');main.insertBefore(search,list);
     const counter=el('p','wf-hint'),more=el('button','wf-more','Hiện thêm kênh');
     more.type='button';main.append(counter,more);let shown=40;
     const draw=()=>{
      const query=search.value.trim().toLocaleLowerCase('vi-VN');
      const found=channels.filter(c=>!query||String(c.name||'').toLocaleLowerCase('vi-VN').includes(query)
       ||String(c.group||'').toLocaleLowerCase('vi-VN').includes(query)
       ||(category(c).labels||[category(c).label]).some(v=>String(v||'').toLocaleLowerCase('vi-VN').includes(query)));
      list.replaceChildren();
      for(const c of found.slice(0,shown))rowFor(list,c,category(c),real);
      counter.textContent='Hiển thị '+Math.min(shown,found.length)+'/'+found.length+' kênh. Tất cả đều được quét trong nền.';
      more.hidden=shown>=found.length;
     };
     search.addEventListener('input',()=>{shown=40;draw();});
     more.addEventListener('click',()=>{shown+=40;draw();});
     draw();
    }
   }else{
    main.append(el('h3','','AI tự phát hiện kênh công khai'));
    const catalog=el('div','wf-internet-results');
    if(!discovered.length)catalog.append(el('p','wf-hint','Chưa có mục mới; hệ thống tự quét nền khi ứng dụng mở và có mạng.'));
    for(const found of discovered.slice(0,12)){const item=el('div','wf-item'),detail=el('div','wf-item-main'),link=el('a','wf-external','Wikidata');
      detail.append(el('strong','',found.name),el('small','',(found.category||'Chưa phân loại')+' · '+found.description));
      link.href=found.url;link.target='_blank';link.rel='noopener noreferrer';item.append(detail,link);catalog.append(item);}
    main.append(catalog,el('h3','','Tìm thêm theo từ khóa (tùy chọn)'));
    const form=el('div','wf-search'),input=el('input',''),action=el('button','','Tra cứu Wikidata');
    input.type='search';input.placeholder='Ví dụ: bóng đá, tin tức, phim...';input.setAttribute('aria-label','Tìm kênh');
    action.type='button';form.append(input,action);main.append(form);
    const results=el('div','wf-list');main.append(results);
    const update=()=>{results.replaceChildren();const q=input.value.trim().toLocaleLowerCase();
      const filtered=(real?d.channels:[]).filter(c=>String(c.name||'').toLocaleLowerCase().includes(q)||String(c.group||'').toLocaleLowerCase().includes(q)||category(c).label.toLocaleLowerCase().includes(q)).slice(0,10);
      if(!q)results.append(el('p','wf-hint','Nhập từ khóa để tìm trong playlist hiện có.'));
      else if(!filtered.length)results.append(el('p','wf-hint','Không tìm thấy trong playlist. Có thể tìm trên trang web chính thức.'));
      else for(const c of filtered)rowFor(results,c,category(c),true);
    };input.addEventListener('input',update);
    const internetResults=el('div','wf-internet-results');main.append(internetResults);
    action.addEventListener('click',async()=>{const q=input.value.trim();if(!q){input.focus();return;}
      action.disabled=true;internetResults.replaceChildren(el('p','wf-hint','Đang tìm thông tin trên Wikidata...'));
      try{const found=await engine.searchInternet(q);internetResults.replaceChildren();
        if(!found.length)internetResults.append(el('p','wf-hint','Không tìm thấy kênh phù hợp.'));
        for(const x of found){const card=el('div','wf-item'),body=el('div','wf-item-main'),link=el('a','wf-external','Xem thông tin');
          body.append(el('strong','',x.name),el('small','',x.description||'Wikidata'));link.href=x.url;link.target='_blank';link.rel='noopener noreferrer';card.append(body,link);internetResults.append(card);}
      }catch(error){internetResults.replaceChildren(el('p','wf-hint','Lỗi tìm kiếm: '+String(error?.message||error).slice(0,140)));}
      finally{action.disabled=false;}
    });
    update();main.append(el('p','wf-hint','Tự khám phá không cần nhập từ khóa. Tìm thủ công chỉ để bổ sung khi cần; không tự nhập nguồn phát.'));
   }
  }
  function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');}
  button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)render();});
  $('wfClose').addEventListener('click',()=>{close();button.focus();});
  // Smart ONNX download and delete are real local CacheStorage + WASM operations.
  // Nothing is downloaded when the user merely opens a menu or chooses a model.
  const smartRuntime=root.OpenIPTVWatchFlowSmart;
  const smartInstall=$('wfSmartInstall'),smartRemove=$('wfSmartRemove'),smartProgress=$('wfSmartProgress');
  let smartBusy=false,smartStatusRequest=0;
  $('wfStandardInstalled').addEventListener('click',()=>{
   const model=engine?.predict?.('Trực tiếp bóng đá đội tuyển giải vô địch');
   const ok=!!model?.label&&model.label!=='Chưa phân loại'&&Number(model.confidence)>0;
   $('wfStandardStatus').textContent=ok?
    '✓ Naive Bayes đang hoạt động offline · bài kiểm tra: '+model.label+' ('+model.confidence+'%). Không cần tải thêm.':
    'Không kiểm tra được Naive Bayes; vui lòng cập nhật bản Rust Lab.';
  });
  async function refreshSmartUI(){
   const request=++smartStatusRequest;
   const id=smartSelect.value,model=modelCatalog?.getSmart(id),ready=!!model?.downloadable;
   smartInstall.disabled=smartBusy||!ready;
   smartInstall.textContent=ready?'↓ Tải '+(model.label||'mô hình'):'Chưa có bản chạy';
   smartRemove.hidden=true;
   if(!ready){
    if(!smartBusy)smartProgress.textContent='Chưa có trọng số và bộ chạy phù hợp; không thể tải mô hình này.';
    return;
   }
   if(!smartRuntime?.installed){
    smartProgress.textContent='Thiếu bộ quản lý Smart trong bản cài. Hãy cập nhật Rust Lab.';
    return;
   }
   try{
    const installed=await smartRuntime.installed(root,id);
    if(smartSelect.value!==id||request!==smartStatusRequest)return;
    smartInstall.disabled=smartBusy||installed;
    smartInstall.textContent=installed?'✓ Đã cài và kiểm tra':'↓ Tải '+model.label;
    smartRemove.hidden=!installed;
    smartRemove.disabled=smartBusy;
    if(installed&&!smartBusy)smartProgress.textContent='Mô hình đã lưu trên thiết bị · '+model.size+'. Phân tích kênh mới tự động khi chọn Thông minh.';
   }catch(error){
    if(request===smartStatusRequest)smartProgress.textContent='Không kiểm tra được mô hình: '+String(error?.message||error).slice(0,160);
   }
  }
  smartSelect.addEventListener('change',()=>{void refreshSmartUI();});
  smartInstall.addEventListener('click',async()=>{
   if(smartBusy)return;
   const id=smartSelect.value,model=modelCatalog?.getSmart(id);
   if(!model?.downloadable){
    smartProgress.textContent='Mô hình '+(model?.label||id)+' chưa có bộ chạy ONNX đã xác minh.';
    return;
   }
   if(!smartRuntime?.install){
    smartProgress.textContent='Thiếu bộ tải ONNX trong phiên bản ứng dụng đang chạy. Hãy cài bản Rust Lab mới.';
    return;
   }
   // The explicit click on "↓ Tải" is consent; native WebView confirm() may be
   // unsupported or silently return false. Start immediately and show progress.
   smartBusy=true;smartInstall.disabled=true;smartRemove.disabled=true;
   smartInstall.textContent='Đang tải…';
   const update=event=>{
    const percentage=Number(event?.progress);
    smartProgress.textContent=event?.status==='progress'&&Number.isFinite(percentage)?
     'Đang tải '+model.label+' · '+percentage.toFixed(0)+'%':
     'Đang chuẩn bị ONNX '+model.label+' · '+String(event?.status||'tải trọng số');
   };
   try{
    smartProgress.textContent='Đã nhận lệnh tải · '+model.label+' · đang kết nối máy chủ mô hình…';
    await smartRuntime.install(root,id,update);
    smartProgress.textContent='✓ Đã tải và chạy thử thành công · '+model.label;
    doc.dispatchEvent(new Event('openiptv:watchflow-smart-installed'));
   }catch(error){
    const message=String(error?.stack||error?.message||error).slice(0,360);
    smartProgress.textContent='Tải/kiểm tra thất bại: '+message;
   }finally{smartBusy=false;await refreshSmartUI();}
  });
  const smartDeleteBox=$('wfSmartDeleteConfirm'),smartDeleteQuestion=$('wfSmartDeleteQuestion'),
   smartDeleteCancel=$('wfSmartDeleteCancel'),smartDeleteYes=$('wfSmartDeleteYes');
  smartSelect.addEventListener('change',()=>{smartDeleteBox.hidden=true;});
  smartRemove.addEventListener('click',()=>{
   if(smartBusy||smartRemove.hidden)return;
   const model=modelCatalog?.getSmart(smartSelect.value);
   if(!model?.downloadable||!smartRuntime?.remove){
    smartProgress.textContent='Không có API xóa mô hình Smart đã tải.';
    return;
   }
   smartDeleteQuestion.textContent='Xóa '+model.label+'? Mô hình sẽ cần tải lại khi sử dụng.';
   smartDeleteBox.hidden=false;smartDeleteYes.focus();
  });
  smartDeleteCancel.addEventListener('click',()=>{
   smartDeleteBox.hidden=true;
   smartProgress.textContent='Đã hủy xóa mô hình Smart.';
  });
  smartDeleteYes.addEventListener('click',async()=>{
   if(smartBusy||smartDeleteBox.hidden)return;
   const id=smartSelect.value,model=modelCatalog?.getSmart(id);
   if(!model?.downloadable||!smartRuntime?.remove)return;
   smartBusy=true;smartDeleteYes.disabled=true;smartInstall.disabled=true;
   smartProgress.textContent='Đang xóa cache của '+model.label+'…';
   try{
    await smartRuntime.remove(root,id);
    smartDeleteBox.hidden=true;
    smartProgress.textContent='Đã xóa '+model.label+' · giữ nguyên playlist và dữ liệu EPG.';
   }catch(error){
    smartProgress.textContent='Không thể xóa '+model.label+': '+String(error?.message||error).slice(0,200);
   }finally{
    smartBusy=false;smartDeleteYes.disabled=false;await refreshSmartUI();
   }
  });
  // Reuse native MLX model inventory; installing a model requires the user's click.
  const native=root.streamleaf, modelIds=['qwen06','qwen17','qwen4','qwen8','hymt18','hymt18q8','hymt7','hymt7q8'];
  const selectionKey='watchflow:intelligence-model-v1';
  const modelSelect=$('wfModelSelect'),modelStatus=$('wfModelStatus'),installButton=$('wfModelInstall'),storageList=$('wfStorageList'),storageTotal=$('wfStorageTotal'),storageStatus=$('wfStorageStatus');
  let modelInventory={}, modelSupported=false,modelRefreshing=false,modelOperation=false;
  const human=n=>Number.isFinite(+n)&&+n>0?(+n/(1024*1024)).toFixed(+n>1024**3?0:1)+' MB':'Chưa tải';
  const getSelected=()=>modelInventory[modelSelect.value];
  function updateModelStatus(){
   const chosen=getSelected(),installed=modelIds.filter(id=>modelInventory[id]?.installed&&modelInventory[id]?.runtimeReady);
   if(modelSelect.value==='auto'){
    modelStatus.textContent=installed.length?'Đã có '+installed.length+' mô hình AI dùng chung. Chọn mô hình cụ thể để quản lý.':'Chưa có mô hình MLX sẵn sàng. Chọn Qwen3 rồi nhấn Tải.';
    installButton.disabled=true;return;
   }
   const title=chosen?.label||modelSelect.value;
   modelStatus.textContent=!modelSupported?'MLX chỉ hỗ trợ Mac Apple Silicon trên bản hiện tại.':
    chosen?.installed?(title+' · đã tải '+human(chosen.bytes)+' · '+(chosen.runtimeReady?'sẵn sàng; WatchFlow sẽ tự dùng khi chọn Intelligence':'cần cài/sửa runtime MLX')):
    (title+' · chưa tải · dự kiến '+human(chosen?.approxBytes)+'.');
   installButton.disabled=!modelSupported||!chosen||!!(chosen.installed&&chosen.runtimeReady)||modelRefreshing||modelOperation;
   installButton.textContent=chosen?.installed?'Sửa bộ chạy MLX':'↓ Tải mô hình đã chọn';
  }
  async function refreshModels(){
   if(modelRefreshing)return;
   modelRefreshing=true;installButton.disabled=true;modelStatus.textContent='Đang kiểm tra các mô hình AI đã tải…';
   try{
    if(!native?.aiStorageStatus)throw Error('Không chạy trong ứng dụng Tauri native');
    const inventory=await native.aiStorageStatus();
    modelInventory=inventory?.models||{};modelSupported=!!inventory?.mlxAvailable;
     storageTotal.textContent=human(inventory?.totalBytes||0);
     storageList.replaceChildren();
     const present=(inventory?.storage||[]).filter(item=>item?.present&&Number(item.bytes)>0)
      .sort((a,b)=>Number(b.bytes||0)-Number(a.bytes||0));
     if(!present.length)storageList.append(el('p','wf-hint','Chưa có model hoặc dữ liệu AI đã tải.'));
     for(const asset of present){
      const row=el('div','wf-storage-row'),identity=el('div','wf-item-main');
      const label=String(asset.label||asset.id),id=String(asset.id);
      identity.append(el('strong','',label),el('small','',human(asset.bytes)));
      const remove=el('button','wf-model-remove','Xóa');
      remove.type='button';remove.setAttribute('aria-label','Xóa '+label+' và giải phóng dung lượng');
      remove.disabled=modelOperation;
      const confirmation=el('div','wf-delete-confirm');
      confirmation.hidden=true;
      const question=el('span','wf-delete-question','Xóa '+label+' ('+human(asset.bytes)+')? Tính năng đang dùng model sẽ cần tải lại.');
      const cancel=el('button','wf-delete-cancel','Hủy');
      const confirm=el('button','wf-delete-yes','Xác nhận xóa');
      cancel.type=confirm.type='button';
      confirmation.append(question,cancel,confirm);
      function hideConfirmation(){confirmation.hidden=true;remove.disabled=modelOperation;}
      cancel.addEventListener('click',()=>{hideConfirmation();storageStatus.textContent='Đã hủy xóa '+label+'.';});
      remove.addEventListener('click',()=>{
       if(modelOperation)return;
       if(!native?.aiRemoveModel){storageStatus.textContent='Không thể xóa: cần mở ứng dụng Rust Lab native để quản lý model.';return;}
       for(const section of storageList.querySelectorAll('.wf-delete-confirm'))section.hidden=true;
       for(const button of storageList.querySelectorAll('.wf-model-remove'))button.disabled=false;
       confirmation.hidden=false;remove.disabled=true;
       storageStatus.textContent='Đang chờ xác nhận xóa '+label+'. Chưa có dữ liệu nào bị xóa.';
       confirm.focus();
      });
      confirm.addEventListener('click',async()=>{
       if(modelOperation||confirmation.hidden)return;
       if(!native?.aiRemoveModel){storageStatus.textContent='Không có API xóa native.';return;}
       modelOperation=true;confirm.disabled=cancel.disabled=true;
       for(const b of panel.querySelectorAll('.wf-model-remove'))b.disabled=true;
       installButton.disabled=true;storageStatus.textContent='Đang xóa '+label+'…';
       try{
        const result=await native.aiRemoveModel(id);
        if(modelSelect.value===id)modelSelect.value='auto';
        await refreshModels();
        storageStatus.textContent='Đã xóa '+label+' · giải phóng '+human(result?.freed||asset.bytes)+'.';
       }catch(error){
        const message=String(error?.message||error).slice(0,200);
        storageStatus.textContent='Không thể xóa '+label+': '+message;
        confirmation.hidden=false;
       }finally{
        modelOperation=false;confirm.disabled=cancel.disabled=false;
        for(const b of panel.querySelectorAll('.wf-model-remove'))b.disabled=false;
       }
      });
      row.append(identity,remove);
      const section=el('div','wf-storage-unit');section.append(row,confirmation);storageList.append(section);
     }
     if(present.length)storageStatus.textContent=present.length+' mục AI đang lưu · xóa sẽ yêu cầu xác nhận.';
    const previous=modelSelect.value;
    modelSelect.replaceChildren();
    const add=(value,text)=>{const o=doc.createElement('option');o.value=value;o.textContent=text;modelSelect.append(o);};
    add('auto','Tự chọn mô hình đã cài (không tải)');
    for(const id of modelIds){const state=modelInventory[id];if(!state)continue;
      add(id,(state.installed?'✓ Đã tải · ':'↓ Có thể tải · ')+(state.label||id)+(state.installed?' · '+human(state.bytes):' · ~'+human(state.approxBytes)));
    }
    let saved='auto';try{saved=root.localStorage?.getItem(selectionKey)||'auto';}catch{}
    const available=Array.from(modelSelect.options).map(o=>o.value);
    const stored=available.includes(previous)?previous:available.includes(saved)?saved:'auto';
    const already=modelIds.filter(id=>modelInventory[id]?.installed&&modelInventory[id]?.runtimeReady);
    modelSelect.value=stored==='auto'&&already.length?already[0]:stored;
    updateModelStatus();
   }catch(error){modelStatus.textContent='Chưa đọc được mô hình cục bộ: '+String(error?.message||error).slice(0,110);storageStatus.textContent='Không truy cập được bộ nhớ AI: '+String(error?.message||error).slice(0,120);installButton.disabled=true;}
   finally{modelRefreshing=false;updateModelStatus();}
  }
  modelSelect.addEventListener('change',()=>{
    try{root.localStorage?.setItem(selectionKey,modelSelect.value);}catch{}
    // Choosing a Qwen3 model also activates Intelligence; otherwise its local
    // inference and the independent Internet search would stay in Standard.
    if(/^qwen(?:06|17|4|8)$/.test(modelSelect.value)){
     mode='intelligence';try{root.localStorage?.setItem('watchflow:demo-mode',mode);}catch{}
     $('wfSettings').open=true;render();
     if(auto?.enabled?.(root.localStorage)!==false)
      doc.dispatchEvent(new Event('openiptv:watchflow-auto-rescan'));
    }
    updateModelStatus();
   });
  $('wfSettings').addEventListener('toggle',()=>{if($('wfSettings').open)void refreshModels();});
  installButton.addEventListener('click',async()=>{
   const key=modelSelect.value,state=getSelected();
   if(modelOperation||modelRefreshing||!modelIds.includes(key)||!modelSupported||!state||!native?.aiInstallModel)return;
   if(state.installed&&state.runtimeReady)return;
   modelOperation=true;installButton.disabled=true;modelStatus.textContent='Đang cài đặt mô hình qua bộ quản lý AI Rust Lab…';
    for(const b of panel.querySelectorAll('.wf-model-remove'))b.disabled=true;
   try{await native.aiInstallModel(key);modelStatus.textContent='Đã hoàn tất yêu cầu cài; đang xác minh trọng số và bộ chạy…';}
   catch(error){modelStatus.textContent='Cài mô hình thất bại: '+String(error?.message||error).slice(0,160);}
   finally{modelOperation=false;await refreshModels();}
  });
  // Automatic local scan runs independently of this panel; no refresh click is required.
  void refreshModels();
  $('wfAutoEnabled').checked=auto?.enabled(root.localStorage)!==false;
  $('wfAutoEnabled').addEventListener('change',event=>{auto?.setEnabled(root.localStorage,event.target.checked);if(event.target.checked)doc.dispatchEvent(new Event('openiptv:watchflow-auto-rescan'));render();});
  function showLocalProgress(){
    const x=auto?.getLocalStatus?.(root)||{},status=$('wfLocalScanStatus'),bar=$('wfLocalScanProgress');
    if(!status||!bar)return;
    if(x.error)status.textContent='Lỗi phân tích: '+x.error;
    else if(x.warning)status.textContent='Đã phân loại '+x.processed+'/'+x.total+' kênh. '+x.warning;
    else if(!x.total)status.textContent='Chờ playlist; sẽ tự quét khi có kênh hoặc EPG';
    else status.textContent=(x.running?'Đang kiểm tra EPG ':'Đã phân loại ')+x.processed+'/'+x.total+' kênh · '+
     x.newChannels+' kênh mới · '+x.newProgrammes+' mục EPG mới · '+x.classified+' kênh có chủ đề'+
     (x.storage==='indexeddb'?' · đã lưu an toàn':'');
    bar.value=x.total?Math.round(100*(x.processed||0)/x.total):0;
   }
   let renderPending=false;
   function scheduleResultsUpdate(){
    if(renderPending||panel.hidden)return;
    renderPending=true;
    root.setTimeout(()=>{renderPending=false;if(!panel.hidden)render();},650);
   }
   const manualButton=$('wfScanAgain');
   manualButton.addEventListener('click',()=>{
    manualButton.disabled=true;manualButton.textContent='Đang quét…';
    doc.dispatchEvent(new Event('openiptv:watchflow-manual-rescan'));
   });
   doc.addEventListener('openiptv:watchflow-auto-update',event=>{
    showLocalProgress();
    if(event.detail?.local&&event.detail?.complete){
     manualButton.disabled=false;manualButton.textContent='↻ Quét lại';
    }
    // Do not rebuild open folders while Qwen3 is streaming per-channel progress.
    if(!panel.hidden&&event.detail?.complete)scheduleResultsUpdate();
   });
  auto?.start(root,engine);
  const reset=el('button','wf-clear','Xóa sở thích đã học');reset.type='button';
  $('wfPrivacyControls')?.append(reset);
  reset.addEventListener('click',()=>{if(root.confirm?.('Xóa dữ liệu sở thích WatchFlow đã lưu trên máy?')!==true)return;engine.clear(root.localStorage);render();});
  engine?.monitor(root,()=>mode,ch=>auto?.getBackgroundAnalysis?.(root)?.get(String(ch.id))||engine.analyze([ch],root.IPTVExtras?.getGuide?.(),root.IPTVGuide).get(String(ch.id)));
  for(const b of panel.querySelectorAll('[data-wf-tab]'))b.addEventListener('click',()=>{tab=b.dataset.wfTab;render();});
  for(const b of panel.querySelectorAll('[data-wf-mode]'))b.addEventListener('click',()=>{
    mode=b.dataset.wfMode;try{root.localStorage?.setItem('watchflow:demo-mode',mode);}catch{}
    $('wfSettings').open=true;render();
    if(mode==='intelligence'){
     void refreshModels();
     if(auto?.enabled?.(root.localStorage)!==false)
      doc.dispatchEvent(new Event('openiptv:watchflow-auto-rescan'));
    }
   });
  doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close();});
  return true;
 }
 if(root?.document){
  root.document.addEventListener('openiptv:unified-ai-ready',initialize);
  root.document.addEventListener('openiptv:renderer-ready',initialize);
  if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
 }
 return Object.freeze({initialize,classify,recommend});
});
