'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=require('../renderer/positron-watchflow-core.js');
globalThis.PositronWatchFlowCore=base;
const p=require('../renderer/positron-watchflow-next-core.js');
const C=(id,name,group,status='uncertain',at='')=>({id,name,group,url:'https://example.invalid/'+id+'.m3u8',status,lastPlaybackAt:at});
const channels=[
 C('n','VTV1 Tin Tuc','Tin tức','alive','2026-11-20T00:00:00Z'),
 C('n2','VTV2 Tin Tuc','Tin tức','dead'),
 C('s','Sports Arena','Thể thao','alive'),
 C('m','MTV Music','Âm nhạc'),
 C('f','HBO Movie','Phim'),
 C('k','Disney Kids','Thiếu nhi'),
 C('u','Something','Other'),
 C('u2','Another','Other')
];
test('continue watching honors verified native recents, existing channels and their order',()=>{
 const originals=JSON.stringify(channels);
 assert.deepEqual(p.continueWatching(channels,[channels[4],channels[0],channels[1],{id:'missing'},channels[4]]).map(c=>c.id),['f','n']);
 assert.equal(JSON.stringify(channels),originals);
});
test('similar recommends same group or genre, never dead or current',()=>{
 const picks=p.similar(channels,channels[0],{limit:5});
 assert.ok(!picks.some(c=>c.id==='n'||c.id==='n2'));
 assert.equal(p.similar(channels,null).length,0);
});
test('daily mix is deterministic per day, diverse and excludes dead streams',()=>{
 const a=p.dailyMix(channels,{limit:5,date:'2026-11-21'}),b=p.dailyMix(channels,{limit:5,date:'2026-11-21'});
 assert.deepEqual(a.map(c=>c.id),b.map(c=>c.id));
 assert.equal(new Set(a.map(c=>c.id)).size,5);
 assert.ok(!a.some(c=>c.status==='dead'));
 assert.ok(new Set(a.map(c=>base.category(c))).size>=4);
});
test('Smart Zap does not repeat current or seen except when exhausted',()=>{
 const result=p.smartZap(channels,{currentId:'n',seen:['m','f','s','k','u']});
 assert.ok(result);
 assert.notEqual(result.id,'n');
 assert.ok(result.status!=='dead');
 const only=p.smartZap([channels[0]],{currentId:'n'});
 assert.equal(only,null);
});
test('WatchFlow Plus UI only plays after an explicit click and uses native channel IDs',()=>{
 const script=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const html=fs.readFileSync('renderer/index.html','utf8');
 assert.ok(script.includes("buttons.zap.addEventListener('click'"));
 assert.ok(script.includes("app.playChannel(String(ch.id))"));
 assert.ok(script.includes('recentApi.visible(source,channels(),key)'));
 assert.ok(!/fetch\s*\(|XMLHttpRequest|importSource\s*\(/.test(script));
 assert.ok(html.includes('positron-watchflow-next-core.js'));
 assert.ok(html.includes('positron-watchflow-next.js'));
 assert.ok(html.includes('positron-watchflow-next.css'));
});

test('P5.1.81 WatchFlow Plus presents all modes in one row with full accessible names',()=>{
 const js=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(js.includes("['continue','Tiếp','history']"));
 assert.ok(js.includes("b.setAttribute('aria-label',fullLabels[key])"));
 assert.ok(css.includes('.po-flowplus-nav{flex-wrap:nowrap!important'));
 assert.ok(css.includes('.po-flowplus-nav{overflow-x:auto!important'));
 for(const key of ['plusQA.navOneRow,true','plusQA.navNoOverflow,true','plusQA.ariaFull,true'])assert.ok(qa.includes(key)||qa.includes("'navOneRow','navNoOverflow','ariaFull'"));
 assert.ok(qa.includes('positron-watchflow-plus-mix-450-metadata-qa-real.png'));
});

test('P5.1.81 review repair uses five proportional tracks without hiding native actions',()=>{const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8'),qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'));assert.ok(qa.includes('plusQA.navOverflowPx'));assert.ok(qa.includes('navButtonVisible'));});

