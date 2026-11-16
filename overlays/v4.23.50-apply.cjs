'use strict';
// Apply against the already-patched v4.23.48 source, independently of Electron main.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const project=process.cwd(),assets=process.argv[2],before='4.23.48',after='4.23.50';
assert(assets&&fs.existsSync(assets),'Missing v50 overlay folder');
const read=p=>fs.readFileSync(path.join(project,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(project,p),s);
const replace=(p,a,b)=>{
 const text=read(p);assert(text.includes(a),'Missing anchor in '+p+': '+a.slice(0,90));
 write(p,text.replace(a,b));
};
for(const [asset,dest] of [
 ['live-caption-service-v42350.cjs','src/live-caption-service.cjs'],
 ['caption-translator-v42350.cjs','src/caption-translator.cjs'],
 ['argos-bridge-v42350.py','src/argos-bridge.py'],
 ['live-captions-ui-v42350.js','renderer/live-captions-v42343.js'],
 ['local-tts-service-v42350.cjs','src/local-tts-service.cjs'],
 ['local-tts-ui-v42350.js','renderer/local-tts-v42344.js']
]){
 const from=path.join(assets,asset);assert(fs.existsSync(from),'Missing '+asset);
 fs.copyFileSync(from,path.join(project,dest));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,before);
pkg.version=after;
pkg.description='Open IPTV Pro v4.23.50 — Whisper-detected source language, direct Argos pair preference, no-op same-language captions/TTS and persistent audio ducking';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const text=read(p);assert(text.includes(before),'Wrong build version '+p);
 write(p,text.replaceAll(before,after));
}
if(fs.existsSync(path.join(project,'package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===before)lock.version=after;
 if(lock.packages?.['']?.version===before)lock.packages[''].version=after;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
replace('renderer/index.html','<title>Open IPTV Pro '+before+'</title>','<title>Open IPTV Pro '+after+'</title>');
replace('renderer/index.html','<span class="version">'+before+'</span>','<span class="version">'+after+'</span>');
const main=read('src/main.cjs');
const oldCB="translateText:(text,target)=>captionTranslator.translateEnglish(text,target)";
assert(main.includes(oldCB),'Whisper translation callback is missing');
let next=main.replace(oldCB,"translateText:(text,source,target)=>captionTranslator.translate(text,source,target)");
for(const [oldText,newText] of [
 ["ipcMain.handle('caption:languageStatus',(_e,target)=>captionTranslator.status(target));",
  "ipcMain.handle('caption:languageStatus',(_e,target,source)=>captionTranslator.status(target,source||'en'));"],
 ["ipcMain.handle('caption:installLanguage',(_e,target)=>captionTranslator.install(target));",
  "ipcMain.handle('caption:installLanguage',(_e,target,source)=>captionTranslator.install(target,source||'en'));"]
]){
 assert(next.includes(oldText),'Caption native route missing: '+oldText);
 next=next.replace(oldText,newText);
}
write('src/main.cjs',next);
replace('src/preload.cjs',
 'captionLanguageStatus:target=>ipcRenderer.invoke(\'caption:languageStatus\',target),',
 'captionLanguageStatus:(target,source)=>ipcRenderer.invoke(\'caption:languageStatus\',target,source),');
replace('src/preload.cjs',
 'captionInstallLanguage:target=>ipcRenderer.invoke(\'caption:installLanguage\',target),',
 'captionInstallLanguage:(target,source)=>ipcRenderer.invoke(\'caption:installLanguage\',target,source),');
for(const name of fs.readdirSync(path.join(project,'tests')).filter(n=>n.endsWith('.test.cjs'))){
 const file='tests/'+name,original=read(file);
 // Update old tests only where they assert the app-wide current version.
 let modified=original
  .replaceAll("version,'"+before+"'","version,'"+after+"'")
  .replaceAll("version,\""+before+"\"","version,\""+after+"\"");
 if(modified!==original)write(file,modified);
}
fs.copyFileSync(path.join(assets,'direct-translation-v42350.test.cjs'),
 path.join(project,'tests/direct-translation-v42350.test.cjs'));
console.log('Applied v4.23.50 source-language detection, direct-pair routing, no redundant TTS translation and persistent volume ducking.');
