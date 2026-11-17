'use strict';
/** v4.23.55 — UI-only layout and temporary orange AI warning.
 * Does not change working Whisper/Argos/Hy-MT2/TTS services or user models.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],previous='4.23.54',next='4.23.55';
assert(assets&&fs.existsSync(assets),'Missing v4.23.55 overlays');
const at=p=>path.join(root,p),read=p=>fs.readFileSync(at(p),'utf8'),write=(p,s)=>fs.writeFileSync(at(p),s);
const swap=(p,from,to)=>{
 const source=read(p);
 assert(source.includes(from),'v4.23.55 anchor missing: '+p+' → '+from.slice(0,90));
 write(p,source.replace(from,to));
};
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,previous,'Expected exact v4.23.54 Electron source');
assert.deepEqual(pkg.build?.mac?.target,['dmg'],'DMG-only profile is required');
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.55 — clean unified AI settings layout and auto-dismiss 10-second orange load warning';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(at('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===previous)lock.version=next;
 if(lock.packages?.['']?.version===previous)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const file of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(file);
 assert(s.includes(previous),'Missing prior build version in '+file);
 write(file,s.replaceAll(previous,next));
}
swap('renderer/index.html','<title>Open IPTV Pro '+previous+'</title>',
 '<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+previous+'</span>',
 '<span class="version">'+next+'</span>');
swap('renderer/index.html','unified-ai-settings-v42354.css','unified-ai-settings-v42355.css');
swap('renderer/index.html','unified-ai-settings-v42354.js','unified-ai-settings-v42355.js');
for(const [source,target] of [
 ['unified-ai-settings-v42355.js','renderer/unified-ai-settings-v42355.js'],
 ['unified-ai-settings-v42355.css','renderer/unified-ai-settings-v42355.css'],
 ['v42355-ai-layout.test.cjs','tests/v42355-ai-layout.test.cjs']
]){
 const origin=path.join(assets,source);
 assert(fs.existsSync(origin),'Missing overlay '+source);
 fs.copyFileSync(origin,at(target));
}
const prevHelper='CAP_NHAT_GITHUB_V4_23_54_MAC.command';
const nextHelper='CAP_NHAT_GITHUB_V4_23_55_MAC.command';
assert(fs.existsSync(at(prevHelper)),'Missing immutable v4.23.54 release helper');
write(nextHelper,read(prevHelper).replaceAll(previous,next).replaceAll('4_23_54','4_23_55'));
swap('tests/release_version_sync_v42332.test.cjs',prevHelper,nextHelper);
for(const file of fs.readdirSync(at('tests')).filter(name=>name.endsWith('.test.cjs'))){
 const p='tests/'+file,body=read(p),updated=body.replaceAll(previous,next);
 if(body!==updated)write(p,updated);
}
// Make earlier regression suite inspect the new active assets, not v4.23.54 legacy copies.
const earlier='tests/v42354-ai-management.test.cjs';
if(fs.existsSync(at(earlier))){
 let body=read(earlier);
 body=body.replaceAll('unified-ai-settings-v42354.js','unified-ai-settings-v42355.js');
 body=body.replaceAll('unified-ai-settings-v42354.css','unified-ai-settings-v42355.css');
 write(earlier,body);
}
const html=read('renderer/index.html'),ui=read('renderer/unified-ai-settings-v42355.js');
assert.equal((html.match(/unified-ai-settings-v42355\.js/g)||[]).length,1);
assert.equal((html.match(/unified-ai-settings-v42355\.css/g)||[]).length,1);
assert(!html.includes('unified-ai-settings-v42354.js'),'Old script must not run in parallel');
assert(ui.includes('buildLayout()')&&ui.includes('9750')&&ui.includes('250'),
 'Expected responsive layout and 10-second notice timer');
write('RELEASE_NOTES_V4_23_55.md',[
 '# Open IPTV Pro v4.23.55 — gọn lại bảng cài đặt AI',
 '',
 '- Organizes all AI settings into four clear visual groups: 01 Whisper recognition, 02 Live Translate, 03 TTS voices and 04 storage management.',
 '- Whisper buttons become one aligned, responsive horizontal control row; no more tall, centered button stack.',
 '- Translate and TTS appear side by side on wider screens and stack naturally at compact sizes.',
 '- Storage management is folded into a native, accessible disclosure; the current total remains visible.',
 '- Storage cleanup buttons, original model state, translation options and TTS controls retain their existing handlers.',
 '- Orange concurrent-AI heat/memory warning fades after approximately ten seconds and stays dismissed during periodic status refreshes.',
 '- Warning reappears only if the relevant combination of running AI workloads changes or is restarted.',
 '- A UI-only change: does not delete user data or modify AI inference models, live captioning or original IPTV video.',
 '- Mac build outputs only the DMG installer and full exact-version source ZIP.'
].join('\n')+'\n');
console.log('v4.23.55 AI settings layout and ~10 second auto-dismiss warning applied');
