'use strict';
/* One-click optional Whisper setup for v4.23.45.
   Downloads pinned, SHA256-verified community whisper.cpp CLI binaries and original
   multilingual ggml-base.bin weights into the app's per-user data, after explicit click.
   Nothing is downloaded or executed automatically on application launch. */
const fs=require('node:fs'),path=require('node:path'),https=require('node:https'),crypto=require('node:crypto'),os=require('node:os');
const {spawn}=require('node:child_process');
const VERSION='v1.0.0';
const BINARIES=Object.freeze({
 'darwin-arm64':['whisper-cpp-darwin-arm64.zip','d033bd3f590cad50f39957bf86354f87b44394cb001e3f78a7b47264358103e3'],
 'darwin-x64':['whisper-cpp-darwin-x64.zip','f0f2ab6c2e92b7022ac02f0759a7a38f3ea110764e00b05a6f0d6c1dcadd571c'],
 'win32-x64':['whisper-cpp-win32-x64-cpu.zip','80f6b6481794825f65043001e408e70aea4257918b15906b7e070d2c7b205da5']
});
const MODEL_URL='https://huggingface.co/ggerganov/whisper.cpp/resolve/5359861c739e955e79d9a303bcbc70fb988958b1/ggml-base.bin';
const MODEL_SHA='60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe';
function exists(p,min=1){try{return fs.statSync(p).isFile()&&fs.statSync(p).size>=min;}catch{return false;}}
function downloadFile(url,out,sha,notify=()=>{},maxSize=170*1024*1024){
 return new Promise((resolve,reject)=>{
  let finished=false,stream=null;const fail=e=>{if(finished)return;finished=true;
   try{stream?.destroy();}catch{};fs.promises.rm(out,{force:true}).catch(()=>{});reject(e);};
  const open=(target,n=0)=>{
   if(n>8)return fail(Error('Quá nhiều chuyển hướng download'));
   let uri;try{uri=new URL(target);}catch(e){return fail(e);}
   const host=uri.hostname;
   const approved=(host==='github.com'||host==='release-assets.githubusercontent.com'||host==='huggingface.co'||host==='cas-bridge.xethub.hf.co'||host==='cdn-lfs.hf.co'||host==='cdn-lfs-us-1.hf.co'||host==='objects.githubusercontent.com'||host.endsWith('.xethub.hf.co'));
   if(uri.protocol!=='https:'||!approved)return fail(Error('Nguồn tải Whisper không được phép: '+host));
   const req=https.get(uri,{timeout:45000,headers:{'User-Agent':'OpenIPTVPro-Desktop'}},res=>{
    if([301,302,303,307,308].includes(res.statusCode)){
     const next=res.headers.location;res.resume();
     return next?open(new URL(next,uri).href,n+1):fail(Error('Missing redirect destination'));
    }
    if(res.statusCode!==200){res.resume();return fail(Error('Whisper download HTTP '+res.statusCode));}
    let received=0;const sum=crypto.createHash('sha256');
    stream=fs.createWriteStream(out,{mode:0o600});
    res.on('data',chunk=>{
     received+=chunk.length;
     if(received>maxSize){res.destroy(Error('File vượt dung lượng tối đa'));return;}
     sum.update(chunk);
     if(received%(8*1048576)<chunk.length)notify('Đã tải '+Math.round(received/1048576)+' MB');
    });
    res.once('error',fail);stream.once('error',fail);
    stream.once('finish',()=>{
     if(finished)return;
     const actual=sum.digest('hex');
     if(actual!==sha)return fail(Error('Sai checksum SHA-256 của mô hình Whisper'));
     finished=true;resolve(out);
    });
    res.pipe(stream);
   });
   req.once('timeout',()=>req.destroy(Error('Download Whisper quá thời gian')));
   req.once('error',fail);
  };
  open(url);
 });
}
function createWhisperAutoInstaller({dataDir,notify=()=>{},platform=process.platform,arch=process.arch,spawnProcess=spawn,download=downloadFile}={}){
 if(!dataDir)throw Error('Missing user data directory');
 const root=path.join(dataDir,'live-caption','auto');
 const binaryName=platform==='win32'?'whisper-cli.exe':'whisper-cli';
 const binDir=path.join(root,'binary'),model=path.join(root,'ggml-base.bin');
 const key=platform+'-'+arch,asset=BINARIES[key];
 // Release assets are called whisper-cpp-darwin-arm64 / whisper-cpp-darwin-x64
 // and whisper-cpp-win32-x64-cpu.exe, NOT whisper-cli. Always normalize.
 const packagedBinaryName=asset?.[0]?.replace(/\.zip$/i,platform==='win32'?'.exe':'')||'';
 let active=null;
 const report=message=>notify({type:'setup-progress',message});
 function findBinary(names){
  const expected=new Set(names.filter(Boolean));
  const walk=(dir,depth=0)=>{
   if(!fs.existsSync(dir)||depth>4)return null;
   for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const found=path.join(dir,item.name);
    if(item.isFile()&&expected.has(item.name)&&exists(found,50000))return found;
    if(item.isDirectory()){
     const deeper=walk(found,depth+1);
     if(deeper)return deeper;
    }
   }
   return null;
  };
  return walk(binDir);
 }
 function status(){
  const binary=findBinary([binaryName]);
  return {installed:!!binary&&exists(model,1000000),binary,model,available:!!asset,
   downloading:!!active,modelBytes:exists(model)?fs.statSync(model).size:0};
 }
 // Repair partially installed v4.23.45 without downloading the same 1MB ZIP again.
 function normalizeBinary(){
  const canonical=findBinary([binaryName]);
  if(canonical){
   if(platform!=='win32')fs.chmodSync(canonical,0o700);
   return canonical;
  }
  const source=findBinary([packagedBinaryName]);
  if(!source)return null;
  // Leave Windows runtime DLLs alongside renamed exe if present.
  const destination=path.join(path.dirname(source),binaryName);
  if(fs.existsSync(destination))fs.rmSync(destination,{force:true});
  fs.renameSync(source,destination);
  if(platform!=='win32')fs.chmodSync(destination,0o700);
  return destination;
 }
 function run(exe,args){
  return new Promise((resolve,reject)=>{
   if(!active)return reject(Error('Đã hủy cài Whisper'));
   let child,done=false;const token=active;
   try{child=spawnProcess(exe,args,{shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});}
   catch(e){return reject(e);}
   token.child=child;let err='';
   const timer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},60000);
   const finish=e=>{if(done)return;done=true;clearTimeout(timer);if(token.child===child)token.child=null;
    e?reject(e):resolve();};
   child.stderr.on('data',data=>{err=(err+data.toString()).slice(-500)});
   child.once('error',finish);
   child.once('close',code=>active!==token?finish(Error('Đã hủy')):code===0?finish():finish(Error(err||'Lỗi giải nén Whisper')));
  });
 }
 async function install(){
  if(active)throw Error('Whisper đang được cài, không thể chạy 2 lần');
  if(!asset)throw Error('Chưa hỗ trợ CPU này. Chọn công cụ Whisper thủ công.');
  active={child:null};fs.mkdirSync(root,{recursive:true});
  try{
   normalizeBinary();
   const latest=status();
   if(latest.installed)return latest;
   if(!latest.binary){
    report('Tải bộ chạy Whisper.cpp có kiểm tra SHA-256…');
    const archive=path.join(root,asset[0]);
    await download('https://github.com/sjoerdteunisse/whisper.cpp/releases/download/'+VERSION+'/'+asset[0],archive,asset[1],report,30*1048576);
    fs.mkdirSync(binDir,{recursive:true});
    try{
     if(platform==='win32'){
      const q=s=>s.replace(/'/g,"''");
      await run('powershell.exe',['-NoProfile','-NonInteractive','-Command',
       "Expand-Archive -LiteralPath '"+q(archive)+"' -DestinationPath '"+q(binDir)+"' -Force"]);
     }else await run('unzip',['-oq',archive,'-d',binDir]);
    }finally{await fs.promises.rm(archive,{force:true}).catch(()=>{});}
    const discovered=normalizeBinary();
    if(!discovered){
     throw Error('Gói Whisper đã giải nén nhưng không tìm thấy file '+packagedBinaryName+' (hoặc '+binaryName+').');
    }
    report('Đã nhận diện '+path.basename(discovered)+' đúng CPU '+key);
    try{await run(discovered,['--help']);}
    catch(e){throw Error('Bộ chạy Whisper không thực thi được trên máy này: '+String(e.message||e).slice(0,190));}
   }
   if(!exists(model,1000000)){
    report('Tải mô hình Whisper đa ngôn ngữ (~148 MB). Chỉ tải một lần…');
    const temp=model+'.part';await download(MODEL_URL,temp,MODEL_SHA,report,170*1024*1024);
    await fs.promises.rename(temp,model);
   }
   const complete=status();
   if(!complete.installed)throw Error('Thiếu công cụ hoặc mô hình Whisper sau khi cài.');
   if(platform!=='win32')fs.chmodSync(complete.binary,0o700);
   report('Whisper và mô hình đã cài xong, có thể dùng offline.');
   return complete;
  }catch(e){report('Lỗi tự cài Whisper: '+String(e.message||e).slice(0,180));throw e;}
  finally{active=null;}
 }
 function cancel(){const s=active;active=null;if(s?.child)try{s.child.kill('SIGKILL');}catch{};return !!s;}
 return Object.freeze({status,install,cancel});
}
module.exports={createWhisperAutoInstaller,BINARIES,MODEL_SHA,MODEL_URL,downloadFile};
