'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),s=require('../web-channel-search.js');
const make=(id,name,group='VTV',tvgId=id)=>({id,name,group,tvgId});
test('Vietnamese accent folding works in names and EPG titles',()=>{
 assert.equal(s.normalize('Truyền Hình Địa Phương'),'truyen hinh dia phuong');
 assert.deepEqual(s.search([make('a','Thời sự')],'thoi su').channels.map(x=>x.id),['a']);
});
test('Typos and adjacent transposition get fallback matches',()=>{
 const c=[make('vtv1','VTV1'),make('vtv2','VTV2')];
 assert.equal(s.search(c,'vvt1').approximate,true);
 assert.deepEqual(s.search(c,'vvt1').channels.map(x=>x.id),['vtv1']);
 assert.equal(s.search(c,'vtv1').approximate,false);
});
test('Exact hits outrank fallback fuzzy matches',()=>{
 const channels=[make('one','VTV1'),make('two','VTV2')];
 assert.deepEqual(s.search(channels,'VTV1').channels.map(x=>x.id),['one']);
});
test('EPG title can find channel absent from name and group',()=>{
 const channel=make('x','Kênh bí ẩn','Tổng hợp','abc');
 const guide={names:{abc:'abc'},aliasesById:{abc:['ABC']},programmes:[{id:'abc',title:'Việt Nam hôm nay',description:'',start:100,end:10000}]};
 const result=s.search([channel],'viet nam hom nay',guide,{clock:200});
 assert.deepEqual(result.channels,[channel]);assert.equal(result.usedEPG,true);
 assert.equal(result.matches.get('x').programme,'Việt Nam hôm nay');
});
test('EPG typo search returns a hint, exact EPG matching does not use unrelated programmes',()=>{
 const channel=make('x','Kênh thử','Tổng hợp','epg');
 const guide={names:{epg:'epg'},programmes:[
  {id:'epg',title:'Bóng đá châu Âu',start:100,end:9000},
  {id:'epg',title:'Thời sự buổi tối',start:9000,end:15000}]};
 assert.deepEqual(s.search([channel],'bong da',guide,{clock:200}).channels,[channel]);
 assert.equal(s.search([channel],'bog da',guide,{clock:200}).approximate,true);
 assert.deepEqual(s.search([channel],'bong toi',guide,{clock:200}).channels,[]);
});
test('Stale EPG programme does not appear in future search',()=>{
 const channel=make('x','VTV','Tổng hợp','abc');
 const guide={names:{abc:'abc'},programmes:[{id:'abc',title:'Đêm qua',start:0,end:100}]};
 assert.deepEqual(s.search([channel],'dem qua',guide,{clock:10000000}).channels,[]);
});
test('Empty query preserves source objects and order',()=>{
 const channels=[make('1','A'),make('2','B')],r=s.search(channels,'');
 assert.equal(r.channels,channels);assert.equal(r.approximate,false);
});

test('Central engine matches inferred AI theme without changing M3U data',()=>{
 const one=make('one','ABC TV','VTV'),two=make('two','K+ Sport','Thể thao');
 const found=s.search([one,two],'tin tuc',null,{categoryFor:ch=>ch.id==='one'?'Tin tức':'Thể thao'});
 assert.deepEqual(found.channels,[one]);
 assert.equal(one.group,'VTV');
});
