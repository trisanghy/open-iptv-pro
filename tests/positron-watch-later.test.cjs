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

test('P5.1.103 refuses bookmark 81 instead of silently evicting bookmark 1',()=>{
 const channels=Array.from({length:81},(_,i)=>C('local-qa','id-'+i,'QA Channel '+String(i+1).padStart(3,'0')));
 let rows=[];
 for(const channel of channels.slice(0,80)){
  const result=later.toggle(rows,channel);
  assert.equal(result.ok,true);
  rows=result.rows;
 }
 const snapshot=JSON.stringify(rows),blocked=later.toggle(rows,channels[80]);
 assert.equal(rows.length,80);
 assert.equal(blocked.ok,false);assert.equal(blocked.reason,'full');assert.equal(blocked.saved,false);
 assert.equal(JSON.stringify(blocked.rows),snapshot,'original 80 bookmarks must not change');
 assert.equal(later.has(blocked.rows,channels[0]),true,'oldest bookmark must not be evicted');
 assert.equal(later.has(blocked.rows,channels[80]),false);
 const removed=later.toggle(rows,channels[0]);
 assert.equal(removed.ok,true);assert.equal(removed.saved,false);
 const added=later.toggle(removed.rows,channels[80]);
 assert.equal(added.ok,true);assert.equal(added.saved,true);assert.equal(added.rows.length,80);
 assert.equal(later.has(added.rows,channels[80]),true);
});
test('P5.1.103 warns about a full local list and verifies native non-destructive capture',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const flow=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 assert.ok(ui.includes("if(change.reason==='full')state()?.toast?."),'full limit should be visible to users');
 assert.ok(ui.includes('Đã đạt giới hạn 80 kênh'));
 assert.ok(qa.includes('positron-p51103-watchlater-cap-before-real.png'));
 assert.ok(qa.includes('positron-p51103-watchlater-cap-after-real.png'));
 assert.ok(flow.includes('positron-p51103-watchlater-cap-after-real.png'));
});

test('P5.1.104 unavailable bookmark count is source-isolated and non-destructive',()=>{
 const okay=C('src-A','a','VTV1 HD'),broken=C('src-A','b','VTV2','https://invalid.example/stream','dead');
 const missing=C('unmounted-source','c','Unloaded Sports');
 const noUrl=C('src-A','d','VTV3','');
 let rows=[];
 for(const ch of [okay,broken,missing,noUrl])rows=later.toggle(rows,ch).rows;
 const frozen=JSON.stringify(rows);
 assert.equal(later.unavailable(rows,[okay,broken,noUrl]),3);
 assert.equal(later.visible(rows,[okay,broken,noUrl],later.LIMIT).length,1);
 assert.equal(later.unavailable(rows,[okay,{...broken,status:'alive'},noUrl]),2);
 assert.equal(later.unavailable(rows,[okay,{...broken,status:'alive'},{...noUrl,url:'https://valid.invalid/test'},missing]),0);
 assert.equal(JSON.stringify(rows),frozen,'checking availability must never mutate bookmarks');
 assert.equal(frozen.includes('invalid.example'),false,'never store source URL');
 assert.equal(later.unavailable(rows,[{...okay,sourceId:'wrong-source'}]),4,'same channel name from another source cannot masquerade as available');
});
test('P5.1.104 native unavailable bookmark notice retains local data and no autoplay',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const flow=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 assert.ok(ui.includes('notice.id=\'poWatchLaterUnavailable\''));
 assert.ok(ui.includes('watchLater?.unavailable?.(saved,collection)'));
 assert.ok(qa.includes('positron-p51104-watchlater-unavailable-552-real.png'));
 assert.ok(flow.includes('positron-p51104-watchlater-unavailable-552-real.png'));
});

test('P5.1.105 manual stale-bookmark removal preserves active bookmarks and checks current availability',()=>{
 const available=C('main','a','VTV1'),missing=C('removed','b','Offline Archive');
 let rows=later.toggle([],available).rows;rows=later.toggle(rows,missing).rows;
 assert.equal(later.unavailableEntries(rows,[available]).length,1);
 const dormant=later.unavailableEntries(rows,[available])[0];
 assert.equal(dormant.key,later.identity(missing).key,'dormant bookmark must preserve the native opaque identity');
 const snapshot=JSON.stringify(rows);
 const reject=later.removeUnavailable(rows,[available,missing],dormant);
 assert.equal(reject.ok,false,'restored sources cannot be removed via stale flow');
 assert.equal(JSON.stringify(reject.rows),snapshot);
 const cleared=later.removeUnavailable(rows,[available],dormant);
 assert.equal(cleared.ok,true);
 assert.equal(cleared.rows.length,1);
 assert.equal(later.has(cleared.rows,available),true);
 assert.equal(later.has(cleared.rows,missing),false);
 assert.equal(JSON.stringify(rows),snapshot,'original state stays immutable');
 assert.equal(later.removeUnavailable(rows,[available],{source:'00000000',key:'name:fake'}).ok,false);
});
test('P5.1.105 native two-step stale management has before/after screenshots',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 const flow=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 assert.ok(ui.includes("manager.id='poWatchLaterDormantManager'"));
 assert.ok(ui.includes("remove.dataset.confirm!=='yes'"));
 assert.ok(ui.includes('watchLater.removeUnavailable(saved,channels(),entry)'));
 assert.ok(qa.includes('positron-p51105-dormant-manage-before-real.png'));
 assert.ok(qa.includes('positron-p51105-dormant-manage-after-real.png'));
 assert.ok(flow.includes('positron-p51105-dormant-manage-after-real.png'));
});
