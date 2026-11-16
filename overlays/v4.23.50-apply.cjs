'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2];
if(!assets||!fs.existsSync(assets))throw Error('Missing v4.23.50 hotfix overlays');
const at=p=>path.join(root,p),read=p=>fs.readFileSync(at(p),'utf8'),write=(p,s)=>fs.writeFileSync(at(p),s);
const sourcePkg=JSON.parse(read('package.json'));
assert.equal(sourcePkg.version,'4.23.49','Apply v4.23.50 only to exact v4.23.49 source');
const p=sourcePkg;p.version='4.23.50';
p.description='Open IPTV Pro v4.23.50 — recover Live Translate without interrupting Live Caption (DMG-only build)';
write('package.json',JSON.stringify(p,null,2)+'\n');
if(fs.existsSync(at('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version==='4.23.49')lock.version='4.23.50';
 if(lock.packages?.['']?.version==='4.23.49')lock.packages[''].version='4.23.50';
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const file of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 if(fs.existsSync(at(file)))write(file,read(file).replaceAll('4.23.49','4.23.50'));
}
for(const [oldName,newName] of [
 ['<title>Open IPTV Pro 4.23.49</title>','<title>Open IPTV Pro 4.23.50</title>'],
 ['<span class="version">4.23.49</span>','<span class="version">4.23.50</span>']
]){
 const original=read('renderer/index.html');
 assert(original.includes(oldName),'Missing version anchor '+oldName);
 write('renderer/index.html',original.replace(oldName,newName));
}
for(const [name,target] of [
 ['argos-bridge-v42350-fix.py','src/argos-bridge.py'],
 ['caption-translator-v42350-repair.cjs','src/caption-translator.cjs'],
 ['local-ai-autoinstall-v42350-repair.cjs','src/local-ai-autoinstall.cjs'],
 ['argos-runtime-v42350.test.py','tests/argos-runtime-v42350.test.py'],
 ['live-translate-v42350.test.cjs','tests/live-translate-v42350.test.cjs']
]){
 const source=path.join(assets,name);
 assert(fs.existsSync(source),'Required overlay missing: '+name);
 fs.copyFileSync(source,at(target));
}
require(path.join(assets,'live-translate-recovery-v42350.cjs'));
for(const name of fs.readdirSync(at('tests')).filter(f=>f.endsWith('.test.cjs'))){
 const full='tests/'+name,original=read(full),updated=original.replaceAll('4.23.49','4.23.50');
 if(original!==updated)write(full,updated);
}
write('RELEASE_NOTES_V4_23_50.md',[
 '# Open IPTV Pro v4.23.50 — Live Translate recovery',
 '',
 '- Fixed stale Argos success indicators by testing real translation and repairing corrupt models.',
 '- Added one retry and a 60-second failure backoff to avoid repeated broken downloads.',
 '- Native-language Live Caption remains visible and continuous even when a translation fails.',
 '- Recognizes Whisper language names (English/Vietnamese/Chinese/etc.), as well as ISO codes.',
 '- Keeps same-language bypass and direct source-to-target translation (English is a last resort).',
 '- Continues to suppress repeated TTS utterances and keeps original audio reduced while TTS is enabled.',
 '- macOS build profile exports only a DMG installer and the corresponding source ZIP.'
].join('\n')+'\n');
console.log('v4.23.50 Live Translate recovery integrated into Electron source');
