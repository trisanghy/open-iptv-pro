'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('DVR empty state offers source import without valid channels',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../renderer/dvr-ui.js'),'utf8');
 assert.match(src,/hasRecordableChannel=ctx\.getChannels\(\)\.some/);
 assert.match(src,/Chưa có lịch ghi hình\. Hãy nhập nguồn IPTV có kênh trước khi đặt lịch\./);
 assert.match(src,/Chưa có lịch ghi hình\. Chọn chương trình EPG hoặc thêm lịch thủ công\./);
 assert.match(src,/box\.append\(createElement\('p','hint',hint\)\)/);
});
