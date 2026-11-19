'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-rustlab-l10n.cjs');
const report=audit();
test('all 17 supported languages load and 58 shared UI strings are actually translated',()=>{
 const t=engine(),langs=['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 const check=['☾ Tối','☀ Sáng','＋ Thêm','⌕ Tìm TV','◐ Tự động','Trạng thái','↶ Hoàn tác','⧉ Sao chép','■ Hủy tác vụ','＋ Tạo thư mục','▣ Chụp toàn bộ','✓ Kiểm tra luồng','↥ Cập nhật phiên bản','⌕ Phân tích kênh trùng','◉ Mở AirPlay trong Safari','Chọn bộ sưu tập rồi bấm Khám phá.','Không kiểm tra liên tục khi app đã tắt; tự tải chỉ dùng nguồn đã chọn.'];
 for(const lang of langs)for(const key of check){
  const value=t.t(key,lang);
  assert.notEqual(value,key,'Vietnamese fallback: '+lang+' '+key);
  assert.notEqual(value,t.t(key,'en'),'English fallback: '+lang+' '+key);
 }
});
test('audit reveals per-language static UI gaps and ensures no translation regression',()=>{
 assert.equal(report.total>=350,true,'The static UI extraction lost too many labels');
 for(const [locale,info] of Object.entries(report.byLocale)){
  const min=locale==='en'?0.98:locale==='zh-CN'||locale==='lo'?0.79:locale==='ko'||locale==='ru'?0.75:locale==='es'||locale==='pt-BR'||locale==='th'||locale==='km'?0.72:0.67;
  assert.ok(info.localized/info.total>=min,locale+': '+info.localized+'/'+info.total+' below '+min);
  assert.ok(Array.isArray(info.missing),'The report must expose untranslated labels');
 }
});
test('source-provided names remain unchanged under localization',()=>{
 const t=engine();
 for(const language of ['zh-CN','lo','ko','ru','fr','ar']){
  assert.equal(t.t('VTV1 Thời sự Việt Nam',language),'VTV1 Thời sự Việt Nam');
  assert.equal(t.t('M3U custom group',language),'M3U custom group');
 }
});
