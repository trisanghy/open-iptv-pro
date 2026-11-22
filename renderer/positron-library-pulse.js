'use strict';
// Positron P5.1.156 — Bảng phân tích metadata thư viện, không thử stream.
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
 const footer=d.createElement('footer');footer.className='po-pulse-footer';
 const stamp=d.createElement('span');stamp.id='poLibraryPulseStamp';
 const refresh=d.createElement('button');refresh.type='button';refresh.id='poLibraryPulseRefresh';
 refresh.textContent='Cập nhật';footer.append(stamp,refresh);
 panel.append(header,hint,cards,ratios,groupPane,footer);d.body.append(panel);
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
  stamp.textContent='Cập nhật lúc '+new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
 };
 let opened=false;
 const hide=()=>{if(!opened)return;const restore=panel.contains(d.activeElement);
  opened=false;panel.hidden=true;toggle.setAttribute('aria-expanded','false');
  if(restore)toggle.focus({preventScroll:true});};
 toggle.addEventListener('click',()=>{
  if(opened){hide();return;}
  for(const id of ['poArchiveToggle','poWatchFlowToggle']){
   const other=d.getElementById(id);
   if(other?.getAttribute('aria-expanded')==='true')other.click();
  }
  render();opened=true;panel.hidden=false;toggle.setAttribute('aria-expanded','true');
  close.focus({preventScroll:true});
 });
 moreGroups.addEventListener('click',()=>{
  if(visibleGroupCount>=groupSummary.length&&visibleGroupCount>5)visibleGroupCount=5;
  else visibleGroupCount+=5;
  renderGroupRows();moreGroups.focus({preventScroll:true});
 });
 close.addEventListener('click',hide);
 refresh.addEventListener('click',()=>{render();refresh.focus({preventScroll:true});});
 d.addEventListener('keydown',event=>{if(opened&&event.key==='Escape'){event.preventDefault();hide();}});
 d.addEventListener('pointerdown',event=>{
  if(opened&&!panel.contains(event.target)&&!toggle.contains(event.target))hide();
 });
})();
