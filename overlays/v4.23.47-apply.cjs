'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),old='4.23.46',next='4.23.47';
const filename=p=>path.join(root,p),read=p=>fs.readFileSync(filename(p),'utf8'),write=(p,s)=>fs.writeFileSync(filename(p),s);
function update(p,a,b){const s=read(p);assert(s.includes(a),'Missing anchor in '+p+': '+a.slice(0,80));write(p,s.replace(a,b));}
const pkg=JSON.parse(read('package.json'));assert.equal(pkg.version,old);
pkg.version=next;pkg.description='Open IPTV Pro v4.23.47 — Whisper auto-install repaired for Mac Intel, Apple Silicon and Windows, with Live Caption and 15-language Live Translate';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 const s=read(p);assert(s.includes(old),'Version missing: '+p);write(p,s.replaceAll(old,next));
}
update('renderer/index.html','<title>Open IPTV Pro '+old+'</title>','<title>Open IPTV Pro '+next+'</title>');
update('renderer/index.html','<span class="version">'+old+'</span>','<span class="version">'+next+'</span>');
const overlays=process.argv[2];assert(overlays&&fs.existsSync(overlays),'Missing overlay folder');
fs.copyFileSync(path.join(overlays,'whisper-autoinstall-v42347.cjs'),filename('src/whisper-autoinstall.cjs'));
const oldHelper='CAP_NHAT_GITHUB_V4_23_46_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_47_MAC.command';
assert(fs.existsSync(filename(oldHelper)),'Previous helper absent');
write(newHelper,read(oldHelper).replaceAll(old,next).replaceAll('4_23_46','4_23_47'));
update('tests/release_version_sync_v42332.test.cjs',oldHelper,newHelper);
for(const p of ['tests/classic_controls_universal_v42340.test.cjs','tests/player_toolbar_v42341.test.cjs',
 'tests/live-caption-v42343.test.cjs','tests/local-tts-v42344.test.cjs',
 'tests/whisper-auto-v42345.test.cjs','tests/multilingual-captions-v42346.test.cjs']){
 if(!fs.existsSync(filename(p)))continue;
 const s=read(p);
 const fixed=s.replaceAll("assert.equal(JSON.parse(read('package.json')).version,'"+old+"')",
  "assert.equal(JSON.parse(read('package.json')).version,'"+next+"')")
 .replaceAll("assert.equal(JSON.parse(get('package.json')).version,'"+old+"')",
  "assert.equal(JSON.parse(get('package.json')).version,'"+next+"')");
 if(s!==fixed)write(p,fixed);
}
const testLines=[
 "'use strict';",
 "const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');",
 "const {createWhisperAutoInstaller,BINARIES}=require('../src/whisper-autoinstall.cjs');",
 "for(const [platform,arch,alias,expected] of [",
 " ['darwin','arm64','whisper-cpp-darwin-arm64','whisper-cli'],",
 " ['darwin','x64','whisper-cpp-darwin-x64','whisper-cli'],",
 " ['win32','x64','whisper-cpp-win32-x64-cpu.exe','whisper-cli.exe']",
 "]){",
 " test('v4.23.47 recovers already extracted '+platform+' '+arch+' without network',async()=>{",
 "  const root=fs.mkdtempSync(path.join(os.tmpdir(),'whisper-repair-'));",
 "  const folder=path.join(root,'live-caption','auto','binary');",
 "  fs.mkdirSync(folder,{recursive:true});",
 "  const oldFile=path.join(folder,alias);fs.writeFileSync(oldFile,Buffer.alloc(52000,65));",
 "  fs.writeFileSync(path.join(root,'live-caption','auto','ggml-base.bin'),Buffer.alloc(1100000,42));",
 "  let downloads=0;",
 "  try{",
 "   const installer=createWhisperAutoInstaller({dataDir:root,platform,arch,download:async()=>{downloads++;throw Error('Unexpected re-download');}});",
 "   assert.equal(installer.status().installed,false);",
 "   const result=await installer.install();",
 "   assert.equal(result.installed,true);",
 "   assert.equal(path.basename(result.binary),expected);",
 "   assert.equal(fs.existsSync(oldFile),false);",
 "   assert.equal(downloads,0);",
 "  }finally{fs.rmSync(root,{recursive:true,force:true});}",
 " });",
 "}",
 "test('v4.23.47 pins the correct architecture-specific original ZIP filenames',()=>{",
 " for(const [key,filename] of [['darwin-arm64','whisper-cpp-darwin-arm64.zip'],['darwin-x64','whisper-cpp-darwin-x64.zip'],['win32-x64','whisper-cpp-win32-x64-cpu.zip']]){",
 "  assert.equal(BINARIES[key][0],filename);assert.equal(BINARIES[key][1].length,64);",
 " }",
 "});",
 "test('v4.23.47 installer normalizes binary and source version is synchronized',()=>{",
 " const text=fs.readFileSync(path.join(__dirname,'../src/whisper-autoinstall.cjs'),'utf8');",
 " assert.match(text,/packagedBinaryName/);",
 " assert.match(text,/normalizeBinary/);",
 " assert.match(text,/fs\\.renameSync\\(source,destination\\)/);",
 " assert.equal(JSON.parse(fs.readFileSync(path.join(__dirname,'../package.json'),'utf8')).version,'4.23.47');",
 "});",""
];
write('tests/whisper-installer-hotfix-v42347.test.cjs',testLines.join('\n'));
write('RELEASE_NOTES_V4_23_47.md',[
 '# Open IPTV Pro v4.23.47 — Whisper automatic installer hotfix',
 '',
 'Root cause: pinned community OpenWhispr ZIPs contain whisper-cpp-darwin-arm64, whisper-cpp-darwin-x64 and whisper-cpp-win32-x64-cpu.exe, rather than whisper-cli or whisper-cli.exe.',
 'The old installer incorrectly reported that the correct CPU executable was missing after extracting it.',
 '',
 'Fix: detect and rename the actual executable to whisper-cli (or whisper-cli.exe), preserve adjacent DLLs on Windows, mark Mac binary executable, reuse a previously extracted file, and smoke-test --help after new download.',
 'Previous Live Caption, 15-target-language Live Translate, local Piper TTS and source-volume controls remain unchanged.',
 'Beta: successful packaging alone does not verify audio transcription against a real-world stream.'
].join('\n')+'\n');
console.log('v4.23.47: patched Whisper executable alias normalization and 3 platform recovery tests');
