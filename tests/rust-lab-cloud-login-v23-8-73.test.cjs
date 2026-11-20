'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Rust Lab v23.8.73 retains isolated Cloud account UI in tagged source',()=>{
 assert.equal(require('../package.json').version,'4.23.17-tauri.23.8.73');
 const lock=JSON.parse(read('package-lock.json'));
 assert.equal(lock.version,'4.23.17-tauri.23.8.73');
 assert.equal(lock.packages[''].version,'4.23.17-tauri.23.8.73');
 assert.match(read('renderer/index.html'),/cloud-portable\.css/);
 assert.match(read('renderer/index.html'),/Rust Lab v23\.8\.73/);
 assert.match(read('renderer/cloud-portable.js'),/class="oc-head"/);
 assert.match(read('renderer/cloud-portable.css'),/caret-color:var\(--accent/);
 assert.match(read('renderer/cloud-portable.css'),/font-size:16px/);
 assert.match(read('RELEASE_NOTES_RUST_LAB_V23_8_73.md'),/Supabase/);
});
