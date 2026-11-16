'use strict';
(()=>{
 const ctx=window.IPTVState,core=window.OpenIPTVDoctorV3,$=id=>document.getElementById(id);
 if(!ctx||!core)return;
 let run=false,stop=false,lastReport=null;
 const $store=()=>ctx.getStore();
 const health=()=>{try{return JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').health||{};}catch{return {};}};
 const undoKey='open-iptv-doctor-v3-undo';
 const say=s=>{$('doctor3Status').textContent=s;};
 function metrics(data){const root=$('doctor3Metrics');root.replaceChildren();const ranked=data.ranked;const counters=[['Tổng kênh',ranked.length],['Đã xác minh gần đây',ranked.filter(x=>x.metric.recentAlive).length],['Chưa đủ bằng chứng',ranked.filter(x=>x.metric.confidence==='insufficient').length],['Đề xuất',data.actions.length]];
  for(const [label,num] of counters){const span=document.createElement('span');span.textContent=label+': '+num;root.append(span);}
 }
 function canChange(){return window.IPTVProAdvanced?.canEdit?.()!==false;}
 function makeRow(name,description,status,cls=''){const row=document.createElement('article');row.className='smart-row';const block=document.createElement('div');const strong=document.createElement('strong');strong.textContent=name;const small=document.createElement('small');small.textContent=description;block.append(strong,small);const pill=document.createElement('span');pill.className='smart-pill '+cls;pill.textContent=status;row.append(block,pill);return row;}
 function render(){const data=core.suggestions(ctx.getChannels(),health());lastReport=data;metrics(data);
  const ranking=$('doctor3Ranking');ranking.replaceChildren();for(const {channel,metric} of data.ranked.slice(0,80)){
   ranking.append(makeRow(channel.name,`${metric.label} · ${metric.sampleCount} mẫu · ${metric.latencyMs===null?'Chưa đo độ trễ':metric.latencyMs+'ms trung bình'} · ${metric.stalls} lần khựng theo nhật ký`,`${metric.score}/100`,metric.recentAlive?'alive':'uncertain'));
  }
  const root=$('doctor3Suggestions');root.replaceChildren();for(const issue of data.actions.slice(0,55)){
   const ch=ctx.getChannels().find(c=>c.id===issue.channelId);if(!ch)continue;
   const target=ctx.getChannels().find(c=>c.id===issue.targetId);
   const row=makeRow(ch.name,issue.reason,issue.kind==='backup'?'Link dự phòng':issue.kind==='recheck'?'Cần kiểm tra':'Metadata');
   if(issue.kind==='backup'&&target){const add=document.createElement('button');add.type='button';add.className='btn btn-subtle';add.textContent='Đề xuất thêm';
    add.onclick=()=>addBackup(ch,target);row.append(add);
   }
   root.append(row);
  }
  if(!data.actions.length)root.textContent='Chưa có đề xuất ưu tiên. Có thể kiểm tra thêm để tăng lượng bằng chứng.';
  $('doctor3Undo').disabled=!localStorage.getItem(undoKey);return data;
 }
 function alternates(){try{return JSON.parse(localStorage.getItem('open-iptv-pro-advanced-v1')||'{}').alternates||{};}catch{return {};}}
 function addBackup(ch,target){if(!canChange())return ctx.toast('Hồ sơ trẻ em không được thay đổi link','warn');
  const check=core.suggestions(ctx.getChannels(),health()).actions.some(i=>i.kind==='backup'&&i.channelId===ch.id&&i.targetId===target.id);
  if(!check||!core.sameChannel(ch,target)||!core.validURL(target.url))return ctx.toast('Đề xuất không còn hợp lệ. Hãy phân tích lại.','warn');
  const previous=alternates()[ch.id]||[];
  if(previous.includes(target.url))return ctx.toast('URL này đã nằm trong dự phòng','warn');
  if(!confirm(`Thêm URL của “${target.name}” làm dự phòng cho “${ch.name}”?\n\nChỉ thêm URL dự phòng. Không thay URL đang phát, không xóa kênh. Có thể hoàn tác.`))return;
  try{const expected=[...new Set([...previous,target.url])].slice(0,15);
   if(typeof window.IPTVProAdvanced?.setAlternates!=='function')throw Error('Không có bộ lưu link dự phòng');
   window.IPTVProAdvanced.setAlternates(ch.id,expected);
   localStorage.setItem(undoKey,JSON.stringify({id:ch.id,previous,expected,at:new Date().toISOString()}));
   ctx.toast('Đã thêm URL dự phòng; có thể hoàn tác');render();}
  catch(e){ctx.toast('Không lưu được URL dự phòng: '+e.message,'error');}
 }
 function undo(){if(!canChange())return ctx.toast('Hồ sơ trẻ em không được thay đổi link','warn');
  let item;try{item=JSON.parse(localStorage.getItem(undoKey)||'null');}catch{}
  if(!item)return ctx.toast('Chưa có thay đổi để hoàn tác','warn');
  const current=alternates()[item.id]||[];if(JSON.stringify(current)!==JSON.stringify(item.expected||[]))return ctx.toast('Danh sách dự phòng đã thay đổi sau lần thêm; không tự ghi đè. Hãy kiểm tra thủ công.','warn');
  if(!confirm('Hoàn tác link dự phòng mà Doctor 3.0 vừa thêm?'))return;
  window.IPTVProAdvanced?.setAlternates?.(item.id,item.previous||[]);localStorage.removeItem(undoKey);render();ctx.toast('Đã hoàn tác link dự phòng');
 }
 async function verify(){
  if(run)return;
  if(!window.streamleaf?.check)return say('Cần ứng dụng desktop để kiểm tra luồng');
  if(!canChange())return ctx.toast('Hồ sơ trẻ em không được kiểm tra nguồn','warn');
  // A full scan has NO channel-count cap. A bounded worker pool limits network
  // pressure; the shorter choices only change how many channels are selected.
  const scope=String($('doctor3Limit').value||'unverified');
  const all=ctx.getChannels().slice();
  const history=health();
  const needsCheck=ch=>!core.grade(ch,history[ch.url]).recentAlive;
  const stale=all.filter(needsCheck).sort((a,b)=>(Date.parse(a.checkedAt||'')||0)-(Date.parse(b.checkedAt||'')||0));
  const limit=scope==='all'||scope==='unverified'?null:Math.min(1000,Math.max(1,Number(scope)||25));
  const candidates=scope==='all'?all:scope==='unverified'?stale:stale.slice(0,limit);
  if(!candidates.length){say(scope==='all'?'Chưa có kênh để kiểm tra.':'Không có kênh cần xác minh trong phạm vi đã chọn.');return;}
  const concurrency=Math.min(4,candidates.length);
  run=true;stop=false;
  $('doctor3Verify').disabled=true;$('doctor3Refresh').disabled=true;$('doctor3Cancel').disabled=false;
  $('doctor3Limit').disabled=true;
  const progress=$('doctor3ProgressBar');if(progress)progress.style.width='0%';
  let cursor=0,done=0,alive=0,dead=0;
  const now=()=>new Date().toISOString();
  let healthErrorReported=false;
  say(`Đang kiểm tra ${candidates.length.toLocaleString('vi-VN')} kênh, ${concurrency} kết nối đồng thời…`);
  function tick(){
   const percent=Math.round(100*done/candidates.length);
   if(progress)progress.style.width=percent+'%';
   say(`Đã kiểm tra ${done.toLocaleString('vi-VN')}/${candidates.length.toLocaleString('vi-VN')} (${percent}%) · Sống ${alive} · Die ${dead} · Chưa rõ ${done-alive-dead}`);
  }
  async function worker(){
   while(!stop){
    const n=cursor++;if(n>=candidates.length)return;
    const ch=candidates[n];let res;
    try{
     const start=Date.now();res=await window.streamleaf.check(ch.url);
     res={...res,latencyMs:Date.now()-start};
    }catch(e){res={status:'uncertain',reason:'Lỗi kiểm tra: '+(e?.message||String(e))};}
    // Cancellation prevents starting another check but keeps completed results.
    // Do not overwrite a channel which was deleted/refreshed during a scan.
    if(!ctx.getChannels().includes(ch)){done++;if(done%5===0||done===candidates.length||stop)tick();continue;}
    const positive=res.status==='alive'&&res.positiveEvidence===true;
    const confirmedDead=res.status==='dead'&&res.confirmedDead===true;
    ch.status=positive?'alive':confirmedDead?'dead':'uncertain';
    ch.checkedAt=now();ch.reason=res.reason||'Không đủ bằng chứng xác minh video';
    try{window.IPTVProAdvanced?.onCheck?.(ch,{...res,status:ch.status,positiveEvidence:positive,confirmedDead});}
    catch(e){if(!healthErrorReported){healthErrorReported=true;ctx.toast('Không lưu được nhật ký Doctor: '+(e.message||e),'warn');}}
    if(ch.status==='alive')alive++;else if(ch.status==='dead')dead++;
    done++;
    if(done%5===0||done===candidates.length||stop){ctx.save();tick();}
    if(done%25===0)await new Promise(resolve=>setTimeout(resolve,0));
   }
  }
  try{
   await Promise.all(Array.from({length:concurrency},worker));
   ctx.save();ctx.renderList(true);
   tick();
   say(stop?`Đã hủy sau ${done}/${candidates.length} kênh; giữ kết quả đã hoàn tất.`:`Hoàn tất ${done} kênh: ${alive} Sống, ${dead} Die, ${done-alive-dead} Chưa rõ. Không thay URL.`);
   render();
  }catch(e){ctx.save();say('Tác vụ kiểm tra bị gián đoạn: '+(e.message||e));}
  finally{run=false;$('doctor3Verify').disabled=false;$('doctor3Refresh').disabled=false;$('doctor3Cancel').disabled=true;$('doctor3Limit').disabled=false;}
 }
 function exportReport(){const data=core.suggestions(ctx.getChannels(),health());
  const clean=data.ranked.map(x=>({channelId:x.channel.id,name:x.channel.name,metric:x.metric}));
  const report={schema:'doctor-3.0',generatedAt:new Date().toISOString(),note:'Điểm là thứ hạng heuristic, không phải phần trăm thời gian sống; không sửa kênh tự động',ranked:clean,actions:data.actions};
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='open-iptv-doctor-v3.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 $('doctor3Refresh').onclick=()=>{render();say('Đã phân tích lịch sử kiểm tra và bằng chứng phát. Không sửa dữ liệu nguồn.');};
 $('doctor3Verify').onclick=verify;
 $('doctor3Cancel').onclick=()=>{stop=true;say('Đang hủy sau khi các yêu cầu đang chạy kết thúc…');};
 $('doctor3Export').onclick=exportReport;
 $('doctor3Undo').onclick=undo;
 $('doctorRun').addEventListener('click',()=>{render();say('Đã cập nhật Doctor 3.0 cùng Doctor 2.0.');});
 window.IPTVDoctor3=Object.freeze({analyze:render,verify});
 render();
})();
