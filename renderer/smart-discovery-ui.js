'use strict';
(()=>{
 const ctx=window.IPTVState,core=window.StreamLeafCore,$=id=>document.getElementById(id);
 if(!ctx||!core)return;
 let discovery=null,candidates=[],busy=false,stop=false,selectionLabel='VN',catalogKind='country',generation=0,visibleRows=150;
 const labels={unchecked:'Chưa kiểm tra',alive:'Sống',dead:'Die',uncertain:'Chưa rõ'};
 const say=s=>{$('smartStatus').textContent=s;};
 function controls(isBusy){busy=isBusy;
  for(const id of ['smartFind','smartVerify','smartImportAlive','smartImportAll','smartCountry','smartLimit','smartCatalog','smartWorkers'])$(id).disabled=isBusy;
  $('smartVerify').disabled=isBusy||!candidates.length;
  $('smartImportAlive').disabled=isBusy||!candidates.some(c=>c.status==='alive'&&c.proof);
  $('smartImportAll').disabled=isBusy||!candidates.length;
  $('smartCancel').disabled=!isBusy;
 }
 function metrics(){
  const totals={alive:0,dead:0,uncertain:0,unchecked:0};
  for(const c of candidates)totals[c.status]=(totals[c.status]||0)+1;
  const el=$('smartMetrics');el.replaceChildren();
  for(const [name,n] of [['Tìm thấy',candidates.length],['Sống',totals.alive],['Die',totals.dead],['Chưa rõ',totals.uncertain],['Chưa kiểm tra',totals.unchecked]]){
   const badge=document.createElement('span');badge.textContent=name+': '+n;el.append(badge);
  }
 }
 function renderRows(){
  window.IPTVProAdvanced?.closePreview?.();
  const root=$('smartResults');root.replaceChildren();
  const text=($('smartSearch')?.value||'').trim().toLocaleLowerCase();
  const filter=$('smartStatusFilter')?.value||'all';
  let matched=0,displayed=0;
  for(const c of candidates){
   if(filter!=='all'&&c.status!==filter)continue;
   if(text&&!(c.name+' '+(c.group||'')+' '+(c.url||'')).toLocaleLowerCase().includes(text))continue;
   matched++;if(displayed>=visibleRows)continue;displayed++;
   const row=document.createElement('article');row.className='smart-row';const details=document.createElement('div');
   const strong=document.createElement('strong');strong.textContent=c.name;
   const hint=document.createElement('small');hint.textContent=(c.group||'Khác')+' · '+(c.reason||c.url);
   details.append(strong,hint);const pill=document.createElement('span');pill.className='smart-pill '+c.status;pill.textContent=labels[c.status]||labels.unchecked;
   row.append(details,pill);
   // Preview from the live candidate URL; this does not import the channel,
   // mark it verified or modify any saved playlist.
   row.title='Rê chuột để xem trước không tiếng · '+c.name;
   window.IPTVProAdvanced?.decorateRow?.(c,row);
   root.append(row);
  }
  if(matched>displayed){
   const more=document.createElement('button');more.type='button';more.className='btn btn-subtle smart-more';
   more.textContent=`Hiển thị thêm 150 kênh (${displayed}/${matched} kết quả phù hợp)`;
   more.addEventListener('click',()=>{visibleRows+=150;renderRows();});root.append(more);
  }
 }
 function render(){metrics();renderRows();controls(false);}
 async function choices(){
  const kind=$('smartCatalog')?.value||'country';catalogKind=kind;
  const wrap=$('smartCountryWrap');if(wrap)wrap.hidden=kind==='global'||kind==='freetv';
  if(kind==='global'||kind==='freetv')return;
  const picker=$('smartCountry');const last=picker.value;
  try{
   let items=[];
   if(window.streamleaf?.smartCatalogOptions)items=await window.streamleaf.smartCatalogOptions(kind);
   else if(kind==='country'&&window.streamleaf?.smartCountries)items=await window.streamleaf.smartCountries();
   if(catalogKind!==kind||!Array.isArray(items)||!items.length)return;
   picker.replaceChildren();for(const item of items){const option=document.createElement('option');option.value=item.code;option.textContent=(item.flag||'')+' '+item.name+' ('+item.code+')';picker.append(option);}
   const preferred=kind==='country'?'VN':kind==='language'?'vie':'news';
   picker.value=items.some(x=>x.code===last)?last:items.some(x=>x.code===preferred)?preferred:items[0].code;
  }catch(e){say('Không tải được danh sách bộ lọc: '+e.message);}
 }
 async function find(){
  if(busy)return;
  if(window.IPTVProAdvanced?.canEdit?.()===false)return ctx.toast('Hồ sơ trẻ em không được nhập nguồn','warn');
  if(!window.streamleaf?.smartLoad&&!window.streamleaf?.smartCountry){say('Smart Discovery yêu cầu ứng dụng desktop Windows/macOS');return;}
  if(!(await window.OpenIPTVSourceConsent?.requireSmart?.())){say('Cần xác nhận điều khoản Smart Discovery trước khi khám phá nguồn.');return;}
  controls(true);stop=false;discovery=null;candidates=[];visibleRows=150;const seq=++generation;
  const kind=$('smartCatalog')?.value||'country',code=$('smartCountry').value;
  say('Đang tải danh mục nguồn công khai…');$('smartProgressBar').style.width='0%';
  try{
   const result=window.streamleaf?.smartLoad?await window.streamleaf.smartLoad({kind,code}):await window.streamleaf.smartCountry(code);
   if(stop||seq!==generation){say('Đã hủy lượt tìm');return;}
   discovery=result;
   const parsed=core.parseM3U(result.content,'smart-preview').filter(c=>/^https?:\/\//i.test(c.url)&&!/^https?:\/\/[^/]*@/i.test(c.url));
   const seen=new Set();candidates=parsed.filter(c=>{if(seen.has(c.url))return false;seen.add(c.url);return true;}).map(c=>({...c,status:'unchecked',proof:false}));
   selectionLabel=kind==='country'?code:kind==='global'?'Toàn cầu':kind==='freetv'?'Free-TV':`${kind}/${code}`;
   say(`Đã tìm ${candidates.length} luồng từ ${result.provider||selectionLabel}. Chọn “Kiểm tra luồng” để xác minh trước khi nhập.`);
  }catch(e){say('Không tải được nguồn: '+e.message);}finally{render();}
 }
 async function verify(){
  if(busy||!candidates.length||!window.streamleaf?.smartCheck)return;
  if(!(await window.OpenIPTVSourceConsent?.requireSmart?.())){say('Chưa chấp nhận điều khoản Smart Discovery.');return;}
  controls(true);stop=false;
  const range=String($('smartLimit').value||'all');
  // All = every discovered channel, not a hidden 1000-channel cap.
  // Bounded selections let users scan quickly without altering the full mode.
  const all=range==='all';
  const limit=all?null:Math.max(1,Math.min(1000,Number(range)||50));
  const concurrency=Math.max(1,Math.min(8,Number($('smartWorkers')?.value)||3));
  const unchecked=candidates.filter(c=>c.status==='unchecked');
  const pool=unchecked.length?unchecked:candidates.filter(c=>c.status!=='alive');
  const selected=all?(unchecked.length?unchecked:candidates):pool.slice(0,limit);let next=0,done=0,alive=0,dead=0;
  const bar=$('smartProgressBar');bar.style.width='0%';
  say(`Đang kiểm tra ${selected.length} luồng${all?' (tất cả, không giới hạn)':''}, tối đa ${concurrency} kết nối đồng thời. Có thể hủy bất cứ lúc nào.`);
  async function worker(){while(!stop){
   const i=next++;if(i>=selected.length)return;const c=selected[i];
   try{const started=Date.now(),res=await window.streamleaf.smartCheck(c.url);
    // Keep evidence even if cancel was requested during an in-flight check.
    c.status=res.status==='alive'&&res.positiveEvidence===true?'alive':res.status==='dead'&&res.confirmedDead===true?'dead':'uncertain';
    c.proof=c.status==='alive';c.latencyMs=Date.now()-started;c.reason=res.reason||'';
   }catch(e){c.status='uncertain';c.proof=false;c.reason='Lỗi kiểm tra: '+e.message;}
   if(c.status==='alive')alive++;if(c.status==='dead')dead++;done++;
   if(done%5===0||done===selected.length||stop){
    const percent=Math.round(done/Math.max(1,selected.length)*100);bar.style.width=percent+'%';
    say(`Đã kiểm tra ${done.toLocaleString('vi-VN')}/${selected.length.toLocaleString('vi-VN')} (${percent}%) · Sống ${alive} · Die ${dead} · Chưa rõ ${done-alive-dead}.`);
   }
   if(done%25===0){metrics();}
   // Yield periodically so renderer can update status smoothly for large batches.
   if(done%20===0)await new Promise(resolve=>setTimeout(resolve,0));
  }}
  try{await Promise.all(Array.from({length:Math.min(concurrency,selected.length)},worker));
   bar.style.width=(selected.length?Math.round(done/selected.length*100):0)+'%';
   say(stop?`Đã hủy sau ${done}/${selected.length} kênh, giữ kết quả đã kiểm tra.`:`Hoàn tất ${done} kênh: ${alive} Sống, ${dead} Die, ${done-alive-dead} chưa rõ.`);
  }finally{render();}
 }
 async function add(onlyAlive){if(busy||!discovery)return;
  if(window.IPTVProAdvanced?.canEdit?.()===false)return ctx.toast('Hồ sơ trẻ em không được nhập nguồn','warn');
  const chosen=onlyAlive?candidates.filter(c=>c.status==='alive'&&c.proof):candidates;
  if(!chosen.length)return ctx.toast('Không có kênh đã xác minh Sống','warn');
  const label=onlyAlive?'đã xác minh Sống':'chưa kiểm tra đầy đủ';
  if(!(await window.OpenIPTVSourceConsent?.requestSmartImport?.(`Bạn sắp nhập ${chosen.length} kênh ${label} từ ${selectionLabel}. Danh sách hiện tại được giữ nguyên; bạn tự chịu trách nhiệm về quyền sử dụng nguồn.`))){say('Đã hủy nhập Smart Discovery do chưa xác nhận điều khoản.');return;}
  const origin=onlyAlive?discovery.url+'#verified':discovery.url;
  if(ctx.getStore().sources.some(s=>s.origin===origin))return ctx.toast('Nguồn này đã được nhập. Vào Quản lý nguồn để cập nhật hoặc xóa trước khi nhập lại.','warn');
  try{
   ctx.importSource(`Smart Discovery ${selectionLabel} · ${label}`,origin,core.exportM3U(chosen),onlyAlive?'file':'url');
   const data=ctx.getStore(),added=data.sources.find(s=>s.origin===origin);
   if(added){
    added.collectEnabled=false;added.discoveryCountry=selectionLabel;added.discoveryCatalog=discovery.kind||'country';
    // Both variants import the exact previewed channels; no silent auto-refresh.
    const proofByUrl=new Map(chosen.filter(c=>c.proof&&c.status==='alive').map(c=>[c.url,c]));
    for(const channel of data.channels.filter(c=>c.sourceId===added.id)){
     const checked=proofByUrl.get(channel.url);if(!checked)continue;
     channel.status='alive';channel.checkedAt=new Date().toISOString();channel.reason='Có bằng chứng video từ Smart Discovery khi nhập';
     window.IPTVProAdvanced?.onCheck?.(channel,{status:'alive',positiveEvidence:true,reason:channel.reason,latencyMs:checked.latencyMs??null});
    }
    ctx.save();ctx.render();
   }
   say(`Đã nhập ${chosen.length} kênh; không xóa hoặc sửa nguồn cũ.`);
  }catch(e){ctx.toast('Không thể nhập danh sách: '+e.message,'error');}
 }
 $('smartFind').addEventListener('click',find);
 $('smartVerify').addEventListener('click',verify);
 $('smartCancel').addEventListener('click',()=>{stop=true;say('Đang hủy, chờ các kết nối đang chạy kết thúc…');});
 $('smartImportAlive').addEventListener('click',()=>add(true));
 $('smartImportAll').addEventListener('click',()=>add(false));
 $('smartCatalog')?.addEventListener('change',()=>{
  // A filter change invalidates the previous preview; do not import it under
  // the newly selected catalog label by accident.
  discovery=null;candidates=[];visibleRows=150;$('smartProgressBar').style.width='0%';
  say('Đã đổi danh mục. Nhấn Khám phá nguồn để tải danh sách mới.');render();void choices();
 });
 $('smartSearch')?.addEventListener('input',()=>{visibleRows=150;renderRows();});
 $('smartStatusFilter')?.addEventListener('change',()=>{visibleRows=150;renderRows();});
 window.IPTVSmartDiscovery={find,verify};
 void choices();
})();
