/* Fullscreen EPG and DVR: one player, read-only schedule list, confirmed EPG bookings. */
'use strict';
(()=>{
 const context=window.IPTVState;
 const box=document.getElementById('playerBox');
 const drawer=document.getElementById('fsDrawer');
 if(!context||!box||!drawer)return;
 const $=id=>document.getElementById(id);
 const title=$('fsDrawerTitle'),content=$('fsDrawerContent');
 const epgButton=$('fsEPG'),dvrButton=$('fsDVR');
 const clock=t=>new Date(t).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
 let mode='',serial=0,lastChannel='',lastGuideMinute=-1;
 function el(tag,cls,txt){const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=String(txt);return node;}
 function isOpen(){return mode&&document.fullscreenElement===box&&!drawer.hidden;}
 function close(){
  mode='';serial++;drawer.hidden=true;box.classList.remove('fs-drawer-open');
  epgButton.setAttribute('aria-expanded','false');dvrButton.setAttribute('aria-expanded','false');
 }
 function button(text,handler,cls='fs-drawer-action'){
  const element=el('button',cls,text);element.type='button';element.addEventListener('click',handler);return element;
 }
 function empty(message){content.replaceChildren(el('p','fs-drawer-empty',message));}
 function openPage(page){
  close();const result=document.exitFullscreen?.();
  Promise.resolve(result).catch(()=>{}).finally(()=>context.setPage?.(page));
 }
 function renderEPG(){
  if(mode!=='epg'||!isOpen())return;
  const channel=context.getCurrent?.(),guide=window.IPTVExtras?.getGuide?.();
  content.replaceChildren();lastChannel=channel?.id||'';
  lastGuideMinute=Math.floor(Date.now()/60000);
  if(!channel){empty('Chọn một kênh trước để xem lịch EPG.');return;}
  title.textContent='▤ EPG · '+channel.name;
  let programmes=[];
  try{programmes=window.IPTVGuide?.find?.(guide,channel)||[];}
  catch(error){console.warn('Fullscreen EPG:',error);}
  const now=Date.now();
  programmes=programmes.filter(p=>Number.isFinite(p.start)&&Number.isFinite(p.end)&&p.end>now).sort((a,b)=>a.start-b.start).slice(0,10);
  if(!programmes.length){
   content.append(el('p','fs-drawer-empty','Chưa có EPG cho kênh này hoặc lịch đã hết hạn.'));
   content.append(button('Mở trang EPG để tải hoặc ghép lịch',()=>openPage('epg')));
   return;
  }
  for(const prog of programmes){
   const row=el('article','fs-epg-row');
   const time=el('time','fs-epg-time',clock(prog.start)+' – '+clock(prog.end));
   const details=el('div','fs-epg-details');
   const active=prog.start<=now&&prog.end>now;
   details.append(el('strong','',prog.title||'Chưa có tên chương trình'));
   if(active)details.append(el('small','fs-live','● ĐANG PHÁT'));
   if(prog.description)details.append(el('small','fs-epg-description',prog.description));
   row.append(time,details);
   if(prog.end>now+60000){
    const book=button('⏺ Ghi',()=>{
     if(typeof window.IPTVDVR?.scheduleFromEPG==='function')window.IPTVDVR.scheduleFromEPG(channel,prog);
     else openPage('epg');
    },'fs-record-btn');
    book.title='Hẹn ghi chương trình này từ EPG';row.append(book);
   }
   content.append(row);
  }
  content.append(button('Xem lịch phát sóng đầy đủ',()=>openPage('epg')));
 }
 const labels={scheduled:'Đã hẹn',recording:'ĐANG GHI',finalizing:'Đang lưu MP4',completed:'Hoàn tất',missed:'Bỏ lỡ',failed:'Lỗi',cancelled:'Đã hủy'};
 async function renderDVR(){
  if(mode!=='dvr'||!isOpen())return;
  const token=++serial;title.textContent='⏺ Lịch ghi hình';empty('Đang tải lịch ghi hình…');
  if(typeof window.streamleaf?.dvrList!=='function'){empty('DVR chỉ hoạt động khi dùng bản desktop có backend ghi hình.');return;}
  try{
   const value=await window.streamleaf.dvrList();
   if(token!==serial||mode!=='dvr'||!isOpen())return;
   const jobs=Array.isArray(value?.jobs)?value.jobs:[];
   const visible=jobs.filter(j=>['scheduled','recording','finalizing'].includes(j.status)).sort((a,b)=>a.startAt-b.startAt).slice(0,30);
   content.replaceChildren();
   if(!visible.length)content.append(el('p','fs-drawer-empty','Không có lịch đang ghi hoặc sắp ghi.'));
   for(const job of visible){
    const row=el('article','fs-dvr-row '+(job.status==='recording'?'is-recording':''));
    const details=el('div','fs-dvr-details');
    details.append(el('strong','',job.title||job.channelName||'Chương trình'));
    details.append(el('small','',`${job.channelName||''} · ${clock(job.startAt)} – ${clock(job.endAt)}`));
    row.append(details,el('span','fs-dvr-pill',labels[job.status]||job.status));
    content.append(row);
   }
   content.append(button('Quản lý / thêm lịch ghi hình',()=>openPage('epg')));
  }catch(error){
   if(token!==serial||mode!=='dvr')return;
   empty('Không tải được lịch ghi: '+String(error?.message||error).slice(0,180));
  }
 }
 function show(next){
  if(document.fullscreenElement!==box)return;
  if(mode===next){close();return;}
  serial++;mode=next;drawer.hidden=false;box.classList.add('fs-drawer-open');box.classList.remove('player-idle');
  epgButton.setAttribute('aria-expanded',String(next==='epg'));
  dvrButton.setAttribute('aria-expanded',String(next==='dvr'));
  if(next==='epg')renderEPG();else{lastDVRRefresh=Date.now();void renderDVR();}
 }
 epgButton.addEventListener('click',()=>show('epg'));
 dvrButton.addEventListener('click',()=>show('dvr'));
 $('fsDrawerClose').addEventListener('click',close);
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement!==box)close();});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&mode){close();event.stopPropagation();}
 });
 let lastDVRRefresh=0;
 window.setInterval(()=>{
  if(!isOpen())return;
  if(mode==='epg'){
   if(lastChannel!==(context.getCurrent?.()?.id||'')||lastGuideMinute!==Math.floor(Date.now()/60000))renderEPG();
  }else if(mode==='dvr'&&Date.now()-lastDVRRefresh>=20000){
   lastDVRRefresh=Date.now();void renderDVR();
  }
 },5000);
 // Optional test hooks are deliberately read-only and cannot alter playlist state.
 window.IPTVFullscreenPanels=Object.freeze({getMode:()=>mode,close});
})();
