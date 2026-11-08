'use strict';
/* Opt-in local visual analysis: compares stored snapshots. Does not upload or
 * automatically merge channels based on one frame. */
(()=>{
 const ctx=window.IPTVState,core=window.OpenIPTVDoctorV2;
 const $=id=>document.getElementById(id);
 const channels=()=>ctx.getChannels();
 const settingsKey='open-iptv-doctor-v2-settings';
 const undoKey='open-iptv-doctor-v2-undo';
 let config={freezeMonitor:true,autoFailoverOnFreeze:false,maxSnapshots:400};
 try{config={...config,...JSON.parse(localStorage.getItem(settingsKey)||'{}')}}catch{}
 const saveSettings=()=>localStorage.setItem(settingsKey,JSON.stringify(config));
 const btn=$('doctorVisualScan'),info=$('doctorVisualStatus'),root=$('doctorVisualMatches');
 let matches=[],report=null,running=false;
 const safe=val=>String(val??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function imageFeature(s){
  const src=s?.data||((s?.file&&window.__snapshotBase)?window.__snapshotBase+encodeURIComponent(s.file):'');
  if(!src)return null;
  const img=new Image();img.crossOrigin='anonymous';img.decoding='async';img.src=src;
  await Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Hết thời gian đọc ảnh')),6000))]);
  const canvas=document.createElement('canvas');canvas.width=90;canvas.height=80;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(img,0,0,90,80);
  const d=context.getImageData(0,0,90,80);return core.features(d.data,90,80);
 }
 function hasOwnProperty(obj,key){return Object.prototype.hasOwnProperty.call(obj,key);}
 function renderMatches(){
  root.replaceChildren();if(!matches.length){root.textContent='Chưa tìm thấy cặp Snapshot giống nhau đủ rõ. Có thể chụp thêm ảnh rồi thử lại.';return;}
  for(const m of matches.slice(0,75)){
   const row=document.createElement('article');row.className='doctor-v2-match';
   row.innerHTML=`<div><strong>${safe(m.aName)} ↔ ${safe(m.bName)}</strong><small>${safe(m.reason)}</small><small>Khoảng cách hình ${m.visualDistance}/64 · Sai khác màu ${m.colorDistance}</small></div><span class="doctor-v2-score">${m.score}/100</span>`;
   const a=channels().find(c=>c.id===m.a),b=channels().find(c=>c.id===m.b);
   if(m.metadataMatch && a&&b&&b.status==='alive'&&b.checkedAt&&Date.now()-Date.parse(b.checkedAt)<86400000&&a.url!==b.url){
    const add=document.createElement('button');add.type='button';add.className='btn btn-subtle';add.textContent='Đề xuất URL dự phòng';
    add.onclick=()=>offerBackup(a,b);row.append(add);
   }
   root.append(row);
  }
  if(matches.length>75){const p=document.createElement('p');p.className='hint';p.textContent=`Đang hiển thị 75/${matches.length} gợi ý có điểm cao nhất.`;root.append(p);}
 }
 function saveUndo(data){localStorage.setItem(undoKey,JSON.stringify(data));}
 function offerBackup(a,b){
  if(!confirm(`Đề xuất thêm link của “${b.name}” làm dự phòng cho “${a.name}”?\n\nHai ảnh có thể giống nhau vì đang phát cùng nội dung. Link sẽ CHỈ được thêm nếu kênh nguồn đã được xác minh Sống; không xóa/gộp kênh và không thay link chính.`))return;
  const alts=ctx.getStore().alternates||{};
  const old=Array.isArray(alts[a.id])?[...alts[a.id]]:[];
  saveUndo({kind:'backup',id:a.id,previous:old,createdAt:new Date().toISOString()});
  const next=[...new Set([...old,b.url])].filter(x=>x!==a.url).slice(0,15);
  window.IPTVProAdvanced?.setAlternates?.(a.id,next);ctx.toast('Đã thêm dự phòng; có thể Hoàn tác trong Doctor 2.0');
 }
 function restore(){let data;try{data=JSON.parse(localStorage.getItem(undoKey)||'null')}catch{}
  if(!data)return ctx.toast('Chưa có thao tác để hoàn tác','warn');
  if(!confirm('Khôi phục thay đổi gần nhất của Doctor 2.0?'))return;
  if(data.kind==='backup')window.IPTVProAdvanced?.setAlternates?.(data.id,data.previous||[]);
  else if(data.kind==='review-status'){const c=ctx.getStore().channels.find(c=>c.id===data.id);if(c){c.status=data.previous;ctx.save();ctx.renderList(true);}}
  localStorage.removeItem(undoKey);ctx.toast('Đã hoàn tác thay đổi của Doctor 2.0');
 }
 async function scan(){if(running)return;running=true;btn.disabled=true;root.textContent='Đang tính dấu vân tay hình ảnh…';
  try{
   const existing=channels().filter(c=>ctx.getStore().snapshots[c.url]);
   const max=Math.min(600,Math.max(25,Number(config.maxSnapshots)||400));const selected=existing.slice(0,max);
   if(!selected.length){info.textContent='Không có Snapshot. Hãy vào Ảnh chụp kênh để chụp trước.';root.replaceChildren();return;}
   let index=0,ok=0,skipped=0;const images=[];
   async function worker(){while(index<selected.length){const c=selected[index++];try{
    const feature=await imageFeature(ctx.getStore().snapshots[c.url]);if(feature?.useful){images.push({channel:c,feature});ok++;}else skipped++;
   }catch{skipped++;}const done=ok+skipped;if(done%8===0||done===selected.length){info.textContent=`Đọc ${done}/${selected.length} ảnh · ${ok} ảnh đủ chi tiết · ${skipped} bỏ qua`;await new Promise(r=>setTimeout(r,0));}}}
   await Promise.all(Array.from({length:Math.min(4,selected.length)},worker));
   matches=core.visualMatches(images,200);renderMatches();
   info.textContent=`${matches.length} cặp cần xem lại từ ${ok} ảnh; ${skipped} ảnh đen/trơn/lỗi bị bỏ qua.${existing.length>max?' Chỉ quét '+max+'/'+existing.length+' ảnh trong lượt này.':''} Không tự gộp.`;
   report=core.recommendations(channels(),loadHealth(),matches);
   renderSuggestions();
  }finally{running=false;btn.disabled=false;}
 }
 function loadHealth(){try{return JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').health||{}}catch{return {};}}
 function renderSuggestions(){
  const div=$('doctorV2Suggestions');div.replaceChildren();const issues=report||core.recommendations(channels(),loadHealth(),matches);
  $('doctorV2Summary').textContent=`${issues.length} đề xuất (không áp dụng tự động). Điểm là độ ưu tiên xem xét, không phải chứng nhận kênh trùng.`;
  for(const i of issues.slice(0,70)){
   const row=document.createElement('div');row.className='doctor-v2-suggestion';
   row.innerHTML=`<div><strong>${safe(i.name)}</strong><small>${safe(i.action)} · ${safe(i.reason)}</small></div><span class="doctor-v2-score">${i.score}/100</span>`;
   if(i.type==='false-dead'){
    const b=document.createElement('button');b.className='btn btn-subtle';b.textContent='Đưa về Chưa rõ';
    b.onclick=()=>{const c=ctx.getStore().channels.find(c=>c.id===i.channelId);if(!c)return;if(!confirm(`Chuyển trạng thái ${c.name} từ Die về Chưa rõ để kiểm tra lại?`))return;saveUndo({kind:'review-status',id:c.id,previous:c.status});c.status='uncertain';ctx.save();ctx.renderList(true);ctx.toast('Đã đổi sang Chưa rõ, chưa xác nhận Sống');report=null;renderSuggestions();};row.append(b);
   }div.append(row);
  }
 }
 function exportReport(){const payload={schema:'doctor-2.0',at:new Date().toISOString(),note:'Chỉ đề xuất; không tự nhận diện/gộp kênh',visualMatches:matches,issues:report||core.recommendations(channels(),loadHealth(),matches)};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='open-iptv-doctor-v2-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1800);
 }
 $('doctorVisualScan').onclick=scan;
 $('doctorV2Undo').onclick=restore;
 $('doctorRun').addEventListener('click',()=>{report=core.recommendations(channels(),loadHealth(),matches);renderSuggestions();});
 window.IPTVDoctor2=Object.freeze({exportReport,refreshSuggestions:()=>{report=core.recommendations(channels(),loadHealth(),matches);renderSuggestions();}});
 $('doctorVisualMax').value=String(config.maxSnapshots);
 $('doctorVisualMax').onchange=e=>{config.maxSnapshots=Math.min(600,Math.max(25,Number(e.target.value)||400));saveSettings();};
 $('freezeAutoFailover').checked=!!config.autoFailoverOnFreeze;
 $('freezeAutoFailover').onchange=e=>{config.autoFailoverOnFreeze=e.target.checked;saveSettings();};
 $('freezeMonitorEnabled').checked=config.freezeMonitor!==false;
 $('freezeMonitorEnabled').onchange=e=>{config.freezeMonitor=e.target.checked;saveSettings();freeze.reset();$('freezeMonitorStatus').textContent=config.freezeMonitor?'Đang giám sát kênh đang phát':'Đã tắt giám sát';};
 // Monitor only the main, currently playing video. No 32-stream frame analysis.
 const freeze=core.createFreezeDetector();let lastChannelId='',lastAlert=0,lastReportState='',canvas=document.createElement('canvas');canvas.width=90;canvas.height=80;
 const context=canvas.getContext('2d',{willReadFrequently:true});
 const freezeStatus=$('freezeMonitorStatus');
 async function checkFreeze(){
  const c=ctx.getCurrent(),v=ctx.player;
  if(c?.id!==lastChannelId){freeze.reset();lastChannelId=c?.id||'';lastReportState='';}
  if(!config.freezeMonitor||!c||v.paused||v.readyState<2||!v.videoWidth||ctx.getPlayMode?.()!=='live'){freeze.reset();return;}
  let f;try{context.drawImage(v,0,0,90,80);f=core.features(context.getImageData(0,0,90,80).data,90,80);}catch{freezeStatus.textContent='Không đọc được ảnh video (luồng/CORS), vẫn có thể dùng kiểm tra link';return;}
  const quality=v.getVideoPlaybackQuality?.();const outcome=freeze.feed({now:Date.now(),mediaTime:v.currentTime,decodedFrames:quality?.totalVideoFrames,frame:f,paused:v.paused,ready:true});
  if(outcome.state==='healthy'){if(lastReportState!=='healthy')freezeStatus.textContent='Khung hình có chuyển động; chưa phát hiện lỗi';lastReportState='healthy';return;}
  if(['black-warning','freeze-confirmed','freeze-suspected'].includes(outcome.state)){
   freezeStatus.textContent=(outcome.state==='freeze-confirmed'?'Cảnh báo đứng hình':outcome.state==='black-warning'?'Cảnh báo màn hình tối':'Nghi khung hình tĩnh')+': '+outcome.reason;
   if(outcome.state!==lastReportState&&Date.now()-lastAlert>60000){
    lastAlert=Date.now();window.IPTVProAdvanced?.recordHealth?.(c,{type:'freeze',status:'uncertain',reason:outcome.reason,level:outcome.state});
    if(outcome.state==='freeze-confirmed'){ctx.toast('Kênh nghi đứng hình: '+c.name+'; kiểm tra link dự phòng nếu lỗi kéo dài','warn');if(config.autoFailoverOnFreeze){const did=ctx.tryNextLink?.();if(did)freezeStatus.textContent='Đang thử link dự phòng sau khi xác nhận đứng hình';}}
   }
  }
  lastReportState=outcome.state;
 }
 setInterval(checkFreeze,3000);
 window.IPTVDoctorV2UI={scan,restore,renderSuggestions};
})();
