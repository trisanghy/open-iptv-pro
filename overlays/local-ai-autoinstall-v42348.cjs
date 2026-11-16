'use strict';
// Managed, opt-in, one-click model installer. Downloads only official pinned uv and the
// selected open-source models into the app's userData. No elevated privileges or shell scripts.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),https=require('node:https'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const VOICES=Object.freeze({
 en:'en_US-lessac-low', vi:'vi_VN-25hours_single-low',
 es:'es_ES-mls_10246-low',fr:'fr_FR-siwis-low',de:'de_DE-thorsten-low',
 zh:'zh_CN-huayan-x_low',pt:'pt_BR-edresson-low',it:'it_IT-riccardo-x_low',
 ru:'ru_RU-irina-medium',id:'id_ID-news_tts-medium'
});

const EXTRA_VOICES=Object.freeze({
 vi:Object.freeze(['vi_VN-25hours_single-low','vi_VN-vais1000-medium','vi_VN-vivos-x_low']),
 en:Object.freeze(['en_US-lessac-low','en_US-amy-medium'])
});
function voiceOptions(lang){
 const standard=VOICES[lang];
 if(!standard)throw Error('Chưa hỗ trợ ngôn ngữ giọng đọc '+lang);
 return EXTRA_VOICES[lang]||[standard];
}
function voiceIdFor(lang,id){
 const name=String(id||VOICES[lang]||'');
 if(!voiceOptions(lang).includes(name))throw Error('Giọng đọc không có trong danh sách hỗ trợ');
 return name;
}

