/* Rust Lab v16: compact two-row controls. Move existing nodes so their handlers
 * and IDs stay intact; EPG is read from the application's real XMLTV guide. */
(function(root){
 'use strict';
 const doc=root.document;
 if(!doc)return;
 const el=id=>doc.getElementById(id);
 function mount(){
  const card=doc.querySelector('#page-tv .player-control-card');
  const info=card?.querySelector('.playing-info');
  const controls=card?.querySelector('.controls');
  const quick=el('quickTools');
  if(!card||!info||!controls||!quick||card.querySelector('.v16-toolbar-top'))return;
  const make=(tag,cls)=>{const node=doc.createElement(tag);node.className=cls;return node;};
  const top=make('div','v16-toolbar-top');
  const bottom=make('div','v16-toolbar-bottom');
  const cast=make('div','v16-cast-controls');
  const options=make('div','v16-stream-options');
  const epg=make('div','v16-epg-summary');
  epg.setAttribute('aria-label','Chương trình đang chiếu và tiếp theo');
  function program(cls,label){
   const button=make('button',cls);
   button.type='button';button.title='Mở lịch phát sóng EPG';
   const title=make('strong','v16-epg-title');
   const time=make('span','v16-epg-time');
   title.textContent=label;time.textContent='Chưa có dữ liệu';
   button.append(title,time);
   button.addEventListener('click',()=>el('openGuideBtn')?.click());
   return {button,title,time};
  }
  const current=program('v16-epg-program v16-epg-now','Chưa có EPG');
  const next=program('v16-epg-program v16-epg-next','Chưa có chương trình tiếp theo');
  epg.append(current.button,next.button);

  for(const id of ['castBtn','pipBtn','fullscreenBtn']){
    const node=el(id);if(node)cast.append(node);
  }
  const manual=el('manualLinkControl'),favorite=el('favCurrentBtn');
  const fit=controls.querySelector('.view-mode'),shot=el('shotBtn');
  if(fit)options.append(fit);
  if(manual)options.append(manual);
  if(favorite)options.append(favorite);
  // Keep less-frequently used controls accessible under the existing Quick Tools.
  // The user's compact player bar has no duplicate volume or Snapshot column.
  const extra=make('div','v16-quick-audio');
  const volumeLabel=make('label','v16-volume-label');volumeLabel.textContent='Âm lượng';
  const volume=el('volume');if(volume)volumeLabel.append(volume);
  extra.append(volumeLabel);
  if(shot){shot.title='Chụp ảnh kênh';shot.textContent='▣ Chụp Snapshot';extra.append(shot);}
  quick.insertBefore(extra,quick.querySelector('.quick-grid'));
  const oldVolumeIcon=controls.querySelector('.volume-icon');if(oldVolumeIcon)oldVolumeIcon.remove();
  const spacer=controls.querySelector('.control-spacer');if(spacer)spacer.remove();
  // Preserve the original .playing-info / .controls for appearance themes.
  top.append(info,controls,cast);
  bottom.append(epg,options);
  const seek=el('videoSeekWrap');
  card.insertBefore(top,seek||null);
  card.insertBefore(bottom,seek||null);
  card.classList.add('v16-two-row-controls');

  const fmt=value=>{
   const n=Number(value);if(!Number.isFinite(n))return '';
   return new Date(n).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  };
  const update=()=>{
   const channel=root.IPTVState?.getCurrent?.();
   const guide=root.IPTVExtras?.getGuide?.();
   let now=null,later=null;
   if(channel&&guide&&root.IPTVGuide?.current){
    try{const result=root.IPTVGuide.current(guide,channel);now=result?.now||null;later=result?.next||null;}catch(error){console.warn('EPG control summary:',error);}
   }
   current.title.textContent=now?.title||'Chưa có EPG hiện tại';
   current.time.textContent=now?`${fmt(now.start)} – ${fmt(now.end)}`:'Chọn kênh / tải lịch EPG';
   next.title.textContent=later?.title||'Chưa có chương trình tiếp theo';
   next.time.textContent=later?`${fmt(later.start)} – ${fmt(later.end)}`:'Xem lịch phát sóng EPG';
   current.button.title=now?.title||'Xem lịch phát sóng';
   next.button.title=later?.title||'Xem lịch phát sóng';
  };
  const observe=id=>{
   const target=el(id);
   if(target&&root.MutationObserver)new MutationObserver(update).observe(target,{childList:true,characterData:true,subtree:true});
  };
  observe('playingTitle');observe('epgNowText');
  update();
  // XMLTV rollovers on the hour without switching channels.
  root.setInterval(update,60000);
  root.IPTVRustLabControlV16={update,version:'16'};
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})(typeof window!=='undefined'?window:undefined);
