'use strict';
/* Fullscreen Web-style control extension: reuses the actual desktop player/state. */
(()=>{
 const box=document.getElementById('playerBox'),dock=document.getElementById('fullscreenUX'),video=document.getElementById('video');
 if(!box||!dock||!video||!window.IPTVState)return;
 const get=id=>document.getElementById(id),state=window.IPTVState;
 const add=(id,label,title)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='fs-web-button';b.textContent=label;b.title=title||label;return b;};
 const epg=add('fsWebEPG','▤ EPG','Lịch phát sóng');
 const aspect=add('fsWebAspect','▭ Khung hình','Tỷ lệ khung hình');
 const links=add('fsWebLinks','↗ Link phát','Chọn link chính / dự phòng');
 const favorite=add('fsWebFav','☆','Yêu thích');
 const pip=add('fsWebPiP','▣','Picture-in-Picture');
 const pop=document.createElement('section');pop.className='fs-web-popover';pop.id='fsWebPopover';pop.setAttribute('aria-label','Tùy chọn toàn màn hình');
 const top=document.createElement('div');top.className='fs-web-top';top.id='fsWebTop';
 const seek=get('fsSeek');
 // Structured groups replace the earlier flat flex row: legacy fullscreen CSS
 // sizes *all* buttons as circles, which squeezed text buttons to 42px.
 const group=(name,children)=>{const el=document.createElement('div');el.className='fs-web-group '+name;el.append(...children);return el;};
 const transport=group('fs-web-transport',[get('fsPrev'),get('fsPlay'),get('fsNext')]);
 const identity=group('fs-web-identity',[get('fsChannel'),get('fsPosition')]);
 const actions=group('fs-web-actions',[epg,aspect,links]);
 const volumeIcon=document.createElement('span');volumeIcon.textContent='◖))';volumeIcon.className='fs-web-volume-icon';volumeIcon.setAttribute('aria-hidden','true');
 const volumeSlider=document.createElement('input');volumeSlider.id='fsWebVolume';volumeSlider.type='range';volumeSlider.min='0';volumeSlider.max='100';volumeSlider.step='1';volumeSlider.setAttribute('aria-label','Âm lượng toàn màn hình');
 const volume=group('fs-web-volume',[volumeIcon,volumeSlider]);
 const extras=group('fs-web-extras',[favorite,pip,get('fsExit')]);
 dock.replaceChildren(seek,transport,identity,actions,volume,extras,pop);
 box.append(top);
 const mainVolume=get('volume');
 function syncVolume(){if(!mainVolume)return;volumeSlider.value=mainVolume.value;volumeSlider.setAttribute('aria-valuenow',mainVolume.value);}
 volumeSlider.addEventListener('input',()=>{if(!mainVolume)return;mainVolume.value=volumeSlider.value;mainVolume.dispatchEvent(new Event('input',{bubbles:true}));});
 mainVolume?.addEventListener('input',syncVolume);
 syncVolume();
 const close=()=>{pop.classList.remove('open');pop.classList.remove('epg');for(const b of [epg,aspect,links]){b.classList.remove('active');b.setAttribute('aria-expanded','false');}};
 const item=(label,callback,selected=false)=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(selected)b.className='selected';b.addEventListener('click',callback);pop.append(b);};
 const open=(kind,button)=>{if(pop.classList.contains('open')&&button.classList.contains('active')){close();return;}close();pop.replaceChildren();pop.classList.add('open');button.classList.add('active');button.setAttribute('aria-expanded','true');
 if(kind==='aspect'){const sel=get('videoFit');for(const opt of sel.options)item((sel.value===opt.value?'✓ ':'')+opt.textContent,()=>{sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}));close();},sel.value===opt.value); }
 if(kind==='links'){const sel=get('manualStreamSelect');if(sel.disabled||!sel.options.length){const p=document.createElement('p');p.textContent='Chưa có link phát khả dụng';pop.append(p);}else for(const opt of sel.options){if(!opt.value)continue;item((opt.value===sel.value?'✓ ':'')+(opt.textContent||'Link phát'),()=>{sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}));close();},opt.value===sel.value);}}
 if(kind==='epg'){pop.classList.add('epg');const h=document.createElement('h3');h.textContent='Lịch phát sóng · '+(state.getCurrent?.()?.name||'Chưa chọn kênh');pop.append(h);
 for(const [name,time,isNow] of [['epgNowName','epgNowTime',true],['epgNextName','epgNextTime',false]]){const row=document.createElement('div');row.className='fs-epg-line'+(isNow?' now':'');const span=document.createElement('span');span.textContent=(isNow?'Đang phát':'Tiếp theo')+' · '+(get(time)?.textContent||'—');const strong=document.createElement('strong');strong.textContent=get(name)?.textContent||'Chưa có dữ liệu EPG';row.append(span,strong);pop.append(row);}
 item('Xem EPG đầy đủ',()=>{close();document.exitFullscreen?.().then(()=>get('openGuideBtn')?.click()).catch(()=>{});});}
 };
 epg.addEventListener('click',()=>open('epg',epg));aspect.addEventListener('click',()=>open('aspect',aspect));links.addEventListener('click',()=>open('links',links));
 favorite.addEventListener('click',()=>{get('favCurrentBtn')?.click();sync();});
 pip.addEventListener('click',()=>{get('pipBtn')?.click();close();});
 function sync(){const ch=state.getCurrent?.();top.textContent=(video.paused?'●':'🔴')+' '+(video.paused?'TẠM DỪNG':'LIVE')+'  '+(ch?.name||'Open IPTV Pro');favorite.textContent=get('favCurrentBtn')?.getAttribute('aria-pressed')==='true'?'★':'☆';const select=get('manualStreamSelect');links.textContent=select?.disabled?'↗ Link phát':('↗ '+((select?.selectedIndex||0)>0?'Link dự phòng':'Link chính'));links.title=select?.selectedOptions?.[0]?.textContent||'Chọn link phát';}
 document.addEventListener('fullscreenchange',()=>{close();if(document.fullscreenElement===box)sync();});
 video.addEventListener('playing',sync);video.addEventListener('pause',sync);
 dock.addEventListener('pointerdown',event=>event.stopPropagation());
 box.addEventListener('pointerdown',event=>{if(!dock.contains(event.target))close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 const observer=new MutationObserver(()=>{if(document.fullscreenElement===box)sync();});observer.observe(get('playingTitle'),{childList:true,characterData:true,subtree:true});observer.observe(get('favCurrentBtn'),{attributes:true,attributeFilter:['aria-pressed']});
 sync();
})();
