'use strict';
// Explicit, local collection workflow. No GitHub writes, no invented stream URLs.
(()=>{
 const ctx=window.IPTVState,lib=window.OpenIPTVCollector,core=window.StreamLeafCore;
 const $=id=>document.getElementById(id);
 const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const SOURCE='collector_merged';let busy=false,cancel=false,repoFiles=[],lastRun=0;
 const store=ctx.getStore();
 // WKWebView may dismiss native JavaScript confirm() without showing a dialog.
 // Use a DOM confirmation that works consistently in WKWebView and WebView2.
 function confirmInApp(title,details,approveLabel='GỘP VÀ LƯU'){
  return new Promise(resolve=>{
   const backdrop=document.createElement('div');backdrop.className='collector-confirm-backdrop';
   const panel=document.createElement('section');panel.className='collector-confirm-box';
   panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
   panel.setAttribute('aria-labelledby','collector-confirm-title');
   panel.setAttribute('aria-describedby','collector-confirm-details');
   const heading=document.createElement('h2');heading.id='collector-confirm-title';heading.textContent=title;
   const body=document.createElement('p');body.id='collector-confirm-details';body.textContent=details;
   const actions=document.createElement('div');actions.className='collector-confirm-actions';
   const cancelBtn=document.createElement('button');cancelBtn.type='button';cancelBtn.className='btn btn-subtle';cancelBtn.textContent='Hủy — không thay đổi';
   const approveBtn=document.createElement('button');approveBtn.type='button';approveBtn.className='btn btn-primary';approveBtn.textContent=approveLabel;
   actions.append(cancelBtn,approveBtn);panel.append(heading,body,actions);backdrop.append(panel);
   const previous=document.activeElement;
   const close=accepted=>{document.removeEventListener('keydown',onKey,true);backdrop.remove();try{previous?.focus?.();}catch{}resolve(accepted);};
   const onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(false);}
    if(e.key==='Tab'){const toCancel=e.shiftKey&&document.activeElement===cancelBtn;
     const toApply=!e.shiftKey&&document.activeElement===approveBtn;
     if(toCancel||toApply){e.preventDefault();(toCancel?approveBtn:cancelBtn).focus();}}};
   cancelBtn.onclick=()=>close(false);approveBtn.onclick=()=>close(true);
   backdrop.onclick=e=>{if(e.target===backdrop)close(false);};
   document.addEventListener('keydown',onKey,true);
   document.body.append(backdrop);cancelBtn.focus();
  });
 }
 if(!store.collectorConfig||typeof store.collectorConfig!=='object')store.collectorConfig={enabled:false,periodMinutes:60};
 function rawSources(){return store.sources.filter(s=>s.id!==SOURCE);}
 function enabledInputs(){return rawSources().filter(s=>s.collectEnabled!==false);}
 function msg(message){$('collectorStatus').textContent=message;ctx.textStatus(message);}
 function log(line,cls=''){const e=document.createElement('div');e.className='collector-log '+cls;e.textContent=`${new Date().toLocaleTimeString('vi-VN')}  ${line}`;$('collectorResults').prepend(e);while($('collectorResults').childElementCount>160)$('collectorResults').lastChild.remove();}
 function progress(done,total){$('collectorProgress').style.width=(total?Math.min(100,Math.round(100*done/total)):0)+'%';}
 function setBusy(flag){busy=flag;for(const k of ['collectorRepair','collectorBrowse','collectorRestore','sourceMergeAnalyze','sourceMergeExecute'])$(k).disabled=flag;$('sourceMergeUndo').disabled=flag||!store.collectorBackup;$('collectorCancel').disabled=!flag;for(const cb of $('sourceMergeChoices').querySelectorAll('input'))cb.disabled=flag;}
 function renderInputs(){const root=$('collectorSources');root.replaceChildren();const sources=rawSources();if(!sources.length){root.textContent='Chưa có nguồn. Hãy mở file M3U, thêm URL hoặc nhập repo công khai.';return;}
  for(const s of sources){const line=document.createElement('label');line.className='collector-source';const input=document.createElement('input');input.type='checkbox';input.checked=s.collectEnabled!==false;input.onchange=()=>{s.collectEnabled=input.checked;ctx.save();};const title=document.createElement('span');title.textContent=s.name+' · '+(s.type==='url'?'URL':'File');line.append(input,title);root.append(line);}}
 function stats(r){$('collectorMetrics').innerHTML=`<span>Tổng nguồn: <b>${rawSources().length}</b></span><span>Kênh gộp: <b>${r?.unique??store.channels.filter(c=>c.sourceId===SOURCE).length}</b></span><span>Trùng: <b>${r?.duplicates??'—'}</b></span><span>Link dự phòng: <b>${r?.alternates??'—'}</b></span>`;}
 // Merge controls live in Quản lý nguồn, using the same collector pipeline & rollback.
 function renderSourceMergeControls(){
  const root=$('sourceMergeChoices');root.replaceChildren();const sources=rawSources();
  if(!sources.length){root.textContent='Hãy nhập ít nhất một file M3U hoặc URL nguồn trước.';return;}
  for(const s of sources){
   const label=document.createElement('label');label.className='collector-source';
   const cb=document.createElement('input');cb.type='checkbox';cb.checked=s.collectEnabled!==false;cb.disabled=busy;
   cb.setAttribute('aria-label','Gộp nguồn '+s.name);
   cb.onchange=()=>{s.collectEnabled=cb.checked;ctx.save();renderInputs();$('sourceMergeSummary').textContent='Đã đổi nguồn chọn, bấm Phân tích để xem lại kết quả.';$('sourceMergeDuplicates').replaceChildren();};
   const t=document.createElement('span');const count=store.channels.filter(c=>c.sourceId===s.id).length;t.textContent=`${s.name} · ${count} kênh · ${s.type==='url'?'URL':'File M3U'}`;
   label.append(cb,t);root.append(label);
  }
  $('sourceMergeUndo').disabled=busy||!store.collectorBackup;
 }
 function analyzeSourceDuplicates(){
  const sources=enabledInputs();const root=$('sourceMergeDuplicates');root.replaceChildren();
  if(!sources.length){$('sourceMergeSummary').textContent='Chọn ít nhất một nguồn để gộp.';return;}
  const ids=new Set(sources.map(s=>s.id));const cached=store.channels.filter(c=>ids.has(c.sourceId));
  if(!cached.length){$('sourceMergeSummary').textContent='Các nguồn đã chọn chưa có kênh đã tải; hãy tải nguồn trước.';return;}
  const result=lib.merge(cached),counts=new Map();
  for(const c of cached){const key=lib.keyFor(c);if(!counts.has(key))counts.set(key,[]);counts.get(key).push(c);}
  const duplicateGroups=[...counts.values()].filter(group=>group.length>1);
  $('sourceMergeSummary').textContent=`BẢN XEM TRƯỚC — ${cached.length} mục của ${sources.length} nguồn → ${result.stats.unique} kênh, ${result.stats.duplicates} mục trùng, ${result.stats.alternates} URL dự phòng. Chưa áp dụng; bấm Gộp kênh đã chọn và xác nhận để lưu.`;
  for(const group of duplicateGroups.slice(0,12)){
   const row=document.createElement('div');row.className='source-duplicate-row';
   const name=document.createElement('b');name.textContent=group[0].name;
   const info=document.createElement('small');info.textContent=`${group.length} mục · ${new Set(group.map(c=>c.url)).size} URL khác nhau`;
   row.append(name,info);root.append(row);
  }
  if(duplicateGroups.length>12){const extra=document.createElement('small');extra.textContent=`…và ${duplicateGroups.length-12} nhóm trùng khác`;root.append(extra);}
 }

 async function discover(){const url=$('collectorRepoURL').value.trim();if(!url)return ctx.toast('Nhập địa chỉ repository GitHub công khai','warn');if(!window.streamleaf?.listRepoPlaylists)return ctx.toast('Tìm playlist trong repo chỉ hoạt động ở bản desktop','warn');
  setBusy(true);msg('Đang đọc danh sách file M3U công khai…');$('collectorRepoFiles').replaceChildren();
  try{const reply=await window.streamleaf.listRepoPlaylists(url);repoFiles=reply.files;const root=$('collectorRepoFiles');const title=document.createElement('p');title.textContent=`${reply.owner}/${reply.repo} · nhánh ${reply.branch}: ${repoFiles.length} file M3U (tối đa 25)`;root.append(title);
   repoFiles.forEach((f,i)=>{const label=document.createElement('label');label.className='collector-source';const cb=document.createElement('input');cb.type='checkbox';cb.value=String(i);cb.checked=i===0;const span=document.createElement('span');span.textContent=f.path;label.append(cb,span);root.append(label);});
   const add=document.createElement('button');add.className='btn btn-primary';add.textContent='＋ Thêm các playlist đã chọn';add.onclick=()=>{const nums=[...root.querySelectorAll('input:checked')].map(x=>Number(x.value));if(!nums.length)return ctx.toast('Chọn ít nhất một file','warn');let count=0;for(const i of nums){const f=repoFiles[i];if(store.sources.some(s=>s.origin===f.url))continue;store.sources.push({id:'repo_'+Date.now().toString(36)+'_'+i,name:f.path.split('/').at(-1),origin:f.url,type:'url',enabled:true,collectEnabled:true,addedAt:new Date().toISOString()});count++;}ctx.save();renderInputs();ctx.render();stats();log(`Đã thêm ${count} URL playlist từ repository (chưa thu thập luồng).`);};root.append(add);msg('Đã tìm xong file playlist; chọn file để thêm nguồn.');
  }catch(e){msg('Không đọc được repo: '+e.message);log('Repo: '+e.message,'error');}finally{setBusy(false);}}
 async function loadSource(s){const cached=store.channels.filter(c=>c.sourceId===s.id),origin=s.origin||'';
  if(s.type!=='url')return {channels:cached,stale:false};
  try{const txt=window.streamleaf?.loadURL?(await window.streamleaf.loadURL(origin)).content:await (async()=>{const r=await fetch(origin);if(!r.ok)throw Error('HTTP '+r.status);return r.text();})();
   const next=core.parseM3U(txt,s.id);if(!next.length)throw Error('M3U không có kênh');if(cached.length>=20&&next.length<cached.length*.5)throw Error('Số kênh giảm hơn 50%, giữ dữ liệu đã có');
   const states=new Map(cached.map(c=>[c.url,{status:c.status,checkedAt:c.checkedAt,reason:c.reason}]));next.forEach(c=>Object.assign(c,states.get(c.url)||{}));return {channels:next,stale:false};
  }catch(e){if(cached.length)return {channels:cached,stale:true,error:e.message};throw e;}
 }
 async function collect(auto=false){if(busy)return;const selected=enabledInputs();if(!selected.length){ctx.toast('Chưa chọn nguồn thu thập','warn');return;}
  setBusy(true);cancel=false;let applied=false;progress(0,selected.length);msg('Đang thu thập các nguồn đã chọn…');const loaded=[],failures=[],sourceReplacements=new Map();
  try{for(let i=0;i<selected.length;i++){if(cancel)break;const s=selected[i];try{const got=await loadSource(s);loaded.push(...got.channels);if(!got.stale)sourceReplacements.set(s.id,got.channels);log(`${s.name}: ${got.channels.length} kênh${got.stale?' (bản lưu vì tải lỗi: '+got.error+')':''}`);}catch(e){failures.push(s.name);log(s.name+': '+e.message,'error');}progress(i+1,selected.length);}
   if(cancel){msg('Đã hủy; không thay đổi playlist.');return;}if(!loaded.length){msg('Không có nguồn hợp lệ; playlist cũ được giữ lại.');return;}
   const merged=lib.merge(loaded);if(!merged.channels.length)throw Error('Không có URL phát hợp lệ');
   const bad=failures.length;if(bad&&loaded.length<2){log('Có nguồn tải lỗi; chỉ sử dụng kênh đã tải thành công','warn');}
   const old=store.channels.filter(c=>c.sourceId===SOURCE),oldFav=new Set(store.favorites),sameSource=store.sources.find(s=>s.id===SOURCE);
   // Always require explicit acceptance for a manual destructive view change. Automatic refresh keeps last good list on severe shrinkage.
   if(auto&&old.length&&merged.channels.length<old.length*.7){msg('Nguồn giảm quá 30%; giữ playlist đã xác minh trước đó.');return;}
   if(!auto){
    const approved=await confirmInApp('Xác nhận áp dụng playlist gộp',
     `Gộp ${loaded.length} mục thành ${merged.channels.length} kênh, giữ ${merged.stats.alternates} URL dự phòng.\n\nNguồn gốc vẫn được lưu, chỉ tạm ẩn khỏi mục Xem TV. Có thể hoàn tác trong Quản lý nguồn.`);
    if(!approved||cancel){stats();$('sourceMergeSummary').textContent='Đã hủy bước áp dụng. Số kênh phân tích không phải playlist đã lưu; các nguồn vẫn giữ nguyên.';msg('Đã hủy áp dụng; playlist không đổi.');return;}
   }
   store.collectorBackup={channels:old.map(c=>({...c})),originalSources:selected.map(src=>({id:src.id,channels:store.channels.filter(c=>c.sourceId===src.id).map(c=>({...c}))})),sourceEnabled:rawSources().map(s=>[s.id,s.enabled]),hadMerged:!!sameSource};
   for(const [id,list] of sourceReplacements){store.channels=store.channels.filter(c=>c.sourceId!==id).concat(list);}
   const previous=new Map(old.map(c=>[lib.keyFor(c),c]));
   for(const c of merged.channels){const oldC=previous.get(lib.keyFor(c));if(oldC){c.id=oldC.id;c.status=oldC.status;c.checkedAt=oldC.checkedAt;c.reason=oldC.reason;if(oldFav.has(oldC.url)&&oldC.url!==c.url)store.favorites.push(c.url);}}
   store.favorites=[...new Set(store.favorites)];store.channels=store.channels.filter(c=>c.sourceId!==SOURCE).concat(merged.channels);
   if(!sameSource)store.sources.push({id:SOURCE,name:'⧉ Playlist đã hợp nhất',origin:'Các nguồn được chọn trong Thu thập',type:'file',enabled:true,collectEnabled:false});
   else sameSource.enabled=true;
   const mergedIds=new Set(selected.map(s=>s.id));rawSources().forEach(s=>{if(mergedIds.has(s.id))s.enabled=false;});
   window.IPTVProAdvanced?.setAlternatesBatch?.(merged.channels.map(c=>[c.id,c.alternates||[]]));
   ctx.save();applied=true;ctx.render();renderInputs();renderSourceMergeControls();stats(merged.stats);lastRun=Date.now();$('sourceMergeSummary').textContent=`Đã gộp ${loaded.length} thành ${merged.channels.length} kênh và ${merged.stats.alternates} link dự phòng. Có thể hoàn tác trong Quản lý nguồn.`;
   msg(`Đã gộp ${merged.channels.length} kênh, ${merged.stats.alternates} dự phòng; link chưa được kiểm tra sẽ ở trạng thái Chưa xác minh.`);log(`Áp dụng danh sách gộp (${merged.channels.length} kênh). Các nguồn cũ vẫn được giữ.`);
  }catch(e){log('Thu thập lỗi: '+e.message,'error');msg('Thu thập thất bại; dữ liệu cũ được giữ lại.');}finally{progress(applied?1:0,1);setBusy(false);}}
 async function repair(){if(busy)return;const channels=store.channels.filter(c=>c.sourceId===SOURCE);if(!channels.length)return ctx.toast('Chưa có playlist gộp đã lưu. Bấm Gộp kênh đã chọn, rồi xác nhận GỘP VÀ LƯU trước khi kiểm tra.','warn');
  if(!window.streamleaf?.check)return ctx.toast('Kiểm tra phát thực nhiều vòng yêu cầu bản desktop','warn');setBusy(true);cancel=false;msg('Kiểm tra luồng thực và chọn link dự phòng đã xác minh…');
  const n=Number(store.checkConcurrency);
  const workers=Math.min(Number.isInteger(n)&&n>=1&&n<=32?n:4,channels.length);
  let done=0,live=0,dead=0,uncertain=0,replaced=0;progress(0,channels.length);
  msg(`Đang kiểm tra và sửa ${channels.length} kênh với ${workers} luồng song song…`);
  if(window.streamleaf?.batchStart){
   let batch,offset=0,lastUI=0,lastSave=Date.now(),cancelSent=false,alternateChanges=[];
   try{
    batch=await window.streamleaf.batchStart('repair',channels.map(ch=>({url:ch.url,label:ch.name,alternates:ch.alternates||[]})),workers);
    while(true){
     if(cancel&&!cancelSent){cancelSent=true;await window.streamleaf.batchCancel(batch.id);}
     const state=await window.streamleaf.batchStatus(batch.id,offset);
     if(state.error)throw Error(state.error);
     for(const item of state.results){
      const ch=channels[item.index],before=ch.url,results=item.ok?item.value:[{url:ch.url,status:'uncertain',reason:item.error||'Lỗi kiểm tra'}];
      if(ch.lastPlayableUrl===ch.url&&ch.lastPlaybackAt&&Date.now()-Date.parse(ch.lastPlaybackAt)<5*60*1000){
       const old=results.find(r=>r.url===ch.url);if(old){old.status='alive';old.reason='Đã phát được gần đây trong trình phát';old.positiveEvidence=true;}
      }
      const fixed=lib.repaired(ch,results);Object.assign(ch,fixed);
      if(ch.status==='alive')live++;else if(ch.status==='dead')dead++;else uncertain++;
      if(ch.url!==before){replaced++;if(store.favorites.includes(before))store.favorites.push(ch.url);if(store.snapshots[before]&&!store.snapshots[ch.url])store.snapshots[ch.url]=store.snapshots[before];}
      alternateChanges.push([ch.id,ch.alternates||[]]);
      window.IPTVProAdvanced?.onCheck?.(ch,results.find(r=>r.url===ch.url)||{status:ch.status});
      done++;
      if(ch.url!==before||ch.status==='dead'||done%20===0)log(`${ch.status==='alive'?'SỐNG':ch.status==='dead'?'DIE':'CHƯA RÕ'} · ${ch.name}${ch.url!==before?' · đã đổi link':''}`);
     }
     offset=state.nextOffset;
     const now=Date.now();
     if(now-lastUI>250||state.finished){progress(done,channels.length);$('collectorStatus').textContent=`${done}/${channels.length} · Sống ${live} · Die ${dead} · Chưa rõ ${uncertain} · Đổi link ${replaced}`;lastUI=now;}
     if(now-lastSave>4500){window.IPTVProAdvanced?.setAlternatesBatch?.(alternateChanges.splice(0));ctx.save();ctx.renderList(true);lastSave=now;}
     if(offset<state.done)continue;
     if(state.finished)break;
     await new Promise(resolve=>setTimeout(resolve,220));
    }
    window.IPTVProAdvanced?.setAlternatesBatch?.(alternateChanges.splice(0));ctx.save();ctx.render();msg(`${cancel?'Đã dừng':'Đã kiểm tra'} ${done} kênh: ${live} sống, ${dead} lỗi, ${uncertain} chưa rõ; đổi ${replaced} link đã xác minh.`);
   }catch(e){log('Kiểm tra lỗi: '+e.message,'error');msg('Lỗi kiểm tra. Kết quả đã chạy được giữ lại.');}
   finally{window.IPTVProAdvanced?.setAlternatesBatch?.(alternateChanges.splice(0));ctx.save();setBusy(false);}
   return;
  }
  try{const jobs=channels.slice();async function worker(){while(jobs.length&&!cancel){const ch=jobs.shift(),before=ch.url,candidates=[...new Set([ch.url,...(ch.alternates||[])])].slice(0,6),results=[];
    for(const url of candidates){if(cancel)break;try{const res=await window.streamleaf.check(url);results.push({url,...res});if(res.status==='alive')break;}catch(e){results.push({url,status:'uncertain',reason:e.message});}}
    if(cancel)break;
    // Proof from a real playback session is stronger than a failed HTTP probe.
    if(ch.lastPlayableUrl===ch.url&&ch.lastPlaybackAt&&Date.now()-Date.parse(ch.lastPlaybackAt)<5*60*1000){
     const old=results.find(r=>r.url===ch.url);if(old){old.status='alive';old.reason='Đã phát được gần đây trong trình phát';old.positiveEvidence=true;}
    }
    const fixed=lib.repaired(ch,results);Object.assign(ch,fixed);if(ch.status==='alive')live++;else if(ch.status==='dead')dead++;else uncertain++;
    if(ch.url!==before){replaced++;if(store.favorites.includes(before))store.favorites.push(ch.url);if(store.snapshots[before]&&!store.snapshots[ch.url])store.snapshots[ch.url]=store.snapshots[before];}
    window.IPTVProAdvanced?.setAlternates?.(ch.id,ch.alternates);window.IPTVProAdvanced?.onCheck?.(ch,results.find(r=>r.url===ch.url)||{status:ch.status});
    done++;progress(done,channels.length);$('collectorStatus').textContent=`${done}/${channels.length} · Sống ${live} · Die ${dead} · Chưa rõ ${uncertain} · Đổi link ${replaced}`;log(`${ch.status==='alive'?'SỐNG':ch.status==='dead'?'DIE':'CHƯA RÕ'} · ${ch.name}${ch.url!==before?' · đã chọn link dự phòng':''}`);if(done%4===0){ctx.save();ctx.renderList(true);}
   }}
   await Promise.all(Array.from({length:workers},worker));ctx.save();ctx.render();msg(`Đã kiểm tra ${done} kênh: ${live} sống, ${dead} lỗi, ${uncertain} chưa rõ; đổi ${replaced} link đã xác minh.`);
  }catch(e){log('Kiểm tra lỗi: '+e.message,'error');msg('Lỗi kiểm tra. Kết quả đã chạy được giữ lại.');}finally{setBusy(false);}}
 async function restore(){if(busy)return;const b=store.collectorBackup;if(!b)return ctx.toast('Chưa có phiên gộp trước để hoàn tác','warn');if(!(await confirmInApp('Hoàn tác lần gộp', 'Khôi phục các nguồn, trạng thái hiển thị và playlist trước lần gộp gần nhất?', 'HOÀN TÁC')))return;
  store.channels=store.channels.filter(c=>c.sourceId!==SOURCE).concat(b.channels||[]);for(const original of b.originalSources||[]){store.channels=store.channels.filter(c=>c.sourceId!==original.id).concat(original.channels||[]);}for(const [id,v] of b.sourceEnabled||[]){const s=store.sources.find(x=>x.id===id);if(s)s.enabled=v;}let src=store.sources.find(s=>s.id===SOURCE);if(src)src.enabled=!!b.hadMerged;delete store.collectorBackup;ctx.stopPlayer();ctx.save();ctx.render();stats();renderSourceMergeControls();$('sourceMergeSummary').textContent='Đã hoàn tác; các nguồn và kênh cũ được khôi phục.';msg('Đã hoàn tác lần gộp; nguồn cũ hiển thị trở lại.');}
 function exportClean(){const channels=store.channels.filter(c=>c.sourceId===SOURCE&&c.status==='alive');if(!channels.length)return ctx.toast('Chưa có kênh nào đã được xác minh sống','warn');const text=core.exportM3U(channels);const name='iptv_verified.m3u';
  if(window.streamleaf?.export){window.streamleaf.export(name,text).then(dest=>{if(dest)ctx.toast('Đã xuất '+dest);}).catch(e=>ctx.toast(e.message,'warn'));return;}
  const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type:'audio/x-mpegurl'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
 }
 $('collectorBrowse').onclick=discover;$('sourceMergeAnalyze').onclick=analyzeSourceDuplicates;$('sourceMergeExecute').onclick=()=>collect(false);$('sourceMergeUndo').onclick=restore;$('collectorRepair').onclick=repair;$('collectorRestore').onclick=restore;$('collectorExport').onclick=exportClean;$('collectorCancel').onclick=()=>{cancel=true;msg('Đã yêu cầu hủy sau lượt đang kiểm tra.');};
 $('collectorAuto').checked=!!store.collectorConfig.enabled;$('collectorAuto').onchange=e=>{store.collectorConfig.enabled=e.target.checked;ctx.save();ctx.toast(e.target.checked?'Tự thu thập mỗi 60 phút khi app đang mở':'Đã tắt tự thu thập');};
 setInterval(()=>{if(!document.hidden&&store.collectorConfig.enabled&&!busy&&Date.now()-lastRun>=60*60000){lastRun=Date.now();collect(true);}},60000);
 setInterval(()=>{if(!busy&&$('page-sources').classList.contains('active-page'))renderInputs();},25000);renderInputs();renderSourceMergeControls();stats();
 window.IPTVCollectorUI={refresh:()=>{renderInputs();renderSourceMergeControls();stats();},collect,repair,analyze:analyzeSourceDuplicates,restore};
})();
