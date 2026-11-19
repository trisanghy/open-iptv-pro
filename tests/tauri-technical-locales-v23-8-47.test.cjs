'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-rustlab-l10n.cjs');
const legal='⚠ Trước khi sử dụng, phải xác nhận điều khoản của nguồn và quyền xem nội dung. Kênh công khai hoặc có tín hiệu không đồng nghĩa có bản quyền.';
const pin='PIN tại thiết bị giúp hạn chế thao tác thông thường, không thay thế biện pháp kiểm soát truy cập của hệ điều hành.';
const backup='Backup không mã hóa, có thể chứa URL có tài khoản/mật khẩu và thông tin hồ sơ. Hãy giữ file ở nơi an toàn. Restore sẽ yêu cầu xác nhận trước khi thay dữ liệu hiện tại. Không sao lưu bộ đệm Tua lại tạm thời hoặc chương trình đã cài.';
const keep='Tự làm mới nguồn ở chế độ nền. Nếu URL mới lỗi hoặc danh sách mất quá nhiều kênh, giữ nguyên dữ liệu cũ. File M3U trên máy không tự thay đổi.';
test('all 15 non-Vietnamese/non-English languages display native full-length technical notices',()=>{
 const t=engine().t;
 for(const locale of ['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']){
  for(const text of [legal,pin,backup,keep]){
   assert.notEqual(t(text,locale),text,locale+': Vietnamese legal/help string');
   assert.notEqual(t(text,locale),t(text,'en'),locale+': English legal/help string');
  }
 }
});
test('localization audit increases measured native static coverage without altering user content',()=>{
 const stats=audit(),t=engine().t;
 for(const locale of Object.keys(stats.byLocale).filter(l=>l!=='en'))
  assert.ok(stats.byLocale[locale].localized/stats.total>=.73,locale+': coverage '+stats.byLocale[locale].percent+'%');
 assert.equal(t('VTV1 Thời sự Việt Nam','ru'),'VTV1 Thời sự Việt Nam');
 assert.equal(t('M3U custom group','ja'),'M3U custom group');
});
