/* Rust Lab channel browser, v23.8.60. Read-only UI over original sources/favorites/history. */
'use strict';
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root.document,root);
})(typeof window==='undefined'?null:window,function(){
 const PAGE_SIZE=10;
 const normalizeGroup=c=>String(c?.group||'Khác').replace(/\s*\|\s*(?:Kiểm tra|Kiem tra):?.*$/i,'').trim()||'Khác';
 const textSort=(a,b)=>String(a||'').localeCompare(String(b||''),undefined,{sensitivity:'base',numeric:true});
 function selectChannels(enabled,favorites,recent,options={}){
  const tab=['all','favorite','recent'].includes(options.tab)?options.tab:'all';
  const from=tab==='favorite'?favorites:tab==='recent'?recent:enabled;
  const query=String(options.query||'').trim().toLocaleLowerCase();
  const list=from.filter(c=>c&&typeof c.id==='string'&&c.id
    &&(options.group==='all'||!options.group||normalizeGroup(c)===options.group)
    &&(!query||String(c.name||'').toLocaleLowerCase().includes(query)||normalizeGroup(c).toLocaleLowerCase().includes(query)));
  if(options.sort==='name-desc')return [...list].sort((a,b)=>textSort(b.name,a.name));
  if(options.sort==='group')return [...list].sort((a,b)=>textSort(normalizeGroup(a),normalizeGroup(b))||textSort(a.name,b.name));
  if(tab==='recent'&&options.sort==='recent')return list;
  return [...list].sort((a,b)=>textSort(a.name,b.name));
 }
 function paginate(channels,page,size=PAGE_SIZE){
  const pages=Math.max(1,Math.ceil(channels.length/size)),at=Math.min(pages-1,Math.max(0,Number(page)||0));
  return {page:at,pages,items:channels.slice(at*size,(at+1)*size),total:channels.length};
 }
 function mount(doc,win){
  const $=id=>doc.getElementById(id),panel=$('rustChannelBrowser'),state=win.IPTVState;
  if(!panel||panel.dataset.mounted==='true'||!state)return false;
  const store=state.getStore?.();if(!store)return false;
  let tab='all',group='all',sort='name-asc',query='',page=0,mode='grid',expanded=false,lastSignature='',scheduled=false;
  const settingsKey='openiptv:rustlab:channel-browser-ui';
  try{const saved=JSON.parse(win.localStorage?.getItem(settingsKey)||'{}');
   if(['grid','list'].includes(saved.mode))mode=saved.mode;
   if(['name-asc','name-desc','group','recent'].includes(saved.sort))sort=saved.sort;
   if(['all','favorite','recent'].includes(saved.tab))tab=saved.tab;
  }catch{}
  const nodes={tabs:$('rustBrowserTabs'),chips:$('rustBrowserChips'),cards:$('rustBrowserCards'),
   groups:$('rustBrowserGroup'),sort:$('rustBrowserSort'),search:$('rustBrowserSearch'),
   status:$('rustBrowserStatus'),prev:$('rustBrowserPrev'),next:$('rustBrowserNext'),
   favorites:$('rustBrowserFavoriteRows'),recent:$('rustBrowserRecentRows'),
   favCount:$('rustBrowserFavoriteCount'),recentCount:$('rustBrowserRecentCount'),
   grid:$('rustBrowserGrid'),list:$('rustBrowserList')};
  if(Object.values(nodes).some(v=>!v))return false;
  panel.dataset.mounted='true';
  const save=()=>{try{win.localStorage?.setItem(settingsKey,JSON.stringify({tab,mode,sort}));}catch{}};
  const ui=s=>win.OpenIPTVI18n?.t?.(s)||s;
  const el=(name,cls,value)=>{const x=doc.createElement(name);if(cls)x.className=cls;
   if(value!==undefined)x.textContent=String(value);return x;};
  const btn=(cls,name,title)=>{const b=el('button',cls,name);b.type='button';if(title)b.title=title;return b;};
  function data(){
   const enabled=state.getChannels?.()||[],favApi=win.OpenIPTVFavorites,recentApi=win.OpenIPTVRecentChannels;
   return {enabled,favorites:favApi?.visible?.(store)||[],recent:recentApi?.visible?.(store,enabled,favApi?.key)||[]};
  }
  function logo(c){
   const wrap=el('span','rust-browser-logo-holder',String(c.name||'TV').slice(0,2).toLocaleUpperCase());
   const url=String(c.logo||'').trim();
   if(/^https?:\/\//i.test(url)){
    const img=el('img','rust-browser-logo');img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
    img.addEventListener('error',()=>img.remove());img.src=url;wrap.append(img);
   }
   return wrap;
  }
  function play(c){
   if(!c?.id)return;
   const result=state.playChannel?.(c.id);if(result?.catch)result.catch(e=>win.console?.warn?.('Channel browser:',e));
   schedule(true);
  }
  function card(c,compact=false){
   const active=state.getCurrent?.()?.id===c.id;
   const b=btn('rust-browser-card'+(compact?' compact':'')+(active?' selected':'')+(mode==='list'&&!compact?' as-list':''),'');
   b.setAttribute('data-i18n-ignore','true');
   b.dataset.channelId=c.id;b.setAttribute('aria-label',ui('Phát kênh')+' '+(c.name||''));b.setAttribute('aria-current',String(active));
   b.append(logo(c),el('span','rust-browser-name',c.name||'Kênh IPTV'));
   if(mode==='list'&&!compact)b.append(el('small','rust-browser-card-group',normalizeGroup(c)));
   if(active)b.append(el('span','rust-browser-playing','▶'));
   b.addEventListener('click',()=>play(c));return b;
  }
  function side(node,items,empty){
   if(!items.length)node.replaceChildren(el('p','rust-browser-empty',empty));
   else node.replaceChildren(...items.slice(0,6).map(x=>card(x,true)));
  }
  function tabs(){
   nodes.tabs.replaceChildren();
   for(const [key,label] of [['all','▣ Chọn kênh'],['favorite','☆ Yêu thích'],['recent','◷ Xem gần đây']]){
    const b=btn('rust-browser-tab'+(tab===key?' active':''),ui(label));
    b.dataset.tab=key;b.setAttribute('role','tab');b.setAttribute('aria-selected',String(tab===key));
    b.addEventListener('click',()=>{tab=key;group='all';sort=key==='recent'?'recent':'name-asc';page=0;save();render(true);});nodes.tabs.append(b);
   }
  }
  function groups(enabled){
   const names=[...new Set(enabled.map(normalizeGroup))].sort(textSort);
   if(group!=='all'&&!names.includes(group))group='all';
   nodes.groups.replaceChildren();const any=el('option','','Tất cả nhóm');any.value='all';nodes.groups.append(any);
   for(const name of names){const option=el('option','',name);option.value=name;option.setAttribute('data-i18n-ignore','true');nodes.groups.append(option);}
   nodes.groups.value=group;nodes.chips.replaceChildren();
   const visible=expanded?names:names.slice(0,8);
   for(const name of ['all',...visible]){
    const b=btn('rust-browser-chip'+(group===name?' active':''),name==='all'?ui('Tất cả'):name);
    if(name!=='all')b.setAttribute('data-i18n-ignore','true');
    b.setAttribute('aria-pressed',String(group===name));
    b.addEventListener('click',()=>{group=name;page=0;render(true);});nodes.chips.append(b);
   }
   if(names.length>8){
    const more=btn('rust-browser-chip more',expanded?ui('Thu gọn'):'•••',expanded?ui('Thu gọn nhóm'):ui('Thêm nhóm'));
    more.setAttribute('aria-expanded',String(expanded));
    more.addEventListener('click',()=>{expanded=!expanded;render(true);});nodes.chips.append(more);
   }
  }
  function signature({enabled,favorites,recent}){
   return JSON.stringify([enabled.map(c=>[c.id,c.name,c.group,c.logo]),favorites.map(c=>c.id),
    recent.map(c=>c.id),state.getCurrent?.()?.id,tab,group,sort,query,page,mode,expanded]);
  }
  function render(force=false){
   if($('page-tv')?.classList.contains('active-page')===false)return;
   const all=data();
   if(!force&&lastSignature===signature(all))return;
   groups(all.enabled);tabs();
   nodes.sort.value=sort;
   const filtered=selectChannels(all.enabled,all.favorites,all.recent,{tab,group,sort,query});
   const current=paginate(filtered,page);page=current.page;
   nodes.cards.dataset.view=mode;
   if(current.items.length)nodes.cards.replaceChildren(...current.items.map(x=>card(x)));
   else nodes.cards.replaceChildren(el('p','rust-browser-empty',ui(
    !all.enabled.length?'Chưa có kênh. Hãy thêm file M3U hoặc nguồn URL.':
    tab==='favorite'?'Chưa có kênh yêu thích phù hợp.':
    tab==='recent'?'Chưa có kênh vừa xem phù hợp.':'Không tìm thấy kênh phù hợp.')));
   nodes.prev.disabled=current.page===0;nodes.next.disabled=current.page>=current.pages-1;
   nodes.status.textContent=current.total?
    String(current.page*PAGE_SIZE+1)+'–'+String(Math.min(current.total,(current.page+1)*PAGE_SIZE))+' / '+current.total+' kênh':'0 kênh';
   nodes.favCount.textContent=String(all.favorites.length);
   nodes.recentCount.textContent=String(all.recent.length);
   side(nodes.favorites,all.favorites,ui('Chưa có kênh yêu thích.'));
   side(nodes.recent,all.recent,ui('Chưa có kênh vừa xem.'));
   nodes.grid.classList.toggle('active',mode==='grid');nodes.list.classList.toggle('active',mode==='list');
   nodes.grid.setAttribute('aria-pressed',String(mode==='grid'));
   nodes.list.setAttribute('aria-pressed',String(mode==='list'));
   lastSignature=signature(all);
  }
  function schedule(force=false){
   if(force)lastSignature='';
   if(scheduled)return;scheduled=true;
   (win.requestAnimationFrame||((cb)=>cb()))(()=>{scheduled=false;render();});
  }
  nodes.groups.addEventListener('change',()=>{group=nodes.groups.value;page=0;render(true);});
  nodes.sort.value=sort;
  nodes.sort.addEventListener('change',()=>{sort=nodes.sort.value;page=0;save();render(true);});
  nodes.search.addEventListener('input',()=>{query=nodes.search.value;page=0;render(true);});
  nodes.prev.addEventListener('click',()=>{page=Math.max(0,page-1);render(true);});
  nodes.next.addEventListener('click',()=>{page++;render(true);});
  nodes.grid.addEventListener('click',()=>{mode='grid';save();render(true);});
  nodes.list.addEventListener('click',()=>{mode='list';save();render(true);});
  for(const [id,next] of [['rustBrowserAllFavorites','favorite'],['rustBrowserAllRecent','recent']])
   $(id)?.addEventListener('click',()=>{tab=next;sort=next==='recent'?'recent':'name-asc';group='all';page=0;save();render(true);});
  doc.addEventListener('openiptv:media-info',()=>schedule(true));
  doc.addEventListener('openiptv:languagechange',()=>render(true));
  win.addEventListener('openiptv:favorites-changed',()=>schedule(true));
  win.addEventListener('openiptv:channel-browser-refresh',()=>schedule(true));
  const timer=win.setInterval?.(()=>schedule(),4000);
  render(true);
  win.IPTVRustChannelBrowser=Object.freeze({render:()=>render(true),getTab:()=>tab,getMode:()=>mode,timer});
  return true;
 }
 return {PAGE_SIZE,normalizeGroup,selectChannels,paginate,mount};
});
