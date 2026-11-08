'use strict';
/* Backup / Restore: renderer supplies only namespaced localStorage values.
 * Electron main owns file dialogs and snapshot-file access. */
(()=>{
 const ctx=window.IPTVState,api=window.streamleaf;
 const $=id=>document.getElementById(id);
 const exportBtn=$('backupExportBtn'),importBtn=$('backupImportBtn'),status=$('backupStatus');
 if(!exportBtn||!importBtn||!status)return;
 const owned=k=>k.startsWith('open-iptv-pro-')||k.startsWith('open-iptv-doctor-v2-')||k==='streamleaf-3';
 const collect=()=>{
  const entries=[];
  for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i);if(k&&owned(k))entries.push([k,localStorage.getItem(k)]);
  }
  return Object.fromEntries(entries);
 };
 const busy=s=>{exportBtn.disabled=s;importBtn.disabled=s;};
 const message=(s,isError=false)=>{status.textContent=s;status.classList.toggle('backup-error',isError);};
 const canRun=()=>{
  if(window.IPTVProAdvanced?.canEdit?.()===false){message('Hồ sơ trẻ em không có quyền Backup / Restore.',true);return false;}
  const checkRunning=ctx?.isBusy?.();
  // Snapshot/channel check tasks can update persistent data while restore runs.
  if(checkRunning){message('Hãy hủy tác vụ đang chạy trước khi khôi phục.',true);return false;}
  return true;
 };
 if(!api?.backupExport||!api?.backupInspect||!api?.backupRestore){
  busy(true);message('Backup / Restore chỉ dùng trong ứng dụng Windows hoặc macOS.');return;
 }
 function format(bytes){return (bytes/(1024*1024)).toFixed(1)+' MB';}
 exportBtn.addEventListener('click',async()=>{
  if(!canRun())return;
  busy(true);message('Đang chuẩn bị bản sao lưu…');
  try{
   ctx.save();
   const result=await api.backupExport(collect(),$('backupIncludeSnapshots').checked);
   if(result.canceled){message('Đã hủy thao tác sao lưu.');return;}
   message(`Đã sao lưu ${result.sourceCount} nguồn, ${result.channelCount} kênh, ${result.images} ảnh (${format(result.bytes)}).${result.missingImages?' Bỏ qua '+result.missingImages+' ảnh không còn trên máy.':''}`);
   ctx.toast('Đã tạo bản sao lưu thành công');
  }catch(e){message('Không sao lưu được: '+e.message,true);ctx.toast('Sao lưu thất bại: '+e.message,'error');}
  finally{busy(false);}
 });
 importBtn.addEventListener('click',async()=>{
  if(!canRun())return;
  busy(true);message('Đang kiểm tra file sao lưu…');
  let finishToken=null;
  try{
   const preview=await api.backupInspect();
   if(preview.canceled){message('Đã hủy chọn file.');return;}
   const time=preview.createdAt?new Date(preview.createdAt).toLocaleString():'Không rõ';
   message(`Đã kiểm tra: ${preview.sourceCount} nguồn, ${preview.channelCount} kênh, ${preview.images} ảnh • ${format(preview.bytes)}.`);
   if(!confirm(`KHÔI PHỤC DỮ LIỆU OPEN IPTV PRO?\n\nNgày sao lưu: ${time}\nPhiên bản: ${preview.appVersion||'Không rõ'}\nNguồn: ${preview.sourceCount} | Kênh: ${preview.channelCount} | Ảnh Snapshot: ${preview.images}\n\nToàn bộ playlist, kênh yêu thích, hồ sơ, thiết lập và dữ liệu hiện tại sẽ bị THAY THẾ.\n\nHãy sao lưu dữ liệu hiện tại trước khi tiếp tục.\n\nBạn đồng ý khôi phục và khởi động lại giao diện?`)){
    message('Đã hủy khôi phục, dữ liệu hiện tại không thay đổi.');return;
   }
   message('Đang nhập ảnh Snapshot và dữ liệu…');
   const restored=await api.backupRestore(preview.token);
   finishToken=restored.finishToken;
   const previous=collect();
   window.__openIPTVRestoringBackup=true; // Prevent beforeunload/pending autosaves from overwriting restored data.
   try{
    for(const k of Object.keys(previous))localStorage.removeItem(k);
    for(const [k,v] of Object.entries(restored.storage)){
     if(!owned(k)||typeof v!=='string')throw Error('Khóa cài đặt không hợp lệ.');
     localStorage.setItem(k,v);
    }
    const committed=await api.backupFinish(finishToken,true);
    if(!committed)throw Error('Không thể xác nhận dữ liệu đã khôi phục.');
    finishToken=null;
    message('Khôi phục thành công. Đang tải lại giao diện…');
    window.location.reload();
   }catch(e){
    for(const k of Object.keys(collect()))localStorage.removeItem(k);
    for(const [k,v] of Object.entries(previous))localStorage.setItem(k,v);
    window.__openIPTVRestoringBackup=false;
    throw e;
   }
  }catch(e){
   if(finishToken)await api.backupFinish(finishToken,false).catch(()=>{});
   message('Không thể khôi phục: '+e.message,true);
   ctx.toast('Khôi phục thất bại; đã giữ lại dữ liệu trước đó','error');
  }finally{busy(false);}
 });
 $('backupNav')?.addEventListener('click',()=>{
  ctx.setPage('settings');
  $('backupSettings')?.scrollIntoView({block:'start',behavior:'smooth'});
 });
})();
