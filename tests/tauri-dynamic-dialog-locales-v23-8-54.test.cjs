'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const samples=["Thư mục NEWS-DEMO chứa 3 kênh. Chuyển sang Khác rồi xóa?","Xóa thư mục trống NEWS-DEMO?","Ảnh cũ của NEWS-DEMO không còn liên kết URL. Mở kênh cùng tên hiện có?","Nguồn \"SOURCE-DEMO\" đang tắt. Bật nguồn này rồi xem kênh \"NEWS-DEMO\"?","Playlist mới chỉ có 8/30 kênh. Bạn vẫn muốn thay nguồn?","Xóa nguồn \"SOURCE-DEMO\" và tất cả kênh của nguồn này?","Cần chụp 80 luồng (12 kênh giữ ảnh còn mới), dùng 4 luồng FFmpeg cùng lúc. Tiếp tục?","Gộp 28 mục thành 20 kênh, có 8 link dự phòng?\n\nNguồn ban đầu được giữ lại nhưng tạm ẩn khỏi mục Xem TV. Không xóa kênh cũ.","Khôi phục nguồn đang hiển thị và playlist gộp trước lần áp dụng gần nhất?","Khôi phục thay đổi gần nhất của Doctor 2.0?","Hoàn tác link dự phòng mà Doctor 3.0 vừa thêm?","Dừng ghi ngay? Dữ liệu tạm sẽ được giữ dưới dạng .partial.ts (chưa phải MP4).","Bạn muốn hủy lịch ghi này?","Ứng dụng sẽ thoát để cài bản cập nhật. Tiếp tục?","Nhập PIN quản trị để mở khóa","Nhập 100 chương trình từ file \"DEMO-EPG.xml\"?\nDữ liệu EPG hiện tại sẽ được thay thế. Danh sách kênh và lịch ghi hình đã đặt không thay đổi.","Hẹn ghi chương trình?\n\nDEMO-SHOW\nKênh: NEWS-DEMO\nBắt đầu: 10:00\nKết thúc: 12:00\n\nPhải để Open IPTV Pro đang chạy và máy không ngủ. Ghi tối đa 1 chương trình cùng lúc.","Chuyển trạng thái NEWS-DEMO từ Die về Chưa rõ để kiểm tra lại?","Đề xuất thêm link của “SOURCE-DEMO” làm dự phòng cho “NEWS-DEMO”?\n\nHai ảnh có thể giống nhau vì đang phát cùng nội dung. Link sẽ CHỈ được thêm nếu kênh nguồn đã được xác minh Sống; không xóa/gộp kênh và không thay link chính.","Thêm URL của “SOURCE-DEMO” làm dự phòng cho “NEWS-DEMO”?\n\nChỉ thêm URL dự phòng. Không thay URL đang phát, không xóa kênh. Có thể hoàn tác.","KHÔI PHỤC DỮ LIỆU OPEN IPTV PRO?\n\nNgày sao lưu: 2026-11-19\nPhiên bản: 4.23\nNguồn: 3 | Kênh: 80 | Ảnh Snapshot: 12\nLịch ghi tương lai: 2 (chỉ khi file Backup hỗ trợ)\n\nToàn bộ playlist, kênh yêu thích, hồ sơ, thiết lập và dữ liệu hiện tại sẽ bị THAY THẾ.\n\nHãy sao lưu dữ liệu hiện tại trước khi tiếp tục.\n\nBạn đồng ý khôi phục và khởi động lại giao diện?"];
function setup(locale){
 const seen=[];const window={confirm:s=>{seen.push(s);return true;},prompt:s=>{seen.push(s);return 'TEST-PIN';},alert:s=>seen.push(s)};
 const document={documentElement:{},readyState:'loading',addEventListener(){}};
 class MutationObserver{observe(){}}
 const ctx={window,document,MutationObserver,localStorage:{getItem:()=>locale,setItem(){}},CustomEvent:class{}};
 for(const file of ['renderer/languages.bundle.js','renderer/locales/rustlab-dialog-templates-v23-8-54.js','renderer/i18n.js','renderer/dialog-localization-v23-8-54.js'])
  vm.runInNewContext(read(file),ctx,{timeout:8000,filename:file});
 return {window,seen};
}
test('all 21 native confirmation/restore/PIN dialogs have native text in all 16 target languages',()=>{
 for(const locale of ['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']){
  const {window,seen}=setup(locale);
  assert.equal(window.OpenIPTVDialogTemplates.rules.length,samples.length);
  for(const example of samples){
   const translated=window.OpenIPTVDialogTemplates.translate(example,locale);
   assert.ok(translated,locale+': untranslated template: '+example.slice(0,70));
   assert.notEqual(translated,example,locale+': raw Vietnamese dialog');
   if(locale!=='en')assert.notEqual(translated,window.OpenIPTVDialogTemplates.translate(example,'en'),locale+': English fallback');
   assert.equal(window.confirm(example),true);
   assert.equal(seen.at(-1),translated,locale+': native confirm was not localized');
  }
  assert.equal(window.prompt(samples[14]),'TEST-PIN');
  assert.equal(seen.at(-1),window.OpenIPTVDialogTemplates.translate(samples[14],locale));
 }
});
test('dialog templates retain dynamically supplied names, counts, file names and times',()=>{
 const {window}=setup('ja');
 const messages=Object.values(samples);
 for(const s of messages){
  const translation=window.OpenIPTVDialogTemplates.translate(s,'ja');
  if(s.includes('NEWS-DEMO'))assert.ok(translation.includes('NEWS-DEMO'),s);
  if(s.includes('DEMO-EPG.xml'))assert.ok(translation.includes('DEMO-EPG.xml'));
 }
 assert.equal(window.OpenIPTVDialogTemplates.translate('User IPTV channel “NEWS-DEMO”','ja'),null);
 assert.equal(window.confirm('User IPTV channel “NEWS-DEMO”'),true);
});
test('HTML loads dialog bridge after core i18n and before app entry and none of the dialog patches require a network',()=>{
 const html=read('renderer/index.html');
 const refs=['i18n.js','locales/rustlab-dialog-templates-v23-8-54.js','dialog-localization-v23-8-54.js','app-entry.js'];
 const positions=refs.map(x=>html.indexOf('src="'+x+'"'));
 assert.ok(positions.every(x=>x>=0)&&positions.every((x,i)=>!i||x>positions[i-1]));
 for(const f of ['renderer/locales/rustlab-dialog-templates-v23-8-54.js','renderer/dialog-localization-v23-8-54.js']){
  assert.doesNotMatch(read(f),/\bfetch\s*\(/);
  new vm.Script(read(f));
 }
});
