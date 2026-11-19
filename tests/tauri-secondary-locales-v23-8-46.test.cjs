'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-rustlab-l10n.cjs');
test('secondary controls use native wording across nine previously sparse dictionaries',()=>{
 const t=engine().t;
 const locales=['fr','de','it','ja','ko','ru','id','hi','ar'];
 const labels=['Tìm M3U','Chưa tải','Thu thập','Gộp kênh','Đang xử lý…','Nguồn hiện có','Chưa kiểm tra','Kiểm tra link','Chụp Snapshot','Luồng kiểm tra','Mở bộ cài đã tải','Tạo liên kết xem','⌕ Tìm thiết bị AirPlay','Kết quả theo thời gian thực','Phẳng, thoáng, ít đường viền','Bảng điều khiển sáng · thẻ tiện ích'];
 for(const l of locales)for(const source of labels){
  const result=t(source,l);
  assert.notEqual(result,source,l+': Vietnamese '+source);
  assert.notEqual(result,t(source,'en'),l+': English fallback '+source);
 }
});
test('generic status is not kept as unlocalized English across German Portuguese Indonesian',()=>{
 const t=engine().t;
 for(const l of ['de','pt-BR','id'])assert.notEqual(t('Trạng thái',l),t('Trạng thái','en'));
});
test('measured static translation coverage improves without renaming user data',()=>{
 const result=audit();
 for(const locale of ['fr','de','it','ja','ko','ru','id','hi','ar'])
  assert.ok(result.byLocale[locale].localized/result.total>=.76,locale+': coverage '+result.byLocale[locale].percent+'%');
 const t=engine().t;
 assert.equal(t('VTV1 Thời sự Việt Nam','ko'),'VTV1 Thời sự Việt Nam');
});
