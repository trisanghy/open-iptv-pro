'use strict';
/* Positron P5.1.55 — TV-first workspace. No media, playlist, auth or IPC logic changed. */
(()=>{
 const d=document,root=d.documentElement,byId=id=>d.getElementById(id);
 if(root.dataset.positron!=='true'||!byId('appSidebar')||!byId('playerBox'))return;
 root.classList.add('po-v3');
 const sidebar=byId('appSidebar');
 const nav=sidebar.querySelectorAll('.nav');
 // Complete the outline icon vocabulary for tools that previously relied
 // on inconsistent Unicode glyphs. Original navigation buttons remain.
 const vector={
  multiview:['M3 3h8v8H3z','M13 3h8v8h-8z','M3 13h8v8H3z','M13 13h8v8h-8z'],
  shots:['M4 7h4l2-2h4l2 2h4v12H4z','M12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6'],
  folders:['M3 6h7l2 2h9v11H3z'],
  health:['M2 12h5l3-6 4 12 3-6h5'],
  doctor:['M12 4v16','M4 12h16','M5 4h14v16H5z'],
  profiles:['M16 21v-2a4 4 0 0 0-8 0v2','M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
  export:['M12 3v13','m7 11 5 5 5-5','M4 18v3h16v-3']
 };
 for(const [page,paths] of Object.entries(vector)){
  const btn=page==='export'?byId('exportNav'):sidebar.querySelector('.nav[data-page="'+page+'"]');
  const span=btn?.querySelector(':scope > span');if(!span)continue;
  const svg=d.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  svg.setAttribute('width','21');svg.setAttribute('height','21');
  svg.style.cssText='fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round';
  for(const shape of paths){
   const p=d.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',shape);svg.append(p);
  }
  span.replaceChildren(svg);
 }
 for(const btn of nav){
  const label=(btn.textContent||'').replace(/\s+/g,' ').trim().replace(/\s+\d+$/,'');
  if(!label)continue;
  btn.setAttribute('aria-label',label);
  if(!btn.title)btn.title=label;
  btn.dataset.poTitle=label;
 }
 // Narrow, discoverable navigation rail. The original buttons and routing
 // remain mounted; users can expand it without losing their selected page.
 const toggle=d.createElement('button');
 toggle.type='button';toggle.id='poRailExpand';
 toggle.setAttribute('aria-controls','appSidebar');
 toggle.setAttribute('aria-label','Mở rộng thanh điều hướng');
 toggle.title='Mở rộng thanh điều hướng';
 toggle.setAttribute('aria-expanded','false');
 toggle.textContent='☰';
 const edge=byId('sidebarToggleBtn');
 edge?.before(toggle);
 const update=expanded=>{
  root.dataset.poRailExpanded=expanded?'true':'false';
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.setAttribute('aria-label',expanded?'Thu gọn thanh điều hướng':'Mở rộng thanh điều hướng');
  toggle.title=expanded?'Thu gọn thanh điều hướng':'Mở rộng thanh điều hướng';
  try{localStorage.setItem('positron-tv-rail-v3',expanded?'expanded':'compact');}catch{}
 };
 let expanded=false;
 try{expanded=localStorage.getItem('positron-tv-rail-v3')==='expanded';}catch{}
 update(expanded);
 toggle.addEventListener('click',()=>update(root.dataset.poRailExpanded!=='true'));
 const more=byId('positronMorePages');
 if(more){more.title='Hiện các công cụ nâng cao';more.setAttribute('aria-label','Hiện hoặc ẩn các công cụ nâng cao');}
 // Relocate the existing disclosure button next to Cast/PiP. All original
 // p50 state handlers and the hidden content stay untouched.
 const advanced=byId('positronToolsToggle'),output=d.querySelector('#page-tv .output-controls');
 if(advanced&&output){
  output.append(advanced);
  advanced.title='Tua lại, ghi hình và công cụ nâng cao';
  advanced.setAttribute('aria-label','Mở hoặc đóng Tua lại, ghi hình và công cụ nâng cao');
  advanced.setAttribute('aria-controls','quickTools');
 }
 // Put secondary channel filters at the end of search, rather than forcing
 // another whole-width row above the list.
 const filters=byId('positronFiltersToggle'),filterBox=d.querySelector('#page-tv .channel-panel .filter-box');
 if(filters&&filterBox){
  filterBox.append(filters);
  filters.title='Bộ lọc và quản lý thư mục';
  filters.setAttribute('aria-label','Mở hoặc đóng bộ lọc và quản lý thư mục');
 }
 // No duplicate faux transport: original #playBtn and its native controls
 // are the only playback buttons. Use Ctrl/Meta+K palette already available.
 root.dataset.poWorkspaceV3='true';
})();
