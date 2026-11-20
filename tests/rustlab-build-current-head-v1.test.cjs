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


test('Mac builder clears all old and hidden entries only inside its dedicated folder',()=>{
 const {spawnSync}=require('node:child_process');
 const os=require('node:os');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'rustlab-output-cleanup-'));
 try{
  const downloads=path.join(tmp,'Downloads');
  const target=path.join(downloads,'OpenIPTVPro_RustLab_Build');
  fs.mkdirSync(path.join(target,'previous.app'),{recursive:true});
  fs.writeFileSync(path.join(target,'.DS_Store'),'Finder cache');
  fs.writeFileSync(path.join(target,'obsolete.zip'),'old build');
  fs.writeFileSync(path.join(downloads,'keep-me.txt'),'do not delete');
  const start=sh.indexOf('# Only the dedicated Rust Lab build folder may be emptied.');
  const end=sh.indexOf('FINAL_APP="$DEST/$(basename "$APP")"');
  assert.ok(start>=0&&end>start,'cleanup fragment must be present');
  const cleanup=sh.slice(start,end);
  const env={...process.env,HOME:tmp,DEST:target};
  const result=spawnSync('bash',['-c','set -Eeuo pipefail\nerr(){ echo "$*" >&2; exit 1; }\n'+cleanup],{env,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.deepEqual(fs.readdirSync(target),[]);
  assert.equal(fs.readFileSync(path.join(downloads,'keep-me.txt'),'utf8'),'do not delete');
  const outside=path.join(tmp,'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside,'untouched'),'keep');
  fs.rmdirSync(target);
  fs.symlinkSync(outside,target);
  const linked=spawnSync('bash',['-c','set -Eeuo pipefail\nerr(){ echo "$*" >&2; exit 1; }\n'+cleanup],{env,encoding:'utf8'});
  assert.notEqual(linked.status,0,'symlink destination must be rejected');
  assert.equal(fs.readFileSync(path.join(outside,'untouched'),'utf8'),'keep');
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
});
