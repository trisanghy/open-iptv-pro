'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {engine}=require('../scripts/audit-rustlab-l10n.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const groups=[
 ['Hồ sơ trẻ em không có quyền Backup / Restore.','Đang kiểm tra file sao lưu…','Khôi phục thất bại; đã giữ lại dữ liệu trước đó'],
 ['Phát bị hủy','Lỗi mạng','Không có URL phát hợp lệ','Thu thập thất bại; dữ liệu cũ được giữ lại.','Hồ sơ trẻ em không được nhập nguồn'],
 ['Chưa đủ bằng chứng','Đã thêm URL dự phòng; có thể hoàn tác','Cảnh báo đứng hình','Không đủ bằng chứng xác minh video']
];
test('all 16 non-Vietnamese languages have native runtime statuses for backup, playback and Doctor',()=>{
 const t=engine().t;
 for(const lang of ['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'])
  for(const group of groups)for(const source of group){
   const local=t(source,lang);
   assert.notEqual(local,source,lang+': Vietnamese status '+source);
   if(lang!=='en')assert.notEqual(local,t(source,'en'),lang+': English status '+source);
  }
});
test('error prefixes translate without changing appended system diagnostics or user data',()=>{
 const t=engine().t;
 for(const lang of ['es','zh-CN','lo','ko','ru','fr','ar'])
  for(const prefix of ['Không sao lưu được:','Sao lưu thất bại:','Không thể khôi phục:']){
   const source=prefix+' ENOENT: DEMO_FILE';
   assert.equal(t(source,lang),t(prefix,lang)+' ENOENT: DEMO_FILE');
  }
 assert.equal(t('VTV1 Thời sự Việt Nam','ko'),'VTV1 Thời sự Việt Nam');
});
test('runtime source audit reports native coverage and outstanding static/dynamic strings honestly',()=>{
 const {collectLiterals,audit}=require('../scripts/audit-rustlab-runtime-l10n.cjs');
 const found=collectLiterals(),report=audit();
 assert.ok(found.phrases.length>350);
 assert.ok(found.templates.length>30);
 assert.equal(report.total,found.phrases.length);
 for(const locale of ['zh-CN','lo','ko','ru'])assert.ok(Array.isArray(report.byLocale[locale].missing));
});
test('runtime translation packs load offline before the core i18n engine',()=>{
 const html=read('renderer/index.html'),position=html.indexOf('src="i18n.js"');
 for(const part of ['rustlab-runtime-backup-v23-8-56.js','rustlab-runtime-source-v23-8-56.js','rustlab-runtime-doctor-v23-8-56.js']){
  const js=read('renderer/locales/'+part);
  assert.ok(html.indexOf('src="locales/'+part+'"')>=0);
  assert.ok(html.indexOf('src="locales/'+part+'"')<position);
  assert.doesNotMatch(js,/\bfetch\s*\(/);
  new vm.Script(js);
 }
});
