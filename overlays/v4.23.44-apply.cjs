'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),old='4.23.43',next='4.23.44';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
function swap(p,a,b){const s=read(p);assert(s.includes(a),'Missing source pattern in '+p+': '+a.slice(0,120));write(p,s.replace(a,b));}
const pkg=JSON.parse(read('package.json'));assert.equal(pkg.version,old);
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.44 Desktop - multilingual offline Piper TTS for live-translated IPTV, one-click model installation, adjustable original-audio ducking';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(p);assert(s.includes(old),p+' has wrong source version');write(p,s.replaceAll(old,next));
}
swap('renderer/index.html','<title>Open IPTV Pro '+old+'</title>','<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+old+'</span>','<span class="version">'+next+'</span>');
let html=read('renderer/index.html');
const anchor='<small id="liveCaptionStatus" role="status" aria-live="polite">Đang kiểm tra Whisper…</small>';
assert(html.includes(anchor),'Missing live caption status');
const tts=[
'<label class="tts-mode" title="Đọc lời dịch bằng Piper chạy trên máy">',
' <input type="checkbox" id="liveTtsToggle"/>🔊 Giọng dịch TTS',
'</label>',
'<select id="liveTtsLanguage" aria-label="Ngôn ngữ giọng đọc">',
' <option value="vi">Tiếng Việt</option>',
' <option value="en">English</option>',
' <option value="es">Español</option>',
' <option value="fr">Français</option>',
' <option value="de">Deutsch</option>',
' <option value="zh">中文</option>',
' <option value="pt">Português</option>',
' <option value="it">Italiano</option>',
' <option value="ru">Русский</option>',
' <option value="id">Indonesia</option>',
'</select>',
'<label class="tts-duck-label" for="liveTtsDuck" title="Âm lượng gốc khi giọng dịch phát">Tiếng gốc</label>',
'<select id="liveTtsDuck" aria-label="Âm lượng tiếng gốc trong khi TTS phát">',
' <option value="0">Tắt gốc</option>',
' <option value="15">15%</option>',
' <option value="25" selected>25%</option>',
' <option value="50">50%</option>',
' <option value="75">75%</option>',
' <option value="100">100%</option>',
'</select>',
'<button type="button" id="liveTtsInstall" title="Tự cài Piper, Argos và giọng đọc; tải một lần cần kết nối Internet">Cài mô hình tự động</button>',
'<small id="liveTtsStatus" role="status" aria-live="polite">Kiểm tra TTS…</small>'
].join('\n');
html=html.replace(anchor,anchor+'\n'+tts);
const css='local-tts-row-v42344.css',script='local-tts-v42344.js';
assert(!html.includes(css)&&!html.includes(script));
html=html.replace('</head>','<link rel="stylesheet" href="'+css+'"/></head>');
html=html.replace('</body></html>','<script src="'+script+'"></script></body></html>');
assert(html.lastIndexOf(script)>html.lastIndexOf('live-captions-v42343.js'),'TTS should load after caption UI');
assert(html.indexOf('id="liveTtsToggle"')>html.indexOf('id="captionThirdRow"'),'TTS must stay on third row');
for(const id of ['liveTtsToggle','liveTtsLanguage','liveTtsDuck','liveTtsInstall','liveTtsStatus']){
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Missing or duplicate '+id);
}
write('renderer/index.html',html);
const dir=process.argv[2];assert(dir&&fs.statSync(dir).isDirectory(),'Overlay directory is required');
for(const [src,dest] of [
 ['local-tts-service-v42344.cjs','src/local-tts-service.cjs'],
 ['local-ai-autoinstall-v42344.cjs','src/local-ai-autoinstall.cjs'],
 ['local-tts-ui-v42344.js','renderer/local-tts-v42344.js'],
 ['local-tts-row-v42344.css','renderer/local-tts-row-v42344.css']
]){const a=path.join(dir,src);assert(fs.existsSync(a),'Missing overlay '+src);fs.copyFileSync(a,path.join(root,dest));}
swap('src/preload.cjs',"  captionStatus:()=>ipcRenderer.invoke('caption:status'),",[
"  ttsStatus:lang=>ipcRenderer.invoke('tts:status',lang),",
"  ttsInstall:lang=>ipcRenderer.invoke('tts:install',lang),",
"  ttsSynthesize:args=>ipcRenderer.invoke('tts:synthesize',args),",
"  ttsStop:()=>ipcRenderer.invoke('tts:stop'),",
"  ttsOnEvent:cb=>{const on=(_e,data)=>cb(data);ipcRenderer.on('tts:event',on);return ()=>ipcRenderer.removeListener('tts:event',on);},",
"  captionStatus:()=>ipcRenderer.invoke('caption:status'),"
].join('\n'));
swap('src/main.cjs',"const {createLiveCaptionService}=require('./live-caption-service.cjs');",[
"const {createLiveCaptionService}=require('./live-caption-service.cjs');",
"const {createLocalSpeechService}=require('./local-tts-service.cjs');",
"const {createAutoModelInstaller}=require('./local-ai-autoinstall.cjs');"
].join('\n'));
swap('src/main.cjs','let pendingBackup=null, pendingRestore=null, liveCaptionService=null;',
'let pendingBackup=null, pendingRestore=null, liveCaptionService=null, localTTS=null, localModelInstaller=null;');
swap('src/main.cjs',"  ipcMain.handle('caption:status',()=>liveCaptionService.status());",[
"  localModelInstaller=createAutoModelInstaller({dataDir:app.getPath('userData'),notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('tts:event',data);}});",
"  localTTS=createLocalSpeechService({dataDir:app.getPath('userData'),managed:localModelInstaller.paths(),notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('tts:event',data);}});",
"  ipcMain.handle('tts:status',(_e,lang)=>({...localTTS.availability(lang),install:localModelInstaller.state(lang)}));",
"  ipcMain.handle('tts:install',(_e,lang)=>localModelInstaller.install(lang));",
"  ipcMain.handle('tts:synthesize',(_e,params)=>localTTS.synthesize(params));",
"  ipcMain.handle('tts:stop',()=>localTTS.stop());",
"  ipcMain.handle('caption:status',()=>liveCaptionService.status());"
].join('\n'));
swap('src/main.cjs',"app.on('before-quit',()=>{try{liveCaptionService?.stop();}catch{}",
"app.on('before-quit',()=>{try{localTTS?.stop();}catch{}try{localModelInstaller?.cancel();}catch{}try{liveCaptionService?.stop();}catch{}");
const oldHelper='CAP_NHAT_GITHUB_V4_23_43_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_44_MAC.command';
assert(fs.existsSync(path.join(root,oldHelper)),'Missing v4.23.43 Git helper');
write(newHelper,read(oldHelper).replaceAll(old,next).replaceAll('4_23_43','4_23_44'));
swap('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
for(const p of ['tests/classic_controls_universal_v42340.test.cjs','tests/player_toolbar_v42341.test.cjs']){
 if(fs.existsSync(path.join(root,p))){const s=read(p),v=s.replaceAll(old,next);if(v!==s)write(p,v);}
}
const legacyCaptionTest='tests/live-caption-v42343.test.cjs';
if(fs.existsSync(path.join(root,legacyCaptionTest))){
 const raw=read(legacyCaptionTest);
 const check=`assert.equal(JSON.parse(read('package.json')).version,'${old}')`;
 assert(raw.includes(check),'Old caption test version assertion changed');
 write(legacyCaptionTest,raw.replace(check,`assert.equal(JSON.parse(read('package.json')).version,'${next}')`));
}
const tests=[
"'use strict';",
"const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');",
"const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');",
"const ai=require('../src/local-ai-autoinstall.cjs'),tts=require('../src/local-tts-service.cjs');",
"test('v4.23.44 supported language voices and pinned installers match architectures',()=>{",
" assert.equal(ai.VOICES.vi,'vi_VN-25hours_single-low');",
" for(const platform of [['darwin','arm64'],['darwin','x64'],['win32','x64']])assert.equal(ai.uvReleaseFor(...platform)[1].length,64);",
" assert.equal(ai.uvReleaseFor('sunos','sparc'),null);",
"});",
"test('v4.23.44 one-click installer does not download without a click',()=>{",
" const folder=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'openiptv-tts-test-'));",
" try{const m=ai.createAutoModelInstaller({dataDir:folder});",
" assert.equal(m.state('vi').installed,false);assert.equal(m.state('en').translationModelInstalled,true);",
" assert.throws(()=>m.state('../etc'));assert.equal(fs.existsSync(path.join(folder,'local-tts','python-env')),false);",
" }finally{fs.rmSync(folder,{recursive:true,force:true});}",
"});",
"test('v4.23.44 TTS validates language and never depends on cloud recognition API',()=>{",
" const folder=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'openiptv-tts-test-'));",
" try{const m=ai.createAutoModelInstaller({dataDir:folder});",
" const t=tts.createLocalSpeechService({dataDir:folder,managed:m.paths()});",
" assert.equal(t.availability('vi').ready,false);",
" assert.equal(t.availability('en').ready,false);",
" assert.match(read('src/local-tts-service.cjs'),/ARGOS_PACKAGES_DIR/);",
" }finally{fs.rmSync(folder,{recursive:true,force:true});}",
"});",
"test('v4.23.44 Live Caption third row adds opt-in TTS, local model install and source ducking',()=>{",
" const h=read('renderer/index.html'),ui=read('renderer/local-tts-v42344.js'),css=read('renderer/local-tts-row-v42344.css');",
" const last=h.indexOf('id=\"captionThirdRow\"'),first=h.indexOf('class=\"control-layout-bottom\"');",
" assert.ok(last>first);",
" for(const id of ['liveTtsToggle','liveTtsLanguage','liveTtsDuck','liveTtsInstall','liveTtsStatus'])assert.match(h,new RegExp('id=\"'+id+'\"'));",
" assert.match(ui,/video.volume=baseVolume\\*percent\\/100/);",
" assert.match(ui,/restore\\(\\)/);assert.match(ui,/ttsInstall/);",
" assert.match(css,/caption-third-controls/);assert.ok(h.lastIndexOf('local-tts-row-v42344.css')>h.lastIndexOf('live-caption-row-v42343.css'));",
"});",
"test('v4.23.44 desktop IPC only permits bounded operations, cleans processes on quit',()=>{",
" const main=read('src/main.cjs'),pre=read('src/preload.cjs');",
" for(const id of ['tts:status','tts:install','tts:synthesize','tts:stop']){assert.ok(main.includes(id));assert.ok(pre.includes(id));}",
" assert.match(main,/localTTS\\?\\.stop\\(\\)/);assert.match(main,/localModelInstaller\\?\\.cancel\\(\\)/);",
" assert.equal(JSON.parse(read('package.json')).version,'4.23.44');",
"});",""
].join('\n');
write('tests/local-tts-v42344.test.cjs',tests);
write('RELEASE_NOTES_V4_23_44.md',
'# v4.23.44 - Multilingual Offline Voice-over (beta)\n\n'
+'Adds an opt-in TTS switch, target language picker, source-volume ducking (0/15/25/50/75/100%), and one-click managed installation on playback row three.\n'
+'Whisper speech translation (English text) → Argos offline translation to selected target (if needed) → Piper local speech WAV. Audio output uses a separate audio element; IPTV source level is reduced only while speech plays, and restored afterwards and upon stopping/switching channels.\n'
+'One-click setup downloads the pinned, checksum-verified uv bootstrap, a private Python 3.11 environment, Piper/Argos packages, the chosen Piper voice and English-target Argos language package. No administrator password is needed. Internet is required once per language and models are not included in the DMG.\n'
+'This beta depends on the v4.23.43 Whisper caption pipeline already being set up. Piper voice licenses vary. Some protected streams, unavailable translation pairs, or offline downloads can fail and will report their errors. Mac Intel/Apple Silicon and Windows source retained; no change to main.\n');
console.log('v4.23.44 source patch complete: managed Piper + Argos multilingual TTS and original-volume ducking');
