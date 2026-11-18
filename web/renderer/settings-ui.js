'use strict';
// Compact configuration UX; preserves existing input nodes and event listeners.
(() => {
 const page=document.querySelector('#page-settings'), grid=page?.querySelector('.settings-grid');
 if(!grid)return;
 const titles={uiStyleSettings:'11 phong cách đồng bộ · Compact / Comfort',backupSettings:'Sao lưu, Khôi phục và ảnh Snapshot',languageSettings:'Ngôn ngữ hiển thị',appearanceSettings:'Sáng / Tối / AMOLED · Color Wheel',freezeMonitorSettings:'Giám sát khung hình và link dự phòng',defaultBufferSettings:'Tua lại khi đổi kênh',epgSettingsCard:'Nguồn EPG và tự cập nhật',fullFeatureTools:'Cấu hình kiểm tra, Snapshot và thời gian tua'};
 const sections=[];
 for(const card of Array.from(grid.children)){
  if(!card.matches('article.settings-card'))continue;
  const fold=document.createElement('details');
  for(const attr of Array.from(card.attributes)) fold.setAttribute(attr.name,attr.value);
  fold.classList.add('settings-accordion');
  const summary=document.createElement('summary');summary.className='settings-accordion-heading';
  const h2=card.querySelector(':scope > h2');
  if(h2){summary.appendChild(h2);}
  else{const t=document.createElement('h2');t.textContent='Cài đặt';summary.append(t);}
  const hint=document.createElement('span');hint.className='settings-accordion-hint';
  hint.textContent=titles[card.id]||({ '🎨':'Bánh xe chọn màu, bảng màu sẵn có' })[summary.textContent.slice(0,2)]||'Nhấn để mở các tùy chọn';
  const arrow=document.createElement('span');arrow.className='settings-accordion-chevron';arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');
  summary.append(hint,arrow);
  const body=document.createElement('div');body.className='settings-accordion-content';
  while(card.firstChild)body.appendChild(card.firstChild);
  fold.append(summary,body);
  card.replaceWith(fold);
  sections.push(fold);
  fold.addEventListener('toggle',()=>{
   if(!fold.open)return;
   for(const other of sections)if(other!==fold)other.open=false;
  });
 }
 // Deliberately collapsed on each visit, but a deep link opens its target.
 function openSection(id){const target=document.getElementById(id);if(!target?.matches('.settings-accordion'))return;
  target.open=true;
  requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'smooth'}));
 }
 window.IPTVSettingsUI={openSection};
 document.getElementById('epgSettingsBtn')?.addEventListener('click',()=>setTimeout(()=>openSection('epgSettingsCard'),0));
 // Color sidebar is part of appearanceSettings, not a separate accordion.
})();
