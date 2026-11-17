'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('renderer/index.html'),js=read('renderer/electron-player-parity-v23-8-21.js'),css=read('renderer/electron-player-parity-v23-8-21.css'),app=read('renderer/app.js');
test('All original controls preserved and layout follows Electron player',()=>{
 for(const id of ['volume','shotBtn','epgCurrent','openGuideBtn','manualLinkControl','manualLinkSelect','videoFit','favCurrentBtn','playBtn','pipBtn','castBtn','fullscreenBtn','liveCaptionToggle','liveTranslateToggle','liveTtsToggle'])
  assert.ok(html.includes('id="'+id+'"'),id);
 for(const x of ['top.append(master)','epg.append(guide)','body.append(shot)','voice.before(label)','duck.textContent=','ai.append(menu)'])
  assert.ok(js.includes(x),x);
 assert.ok(css.includes('.ipvp-main-row')&&css.includes('.electron-parity-volume')&&css.includes('.ipvp-programs .ipvp-program'));
});
test('Sources are displayed and selectable with even one live URL',()=>{
 assert.ok(app.includes("if(!items.length){control.classList.add"));
 assert.ok(app.includes("$('#manualLinkSelect')?.addEventListener('change'"));
});
test('Real FFmpeg, volume, EPG and snapshot handlers remain connected',()=>{
 assert.ok(app.includes('async function tryFfmpegManually()'));
 assert.ok(app.includes('window.streamleaf.compatStart(original)'));
 assert.ok(app.includes('await tryPlayback(session.url,generation,{compat:true})'));
 assert.ok(app.includes('tryFfmpegManually,tryNextLink:'));
 assert.ok(js.includes('win.IPTVState.tryFfmpegManually()'));
 assert.ok(app.includes("bind(['shotBtn']"));
 assert.ok(app.includes("$('#volume').addEventListener('input'"));
 assert.ok(read('renderer/features.js').includes("$('#openGuideBtn').addEventListener('click'"));
 assert.ok(read('renderer/auto-pip-v42363.js').includes('video.requestPictureInPicture()'));
});
test('Single-app builder and immutable release tag match',()=>{
 const pkg=JSON.parse(read('package.json')),sh=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.equal(pkg.version,'4.23.17-tauri.23.8.21');
 assert.ok(sh.includes('TAG="rust-lab/v23.8.21"'));
 assert.ok(sh.includes('npm run build -- --bundles app'));
});
