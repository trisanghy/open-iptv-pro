'use strict';
/* Positron P1: navigation layer only. The original channel player, IPC,
   DRM/rights consent, EPG and existing preferences remain authoritative. */
(() => {
  const doc=document;
  const root=doc.documentElement;
  const $=id=>doc.getElementById(id);
  if(!$('appShell') || !$('appSidebar') || !doc.querySelector('.main .content')) return;
  root.dataset.positron='true';
  doc.title='Open IPTV Pro · Positron';
  const brand=doc.querySelector('#appSidebar .brand b');
  const descriptor=doc.querySelector('#appSidebar .brand small');
  if(brand) brand.textContent='Positron';
  if(descriptor) descriptor.textContent='P5.1.185';
  const navItems=[
    ['tv','▣','Xem truyền hình','Phát kênh và điều khiển video'],
    ['fav','★','Kênh yêu thích','Danh sách đã đánh dấu sao'],
    ['epg','▤','Lịch phát sóng','Hướng dẫn chương trình EPG'],
    ['multiview','⊞','MultiView','Xem đồng thời tối đa bốn kênh'],
    ['shots','▦','Snapshot','Ảnh chụp từ luồng thật'],
    ['folders','▤','Thư mục kênh','Sắp xếp nhóm và thư mục'],
    ['sources','◈','Nguồn IPTV','Quản lý playlist và URL'],
    ['health','↗','Sức khỏe kênh','Theo dõi độ ổn định / Failover'],
    ['doctor','✚','Smart Doctor','Chẩn đoán luồng và phát lại'],
    ['profiles','♙','Hồ sơ','Khóa trẻ em và quyền truy cập'],
    ['settings','⚙','Cài đặt','Giao diện và chức năng']
  ];
  const main=doc.querySelector('.main');
  const bar=doc.createElement('header');
  bar.id='positronBar';
  bar.setAttribute('aria-label','Thanh công cụ Positron');
  bar.innerHTML='<div class="p-title"><span class="p-orb" aria-hidden="true"></span><div class="p-heading"><strong>Trung tâm phát sóng</strong><small>POSITRON WORKSPACE / ELECTRON LAB</small></div></div><div class="p-actions"><span class="p-live" id="positronLiveLabel" aria-live="polite">Chưa chọn kênh</span><button type="button" id="positronOpen" title="Tìm kênh hoặc chuyển trang (Ctrl/⌘+K)" aria-keyshortcuts="Control+K Meta+K"><span>⌕</span><span class="p-command-label">Tìm kênh, trang, công cụ…</span><kbd>⌘ K</kbd></button><button type="button" id="positronFocus" aria-pressed="false" title="Ẩn/hiện danh sách và sidebar">◫ Tập trung</button><button type="button" id="positronAdd" title="Thêm playlist URL">＋ Nguồn</button></div>';
  main.insertBefore(bar,main.querySelector('.content'));
  // P5.1.21: real Electron/Linux screenshot shows a Mac-only command glyph.
  // This label describes the existing native Ctrl/Meta+K shortcut; never
  // change the actual key handler or the accessibility shortcut attribute.
  const shortcutButton=bar.querySelector('#positronOpen');
  const shortcutBadge=shortcutButton?.querySelector('kbd');
  if(shortcutBadge){
    const platform=String(navigator.userAgentData?.platform||navigator.platform||'');
    const isMac=/Mac|iPhone|iPad/i.test(platform);
    shortcutBadge.textContent=isMac?'⌘ K':'Ctrl K';
    shortcutButton.title=isMac?'Tìm nhanh (⌘+K)':'Tìm nhanh (Ctrl+K)';
  }

  const overlay=doc.createElement('section');
  overlay.id='positronPalette';
  overlay.hidden=true;
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Tìm nhanh Positron');
  overlay.innerHTML='<div class="p-palette"><div class="p-search"><span aria-hidden="true">⌕</span><input id="positronQuery" type="search" autocomplete="off" spellcheck="false" aria-label="Tìm kênh hoặc chức năng" placeholder="Tìm kênh hoặc gõ tên chức năng…" /><button id="positronClose" type="button" title="Đóng">ESC</button></div><div class="p-hint">ĐIỀU HƯỚNG NHANH · KHÔNG TỰ TẢI NGUỒN</div><ul id="positronResults" role="listbox" aria-label="Kết quả tìm kiếm"></ul><div class="p-foot"><span>↑ ↓ để di chuyển · Enter để mở</span><span id="positronCount">0 kênh đã nhập</span></div></div>';
  doc.body.append(overlay);
  const query=$('positronQuery'),results=$('positronResults');
  let focusBefore=null,lastFocused=null,selected=0,items=[];
  const channels=()=>Array.isArray(window.IPTVState?.getChannels?.())?window.IPTVState.getChannels():[];
  const clean=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d');
  function render(){
    const all=channels();
    const needle=clean(query.value.trim());
    const pages=navItems.filter(row=>!needle || clean(row[2]+' '+row[3]).includes(needle))
      .map(row=>({kind:'page',id:row[0],glyph:row[1],name:row[2],description:row[3]}));
    const hits=needle?all.filter(ch=>clean(ch.name||'').includes(needle) || clean(ch.group||'').includes(needle)).slice(0,8):
      all.slice(0,3);
    items=[...pages,...hits.map(ch=>({kind:'channel',id:ch.id,glyph:'▶',name:ch.name||'Kênh IPTV',description:'Kênh · '+(ch.group||'Danh sách của bạn')}))].slice(0,12);
    selected=Math.min(selected,Math.max(0,items.length-1));
    results.replaceChildren();
    if(!items.length){
      const empty=doc.createElement('li');empty.className='p-empty';empty.textContent='Không tìm thấy kết quả trong dữ liệu hiện có.';results.append(empty);
    }
    items.forEach((item,i)=>{
      const li=doc.createElement('li');
      const button=doc.createElement('button');button.type='button';
      button.dataset.index=String(i);button.setAttribute('role','option');
      button.setAttribute('aria-selected',String(i===selected));
      const glyph=doc.createElement('span');glyph.className='p-glyph';glyph.textContent=item.glyph;
      const copy=doc.createElement('span');copy.className='p-result-copy';
      const title=doc.createElement('strong');title.textContent=item.name;
      const help=doc.createElement('small');help.textContent=item.description;
      const end=doc.createElement('span');end.className='p-end';end.textContent=item.kind==='channel'?'PHÁT':'MỞ';
      copy.append(title,help);button.append(glyph,copy,end);
      button.addEventListener('mouseenter',()=>mark(i));
      button.addEventListener('click',()=>activate(i));
      li.append(button);results.append(li);
    });
    $('positronCount').textContent=all.length+' kênh đã nhập';
  }
  function mark(i){
    selected=i;
    for(const el of results.querySelectorAll('[data-index]')){
      el.setAttribute('aria-selected',String(Number(el.dataset.index)===selected));
    }
  }
  function open(){
    if(!overlay.hidden)return;
    lastFocused=doc.activeElement;
    overlay.hidden=false;
    query.value='';
    selected=0;
    render();
    query.focus();
  }
  function close(){
    overlay.hidden=true;
    if(lastFocused && typeof lastFocused.focus==='function')lastFocused.focus();
  }
  function activate(i){
    const item=items[i];
    if(!item)return;
    close();
    if(item.kind==='channel'){
      window.IPTVState?.setPage?.('tv');
      window.IPTVState?.playChannel?.(item.id);
      return;
    }
    window.IPTVState?.setPage?.(item.id);
  }
  function inputTarget(target){
    return !!target?.closest?.('input, textarea, select, [contenteditable="true"]');
  }
  doc.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
      event.preventDefault();overlay.hidden?open():close();return;
    }
    if(event.key==='Escape'&&!overlay.hidden){event.preventDefault();close();return;}
    if(overlay.hidden){
      if(event.key==='/'&&!event.altKey&&!event.metaKey&&!event.ctrlKey&&!inputTarget(event.target)){
        // The channel-search shortcut on TV belongs to the later
        // PositronTwenty listener. The command palette must not steal '/'.
        // When channel search is hidden (e.g. compact TV), use palette.
        const finder=$('searchBox');
        const rect=finder?.getBoundingClientRect();
        if(doc.querySelector('#page-tv.active-page')&&rect?.width>0&&rect?.height>0)return;
        event.preventDefault();open();
      }
      return;
    }
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      if(items.length){mark((selected+(event.key==='ArrowDown'?1:-1)+items.length)%items.length);
        results.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'});}
    }else if(event.key==='Enter' && doc.activeElement===query){
      event.preventDefault();activate(selected);
    }
  });
  query.addEventListener('input',()=>{selected=0;render();});
  overlay.addEventListener('mousedown',event=>{if(event.target===overlay)close();});
  $('positronOpen').addEventListener('click',open);
  $('positronClose').addEventListener('click',close);
  $('positronAdd').addEventListener('click',()=>{$('urlBtn')?.click();});
  // P5.1.22: replace ambiguous platform glyph with stateful SVG in the original focus button.
  function renderFocusVisual(active){
    const button=$('positronFocus');if(!button)return;
    const ns='http://www.w3.org/2000/svg';
    const svg=doc.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
    const path=doc.createElementNS(ns,'path');
    path.setAttribute('d',active?'M8 3H3v5 M16 3h5v5 M8 21H3v-5 M16 21h5v-5':'M4 4h16v16H4z M9 4v16');
    svg.append(path);
    const label=doc.createElement('span');label.textContent=active?'Khôi phục':'Tập trung';
    button.replaceChildren(svg,label);
    button.setAttribute('aria-label',active?'Khôi phục bố cục bình thường':'Bật chế độ tập trung');
    button.title=active?'Khôi phục sidebar và danh sách':'Ẩn/hiện danh sách và sidebar';
  }
  renderFocusVisual(false);
  function setFocus(shouldFocus){
    const sidebarVisible=root.dataset.sidebarVisible!=='false';
    const channelsVisible=root.dataset.channelPanelVisible!=='false';
    if(shouldFocus){
      if(focusBefore)return;
      window.IPTVState?.setPage?.('tv');
      focusBefore={sidebarVisible,channelsVisible};
      if(sidebarVisible)$('sidebarToggleBtn')?.click();
      if(channelsVisible)$('channelPanelHideBtn')?.click();
    }else{
      if(!focusBefore)return;
      const previous=focusBefore;focusBefore=null;
      if((root.dataset.sidebarVisible!=='false')!==previous.sidebarVisible)$('sidebarToggleBtn')?.click();
      if((root.dataset.channelPanelVisible!=='false')!==previous.channelsVisible){
        if(previous.channelsVisible)$('channelPanelShowBtn')?.click();
        else $('channelPanelHideBtn')?.click();
      }
    }
    root.dataset.positronFocus=shouldFocus?'true':'false';
    $('positronFocus').setAttribute('aria-pressed',String(shouldFocus));
    renderFocusVisual(shouldFocus);
  }
  $('positronFocus').addEventListener('click',()=>setFocus(!focusBefore));
  function syncStatus(){
    const current=window.IPTVState?.getCurrent?.();
    const label=$('positronLiveLabel');
    if(label)label.textContent=current?.name||'Chưa chọn kênh';
  }
  if($('playingTitle'))new MutationObserver(syncStatus).observe($('playingTitle'),{childList:true,subtree:true,characterData:true});
  syncStatus();
  window.OpenIPTVPositron=Object.freeze({open,close,setFocus,render});
})();