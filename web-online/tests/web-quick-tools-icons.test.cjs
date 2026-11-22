'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Quick Tools exposes only scan, all-channel snapshot and playlist export',()=>{
 const html=read('index.html');
 const quick=html.match(/<details class="compact-tools" id="quickTools">([\s\S]*?)<\/details>/)?.[1];
 assert.ok(quick,'Quick Tools section exists');
 const ids=[...quick.matchAll(/class="quick-btn" id="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(ids,['quickChecks','quickShots','quickExport']);
 assert.doesNotMatch(quick,/quickShotCurrent|Chụp kênh đang xem/);
 assert.match(quick,/Chụp toàn bộ kênh/);
 assert.match(quick,/Xuất playlist/);
 // The separate Snapshot page and single-channel capture API remain present.
 assert.match(html,/id="shotBtn"/);
 assert.match(read('app.js'),/snapshotOne\(ch\)/);
});
test('Web builder removes redundant action without altering snapshot logic',()=>{
 const builder=read('web-online/prepare-web.py');
 assert.match(builder,/html=html\.replace\(quick_shot_current,'',1\)/);
 assert.match(builder,/quick_shot_current/);
 assert.match(builder,/quick-icons-unified-20261119b/);
 assert.doesNotMatch(builder,/snapshotOne\s*=\s*null/);
});
test('Quick Tool SVG colors use one accent and not separate snapshot-only colors',()=>{
 const css=read('web-player-icons.css');
 const rule=css.match(/#page-tv #quickTools \.quick-grid :is\(#quickChecks,#quickShots,#quickExport\)::before\s*\{([^}]+)\}/)?.[1];
 assert.ok(rule,'unified icon color rule exists');
 assert.match(rule,/color:var\(--accent,#b980ed\)!important/);
 assert.match(css,/--ipc-icon:var\(--ipc-grid\)/);
 assert.match(css,/--ipc-icon:var\(--ipc-download\)/);
});
test('Inactive mobile tabs share blue icons and the active tab keeps accent color',()=>{
 const css=read('web-mobile-controls-polish.css');
 assert.match(css,/:not\(\.active\)>\.macos-nav-symbol\s*\{\s*color:#95baf2!important/);
 assert.match(css,/\.active>\.macos-nav-symbol\s*\{\s*color:var\(--accent,#b980ed\)!important/);
 assert.match(css,/grid-template-rows:27px 16px!important/);
});
test('Production HTML requests versioned CSS to avoid stale mobile icons',()=>{
 const html=read('index.html');
 assert.match(html,/web-player-icons\.css\?v=single-icon-first-paint-20261119a/);
 assert.match(html,/web-mobile-controls-polish\.css\?v=quick-icons-unified-20261119b/);
});
