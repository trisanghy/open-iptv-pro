'use strict';
/** v4.23.59 — finish audible sentences; replace only waiting TTS captions. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],before='4.23.58',after='4.23.59';
assert(assets&&fs.existsSync(assets),'Missing v4.23.59 overlay directory');
const file=p=>path.join(root,p),read=p=>fs.readFileSync(file(p),'utf8'),write=(p,s)=>fs.writeFileSync(file(p),s);
function swap(p,needle,replacement){
 const s=read(p);assert(s.includes(needle),'v4.23.59 anchor missing '+p+': '+needle.slice(0,100));
 write(p,s.replace(needle,replacement));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,before,'Expected exact v4.23.58 source');
assert.deepEqual(pkg.build.mac.target,['dmg']);
pkg.version=after;
pkg.description='Open IPTV Pro v4.23.59 — full-sentence TTS, never cut live speech for incoming subtitles';
if(Array.isArray(pkg.build.files)&&!pkg.build.files.includes('renderer/tts-utterance-queue-v42359.js'))
 pkg.build.files.push('renderer/tts-utterance-queue-v42359.js');
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(file('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===before)lock.version=after;
 if(lock.packages?.['']?.version===before)lock.packages[''].version=after;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(p);assert(s.includes(before),'Wrong build version in '+p);
 write(p,s.replaceAll(before,after));
}
swap('renderer/index.html','<title>Open IPTV Pro '+before+'</title>',
 '<title>Open IPTV Pro '+after+'</title>');
swap('renderer/index.html','<span class="version">'+before+'</span>',
 '<span class="version">'+after+'</span>');
const copies=[
 ['local-tts-ui-v42359.js','renderer/local-tts-v42344.js'],
 ['tts-utterance-queue-v42359.js','renderer/tts-utterance-queue-v42359.js'],
 ['v42359-tts-complete-utterance.test.cjs','tests/v42359-tts-complete-utterance.test.cjs']
];
for(const [source,target] of copies){
 const from=path.join(assets,source);assert(fs.existsSync(from),'Missing '+source);
 fs.copyFileSync(from,file(target));
}
swap('renderer/index.html','<script src="local-tts-v42344.js"></script>',
 '<script src="tts-utterance-queue-v42359.js"></script><script src="local-tts-v42344.js"></script>');
const helperOld='CAP_NHAT_GITHUB_V4_23_58_MAC.command';
const helperNew='CAP_NHAT_GITHUB_V4_23_59_MAC.command';
assert(fs.existsSync(file(helperOld)),'Missing previous release helper');
write(helperNew,read(helperOld).replaceAll(before,after).replaceAll('4_23_58','4_23_59'));
swap('tests/release_version_sync_v42332.test.cjs',helperOld,helperNew);
for(const name of fs.readdirSync(file('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+name,body=read(p),updated=body.replaceAll(before,after);
 if(updated!==body)write(p,updated);
}
const legacy='tests/v42357-lowlatency.test.cjs';
let text=read(legacy);
const legacyStart=text.indexOf("test('v4.23.59: latest subtitle always wins;");
const legacyEnd=text.indexOf("test('v4.23.59: stop can cancel",legacyStart);
assert(legacyStart>0&&legacyEnd>legacyStart,'Expected legacy interrupting-TTS test');
text=text.slice(0,legacyStart)+[
 "test('v4.23.57: latest pending subtitle wins without interrupting audible speech',()=>{",
 " const ui=read('renderer/local-tts-v42344.js');",
 " assert.match(ui,/lastCaptionSeq=0/);",
 " assert.match(ui,/number&&number<lastCaptionSeq/);",
 " assert.match(ui,/speechQueue\\.enqueue\\(payload\\)/);",
 " assert.match(ui,/window\\.OpenIPTVSpeechQueue\\.createSpeechQueue/);",
 " assert.match(ui,/if\\(!e\\.translated\\)return/);",
 " assert.doesNotMatch(ui,/resetPlayback\\(false\\)/);",
 " assert.doesNotMatch(ui,/void speak\\(payload\\)/);",
 " assert.match(ui,/audio\\.addEventListener\\('ended'/);",
 " const service=read('src/local-tts-service.cjs');",
 " assert.match(service,/getPremiumSession\\(\\)\\.synthesize/);",
 " assert.match(service,/function shutdown\\(\\)/);",
 " assert.match(service,/return Object\\.freeze\\(\\{availability,configure,synthesize,stop,shutdown\\}\\)/);",
 "});",
 ""
].join('\n')+text.slice(legacyEnd);
write(legacy,text);
const speedTest='tests/v42352-tts-speed.test.cjs';
let speedCode=read(speedTest);
const startup=" vm.runInNewContext(read('renderer/local-tts-v42344.js'),context);";
assert(speedCode.includes(startup),'Expected v4.23.52 UI VM harness');
speedCode=speedCode.replace(startup,
 " context.window.OpenIPTVSpeechQueue=require('../renderer/tts-utterance-queue-v42359.js');\n"+startup);
write(speedTest,speedCode);
const duckTest='tests/v42350-direct-routing.test.cjs';
let duckCode=read(duckTest);
const duckOld=String.raw`assert.match(ui,/if\(!enabled\)\{resetPlayback\(\);restore\(\)/);`;
assert(duckCode.includes(duckOld),'Missing older TTS-off cleanup assertion');
duckCode=duckCode.replace(duckOld,
 String.raw`assert.match(ui,/speechQueue\.setEnabled\(enabled\)/);
 assert.match(ui,/if\(!enabled\)\{restore\(\)/);`);
write(duckTest,duckCode);
const voiceTest='tests/argos-tts-voice-v42348.test.cjs';
if(fs.existsSync(file(voiceTest))){
 const existing=read(voiceTest);
 if(existing.includes("assert.match(ui,/voice:voice\\.value/);"))
  write(voiceTest,existing.replace("assert.match(ui,/voice:voice\\.value/);",
   "assert.match(ui,/voice:payload\\.voiceId/);"));
}
const html=read('renderer/index.html');
assert(html.indexOf('tts-utterance-queue-v42359.js')>=0);
assert(html.indexOf('tts-utterance-queue-v42359.js')<html.indexOf('local-tts-v42344.js'));
assert(!read('renderer/local-tts-v42344.js').includes('resetPlayback(false)'));
assert(!read('renderer/local-tts-v42344.js').includes('output.hidden=false'));
write('RELEASE_NOTES_V4_23_59.md',[
 '# Open IPTV Pro v4.23.59 — read complete translated subtitles',
 '',
 '- Fixes VieNeu and Piper TTS stopping halfway through a spoken sentence every time a new recognition/translation event arrives.',
 '- Once a speech WAV begins playing, it runs to its natural ended event. A new subtitle never calls pause/reset on the playing sentence.',
 '- Keep only the newest WAITING translated subtitle, so the voice does not fall behind by reading an obsolete backlog.',
 '- If synthesis is still processing and a newer translation arrives, skip playing the outdated result and synthesize the newest instead.',
 '- Drop waiting lines older than 18 seconds or synthesized lines older than 25 seconds rather than playing very late audio.',
 '- Stream switching, turning TTS off, changing the voice/language or explicitly selecting voice preview still stops speech immediately.',
 '- Existing 1.1x/1.5x playback speed, persistent local VieNeu session, continuous Whisper audio capture and original sound ducking are retained.',
 '- TTS no longer forcibly reopens the removed bottom-row transcript, preserving target-only captions on VIDEO from v4.23.58.',
 '- Mac outputs DMG + matching source ZIP only; does not alter main or Rust/Tauri.'
].join('\n')+'\n');
console.log('Applied v4.23.59 full-utterance TTS queue and regression checks');
