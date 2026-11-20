'use strict';
/* Positron P4: 50-stage visual engineering lab.
   Pure renderer companion. Existing IPTVState, video, auth, settings and IPC
   remain authoritative. All hidden features can be expanded again. */
(()=>{
  const root=document.documentElement,d=document;
  if(root.dataset.positron!=='true'||!d.getElementById('positronBar'))return;
  const ADVANCED=['multiview','shots','folders','health','doctor','profiles'];
  const hiddenPages=new Set(ADVANCED);
  const q=s=>d.querySelector(s);
  const id=s=>d.getElementById(s);
  let stage=50;
  let previous=null;
  let expanded=false,filtersOpen=false,toolsOpen=false;
  const namespace='positron-p4-v1';
  const store=(key,val)=>{try{localStorage.setItem(namespace+key,String(val));}catch{}};
  const load=key=>{try{return localStorage.getItem(namespace+key);}catch{return null;}};
  // Do not make advanced sections permanently unreachable.
  const more=d.createElement('button');
  more.type='button';more.id='positronMorePages';
  more.className='p50-more-pages';
  more.textContent='▦ Công cụ khác';more.title='Hiện hoặc ẩn chức năng chuyên sâu';
  more.setAttribute('aria-expanded','false');
  const firstAdvanced=q('#appSidebar .nav[data-page="multiview"]');
  firstAdvanced?.before(more);
  const syncMore=()=>{
    root.classList.toggle('p50-advanced-closed',!expanded);
    more.setAttribute('aria-expanded',String(expanded));
    more.textContent=expanded?'▴ Thu gọn công cụ':'▾ Công cụ khác';
  };
  const showMore=(value,persist=true)=>{
    expanded=!!value;
    syncMore();
    if(persist)store('advanced',expanded?'open':'closed');
  };
  more.addEventListener('click',()=>showMore(!expanded));
  showMore(load('advanced')==='open',false);
  // Active advanced pages reveal their original navigation button.
  const sidebar=id('appSidebar');
  const revealCurrent=()=>{
    const active=sidebar?.querySelector('.nav.active[data-page]');
    if(active&&hiddenPages.has(active.dataset.page)&&!expanded)showMore(true,false);
  };
  if(sidebar)new MutationObserver(revealCurrent).observe(sidebar,{attributes:true,subtree:true,attributeFilter:['class']});
  revealCurrent();

  const panel=q('#page-tv .channel-panel'),search=id('searchBox');
  const filters=d.createElement('button');
  filters.type='button';filters.id='positronFiltersToggle';
  filters.className='p50-secondary-toggle';
  filters.textContent='Bộ lọc và thư mục';filters.setAttribute('aria-expanded','false');
  filters.title='Mở bộ lọc nâng cao và sắp xếp thư mục';
  q('#page-tv .folder-actions')?.before(filters);
  const syncFilters=()=>{
    root.classList.toggle('p50-filters-closed',!filtersOpen);
    filters.setAttribute('aria-expanded',String(filtersOpen));
    filters.textContent=filtersOpen?'Thu gọn bộ lọc':'Bộ lọc và thư mục';
  };
  filters.addEventListener('click',()=>{filtersOpen=!filtersOpen;syncFilters();});
  syncFilters();

  const watch=q('#page-tv .watch-panel');
  const tools=d.createElement('button');
  tools.type='button';tools.id='positronToolsToggle';tools.className='p50-tools-toggle';
  tools.title='Hiện hoặc ẩn Timeshift, hẹn giờ ghi và các công cụ nhanh';
  tools.setAttribute('aria-expanded','false');
  const timeshift=q('#page-tv .advanced-timebar');
  timeshift?.before(tools);
  const syncTools=()=>{
    root.classList.toggle('p50-tools-closed',!toolsOpen);
    tools.setAttribute('aria-expanded',String(toolsOpen));
    tools.textContent=toolsOpen?'▴ Ẩn công cụ phát':'▾ Timeshift · Ghi hình · Công cụ';
  };
  tools.addEventListener('click',()=>{toolsOpen=!toolsOpen;syncTools();});
  syncTools();

  const counts=id('navCount');
  const updateEmpty=()=>{
    const text=counts?.textContent||'';
    const count=Number(text.replace(/[^\d]/g,''))||0;
    root.classList.toggle('p50-empty',count===0);
    if(count>0){
      filters.disabled=false;
      search?.setAttribute('aria-label','Tìm kênh và nhóm kênh');
    }else{
      filters.disabled=false; // user can still open folder tools with empty list
      search?.setAttribute('aria-label','Tìm kênh sau khi thêm nguồn IPTV');
    }
  };
  if(counts)new MutationObserver(updateEmpty).observe(counts,{childList:true,characterData:true,subtree:true});
  updateEmpty();

  const help=d.createElement('dialog');help.id='positronHelpDialog';
  help.setAttribute('aria-label','Hướng dẫn phím tắt và bố cục Positron');
  const h=d.createElement('h2');h.textContent='Dùng Positron nhanh hơn';
  const p=d.createElement('p');p.textContent='Giữ các chức năng phát nguyên bản. Công cụ ít dùng được thu gọn, không bị xóa.';
  const list=d.createElement('dl');
  for(const [keys,detail] of [
    ['Ctrl/⌘ + K','Tìm nhanh kênh, trang và công cụ'],
    ['Alt + 1...5','TV · Yêu thích · Lịch · Nguồn · Cài đặt'],
    ['Alt + P','Đổi màu Positron Studio'],
    ['Alt + F','Tập trung vào video'],
    ['?','Mở hướng dẫn này']]){
    const k=d.createElement('dt'),v=d.createElement('dd');k.textContent=keys;v.textContent=detail;list.append(k,v);
  }
  const close=d.createElement('button');close.type='button';close.textContent='Đóng';close.addEventListener('click',()=>help.close());
  help.append(h,p,list,close);d.body.append(help);
  const helpBtn=d.createElement('button');helpBtn.id='positronHelpBtn';helpBtn.type='button';helpBtn.textContent='?';
  helpBtn.title='Phím tắt và hướng dẫn bố cục';
  q('#positronBar .p-actions')?.append(helpBtn);
  helpBtn.addEventListener('click',()=>help.showModal());
  d.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&help.open){help.close();return;}
    if(e.key!=='?'||e.ctrlKey||e.altKey||e.metaKey||help.open)return;
    if(e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    if(id('positronPalette')?.hidden===false||id('positronStudioMenu')?.hidden===false)return;
    e.preventDefault();help.showModal();
  });
  // Each iteration has a separate committed CSS change; activating the stage
  // progressively turns it on without touching the underlying stream.
  const setStage=(target,feedback=null)=>{
    const n=Math.max(0,Math.min(50,Number(target)||0));
    for(let i=1;i<=50;i++)root.classList.toggle('p50-'+String(i).padStart(2,'0'),i<=n);
    stage=n;root.dataset.p50Stage=String(n);
    if(feedback&&typeof feedback==='object'){
      previous={overflow:!!feedback.overflow,contrast:feedback.contrast??null,screenBytes:feedback.screenBytes??null,round:feedback.round??null};
      // Pixel/geometry feedback from the previous REAL screenshot is forwarded
      // into the next iteration. Do not silently change user preferences.
      root.dataset.p50Feedback=previous.overflow?'overflow':'ok';
    }
    return {stage,fromRound:previous?.round??null};
  };
  setStage(50);
  // Never send local playlists or user data to any audit service.
  window.OpenIPTVPositronFifty=Object.freeze({
    setStage,getStage:()=>stage,getFeedback:()=>previous,
    showMore,openFilters:()=>{filtersOpen=true;syncFilters();},
    openTools:()=>{toolsOpen=true;syncTools();},
    getState:()=>({stage,expanded,filtersOpen,toolsOpen,empty:root.classList.contains('p50-empty')})
  });
})();

/* P4.1: Preserve accessible full labels when labels are icon-only at narrow widths. */
(()=>{const sidebar=document.getElementById('appSidebar');if(!sidebar)return;
 for(const b of sidebar.querySelectorAll('button.nav')){const name=(b.textContent||'').replace(/\s+/g,' ').trim();if(name){if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',name);if(!b.title)b.title=name;}}
 const more=document.getElementById('positronMorePages');if(more){more.setAttribute('aria-label','Hiện hoặc ẩn công cụ khác');more.title='Công cụ khác';}
})();
