'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-rustlab-l10n.cjs');
test('AI and PiP labels have native translations instead of Vietnamese or English fallback in eleven locales',()=>{
 const t=engine().t;
 const languages=['es','pt-BR','th','km','fr','de','it','ja','id','hi','ar'];
 const keys=['🔊 Giọng dịch TTS','▶ Thử giọng','Cài mô hình tự động','Kiểm tra dịch mẫu','Chọn whisper-cli','Chọn mô hình GGML (.bin)','Mở PiP khi chuyển khỏi Xem truyền hình','Thử mở PiP khi thu nhỏ ứng dụng','Đã lưu thiết lập PiP trên máy này.','Tự tải lại các nguồn M3U dạng URL khi khởi động'];
 for(const lang of languages)for(const source of keys){
  assert.notEqual(t(source,lang),source,lang+': fallback Vietnamese '+source);
  assert.notEqual(t(source,lang),t(source,'en'),lang+': fallback English '+source);
 }
});
test('audit baseline grows without touching imported names',()=>{
 const {total,byLocale}=audit();const t=engine().t;
 for(const language of ['es','pt-BR','th','km','fr','de','it','ja','id','hi','ar'])
  assert.ok(byLocale[language].localized/total>=.82,language+': '+byLocale[language].percent+'%');
 assert.equal(t('VTV1 Thời sự Việt Nam','ru'),'VTV1 Thời sự Việt Nam');
});
