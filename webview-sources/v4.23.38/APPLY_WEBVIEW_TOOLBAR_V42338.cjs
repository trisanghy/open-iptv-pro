#!/usr/bin/env node
// Open IPTV Pro WebView v4.23.38: restore compact 2-row toolbar.
// Applies ONLY to a v4.23.37 WebView source tree. Electron reference untouched.
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const base=path.resolve(process.argv[2]||'.'),fe=path.join(base,'frontend');
const file=path.join(fe,'index.html');
const pkgPath=path.join(base,'package.json');
if(!fs.existsSync(pkgPath)||!fs.existsSync(file))throw Error('Missing WebView source tree');
const pkg=JSON.parse(fs.readFileSync(pkgPath,'utf8'));
if(pkg.version==='4.23.38'){console.log('Already v4.23.38; skipping');process.exit(0)}
if(pkg.version!=='4.23.37')throw Error('Expected WebView v4.23.37, found '+pkg.version);
let html=fs.readFileSync(file,'utf8');
function exact(old,text){if(!html.includes(old))throw Error('Unexpected WebView player HTML: '+old.slice(0,70));html=html.replace(old,text)}
exact('<button class="control-sm" id="castBtn" title="Cast / AirPlay lên TV">▣ Cast / AirPlay</button>',
'<button class="control-sm" id="castBtn" title="Cast / AirPlay lên TV" aria-label="Cast / AirPlay">▣ <span class="cast-label">Cast / AirPlay</span></button>');
exact('<button class="control-sm" id="pipBtn" title="Cửa sổ nổi Picture-in-Picture">▣ PiP</button>',
'<button class="control-sm" id="pipBtn" title="Cửa sổ nổi Picture-in-Picture" aria-label="PiP">▣ <span class="pip-label">PiP</span></button>');
const oldStart='       <details class="playback-extra" id="playbackExtra">';
const at=html.indexOf(oldStart),end=html.indexOf('       </details>',at)+('       </details>').length;
if(at<0||end<at||end>html.length)throw Error('Old extra controls absent');
html=html.slice(0,at)+html.slice(end);
const extra=`       <details class="playback-extra" id="playbackExtra">
        <summary aria-label="Công cụ khác: âm lượng, chụp ảnh, FFmpeg" title="Âm lượng, chụp ảnh và FFmpeg">⋯</summary>
        <div class="playback-extra-inner">
         <label for="volume">Âm lượng</label><input type="range" min="0" max="100" value="80" id="volume" title="Âm lượng"/>
         <button class="control-sm" id="shotBtn" title="Chụp ảnh kênh">▣ Chụp ảnh</button>
         <button type="button" class="control-sm player-ffmpeg-btn" id="tryFfmpegBtn" title="Thử trình phát dự phòng FFmpeg nếu không có hình">↻ FFmpeg</button>
        </div>
       </details>`;
exact('<button class="control-sm" id="fullscreenBtn" title="Toàn màn hình">⛶</button>',
'<button class="control-sm" id="fullscreenBtn" title="Toàn màn hình">⛶</button>\n'+extra);
exact('<link rel="stylesheet" href="video-aspect-v42337.css"/>',
'<link rel="stylesheet" href="video-aspect-v42337.css"/><link rel="stylesheet" href="player-toolbar-restore-v42338.css"/>');
// Avoid any partial mutation if the expected HTML is missing.
fs.writeFileSync(file,html);
const css=Buffer.from('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','base64');
fs.writeFileSync(path.join(fe,'player-toolbar-restore-v42338.css'),zlib.gunzipSync(css));
const validExt=new Set(['.json','.toml','.html','.js','.cjs','.css','.md','.ps1','.cmd','.command','.yml']);
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,ent.name);
 if(ent.isDirectory()){
  if(['electron-original','node_modules','target','.git','__pycache__'].includes(ent.name))continue;
  walk(p);continue;
 }
 if(!ent.isFile()||!validExt.has(path.extname(p)))continue;
 let text=fs.readFileSync(p,'utf8');
 if(text.includes('4.23.37')||text.includes('4\\.23\\.37')){
  text=text.replaceAll('4.23.37','4.23.38').replaceAll('4\\.23\\.37','4\\.23\\.38');
  fs.writeFileSync(p,text);
 }
}}
walk(base);
for(const id of ['playBtn','castBtn','pipBtn','fullscreenBtn','manualStreamSelect','volume','shotBtn','tryFfmpegBtn']){
 const matches=html.match(new RegExp('id="'+id+'"','g'))||[];
 if(matches.length!==1)throw Error('Invalid player control '+id);
}
console.log('WebView v4.23.38: two-row player restored; source ratio retained');