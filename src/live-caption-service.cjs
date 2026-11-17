'use strict';
// Optional LOCAL captions: FFmpeg audio segments -> whisper.cpp; translation to ENGLISH only.
// No cloud transcription. Audio chunks exist only in os.tmpdir and are removed after use.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const {createContinuousCapture}=require('./continuous-capture.cjs');
const {routeLiveSegment}=require('./live-translate-router.cjs');
const exists=p=>{try{return !!p&&fs.statSync(p).isFile();}catch{return false;}};
const tidy=s=>String(s||'').replace(/\x1b\[[\d;]*m/g,'').replace(/^\s*\[[\d:. ]+-->\s*[\d:. ]+\]/gm,'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,1000);
function findWhisper(candidates,platform=process.platform,env=process.env){
 const executable=platform==='win32'?'whisper-cli.exe':'whisper-cli';
 const candidates2=[...candidates,...String(env.PATH||'').split(path.delimiter).map(d=>path.join(d,executable))];
 if(platform==='darwin')candidates2.push('/opt/homebrew/bin/whisper-cli','/usr/local/bin/whisper-cli');
 return candidates2.find(exists)||null;
}
function createLiveCaptionService({dataDir,getFFmpeg,notify,spawnProc=spawn,platform=process.platform,env=process.env,translateText=async text=>text}){
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
  if(c){try{c.capture?.stop();}catch{} if(c.child){try{c.child.kill('SIGKILL');}catch{}} for(const proc of c.children||[]){try{proc.kill('SIGKILL');}catch{}}}
  return true;
 }
 function exec(exe,args,s,timeoutMs){
  return new Promise((resolve,reject)=>{
   if(current!==s)return reject(Error('Đã dừng'));
   let child;try{child=spawnProc(exe,args,{shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});}catch(e){return reject(e);}
   s.child=child;s.children??=new Set();s.children.add(child);let text='',err='',total=0,done=false;
   const timer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},timeoutMs);
   function finish(error){if(done)return;done=true;clearTimeout(timer);s.children?.delete(child);if(s.child===child)s.child=null;error?reject(error):resolve(text);}
   child.stdout?.on('data',d=>{total+=d.length;text+=d.toString('utf8');if(total>128000)try{child.kill('SIGKILL');}catch{}});
   child.stderr?.on('data',d=>{
    const part=d.toString('utf8');err=(err+part).slice(-1800);
    const match=err.match(/(?:auto[- ]detected|detected)\s+language:\s*([a-z-]{2,30})\b/i);
    if(match){
      const raw=match[1].toLowerCase();
      const aliases={english:'en',vietnamese:'vi',chinese:'zh',mandarin:'zh',
        french:'fr',german:'de',spanish:'es',japanese:'ja',korean:'ko',
        portuguese:'pt',italian:'it',russian:'ru',indonesian:'id',
        arabic:'ar',hindi:'hi',thai:'th'};
      const normalized=aliases[raw]||raw;
      if(/^(en|vi|fr|es|de|zh|ja|ko|pt|it|ru|id|ar|hi|th)$/.test(normalized))
       s.detectedLang=normalized;
    }
   });
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
     notify({type:'status',id:s.id,message:s.translate?'Đang nhận diện và dịch tiếng Anh…':'Đang nhận diện tiếng nói…'});
     await exec(ff,['-hide_banner','-nostdin','-loglevel','error','-y','-rw_timeout','8000000','-user_agent','Mozilla/5.0','-i',s.url,'-map','0:a:0','-vn','-sn','-dn','-ac','1','-ar','16000','-c:a','pcm_s16le','-t','8',wav],s,30000);
     if(current!==s)break;
     if((await fs.promises.stat(wav)).size<25000)throw Error('Nguồn chưa có âm thanh');
     // Transcribe in original detected language, never force English.
     s.detectedLang='';
     const args=['-m',md,'-f',wav,'-l','auto','-nt','-t','4'];
     const raw=await exec(wh,args,s,65000);
     if(current!==s)break;
     const words=tidy(raw);
     if(words){
  const detected=s.detectedLang||'unknown';
  let finalText=words,translated=false,englishText='',effectiveLang=detected;
  if(s.translate){
   try{
    const routed=await routeLiveSegment({
     text:words,source:detected,target:s.target,
     translateText:(input,target,source,options)=>translateText(input,target,source,{...options,engine:s.engine,resourceMode:s.resourceMode}),
     whisperToEnglish:async()=>{
      // Do not call Argos zh->en or any other source->en pivot;
      // Whisper's -tr path has already been working on these live streams.
      return tidy(await exec(wh,[...args,'-tr'],s,65000));
     },
     notify:message=>notify({type:'status',id:s.id,message})
    });
    finalText=routed.text;translated=!!routed.translated;
    englishText=routed.englishText||'';
    effectiveLang=routed.language||detected;
   }catch(error){
    // Preserve healthy Live Caption and keep TTS from speaking failed translations.
    const reason=String(error?.message||error).replace(/[\r\n]+/g,' ').slice(0,230);
    notify({type:'translation-error',id:s.id,
      message:'Dịch '+detected+' → '+s.target+' thất bại: '+reason});
    finalText=words;translated=false;englishText='';effectiveLang=detected;
   }
  }
  if(current!==s)break;
  const key=finalText.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const now=Date.now();
  if(!key||(key===s.lastKey&&now-s.lastEmittedAt<60000))continue;
  s.lastKey=key;s.lastEmittedAt=now;
  notify({type:'segment',id:s.id,text:finalText,englishText,
   sourceLanguage:detected,translated,
   language:translated?s.target:(effectiveLang==='unknown'?'auto':effectiveLang),
   utteranceKey:key});
}
     fails=0;
    }catch(e){
     if(current!==s)break;
     fails++;
     notify({type:'status',id:s.id,message:'Phụ đề: '+String(e.message||e).slice(0,110)});
     if(fails>=3){notify({type:'error',id:s.id,message:'Không nhận diện được sau 3 lần: '+String(e.message||e).slice(0,145)});break;}
    }finally{try{await fs.promises.unlink(wav);}catch{}}
   }
  }finally{
   if(current===s)current=null;
   await fs.promises.rm(tmp,{force:true,recursive:true}).catch(()=>{});
   notify({type:'stopped',id:s.id});
  }
 }

 // Continuous audio recording independent of Whisper, translation and VieNeu TTS.
 async function runContinuous(s,ff,wh,md){
  let capture=null,failed=0,processed=0,conversion=Promise.resolve();
  const pendingAudio=new Set();
  const temp=await fs.promises.mkdtemp(path.join(os.tmpdir(),'openiptv-caption-continuous-'));
  const removeFile=async file=>{try{await fs.promises.unlink(file);}catch{}};
  try{
   capture=createContinuousCapture({
    ffmpeg:ff,url:s.url,dir:temp,spawnProc,chunkSeconds:8
   });
   s.capture=capture;
   capture.start();
   notify({type:'status',id:s.id,message:'Thu âm liên tục · nhận diện mỗi khoảng 8 giây'});
   while(current===s){
    let item;
    try{item=await capture.next();}
    catch(error){
     if(current===s)notify({type:'error',id:s.id,message:String(error.message||error).slice(0,150)});
     break;
    }
    if(!item||current!==s)break;
    const wav=item.file;
    try{
     s.detectedLang='unknown';
     const args=['-m',md,'-f',wav,'-l','auto','-nt','-t','4'];
     const raw=await exec(wh,args,s,65000);
     if(current!==s)break;
     const words=tidy(raw);
     if(!words){await removeFile(wav);continue;}
     const key=words.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
     const now=Date.now();
     if(!key||(key===s.lastKey&&now-s.lastEmittedAt<60000)){
      await removeFile(wav);continue;
     }
     s.lastKey=key;s.lastEmittedAt=now;
     const serial=++processed,sourceLanguage=s.detectedLang||'unknown';
     s.latestRecognized=serial;
     notify({type:'segment',id:s.id,text:words,sourceLanguage,
      translated:false,language:sourceLanguage==='unknown'?'auto':sourceLanguage,
      sequence:serial,utteranceKey:key,interim:s.translate});
     failed=0;
     if(!s.translate){await removeFile(wav);continue;}
     pendingAudio.add(wav);
     const work=async()=>{
      try{
       if(current!==s||serial!==s.latestRecognized)return;
       const routed=await routeLiveSegment({
        text:words,source:sourceLanguage,target:s.target,
        translateText:(input,target,source,options)=>translateText(input,target,source,
         {...options,engine:s.engine,resourceMode:s.resourceMode}),
        whisperToEnglish:async()=>tidy(await exec(wh,[...args,'-tr'],s,65000)),
        notify:message=>{
         if(current===s&&serial===s.latestRecognized)
          notify({type:'status',id:s.id,message});
        }
       });
       if(current!==s||serial!==s.latestRecognized)return;
       const finalText=tidy(routed.text);
       if(!finalText)return;
       notify({type:'segment',id:s.id,text:finalText,sourceText:words,englishText:routed.englishText||'',
        sourceLanguage,translated:!!routed.translated,language:routed.language||s.target,
        sequence:serial,utteranceKey:key});
      }catch(error){
       if(current===s&&serial===s.latestRecognized)
        notify({type:'translation-error',id:s.id,
         message:'Dịch '+sourceLanguage+' → '+s.target+': '+String(error.message||error).slice(0,170)});
      }finally{
       pendingAudio.delete(wav);await removeFile(wav);
      }
     };
     conversion=conversion.catch(()=>{}).then(work);
    }catch(error){
     if(current!==s)break;
     failed++;
     notify({type:'status',id:s.id,message:'Nhận diện âm thanh: '+String(error.message||error).slice(0,135)});
     await removeFile(wav);
     if(failed>=3)notify({type:'status',id:s.id,message:'Whisper xử lý chậm; thu âm vẫn tiếp tục.'});
    }
   }
  }finally{
   try{capture?.stop();}catch{}
   if(current===s)current=null;
   await Promise.race([conversion.catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1200))]);
   for(const wav of pendingAudio)await removeFile(wav);
   await fs.promises.rm(temp,{force:true,recursive:true}).catch(()=>{});
   notify({type:'stopped',id:s.id});
  }
 }
 function start(input){
  const url=String(input?.url||''),u=new URL(url);
  if(!['http:','https:'].includes(u.protocol))throw Error('Chỉ hỗ trợ URL http/https');
  const info=status();
  if(!info.available)throw Error(info.reason+'. Mở Thiết lập ở dòng 3.');
  stop();
  const target=input?.translate===true?String(input?.target||'en'):'auto';
  const s={id:++seq,url,translate:input?.translate===true,target,engine:String(input?.engine||'auto'),resourceMode:String(input?.resourceMode||'balanced'),child:null};
  current=s;
  Promise.resolve().then(()=>runContinuous(s,getFFmpeg(),bin(),model())).catch(e=>{
   if(current===s)current=null;
   notify({type:'error',id:s.id,message:String(e.message||e)});
  });
  return {running:true,id:s.id,language:s.translate?s.target:'auto',translated:s.translate};
 }
 return Object.freeze({status,setFile,start,stop});
}
module.exports={createLiveCaptionService,tidy,findWhisper};
