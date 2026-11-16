'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd(),from='4.23.39',to='4.23.40';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
function replace(p,a,b){const s=read(p);assert(s.includes(a),'Missing pattern in '+p+': '+a);write(p,s.replaceAll(a,b));}
for(const p of ['package.json','BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1'])replace(p,from,to);
replace('renderer/index.html','<title>Open IPTV Pro 4.23.39</title>','<title>Open IPTV Pro 4.23.40</title>');
replace('renderer/index.html','<span class="version">4.23.39</span>','<span class="version">4.23.40</span>');
const htmlfile='renderer/index.html',cssfile='player-classic-controls-v42340.css';
let html=read(htmlfile);
assert(!html.includes(cssfile));
assert(html.includes('</head>'));
write(htmlfile,html.replace('</head>','<link rel="stylesheet" href="'+cssfile+'"/></head>'));
const overlayCss=process.argv[2];
assert(overlayCss&&fs.existsSync(overlayCss),'Cannot find classic controls CSS');
fs.copyFileSync(overlayCss,path.join(root,'renderer',cssfile));
const helper='CAP_NHAT_GITHUB_V4_23_39_MAC.command';
assert(fs.existsSync(path.join(root,helper)));
write('CAP_NHAT_GITHUB_V4_23_40_MAC.command',read(helper).replaceAll(from,to).replaceAll('4_23_39','4_23_40'));
replace('tests/release_version_sync_v42332.test.cjs',helper,'CAP_NHAT_GITHUB_V4_23_40_MAC.command');
const mac='BUILD_MAC.command';
const call='npx --no-install electron-builder --mac --"$BUILD_ARCH" --publish never';
assert(read(mac).includes(call));
replace(mac,call,'BUILD_ARCH="$'+'{OPENIPTV_BUILD_ARCH:-$BUILD_ARCH}"\n'+call);
const lines=[
 "'use strict';",
 "const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');",
 "const root=path.resolve(__dirname,'..'),get=p=>fs.readFileSync(path.join(root,p),'utf8');",
 "test('v4.23.40 player buttons retain previous ids and separate toolbar',()=>{",
 " const html=get('renderer/index.html'),css=get('renderer/player-classic-controls-v42340.css');",
 " for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','volume','castBtn','pipBtn','fullscreenBtn','videoFit','manualStreamSelect']) assert.match(html,new RegExp('id=\"'+id+'\"'));",
 " assert.ok(html.indexOf('player-classic-controls-v42340.css')>html.indexOf('player-two-row-v42335.css'));",
 " assert.match(css,/#page-tv .player-control-card .controls.transport-controls/);",
 " assert.match(css,/@container \\(max-width:560px\\)/);",
 " assert.ok(html.indexOf('id=\"playerBox\"')<html.indexOf('class=\"player-control-card\"'));",
 "});",
 "test('v4.23.40 exact source version and universal Mac setting',()=>{",
 " assert.equal(JSON.parse(get('package.json')).version,'4.23.40');",
 " assert.match(get('BUILD_MAC.command'),/OPENIPTV_BUILD_ARCH/);",
 "});",
 ""
];
write('tests/classic_controls_universal_v42340.test.cjs',lines.join('\n'));
const notes='# Open IPTV Pro v4.23.40 — Classic Player Controls / Universal Mac / Windows\n\n'
+'- Restore approved compact Play/Pause, Previous, Stop, Next, Volume, Cast/AirPlay, PiP and Fullscreen controls across UI themes.\n'
+'- Responsive controls stay under video; full-width source-aspect frame remains unchanged.\n'
+'- Support Mac universal arm64+x86_64 and Windows Setup + Portable from pinned source ZIP.\n';
write('RELEASE_NOTES_V4_23_40.md',notes);
const p=JSON.parse(read('package.json'));
assert.equal(p.version,to);
assert(read(htmlfile).includes(cssfile));
console.log('v4.23.40 patched: classic controls, universal Mac override, Windows version');
