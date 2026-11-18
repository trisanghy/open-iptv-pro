'use strict';
/**
 * Isolated opt-in FFmpeg remux player for desktop playback failures.
 * FFmpeg reads the original authorized stream; no credential/DRM workarounds.
 * Separate from DVR and user-controlled timeshift so their state is untouched.
 */
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {randomBytes}=require('node:crypto');

const SEGMENT=/^segment_\d{6}\.ts$/;
const ALLOWED=/^(?:index\.m3u8|segment_\d{6}\.ts)$/;
function safeMediaUrl(url){
 const u=new URL(url);
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('Chỉ hỗ trợ nguồn HTTP(S) không có mật khẩu trong URL');
 return u.href;
}
function createPlaybackFallback({baseDir,ffmpegPath,spawnFn=spawn,logger=()=>{},readyTimeoutMs=14000,pollMs=150}){
 const base=path.join(baseDir,'playback-fallback');let active=null;
 function clean(folder){if(folder?.startsWith(base+path.sep))try{fs.rmSync(folder,{recursive:true,force:true});}catch{}}
 function stop(id){
  if(!active||(id&&id!==active.id))return false;
  const old=active;active=null;old.stopped=true;
  clearInterval(old.monitor);
  try{old.process?.kill('SIGKILL');}catch{}
  // Avoid deleting files before the child has released them on Windows.
  if(old.process?.exitCode!==null && old.process?.exitCode!==undefined)clean(old.folder);
  else{
   old.process?.once('close',()=>clean(old.folder));
   const timer=setTimeout(()=>clean(old.folder),2500);timer.unref?.();
  }
  return true;
 }
 async function start(raw){
  const url=safeMediaUrl(raw);
  stop();fs.mkdirSync(base,{recursive:true,mode:0o700});
  const id=randomBytes(12).toString('hex'),folder=path.join(base,id);
  fs.mkdirSync(folder,{recursive:true,mode:0o700});
  const playlist=path.join(folder,'index.m3u8');
  const args=['-hide_banner','-nostdin','-loglevel','warning',
   // Read VOD a little faster than realtime to make the first segment sooner.
   // Live sources are naturally paced by their upstream server.
   '-readrate','2','-rw_timeout','10000000','-probesize','1500000','-analyzeduration','1500000',
   '-fflags','+genpts+discardcorrupt','-i',url,
   '-map','0:v:0?','-map','0:a:0?','-c','copy','-f','hls','-hls_time','2',
   '-hls_list_size','12','-hls_delete_threshold','4',
   '-hls_flags','delete_segments+omit_endlist+independent_segments+temp_file',
   '-hls_segment_filename',path.join(folder,'segment_%06d.ts'),playlist];
  const session={id,folder,playlist,process:null,closed:false,stopped:false,error:'',monitor:null,startedAt:Date.now()};
  active=session;
  try{session.process=spawnFn(ffmpegPath,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});}
  catch{stop(id);throw Error('Không khởi động được FFmpeg dự phòng');}
  // Never expose upstream signed URLs in logs, UI or diagnostic results.
  session.process.stderr?.on('data',chunk=>{const msg=String(chunk).slice(-500);session.error=/403|401/.test(msg)?'FFmpeg: HTTP 401/403':/Invalid data/i.test(msg)?'FFmpeg: định dạng nguồn không hợp lệ':'FFmpeg: chưa tạo được phân đoạn';});
  session.process.on('error',()=>{session.closed=true;session.error='Không khởi động được FFmpeg';});
  session.process.on('close',()=>{session.closed=true;if(!session.error)session.error='FFmpeg kết thúc trước khi có video';if(session.stopped)clean(folder);});
  session.monitor=setInterval(()=>{
   if(active!==session)return;
   try{
    let bytes=0;for(const file of fs.readdirSync(folder))bytes+=fs.statSync(path.join(folder,file)).size;
    if(bytes>750*1024*1024){logger('FFmpeg fallback exceeded temporary storage');stop(id);}
   }catch{}
  },12000);session.monitor.unref?.();
  const expires=Date.now()+readyTimeoutMs;
  while(Date.now()<expires){
   if(active!==session||session.stopped)throw Error('Đã hủy trình phát FFmpeg');
   if(session.closed){const err=session.error;stop(id);throw Error(err);}
   try{
    const text=fs.readFileSync(playlist,'utf8');
    const segment=text.split(/\r?\n/).map(x=>x.trim()).find(x=>SEGMENT.test(x));
    if(text.startsWith('#EXTM3U')&&segment&&fs.existsSync(path.join(folder,segment)))return {id,ready:true};
   }catch{}
   await new Promise(resolve=>setTimeout(resolve,pollMs));
  }
  const error=session.error||'FFmpeg chưa tạo được phân đoạn video trong thời hạn';
  stop(id);throw Error(error);
 }
 function read(id,file){
  if(!ALLOWED.test(String(file)))throw Error('Tên file không hợp lệ');
  if(!active||active.id!==id)throw Error('Phiên phát đã dừng');
  const filename=path.join(active.folder,file);const stat=fs.statSync(filename);
  if(!stat.isFile()||stat.size>40*1024*1024)throw Error('Tệp video vượt giới hạn');
  return {data:fs.readFileSync(filename),contentType:file==='index.m3u8'?'application/vnd.apple.mpegurl':'video/mp2t'};
 }
 function status(){return active?{active:true,id:active.id,uptimeSec:Math.round((Date.now()-active.startedAt)/1000),closed:active.closed,error:active.error}:{active:false};}
 return {start,stop,read,status};
}
module.exports={createPlaybackFallback,safeMediaUrl};
