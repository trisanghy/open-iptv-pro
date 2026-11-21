'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Tất cả selected chip follows the active theme rather than bright playback green',()=>{
 const css=read('renderer/web-channel-chooser-v42371.css');
 assert.match(css,/\.web-chooser-chip\.active\{background:color-mix\(in srgb,var\(--accent\) 12%,var\(--surface\)\)/);
 assert.match(css,/background:color-mix\(in srgb,var\(--accent\) 12%,var\(--surface\)\)!important/);
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

test('Light theme chooser inherits the app surface and restores sidebar once',()=>{
 const css=read('renderer/web-channel-chooser-v42371.css');
 const features=read('renderer/features.js');
 assert.match(css,/background:var\(--ui-card,var\(--surface\)\)/);
 assert.match(css,/color:var\(--text\)/);
 assert.doesNotMatch(css,/background:linear-gradient\(160deg,#0b1b2b,#07131e\)/);
 assert.match(features,/sidebarChooserLayoutRepairV1!==true/);
 assert.match(features,/config\.sidebarVisible=true/);
 assert.match(features,/config\.channelPanelVisible=true/);
});
