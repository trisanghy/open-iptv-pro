'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ctx={URL};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../frontend/collector-core.js'),'utf8'),ctx);
const {merge}=ctx.OpenIPTVCollector;
const ui=fs.readFileSync(path.join(__dirname,'../frontend/collector.js'),'utf8');

test('merge 1169 sample playlist entries into 804 unique and preserve 197 alternate URLs',()=>{
 const input=[];
 for(let i=0;i<804;i++)input.push({id:`a_${i}`,sourceId:'a',name:`Channel ${i}`,tvgId:`ch${i}`,url:`https://a.example/${i}.m3u8`,status:'unchecked'});
 for(let i=0;i<365;i++)input.push({id:`b_${i}`,sourceId:'b',name:`Channel ${i}`,tvgId:`ch${i}`,url:i<197?`https://b.example/${i}.m3u8`:`https://a.example/${i}.m3u8`,status:'unchecked'});
 const result=merge(input);
 assert.deepEqual(JSON.parse(JSON.stringify(result.stats)),{input:1169,duplicates:365,alternates:197,invalid:0,unique:804});
 assert.equal(result.channels.length,804);
 assert.equal(result.channels.filter(x=>x.alternates.length>0).length,197);
 assert.ok(result.channels.every(x=>x.sourceId==='collector_merged'));
});
test('WebView merge requires a visible in-app approval rather than native window.confirm',()=>{
 assert.match(ui,/function confirmInApp\(/);
 assert.match(ui,/await confirmInApp\('Xác nhận áp dụng playlist gộp'/);
 assert.match(ui,/if\(!approved\|\|cancel\)/);
 assert.match(ui,/stats\(\);\$\('sourceMergeSummary'\)\.textContent='Đã hủy/);
 assert.ok(!ui.includes('!confirm('));
});
