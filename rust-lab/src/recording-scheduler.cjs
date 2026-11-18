'use strict';
/** Local DVR scheduler. Never intercepts, stops or replaces the player/Timeshift process.
 * A scheduled task is persisted BEFORE execution; missed windows are not silently replayed.
 * Only one FFmpeg recording at a time; overlapping jobs require deliberate rescheduling.
 */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {randomBytes}=require('node:crypto');
const MAX_JOBS=400;
const MAX_DURATION=8*60*60*1000;
const MAX_AHEAD=45*24*60*60*1000;
const MIN_FREE=250*1024*1024;
const terminal=new Set(['completed','failed','missed','cancelled','interrupted']);
function safeUrl(value){
 if(typeof value!=='string'||value.length>8192)throw Error('Địa chỉ luồng không hợp lệ.');
 let u;try{u=new URL(value);}catch{throw Error('Địa chỉ luồng không hợp lệ.');}
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Chỉ ghi luồng HTTP(S), không chấp nhận tài khoản trong URL.');
 return u.href;
}
function safeName(value){return String(value||'Chuong_trinh').normalize('NFC').replace(/[\\/:*?"<>|\x00-\x1f]+/g,'_').replace(/\s+/g,' ').trim().replace(/^\.+/,'').slice(0,64)||'Chuong_trinh';}
function toMillis(value){const n=Number(value);if(!Number.isSafeInteger(n))throw Error('Thời gian ghi không hợp lệ.');return n;}
function validateNew(data,now){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Thông tin lịch ghi không hợp lệ.');
 const startAt=toMillis(data.startAt),endAt=toMillis(data.endAt);
 if(startAt<now-30000||startAt>now+MAX_AHEAD)throw Error('Thời điểm bắt đầu phải từ hiện tại đến 45 ngày tới.');
 if(endAt-startAt<60_000||endAt-startAt>MAX_DURATION)throw Error('Mỗi lịch ghi phải dài từ 1 phút đến 8 giờ.');
 if(typeof data.channelName!=='string'||!data.channelName.trim()||data.channelName.length>140)throw Error('Tên kênh không hợp lệ.');
 if(typeof data.title!=='string'||!data.title.trim()||data.title.length>220)throw Error('Tên chương trình không hợp lệ.');
 return {channelId:String(data.channelId||'').slice(0,128),channelName:data.channelName.trim(),title:data.title.trim(),url:safeUrl(data.url),startAt,endAt};
}
function conflict(a,b){return a.startAt<b.endAt&&b.startAt<a.endAt;}
function freeSpace(folder){
 if(typeof fs.statfsSync!=='function')return null;
 try{const s=fs.statfsSync(folder);return Number(s.bavail)*Number(s.bsize);}catch{return null;}
}
function looksLikeMpegTS(filename){
 let fd;try{fd=fs.openSync(filename,'r');const buf=Buffer.alloc(188*4);const n=fs.readSync(fd,buf,0,buf.length,0);
  return n>=188*4 && [0,188,376,564].every(offset=>buf[offset]===0x47);
 }catch{return false;}finally{if(fd!==undefined)try{fs.closeSync(fd);}catch{}}
}
function localStamp(ms){
 const d=new Date(ms),pad=n=>String(n).padStart(2,'0');
 return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}
/** A final MP4 must be a real ISO-BMFF file, not just renamed MPEG-TS. */
function looksLikeMp4(filename){
 // Parse the top-level MP4 box headers, including large 64-bit boxes, without
 // reading the (possibly many-gigabyte) video payload into memory.
 let fd;try{
  const st=fs.statSync(filename);if(st.size<1024)return false;
  fd=fs.openSync(filename,'r');let offset=0,boxes=0;const found=new Set();
  const header=Buffer.alloc(16);
  while(offset+8<=st.size&&boxes++<128){
   const n=fs.readSync(fd,header,0,16,offset);if(n<8)return false;
   let size=header.readUInt32BE(0),headerSize=8;
   const type=header.toString('ascii',4,8);
   if(size===1){if(n<16)return false;const big=header.readBigUInt64BE(8);if(big>BigInt(Number.MAX_SAFE_INTEGER))return false;size=Number(big);headerSize=16;}
   else if(size===0)size=st.size-offset;
   if(size<headerSize||size>st.size-offset)return false;
   if(offset===0&&type!=='ftyp')return false;
   if(['ftyp','moov','mdat'].includes(type))found.add(type);
   offset+=size;
  }
  return found.has('ftyp')&&found.has('moov')&&found.has('mdat')&&offset===st.size;
 }catch{return false;}finally{if(fd!==undefined)try{fs.closeSync(fd);}catch{}}
}
function writeJSONAtomic(file,data){
 const tmp=file+'.tmp-'+randomBytes(4).toString('hex');
 try{fs.writeFileSync(tmp,JSON.stringify(data,null,2),{encoding:'utf8',mode:0o600,flag:'wx'});fs.renameSync(tmp,file);}catch(e){try{fs.unlinkSync(tmp);}catch{}throw e;}
}
function createRecordingScheduler({baseDir,ffmpegPath,now=()=>Date.now(),spawnFn=spawn,logger=()=>{},tickMs=1000,defaultDir=null}={}){
 if(!baseDir||!ffmpegPath)throw Error('Thiếu thư mục lưu trữ hoặc FFmpeg.');
 fs.mkdirSync(baseDir,{recursive:true});
 const stateFile=path.join(baseDir,'dvr-schedule-v1.json');
 const fallback=path.join(baseDir,'recordings');
 let store={version:1,directory:defaultDir||fallback,jobs:[]},running=null,interval=null,stopped=false;
 if(fs.existsSync(stateFile)){
  try{
   const stat=fs.statSync(stateFile);if(stat.size>1024*1024)throw Error('File lịch ghi quá lớn.');
   const loaded=JSON.parse(fs.readFileSync(stateFile,'utf8'));
   if(!loaded||loaded.version!==1||!Array.isArray(loaded.jobs)||loaded.jobs.length>MAX_JOBS||typeof loaded.directory!=='string'||!path.isAbsolute(loaded.directory))throw Error('Định dạng lịch ghi sai.');
   for(const j of loaded.jobs){
    if(!j||!(/^[a-f0-9]{24}$/.test(j.id))||!['scheduled','recording','finalizing',...terminal].includes(j.status)||!Number.isSafeInteger(j.startAt)||!Number.isSafeInteger(j.endAt)||j.endAt<=j.startAt||typeof j.channelName!=='string'||typeof j.title!=='string'||j.title.length>220||j.channelName.length>140)throw Error('Dữ liệu lịch ghi đã bị hỏng.');
    safeUrl(j.url);
   }
   store={version:1,directory:loaded.directory,jobs:loaded.jobs};
   // An interrupted session is never presented as successful or restarted automatically.
   for(const j of store.jobs){if(j.status==='recording'||j.status==='finalizing'){j.status='interrupted';j.error='Ứng dụng đã đóng hoặc gặp sự cố khi đang ghi.';j.finishedAt=now();}}
  }catch(e){
   // Never destroy unknown/corrupted schedules on startup.
   const recovered=stateFile+'.corrupt-'+Date.now();
   try{fs.renameSync(stateFile,recovered);}catch{}logger('DVR invalid schedule preserved: '+e.message);
  }
 }
 const persist=()=>writeJSONAtomic(stateFile,store);
 function ensureDir(){fs.mkdirSync(store.directory,{recursive:true});const info=fs.statSync(store.directory);if(!info.isDirectory())throw Error('Đường dẫn lưu không phải thư mục.');fs.accessSync(store.directory,fs.constants.W_OK);return store.directory;}
 // A previous crash can leave .part.ts or .part.mp4 files; preserve them, never auto-mark success.
 function reclassifyOrphans(){
  try{const folder=store.directory;if(!fs.existsSync(folder))return;for(const j of store.jobs.filter(x=>x.status==='interrupted')){
   if(typeof j.tempFile==='string'&&j.tempFile.endsWith('.part.ts')&&path.basename(j.tempFile).includes(j.id.slice(0,8))&&path.dirname(j.tempFile)===(j.recordingDir||folder)&&fs.existsSync(j.tempFile)){
    const target=j.tempFile.replace(/\.part\.ts$/,'.interrupted.ts');
    if(target!==j.tempFile&&!fs.existsSync(target))fs.renameSync(j.tempFile,target);
    j.file=fs.existsSync(target)?target:j.tempFile;
   }
   if(typeof j.muxTempFile==='string'&&j.muxTempFile.endsWith('.part.mp4')&&path.basename(j.muxTempFile).includes(j.id.slice(0,8))&&path.dirname(j.muxTempFile)===(j.recordingDir||folder)&&fs.existsSync(j.muxTempFile)){
    const marked=j.muxTempFile.replace(/\.part\.mp4$/,'.interrupted.mp4');
    if(!fs.existsSync(marked))fs.renameSync(j.muxTempFile,marked);
   }
  }}catch(e){logger('DVR orphan recovery: '+e.message);}
 }
 reclassifyOrphans();persist();
 function publicJob(j){const {url,...safe}=j;return {...safe};}
 function list(){return {directory:store.directory,jobs:store.jobs.map(publicJob).sort((a,b)=>b.startAt-a.startAt),runningId:running?.job.id||null};}
 function saveResult(j,status,error=''){
  j.status=status;j.finishedAt=now();j.error=String(error||'').slice(0,450);
  try{persist();return true;}catch(e){logger('DVR state save failed: '+e.message);j.error='Không thể lưu trạng thái ghi trên đĩa: '+e.message;return false;}
 }
 function create(data){
  const clean=validateNew(data,now());if(stopped)throw Error('Ứng dụng đang đóng.');
  if(store.jobs.filter(j=>!terminal.has(j.status)).length>=100)throw Error('Đã có quá nhiều lịch chờ.');
  const existing=store.jobs.find(j=>['scheduled','recording'].includes(j.status)&&conflict(clean,j));
  if(existing)throw Error('Lịch ghi bị trùng với '+existing.channelName+' ('+new Date(existing.startAt).toLocaleString('vi-VN')+'). Chỉ hỗ trợ một chương trình ghi tại một thời điểm.');
  ensureDir();
  if((path.isAbsolute(ffmpegPath)||ffmpegPath.includes(path.sep))&&!fs.existsSync(ffmpegPath))throw Error('Không tìm thấy FFmpeg.');
  const job={...clean,id:randomBytes(12).toString('hex'),status:'scheduled',createdAt:now(),file:'',tempFile:'',error:'',bytes:0};
  const before=store.jobs.slice();store.jobs.push(job);
  // Limit history size; pending schedules are never silently pruned.
  if(store.jobs.length>MAX_JOBS){const old=store.jobs.filter(j=>terminal.has(j.status)).sort((a,b)=>a.finishedAt-b.finishedAt);while(store.jobs.length>MAX_JOBS&&old.length)store.jobs.splice(store.jobs.indexOf(old.shift()),1);}
  try{persist();}catch(e){store.jobs=before;throw Error('Không thể lưu lịch ghi: '+e.message);}
  tick();return publicJob(job);
 }
 function chooseDirectory(dir){
  if(typeof dir!=='string'||!path.isAbsolute(dir))throw Error('Phải chọn thư mục tuyệt đối.');
  const info=fs.statSync(dir);if(!info.isDirectory())throw Error('Thư mục ghi không hợp lệ.');
  fs.accessSync(dir,fs.constants.W_OK);
  // Do not change destination for an ongoing process; it was pinned at start.
  const previous=store.directory;store.directory=dir;try{persist();}catch(e){store.directory=previous;throw Error('Không lưu được thư mục ghi: '+e.message);}return store.directory;
 }
 function checkFree(){const free=freeSpace(ensureDir());if(free!==null&&free<MIN_FREE)throw Error('Ổ đĩa còn dưới 250 MB trống.');}
 // Raw transport-stream data stays recoverable until a verified MP4 has been committed.
 function preservePartial(job,kind='partial'){
  const src=job.tempFile;if(!src||!fs.existsSync(src))return;
  const target=src.replace(/\.part\.ts$/,`.${kind}.ts`);
  if(target!==src&&!fs.existsSync(target))fs.renameSync(src,target);
  job.file=fs.existsSync(target)?target:src;
 }
 function clearSessionTimers(session){
  clearTimeout(session.watchdog);clearTimeout(session.hardKill);clearInterval(session.diskMonitor);
  session.watchdog=null;session.hardKill=null;session.diskMonitor=null;
 }
 function endWithError(session,reason,status='failed'){
  const job=session.job;clearSessionTimers(session);running=null;
  try{preservePartial(job);}catch(e){logger('DVR preserving captured stream: '+e.message);job.file=job.tempFile;}
  if(session.muxTemp&&fs.existsSync(session.muxTemp)){
   try{const leftover=session.muxTemp.replace(/\.part\.mp4$/,'.partial.mp4');if(!fs.existsSync(leftover))fs.renameSync(session.muxTemp,leftover);}catch(e){logger('DVR preserving incomplete MP4: '+e.message);}
  }
  saveResult(job,status,reason);tick();
 }
 function completeMp4(session,code,signal,error=''){
  if(running!==session)return;
  const job=session.job;
  if(session.stopping||session.abortReason||code!==0||!looksLikeMp4(session.muxTemp)){
   endWithError(session,'Không thể hoàn tất MP4. Bản ghi gốc .partial.ts được giữ lại. '+(error||session.abortReason||session.muxStderr||`FFmpeg trả mã ${code??signal??'không rõ'}.`));return;
  }
  try{
   if(fs.existsSync(session.output))throw Error('Tên file đích đã tồn tại.');
   fs.renameSync(session.muxTemp,session.output);
   job.file=session.output;job.bytes=fs.statSync(session.output).size;
   // Do not remove the original capture until the finalized MP4 is safely in place.
   try{fs.unlinkSync(job.tempFile);}catch(e){logger('DVR could not remove raw temp: '+e.message);}
   clearSessionTimers(session);running=null;saveResult(job,'completed','');tick();
  }catch(e){endWithError(session,'Không thể lưu file MP4: '+e.message);}
 }
 function convertToMp4(session){
  const job=session.job,folder=job.recordingDir;
  const captureSize=fs.statSync(job.tempFile).size;
  const available=freeSpace(folder);
  if(available!==null&&available<captureSize+MIN_FREE)throw Error('Không đủ dung lượng để hoàn tất MP4 an toàn. Bản ghi gốc được giữ lại.');
  session.stage='remux';job.status='finalizing';
  job.muxTempFile=session.muxTemp;
  persist();
  const args=['-hide_banner','-nostdin','-loglevel','error','-n','-fflags','+genpts','-i',job.tempFile,
   '-map','0:v:0?','-map','0:a:0?','-c','copy','-dn','-sn','-movflags','+faststart','-f','mp4',session.muxTemp];
  const child=spawnFn(ffmpegPath,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});
  session.child=child;session.muxStderr='';let done=false;
  const complete=(code,signal,e)=>{if(done)return;done=true;completeMp4(session,code,signal,e);};
  child.stderr?.on('data',buf=>{session.muxStderr=(session.muxStderr+String(buf)).slice(-900);});
  child.once('error',e=>complete(null,null,'MP4: '+e.message));
  child.once('close',(code,signal)=>complete(code,signal));
  // Remuxing can be slow on an external hard drive; abort stuck processes safely.
  session.watchdog=setTimeout(()=>{
   session.abortReason='Quá thời gian hoàn thiện MP4 (30 phút).';
   try{child.kill('SIGTERM');}catch{}
   session.hardKill=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},5000);
  },30*60*1000);session.watchdog.unref?.();
  session.diskMonitor=setInterval(()=>{
   if(running!==session||session.abortReason)return;
   const left=freeSpace(folder);
   if(left!==null&&left<100*1024*1024){session.abortReason='Ổ đĩa quá ít dung lượng trong khi tạo MP4.';try{child.kill('SIGTERM');}catch{}}
  },10000);session.diskMonitor.unref?.();
 }
 function finish(childJob,code,signal,spawnError){
  if(!running||running.job!==childJob||running.stage!=='capture')return;
  const active=running;clearSessionTimers(active);
  let info;try{info=fs.existsSync(childJob.tempFile)?fs.statSync(childJob.tempFile):null;}catch{}
  childJob.bytes=info?.size||0;
  if(active.stopping){endWithError(active,'Đã dừng theo yêu cầu; giữ bản ghi tạm .partial.ts.','cancelled');return;}
  if(code===0&&info?.size>=188*5&&looksLikeMpegTS(childJob.tempFile)&&!active.abortReason&&now()>=childJob.endAt-15000){
   try{convertToMp4(active);}catch(e){endWithError(active,'Không thể chuyển bản ghi sang MP4: '+e.message);}
  }else{
   endWithError(active,spawnError||active.abortReason||active.stderr||(code===0?'Luồng dừng trước giờ kết thúc.':`FFmpeg thoát với mã ${code??signal??'không rõ'}; bản ghi chưa hoàn chỉnh.`));
  }
 }
 function start(job){
  if(running||stopped)return;
  let folder;try{folder=ensureDir();checkFree();}catch(e){saveResult(job,'failed',e.message);return;}
  const programmeSuffix=job.title&&job.title.trim().toLowerCase()!==job.channelName.trim().toLowerCase()?'_'+safeName(job.title).slice(0,40):'';
  const filename=`${safeName(job.channelName).slice(0,36)}_${localStamp(job.startAt)}_den_${localStamp(job.endAt)}${programmeSuffix}_${job.id.slice(0,8)}`;
  const output=path.join(folder,filename+'.mp4'),temp=path.join(folder,filename+'.part.ts'),muxTemp=path.join(folder,filename+'.part.mp4');
  if(fs.existsSync(output)||fs.existsSync(temp)||fs.existsSync(muxTemp)){saveResult(job,'failed','Tên file ghi đã tồn tại; không ghi đè.');return;}
  const duration=Math.max(1,Math.ceil((job.endAt-now())/1000));
  if(duration<=0){saveResult(job,'missed','Đã quá giờ kết thúc.');return;}
  job.tempFile=temp;job.recordingDir=folder;job.startedAt=now();job.lateMs=Math.max(0,job.startedAt-job.startAt);job.status='recording';
  try{persist();}catch(e){job.status='failed';job.error=e.message;return;}
  const args=['-hide_banner','-nostdin','-loglevel','error','-n','-rw_timeout','10000000','-probesize','2000000','-analyzeduration','2000000','-i',job.url,'-map','0:v:0?','-map','0:a:0?','-c','copy','-dn','-sn','-t',String(duration),'-f','mpegts',temp];
  try{
   const child=spawnFn(ffmpegPath,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});
   const session={job,child,output,muxTemp,stage:'capture',stderr:'',abortReason:'',stopping:false,watchdog:null,hardKill:null,diskMonitor:null,lastBytes:0,lastProgressAt:now()};running=session;
   child.stderr?.on('data',buffer=>{session.stderr=(session.stderr+String(buffer)).slice(-900);});
   let finalized=false;
   const complete=(code,signal,error)=>{if(finalized)return;finalized=true;finish(job,code,signal,error);};
   child.once('error',e=>complete(null,null,'Không chạy được FFmpeg: '+e.message));
   child.once('close',(code,signal)=>complete(code,signal));
   // FFmpeg timestamps are not reliable wall clocks on every live source.
   const delay=Math.max(1000,job.endAt-now()+15000);
   session.watchdog=setTimeout(()=>{session.stderr+=' Giới hạn thời gian ghi thực đã hết.';try{child.kill('SIGTERM');}catch{}session.hardKill=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},4000);},delay);
   session.watchdog.unref?.();
   session.diskMonitor=setInterval(()=>{
    if(running!==session||session.abortReason)return;
    try{
     const available=freeSpace(folder);
     if(available!==null&&available<150*1024*1024){
      session.abortReason='Ổ đĩa gần đầy (dưới 150 MB trống); tự dừng để bảo vệ dữ liệu.';
      child.kill('SIGTERM');session.hardKill=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},4000);return;
     }
     const bytes=fs.existsSync(temp)?fs.statSync(temp).size:0;
     if(bytes>session.lastBytes){session.lastBytes=bytes;session.lastProgressAt=now();}
     else if(now()-session.lastProgressAt>60000){
      session.abortReason='Luồng không ghi thêm dữ liệu trong hơn 60 giây.';
      child.kill('SIGTERM');session.hardKill=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},4000);
     }
    }catch(e){logger('DVR disk monitor: '+e.message);}
   },10000);session.diskMonitor.unref?.();
  }catch(e){saveResult(job,'failed','Không khởi động được FFmpeg: '+e.message);running=null;}
 }
 function tick(){
  if(stopped)return;
  const time=now();
  for(const job of store.jobs){
   if(job.status!=='scheduled')continue;
   if(time>=job.endAt||time-job.startAt>90_000){saveResult(job,'missed','Ứng dụng không hoạt động đúng giờ; không ghi bù chương trình đã phát.');continue;}
   if(time>=job.startAt){if(running){saveResult(job,'missed','Một chương trình khác đang ghi.');continue;}start(job);}
  }
 }
 function stopJob(id){
  const job=store.jobs.find(j=>j.id===id);if(!job)throw Error('Không tìm thấy lịch ghi.');
  if(job.status==='scheduled'){if(!saveResult(job,'cancelled','Hủy lịch trước khi bắt đầu.'))throw Error('Không thể lưu việc hủy lịch. Kiểm tra quyền ghi ổ đĩa.');return publicJob(job);}
  if(job.status==='finalizing')throw Error('Đang hoàn thiện MP4, không thể dừng giữa chừng.');
  if(job.status!=='recording'||!running||running.job!==job)throw Error('Chỉ có thể dừng bản ghi đang chạy hoặc hủy lịch chờ.');
  if(running.stopping)return publicJob(job);
  running.stopping=true;
  try{running.child.kill('SIGINT');}catch{}
  running.hardKill=setTimeout(()=>{try{running?.child.kill('SIGKILL');}catch{}},5000);
  return publicJob(job);
 }
 function shutdown(){
  stopped=true;clearInterval(interval);interval=null;
  if(running){const active=running;running=null;clearSessionTimers(active);
   active.job.status='interrupted';active.job.error='Ứng dụng đã đóng khi đang ghi. Bản ghi có thể chưa hoàn chỉnh.';active.job.finishedAt=now();
   try{persist();}catch(e){logger(e.message);}try{active.child.kill('SIGINT');}catch{}
   // Give FFmpeg a chance to close the file. Do not keep Electron running indefinitely.
  }
 }
 function exportPending(){
  return JSON.stringify({version:1,pending:store.jobs.filter(j=>j.status==='scheduled').map(j=>({channelId:j.channelId,channelName:j.channelName,title:j.title,url:j.url,startAt:j.startAt,endAt:j.endAt}))});
 }
 function prepareImport(raw){
  let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('Dữ liệu lịch ghi trong Backup không hợp lệ.');}
  if(!parsed||parsed.version!==1||!Array.isArray(parsed.pending)||parsed.pending.length>100)throw Error('Bản sao lưu chứa lịch ghi không hợp lệ.');
  const pending=[];
  for(const entry of parsed.pending){
   if(!entry||typeof entry!=='object'||!Number.isSafeInteger(entry.startAt)||!Number.isSafeInteger(entry.endAt))throw Error('Thời gian lịch ghi trong bản sao lưu không hợp lệ.');
   if(entry.startAt<now())continue; // past jobs are never auto-recorded after Restore
   const clean=validateNew(entry,now());
   if(pending.some(x=>conflict(x,clean)))throw Error('Lịch ghi trong bản sao lưu bị trùng.');
   pending.push(clean);
  }
  return pending;
 }
 function importPending(raw){
  if(running)throw Error('Không thể khôi phục lịch ghi khi đang ghi hình.');
  const pending=prepareImport(raw);
  const old=store.jobs;
  store.jobs=old.filter(j=>j.status!=='scheduled').concat(pending.map(j=>({...j,id:randomBytes(12).toString('hex'),status:'scheduled',createdAt:now(),file:'',tempFile:'',bytes:0,error:''})));
  try{persist();}catch(e){store.jobs=old;throw e;}
  tick();return pending.length;
 }
 function startMonitoring(){if(interval)return;interval=setInterval(tick,tickMs);interval.unref?.();tick();}
 return {create,list,chooseDirectory,stopJob,tick,startMonitoring,shutdown,exportPending,prepareImport,importPending,getStateFile:()=>stateFile};
}
module.exports={createRecordingScheduler,validateNew,safeUrl,safeName,conflict,looksLikeMp4,localStamp};
