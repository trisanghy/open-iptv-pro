'use strict';
/** v4.23.60 — 8-second Whisper windows instead of 4 seconds, longer translation context. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],prev='4.23.59',next='4.23.60';
assert(assets&&fs.existsSync(assets),'Missing v4.23.60 overlays');
const file=p=>path.join(root,p),read=p=>fs.readFileSync(file(p),'utf8'),write=(p,s)=>fs.writeFileSync(file(p),s);
function swap(p,from,to){
 const s=read(p);assert(s.includes(from),'v4.23.60 source anchor missing in '+p+': '+from.slice(0,110));
 write(p,s.replace(from,to));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,prev,'Expected exact v4.23.59 source');
assert.deepEqual(pkg.build.mac.target,['dmg']);
pkg.version=next;
pkg.description='Open IPTV Pro v4.23.60 — continuous eight-second Whisper captions for complete phrase context';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(file('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===prev)lock.version=next;
 if(lock.packages?.['']?.version===prev)lock.packages[''].version=next;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(p);assert(s.includes(prev),'Old version missing from '+p);
 write(p,s.replaceAll(prev,next));
}
swap('renderer/index.html','<title>Open IPTV Pro '+prev+'</title>',
 '<title>Open IPTV Pro '+next+'</title>');
swap('renderer/index.html','<span class="version">'+prev+'</span>',
 '<span class="version">'+next+'</span>');
const captureSource=path.join(assets,'continuous-capture-v42360.cjs');
const newTest=path.join(assets,'v42360-eight-second-captions.test.cjs');
assert(fs.existsSync(captureSource)&&fs.existsSync(newTest),'Missing 8s capture or test overlay');
fs.copyFileSync(captureSource,file('src/continuous-capture.cjs'));
fs.copyFileSync(newTest,file('tests/v42360-eight-second-captions.test.cjs'));
swap('src/live-caption-service.cjs','ffmpeg:ff,url:s.url,dir:temp,spawnProc,chunkSeconds:4',
 'ffmpeg:ff,url:s.url,dir:temp,spawnProc,chunkSeconds:8');
swap('src/live-caption-service.cjs','Thu âm liên tục · nhận diện mỗi khoảng 4 giây',
 'Thu âm liên tục · nhận diện mỗi khoảng 8 giây');
// The Whisper -t 4 flag controls CPU threads, NOT segment duration: leave it alone.
assert(read('src/live-caption-service.cjs').includes("'-t','4'"),'Do not alter Whisper worker thread count');
const priorTest='tests/v42357-lowlatency.test.cjs';
swap(priorTest,"assert.equal(ffmpegArgs[ffmpegArgs.indexOf('-segment_time')+1],'4');",
 "assert.equal(ffmpegArgs[ffmpegArgs.indexOf('-segment_time')+1],'8');");
swap(priorTest,"['seg_000000.wav,0,4','seg_000001.wav,4,8','seg_000002.wav,8,12']",
 "['seg_000000.wav,0,8','seg_000001.wav,8,16','seg_000002.wav,16,24']");
const previousHelper='CAP_NHAT_GITHUB_V4_23_59_MAC.command';
const newHelper='CAP_NHAT_GITHUB_V4_23_60_MAC.command';
assert(fs.existsSync(file(previousHelper)),'Missing previous Mac Git helper');
write(newHelper,read(previousHelper).replaceAll(prev,next).replaceAll('4_23_59','4_23_60'));
swap('tests/release_version_sync_v42332.test.cjs',previousHelper,newHelper);
for(const name of fs.readdirSync(file('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+name,old=read(p),changed=old.replaceAll(prev,next);
 if(changed!==old)write(p,changed);
}
write('RELEASE_NOTES_V4_23_60.md',[
 '# Open IPTV Pro v4.23.60 — 8-second live caption windows',
 '',
 '- Increases continuous FFmpeg segment duration from 4 seconds to 8 seconds, giving Whisper more surrounding context to recognize longer sentences before translation.',
 '- Keeps FFmpeg capture continuous and sequential: no audio stream reconnect between segment boundaries.',
 '- Whisper -t 4 remains four CPU worker threads, not a 4-second truncation.',
 '- Source-only interim captions remain hidden while Live Translate is enabled; target-language captions remain on the video.',
 '- Preserves full-sentence VieNeu and Piper TTS, newest-pending queue, playback speed, model choices and original-audio ducking.',
 '- Because captions are processed per 8-second window, the first visible translation may arrive roughly four seconds later than in v4.23.59.',
 '- A sentence longer than eight seconds can still cross a boundary; this update does not claim punctuation-based segmentation or overlap.',
 '- Mac command produces one DMG and one matching full source ZIP, no app ZIP/blockmap.',
 '- Independent experimental Electron branch only; does not change main or Rust/Tauri.'
].join('\n')+'\n');
console.log('v4.23.60: live audio segments 8 seconds, target-only captions and full-sentence TTS preserved');
