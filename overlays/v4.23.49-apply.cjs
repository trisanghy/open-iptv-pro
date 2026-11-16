'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2];
assert(assets&&fs.existsSync(assets),'Missing v4.23.49 overlay directory');
const file=p=>path.join(root,p),read=p=>fs.readFileSync(file(p),'utf8'),write=(p,s)=>fs.writeFileSync(file(p),s);
function swap(p,a,b){
 const t=read(p);assert(t.includes(a),'Missing expected integration anchor: '+p+' : '+a.slice(0,120));write(p,t.replace(a,b));
}
function copy(asset,dest){
 const src=path.join(assets,asset);
 assert(fs.existsSync(src),'Missing overlay '+asset);
 fs.copyFileSync(src,file(dest));
}
const old='4.23.48',next='4.23.49';
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,old,'Expected exact 4.23.48 patched source');
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.49 — real Vietnamese Argos translation, 24 on-device premium VieNeu voices and TTS diagnostic';
if(Array.isArray(pkg.build?.files)){
 for(const pythonAsset of ['src/argos-bridge.py','src/vieneu-bridge.py']){
  if(!pkg.build.files.includes(pythonAsset))pkg.build.files.push(pythonAsset);
 }
}
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(file('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===old)lock.version=next;
 if(lock.packages?.['']?.version===old)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const v=read(p);assert(v.includes(old),'Windows source version mismatch '+p);
 write(p,v.replaceAll(old,next));
}
swap('renderer/index.html','<title>Open IPTV Pro '+old+'</title>','<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+old+'</span>','<span class="version">'+next+'</span>');
for(const [asset,dest] of [
 ['argos-bridge-v42349.py','src/argos-bridge.py'],
 ['caption-translator-v42349.cjs','src/caption-translator.cjs'],
 ['premium-voices-v42349.cjs','src/premium-voices.cjs'],
 ['vieneu-bridge-v42349.py','src/vieneu-bridge.py'],
 ['local-ai-autoinstall-v42349.cjs','src/local-ai-autoinstall.cjs'],
 ['local-tts-service-v42349.cjs','src/local-tts-service.cjs'],
 ['local-tts-ui-v42349.js','renderer/local-tts-v42344.js'],
 ['live-captions-ui-v42349.js','renderer/live-captions-v42343.js']
])copy(asset,dest);
let html=read('renderer/index.html');
html=html.replaceAll('Dịch sang tiếng Anh trên máy','Nhận diện rồi dịch sang ngôn ngữ đã chọn (offline)');
const voiceButton=html.match(/<button[^>]*id="liveTtsInstall"[^>]*>[\s\S]*?<\/button>/);
assert(voiceButton,'TTS install button not found');
html=html.replace(voiceButton[0],voiceButton[0]+
 '\n<button type="button" id="liveTtsPreview" title="Nghe thử giọng trên máy, không cần bật kênh IPTV">Nghe thử</button>');
const chooseModel=html.match(/<button[^>]*id="captionChooseModel"[^>]*>[\s\S]*?<\/button>/);
assert(chooseModel,'Caption setup model picker not found');
html=html.replace(chooseModel[0],chooseModel[0]+
 '\n<button type="button" id="captionTestTranslate" title="Kiểm tra dịch câu mẫu English → ngôn ngữ đã chọn">Kiểm tra dịch mẫu</button>');
assert.equal((html.match(/id="liveTtsPreview"/g)||[]).length,1);
assert.equal((html.match(/id="captionTestTranslate"/g)||[]).length,1);
write('renderer/index.html',html);
fs.appendFileSync(file('renderer/local-tts-row-v42344.css'),[
 '',
 '/* v4.23.49 · responsive premium voice picker, actionable TTS errors */',
 '#page-tv .player-control-card #liveTtsVoice { max-width:270px!important;min-width:175px!important; }',
 '#page-tv .player-control-card #liveTtsPreview {',
 ' min-height:29px!important;padding:4px 9px!important;border-radius:8px!important;',
 ' background:var(--surface2,#1a2835)!important;border:1px solid var(--edge,#344450)!important;',
 ' color:var(--fg,#eff4f9)!important;font-size:11px!important;',
 '}',
 '#page-tv .player-control-card #liveTtsStatus[data-error="true"]{color:#ff887f!important;}',
 ''
].join('\n'));
swap('src/preload.cjs',
 "  captionLanguageStatus:target=>ipcRenderer.invoke('caption:languageStatus',target),",
 "  captionTestTranslation:target=>ipcRenderer.invoke('caption:testTranslation',target),\n  captionLanguageStatus:target=>ipcRenderer.invoke('caption:languageStatus',target),");
swap('src/main.cjs',
 "  ipcMain.handle('caption:languageStatus',(_e,target)=>captionTranslator.status(target));",
 "  ipcMain.handle('caption:testTranslation',async(_e,target)=>{\n"+
 "   if(!isValidTarget(target))throw Error('Ngôn ngữ dịch thử không hợp lệ');\n"+
 "   const translatedText=await captionTranslator.translateEnglish('Good morning, how are you today?',target);\n"+
 "   return {target,translatedText};\n"+
 "  });\n"+
 "  ipcMain.handle('caption:languageStatus',(_e,target)=>captionTranslator.status(target));");
const oldHelper='CAP_NHAT_GITHUB_V4_23_48_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_49_MAC.command';
if(fs.existsSync(file(oldHelper)))write(newHelper,read(oldHelper).replaceAll(old,next).replaceAll('4_23_48','4_23_49'));
for(const p of fs.readdirSync(file('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const target='tests/'+p;
 let v=read(target).replaceAll(old,next).replaceAll(oldHelper,newHelper);
 if(p==='argos-tts-voice-v42348.test.cjs'){
  const oldAssertion="assert.equal(dirs.pairReady('vi'),true);";
  const fixed=[
   "assert.equal(dirs.pairReady('vi'),false);",
   "const verification=path.join(root,'local-tts','verified-language-pairs');",
   "fs.mkdirSync(verification,{recursive:true});",
   "fs.writeFileSync(path.join(verification,'vi.ok'),'verified-v42349');",
   "assert.equal(dirs.pairReady('vi'),true);"
  ].join('\n  ');
  assert(v.includes(oldAssertion),'Prior Argos model metadata expectation changed');
  v=v.replace(oldAssertion,fixed);
 }
 if(v!==read(target))write(target,v);
}
copy('v42349-translation-premium.test.cjs','tests/v42349-translation-premium.test.cjs');
write('RELEASE_NOTES_V4_23_49.md',[
 '# Open IPTV Pro v4.23.49 — Verified Vietnamese translation and premium TTS',
 '',
 '- Revalidates Argos by translating an actual sentence; stale flags and damaged en_vi models are repaired on demand.',
 '- Adds a one-click English→Vietnamese test with visible output under caption settings.',
 '- Adds 24 VieNeu-TTS v3 Turbo 48 kHz preset voices; every selection is local, opt-in, downloaded to an isolated venv/cache.',
 '- Keeps the 3 original lightweight Vietnamese Piper voice models as alternatives.',
 '- A translated subtitle in the selected TTS language goes directly to speech without translating twice.',
 '- Adds independent voice preview, so TTS can be tested without a live IPTV stream.',
 '- First-time high-quality model downloads can be large and slower on CPU; runtime performance requires on-device verification.',
 '- No modification to Electron main branch or separate Rust/Tauri development.'
].join('\n')+'\n');
console.log('v4.23.49: Argos repair, translation smoke test, 24 VieNeu voices and TTS preview integrated');
