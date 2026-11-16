'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=process.cwd(),old='4.23.40',next='4.23.41';
const file=p=>path.join(root,p);
const read=p=>fs.readFileSync(file(p),'utf8');
const write=(p,s)=>fs.writeFileSync(file(p),s);
function change(p,a,b){
 const s=read(p);assert(s.includes(a),p+' missing expected text: '+a.slice(0,80));
 write(p,s.replaceAll(a,b));
}
let pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,old);
pkg.version=next;
pkg.description='Open IPTV Pro v'+next+' Desktop - approved compact player toolbar, visible top-row volume slider and two-line current/next EPG; adaptive full-width video, channel management, FFmpeg, Timeshift, Windows/macOS';
write('package.json',JSON.stringify(pkg,null,2)+'\n');
for(const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
 change(p,old,next);
}
change('renderer/index.html','<title>Open IPTV Pro '+old+'</title>','<title>Open IPTV Pro '+next+'</title>');
change('renderer/index.html','<span class="version">'+old+'</span>','<span class="version">'+next+'</span>');
let html=read('renderer/index.html');
const sheet='player-toolbar-v42341.css';
assert(!html.includes(sheet));
html=html.replace('</head>','<link rel="stylesheet" href="'+sheet+'"/></head>');
// Move the existing Cast button into expanded tools; retain the same ID and event binding.
const match=html.match(/<button\b[^>]*\bid="castBtn"[^>]*>[\s\S]*?<\/button>/);
assert(match&&match.length===1, 'Cast control missing');
assert.equal((html.match(/\bid="castBtn"/g)||[]).length,1,'Duplicate Cast controls');
html=html.replace(match[0],'');
assert(html.includes('<div class="playback-extra-inner">'),'Extra control panel missing');
html=html.replace('<div class="playback-extra-inner">','<div class="playback-extra-inner">\n         '+match[0]);
assert.equal((html.match(/\bid="castBtn"/g)||[]).length,1,'Cast control ID lost');
assert(html.indexOf('id="castBtn"')>html.indexOf('<div class="playback-extra-inner">'),'Cast not moved');
for(const id of ['volume','epgCurrent','epgNowName','epgNowTime','epgNextName','epgNextTime','openGuideBtn','playBtn','pipBtn','fullscreenBtn','manualStreamSelect','favCurrentBtn']){
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Missing or duplicated #'+id);
}
write('renderer/index.html',html);
const cssSrc=process.argv[2];
assert(cssSrc&&fs.existsSync(cssSrc),'Must supply approved toolbar CSS as argv[2]');
fs.copyFileSync(cssSrc,file('renderer/'+sheet));
const css=read('renderer/'+sheet);
for(const x of ['#volume','#epgCurrent','.epg-current-item','.epg-next-item','#playBtn']){
 assert(css.includes(x),'New stylesheet missing '+x);
}
const oldHelper='CAP_NHAT_GITHUB_V4_23_40_MAC.command',newHelper='CAP_NHAT_GITHUB_V4_23_41_MAC.command';
assert(fs.existsSync(file(oldHelper)),'Existing Mac GitHub helper missing');
write(newHelper,read(oldHelper).replaceAll(old,next).replaceAll('4_23_40','4_23_41'));
const sync='tests/release_version_sync_v42332.test.cjs';
change(sync,oldHelper,newHelper);
const classic='tests/classic_controls_universal_v42340.test.cjs';
if(fs.existsSync(file(classic)))change(classic,old,next);
const legacyTest='tests/player_two_row_v42335.test.cjs';
let test=read(legacyTest);
const oldTop="['playingTitle','prevBtn','playBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn']";
const newTop="['playingTitle','prevBtn','playBtn','stopBtn','nextBtn','pipBtn','fullscreenBtn']";
assert(test.includes(oldTop),'Old toolbar test shape changed; fail safely');
test=test.replace(oldTop,newTop);
assert(test.includes("['shotBtn','tryFfmpegBtn']"),'Old expanded-controls check missing');
test=test.replace("['shotBtn','tryFfmpegBtn']","['castBtn','shotBtn','tryFfmpegBtn']");
write(legacyTest,test);
const freshTest=[
 "'use strict';",
 "const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path');",
 "const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');",
 "const html=read('renderer/index.html'),css=read('renderer/player-toolbar-v42341.css');",
 "test('v4.23.41 approved toolbar is loaded last and video remains separate',()=>{",
 " assert.ok(html.indexOf('player-toolbar-v42341.css')>html.indexOf('player-classic-controls-v42340.css'));",
 " assert.ok(html.indexOf('id=\"playerBox\"')<html.indexOf('class=\"player-control-card\"'));",
 " assert.match(css,/grid-template-columns:minmax\\(180px,1\\.12fr\\)/);",
 "});",
 "test('v4.23.41 volume slider is in the top row and not hidden',()=>{",
 " const top=html.split('<div class=\"control-layout-top\">')[1].split('<div class=\"control-layout-bottom\">')[0];",
 " assert.match(top,/id=\"volume\"/);assert.match(top,/id=\"playBtn\"/);",
 " assert.match(css,/#page-tv \\.player-control-card \\.volume-controls #volume/);",
 " assert.match(css,/visibility:visible!important/);",
 "});",
 "test('v4.23.41 EPG shows exactly two stacked programme rows in moderate typography',()=>{",
 " const bottom=html.split('<div class=\"control-layout-bottom\">')[1].split('<details class=\"playback-extra\"')[0];",
 " for(const id of ['epgCurrent','epgNowName','epgNextName','epgNowTime','epgNextTime'])assert.match(bottom,new RegExp('id=\"'+id+'\"'));",
 " assert.match(css,/\\.epg-current-item::before\\{content:\"Đang phát\"\\}/);",
 " assert.match(css,/\\.epg-next-item::before\\{content:\"Tiếp theo\"\\}/);",
 " assert.match(css,/grid-template-rows:minmax\\(25px,auto\\) minmax\\(25px,auto\\)/);",
 "});",
 "test('v4.23.41 Cast still available, outside main toolbar',()=>{",
 " const extra=html.split('<div class=\"playback-extra-inner\">')[1].split('</div>')[0];",
 " assert.match(extra,/id=\"castBtn\"/);",
 " assert.equal((html.match(/id=\"castBtn\"/g)||[]).length,1);",
 "});",""
].join('\n');
write('tests/player_toolbar_v42341.test.cjs',freshTest);
write('RELEASE_NOTES_V4_23_41.md',
'# Open IPTV Pro v4.23.41 - Two-line EPG and approved player layout\n\n'
+'- Restore approved top row: channel identity, Previous/Play-Pause/Stop/Next, visible green volume slider, PiP and fullscreen.\n'
+'- EPG is two readable lines: currently playing programme first, next programme second. Moderate font size, programme names truncate on narrow windows.\n'
+'- Stream selector, video-fit picker and favourite remain on the second toolbar row.\n'
+'- Cast/AirPlay remains accessible under expanded tools, same button ID and callback.\n'
+'- Video width and source aspect-ratio logic stay unchanged; playback controls never overlap video.\n'
+'- Windows/macOS source; keep Apple Silicon/Intel native installers separate. No changes to main branch.\n');
assert.equal(JSON.parse(read('package.json')).version,next);
console.log('OK source patched v4.23.41; playback volume + stacked EPG + Cast preserved');
