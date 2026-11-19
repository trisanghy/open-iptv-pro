'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const layout=require('../renderer/fullscreen-web-parity-v23-8-59.js');
test('full screen aspect ratios are mathematically constrained to the active viewport',()=>{
 assert.deepEqual(layout.fitSize(1920,1080,'16:9'),{width:1920,height:1080});
 assert.deepEqual(layout.fitSize(1920,1080,'4:3'),{width:1440,height:1080});
 assert.deepEqual(layout.fitSize(1280,800,'16:10'),{width:1280,height:800});
 const ultra=layout.fitSize(1920,1080,'21:9');
 assert.ok(ultra.width===1920&&Math.abs(ultra.height-1920/(21/9))<.001);
 assert.deepEqual(layout.fitSize(1200,800,'screen'),{width:1200,height:800});
 assert.deepEqual(layout.fitSize(1200,800,'crop'),{width:1200,height:800});
 for(const ratio of ['16:9','4:3','16:10','21:9'])for(const [w,h] of [[640,480],[1280,720],[1440,900],[2560,1080]]){
  const dim=layout.fitSize(w,h,ratio);
  assert.ok(dim.width<=w+1e-6&&dim.height<=h+1e-6);
  assert.ok(Math.abs(dim.width/dim.height-layout.ratios[ratio])<1e-6);
 }
});
test('fullscreen keeps original player, transport and alternate-link owners',()=>{
 const src=read('renderer/fullscreen-web-parity-v23-8-59.js');
 const app=read('renderer/app.js'),ux=read('renderer/player-ux.js');
 assert.match(src,/video=\$\('video'\)/);
 assert.match(src,/controls\.fsPrev,controls\.fsPlay,controls\.fsNext/);
 assert.match(src,/original\.dispatchEvent\(new win\.Event\('change'/);
 assert.match(src,/original\.dispatchEvent\(new win\.Event\('input'/);
 assert.match(src,/favCurrentBtn/);
 assert.match(src,/pipBtn/);
 assert.match(src,/fsDVR\.click\(\)/);
 assert.match(app,/requestFullscreen/);
 assert.match(ux,/fs-web-menu-open/);
 assert.doesNotMatch(src,/document\.createElement\('video'\)/);
 assert.doesNotMatch(src,/\.src\s*=\s*.*(?:m3u|https?:)/);
});
test('Web-style fullscreen HUD, EPG/info/schedule tabs, settings and popup overlays are wired',()=>{
 const html=read('renderer/index.html');
 const entry=read('renderer/app-entry.js'),css=read('renderer/fullscreen-web-parity-v23-8-59.css');
 const panels=read('renderer/fullscreen-panels.js');
 assert.ok(html.includes('href="fullscreen-web-parity-v23-8-59.css"'));
 assert.ok(entry.indexOf("'fullscreen-web-parity-v23-8-59.js'")>entry.indexOf("'fullscreen-panels.js'"));
 for(const name of ['fsWebFitButton','fsWebLinkButton','fsWebSettings','fsWebPiP','fsWebVolume','fs-web-channel','fs-web-progress','fs-web-popover'])
  assert.ok((css+read('renderer/fullscreen-web-parity-v23-8-59.js')).includes(name),name);
 assert.match(panels,/getMode:\(\)=>mode,close,show/);
 assert.match(panels,/renderInfo\(\)/);
 assert.match(panels,/renderEPG\(true\)/);
 assert.match(css,/#playerBox:fullscreen .fs-drawer:not\(\[hidden\]\)/);
 assert.match(css,/left:clamp\(16px,2vw,34px\)/);
 assert.match(css,/\.fs-web-menu-open/);
 assert.match(css,/prefers-reduced-motion/);
});
test('fullscreen overlay is strictly scoped: no non-fullscreen layout selectors or external network calls',()=>{
 const css=read('renderer/fullscreen-web-parity-v23-8-59.css');
 const js=read('renderer/fullscreen-web-parity-v23-8-59.js');
 assert.match(css,/#playerBox:fullscreen/);
 assert.ok(!css.includes('#page-tv .player-control-card'));
 assert.doesNotMatch(js,/\bfetch\s*\(/);
 assert.ok(js.includes("if(doc.fullscreenElement!==box)return;"));
 assert.ok(js.includes("if(doc.fullscreenElement===box)sync();"));
});
