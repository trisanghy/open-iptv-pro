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
 function checkTarget(target){if(!isValidTarget(target))throw Error('Chưa hỗ trợ ngôn ngữ dịch: '+String(target).slice(0,20));return target;}
 function status(target='vi'){
  target=checkTarget(target);
  const dirs=installer.paths();
  const available=target==='en'||(fileExists(dirs.python)&&fileExists(path.join(__dirname,'argos-bridge.py'))&&dirs.pairReady(target));
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
 function translateEnglish(text,target='vi'){
  target=checkTarget(target);
  const input=String(text||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,1200);
  if(!input)return Promise.resolve('');
  if(target==='en')return Promise.resolve(input);
  const state=status(target);
  if(!state.ready)return Promise.reject(Error(state.reason+' · chọn ngôn ngữ và cài mô hình tự động'));
  const dirs=installer.paths();
  return new Promise((resolve,reject)=>{
   let finished=false,stdout='',stderr='',bytes=0,child;
   // shell is explicitly disabled. No network requests made by this code.
   try{child=spawnProcess(dirs.python,['-u',path.join(__dirname,'argos-bridge.py'),'translate',target],
    {shell:false,windowsHide:true,stdio:['pipe','pipe','pipe'],
     env:{...environment,ARGOS_PACKAGES_DIR:dirs.argosDir,ARGOS_DEVICE_TYPE:'cpu',ARGOS_CHUNK_TYPE:'NONE'}});}
   catch(e){reject(e);return;}
   child.stdin?.on('error',()=>{});
   child.stdin?.end(input);
   const timer=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},45000);
   const done=err=>{
    if(finished)return;finished=true;clearTimeout(timer);
    if(err)reject(err);else if(!stdout.trim())reject(Error('Argos không trả lại văn bản dịch'));
    else resolve(stdout.trim().slice(0,1200));
   };
   child.stdout?.on('data',data=>{
    bytes+=data.length;
    if(bytes>10000){try{child.kill('SIGKILL');}catch{}}else stdout+=data.toString('utf8');
   });
   child.stderr?.on('data',data=>{stderr=(stderr+data.toString('utf8')).slice(-600);});
   child.once('error',done);
   child.once('close',code=>code===0&&bytes<=10000?done():done(Error((stderr||('Argos exit '+code)).slice(-220))));
  });
 }
 return Object.freeze({status,install,translateEnglish});
}
module.exports={createCaptionTranslator,LANGUAGES,isValidTarget};
