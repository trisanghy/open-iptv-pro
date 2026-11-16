'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),from='4.23.44',to='4.23.45';
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const put=(p,s)=>fs.writeFileSync(path.join(root,p),s);
function swap(p,a,b){
 const s=get(p);assert(s.includes(a),'Expected source missing '+p+': '+a.slice(0,100));
 put(p,s.replace(a,b));
}
const pkg=JSON.parse(get('package.json'));assert.equal(pkg.version,from);
pkg.version=to;
pkg.description='Open IPTV Pro v4.23.45 - one-click local Whisper, Piper/Argos multilingual voice-over, adjustable original audio and offline models';
put('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const v=get(p);assert(v.includes(from),p+' missing old version');put(p,v.replaceAll(from,to));
}
swap('renderer/index.html','<title>Open IPTV Pro '+from+'</title>','<title>Open IPTV Pro '+to+'</title>');
swap('renderer/index.html','<span class="version">'+from+'</span>','<span class="version">'+to+'</span>');
let html=get('renderer/index.html');
const setup='<button type="button" id="captionChooseBinary">';
assert(html.includes(setup),'Whisper setup panel missing');
html=html.replace(setup,'<button type="button" id="captionAutoInstall" title="Tự tải công cụ Whisper và mô hình tiếng Việt/đa ngôn ngữ">Cài Whisper tự động</button>\n '+setup);
const css='whisper-auto-v42345.css',script='whisper-auto-v42345.js';
assert(!html.includes(css)&&!html.includes(script));
html=html.replace('</head>','<link rel="stylesheet" href="'+css+'"/></head>');
html=html.replace('</body></html>','<script src="'+script+'"></script></body></html>');
assert(html.lastIndexOf(script)>html.lastIndexOf('local-tts-v42344.js'));
assert.equal((html.match(/id="captionAutoInstall"/g)||[]).length,1);
put('renderer/index.html',html);
const dir=process.argv[2];assert(dir&&fs.existsSync(dir),'Missing overlays directory');
for(const [a,b] of [['whisper-autoinstall-v42345.cjs','src/whisper-autoinstall.cjs'],['whisper-auto-ui-v42345.js','renderer/whisper-auto-v42345.js'],['whisper-auto-ui-v42345.css','renderer/whisper-auto-v42345.css']]){
 const source=path.join(dir,a);assert(fs.existsSync(source),'Overlay missing '+a);
 fs.copyFileSync(source,path.join(root,b));
}
swap('src/preload.cjs',"  captionStatus:()=>ipcRenderer.invoke('caption:status'),",[
"  captionAutoInstall:()=>ipcRenderer.invoke('caption:install'),",
"  captionStatus:()=>ipcRenderer.invoke('caption:status'),"
].join('\n'));
swap('src/main.cjs',"const {createAutoModelInstaller}=require('./local-ai-autoinstall.cjs');",[
"const {createAutoModelInstaller}=require('./local-ai-autoinstall.cjs');",
"const {createWhisperAutoInstaller}=require('./whisper-autoinstall.cjs');"
].join('\n'));
swap('src/main.cjs','localTTS=null, localModelInstaller=null;',
'localTTS=null, localModelInstaller=null, whisperModelInstaller=null;');
swap('src/main.cjs',"  ipcMain.handle('caption:status',()=>liveCaptionService.status());",[
"  whisperModelInstaller=createWhisperAutoInstaller({dataDir:app.getPath('userData'),notify:event=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('caption:event',event);}});",
"  ipcMain.handle('caption:install',async()=>{",
"    const result=await whisperModelInstaller.install();",
"    liveCaptionService.setFile('binary',result.binary);",
"    liveCaptionService.setFile('model',result.model);",
"    return {...result,caption:liveCaptionService.status()};",
"  });",
"  ipcMain.handle('caption:status',()=>liveCaptionService.status());"
].join('\n'));
swap('src/main.cjs',"try{localModelInstaller?.cancel();}catch{}try{liveCaptionService?.stop();}",
"try{localModelInstaller?.cancel();}catch{}try{whisperModelInstaller?.cancel();}catch{}try{liveCaptionService?.stop();}");
const oldHelper='CAP_NHAT_GITHUB_V4_23_44_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_45_MAC.command';
assert(fs.existsSync(path.join(root,oldHelper)),oldHelper+' missing');
put(newHelper,get(oldHelper).replaceAll(from,to).replaceAll('4_23_44','4_23_45'));
swap('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
for(const p of ['tests/player_toolbar_v42341.test.cjs','tests/classic_controls_universal_v42340.test.cjs','tests/live-caption-v42343.test.cjs','tests/local-tts-v42344.test.cjs']){
 if(fs.existsSync(path.join(root,p))){
  const text=get(p),next=text.replaceAll("assert.equal(JSON.parse(read('package.json')).version,'"+from+"')","assert.equal(JSON.parse(read('package.json')).version,'"+to+"')");
  if(next!==text)put(p,next);
 }
}
const test=[
 "'use strict';",
 "const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');",
 "const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');",
 "const w=require('../src/whisper-autoinstall.cjs');",
 "test('v4.23.45 Whisper auto setup pins CPU-specific community binaries and original multilingual model hash',()=>{",
 " for(const key of ['darwin-arm64','darwin-x64','win32-x64'])assert.equal(w.BINARIES[key][1].length,64);",
 " assert.equal(w.MODEL_SHA,'60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe');",
 " assert.match(w.MODEL_URL,/ggerganov\\/whisper.cpp/);",
 "});",
 "test('v4.23.45 no download or installation before explicit setup click',()=>{",
 " const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'openiptv-whisper-test-'));",
 " try{const x=w.createWhisperAutoInstaller({dataDir:tmp,platform:'darwin',arch:'arm64'});",
 " assert.equal(x.status().installed,false);assert.equal(x.status().available,true);",
 " assert.equal(fs.existsSync(path.join(tmp,'live-caption','auto')),false);",
 " x.cancel();}finally{fs.rmSync(tmp,{force:true,recursive:true});}",
 "});",
 "test('v4.23.45 Whisper and multilingual TTS both available from third toolbar row, preserving core controls',()=>{",
 " const html=read('renderer/index.html'),ui=read('renderer/whisper-auto-v42345.js');",
 " assert.ok(html.indexOf('id=\"captionAutoInstall\"')>html.indexOf('id=\"captionThirdRow\"'));",
 " assert.ok(html.indexOf('id=\"captionAutoInstall\"')<html.indexOf('id=\"video-seekbar\"')||html.indexOf('id=\"video-seekbar\"')===-1);",
 " assert.match(html,/id=\"liveTtsInstall\"/);",
 " assert.match(ui,/captionAutoInstall/);",
 " assert.ok(html.lastIndexOf('whisper-auto-v42345.js')>html.lastIndexOf('local-tts-v42344.js'));",
 "});",
 "test('v4.23.45 Whisper setup IPC connects only to pinned installer and local model settings',()=>{",
 " const main=read('src/main.cjs'),pre=read('src/preload.cjs');",
 " assert.match(main,/ipcMain.handle\\('caption:install'/);",
 " assert.match(main,/liveCaptionService.setFile\\('binary'/);assert.match(main,/liveCaptionService.setFile\\('model'/);",
 " assert.match(main,/whisperModelInstaller\\?\\.cancel\\(\\)/);",
 " assert.match(pre,/captionAutoInstall/);",
 " assert.equal(JSON.parse(read('package.json')).version,'4.23.45');",
 "});",""
].join('\n');
put('tests/whisper-auto-v42345.test.cjs',test);
put('RELEASE_NOTES_V4_23_45.md',
'# Open IPTV Pro v4.23.45 - One-click offline AI setup\n\n'
+'Adds **Cài Whisper tự động** to the existing Live Caption settings panel in player toolbar row 3. It downloads a pinned, SHA-256 verified native Whisper.cpp CLI for Mac Intel / Apple Silicon or Windows x64 and an official, SHA-256 verified multilingual Whisper GGML base model (~148 MB), then registers both automatically. Requires explicit click and internet once. No admin privileges or manual file selection.\n'
+'Existing v4.23.44 features remain: **Cài mô hình tự động** for Piper TTS + Argos Translate, voice picker, and original-source volume ducking 0-100% while speech plays. Whisper binary archive is a community-built release from sjoerdteunisse/whisper.cpp, not an official ggml-org asset; users should trust only if they accept that source. Language and voice models may have independent licenses. On-device recognition / translation / TTS after initial downloads; source IPTV network may still be required.\n'
+'No changes to main branch, channel playlist handling, or desktop video layout. This remains a beta until tested with real IPTV sources and local audio playback.\n');
console.log('Patched v4.23.45: automatic Whisper setup + TTS auto voices + source volume ducking');
