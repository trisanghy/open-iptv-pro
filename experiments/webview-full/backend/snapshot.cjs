'use strict';
// Snapshot engine for the native WebView backend.  Always preserve the full FFmpeg
// binary; try the raw HTTP(S) URL first, then the same local HTTP proxy used by
// playback, and return actionable errors rather than swallowing them.
const path=require('node:path');
const fs=require('node:fs');
const {spawn}=require('node:child_process');
const {randomBytes}=require('node:crypto');

function safeLabel(value){
 return String(value||'channel').replace(/[^\p{L}\p{N}_.-]+/gu,'_').replace(/^\.+/,'').slice(0,72)||'channel';
}
function validHttpUrl(value){
 const url=new URL(value);
 if(url.protocol!=='http:'&&url.protocol!=='https:')throw Error('Snapshot hỗ trợ luồng HTTP/HTTPS (HLS, MP4, MPEG-TS).');
 return url;
}
function describeFailure(stderr,exitCode,timedOut){
 const last=String(stderr||'').trim().split(/\r?\n/).filter(Boolean).slice(-5).join(' | ');
 if(timedOut)return `FFmpeg hết thời gian chờ khung hình${last?`: ${last}`:''}`;
 return `FFmpeg trả mã ${exitCode==null?'không rõ':exitCode}${last?`: ${last}`:''}`;
}
function captureOnce({ffmpeg,input,output,hls=false,timeoutMs=22000,spawnProcess=spawn}){
 return new Promise((resolve,reject)=>{
  const args=[
   '-hide_banner','-nostdin','-loglevel','warning','-y',
   // Avoid 32 FFmpeg processes spawning many decoding/filter threads each.
   '-threads','1','-filter_threads','1',
   '-rw_timeout','6000000',
   '-user_agent','Mozilla/5.0 OpenIPTVPro/4.19',
   // Only HLS demuxer accepts this input option (MP4 and MPEG-TS reject it).
   // Proxy manifests rewrite segment links to /stream?url=..., with no suffix.
   ...(hls ? ['-allowed_extensions','ALL'] : []),
   '-analyzeduration','1200000','-probesize','524288',
   '-i',input,
   '-map','0:v:0','-an','-sn','-dn','-frames:v','1',
   '-vf','scale=480:-2','-q:v','4','-f','image2',output
  ];
  let child;
  try{child=spawnProcess(ffmpeg,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});}
  catch(e){reject(new Error('Không chạy được FFmpeg: '+e.message));return;}
  let completed=false,timedOut=false,err='';
  const finish=(error)=>{
    if(completed)return;completed=true;clearTimeout(timer);
    if(error)reject(error);else resolve({size:fs.statSync(output).size});
  };
  const timer=setTimeout(()=>{timedOut=true;try{child.kill('SIGKILL');}catch{}},timeoutMs);
  child.stderr?.on('data',chunk=>{err=(err+String(chunk)).slice(-4000);});
  child.once('error',e=>finish(new Error('Không khởi động được FFmpeg: '+e.message)));
  child.once('close',code=>{
   let good=false;
   try{
    if(code===0){const size=fs.statSync(output).size;if(size>300){
     const fd=fs.openSync(output,'r');try{const magic=Buffer.alloc(3);fs.readSync(fd,magic,0,3,0);good=magic[0]===0xFF&&magic[1]===0xD8&&magic[2]===0xFF;}finally{fs.closeSync(fd);}
    }}
   }catch{}
   if(!good){try{fs.unlinkSync(output)}catch{}
     finish(new Error(describeFailure(err,code,timedOut)+(code===0?' (file JPEG không hợp lệ)':'')));
   }else finish();
  });
 });
}
function createSnapshotEngine({ffmpeg,proxy,folder,baseUrl,timeoutMs=22000}){
 if(!ffmpeg)throw Error('FFmpeg không có sẵn trong bản cài.');
 if(typeof proxy!=='function'||typeof baseUrl!=='function')throw Error('Thiếu địa chỉ proxy Snapshot.');
 return async function makeSnapshot(url,label){
  validHttpUrl(url);
  fs.mkdirSync(folder,{recursive:true});
  const name=`${safeLabel(label)}_${Date.now()}_${randomBytes(4).toString('hex')}.jpg`;
  const output=path.join(folder,name);
  const hls=/\.m3u8?(?:$|\?)/i.test(url);
  // A 22-second direct timeout followed by another 22-second proxy timeout
  // could block each worker for 44 seconds on a dead channel.
  // Keep the fallback, but bound each attempt separately.
  const candidates=[{name:'nguồn gốc',url,budget:Math.min(timeoutMs,11000)},
                    {name:'proxy cục bộ',url:proxy(url),budget:Math.min(timeoutMs,15000)}];
  const failures=[];
  for(const candidate of candidates){
   try{
    await captureOnce({ffmpeg,input:candidate.url,output,hls,timeoutMs:candidate.budget});
    return {file:name,data:`${baseUrl()}${encodeURIComponent(name)}`,method:candidate.name==='nguồn gốc'?'FFmpeg':'FFmpeg · Proxy'};
   }catch(e){failures.push(`${candidate.name}: ${e.message}`);}
  }
  const error=new Error(`Không chụp được ${safeLabel(label)}. ${failures.join(' ; ').slice(0,900)}`);
  error.details=failures;throw error;
 };
}
module.exports={captureOnce,createSnapshotEngine,describeFailure,validHttpUrl,safeLabel};
