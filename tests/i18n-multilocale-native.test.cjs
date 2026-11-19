'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'renderer/i18n.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'renderer/languages.bundle.js'),'utf8');
const key='window.OPEN_IPTV_TRANSLATIONS=';
const dict=JSON.parse(bundle.slice(bundle.indexOf(key)+key.length).replace(/;\s*$/,''));
function engine(){
 const document={documentElement:{},readyState:'loading',addEventListener(){}};
 class MutationObserver{observe(){}}
 const window={OPEN_IPTV_TRANSLATIONS:structuredClone(dict)};
 vm.runInNewContext(source,{window,document,MutationObserver,localStorage:{getItem(){return null},setItem(){}},CustomEvent:class{}},{timeout:7000});
 return window.OpenIPTVI18n;
}
const locales=['zh-CN','lo','es','pt-BR','th','km','fr','de','it','ja','ko','ru','id','hi','ar'];
const required=[
 'Thêm tính năng','Tài khoản & Đồng bộ đám mây','Chế độ khách · lưu trên thiết bị',
 'Chế độ khách · đăng nhập để tự sao lưu và khôi phục dữ liệu IPTV trên mọi trình duyệt.',
 'Đăng nhập bằng email','Gửi email đăng nhập',
 'Đăng nhập không cần mật khẩu. Nhập email rồi xác thực để đồng bộ IPTV giữa các thiết bị.',
 'Supabase gửi email chứa nút Sign in (không có mã OTP). Nhấp chuột phải vào Sign in → Sao chép địa chỉ liên kết, rồi dán vào phần xác thực bên dưới. Đừng mở liên kết trước.',
 'Nguồn','Lịch','Yêu thích','Thêm','Quản lý nguồn IPTV',
 'Ảnh chụp','Hồ sơ','Thư mục','Sức khỏe kênh','Tải xuống phần mềm','Hướng dẫn Web',
 '◉ Smart IPTV Discovery · Khám phá nguồn & kênh','⚠ Cảnh báo quyền sử dụng:',
 'Chỉ nhập file/link M3U và xem kênh mà bạn có quyền hợp pháp. Nội dung do người dùng lựa chọn; tác giả không cung cấp, kiểm soát hoặc chịu trách nhiệm về nội dung nhập và xem trong phạm vi pháp luật cho phép. Mỗi lần nhập phải xác nhận trước khi tiếp tục.',
 '⚠ Trước khi sử dụng Smart Discovery, phải tích xác nhận riêng rằng đã kiểm tra điều khoản nhà cung cấp và có quyền hợp pháp với nội dung. Khi nhập kênh phải xác nhận lại; kênh công khai hoặc phát được không đồng nghĩa có giấy phép.',
 'Âm thanh khi khóa màn hình','Tự mở kênh khi vào website','Đang kiểm tra cấu hình đồng bộ…'
];
test('all 15 target locales translate critical navigation, cloud account and legal notices natively',()=>{
 const t=engine().t;
 for(const lang of locales)
  for(const key of required){
   const value=t(key,lang),english=t(key,'en');
   assert.notEqual(value,key,lang+' left Vietnamese: '+key.slice(0,65));
   if(!(lang==='fr'&&key==='Nguồn'))assert.notEqual(value,english,lang+' fell back to English: '+key.slice(0,65));
  }
});
test('switching English-written labels into Chinese and Lao works without page reload',()=>{
 const t=engine().t;
 assert.equal(t('Account & Cloud Sync','zh-CN'),'账户与云同步');
 assert.equal(t('Account & Cloud Sync','lo'),'ບັນຊີ ແລະ ຊິງຄ໌ຄລາວ');
 assert.equal(t('More features','zh-CN'),'更多功能');
 assert.equal(t('More features','lo'),'ຟັງຊັນເພີ່ມເຕີມ');
 assert.equal(t('Thêm tính năng','vi'),'Thêm tính năng');
});
test('numeric UI statuses use selected language and channel names stay untouched',()=>{
 const t=engine().t;
 for(const lang of locales){
  const counter=t('25 kênh',lang);
  const inUse=t('Đang dùng: 4 luồng',lang);
  const local=t('25 kênh • File cục bộ',lang);
  assert.ok(!/channels|workers|Local file|kênh|luồng/i.test(counter+' '+inUse+' '+local),lang+' not fully localized');
 }
 assert.equal(t('VTV5 Tây Nguyên','zh-CN'),'VTV5 Tây Nguyên');
 assert.equal(t('https://iptv.example.invalid/?token=abc','lo'),'https://iptv.example.invalid/?token=abc');
});
test('selected display language includes 17 options, with no external translation requests',()=>{
 assert.equal(Object.keys(engine().locales).length,17);
 assert.ok(!/fetch\(.*translate/i.test(source));
});
