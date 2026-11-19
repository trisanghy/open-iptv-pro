'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {engine,auditDictionary}=require('../scripts/audit-rustlab-l10n.cjs');
test('48 high-frequency dynamic CC, AI and source-management labels translate in every non-Vietnamese locale',()=>{
 const t=engine().t;
 const keys=['Công cụ','Kênh vừa xem','Nền đen mờ','Nền đen đậm','Nền sáng mờ','Không nền','Không viền','Viền đen','Viền trắng','Độ trong suốt nền','🔊 Giọng dịch','Chưa chọn mẫu giọng.','Bộ dịch mặc định','Tự động · dùng mô hình đã cài','Chưa có chương trình tiếp theo','Tự phát kênh đã xem ở phiên trước','Tự động PiP khi rời ứng dụng','Đã chọn 0 kênh','▣ CC · Tùy chỉnh'];
 for(const lang of ['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'])
  for(const key of keys){
   assert.notEqual(t(key,lang),key,lang+' Vietnamese fallback: '+key);
   assert.notEqual(t(key,lang),t(key,'en'),lang+' English fallback: '+key);
  }
});
test('dictionary report includes dynamic labels; keep user media titles unchanged',()=>{
 const report=auditDictionary(),t=engine().t;
 assert.ok(report.total>=1299,'Unexpectedly small dictionary');
 for(const lang of ['zh-CN','lo','ko','ru','fr','de'])assert.ok(report.byLocale[lang].localized>400,lang+' missing localization unexpectedly');
 assert.equal(t('VTV1 Thời sự Việt Nam','ko'),'VTV1 Thời sự Việt Nam');
});
