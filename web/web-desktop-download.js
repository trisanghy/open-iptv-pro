'use strict';
(function(factory){
 const root=typeof window==='undefined'?null:window;
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(function(root){
 const RELEASES='https://github.com/trisanghy/open-iptv-pro/releases/latest';
 const API='https://api.github.com/repos/trisanghy/open-iptv-pro/releases/latest';
 const MOBILE_API='https://api.github.com/repos/trisanghy/open-iptv-pro/releases?per_page=60';
 const MOBILE_RELEASES='https://github.com/trisanghy/open-iptv-pro/releases?q=mobile';
 const INTRO_KEY='openiptv-software-download-intro-seen-v1';
 const formats=[
  {id:'win',label:'Windows 64-bit',desc:'Cài đặt .exe',glyph:'⊞',re:/^Open-IPTV-Pro-Setup-[0-9.]+-x64\.exe$/i},
  {id:'mac-arm',label:'macOS · Apple Silicon',desc:'Mac M1 / M2 / M3 / M4 · .dmg',glyph:'⌘',re:/^Open-IPTV-Pro-[0-9.]+-mac-arm64\.dmg$/i},
  {id:'mac-intel',label:'macOS · Intel',desc:'Mac chip Intel · .dmg',glyph:'⌘',re:/^Open-IPTV-Pro-[0-9.]+-mac-x64\.dmg$/i},
  {id:'win-portable',label:'Windows Portable',desc:'Phiên bản .exe không cần cài',glyph:'⊞',re:/^Open-IPTV-Pro-[0-9.]+-x64\.exe$/i},
  {id:'rust-win',label:'Rust Lab · Windows',desc:'Bản thử nghiệm · Setup .exe',glyph:'⊞',re:/^OpenIPTVPro-RustLab-v[0-9][\w.]*-Windows-Setup-x64\.exe$/i},
  {id:'rust-mac',label:'Rust Lab · macOS',desc:'Bản thử nghiệm · Universal .dmg',glyph:'⌘',re:/^OpenIPTVPro-RustLab-v[0-9][\w.]*-mac-universal\.dmg$/i},
  {id:'rust-portable',label:'Rust Lab · Windows Portable',desc:'Bản thử nghiệm · ZIP',glyph:'⊞',re:/^OpenIPTVPro-RustLab-v[0-9][\w.]*-Windows-Portable-x64\.zip$/i}
 ];
 function safeAssetUrl(url){
  try{const u=new URL(String(url||''));
   return u.origin==='https://github.com'&&!u.username&&!u.password&&!u.search&&!u.hash&&
    /^\/trisanghy\/open-iptv-pro\/releases\/download\/(?:v[0-9][^/]*|mobile\/v[0-9][^/]*|rust-lab\/v[0-9][^/]*)\/[^/]+$/i.test(u.pathname);
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
const mobileFormats=[
  {id:'android',label:'Android · APK',desc:'Debug APK · cài thủ công',glyph:'▣',re:/^OpenIPTVPro-Mobile-[\w.-]+-debug\.apk$/i},
  {id:'ios',label:'iOS · IPA',desc:'IPA unsigned · cần ký để cài đặt',glyph:'▢',re:/^OpenIPTVPro-Mobile-[\w.-]+-unsigned\.ipa$/i}
 ];
 function resolveMobileRelease(releases){
  if(!Array.isArray(releases))return null;
  const ordered=releases.filter(r=>r&&!r.draft&&/^mobile\/v[0-9]/i.test(String(r.tag_name||'')))
   .sort((a,b)=>Date.parse(b.published_at||b.created_at||0)-Date.parse(a.published_at||a.created_at||0));
  for(const release of ordered){
   const items=mobileFormats.flatMap(f=>{
    const a=release.assets?.find(x=>x&&f.re.test(String(x.name||''))&&safeAssetUrl(x.browser_download_url)&&
      String(x.browser_download_url).endsWith('/'+String(x.name)));
    return a?[{id:f.id,label:f.label,desc:f.desc,glyph:f.glyph,url:a.browser_download_url,mb:Math.round((Number(a.size)||0)/1048576)}]:[];
   });
   if(items.length)return {version:String(release.tag_name).slice(0,48),items};
  }
  return null;
 }
 function firstVisit(storage){
  try{
   if(!storage||storage.getItem(INTRO_KEY)!==null)return false;
   storage.setItem(INTRO_KEY,'seen');
   return true;
  }catch{return false;}
 }
 function sortFor(items,userAgent){
  const ua=String(userAgent||'');
  const ios=/iPhone|iPad|iPod/i.test(ua),android=/Android/i.test(ua);
  const mac=/Macintosh|Mac OS X/i.test(ua)&&!ios;
  const order=ios?['ios','android','mac-arm','mac-intel','win','win-portable','rust-mac','rust-win','rust-portable']:
   android?['android','ios','win','mac-arm','mac-intel','win-portable','rust-win','rust-mac','rust-portable']:
   mac?['mac-arm','mac-intel','win','win-portable','rust-mac','rust-win','rust-portable','android','ios']:
   ['win','mac-arm','mac-intel','win-portable','rust-win','rust-mac','rust-portable','android','ios'];
  return [...items].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
 }
  function init(doc){
  const triggers=['desktopDownloadBtn','desktopDownloadMobileBtn','softwareDownloadNav'].map(id=>doc.getElementById(id)).filter(Boolean);
  if(!triggers.length||doc.getElementById('desktopDownloadDialog'))return null;
  const overlay=doc.createElement('div');overlay.id='desktopDownloadDialog';
  overlay.className='desktop-download-overlay';overlay.hidden=true;
  overlay.innerHTML=`
   <section class="desktop-download-dialog" role="dialog" aria-modal="true" aria-labelledby="desktopDownloadTitle" aria-describedby="desktopDownloadDesc">
    <header class="desktop-download-heading"><div>
     <span class="desktop-download-eyebrow">WINDOWS · MACOS · ANDROID · IOS</span>
     <h2 id="desktopDownloadTitle" class="desktop-download-title">Tải xuống phần mềm</h2>
    </div><button type="button" class="desktop-download-close" data-desktop-close aria-label="Đóng">×</button></header>
    <p id="desktopDownloadDesc" class="desktop-download-desc">Chọn phiên bản Windows, macOS, Android hoặc iOS. Chỉ hiện tệp phát hành có thật trên GitHub.</p>
    <p id="desktopDownloadStatus" class="desktop-download-status" role="status" aria-live="polite">Đang kiểm tra phiên bản…</p>
    <div id="desktopDownloadOptions" class="desktop-download-options"></div>
    <div class="desktop-download-actions">
     <a class="desktop-download-releases" href="${RELEASES}" target="_blank" rel="noopener noreferrer">Desktop mới nhất</a>
     <a class="desktop-download-releases" href="${MOBILE_RELEASES}" target="_blank" rel="noopener noreferrer">Các bản Mobile</a>
     <button type="button" class="desktop-download-dismiss" data-desktop-close>Đóng</button>
    </div>
    <p class="desktop-download-note">Android đang phát hành bản Debug APK. IPA trên iOS chưa ký (unsigned): cần ký ứng dụng và cài đặt bằng phương thức hợp lệ; không thể cài trực tiếp như App Store.</p>
   </section>`;
  doc.body.append(overlay);
  const list=overlay.querySelector('#desktopDownloadOptions');
  const status=overlay.querySelector('#desktopDownloadStatus');
  const cross=overlay.querySelector('.desktop-download-close');
  let loaded=false,loading=null,previous=null;
  function render(desktop,mobile){
   list.replaceChildren();
   const all=[...(desktop?.items||[]),...(mobile?.items||[])];
   if(!all.length){
    status.textContent='Chưa truy xuất được bộ cài; hãy dùng liên kết GitHub bên dưới để tải trực tiếp.';
    return;
   }
   status.textContent='Các bản phát hành GitHub · '+all.length+' lựa chọn';
   const groups=[
    {title:'Android & iOS · '+(mobile?.version||'mới nhất'),items:mobile?.items||[]},
    {title:'Desktop Stable · '+(desktop?.version||'mới nhất'),items:(desktop?.items||[]).filter(x=>!x.id.startsWith('rust-'))},
    {title:'Desktop Rust Lab · '+(desktop?.version||'mới nhất'),items:(desktop?.items||[]).filter(x=>x.id.startsWith('rust-'))}
   ];
   if(!/iPhone|iPad|iPod|Android/i.test(String(root.navigator?.userAgent||'')))groups.push(groups.shift());
   for(const group of groups){
    if(!group.items.length)continue;
    const section=doc.createElement('section');section.className='desktop-download-group';
    const heading=doc.createElement('h3');heading.textContent=group.title;section.append(heading);
    for(const item of sortFor(group.items,root.navigator?.userAgent)){
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
     content.append(name,desc);a.append(icon,content,arrow);section.append(a);
    }
    list.append(section);
   }
   for(const badge of doc.querySelectorAll('[data-desktop-download-version]'))badge.textContent=desktop?.version||'';
  }
  async function readRelease(url){
   const response=await root.fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
   if(!response.ok)throw Error('GitHub '+response.status);
   return response.json();
  }
  async function refresh(){
   if(loading)return loading;
   status.textContent='Đang kiểm tra bản Desktop và Mobile mới nhất trên GitHub…';
   loading=(async()=>{
    try{
     const [a,b]=await Promise.allSettled([readRelease(API),readRelease(MOBILE_API)]);
     const desktop=a.status==='fulfilled'?resolveRelease(a.value):null;
     const mobile=b.status==='fulfilled'?resolveMobileRelease(b.value):null;
     render(desktop,mobile);
     loaded=!!(desktop?.items.length&&mobile?.items.length);
     if(!loaded)console.warn('Some Github release catalogs are unavailable',a.status,b.status);
    }finally{loading=null;}
   })();
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
  if(moreGrid&&!moreGrid.querySelector('[data-mobile-more-click="softwareDownloadNav"]')){
   const button=doc.createElement('button');button.type='button';button.className='mobile-more-action';
   button.setAttribute('data-mobile-more-click','softwareDownloadNav');
   button.innerHTML='<span aria-hidden="true">⇩</span>Tải xuống phần mềm';
   const settings=moreGrid.querySelector('[data-mobile-more-page="settings"]');
   if(settings)settings.after(button);else moreGrid.append(button);
  }
  const intro=doc.getElementById('softwareDownloadIntro');
  const introClose=doc.getElementById('softwareDownloadIntroClose');
  if(intro&&doc.documentElement?.getAttribute('data-iptv-device')==='mobile'&&firstVisit(root.localStorage))intro.hidden=false;
  introClose?.addEventListener('click',()=>{if(intro)intro.hidden=true;try{root.localStorage?.setItem(INTRO_KEY,'seen');}catch{}});
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
 return Object.freeze({safeAssetUrl,resolveRelease,resolveMobileRelease,sortFor,firstVisit,init,RELEASES,API,MOBILE_API,INTRO_KEY});
});
