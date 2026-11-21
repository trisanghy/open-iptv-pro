'use strict';
/* Shared GPU capability / benchmark / cache-management UI for Rust Lab + Electron.
 * GPU encoder benchmark is NOT optical-flow or AI super-resolution performance.
 * The player remains the same; we never download executable code from arbitrary URLs.
 */
(function(root,make){
 const api=make();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(!root?.document)return;
 const doc=root.document;
 const byId=id=>doc.getElementById(id);
 const fmt=n=>n>=1073741824?(n/1073741824).toFixed(2)+' GB':n>=1048576?(n/1048576).toFixed(1)+' MB':(n/1024).toFixed(0)+' KB';
 function init(){
  const panel=byId('videoEnhancePanel');
  if(!panel||byId('videoGpuManager'))return;
  const body=panel.querySelector('.veh-body');
  if(!body)return;
  const box=doc.createElement('section');
  box.id='videoGpuManager';box.className='veh-gpu-card';
  box.innerHTML='<strong>GPU · Tăng tốc video và cấu hình đề xuất</strong>'+
    '<p id="veh-gpu-state" role="status">Chưa kiểm tra phần cứng</p>'+
    '<div class="veh-gpu-actions"><button type="button" id="veh-gpu-check">Kiểm tra & chuẩn bị GPU</button>'+
    '<button type="button" id="veh-gpu-bench">Benchmark GPU thực tế</button></div>'+
    '<p class="veh-gpu-note">Đo mã hóa H.264 bằng GPU, không phải AI nâng độ phân giải hoặc nội suy khung hình. FFmpeg có sẵn trong bản cài; driver GPU được quản lý bởi hệ điều hành.</p>'+
    '<details id="veh-gpu-storage"><summary>Quản lý dung lượng thành phần video AI</summary>'+
    '<p class="veh-gpu-note">Chỉ xóa tài nguyên video trong bộ nhớ riêng của ứng dụng; không ảnh hưởng kênh, phụ đề hoặc giọng đọc.</p>'+
    '<div id="veh-gpu-items"></div><button type="button" id="veh-gpu-refresh">Cập nhật dung lượng</button></details>';
  body.appendChild(box);
  const modal=doc.createElement('dialog');modal.id='veh-gpu-recommend';modal.className='veh-gpu-modal';
  modal.innerHTML='<h3>Đề xuất cấu hình video</h3><p id="veh-gpu-result"></p>'+
   '<p class="veh-gpu-note">Kết quả chỉ đánh giá GPU mã hóa video. AI Upscale và GPU Frame Interpolation chưa được xác minh.</p>'+
   '<div class="veh-gpu-actions"><button type="button" id="veh-gpu-save">Lưu đề xuất</button><button type="button" id="veh-gpu-close">Đóng</button></div>';
  doc.body.appendChild(modal);
  let last=null,running=false;
  const status=t=>{byId('veh-gpu-state').textContent=String(t);};
  async function prepare(){
   if(!root.streamleaf?.videoGpuPrepare){status('Bản ứng dụng chưa tích hợp backend GPU.');return;}
   const info=await root.streamleaf.videoGpuPrepare();
   status(info.ready?'Đã chuẩn bị FFmpeg có sẵn · '+info.platform+' · '+(info.backends?.join(', ')||'Chưa có GPU encoder hợp lệ'):info.message||'Chưa có GPU backend');
   return info;
  }
  async function refresh(){
   const target=byId('veh-gpu-items');
   target.replaceChildren();
   if(!root.streamleaf?.videoGpuStorage){target.textContent='Chưa hỗ trợ kiểm tra dung lượng.';return;}
   try{
    const report=await root.streamleaf.videoGpuStorage();
    const total=doc.createElement('p');total.textContent='Đã sử dụng: '+fmt(report.totalBytes||0);target.appendChild(total);
    for(const item of report.items||[]){
     const row=doc.createElement('div');row.className='veh-gpu-storage-row';
     const label=doc.createElement('span');label.textContent=item.label+' · '+fmt(item.bytes||0);row.appendChild(label);
     if(item.bytes>0){
      const del=doc.createElement('button');del.type='button';del.textContent='Xóa';
      del.addEventListener('click',async()=>{
       if(!root.confirm('Xóa '+item.label+' ('+fmt(item.bytes)+')? Chỉ dữ liệu video AI được quản lý mới bị xóa.'))return;
       del.disabled=true;
       try{await root.streamleaf.videoGpuDelete(item.id);await refresh();status('Đã xóa bộ đệm '+item.label);}
       catch(e){status('Không thể xóa: '+String(e?.message||e).slice(0,120));del.disabled=false;}
      });row.appendChild(del);
     }target.appendChild(row);
    }
   }catch(e){target.textContent='Không kiểm tra được dung lượng: '+String(e?.message||e).slice(0,140);}
  }
  byId('veh-gpu-check').addEventListener('click',()=>prepare().catch(e=>status('Không chuẩn bị được GPU: '+String(e?.message||e))));
  byId('veh-gpu-refresh').addEventListener('click',refresh);
  byId('veh-gpu-storage').addEventListener('toggle',()=>{if(byId('veh-gpu-storage').open)void refresh();});
  byId('veh-gpu-bench').addEventListener('click',async()=>{
   if(running)return;
   if(!root.streamleaf?.videoGpuBenchmark){status('Chưa có backend benchmark GPU.');return;}
   running=true;byId('veh-gpu-bench').disabled=true;status('Đang kiểm tra GPU bằng FFmpeg phần cứng, không đo AI...');
   try{
    const data=await root.streamleaf.videoGpuBenchmark();
    last=api.recommend(data);
    status(data.available?'Đã đo GPU '+data.encoder+' thành công.':'Không có GPU encoder chạy được; phát video gốc.');
    const details=byId('veh-gpu-result');
    details.textContent='Backend: '+(data.encoder||'Không khả dụng')+
       '\n720p: '+api.rate(data.tests?.p720)+' · 1080p: '+api.rate(data.tests?.p1080)+
       '\nKhuyến nghị: '+last.label+(last.active?' (chỉ cho mã hóa GPU)':'');
    if(typeof modal.showModal==='function')modal.showModal();else modal.setAttribute('open','');
   }catch(e){status('Benchmark GPU thất bại: '+String(e?.message||e).slice(0,140));}
   finally{running=false;byId('veh-gpu-bench').disabled=false;}
  });
  byId('veh-gpu-save').addEventListener('click',()=>{
   if(!last)return;
   try{root.localStorage?.setItem('openiptv:gpu-video-recommendation-v1',JSON.stringify(last));}catch{}
   status('Đã lưu khuyến nghị '+last.label+'. Chưa tự bật AI hoặc thay đổi luồng phát.');
   modal.close?.();modal.removeAttribute('open');
  });
  byId('veh-gpu-close').addEventListener('click',()=>{modal.close?.();modal.removeAttribute('open');});
  // Probe once when the enhancement panel opens; do not auto-download unverified models.
  let seen=false;
  const observer=new MutationObserver(()=>{
   if(!panel.hidden&&!seen){seen=true;void prepare().catch(e=>status('Lỗi GPU: '+String(e?.message||e)));}
  });
  observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
  if(!panel.hidden){seen=true;void prepare().catch(()=>{});}
 }
 doc.addEventListener('openiptv:renderer-ready',init);
 doc.addEventListener('openiptv:unified-ai-ready',init);
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof window!=='undefined'?window:null,function(){
 function rate(t){return t?.ok?Math.round(t.processingFps)+' FPS mã hóa':'Không đạt';}
 function recommend(data){
  const x=data?.tests||{};
  if(!data?.available)return {active:false,resolution:0,fps:0,label:'Giữ video gốc (không có GPU encoder đã xác minh)'};
  if(x.p1080?.ok&&x.p1080.processingFps>=42)return {active:true,resolution:1080,fps:30,label:'1080p / 30 FPS'};
  if(x.p720?.ok&&x.p720.processingFps>=78)return {active:true,resolution:720,fps:60,label:'720p / 60 FPS'};
  if(x.p720?.ok&&x.p720.processingFps>=39)return {active:true,resolution:720,fps:30,label:'720p / 30 FPS'};
  return {active:false,resolution:0,fps:0,label:'Giữ video gốc (GPU chưa đủ nhanh)'};
 }
 return {rate,recommend};
});
