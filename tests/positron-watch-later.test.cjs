'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const fav=require('../renderer/favorites-core.js');
globalThis.OpenIPTVFavorites=fav;
const later=require('../renderer/positron-watch-later-core.js');
const C=(sourceId,id,name,url='https://example.invalid/live.m3u8',status='alive')=>({sourceId,id,name,url,status});
test('Watch Later stores only scoped fingerprints, normalized channel names and timestamps',()=>{
 const channel=C('private-source','a','VTV1 HD','https://user:secret@example.invalid/live.m3u8?token=PRIVATE');
 const x=later.toggle([],channel,'2026-11-21T13:00:00Z');
 assert.equal(x.ok,true);assert.equal(x.saved,true);assert.equal(later.has(x.rows,channel),true);
 const json=JSON.stringify(x.rows);
 assert.ok(!json.includes('private-source')&&!json.includes('https:')&&!json.includes('PRIVATE')&&!json.includes('secret'));
 assert.deepEqual(Object.keys(x.rows[0]).sort(),['key','savedAt','source']);
 assert.equal(later.visible(x.rows,[channel]).length,1);
});
test('Watch Later survives URL/id refresh but never leaks to another source with same name',()=>{
 const a=C('private-source','old','VTV1 HD');
 const b=C('private-source','new','VTV1 FHD','https://example.invalid/refreshed');
 const wrong=C('other-source','x','VTV1','https://example.invalid/other');
 const rows=later.toggle([],a).rows;
 assert.deepEqual(later.visible(rows,[b,wrong]).map(x=>x.id),['new']);
 assert.equal(later.has(rows,wrong),false);
 assert.equal(later.visible(rows,[wrong]).length,0);
 assert.equal(later.visible(rows,[{...b,status:'dead'}]).length,0);
 const removed=later.toggle(rows,b);
 assert.equal(removed.saved,false);assert.equal(removed.rows.length,0);
 assert.equal(later.has(rows,a),true,'prior immutable state must not be mutated');
});
test('Watch Later malformed entries and URL-based identities fail closed, with bounded storage',()=>{
 const urlOnly=C('src','id','a','https://very.private.invalid/stream?token=yes');
 assert.equal(later.identity(urlOnly),null,'one-letter channel name must not persist a URL fallback');
 const item=later.toggle([],{...urlOnly,name:'Television'});
 assert.equal(item.ok,true);
 const untrusted=[...item.rows,{source:'https://evil.invalid',key:'url:secret'},{source:'11111111',key:'url:supersecret'},{source:'12345678',key:'<script>alert(1)</script>'}];
 assert.deepEqual(later.compact(untrusted),item.rows);
 const many=Array.from({length:100},(_,i)=>C('source',String(i),'Channel '+String(i)));
 let rows=[];for(const ch of many)rows=later.toggle(rows,ch).rows;
 assert.equal(rows.length,later.LIMIT);
 assert.equal(later.visible(rows,many,100).length,later.LIMIT);
});
test('Watch Later uses native channel actions without networking or automatic playback',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const html=fs.readFileSync('renderer/index.html','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(html.indexOf('positron-watch-later-core.js')<html.indexOf('positron-watchflow-next.js'));
 assert.ok(ui.includes('watchLater.toggle(saved,channel)'));
 assert.ok(ui.includes('window.localStorage.setItem(watchLater.STORAGE_KEY'));
 assert.ok(ui.includes("if(view==='continue')render();"));
 assert.ok(ui.includes("heading('Để xem sau · '+waitingAll.length"));
 assert.ok(ui.includes("save.setAttribute('aria-pressed',String(isSaved))"));
 assert.ok(!/fetch\s*\(|XMLHttpRequest|importSource\s*\(/.test(ui));
 assert.ok(qa.includes('positron-p5196-watch-later-552-real.png'));
});

test('Watch Later Electron QA covers unobstructed Xem AND Luu controls',()=>{
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(qa.includes('playActions.length===5&&saveActions.length===5&&actions.every(a=>!overlaps(a))'));
 assert.ok(qa.includes('positron-p5195-watchflow-inline-scroll-cue-552-real.png'));
});

// P5.1.97: prevent silently hiding saved entries beyond position 8.
test('Watch Later exposes bookmark 9-80 via accessible batches',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const channels=Array.from({length:12},(_,i)=>C('main-source','channel'+i,'QA Channel '+String(i).padStart(3,'0')));
 let rows=[];for(const ch of channels)rows=later.toggle(rows,ch).rows;
 assert.equal(later.visible(rows,channels,later.LIMIT).length,12);
 assert.ok(ui.includes('watchLater?.visible(saved,collection,watchLater.LIMIT)'));
 assert.ok(ui.includes('watchLaterShown=Math.min(watchLater.LIMIT,watchLaterShown+8)'));
 assert.ok(ui.includes("more.id='poWatchLaterMore'"));
 assert.ok(css.includes('#poWatchLaterMore.po-flowplus-more'));
 assert.ok(qa.includes('positron-p5197-watch-later-many-552-real.png'));
 assert.ok(qa.includes('manySavedQA[key],true'));
});

test('P5.1.100 WatchFlow keeps close and mode navigation visible after saved-list scrolling',()=>{
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(css.includes('#poWatchFlowPanel.po-watchflow-panel .po-watchflow-head'));
 assert.ok(css.includes('#poWatchFlowPanel.po-watchflow-panel .po-flowplus-nav'));
 assert.ok(css.includes('position:sticky!important'));
 assert.ok(qa.includes('stickyWatchLaterQA[key],true'));
 assert.ok(qa.includes('stickyWatchLaterClose,true'));
 assert.ok(qa.includes('positron-p51100-watch-later-sticky-552-real.png'));
});

test('P5.1.101 search resolves only saved channels by accent-free title and group',()=>{
 const channels=[
  {...C('qa','a','Truyền hình Đà Nẵng HD'),group:'Tin tức'},
  {...C('qa','b','VTV2'),group:'Khoa học'},
  {...C('qa','c','Không lưu'),group:'Giải trí'}
 ];
 let rows=[];for(const ch of channels.slice(0,2))rows=later.toggle(rows,ch).rows;
 assert.equal(later.search(rows,channels,'da nang').length,1);
 assert.equal(later.search(rows,channels,'da nang')[0].id,'a');
 assert.equal(later.search(rows,channels,'khoa hoc')[0].id,'b');
 assert.equal(later.search(rows,channels,'khong luu').length,0);
 assert.equal(later.search(rows,channels,'example.invalid').length,0);
 assert.equal(later.search(rows,channels,'').length,2);
});
test('P5.1.101 local saved search is accessible and covered by native Electron QA',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes("savedInput.id='poWatchLaterSearch'"));
 assert.ok(ui.includes('watchLater?.search(saved,collection,savedQuery,watchLater.LIMIT)'));
 assert.ok(css.includes('#poWatchFlowPanel #poWatchLaterSearch'));
 assert.ok(qa.includes('positron-p51101-watch-later-search-552-real.png'));
});

