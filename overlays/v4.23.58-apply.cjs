'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),assets=process.argv[2],prev='4.23.57',version='4.23.58';
assert(assets&&fs.statSync(assets).isDirectory(),'v4.23.58 overlays required');
const file=p=>path.join(root,p),read=p=>fs.readFileSync(file(p),'utf8'),write=(p,v)=>fs.writeFileSync(file(p),v);
function swap(p,old,next){
 const s=read(p);assert(s.includes(old),'v4.23.58 anchor missing: '+p+' :: '+old.slice(0,90));
 write(p,s.replace(old,next));
}
const pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,prev,'Expected immutable v4.23.57 source');
assert.deepEqual(pkg.build?.mac?.target,['dmg']);
pkg.version=version;
pkg.description='Open IPTV Pro v4.23.58 — target-language captions exclusively on video, no duplicate transcript';
if(Array.isArray(pkg.build?.files)&&!pkg.build.files.includes('renderer/video-only-translated-caption-v42358.js'))
 pkg.build.files.push('renderer/video-only-translated-caption-v42358.js');
write('package.json',JSON.stringify(pkg,null,2)+'\n');
if(fs.existsSync(file('package-lock.json'))){
 const lock=JSON.parse(read('package-lock.json'));
 if(lock.version===prev)lock.version=version;
 if(lock.packages?.['']?.version===prev)lock.packages[''].version=version;
 write('package-lock.json',JSON.stringify(lock,null,2)+'\n');
}
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(p);assert(s.includes(prev),'Missing prior Windows build version in '+p);
 write(p,s.replaceAll(prev,version));
}
swap('renderer/index.html','<title>Open IPTV Pro '+prev+'</title>','<title>Open IPTV Pro '+version+'</title>');
swap('renderer/index.html','<span class="version">'+prev+'</span>','<span class="version">'+version+'</span>');
const ui='renderer/live-captions-v42343.js';
let s=read(ui);
const renderStart=s.indexOf(' const outputWords=(txt,target,translated)=>{');
const renderEnd=s.indexOf(' async function stopCurrent(){',renderStart);
assert(renderStart>=0&&renderEnd>renderStart,'Video renderer anchors missing');
const previousRender=s.slice(renderStart,renderEnd);
assert(previousRender.includes('video.addTextTrack')&&previousRender.includes('out.hidden=false'),'Unexpected old subtitle rendering');
const output=" const videoCaptions=window.OpenIPTVVideoCaptions?.createVideoCaptionRenderer?.({video,doc:document});\n const outputWords=(txt,target,translated)=>{\n  const text=String(txt||'').trim();\n  if(!text)return;\n  out.hidden=true;out.textContent='';\n  if(!videoCaptions){message('Không tải được bộ hiển thị phụ đề trên video',true);return;}\n  try{videoCaptions.show(text,target);}\n  catch(e){message('Lỗi phụ đề trên video: '+String(e.message||e).slice(0,100),true);}\n };\n const clearOutput=()=>{\n  out.hidden=true;out.textContent='';\n  videoCaptions?.clear();\n };\n";
s=s.slice(0,renderStart)+output+s.slice(renderEnd);
const eventStart=s.indexOf("  if(ev.type==='segment'){");
const eventEnd=s.indexOf("  if(ev.type==='status'",eventStart);
assert(eventStart>=0&&eventEnd>eventStart,'Missing subtitle segment event handler');
assert(s.slice(eventStart,eventEnd).includes('lastShownSequence'),'Expected v4.23.57 events');
const segment="  if(ev.type==='segment'){\n   const order=Number(ev.sequence)||0;\n   if(order&&order<lastShownSequence)return;\n   if(translate.checked){\n    const target=lang.value;\n    // Whisper's raw/interim segments drive audio but are never shown to viewers.\n    if(!ev.translated||ev.language!==target){\n     if(order&&order>lastShownSequence){\n      lastShownSequence=order;\n      clearOutput();\n     }\n     return;\n    }\n    if(order)lastShownSequence=order;\n    outputWords(ev.text,target,true);\n    message('Đã dịch → '+(LANGUAGE_NAMES[target]||target));\n    return;\n   }\n   if(order)lastShownSequence=order;\n   outputWords(ev.text,ev.language||lang.value,false);\n   message('Live Caption đang nhận diện');\n  }\n";
s=s.slice(0,eventStart)+segment+s.slice(eventEnd);
const errorMarker="  if(ev.type==='translation-error'){\n   lastTranslationFailureAt=Date.now();";
assert(s.includes(errorMarker),'Translation error event anchor missing');
s=s.replace(errorMarker,"  if(ev.type==='translation-error'){\n   clearOutput();\n   lastTranslationFailureAt=Date.now();");
assert(!s.includes('out.hidden=false'),'Duplicate transcript renderer remains');
write(ui,s);
for(const [source,dest] of [
 ['video-only-translated-caption-v42358.js','renderer/video-only-translated-caption-v42358.js'],
 ['video-only-translated-caption-v42358.css','renderer/video-only-translated-caption-v42358.css'],
 ['v42358-video-subtitles.test.cjs','tests/v42358-video-subtitles.test.cjs']
]){
 const original=path.join(assets,source);assert(fs.existsSync(original),'Missing overlay '+source);
 fs.copyFileSync(original,file(dest));
}
swap('renderer/index.html','<script src="live-captions-v42343.js"></script>',
 '<script src="video-only-translated-caption-v42358.js"></script><script src="live-captions-v42343.js"></script>');
swap('renderer/index.html','</head>',
 '<link rel="stylesheet" href="video-only-translated-caption-v42358.css"/></head>');
const helperOld='CAP_NHAT_GITHUB_V4_23_57_MAC.command',helperNew='CAP_NHAT_GITHUB_V4_23_58_MAC.command';
assert(fs.existsSync(file(helperOld)),'Previous Mac release helper missing');
write(helperNew,read(helperOld).replaceAll(prev,version).replaceAll('4_23_57','4_23_58'));
swap('tests/release_version_sync_v42332.test.cjs',helperOld,helperNew);
for(const name of fs.readdirSync(file('tests')).filter(x=>x.endsWith('.test.cjs'))){
 const p='tests/'+name,old=read(p),next=old.replaceAll(prev,version);
 if(old!==next)write(p,next);
}
write('RELEASE_NOTES_V4_23_58.md',[
 '# Open IPTV Pro v4.23.58 — one subtitle in the chosen language on video',
 '',
 '- Live Translate displays ONLY the translated target-language segment directly on the video.',
 '- Raw/interim Whisper segments remain internal for recognition and TTS but are not shown while translation is enabled.',
 '- Former duplicate bottom-row transcript is hidden. Caption-only mode remains on video.',
 '- Native Chromium text tracks are preferred for fullscreen; one video-attached DOM overlay is fallback.',
 '- Old cues are cleared on next recognition, changing channels, and translation errors.',
 '- IPTV stream, existing AI models, continuous capture, TTS and user settings are unchanged.',
 '- Burned-in broadcast subtitles are part of video pixels and cannot be deleted.',
 '- Mac artifacts remain native DMG and matching full source ZIP only.'
].join('\n')+'\n');
console.log('Applied v4.23.58 video-only target-language subtitle rendering');
