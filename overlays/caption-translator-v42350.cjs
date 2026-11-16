'use strict';
// Direct Argos language pair when available; Whisper English is a fallback, never a default.
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const LANGUAGES=Object.freeze({
 en:'English',vi:'Tiếng Việt',fr:'Français',es:'Español',de:'Deutsch',
 zh:'中文',ja:'日本語',ko:'한국어',pt:'Português',it:'Italiano',
 ru:'Русский',id:'Bahasa Indonesia',ar:'العربية',hi:'हिन्दी',th:'ไทย'
});
function valid(code){return typeof code==='string'&&Object.hasOwn(LANGUAGES,code);}
function available(p){try{return !!p&&fs.statSync(p).isFile();}catch{return false;}}
function createCaptionTranslator({installer,notify=()=>{},spawnProcess=spawn,environment=process.env}={}){
 if(!installer?.paths||!installer?.installTranslation)throw Error('Argos installer not configured');
 const bridge=path.join(__dirname,'argos-bridge.py');
 const check=(code)=>{if(!valid(code))throw Error('Mã ngôn ngữ không hợp lệ: '+String(code).slice(0,30));return code;};
 function status(target='vi',source='en'){
  source=check(source);target=check(target);
  if(source===target)return {source,target,ready:true,installed:true,route:'same',reason:'',offline:true,languages:LANGUAGES};
  const dirs=installer.paths(),ready=target==='en'||(available(dirs.python)&&available(bridge)&&dirs.pairReady(target));
  return {source,target,ready,installed:ready,route:ready?'fallback':'needs-model',
   reason:ready?'':'Cần cài mô hình dịch cho '+LANGUAGES[target],offline:true,languages:LANGUAGES};
 }
 function call(action,source,target,input=''){
  source=check(source);target=check(target);
  const dirs=installer.paths(),python=dirs.python;
  if(!available(python)||!available(bridge))return Promise.reject(Error('Chưa cài Argos offline'));
  return new Promise((resolve,reject)=>{
   let child,stdout='',stderr='',size=0,done=false;
   try{child=spawnProcess(python,['-u',bridge,action,source,target],{
    windowsHide:true,shell:false,stdio:['pipe','pipe','pipe'],
    env:{...environment,ARGOS_PACKAGES_DIR:dirs.argosDir,ARGOS_DEVICE_TYPE:'cpu',ARGOS_CHUNK_TYPE:'NONE'}
   });}catch(e){reject(e);return;}
   const timeout=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},action==='install'?900000:55000);
   const finish=err=>{if(done)return;done=true;clearTimeout(timeout);
    if(err)reject(err);else resolve(stdout.trim());};
   child.stdout.on('data',b=>{size+=b.length;if(size>20000)child.kill('SIGKILL');else stdout+=b.toString('utf8');});
   child.stderr.on('data',b=>{stderr=(stderr+b.toString('utf8')).slice(-600);});
   child.once('error',finish);
   child.once('close',code=>code===0&&size<=20000?finish():finish(Error((stderr||'Argos exit '+code).slice(-250))));
   child.stdin.on('error',()=>{});
   child.stdin.end(input);
  });
 }
 function routeResult(raw){
  const line=raw.split(/\r?\n/).find(l=>l.startsWith('OIPTV_ROUTE:'));
  if(!line)throw Error('Không nhận được trạng thái mô hình dịch');
  const state=JSON.parse(line.slice('OIPTV_ROUTE:'.length));
  if(!['same','direct','pivot','whisper','needs-model'].includes(state.route))
    throw Error('Tuyến dịch không hợp lệ');
  return state;
 }
 async function route(source,target){
  source=check(source);target=check(target);
  if(source===target)return {source,target,route:'same',ready:true};
  if(!available(installer.paths().python))
    return {source,target,route:target==='en'?'whisper':'needs-model',ready:target==='en'};
  return routeResult(await call('route',source,target));
 }
 async function install(target,source='en'){
  source=check(source);target=check(target);
  if(source===target)return {source,target,ready:true,route:'same',installed:true};
  // Only the user's explicit install action may download language models.
  if(!available(installer.paths().python))await installer.installTranslation(target==='en'?source:target);
  const next=routeResult(await call('install',source,target));
  if(next.route==='needs-model')throw Error('Không tìm được mô hình trực tiếp hoặc mô hình dự phòng');
  return {...next,installed:true};
 }
 async function translate(text,source,target){
  source=check(source);target=check(target);
  const phrase=String(text||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,1200);
  if(!phrase)return {text:'',route:'same'};
  if(source===target)return {text:phrase,route:'same',source,target};
  const selection=await route(source,target);
  if(selection.route==='direct'||selection.route==='pivot'){
   const result=await call('translate',source,target,phrase);
   if(!result)throw Error('Argos không trả về bản dịch');
   return {text:result.slice(0,1200),route:selection.route,source,target};
  }
  if(selection.route==='whisper')return {needsEnglish:true,source,target,route:'whisper'};
  return {needsModel:true,source,target,route:'needs-model'};
 }
 async function translateEnglish(text,target='vi'){
  const result=await translate(text,'en',target);
  if(result.needsEnglish)throw Error('Thiếu mô hình dịch English → '+target);
  return result.text;
 }
 return Object.freeze({status,install,route,translate,translateEnglish});
}
module.exports={createCaptionTranslator,LANGUAGES,isValidTarget:valid};
