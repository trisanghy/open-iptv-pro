'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-rustlab-l10n.cjs');
test('100% of explicitly audited static HTML UI labels are localized for every non-Vietnamese language',()=>{
 const result=audit();
 assert.ok(result.total>=350,'Audit unexpectedly removed UI elements');
 for(const [locale,info] of Object.entries(result.byLocale)){
  assert.equal(info.localized,result.total,locale+': missing native UI translations:\n'+info.missing.join('\n'));
 }
});
test('priority sources are translated without changing user content or technical model names',()=>{
 const t=engine().t;
 for(const locale of ['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']){
  for(const key of ['⏺ Lịch ghi','Doctor 3.0 · Xếp hạng chất lượng và link dự phòng','Chọn kênh bên trái, hoặc thêm playlist M3U để bắt đầu.','Chưa có EPG cho kênh này']){
   assert.notEqual(t(key,locale),key,locale+': Vietnamese fallback');
   assert.notEqual(t(key,locale),t(key,'en'),locale+': English fallback');
  }
  assert.equal(t('VTV1 Thời sự Việt Nam',locale),'VTV1 Thời sự Việt Nam');
  assert.equal(t('M3U custom group',locale),'M3U custom group');
 }
});
test('post-engine dictionary entries load before subsequent UI scripts',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const h=fs.readFileSync(path.resolve(__dirname,'../renderer/index.html'),'utf8');
 const before=h.indexOf('src="i18n.js"'),post=h.indexOf('src="locales/rustlab-postengine-v23-8-50.js"');
 assert.ok(before>=0 && post>before);
});
