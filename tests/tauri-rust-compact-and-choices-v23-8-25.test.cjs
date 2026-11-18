'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('renderer/index.html'),css=read('renderer/rust-player-compact-v23-8-25.css');
const ui=read('renderer/electron-player-parity-v23-8-21.js');
function select(id){
 const start=html.indexOf('<select id="'+id+'"');
 assert.ok(start!==-1,'Missing '+id);
 return html.slice(start,html.indexOf('</select>',start));
}
test('All three settings are dropdowns with exactly the integer options 1–32',()=>{
 for(const id of ['checkConcurrencyChoice','snapshotConcurrencyChoice','replayMinutesChoice']){
  const s=select(id);
  const options=[...s.matchAll(/<option value="(\d+)">(\d+)<\/option>/g)];
  assert.equal(options.length,32,id);
  assert.deepEqual(options.map(v=>Number(v[1])),Array.from({length:32},(_,i)=>i+1),id);
  assert.ok(options.every(x=>x[1]===x[2]));
  assert.ok(!html.includes('type="radio" name="'+id+'"'));
 }
});
test('Check and Snapshot settings persist and selected link concurrency is respected',()=>{
 const app=read('renderer/app.js');
 assert.ok(app.includes("const choice=$('#'+choiceName)"));
 assert.ok(app.includes("choice?.addEventListener('change'"));
 assert.ok(app.includes('store[key]=n;controls.forEach(control=>{control.value=String(n);});'));
 assert.ok(app.includes('const concurrency=Math.min(32,safeConcurrency(store.checkConcurrency),all.length);'));
 assert.ok(app.includes('const workers=Math.min(safeConcurrency(store.snapshotConcurrency),pending.length);'));
});
test('Replay dropdown persists minutes, and Rust FFmpeg uses its actual configured duration',()=>{
 const adv=read('renderer/advanced.js'),native=read('src-tauri/src/recordings.rs');
 assert.ok(adv.includes("const replayChoice=$('#replayMinutesChoice');"));
 assert.ok(adv.includes("replayChoice?.addEventListener('change'"));
 assert.ok(adv.includes('state.replayMinutes=n;save();syncReplayUI();'));
 assert.ok(adv.includes('value>=1&&value<=32?value:10'));
 assert.ok(adv.includes('window.streamleaf.startTimeshift(ch.url,replayMinutes())'));
 assert.ok(native.includes('if !(1..=32).contains(&minutes)'));
 assert.ok(native.includes('&(minutes*12).to_string()'));
});
test('Compact layout keeps original switches, TTS controls and status in dedicated footer rows',()=>{
 for(const v of ['caption-ai-footer','caption-tts-footer','aiFooter.append(menu)','speechFooter.append(speechStatus)'])
  assert.ok(ui.includes(v),v);
 for(const v of ['#liveCaptionStatus','#liveTtsStatus','#liveTtsLanguage','#liveTtsVoice',
  '#liveTtsSpeed','#liveTtsDuck','.caption-tts-main','.caption-ai-footer',
  '.caption-tts-footer','grid-template-columns:max-content minmax(105px,145px)'])
  assert.ok(css.includes(v),v);
 assert.ok(css.includes('@container (max-width:990px)'));
 assert.ok(css.includes('@container (max-width:540px)'));
 for(const id of ['liveCaptionToggle','liveTranslateToggle','liveTtsToggle',
  'liveTtsLanguage','liveTtsVoice','liveTtsSpeed','liveTtsDuck'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
});
test('PiP, Live Caption, TTS and persistent settings remain available',()=>{
 const pip=read('renderer/auto-pip-v42363.js');
 assert.ok(pip.includes('video.requestPictureInPicture()'));
 assert.ok(read('renderer/live-captions-v42343.js').includes('liveCaptionToggle'));
 assert.ok(read('renderer/local-tts-v42344.js').includes('liveTtsToggle'));
 assert.ok(read('renderer/rust-ai-preferences-v23-8-4.js').includes('localStorage'));
});
test('Mac builder targets an immutable tag and one app only',()=>{
 const pkg=JSON.parse(read('package.json')),shell=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const release=pkg.version.split('-tauri.')[1];
 assert.ok(shell.includes('TAG="rust-lab/v'+release+'"'));
 assert.ok(shell.includes('npm run build -- --bundles app'));
});
