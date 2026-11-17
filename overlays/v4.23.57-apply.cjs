'use strict';
/** v4.23.57 — continuous caption capture and low-latency latest-only VieNeu TTS. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],before='4.23.56',after='4.23.57';
assert(assets&&fs.existsSync(assets),'Missing pinned v4.23.57 overlays');
const full=p=>path.join(root,p),read=p=>fs.readFileSync(full(p),'utf8'),write=(p,s)=>fs.writeFileSync(full(p),s);
function swap(p,a,b){
 const s=read(p);assert(s.includes(a),'Missing v4.23.57 anchor '+p+': '+a.slice(0,115));write(p,s.replace(a,b));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,before,'Need exact previous v4.23.56 source');
assert.deepEqual(pkg.build.mac.target,['dmg']);
pkg.version=after;pkg.description='Open IPTV Pro v4.23.57 — continuous Whisper capture and warm VieNeu speech';
if(Array.isArray(pkg.build.files)){
 for(const f of ['src/continuous-capture.cjs','src/vieneu-session.cjs']){
  if(!pkg.build.files.includes(f))pkg.build.files.push(f);
 }
}
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(full('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===before)lock.version=after;
 if(lock.packages?.['']?.version===before)lock.packages[''].version=after;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const file of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(file);assert(s.includes(before),'Missing previous version '+file);
 write(file,s.replaceAll(before,after));
}
swap('renderer/index.html','<title>Open IPTV Pro '+before+'</title>','<title>Open IPTV Pro '+after+'</title>');
swap('renderer/index.html','<span class="version">'+before+'</span>','<span class="version">'+after+'</span>');
for(const [src,dest] of [
 ['continuous-capture-v42357.cjs','src/continuous-capture.cjs'],
 ['vieneu-session-v42357.cjs','src/vieneu-session.cjs'],
 ['vieneu-bridge-v42357.py','src/vieneu-bridge.py'],
 ['local-tts-service-v42357.cjs','src/local-tts-service.cjs'],
 ['local-tts-ui-v42357.js','renderer/local-tts-v42344.js'],
 ['v42357-lowlatency.test.cjs','tests/v42357-lowlatency.test.cjs']
]){
 const asset=path.join(assets,src);
 assert(fs.existsSync(asset),'Missing overlay '+src);
 fs.copyFileSync(asset,full(dest));
}
require(path.join(assets,'v42357-streaming-apply.cjs'));
swap('src/main.cjs','try{localTTS?.stop();}catch{}','try{localTTS?.shutdown?.();}catch{}');
const captionUI='renderer/live-captions-v42343.js';
swap(captionUI," let lastError='',lastLang=lang.value,lastTranslationFailureAt=0;",
 " let lastError='',lastLang=lang.value,lastTranslationFailureAt=0,lastShownSequence=0;");
swap(captionUI,"   activeId=res?.id||0;activeUrl=url;activeSignature=signature();lastLang='';",
 "   activeId=res?.id||0;activeUrl=url;activeSignature=signature();lastLang='';lastShownSequence=0;");
swap(captionUI,"  if(ev.type==='segment'){\n   outputWords(ev.text,ev.language||lang.value,!!ev.translated);",
 "  if(ev.type==='segment'){\n   const order=Number(ev.sequence)||0;\n   if(order&&order<lastShownSequence)return;\n   if(order)lastShownSequence=order;\n   outputWords(ev.text,ev.language||lang.value,!!ev.translated);");
const oldHelper='CAP_NHAT_GITHUB_V4_23_56_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_57_MAC.command';
assert(fs.existsSync(full(oldHelper)),'Missing prior immutable release helper');
write(newHelper,read(oldHelper).replaceAll(before,after).replaceAll('4_23_56','4_23_57'));
swap('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
for(const filename of fs.readdirSync(full('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+filename,s=read(p),newText=s.replaceAll(before,after);
 if(s!==newText)write(p,newText);
}
for(const s of ['src/live-caption-service.cjs','src/local-tts-service.cjs','src/vieneu-session.cjs','src/continuous-capture.cjs','renderer/local-tts-v42344.js']){
 assert(fs.existsSync(full(s)),'Missing new runtime '+s);
}
write('RELEASE_NOTES_V4_23_57.md',[
 '# Open IPTV Pro v4.23.57 — no-gap captions and current subtitle speech',
 '',
 '- Stops reopening the IPTV URL for each 8-second transcription. One continuously running FFmpeg process writes finalized 4-second WAV segments in order.',
 '- Whisper reads segments while FFmpeg collects the next one; temporary audio is deleted after processing.',
 '- Captions appear immediately after recognition; optional translation runs in a separate queue and does not block capture.',
 '- Stale translations cannot replace newer subtitles.',
 '- VieNeu ONNX model remains warm between phrases instead of being reloaded every time.',
 '- New subtitles invalidate older TTS generations and stop old audio; replies over 12 seconds late are skipped.',
 '- Existing original-audio attenuation, TTS speed, all AI models, IPTV playlists and settings are preserved.',
 '- Mac build keeps only DMG + full same-version source ZIP.',
 '- Real-time latency and completeness depend on CPU performance and stream quality and need verification on Mac.'
].join('\n')+'\n');
console.log('Applied v4.23.57 continuous captions plus latest-only warm VieNeu TTS');