const UV_RELEASE='0.12.24';
const UV=Object.freeze({
 'darwin-arm64':['uv-aarch64-apple-darwin.tar.gz','0c4346de7abdb49495b393b9ec809fe387aa43e586be20fecb972216c1e71732'],
 'darwin-x64':['uv-x86_64-apple-darwin.tar.gz','4fa82e37cb94767661f532b001e470b67a186c7260e305bd84ddb78fd545c0b6'],
 'win32-x64':['uv-x86_64-pc-windows-msvc.zip','7c38608c8a18ee137d748a1773053b07ec8f3a30fab49aebaa6f4e4efeceb019'],
 'win32-arm64':['uv-aarch64-pc-windows-msvc.zip','4b783bda5cc44bbae0651a837223873a7acee31152381aef5fc86ef6bef25997']
});
function uvReleaseFor(platform=process.platform,arch=process.arch){return UV[platform+'-'+arch]||null;}
function downloadPinned(url,where,expected,{limit=40*1024*1024,onProgress=()=>{},request=https.get}={}){
 return new Promise((resolve,reject)=>{
  let n=0,requestObject=null,settled=false,stream=null;
  const rejectOnce=e=>{if(settled)return;settled=true;try{stream?.destroy();}catch{};fs.promises.rm(where,{force:true}).catch(()=>{});reject(e);};
  const follow=(target,depth=0)=>{
   if(depth>5)return rejectOnce(Error('Too many redirects'));
   let u;try{u=new URL(target);}catch(e){return rejectOnce(e);}
   if(u.protocol!=='https:'||!['github.com','release-assets.githubusercontent.com','objects.githubusercontent.com','releases.astral.sh'].includes(u.hostname))
     return rejectOnce(Error('Unexpected installer download host'));
   requestObject=request(u,{timeout:20000,headers:{'User-Agent':'OpenIPTVPro-Desktop'}} ,response=>{
    if([301,302,303,307,308].includes(response.statusCode)){
     const next=response.headers.location;response.resume();
     return next?follow(new URL(next,u).href,depth+1):rejectOnce(Error('No redirect destination'));
    }
    if(response.statusCode!==200){response.resume();return rejectOnce(Error('Installer download HTTP '+response.statusCode));}
    stream=fs.createWriteStream(where,{mode:0o600});
    const hash=crypto.createHash('sha256');
    response.on('data',chunk=>{n+=chunk.length;if(n>limit){response.destroy(Error('Download exceeds limit'));return;}
     hash.update(chunk);onProgress(n);});
    response.on('error',rejectOnce);stream.on('error',rejectOnce);
    stream.once('finish',()=>{if(settled)return;const actual=hash.digest('hex');if(actual!==expected)return rejectOnce(Error('Installer checksum mismatch'));
     settled=true;resolve(where);});
    response.pipe(stream);
   });
   requestObject.once('timeout',()=>requestObject.destroy(Error('Download timed out')));
   requestObject.once('error',rejectOnce);
  };
  follow(url);
 });
}
function createAutoModelInstaller({dataDir,notify=()=>{},platform=process.platform,arch=process.arch,spawnProcess=spawn,download=downloadPinned}={}){
 if(!dataDir)throw Error('Installer dataDir is required');
 const root=path.join(dataDir,'local-tts'),uvDir=path.join(root,'uv'),venv=path.join(root,'python-env');
 const voices=path.join(root,'voices'),argosDir=path.join(root,'argos-packages');
 const exe=platform==='win32'?'.exe':'';
 const python=path.join(venv,platform==='win32'?'Scripts':'bin','python'+exe);
 const piper=path.join(venv,platform==='win32'?'Scripts':'bin','piper'+exe);
 const argos=path.join(venv,platform==='win32'?'Scripts':'bin','argos-translate'+exe);
 const pm=path.join(venv,platform==='win32'?'Scripts':'bin','argospm'+exe);
 const uv=path.join(uvDir,'uv'+exe);
 const pairsPath=path.join(root,'installed-pairs.json');
 let active=null;
 const safeLang=lang=>{if(!Object.hasOwn(VOICES,lang))throw Error('Chưa hỗ trợ giọng đọc '+lang);return lang;};
 function voiceFile(lang,voiceId){return path.join(voices,voiceIdFor(safeLang(lang),voiceId)+'.onnx');}
 function hasFile(p,min=10){try{return fs.statSync(p).isFile()&&fs.statSync(p).size>=min;}catch{return false;}}
 function pairReady(lang){
  if(lang==='en')return true;
  if(!/^[a-z]{2,3}$/.test(lang))return false;
  // Real installed metadata, not stale v4.23.46 installed-pairs.json booleans.
  try{
   return fs.readdirSync(argosDir,{withFileTypes:true}).some(item=>{
    if(!item.isDirectory())return false;
    const metadata=path.join(argosDir,item.name,'metadata.json');
    if(!hasFile(metadata,10))return false;
    const model=JSON.parse(fs.readFileSync(metadata,'utf8'));
    return model.from_code==='en'&&model.to_code===lang&&(!model.type||model.type==='translate');
   });
  }catch{return false;}
 }
 function state(lang='vi',voiceId){
  safeLang(lang);
  const voice=voiceFile(lang,voiceId);
  return {installed:hasFile(piper)&&hasFile(voice,1000000)&&hasFile(voice+'.json')&&(! (lang!=='en')||(hasFile(argos)&&pairReady(lang))),
   installing:!!active,target:lang,voiceName:voiceIdFor(lang,voiceId),voiceInstalled:hasFile(voice,1000000)&&hasFile(voice+'.json'),
   engineInstalled:hasFile(piper),translatorInstalled:hasFile(argos),translationModelInstalled:pairReady(lang),
   supported:Object.keys(VOICES),message:active?'Đang cài mô hình…':'',piper,argos,model:voice,argosDir};
 }
 const report=(message,lang)=>notify({type:'progress',target:lang,message});
 const env=()=>({...process.env,UV_CACHE_DIR:path.join(root,'uv-cache'),
  UV_PYTHON_INSTALL_DIR:path.join(root,'python-managed'),ARGOS_PACKAGES_DIR:argosDir,ARGOS_DEVICE_TYPE:'cpu'});
 async function run(file,args,lang,timeout=240000){
  if(!active)throw Error('Installation canceled');
  report(args[0]+' · '+args.slice(1,4).join(' '),lang);
  await new Promise((resolve,reject)=>{
   const task=active;let child,errors='',done=false;
   try{child=spawnProcess(file,args,{shell:false,stdio:['ignore','pipe','pipe'],windowsHide:true,env:env()});}
   catch(e){reject(e);return;}
   task.child=child;
   const timer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},timeout);
   const finish=e=>{if(done)return;done=true;clearTimeout(timer);if(task.child===child)task.child=null;e?reject(e):resolve();};
   const listen=chunk=>{const words=chunk.toString('utf8');errors=(errors+words).slice(-1800);
    const lines=words.trim().split(/\r?\n/).filter(Boolean);
    if(lines.length)report(lines[lines.length-1].slice(0,140),lang);};
   child.stdout.on('data',listen);child.stderr.on('data',listen);
   child.once('error',finish);
   child.once('close',code=>active!==task?finish(Error('Installation stopped')):code===0?finish():finish(Error((errors||'Installer error '+code).slice(-400))));
  });
 }
 async function ensureUv(lang){
  if(hasFile(uv))return;
  const asset=uvReleaseFor(platform,arch);if(!asset)throw Error('Không có bộ cài tự động cho CPU này.');
  fs.mkdirSync(uvDir,{recursive:true});
  const file=path.join(uvDir,asset[0]);
  report('Đang tải bộ cài AI (uv) được xác minh SHA-256…',lang);
  await download('https://github.com/astral-sh/uv/releases/download/'+UV_RELEASE+'/'+asset[0],file,asset[1],{
   onProgress:bytes=>{if(bytes%(2*1024*1024)<65536)report('Đã tải '+Math.round(bytes/1048576)+' MB…',lang);}
  });
  try{
   const dest=path.join(uvDir,'unpacked');fs.mkdirSync(dest,{recursive:true});
   if(platform==='win32'){
    // Only a trusted, sha256-verified official archive reaches extraction.
    const quote=s=>s.replace(/'/g,"''");
    await run('powershell.exe',['-NoProfile','-NonInteractive','-Command',
     "Expand-Archive -LiteralPath '"+quote(file)+"' -DestinationPath '"+quote(dest)+"' -Force"],lang);
   }else await run('tar',['-xzf',file,'-C',dest],lang);
   const scan=(dir,depth)=>depth>3?null:fs.readdirSync(dir,{withFileTypes:true}).map(d=>{
    const p=path.join(dir,d.name);
    return d.isFile()&&d.name==='uv'+exe?p:d.isDirectory()?scan(p,depth+1):null;
   }).find(Boolean);
   const unpacked=scan(dest,0);if(!unpacked)throw Error('Không tìm thấy uv trong gói tải.');
   fs.copyFileSync(unpacked,uv);if(platform!=='win32')fs.chmodSync(uv,0o700);
  }finally{await fs.promises.rm(file,{force:true}).catch(()=>{});}
 }
 async function install(lang,voiceId){
  safeLang(lang);const selectedVoice=voiceIdFor(lang,voiceId);
  if(active)throw Error('Đang cài mô hình khác, vui lòng sử dụng tiến trình hiện tại.');
  active={child:null};
  try{
   const stateBefore=state(lang,selectedVoice);
   if(stateBefore.installed)return stateBefore;
   report('Chuẩn bị môi trường AI riêng cho ứng dụng…',lang);
   fs.mkdirSync(root,{recursive:true});fs.mkdirSync(voices,{recursive:true});fs.mkdirSync(argosDir,{recursive:true});
   await ensureUv(lang);
   if(!hasFile(python)){
    await run(uv,['python','install','3.11'],lang,300000);
    await run(uv,['venv',venv,'--python','3.11','--python-preference','only-managed'],lang,180000);
   }
   if(!hasFile(piper)||!hasFile(argos)){
    await run(uv,['pip','install','--python',python,'piper-tts==1.8.0','argostranslate==1.11.0'],lang,600000);
   }
   if(!hasFile(voiceFile(lang,selectedVoice),1000000)||!hasFile(voiceFile(lang,selectedVoice)+'.json')){
    report('Đang tải giọng đọc '+selectedVoice+' (cài một lần)…',lang);
    await run(python,['-m','piper.download_voices','--data-dir',voices,selectedVoice],lang,480000);
   }
   if(lang!=='en'){
    report('Đang kiểm tra mô hình Argos English → '+lang+' thực tế…',lang);
    await run(python,['-u',path.join(__dirname,'argos-bridge.py'),'install',lang],lang,480000);
   }
   if(!state(lang,selectedVoice).installed)throw Error('Mô hình chưa được cài hoàn chỉnh. Vui lòng xem trạng thái.');
   report('Đã cài xong mô hình '+selectedVoice+'. Có thể dùng ngoại tuyến.',lang);
   return state(lang,selectedVoice);
  }catch(e){report('Cài đặt thất bại: '+String(e.message||e).slice(0,180),lang);throw e;}
  finally{active=null;}
 }

 async function installTranslation(lang){
  const allowed=['vi','fr','es','de','zh','ja','ko','pt','it','ru','id','ar','hi','th'];
  if(lang==='en')return {ready:true,target:lang};
  if(!allowed.includes(lang))throw Error('Chưa hỗ trợ tiếng dịch '+lang);
  if(active)throw Error('Đang cài mô hình AI khác');
  active={child:null};
  try{
   fs.mkdirSync(root,{recursive:true});fs.mkdirSync(argosDir,{recursive:true});
   await ensureUv(lang);
   if(!hasFile(python)){
    await run(uv,['python','install','3.11'],lang,300000);
    await run(uv,['venv',venv,'--python','3.11','--python-preference','only-managed'],lang,180000);
   }
   if(!hasFile(argos)||!hasFile(pm)){
    await run(uv,['pip','install','--python',python,'argostranslate==1.11.0'],lang,600000);
   }
   report('Xác thực mô hình dịch English → '+lang+' (không dựa vào trạng thái lưu cũ)…',lang);
   await run(python,['-u',path.join(__dirname,'argos-bridge.py'),'install',lang],lang,480000);
   if(!pairReady(lang))throw Error('Không có gói dịch hợp lệ English → '+lang+' sau khi cài');
   report('Đã cài và kiểm tra mô hình dịch English → '+lang,lang);
   return {ready:true,target:lang};
  }finally{active=null;}
 }
 function cancel(){const old=active;active=null;try{old?.child?.kill('SIGKILL');}catch{};return !!old;}
 return Object.freeze({state,install,installTranslation,cancel,paths:()=>({piper,argos,pm,python,voices,argosDir,voiceFile,pairReady,voiceOptions})});
}
module.exports={createAutoModelInstaller,VOICES,EXTRA_VOICES,voiceOptions,UV,uvReleaseFor,downloadPinned};
