'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd();
const from='4.23.41',to='4.23.42';
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const put=(p,s)=>fs.writeFileSync(path.join(root,p),s);
function replaceStrict(p,a,b){
  const s=get(p);
  assert(s.includes(a),'Expected source not found: '+p+' : '+a.slice(0,80));
  put(p,s.replaceAll(a,b));
}
const pkg=JSON.parse(get('package.json'));
assert.equal(pkg.version,from);
pkg.version=to;
pkg.description='Open IPTV Pro v4.23.42 Desktop - compact single-row playback controls, Cast/AirPlay beside short volume slider, two-line EPG, Windows and macOS';
put('package.json',JSON.stringify(pkg,null,2)+'\n');
for (const p of ['BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1']){
  replaceStrict(p,from,to);
}
replaceStrict('renderer/index.html','<title>Open IPTV Pro '+from+'</title>','<title>Open IPTV Pro '+to+'</title>');
replaceStrict('renderer/index.html','<span class="version">'+from+'</span>','<span class="version">'+to+'</span>');
let html=get('renderer/index.html');
const oldButton=html.match(/<button\b[^>]*\bid="castBtn"[^>]*>[\s\S]*?<\/button>/);
assert(oldButton,'Cast/AirPlay button was not found');
assert.equal((html.match(/id="castBtn"/g)||[]).length,1,'Duplicate Cast control ID');
assert(html.indexOf('id="castBtn"')>html.indexOf('<div class="playback-extra-inner">'),'Expected Cast inside expanded tools in v4.23.41');
const cast=oldButton[0];
html=html.replace(cast,'');
const outputOpen='<div class="output-controls" role="group" aria-label="PiP và toàn màn hình">';
assert(html.includes(outputOpen),'Top-row output controls changed');
html=html.replace(outputOpen,'<div class="output-controls" role="group" aria-label="Cast / AirPlay, PiP và toàn màn hình">\n         '+cast);
assert(html.indexOf('id="castBtn"')<html.indexOf('<div class="control-layout-bottom">'),'Cast must be on the first row');
assert.equal((html.match(/id="castBtn"/g)||[]).length,1,'Cast binding must remain unique');
const viewModeTag='<label class="view-mode" title="Chế độ hiển thị video"><span>Khung hình</span>';
assert(html.includes(viewModeTag),'Video fit label has changed');
html=html.replace(viewModeTag,'<label class="view-mode" title="Chế độ hiển thị video">');
assert(html.includes('id="videoFit" aria-label="Chế độ hiển thị video"'),'Video-fit accessible name must be preserved');
const stylesheet='player-compact-cast-v42342.css';
assert(!html.includes(stylesheet));
assert(html.includes('</head>'));
html=html.replace('</head>','<link rel="stylesheet" href="'+stylesheet+'"/></head>');
assert(html.lastIndexOf(stylesheet)>html.lastIndexOf('player-toolbar-v42341.css'),'New CSS should override old styles');
const first=html.indexOf('<div class="control-layout-top">');
const second=html.indexOf('<div class="control-layout-bottom">');
assert(first>=0&&second>first,'Player markup missing');
const top=html.slice(first,second);
assert(top.indexOf('id="volume"')>=0&&top.indexOf('id="castBtn"')>top.indexOf('id="volume"'),'Cast must follow volume in top row');
for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','volume','castBtn','pipBtn','fullscreenBtn','epgCurrent','epgNowName','epgNextName','videoFit','manualStreamSelect','favCurrentBtn','shotBtn','tryFfmpegBtn']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Missing or duplicated UI control '+id);
}
put('renderer/index.html',html);
const cssSrc=process.argv[2];
assert(cssSrc&&fs.existsSync(cssSrc),'Supply compact Cast CSS overlay');
fs.copyFileSync(cssSrc,path.join(root,'renderer',stylesheet));
const css=get('renderer/'+stylesheet);
assert(css.includes('max-width:105px!important'),'Volume must be compact');
assert(css.includes('output-controls #castBtn'),'Cast styling must be top-row');
assert(css.includes('content:none!important'),'EPG labels should be visually hidden');
assert(css.includes('max-width:225px!important'),'Manual stream picker must be shorter');
assert(css.includes('max-width:980px'),'Laptop layout rule expected');
const helperOld='CAP_NHAT_GITHUB_V4_23_41_MAC.command',helperNew='CAP_NHAT_GITHUB_V4_23_42_MAC.command';
assert(fs.existsSync(path.join(root,helperOld)),'Matching Git helper missing');
put(helperNew,get(helperOld).replaceAll(from,to).replaceAll('4_23_41','4_23_42'));
replaceStrict('tests/release_version_sync_v42332.test.cjs',helperOld,helperNew);
// Maintain legacy tests of the same real event handlers and original markup.
const twotest='tests/player_two_row_v42335.test.cjs';
let oldTest=get(twotest);
const topOld="['playingTitle','prevBtn','playBtn','stopBtn','nextBtn','pipBtn','fullscreenBtn']";
const topNew="['playingTitle','prevBtn','playBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn']";
assert(oldTest.includes(topOld),'Legacy control test differs from expected v4.23.41 source');
oldTest=oldTest.replace(topOld,topNew);
assert(oldTest.includes("['castBtn','shotBtn','tryFfmpegBtn']"),'Expected current extras test');
oldTest=oldTest.replace("['castBtn','shotBtn','tryFfmpegBtn']","['shotBtn','tryFfmpegBtn']");
put(twotest,oldTest);
const oldVersionTest='tests/classic_controls_universal_v42340.test.cjs';
if(fs.existsSync(path.join(root,oldVersionTest))){
 const v=get(oldVersionTest);
 assert(v.includes(from),'Expected v4.23.41 version in classic controls test');
 put(oldVersionTest,v.replaceAll(from,to));
}
// Update the existing focused regression suite as well as adding new layout rules.
const testCode=[
 "'use strict';",
 "const {test}=require('node:test');const assert=require('node:assert/strict');",
 "const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');",
 "const read=p=>fs.readFileSync(path.join(root,p),'utf8');",
 "const html=read('renderer/index.html'),css=read('renderer/player-compact-cast-v42342.css');",
 "test('v4.23.42: all core controls remain functional and within one top row',()=>{",
 " const top=html.split('<div class=\"control-layout-top\">')[1].split('<div class=\"control-layout-bottom\">')[0];",
 " for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','volume','castBtn','pipBtn','fullscreenBtn'])assert.match(top,new RegExp('id=\"'+id+'\"'));",
 " assert.ok(top.indexOf('id=\"volume\"')<top.indexOf('id=\"castBtn\"'));",
 " assert.equal((html.match(/id=\"castBtn\"/g)||[]).length,1);",
 " assert.match(css,/grid-template-columns:minmax\\(145px,1\\.18fr\\)/);",
 "});",
 "test('v4.23.42: compact volume, Cast and PiP fit on laptop widths',()=>{",
 " assert.match(css,/max-width:105px!important/);",
 " assert.match(css,/output-controls #castBtn/);",
 " assert.match(css,/@container \\(min-width:650px\\) and \\(max-width:980px\\)/);",
 " assert.match(css,/flex-wrap:nowrap!important/);",
 "});",
 "test('v4.23.42: 2-row EPG has no labels, video-fit control has accessible name',()=>{",
 " assert.match(css,/content:none!important/);",
 " assert.doesNotMatch(html,/<span>Khung hình<\\/span>/);",
 " assert.match(html,/id=\"videoFit\" aria-label=\"Chế độ hiển thị video\"/);",
 " for(const id of ['epgNowName','epgNextName','epgNowTime','epgNextTime']) assert.match(html,new RegExp('id=\"'+id+'\"'));",
 " assert.match(css,/max-width:225px!important/);",
 "});",
 "test('v4.23.42: stylesheet is loaded after previous player theme and video unaffected',()=>{",
 " assert.ok(html.indexOf('player-compact-cast-v42342.css')>html.indexOf('player-toolbar-v42341.css'));",
 " assert.ok(html.indexOf('id=\"playerBox\"')<html.indexOf('class=\"player-control-card\"'));",
 " assert.doesNotMatch(css,/#playerBox(?:\\s*\\{|\\s*>)/);",
 " assert.equal(JSON.parse(read('package.json')).version,'4.23.42');",
 "});",""
].join('\n');
put('tests/player_toolbar_v42341.test.cjs',testCode);
put('RELEASE_NOTES_V4_23_42.md',
'# Open IPTV Pro v4.23.42 — Compact Cast and volume toolbar\n\n'
+'- Cast / AirPlay moved to the top row immediately after the now-shorter volume slider.\n'
+'- Previous, Play/Pause, Stop, Next, Volume, Cast/AirPlay, PiP and Fullscreen remain in one compact row at ordinary laptop widths.\n'
+'- EPG stays two rows (current programme, then next programme) without the visible labels "Đang phát" and "Tiếp theo"; video-fit label "Khung hình" is hidden without removing the accessible name.\n'
+'- Manual fallback-stream dropdown reduced in width and height.\n'
+'- Video frame and source aspect ratio untouched. Windows/macOS source preserved, with separate arm64/x64 Mac installers.\n');
assert.equal(JSON.parse(get('package.json')).version,to);
console.log('PATCH OK: v4.23.42 compact Cast, narrow volume, stacked EPG, labels removed');
