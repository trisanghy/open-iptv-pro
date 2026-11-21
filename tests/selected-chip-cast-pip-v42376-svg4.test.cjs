'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Tất cả selected chip uses dark teal rather than bright playback green',()=>{
 const css=read('renderer/web-channel-chooser-v42371.css');
 assert.match(css,/\.web-chooser-chip\.active\{background:#183a33/);
 assert.match(css,/background:#193c35!important/);
 assert.doesNotMatch(css,/\.web-chooser-chip\.active\{background:#32db76/);
});
test('Cast / PiP are one SVG only, without cloning or replacing click target',()=>{
 const js=read('renderer/player-web-svg-v42377.js');
 const css=read('renderer/player-web-svg-v42377.css');
 assert.match(js,/iconOnlyMediaButton\(get\('castBtn'\)/);
 assert.match(js,/iconOnlyMediaButton\(get\('pipBtn'\)/);
 assert.match(js,/button\.replaceChildren\(\)/);
 assert.match(css,/#page-tv \.player-control-card \.output-controls :is\(#castBtn,#pipBtn\)/);
 assert.match(css,/\.web-svg-icon-only::before\{/);
 assert.ok(!js.includes('cloneNode('));
 assert.ok(!js.includes('replaceWith('));
 assert.doesNotThrow(()=>new Function(js));
});
