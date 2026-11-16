'use strict';
/* Build verified v4.23.39 from the published v4.23.38 source ZIP. */
const fs=require('node:fs'),path=require('node:path');
const root=process.cwd();
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const write=(name,s)=>fs.writeFileSync(path.join(root,name),s);
function replaceStrict(file,before,after) {
  const s=read(file);
  if(!s.includes(before))throw new Error('Required v4.23.38 source pattern missing: '+file+' '+before.slice(0,60));
  write(file,s.replaceAll(before,after));
}
const oldVersion='4.23.38',newVersion='4.23.39';
for(const file of ['package.json','BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1','README.md','CHANGELOG.md']) {
  replaceStrict(file,oldVersion,newVersion);
}
replaceStrict('renderer/index.html','<title>Open IPTV Pro 4.23.38</title>','<title>Open IPTV Pro 4.23.39</title>');
replaceStrict('renderer/index.html','<span class="version">4.23.38</span>','<span class="version">4.23.39</span>');
const cssFile='renderer/video-source-aspect-v42338.css';
replaceStrict(cssFile,
 'width: min(100%, calc(clamp(210px, (100dvh - 230px), 900px) * var(--source-video-ratio-factor)))!important;',
 'width: 100%!important; /* fills available horizontal space; aspect-ratio controls height */');
replaceStrict(cssFile,'margin-inline: auto!important;','margin-inline: 0!important;');
replaceStrict(cssFile,'justify-self: center!important;','justify-self: stretch!important;');
const test='tests/release_version_sync_v42332.test.cjs';
replaceStrict(test,'CAP_NHAT_GITHUB_V4_23_38_MAC.command','CAP_NHAT_GITHUB_V4_23_39_MAC.command');
const oldCmd='CAP_NHAT_GITHUB_V4_23_38_MAC.command';
const newCmd='CAP_NHAT_GITHUB_V4_23_39_MAC.command';
if(!fs.existsSync(path.join(root,oldCmd)))throw new Error('GitHub source helper missing');
write(newCmd,read(oldCmd).replaceAll('4.23.38','4.23.39').replaceAll('4_23_38','4_23_39'));
fs.rmSync(path.join(root,oldCmd));
const testFile='tests/video_full_width_v42339.test.cjs';
write(testFile,[
 "'use strict';",
 "const {test}=require('node:test');",
 "const assert=require('node:assert/strict');",
 "const fs=require('node:fs');",
 "const path=require('node:path');",
 "const root=path.resolve(__dirname,'..');",
 "const css=fs.readFileSync(path.join(root,'renderer/video-source-aspect-v42338.css'),'utf8');",
 "test('v4.23.39 video frame uses the full available width instead of a viewport-height cap',()=>{",
 "  assert.match(css,/width:\\s*100%!important/);",
 "  assert.doesNotMatch(css,/width:\\s*min\\(100%,\\s*calc\\(clamp/);",
 "  assert.match(css,/aspect-ratio:\\s*var\\(--source-video-ratio\\)!important/);",
 "  assert.match(css,/height:\\s*auto!important/);",
 "  assert.match(css,/margin-inline:\\s*0!important/);",
 "});",
 ""
].join('\n'));
write('RELEASE_NOTES_V4_23_39.md',
 '# Open IPTV Pro v4.23.39 — Full-width Adaptive Player\n\n'
 +'- Fix: video player frame now fills 100% of the available horizontal content area instead of being narrowed by a viewport-height clamp.\n'
 +'- Keep video aspect ratio based on source metadata (default 16:9), with no stretching and no overlay of playback controls.\n'
 +'- Preserve existing channel-list collapse and the two-row playback controls.\n'
 +'- Windows/macOS desktop code; separate GitHub build-source branch, main branch unchanged.\n');
const manifest=JSON.parse(read('package.json'));
if(manifest.version!==newVersion)throw Error('Package version mismatch after patch');
const css=read(cssFile);
if(!css.includes('width: 100%!important;'))throw Error('Full width patch did not apply');
console.log('v4.23.39 full-width source patch applied and version synchronized');
