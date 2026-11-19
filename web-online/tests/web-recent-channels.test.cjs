'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const recent=require(path.join(root,'web-recent-channels.js'));
const app=read('app.js'),html=read('index.html'),css=read('web-compact-toolbar.css'),builder=read('web-online/prepare-web.py');
test('recent channel history is bounded, deduplicated, newest first and resilient to invalid storage',()=>{
 assert.deepEqual(recent.normalize('wrong type'),[]);
 assert.deepEqual(recent.normalize(['A',null,'A','B']),['A','B']);
 let list=[];
 for(let i=0;i<40;i++)list=recent.push(list,'channel-'+i);
 assert.equal(list.length,24);assert.equal(list[0],'channel-39');
 list=recent.push(list,'channel-24');
 assert.equal(list[0],'channel-24');
 assert.equal(new Set(list).size,24);
});
test('recent channels reflect available real channels, never resurrect disabled or removed sources',()=>{
 const channels=[{id:'A',name:'Alpha'},{id:'C',name:'Charlie'},{id:'B',name:'Beta'}];
 assert.deepEqual(recent.select(['B','missing','A'],channels).map(c=>c.id),['B','A']);
 assert.deepEqual(recent.select(['A'],[]),[]);
});
test('recent filter appears in the original list, persists with store and shares normal play handler',()=>{
 assert.match(html,/<button class="filter-tab" data-filter="recent">Vừa xem<\/button>/);
 assert.match(app,/recentChannelIds:/);
 assert.match(app,/store\.recentChannelIds=recentCore\.normalize/);
 assert.match(app,/store\.recentChannelIds=recentCore\.push\(store\.recentChannelIds,chId\)/);
 assert.match(app,/if\(filter==='recent'\)a=recentCore\.select/);
 assert.match(app,/filter==='recent'\?a:sortedChannels\(a\)/);
 assert.match(app,/if\(filter==='recent'\)/);
 assert.ok(html.indexOf('web-recent-channels.js?v=recent-controls-20261119a')<html.indexOf('src="app.js?'));
 assert.ok(builder.includes('web-recent-channels.js'));
 assert.ok(builder.includes("recentCore.push"));
 assert.ok(builder.includes('data-filter="recent"'));
});
test('selecting favorite, source and ratio remain exactly one control each on row two',()=>{
 for(const id of ['videoFit','manualStreamSelect','favCurrentBtn'])
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.ok(html.includes('web-compact-toolbar.css?v=recent-controls-20261119a'));
 assert.match(css,/@container \(max-width:720px\)/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) 44px!important/);
 assert.match(css,/grid-area:2\/1\/3\/2!important/);
 assert.match(css,/grid-area:2\/2\/3\/3!important/);
 assert.match(css,/grid-area:2\/3\/3\/4!important/);
 assert.ok(html.indexOf('web-compact-toolbar.css?v=recent-controls-20261119a')>html.indexOf('web-mobile-player.css?'));
});
test('bundled browser assets match build sources',()=>{
 assert.equal(read('web-online/web-recent-channels.js'),read('web-recent-channels.js'));
 assert.equal(read('web-online/web-compact-toolbar.css'),read('web-compact-toolbar.css'));
});
