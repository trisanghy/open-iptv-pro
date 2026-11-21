'use strict';
/* Opt-in GPU H.264 encoding benchmark. Never mislabel GPU encoding as AI upscaling.
 * FFmpeg is bundled by the installer; never download unsigned GPU drivers/tools.
 * Video caches live entirely under app userData/video-gpu-assets.
 */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawn,spawnSync}=require('node:child_process');
const DIRS=Object.freeze({cache:'Bộ đệm xử lý video',models:'Mô hình video đã tải',runtime:'Thư viện video riêng'});
function createVideoGPUService({dataDir,getFFmpeg}={}){
 if(typeof dataDir!=='string'||!path.isAbsolute(dataDir)||typeof getFFmpeg!=='function')throw Error('Cần thư mục dữ liệu ứng dụng và bộ tìm FFmpeg');
 const root=path.resolve(dataDir,'video-gpu-assets');let busy=false;
 function managed(key){
  if(!Object.hasOwn(DIRS,key))throw Error('Không được xóa ngoài kho video GPU');
  const dir=path.resolve(root,key);
  if(path.dirname(dir)!==root)throw Error('Đường dẫn không an toàn');
  for(const x of [dataDir,root,dir]){
   try{if(fs.lstatSync(x).isSymbolicLink())throw Error('Không dùng thư mục liên kết (symlink)');}
   catch(e){if(e.code!=='ENOENT')throw e;}
  }
  return dir;
 }
 function size(dir){
  let sum=0,seen=0;
  function walk(p){
   if(++seen>25000)throw Error('Quá nhiều file cache; không thể thống kê an toàn');
   let stat;try{stat=fs.lstatSync(p);}catch(e){if(e.code==='ENOENT')return;throw e;}
   if(stat.isSymbolicLink())return;
   if(stat.isFile()){sum+=stat.size;return;}
   if(stat.isDirectory())for(const f of fs.readdirSync(p))walk(path.join(p,f));
  }walk(dir);return sum;
 }
 function storage(){
  const items=Object.entries(DIRS).map(([id,label])=>({id,label,bytes:size(managed(id))}));
  return {totalBytes:items.reduce((s,x)=>s+x.bytes,0),items};
 }
 function remove(id){
  if(busy)throw Error('Đang đo GPU; chưa thể dọn bộ nhớ');
  const dir=managed(id);
  if(fs.existsSync(dir))fs.rmSync(dir,{recursive:true,force:false,maxRetries:1});
  return storage();
 }
 function availableEncoders(ffmpeg){
  if(!ffmpeg)return '';
  try{
   const r=spawnSync(ffmpeg,['-hide_banner','-encoders'],{encoding:'utf8',timeout:5000,maxBuffer:1024*1024,windowsHide:true});
   return r.status===0?r.stdout:'';
  }catch{return '';}
 }
 function candidates(text){
  const names=process.platform==='darwin'?['h264_videotoolbox']:process.platform==='win32'?['h264_nvenc','h264_amf','h264_qsv','h264_mf']:[];
  return names.filter(n=>new RegExp('(^|\\s)'+n+'\\s','m').test(text));
 }
 function prepare(){
  const ffmpeg=getFFmpeg();
  const encoders=candidates(availableEncoders(ffmpeg));
  return {platform:process.platform,architecture:process.arch,ready:!!ffmpeg,
   backends:encoders,automaticInstaller:'FFmpeg bundled with application',
   modelReady:false,liveAiUpscale:false,
   message:ffmpeg?'FFmpeg có sẵn; chưa có mô hình AI Upscale đã xác minh.':'Ứng dụng thiếu FFmpeg tích hợp; cần cập nhật/cài lại bản đầy đủ.'};
 }
 function sample(bin,encoder,width,height,rate,frames){
  return new Promise(resolve=>{
   const args=['-hide_banner','-nostdin','-loglevel','error','-f','lavfi','-i',
    'testsrc2=size='+width+'x'+height+':rate='+rate+':duration='+(frames/rate),
    '-an','-sn','-c:v',encoder,'-b:v','2500k','-frames:v',String(frames),'-f','null','-'];
   let settled=false,timeout;
   const start=process.hrtime.bigint();
   const finish=(ok,reason)=>{
    if(settled)return;settled=true;clearTimeout(timeout);
    const secs=Number(process.hrtime.bigint()-start)/1e9;
    resolve({ok,processingFps:ok?frames/Math.max(.01,secs):0,reason:ok?'':String(reason||'GPU encoder không khả dụng').slice(0,100)});
   };
   let child;try{child=spawn(bin,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});}
   catch(e){finish(false,e.message);return;}
   let tail='';
   child.stderr.on('data',d=>{tail=(tail+d.toString()).slice(-200);});
   child.on('error',e=>finish(false,e.message));
   child.on('close',code=>finish(code===0,tail));
   timeout=setTimeout(()=>{child.kill('SIGKILL');finish(false,'GPU benchmark quá thời gian');},12000);
  });
 }
 async function benchmark(){
  if(busy)throw Error('GPU benchmark đang chạy');
  busy=true;
  try{
   const detected=prepare(),ffmpeg=getFFmpeg();
   for(const encoder of detected.backends){
    const p720=await sample(ffmpeg,encoder,1280,720,60,90);
    if(!p720.ok)continue;
    const p1080=await sample(ffmpeg,encoder,1920,1080,30,45);
    return {kind:'gpu-h264-encode-only',available:true,encoder,platform:process.platform,
     tests:{p720,p1080},aiUpscaleAvailable:false,aiMotionAvailable:false};
   }
   return {kind:'gpu-h264-encode-only',available:false,encoder:null,platform:process.platform,
    tests:{},aiUpscaleAvailable:false,aiMotionAvailable:false};
  }finally{busy=false;}
 }
 return {prepare,storage,remove,benchmark};
}
module.exports={createVideoGPUService};
