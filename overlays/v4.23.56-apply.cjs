'use strict';
/** Open IPTV Pro v4.23.56 — eight actual selectable offline MLX engines */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],previous='4.23.55',next='4.23.56';
assert(assets&&fs.existsSync(assets),'Missing v4.23.56 overlays');
const at=p=>path.join(root,p),read=p=>fs.readFileSync(at(p),'utf8'),write=(p,s)=>fs.writeFileSync(at(p),s);
const patch=(file,a,b)=>{
 const old=read(file);
 assert(old.includes(a),'Missing v4.23.56 source anchor '+file+': '+a.slice(0,105));
 write(file,old.replace(a,b));
};
const copy=(source,target)=>{
 const item=path.join(assets,source);assert(fs.existsSync(item),'Missing overlay '+source);
 fs.copyFileSync(item,at(target));
};
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,previous,'Expected v4.23.55 Electron source');
assert.deepEqual(pkg.build.mac.target,['dmg'],'Mac build must remain DMG-only');
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.56 — eight offline MLX translation models (Hy-MT2/Qwen3), managed downloads';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(at('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===previous)lock.version=next;
 if(lock.packages?.['']?.version===previous)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const f of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const old=read(f);assert(old.includes(previous),'Missing version in '+f);
 write(f,old.replaceAll(previous,next));
}
patch('renderer/index.html','<title>Open IPTV Pro '+previous+'</title>','<title>Open IPTV Pro '+next+'</title>');
patch('renderer/index.html','<span class="version">'+previous+'</span>','<span class="version">'+next+'</span>');
patch('renderer/index.html','unified-ai-settings-v42355.js','unified-ai-settings-v42356.js');
patch('renderer/index.html','unified-ai-settings-v42355.css','unified-ai-settings-v42356.css');
const htmlFile='renderer/index.html';
const hymtOld='<option value="hymt7">Hy-MT2 7B · chất lượng cao (Mac Apple Silicon)</option>';
const modelOptions=[
 '<option value="hymt18q8">Hy-MT2 1.8B · 8-bit (~1.9 GB)</option>',
 '<option value="hymt7q8">Hy-MT2 7B · 8-bit (~8 GB, cần RAM lớn)</option>',
 '<option value="qwen06">Qwen3 0.6B · siêu nhẹ (~350 MB)</option>',
 '<option value="qwen17">Qwen3 1.7B · cân bằng (~1 GB)</option>',
 '<option value="qwen4">Qwen3 4B · đa năng (~2.3 GB)</option>',
 '<option value="qwen8">Qwen3 8B · nâng cao (~4.6 GB, cần RAM lớn)</option>'
].join('\n');
patch(htmlFile,hymtOld,hymtOld+'\n'+modelOptions);
patch(htmlFile,'Hy-MT2 tự tải khi bấm “Tải mô hình”. Không tự động tải vài GB khi mở ứng dụng;',
 'Mô hình Hy-MT2 và Qwen3 tải riêng khi bấm “Tải mô hình”, không tự tải vài GB khi mở ứng dụng;');
for(const [source,target] of [
 ['mlx-bridge-v42356.py','src/hymt-bridge.py'],
 ['mlx-service-v42356.cjs','src/hymt-service.cjs'],
 ['local-ai-storage-v42356.cjs','src/local-ai-storage.cjs'],
 ['unified-ai-settings-v42356.js','renderer/unified-ai-settings-v42356.js'],
 ['unified-ai-settings-v42356.css','renderer/unified-ai-settings-v42356.css']
])copy(source,target);

// Preserve IPC authorization and route all names through the service allowlist.
patch('src/main.cjs',
 "const engine=['auto','argos','hymt18','hymt7'].includes(choice)?choice:'auto';",
 "const engine=choice==='auto'||choice==='argos'||Object.hasOwn(localHyMT.MODELS,choice)?choice:'auto';");
patch('src/main.cjs',
 "if(profile==='quality'&&localHyMT.state('hymt7').installed)return 'hymt7';",
 "if(profile==='quality')for(const key of ['hymt7q8','hymt7','qwen8','qwen4','hymt18q8'])if(localHyMT.state(key).installed)return key;");
patch('src/main.cjs',
 "if(localHyMT.state('hymt18').installed)return 'hymt18';",
 "for(const key of ['hymt18','hymt18q8','qwen17','qwen06','qwen4'])if(localHyMT.state(key).installed)return key;");
