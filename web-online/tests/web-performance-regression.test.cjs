'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=read('app.js'),features=read('features.js'),builder=read('web-online/prepare-web.py'),html=read('index.html');
function slice(s,a,b){const i=s.indexOf(a),j=s.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,a+' missing');return s.slice(i,j);}
test('navigation refreshes only relevant page, never rebuilding all lists',()=>{
 const route=slice(app,' function setPage(p){',' function renderOnNavigation(p){');
 assert.match(route,/renderOnNavigation\(p\)/);assert.doesNotMatch(route,/\brender\(\)/);
 const fn=slice(app,' function renderOnNavigation(p){',' function closeModal(){');
 const calls={sources:0,shots:0,fav:0,folders:0};
 const ctx={renderSources(){calls.sources++},renderShots(){calls.shots++},renderFavorites(){calls.fav++},renderFolders(){calls.folders++}};
 vm.runInNewContext(fn+";renderOnNavigation('tv');renderOnNavigation('epg');renderOnNavigation('sources');renderOnNavigation('shots');renderOnNavigation('fav');renderOnNavigation('folders');",ctx);
 assert.deepEqual(calls,{sources:1,shots:1,fav:1,folders:1});
 const executable=fn.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(executable,/renderList\(|\brender\(\)/);
});
test('changing channel highlights the existing 1200 rows without rebuilding DOM',()=>{
 const fn=slice(app,' function highlightPlayingChannel(){',' async function playChannel(chId,override=null,opts={}){');
 const rows=Array.from({length:1200},(_,i)=>({dataset:{channelId:'id'+i},current:i===0}));
 const list={
  querySelectorAll(sel){
   if(sel==='.channel-item.current')return rows.filter(r=>r.current).map(r=>({classList:{remove(){r.current=false}}}));
   if(sel==='.channel-item[data-channel-id]')return rows.map(r=>({dataset:r.dataset,classList:{add(){r.current=true}}}));
   throw Error('unexpected selector '+sel);
  },
  replaceChildren(){throw Error('should not rebuild channel list')}
 };
 vm.runInNewContext(fn+';highlightPlayingChannel();',{$:()=>list,current:{id:'id1199'}});
 assert.equal(rows[0].current,false);assert.equal(rows[1199].current,true);
 const play=slice(app,' async function playChannel(chId,override=null,opts={}){',' async function playToggle(){');
 assert.match(play,/highlightPlayingChannel\(\)/);assert.doesNotMatch(play,/renderList\(/);
});
test('search events coalesce into animation frames',()=>{
 assert.match(app,/pendingChannelSearch=requestAnimationFrame/);
 assert.match(app,/cancelAnimationFrame\(pendingChannelSearch\)/);
 assert.match(features,/pendingEPGSearch=requestAnimationFrame/);
 assert.match(features,/cancelAnimationFrame\(pendingEPGSearch\)/);
});
test('EPG page rendering is deferred and minute polling is deduplicated',()=>{
 const fn=slice(features,' function renderGuidePages(){',' function decorateRow(');
 assert.match(fn,/classList\.contains\('active-page'\)\)renderEPG\(\)/);
 assert.equal((features.match(/window\.setInterval\(/g)||[]).length,1);
 assert.match(features,/document\.visibilityState==='hidden'/);
 assert.match(features,/document\.addEventListener\('visibilitychange'/);
});
test('builder preserves optimizations and the Web cache is refreshed',()=>{
 for(const word of ['Web performance route patch drift','Web performance search patch drift','Web performance EPG lazy patch drift','Web performance EPG filter patch drift','Web performance EPG timer patch drift'])
  assert.ok(builder.includes(word),word);
 assert.ok(html.includes('app.js?v=tv-remote-buttons-20261122c'));
 assert.ok(html.includes('features.js?v=web-perf-20261120a'));
 assert.ok(builder.includes('app.js?v=tv-remote-buttons-20261122c'));
 assert.ok(builder.includes('features.js?v=web-perf-20261120a'));
});
