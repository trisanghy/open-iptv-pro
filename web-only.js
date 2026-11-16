'use strict';
/* Open IPTV Pro Web — browser-only backup and environment labels.
 * Keep window.streamleaf undefined so the WebView frontend uses its native
 * browser player, M3U importer and HTTPS/CORS-aware network code. */
(() => {
  if (window.streamleaf) return;
  const $ = id => document.getElementById(id);
  if ($('appMode')) $('appMode').textContent = 'Web Online · GitHub Pages';
  if ($('miniStatus')) $('miniStatus').textContent = 'HLS/DASH · nguồn cần HTTPS/CORS';
  const version = document.querySelector('.brand .version');
  if (version) version.textContent = '4.23.38 Web';
  const tag = document.createElement('span');
  tag.className = 'web-edition-tag';
  tag.textContent = 'WEB ONLINE';
  tag.title = 'Chỉ dùng trình duyệt; một số luồng không hỗ trợ CORS/HTTPS';
  document.querySelector('.top-actions')?.prepend(tag);

  const exportBtn=$('backupExportBtn'),importBtn=$('backupImportBtn'),status=$('backupStatus');
  if (!exportBtn || !importBtn || !status) return;
  exportBtn.disabled=false; importBtn.disabled=false;
  exportBtn.textContent='⇩ Xuất Backup JSON';
  importBtn.textContent='↶ Nhập Backup JSON';
  status.textContent='Dữ liệu nằm trên trình duyệt này. File sao lưu không được tải lên GitHub.';
  const isOwned=k=>k==='streamleaf-3'||/^(?:open-iptv-pro-|open-iptv-doctor-v[23]-)/.test(k);
  const message=(text,bad=false)=>{status.textContent=text;status.classList.toggle('backup-error',bad);};
  const locked=()=>{
    if(window.IPTVProAdvanced?.canEdit?.()===false){message('Hồ sơ trẻ em không được Backup/Restore.',true);return true;}
    if(window.IPTVState?.isBusy?.()){message('Hãy hoàn tất tác vụ đang chạy trước.',true);return true;}
    return false;
  };
  function capture(includeSnapshots=true){
    const values={};
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&isOwned(k))values[k]=localStorage.getItem(k);}
    if(!includeSnapshots && typeof values['open-iptv-pro-4']==='string'){
      const state=JSON.parse(values['open-iptv-pro-4']);
      if(state&&typeof state==='object'&&!Array.isArray(state)){
        state.snapshots={};values['open-iptv-pro-4']=JSON.stringify(state);
      }
    }
    return values;
  }
  function download(name,content){
    const uri=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a');a.href=uri;a.download=name;document.body.append(a);
    a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),2500);
  }
  exportBtn.addEventListener('click',()=>{
    if(locked())return;
    try{
      window.IPTVState?.save?.();
      const data={format:'open-iptv-pro-web-backup',schema:1,appVersion:'4.23.38',
        createdAt:new Date().toISOString(),storage:capture($('backupIncludeSnapshots')?.checked!==false)};
      const body=JSON.stringify(data);
      download('Open-IPTV-Pro-Web-'+new Date().toISOString().slice(0,10)+'.json',body);
      message('Đã tải Backup JSON ('+(new Blob([body]).size/1024).toFixed(0)+' KB). File có thể chứa URL hoặc PIN, hãy cất riêng.');
      window.IPTVState?.toast?.('Đã xuất Backup JSON');
    }catch(err){message('Sao lưu thất bại: '+err.message,true);}
  });
  const picker=document.createElement('input');
  picker.type='file';picker.accept='.json,application/json';picker.hidden=true;
  document.body.append(picker);
  importBtn.addEventListener('click',()=>{if(!locked())picker.click();});
  picker.addEventListener('change',async()=>{
    const file=picker.files?.[0];picker.value='';
    if(!file)return;
    if(file.size>20*1024*1024){message('File lớn hơn 20 MB, không thể khôi phục.',true);return;}
    let previous=null;
    try{
      const parsed=JSON.parse(await file.text());
      const store=parsed?.format==='open-iptv-pro-web-backup'&&parsed.schema===1?parsed.storage:null;
      if(!store||Array.isArray(store)||typeof store!=='object')throw Error('Chỉ hỗ trợ Backup JSON Web đã xuất. File .iptvbackup desktop chưa tương thích.');
      const entries=Object.entries(store);
      if(!entries.length||entries.length>120||entries.some(([k,v])=>!isOwned(k)||typeof v!=='string'))throw Error('Khóa dữ liệu không hợp lệ.');
      for(const [k,v] of entries){
        if(v.length>16*1024*1024)throw Error('Dữ liệu quá lớn.');
        if(k==='open-iptv-pro-4')JSON.parse(v);
      }
      if(!confirm('Khôi phục '+entries.length+' mục từ '+(parsed.createdAt||'file')+'? Dữ liệu IPTV, yêu thích và cài đặt hiện tại sẽ bị thay thế. Hãy sao lưu dữ liệu cũ trước khi tiếp tục.')){message('Đã hủy khôi phục.');return;}
      if(locked())return;
      previous=capture();
      window.__openIPTVRestoringBackup=true;
      for(const k of Object.keys(previous))localStorage.removeItem(k);
      for(const [k,v] of entries)localStorage.setItem(k,v);
      message('Khôi phục thành công, đang tải lại giao diện…');
      location.reload();
    }catch(err){
      if(previous){try{
        for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&isOwned(k))localStorage.removeItem(k);}
        for(const [k,v] of Object.entries(previous))localStorage.setItem(k,v);
      }catch(_){}}
      window.__openIPTVRestoringBackup=false;
      message('Khôi phục thất bại: '+err.message,true);
    }
  });
})();
