'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),ai=require('../web-channel-intelligence.js');
const ch=(id,name,group)=>({id,name,group});
test('Multinomial Naive Bayes identifies news and sport',()=>{
 assert.equal(ai.predict('tin tuc thoi su').category,'Tin tức');
 assert.equal(ai.predict('bong da champions league').category,'Thể thao');
});
test('Explicit M3U group controls classification when channel name is ambiguous',()=>{
 const list=ai.analyse([ch('a','ABC','Phim'),ch('b','XYZ','Thể thao')]);
 assert.equal(list.byId.get('a').category,'Phim');assert.equal(list.byId.get('b').category,'Thể thao');
});
test('Existing favorites and watch history rank matching channel suggestions first',()=>{
 const a=ch('a','News','Tin tức'),b=ch('b','Sport','Thể thao'),c=ch('c','Tennis','Thể thao');
 const ranked=ai.analyse([a,b,c],{favorites:[b],recentIds:['c']});
 assert.equal(ranked.recommended[0].channel,b);assert.equal(ranked.recommended[1].channel,c);
});
test('Cold start remains explicit',()=>{assert.equal(ai.analyse([ch('a','A','VTV')]).coldStart,true);});
test('EPG programme title enriches unknown group classification',()=>{
 const x=ch('x','Kênh 01','VTV');x.tvgId='epg-x';
 const guide={names:{epgx:'epg-x'},programmes:[{id:'epg-x',start:100,end:10000,title:'Bóng đá Champions League'}]};
 const result=ai.analyse([x],{guide,clock:200});
 assert.equal(result.byId.get('x').category,'Thể thao');
});

test('AI tabs use shared fuzzy and accent-insensitive search preserving recommendations',()=>{
 const channels=[ch('news','Thời sự','Tin tức'),ch('vtv1','VTV1','VTV'),ch('sports','Thể thao','Thể thao')];
 const analyzed=ai.analyse(channels,{favorites:[channels[2]],recentIds:['sports']});
 const typo=ai.filterRows(analyzed.recommended,{query:'vvt1'});
 assert.deepEqual(typo.rows.map(r=>r.channel.id),['vtv1']);
 assert.equal(typo.approximate,true);
 const accent=ai.filterRows(analyzed.classified,{query:'thoi su'});
 assert.deepEqual(accent.rows.map(r=>r.channel.id),['news']);
});
test('AI results can search EPG programme titles and show matched metadata',()=>{
 const chx={id:'x',name:'Mystery',group:'Tổng hợp',tvgId:'abc'};
 const rows=ai.analyse([chx]).recommended;
 const guide={names:{abc:'abc'},programmes:[{id:'abc',title:'Việt Nam hôm nay',start:100,end:20000}]};
 const matched=ai.filterRows(rows,{query:'viet nam hom nay',guide,clock:250});
 assert.deepEqual(matched.rows.map(r=>r.channel.id),['x']);
 assert.equal(matched.matches.get('x').programme,'Việt Nam hôm nay');
});
