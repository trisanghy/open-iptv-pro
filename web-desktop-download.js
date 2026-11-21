'use strict';
(function(factory){
 const root=typeof window==='undefined'?null:window;
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(function(root){
 const RELEASES='https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.71';
 const API='https://api.github.com/repos/trisanghy/open-iptv-pro/releases/tags/v4.23.71';
 const ELECTRON_PREVIEW_API='https://api.github.com/repos/trisanghy/open-iptv-pro/releases/tags/electron-v4.23.76';
 const RUST_API='https://api.github.com/repos/trisanghy/open-iptv-pro/releases/tags/rust-lab/v23.8.98';
 const MOBILE_API='https://api.github.com/repos/trisanghy/open-iptv-pro/releases/tags/mobile/v4.23.17.35';
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
    /^\/trisanghy\/open-iptv-pro\/releases\/download\/(?:v[0-9][^/]*|electron-v[0-9][^/]*|mobile\/v[0-9][^/]*|rust-lab\/v[0-9][^/]*)\/[^/]+$/i.test(u.pathname);
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
  const sources=Array.isArray(releases)?releases:[releases];
  const ordered=sources.filter(r=>r&&!r.draft&&/^mobile\/v[0-9]/i.test(String(r.tag_name||'')))
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
    <details class="desktop-download-ios-shortcut" id="iosShortcutInstall">
     <summary class="desktop-download-shortcut-summary">
      <span class="desktop-download-shortcut-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4M12 14V7m-3 3 3-3 3 3"/></svg></span>
      <span class="desktop-download-shortcut-copy"><strong>Cài app cho iOS (không cần ký)</strong><small>Safari hoặc Chrome · Đưa Web ra Màn hình chính</small></span>
      <span class="desktop-download-shortcut-chevron" aria-hidden="true">⌄</span>
     </summary>
     <div class="desktop-download-shortcut-steps">
      <ol>
       <li>Mở <a href="https://trisanghy.github.io/open-iptv-pro/" class="desktop-download-web-link">Open IPTV Pro Web</a> bằng <strong>Safari hoặc Chrome</strong> trên iPhone/iPad.</li>
       <li>Nhấn nút <strong>Chia sẻ</strong> <svg class="desktop-download-share-symbol" role="img" aria-label="Biểu tượng Chia sẻ" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m-4 4 4-4 4 4"/><path d="M6 10H4v10h16V10h-2"/></svg> của trình duyệt.</li>
       <li>Chọn <strong>Thêm vào Màn hình chính</strong> (Add to Home Screen), rồi nhấn <strong>Thêm</strong>.</li>
      </ol>
      <p class="desktop-download-shortcut-note">Đây là ứng dụng Web/lối tắt trên Màn hình chính, <strong>không phải file IPA</strong>. Không cần ký ứng dụng, chứng chỉ hay Apple Developer.</p>
     </div>
    </details>
    <p id="desktopDownloadStatus" class="desktop-download-status" role="status" aria-live="polite">Đang kiểm tra phiên bản…</p>
    <div id="desktopDownloadOptions" class="desktop-download-options"></div>
    <details class="desktop-download-ios-shortcut" id="macosDownloadHelp">
      <summary class="desktop-download-shortcut-summary"><span class="desktop-download-shortcut-copy"><strong>Mac báo “is damaged and can’t be opened”?</strong><small>Hướng dẫn khi macOS chặn ứng dụng</small></span><span class="desktop-download-shortcut-chevron" aria-hidden="true">⌄</span></summary>
      <div class="desktop-download-shortcut-steps">
       <p>Chỉ tải file từ GitHub Releases chính thức, đối chiếu SHA-256 và kéo <strong>Open IPTV Pro.app</strong> vào Applications. Thử <strong>System Settings → Privacy &amp; Security → Open Anyway</strong> nếu có.</p>
       <p>Chỉ khi đã xác minh file an toàn nhưng bị chặn do quarantine, mở Terminal chạy: <code style="overflow-wrap:anywhere">xattr -dr com.apple.quarantine "/Applications/Open IPTV Pro.app"</code></p>
       <p class="desktop-download-shortcut-note">Nếu DMG hỏng, checksum không khớp hoặc macOS báo mã độc, dừng cài và tải lại. Không tắt Gatekeeper toàn máy.</p>
      </div>
     </details>
    <div class="desktop-download-actions">
     <a class="desktop-download-releases" href="${RELEASES}" target="_blank" rel="noopener noreferrer">Electron Stable</a>
     <a class="desktop-download-releases" href="tai-ve.html" target="_blank" rel="noopener noreferrer">So sánh 4 nền tảng &amp; tải file</a>
     <a class="desktop-download-releases" href="${MOBILE_RELEASES}" target="_blank" rel="noopener noreferrer">Các bản Mobile</a>
     <button type="button" class="desktop-download-dismiss" data-desktop-close>Đóng</button>
    </div>
    <p class="desktop-download-note">Android đang phát hành bản Debug APK. IPA trên iOS chưa ký (unsigned): cần ký ứng dụng và cài đặt bằng phương thức hợp lệ; không thể cài trực tiếp như App Store.</p>
   </section>`;
  doc.body.append(overlay);
  const list=overlay.querySelector('#desktopDownloadOptions');
  const status=overlay.querySelector('#desktopDownloadStatus');
  const cross=overlay.querySelector('.desktop-download-close');
  const iosShortcut=overlay.querySelector('#iosShortcutInstall');
  if(iosShortcut&&/iPhone|iPad|iPod/i.test(String(root.navigator?.userAgent||'')))iosShortcut.open=true;
  let loaded=false,loading=null,previous=null;
  function render(desktop,mobile,rust,preview){
   list.replaceChildren();
   const all=[...(desktop?.items||[]),...(mobile?.items||[]),...(rust?.items||[]),...(preview?.items||[])];
   if(!all.length){
    status.textContent='Chưa truy xuất được bộ cài; hãy dùng liên kết GitHub bên dưới để tải trực tiếp.';
    return;
   }
   status.textContent='Các bản phát hành GitHub · '+all.length+' lựa chọn';
   const groups=[
    {title:'Android & iOS · '+(mobile?.version||'mới nhất')+' · Beta',items:mobile?.items||[]},
    {title:'Electron Stable · '+(desktop?.version||'mới nhất'),items:(desktop?.items||[]).filter(x=>!x.id.startsWith('rust-'))},
    {title:'Electron mới · '+(preview?.version||'4.23.76')+' · Beta, chờ chứng nhận Stable',items:preview?.version===desktop?.version?[]:(preview?.items||[]).filter(x=>!x.id.startsWith('rust-'))},
    {title:'Rust Lab · '+(rust?.version||'23.8.98')+' · Beta',items:(rust?.items||[]).filter(x=>x.id.startsWith('rust-'))}
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
     const [a,b,c,d]=await Promise.allSettled([readRelease(API),readRelease(MOBILE_API),readRelease(RUST_API),readRelease(ELECTRON_PREVIEW_API)]);
     const desktop=a.status==='fulfilled'?resolveRelease(a.value):null;
     const mobile=b.status==='fulfilled'?resolveMobileRelease(b.value):null;
     const rust=c.status==='fulfilled'?resolveRelease(c.value):null;
     const preview=d.status==='fulfilled'?resolveRelease(d.value):null;
     render(desktop,mobile,rust,preview);
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
   button.innerHTML=(root.OpenIPTVMobileMoreIcon?.('download')||'<svg class="mobile-more-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-4-4 4 4 4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>')+'Tải xuống phần mềm';
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