test('P5.1.85 Similar recommends equal-evidence same-group channels before alphabetically earlier outside-group channels',()=>{
 const basis=C('base','VTV1 News','Tin tức','alive');
 const input=[basis,C('a','A Other News','Tin nhanh','uncertain'),C('z','Z Same News','Tin tức','uncertain'),C('b','B Other News','Tin nhanh','alive')];
 const snapshot=JSON.stringify(input);
 assert.deepEqual(p.similar(input,basis,{limit:5}).map(c=>c.id),['b','z','a']);
 assert.equal(JSON.stringify(input),snapshot,'Similarity sorting must never mutate playlist data');
});

test('P5.1.86 real Electron WatchFlow Similar dialog does not obscure player controls',()=>{
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(css.includes('max-height:min(390px,calc(100dvh - 420px))!important'));
 assert.ok(css.includes('box-sizing:border-box!important'));
 for(const key of ['similarQA.modalNotOverPlayer,true','similarQA.recommendationsScrollable,true','similarQA.recommendationActions,5'])assert.ok(qa.includes(key),key);
 assert.ok(qa.includes('positron-watchflow-plus-similar-552-metadata-qa-real.png'));
});

test('P5.1.87 WatchFlow mode labels are never cut off at desktop 1360px while screen-reader names remain full',()=>{
 const js=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(js.includes("['continue','Tiếp','history']"));
 assert.ok(js.includes("continue:'Tiếp tục xem'"));
 assert.ok(js.includes("b.setAttribute('aria-label',fullLabels[key])"));
 assert.ok(qa.includes('plusQA.navNoTruncatedLabels,true'));
 assert.ok(qa.includes('label.scrollWidth<=label.clientWidth+1'));
});

