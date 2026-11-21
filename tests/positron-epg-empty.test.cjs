'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('EPG search provides truthful no-guide instruction while preserving normal search',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../renderer/advanced.js'),'utf8');
 assert.match(src,/!Array\.isArray\(epg\(\)\.programmes\)\|\|!epg\(\)\.programmes\.length/);
 assert.match(src,/Chưa có dữ liệu EPG\. Chọn Nguồn EPG và tải lịch trước khi tìm chương trình\./);
 assert.match(src,/const matches=lib\.epgSearch\(epg\(\),q\)/);
});
