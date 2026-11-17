'use strict';
// v4.23.44: OFFLINE translation-to-speech; Whisper's English output -> Argos Translate -> Piper TTS.
// No shell evaluation, cloud APIs, downloads, or persistent speech/audio content.
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {premiumName}=require('./premium-voices.cjs');
const ALLOWED=Object.freeze(['vi','en','es','fr','de','zh','pt','it','ru','id']);
const MAX_TEXT=360;
const MAX_WAV=7*1024*1024;
function fileOK(p,min=1){try{return !!p&&fs.statSync(p).isFile()&&fs.statSync(p).size>=min;}catch{return false;}}
function languageCodeFromConfig(contents){
 try{
  const info=JSON.parse(contents),s=String(info?.language?.code||info?.language?.family||info?.language||'');
  return s.replace('_','-').split('-')[0].toLowerCase();
 }catch{return '';}
}
function findTool({selected='',envVar='',names=[],platform=process.platform,env=process.env}){
 const dirs=[...String(env.PATH||'').split(path.delimiter)];
 if(platform==='darwin')dirs.push('/opt/homebrew/bin','/usr/local/bin');
 const home=env.HOME||env.USERPROFILE||os.homedir();
 dirs.push(path.join(home,'.local','bin'),path.join(home,'.venvs','openiptv-ai','bin'),
   path.join(home,'.venvs','openiptv-ai','Scripts'));
 const candidates=[selected,envVar,...dirs.flatMap(d=>names.map(n=>path.join(d,n)))];
 return candidates.find(p=>fileOK(p))||null;
}
function createLocalSpeechService(options={}){
 const {dataDir,notify=()=>{},spawnProcess=spawn,environment=process.env,platform=process.platform,managed=null,translateText=null}=options;
 if(!dataDir)throw Error('Local speech data directory is required');
 const base=path.join(dataDir,'local-tts');
 const settings=path.join(base,'config.json');
 let config={voices:{}};try{
  const data=JSON.parse(fs.readFileSync(settings,'utf8'));
  if(data&&typeof data==='object')config={...config,...data,voices:{...(data.voices||{})}};
 }catch{}
 let running=null,sequence=0;
 function tool(which){
  const windows=platform==='win32';
  const names=which==='piper'?[windows?'piper.exe':'piper']:[windows?'argos-translate.exe':'argos-translate'];
  const envPath=which==='piper'?environment.OPEN_IPTV_PIPER_BIN:environment.OPEN_IPTV_ARGOS_BIN;
  return findTool({selected:config[which]||managed?.[which],envVar:envPath,names,platform,env:environment});
 }
 function voicePath(lang,voiceId){
  if(!ALLOWED.includes(lang))return null;
  const m=(voiceId?null:config.voices?.[lang])||managed?.voiceFile?.(lang,voiceId);
  if(!fileOK(m,1000000)||!fileOK(m+'.json',20))return null;
  return languageCodeFromConfig(fs.readFileSync(m+'.json','utf8'))===lang?m:null;
 }
 function availability(lang='vi',voiceId){
  if(lang==='vi'&&premiumName(voiceId)){
   const ready=!!managed?.premiumReady?.(voiceId);
   return {ready,target:lang,voiceReady:ready,premium:true,voiceName:voiceId,
    reason:ready?'':'Chưa cài giọng VieNeu 48 kHz. Nhấn Cài mô hình tự động (tải một lần).',
    voiceOptions:[],engine:'VieNeu-TTS v3 Turbo · ONNX CPU',offline:true,running:!!running};
  }
  if(voiceId&&managed?.voiceOptions&&!managed.voiceOptions(lang).includes(voiceId))throw Error('Giọng đọc không hợp lệ');
  const piper=tool('piper'),argos=tool('argos'),model=voicePath(lang,voiceId);
  const needTranslation=lang!=='en';
  let reason='';
  if(!piper)reason='Chưa cài hoặc chưa chọn Piper TTS';
  else if(!model)reason='Chưa chọn giọng Piper đúng ngôn ngữ '+lang+' (.onnx và .onnx.json)';
  // Voice readiness is independent from translation model readiness.
  // If source and voice language match, no Argos translation is required.
  return {ready:!reason,reason,target:lang,availableLanguages:[...ALLOWED],
   piperReady:!!piper,argosReady:!!argos,voiceReady:!!model,
   voiceName:model?path.basename(model):'',selectedVoice:voiceId||'',voiceOptions:managed?.voiceOptions?.(lang)||[],needsTranslation:needTranslation,
   offline:true,running:!!running,engine:'Piper TTS + Argos Translate'};
 }
 function persist(){
  fs.mkdirSync(base,{recursive:true});
  const tmp=settings+'.tmp';
  fs.writeFileSync(tmp,JSON.stringify(config,null,2),{encoding:'utf8',mode:0o600});
  fs.renameSync(tmp,settings);
 }
 function configure(kind,p,lang){
  const file=path.resolve(String(p||''));
  if(!fileOK(file))throw Error('Không tìm thấy tệp đã chọn.');
  if(kind==='piper'||kind==='argos'){
   const name=path.basename(file).toLowerCase();
   const expected=kind==='piper'?['piper','piper.exe']:['argos-translate','argos-translate.exe'];
   if(!expected.includes(name))throw Error('Tệp thực thi không đúng: '+kind);
   config[kind]=file;
  }else if(kind==='voice'){
   if(!ALLOWED.includes(lang))throw Error('Ngôn ngữ giọng đọc không được hỗ trợ.');
   if(!file.endsWith('.onnx')||!fileOK(file,1000000)||!fileOK(file+'.json',20))
     throw Error('Cần cả mô hình .onnx và tệp cấu hình .onnx.json cùng tên.');
   const actual=languageCodeFromConfig(fs.readFileSync(file+'.json','utf8'));
   if(actual!==lang)throw Error('Giọng này thuộc ngôn ngữ '+(actual||'không rõ')+', cần '+lang+'.');
   config.voices[lang]=file;
  }else throw Error('Loại cài đặt không hợp lệ.');
  persist();
  return availability(lang||'vi');
 }
 function stop(){
  const task=running;
  running=null;
  if(task?.child){try{task.child.kill('SIGKILL');}catch{}}
  return {canceled:!!task};
 }
 function invokeProcess(executable,args,task,{stdin,timeout=30000}={}){
  return new Promise((resolve,reject)=>{
   if(running!==task)return reject(Error('Đã hủy đọc bản dịch.'));
   let child;try{child=spawnProcess(executable,args,{windowsHide:true,shell:false,stdio:['pipe','pipe','pipe'],env:{...environment,ARGOS_PACKAGES_DIR:managed?.argosDir||environment.ARGOS_PACKAGES_DIR||'',ARGOS_DEVICE_TYPE:'cpu',ARGOS_CHUNK_TYPE:'MINISBD',ARGOS_MODEL_PROVIDER:'OPENNMT',HF_HOME:managed?.premiumCache||environment.HF_HOME||'',HF_HUB_OFFLINE:'1',HF_HUB_DISABLE_TELEMETRY:'1'}});}catch(e){return reject(e);}
   task.child=child;
   let result='',errors='',size=0,done=false;
   const kill=setTimeout(()=>{try{child.kill('SIGKILL');}catch{}},timeout);
   function finish(e){if(done)return;done=true;clearTimeout(kill);if(task.child===child)task.child=null;
    if(e)reject(e);else resolve(result);}
   child.stdout.on('data',b=>{size+=b.length;if(size>20000){try{child.kill('SIGKILL');}catch{}}else{result+=b.toString('utf8');}});
   child.stderr.on('data',b=>{errors=(errors+b.toString('utf8')).slice(-1300);});
   child.once('error',e=>finish(e));
   child.once('close',code=>{
    if(running!==task)return finish(Error('Đã hủy đọc bản dịch.'));
    if(code===0&&size<=20000)return finish();
    finish(Error((errors||('Trình xử lý kết thúc với mã '+code)).slice(-380)));
   });
   if(typeof stdin==='string'){child.stdin.on('error',()=>{});child.stdin.end(stdin);}else child.stdin.end();
  });
 }
 async function synthesize(request={}){
  const lang=String(request.target||'vi').toLowerCase(),voiceId=String(request.voice||'');
  const premium=lang==='vi'&&premiumName(voiceId),alreadyTranslated=request.alreadyTranslated===true;
  const sourceLanguage=String(request.sourceLanguage||'en').toLowerCase();
  if(!ALLOWED.includes(lang))throw Error('Ngôn ngữ không được hỗ trợ.');
  const input=String(request.text||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim();
  if(!input)throw Error('Chưa có văn bản dịch để đọc.');
  if(input.length>MAX_TEXT)throw Error('Đoạn văn bản dài hơn giới hạn 360 ký tự.');
  const info=availability(lang,voiceId);
  if(!info.ready)throw Error(info.reason);
  stop();
  const task={id:++sequence,child:null};
  running=task;
  const temp=await fs.promises.mkdtemp(path.join(os.tmpdir(),'openiptv-tts-'));
  try{
   let speakText=input;
   if(!alreadyTranslated&&sourceLanguage!==lang){
    if(typeof translateText!=='function')
     throw Error('Thiếu bộ dịch trực tiếp cho giọng '+lang);
    if(!/^[a-z]{2,3}$/.test(sourceLanguage)||sourceLanguage==='auto')
     throw Error('Chưa xác định được ngôn ngữ gốc để đọc TTS');
    notify({id:task.id,type:'status',message:'Đang dịch giọng nói '+sourceLanguage+' → '+lang+' (trực tiếp nếu có)…'});
    speakText=String(await translateText(input,lang,sourceLanguage)).trim();
    if(!speakText)throw Error('Bộ dịch không tạo được câu để đọc');
    speakText=speakText.slice(0,600);
   }
   if(running!==task)throw Error('Đã hủy.');
   const output=path.join(temp,'speak.wav');
   if(premium){
    notify({id:task.id,type:'status',message:'VieNeu 48 kHz đang tổng hợp giọng '+premium+' (offline)…'});
    if(!fileOK(managed?.premiumPython)||!fileOK(managed.vieneuBridge))
     throw Error('Thiếu môi trường giọng VieNeu hoặc mã nguồn tổng hợp');
    await invokeProcess(managed.premiumPython,
      ['-u',managed.vieneuBridge,'speak',premium,output],task,{stdin:speakText,timeout:210000});
   }else{
    notify({id:task.id,type:'status',message:'Đang tạo giọng đọc Piper ('+lang+')…'});
    // piper-tts v1.8.0 CLI supports model absolute path and text after "--".
    await invokeProcess(tool('piper'),['-m',voicePath(lang,voiceId),'-f',output,'--',speakText],task,{timeout:70000});
   }
   if(running!==task)throw Error('Đã hủy.');
   const stat=await fs.promises.stat(output);
   if(stat.size<44||stat.size>MAX_WAV)throw Error('Tệp WAV của bộ đọc TTS có dung lượng không hợp lệ.');
   const bytes=await fs.promises.readFile(output);
   if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw Error('Piper chưa tạo được WAV hợp lệ.');
   return {id:task.id,target:lang,voice:voiceId,sourceText:input,translatedText:speakText,mime:'audio/wav',audioBase64:bytes.toString('base64')};
  }finally{
   if(running===task)running=null;
   await fs.promises.rm(temp,{recursive:true,force:true}).catch(()=>{});
  }
 }
 return Object.freeze({availability,configure,synthesize,stop});
}
module.exports={createLocalSpeechService,languageCodeFromConfig,findTool,ALLOWED};
