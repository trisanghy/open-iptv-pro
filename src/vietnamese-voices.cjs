'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const VOICES=Object.freeze({
 'vietvoice:female:northern:news':{name:'VietVoice · nữ Bắc · tin tức',family:'vietvoice',minRamGB:8,recRamGB:16},
 'vietvoice:male:northern:news':{name:'VietVoice · nam Bắc · tin tức',family:'vietvoice',minRamGB:8,recRamGB:16},
 'vietvoice:female:central:story':{name:'VietVoice · nữ Trung · kể chuyện',family:'vietvoice',minRamGB:8,recRamGB:16},
 'vietvoice:male:central:story':{name:'VietVoice · nam Trung · kể chuyện',family:'vietvoice',minRamGB:8,recRamGB:16},
 'vietvoice:female:southern:news':{name:'VietVoice · nữ Nam · tin tức',family:'vietvoice',minRamGB:8,recRamGB:16},
 'vietvoice:male:southern:story':{name:'VietVoice · nam Nam · kể chuyện',family:'vietvoice',minRamGB:8,recRamGB:16},
 'f5vi:reference':{name:'F5-TTS Vietnamese · giọng mẫu (phi thương mại)',family:'f5',minRamGB:16,recRamGB:32}
});
const SOURCES=Object.freeze({
 vietvoice:'git+https://github.com/nguyenvulebinh/VietVoice-TTS.git@d4e8a22525437fc976ee9bc4dfd41ceb4b311248',
 f5:'f5-tts==1.1.22'
});
function validVoice(voice){return Object.hasOwn(VOICES,voice);}
function createVietnameseVoices({dataDir,installer,spawnProcess=spawn,platform=process.platform,notify=()=>{}}={}){
 if(!dataDir||!installer?.prepareUv)throw Error('Private app storage and UV downloader required');
 const root=path.join(dataDir,'vi-tts'),cache=path.join(root,'vietvoice-model');
 const f5Model=path.join(root,'f5-model'),venv=path.join(root,'python-env');
 const python=path.join(venv,platform==='win32'?'Scripts':'bin',platform==='win32'?'python.exe':'python');
 let active='',child=null;
 const present=p=>{try{return fs.statSync(p).isFile();}catch{return false;}};
 const dirSize=p=>{
  let size=0;
  function walk(x,depth){if(depth>32)return;let st;try{st=fs.lstatSync(x);}catch{return;}
   if(st.isSymbolicLink())return;
   if(st.isFile())size+=st.size;
   else if(st.isDirectory())for(const name of fs.readdirSync(x))walk(path.join(x,name),depth+1);
  }walk(p,0);return size;
 };
 const voiceFamily=id=>{if(!validVoice(id))throw Error('Giọng Việt không hợp lệ');return VOICES[id].family;};
 const ready=fam=>present(python)&&present(path.join(root,fam+'.runtime.ready'))&&(
  fam==='f5'?
   present(path.join(root,'f5.ready'))&&present(path.join(f5Model,'model_latest.safetensors'))&&present(path.join(f5Model,'vocab.txt')):
   present(path.join(root,'vietvoice.ready'))&&dirSize(cache)>1000000000);
 const report=message=>{try{notify({type:'progress',target:'vi',message:String(message).slice(0,160)});}catch{}};
 function execute(bin,args,timeout=7200000,envExtra={}){
  return new Promise((resolve,reject)=>{
   let stderr='',settled=false;
   const command=spawnProcess(bin,args,{shell:false,windowsHide:true,stdio:['ignore','pipe','pipe'],env:{
    ...process.env,HF_HOME:path.join(root,'huggingface'),
    HF_HUB_DISABLE_TELEMETRY:'1',TOKENIZERS_PARALLELISM:'false',
    UV_CACHE_DIR:path.join(root,'uv-cache'),
    UV_PYTHON_INSTALL_DIR:path.join(root,'python-managed'),...envExtra
   }});
   child=command;
   const timeoutTimer=setTimeout(()=>{command.kill('SIGKILL');},timeout);
   const finish=e=>{if(settled)return;settled=true;clearTimeout(timeoutTimer);
    if(child===command)child=null;
    if(e)reject(e);else resolve();};
   command.on('error',finish);
   command.stderr?.on('data',b=>{stderr=(stderr+b.toString('utf8')).slice(-1100);});
   command.stdout?.on('data',b=>{
    const str=b.toString('utf8').trim();
    if(str)report(str.slice(-140));
   });
   command.on('close',code=>code===0?finish():finish(Error('TTS process '+code+': '+stderr.slice(-300))));
  });
 }
 function copiedBridge(){
  fs.mkdirSync(root,{recursive:true,mode:0o700});
  const original=fs.readFileSync(path.join(__dirname,'vietnamese-voices-bridge.py'));
  const dest=path.join(root,'vietnamese-voices-bridge.py');
  fs.writeFileSync(dest,original,{mode:0o600});return dest;
 }
 async function createEnv(family){
  const uv=await installer.prepareUv();
  if(!present(python)){
   await execute(uv,['python','install','3.11'],360000);
   await execute(uv,['venv',venv,'--python','3.11','--python-preference','only-managed'],360000);
  }
  const marker=path.join(root,family+'.runtime.ready');
  if(!present(marker)){
   if(family==='vietvoice'){
    await execute(uv,['pip','install','--python',python,SOURCES.vietvoice,'onnxruntime>=1.15,<2','torch','soundfile','pydub'],1200000);
    await execute(python,['-c','import vietvoicetts, onnxruntime'],120000);
   }else{
    await execute(uv,['pip','install','--python',python,SOURCES.f5,'huggingface-hub'],1500000);
    await execute(python,['-c','from f5_tts.api import F5TTS; import huggingface_hub'],120000);
   }
   fs.writeFileSync(marker,family,{mode:0o600});
  }
 }
 async function install(id){
  const family=voiceFamily(id);
  if(active)throw Error('Đang cài bộ đọc '+active);
  if(ready(family))return availability(id);
  active=family;
  try{
   report('Chuẩn bị bộ đọc tiếng Việt '+family+' trong môi trường riêng...');
   await createEnv(family);
   const bridge=copiedBridge();
   if(family==='vietvoice'){
    // Model 1.51GB: first synthesis downloads actual upstream ONNX archive.
    await execute(python,[bridge,'vietvoice','Xin chào, đây là giọng thử. ',
      path.join(root,'vietvoice-probe.wav'),cache,'northern','female','news'],7200000);
    if(dirSize(cache)<1000000000)throw Error('VietVoice model chưa tải đủ');
    fs.writeFileSync(path.join(root,'vietvoice.ready'),'ok',{mode:0o600});
    await fs.promises.rm(path.join(root,'vietvoice-probe.wav'),{force:true});
   }else{
    report('F5-TTS Vietnamese · tải model phi thương mại ~1.35GB...');
    await execute(python,[bridge,'f5-install',f5Model],7200000);
    fs.writeFileSync(path.join(root,'f5.ready'),'cc-by-nc-4.0',{mode:0o600});
   }
   return availability(id);
  }finally{active='';}
 }
 function availability(id){
  const family=voiceFamily(id),prepared=ready(family);
  return {id,ready:prepared,installed:prepared,voiceReady:prepared,premium:true,
    engine:family==='vietvoice'?'VietVoice TTS · ONNX CPU 24 kHz':'F5-TTS Vietnamese · 24 kHz · tham chiếu giọng mẫu',
    offline:true,installing:active===family,target:'vi',family,
    reason:prepared?(family==='f5'?'Chọn giọng mẫu và nhập đúng lời mẫu để sử dụng F5.':''):
     'Chưa cài '+family+' · bấm Cài mô hình; cần mạng lần đầu.',
    ...VOICES[id]};
 }
 async function speak(id,text,output,{refAudio='',refText=''}={}){
  const family=voiceFamily(id);
  if(!ready(family))throw Error('Giọng '+family+' chưa cài');
  if(active)throw Error('Đang cài bộ đọc tiếng Việt');
  // VietVoice voiceId format: vietvoice:gender:area:group
  const [_,gender,area,group]=id.split(':');
  const args=family==='vietvoice'?
   [copiedBridge(),'vietvoice',text,output,cache,area,gender,group]:
   [copiedBridge(),'f5',text,output,f5Model,refAudio,refText];
  if(family==='f5'&&(!refAudio||!refText.trim()))
   throw Error('F5 cần file giọng mẫu có sự đồng ý và bản chép lời mẫu');
  await execute(python,args,240000);
  if(!present(output))throw Error('Chưa tạo được WAV tiếng Việt');
  return output;
 }
 async function stop(){if(child){try{child.kill('SIGTERM');}catch{}}}
 async function remove(id){
  const family=id==='f5vi'?'f5':id==='vietvoice'?'vietvoice':id==='viettts-runtime'?'runtime':null;
  if(!family)throw Error('Unknown Vietnamese TTS model');
  if(active===family)throw Error('Đang cài mô hình này');
  await stop();
  const folder=family==='f5'?f5Model:family==='runtime'?venv:cache;
  const bytes=dirSize(folder);
  await fs.promises.rm(folder,{recursive:true,force:true});
  await fs.promises.rm(path.join(root,family+'.ready'),{force:true});
  if(family==='runtime')
   for(const name of ['f5.runtime.ready','vietvoice.runtime.ready'])
    await fs.promises.rm(path.join(root,name),{force:true});
  return {id,freed:bytes,items:states()};
 }
 function state(id){return availability(id);}
 function states(){
  const listed=['vietvoice','f5'].map(family=>{
   const id=family==='f5'?'f5vi':'vietvoice';
   const bytes=dirSize(family==='f5'?f5Model:cache);
   return {id,label:family==='f5'?'F5-TTS Vietnamese · phi thương mại':'VietVoice-TTS · ONNX',
    bytes,present:bytes>0,minRamGB:family==='f5'?16:8,recRamGB:family==='f5'?32:16,
    installing:active===family,device:'macOS/Windows',family,installed:ready(family)};
  });
  const bytes=dirSize(venv);
  listed.push({id:'viettts-runtime',label:'Bộ chạy VietVoice/F5 · cài lại khi cần',
   bytes,present:bytes>0,device:'macOS/Windows',family:'runtime'});
  return listed;
 }
 return Object.freeze({VOICES,validVoice,availability,state,states,install,speak,stop,remove,ready});
}
module.exports={VOICES,createVietnameseVoices};
