'use strict';
(function(factory){
 const root=typeof window==='undefined'?null:window;
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(function(root){
 const RELEASES='https://github.com/trisanghy/open-iptv-pro/releases/latest';
 const API='https://api.github.com/repos/trisanghy/open-iptv-pro/releases/latest';
 const formats=[
  {id:'win',label:'Windows 64-bit',desc:'Cài đặt .exe',glyph:'⊞',re:/^Open-IPTV-Pro-Setup-[0-9.]+-x64\.exe$/i},
  {id:'mac-arm',label:'macOS · Apple Silicon',desc:'Mac M1 / M2 / M3 / M4 · .dmg',glyph:'⌘',re:/^Open-IPTV-Pro-[0-9.]+-mac-arm64\.dmg$/i},
  {id:'mac-intel',label:'macOS · Intel',desc:'Mac chip Intel · .dmg',glyph:'⌘',re:/^Open-IPTV-Pro-[0-9.]+-mac-x64\.dmg$/i},
  {id:'win-portable',label:'Windows Portable',desc:'Phiên bản .exe không cần cài',glyph:'⊞',re:/^Open-IPTV-Pro-[0-9.]+-x64\.exe$/i}
 ];
 function safeAssetUrl(url){
  try{const u=new URL(String(url||''));
   return u.origin==='https://github.com'&&!u.username&&!u.password&&!u.search&&!u.hash&&
    /^\/trisanghy\/open-iptv-pro\/releases\/download\/[^/]+\/[^/]+$/i.test(u.pathname);
  }catch{return false;}
 }
 function resolveRelease(r){
  if(!r||!Array.isArray(r.assets))return null;
  const trusted=r.assets.filter(a=>a&&safeAssetUrl(a.browser_download_url));
  const items=formats.flatMap(x=>{
   const a=trusted.find(v=>x.re.test(String(v.name||'')));
   return a?[{id:x.id,label:x.label,desc:x.desc,glyph:x.glyph,url:a.browser_download_url,
    mb:Math.round((Number(a.size)||0)/1048576)}]:[];
  });
  return {version:String(r.tag_name||'Mới nhất').slice(0,32),items};
 }
 function sortFor(items,userAgent){
  const mac=/Macintosh|Mac OS X/.test(String(userAgent||''))&&!/iPhone|iPad|iPod/.test(String(userAgent||''));
  const order=mac?['mac-arm','mac-intel','win','win-portable']:['win','mac-arm','mac-intel','win-portable'];
  return [...items].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
 }
 function init(doc){
  const triggers=['desktopDownloadBtn','desktopDownloadMobileBtn'].map(id=>doc.getElementById(id)).filter(Boolean);
  if(!triggers.length||doc.getElementById('desktopDownloadDialog'))return null;
  const overlay=doc.createElement('div');overlay.id='desktopDownloadDialog';
  overlay.className='desktop-download-overlay';overlay.hidden=true;
  overlay.innerHTML=`
   <section class="desktop-download-dialog" role="dialog" aria-modal="true" aria-labelledby="desktopDownloadTitle" aria-describedby="desktopDownloadDesc">
    <header class="desktop-download-heading"><div>
     <span class="desktop-download-eyebrow">PHIÊN BẢN MÁY TÍNH</span>
     <h2 id="desktopDownloadTitle" class="desktop-download-title">Tải Open IPTV Pro Desktop</h2>
    </div><button type="button" class="desktop-download-close" data-desktop-close aria-label="Đóng">×</button></header>
    <p id="desktopDownloadDesc" class="desktop-download-desc">Chọn bộ cài cho Windows hoặc macOS. Tệp được tải từ GitHub Releases chính thức.</p>
    <p id="desktopDownloadStatus" class="desktop-download-status" role="status" aria-live="polite">Đang kiểm tra phiên bản…</p>
    <div id="desktopDownloadOptions" class="desktop-download-options"></div>
    <div class="desktop-download-actions">
     <a class="desktop-download-releases" href="${RELEASES}" target="_blank" rel="noopener noreferrer">Xem bản mới nhất trên GitHub</a>
     <button type="button" class="desktop-download-dismiss" data-desktop-close>Đóng</button>
    </div>
    <p class="desktop-download-note">Desktop dành cho máy tính Windows/macOS; không phải bản cài iOS hoặc Android.</p>
   </section>`;
  doc.body.append(overlay);
  const list=overlay.querySelector('#desktopDownloadOptions');
  const status=overlay.querySelector('#desktopDownloadStatus');
  const cross=overlay.querySelector('.desktop-download-close');
  let loaded=false,loading=null,previous=null;
  function render(result){
   list.replaceChildren();
   if(!result?.items.length){
    status.textContent='Không truy xuất được bộ cài. Bấm “Xem bản mới nhất trên GitHub” để tiếp tục.';
    return;
   }
   status.textContent='Phiên bản mới nhất: '+result.version+' · Chọn hệ điều hành:';
   for(const item of sortFor(result.items,root.navigator?.userAgent)){
    const a=doc.createElement('a');a.className='desktop-download-option';
    a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label','Tải '+item.label+', '+item.desc);
    const icon=doc.createElement('span');icon.className='desktop-download-os';
    icon.textContent=item.glyph;icon.setAttribute('aria-hidden','true');
    const content=doc.createElement('span');content.className='desktop-download-option-text';
    const name=doc.createElement('strong');name.textContent=item.label;
    const desc=doc.createElement('small');desc.textContent=item.desc+(item.mb?' · '+item.mb+' MB':'');
    const arrow=doc.createElement('span');arrow.className='desktop-download-arrow';arrow.textContent='↗';
    arrow.setAttribute('aria-hidden','true');
    content.append(name,desc);a.append(icon,content,arrow);list.append(a);
   }
   for(const badge of doc.querySelectorAll('[data-desktop-download-version]'))badge.textContent=result.version;
  }
  async function refresh(){
   if(loading)return loading;
   status.textContent='Đang kiểm tra phiên bản Desktop mới nhất trên GitHub…';
   loading=(async()=>{try{
    const response=await root.fetch(API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
    if(!response.ok)throw Error('GitHub '+response.status);
    const result=resolveRelease(await response.json());
    if(!result?.items.length)throw Error('No installers');
    render(result);loaded=true;
   }catch(e){console.warn('Release check unavailable',e?.message||e);render(null);}
   finally{loading=null;}})();
   return loading;
  }
  function open(){
   previous=doc.activeElement;
   overlay.hidden=false;
   cross.focus();
   if(!loaded)void refresh();
  }
  function close(){overlay.hidden=true;previous?.focus?.();}
  // Reuse the delegated mobile More-menu click handler, not a sixth tab.
  const moreGrid=doc.querySelector('#iptvMobileMoreOverlay .mobile-more-grid');
  if(moreGrid&&!moreGrid.querySelector('[data-mobile-more-click="desktopDownloadBtn"]')){
   const button=doc.createElement('button');button.type='button';
   button.className='mobile-more-action';button.setAttribute('data-mobile-more-click','desktopDownloadBtn');
   button.innerHTML='<span aria-hidden="true">⇩</span>Tải bản Desktop';
   moreGrid.append(button);
  }
  for(const trigger of triggers)trigger.addEventListener('click',open);
  overlay.addEventListener('click',event=>{
   if(event.target===overlay||event.target.closest('[data-desktop-close]'))close();
  });
  overlay.addEventListener('keydown',event=>{
   if(event.key==='Escape'){event.preventDefault();close();}
   if(event.key==='Tab'){
    const elements=[...overlay.querySelectorAll('button:not([disabled]),a[href]')];
    const first=elements[0],last=elements[elements.length-1];
    if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}
   }
  });
  return {open,close,refresh};
 }
 if(root?.document){
  if(root.document.readyState==='loading')
   root.document.addEventListener('DOMContentLoaded',()=>init(root.document),{once:true});
  else init(root.document);
 }
 return Object.freeze({safeAssetUrl,resolveRelease,sortFor,init,RELEASES,API});
});
