'use strict';
/**
 * Only owned model folders below Electron app.getPath('userData').
 * Never take an arbitrary filesystem path from the renderer.
 */
const fs=require('node:fs'),path=require('node:path');
const ITEMS=Object.freeze({
 whisper:{label:'Whisper · nhận diện giọng nói',paths:['live-caption/auto']},
 argos:{label:'Argos · các bộ dịch',paths:['local-tts/argos-packages','local-tts/verified-language-pairs','local-tts/installed-pairs.json']},
 piper:{label:'Piper · giọng đọc nhẹ',paths:['local-tts/voices']},
 vieneu:{label:'VieNeu · giọng đọc cao cấp',paths:['local-tts/vieneu-model-cache','local-tts/vieneu-python-env','local-tts/vieneu-v3-turbo.ready.json']},
 hymt18:{label:'Hy-MT2 1.8B · nhanh',paths:['ai-translate/models/hymt18']},
 hymt7:{label:'Hy-MT2 7B · chất lượng',paths:['ai-translate/models/hymt7']},
 cache:{label:'Bộ đệm tải AI · tải lại khi cần',paths:['local-tts/uv-cache','ai-translate/uv-cache']},
 runtimes:{label:'Môi trường Python AI · cài lại khi cần',paths:['local-tts/python-env','local-tts/vieneu-python-env','local-tts/python-managed','ai-translate/python-env','ai-translate/python-managed','ai-translate/mlx-runtime.ready']}
});
function createLocalModelStorage({dataDir,onBeforeDelete=async()=>{}}={}){
 if(!dataDir||!path.isAbsolute(dataDir))throw Error('Private absolute userData path is required');
 const root=path.resolve(dataDir);
 const allowed=(rel)=>{
  if(typeof rel!=='string'||rel.startsWith('/')||rel.includes('..')||rel.includes('\\'))throw Error('Invalid managed model path');
  const full=path.resolve(root,rel);
  if(!full.startsWith(root+path.sep))throw Error('Cannot access files outside app userData');
  return full;
 };
 const usage=target=>{
  let total=0;
  function visit(p,depth){
   if(depth>30)return;
   let stat;try{stat=fs.lstatSync(p);}catch{return;}
   if(stat.isSymbolicLink())return;
   if(stat.isFile()){total+=stat.size;return;}
   if(stat.isDirectory())for(const item of fs.readdirSync(p))visit(path.join(p,item),depth+1);
  }
  visit(target,0);return total;
 };
 function inspect(){
  return Object.entries(ITEMS).map(([id,meta])=>{
   const bytes=meta.paths.reduce((sum,rel)=>sum+usage(allowed(rel)),0);
   const present=meta.paths.some(rel=>fs.existsSync(allowed(rel)));
   return {id,label:meta.label,bytes,present};
  });
 }
 let deleting=false;
 async function remove(id){
  if(!Object.hasOwn(ITEMS,id))throw Error('Unknown managed AI item');
  if(deleting)throw Error('AI cleanup already in progress');
  deleting=true;
  try{
   await onBeforeDelete(id);
   const meta=ITEMS[id];
   let freed=0;
   for(const rel of meta.paths){
    const full=allowed(rel);
    const leaf=fs.existsSync(full)?fs.lstatSync(full):null;
    if(leaf?.isSymbolicLink())throw Error('Model folder is a symbolic link, refusing cleanup');
    const parent=path.dirname(full);
    if(fs.existsSync(parent)&&fs.lstatSync(parent).isSymbolicLink())
     throw Error('Managed model parent is a symbolic link');
    freed+=usage(full);
    await fs.promises.rm(full,{force:true,recursive:true,maxRetries:2});
   }
   return {id,freed,items:inspect()};
  }finally{deleting=false;}
 }
 return Object.freeze({inspect,remove,usage});
}
module.exports={ITEMS,createLocalModelStorage};
