'use strict';
/* WatchFlow source-by-source audit. The user explicitly starts an audit: it
 * reads the CURRENT playlist and EPG, optionally queries a bounded set of
 * public channel names on Wikidata, and displays evidence without inventing
 * internet classifications or editing playlists/stream URLs. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root);
})(typeof window==='undefined'?null:window,function(){
 const UNKNOWN='Chưa rõ',NOT_SEARCHED='Chưa tra cứu';
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
 const unique=v=>[...new Set((v||[]).filter(x=>typeof x==='string'&&x&&x!=='Chưa phân loại'))];
 function internetFor(channel,queryCache,auto,topics,clock=Date.now(),disabled=false){
  if(disabled)return{label:'Đã tắt',status:'disabled',url:'',description:''};
  const name=auto?.publicName?.(channel?.name)||'';
  const entry=queryCache?.[name.toLowerCase()];
  if(!entry||!(clock-entry.at<48*3600*1000))return{label:NOT_SEARCHED,status:'pending',url:'',description:''};
  if(entry.failed)return{label:'Tra cứu lỗi · sẽ thử lại',status:'failed',url:'',description:''};
  const match=(entry.items||[]).find(item=>auto?.isTv?.(item)&&auto?.matchesName?.(name,item)&&auto?.validPublicUrl?.(item.url));
  if(!match)return{label:'Đã tìm · không có nguồn khớp',status:'no-match',url:'',description:''};
  const labels=unique(topics?.fromText?.(match.name+' '+match.description)||[]);
  return{label:labels.join(', ')||'Có nguồn · chưa xác định chủ đề',labels,status:'matched',
   url:auto?.validPublicUrl?.(match.url)?match.url:'',
   description:String(match.description||'').slice(0,160)};
 }
 function localLabels(ch,engine,topics){
  const exact=unique(topics?.channelLabels?.(ch)||[]);
  const pred=engine?.predict?.(String(ch.name||'')+' '+String(ch.group||ch.groupTitle||''));
  if(!exact.length&&pred?.label&&pred.label!=='Chưa phân loại'&&pred.confidence>=40)exact.push(pred.label);
  return exact;
 }
 function epgFor(meta){
  const programmes=Array.isArray(meta?.programmes)?meta.programmes:[];
  const scores=new Map();
  for(const topic of meta?.topics||[])if(topic?.label&&Number(topic.score)>0)scores.set(topic.label,Number(topic.score));
  if(!scores.size)for(const p of programmes)for(const label of unique(p.labels))scores.set(label,(scores.get(label)||0)+1);
  const labels=[...scores].sort((a,b)=>b[1]-a[1]).map(([label])=>label).slice(0,4);
  const count=Math.max(0,Number(meta?.epgCount)||programmes.length);
  return{labels,count,title:String(meta?.programme||programmes[0]?.title||'').slice(0,160)};
 }
 function buildRows({channels=[],analysis=new Map(),storage,auto,engine,topics,clock=Date.now(),internetDisabled=false,currentId=''}={}){
  const cache=auto?.read?.(storage)?.queries||{};
  return channels.filter(x=>x?.id).map((ch,index)=>{
   const meta=analysis.get(String(ch.id))||{};
   const nameLabels=localLabels(ch,engine,topics),epg=epgFor(meta);
   const internet=internetFor(ch,cache,auto,topics,clock,internetDisabled);
   const internetLabels=unique(internet.labels||[]);
   const all=unique([...nameLabels,...epg.labels,...internetLabels]);
   const recommended=meta.label&&meta.label!=='Chưa phân loại'?meta.label:
    (topics?.primary?.(all)||all[0]||'Chưa phân loại');
   const vote=[nameLabels,epg.labels,internetLabels].filter(labels=>labels.includes(recommended)).length;
   const sources=[nameLabels.length>0,epg.labels.length>0,internetLabels.length>0].filter(Boolean).length;
   return{ id:String(ch.id),name:String(ch.name||'Không tên').slice(0,140),group:String(ch.group||ch.groupTitle||'').slice(0,120),
    nameLabels,epg,internet,final:recommended,vote,sources,isCurrent:String(ch.id)===String(currentId),index};
  });
 }
 function sortRows(rows,sort='category',filter=''){
  const q=norm(filter);
  const result=rows.filter(x=>!q||norm([x.name,x.group,x.final,...x.nameLabels,...x.epg.labels,...x.internet.labels||[]].join(' ')).includes(q));
  const categorySort=(a,b)=>a.final.localeCompare(b.final,'vi')||b.vote-a.vote||b.sources-a.sources;
  return result.sort((a,b)=>{
   let x=0;
   if(sort==='evidence')x=b.sources-a.sources||b.vote-a.vote;
   else if(sort==='name')x=a.name.localeCompare(b.name,'vi');
   else if(sort==='unknown')x=Number(a.nameLabels.length>0)-Number(b.nameLabels.length>0)||
    Number(a.epg.labels.length>0)-Number(b.epg.labels.length>0)||Number(a.internet.status==='matched')-Number(b.internet.status==='matched');
   else if(sort==='internet')x=Number(b.internet.status==='matched')-Number(a.internet.status==='matched')||
    Number(a.internet.status==='pending')-Number(b.internet.status==='pending');
   else if(sort==='current')x=Number(b.isCurrent)-Number(a.isCurrent)||b.sources-a.sources;
   else x=categorySort(a,b);
   return x||a.name.localeCompare(b.name,'vi')||a.index-b.index;
  });
 }
 function totals(rows){
  return{total:rows.length,channel:rows.filter(x=>x.nameLabels.length).length,
   epg:rows.filter(x=>x.epg.count>0).length,epgClassified:rows.filter(x=>x.epg.labels.length).length,
   searched:rows.filter(x=>['matched','no-match','unclear'].includes(x.internet.status)).length,
   noMatch:rows.filter(x=>x.internet.status==='no-match').length,
   errors:rows.filter(x=>x.internet.status==='failed').length,
   unsearched:rows.filter(x=>x.internet.status==='pending').length,
   matched:rows.filter(x=>x.internet.status==='matched').length,
   agreed:rows.filter(x=>x.vote>=2).length};
 }
 function mount(win){
  const doc=win?.document;if(!doc)return false;
  if(win.__watchflowAuditMount)return true;win.__watchflowAuditMount=true;
  let rows=[],limit=50,running=false,researching=false,ready=false,sort='unknown',search='';
  const text=(tag,cls,value)=>{const el=doc.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=String(value);return el;};
  const api={
   get auto(){return win.OpenIPTVWatchFlowAuto;},
   get engine(){return win.OpenIPTVWatchFlowEngine;},
   get topics(){return win.OpenIPTVWatchFlowTopics;}
  };
  let panel,button,researchButton,status,summary,results,select,input,more;
  function label(v){return Array.isArray(v)&&v.length?v.slice(0,3).join(', '):UNKNOWN;}
  function addCell(tr,title,body,sub='',link=''){
   const td=text('td','wf-audit-cell');
   td.append(text('strong','',body));
   if(sub)td.append(text('small','',sub));
   if(link){const a=text('a','','Xem bằng chứng Internet');a.href=link;a.target='_blank';a.rel='noopener noreferrer';td.append(a);}
   tr.append(td);
  }
  function render(){
   const n=totals(rows),shown=sortRows([...rows],sort,search);
   const localCount=n.total;
   const budget=api.auto?.internetProgress?.(win.localStorage,win.IPTVState?.getChannels?.()||[]);
   summary.textContent=localCount+' kênh · '+n.channel+' có nhãn theo tên/nhóm · '+n.epgClassified+' có chủ đề EPG · Internet: '+n.matched+' có nguồn / '+n.noMatch+' đã tìm nhưng không thấy / '+n.errors+' lỗi / '+n.unsearched+' chưa tìm'+
    (budget?' · hạn mức hôm nay '+budget.used+'/'+budget.limit:'')+' · '+n.agreed+' kênh có ≥2 nguồn đồng ý.';
   if(researchButton){
    researchButton.disabled=researching||!budget?.enabled||budget.used>=budget.limit;
    researchButton.textContent=researching?'Đang tra cứu…':!budget?.enabled?'Internet đã tắt':budget.used>=budget.limit?'Hết lượt hôm nay':'Tìm Internet tiếp (tối đa 6)';
   }
   results.replaceChildren();
   for(const item of shown.slice(0,limit)){
    const tr=text('tr',item.isCurrent?'wf-audit-current':'');
    addCell(tr,'Kênh',item.name,item.group+(item.isCurrent?' · Đang phát':''));
    addCell(tr,'Tên/nhóm',label(item.nameLabels));
    addCell(tr,'EPG',label(item.epg.labels),item.epg.count?(item.epg.count+' chương trình · '+item.epg.title):'Không có EPG phù hợp');
    addCell(tr,'Internet',item.internet.label,item.internet.description,item.internet.url);
    addCell(tr,'Kết quả',item.final,item.sources+'/3 nguồn có chủ đề · '+item.vote+' nguồn khớp kết quả');
    results.append(tr);
   }
   more.hidden=shown.length<=limit;
   more.textContent='Xem thêm · '+Math.min(limit,shown.length)+'/'+shown.length+' kênh';
   if(!shown.length)results.append(text('tr','wf-audit-empty','Không có kênh phù hợp bộ lọc.'));
  }
  function showReport(){
   // An inline report can be pushed outside the viewport under a very long
   // model manager. Native <dialog> puts the result into the top layer so the
   // click must show something immediately on desktop and mobile.
   panel.hidden=false;
   try{
    if(typeof panel.showModal==='function'&&!panel.open)panel.showModal();
    else if(!panel.open)panel.setAttribute('open','');
   }catch{
    if(!panel.open)panel.setAttribute('open','');
    panel.scrollIntoView?.({block:'start',behavior:'instant'});
   }
   button.setAttribute('aria-expanded','true');
  }
  function hideReport(){
   if(typeof panel.close==='function'&&panel.open)panel.close();
   else panel.removeAttribute('open');
   panel.hidden=true;button.setAttribute('aria-expanded','false');
  }
  async function run(){
   // Always present the report before expensive per-channel EPG inference.
   showReport();
   if(running){status.textContent='Đang kiểm tra dữ liệu, bảng kết quả sẽ tiếp tục cập nhật…';return;}
   running=true;button.disabled=true;button.textContent='Đang kiểm tra…';
   status.textContent='Đang đọc kênh và EPG hiện tại…';
   try{
    const channels=(win.IPTVState?.getChannels?.()||[]).filter(x=>x?.id);
    if(!channels.length){rows=[];render();status.textContent='Chưa có playlist. Hãy thêm nguồn kênh để kiểm tra dữ liệu thật.';return;}
    const guide=win.IPTVExtras?.getGuide?.()||null;
    const auto=api.auto,engine=api.engine,topics=api.topics;
    if(!engine?.analyzeChannel||!auto?.scanLocal)throw Error('Thiếu bộ phân loại WatchFlow trong phiên bản này');
    let analysis=auto.getBackgroundAnalysis?.(win)||new Map();
    const disabled=auto.enabled?.(win.localStorage)===false;
    const present=win.IPTVState?.getCurrent?.();
    const args={channels,analysis,storage:win.localStorage,auto,engine,topics,internetDisabled:disabled,currentId:present?.id};
    // Show all existing real channels immediately using the last known cache.
    // A 560-channel EPG rescan never blocks the first visible result.
    rows=buildRows(args);limit=50;render();
    status.textContent='Đã hiển thị '+rows.length+' kênh hiện có · đang cập nhật EPG theo từng đợt…';
    // Audit freshly reads every channel and its EPG. It NEVER rewrites playlist data.
    const local=await auto.scanLocal({channels,guide,guideLib:win.IPTVGuide,engine,batchSize:50,force:true,
     yieldNow:()=>new Promise(resolve=>win.setTimeout(resolve,0)),
     onProgress:p=>{status.textContent='Đang phân loại EPG '+p.processed+'/'+p.total+' kênh…';}});
    if(!local.cancelled){
     analysis=new Map([...analysis,...local.analysis]);
    }
    args.analysis=analysis;
    rows=buildRows(args);render();
    if(disabled){
     status.textContent='Đã kiểm tra tên kênh + EPG. Internet đang tắt trong cài đặt WatchFlow; không gửi yêu cầu ra ngoài.';
     return;
    }
    status.textContent='Kết quả cục bộ đã có. Đang tìm nguồn trên Wikidata và Wikipedia tiếng Việt (tối đa 6 tên kênh)…';
    // Existing discovery limit: no bulk scraping, no stream URLs and no bypass
    // of the user's privacy setting or the 72-query daily budget.
    let lookup=null;
    try{
     lookup=await auto.scan({storage:win.localStorage,channels,analysis,engine,lookup:q=>(engine.searchChannelMetadata||engine.searchInternet)(q),
      budget:6,onUpdate:x=>{
       if(x.requests){
         status.textContent='Internet: đã tìm '+x.requests+' tên kênh trong lượt này · đang cập nhật bảng…';
         rows=buildRows(args);render();
        }
      }});
    }catch(err){lookup={requests:0,error:String(err?.message||err)};}
    rows=buildRows(args);render();
    const counts=totals(rows);
    status.textContent='Hoàn tất · '+channels.length+' kênh · tra cứu mới '+Number(lookup.requests||0)+' tên kênh'+
     ' · Internet đã đối chiếu '+counts.searched+'/'+channels.length+' kênh'+
     (lookup.error?' · Internet: '+String(lookup.error).slice(0,100):'')+
     '. Các kênh chưa tìm chưa có bằng chứng Internet.';
   }catch(error){
    status.textContent='Không hoàn thành kiểm tra: '+String(error?.message||error).slice(0,180);
   }finally{running=false;button.disabled=false;button.textContent='✓ Kiểm tra phân loại';}
  }
  function attach(){
   if(ready)return true;
   const wf=doc.getElementById('watchflowDemo'),scan=doc.getElementById('wfScanAgain');
   if(!wf||!scan)return false;
   ready=true;
   button=text('button','wf-audit-button','✓ Kiểm tra phân loại');
   button.id='wfAuditRun';button.type='button';button.setAttribute('aria-controls','wfAuditPanel');
   scan.insertAdjacentElement('beforebegin',button);
   button.setAttribute('aria-expanded','false');
   panel=text('dialog','wf-audit-panel wf-audit-modal');panel.id='wfAuditPanel';panel.hidden=true;
   panel.setAttribute('aria-label','Bảng phân loại kênh, EPG và tìm kiếm Internet');
   const head=text('div','wf-audit-head'),left=text('div','');
   left.append(text('strong','','Kiểm tra 3 nguồn · danh sách kênh hiện tại'),
    text('small','','Tên/nhóm kênh · chương trình EPG · thông tin công khai trên Wikidata.'));
   const close=text('button','wf-audit-close','Đóng');close.type='button';close.addEventListener('click',hideReport);
   panel.addEventListener('close',()=>{panel.hidden=true;button.setAttribute('aria-expanded','false');});
   panel.addEventListener('cancel',()=>{panel.hidden=true;button.setAttribute('aria-expanded','false');});
   head.append(left,close);panel.append(head);
   status=text('p','wf-audit-status','Chưa chạy kiểm tra.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   summary=text('p','wf-audit-summary','');panel.append(status,summary);
   
  async function researchNext(){
   const auto=api.auto,engine=api.engine,channels=(win.IPTVState?.getChannels?.()||[]).filter(c=>c?.id);
   if(researching||!auto?.scan||!channels.length)return;
   if(auto.enabled?.(win.localStorage)===false){status.textContent='Tra cứu Internet đã tắt trong phần cài đặt.';return;}
   researching=true;render();
   const analysis=auto.getBackgroundAnalysis?.(win)||new Map();
   status.textContent='Đang tìm tên kênh chưa xác định trên Wikidata/Wikipedia tiếng Việt…';
   try{
    const result=await auto.scan({storage:win.localStorage,channels,analysis,engine,
     lookup:q=>(engine.searchChannelMetadata||engine.searchInternet)(q),budget:6,
     onUpdate:state=>{
      rows=buildRows({channels,analysis,storage:win.localStorage,auto,engine,topics:api.topics,
       currentId:win.IPTVState?.getCurrent?.()?.id});
      render();
      if(state.requests)status.textContent='Đã thực hiện '+state.requests+'/6 lượt tra cứu trong lần này'+
       (state.error?' · '+state.error:'');
     }});
    rows=buildRows({channels,analysis,storage:win.localStorage,auto,engine,topics:api.topics,
     currentId:win.IPTVState?.getCurrent?.()?.id});render();
    const p=auto.internetProgress?.(win.localStorage,channels);
    status.textContent='Tra cứu Internet: thêm '+Number(result.requests||0)+' tên · '+(p?.matched||0)+' nguồn khớp / '+(p?.searched||0)+' đã tìm · '+
     (p?.remaining||0)+' chưa tìm · '+(p?.used||0)+'/'+(p?.limit||72)+' lượt hôm nay'+
     (result.error?' · '+result.error:'')+'. Các kết quả không khớp không được dùng để phân loại.';
   }catch(err){status.textContent='Lỗi truy vấn Internet: '+String(err?.message||err).slice(0,180);}
   finally{researching=false;render();}
  }

   const controls=text('div','wf-audit-controls');
   input=text('input','wf-audit-search');input.type='search';input.placeholder='Tìm kênh hoặc chủ đề…';input.setAttribute('aria-label','Lọc kết quả phân loại');
   select=text('select','wf-audit-sort');select.setAttribute('aria-label','Sắp xếp kết quả phân loại');
   for(const [v,title]of [['unknown','Ưu tiên: Kênh chưa xác định'],['internet','Đã tìm được trên Internet'],['category','Chủ đề AI'],['evidence','Nguồn bằng chứng nhiều nhất'],['name','Tên kênh A–Z'],['current','Kênh đang phát trước']]){
    const option=text('option','',title);option.value=v;select.append(option);
   }
   input.addEventListener('input',()=>{search=input.value;limit=50;render();});
   select.addEventListener('change',()=>{sort=select.value;limit=50;render();});
   researchButton=text('button','wf-audit-research','Tìm Internet tiếp (tối đa 6)');
   researchButton.id='wfAuditResearch';researchButton.type='button';
   researchButton.addEventListener('click',()=>{void researchNext();});
   controls.append(input,select,researchButton);panel.append(controls);
   const scroll=text('div','wf-audit-table-wrap'),table=text('table','wf-audit-table');
   const thead=text('thead',''),tr=text('tr','');for(const col of ['Kênh hiện tại','Phân loại kênh','Phân loại EPG','Tìm kiếm Internet','Phân loại cuối'])tr.append(text('th','',col));
   thead.append(tr);results=text('tbody','');table.append(thead,results);scroll.append(table);panel.append(scroll);
   more=text('button','wf-audit-more','Xem thêm');more.type='button';more.hidden=true;
   more.addEventListener('click',()=>{limit+=50;render();});panel.append(more);
   const anchor=wf.querySelector('.wf-local-banner');
   if(anchor)anchor.insertAdjacentElement('afterend',panel);
   else wf.append(panel);
   button.addEventListener('click',()=>{void run();});
   doc.addEventListener('openiptv:watchflow-auto-update',event=>{
    if(!event.detail?.internet||!panel?.open||running||researching)return;
    const channels=(win.IPTVState?.getChannels?.()||[]).filter(ch=>ch?.id);
    if(!channels.length)return;
    rows=buildRows({channels,analysis:api.auto?.getBackgroundAnalysis?.(win)||new Map(),
      storage:win.localStorage,auto:api.auto,engine:api.engine,topics:api.topics,
      currentId:win.IPTVState?.getCurrent?.()?.id});
    render();
    status.textContent='Internet đang tìm trong nền · '+(api.auto?.internetProgress?.(win.localStorage,channels)?.searched||0)+' tên kênh đã tra.';
   });
   return true;
  }
  doc.addEventListener('openiptv:unified-ai-ready',attach);
  doc.addEventListener('openiptv:renderer-ready',attach);
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
  return true;
 }
 return Object.freeze({internetFor,localLabels,epgFor,buildRows,sortRows,totals,mount});
});
