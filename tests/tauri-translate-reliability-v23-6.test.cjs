'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('Rust translation list exactly matches Argos runtime language support',()=>{
 const rust=read('src-tauri/src/local_ai.rs'),router=read('src-tauri/resources/argos_direct_router.py');
 const matches=rust.match(/const TRANSLATION_TARGETS:\[&str;21\]=\[([^\]]+)\]/);
 assert.ok(matches,'21 language source catalog');
 const langs=[...matches[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]).sort();
 const py=router.match(/LANGS=\{([^}]+)\}/);
 const pyLangs=[...py[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]).sort();
 assert.deepEqual(langs,pyLangs);
});
test('Tauri uses a native direct-route probe and real translation self-test',()=>{
 const backend=read('src-tauri/src/local_ai.rs'),commands=read('src-tauri/src/bridge.rs'),shim=read('renderer/tauri-bridge.js');
 for(const term of ['translation_pair_status','translation_test','ai_storage_status','ai_remove_model','argos_direct_router_v23_6.py'])assert.ok(backend.includes(term));
 for(const op of ['caption:testTranslation','ai:storage','ai:removeModel'])assert.ok(commands.includes('"'+op+'"'));
 for(const api of ['captionTestTranslation','aiStorageStatus','aiRemoveModel'])assert.ok(shim.includes(api));
 assert.match(backend,/asset_bytes\(/);
 assert.match(backend,/symlink_metadata/);
});
test('Live Translate keeps intent after a failure and queues selection changes during startup',()=>{
 const ui=read('renderer/live-captions-v42343.js');
 for(const phrase of ["if(busy){queued=true;return;}","captionAutoInstall()","captionTranslationInstall(to,from)","e.type==='needs-model'","const auto=$('autoInstallTranslation')","setStatus('Không bật được: ","retry?.addEventListener"])assert.ok(ui.includes(phrase),phrase);
 assert.doesNotMatch(ui,/caption\.checked=false;translate\.checked=false;/);
});
test('Electron-like AI settings only offers working Argos and protects model removals',()=>{
 const html=read('renderer/index.html'),entry=read('renderer/app-entry.js'),ui=read('renderer/rust-ai-settings-v23-6.js'),css=read('renderer/rust-ai-settings-v23-6.css');
 for(const id of ['captionRetry','captionTestTranslate','liveCaptionSetupPanel'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(entry,/rust-ai-settings-v23-6\.js/);
 assert.match(html,/rust-ai-settings-v23-6\.css/);
 for(const id of ['rustTranslationEngine','autoInstallTranslation','rustAiStorageList'])assert.ok(ui.includes(id));
 assert.ok(ui.includes('disabled=disabled'));
 assert.ok(ui.includes('confirm!==id||Date.now()-confirmedAt>12000'));
 assert.match(css,/rust-ai-grid/);
});
test('Immutable v23.6 build, new notes and release workflow select matching notes',()=>{
 const pkg=JSON.parse(read('package.json')),script=read('scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),workflow=read('.github/workflows/rust-lab-version-tags.yml');
 assert.equal(pkg.version,'4.23.17-tauri.23.6');
 assert.ok(script.includes('TAG="rust-lab/v23.6"'));
 assert.ok(script.includes('VERSION="'+pkg.version+'"'));
 assert.match(script,/ACTUAL_VERSION=.*sed -nE/);
 assert.match(workflow,/body_path: dist\/RELEASE_NOTES_CURRENT\.md/);
 assert.match(workflow,/RELEASE_NOTES_RUST_LAB_V\$\{RELEASE_NO\/\/\.\/_\}\.md/);
 assert.match(workflow,/github\.sha/);
});
