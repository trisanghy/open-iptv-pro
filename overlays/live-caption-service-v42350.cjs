'use strict';
// Optional LOCAL captions: FFmpeg audio segments -> whisper.cpp; translation to ENGLISH only.
// No cloud transcription. Audio chunks exist only in os.tmpdir and are removed after use.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const exists=p=>{try{return !!p&&fs.statSync(p).isFile();}catch{return false;}};
const tidy=s=>String(s||'').replace(/\x1b\[[\d;]*m/g,'').replace(/^\s*\[[\d:. ]+-->\s*[\d:. ]+\]/gm,'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,1000);
function findWhisper(candidates,platform=process.platform,env=process.env){
 const executable=platform==='win32'?'whisper-cli.exe':'whisper-cli';
 const candidates2=[...candidates,...String(env.PATH||'').split(path.delimiter).map(d=>path.join(d,executable))];
 if(platform==='darwin')candidates2.push('/opt/homebrew/bin/whisper-cli','/usr/local/bin/whisper-cli');
 return candidates2.find(exists)||null;
}
function createLiveCaptionService({dataDir,getFFmpeg,notify,spawnProc=spawn,platform=process.platform,env=process.env,translateText=async text=>({text,route:"same"})}){
 const dir=path.join(dataDir,'live-caption'),cfgFile=path.join(dir,'config.json');
 let cfg={};try{cfg=JSON.parse(fs.readFileSync(cfgFile,'utf8'));}catch{}
 let current=null,seq=0;
 const bin=()=>findWhisper([cfg.binary,env.OPEN_IPTV_WHISPER_BIN,path.join(dir,platform==='win32'?'whisper-cli.exe':'whisper-cli')],platform,env);
 const model=()=>[cfg.model,env.OPEN_IPTV_WHISPER_MODEL,path.join(dir,'ggml-base.bin')].find(p=>{try{return exists(p)&&fs.statSync(p).size>1000000;}catch{return false;}})||null;
 function status(){
  const ff=!!getFFmpeg(),wb=!!bin(),md=!!model();
  return {available:ff&&wb&&md,ffmpeg:ff,whisper:wb,model:md,running:!!current,target:'en',modelName:model()?path.basename(model()):'',reason:!ff?'Thiếu FFmpeg':!wb?'Chưa cài whisper-cli':!md?'Chưa chọn mô hình Whisper GGML (.bin)':''};
 }
 function setFile(kind,p){
  if(!['model','binary'].includes(kind)||!exists(p))throw Error('Không tìm thấy tệp đã chọn');
  if(kind==='model'&&(!/\.bin$/i.test(p)||fs.statSync(p).size<1000000))throw Error('Cần mô hình GGML Whisper .bin hợp lệ');
  if(kind==='binary'&&!/^(whisper-cli|whisper-cli\.exe)$/i.test(path.basename(p)))throw Error('Cần chọn whisper-cli hoặc whisper-cli.exe');
  fs.mkdirSync(dir,{recursive:true});
  cfg[kind]=path.resolve(p);
  fs.writeFileSync(cfgFile,JSON.stringify(cfg,null,2),{mode:0o600});
  return status();
 }
 function stop(){
  const c=current;current=null;
  if(c&&c.child){try{c.child.kill('SIGKILL');}catch{}}
  return true;
 }
 function exec(exe,args,s,timeoutMs){
  return new Promise((resolve,reject)=>{
   if(current!==s)return reject(Error('Đã dừng'));
   let child;try{child=spawnProc(exe,args,{shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});}catch(e){return reject(e);}
   s.child=child;let text='',err='',total=0,done=false;
   const timer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},timeoutMs);
   function finish(error){if(done)return;done=true;clearTimeout(timer);if(s.child===child)s.child=null;error?reject(error):resolve(text);}
   child.stdout?.on('data',d=>{total+=d.length;text+=d.toString('utf8');if(total>128000)try{child.kill('SIGKILL');}catch{}});
   child.stderr?.on('data',d=>{err=(err+d.toString('utf8')).slice(-750);});
   child.once('error',finish);
   child.once('close',code=>{if(current!==s)return finish(Error('Đã dừng'));
     if(code===0&&total<=128000)return finish();
     finish(Error((err||('Tiến trình kết thúc: '+code)).slice(-250)));
   });
  });
 }
 async function run(s,ff,wh,md){
  let fails=0;const tmp=await fs.promises.mkdtemp(path.join(os.tmpdir(),'openiptv-caption-'));
  try{
   while(current===s){
    const wav=path.join(tmp,'audio.wav');
    try{
     notify({type:'status',id:s.id,message:s.translate?'Đang nhận diện tiếng gốc và xác định tuyến dịch…':'Đang nhận diện tiếng nói…'});
     await exec(ff,['-hide_banner','-nostdin','-loglevel','error','-y','-rw_timeout','8000000','-user_agent','Mozilla/5.0','-i',s.url,'-map','0:a:0','-vn','-sn','-dn','-ac','1','-ar','16000','-c:a','pcm_s16le','-t','8',wav],s,30000);
     if(current!==s)break;
     if((await fs.promises.stat(wav)).size<25000)throw Error('Nguồn chưa có âm thanh');
     // Whisper JSON supplies the actual detected spoken language, rather than assuming English.
     const fileBase=path.join(tmp,'recognized');
     await exec(wh,['-m',md,'-f',wav,'-l','auto','-nt','-np','-t','4','-oj','-of',fileBase],s,70000);
     if(current!==s)break;
     const decoded=JSON.parse(await fs.promises.readFile(fileBase+'.json','utf8'));
     const detected=String(decoded?.result?.language||'').toLowerCase();
     const words=tidy((decoded.transcription||[]).map(x=>x.text||'').join(' '));
     if(words){
      if(!detected||detected==='auto'||detected==='unknown'){
       notify({type:'status',id:s.id,message:'Chưa xác định được ngôn ngữ đầu vào; không dịch để tránh sai nội dung.'});
      }else{
       let finalText=words,englishText='',route='same';
       if(s.translate&&detected!==s.target){
        notify({type:'status',id:s.id,message:'Đang tìm tuyến '+detected+' → '+s.target+'…'});
        let routed=await translateText(words,detected,s.target);
        if(routed.needsModel){
         notify({type:'needs-model',id:s.id,sourceLanguage:detected,target:s.target});
         await new Promise(resolve=>setTimeout(resolve,1800));
         continue;
        }
        if(routed.needsEnglish){
         // Whisper -> English is only a fallback when no installed direct Argos route exists.
         const translated=await exec(wh,['-m',md,'-f',wav,'-l','auto','-nt','-np','-t','4','-tr'],s,70000);
         englishText=tidy(translated);
         if(!englishText)throw Error('Whisper không tạo được bản English dự phòng');
         routed=s.target==='en'?{text:englishText,route:'whisper'}:
          await translateText(englishText,'en',s.target);
        }
        if(!routed.text)throw Error('Không nhận được bản dịch hợp lệ');
        finalText=routed.text;route=routed.route;
       }
       if(current!==s)break;
       notify({type:'segment',id:s.id,text:finalText,originalText:words,
        sourceLanguage:detected,englishText,translated:s.translate&&detected!==s.target,
        language:s.translate?s.target:detected,route});
      }
     }
     fails=0;
    }catch(e){
     if(current!==s)break;
     fails++;
     notify({type:'status',id:s.id,message:'Phụ đề: '+String(e.message||e).slice(0,110)});
     if(fails>=3){notify({type:'error',id:s.id,message:'Không nhận diện được âm thanh sau 3 lần. Kiểm tra URL và mô hình.'});break;}
    }finally{try{await fs.promises.unlink(wav);}catch{}}
   }
  }finally{
   if(current===s)current=null;
   await fs.promises.rm(tmp,{force:true,recursive:true}).catch(()=>{});
   notify({type:'stopped',id:s.id});
  }
 }
 function start(input){
  const url=String(input?.url||''),u=new URL(url);
  if(!['http:','https:'].includes(u.protocol))throw Error('Chỉ hỗ trợ URL http/https');
  const info=status();
  if(!info.available)throw Error(info.reason+'. Mở Thiết lập ở dòng 3.');
  stop();
  const target=input?.translate===true?String(input.target||'en'):'auto';
  const s={id:++seq,url,translate:input?.translate===true,target,child:null};
  current=s;
  Promise.resolve().then(()=>run(s,getFFmpeg(),bin(),model())).catch(e=>{
   if(current===s)current=null;
   notify({type:'error',id:s.id,message:String(e.message||e)});
  });
  return {running:true,id:s.id,language:s.translate?s.target:'auto',translated:s.translate};
 }
 return Object.freeze({status,setFile,start,stop});
}
module.exports={createLiveCaptionService,tidy,findWhisper};
