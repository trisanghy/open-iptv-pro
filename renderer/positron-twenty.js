'use strict';
/* Positron P5 incremental UI and accessibility layer.
   No changes to IPTVState storage, playlist playback or streaming pipeline. */
(()=>{
 const d=document,root=d.documentElement;
 if(root.dataset.positron!=='true'||!d.getElementById('positronBar'))return;
 const byId=id=>d.getElementById(id);
 const maxStage=20;
 let stage=0,previous=null;
 const setStage=(target,feedback=null)=>{
   const next=Math.max(0,Math.min(maxStage,Number(target)||0));
   for(let i=1;i<=maxStage;i++)root.classList.toggle('p20-'+String(i).padStart(2,'0'),i<=next);
   stage=next;
   root.dataset.p20Stage=String(next);
   if(feedback&&typeof feedback==='object'){
     previous={round:Number(feedback.round)||null,overflow:!!feedback.overflow,sha256:String(feedback.sha256||'')};
     root.dataset.p20Feedback=previous.overflow?'overflow':'ok';
   }
   return {stage,fromRound:previous?.round??null};
 };
 setStage(20);
 // All labels below are additive. Native handlers and stream controls stay intact.
 const metadata=[
  ['playBtn','Phát hoặc tạm dừng kênh'],['stopBtn','Dừng phát kênh'],
  ['fullscreenBtn','Bật toàn màn hình'],['castBtn','Phát lên TV qua Cast hoặc AirPlay'],
  ['pipBtn','Chế độ hình trong hình'],['refreshAllBtn','Làm mới danh sách nguồn IPTV'],
  ['positronHelpBtn','Hướng dẫn phím tắt'],['positronFiltersToggle','Hiển thị bộ lọc kênh'],
  ['positronToolsToggle','Hiển thị công cụ phát nâng cao']
 ];
 for(const [id,label] of metadata){const node=byId(id);if(node){node.setAttribute('aria-label',label);if(!node.title)node.title=label;}}
 for(const [id,controls] of [['positronToolsToggle','playbackExtra'],['positronFiltersToggle','channelList'],['positronMorePages','appSidebar']]){
  const node=byId(id);if(node)node.setAttribute('aria-controls',controls);
 }
 const search=byId('searchBox');
 if(search)search.setAttribute('aria-keyshortcuts','/');
 // Slash focuses the original channel finder on TV; it never searches private data remotely.
 d.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
  if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  if(byId('positronPalette')?.hidden===false||byId('positronStudioMenu')?.hidden===false||byId('positronHelpDialog')?.open)return;
  if(!d.querySelector('#page-tv.active-page'))return;
  if(event.key==='/'){event.preventDefault();search?.focus();}
 });
 // Make hidden-label compact rail buttons accessible even after dynamic nav updates.
 const sidebar=byId('appSidebar');
 if(sidebar){
  const labelNav=()=>{
   for(const b of sidebar.querySelectorAll('button.nav')){
    if(b.hasAttribute('aria-label'))continue;
    const text=(b.textContent||'').replace(/\s+/g,' ').trim();
    if(text){b.setAttribute('aria-label',text);if(!b.title)b.title=text;}
   }
  };
  labelNav();
  new MutationObserver(labelNav).observe(sidebar,{childList:true,subtree:true});
 }

 // P5.1 screenshot review: neutral monochrome SVGs replace platform-colored
 // transport emoji without replacing button nodes, playback listeners or state.
 const ns='http://www.w3.org/2000/svg';
 const iconDefinitions=[
  ['prevBtn','M6 5v14 M20 5 9 12l11 7V5z','Kênh trước'],
  ['stopBtn','M6 6h12v12H6z','Dừng phát'],
  ['nextBtn','M18 5v14 M4 5l11 7-11 7V5z','Kênh sau'],
  ['fsPrev','M6 5v14 M20 5 9 12l11 7V5z','Kênh trước'],
  ['fsNext','M18 5v14 M4 5l11 7-11 7V5z','Kênh sau'],
  ['fullscreenBtn','M8 3H3v5 M16 3h5v5 M8 21H3v-5 M16 21h5v-5','Bật toàn màn hình']
 ];
 for(const [name,shape,label] of iconDefinitions){
  const button=byId(name);if(!button)continue;
  const svg=d.createElementNS(ns,'svg'),path=d.createElementNS(ns,'path');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','19');
  svg.setAttribute('height','19');svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  path.setAttribute('d',shape);svg.append(path);
  button.replaceChildren(svg);button.dataset.p20Vector='true';
  button.setAttribute('aria-label',label);button.title=label;
 }

 
 // P5.1.9 round 02: Empty Favorites had no path to manage sources in
 // the actual P5.1.8 600px Electron screenshot. Preserve original list.
 const favoriteList=byId('favoriteList');
 if(favoriteList){
  const syncFavoriteSourceAction=()=>{
   const empty=favoriteList.querySelector('.empty-list');
   if(!empty)return;
   // Write only the native message text node; never replace the Favorites list or its button.
   const num=Number((byId('sourceCount')?.textContent||'0').replace(/[^0-9]/g,''))||0;
   const guidance=num===0
    ?'Chưa có nguồn IPTV. Hãy mở Quản lý nguồn IPTV để thêm playlist M3U hoặc URL, sau đó đánh dấu sao những kênh muốn lưu.'
    :'Chưa có kênh yêu thích trong các nguồn đang bật. Đánh dấu sao để lưu kênh hoặc kiểm tra những nguồn đã tắt trong Quản lý nguồn IPTV.';
   const copy=empty.firstChild;
   if(copy?.nodeType===3&&copy.textContent!==guidance)copy.textContent=guidance;
   if(empty.querySelector('#positronFavoritesSources'))return;
   const button=d.createElement('button');
   button.id='positronFavoritesSources';button.type='button';
   button.className='btn btn-primary po-fav-action';
   button.textContent='Quản lý nguồn IPTV';
   button.title='Mở trang quản lý và thêm nguồn IPTV';
   button.addEventListener('click',()=>window.IPTVState?.setPage?.('sources'));
   empty.append(button);
  };
  new MutationObserver(syncFavoriteSourceAction).observe(favoriteList,{childList:true,subtree:true});
  const countNode=byId('sourceCount');
  if(countNode)new MutationObserver(syncFavoriteSourceAction).observe(countNode,{childList:true,subtree:true,characterData:true});
  syncFavoriteSourceAction();
 }

 // P5.1.12 / round 05: real 1360px Settings screenshot shows the old
 // search label cut off ("Tìm kênh, trang, công cu..."), with a tiny font glyph
 // instead of a recognizable search icon. Preserve button event and shortcut.
 const searchButton=byId('positronOpen');
 if(searchButton){
  const glyph=searchButton.querySelector('span:first-child');
  if(glyph&&!glyph.querySelector('svg')){
   const svg=d.createElementNS(ns,'svg');
   svg.setAttribute('viewBox','0 0 24 24');
   svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   const circle=d.createElementNS(ns,'circle');
   circle.setAttribute('cx','10.5');circle.setAttribute('cy','10.5');circle.setAttribute('r','6.5');
   const handle=d.createElementNS(ns,'path');handle.setAttribute('d','M16 16l5 5');
   svg.append(circle,handle);glyph.replaceChildren(svg);
  }
  const label=searchButton.querySelector('.p-command-label');
  if(label)label.textContent='Tìm kênh / trang';
  searchButton.setAttribute('aria-label','Tìm kiếm kênh, trang và công cụ');
 }
 window.OpenIPTVPositronTwenty=Object.freeze({
  setStage,getStage:()=>stage,getFeedback:()=>previous
 });
})();
