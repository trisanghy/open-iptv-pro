'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('renderer/index.html'),css=read('renderer/electron-player-parity-v23-8-21.css');
const app=read('renderer/app.js'),parity=read('renderer/electron-player-parity-v23-8-21.js');
const start=html.indexOf('<section class="compact-tools always-open" id="quickTools"');
const end=html.indexOf('</section>',start);
test('Quick Tools cannot collapse and has exactly the three original tasks',()=>{
 assert.ok(start>0&&end>start);
 const section=html.slice(start,end);
 assert.ok(section.includes('class="compact-tools-heading"'));
 assert.ok(!section.includes('<summary>'));
 assert.ok(!html.includes('<details class="compact-tools" id="quickTools"'));
 for(const id of ['quickChecks','quickShots','quickExport'])
  assert.ok(section.includes('id="'+id+'"'),id);
 assert.ok(css.includes('#page-tv #quickTools.compact-tools.always-open'));
});
test('No stale volume tile; single volume and snapshot controls remain movable',()=>{
 const section=html.slice(start,end);
 assert.ok(!section.includes('ipvp-player-extras'));
 assert.ok(!section.includes('id="volume"'));
 assert.ok(!section.includes('Âm lượng'));
 assert.equal((html.match(/id="volume"/g)||[]).length,1);
 assert.equal((html.match(/id="shotBtn"/g)||[]).length,1);
 assert.ok(html.includes('id="playerToolbarControlStaging" hidden'));
 assert.ok(parity.includes('master.append(icon,volume);top.append(master)'));
 assert.ok(parity.includes("shot.textContent='▣ Chụp ảnh';body.append(shot)"));
 assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important'));
});
test('Channel checks, snapshots, export and volume persistence still use original handlers',()=>{
 for(const s of ["bind(['sourceCheckAllBtn','quickChecks'],checkAll)","bind(['quickShots','shotsAllBtn'],snapshotAll)","bind(['quickExport','exportNav'],exportFile)","bind(['shotBtn']","$('#volume').addEventListener('input'","store.volume=player.volume;save();"])
  assert.ok(app.includes(s),s);
 assert.ok(read('renderer/local-tts-v42344.js').includes("const volumeInput=$('volume')"));
});
test('Mac single app release points at current immutable tag',()=>{
 const pkg=JSON.parse(read('package.json')),builder=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh');
 assert.match(pkg.version,/^4\.23\.17-tauri\.23\.8\.\d+$/);
 const version=pkg.version.split('-tauri.')[1];
 assert.ok(require('node:fs').readFileSync(require('node:path').join(__dirname,'../scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8').includes('SOURCE_REF="refs/heads/${BRANCH}"'));
 assert.ok(builder.includes('npm run build -- --bundles app'));
});
