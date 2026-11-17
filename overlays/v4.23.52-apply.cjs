'use strict';
// v4.23.52 — pitch-preserving TTS playback-rate selector.
// Starting point: exact v4.23.51 desktop source. Does not touch IPTV playback speed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],base='4.23.51',next='4.23.52';
assert(assets&&fs.statSync(assets).isDirectory(),'Missing v4.23.52 overlays');
const full=p=>path.join(root,p),read=p=>fs.readFileSync(full(p),'utf8'),write=(p,s)=>fs.writeFileSync(full(p),s);
function swap(p,a,b){const s=read(p);assert(s.includes(a),'Missing v4.23.52 source anchor '+p+': '+a.slice(0,90));write(p,s.replace(a,b));}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,base,'Expected v4.23.51 source');
assert.deepEqual(pkg.build?.mac?.target,['dmg'],'Mac distribution must remain DMG-only');
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.52 — adjustable pitch-preserving live TTS and voice-preview speed';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(full('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===base)lock.version=next;
 if(lock.packages?.['']?.version===base)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const name of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(name);assert(s.includes(base),'Missing old version in '+name);
 write(name,s.replaceAll(base,next));
}
swap('renderer/index.html','<title>Open IPTV Pro '+base+'</title>','<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+base+'</span>','<span class="version">'+next+'</span>');
const html=read('renderer/index.html');
const voice=html.match(/<select id="liveTtsVoice"[^>]*>[\s\S]*?<\/select>/);
assert(voice,'Missing TTS voice selector');
assert(!html.includes('id="liveTtsSpeed"'),'Speed selector already exists');
const opts=[
 ['0.60','0.6×'],['0.75','0.75×'],['0.85','0.85×'],
 ['1.00','1×'],['1.10','1.1×'],['1.25','1.25×'],
 ['1.50','1.5×'],['1.75','1.75×'],['2.00','2×']
];
const dropdown=[
 '<label class="tts-duck-label" for="liveTtsSpeed" title="Tốc độ đọc TTS, không thay đổi tốc độ kênh IPTV">Tốc độ</label>',
 '<select id="liveTtsSpeed" aria-label="Tốc độ đọc giọng dịch TTS" title="Áp dụng khi đọc phụ đề và nghe thử giọng">',
 ...opts.map(([value,label])=>' <option value="'+value+'"'+(value==='1.00'?' selected':'')+'>'+label+'</option>'),
 '</select>'
].join('\n');
write('renderer/index.html',html.replace(voice[0],voice[0]+'\n'+dropdown));
fs.appendFileSync(full('renderer/local-tts-row-v42344.css'),[
 '',
 '/* v4.23.52: pitch-preserving TTS speed picker in the existing wrapped third row */',
 '#page-tv .player-control-card #liveTtsSpeed {',
 ' flex:0 0 82px!important; width:82px!important; min-width:76px!important;max-width:90px!important;',
 ' min-height:29px!important;height:29px!important;padding:3px 19px 3px 7px!important;',
 ' border-radius:8px!important;font-size:11px!important;',
 '}',
 '#page-tv .player-control-card .caption-third-controls{flex-wrap:wrap!important;}',
 '@container (max-width:750px){',
 ' #page-tv .player-control-card #liveTtsSpeed{flex:0 0 76px!important;width:76px!important;}',
 '}',
 ''
].join('\n'));
const from=path.join(assets,'local-tts-ui-v42352.js');
assert(fs.existsSync(from),'Missing v4.23.52 TTS UI patch');
fs.copyFileSync(from,full('renderer/local-tts-v42344.js'));
const oldHelper='CAP_NHAT_GITHUB_V4_23_51_MAC.command';
const newHelper='CAP_NHAT_GITHUB_V4_23_52_MAC.command';
assert(fs.existsSync(full(oldHelper)),'Missing prior release helper');
write(newHelper,read(oldHelper).replaceAll(base,next).replaceAll('4_23_51','4_23_52'));
swap('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
for(const name of fs.readdirSync(full('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+name,s=read(p),changed=s.replaceAll(base,next);
 if(s!==changed)write(p,changed);
}
const testOverlay=path.join(assets,'v42352-tts-speed.test.cjs');
assert(fs.existsSync(testOverlay),'Missing TTS speed regression test');
fs.copyFileSync(testOverlay,full('tests/v42352-tts-speed.test.cjs'));
const final=read('renderer/index.html');
assert.equal((final.match(/id="liveTtsSpeed"/g)||[]).length,1,'Duplicate speed input');
assert(final.indexOf('liveTtsVoice')<final.indexOf('liveTtsSpeed')&&final.indexOf('liveTtsSpeed')<final.indexOf('liveTtsDuck'));
write('RELEASE_NOTES_V4_23_52.md',[
 '# Open IPTV Pro v4.23.52 — TTS playback speed',
 '',
 '- Adds a speed selector on the existing TTS controls row with 0.6–2× playback speed and 1× default.',
 '- Applies equally to Piper and VieNeu synthesized WAV audio and voice previews.',
 '- Keeps pitch preservation while varying audio playback rate (when supported by Chromium).',
 '- Changing speed while a line is speaking updates the ongoing audio immediately.',
 '- The chosen speed persists locally across app restarts, independent of chosen language and voice.',
 '- No modification to IPTV video playback speed, Live Caption, Live Translate, volume ducking or original audio.',
 '- macOS output remains DMG-only plus exact-version source ZIP; no app ZIP or blockmap.'
].join('\n')+'\n');
console.log('v4.23.52: TTS reading speed selector, saved preference and live playback-rate control integrated');
