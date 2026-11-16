'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],before='4.23.47',after='4.23.48';
assert(assets&&fs.existsSync(assets),'Missing release overlays');
const f=p=>path.join(root,p),read=p=>fs.readFileSync(f(p),'utf8'),write=(p,s)=>fs.writeFileSync(f(p),s);
function swap(p,needle,replacement){
 const source=read(p);assert(source.includes(needle),'Missing anchor in '+p+': '+needle.slice(0,120));
 write(p,source.replace(needle,replacement));
}
function copy(asset,dest){
 const source=path.join(assets,asset);assert(fs.existsSync(source),'Missing asset: '+asset);
 fs.copyFileSync(source,f(dest));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,before,'Source must be exact v4.23.47');
pkg.version=after;
pkg.description='Open IPTV Pro v4.23.48 — reliable offline Argos translation, real model check and selectable Piper TTS voices';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(p);assert(s.includes(before),'Missing version in '+p);
 write(p,s.replaceAll(before,after));
}
if(fs.existsSync(f('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===before)lock.version=after;
 if(lock.packages&&lock.packages['']?.version===before)lock.packages[''].version=after;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
swap('renderer/index.html','<title>Open IPTV Pro '+before+'</title>','<title>Open IPTV Pro '+after+'</title>');
swap('renderer/index.html','<span class="version">'+before+'</span>','<span class="version">'+after+'</span>');
for(const [a,b] of [
 ['argos-bridge-v42348.py','src/argos-bridge.py'],
 ['local-ai-autoinstall-v42348.cjs','src/local-ai-autoinstall.cjs'],
 ['caption-translator-v42348.cjs','src/caption-translator.cjs'],
 ['local-tts-service-v42348.cjs','src/local-tts-service.cjs'],
 ['local-tts-ui-v42348.js','renderer/local-tts-v42344.js']
])copy(a,b);
let html=read('renderer/index.html');
assert(!html.includes('id="liveTtsVoice"'),'Voice selector already present');
const menu=html.match(/<select id="liveTtsLanguage"[^>]*>[\s\S]*?<\/select>/);
assert(menu,'TTS language selector changed');
html=html.replace(menu[0],menu[0]+
 '\n<label class="tts-duck-label" for="liveTtsVoice">Giọng đọc</label>'+
 '\n<select id="liveTtsVoice" aria-label="Chọn giọng đọc Piper theo ngôn ngữ"></select>');
assert.equal((html.match(/id="liveTtsVoice"/g)||[]).length,1);
write('renderer/index.html',html);
fs.appendFileSync(f('renderer/local-tts-row-v42344.css'),[
 '',
 '/* v4.23.48 additional TTS voice picker */',
 '#page-tv .player-control-card #liveTtsVoice {',
 ' flex:0 1 180px!important;min-width:132px!important;max-width:200px!important;',
 ' height:29px!important;min-height:29px!important;padding:3px 21px 3px 7px!important;',
 ' font-size:11px!important;border-radius:8px!important;',
 '}',
 '@media (max-width:850px){',
 ' #page-tv .player-control-card #liveTtsVoice{flex:1 1 150px!important;max-width:100%!important;}',
 '}',''
].join('\n'));
swap('src/main.cjs',
 "ipcMain.handle('tts:status',(_e,lang)=>({...localTTS.availability(lang),install:localModelInstaller.state(lang)}));",
 "ipcMain.handle('tts:status',(_e,lang,voice)=>({...localTTS.availability(lang,voice),install:localModelInstaller.state(lang,voice)}));");
swap('src/main.cjs',
 "ipcMain.handle('tts:install',(_e,lang)=>localModelInstaller.install(lang));",
 "ipcMain.handle('tts:install',(_e,lang,voice)=>localModelInstaller.install(lang,voice));");
swap('src/preload.cjs',
 "ttsStatus:lang=>ipcRenderer.invoke('tts:status',lang),",
 "ttsStatus:(lang,voice)=>ipcRenderer.invoke('tts:status',lang,voice),");
swap('src/preload.cjs',
 "ttsInstall:lang=>ipcRenderer.invoke('tts:install',lang),",
 "ttsInstall:(lang,voice)=>ipcRenderer.invoke('tts:install',lang,voice),");
const oldHelper='CAP_NHAT_GITHUB_V4_23_47_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_48_MAC.command';
if(fs.existsSync(f(oldHelper)))write(newHelper,read(oldHelper).replaceAll(before,after).replaceAll('4_23_47','4_23_48'));
for(const p of fs.readdirSync(f('tests')).filter(n=>n.endsWith('.test.cjs'))){
 const full='tests/'+p,raw=read(full),modified=raw.replaceAll(before,after).replaceAll(oldHelper,newHelper);
 if(modified!==raw)write(full,modified);
}
// Prior test expected the old argospm CLI command; v4.23.48 deliberately uses Python model APIs.
const legacyTest='tests/multilingual-captions-v42346.test.cjs';
if(fs.existsSync(f(legacyTest))){
 const original=read(legacyTest);
 assert(original.includes('assert.match(c,/translate-en_/)'),'Expected old Argos CLI regression assertion');
 write(legacyTest,original.replace('assert.match(c,/translate-en_/)','assert.match(c,/argos-bridge\\.py/)'));
}
copy('argos-tts-voice-v42348.test.cjs','tests/argos-tts-voice-v42348.test.cjs');
write('RELEASE_NOTES_V4_23_48.md',[
 '# Open IPTV Pro v4.23.48 — Argos translation fix and Piper voice selection',
 '',
 '- Uses Argos Translate Python model API instead of CLI, verifies actual installed English-to-target packages.',
 '- Ignores stale installed-pairs.json success flags. Missing models can be installed again.',
 '- Adds a third-row voice dropdown, separate from language and original audio volume.',
 '- Vietnamese: 25Hours low, VAIS1000 medium, VIVOS x-low; English: Lessac low, Amy medium.',
 '- Only authorized Piper voice IDs may be downloaded. Voice selection persists per language.',
 '- Whisper, Live Translate, local TTS, IPTV playback, and other features retained.',
 '- First-time model download requires internet. On-device streaming testing still required.'
].join('\n')+'\n');
console.log('Applied Open IPTV Pro v4.23.48 offline Argos + TTS voice selector');
