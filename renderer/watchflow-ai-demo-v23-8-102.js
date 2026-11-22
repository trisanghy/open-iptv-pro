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
  panel.innerHTML='<div class="wf-head"><div><small>WATCHFLOW · TỰ ĐỘNG KHÁM PHÁ (BETA)</small><h2>AI Phân tích kênh & Đề xuất</h2><p>Phân loại kênh, khám phá nội dung và học sở thích xem TV.</p></div><button id="wfClose" type="button" aria-label="Đóng">×</button></div>'+
  '<div class="wf-local-banner"><strong>✓ Tự động quét toàn bộ kênh và EPG</strong><span id="wfLocalScanStatus" role="status" aria-live="polite">Đang kiểm tra danh sách kênh…</span><progress id="wfLocalScanProgress" max="100" value="0" aria-label="Tiến độ phân tích kênh"></progress><small>Quét offline, không cần thao tác, không gửi playlist hoặc URL phát ra Internet.</small></div><div class="wf-modes" role="radiogroup" aria-label="Chế độ AI"><button type="button" data-wf-mode="standard" role="radio"><b>◈ Tiêu chuẩn</b><small>Naive Bayes · EPG · tên kênh</small><small class="wf-size">Dưới 20 MB · Naive Bayes đang chạy</small></button><button type="button" data-wf-mode="smart" role="radio"><b>ϟ Thông minh</b><small>TinyBERT · MobileBERT · E5 · MiniLM · PhoBERT</small><small class="wf-size">Dưới 200 MB · tự chọn mô hình</small><small class="wf-fallback">Chưa cài trọng số · dùng Standard để phân loại</small></button><button type="button" data-wf-mode="intelligence" role="radio"><b>✧ Intelligence</b><small>Dùng chung Qwen3/Hy-MT2 đã tải hoặc tải thêm</small><small class="wf-size">Dung lượng theo mô hình · Không tải trùng</small><small class="wf-fallback">Hiện chỉ xếp hạng EPG, chưa chạy LLM</small></button></div>'+
  '<p id="wfModeHint" class="wf-hint"></p><div id="wfSmartModels" class="wf-model-picker" hidden><label for="wfSmartModelSelect">Chọn mô hình Smart (dưới 200 MB)</label><div class="wf-model-row"><select id="wfSmartModelSelect" aria-label="Chọn mô hình Smart"></select></div><p id="wfSmartModelBenefit" class="wf-model-benefit"></p><small id="wfSmartModelStatus" role="status"></small><details class="wf-smart-details"><summary>So sánh ưu điểm các mô hình Smart</summary><div id="wfSmartModelList" class="wf-smart-list"></div></details></div><div id="wfIntelligenceModels" class="wf-model-picker" hidden><label for="wfModelSelect">Mô hình Intelligence dùng chung</label><div class="wf-model-row"><select id="wfModelSelect" aria-label="Chọn mô hình AI đã có hoặc tải mới"><option value="auto">Tự chọn mô hình đã cài</option></select><button id="wfModelRefresh" type="button">↻ Làm mới</button><button id="wfModelInstall" type="button" disabled>Tải mô hình đã chọn</button></div><small id="wfModelStatus" role="status">Đang kiểm tra mô hình cục bộ…</small></div><div class="wf-auto-banner"><label><input type="checkbox" id="wfAutoEnabled"/> Tìm thêm thông tin kênh công khai trên Internet</label><span id="wfAutoStatus" role="status">Đang chuẩn bị quét nền…</span><small>Chỉ tra tên kênh công khai và chủ đề trên Wikidata; không gửi URL phát, không tự nhập M3U. Có thể tắt bất cứ lúc nào.</small></div><nav class="wf-tabs" role="tablist" aria-label="Chức năng WatchFlow"><button type="button" data-wf-tab="overview" role="tab">Tổng quan</button><button type="button" data-wf-tab="classify" role="tab">Phân loại EPG</button><button type="button" data-wf-tab="suggest" role="tab">Đề xuất cho bạn</button><button type="button" data-wf-tab="search" role="tab">Tìm kênh Internet</button></nav>'+
  '<div id="wfContents" class="wf-contents" role="tabpanel" aria-live="polite"></div><footer class="wf-foot"><span id="wfOrigin">Dữ liệu trong máy được phân tích tự động.</span></footer>';
  row.insertAdjacentElement('afterend',panel);
  const $=id=>doc.getElementById(id);
  const el=(name,cls='',text)=>{const x=doc.createElement(name);x.className=cls;if(text!==undefined)x.textContent=String(text);return x;};
  const modelCatalog=root.OpenIPTVWatchFlowModelCatalog;
  let smartChoice=modelCatalog?.read(root.localStorage)||'tinybert-4l-int8';
  const smartSelect=$('wfSmartModelSelect'),smartList=$('wfSmartModelList');
  if(modelCatalog&&smartSelect){
   for(const item of modelCatalog.SMART){
    const option=el('option','',item.label+' · '+item.size);option.value=item.id;smartSelect.append(option);
    const card=el('article','wf-smart-card');card.dataset.modelId=item.id;
    card.append(el('strong','',item.label+' · '+item.size),el('p','',item.advantage),el('small','',item.note));smartList.append(card);
   }
   smartSelect.value=smartChoice;
   smartSelect.addEventListener('change',()=>{
    if(!modelCatalog.getSmart(smartSelect.value))return;
    smartChoice=smartSelect.value;modelCatalog.save(root.localStorage,smartChoice);render();
   });
  }
  let mode='standard',tab='suggest';
  try{const s=root.localStorage?.getItem('watchflow:demo-mode');if(['standard','smart','intelligence'].includes(s))mode=s;}catch{}
  const data=()=>{
   const st=root.IPTVState,channels=st?.getChannels?.()||[],current=st?.getCurrent?.()||null;
   const raw=st?.getStore?.()?.recentChannels||[];
   const title=$('ipvpNowTitle')?.textContent||'';
   const epg=/chưa có|chưa chọn|chương trình tiếp theo/i.test(title)?'':title;
   return {channels:Array.isArray(channels)?channels:[],recent:Array.isArray(raw)?raw:[],current,epg,guide:root.IPTVExtras?.getGuide?.()};
  };
  function rowFor(host,c,d,canPlay){
   const item=el('article','wf-item');item.append(el('span','wf-icon',String(c.name||'TV').slice(0,2).toUpperCase()));
   const details=el('div','wf-item-main');details.append(el('strong','',c.name||'Kênh'),el('small','',d.label+' · '+d.from));item.append(details);
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
   // Standard runs the real bundled Naive Bayes. Smart dropdown persists a target, not a working model.
   const category=c=>analysis.has(String(c.id))?analysis.get(String(c.id)):classify(c,d.current?.id===c.id?d.epg:'');
   const learnedOrder=real?engine.rank(d.channels,analysis,learning,d.recent,Date.now(),mode):null;
   for(const x of panel.querySelectorAll('[data-wf-mode]')){const active=x.dataset.wfMode===mode;x.classList.toggle('wf-active',active);x.setAttribute('aria-checked',String(active));}
   for(const x of panel.querySelectorAll('[data-wf-tab]')){const active=x.dataset.wfTab===tab;x.classList.toggle('wf-active',active);x.setAttribute('aria-selected',String(active));}
   $('wfModeHint').textContent=mode==='standard'?'Standard · Naive Bayes nhẹ, tự phân loại toàn bộ kênh và EPG offline.':mode==='smart'?'Smart · Chọn mô hình dưới 200 MB. Khi chưa có bộ chạy, Standard vẫn quét tự động.':'Intelligence · Tự phân loại EPG bằng bộ nhẹ; Qwen3 native có thể phân tích sâu khi đã cài.';
   const smartArea=$('wfSmartModels');if(smartArea)smartArea.hidden=mode!=='smart';
   if(mode==='smart'&&modelCatalog){
    const selected=modelCatalog.getSmart(smartChoice);
    smartSelect.value=selected?.id||modelCatalog.SMART[0].id;
    $('wfSmartModelBenefit').textContent=selected?.advantage||'';
    $('wfSmartModelStatus').textContent='Đã lưu cấu hình: '+(selected?.label||'')+'. Chưa có trọng số/bộ chạy được xác minh — chưa kích hoạt mô hình Smart. Kích thước chỉ là ước tính; bắt buộc dưới 200 MB (gồm tokenizer).';
    for(const card of smartList.children)card.classList.toggle('wf-smart-selected',card.dataset.modelId===smartChoice);
   }
   const modelArea=$('wfIntelligenceModels');if(modelArea)modelArea.hidden=mode!=='intelligence';
   $('wfOrigin').textContent=real?'Quét tự động từ playlist/EPG đã nhập. Không tự phát kênh.':'Chưa có nguồn; thêm playlist là hệ thống tự quét.';
   const autoEnabled=$('wfAutoEnabled');if(autoEnabled)autoEnabled.checked=auto?.enabled(root.localStorage)!==false;
   const discovered=auto?.collect(root.localStorage,d.channels,engine)||[];
   if($('wfAutoStatus'))$('wfAutoStatus').textContent=auto?.enabled(root.localStorage)===false?'Internet tắt · quét EPG trong máy vẫn chạy':'Wikidata đã lưu '+discovered.length+' mục thông tin công khai';
   showLocalProgress();
   const main=$('wfContents');main.replaceChildren();main.append(el('p','wf-source',real?'Dữ liệu hiện có · '+d.channels.length+' kênh':'XEM TRƯỚC · DỮ LIỆU MINH HỌA'));
   if(tab==='overview'){
    const metrics=el('div','wf-metrics'),known=[...analysis.values()].filter(x=>x.label!=='Chưa phân loại').length,localStatus=auto?.getLocalStatus?.(root)||{};
    for(const [title,value] of [['Tổng kênh',real?d.channels.length:'—'],['Đã phân loại',real?known:'—'],['EPG đã đọc',real?(localStatus.epgProgrammes||0):'—'],['Thời gian đã học',mode==='standard'?'Tắt':Math.floor(Object.values(learning?.seconds||{}).reduce((a,b)=>a+Number(b||0),0)/60)+' phút'],['Nguồn EPG',d.guide?.programmes?.length?'Có':'Chưa có']]){
     const tile=el('div','wf-metric');tile.append(el('strong','',value),el('small','',title));metrics.append(tile);}main.append(metrics,el('h3','','Nhóm nội dung'));
    const count=new Map();for(const record of analysis.values()){const label=record.label||'Chưa phân loại';count.set(label,(count.get(label)||0)+1);}
    for(const [name,n] of [...count].sort((a,b)=>b[1]-a[1]).slice(0,6)){
     const bar=el('div','wf-bar');bar.append(el('span','',name));const track=el('div','wf-track'),fill=el('i','wf-fill');
     fill.style.width=(100*n/Math.max(1,analysis.size))+'%';track.append(fill);bar.append(track,el('b','',n));main.append(bar);}
    main.append(el('p','wf-hint',mode==='standard'?'Naive Bayes dự đoán từ tên kênh + EPG.':mode==='smart'?'Smart chưa có model chạy; bảng này vẫn là kết quả Naive Bayes của Standard.':'Intelligence đang xếp hạng EPG + giờ xem, chưa gọi mô hình LLM.'));
   }else if(tab==='classify'||tab==='suggest'){
    main.append(el('h3','',tab==='classify'?'Tất cả kênh · tìm theo tên và chủ đề':'Gợi ý tự động từ EPG và thói quen xem'));
    const list=el('div','wf-list');main.append(list);
    if(tab==='suggest'){
     const ordered=learnedOrder?learnedOrder.slice(0,12).map(x=>x.channel):recommend(channels,d.recent,d.current?.id).slice(0,12);
     for(const c of ordered)rowFor(list,c,category(c),real);
     main.append(el('p','wf-hint',real?'Gợi ý cập nhật sau mỗi lần quét EPG. Chỉ phát khi bạn nhấn Xem.':'Ví dụ minh họa; thêm playlist để nhận gợi ý thật.'));
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
       ||String(category(c).label||'').toLocaleLowerCase('vi-VN').includes(query));
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
  // Reuse native MLX model inventory; installing a model requires the user's click.
  const native=root.streamleaf, modelIds=['qwen06','qwen17','qwen4','qwen8','hymt18','hymt18q8','hymt7','hymt7q8'];
  const selectionKey='watchflow:intelligence-model-v1';
  const modelSelect=$('wfModelSelect'),modelStatus=$('wfModelStatus'),installButton=$('wfModelInstall');
  let modelInventory={}, modelSupported=false,modelRefreshing=false;
  const human=n=>Number.isFinite(+n)&&+n>0?(+n/(1024*1024)).toFixed(+n>1024**3?0:1)+' MB':'Chưa tải';
  const getSelected=()=>modelInventory[modelSelect.value];
  function updateModelStatus(){
   const chosen=getSelected(),installed=modelIds.filter(id=>modelInventory[id]?.installed&&modelInventory[id]?.runtimeReady);
   if(modelSelect.value==='auto'){
    modelStatus.textContent=installed.length?'Đã tìm thấy '+installed.length+' mô hình dùng chung: '+installed.map(id=>modelInventory[id].label||id).join(', ')+'. Chưa có suy luận LLM WatchFlow.':'Chưa có mô hình MLX dùng được. Bạn có thể chọn tải, không tải tự động.';
    installButton.disabled=true;return;
   }
   const title=chosen?.label||modelSelect.value;
   modelStatus.textContent=!modelSupported?'MLX chỉ hỗ trợ Mac Apple Silicon trên bản hiện tại.':
    chosen?.installed?(title+' · đã tải '+human(chosen.bytes)+' · '+(chosen.runtimeReady?'sẵn sàng cho tác vụ MLX; chưa nối WatchFlow':'cần cài/sửa runtime MLX')):
    (title+' · chưa tải · dự kiến '+human(chosen?.approxBytes)+'.');
   installButton.disabled=!modelSupported||!chosen||!!(chosen.installed&&chosen.runtimeReady)||modelRefreshing;
   installButton.textContent=chosen?.installed?'Sửa bộ chạy MLX':'Tải mô hình đã chọn';
  }
  async function refreshModels(){
   if(modelRefreshing)return;
   modelRefreshing=true;installButton.disabled=true;modelStatus.textContent='Đang kiểm tra các mô hình AI đã tải…';
   try{
    if(!native?.aiStorageStatus)throw Error('Không chạy trong ứng dụng Tauri native');
    const inventory=await native.aiStorageStatus();
    modelInventory=inventory?.models||{};modelSupported=!!inventory?.mlxAvailable;
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
   }catch(error){modelStatus.textContent='Chưa đọc được mô hình cục bộ: '+String(error?.message||error).slice(0,110);installButton.disabled=true;}
   finally{modelRefreshing=false;updateModelStatus();}
  }
  modelSelect.addEventListener('change',()=>{try{root.localStorage?.setItem(selectionKey,modelSelect.value);}catch{}updateModelStatus();});
  $('wfModelRefresh').addEventListener('click',()=>void refreshModels());
  installButton.addEventListener('click',async()=>{
   const key=modelSelect.value,state=getSelected();
   if(!modelIds.includes(key)||!modelSupported||!state||!native?.aiInstallModel)return;
   if(state.installed&&state.runtimeReady)return;
   modelRefreshing=true;installButton.disabled=true;modelStatus.textContent='Đang cài đặt mô hình qua bộ quản lý AI Rust Lab…';
   try{await native.aiInstallModel(key);modelStatus.textContent='Đã hoàn tất yêu cầu cài; đang xác minh trọng số và bộ chạy…';}
   catch(error){modelStatus.textContent='Cài mô hình thất bại: '+String(error?.message||error).slice(0,160);}
   finally{modelRefreshing=false;await refreshModels();}
  });
  // Automatic local scan runs independently of this panel; no refresh click is required.
  void refreshModels();
  $('wfAutoEnabled').checked=auto?.enabled(root.localStorage)!==false;
  $('wfAutoEnabled').addEventListener('change',event=>{auto?.setEnabled(root.localStorage,event.target.checked);if(event.target.checked)doc.dispatchEvent(new Event('openiptv:watchflow-auto-rescan'));render();});
  function showLocalProgress(){
    const x=auto?.getLocalStatus?.(root)||{},status=$('wfLocalScanStatus'),bar=$('wfLocalScanProgress');
    if(!status||!bar)return;
    if(x.error)status.textContent='Lỗi quét: '+x.error;
    else if(!x.total)status.textContent='Chờ playlist; sẽ tự quét khi có kênh hoặc EPG';
    else status.textContent=(x.running?'Đang quét ':'Đã quét ')+x.processed+'/'+x.total+' kênh · '+
     x.epgProgrammes+' mục EPG · '+x.classified+' kênh có chủ đề'+(!x.guideProgrammes?' · chưa có EPG':'');
    bar.value=x.total?Math.round(100*(x.processed||0)/x.total):0;
   }
   doc.addEventListener('openiptv:watchflow-auto-update',event=>{
    if(panel.hidden)return;
    showLocalProgress();
    if(event.detail?.complete)render();
   });
  auto?.start(root,engine);
  const reset=el('button','wf-clear','Xóa sở thích đã học');reset.type='button';
  panel.querySelector('.wf-foot')?.append(reset);
  reset.addEventListener('click',()=>{if(root.confirm?.('Xóa dữ liệu sở thích WatchFlow đã lưu trên máy?')!==true)return;engine.clear(root.localStorage);render();});
  engine?.monitor(root,()=>mode,ch=>auto?.getBackgroundAnalysis?.(root)?.get(String(ch.id))||engine.analyze([ch],root.IPTVExtras?.getGuide?.(),root.IPTVGuide).get(String(ch.id)));
  for(const b of panel.querySelectorAll('[data-wf-tab]'))b.addEventListener('click',()=>{tab=b.dataset.wfTab;render();});
  for(const b of panel.querySelectorAll('[data-wf-mode]'))b.addEventListener('click',()=>{mode=b.dataset.wfMode;try{root.localStorage?.setItem('watchflow:demo-mode',mode);}catch{}render();if(mode==='intelligence')void refreshModels();});
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