patch('src/main.cjs',
 "storage:localAIStorage.inspect(),hyMT:{hymt18:localHyMT.state('hymt18'),hymt7:localHyMT.state('hymt7')}}",
 "storage:localAIStorage.inspect(),models:Object.fromEntries(Object.keys(localHyMT.MODELS).map(k=>[k,localHyMT.state(k)])),hyMT:{hymt18:localHyMT.state('hymt18'),hymt7:localHyMT.state('hymt7')}}");
patch('src/main.cjs',
 "if(!['hymt18','hymt7'].includes(key))throw Error('Invalid AI model');",
 "if(!Object.hasOwn(localHyMT.MODELS,key))throw Error('Invalid AI model');");
patch('src/main.cjs',
 "if(['hymt18','hymt7'].includes(id)&&localHyMT?.state(id)?.installing)",
 "if(Object.hasOwn(localHyMT.MODELS,id)&&localHyMT?.state(id)?.installing)");
patch('renderer/live-captions-v42343.js',
 "if(['hymt18','hymt7'].includes(window.AISettings?.getEngine?.())){message('Đã chọn Hy-MT2 · mở quản lý mô hình để kiểm tra/cài');return;}",
 "if(!['auto','argos'].includes(window.AISettings?.getEngine?.()||'auto')){message('Đã chọn mô hình MLX · mở quản lý mô hình để kiểm tra/cài');return;}");

const oldHelper='CAP_NHAT_GITHUB_V4_23_55_MAC.command';
const newHelper='CAP_NHAT_GITHUB_V4_23_56_MAC.command';
assert(fs.existsSync(at(oldHelper)),'Missing previous release helper');
write(newHelper,read(oldHelper).replaceAll(previous,next).replaceAll('4_23_55','4_23_56'));
patch('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
// Legacy tests were written for the previous active v4.23.55 UI filenames.
for(const filename of fs.readdirSync(at('tests')).filter(name=>name.endsWith('.test.cjs'))){
 const f='tests/'+filename;
 const old=read(f);
 const updated=old.replaceAll(previous,next)
  .replaceAll('unified-ai-settings-v42355.js','unified-ai-settings-v42356.js')
  .replaceAll('unified-ai-settings-v42355.css','unified-ai-settings-v42356.css');
 if(updated!==old)write(f,updated);
}
for(const [src,target] of [
 ['v42356-mlx-model-catalog.test.cjs','tests/v42356-mlx-model-catalog.test.cjs'],
 ['v42356-mlx-model-catalog.test.py','tests/v42356-mlx-model-catalog.test.py']
])copy(src,target);
const html=read(htmlFile);
for(const key of ['hymt18','hymt7','hymt18q8','hymt7q8','qwen06','qwen17','qwen4','qwen8']){
 assert.equal((html.match(new RegExp('value="'+key+'"','g'))||[]).length,1,'Missing/duplicate model '+key);
}
write('RELEASE_NOTES_V4_23_56.md',[
 '# Open IPTV Pro v4.23.56 — More local AI translation engines',
 '',
 '- Adds Hy-MT2 1.8B 8-bit (~1.9GB) and Hy-MT2 7B 8-bit (~8GB) to the two previous 4-bit variants.',
 '- Adds Qwen3 0.6B, 1.7B, 4B and 8B 4-bit, all as individually installable local MLX options on Mac Apple Silicon.',
 '- Family labels distinguish specialized translation models from general language models prompted for translation.',
 '- All eight models have exact Hugging Face repository allowlists and private model directories; no unrequested automatic download.',
 '- Supports single or sharded safetensors and guards against incomplete model installs.',
 '- Updated automatic engine selection: saver chooses Argos; balanced prefers installed small models; quality prefers installed high-quality models.',
 '- Every model supports independent status, storage usage, resume download, runtime recovery and two-click deletion.',
 '- Preserves unified Caption/Translate/TTS gear and 10-second orange heat warning.',
 '- NLLB-200 research checkpoints are not shipped as production installers due to CC-BY-NC and usage restrictions.',
 '- Windows and Intel Mac retain Argos; MLX features require Apple Silicon.',
 '- Mac build outputs only native DMG and matching full source ZIP.'
].join('\n')+'\n');
console.log('Applied Open IPTV Pro v4.23.56 with 8 selectable MLX models + Argos and Auto');
