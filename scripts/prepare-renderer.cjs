'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'renderer','vendor');fs.mkdirSync(output,{recursive:true});
const list=[
  ['node_modules/hls.js/dist/hls.min.js','hls.min.js'],
  ['node_modules/dashjs/dist/modern/umd/dash.all.min.js','dash.all.min.js']
];
for(const [source,target] of list){
 const from=path.join(root,source),to=path.join(output,target);
 if(!fs.existsSync(from)){
   console.error(`Missing ${source}: run npm install from project root first.`);process.exitCode=1;continue;
 }
 fs.copyFileSync(from,to);
 console.log(`Bundled ${target} (${Math.round(fs.statSync(to).size/1024)} KiB)`);
}
const ffmpegBinary=process.platform==='win32'?'ffmpeg.exe':'ffmpeg';
const ffmpegTarget=path.join(root,'src-tauri','resources',ffmpegBinary);
try{
 // Universal macOS workflow merges arm64+x86_64 FFmpeg before invoking build.
 // Preserve that fat Mach-O resource when prebuild runs again.
 if(process.platform==='darwin' && process.env.IPTV_FFMPEG_UNIVERSAL==='1'){
  if(!fs.existsSync(ffmpegTarget))throw Error('Missing pre-merged universal FFmpeg');
  console.log('Preserving pre-merged macOS Universal FFmpeg resource');
 }else{
 const ffmpegPath=require('ffmpeg-static');
 if(!ffmpegPath||!fs.existsSync(ffmpegPath))throw Error('FFmpeg binary unavailable');
 fs.mkdirSync(path.dirname(ffmpegTarget),{recursive:true});
 fs.copyFileSync(ffmpegPath,ffmpegTarget);
 if(process.platform!=='win32')fs.chmodSync(ffmpegTarget,0o755);
 console.log(`Prepared bundled FFmpeg for ${process.platform}/${process.arch}`);
 }
}catch(e){console.error('Cannot prepare FFmpeg:',e.message);process.exitCode=1;}

/* v23.8.126: Bundle the exact browser ONNX runtime locally.
 * Smart model downloads themselves are exclusively user-initiated.
 * Pin the vendor package/version; no CDN scripts run inside the installed app.
 */
const https=require('node:https');
const SMART_DIST='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/';
const smartAssets=[
 ['transformers.min.js',400_000,1_600_000],
 ['ort-wasm-simd-threaded.jsep.mjs',20_000,120_000],
 ['ort-wasm-simd-threaded.jsep.wasm',10_000_000,32_000_000]
];
function fetchSmartAsset(file,min,max,redirects=0){
 const target=path.join(output,file);
 if(fs.existsSync(target)){
  const size=fs.statSync(target).size;
  if(size>=min&&size<=max)return Promise.resolve();
  fs.rmSync(target,{force:true});
 }
 if(redirects>3)return Promise.reject(Error('Too many runtime redirects: '+file));
 const url=new URL(SMART_DIST+encodeURIComponent(file));
 return new Promise((resolve,reject)=>{
  const req=https.get(url,{timeout:45_000,headers:{'User-Agent':'OpenIPTV-RustLab-Build/1.0'}},res=>{
   if(res.statusCode!==200){res.resume();reject(Error('Failed pinned Smart runtime '+file+': HTTP '+res.statusCode));return;}
   const tmp=target+'.part';let bytes=0;
   const stream=fs.createWriteStream(tmp);
   res.on('data',chunk=>{bytes+=chunk.length;if(bytes>max)req.destroy(Error('Smart runtime exceeds safety limit'));});
   res.on('error',err=>{stream.destroy();reject(err);});
   stream.on('error',reject);
   stream.on('finish',()=>{
    if(bytes<min||bytes>max){fs.rmSync(tmp,{force:true});reject(Error('Unexpected runtime size: '+file));return;}
    fs.renameSync(tmp,target);console.log('Prepared local Smart ONNX runtime: '+file+' ('+Math.round(bytes/1024)+' KB)');
    resolve();
   });
   res.pipe(stream);
  });
  req.on('timeout',()=>req.destroy(Error('Smart ONNX runtime download timed out')));
  req.on('error',reject);
 });
}
Promise.all(smartAssets.map(([file,min,max])=>fetchSmartAsset(file,min,max)))
 .catch(error=>{console.error('Failed to package offline Smart ONNX runtime:',error.message);process.exitCode=1;});
