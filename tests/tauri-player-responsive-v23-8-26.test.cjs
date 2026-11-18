'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const css=read('renderer/rust-player-responsive-v23-8-26.css');
const ui=read('renderer/electron-player-parity-v23-8-21.js');
const html=read('renderer/index.html');
const {classifyWidth}=require('../renderer/electron-player-parity-v23-8-21.js');
test('Layout uses player-card width instead of full Mac window width',()=>{
 assert.equal(classifyWidth(1200),'wide');
 assert.equal(classifyWidth(800),'compact');
 assert.equal(classifyWidth(600),'narrow');
 assert.equal(classifyWidth(420),'tiny');
 assert.ok(ui.includes("card.getBoundingClientRect?.().width||card.clientWidth||1200"));
 assert.ok(ui.includes('new win.ResizeObserver(adaptPlayerWidth)'));
 assert.ok(ui.includes("cast.setAttribute('aria-label','Cast / AirPlay lên TV')"));
});
test('Player keeps unique real controls and has explicit compact grid rows',()=>{
 for(const v of ['@container (max-width:1020px)','@container (max-width:720px)',
 '@container (max-width:450px)','.ipvp-transport','.ipvp-cast',
 '.electron-parity-volume','grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important'])
  assert.ok(css.includes(v),v);
 for(const id of ['prevBtn','playBtn','stopBtn','nextBtn','volume','castBtn','pipBtn','fullscreenBtn'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
});
test('EPG, source, fit and favorite move into explicit nonoverlapping tracks',()=>{
 for(const v of ['.ipvp-programs.epg-current-card','.ipvp-options .view-mode',
 '.ipvp-options #manualLinkControl','.ipvp-options #favCurrentBtn',
 'grid-column:1/-1!important;grid-row:1!important'])
  assert.ok(css.includes(v),v);
 for(const id of ['epgCurrent','openGuideBtn','videoFit','manualLinkSelect','favCurrentBtn'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
});
test('TTS and CC have compact 6/4/2-column layouts with uncut status footer',()=>{
 for(const v of ['@container (max-width:1120px)','@container (max-width:685px)',
 '@container (max-width:455px)','.caption-ai-footer','.caption-tts-footer',
 '#liveTtsLanguage','#liveTtsVoice','#liveTtsSpeed','#liveTtsDuck'])
  assert.ok(css.includes(v),v);
 for(const id of ['liveCaptionToggle','liveTranslateToggle','liveTtsToggle','liveTtsLanguage',
 'liveTtsVoice','liveTtsSpeed','liveTtsDuck','liveTtsStatus'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
});
test('Quick Tools single row and 3 settings dropdowns 1–32 retained',()=>{
 assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important'));
 assert.ok(html.includes('<section class="compact-tools always-open" id="quickTools"'));
 for(const id of ['checkConcurrencyChoice','snapshotConcurrencyChoice','replayMinutesChoice']){
  const a=html.indexOf('<select id="'+id+'"');assert.ok(a>0);
  assert.equal((html.slice(a,html.indexOf('</select>',a)).match(/<option value="/g)||[]).length,32);
 }
});
test('Release targets one Mac .app and preserves original PiP',()=>{
 const pkg=JSON.parse(read('package.json')),sh=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 assert.ok(sh.includes('TAG="rust-lab/v'+pkg.version.split('-tauri.')[1]+'"'));
 assert.ok(sh.includes('npm run build -- --bundles app'));
 assert.ok(read('renderer/auto-pip-v42363.js').includes('video.requestPictureInPicture()'));
});
