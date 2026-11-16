'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),old='4.23.45',next='4.23.46';
const f=p=>path.join(root,p),get=p=>fs.readFileSync(f(p),'utf8'),put=(p,s)=>fs.writeFileSync(f(p),s);
const swap=(p,a,b)=>{const s=get(p);assert(s.includes(a),'Missing source marker '+p+' => '+a.slice(0,100));put(p,s.replace(a,b));};
const pkg=JSON.parse(get('package.json'));assert.equal(pkg.version,old);pkg.version=next;
pkg.description='Open IPTV Pro v4.23.46: offline 15-language Live Translate and reliable Whisper Live Caption, English intermediary for multilingual TTS';
put('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){const s=get(p);assert(s.includes(old),p+' version mismatch');put(p,s.replaceAll(old,next));}
swap('renderer/index.html','<title>Open IPTV Pro '+old+'</title>','<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+old+'</span>','<span class="version">'+next+'</span>');
const overlays=process.argv[2];assert(overlays&&fs.existsSync(overlays),'Missing overlays');
for(const [a,b] of [['caption-translator-v42346.cjs','src/caption-translator.cjs'],['live-captions-ui-v42346.js','renderer/live-captions-v42343.js'],['live-caption-lang-v42346.css','renderer/live-caption-lang-v42346.css']]){
 const p=path.join(overlays,a);assert(fs.existsSync(p),'Missing overlay '+a);fs.copyFileSync(p,f(b));
}
const languageNames={vi:'Tiếng Việt',en:'English',fr:'Français',es:'Español',de:'Deutsch',zh:'中文',ja:'日本語',ko:'한국어',pt:'Português',it:'Italiano',ru:'Русский',id:'Indonesia',ar:'العربية',hi:'हिन्दी',th:'ไทย'};
let html=get('renderer/index.html');
const oldMenu='<select id="liveTranslateTarget" aria-label="Ngôn ngữ dịch"><option value="en">English</option></select>';
assert(html.includes(oldMenu),'Expected English-only Live Translate menu');
const newMenu='<select id="liveTranslateTarget" aria-label="Ngôn ngữ dịch phụ đề">'+Object.entries(languageNames).map(([key,name])=>'<option value="'+key+'"'+(key==='vi'?' selected':'')+'>'+name+'</option>').join('')+'</select>';
html=html.replace(oldMenu,newMenu);
const status='<small id="liveCaptionStatus" role="status" aria-live="polite">Đang kiểm tra Whisper…</small>';
assert(html.includes(status),'Caption status marker missing');
html=html.replace(status,status+'\n <button type="button" id="captionRetry" hidden title="Thử bật lại Live Caption/Translate">↻ Thử lại</button>');
html=html.replace('</head>','<link rel="stylesheet" href="live-caption-lang-v42346.css"/></head>');
assert.equal((html.match(/id="liveTranslateTarget"/g)||[]).length,1);
assert.equal((html.match(/id="captionRetry"/g)||[]).length,1);
put('renderer/index.html',html);
let cap=get('src/live-caption-service.cjs');
const capSwap=(a,b)=>{assert(cap.includes(a),'Whisper service anchor missing: '+a.slice(0,100));cap=cap.replace(a,b);};
capSwap('env=process.env}){','env=process.env,translateText=async text=>text}){');
capSwap("const args=['-m',md,'-f',wav,'-l','auto','-nt','-np','-t','4'];",
"const args=['-m',md,'-f',wav,'-l','auto','-nt','-t','4'];");
capSwap("if(words)notify({type:'segment',id:s.id,text:words,translated:s.translate,language:s.translate?'en':'auto'});",[
 "if(words){",
 " let finalText=words;",
 " if(s.translate&&s.target!=='en'){",
 "  notify({type:'status',id:s.id,message:'Đang dịch phụ đề sang '+s.target+'…'});",
 "  finalText=await translateText(words,s.target);",
 " }",
 " if(current!==s)break;",
 " if(finalText)notify({type:'segment',id:s.id,text:finalText,englishText:s.translate?words:'',translated:s.translate,language:s.translate?s.target:'auto'});",
 "}"
].join('\n'));
capSwap("const s={id:++seq,url,translate:input?.translate===true,child:null};",
"const target=input?.translate===true?String(input?.target||'en'):'auto';\n  const s={id:++seq,url,translate:input?.translate===true,target,child:null};");
capSwap("language:s.translate?'en':'auto',translated:s.translate","language:s.translate?s.target:'auto',translated:s.translate");
capSwap("if(fails>=3){notify({type:'error',id:s.id,message:'Không nhận diện được âm thanh sau 3 lần. Kiểm tra URL và mô hình.'});break;}",
"if(fails>=3){notify({type:'error',id:s.id,message:'Không nhận diện được sau 3 lần: '+String(e.message||e).slice(0,145)});break;}");
put('src/live-caption-service.cjs',cap);
// Install only an Argos language pair when subtitles need it; no TTS voice is necessary.
let mod=get('src/local-ai-autoinstall.cjs');
const trans=[
 ' async function installTranslation(lang){',
 "  const allowed=['vi','fr','es','de','zh','ja','ko','pt','it','ru','id','ar','hi','th'];",
 "  if(lang==='en')return {ready:true,target:lang};",
 "  if(!allowed.includes(lang))throw Error('Chưa hỗ trợ tiếng dịch '+lang);",
 "  if(active)throw Error('Đang cài mô hình AI khác');",
 "  active={child:null};",
 "  try{",
 "   fs.mkdirSync(root,{recursive:true});fs.mkdirSync(argosDir,{recursive:true});",
 "   await ensureUv(lang);",
 "   if(!hasFile(python)){",
 "    await run(uv,['python','install','3.11'],lang,300000);",
 "    await run(uv,['venv',venv,'--python','3.11','--python-preference','only-managed'],lang,180000);",
 "   }",
 "   if(!hasFile(argos)||!hasFile(pm)){",
 "    await run(uv,['pip','install','--python',python,'argostranslate==1.11.0'],lang,600000);",
 "   }",
 "   if(!pairReady(lang)){",
 "    report('Đang tải Argos English → '+lang+'…',lang);",
 "    await run(pm,['update'],lang,240000);",
 "    await run(pm,['install','translate-en_'+lang],lang,480000);",
 "    let history={};try{history=JSON.parse(fs.readFileSync(pairsPath,'utf8'));}catch{}",
 "    history[lang]=true;",
 "    fs.writeFileSync(pairsPath,JSON.stringify(history,null,2),{mode:0o600});",
 "   }",
 "   if(!hasFile(argos)||!pairReady(lang))throw Error('Không tìm thấy bộ dịch '+lang+' sau khi cài');",
 "   report('Đã cài gói dịch offline '+lang,lang);",
 "   return {ready:true,target:lang};",
 "  }finally{active=null;}",
 " }"
].join('\n');
assert(mod.includes(' function cancel(){'),'Installer cancellation marker missing');
mod=mod.replace(' function cancel(){',trans+'\n function cancel(){');
const exportLine='return Object.freeze({state,install,cancel,paths:()=>({piper,argos,pm,voices,argosDir,voiceFile,pairReady})});';
assert(mod.includes(exportLine),'Installer exports changed');
mod=mod.replace(exportLine,'return Object.freeze({state,install,installTranslation,cancel,paths:()=>({piper,argos,pm,voices,argosDir,voiceFile,pairReady})});');
put('src/local-ai-autoinstall.cjs',mod);
swap('src/main.cjs',"const {createAutoModelInstaller}=require('./local-ai-autoinstall.cjs');",
"const {createAutoModelInstaller}=require('./local-ai-autoinstall.cjs');\nconst {createCaptionTranslator,isValidTarget}=require('./caption-translator.cjs');");
swap('src/main.cjs','localTTS=null, localModelInstaller=null, whisperModelInstaller=null;',
'localTTS=null, localModelInstaller=null, whisperModelInstaller=null, captionTranslator=null;');
const createCaption="  liveCaptionService=createLiveCaptionService({dataDir:app.getPath('userData'),getFFmpeg:ffmpegPath,notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('caption:event',data);}});";
swap('src/main.cjs',createCaption,
"  liveCaptionService=createLiveCaptionService({dataDir:app.getPath('userData'),getFFmpeg:ffmpegPath,notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('caption:event',data);},translateText:(text,target)=>captionTranslator.translateEnglish(text,target)});");
const modelInit="  localModelInstaller=createAutoModelInstaller({dataDir:app.getPath('userData'),notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('tts:event',data);}});";
swap('src/main.cjs',modelInit,modelInit+'\n  captionTranslator=createCaptionTranslator({installer:localModelInstaller});');
swap('src/main.cjs',"  ipcMain.handle('caption:status',()=>liveCaptionService.status());",
"  ipcMain.handle('caption:languageStatus',(_e,target)=>captionTranslator.status(target));\n  ipcMain.handle('caption:installLanguage',(_e,target)=>captionTranslator.install(target));\n  ipcMain.handle('caption:status',()=>liveCaptionService.status());");
swap('src/main.cjs',"ipcMain.handle('caption:start',(_e,opts)=>liveCaptionService.start(opts));",
"ipcMain.handle('caption:start',(_e,opts)=>{if(opts?.translate===true&&!isValidTarget(opts?.target||'en'))throw Error('Ngôn ngữ đích không hợp lệ');return liveCaptionService.start(opts);});");
swap('src/preload.cjs',"  captionStatus:()=>ipcRenderer.invoke('caption:status'),",
"  captionLanguageStatus:target=>ipcRenderer.invoke('caption:languageStatus',target),\n  captionInstallLanguage:target=>ipcRenderer.invoke('caption:installLanguage',target),\n  captionStatus:()=>ipcRenderer.invoke('caption:status'),");
swap('renderer/local-tts-v42344.js',"const text=String(e.text).trim();",
"const text=String(e.englishText||e.text).trim();");
const oldHelper='CAP_NHAT_GITHUB_V4_23_45_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_46_MAC.command';
assert(fs.existsSync(f(oldHelper)),'Git helper missing');
put(newHelper,get(oldHelper).replaceAll(old,next).replaceAll('4_23_45','4_23_46'));
swap('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
for(const p of ['tests/player_toolbar_v42341.test.cjs','tests/classic_controls_universal_v42340.test.cjs','tests/live-caption-v42343.test.cjs','tests/local-tts-v42344.test.cjs','tests/whisper-auto-v42345.test.cjs']){
 if(!fs.existsSync(f(p)))continue;
 const data=get(p).replaceAll("assert.equal(JSON.parse(read('package.json')).version,'"+old+"')","assert.equal(JSON.parse(read('package.json')).version,'"+next+"')")
   .replaceAll("assert.equal(JSON.parse(get('package.json')).version,'"+old+"')","assert.equal(JSON.parse(get('package.json')).version,'"+next+"')");
 put(p,data);
}
const tests=[
 "'use strict';",
 "const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');",
 "const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');",
 "const {createCaptionTranslator,LANGUAGES,isValidTarget}=require('../src/caption-translator.cjs');",
 "test('v4.23.46: dropdown includes 15 target languages, Vietnamese default',()=>{",
 " const h=read('renderer/index.html');const m=h.match(/<select id=\"liveTranslateTarget\"[^>]*>([\\s\\S]*?)<\\/select>/);",
 " assert.ok(m);for(const key of Object.keys(LANGUAGES))assert.match(m[1],new RegExp('value=\"'+key+'\"'));",
 " assert.match(m[1],/value=\"vi\" selected/);",
 "});",
 "test('v4.23.46: Whisper no longer uses no-print flag, emits English intermediate',()=>{",
 " const s=read('src/live-caption-service.cjs');",
 " assert.ok(s.includes(\"'-nt','-t','4'\"));",
 " assert.doesNotMatch(s,/'-nt','-np'/);",
 " assert.match(s,/translateText\\(words,s.target\\)/);",
 " assert.match(s,/englishText:s.translate\\?words/);",
 "});",
 "test('v4.23.46: errors do not silently uncheck Caption and Translate',()=>{",
 " const s=read('renderer/live-captions-v42343.js');",
 " assert.match(s,/captionAutoInstall\\(\\)/);assert.match(s,/captionInstallLanguage\\(target\\)/);",
 " assert.match(s,/captionRetry/);assert.doesNotMatch(s,/caption.checked=false;translate.checked=false/);",
 "});",
 "test('v4.23.46: Argos status, translation, safe supported language validation',async()=>{",
 " const installer={paths:()=>({argos:'',argosDir:'/tmp',pairReady:()=>false}),installTranslation:async()=>({ready:false})};",
 " const t=createCaptionTranslator({installer});",
 " assert.ok(isValidTarget('vi'));assert.equal(isValidTarget('bogus'),false);",
 " assert.equal(t.status('vi').ready,false);assert.equal(t.status('en').ready,true);",
 " assert.equal(await t.translateEnglish('Hello','en'),'Hello');",
 " await assert.rejects(t.translateEnglish('Hello','vi'),/Chưa/);",
 " assert.throws(()=>t.status('../etc'));",
 "});",
 "test('v4.23.46: translate-only installer never requires Piper voice model',()=>{",
 " const s=read('src/local-ai-autoinstall.cjs');const a=s.indexOf('async function installTranslation');",
 " assert.ok(a>0);const c=s.slice(a,s.indexOf('function cancel()',a));",
 " assert.match(c,/translate-en_/);assert.doesNotMatch(c,/voiceFile\\(/);",
 "});",
 "test('v4.23.46: speech synthesis consumes English intermediate, no double-translate',()=>{",
 " assert.match(read('renderer/local-tts-v42344.js'),/e\\.englishText\\|\\|e\\.text/);",
 "});",
 "test('v4.23.46: bounded IPC plus app version is synchronized',()=>{",
 " const main=read('src/main.cjs'),pre=read('src/preload.cjs');",
 " assert.match(main,/caption:installLanguage/);assert.match(main,/caption:languageStatus/);",
 " assert.match(pre,/captionInstallLanguage/);assert.match(pre,/captionLanguageStatus/);",
 " assert.equal(JSON.parse(read('package.json')).version,'4.23.46');",
 "});",""
].join('\n');
put('tests/multilingual-captions-v42346.test.cjs',tests);
put('RELEASE_NOTES_V4_23_46.md',
'# v4.23.46 — Fixed Live Caption and multilingual Live Translate\n\n'
+'- Whisper output fixed: the -np (no prints) flag prevented recognized subtitles from appearing.\n'
+'- Live Caption and Live Translate now retain their checkbox state when a model, stream, or network fails, show errors and offer Retry.\n'
+'- English-only Live Translate menu replaced by 15 target languages (Vietnamese default).\n'
+'- Auto-install missing Whisper and Argos offline language models only on first use. English can be translated directly by Whisper.\n'
+'- Live Caption keeps its native transcription path. Live Translate displays actual translated subtitles from Argos.\n'
+'- TTS receives the English intermediate and separately translates to its own voice language; source-volume ducking unchanged.\n'
+'- Existing channel browser, player layout, IPTV, EPG, Mac Intel/Apple Silicon and Windows functions retained.\n'
+'- Beta limitations: FFmpeg may not access DRM or cookie-protected streams; Argos model availability varies. No UI-only fake translation.\n');
console.log('v4.23.46: multilingual offline captions and Whisper recognition fixes applied');