test('P5.1.92 Mix uses device calendar day, not UTC (UTC+7 midnight boundary)',()=>{
 const cp=require('node:child_process');
 const script="const core=require('./renderer/positron-watchflow-next-core.js');process.stdout.write(core.localDay(new Date('2026-11-20T18:30:00Z')))";
 const bangkok=cp.execFileSync(process.execPath,['-e',script],{cwd:process.cwd(),env:{...process.env,TZ:'Asia/Bangkok'},encoding:'utf8'});
 const utc=cp.execFileSync(process.execPath,['-e',script],{cwd:process.cwd(),env:{...process.env,TZ:'UTC'},encoding:'utf8'});
 assert.equal(bangkok,'2026-11-21','1:30 AM in Thailand must be the next calendar day');
 assert.equal(utc,'2026-11-20','same instant remains previous day in UTC');
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const core=fs.readFileSync('renderer/positron-watchflow-next-core.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes('date:core.localDay()'),'Mix must request local day from engine');
 assert.ok(core.includes('date=localDay()')&&core.includes('date:localDay()'));
 assert.ok(!core.includes('toISOString().slice(0,10)'),'Core must not derive daily Mix from UTC midnight');
 assert.ok(qa.includes('mixLocalCalendarQa[key],true'));
 assert.ok(qa.includes('positron-p5192-local-calendar-mix-552-real.png'));
});

// P5.1.93: real Electron metadata QA revealed a 3:1:1 source-group skew.
test('daily Mix balances equal-evidence groups, rotates locally and preserves proven playback',()=>{
 const many=['Main','Regional','Other'].flatMap(group=>Array.from({length:14},(_,i)=>C(group+'-'+i,'QA '+group+' '+i,group)));
 const mixes=['2026-11-21','2026-11-22','2026-11-23','2026-11-24'].map(date=>p.dailyMix(many,{limit:5,date}));
 for(const mix of mixes){
  assert.equal(mix.length,5);
  const counts=new Map();for(const c of mix)counts.set(c.group,(counts.get(c.group)||0)+1);
  assert.deepEqual([...counts.values()].sort((a,b)=>a-b),[1,2,2]);
  assert.equal(new Set(mix.map(c=>c.id)).size,5);
 }
 assert.ok(new Set(mixes.map(a=>a.map(c=>c.id).join(','))).size>1);
 const proven=many.map((c,i)=>i===0?{...c,status:'alive'}:c);
 assert.ok(p.dailyMix(proven,{limit:5,date:'2026-11-21'}).some(c=>c.id===proven[0].id));
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(qa.includes('positron-p5193-group-balanced-mix-552-real.png'));
});

// P5.1.94: desktop screenshot hides part of the five cards.
test('WatchFlow desktop scroll cue follows actual hidden card geometry',()=>{
 const js=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(js.includes('poFlowPlusScrollHint'));
 assert.ok(js.includes("content.querySelector('.po-flowplus-card:last-child')"));
 assert.ok(js.includes('last.getBoundingClientRect().bottom>modalRect.bottom-18'));
 assert.ok(js.includes("panel.addEventListener('scroll',syncScrollCue"));
 assert.ok(js.includes('else scrollCue.hidden=true'));
 assert.ok(css.includes('pointer-events:none')&&css.includes('#poFlowPlusScrollHint[hidden]'));
 for(const key of ["'desktopVisible'","'bottomHidden'","'noAutoplay'","'controlsClear'"])
  assert.ok(qa.includes(key),'missing Electron proof '+key);
 assert.ok(qa.includes("assert.equal(scrollCueQA[key],true"));
 assert.ok(qa.includes('positron-p5194-watchflow-scroll-cue-552-real.png'));
});

// P5.1.95: screenshot-review correction keeps the cue OUTSIDE card buttons.
test('WatchFlow scroll cue lives inside its heading, not over actionable cards',()=>{
 const js=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(js.includes('head.append(h,label(sub),scrollCue);content.append(head)'));
 assert.ok(!js.includes('panel.append(scrollCue)'),'absolute panel overlay could cover an Xem button');
 assert.ok(css.includes('position:relative;right:auto;bottom:auto'));
 assert.ok(qa.includes('fixedCueQA.cueClearOfActions,true'));
 assert.ok(qa.includes('positron-p5195-watchflow-inline-scroll-cue-552-real.png'));
});
test('P5.1.106 compact empty WatchFlow does not horizontally scroll',()=>{
 const css=fs.readFileSync('renderer/positron-watchflow-next.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(css.includes('[data-empty-playlist="true"] .po-watchflow-head'));
 assert.ok(css.includes('margin:-15px -15px 0!important'));
 assert.ok(css.includes('padding:10px 15px 9px!important'));
 assert.ok(qa.includes('panel.scrollWidth<=panel.clientWidth+1'));
 assert.ok(qa.includes('watchFlow.noHorizontalScroll,true'));
 assert.ok(qa.includes('positron-p51106-empty-watchflow-no-horizontal-scroll-real.png'));
});
test('P5.1.106 release checks preserve original P5.1.105 evidence filenames',()=>{
 const wf=fs.readFileSync('.github/workflows/positron-lab.yml','utf8');
 for(const image of ['positron-p51105-dormant-manage-before-real.png','positron-p51105-dormant-manage-after-real.png','positron-p51106-empty-watchflow-no-horizontal-scroll-real.png'])
  assert.ok(wf.includes('test -s positron-evidence/p5-20-rounds/'+image),'missing proof '+image);
 assert.ok(!wf.includes('positron-p51106-dormant-manage-before-real.png'));
});
test('P5.1.107 chooser icons are real inline vectors with accessible control labels',()=>{
 const ui=fs.readFileSync('renderer/web-channel-chooser-v42371.js','utf8');
 const css=fs.readFileSync('renderer/positron-horizon-v4.css','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes('chooserIconSpecs'));
 assert.ok(ui.includes("document.createElementNS('http://www.w3.org/2000/svg','svg')"));
 assert.ok(ui.includes("svg.setAttribute('aria-hidden','true')"));
 assert.ok(ui.includes("b.setAttribute('aria-label',label)"));
 for(const t of ['Chọn kênh','Yêu thích','Xem gần đây','Dạng lưới','Dạng danh sách'])assert.ok(ui.includes(t));
 assert.ok(css.includes('.web-chooser-tabs button svg'));
 assert.ok(css.includes('.web-chooser-layout button svg'));
 for(const t of ['vectorChooserQA.fiveIcons','vectorChooserQA.allVisible','vectorChooserQA.noOverflow'])assert.ok(qa.includes(t)||qa.includes("'fiveIcons','allVisible'"));
 assert.ok(qa.includes('positron-p51107-chooser-native-svg-450-real.png'));
});
