'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('renderer/index.html'),css=read('renderer/player-web-svg-v42377.css'),js=read('renderer/player-web-svg-v42377.js');
test('Web SVG player assets load after legacy fullscreen styles and player handlers',()=>{
 assert.ok(html.includes('player-web-svg-v42377.css'));
 assert.ok(html.includes('player-web-svg-v42377.js'));
 assert.ok(html.indexOf('fullscreen-web-v42371.css')<html.indexOf('player-web-svg-v42377.css'));
 assert.ok(html.indexOf('fullscreen-web-v42371.js')<html.indexOf('player-web-svg-v42377.js'));
 assert.doesNotThrow(()=>new Function(js));
});
test('Exact Web SVG masks cover all primary player buttons',()=>{
 for(const key of ['prev','next','play','pause','stop','volume','muted','cast','pip','expand','shrink','star','starfill','calendar'])
  assert.ok(css.includes('--ipc-'+key+':url("data:image/svg+xml,'),key);
 for(const key of ['prevBtn','playBtn','stopBtn','nextBtn','castBtn','pipBtn','fullscreenBtn','fsPrev','fsPlay','fsNext','fsExit','openGuideBtn','favCurrentBtn','fsWebFav','fsWebPiP'])
  assert.ok(css.includes('#'+key),key);
 assert.match(css,/mask-image:var\(--ipc-icon\)!important/);
});
test('Legacy emoji are hidden and real video state updates play/pause vectors',()=>{
 assert.match(css,/font-size:0!important/);
 assert.match(js,/dataset\.iptvPlaying=String\(playing\)/);
 assert.match(js,/!video\.paused&&!video\.ended/);
 assert.match(js,/attributeFilter:\['aria-pressed'\]/);
 assert.match(js,/iconOnlyMediaButton\(get\('castBtn'\)/);
});
test('Cast and PiP show exactly one SVG, keeping native handlers and accessibility',()=>{
 assert.match(css,/\.web-svg-icon-only::before\{/);
 assert.match(js,/button\.replaceChildren\(\)/);
 assert.match(js,/button\.setAttribute\('aria-label',label\)/);
 assert.match(js,/iconOnlyMediaButton\(get\('pipBtn'\)/);
 assert.match(read('renderer/app.js'),/bind\(\['castBtn'\]/);
 assert.match(read('renderer/cast-ui.js'),/OpenIPTVCastUI=Object\.freeze/);
 assert.ok(!js.includes('cloneNode('));
 assert.ok(!js.includes('replaceWith('));
});
