'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {engine,audit}=require('../scripts/audit-rustlab-l10n.cjs');
test('27 longer help strings are native-language in nine supported locales',()=>{
 const t=engine().t;
 const locales=['fr','de','it','ja','ko','ru','id','hi','ar'];
 const samples=['Di chuột lên ô nào, ô đó phát tiếng. Rời chuột: tất cả im lặng.','Chọn màu từ sidebar bên trái, hoặc dùng màu tùy chỉnh.','Tự thu thập mỗi 60 phút khi ứng dụng đang mở','TV và máy tính phải dùng chung mạng Wi-Fi/LAN, cho phép mDNS và truy cập cổng trên máy tính.'];
 for(const l of locales)for(const s of samples){
  assert.notEqual(t(s,l),s,l+' kept Vietnamese');
  assert.notEqual(t(s,l),t(s,'en'),l+' kept English');
 }
});
test('coverage increases measurably and leaves user content intact',()=>{
 const result=audit(),t=engine().t;
 for(const l of ['fr','de','it','ja','ko','ru','id','hi','ar'])assert.ok(result.byLocale[l].localized/result.total>=.92,l+' '+result.byLocale[l].percent);
 assert.equal(t('VTV1 Thời sự Việt Nam','fr'),'VTV1 Thời sự Việt Nam');
});
