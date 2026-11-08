'use strict';
// Opt-in local 5 minute rolling HLS buffer. The initial buffer starts EMPTY.
// No DRM bypass. Channels requiring authentication/DRM may not work.
const fs=require('node:fs');const path=require('node:path');const {spawn}=require('node:child_process');const {randomBytes}=require('node:crypto');
function createTimeshift({baseDir,ffmpegPath,logger=()=>{}}){
 let active=null;
 const base=path.join(baseDir,'timeshift');
 function clean(folder){if(folder&&folder.startsWith(base+path.sep))try{fs.rmSync(folder,{recursive:true,force:true});}catch{}}
 function stop(){if(!active)return;const s=active;active=null;clearInterval(s.monitor);try{s.process.kill('SIGKILL');}catch{};clean(s.folder);}
 function start(url){
  const u=new URL(url);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Chỉ chấp nhận URL HTTP(S) không chứa mật khẩu');
  stop();fs.mkdirSync(base,{recursive:true,mode:0o700});
  const id=randomBytes(12).toString('hex'),folder=path.join(base,id);fs.mkdirSync(folder,{recursive:true,mode:0o700});
  const playlist=path.join(folder,'rolling.m3u8');
  const args=['-hide_banner','-nostdin','-loglevel','error','-rw_timeout','10000000','-i',url,
  '-map','0:v:0','-map','0:a:0?','-c','copy','-f','hls','-hls_time','5',
  '-hls_list_size','60','-hls_delete_threshold','3','-hls_flags','delete_segments+omit_endlist',
  '-hls_segment_filename',path.join(folder,'segment_%06d.ts'),playlist];
  let proc;try{proc=spawn(ffmpegPath,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});}catch(e){clean(folder);throw e;}
  let error='';proc.stderr.on('data',chunk=>{error=(error+chunk.toString()).slice(-500);});
  const session={id,folder,process:proc,playlist,error:'',monitor:null,createdAt:Date.now()};active=session;
  proc.on('error',e=>{session.error=e.message;logger(e);});
  proc.on('close',code=>{session.error=error||`FFmpeg exit ${code}`;if(active!==session)clean(folder);logger(session.error);});
  session.monitor=setInterval(()=>{
   if(active!==session)return;
   try{const files=fs.readdirSync(folder);let bytes=0;for(const f of files)bytes+=fs.statSync(path.join(folder,f)).size;
    if(bytes>750*1024*1024){logger('Timeshift buffer exceeded 750 MB');stop();}
   }catch{ /* May be removed while stopping */ }
  },10000);session.monitor.unref?.();
  return {id,createdAt:session.createdAt};
 }
 function read(id,file){
  if(!active||active.id!==id)throw Error('Không có bộ đệm đang chạy');
  if(!/^(rolling\.m3u8|segment_\d{6}\.ts)$/.test(file))throw Error('Tên file không hợp lệ');
  const p=path.join(active.folder,file);if(!fs.existsSync(p))throw Error('Đang đợi dữ liệu đệm');
  const data=fs.readFileSync(p);
  return {data,contentType:file.endsWith('.m3u8')?'application/vnd.apple.mpegurl':'video/mp2t'};
 }
 function status(){return active?{active:true,id:active.id,uptimeSec:Math.round((Date.now()-active.createdAt)/1000),error:active.error}: {active:false};}
 return {start,stop,read,status};
}
module.exports={createTimeshift};
