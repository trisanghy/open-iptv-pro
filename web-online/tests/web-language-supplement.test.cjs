'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const pack=fs.readFileSync(path.join(root,'web-online/web-language-supplement.js'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const bundle=fs.readFileSync(path.join(root,'languages.bundle.js'),'utf8');
const source=fs.readFileSync(path.join(root,'i18n.js'),'utf8');
const marker='window.OPEN_IPTV_TRANSLATIONS=';
const data=JSON.parse(bundle.slice(bundle.indexOf(marker)+marker.length).replace(/;\\s*$/,''));
function loaded(){
  const ctx={window:{OPEN_IPTV_TRANSLATIONS:structuredClone(data)}};
  vm.runInNewContext(pack,ctx,{timeout:3000});
  return ctx.window.OPEN_IPTV_TRANSLATIONS;
}
test('native Web supplement has all 28 labels for each of the 15 non-English locales',()=>{
  const dict=loaded();
  const languages=['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
  const keys=['📖 Hướng dẫn Web','Tải phần mềm','Đã chọn 0 kênh','Chuyển','Video có thể tua',
    'KÊNH HIỆN TẠI','Chưa có EPG cho kênh này','Xem lịch phát sóng','Xem EPG đầy đủ ›',
    '■ Dừng 4 kênh','↻ Cập nhật','URL dự phòng (mỗi dòng một link)',
    'Nhanh (7 giây)','Cân bằng (12 giây)','Ổn định (25 giây)','↻ Tải lại EPG',
    'Đang tải thư mục…','Đặt lại màu mặc định','Trạng thái','Chưa tìm thiết bị',
    '⌕ Tìm TV','▶ Phát trên TV đã chọn','⧉ Sao chép','■ Dừng truyền',
    'Tải Open IPTV Pro cho điện thoại','◉ Mở AirPlay trong Safari','Chưa kết nối thiết bị.','Chờ có hình rồi chụp'];
  for(const lang of languages)for(const key of keys){
    assert.equal(typeof dict[lang]?.[key],'string',lang+': '+key);
    assert.ok(dict[lang][key]&&dict[lang][key]!==key,lang+' unchanged: '+key);
  }
  assert.equal(dict['zh-CN']['KÊNH HIỆN TẠI'],'当前频道');
  assert.equal(dict.lo['Chưa có EPG cho kênh này'],'ບໍ່ມີ EPG ສຳລັບຊ່ອງນີ້');
  assert.equal(dict.fr['Chưa tìm thiết bị'],'Aucun appareil trouvé');
});
test('runtime loads Web language supplements while keeping user IPTV metadata intact',()=>{
  const document={documentElement:{},readyState:'loading',addEventListener(){}};
  class MutationObserver{observe(){}}
  const window={OPEN_IPTV_TRANSLATIONS:loaded()};
  vm.runInNewContext(source,{window,document,MutationObserver,localStorage:{getItem(){return null},setItem(){}},CustomEvent:class{}},{timeout:5000});
  const t=window.OpenIPTVI18n.t;
  for(const lang of ['fr','es','ar','hi','zh-CN']){
    assert.notEqual(t('Chưa có EPG cho kênh này',lang),'No EPG available for this channel');
    assert.equal(t('VTV5 Tây Nguyên',lang),'VTV5 Tây Nguyên');
    assert.equal(t('https://example.invalid/stream?token=abc',lang),'https://example.invalid/stream?token=abc');
  }
});
test('Web pack is copied, loaded before i18n, and cache-busted on every content change',()=>{
  assert.match(builder,/copy2\(Path\(__file__\)\.resolve\(\)\.parent\/'web-language-supplement\.js',out\/'web-language-supplement\.js'\)/);
  assert.match(builder,/<script src=\\"web-language-supplement\.js\\"><\\/script>/);
  assert.match(builder,/for asset in \('i18n\.js','languages\.bundle\.js','web-language-supplement\.js'\)/);
  assert.ok(!source.includes('web-language-supplement.js'),'Electron locale engine must stay separate');
});
