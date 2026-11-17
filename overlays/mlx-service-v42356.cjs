'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const MODELS=Object.freeze({
 hymt18:{repo:'mlx-community/Hy-MT2-1.8B-4bit',label:'Hy-MT2 1.8B · Nhanh',family:'hymt',approxBytes:1100000000},
 hymt7:{repo:'mlx-community/Hy-MT2-7B-4bit',label:'Hy-MT2 7B · Chất lượng',family:'hymt',approxBytes:4550000000},
 hymt18q8:{repo:'mlx-community/Hy-MT2-1.8B-8bit',label:'Hy-MT2 1.8B · 8-bit',family:'hymt',approxBytes:1900000000},
 hymt7q8:{repo:'mlx-community/Hy-MT2-7B-8bit',label:'Hy-MT2 7B · 8-bit',family:'hymt',approxBytes:8000000000},
 qwen06:{repo:'mlx-community/Qwen3-0.6B-4bit',label:'Qwen3 0.6B · Siêu nhẹ',family:'qwen',approxBytes:360000000},
 qwen17:{repo:'mlx-community/Qwen3-1.7B-4bit',label:'Qwen3 1.7B · Cân bằng',family:'qwen',approxBytes:980000000},
 qwen4:{repo:'mlx-community/Qwen3-4B-4bit',label:'Qwen3 4B · Linh hoạt',family:'qwen',approxBytes:2300000000},
 qwen8:{repo:'mlx-community/Qwen3-8B-4bit',label:'Qwen3 8B · Nâng cao',family:'qwen',approxBytes:4600000000}
});
const LANGS=new Set(['en','vi','zh','fr','es','de','ja','ko','pt','it','ru','id','ar','hi','th']);
const fileOK=(p,minBytes=0)=>{try{return fs.statSync(p).isFile()&&fs.statSync(p).size>minBytes;}catch{return false;}};
function sizeOf(target){
 let total=0;
 function walk(p,depth){
  if(depth>30)return;
  let stat;try{stat=fs.lstatSync(p);}catch{return;}
  if(stat.isSymbolicLink())return;
  if(stat.isFile()){total+=stat.size;return;}
  if(stat.isDirectory())for(const entry of fs.readdirSync(p))walk(path.join(p,entry),depth+1);
 }
 walk(target,0);return total;
}
function createHyMTService({dataDir,installer,platform=process.platform,arch=process.arch,spawnProcess=spawn,notify=()=>{}}={}){
 if(!dataDir||!installer)throw Error('Hy-MT2 requires app-private dataDir and UV installer');
 const root=path.join(dataDir,'ai-translate'),models=path.join(root,'models');
 const venv=path.join(root,'python-env');
 const python=path.join(venv,platform==='win32'?'Scripts':'bin',platform==='win32'?'python.exe':'python');
 const bridge=path.join(root,'hymt-bridge.py');
 const runtimeMarker=path.join(root,'mlx-runtime.ready');
 const runtimeReady=()=>fileOK(python)&&fs.existsSync(runtimeMarker);
 let activeInstall='',worker=null,workerKey='',nextId=1,readyPromise=null;
 const pending=new Map();
 const alive=()=>platform==='darwin'&&arch==='arm64';
 const isValidKey=key=>Object.hasOwn(MODELS,key);
 function dir(key){if(!isValidKey(key))throw Error('Mô hình AI không hợp lệ');return path.join(models,key);}
 const env=key=>({...process.env,HF_HOME:path.join(dir(key),'hub-cache'),
  HF_HUB_DISABLE_TELEMETRY:'1',TOKENIZERS_PARALLELISM:'false',
  UV_CACHE_DIR:path.join(root,'uv-cache'),
  UV_PYTHON_INSTALL_DIR:path.join(root,'python-managed')});
 function script(){
  fs.mkdirSync(root,{recursive:true,mode:0o700});
  const source=fs.readFileSync(path.join(__dirname,'hymt-bridge.py'));
  const temporary=bridge+'.new-'+process.pid;
  try{fs.writeFileSync(temporary,source,{mode:0o600});fs.renameSync(temporary,bridge);}
  finally{try{fs.rmSync(temporary,{force:true});}catch{}}
  return bridge;
 }
 const installed=key=>{
  if(!isValidKey(key))return false;
  const weights=path.join(dir(key),'weights');
  if(!fileOK(path.join(weights,'config.json'),200)||
     !fileOK(path.join(weights,'tokenizer.json'),100000))return false;
  const indexPath=path.join(weights,'model.safetensors.index.json');
  if(fileOK(indexPath,50)){
   try{
    const map=JSON.parse(fs.readFileSync(indexPath,'utf8')).weight_map;
    const shards=new Set(Object.values(map||{}));
    return shards.size>0&&[...shards].every(filename=>
     typeof filename==='string'&&path.basename(filename)===filename&&
     fileOK(path.join(weights,filename),1000000))&&
     [...shards].reduce((sum,filename)=>sum+fs.statSync(path.join(weights,filename)).size,0)>10000000;
   }catch{return false;}
  }
  try{return fs.readdirSync(weights).some(filename=>
   /^model(?:-\d+-of-\d+)?\.safetensors$/.test(filename)&&
    fileOK(path.join(weights,filename),10000000));}
  catch{return false;}
 };
 function state(key){
  if(!isValidKey(key))throw Error('Mô hình AI không hợp lệ');
  return {...MODELS[key],id:key,installed:installed(key),supported:alive(),
   running:workerKey===key&&!!worker,installing:activeInstall===key,runtimeReady:runtimeReady(),
   bytes:sizeOf(dir(key)),reason:alive()?'':'MLX cần máy Mac Apple Silicon (ARM64)'};
 }
 const progress=message=>{try{notify({type:'ai-progress',message:String(message).slice(0,200)});}catch{}};
 function run(bin,args,key,timeout=900000){
  return new Promise((resolve,reject)=>{
   let stdout='',stderr='',done=false,child;
   try{child=spawnProcess(bin,args,{shell:false,windowsHide:true,stdio:['ignore','pipe','pipe'],env:env(key)});}
   catch(error){reject(error);return;}
   const timer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},timeout);
   const finish=error=>{
    if(done)return;done=true;clearTimeout(timer);
    error?reject(error):resolve(stdout.trim());
   };
   child.stdout.on('data',data=>{stdout=(stdout+data.toString()).slice(-1800);});
   child.stderr.on('data',data=>{
    stderr=(stderr+data.toString()).slice(-2000);
    const line=stderr.split(/\r?\n/).filter(Boolean).slice(-1)[0];
    if(line&&line.length<200)progress(line);
   });
   child.on('error',finish);
   child.on('close',code=>code===0?finish():finish(Error((stderr||'Hy-MT2 exit '+code).slice(-350))));
  });
 }
 async function install(key){
  if(!isValidKey(key))throw Error('Mô hình AI không được hỗ trợ');
  if(!alive())throw Error('Các mô hình MLX hiện chỉ hỗ trợ Mac Apple Silicon');
  if(activeInstall)throw Error('Đang tải mô hình '+activeInstall+'; không thể tải đồng thời');
  if(installed(key)&&runtimeReady())return state(key);
  activeInstall=key;
  try{
   fs.mkdirSync(dir(key),{recursive:true});
   progress('Chuẩn bị Python MLX và tải '+MODELS[key].label+' (một lần)…');
   // Shared official uv downloader is SHA256 verified by the existing AI installer.
   const uvPath=await installer.prepareUv();
   if(!fileOK(python)){
    await run(uvPath,['python','install','3.11'],key,300000);
    await run(uvPath,['venv',venv,'--python','3.11','--python-preference','only-managed'],key,240000);
   }
   if(!runtimeReady()){
    progress('Đang cài mlx-lm và huggingface-hub trong môi trường riêng…');
    await run(uvPath,['pip','install','--python',python,'mlx-lm','huggingface-hub'],key,900000);
    await run(python,['-c','import mlx_lm, huggingface_hub'],key,180000);
    fs.writeFileSync(runtimeMarker,'mlx-lm\n',{mode:0o600});
   }
   if(!installed(key)){
    progress('Đang tải mô hình '+MODELS[key].label+' · có thể cần vài GB…');
    await run(python,['-u',script(),'install',key,dir(key)],key,3600000);
   }else progress('Đã khôi phục runtime MLX; giữ nguyên mô hình '+MODELS[key].label);
   if(!installed(key))throw Error('Mô hình tải chưa hoàn chỉnh; có thể thử cài tiếp sau');
   progress('Đã tải '+MODELS[key].label+' vào bộ nhớ ứng dụng');
   return state(key);
  }finally{activeInstall='';}
 }
 function failAll(reason){
  for(const item of pending.values())item.reject(Error(reason));
  pending.clear();
 }
 async function stop(){
  if(worker){
   const old=worker;worker=null;workerKey='';readyPromise=null;
   try{old.kill('SIGTERM');}catch{}
  }
  failAll('Đã dừng bộ dịch AI');
 }
 async function start(key){
  if(!alive())throw Error('Cần Mac Apple Silicon để chạy MLX offline');
  if(!installed(key))throw Error('Chưa tải '+MODELS[key]?.label+'. Mở ⚙ > Cài đặt để tải');
  if(!runtimeReady())throw Error('Thiếu môi trường MLX. Mở ⚙ để cài lại runtime mà không tải lại mô hình.');
  if(worker&&workerKey===key&&readyPromise)return readyPromise;
  await stop();
  script();
  workerKey=key;
  const child=spawnProcess(python,['-u',bridge,'worker',key,dir(key)],{
   shell:false,windowsHide:true,stdio:['pipe','pipe','pipe'],env:env(key)
  });
  worker=child;
  readyPromise=new Promise((resolve,reject)=>{
   let waiting=true,out='',err='';
   const timer=setTimeout(()=>{if(waiting){waiting=false;reject(Error('Hy-MT2 tải quá lâu'));try{child.kill();}catch{}}},180000);
   const finalize=e=>{if(waiting){waiting=false;clearTimeout(timer);e?reject(e):resolve(true);}};
   child.stdout.on('data',data=>{
    out+=data.toString('utf8');
    if(out.length>200000){out='';return;}
    let index;
    while((index=out.indexOf('\n'))>=0){
     const line=out.slice(0,index);out=out.slice(index+1);
     let msg;try{msg=JSON.parse(line);}catch{continue;}
     if(msg.type==='ready'){finalize();continue;}
     const request=pending.get(msg.id);
     if(request){pending.delete(msg.id);clearTimeout(request.timer);
      msg.ok?request.resolve(String(msg.text||'')):request.reject(Error(String(msg.error||'Hy-MT2 inference failed')));}
    }
   });
   child.stderr.on('data',data=>{err=(err+data.toString()).slice(-900);});
   child.on('error',finalize);
   child.on('exit',code=>{
    finalize(Error((err||'Hy-MT2 exited '+code).slice(-350)));
    if(worker===child){worker=null;workerKey='';readyPromise=null;}
    failAll('Hy-MT2 đã dừng: '+(err||code).toString().slice(-200));
   });
  });
  return readyPromise;
 }
 let queue=Promise.resolve();
 function translate(text,target,source='en',key='hymt18'){
  if(!isValidKey(key)||!LANGS.has(target)||!LANGS.has(source))return Promise.reject(Error('Cặp dịch/mô hình MLX không hợp lệ'));
  const raw=String(text||'').trim().slice(0,1200);
  if(!raw)return Promise.resolve('');
  if(source===target)return Promise.resolve(raw);
  // Serial inference, avoiding overlapping MLX GPU allocations.
  const task=queue.catch(()=>{}).then(async()=>{
   await start(key);
   return new Promise((resolve,reject)=>{
    if(!worker)return reject(Error('Hy-MT2 không hoạt động'));
    const id=nextId++;
    const timer=setTimeout(()=>{pending.delete(id);reject(Error('Hy-MT2 dịch quá thời hạn'));},120000);
    pending.set(id,{resolve,reject,timer});
    try{worker.stdin.write(JSON.stringify({id,source,target,text:raw})+'\n');}
    catch(e){clearTimeout(timer);pending.delete(id);reject(e);}
   });
  });
  queue=task.then(()=>{},()=>{});
  return task;
 }
 async function deleteModel(key){
  if(!isValidKey(key))throw Error('Mô hình AI không hợp lệ');
  if(activeInstall===key)throw Error('Đang tải mô hình này, không thể xóa');
  if(workerKey===key)await stop();
  const folder=dir(key);
  if(fs.existsSync(folder)){
   const stat=fs.lstatSync(folder);if(stat.isSymbolicLink())throw Error('Không xóa đường dẫn liên kết');
   await fs.promises.rm(folder,{recursive:true,force:true});
  }
  return state(key);
 }
 return Object.freeze({MODELS,state,install,translate,stop,deleteModel,installed,sizeOf,root});
}
module.exports={createHyMTService,MODELS,sizeOf};
