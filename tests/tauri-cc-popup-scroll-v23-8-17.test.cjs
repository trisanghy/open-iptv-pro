'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const js=read('renderer/rust-subtitle-controls-v23-8-5.js');
const css=read('renderer/rust-subtitle-controls-v23-8-5.css');
test('CC popup is portalled outside the player overflow clipping and remains in fullscreen top layer',()=>{
 assert.ok(js.includes('document.body.append(panel);'));
 assert.ok(js.includes('document.fullscreenElement===frame'));
 assert.ok(js.includes('const parent=fullscreen?frame:document.body;'));
 assert.ok(js.includes('panel.parentElement!==parent'));
 assert.ok(js.includes("document.addEventListener('fullscreenchange'"));
 assert.ok(css.includes('#playerBox:fullscreen #rustSubtitleOptionsPanel'));
});
test('CC popup has isolated wheel/trackpad, touch, keyboard and visible scrollbars',()=>{
 assert.ok(css.includes('overflow-y:auto!important'));
 assert.ok(css.includes('overflow-x:hidden!important'));
 assert.ok(css.includes('overscroll-behavior:contain'));
 assert.ok(css.includes('touch-action:pan-y'));
 assert.ok(css.includes('-webkit-overflow-scrolling:touch'));
 assert.ok(css.includes('scrollbar-color:#8962ce'));
 assert.ok(js.includes("panel.addEventListener('wheel'"));
 assert.ok(js.includes('panel.scrollTop+=event.deltaY*factor'));
 assert.ok(js.includes('event.stopPropagation()'));
 assert.ok(js.includes('event.preventDefault()'));
 assert.ok(js.includes("panel.addEventListener('keydown'"));
 assert.ok(js.includes("event.key==='PageDown'"));
 assert.ok(js.includes("event.key==='End'"));
});
test('After moving to document.body, all popup selectors still apply outside #page-tv',()=>{
 for(const selector of ['#rustSubtitleOptionsPanel.rust-cc-panel:not([hidden])',
  '.rust-cc-panel>label','.rust-cc-panel .rust-cc-segmented',
  '#rustSubtitleOptionsPanel #rustSubtitleShow','#rustSubtitleOptionsPanel #rustSubtitleCustomColor'])
  assert.ok(css.includes(selector),selector);
 assert.ok(!css.includes('#page-tv #rustSubtitleOptionsPanel'));
 assert.ok(css.includes('position:sticky'));
});
test('Release and local Mac builder have matching immutable tag',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'4.23.17-tauri.23.8.17');
 const shell=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.ok(shell.includes('TAG="rust-lab/v23.8.17"'));
 assert.ok(shell.includes('npm run build -- --bundles app'));
 assert.ok(read('renderer/auto-pip-v42363.js').includes('video.requestPictureInPicture()'));
});
