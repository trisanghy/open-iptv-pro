'use strict';
// Bounded in-process job batches: WebKit/WebView2 HTTP connection pools must not
// hold a localhost connection for the full lifetime of a network probe/FFmpeg.
const {randomBytes}=require('node:crypto');
function createBatchJobs({check,snapshot,keepMs=120000,clock=()=>Date.now()}={}){
 if(typeof check!=='function'||typeof snapshot!=='function')throw Error('Thiếu bộ kiểm tra hoặc chụp ảnh');
 const jobs=new Map();
 function sweep(){for(const [id,j] of jobs)if(j.finished&&clock()-j.finishedAt>keepMs)jobs.delete(id);}
 function get(id){const j=jobs.get(id);if(!j)throw Error('Lượt xử lý không tồn tại hoặc đã hết hạn');return j;}
 function start({kind,items,concurrency=4}={}){
  sweep();
  if(!['check','snapshot','repair'].includes(kind))throw Error('Loại tác vụ không hợp lệ');
  if(!Array.isArray(items)||items.length<1||items.length>5000)throw Error('Số kênh phải từ 1 đến 5000');
  const workers=Number(concurrency);if(!Number.isInteger(workers)||workers<1||workers>32)throw Error('Số luồng phải từ 1 đến 32');
  if([...jobs.values()].filter(x=>!x.finished).length>=3)throw Error('Đã có quá nhiều tác vụ đang chạy');
  const entries=items.map((item,index)=>{
   if(!item||typeof item.url!=='string'||!item.url.trim()||item.url.length>10000)throw Error('URL kênh không hợp lệ: '+index);
   const alternates=kind==='repair'&&Array.isArray(item.alternates)?item.alternates.filter(u=>typeof u==='string'&&/^https?:\/\//i.test(u)&&u.length<=10000).slice(0,5):[];
   return {url:item.url,label:String(item.label||'Kênh').slice(0,120),alternates};
  });
  const job={id:randomBytes(12).toString('hex'),kind,items:entries,workers:Math.min(workers,entries.length),cursor:0,results:[],done:0,total:entries.length,finished:false,finishedAt:0,cancelled:false,cache:new Map(),peak:0,active:0,startedAt:clock()};
  jobs.set(job.id,job);
  // Defer expensive work so the start RPC can complete almost immediately.
  setImmediate(()=>{void (async()=>{
   async function worker(){while(!job.cancelled&&job.cursor<job.total){
    const index=job.cursor++,entry=entries[index];job.active++;job.peak=Math.max(job.peak,job.active);
    try{
     let p;
     const probe=url=>{let v=job.cache.get(url);if(!v){v=Promise.resolve().then(()=>check(url));job.cache.set(url,v);}return v;};
     let value;
     if(kind==='check')value=await probe(entry.url);
     else if(kind==='repair'){
      value=[];
      for(const url of [...new Set([entry.url,...entry.alternates])].slice(0,6)){
       if(job.cancelled)break;
       try{const r=await probe(url);value.push({url,...r});if(r.status==='alive')break;}
       catch(e){value.push({url,status:'uncertain',reason:String(e.message||e)});}
      }
     }else{p=Promise.resolve().then(()=>snapshot(entry.url,entry.label));value=await p;}
     job.results.push({index,ok:true,value});
    }catch(e){job.results.push({index,ok:false,error:String(e?.message||e).slice(0,900)});}
    finally{job.done++;job.active--;}
   }}
   try{await Promise.all(Array.from({length:job.workers},worker));}
   finally{job.finished=true;job.finishedAt=clock();job.cache.clear();}
  })().catch(e=>{job.finished=true;job.finishedAt=clock();job.error=String(e?.message||e);});});
  return {id:job.id,total:job.total,workers:job.workers};
 }
 function status(id,offset=0){const j=get(id);const startIndex=Math.max(0,Math.min(Number(offset)||0,j.results.length));const results=j.results.slice(startIndex,startIndex+250);
  return {id:j.id,kind:j.kind,done:j.done,total:j.total,workers:j.workers,peak:j.peak,finished:j.finished,cancelled:j.cancelled,error:j.error||null,results,nextOffset:startIndex+results.length};
 }
 function cancel(id){const j=get(id);j.cancelled=true;return true;}
 return {start,status,cancel,_jobs:jobs};
}
module.exports={createBatchJobs};
