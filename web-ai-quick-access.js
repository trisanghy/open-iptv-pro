'use strict';
/* Two lightweight entries into the EXISTING AI tabs; no second Bayes engine.
 * The mobile channel panel remains the default. AI hub is revealed on demand. */
(function(root,create){
 const api=create(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document){root.OpenIPTVAIQuickAccess=api;api.mount();}
})(typeof window!=='undefined'?window:null,function(root){
 const names={vi:{classification:'Phân loại kênh',recommended:'Kênh gợi ý',back:'Về danh sách kênh'},
 en:{classification:'AI categories',recommended:'Recommended',back:'Back to channels'}};
 const modes=['classification','recommended'];
 const text=key=>{const lang=root?.OpenIPTVI18n?.getLanguage?.()||root?.document?.documentElement?.lang||'vi';return (lang==='vi'?names.vi:names.en)[key];};
 function mount(){
  const doc=root.document,sidebar=doc.getElementById('appSidebar'),
   filters=doc.querySelector('#page-tv .channel-panel .filter-tabs'),
   hub=doc.getElementById('webChannelHub'),hubNav=hub?.querySelector('.web-hub-tabs'),
   hubMain=hub?.querySelector('.web-hub-main');
  if(!sidebar||!filters||!hubNav||!hubMain||doc.getElementById('webAiQuickBack'))return false;
  const navItems={},filterItems={};
  let current='';
  const sidebarAnchor=sidebar.querySelector('.nav[data-page="fav"]');
  for(const mode of modes){
   const nav=doc.createElement('button');nav.type='button';nav.className='nav web-ai-quick-nav';
   nav.dataset.aiQuick=mode;nav.setAttribute('aria-label',text(mode));nav.title=text(mode);
   const glyph=doc.createElement('span');glyph.textContent=mode==='classification'?'▦':'✦';glyph.setAttribute('aria-hidden','true');
   nav.append(glyph,doc.createTextNode(' '+text(mode)));
   sidebarAnchor?.insertAdjacentElement('afterend',nav);
   navItems[mode]=nav;
   const tab=doc.createElement('button');tab.type='button';tab.className='filter-tab web-ai-quick-filter';
   tab.dataset.aiQuick=mode;tab.textContent=text(mode);tab.setAttribute('aria-pressed','false');
   filters.append(tab);filterItems[mode]=tab;
  }
  const back=doc.createElement('button');back.type='button';back.id='webAiQuickBack';
  back.className='web-ai-quick-back';back.textContent='‹ '+text('back');back.hidden=true;
  hubMain.insertBefore(back,hubNav);
  function update(){
   doc.documentElement.classList.toggle('web-ai-quick-open',!!current);
   back.hidden=!current;back.textContent='‹ '+text('back');
   for(const mode of modes){
    const active=mode===current;
    navItems[mode].classList.toggle('active',active);
    navItems[mode].setAttribute('aria-current',active?'page':'false');
    navItems[mode].setAttribute('aria-label',text(mode));navItems[mode].title=text(mode);
    filterItems[mode].classList.toggle('active',active);
    filterItems[mode].setAttribute('aria-pressed',String(active));
    filterItems[mode].textContent=text(mode);
   }
  }
  function reset({activateNormal=false}={}){
   if(!current)return;
   current='';update();
   if(activateNormal)hubNav.querySelector('.web-hub-tab[data-tab="channels"]')?.click();
  }
  function open(mode,{scroll=true}={}){
   if(!modes.includes(mode))return false;
   const tab=hubNav.querySelector('.web-hub-tab[data-ai-tab="'+mode+'"]');
   if(!tab)return false;
   root.IPTVState?.setPage?.('tv');
   current=mode;update();tab.click(); // Existing model and EPG search, no duplicate workload.
   if(scroll)hub.scrollIntoView?.({behavior:'smooth',block:'start'});
   return true;
  }
  for(const mode of modes){
   navItems[mode].addEventListener('click',()=>open(mode));
   filterItems[mode].addEventListener('click',()=>open(mode));
  }
  back.addEventListener('click',()=>{
   reset({activateNormal:true});
   doc.querySelector('#page-tv .channel-panel')?.scrollIntoView?.({behavior:'smooth',block:'nearest'});
  });
  // Return to normal TV channels whenever another source, filter, or hub tab is selected.
  sidebar.addEventListener('click',e=>{if(e.target.closest?.('.nav[data-page]'))reset({activateNormal:true});},true);
  filters.addEventListener('click',e=>{if(e.target.closest?.('.filter-tab:not([data-ai-quick])'))reset({activateNormal:true});},true);
  hubNav.addEventListener('click',e=>{if(e.target.closest?.('.web-hub-tab[data-tab]'))reset();},true);
  doc.addEventListener('openiptv:languagechange',update);
  update();
  return true;
 }
 return Object.freeze({mount,modes});
});
