'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const changes=[
  {
    "file": "src/live-caption-service.cjs",
    "from": "if(words){\n  const detected=s.detectedLang||'unknown';\n  let original=words,source=detected,finalText=words,translated=false;\n  if(s.translate){\n   try{\n    if(source===s.target){\n     // Already the target language; do not call Argos or force English.\n     translated=true;\n    }else{\n     if(source==='unknown'){\n      notify({type:'status',id:s.id,message:'Whisper chưa xác định ngôn ngữ, thử nhận diện English…'});\n      const english=tidy(await exec(wh,[...args,'-tr'],s,65000));\n      if(!english)throw Error('Whisper chưa thể dịch qua English');\n      original=english;source='en';\n     }\n     if(source!==s.target){\n      notify({type:'status',id:s.id,message:'Đang dịch trực tiếp '+source+' → '+s.target+'…'});\n      try{finalText=await translateText(original,s.target,source);}\n      catch(error){\n       if(s.target==='en'&&source!=='en'){\n        notify({type:'status',id:s.id,message:'Không có mô hình trực tiếp, dùng Whisper → English…'});\n        finalText=tidy(await exec(wh,[...args,'-tr'],s,65000));\n        if(!finalText)throw error;\n       }else throw error;\n      }\n     }else finalText=original;\n     translated=true;\n    }\n   }catch(error){\n    // A translation failure must NEVER terminate working Live Caption.\n    const reason=String(error?.message||error).replace(/[\\r\\n]+/g,' ').slice(0,220);\n    notify({type:'translation-error',id:s.id,\n      message:'Dịch '+detected+' → '+s.target+' thất bại: '+reason});\n    finalText=words;translated=false;source=detected;original=words;\n   }\n  }\n  if(current!==s)break;\n  const key=finalText.toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu,' ').trim();\n  const now=Date.now();\n  if(!key||(key===s.lastKey&&now-s.lastEmittedAt<60000))continue;\n  s.lastKey=key;s.lastEmittedAt=now;\n  notify({type:'segment',id:s.id,text:finalText,\n   englishText:source==='en'?original:'',sourceLanguage:source,\n   translated,language:translated?s.target:(source==='unknown'?'auto':source),\n   utteranceKey:key});\n}",
    "to": "if(words){\n  const detected=s.detectedLang||'unknown';\n  let finalText=words,translated=false,englishText='',effectiveLang=detected;\n  if(s.translate){\n   try{\n    const routed=await routeLiveSegment({\n     text:words,source:detected,target:s.target,\n     translateText:(input,target,source,options)=>translateText(input,target,source,options),\n     whisperToEnglish:async()=>{\n      // Do not call Argos zh->en or any other source->en pivot;\n      // Whisper's -tr path has already been working on these live streams.\n      return tidy(await exec(wh,[...args,'-tr'],s,65000));\n     },\n     notify:message=>notify({type:'status',id:s.id,message})\n    });\n    finalText=routed.text;translated=!!routed.translated;\n    englishText=routed.englishText||'';\n    effectiveLang=routed.language||detected;\n   }catch(error){\n    // Preserve healthy Live Caption and keep TTS from speaking failed translations.\n    const reason=String(error?.message||error).replace(/[\\r\\n]+/g,' ').slice(0,230);\n    notify({type:'translation-error',id:s.id,\n      message:'Dịch '+detected+' → '+s.target+' thất bại: '+reason});\n    finalText=words;translated=false;englishText='';effectiveLang=detected;\n   }\n  }\n  if(current!==s)break;\n  const key=finalText.toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu,' ').trim();\n  const now=Date.now();\n  if(!key||(key===s.lastKey&&now-s.lastEmittedAt<60000))continue;\n  s.lastKey=key;s.lastEmittedAt=now;\n  notify({type:'segment',id:s.id,text:finalText,englishText,\n   sourceLanguage:detected,translated,\n   language:translated?s.target:(effectiveLang==='unknown'?'auto':effectiveLang),\n   utteranceKey:key});\n}"
  },
  {
    "file": "src/live-caption-service.cjs",
    "from": "const {spawn}=require('node:child_process');",
    "to": "const {spawn}=require('node:child_process');\nconst {routeLiveSegment}=require('./live-translate-router.cjs');"
  },
  {
    "file": "src/main.cjs",
    "from": "translateText:(text,target,source)=>captionTranslator.translateText(text,target,source)",
    "to": "translateText:(text,target,source,options)=>captionTranslator.translateText(text,target,source,options)"
  }
];
for(const {file,from,to} of changes){
 const full=path.join(process.cwd(),file),source=fs.readFileSync(full,'utf8');
 assert(source.includes(from),'v4.23.53 routing source anchor missing: '+file+' : '+from.slice(0,110));
 fs.writeFileSync(full,source.replace(from,to));
}
console.log('v4.23.53 direct model first; Whisper English+Argos target fallback for all selected languages');
