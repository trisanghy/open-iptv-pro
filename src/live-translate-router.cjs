'use strict';
/**
 * Live Caption multilingual router.
 * 1. Same-language bypass.
 * 2. Direct model (if available/repairable) for other language pairs.
 * 3. Whisper speech->English (trusted existing runtime) then Argos English->target.
 *
 * Never require Argos source->English when Whisper is already installed.
 * Never produce "translated: true" on error: the caller preserves original captions.
 */
const CODES=new Set(['en','vi','fr','es','de','zh','ja','ko','pt','it','ru','id','ar','hi','th']);
function clean(text){return String(text||'').trim().slice(0,1200);}
async function routeLiveSegment({text,source='unknown',target,translateText,whisperToEnglish,notify=()=>{}}){
 const original=clean(text);
 if(!original)return {text:'',translated:false,language:source};
 if(!CODES.has(target))throw Error('Ngôn ngữ dịch đích không được hỗ trợ: '+target);
 source=CODES.has(source)?source:'unknown';
 if(source===target){
  return {text:original,sourceText:original,sourceLanguage:source,
   englishText:source==='en'?original:'',language:target,translated:true,route:'same'};
 }
 if(typeof translateText!=='function'||typeof whisperToEnglish!=='function')
  throw Error('Thiếu bộ dịch phụ đề đa ngôn ngữ');
 let english='';
 const whisperEnglish=async()=>{
  if(!english){
   notify('Whisper: đang chuyển tiếng nói → English để dự phòng…');
   english=clean(await whisperToEnglish());
   if(!english)throw Error('Whisper không tạo được phụ đề English');
  }
  return english;
 };
 // English from detected original needs exactly one Argos pair.
 if(source==='en'){
  notify('Argos: đang dịch English → '+target+'…');
  const output=clean(await translateText(original,target,'en'));
  if(!output)throw Error('Bộ dịch English → '+target+' trả về rỗng');
  return {text:output,sourceText:original,sourceLanguage:source,englishText:original,
   language:target,translated:true,route:'en-target'};
 }
 // Whisper speech->English is already known to work, so NEVER install
 // a fragile Argos source->English model for English as the target.
 if(target==='en'){
  const output=await whisperEnglish();
  return {text:output,sourceText:original,sourceLanguage:source,englishText:output,
   language:'en',translated:true,route:'whisper-en'};
 }
 if(source!=='unknown'){
  // Only direct source->target, without Argos English pivot.
  try{
   notify('Đang ưu tiên mô hình trực tiếp '+source+' → '+target+'…');
   const output=clean(await translateText(original,target,source,{directOnly:true}));
   if(output)return {text:output,sourceText:original,sourceLanguage:source,
    englishText:'',language:target,translated:true,route:'direct'};
  }catch(error){
   notify('Không dùng được cặp '+source+' → '+target+'; chuyển sang Whisper English → '+target+'…');
  }
 }
 const englishText=await whisperEnglish();
 notify('Argos: đang dịch English → '+target+' (dự phòng)…');
 const output=clean(await translateText(englishText,target,'en'));
 if(!output)throw Error('Argos English → '+target+' trả về rỗng');
 return {text:output,sourceText:original,sourceLanguage:source,
  englishText,language:target,translated:true,route:'whisper-en-target'};
}
module.exports={routeLiveSegment,CODES};
