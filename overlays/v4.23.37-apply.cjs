'use strict';
/* Open IPTV Pro desktop 4.23.37 — apply after Node bootstrap, before npm test */
const fs=require('node:fs'),path=require('node:path');
const root=process.cwd();
const rd=p=>fs.readFileSync(path.join(root,p),'utf8');
const wr=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const bump=p=>{const t=rd(p);wr(p,t.replaceAll('4.23.36','4.23.37'));};
for(const p of ['package.json','BUILD_WINDOWS.bat','scripts/BUILD_WINDOWS_AUTO.ps1','README.md'])bump(p);
let html=rd('renderer/index.html').replaceAll('4.23.36','4.23.37');
const volOld='<label for="volume">Âm lượng</label><span class="volume-icon" aria-hidden="true">◖))</span><input type="range" min="0" max="100" value="80" id="volume" title="Âm lượng"/>';
const volNew='<div class="volume-controls" role="group" aria-label="Âm lượng phát"><label for="volume" class="volume-icon" title="Âm lượng">◖))</label><input type="range" min="0" max="100" value="80" id="volume" title="Âm lượng" aria-label="Âm lượng"/></div>';
if(html.includes(volOld)){
 html=html.replace(volOld,'');
 html=html.replace('<div class="output-controls" role="group"',volNew+'<div class="output-controls" role="group"');
 html=html.replace('title="Âm lượng, chụp ảnh và FFmpeg dự phòng">Âm lượng · Chụp ảnh · FFmpeg','title="Chụp ảnh và FFmpeg dự phòng">Chụp ảnh · FFmpeg');
}else if(!html.includes('class="volume-controls"'))throw new Error('Volume source not recognized');
if((html.match(/id="volume"/g)||[]).length!==1)throw new Error('Volume slider duplicate');
wr('renderer/index.html',html);
let align=rd('renderer/sidebar-channel-align-v42334.js');
const old='const y=Math.round(sideRect.top-layoutRect.top);\n      const height=Math.round(sideRect.height);';
const replacement='const height=Math.round(sideRect.height);\n      const size=Math.max(22,Math.round(height/2));\n      const y=Math.round(sideRect.top-layoutRect.top+(height-size)/2);';
if(align.includes(old))align=align.replace(old,replacement);
if(!align.includes("listLayout.style.setProperty('--channel-reopen-size'")){
 const anchor="listLayout.style.setProperty('--channel-button-size',";
 const line=align.split('\n').find(s=>s.includes(anchor));
 if(!line)throw new Error('Sidebar align function missing');
 align=align.replace(line,line+"\n      listLayout.style.setProperty('--channel-reopen-size',size+'px');");
}
wr('renderer/sidebar-channel-align-v42334.js',align);
const marker='/* v4.23.37: compact reopen tab and volume in upper control row */';
const css=rd('.overlay-v42337.css');
let player=rd('renderer/player-two-row-v42335.css');
if(!player.includes(marker))player+='\n'+css+'\n';
wr('renderer/player-two-row-v42335.css',player);
const test='tests/player_two_row_v42335.test.cjs';
let t=rd(test);
t=t.replace("['volume','shotBtn','tryFfmpegBtn']","['shotBtn','tryFfmpegBtn']");
wr(test,t);
const t2='tests/release_version_sync_v42332.test.cjs';
t=rd(t2).replace('CAP_NHAT_GITHUB_V4_23_36_MAC.command','CAP_NHAT_GITHUB_V4_23_37_MAC.command');
wr(t2,t);
const oldCmd='CAP_NHAT_GITHUB_V4_23_36_MAC.command',newCmd='CAP_NHAT_GITHUB_V4_23_37_MAC.command';
if(!fs.existsSync(path.join(root,newCmd))&&fs.existsSync(path.join(root,oldCmd)))wr(newCmd,rd(oldCmd).replaceAll('4.23.36','4.23.37').replaceAll('4_23_36','4_23_37'));
wr('RELEASE_NOTES_V4_23_37.md','# Open IPTV Pro 4.23.37\n\n- Volume moved to the upper playback toolbar before Cast/AirPlay.\n- Channel-list reopen button reduced to half size, with a narrower gutter.\n- Player, EPG and video remain in separate regions with responsive button alignment.\n');
if(!html.includes('<title>Open IPTV Pro 4.23.37</title>'))throw new Error('UI version not updated');
console.log('Applied Open IPTV Pro desktop 4.23.37 UI release overlay');
