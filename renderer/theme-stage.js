'use strict';
// Layout orchestration for TV-first skins. Keep the ORIGINAL control DOM
// outside the player video; only the dedicated fullscreen controls live inside.
(() => {
 const $=id=>document.getElementById(id);
 const root=document.documentElement;
 const watch=document.querySelector('#page-tv .watch-panel');
 const player=$('playerBox'),card=document.querySelector('#page-tv .player-control-card');
 const timebar=document.querySelector('#page-tv .advanced-timebar');
 const list=$('channelList'),strip=$('themeStripItems'),guide=$('themeGuidePanel');
 const open=$('themeAllChannels'),scrim=$('themeChannelScrim');
 if(!watch||!player||!card||!timebar||!list||!strip||!guide)return;
 let previousSignature='',lastCurrent='',updateScheduled=false;
 const clean=s=>String(s??'').trim();
 const setText=(id,txt)=>{const el=$(id);if(el&&el.textContent!==txt)el.textContent=txt};
 function activeStyle(){return root.dataset.uiStyle||'current'}
 function ensurePlacement(){
  if(activeStyle()!=='cinema' && root.dataset.themeChannelDrawer==='open')hideDrawer();
  // Earlier themes appended the whole player-control-card INTO playerBox.
  // That obscured the stream and duplicated fullscreen controls. Restore the
  // regular card as a sibling in every theme, including while fullscreen.
  if(card.parentElement!==watch || card.nextElementSibling!==timebar){
   watch.insertBefore(card,timebar);
  }
 }
 function hideDrawer(){root.dataset.themeChannelDrawer='closed';open.setAttribute('aria-expanded','false');scrim.hidden=true;}
 open.addEventListener('click',()=>{
  const isOpen=root.dataset.themeChannelDrawer==='open';
  root.dataset.themeChannelDrawer=isOpen?'closed':'open';
  open.setAttribute('aria-expanded',String(!isOpen));scrim.hidden=isOpen;
 });
 scrim.addEventListener('click',hideDrawer);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hideDrawer()});
 $('themeGuideOpen')?.addEventListener('click',()=>{$('openGuideBtn')?.click()});
 // Use current IPTV data directly; the tiles are navigation only, never fake video feeds.
 function createTile(ch,{snapshots={},snapshotBase=''}={}){
  const button=document.createElement('button');button.type='button';button.className='theme-channel-tile';
  button.dataset.channelId=String(ch.id);button.title='Xem '+clean(ch.name);
  const art=document.createElement('div');art.className='theme-tile-art';
  // Never clone an image out of the on-screen channel list: collapsed or
  // virtualized channel groups have no visible <img> to clone.
  const helper=window.OpenIPTVChannelArt;
  if(helper?.mount){
   helper.mount(art,{channel:ch,snapshots,snapshotBase,doc:document,eager:true});
  }else{
   const fallback=document.createElement('span');fallback.className='theme-tile-empty';
   fallback.textContent=clean(ch.name).slice(0,4).toUpperCase()||'TV';
   art.append(fallback);
  }
  const title=document.createElement('strong');title.textContent=clean(ch.name)||'Kênh IPTV';
  const badge=document.createElement('span');badge.className='theme-tile-health '+(ch.status||'');
  badge.title=ch.status==='alive'?'Kênh đã kiểm tra sống':
   ch.status==='dead'?'Kênh được đánh dấu Die':'Chưa xác minh';
  art.append(badge);button.append(art,title);
  button.addEventListener('click',()=>{hideDrawer();window.IPTVState?.playChannel?.(ch.id);});
  return button;
 }
 function syncTiles(){
  const channels=window.IPTVState?.getChannels?.()||[];
  const style=activeStyle();
  if(!['cinema','broadcast','bento'].includes(style)){return;}
  const top=channels.slice(0,24);
  const snapshots=window.IPTVState?.getStore?.()?.snapshots||{};
  const snapshotBase=window.__snapshotBase||'';
  // React to playlist edits, new snapshots, updated logos and late FFmpeg
  // capabilities. Never depend on a channel group being expanded.
  const signature=style+'|'+snapshotBase+'|'+top.map(c=>{
   const shot=snapshots[c.url]||{};
   return [c.id,c.url,c.name,c.logo,c.status,shot.file,shot.date,
    String(shot.data||'').slice(0,80)].join(':');
  }).join('|');
  if(signature===previousSignature)return;
  previousSignature=signature;
  strip.replaceChildren();
  if(!top.length){const empty=document.createElement('div');empty.className='theme-strip-empty';empty.textContent='Chưa có kênh. Thêm M3U để xuất hiện kênh nổi bật tại đây.';strip.append(empty);return;}
  const frag=document.createDocumentFragment();
  top.forEach(ch=>frag.append(createTile(ch,{snapshots,snapshotBase})));
  strip.append(frag);
 }
 $('themeStripPrev')?.addEventListener('click',()=>strip.scrollBy({left:-Math.max(220,strip.clientWidth*.7),behavior:'smooth'}));
 $('themeStripNext')?.addEventListener('click',()=>strip.scrollBy({left:Math.max(220,strip.clientWidth*.7),behavior:'smooth'}));
 function epgTime(ms){try{return new Date(ms).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}catch{return ''}}
 function syncGuide(){
  const c=window.IPTVState?.getCurrent?.();
  const name=clean(c?.name)||'Chưa chọn kênh';
  setText('themeGuideChannel',name);
  const epg=window.IPTVExtras?.getGuide?.();
  let now=null,next=null;
  if(c&&epg&&window.IPTVGuide?.current){try{({now,next}=window.IPTVGuide.current(epg,c))}catch{}}
  setText('themeGuideNow',now?`${epgTime(now.start)} – ${epgTime(now.end)} · ${now.title}`:'Chưa có EPG khớp với kênh đang xem');
  setText('themeGuideNext',next?`${epgTime(next.start)} · ${next.title}`:'Chưa có lịch tiếp theo');
 }
 function refresh(){ensurePlacement();syncTiles();syncGuide();}
 function schedule(){if(updateScheduled)return;updateScheduled=true;window.requestAnimationFrame(()=>{updateScheduled=false;refresh()})}
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-ui-style']});
 // The original list is rebuilt after playlists/favorite/source refresh. Do not mutate it.
 new MutationObserver(schedule).observe(list,{childList:true,subtree:true});
 new MutationObserver(schedule).observe($('playingTitle'),{childList:true,characterData:true,subtree:true});
 new MutationObserver(schedule).observe($('epgNowText'),{childList:true,characterData:true,subtree:true});
 window.setInterval(()=>{const now=window.IPTVState?.getCurrent?.()?.id||'';if(now!==lastCurrent){lastCurrent=now;refresh()}else if(['cinema','glass','broadcast','swiss'].includes(activeStyle()))syncGuide()},30000);
 refresh();
 window.OpenIPTVThemeStage=Object.freeze({refresh,hideDrawer});
})();
