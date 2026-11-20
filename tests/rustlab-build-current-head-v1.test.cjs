'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('Mac builder fetches current Rust Lab HEAD and one app, not stale release tag',()=>{
 const sh=fs.readFileSync(path.join(root,'scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh'),'utf8');
 assert.match(sh,/SOURCE_REF="refs\/heads\/\$\{BRANCH\}"/);
 assert.match(sh,/archive\/\$\{SOURCE_REF\}\.zip/);
 assert.doesNotMatch(sh,/archive\/refs\/tags/);
 assert.match(sh,/unified-ai-inline-v1\.js/);
 assert.match(sh,/OUTPUT_COUNT/);
 assert.match(sh,/OpenIPTVPro_RustLab_Build/);
});
test('Rust inline CC waits for all async renderer modules',()=>{
 const entry=fs.readFileSync(path.join(root,'renderer/app-entry.js'),'utf8');
 const ui=fs.readFileSync(path.join(root,'renderer/unified-ai-inline-v1.js'),'utf8');
 assert.match(entry,/dispatchEvent\(new Event\('openiptv:renderer-ready'\)\)/);
 assert.match(ui,/addEventListener\('openiptv:renderer-ready', initialize/);
});
