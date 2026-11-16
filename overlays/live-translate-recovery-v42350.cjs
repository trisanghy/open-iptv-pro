'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const changes=[
  {
    "file": "src/live-caption-service.cjs",
    "from": "child.stderr?.on('data',d=>{\n    const part=d.toString('utf8');err=(err+part).slice(-1800);\n    const detected=err.match(/auto-detected language:\\s*([a-z]{2,3})\\b/i)||\n      err.match(/detected language:\\s*([a-z]{2,3})\\b/i);\n    if(detected)s.detectedLang=detected[1].toLowerCase();\n   });",
    "to": "child.stderr?.on('data',d=>{\n    const part=d.toString('utf8');err=(err+part).slice(-1800);\n    const match=err.match(/(?:auto[- ]detected|detected)\\s+language:\\s*([a-z-]{2,30})\\b/i);\n    if(match){\n      const raw=match[1].toLowerCase();\n      const aliases={english:'en',vietnamese:'vi',chinese:'zh',mandarin:'zh',\n        french:'fr',german:'de',spanish:'es',japanese:'ja',korean:'ko',\n        portuguese:'pt',italian:'it',russian:'ru',indonesian:'id',\n        arabic:'ar',hindi:'hi',thai:'th'};\n      const normalized=aliases[raw]||raw;\n      if(/^(en|vi|fr|es|de|zh|ja|ko|pt|it|ru|id|ar|hi|th)$/.test(normalized))\n       s.detectedLang=normalized;\n    }\n   });"
  },
  {
    "file": "src/live-caption-service.cjs",
    "from": "if(words){\n  const detected=s.detectedLang||'unknown';\n  let original=words,source=detected,finalText=words,translated=false;\n  if(s.translate){\n   if(source===s.target){\n    translated=true; // Same language: never translate.\n   }else{\n    if(source==='unknown'){\n     notify({type:'status',id:s.id,message:'Không xác định được ngôn ngữ, thử Whisper English…'});\n     const english=tidy(await exec(wh,[...args,'-tr'],s,65000));\n     if(!english)throw Error('Whisper không dịch được tiếng nói sang English');\n     original=english;source='en';\n    }\n    if(source!==s.target){\n     notify({type:'status',id:s.id,message:'Đang tìm mô hình dịch trực tiếp '+source+' → '+s.target+'…'});\n     try{finalText=await translateText(original,s.target,source);}\n     catch(e){\n      if(s.target==='en'&&source!=='en'){\n       notify({type:'status',id:s.id,message:'Không có gói trực tiếp, thử Whisper English…'});\n       finalText=tidy(await exec(wh,[...args,'-tr'],s,65000));\n      }else throw e;\n     }\n    }else finalText=original;\n    translated=true;\n   }\n  }\n  if(current!==s)break;\n  const key=finalText.toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu,' ').trim();\n  const now=Date.now();\n  if(!key||(key===s.lastKey&&now-s.lastEmittedAt<60000))continue;\n  s.lastKey=key;s.lastEmittedAt=now;\n  notify({type:'segment',id:s.id,text:finalText,englishText:source==='en'?original:'',\n   sourceLanguage:source,translated,language:s.translate?s.target:source,utteranceKey:key});\n}",
    "to": "if(words){\n  const detected=s.detectedLang||'unknown';\n  let original=words,source=detected,finalText=words,translated=false;\n  if(s.translate){\n   try{\n    if(source===s.target){\n     // Already the target language; do not call Argos or force English.\n     translated=true;\n    }else{\n     if(source==='unknown'){\n      notify({type:'status',id:s.id,message:'Whisper chưa xác định ngôn ngữ, thử nhận diện English…'});\n      const english=tidy(await exec(wh,[...args,'-tr'],s,65000));\n      if(!english)throw Error('Whisper chưa thể dịch qua English');\n      original=english;source='en';\n     }\n     if(source!==s.target){\n      notify({type:'status',id:s.id,message:'Đang dịch trực tiếp '+source+' → '+s.target+'…'});\n      try{finalText=await translateText(original,s.target,source);}\n      catch(error){\n       if(s.target==='en'&&source!=='en'){\n        notify({type:'status',id:s.id,message:'Không có mô hình trực tiếp, dùng Whisper → English…'});\n        finalText=tidy(await exec(wh,[...args,'-tr'],s,65000));\n        if(!finalText)throw error;\n       }else throw error;\n      }\n     }else finalText=original;\n     translated=true;\n    }\n   }catch(error){\n    // A translation failure must NEVER terminate working Live Caption.\n    const reason=String(error?.message||error).replace(/[\\r\\n]+/g,' ').slice(0,220);\n    notify({type:'translation-error',id:s.id,\n      message:'Dịch '+detected+' → '+s.target+' thất bại: '+reason});\n    finalText=words;translated=false;source=detected;original=words;\n   }\n  }\n  if(current!==s)break;\n  const key=finalText.toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu,' ').trim();\n  const now=Date.now();\n  if(!key||(key===s.lastKey&&now-s.lastEmittedAt<60000))continue;\n  s.lastKey=key;s.lastEmittedAt=now;\n  notify({type:'segment',id:s.id,text:finalText,\n   englishText:source==='en'?original:'',sourceLanguage:source,\n   translated,language:translated?s.target:(source==='unknown'?'auto':source),\n   utteranceKey:key});\n}"
  },
  {
    "file": "renderer/live-captions-v42343.js",
    "from": "  if(ev.type==='status')message(ev.message||'Đang xử lý âm thanh…');",
    "to": "  if(ev.type==='status'&&Date.now()-lastTranslationFailureAt>20000)message(ev.message||'Đang xử lý âm thanh…');\n  if(ev.type==='translation-error'){\n   lastTranslationFailureAt=Date.now();\n   message('Live Translate: '+String(ev.message||'mô hình dịch lỗi').slice(0,180),true);\n  }"
  },
  {
    "file": "renderer/live-captions-v42343.js",
    "from": " let lastError='',lastLang=lang.value;",
    "to": " let lastError='',lastLang=lang.value,lastTranslationFailureAt=0;"
  },
  {
    "file": "renderer/live-captions-v42343.js",
    "from": "   message(ev.translated?'Đang dịch → '+LANGUAGE_NAMES[ev.language||lang.value]:'Live Caption đang nhận diện');",
    "to": "   if(ev.translated||Date.now()-lastTranslationFailureAt>20000)\n    message(ev.translated?'Đang dịch → '+LANGUAGE_NAMES[ev.language||lang.value]:'Live Caption đang nhận diện');"
  }
];
for(const {file,from,to} of changes){
 const name=path.join(process.cwd(),file);
 const source=fs.readFileSync(name,'utf8');
 assert(source.includes(from),'Translation recovery anchor missing: '+file+' : '+from.slice(0,95));
 fs.writeFileSync(name,source.replace(from,to));
}
console.log('v4.23.50: direct language detection and non-fatal offline translation recovery applied');
