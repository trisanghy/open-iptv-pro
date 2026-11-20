'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('electron beta v4.23.72 matches native Supabase login UI and release files',()=>{
 assert.equal(require('../package.json').version,'4.23.72');
 const workflow=read('.github/workflows/publish-electron-v42372.yml');
 assert.match(workflow,/TAG=electron-v4\.23\.72/);
 assert.match(workflow,/Open-IPTV-Pro-4\.23\.72-mac-arm64\.dmg/);
 assert.match(read('renderer/index.html'),/cloud-portable\.css/);
 assert.match(read('renderer/cloud-portable.js'),/class="oc-head"/);
 assert.match(read('renderer/cloud-portable.css'),/caret-color:var\(--accent/);
 assert.match(read('RELEASE_NOTES_ELECTRON_V4_23_72.md'),/Supabase/);
});
