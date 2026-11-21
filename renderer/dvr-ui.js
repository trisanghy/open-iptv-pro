'use strict';
/** Safe DVR controls: job execution, paths and persisted schedules live in Electron main. */
(()=>{
 const api=window.streamleaf,ctx=window.IPTVState;
 const $=id=>document.getElementById(id);
 const panel=$('dvrPanel');if(!panel)return;
 const fmt=t=>new Date(t).toLocaleString(undefined,{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
 const fmtBytes=n=>n>0?(n/(1024*1024)).toFixed(1)+' MB':'';
 const v=ms=>{const d=new Date(ms),local=new Date(ms-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16);};
 const statuses={scheduled:'Đã hẹn',recording:'Đang ghi',finalizing:'Đang hoàn tất MP4',completed:'Hoàn tất',missed:'Bỏ lỡ',cancelled:'Đã hủy',interrupted:'Bị gián đoạn',failed:'Ghi lỗi'};
 let busy=false,loaded=false,channelSignature='',refreshPending=null;
 const notice=(message,isError=false)=>{const el=$('dvrStatus');el.textContent=message;el.classList.toggle('dvr-error',!!isError);};
 function usable(){if(!api?.dvrList){notice('Hẹn giờ ghi hình chỉ hoạt động trong ứng dụng Windows/macOS đã đóng gói.',true);return false;}
  if(window.IPTVProAdvanced?.canEdit?.()===false){notice('Hồ sơ trẻ em không thể đặt hoặc hủy lịch ghi.',true);return false;}return true;}
 function updateChannels(){
  const channels=ctx.getChannels().filter(c=>c?.id&&c?.url&&/^https?:\/\//i.test(c.url));
  const signature=channels.map(c=>c.id+'|'+c.name).join('\u001e');if(channelSignature===signature)return;
  channelSignature=signature;
  const input=$('dvrChannel'),previous=input.value;input.replaceChildren();
  for(const c of channels){const opt=document.createElement('option');opt.value=c.id;opt.textContent=c.name;input.append(opt);}
  if(channels.some(c=>c.id===previous))input.value=previous;
 }
 function setDefaults(){const current=Date.now()+5*60_000;$('dvrStart').value=v(current);$('dvrEnd').value=v(current+60*60_000);}
 function quickDefaults(){const start=Date.now()+5*60_000;$('dvrQuickStart').value=v(start);$('dvrQuickEnd').value=v(start+60*60_000);}
 function currentChannel(){const current=ctx.getCurrent?.();if(!current?.id)return null;return ctx.getChannels().find(c=>c.id===current.id&&/^https?:\/\//i.test(c.url))||null;}
 function quickCurrent(){const channel=currentChannel();$('dvrQuickChannel').textContent=channel?'Kênh: '+channel.name:'Chưa chọn kênh phát trực tiếp';return channel;}
 function showQuickStatus(value,kind=''){
  const el=$('dvrQuickStatus');if(el.textContent!==value)el.textContent=value;el.classList.remove('recording','scheduled','error');if(kind)el.classList.add(kind);
 }
 function summarizeQuick(jobs){
  const current=Array.isArray(jobs)?jobs:[];
  const finalizing=current.filter(j=>j.status==='finalizing');if(finalizing.length){showQuickStatus('⏳ Đang hoàn tất MP4: '+(finalizing[0].channelName||finalizing[0].title),'recording');return;}
  const active=current.filter(j=>j.status==='recording');const pending=current.filter(j=>j.status==='scheduled');
  if(active.length){const j=active[0];showQuickStatus(`● ĐANG GHI: ${j.channelName||j.title} · đến ${fmt(j.endAt)}${pending.length?' · '+pending.length+' lịch tiếp theo':''}`,'recording');return;}
  if(pending.length){pending.sort((a,b)=>a.startAt-b.startAt);const next=pending[0];showQuickStatus(`✓ Đã hẹn ${pending.length} lịch · tiếp theo: ${next.channelName||next.title} (${fmt(next.startAt)})`,'scheduled');return;}
  showQuickStatus('● Chưa ghi · Chưa có lịch sắp tới');
 }
 function createElement(tag,className,content){const e=document.createElement(tag);if(className)e.className=className;if(content!==undefined)e.textContent=String(content);return e;}
 function listJobs(list){const box=$('dvrJobs');box.replaceChildren();
  const sorted=[...(list?.jobs||[])].sort((a,b)=>{const pa=['recording','finalizing'].includes(a.status)?0:a.status==='scheduled'?1:2;const pb=['recording','finalizing'].includes(b.status)?0:b.status==='scheduled'?1:2;return pa-pb||(pa===2?b.startAt-a.startAt:a.startAt-b.startAt);});if(!sorted.length){const hasRecordableChannel=ctx.getChannels().some(c=>c?.id&&c?.url&&/^https?:\/\//i.test(c.url));const hint=hasRecordableChannel?'Chưa có lịch ghi hình. Chọn chương trình EPG hoặc thêm lịch thủ công.':'Chưa có lịch ghi hình. Hãy nhập nguồn IPTV có kênh trước khi đặt lịch.';box.append(createElement('p','hint',hint));return;}
  for(const j of sorted.slice(0,100)){
   const card=createElement('article','dvr-job dvr-'+j.status);
   const head=createElement('div','dvr-job-heading');
   const userTitle=createElement('strong','',j.title);userTitle.setAttribute('data-i18n-ignore','true');head.append(userTitle);head.append(createElement('span','dvr-pill',statuses[j.status]||j.status));card.append(head);
   card.append(createElement('div','dvr-job-meta',`${j.channelName} • ${fmt(j.startAt)} – ${fmt(j.endAt)}${j.bytes?' • '+fmtBytes(j.bytes):''}`));
   if(j.status==='recording'||j.status==='finalizing'){
    card.append(createElement('small','dvr-running-warning',j.status==='finalizing'?'Đang hoàn thiện MP4; không thoát ứng dụng để tránh lỗi file.':'Đang ghi nền; vẫn có thể xem kênh khác. Không thoát ứng dụng hoặc cho máy ngủ.'));
    const progress=createElement('progress','dvr-job-progress');progress.max=100;progress.value=Math.max(0,Math.min(100,Math.round(100*(Date.now()-j.startAt)/(j.endAt-j.startAt))));card.append(progress);
   }
   if(j.lateMs>1500)card.append(createElement('small','hint','Bắt đầu trễ '+Math.ceil(j.lateMs/1000)+' giây so với lịch.'));
   if(j.error)card.append(createElement('small','dvr-job-error',j.error));
   const buttons=createElement('div','dvr-job-actions');
   if(['scheduled','recording'].includes(j.status)){
    const cancel=createElement('button','btn btn-subtle',j.status==='recording'?'■ Dừng ghi':'Hủy lịch');cancel.type='button';
    cancel.addEventListener('click',async()=>{
     if(!usable()||busy)return;
     if(!confirm(j.status==='recording'?'Dừng ghi ngay? Dữ liệu tạm sẽ được giữ dưới dạng .partial.ts (chưa phải MP4).':'Bạn muốn hủy lịch ghi này?'))return;
     busy=true;cancel.disabled=true;
     try{await api.dvrStop(j.id);notice('Đã gửi yêu cầu dừng/hủy.');await refresh(true);}
     catch(e){notice('Không hủy được: '+e.message,true);}finally{busy=false;cancel.disabled=false;}
    });buttons.append(cancel);
   }
   if(j.file){
    const reveal=createElement('button','btn btn-subtle','Hiển thị file');reveal.type='button';
    reveal.addEventListener('click',async()=>{try{await api.dvrReveal(j.id);}catch(e){notice('Không tìm thấy file: '+e.message,true);}});
    if(api?.dvrReveal)buttons.append(reveal);
    buttons.append(createElement('small','hint','File: '+j.file.split(/[\\/]/).pop()));
   }
   card.append(buttons);box.append(card);
  }
 }
 async function refresh(force=false){
  if(!api?.dvrList)return;
  if(refreshPending){if(!force)return refreshPending;try{await refreshPending;}catch{}}
  const operation=(async()=>{
   try{const list=await api.dvrList();$('dvrDirectory').textContent=list.directory||'Chưa chọn thư mục';$('dvrDirectory').title=list.directory||'';listJobs(list);summarizeQuick(list.jobs);
    if(!loaded){loaded=true;notice('Sẵn sàng đặt lịch ghi. Ứng dụng cần đang mở đúng giờ; chỉ hỗ trợ luồng bạn có quyền ghi.');}
   }catch(e){notice('Không thể tải lịch ghi: '+e.message,true);showQuickStatus('Không tải được trạng thái DVR: '+e.message,'error');}
  })();
  refreshPending=operation;
  try{return await operation;}finally{if(refreshPending===operation)refreshPending=null;}
 }
 function epgTitleFor(channel,start,end){
  if(!channel||!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return '';
  const guide=window.IPTVExtras?.getGuide?.(),find=window.IPTVGuide?.find;
  if(!guide||typeof find!=='function')return '';
  try{
   const matches=find(guide,channel).filter(p=>p?.title&&p.end>start&&p.start<end);
   matches.sort((a,b)=>Math.max(0,Math.min(end,b.end)-Math.max(start,b.start))-Math.max(0,Math.min(end,a.end)-Math.max(start,a.start)));
   return String(matches[0]?.title||'').trim().slice(0,220);
  }catch{return '';}
 }
 async function requestSchedule(c,startAt,endAt,title){
  if(!usable()||busy)return;
  const job={channelId:c.id,channelName:c.name,url:c.url,startAt,endAt,title};
  if(!confirm(`Hẹn ghi chương trình?\n\n${title}\nKênh: ${c.name}\nBắt đầu: ${fmt(startAt)}\nKết thúc: ${fmt(endAt)}\n\nPhải để Open IPTV Pro đang chạy và máy không ngủ. Ghi tối đa 1 chương trình cùng lúc.`))return;
  busy=true;$('dvrAdd').disabled=true;$('dvrQuickSubmit').disabled=true;
  try{const added=await api.dvrCreate(job);notice('Đặt lịch thành công: '+fmt(added.startAt)+' – '+fmt(added.endAt));ctx.toast('Đã lưu lịch ghi hình '+title);await refresh(true);return true;}
  catch(e){notice('Không đặt được lịch: '+e.message,true);ctx.toast('Lịch ghi không hợp lệ: '+e.message,'warn');return false;}
  finally{busy=false;$('dvrAdd').disabled=false;$('dvrQuickSubmit').disabled=false;}
 }
 function scheduleFromEPG(channel,programme){
  if(!channel||!programme)return;
  const now=Date.now(),start=Math.max(now+2500,Number(programme.start)||0),end=Number(programme.end)||0;
  if(end-start<60_000){notice('Chương trình còn dưới 1 phút nên không thể đặt ghi.',true);return;}
  // EPG timestamps are already corrected using the configured timezone offset.
  requestSchedule(channel,start,end,programme.title||channel.name);
 }
 $('dvrQuickToggle').addEventListener('click',()=>{
  if(!usable())return;
  const form=$('dvrQuickForm'),willOpen=form.classList.contains('hidden');
  if(willOpen){quickCurrent();quickDefaults();}
  form.classList.toggle('hidden',!willOpen);$('dvrQuickToggle').setAttribute('aria-expanded',String(willOpen));
 });
 $('dvrQuickManage').addEventListener('click',()=>{
  ctx.setPage('epg');requestAnimationFrame(()=>{const panel=$('dvrPanel');panel?.scrollIntoView({block:'start',behavior:'smooth'});});
 });
 $('dvrQuickForm').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  const channel=quickCurrent();if(!channel){notice('Chọn kênh đang phát trước khi hẹn giờ ghi.',true);ctx.toast('Chọn kênh trước khi hẹn giờ ghi','warn');return;}
  const start=new Date($('dvrQuickStart').value).getTime(),end=new Date($('dvrQuickEnd').value).getTime();
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start){ctx.toast('Giờ kết thúc phải sau giờ bắt đầu','warn');return;}
  if(await requestSchedule(channel,start,end,epgTitleFor(channel,start,end)||channel.name)){
   $('dvrQuickForm').classList.add('hidden');$('dvrQuickToggle').setAttribute('aria-expanded','false');
  }
 });
 $('dvrForm').addEventListener('submit',e=>{
  e.preventDefault();updateChannels();const c=ctx.getChannels().find(c=>c.id===$('dvrChannel').value);
  if(!c){notice('Vui lòng chọn kênh hợp lệ.',true);return;}
  const start=new Date($('dvrStart').value).getTime(),end=new Date($('dvrEnd').value).getTime();
  if(!Number.isFinite(start)||!Number.isFinite(end)){notice('Ngày giờ không hợp lệ.',true);return;}
  const typed=$('dvrTitle').value.trim();requestSchedule(c,start,end,(typed&&typed!==c.name)?typed:(epgTitleFor(c,start,end)||typed||c.name));
 });
 $('dvrChannel').addEventListener('change',()=>{if(!$('dvrTitle').value.trim()){const c=ctx.getChannels().find(x=>x.id===$('dvrChannel').value);$('dvrTitle').value=c?.name||'';}});
 $('dvrChooseDir').addEventListener('click',async()=>{if(!usable()||busy)return;busy=true;try{const dir=await api.dvrChooseDirectory();if(dir){notice('Đã chọn thư mục ghi: '+dir);await refresh(true);}}catch(e){notice('Không chọn được nơi lưu: '+e.message,true);}finally{busy=false;}});
 $('dvrOpenDir').addEventListener('click',async()=>{if(!usable())return;try{const error=await api.dvrOpenDirectory();if(error)notice('Không mở được thư mục: '+error,true);}catch(e){notice('Không mở được thư mục: '+e.message,true);}});
 if(!api?.dvrList){$('dvrAdd').disabled=true;$('dvrChooseDir').disabled=true;$('dvrQuickToggle').disabled=true;$('dvrQuickSubmit').disabled=true;notice('Hẹn giờ ghi hình chỉ hoạt động trên Windows/macOS (Electron).',true);showQuickStatus('DVR không khả dụng (cần chạy ứng dụng desktop)','error');}
 else{updateChannels();setDefaults();quickDefaults();void refresh();setInterval(()=>{if($('page-tv')?.classList.contains('active-page')||$('page-epg')?.classList.contains('active-page')){if($('page-epg')?.classList.contains('active-page'))updateChannels();void refresh();}},5000);}
 window.IPTVDVR=Object.freeze({scheduleFromEPG,onPage:p=>{if(p==='epg'){updateChannels();void refresh();}if(p==='tv'){quickCurrent();void refresh();}}});
})();
