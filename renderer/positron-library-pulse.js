'use strict';
// Positron P5.1.167 — Bảng phân tích metadata thư viện, không thử stream.
(()=>{
 const d=document,root=d.documentElement,bar=d.getElementById('positronBar');
 const core=window.PositronLibraryPulseCore,state=window.IPTVState;
 if(root.dataset.positron!=='true'||!bar||!core||!state?.getChannels)return;
 const actions=bar.querySelector('.p-actions')||bar;
 const toggle=d.createElement('button');toggle.type='button';toggle.id='poLibraryPulseToggle';
 toggle.className='po-pulse-toggle';toggle.setAttribute('aria-controls','poLibraryPulsePanel');
 toggle.setAttribute('aria-expanded','false');toggle.title='Thống kê thư viện kênh từ dữ liệu hiện có';
 toggle.setAttribute('aria-label','Mở bảng phân tích thư viện kênh');
 const svg=d.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('width','17');svg.setAttribute('height','17');svg.setAttribute('viewBox','0 0 24 24');
 svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
 svg.setAttribute('stroke-width','1.8');svg.setAttribute('aria-hidden','true');
 const p=d.createElementNS('http://www.w3.org/2000/svg','path');
 p.setAttribute('d','M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z');
 svg.append(p);
 const word=d.createElement('span');word.textContent='Thư viện';word.className='po-pulse-toggle-label';
 toggle.append(svg,word);actions.prepend(toggle);
 const panel=d.createElement('section');panel.id='poLibraryPulsePanel';panel.className='po-pulse-panel';
 panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
 panel.setAttribute('aria-labelledby','poLibraryPulseTitle');
 const header=d.createElement('header');header.className='po-pulse-header';
 const title=d.createElement('h2');title.id='poLibraryPulseTitle';title.textContent='Bản đồ thư viện';
 const close=d.createElement('button');close.type='button';close.id='poLibraryPulseClose';
 close.textContent='Đóng';close.setAttribute('aria-label','Đóng bảng phân tích thư viện');
 header.append(title,close);
 const hint=d.createElement('p');hint.className='po-pulse-hint';
 hint.textContent='Tổng hợp metadata từ những kênh đã có · Không quét nguồn, không tự phát';
 const cards=d.createElement('div');cards.id='poLibraryPulseCards';cards.className='po-pulse-cards';
 const ratios=d.createElement('div');ratios.id='poLibraryPulseRatios';ratios.className='po-pulse-ratios';
 // P5.1.157: phân bố theo nhóm, mở dần không truy cập playlist ngoài metadata.
 const groupPane=d.createElement('section');groupPane.id='poLibraryPulseGroups';
 groupPane.className='po-pulse-groups';groupPane.setAttribute('aria-labelledby','poLibraryPulseGroupsTitle');
 const groupHeading=d.createElement('h3');groupHeading.id='poLibraryPulseGroupsTitle';
 groupHeading.textContent='Phân bố kênh theo nhóm';
 const groupRows=d.createElement('div');groupRows.className='po-pulse-group-rows';
 const moreGroups=d.createElement('button');moreGroups.type='button';moreGroups.id='poLibraryPulseMoreGroups';
 moreGroups.setAttribute('aria-controls','poLibraryPulseGroups');
 moreGroups.setAttribute('aria-expanded','false');
 groupPane.append(groupHeading,groupRows,moreGroups);
 // P5.1.158: duyệt các kênh thiếu URL logo mà không làm thay đổi nguồn.
 const missingPane=d.createElement('section');missingPane.id='poLibraryMissingLogos';
 missingPane.className='po-pulse-missing';
 const missingToggle=d.createElement('button');missingToggle.type='button';
 missingToggle.id='poLibraryMissingToggle';
 missingToggle.setAttribute('aria-controls','poLibraryMissingBody');
 missingToggle.setAttribute('aria-expanded','false');
 missingToggle.textContent='Kênh thiếu logo';
 const missingBody=d.createElement('div');missingBody.id='poLibraryMissingBody';
 missingBody.hidden=true;missingBody.className='po-pulse-missing-body';
 const missingSearch=d.createElement('input');missingSearch.type='search';
 missingSearch.id='poLibraryMissingSearch';missingSearch.placeholder='Tìm kênh hoặc nhóm (không dấu)…';
 missingSearch.setAttribute('aria-label','Tìm kênh thiếu logo theo tên hoặc nhóm');
 missingSearch.setAttribute('autocomplete','off');
 const missingGroup=d.createElement('select');
 missingGroup.id='poLibraryMissingGroup';
 missingGroup.setAttribute('aria-label','Lọc kênh thiếu logo theo nhóm');
 // P5.1.169: lọc riêng kênh thiếu logo theo mã nhận diện EPG (chỉ đọc metadata).
 const missingEpg=d.createElement('select');missingEpg.id='poLibraryMissingEpg';
 missingEpg.setAttribute('aria-label','Lọc kênh thiếu logo theo mã EPG');
 for(const [value,label] of [['','Mọi tình trạng EPG'],['missing-epg','Thiếu cả mã EPG'],['with-epg','Đã có mã EPG']]){
  const option=d.createElement('option');option.value=value;option.textContent=label;
  missingEpg.append(option);
 }
 const missingSort=d.createElement('select');missingSort.id='poLibraryMissingSort';
 missingSort.setAttribute('aria-label','Sắp xếp danh sách kênh thiếu logo');
 for(const [value,label] of [['playlist','Thứ tự playlist'],['name-asc','Tên kênh A–Z'],['name-desc','Tên kênh Z–A']]){
  const option=d.createElement('option');option.value=value;option.textContent=label;
  missingSort.append(option);
 }
 // P5.1.163: xuất CSV chỉ chứa tên/nhóm theo bộ lọc hiện hành.
 const missingSize=d.createElement('select');missingSize.id='poLibraryMissingSize';
 missingSize.setAttribute('aria-label','Số kênh thiếu logo mỗi trang');
 for(const n of [10,25,50]){
  const option=d.createElement('option');option.value=String(n);option.textContent=n+' kênh/trang';
  missingSize.append(option);
 }
 const exportBar=d.createElement('div');exportBar.className='po-pulse-export-bar';
 const missingExport=d.createElement('button');missingExport.type='button';
 missingExport.id='poLibraryMissingExport';missingExport.textContent='Xuất CSV';
 missingExport.setAttribute('aria-label','Xuất CSV tên và nhóm kênh thiếu logo đã lọc');
 // P5.1.170: một thao tác khôi phục toàn bộ bộ lọc Thư viện, không sửa nguồn IPTV.
 const missingReset=d.createElement('button');missingReset.type='button';
 missingReset.id='poLibraryMissingReset';missingReset.textContent='Xóa bộ lọc';
 missingReset.setAttribute('aria-label','Xóa các bộ lọc kênh thiếu logo');
 const exportStatus=d.createElement('span');exportStatus.id='poLibraryMissingExportStatus';
 exportStatus.setAttribute('role','status');exportStatus.setAttribute('aria-live','polite');
 exportBar.append(missingExport,missingReset,exportStatus);
 const missingRows=d.createElement('ol');missingRows.id='poLibraryMissingRows';
 const missingNav=d.createElement('div');missingNav.className='po-pulse-missing-nav';missingNav.id='poLibraryMissingNav';
 const missingPrev=d.createElement('button');missingPrev.type='button';missingPrev.id='poLibraryMissingPrev';
 missingPrev.textContent='Trước';
 const missingPageLabel=d.createElement('span');missingPageLabel.id='poLibraryMissingPage';
 const missingRange=d.createElement('div');missingRange.id='poLibraryMissingRange';
 missingRange.className='po-pulse-missing-range';missingRange.setAttribute('role','status');
 missingRange.setAttribute('aria-live','polite');
 const missingNext=d.createElement('button');missingNext.type='button';missingNext.id='poLibraryMissingNext';
 missingNext.textContent='Tiếp';
 const missingJump=d.createElement('input');missingJump.type='number';missingJump.min='1';
 missingJump.id='poLibraryMissingJump';missingJump.inputMode='numeric';missingJump.placeholder='Số';
 missingJump.setAttribute('aria-label','Nhập số trang của danh sách kênh thiếu logo');
 const missingGo=d.createElement('button');missingGo.type='button';missingGo.id='poLibraryMissingGo';
 missingGo.textContent='Đến';
 missingNav.append(missingPrev,missingPageLabel,missingJump,missingGo,missingNext);
 missingBody.append(missingSearch,missingGroup,missingEpg,missingSort,missingSize,exportBar,missingNav,missingRange,missingRows);missingPane.append(missingToggle,missingBody);
 // P5.1.164: tên trùng ở nhiều kênh/nguồn, chỉ xem metadata, không tự xóa.
 const duplicatePane=d.createElement('section');duplicatePane.id='poLibraryDuplicates';
 duplicatePane.className='po-pulse-duplicates';
 const duplicateToggle=d.createElement('button');duplicateToggle.type='button';
 duplicateToggle.id='poLibraryDuplicateToggle';duplicateToggle.textContent='Tên kênh trùng';
 duplicateToggle.setAttribute('aria-controls','poLibraryDuplicateBody');
 duplicateToggle.setAttribute('aria-expanded','false');
 const duplicateBody=d.createElement('div');duplicateBody.id='poLibraryDuplicateBody';
 duplicateBody.hidden=true;duplicateBody.className='po-pulse-duplicate-body';
 const duplicateSearch=d.createElement('input');duplicateSearch.type='search';
 duplicateSearch.id='poLibraryDuplicateSearch';duplicateSearch.placeholder='Tìm tên trùng hoặc nhóm…';
 duplicateSearch.setAttribute('aria-label','Tìm tên kênh trùng trong thư viện');
 duplicateSearch.setAttribute('autocomplete','off');
 const duplicateTools=d.createElement('div');duplicateTools.className='po-pulse-duplicate-tools';
 const duplicateScope=d.createElement('select');duplicateScope.id='poLibraryDuplicateScope';
 duplicateScope.setAttribute('aria-label','Lọc tên kênh trùng theo số nguồn');
 for(const [value,label] of [['','Tất cả tên trùng'],['cross-source','Trùng giữa nhiều nguồn'],
  ['single-source','Trùng trong một nguồn'],['unknown-source','Chưa rõ nguồn']]){
  const option=d.createElement('option');option.value=value;option.textContent=label;duplicateScope.append(option);
 }
 const duplicateClear=d.createElement('button');duplicateClear.type='button';
 duplicateClear.id='poLibraryDuplicateClear';duplicateClear.textContent='Xóa lọc';
 duplicateClear.setAttribute('aria-label','Xóa từ khóa tìm kiếm tên kênh trùng');
 duplicateTools.append(duplicateScope,duplicateClear);
 const duplicateSummary=d.createElement('p');duplicateSummary.id='poLibraryDuplicateSummary';
 duplicateSummary.className='po-pulse-duplicate-summary';
 const duplicateExportBar=d.createElement('div');duplicateExportBar.className='po-pulse-export-bar';
 const duplicateExport=d.createElement('button');duplicateExport.type='button';duplicateExport.id='poLibraryDuplicateExport';
 duplicateExport.setAttribute('aria-label','Xuất CSV tên kênh trùng đã lọc, không chứa URL');
 const duplicateExportStatus=d.createElement('span');duplicateExportStatus.id='poLibraryDuplicateExportStatus';
 duplicateExportStatus.setAttribute('role','status');duplicateExportStatus.setAttribute('aria-live','polite');
 duplicateExportBar.append(duplicateExport,duplicateExportStatus);
 const duplicateRows=d.createElement('ol');duplicateRows.id='poLibraryDuplicateRows';
 const duplicateNav=d.createElement('div');duplicateNav.className='po-pulse-duplicate-nav';
 const duplicatePrev=d.createElement('button');duplicatePrev.type='button';
 duplicatePrev.id='poLibraryDuplicatePrev';duplicatePrev.textContent='Trước';
 const duplicatePage=d.createElement('span');duplicatePage.id='poLibraryDuplicatePage';
 const duplicateNext=d.createElement('button');duplicateNext.type='button';
 duplicateNext.id='poLibraryDuplicateNext';duplicateNext.textContent='Tiếp';
 duplicateNav.append(duplicatePrev,duplicatePage,duplicateNext);
 duplicateBody.append(duplicateSearch,duplicateTools,duplicateSummary,duplicateExportBar,duplicateRows,duplicateNav);
 duplicatePane.append(duplicateToggle,duplicateBody);
 const footer=d.createElement('footer');footer.className='po-pulse-footer';
 const stamp=d.createElement('span');stamp.id='poLibraryPulseStamp';
 const refresh=d.createElement('button');refresh.type='button';refresh.id='poLibraryPulseRefresh';
 refresh.textContent='Cập nhật';footer.append(stamp,refresh);
 panel.append(header,hint,cards,ratios,groupPane,missingPane,duplicatePane,footer);d.body.append(panel);
 const addCard=(label,value)=>{
  const item=d.createElement('div');item.className='po-pulse-card';
  const number=d.createElement('strong');number.textContent=String(value);
  const caption=d.createElement('span');caption.textContent=label;item.append(number,caption);cards.append(item);
 };
 const addRatio=(label,value,total)=>{
  const row=d.createElement('div');row.className='po-pulse-ratio';
  const caption=d.createElement('p');caption.textContent=label;
  const data=d.createElement('strong');data.textContent=String(value)+' / '+String(total);
  const bar=d.createElement('div');bar.className='po-pulse-track';
  const fill=d.createElement('span');fill.style.width=total?Math.round(100*value/total)+'%':'0%';
  bar.append(fill);row.append(caption,data,bar);ratios.append(row);
 };
 let groupSummary=[],groupTotal=0,visibleGroupCount=5;
 const renderGroupRows=()=>{
  groupRows.replaceChildren();
  const page=core.pageGroups(groupSummary,visibleGroupCount);
  if(!groupSummary.length){
   const empty=d.createElement('p');empty.className='po-pulse-group-empty';
   empty.textContent='Chưa có nhóm kênh để phân tích';groupRows.append(empty);
  }
  for(const group of page.rows){
   const row=d.createElement('div');row.className='po-pulse-group';
   const name=d.createElement('span');name.className='po-pulse-group-name';name.textContent=group.name;
   name.title=group.name;
   const count=d.createElement('strong');count.textContent=String(group.count);
   const track=d.createElement('div');track.className='po-pulse-group-track';
   const fill=d.createElement('span');fill.style.width=groupTotal?
    Math.min(100,Math.round(100*group.count/groupTotal))+'%':'0%';
   track.append(fill);row.append(name,count,track);groupRows.append(row);
  }
  moreGroups.hidden=groupSummary.length<=5;
  moreGroups.textContent=page.remaining?'Xem thêm '+Math.min(5,page.remaining)+' nhóm':'Thu gọn danh sách';
  moreGroups.setAttribute('aria-expanded',String(visibleGroupCount>5));
 };
 const render=()=>{
  const result=core.summarize(state.getChannels());
  cards.replaceChildren();ratios.replaceChildren();
  addCard('Kênh',result.total);addCard('Nguồn',result.sources);
  addCard('Nhóm',result.groups);addCard('Đã ghi nhận phát được',result.knownAlive);
  addRatio('Có URL logo trong metadata',result.withLogoMeta,result.total);
  addRatio('Có mã nhận diện EPG',result.withEpgId,result.total);
  groupSummary=result.groupBreakdown;groupTotal=result.total;renderGroupRows();
  const selectedGroup=missingGroup.value;
  missingGroup.replaceChildren();
  const optionAll=d.createElement('option');optionAll.value='';optionAll.textContent='Tất cả nhóm thiếu logo';
  missingGroup.append(optionAll);
  for(const group of core.missingLogoGroups(state.getChannels())){
   const option=d.createElement('option');option.value=group.name;
   option.textContent=group.name+' · '+group.count+' kênh';missingGroup.append(option);
  }
  missingGroup.value=[...missingGroup.options].some(o=>o.value===selectedGroup)?selectedGroup:'';
  missingIndex=0;renderMissing();duplicateIndex=0;renderDuplicates();
  stamp.textContent='Cập nhật lúc '+new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
 };
 let missingIndex=0,missingTotal=0;
 const missingPageSize=()=>Number(missingSize.value)||10;
 const renderMissing=()=>{
  const size=missingPageSize();
  const report=core.missingLogos(state.getChannels(),{offset:missingIndex*size,limit:size,query:missingSearch.value,group:missingGroup.value,sort:missingSort.value,epg:missingEpg.value});
  missingTotal=report.total;missingRows.replaceChildren();
  missingExport.disabled=missingTotal===0;
  missingReset.hidden=!(missingSearch.value.trim()||missingGroup.value||missingEpg.value||missingSort.value!=='playlist'||missingSize.value!=='10');
  missingExport.textContent='Xuất CSV · '+missingTotal+' kênh';
  exportStatus.textContent='';
  missingToggle.textContent='Kênh thiếu logo: '+missingTotal;
  for(const item of report.rows){
   const li=d.createElement('li');li.className='po-pulse-missing-row';
   const name=d.createElement('strong');name.textContent=item.name;
   const group=d.createElement('small');group.textContent=item.group;
   li.append(name,group);missingRows.append(li);
  }
  if(!report.rows.length){
   const empty=d.createElement('li');empty.className='po-pulse-missing-empty';
   empty.textContent=(missingSearch.value.trim()||missingGroup.value||missingEpg.value)?'Không tìm thấy kênh phù hợp.':'Không có kênh thiếu URL logo.';missingRows.append(empty);
  }
  const pages=Math.max(1,Math.ceil(missingTotal/size));
  missingPageLabel.textContent='Trang '+(missingIndex+1)+' / '+pages;
  missingRange.textContent=core.missingVisibleRange(missingTotal,missingIndex*size,size);
  missingJump.max=String(pages);
  missingJump.value=String(missingIndex+1);
  missingPrev.disabled=missingIndex===0;
  missingNext.disabled=(missingIndex+1)*size>=missingTotal;
 };
 // Kết quả trùng tên là bản sao metadata; không truy xuất hoặc sửa URL nguồn.
 let duplicateIndex=0,duplicateTotal=0;
 const renderDuplicates=()=>{
  const report=core.duplicateNames(state.getChannels(),{
   query:duplicateSearch.value,scope:duplicateScope.value,offset:duplicateIndex*8,limit:8});
  duplicateTotal=report.total;
  duplicateClear.hidden=!duplicateSearch.value.trim();
  duplicateExport.disabled=duplicateTotal===0;
  duplicateExport.textContent='Xuất CSV · '+duplicateTotal+' tên trùng';
  duplicateExportStatus.textContent='';
  duplicateToggle.textContent='Tên kênh trùng: '+duplicateTotal;
  duplicateSummary.textContent=report.extraChannels+' kênh bổ sung trùng tên · Chỉ để rà soát';
  duplicateRows.replaceChildren();
  for(const item of report.rows){
   const li=d.createElement('li');li.className='po-pulse-duplicate-row';
   const name=d.createElement('strong');name.textContent=item.name;
   const details=d.createElement('small');
   details.textContent=item.count+' kênh · '+item.groupCount+' nhóm'+
    (item.sourceCount?' · '+item.sourceCount+' nguồn':'');
   const groups=d.createElement('span');groups.textContent=item.groups.join(' · ');
   li.append(name,details,groups);duplicateRows.append(li);
  }
  if(!report.rows.length){
   const empty=d.createElement('li');empty.className='po-pulse-duplicate-empty';
   empty.textContent=duplicateSearch.value.trim()?
    'Không có tên trùng phù hợp.':'Không có kênh bị trùng tên.';duplicateRows.append(empty);
  }
  const totalPages=Math.max(1,Math.ceil(duplicateTotal/8));
  duplicatePage.textContent='Trang '+(duplicateIndex+1)+' / '+totalPages;
  duplicatePrev.disabled=duplicateIndex===0;
  duplicateNext.disabled=(duplicateIndex+1)*8>=duplicateTotal;
 };
 let opened=false;
 const hide=(restoreFocus=false)=>{if(!opened)return;const restore=restoreFocus||panel.contains(d.activeElement);
  opened=false;panel.hidden=true;toggle.setAttribute('aria-expanded','false');
  if(restore)toggle.focus({preventScroll:true});};
 toggle.addEventListener('click',()=>{
  if(opened){hide();return;}
  for(const id of ['poArchiveToggle','poWatchFlowToggle']){
   const other=d.getElementById(id);
   if(other?.getAttribute('aria-expanded')==='true')other.click();
  }
  render();opened=true;panel.hidden=false;panel.scrollTop=0;toggle.setAttribute('aria-expanded','true');
  close.focus({preventScroll:true});
 });
 moreGroups.addEventListener('click',()=>{
  if(visibleGroupCount>=groupSummary.length&&visibleGroupCount>5)visibleGroupCount=5;
  else visibleGroupCount+=5;
  renderGroupRows();moreGroups.focus({preventScroll:true});
 });
 missingToggle.addEventListener('click',()=>{
  const expanded=missingToggle.getAttribute('aria-expanded')!=='true';
  missingBody.hidden=!expanded;
  missingToggle.setAttribute('aria-expanded',String(expanded));
  if(expanded)missingPane.scrollIntoView({block:'nearest',behavior:'instant'});
 });
 duplicateToggle.addEventListener('click',()=>{
  const expanded=duplicateToggle.getAttribute('aria-expanded')!=='true';
  duplicateBody.hidden=!expanded;
  duplicateToggle.setAttribute('aria-expanded',String(expanded));
  if(expanded)duplicatePane.scrollIntoView({block:'nearest',behavior:'instant'});
 });
 duplicateSearch.addEventListener('input',()=>{duplicateIndex=0;renderDuplicates();});
 duplicateScope.addEventListener('change',()=>{duplicateIndex=0;renderDuplicates();});
 duplicateClear.addEventListener('click',()=>{
  duplicateSearch.value='';duplicateIndex=0;renderDuplicates();duplicateSearch.focus({preventScroll:true});
 });
 duplicateExport.addEventListener('click',()=>{
  const options={query:duplicateSearch.value,scope:duplicateScope.value};
  const count=core.duplicateNames(state.getChannels(),options).total;
  if(!count)return;
  const csv=core.duplicateNamesCsv(state.getChannels(),options);
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=d.createElement('a');link.href=url;
  link.download='positron-ten-kenh-trung-'+new Date().toISOString().slice(0,10)+'.csv';
  d.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  duplicateExportStatus.textContent='Đã xuất '+count+' tên trùng · Không chứa URL';
  duplicateExport.focus({preventScroll:true});
 });
 duplicatePrev.addEventListener('click',()=>{
  if(duplicateIndex>0)duplicateIndex--;
  renderDuplicates();duplicatePrev.focus({preventScroll:true});
 });
 duplicateNext.addEventListener('click',()=>{
  if((duplicateIndex+1)*8<duplicateTotal)duplicateIndex++;
  renderDuplicates();duplicateNext.focus({preventScroll:true});
 });
 missingSearch.addEventListener('input',()=>{missingIndex=0;renderMissing();});
 missingGroup.addEventListener('change',()=>{missingIndex=0;renderMissing();});
 missingEpg.addEventListener('change',()=>{missingIndex=0;renderMissing();});
 missingSort.addEventListener('change',()=>{missingIndex=0;renderMissing();});
 missingSize.addEventListener('change',()=>{missingIndex=0;renderMissing();});
 missingReset.addEventListener('click',()=>{
  missingSearch.value='';missingGroup.value='';missingEpg.value='';
  missingSort.value='playlist';missingSize.value='10';missingIndex=0;
  renderMissing();missingSearch.focus({preventScroll:true});
 });
 missingExport.addEventListener('click',()=>{
  const options={query:missingSearch.value,group:missingGroup.value,sort:missingSort.value,epg:missingEpg.value};
  const count=core.missingLogos(state.getChannels(),options).total;
  if(!count)return;
  const csv=core.missingLogoCsv(state.getChannels(),options);
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=d.createElement('a');link.href=url;
  link.download='positron-kenh-thieu-logo-'+new Date().toISOString().slice(0,10)+'.csv';
  d.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  exportStatus.textContent='Đã xuất '+count+' kênh · Chỉ tên và nhóm';
  missingExport.focus({preventScroll:true});
 });
 const goMissingPage=()=>{
  const max=Math.max(1,Math.ceil(missingTotal/missingPageSize()));
  missingIndex=core.missingPage(missingJump.value,max,missingIndex+1)-1;
  renderMissing();missingJump.focus({preventScroll:true});
 };
 missingGo.addEventListener('click',goMissingPage);
 missingJump.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();goMissingPage();}
 });
 missingPrev.addEventListener('click',()=>{
  if(missingIndex>0)missingIndex--;
  renderMissing();missingPrev.focus({preventScroll:true});
 });
 missingNext.addEventListener('click',()=>{
  if((missingIndex+1)*missingPageSize()<missingTotal)missingIndex++;
  renderMissing();missingNext.focus({preventScroll:true});
 });
 close.addEventListener('click',hide);
 refresh.addEventListener('click',()=>{render();refresh.focus({preventScroll:true});});
 d.addEventListener('keydown',event=>{if(opened&&event.key==='Escape'){event.preventDefault();hide(true);}});
 d.addEventListener('pointerdown',event=>{
  if(opened&&!panel.contains(event.target)&&!toggle.contains(event.target))hide();
 });
})();
