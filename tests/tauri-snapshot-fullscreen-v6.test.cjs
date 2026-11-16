'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const renderer=path.join(__dirname,'..','renderer');
const policy=require(path.join(renderer,'snapshot-freshness.js'));
const app=fs.readFileSync(path.join(renderer,'app.js'),'utf8');
const html=fs.readFileSync(path.join(renderer,'index.html'),'utf8');
const UX=fs.readFileSync(path.join(renderer,'fullscreen-panels.js'),'utf8');
const bridge=fs.readFileSync(path.join(renderer,'tauri-bridge.js'),'utf8');
const rust=fs.readFileSync(path.join(__dirname,'..','src-tauri','src','bridge.rs'),'utf8');
const now=new Date(2026,10,13,8,0,0).getTime();
const image={file:'old_1.jpg',capturedAt:now-6*60*60*1000};

test('Six-hour boundary refreshes exact-age snapshots, not fresh images',()=>{
 assert.equal(policy.isStale({...image,capturedAt:now-6*60*60*1000+1},now),false);
 assert.equal(policy.isStale(image,now),true);
 assert.equal(policy.isStale({...image,capturedAt:now-60*60*1000},now),false);
 assert.equal(policy.isStale({file:'x.jpg'},now),true);
 assert.equal(policy.isStale({date:'2020-01-01'},now),false); // no image
});
test('Historic VI locale snapshot metadata is parsed instead of treated as fresh forever',()=>{
 const time=new Date(2026,10,12,21,33,0).getTime();
 assert.equal(policy.capturedTime({date:'21:33:00 12/11/2026'}),time);
 assert.equal(policy.capturedTime({date:'12/11/2026, 21:33:00'}),time);
 assert.equal(policy.isStale({file:'x.jpg',date:'12/11/2026, 21:33:00'},now),true);
});
test('Failed refresh retains old frame and backs off for 30 minutes',()=>{
 assert.equal(policy.eligible({...image,lastAttemptAt:now-1000},now),false);
 assert.equal(policy.eligible({...image,lastAttemptAt:now-30*60*1000},now),true);
 assert.equal(policy.eligible({capturedAt:0},now),false);
});
test('Batch capture patches only changed snapshot nodes without rebuilding entire gallery',()=>{
 assert.match(app,/function patchSnapshotView\(/);
 assert.match(app,/function swapSnapshotImage\(/);
 const s=app.slice(app.indexOf('async function snapshotAll()'),app.indexOf('async function exportFile()'));
 assert.doesNotMatch(s,/renderShots\(/);
 assert.doesNotMatch(s,/renderList\(/);
 assert.match(s,/snapshotOne\(c,true\)/);
 assert.match(app,/incoming\.onload/);
 assert.match(app,/MAX_AGE_MS|shotPolicy\.eligible/);
});
test('Refresh is bounded, retains snapshots, and does not run over fullscreen video',()=>{
 assert.match(app,/if\(isTauri\)\{setTimeout\(\(\)=>void refreshStaleSnapshots/);
 assert.match(app,/document\.fullscreenElement\)return/);
 assert.match(app,/if\(stale.length>=18\)break/);
 assert.match(app,/Math\.min\(!player\.paused\?1:2,stale\.length\)/);
 assert.match(app,/shot\.lastAttemptAt=Date\.now\(\)/);
});
test('Fullscreen controls expose EPG, DVR, close button and use existing APIs',()=>{
 for(const id of ['fsEPG','fsDVR','fsDrawer','fsDrawerClose','fsDrawerContent'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(UX,/IPTVGuide\?\.find/);
 assert.match(UX,/IPTVDVR\.scheduleFromEPG/);
 assert.match(UX,/streamleaf\.dvrList/);
 assert.match(UX,/document\.fullscreenElement!==box/);
 assert.match(UX,/textContent=String\(txt\)/); // HTML injection never uses untrusted titles
});
test('Rust deletes only retired UUID-named JPEGs after JS has flushed its storage',()=>{
 assert.match(bridge,/snapshotDelete: 'snapshot:delete'/);
 assert.match(rust,/"snapshot:delete"=>remove_retired_snapshot/);
 assert.match(rust,/uuid\.len\(\)!=32/);
 assert.match(app,/await window\.IPTVPrimaryPersistence\?\.flush/);
 assert.match(app,/Object\.values\(store\.snapshots\)\.some/);
});
