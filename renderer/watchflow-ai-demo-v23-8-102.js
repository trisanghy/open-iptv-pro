'use strict';
/* WatchFlow UI preview: no AI model, crawling, source import or new playback path. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.initialize();
})(typeof window==='undefined'?null:window,function(root){
 const engine=root.OpenIPTVWatchFlowEngine;
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
  panel.setAttribute('aria-label','WatchFlow AI bản xem trước');
  panel.innerHTML='<div class="wf-head"><div><small>WATCHFLOW · GIAO DIỆN DEMO</small><h2>AI Phân tích kênh & Đề xuất</h2><p>Phân loại kênh, khám phá nội dung và học sở thích xem TV.</p></div><button id="wfClose" type="button" aria-label="Đóng">×</button></div>'+
  '<div class="wf-modes" role="radiogroup" aria-label="Chế độ AI"><button type="button" data-wf-mode="standard" role="radio"><b>◈ Tiêu chuẩn</b><small>EPG · Tên kênh · Quy tắc</small><small class="wf-size">0 MB · Không tải thêm</small></button><button type="button" data-wf-mode="smart" role="radio"><b>ϟ Thông minh</b><small>Bayes ML · Học sở thích thật</small><small class="wf-size">Dưới 1 MB · Offline</small></button><button type="button" data-wf-mode="intelligence" role="radio"><b>✧ Intelligence</b><small>EPG + Khung giờ · Xếp hạng ngữ cảnh</small><small class="wf-size">0 MB thêm · Qwen3 ~1,4 GB nếu cài*</small></button></div>'+
  '<p id="wfModeHint" class="wf-hint"></p><nav class="wf-tabs" role="tablist" aria-label="Chức năng WatchFlow"><button type="button" data-wf-tab="overview" role="tab">Tổng quan</button><button type="button" data-wf-tab="classify" role="tab">Phân loại EPG</button><button type="button" data-wf-tab="suggest" role="tab">Đề xuất cho bạn</button><button type="button" data-wf-tab="search" role="tab">Tìm kênh Internet</button></nav>'+
  '<div id="wfContents" class="wf-contents" role="tabpanel" aria-live="polite"></div><footer class="wf-foot"><span id="wfOrigin">Không tự thu thập dữ liệu.</span><button type="button" id="wfRefresh">↻ Làm mới</button></footer>';
  row.insertAdjacentElement('afterend',panel);
  const $=id=>doc.getElementById(id);
  const el=(name,cls='',text)=>{const x=doc.createElement(name);x.className=cls;if(text!==undefined)x.textContent=String(text);return x;};
  let mode='standard',tab='overview';
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
   const d=data(),real=d.channels.length>0,channels=(real?d.channels:example).slice(0,120);
   const analysis=engine&&real?engine.analyze(d.channels,d.guide,root.IPTVGuide):new Map(),learning=engine?.read(root.localStorage);
   const category=c=>mode!=='standard'&&analysis.has(String(c.id))?analysis.get(String(c.id)):classify(c,d.current?.id===c.id?d.epg:'');
   const learnedOrder=real&&mode!=='standard'?engine.rank(d.channels,analysis,learning,d.recent,Date.now(),mode):null;
   for(const x of panel.querySelectorAll('[data-wf-mode]')){const active=x.dataset.wfMode===mode;x.classList.toggle('wf-active',active);x.setAttribute('aria-checked',String(active));}
   for(const x of panel.querySelectorAll('[data-wf-tab]')){const active=x.dataset.wfTab===tab;x.classList.toggle('wf-active',active);x.setAttribute('aria-selected',String(active));}
   $('wfModeHint').textContent=mode==='standard'?'Tiêu chuẩn: quy tắc EPG, không ghi sở thích.':mode==='smart'?'Smart: học máy Bayes thực tế trên thiết bị, tích lũy sở thích khi phát video.':'Intelligence: xếp hạng ngữ cảnh EPG + giờ xem; Qwen3 hiện chưa được kết nối vào WatchFlow (giao diện thử nghiệm).';
   $('wfOrigin').textContent=real?'Dữ liệu kênh từ playlist đang nhập, lịch sử trên thiết bị.':'Dữ liệu ví dụ, chưa có playlist và EPG thực tế.';
   const main=$('wfContents');main.replaceChildren();main.append(el('p','wf-source',real?'Dữ liệu hiện có · '+d.channels.length+' kênh':'XEM TRƯỚC · DỮ LIỆU MINH HỌA'));
   if(tab==='overview'){
    const metrics=el('div','wf-metrics'),known=channels.filter(c=>category(c).label!=='Chưa phân loại').length;
    for(const [title,value] of [['Tổng kênh',real?d.channels.length:'—'],['Đã phân loại',real?known:'—'],['Thời gian đã học',mode==='standard'?'Tắt':Math.floor(Object.values(learning?.seconds||{}).reduce((a,b)=>a+Number(b||0),0)/60)+' phút'],['EPG hiện tại',d.epg?'Có':'Chưa có']]){
     const tile=el('div','wf-metric');tile.append(el('strong','',value),el('small','',title));metrics.append(tile);}main.append(metrics,el('h3','','Nhóm nội dung'));
    const count=new Map();for(const c of channels){const s=category(c).label;count.set(s,(count.get(s)||0)+1);}
    for(const [name,n] of [...count].sort((a,b)=>b[1]-a[1]).slice(0,6)){
     const bar=el('div','wf-bar');bar.append(el('span','',name));const track=el('div','wf-track'),fill=el('i','wf-fill');
     fill.style.width=(100*n/channels.length)+'%';track.append(fill);bar.append(track,el('b','',n));main.append(bar);}
    main.append(el('p','wf-hint',mode==='standard'?'Quy tắc tên kênh + EPG.':mode==='smart'?'Học máy Naive Bayes phân tích dữ liệu chương trình EPG thực tế.':'Xếp hạng thực theo sở thích + chương trình EPG + giờ xem; chưa có LLM suy luận.'));
   }else if(tab==='classify'||tab==='suggest'){
    main.append(el('h3','',tab==='classify'?'Phân loại kênh theo EPG và chủ đề':'Gợi ý dựa trên các kênh đã xem gần đây'));
    const list=el('div','wf-list'),ordered=tab==='suggest'?(learnedOrder?learnedOrder.slice(0,8).map(x=>x.channel):recommend(channels,d.recent,d.current?.id).slice(0,8)):channels.slice(0,16);
    for(const c of ordered)rowFor(list,c,category(c),real&&tab==='suggest');main.append(list);
    if(tab==='suggest')main.append(el('p','wf-hint',!real?'Chưa có playlist: các kênh MINH HỌA.':mode==='standard'?'Ưu tiên kênh đã xem.':'Gợi ý thực từ thời lượng xem, EPG đang chiếu và khung giờ quen thuộc.'));
   }else{
    main.append(el('h3','','Tìm kênh theo tên, chủ đề hoặc EPG'));
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
    update();main.append(el('p','wf-hint','Wikidata trả về thông tin kênh, không phải URL phát. Chỉ tìm khi bạn bấm nút, không tự nhập stream.'));
   }
  }
  function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');}
  button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)render();});
  $('wfClose').addEventListener('click',()=>{close();button.focus();});
  $('wfRefresh').addEventListener('click',render);
  const reset=el('button','wf-clear','Xóa sở thích đã học');reset.type='button';
  panel.querySelector('.wf-foot')?.append(reset);
  reset.addEventListener('click',()=>{if(root.confirm?.('Xóa dữ liệu sở thích WatchFlow đã lưu trên máy?')!==true)return;engine.clear(root.localStorage);render();});
  engine?.monitor(root,()=>mode,ch=>engine.analyze([ch],root.IPTVExtras?.getGuide?.(),root.IPTVGuide).get(String(ch.id)));
  for(const b of panel.querySelectorAll('[data-wf-tab]'))b.addEventListener('click',()=>{tab=b.dataset.wfTab;render();});
  for(const b of panel.querySelectorAll('[data-wf-mode]'))b.addEventListener('click',()=>{mode=b.dataset.wfMode;try{root.localStorage?.setItem('watchflow:demo-mode',mode);}catch{}render();});
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
