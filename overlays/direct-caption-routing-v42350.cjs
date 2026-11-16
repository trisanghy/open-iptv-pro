'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const changes=[
  {
    "file": "src/live-caption-service.cjs",
    "from": "child.stderr?.on('data',d=>{err=(err+d.toString('utf8')).slice(-750);});",
    "to": "child.stderr?.on('data',d=>{\n    const part=d.toString('utf8');err=(err+part).slice(-1800);\n    const detected=err.match(/auto-detected language:\\s*([a-z]{2,3})\\b/i)||\n      err.match(/detected language:\\s*([a-z]{2,3})\\b/i);\n    if(detected)s.detectedLang=detected[1].toLowerCase();\n   });"
  },
  {
    "file": "src/live-caption-service.cjs",
    "from": "     const args=['-m',md,'-f',wav,'-l','auto','-nt','-t','4'];\n     if(s.translate)args.push('-tr');",
    "to": "     // Transcribe in original detected language, never force English.\n     s.detectedLang='';\n     const args=['-m',md,'-f',wav,'-l','auto','-nt','-t','4'];"
  },
  {
    "file": "src/live-caption-service.cjs",
    "from": "if(words){\n let finalText=words;\n if(s.translate&&s.target!=='en'){\n  notify({type:'status',id:s.id,message:'Đang dịch phụ đề sang '+s.target+'…'});\n  finalText=await translateText(words,s.target);\n }\n if(current!==s)break;\n if(finalText)notify({type:'segment',id:s.id,text:finalText,englishText:s.translate?words:'',translated:s.translate,language:s.translate?s.target:'auto'});\n}",
    "to": "if(words){\n  const detected=s.detectedLang||'unknown';\n  let original=words,source=detected,finalText=words,translated=false;\n  if(s.translate){\n   if(source===s.target){\n    translated=true; // Same language: never translate.\n   }else{\n    if(source==='unknown'){\n     notify({type:'status',id:s.id,message:'Không xác định được ngôn ngữ, thử Whisper English…'});\n     const english=tidy(await exec(wh,[...args,'-tr'],s,65000));\n     if(!english)throw Error('Whisper không dịch được tiếng nói sang English');\n     original=english;source='en';\n    }\n    if(source!==s.target){\n     notify({type:'status',id:s.id,message:'Đang tìm mô hình dịch trực tiếp '+source+' → '+s.target+'…'});\n     try{finalText=await translateText(original,s.target,source);}\n     catch(e){\n      if(s.target==='en'&&source!=='en'){\n       notify({type:'status',id:s.id,message:'Không có gói trực tiếp, thử Whisper English…'});\n       finalText=tidy(await exec(wh,[...args,'-tr'],s,65000));\n      }else throw e;\n     }\n    }else finalText=original;\n    translated=true;\n   }\n  }\n  if(current!==s)break;\n  const key=finalText.toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu,' ').trim();\n  const now=Date.now();\n  if(!key||(key===s.lastKey&&now-s.lastEmittedAt<60000))continue;\n  s.lastKey=key;s.lastEmittedAt=now;\n  notify({type:'segment',id:s.id,text:finalText,englishText:source==='en'?original:'',\n   sourceLanguage:source,translated,language:s.translate?s.target:source,utteranceKey:key});\n}"
  },
  {
    "file": "src/main.cjs",
    "from": "translateText:(text,target)=>captionTranslator.translateEnglish(text,target)",
    "to": "translateText:(text,target,source)=>captionTranslator.translateText(text,target,source)"
  },
  {
    "file": "renderer/live-captions-v42343.js",
    "from": "   if(translate.checked)await getTranslationLanguage(lang.value);",
    "to": "   // Let Whisper detect source before choosing a direct source→target Argos model."
  },
  {
    "file": "renderer/live-captions-v42343.js",
    "from": "   message(translate.checked?'Đang nghe → dịch '+LANGUAGE_NAMES[lang.value]:'Đang nghe để tạo phụ đề…');",
    "to": "   message(translate.checked?'Đang xác định ngôn ngữ → ưu tiên dịch trực tiếp '+LANGUAGE_NAMES[lang.value]:'Đang nghe để tạo phụ đề…');"
  }
];
for(const {file,from,to} of changes){
 const full=path.join(process.cwd(),file),s=fs.readFileSync(full,'utf8');
 assert(s.includes(from),'Missing v4.23.50 routing anchor '+file+': '+from.slice(0,110));
 fs.writeFileSync(full,s.replace(from,to));
}
console.log('v4.23.50: direct source-to-target route and Whisper duplicate filter applied');
