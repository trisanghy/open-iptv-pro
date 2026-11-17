'use strict';
/**
 * Google offline translation via a local Ollama service (127.0.0.1 only).
 * Models are downloaded by Ollama on demand; not bundled or uploaded.
 * Gemma 3 and TranslateGemma are subject to Google's Gemma Terms.
 * Gemma 4 is Apache-2.0. These models can be used to translate text;
 * only TranslateGemma is purpose-trained for translation.
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');

const GOOGLE_MODELS=Object.freeze({
 tg4:{tag:'translategemma:4b',label:'TranslateGemma 4B · chuyên dịch',family:'translategemma',approxBytes:3300000000,minRamGB:8,recRamGB:16,license:'gemma-terms'},
 tg12:{tag:'translategemma:12b',label:'TranslateGemma 12B · chất lượng',family:'translategemma',approxBytes:8100000000,minRamGB:16,recRamGB:32,license:'gemma-terms'},
 tg27:{tag:'translategemma:27b',label:'TranslateGemma 27B · máy mạnh',family:'translategemma',approxBytes:17000000000,minRamGB:32,recRamGB:64,license:'gemma-terms'},
 gem3_1:{tag:'gemma3:1b',label:'Gemma 3 1B · siêu nhẹ',family:'gemma3',approxBytes:806000000,minRamGB:4,recRamGB:8,license:'gemma-terms'},
 gem3_4:{tag:'gemma3:4b',label:'Gemma 3 4B · đa ngữ',family:'gemma3',approxBytes:3400000000,minRamGB:8,recRamGB:16,license:'gemma-terms'},
 gem4_e2:{tag:'gemma4:e2b',label:'Gemma 4 E2B · gọn nhẹ',family:'gemma4',approxBytes:7500000000,minRamGB:12,recRamGB:24,license:'apache-2.0'},
 gem4_e4:{tag:'gemma4:e4b',label:'Gemma 4 E4B · linh hoạt',family:'gemma4',approxBytes:9500000000,minRamGB:16,recRamGB:32,license:'apache-2.0'},
 gem4_12:{tag:'gemma4:12b',label:'Gemma 4 12B · chuyên sâu',family:'gemma4',approxBytes:8000000000,minRamGB:16,recRamGB:32,license:'apache-2.0'},
 gem4_26:{tag:'gemma4:26b',label:'Gemma 4 26B A4B · đa năng',family:'gemma4',approxBytes:19000000000,minRamGB:32,recRamGB:48,license:'apache-2.0'}
});
const LANGUAGES=Object.freeze({
 en:'English',vi:'Vietnamese',zh:'Chinese',fr:'French',es:'Spanish',de:'German',
 ja:'Japanese',ko:'Korean',pt:'Portuguese',it:'Italian',ru:'Russian',
 id:'Indonesian',ar:'Arabic',hi:'Hindi',th:'Thai'
});
const BASE='http://127.0.0.1:11434';
const safeError=error=>String(error?.message||error).slice(0,280);
function googlePrompt(source,target,text,model){
 if(!Object.hasOwn(LANGUAGES,source)||!Object.hasOwn(LANGUAGES,target))throw Error('Ngôn ngữ Google AI không hỗ trợ');
 const raw=String(text||'').trim().slice(0,1200);
 if(!raw)return '';
 const sourceName=LANGUAGES[source],targetName=LANGUAGES[target];
 if(model?.family==='translategemma'){
  return 'You are a professional '+sourceName+' ('+source+') to '+targetName+' ('+target+
    ') translator. Your goal is to accurately convey the meaning and nuances of the original '+
    sourceName+' text while adhering to '+targetName+' grammar, vocabulary, and cultural sensitivities.\n'+
    'Produce only the '+targetName+' translation, without any additional explanations or commentary. '+
    'Please translate the following '+sourceName+' text into '+targetName+':\n\n'+raw;
 }
 return 'You are a professional subtitle translator. Translate the following '+sourceName+' text to '+
   targetName+'. Preserve meaning, names, punctuation and concise subtitle phrasing. '+
   'Return only the '+targetName+' translation. Do not explain, add tags, or output reasoning.\n\n'+raw;
}
function candidateExecutables(platform,environment){
 const paths=[];
 if(platform==='darwin')paths.push('/Applications/Ollama.app/Contents/Resources/ollama',
  '/opt/homebrew/bin/ollama','/usr/local/bin/ollama');
 if(platform==='win32'){
  const local=environment.LOCALAPPDATA||'',program=environment.PROGRAMFILES||'';
  if(local)paths.push(path.join(local,'Programs','Ollama','ollama.exe'));
  if(program)paths.push(path.join(program,'Ollama','ollama.exe'));
 }
 return paths;
}
function createGoogleOllamaService({platform=process.platform,arch=process.arch,
 fetcher=globalThis.fetch,spawnProcess=spawn,notify=()=>{},
 environment=process.env,filesystem=fs,wait=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 if(typeof fetcher!=='function')throw Error('Ollama local backend requires fetch');
 const supported=platform==='darwin'||platform==='win32'||platform==='linux';
 let activeInstall='',started=null;
 function valid(key){if(!Object.hasOwn(GOOGLE_MODELS,key))throw Error('Google AI ID không hợp lệ');return GOOGLE_MODELS[key];}
 const notifyProgress=message=>{try{notify({type:'ai-progress',message:String(message).slice(0,190)});}catch{}};
 async function request(uri,{method='GET',payload,timeout=12000,signal}={}){
  if(!['/api/tags','/api/version','/api/pull','/api/chat','/api/delete'].includes(uri))
   throw Error('Ollama endpoint is not allowlisted');
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),timeout);
  const cancel=()=>ctrl.abort();
  if(signal){if(signal.aborted)ctrl.abort();else signal.addEventListener('abort',cancel,{once:true});}
  try{
   const response=await fetcher(BASE+uri,{
    method,redirect:'error',headers:{'Content-Type':'application/json'},
    body:payload===undefined?undefined:JSON.stringify(payload),signal:ctrl.signal
   });
   if(!response?.ok)throw Error('Ollama HTTP '+(response?.status||'unknown')+' '+uri);
   return response;
  }catch(error){throw Error('Ollama localhost: '+safeError(error));}
  finally{
   clearTimeout(timer);
   if(signal)signal.removeEventListener('abort',cancel);
  }
 }
 async function list({timeout=1500}={}){
  try{
   const r=await request('/api/tags',{timeout});
   const json=await r.json();
   const tags=Array.isArray(json?.models)?json.models:[];
   return {online:true,models:tags.filter(m=>typeof m?.name==='string'&&Number.isFinite(m.size))};
  }catch{return {online:false,models:[]};}
 }
 async function states(){
  const {online,models}=await list();
  const byTag=new Map(models.map(m=>[m.name,m]));
  const all=Object.fromEntries(Object.entries(GOOGLE_MODELS).map(([id,meta])=>{
   const exact=byTag.get(meta.tag);
   return [id,{...meta,id,backend:'ollama',installed:!!exact,supported,
    runtimeReady:online,bytes:exact?.size||0,
    running:false,installing:activeInstall===id,
    reason:!supported?'Yêu cầu macOS/Windows/Linux có Ollama':
      online?'':'Cần cài và bật Ollama (miễn phí), bấm “Cài Ollama”'}];
  }));
  return {online,models:all};
 }
 function executable(){
  for(const candidate of candidateExecutables(platform,environment)){
   try{if(filesystem.statSync(candidate).isFile())return candidate;}catch{}
  }
  return platform==='win32'?'ollama.exe':'ollama';
 }
 async function ensureRunning(){
  if((await list({timeout:900})).online)return true;
  if(!supported)throw Error('Nền tảng này không hỗ trợ bộ chạy Ollama');
  const exe=executable();
  // Child stays local; never binds a public network interface.
  try{
   if(!started||started.exitCode!==null){
    started=spawnProcess(exe,['serve'],{
     shell:false,windowsHide:true,stdio:'ignore',
     env:{...environment,OLLAMA_HOST:'127.0.0.1:11434'}
    });
    started.on('error',()=>{started=null;});
    started.unref?.();
   }
  }catch{throw Error('Chưa cài Ollama. Mở mục Cài Ollama và cài bộ chạy miễn phí.');}
  for(let i=0;i<16;i++){
   await wait(550);
   if((await list({timeout:950})).online)return true;
  }
  throw Error('Không kết nối Ollama. Hãy cài/mở Ollama tại https://ollama.com/download rồi thử lại.');
 }
 async function install(key){
  const meta=valid(key);
  if(activeInstall)throw Error('Đang tải '+GOOGLE_MODELS[activeInstall]?.label+'; thử sau khi xong');
  activeInstall=key;
  try{
   await ensureRunning();
   const existing=await list();
   if(existing.models.some(x=>x.name===meta.tag))return (await states()).models[key];
   notifyProgress('Đang tải '+meta.label+' qua Ollama · dữ liệu lưu trong Ollama...');
   // NDJSON progress from the official Ollama registry, no arbitrary repo/URL input.
   const r=await request('/api/pull',{method:'POST',payload:{model:meta.tag,stream:true,insecure:false},timeout:7200000});
   if(!r.body)throw Error('Ollama không trả dữ liệu tiến độ');
   let partial='',complete=false,lastNotice=0;
   for await(const chunk of r.body){
    partial+=Buffer.from(chunk).toString('utf8');
    if(partial.length>250000)throw Error('Tiến độ tải Ollama quá lớn');
    let pos;
    while((pos=partial.indexOf('\n'))>=0){
     const line=partial.slice(0,pos);partial=partial.slice(pos+1);
     if(!line.trim())continue;
     let event;
     try{event=JSON.parse(line);}catch{throw Error('Ollama trả tiến độ không hợp lệ');}
     if(event.error)throw Error(String(event.error).slice(0,200));
     if(event.status==='success')complete=true;
     const now=Date.now();
     if(now-lastNotice>1200||complete){
      lastNotice=now;
      const percent=event.total?Math.min(100,Math.floor(100*Number(event.completed||0)/event.total))+'%':'';
      notifyProgress('Ollama · '+meta.label+': '+String(event.status||'đang tải').slice(0,60)+' '+percent);
     }
    }
   }
   if(!complete)throw Error('Ollama chưa xác nhận tải xong mô hình');
   const data=await states();
   if(!data.models[key].installed)throw Error('Ollama báo thành công nhưng chưa thấy mô hình trong danh sách');
   return data.models[key];
  }finally{activeInstall='';}
 }
 async function translate(text,target,source='en',key='tg4'){
  const meta=valid(key);
  if(!Object.hasOwn(LANGUAGES,target)||!Object.hasOwn(LANGUAGES,source))
   throw Error('Ngôn ngữ đích/nguồn không được hỗ trợ');
  const sentence=String(text||'').trim().slice(0,1200);
  if(!sentence||target===source)return sentence;
  await ensureRunning();
  const current=await list();
  if(!current.models.some(x=>x.name===meta.tag))
   throw Error('Chưa tải '+meta.label+'. Mở ⚙ → Tải mô hình.');
  const prompt=googlePrompt(source,target,sentence,meta);
  const result=await request('/api/chat',{method:'POST',timeout:120000,payload:{
    model:meta.tag,stream:false,think:false,keep_alive:'5m',
    messages:[{role:'user',content:prompt}],
    options:{temperature:0.1,top_p:0.9,num_predict:200,num_ctx:2048}
  }});
  const answer=await result.json();
  const translated=String(answer?.message?.content||'').trim()
    .replace(/^<think>[\s\S]*?<\/think>\s*/,'').trim();
  if(!translated)throw Error('Google AI không trả lại bản dịch');
  return translated.slice(0,2400);
 }
 async function remove(key){
  const meta=valid(key);
  if(activeInstall===key)throw Error('Đang tải mô hình, không thể xóa');
  await ensureRunning();
  const before=await states();
  if(!before.models[key].installed)return {id:key,freed:0,items:[]};
  // Deletes exactly one allowlisted tag. WARNING: Ollama weights are shared
  // with other applications using the same local Ollama installation.
  await request('/api/delete',{method:'DELETE',payload:{model:meta.tag},timeout:120000});
  const after=await states();
  if(after.models[key].installed)throw Error('Mô hình vẫn tồn tại trong Ollama');
  return {id:key,freed:before.models[key].bytes,shared:true,items:[]};
 }
 function stop(){
  // Leave Ollama running; it may be used by other user applications.
  return Promise.resolve();
 }
 return Object.freeze({MODELS:GOOGLE_MODELS,states,install,translate,remove,
  stop,ensureRunning,list,valid});
}
module.exports={createGoogleOllamaService,GOOGLE_MODELS,googlePrompt,candidateExecutables};
