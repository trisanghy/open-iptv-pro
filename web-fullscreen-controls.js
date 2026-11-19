'use strict';
// Fullscreen menu mirrors the existing Web player; no duplicate stream or persistence.
(function(make){
 const w=typeof window==='undefined'?null:window;
 const api=make(w);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(function(w){
 function epgItems(guide,ch,now,lib){
  if(!guide||!ch||typeof lib?.find!=='function')return [];
  let items=[];try{items=lib.find(guide,ch)||[];}catch{return [];}
  return items.filter(p=>Number.isFinite(p.start)&&Number.isFinite(p.end)&&p.end>now-120000)
   .sort((a,b)=>a.start-b.start).slice(0,8)
   .map(p=>({start:p.start,end:p.end,title:String(p.title||'Chưa có tên'),onair:p.start<=now&&p.end>now}));
 }
 function listChoices(select){
  if(!select||select.disabled)return [];
  return Array.from(select.options||[]).filter(o=>!o.disabled&&o.value).map(o=>({
   value:o.value,label:o.textContent||o.label||o.value,selected:o.value===select.value
  }));
 }
 function init(){
  const doc=w?.document,box=doc?.getElementById('playerBox'),bar=doc?.getElementById('fullscreenUX');
  if(!bar||!box||!doc.getElementById('fsEpgBtn'))return;
  const $=id=>doc.getElementById(id),menus=[['fsEpgBtn','fsEpgPanel'],['fsFitBtn','fsFitPanel'],['fsLinkBtn','fsLinkPanel']];
  const fit=$('videoFit'),links=$('manualStreamSelect'),video=$('video');
  const active=()=>doc.fullscreenElement===box||box.classList.contains('mobile-theater');
  function closeOrOpen(name){
   for(const [button,panel] of menus){$(panel).hidden=panel!==name;$(button).setAttribute('aria-expanded',String(panel===name));}
   box.classList.remove('player-idle');
  }
  function renderEPG(){
   const ch=w.IPTVState?.getCurrent?.(),guide=w.IPTVExtras?.getGuide?.();
   const results=epgItems(guide,ch,Date.now(),w.IPTVGuide),list=$('fsEpgItems');
   $('fsEpgChannel').textContent=ch?.name||'Chưa chọn kênh';list.replaceChildren();
   if(!results.length){
    const hint=doc.createElement('p'),now=$('epgNowName')?.textContent,next=$('epgNextName')?.textContent;
    hint.textContent=!ch?'Chọn kênh để xem lịch':now&&now!=='Chưa có EPG'?now+(next?' · Tiếp: '+next:''):'Chưa có EPG cho kênh này';
    list.append(hint);return;
   }
   const clock=ms=>new Date(ms).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
   for(const x of results){
    const row=doc.createElement('div'),time=doc.createElement('time'),title=doc.createElement('b');
    row.className='fs-epg-item';row.dataset.onair=String(x.onair);row.setAttribute('role','listitem');
    time.textContent=clock(x.start)+' – '+clock(x.end);title.textContent=x.title;title.title=x.title;
    row.append(time,title);list.append(row);
   }
  }
  function displayChoices(source,hostId,callback){
   const host=$(hostId);host.replaceChildren();const opts=listChoices(source);
   if(!opts.length){const p=doc.createElement('p');p.textContent='Không có lựa chọn khả dụng';host.append(p);return;}
   for(const o of opts){
    const b=doc.createElement('button'),name=doc.createElement('span'),tick=doc.createElement('span');
    b.type='button';b.className='fs-choice';b.setAttribute('aria-pressed',String(o.selected));
    name.textContent=o.label;tick.textContent=o.selected?'✓':'';b.append(name,tick);
    b.addEventListener('click',()=>{callback(o.value);closeOrOpen('');});host.append(b);
   }
  }
  function renderFit(){displayChoices(fit,'fsFitItems',v=>{
   if(fit&&fit.value!==v){fit.value=v;fit.dispatchEvent(new Event('change',{bubbles:true}));}
  });}
  function renderLinks(){
   displayChoices(links,'fsLinkItems',v=>{
    if(links&&!links.disabled&&links.value!==v){links.value=v;links.dispatchEvent(new Event('change',{bubbles:true}));}
   });
   $('fsLinkName').textContent=listChoices(links).find(x=>x.selected)?.label?.split(' · ')[0]||'Link phát';
  }
  function sync(){
   $('fsFavBtn').setAttribute('aria-pressed',$('favCurrentBtn')?.getAttribute('aria-pressed')||'false');
   if($('volume'))$('fsVolumeSlider').value=$('volume').value;
  }
  for(const [id,panel] of menus)$(id).addEventListener('click',()=>{
   if(!$(panel).hidden){closeOrOpen('');return;}
   if(panel==='fsEpgPanel')renderEPG();if(panel==='fsFitPanel')renderFit();if(panel==='fsLinkPanel')renderLinks();
   closeOrOpen(panel);
  });
  $('fsFavBtn').addEventListener('click',()=>{$('favCurrentBtn')?.click();sync();});
  $('fsMuteBtn').addEventListener('click',()=>$('webVolumeMute')?.click());
  $('fsPipBtn').addEventListener('click',()=>$('pipBtn')?.click());
  $('fsVolumeSlider').addEventListener('input',e=>{
   const source=$('volume');if(source){source.value=e.currentTarget.value;source.dispatchEvent(new Event('input',{bubbles:true}));}
  });
  $('fsGuidePage').addEventListener('click',()=>{
   closeOrOpen('');
   const navigate=()=>$('openGuideBtn')?.click();
   if(box.classList.contains('mobile-theater')){w.OpenIPTVMobilePlayer?.exitTheater?.();navigate();return;}
   if(doc.fullscreenElement===box&&doc.exitFullscreen)Promise.resolve(doc.exitFullscreen()).then(navigate).catch(navigate);
   else navigate();
  });
  doc.addEventListener('fullscreenchange',()=>{closeOrOpen('');if(active())sync();});
  doc.addEventListener('pointerdown',e=>{if(active()&&!bar.contains(e.target))closeOrOpen('');});
  doc.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&active()&&menus.some(([,p])=>!$(p).hidden)){
    e.preventDefault();e.stopImmediatePropagation?.();closeOrOpen('');
   }
  },true);
  if(typeof MutationObserver==='function'){
   const observer=new MutationObserver(()=>{if(active()){renderLinks();sync();}});
   if(links)observer.observe(links,{childList:true,attributes:true,attributeFilter:['disabled'],subtree:true});
   if($('favCurrentBtn'))observer.observe($('favCurrentBtn'),{attributes:true,attributeFilter:['aria-pressed']});
  }
  video?.addEventListener('playing',()=>{if(active()){renderLinks();sync();if(!$('fsEpgPanel').hidden)renderEPG();}},{passive:true});
  sync();
 }
 if(w?.document){
  if(w.document.readyState==='loading')w.document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
 }
 return Object.freeze({init,epgItems,listChoices});
});
