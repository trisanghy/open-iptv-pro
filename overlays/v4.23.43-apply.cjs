'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),old='4.23.42',next='4.23.43';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
function swap(p,a,b){const s=read(p);assert(s.includes(a),p+' missing expected pattern '+a.slice(0,70));write(p,s.replace(a,b));}
const pkg=JSON.parse(read('package.json'));assert.equal(pkg.version,old);
pkg.version=next;pkg.description='Open IPTV Pro v4.23.43 Desktop - Live Caption and English Live Translate beta using local Whisper.cpp, compact third toolbar row';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1'])swap(p,old,next);
swap('renderer/index.html','<title>Open IPTV Pro '+old+'</title>','<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+old+'</span>','<span class="version">'+next+'</span>');
let html=read('renderer/index.html');
const third='<details class="playback-extra" id="playbackExtra">';
assert(html.includes(third),'Third row expander missing');
const insert=[
'<div class="caption-third-row" id="captionThirdRow">',
' <div class="caption-third-controls" role="group" aria-label="Phụ đề và dịch trực tiếp">',
' <label title="Nhận diện tiếng nói từ luồng IPTV trên máy"><input type="checkbox" id="liveCaptionToggle"/>Live Caption</label>',
' <label title="Dịch sang tiếng Anh trên máy"><input type="checkbox" id="liveTranslateToggle"/>Live Translate</label>',
' <select id="liveTranslateTarget" aria-label="Ngôn ngữ dịch"><option value="en">English</option></select>',
' <button type="button" id="liveCaptionSetup" aria-expanded="false" aria-controls="liveCaptionSetupPanel" title="Thiết lập Whisper">⚙</button>',
' <small id="liveCaptionStatus" role="status" aria-live="polite">Đang kiểm tra Whisper…</small>',
' </div>',third
].join('\n');
html=html.replace(third,insert);
const detailsAt=html.indexOf('id="playbackExtra"');
const closingAt=html.indexOf('</details>',detailsAt);
assert(detailsAt>=0&&closingAt>detailsAt,'Playback extra details closing tag missing');
const closingText=[
'<div class="caption-third-setup" id="liveCaptionSetupPanel" hidden>',
' <button type="button" id="captionChooseBinary">Chọn whisper-cli</button>',
' <button type="button" id="captionChooseModel">Chọn mô hình GGML (.bin)</button>',
' <small>Cần cài whisper.cpp và tải mô hình riêng. Dịch chỉ sang English.</small>',
'</div>',
'</div>',
'<div id="liveCaptionOutput" class="caption-third-output" role="status" aria-live="polite" hidden></div>'
].join('\\n');
html=html.slice(0,closingAt+'</details>'.length)+'\\n'+closingText+html.slice(closingAt+'</details>'.length);
const sheet='live-caption-row-v42343.css',script='live-captions-v42343.js';
assert(!html.includes(sheet)&&!html.includes(script));
html=html.replace('</head>','<link rel="stylesheet" href="'+sheet+'"/></head>');
html=html.replace('</body></html>','<script src="'+script+'"></script></body></html>');
assert(html.indexOf('id="captionThirdRow"')>html.indexOf('class="control-layout-bottom"'),'Feature must appear in THIRD row');
for(const id of ['liveCaptionToggle','liveTranslateToggle','liveCaptionSetup','liveCaptionSetupPanel','captionChooseBinary','captionChooseModel','liveCaptionOutput']){
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Duplicate or missing '+id);
}
write('renderer/index.html',html);
const dir=process.argv[2];assert(dir&&fs.existsSync(dir),'Overlay directory missing');
for(const [a,b] of [['live-caption-service-v42343.cjs','src/live-caption-service.cjs'],['live-captions-ui-v42343.js','renderer/live-captions-v42343.js'],['live-caption-row-v42343.css','renderer/live-caption-row-v42343.css']]){
 assert(fs.existsSync(path.join(dir,a)),'Overlay missing '+a);
 fs.copyFileSync(path.join(dir,a),path.join(root,b));
}
swap('src/preload.cjs',"  capabilities:()=>ipcRenderer.invoke('app:capabilities'),",[
"  captionStatus:()=>ipcRenderer.invoke('caption:status'),",
"  captionStart:params=>ipcRenderer.invoke('caption:start',params),",
"  captionStop:()=>ipcRenderer.invoke('caption:stop'),",
"  captionChooseFile:kind=>ipcRenderer.invoke('caption:chooseFile',kind),",
"  captionOnEvent:cb=>{const f=(_e,data)=>cb(data);ipcRenderer.on('caption:event',f);return ()=>ipcRenderer.removeListener('caption:event',f);},",
"  capabilities:()=>ipcRenderer.invoke('app:capabilities'),"
].join('\n'));
swap('src/main.cjs',"const backupService=require('./backup-service.cjs');",
"const backupService=require('./backup-service.cjs');\nconst {createLiveCaptionService}=require('./live-caption-service.cjs');");
swap('src/main.cjs','let pendingBackup=null, pendingRestore=null;',
'let pendingBackup=null, pendingRestore=null, liveCaptionService=null;');
swap('src/main.cjs','function setupIPC(){',[
'function setupIPC(){',
"  liveCaptionService=createLiveCaptionService({dataDir:app.getPath('userData'),getFFmpeg:ffmpegPath,notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('caption:event',data);}});",
"  ipcMain.handle('caption:status',()=>liveCaptionService.status());",
"  ipcMain.handle('caption:start',(_e,options)=>liveCaptionService.start(options));",
"  ipcMain.handle('caption:stop',()=>liveCaptionService.stop());",
"  ipcMain.handle('caption:chooseFile',async(_e,kind)=>{",
"    if(!['binary','model'].includes(kind))throw Error('Invalid caption setting');",
"    const options={title:kind==='binary'?'Chọn whisper-cli':'Chọn mô hình Whisper GGML',properties:['openFile']};",
"    if(kind==='model')options.filters=[{name:'Whisper GGML',extensions:['bin']}];",
"    const out=await dialog.showOpenDialog(webWindow,options);",
"    if(out.canceled||!out.filePaths?.[0])return {canceled:true};",
"    return {canceled:false,...liveCaptionService.setFile(kind,out.filePaths[0])};",
"  });"
].join('\n'));
swap('src/main.cjs',"app.on('before-quit',()=>{try{dvr?.shutdown();}",
"app.on('before-quit',()=>{try{liveCaptionService?.stop();}catch{}try{dvr?.shutdown();}");
const oldGit='CAP_NHAT_GITHUB_V4_23_42_MAC.command',newGit='CAP_NHAT_GITHUB_V4_23_43_MAC.command';
assert(fs.existsSync(path.join(root,oldGit)));
write(newGit,read(oldGit).replaceAll(old,next).replaceAll('4_23_42','4_23_43'));
swap('tests/release_version_sync_v42332.test.cjs',oldGit,newGit);
for(const p of ['tests/player_toolbar_v42341.test.cjs','tests/classic_controls_universal_v42340.test.cjs']){
 if(fs.existsSync(path.join(root,p))){const s=read(p),changed=s.replaceAll(old,next);if(changed!==s)write(p,changed);}
}
const test=[
 "'use strict';",
 "const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');",
 "const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');",
 "const svc=require('../src/live-caption-service.cjs');",
 "test('v4.23.43 local captions require Whisper and FFmpeg, do not send speech to cloud',()=>{",
 " const inst=svc.createLiveCaptionService({dataDir:require('node:os').tmpdir(),getFFmpeg:()=>null,notify:()=>{}});",
 " assert.equal(inst.status().available,false);assert.match(inst.status().reason,/FFmpeg/);",
 " assert.throws(()=>inst.start({url:'file:///etc/passwd'}));assert.equal(svc.tidy('[00:00:01.000 --> 00:00:02.000] Hello'),'Hello');",
 "});",
 "test('v4.23.43 caption switches are on row three, after both original rows',()=>{",
 " const h=read('renderer/index.html');",
 " assert.ok(h.indexOf('id=\"captionThirdRow\"')>h.indexOf('class=\"control-layout-bottom\"'));",
 " for(const id of ['liveCaptionToggle','liveTranslateToggle','captionChooseBinary','captionChooseModel','liveCaptionOutput'])assert.match(h,new RegExp('id=\"'+id+'\"'));",
 " assert.ok(h.lastIndexOf('live-caption-row-v42343.css')>h.lastIndexOf('player-compact-cast-v42342.css'));",
 " assert.ok(h.lastIndexOf('live-captions-v42343.js')>h.lastIndexOf('app.js'));",
 "});",
 "test('v4.23.43 Native IPC is bounded and captions stop before quit',()=>{",
 " const main=read('src/main.cjs'),pre=read('src/preload.cjs');",
 " for(const tag of ['caption:status','caption:start','caption:stop','caption:chooseFile']){assert.ok(main.includes(tag));assert.ok(pre.includes(tag));}",
 " assert.match(main,/liveCaptionService\\?\\.stop\\(\\)/);",
 " assert.equal(JSON.parse(read('package.json')).version,'4.23.43');",
 "});",""
].join('\n');
write('tests/live-caption-v42343.test.cjs',test);
write('RELEASE_NOTES_V4_23_43.md','# v4.23.43 - Live Caption / Live Translate (beta)\n\n'
+'Opt-in captions and English speech translation via the user-installed local whisper-cli and GGML multilingual model. Tools appear on player toolbar row 3 beside Screenshot/FFmpeg. No cloud speech API. Audio clips are transient and deleted. Chrome native caption UI is not part of Electron; subtitle cues in native PiP are best-effort only. Translation target is English only. Source video layout and Mac/Windows architectures are unchanged.\n');
console.log('Patched v4.23.43: caption engine, IPC, third-row UI, model setup and tests');
