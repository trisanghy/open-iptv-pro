'use strict';
// Open IPTV Pro v4.23.46 — offline subtitles translation from English speech text.
// Whisper translates to English; Argos translates English -> selected target on device.
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const LANGUAGES=Object.freeze({
 en:'English',vi:'Tiếng Việt',fr:'Français',es:'Español',de:'Deutsch',
 zh:'中文',ja:'日本語',ko:'한국어',pt:'Português',it:'Italiano',
 ru:'Русский',id:'Bahasa Indonesia',ar:'العربية',hi:'हिन्दी',th:'ไทย'
});
function isValidTarget(code){return Object.hasOwn(LANGUAGES,code);}
function fileExists(name){try{return typeof name==='string'&&fs.statSync(name).isFile();}catch{return false;}}
function createCaptionTranslator({installer,notify=()=>{},spawnProcess=spawn,environment=process.env}={}){
 if(!installer?.paths||!installer?.installTranslation)throw Error('Argos installer not configured');
 const failedPairs=new Map();
 function checkTarget(target){if(!isValidTarget(target))throw Error('Chưa hỗ trợ ngôn ngữ dịch: '+String(target).slice(0,20));return target;}
 function status(target='vi'){
  target=checkTarget(target);
  const dirs=installer.paths();
  const available=target==='en'||(fileExists(dirs.python)&&fileExists(dirs.argosBridge)&&dirs.pairReady(target));
  return {target,ready:available,installed:available,engine:'Argos Translate',offline:true,
   reason:available?'':(!fileExists(dirs.python)?'Chưa cài Argos Translate':'Chưa có gói dịch English → '+LANGUAGES[target]),
   name:LANGUAGES[target],languages:LANGUAGES};
 }
 async function install(target){
  target=checkTarget(target);
  if(target==='en')return status(target);
  const result=await installer.installTranslation(target);
  if(!result?.ready||!status(target).ready)throw Error('Gói dịch '+LANGUAGES[target]+' chưa cài hoàn chỉnh');
  return status(target);
 }

 async function translateText(text,target='vi',from='en',options={}){
  target=checkTarget(target);from=checkTarget(from);
  const input=String(text||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,1200);
  if(!input)return '';
  if(from===target)return input;
  const directOnly=options?.directOnly===true&&from!=='en'&&target!=='en';
  // Direct-only mode must not attempt src→en Argos. Whisper already provides
  // a working source→English fallback, and en→target Argos is installed separately.
  const pair=from+'→'+target+(directOnly?' [direct]':''),failed=failedPairs.get(pair);
  if(failed&&Date.now()-failed.time<60000)
   throw Error('Dịch '+pair+' chưa sẵn sàng: '+failed.message+' (tự thử lại sau 60 giây)');
  const dirs=installer.paths();
  if(directOnly&&!installer.directReady?.(from,target)){
   const installed=await installer.installDirect?.(from,target);
   if(!installed?.ready)throw Error('Không có mô hình trực tiếp '+from+' → '+target);
  }else if(!directOnly&&!dirs.pairReadyFor?.(from,target)){
   if(typeof installer.installPair!=='function')
    throw Error('Bộ cài chưa hỗ trợ dịch trực tiếp '+from+' → '+target);
   await installer.installPair(from,target);
  }
  const executable=installer.paths().python,bridge=installer.paths().argosBridge;
  if(!fileExists(executable)||!fileExists(bridge))
   throw Error('Thiếu môi trường Python hoặc script dịch Argos trên máy');
  const translateOnce=()=>new Promise((resolve,reject)=>{
   let done=false,stdout='',stderr='',bytes=0,child;
   try{child=spawnProcess(executable,['-u',bridge,'translate',from,target],
    {shell:false,windowsHide:true,stdio:['pipe','pipe','pipe'],
     env:{...environment,ARGOS_PACKAGES_DIR:dirs.argosDir,ARGOS_DEVICE_TYPE:'cpu',ARGOS_CHUNK_TYPE:'MINISBD',ARGOS_MODEL_PROVIDER:'OPENNMT'}});}
   catch(e){reject(e);return;}
   const timer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},45000);
   const finish=error=>{
    if(done)return;done=true;clearTimeout(timer);
    if(error)reject(error);else if(!stdout.trim())reject(Error('Argos trả về bản dịch rỗng'));
    else resolve(stdout.trim().slice(0,1200));
   };
   child.stdout?.on('data',data=>{bytes+=data.length;if(bytes>10000)try{child.kill('SIGKILL');}catch{}
    else stdout+=data.toString('utf8');});
   child.stderr?.on('data',data=>{stderr=(stderr+data.toString('utf8')).slice(-650);});
   child.once('error',finish);
   child.once('close',code=>code===0&&bytes<=10000?finish():finish(Error((stderr||('Argos exit '+code)).slice(-300))));
   child.stdin?.on('error',()=>{});
   child.stdin?.end(input);
  });
  try{
   const translated=await translateOnce();
   failedPairs.delete(pair);
   return translated;
  }catch(initial){
   if(directOnly){
    // Broken direct model: report to caller so Whisper→English can take over.
    // Never install a pivot model while handling this failure.
    failedPairs.set(pair,{time:Date.now(),message:String(initial?.message||initial).slice(0,220)});
    throw initial;
   }
   // Previously installed metadata can be stale or model files corrupt.
   // Repair exactly once and verify an actual sample translation.
   try{
    if(typeof installer.installPair!=='function')throw initial;
    notify({type:'translation-repair',message:'Đang kiểm tra và sửa mô hình dịch '+pair+'…'});
    await installer.installPair(from,target);
    const repaired=await translateOnce();
    failedPairs.delete(pair);
    return repaired;
   }catch(retryError){
    const message=String(retryError?.message||retryError||initial).slice(0,300);
    failedPairs.set(pair,{time:Date.now(),message});
    throw Error('Dịch '+pair+' thất bại: '+message);
   }
  }
 }
 async function translateEnglish(text,target='vi'){return translateText(text,target,'en');}
 return Object.freeze({status,install,translateEnglish,translateText});
}
module.exports={createCaptionTranslator,LANGUAGES,isValidTarget};
