'use strict';
/* Positron Library Pulse: read-only, local metadata analysis.
 * Never fetch playlists, stream URLs, images or trigger playback.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PositronLibraryPulseCore=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const clean=v=>String(v??'').trim();
 function summarize(input){
  const channels=(Array.isArray(input)?input:[]).filter(c=>c&&typeof c==='object');
  const groups=new Map(),sources=new Map();
  let logoMeta=0,epgId=0,alive=0,dead=0;
  for(const c of channels){
   const group=clean(c.group||c.groupTitle)||'Chưa phân nhóm';
   const source=clean(c.sourceId);
   groups.set(group,(groups.get(group)||0)+1);
   if(source)sources.set(source,(sources.get(source)||0)+1);
   if(clean(c.logo))logoMeta++;
   if(clean(c.tvgId))epgId++;
   if(c.status==='alive')alive++;
   if(c.status==='dead')dead++;
  }
  const sort=(map)=>[...map].map(([name,count])=>({name,count}))
   .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'vi'));
  return {total:channels.length,sources:sources.size,groups:groups.size,
   withLogoMeta:logoMeta,withEpgId:epgId,knownAlive:alive,knownDead:dead,
   groupBreakdown:sort(groups),sourceBreakdown:sort(sources)};
 }
 function pageGroups(groups,limit=5){
  const values=Array.isArray(groups)?groups:[];
  const size=Number.isFinite(limit)?Math.max(0,Math.floor(limit)):5;
  return {rows:values.slice(0,size),remaining:Math.max(0,values.length-size)};
 }
 const fold=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLocaleLowerCase('vi');
 // P5.1.158: liệt kê kênh thiếu logo bằng metadata đã có, không tải ảnh/mạng.
 function missingLogoGroups(input){
  const groups=new Map();
  for(const c of Array.isArray(input)?input:[]){
   if(!c||typeof c!=='object'||!clean(c.name)||clean(c.logo))continue;
   const group=clean(c.group||c.groupTitle)||'Chưa phân nhóm';
   groups.set(group,(groups.get(group)||0)+1);
  }
  return [...groups].map(([name,count])=>({name,count}))
   .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'vi'));
 }
 // Đến trang N: chặn vượt biên, giữ trang hiện tại nếu dữ liệu nhập không hợp lệ.
 function missingPage(value,totalPages,current=1){
  const total=Number.isFinite(Number(totalPages))?Math.max(1,Math.floor(Number(totalPages))):1;
  const fallback=Math.max(1,Math.min(total,Math.floor(Number(current)||1)));
  const requested=String(value??'').trim();
  if(!/^\d+$/.test(requested))return fallback;
  const number=Number(requested);
  if(!Number.isSafeInteger(number))return fallback;
  return Math.max(1,Math.min(total,number));
 }
 function selectMissingLogoChannels(input,{query='',group='',sort='playlist'}={}){
  const terms=fold(query).split(/\s+/).filter(Boolean);
  const rows=(Array.isArray(input)?input:[]).filter(c=>c&&typeof c==='object'&&
   clean(c.name)&&!clean(c.logo)&&
   (!clean(group)||(clean(c.group||c.groupTitle)||'Chưa phân nhóm')===clean(group))&&
   terms.every(term=>fold(clean(c.name)+' '+clean(c.group||c.groupTitle)).includes(term)));
  // Chỉ sắp xếp bản sao danh sách đã lọc. Không thay đổi thứ tự nguồn/M3U.
  if(sort==='name-asc'||sort==='name-desc'){
   const direction=sort==='name-asc'?1:-1;
   rows.sort((a,b)=>direction*clean(a.name).localeCompare(clean(b.name),'vi',
    {numeric:true,sensitivity:'base'}));
  }
  return rows;
 }
 function missingLogos(input,{offset=0,limit=10,query='',group='',sort='playlist'}={}){
  const rows=selectMissingLogoChannels(input,{query,group,sort});
  const start=Number.isFinite(offset)?Math.max(0,Math.floor(offset)):0;
  const count=Number.isFinite(limit)?Math.min(50,Math.max(1,Math.floor(limit))):10;
  return {total:rows.length,offset:start,limit:count,
   rows:rows.slice(start,start+count).map(c=>({
    name:clean(c.name),group:clean(c.group||c.groupTitle)||'Chưa phân nhóm'
   }))};
 }
 // P5.1.163: metadata CSV toàn bộ kết quả lọc, không giới hạn 50 dòng/trang.
 // Escape công thức và chỉ xuất hai trường: tên và nhóm; tuyệt đối không URL.
 const csvCell=value=>{
  const raw=clean(value).replace(/[\u0000-\u001f\u007f]/g,' ');
  const safe=/^[\s\ufeff]*[=+\-@]/u.test(raw)?"'"+raw:raw;
  return '"'+safe.replace(/"/g,'""')+'"';
 };
 function missingLogoCsv(input,{query='',group='',sort='playlist'}={}){
  const rows=selectMissingLogoChannels(input,{query,group,sort});
  const lines=rows.map(c=>csvCell(c.name)+','+
   csvCell(clean(c.group||c.groupTitle)||'Chưa phân nhóm'));
  return '\ufeff"Tên kênh","Nhóm"\r\n'+lines.join('\r\n')+(lines.length?'\r\n':'');
 }
 return Object.freeze({summarize,pageGroups,missingLogos,missingLogoGroups,missingPage,missingLogoCsv});
});
