'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],base='4.23.52',next='4.23.53';
assert(assets&&fs.statSync(assets).isDirectory(),'Missing v4.23.53 overlays');
const full=p=>path.join(root,p),read=p=>fs.readFileSync(full(p),'utf8'),write=(p,s)=>fs.writeFileSync(full(p),s);
function swap(p,a,b){
 const s=read(p);assert(s.includes(a),'Missing v4.23.53 source anchor '+p+': '+a.slice(0,95));
 write(p,s.replace(a,b));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,base,'Expected exact v4.23.52 Electron source');
assert.deepEqual(pkg.build?.mac?.target,['dmg'],'Mac package must remain DMG-only');
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.53 — direct-first multilingual subtitles and Whisper English fallback for every target';
if(Array.isArray(pkg.build?.files)&&!pkg.build.files.some(x=>x==='src/**/*'||x==='src/**'||x==='src/live-translate-router.cjs'))
 pkg.build.files.push('src/live-translate-router.cjs');
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(full('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===base)lock.version=next;
 if(lock.packages?.['']?.version===base)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const name of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const t=read(name);assert(t.includes(base),'Missing build version '+name);
 write(name,t.replaceAll(base,next));
}
swap('renderer/index.html','<title>Open IPTV Pro '+base+'</title>','<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+base+'</span>','<span class="version">'+next+'</span>');
for(const [asset,dest] of [
 ['argos-bridge-v42353.py','src/argos-bridge.py'],
 ['local-ai-autoinstall-v42353.cjs','src/local-ai-autoinstall.cjs'],
 ['caption-translator-v42353.cjs','src/caption-translator.cjs'],
 ['live-translate-router-v42353.cjs','src/live-translate-router.cjs']
]){
 const source=path.join(assets,asset);assert(fs.existsSync(source),'Missing required overlay '+asset);
 fs.copyFileSync(source,full(dest));
}
require(path.join(assets,'live-translate-routing-v42353-apply.cjs'));
const oldHelper='CAP_NHAT_GITHUB_V4_23_52_MAC.command';
const newHelper='CAP_NHAT_GITHUB_V4_23_53_MAC.command';
assert(fs.existsSync(full(oldHelper)),'Missing prior release helper');
write(newHelper,read(oldHelper).replaceAll(base,next).replaceAll('4_23_52','4_23_53'));
swap('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
for(const name of fs.readdirSync(full('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+name,t=read(p),updated=t.replaceAll(base,next);
 if(updated!==t)write(p,updated);
}
const migration={
 'tests/v42350-direct-routing.test.cjs':[
  ["assert.match(cap,/translateText\\(original,s.target,source\\)/)",
   "assert.match(cap,/routeLiveSegment/)"],
  ["assert.match(cap,/sourceLanguage:source/)",
   "assert.match(cap,/sourceLanguage:detected/)"]
 ],
 'tests/multilingual-captions-v42346.test.cjs':[
  ["assert.match(s,/translateText\\(original,s.target,source\\)/)",
   "assert.match(s,/routeLiveSegment/)"],
  ["assert.match(s,/englishText:source==='en'\\?original/)",
   "assert.match(s,/englishText,/)"]
 ]
};
for(const [p,pairs] of Object.entries(migration)){
 if(!fs.existsSync(full(p)))continue;
 let t=read(p);
 for(const [a,b] of pairs){
  if(t.includes(a))t=t.replace(a,b);
 }
 write(p,t);
}
const test=path.join(assets,'v42353-multilingual-router.test.cjs');
assert(fs.existsSync(test),'Missing comprehensive 15-language routing regression');
fs.copyFileSync(test,full('tests/v42353-multilingual-router.test.cjs'));
for(const p of ['src/live-caption-service.cjs','src/caption-translator.cjs','src/local-ai-autoinstall.cjs']){
 const t=read(p);assert(!t.includes("ARGOS_CHUNK_TYPE:'NONE'"),'Unsafe old Argos environment in '+p);
}
write('RELEASE_NOTES_V4_23_53.md',[
 '# Open IPTV Pro v4.23.53 — Live Translate for 15 target languages',
 '',
 '- Root cause: previous fallback attempted to initialize or download Argos source→English models (e.g., zh→en) despite Whisper→English already functioning.',
 '- Direct source→target Argos translations remain preferred and use genuine direct-only model checks.',
 '- When a direct model does not exist or fails, Whisper translates audio→English; Argos then translates English→the selected target language.',
 '- English target uses Whisper translation; same-language subtitles bypass translation completely.',
 '- Source→English Argos packages are never downloaded as a mandatory intermediary in the live caption pipeline.',
 '- A failed target model preserves the original caption and reports a precise error instead of claiming translation succeeded.',
 '- Direct model absence is cached per session; other language choices do not need to re-install the broken source→English model.',
 '- TTS voice choices, TTS reading speed, original-audio attenuation and IPTV playback remain unchanged.',
 '- Mac build still generates only native DMG plus the full exact-version source ZIP.'
].join('\n')+'\n');
console.log('Applied Open IPTV Pro v4.23.53 universal direct-first + Whisper English fallback (15 targets)');
