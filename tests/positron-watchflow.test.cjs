'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const core=require('../renderer/positron-watchflow-core.js');
const now=Date.parse('2026-11-21T05:00:00.000Z');
const channels=[
 {id:'news-a',name:'VTV1 Thời sự',group:'Việt Nam',url:'https://test.invalid/a.m3u8',status:'alive',checkedAt:'2026-11-20T05:00:00.000Z'},
 {id:'news-b',name:'BBC News',group:'Tin tức',url:'https://test.invalid/b.m3u8',status:'uncertain'},
 {id:'sport-a',name:'Sports One',group:'Thể thao',url:'https://test.invalid/c.m3u8',status:'alive'},
 {id:'film-a',name:'Phim hay',group:'Giải trí',url:'https://test.invalid/d.m3u8',status:'dead'},
 {id:'bad',name:'No URL',group:'News',url:''}
];
test('WatchFlow recognizes Vietnamese genres and never invents channels',()=>{
 assert.equal(core.category(channels[0]),'news');
 assert.equal(core.category(channels[2]),'sport');
 assert.equal(core.category(channels[3]),'cinema');
 assert.equal(core.normalize('Thể Thao'),'the thao');
 const result=core.rank(channels,{mode:'news',now});
 assert.deepEqual(result.items.map(x=>x.id),['news-a','news-b']);
 assert.ok(result.items.every(x=>x.reason&&channels.some(c=>c.id===x.id)));
});
test('WatchFlow recommends proven live streams before unverified, excludes dead',()=>{
 const result=core.rank(channels,{mode:'all',now});
 assert.equal(result.items[0].id,'news-a');
 assert.ok(!result.items.some(x=>x.id==='film-a'||x.id==='bad'));
 assert.equal(result.available,3);
});
test('WatchFlow moves away from seen channel without persisting playlist data',()=>{
 const before=JSON.stringify(channels);
 const result=core.rank(channels,{mode:'news',seen:['news-a'],now});
 assert.equal(result.items[0].id,'news-b');
 assert.equal(result.unseen,1);
 assert.equal(JSON.stringify(channels),before,'ranking must not mutate native channels');
 const exhausted=core.rank(channels,{mode:'news',seen:['news-a','news-b'],now});
 assert.equal(exhausted.exhausted,true);
 assert.ok(exhausted.items.length>0,'cycle can restart when every channel was suggested');
});
test('WatchFlow makes no request and never pretends that missing EPG is known',()=>{
 const coreJs=read('renderer/positron-watchflow-core.js');
 const ui=read('renderer/positron-horizon-v4.js');
 assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|http\.get\(/.test(coreJs+ui));
 assert.ok(ui.includes('Không khẳng định kênh đang trực tuyến'));
 assert.ok(ui.includes('current.playChannel(ch.id)'));
 assert.ok(ui.includes("current.setPage?.('tv')"));
 assert.ok(ui.includes('panel.hidden=true'));
 assert.ok(ui.includes('aria-expanded'));
 assert.ok(!ui.includes('importSource('),'WatchFlow must not import channels without consent');
});
test('Horizon system loads last, preserves native player, covers every page',()=>{
 const html=read('renderer/index.html');
 const css=read('renderer/positron-horizon-v4.css');
 assert.ok(html.includes('positron-watchflow-core.js'));
 assert.ok(html.indexOf('positron-horizon-v4.css')>html.indexOf('positron-workspace-v3.css'));
 assert.ok(html.indexOf('positron-horizon-v4.js')>html.indexOf('positron-workspace-v3.js'));
 for(const part of ['#appSidebar','#page-tv .tv-layout','#page-tv #playerBox','#channelList','.page:not(#page-tv)','#page-sources','#emptyPlayer'])
  assert.ok(css.includes(part),part+' not covered by Horizon design');
 assert.ok(!/html\[data-positron.*#video\s*\{[^}]*object-fit:/s.test(css),'video fit must remain user-configurable');
 assert.equal(JSON.parse(read('package.json')).version,'4.23.202');
});

test('Horizon defeats the legacy p50 sidebar width and retains an expandable rail',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('po-horizon.p50-01:not([data-sidebar-visible="false"]):not([data-po-rail-expanded="true"])'));
 assert.ok(css.includes('width:68px!important;min-width:68px!important;max-width:68px!important;flex:0 0 68px!important'));
 assert.ok(css.includes('[data-po-rail-expanded="true"] #appShell > #appSidebar.sidebar'));
 assert.ok(css.includes('#appShell #appSidebar #sidebarToggleBtn'));
 assert.ok(audit.includes('railCycle.changed,true'));
 assert.ok(audit.includes('railCycle.restored,true'));
 assert.ok(audit.includes('positron-watchflow-'));
});

test('Horizon does not show overflowing rail text or clipped search at 1250px',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 assert.ok(css.includes('po-horizon.p50-04:not([data-po-rail-expanded="true"])'));
 assert.ok(css.includes('font-size:0!important;line-height:0!important'));
 assert.ok(css.includes('po-horizon.p50-04[data-po-rail-expanded="true"]'));
 assert.ok(css.includes('p50-46 #positronBar #positronOpen .p-command-label'));
 assert.ok(css.includes('max-width:none!important;white-space:nowrap!important;overflow:visible!important'));
});

test('WatchFlow heading remains legible on every legacy Studio theme',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('body #poWatchFlowPanel .po-watchflow-head h2'));
 assert.ok(css.includes('color:#effbf7!important;opacity:1!important'));
 assert.ok(audit.includes('WatchFlow title has unreadable dark contrast'));
});

