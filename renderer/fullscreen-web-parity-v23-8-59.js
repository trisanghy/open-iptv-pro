/* Web-style fullscreen control surface for Rust Lab. Reuses the original player and all existing handlers. */
'use strict';
(function(root,build){
 const api=build();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root.document,root);
})(typeof window==='undefined'?null:window,function(){
 const ratios=Object.freeze({'16:9':16/9,'4:3':4/3,'16:10':16/10,'21:9':21/9});
 function fitSize(width,height,selection){
  const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
  const ratio=ratios[selection];
  if(!ratio)return {width:w,height:h};
  return w/h>ratio?{width:h*ratio,height:h}:{width:w,height:w/ratio};
 }
 function mount(doc,win){
  const $=id=>doc.getElementById(id),box=$('playerBox'),ux=$('fullscreenUX'),video=$('video');
  if(!box||!ux||!video||ux.dataset.webFullscreenReady==='true')return false;
  const ids=['fsPrev','fsPlay','fsNext','fsChannel','fsPosition','fsSeek','fsEPG','fsDVR','fsExit'];
  const controls=Object.fromEntries(ids.map(id=>[id,$(id)]));
  if(Object.values(controls).some(x=>!x))return false;
  ux.dataset.webFullscreenReady='true';
  const create=(tag,cls,txt)=>{
   const el=doc.createElement(tag);if(cls)el.className=cls;
   if(txt!==undefined)el.textContent=txt;return el;
  };
  const button=(cls,txt,title)=>{
   const btn=create('button',cls,txt);btn.type='button';
   if(title){btn.title=title;btn.setAttribute('aria-label',title);}return btn;
  };
  const wrap=(cls,...nodes)=>{const el=create('div',cls);el.append(...nodes.filter(Boolean));return el;};
  const badge=create('div','fs-web-live','● LIVE');
  badge.setAttribute('aria-live','polite');box.append(badge);
  const progress=wrap('fs-web-progress',controls.fsSeek,controls.fsPosition);
  const current=doc.createElement('div');current.className='fs-web-channel';
  const logo=create('span','fs-web-channel-logo','TV'),details=create('span','fs-web-channel-details');
  const subtitle=create('small','fs-web-channel-subtitle','');
  details.append(controls.fsChannel,subtitle);current.append(logo,details);
  const volume=doc.createElement('input');volume.type='range';volume.min='0';volume.max='100';volume.step='1';
  volume.id='fsWebVolume';volume.setAttribute('aria-label','Âm lượng');volume.title='Âm lượng';
  const mute=button('fs-web-mute','','Bật / tắt tiếng');
  const media=wrap('fs-web-transport',controls.fsPrev,controls.fsPlay,controls.fsNext,mute,volume);
  const fitBtn=button('fs-web-action','Khung hình ⌄','Chọn tỷ lệ khung hình');
  fitBtn.id='fsWebFitButton';fitBtn.setAttribute('aria-expanded','false');
  const fitPop=create('div','fs-web-popover fs-web-fit');fitPop.id='fsWebFitPopup';fitPop.hidden=true;
  fitPop.setAttribute('role','group');fitPop.setAttribute('aria-label','Tỷ lệ khung hình');
  const fitMenu=wrap('fs-web-menu',fitBtn,fitPop);
  const linkBtn=button('fs-web-action','Link chính ⌄','Chọn link chính hoặc dự phòng');
  linkBtn.id='fsWebLinkButton';linkBtn.setAttribute('aria-expanded','false');
  const linkPop=create('div','fs-web-popover fs-web-links');linkPop.id='fsWebLinkPopup';linkPop.hidden=true;
  linkPop.setAttribute('role','group');linkPop.setAttribute('aria-label','Nguồn phát');
  const linkMenu=wrap('fs-web-menu',linkBtn,linkPop);
  const favorite=button('fs-web-icon','','Yêu thích');favorite.id='fsWebFavorite';
  const cog=button('fs-web-icon','','Tùy chọn');cog.id='fsWebSettings';
  cog.setAttribute('aria-expanded','false');
  const settingsPop=create('div','fs-web-popover fs-web-settings');settingsPop.id='fsWebSettingsPopup';settingsPop.hidden=true;
  const settingsMenu=wrap('fs-web-menu',cog,settingsPop);
  const pip=button('fs-web-icon','','Cửa sổ nổi Picture-in-Picture');pip.id='fsWebPiP';
  controls.fsExit.classList.add('fs-web-exit');
  const actions=wrap('fs-web-actions',controls.fsEPG,fitMenu,linkMenu,favorite,settingsMenu,pip,controls.fsExit);
  const bottom=wrap('fs-web-bottom',media,current,actions);
  const hud=wrap('fs-web-hud',progress,bottom);
  // Move the existing controls, never clone the video element or its event handlers.
  ux.replaceChildren(hud);
  const menus=[[fitBtn,fitPop],[linkBtn,linkPop],[cog,settingsPop]];
  function closeMenus(){
   for(const [trigger,pop] of menus){pop.hidden=true;trigger.setAttribute('aria-expanded','false');}
   box.classList.remove('fs-web-menu-open');
  }
  function toggleMenu(btn,pop){
   const next=pop.hidden;closeMenus();
   if(next){pop.hidden=false;btn.setAttribute('aria-expanded','true');box.classList.remove('player-idle');box.classList.add('fs-web-menu-open');}
  }
  const fitStorageKey='open-iptv-pro-fullscreen-aspect';
  let screenFit='16:9';
  try{const saved=win.localStorage?.getItem(fitStorageKey);if(Object.hasOwn(ratios,saved)||saved==='crop'||saved==='screen')screenFit=saved;}catch{}

  const fitItems=[['16:9','16:9 (Mặc định)'],['4:3','4:3'],['16:10','16:10'],['21:9','21:9'],
   ['crop','Lấp đầy (cắt cạnh)'],['screen','Vừa màn hình']];
  function updateVideoFit(){
   if(doc.fullscreenElement!==box)return;
   const measured=fitSize(box.clientWidth||win.innerWidth,box.clientHeight||win.innerHeight,screenFit);
   box.style.setProperty('--fs-web-video-width',measured.width+'px');
   box.style.setProperty('--fs-web-video-height',measured.height+'px');
   box.style.setProperty('--fs-web-object-fit',screenFit==='crop'?'cover':screenFit==='screen'?'contain':screenFit==='16:9'?'contain':'cover');
  }
  function renderFits(){
   fitPop.replaceChildren();
   for(const [value,label] of fitItems){
    const selected=screenFit===value,btn=button('fs-web-option'+(selected?' selected':''),label,label);
    btn.setAttribute('aria-pressed',String(selected));
    btn.addEventListener('click',()=>{screenFit=value;try{win.localStorage?.setItem(fitStorageKey,value);}catch{}renderFits();updateVideoFit();closeMenus();});
    fitPop.append(btn);
   }
  }
  function renderLinks(){
   const original=$('manualLinkSelect'),available=original&&original.options?.length>0;
   const enabled=!!win.IPTVState?.getCurrent?.()&&available;
   linkBtn.disabled=!enabled;
   linkPop.replaceChildren();
   if(!enabled){linkBtn.textContent='Link phát';return;}
   const options=Array.from(original.options).filter(option=>option.value&&!option.disabled);
   const active=original.value;
   linkBtn.textContent=(options.find(o=>o.value===active)?.textContent||options[0]?.textContent||'Link chính')+' ⌄';
   for(const [i,option] of options.entries()){
    const selected=option.value===active,btn=button('fs-web-option'+(selected?' selected':''),(option.textContent||('Dự phòng '+i)),option.textContent);
    btn.setAttribute('aria-pressed',String(selected));
    btn.addEventListener('click',()=>{
     // The source picker owns validation, persistence and playback; invoke that original handler.
     if(original.value!==option.value){
      original.value=option.value;
      original.dispatchEvent(new win.Event('change',{bubbles:true}));
     }
     closeMenus();renderLinks();
    });
    linkPop.append(btn);
   }
   if(!options.length)linkPop.append(create('p','fs-web-empty','Chưa có link phát.'));
  }
  const addSetting=(label,handler)=>{
   const btn=button('fs-web-option',label,label);btn.addEventListener('click',()=>{closeMenus();handler();});
   settingsPop.append(btn);
  };
  settingsPop.replaceChildren();
  addSetting('Lịch ghi hình',()=>controls.fsDVR.click());
  addSetting('Chụp ảnh kênh',()=>{$('shotBtn')?.click();});
  addSetting('Phụ đề trên video',()=>{
   const cc=$('rustSubtitleOptionsButton');if(cc)cc.click();
   else win.IPTVState?.toast?.('Không tìm thấy cài đặt phụ đề','warn');
  });
  addSetting('Cài đặt ứng dụng',()=>{
   Promise.resolve(doc.exitFullscreen?.()).catch(()=>{}).finally(()=>win.IPTVState?.setPage?.('settings'));
  });
  fitBtn.addEventListener('click',()=>{renderFits();toggleMenu(fitBtn,fitPop);});
  linkBtn.addEventListener('click',()=>{renderLinks();toggleMenu(linkBtn,linkPop);});
  cog.addEventListener('click',()=>toggleMenu(cog,settingsPop));
  for(const btn of [controls.fsEPG,controls.fsDVR])btn.addEventListener('click',closeMenus);
  favorite.addEventListener('click',()=>{$('favCurrentBtn')?.click();sync();});
  pip.addEventListener('click',()=>{$('pipBtn')?.click();closeMenus();});
  function sync(){
   const ch=win.IPTVState?.getCurrent?.(),mode=win.IPTVState?.getPlayMode?.();
   const playing=!!ch && !video.paused && !video.ended;
   const name=ch?.name||'Open IPTV Pro';
   logo.textContent=name.trim().slice(0,2).toUpperCase();
   subtitle.textContent=$('playingSubtitle')?.textContent||'';
   badge.textContent=(mode==='live'?'● LIVE':'● '+(mode||'TV').toUpperCase())+'  '+(ch?.name||'');
   badge.hidden=!ch;
   favorite.disabled=!ch;
   const original=$('favCurrentBtn');
   const selected=original?.getAttribute('aria-pressed')==='true';
   favorite.textContent='';favorite.setAttribute('aria-pressed',String(selected));
   mute.dataset.iptvMuted=String(video.muted||video.volume===0);
   volume.value=String(Math.round((video.muted?0:video.volume)*100));
   pip.disabled=!ch;
   controls.fsPlay.setAttribute('aria-label',playing?'Tạm dừng':'Phát');
   if(linkPop.hidden)renderLinks();
  }
  mute.addEventListener('click',()=>{
   video.muted=!video.muted;
   if(!video.muted && volume.value==='0'){video.volume=.5;$('volume').value='50';$('volume').dispatchEvent(new win.Event('input',{bubbles:true}));}
   sync();
  });
  volume.addEventListener('input',()=>{
   const original=$('volume');
   if(!original)return;
   original.value=volume.value;
   original.dispatchEvent(new win.Event('input',{bubbles:true}));
   video.muted=Number(volume.value)===0;
   sync();
  });
  controls.fsExit.addEventListener('click',closeMenus);
  function fullscreenChange(){
   const active=doc.fullscreenElement===box;
   closeMenus();
   if(active){renderFits();updateVideoFit();sync();}
   else{
    box.style.removeProperty('--fs-web-video-width');
    box.style.removeProperty('--fs-web-video-height');
    box.style.removeProperty('--fs-web-object-fit');
   }
  }
  doc.addEventListener('fullscreenchange',fullscreenChange);
  doc.addEventListener('pointerdown',event=>{
   if(doc.fullscreenElement===box&&!event.target.closest?.('.fs-web-menu'))closeMenus();
  });
  doc.addEventListener('keydown',event=>{if(doc.fullscreenElement===box&&event.key==='Escape')closeMenus();});
  win.addEventListener?.('resize',updateVideoFit);
  video.addEventListener('volumechange',sync);
  for(const type of ['play','playing','pause','ended','emptied','loadedmetadata'])video.addEventListener(type,sync);
  doc.addEventListener('openiptv:media-info',sync);
  doc.addEventListener('openiptv:languagechange',()=>{renderFits();sync();});
  // Update backing channel/source control labels as async playlists and EPG finish loading.
  const timer=win.setInterval?.(()=>{if(doc.fullscreenElement===box)sync();},1000);
  sync();
  win.IPTVFullscreenWebParity=Object.freeze({getFit:()=>screenFit,closeMenus,updateVideoFit,fitSize,timer});
  return true;
 }
 return {fitSize,mount,ratios};
});
