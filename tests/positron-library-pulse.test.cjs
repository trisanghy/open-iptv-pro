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
