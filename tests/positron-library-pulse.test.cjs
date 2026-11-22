'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../renderer/positron-library-pulse-core.js');
test('Library Pulse tổng hợp metadata thực, không thay đổi playlist',()=>{
 const rows=[
  {id:'1',name:'A',group:'VTV',sourceId:'s1',logo:'http://example.com/a.png',tvgId:'vtv1',status:'alive'},
  {id:'2',name:'B',groupTitle:'VTV',sourceId:'s1',status:'dead'},
  {id:'3',name:'C',group:'Phim',sourceId:'s2',logo:''},
  {id:'4',name:'D'}
 ];
 const before=JSON.stringify(rows);
 const out=core.summarize(rows);
 assert.equal(out.total,4);
 assert.equal(out.sources,2);
 assert.equal(out.groups,3);
 assert.equal(out.withLogoMeta,1);
 assert.equal(out.withEpgId,1);
 assert.equal(out.knownAlive,1);
 assert.equal(out.knownDead,1);
 assert.deepEqual(out.groupBreakdown.map(x=>x.count),[2,1,1]);
 assert.equal(JSON.stringify(rows),before);
});
test('Library Pulse nhận dữ liệu trống an toàn và không đoán trạng thái stream',()=>{
 const r=core.summarize(null);
 assert.equal(r.total,0);assert.equal(r.sources,0);
 assert.equal(r.withEpgId,0);assert.equal(r.knownAlive,0);
});

test('Library Pulse phân trang nhóm theo lô 5, không thay đổi dữ liệu gốc',()=>{
 const groups=Array.from({length:13},(_,i)=>({name:'Nhóm '+i,count:13-i}));
 const before=JSON.stringify(groups);
 assert.deepEqual(core.pageGroups(groups,5).rows,groups.slice(0,5));
 assert.equal(core.pageGroups(groups,5).remaining,8);
 assert.equal(core.pageGroups(groups,10).remaining,3);
 assert.equal(core.pageGroups(groups,15).remaining,0);
 assert.equal(core.pageGroups(groups,-3).rows.length,0);
 assert.deepEqual(core.pageGroups(null),{rows:[],remaining:0});
 assert.equal(JSON.stringify(groups),before);
});
test('P157 mở thêm nhóm và dùng textContent an toàn',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 assert.match(source,/name\.textContent=group\.name/);
 assert.match(source,/moreGroups\.addEventListener\('click'/);
 assert.match(source,/visibleGroupCount\+=5/);
});

test('P5.1.158 missingLogos phân trang và không truy cập URL nguồn',()=>{
 const channels=[
  {id:'1',name:'VTV1',group:'Tin tức',logo:'',url:'http://s1/secret'},
  {id:'2',name:'VTV2',groupTitle:'Khoa học',url:'http://s2/secret'},
  {id:'3',name:'VTV3',logo:'https://cdn/img.png'},
  {id:'4',name:'VTV4',logo:'   ',group:'Tin tức'},
  {id:'5',name:'VTV5',logo:'https://cdn/abc.png'}
 ];
 const snapshot=JSON.stringify(channels);
 const p1=core.missingLogos(channels,{offset:0,limit:2});
 const p2=core.missingLogos(channels,{offset:2,limit:2});
 assert.equal(p1.total,3);assert.deepEqual(p1.rows.map(x=>x.name),['VTV1','VTV2']);
 assert.deepEqual(p2.rows.map(x=>x.name),['VTV4']);
 assert.equal(p1.rows[0].group,'Tin tức');
 assert.ok(!JSON.stringify(p1).includes('secret'));
 assert.equal(JSON.stringify(channels),snapshot);
 assert.equal(core.missingLogos(null).total,0);
});