test('P5.1.102 multi-term Watch Later searches saved title and group without dropping HD/4K',()=>{
 const channels=[
  {...C('private-qa','a','Truyền hình Đà Nẵng HD','https://secret.invalid/stream?token=abc'),group:'Tin tức'},
  {...C('private-qa','b','VTV2 4K'),group:'Khoa học'},
  {...C('private-qa','c','Chưa lưu'),group:'Tin tức'}
 ];
 let saved=[];
 for(const ch of channels.slice(0,2))saved=later.toggle(saved,ch).rows;
 assert.deepEqual(later.search(saved,channels,'nang tin').map(c=>c.id),['a']);
 assert.deepEqual(later.search(saved,channels,'hoc vtv2').map(c=>c.id),['b']);
 assert.deepEqual(later.search(saved,channels,'hD').map(c=>c.id),['a']);
 assert.deepEqual(later.search(saved,channels,'4k').map(c=>c.id),['b']);
 assert.equal(later.search(saved,channels,'@!?').length,0,'punctuation cannot match all saved entries');
 assert.equal(later.search(saved,channels,'secret.invalid').length,0,'never search the stream URL');
 assert.equal(later.search(saved,channels,'chua luu').length,0,'unsaved channels must stay hidden');
 assert.equal(later.search(saved,channels,' ').length,2);
});
test('P5.1.102 native Electron captures a multi-word search with unchanged local bookmarks',()=>{
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const flow=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 assert.ok(qa.includes('positron-p51102-watch-later-multiterm-552-real.png'));
 assert.ok(qa.includes("input.value='main 001'"));
 assert.ok(flow.includes('positron-p51102-watch-later-multiterm-552-real.png'));
});
