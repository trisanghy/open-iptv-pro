'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Both original and translated text wrap without 1-line ellipsis or clamping',()=>{
 const css=read('renderer/rust-subtitle-controls-v23-8-5.css');
 assert.ok(css.includes('display:block!important;flex:0 0 auto'));
 assert.ok(css.includes('width:100%;min-width:0;max-width:100%'));
 assert.ok(css.includes('white-space:pre-line!important;overflow-wrap:anywhere!important'));
 assert.ok(css.includes('-webkit-line-clamp:unset!important'));
 assert.ok(css.includes('text-overflow:clip!important'));
 assert.ok(!css.includes('-webkit-line-clamp:2'));
 assert.ok(!css.includes('max-height:min(34%,210px)'));
});
test('Full caption is assigned to text nodes without fixed character truncation',()=>{
 const js=read('renderer/rust-subtitle-controls-v23-8-5.js');
 assert.ok(js.includes("orig.textContent=showOriginal?original:''"));
 assert.ok(js.includes("trans.textContent=showTranslated?result:''"));
 assert.ok(!js.includes('original.slice(0,500)'));
 assert.ok(!js.includes('result.slice(0,500)'));
});
test('Auto-fit only reduces visual size if wrapped subtitle exceeds video height',()=>{
 const js=read('renderer/rust-subtitle-controls-v23-8-5.js');
 for(const piece of ['function fitSubtitle()','frame.clientHeight',
  'overlay.scrollHeight>available+1','overlay.scrollWidth>overlay.clientWidth+1',
  "overlay.style.setProperty('font-size',size+'px','important')",
  "overlay.style.setProperty('overflow-y',overflow?'auto':'visible','important')",
  "window.requestAnimationFrame(apply)","video.addEventListener('resize'",
  "document.addEventListener('fullscreenchange'"])
  assert.ok(js.includes(piece),piece);
 assert.ok(js.includes("if(!overlay.hidden)fitSubtitle()"));
 const key='rustlab:subtitle-display-v1';
 assert.ok(js.includes(key),'CC preferences still persisted');
});
test('Version, build tag and original PiP remain unchanged in behavior',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const release=pkg.version.split('-tauri.')[1];
 const shell=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.ok(shell.includes('TAG="rust-lab/v'+release+'"'));
 assert.ok(shell.includes('npm run build -- --bundles app'));
 assert.ok(read('renderer/auto-pip-v42363.js').includes('video.requestPictureInPicture()'));
});