test('real Electron WatchFlow audit exercises populated 552 channel suggestions without playback',()=>{
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(audit.includes('watchFlowQa.playable,3'));
 assert.ok(audit.includes('watchFlowQa.fresh,true'));
 assert.ok(audit.includes('watchFlowQa.nonePlaying,true'));
 assert.ok(audit.includes('positron-watchflow-552-metadata-qa-real.png'));
});

test('P5.1.60 recommendations diversify equivalent-evidence groups instead of three adjacent channels',()=>{
 const groups=[
  {id:'a1',name:'QA Channel 001',group:'01 Main',url:'https://test.invalid/1',status:'uncertain'},
  {id:'a2',name:'QA Channel 002',group:'01 Main',url:'https://test.invalid/2',status:'uncertain'},
  {id:'b1',name:'QA Channel 016',group:'02 Regional',url:'https://test.invalid/16',status:'uncertain'},
  {id:'c1',name:'QA Channel 121',group:'03 Other',url:'https://test.invalid/121',status:'uncertain'}
 ];
 const before=JSON.stringify(groups),suggested=core.rank(groups,{now,limit:3});
 assert.deepEqual(suggested.items.map(c=>c.id),['a1','b1','c1']);
 assert.equal(new Set(suggested.items.map(c=>c.group)).size,3);
 assert.equal(JSON.stringify(groups),before,'suggestions must not reorder source playlist');
 const more=core.rank(groups,{now,limit:3,seen:['a1','b1','c1']});
 assert.ok(more.items.some(c=>c.id==='a2'),'refresh must expose unseen channels');
});
test('P5.1.60 group variety cannot demote verified live streams beneath unverified streams',()=>{
 const input=[
  {id:'alive1',name:'AAA live',group:'One',url:'https://test.invalid/a',status:'alive'},
  {id:'alive2',name:'BBB live',group:'One',url:'https://test.invalid/b',status:'alive'},
  {id:'unchecked',name:'CCC unknown',group:'Two',url:'https://test.invalid/c',status:'uncertain'}
 ];
 const res=core.rank(input,{now,limit:2});
 assert.deepEqual(res.items.map(x=>x.id),['alive1','alive2']);
});

test('P5.1.63 native Electron empty WatchFlow cannot obscure playlist import',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes('panel.dataset.emptyPlaylist=String(channels.length===0)'));
 assert.ok(css.includes('.po-watchflow-panel[data-empty-playlist="true"]'));
 assert.ok(audit.includes('watchFlow.overlapWithImport,false'));
 assert.ok(audit.includes('watchFlow.modesHidden,true'));
 assert.ok(audit.includes('watchFlow.panelWidth<=320'));
});

test('P5.1.64 empty WatchFlow must not cover the native player heading',()=>{
 const css=read('renderer/positron-horizon-v4.css');
 const audit=read('scripts/positron-20-extension.cjs');
 assert.ok(css.includes('.po-watchflow-panel[data-empty-playlist="true"] .po-watchflow-head p{display:none!important}'));
 assert.ok(audit.includes('watchFlow.overlapWithTitle,false'));
 assert.ok(audit.includes("querySelector('#emptyPlayer h2')"));
});

test('P5.1.65 WatchFlow restores keyboard focus and announces the source action',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes('panel.querySelector(\'.po-watchflow-empty button\')'));
 assert.ok(ui.includes('if(focusWasInside)toggle.focus()'));
 assert.ok(css.includes('.po-watchflow-panel button:focus-visible'));
 assert.ok(audit.includes('watchFlow.focusEntered,true'));
 assert.ok(audit.includes('watchFlow.firstUsefulFocus,true'));
 assert.ok(audit.includes('watchFlow.focusReturned,true'));
});

test('P5.1.66 WatchFlow close action is a 42px SVG target, not a platform glyph',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes('id="poWatchFlowClose"'));
 assert.ok(ui.includes('M18 6 6 18M6 6l12 12'));
 assert.ok(css.includes('width:42px;height:42px;flex:0 0 42px'));
 assert.ok(audit.includes('watchFlow.closeTapSize>=40'));
 assert.ok(audit.includes('watchFlow.closeVector,true'));
});

test('P5.1.67 WatchFlow dismisses after native keyboard page navigation',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes("tvPage.classList.contains('active-page')"));
 assert.ok(ui.includes("attributeFilter:['class']"));
 assert.ok(audit.includes("window.IPTVState.setPage('sources')"));
 assert.ok(audit.includes('watchFlowNav.dismissed,true'));
 assert.ok(audit.includes('watchFlowNav.restored,true'));
});

test('P5.1.71 WatchFlow is scoped to TV and keyboard focus remains visible',()=>{
 const ui=read('renderer/positron-horizon-v4.js'),css=read('renderer/positron-horizon-v4.css'),audit=read('scripts/positron-20-extension.cjs');
 assert.ok(ui.includes('const syncTVAvailability=()=>'));
 assert.ok(ui.includes('toggle.hidden=!onTV'));
 assert.ok(ui.includes('if(!onTV&&open)close()'));
 assert.ok(ui.includes("if(!byId('page-tv').classList.contains('active-page'))return"));
 assert.ok(ui.includes("byId('positronOpen')"));
 assert.ok(css.includes('#poWatchFlowToggle[hidden]{display:none!important}'));
 for(const k of ['hiddenOnSources','refusesOffTV','visibleOnTV'])assert.ok(audit.includes('watchFlowNav.'+k+',true'));
});
