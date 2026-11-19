'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function engine(){
 const window={};const document={documentElement:{},readyState:'loading',addEventListener(){}};
 class MutationObserver{observe(){}}
 const ctx={window,document,MutationObserver,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class{}};
 for(const p of ['renderer/languages.bundle.js','renderer/locales/rustlab-expanded-v23-8-40.js','renderer/i18n.js'])
   vm.runInNewContext(read(p),ctx,{timeout:5000});
 return {i18n:window.OpenIPTVI18n,dict:window.OPEN_IPTV_TRANSLATIONS};
}
test('all supported locales have native critical UI strings',()=>{
 const {i18n,dict}=engine();
 const locales=['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 const phrases=['Xem truyền hình','Cài đặt','Kênh yêu thích','Danh sách kênh','Chưa có chương trình','Chọn link phát'];
 for(const locale of locales){
  assert.ok(Object.keys(dict[locale]||{}).length>=90,'Insufficient translations '+locale);
  for(const source of phrases){
   assert.notEqual(i18n.t(source,locale),source,locale+': Vietnamese label '+source);
   assert.notEqual(i18n.t(source,locale),i18n.t(source,'en'),locale+': English fallback '+source);
  }
 }
});
test('four priority locales have specialized consent, AI and PiP translations',()=>{
 const {i18n}=engine();
 for(const locale of ['zh-CN','lo','ko','ru'])
  for(const key of ['Kiểm tra Whisper…','Kiểm tra TTS…','Mở PiP khi chuyển khỏi Xem truyền hình','Quyền sử dụng file M3U','Tôi xác nhận có quyền hợp pháp để truy cập và sử dụng nội dung trong nguồn này, tự chịu trách nhiệm về playlist, dữ liệu và việc xem.']){
   assert.notEqual(i18n.t(key,locale),key,locale+': '+key);
   assert.notEqual(i18n.t(key,locale),i18n.t(key,'en'),locale+': English fallback '+key);
  }
});
test('all UI count and status messages follow selected locale',()=>{
 const {i18n}=engine();
 for(const locale of ['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'])
  for(const original of ['10 kênh','4 luồng','Đang dùng: 4 luồng','2/10 kênh','● Sống 2 · ● Die 1 · ● Chưa rõ 3','✓ Có ảnh 2 · ✕ Lỗi 1']){
   assert.notEqual(i18n.t(original,locale),original,locale+': Vietnamese '+original);
   assert.notEqual(i18n.t(original,locale),i18n.t(original,'en'),locale+': English '+original);
  }
});
test('English UI aliases localize but user channel names stay intact',()=>{
 const {i18n}=engine();
 assert.equal(i18n.t('Settings','ko'),'설정');
 assert.equal(i18n.t('Watch TV','ru'),'Смотреть ТВ');
 assert.equal(i18n.t('VTV1 Thời sự Việt Nam','ko'),'VTV1 Thời sự Việt Nam');
 assert.equal(i18n.t('M3U custom group','zh-CN'),'M3U custom group');
 const html=read('renderer/index.html');
 const order=['languages.bundle.js','locales/rustlab-expanded-v23-8-40.js','i18n.js'].map(s=>html.indexOf('src="'+s+'"'));
 assert.ok(order.every(x=>x>=0)&&order[0]<order[1]&&order[1]<order[2]);
 assert.ok(!read('renderer/locales/rustlab-expanded-v23-8-40.js').includes('fetch('));
});
