'use strict';
/**
 * Open IPTV Pro v4.23.54 — one AI settings icon, managed AI model cleanup,
 * optional Hy-MT2 1.8B/7B local MLX translation and resource-usage warnings.
 * Apply to exact verified v4.23.53 Electron source.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],base='4.23.53',next='4.23.54';
assert(assets&&fs.statSync(assets).isDirectory(),'Missing v4.23.54 overlays');
const full=p=>path.join(root,p);
const read=p=>fs.readFileSync(full(p),'utf8'),write=(p,s)=>fs.writeFileSync(full(p),s);
function swap(p,a,b){
 const s=read(p);assert(s.includes(a),'Missing v4.23.54 anchor: '+p+' : '+a.slice(0,115));
 write(p,s.replace(a,b));
}
function copy(asset,dest){
 const src=path.join(assets,asset);assert(fs.existsSync(src),'Missing overlay '+asset);
 fs.copyFileSync(src,full(dest));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,base,'Expected v4.23.53 source, do not patch main or Rust');
assert.deepEqual(pkg.build.mac.target,['dmg'],'Mac build must remain DMG-only');
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.54 — unified local AI settings, Hy-MT2 MLX and safe AI storage manager';
if(Array.isArray(pkg.build?.files)){
 for(const n of ['src/hymt-bridge.py','src/hymt-service.cjs','src/local-ai-storage.cjs']){
  if(!pkg.build.files.includes(n))pkg.build.files.push(n);
 }
}
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(full('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===base)lock.version=next;
 if(lock.packages?.['']?.version===base)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const name of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(name);assert(s.includes(base),'Version anchor missing: '+name);
 write(name,s.replaceAll(base,next));
}
swap('renderer/index.html','<title>Open IPTV Pro '+base+'</title>','<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+base+'</span>','<span class="version">'+next+'</span>');
for(const [asset,dest] of [
 ['hymt-bridge-v42354.py','src/hymt-bridge.py'],
 ['hymt-service-v42354.cjs','src/hymt-service.cjs'],
 ['local-ai-storage-v42354.cjs','src/local-ai-storage.cjs'],
 ['local-ai-autoinstall-v42354.cjs','src/local-ai-autoinstall.cjs'],
 ['unified-ai-settings-v42354.js','renderer/unified-ai-settings-v42354.js'],
 ['unified-ai-settings-v42354.css','renderer/unified-ai-settings-v42354.css']
])copy(asset,dest);

// Preserve all existing working live caption and TTS controls, but move
// their installation/configuration actions into the existing single gear.
let html=read('renderer/index.html');
const gear=html.match(/<button[^>]*id="liveCaptionSetup"[^>]*>[\s\S]*?<\/button>/);
assert(gear,'Missing existing caption/translation gear');
html=html.replace(gear[0],gear[0].replace(/title="[^"]*"/,'title="Cài đặt chung: Live Caption, Live Translate, TTS và AI đã tải"'));
const panelOpen='<div class="caption-third-setup" id="liveCaptionSetupPanel" hidden>';
assert(html.includes(panelOpen),'Missing shared gear panel');
const install=html.match(/<button[^>]*id="liveTtsInstall"[^>]*>[\s\S]*?<\/button>/);
assert(install,'Missing TTS installer action');
html=html.replace(install[0],'');
const existingStatus=html.match(/<small[^>]*id="liveTtsStatus"[^>]*>[\s\S]*?<\/small>/);
assert(existingStatus,'Missing visible TTS status row');
html=html.replace(existingStatus[0],existingStatus[0]+
 '\n<small id="aiHeatWarningInline" role="alert" hidden></small>');
const preview=html.match(/<button[^>]*id="liveTtsPreview"[^>]*>[\s\S]*?<\/button>/);
assert(preview,'Missing voice preview action');
html=html.replace(preview[0],'');
const panelIndex=html.indexOf(panelOpen);
const panelEnd=html.indexOf('</div>',panelIndex+panelOpen.length);
assert(panelEnd>panelIndex,'Missing panel ending');
const panelTail=[
 '<div class="ai-settings-section" role="group" aria-label="Bộ dịch AI trên máy">',
 ' <h4>Live Translate · Bộ dịch offline</h4>',
 ' <label for="aiTranslationEngine">Bộ dịch mặc định</label>',
 ' <select id="aiTranslationEngine" aria-label="Chọn bộ dịch AI">',
 '  <option value="auto">Tự động · dùng mô hình đã cài</option>',
 '  <option value="argos">Argos · nhẹ, tiết kiệm</option>',
 '  <option value="hymt18">Hy-MT2 1.8B · nhanh (Mac Apple Silicon)</option>',
 '  <option value="hymt7">Hy-MT2 7B · chất lượng cao (Mac Apple Silicon)</option>',
 ' </select>',
 ' <label for="aiResourceMode">Ưu tiên tài nguyên khi chọn Tự động</label>',
 ' <select id="aiResourceMode" aria-label="Ưu tiên tài nguyên AI">',
 '  <option value="balanced">Cân bằng · Hy-MT2 1.8B nếu đã tải</option>',
 '  <option value="saver">Tiết kiệm RAM/pin · Argos</option>',
 '  <option value="quality">Chất lượng · 7B nếu đã tải</option>',
 ' </select>',
 ' <small>Hy-MT2 tự tải khi bấm “Tải mô hình”. Không tự động tải vài GB khi mở ứng dụng; mọi bản dịch chạy offline sau khi cài.</small>',
 '</div>',
 '<div class="ai-settings-section" role="group" aria-label="Giọng đọc TTS">',
 ' <h4>TTS · Giọng đọc và thử giọng</h4>',
 ' <div class="ai-settings-actions">'+install[0]+preview[0]+'</div>',
 ' <small>Chọn Piper hoặc VieNeu ở hàng giọng đọc phía ngoài; tốc độ và mức tiếng gốc vẫn chỉnh được trực tiếp.</small>',
 '</div>',
 '<div class="ai-settings-section" role="group" aria-label="Quản lý dung lượng AI">',
 ' <h4>Bộ nhớ AI đã tải</h4>',
 ' <small id="aiStorageTotal" aria-live="polite">Đang kiểm tra dung lượng AI…</small>',
 ' <div id="aiModelList" class="ai-model-list" aria-label="Các mô hình AI và chức năng xóa"></div>',
 ' <small>Xóa mô hình chỉ ảnh hưởng các file AI trong thư mục dữ liệu ứng dụng; không xóa kênh, EPG, yêu thích hay mô hình ngoài ứng dụng.</small>',
 '</div>',
 '<p id="aiHeatWarning" role="alert" class="ai-heat-warning" hidden></p>',
 '<small id="aiSettingsStatus" role="status" aria-live="polite"></small>'
].join('\n');
html=html.slice(0,panelEnd)+panelTail+'\n'+html.slice(panelEnd);
html=html.replace('Cần cài whisper.cpp và tải mô hình riêng. Dịch chỉ sang English.',
 'Whisper dùng để nhận diện tiếng nói trên máy; chọn bộ dịch offline và giọng TTS ngay tại đây.');
html=html.replace('</head>','<link rel="stylesheet" href="unified-ai-settings-v42354.css"/></head>');
html=html.replace('</body></html>','<script src="unified-ai-settings-v42354.js"></script></body></html>');
for(const id of ['liveCaptionSetup','liveCaptionSetupPanel','liveTtsInstall','liveTtsPreview','aiTranslationEngine','aiResourceMode','aiModelList','aiHeatWarning','aiHeatWarningInline','aiSettingsStatus']){
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Missing/duplicate AI UI id '+id);
}
write('renderer/index.html',html);

// Tell live-caption-service which selected engine it should use for each
// on-device segment, without altering the stable Whisper transcriber.
swap('src/live-caption-service.cjs',
 "const s={id:++seq,url,translate:input?.translate===true,target,child:null};",
 "const s={id:++seq,url,translate:input?.translate===true,target,engine:String(input?.engine||'auto'),resourceMode:String(input?.resourceMode||'balanced'),child:null};");
swap('src/live-caption-service.cjs',
 "translateText:(input,target,source,options)=>translateText(input,target,source,options),",
 "translateText:(input,target,source,options)=>translateText(input,target,source,{...options,engine:s.engine,resourceMode:s.resourceMode}),");
swap('renderer/live-captions-v42343.js',
 "url:selectedUrl(),translate:translate.checked,target:translate.checked?lang.value:'auto'",
 "url:selectedUrl(),translate:translate.checked,target:translate.checked?lang.value:'auto',engine:window.AISettings?.getEngine?.()||'auto',resourceMode:window.AISettings?.getMode?.()||'balanced'");
swap('renderer/live-captions-v42343.js',
 " window.addEventListener('pagehide',()=>{",
 " window.addEventListener('openiptv:ai-translate-settings-changed',()=>{if(translate.checked)void reconcile(true);});\n window.addEventListener('pagehide',()=>{");
swap('renderer/live-captions-v42343.js',
 "   const t=await api?.captionLanguageStatus?.(lang.value);",
 "   if(['hymt18','hymt7'].includes(window.AISettings?.getEngine?.())){message('Đã chọn Hy-MT2 · mở quản lý mô hình để kiểm tra/cài');return;}\n   const t=await api?.captionLanguageStatus?.(lang.value);");
// Model readiness tested through dedicated model controls, not the old Argos button.
swap('renderer/live-captions-v42343.js',
 "   const sample=await api.captionTestTranslation(target);",
 "   const engine=window.AISettings?.getEngine?.()||'auto';\n   const sample=api.aiTestTranslation?await api.aiTestTranslation(target,engine,window.AISettings?.getMode?.()||'balanced'):await api.captionTestTranslation(target);");

// IPC is only exposed through the allowlisted preload bridge; never permit
// the renderer to supply arbitrary paths or shell commands.
swap('src/main.cjs',
 "const {createLiveCaptionService}=require('./live-caption-service.cjs');",
 "const {createLiveCaptionService}=require('./live-caption-service.cjs');\nconst {createHyMTService}=require('./hymt-service.cjs');\nconst {createLocalModelStorage}=require('./local-ai-storage.cjs');\nlet localHyMT=null,localAIStorage=null;");
const init="  localModelInstaller=createAutoModelInstaller({dataDir:app.getPath('userData'),notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('tts:event',data);}});";
const inserted=[
 init,
 "  localHyMT=createHyMTService({dataDir:app.getPath('userData'),installer:localModelInstaller,notify:data=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('ai:event',data);}});",
 "  localAIStorage=createLocalModelStorage({dataDir:app.getPath('userData'),onBeforeDelete:async id=>{",
 "   if(localModelInstaller?.state('vi')?.installing)throw Error('Đang cài mô hình AI; không thể xóa lúc này');",
 "   if(['hymt18','hymt7'].includes(id)&&localHyMT?.state(id)?.installing)throw Error('Mô hình đang tải, không thể xóa');",
 "   try{await liveCaptionService?.stop();}catch{}",
 "   try{await localTTS?.stop();}catch{}",
 "   try{await localHyMT?.stop();}catch{}",
 "  }});"
].join('\n');
swap('src/main.cjs',init,inserted);
const anchor="  ipcMain.handle('caption:status',()=>liveCaptionService.status());";
const bindings=[
 "  const resolveAIEngine=(choice,mode)=>{",
 "   const engine=['auto','argos','hymt18','hymt7'].includes(choice)?choice:'auto';",
 "   const profile=['balanced','saver','quality'].includes(mode)?mode:'balanced';",
 "   if(engine!=='auto')return engine;",
 "   if(profile==='saver'||process.platform!=='darwin'||process.arch!=='arm64')return 'argos';",
 "   if(profile==='quality'&&localHyMT.state('hymt7').installed)return 'hymt7';",
 "   if(localHyMT.state('hymt18').installed)return 'hymt18';",
 "   return 'argos';",
 "  };",
 "  ipcMain.handle('ai:modelStatus',()=>({supported:process.platform==='darwin'&&process.arch==='arm64',",
 "   storage:localAIStorage.inspect(),hyMT:{hymt18:localHyMT.state('hymt18'),hymt7:localHyMT.state('hymt7')}}));",
 "  ipcMain.handle('ai:install',(_e,key)=>{if(!['hymt18','hymt7'].includes(key))throw Error('Invalid AI model');return localHyMT.install(key);});",
 "  ipcMain.handle('ai:delete',(_e,id)=>localAIStorage.remove(id));",
 "  ipcMain.handle('ai:testTranslation',async(_e,target,choice,mode)=>{",
 "   if(!isValidTarget(target))throw Error('Invalid translation target');",
 "   const engine=resolveAIEngine(choice,mode);",
 "   const source='en',text='Good morning, how are you today?';",
 "   return {target,engine,translatedText:target==='en'?text:",
 "     engine==='argos'?await captionTranslator.translateText(text,target,source):",
 "     await localHyMT.translate(text,target,source,engine)};",
 "  });",
 "  ipcMain.handle('caption:status',()=>liveCaptionService.status());"
].join('\n');
swap('src/main.cjs',anchor,bindings);
swap('src/main.cjs',
 "translateText:(text,target,source,options)=>captionTranslator.translateText(text,target,source,options)",
 "translateText:(text,target,source,options)=>{const engine=resolveAIEngine(options?.engine,options?.resourceMode);return engine==='argos'?captionTranslator.translateText(text,target,source,options):localHyMT.translate(text,target,source,engine);}");
swap('src/main.cjs',
 "app.on('before-quit',()=>{try{localTTS?.stop();}catch{}",
 "app.on('before-quit',()=>{try{localHyMT?.stop();}catch{}try{localTTS?.stop();}catch{}");
swap('src/preload.cjs',
 "  captionStatus:()=>ipcRenderer.invoke('caption:status'),",
 [
 "  aiModelStatus:()=>ipcRenderer.invoke('ai:modelStatus'),",
 "  aiInstallModel:key=>ipcRenderer.invoke('ai:install',key),",
 "  aiDeleteModel:id=>ipcRenderer.invoke('ai:delete',id),",
 "  aiTestTranslation:(target,engine,mode)=>ipcRenderer.invoke('ai:testTranslation',target,engine,mode),",
 "  aiOnEvent:cb=>{const f=(_e,data)=>cb(data);ipcRenderer.on('ai:event',f);return ()=>ipcRenderer.removeListener('ai:event',f);},",
 "  captionStatus:()=>ipcRenderer.invoke('caption:status'),"
 ].join('\n'));

// Versioned macOS release helper and historical regression synchronization.
const prev='CAP_NHAT_GITHUB_V4_23_53_MAC.command',nextHelper='CAP_NHAT_GITHUB_V4_23_54_MAC.command';
assert(fs.existsSync(full(prev)),'Missing prior immutable Git release helper');
write(nextHelper,read(prev).replaceAll(base,next).replaceAll('4_23_53','4_23_54'));
swap('tests/release_version_sync_v42332.test.cjs',prev,nextHelper);
for(const file of fs.readdirSync(full('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+file,t=read(p),updated=t.replaceAll(base,next);
 if(updated!==t)write(p,updated);
}
const oldRoutingTest='tests/v42350-direct-routing.test.cjs';
const oldRoutingAssertion=String.raw`assert.match(read('src/main.cjs'),/translateText:\(text,target,source,options\)=>captionTranslator.translateText/);`;
const newRoutingAssertion=String.raw`assert.match(read('src/main.cjs'),/resolveAIEngine/);
 assert.match(read('src/main.cjs'),/localHyMT\.translate/);`;
if(fs.existsSync(full(oldRoutingTest))){
 const body=read(oldRoutingTest);
 assert(body.includes(oldRoutingAssertion),'Missing v4.23.53 obsolete routing test marker');
 write(oldRoutingTest,body.replace(oldRoutingAssertion,newRoutingAssertion));
}
copy('v42354-ai-management.test.cjs','tests/v42354-ai-management.test.cjs');
write('RELEASE_NOTES_V4_23_54.md',[
 '# Open IPTV Pro v4.23.54 — Unified Local AI Preferences',
 '',
 '- One ⚙ panel now contains Whisper recognition, offline translation, TTS installation, model downloads, disk usage and deletion controls.',
 '- Translation providers: Auto, Argos (lightweight), Hy-MT2 1.8B 4-bit MLX, Hy-MT2 7B 4-bit MLX.',
 '- For Auto mode, users choose Balanced / Battery saver / Quality; select models intentionally, no surprise 4+ GB downloads.',
 '- Hy-MT2 is currently implemented only for Apple Silicon through local MLX; Windows/Intel retain Argos until GGUF support is validated.',
 '- Models are downloaded into isolated app-private directories and loaded in a persistent subprocess for live translation.',
 '- Remove individual app-owned Whisper/Argos/Piper/VieNeu/Hy-MT2 model folders or AI caches with two-click confirmation.',
 '- File deletion is confined to predefined userData folders, refusing symlinked target directories and active installation.',
 '- A clear load/heat/RAM/battery warning appears when concurrent on-device Caption+Translate+TTS or a large translation model is enabled.',
 '- The warning indicates possible system load, not a measurement of CPU/GPU temperature.',
 '- Keeps all IPTV playlists, favorites, EPG, settings, external custom Whisper models, existing TTS speed and source-volume controls.',
 '- Mac build remains DMG-only with a matching complete source ZIP.'
].join('\n')+'\n');
console.log('v4.23.54: unified AI settings, model management, Hy-MT2 and load warning integrated');
