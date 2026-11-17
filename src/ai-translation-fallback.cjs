'use strict';
// Use installed lightweight Argos only when an explicitly selected MLX engine fails.
// Preserve the configured engine. Never start an unsolicited model download.
async function translateWithInstalledFallback({
 engine,text,target,source,options,mlx,argos,onFallback=()=>{}
}={}){
 if(engine==='argos')return argos.translateText(text,target,source,options);
 try{return await mlx.translate(text,target,source,engine);}
 catch(error){
  const ready=source==='en'&&target!=='en'&&argos.status(target)?.ready===true;
  if(!ready)throw error;
  try{onFallback({engine,target,reason:String(error?.message||error).slice(0,140)});}catch{}
  return argos.translateText(text,target,source,options);
 }
}
module.exports={translateWithInstalledFallback};
