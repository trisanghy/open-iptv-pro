'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],base='4.23.50',next='4.23.51';
assert(assets&&fs.existsSync(assets),'Missing v4.23.51 hotfix overlay directory');
const name=p=>path.join(root,p),read=p=>fs.readFileSync(name(p),'utf8'),write=(p,s)=>fs.writeFileSync(name(p),s);
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,base,'Expected exact v4.23.50 Electron source');
assert.deepEqual(pkg.build?.mac?.target,['dmg'],'Expected DMG-only configuration from v4.23.50');
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.51 — fix Argos 1.11.0 MINISBD translation init, local Vietnamese TTS status';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(name('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===base)lock.version=next;
 if(lock.packages?.['']?.version===base)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(p);assert(s.includes(base),'Version anchor missing in '+p);
 write(p,s.replaceAll(base,next));
}
for(const [oldValue,newValue] of [
 ['<title>Open IPTV Pro '+base+'</title>','<title>Open IPTV Pro '+next+'</title>'],
 ['<span class="version">'+base+'</span>','<span class="version">'+next+'</span>']
]){
 const source=read('renderer/index.html');
 assert(source.includes(oldValue),'Renderer version anchor missing '+oldValue);
 write('renderer/index.html',source.replace(oldValue,newValue));
}
for(const [src,dest] of [
 ['argos-bridge-v42351.py','src/argos-bridge.py'],
 ['local-ai-autoinstall-v42351.cjs','src/local-ai-autoinstall.cjs'],
 ['caption-translator-v42351.cjs','src/caption-translator.cjs'],
 ['local-tts-service-v42351.cjs','src/local-tts-service.cjs'],
 ['v42351-minisbd-tts.test.cjs','tests/v42351-minisbd-tts.test.cjs']
]){
 const original=path.join(assets,src);
 assert(fs.existsSync(original),'Missing overlay: '+src);
 fs.copyFileSync(original,name(dest));
}
const helper='CAP_NHAT_GITHUB_V4_23_50_MAC.command';
const revised='CAP_NHAT_GITHUB_V4_23_51_MAC.command';
assert(fs.existsSync(name(helper)),'Missing prior version helper');
write(revised,read(helper).replaceAll(base,next).replaceAll('4_23_50','4_23_51'));
const testName='tests/release_version_sync_v42332.test.cjs';
assert(read(testName).includes(helper),'Missing version test helper anchor');
write(testName,read(testName).replaceAll(helper,revised));
for(const filename of fs.readdirSync(name('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+filename;
 const old=read(p),updated=old.replaceAll('4.23.50','4.23.51');
 if(updated!==old)write(p,updated);
}
for(const file of ['src/local-ai-autoinstall.cjs','src/caption-translator.cjs','src/local-tts-service.cjs']){
 const source=read(file);
 assert(source.includes("ARGOS_CHUNK_TYPE:'MINISBD'"),'Unsafe Argos mode '+file);
 assert(source.includes("ARGOS_MODEL_PROVIDER:'OPENNMT'"),'Unsafe provider '+file);
 assert(!source.includes("ARGOS_CHUNK_TYPE:'NONE'"),'Unsupported NONE in '+file);
}
write('RELEASE_NOTES_V4_23_51.md',[
 '# Open IPTV Pro v4.23.51 — MINISBD translation runtime fix',
 '',
 '- Root cause: Argos Translate 1.11.0 PackageTranslation raises NotImplementedError for ARGOS_CHUNK_TYPE=NONE.',
 '- Forces ARGOS_CHUNK_TYPE=MINISBD in model installer, transcript translator, TTS subprocess and the Python bridge.',
 '- Keeps local-only ARGOS_MODEL_PROVIDER=OPENNMT and ARGOS_DEVICE_TYPE=cpu.',
 '- No change to working Whisper Live Caption capture, direct translation routing or available Piper/VieNeu voices.',
 '- Makes AI setup progress human-readable instead of displaying Python -u command and internal file paths.',
 '- DMG-only Mac installer and matching exact-version source ZIP are preserved.'
].join('\n')+'\n');
console.log('v4.23.51: fixed Argos MINISBD and cleaned VieNeu setup status');
