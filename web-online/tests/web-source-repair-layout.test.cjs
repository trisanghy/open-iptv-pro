'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),style=read('web-source-repair-layout.css');
const builder=read('web-online/prepare-web.py'),collector=read('collector.js'),i18n=read('i18n.js');
const start=html.indexOf('id="sourceRepairSection"');
const end=html.indexOf('<section id="page-shots"',start);
const repair=html.slice(start,end);
test('Source Repair controls are preserved exactly once and retain their IDs',()=>{
 for(const id of ['sourceCheckAllBtn','checkWorkersQuick','collectorRepair','collectorExport','collectorRestore','collectorCancel','collectorProgress','collectorStatus','collectorMetrics','collectorResults']){
  const count=(html.match(new RegExp('id="'+id+'"','g'))||[]).length;
  assert.equal(count,1,id+' duplicate or missing');
  assert.ok(repair.includes('id="'+id+'"'),id+' outside repair panel');
 }
 assert.match(repair,/value="32"/);
 assert.match(collector,/getElementById\(id\)/);
});
test('mobile actions, progress, statistics and logs appear in the agreed order',()=>{
 const selectors=['source-repair-action-card','source-repair-primary-row','source-repair-secondary-row','source-repair-tertiary-row','source-repair-progress','source-repair-help','source-repair-statistics','source-repair-log-card'];
 const positions=selectors.map(x=>repair.indexOf(x));
 assert.ok(positions.every(x=>x>=0));assert.deepEqual(positions,[...positions].sort((a,b)=>a-b));
 assert.match(repair,/source-repair-log-card" open/);
 assert.match(repair,/source-repair-help">\s*<summary/);
 assert.match(style,/@media\(max-width:700px\)/);
 assert.match(style,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(style,/#sourceRepairSection \.collector-results|#sourceRepairSection \.source-repair-log-card \.collector-results/);
 assert.doesNotMatch(style,/(^|\n)\.collector-actions\s*\{/);
});
test('layout does not affect collection logic or require a new storage format',()=>{
 assert.match(collector,/const SOURCE='collector_merged'/);
 assert.match(collector,/window\.IPTVCollectorUI/);
 assert.match(collector,/collectorBackup=\{version:2/);
 assert.match(repair,/id="collectorResults" class="collector-results"/);
});
test('Web-only layout survives regeneration and has its own cache key',()=>{
 assert.match(html,/web-source-repair-layout\.css\?v=source-repair-layout-20261120a/);
 assert.match(builder,/web-source-repair-layout\.css/);
 assert.match(builder,/Missing Source Repair section anchors/);
 assert.match(builder,/repair_start='<section class="source-hub-section" id="sourceRepairSection">'/);
});
test('new section headers have English translations',()=>{
 for(const [vi,en] of Object.entries({"Thao tác xử lý":"Actions","Tiến trình xử lý":"Processing progress","Thống kê":"Statistics","Lưu ý kiểm tra":"Checking notes"})){
  assert.ok(i18n.includes('"'+vi+'":"'+en+'"'),vi);
 }
});
