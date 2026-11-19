'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('all new channel browser accessibility labels use native translations in all supported languages',()=>{
 const w={};vm.runInNewContext(read('renderer/locales/rustlab-channel-browser-v23-8-60.js'),{window:w});
 const keys=['Danh sách chọn kênh','Nhóm kênh','Tìm kiếm kênh','Sắp xếp kênh','Kiểu hiển thị','Kênh truy cập nhanh'];
 const en=w.OPEN_IPTV_TRANSLATIONS.en;
 const html=read('renderer/index.html');
 for(const key of keys)assert.ok(html.includes('="'+key+'"'),key);
 for(const [lang,dict] of Object.entries(w.OPEN_IPTV_TRANSLATIONS))
  for(const key of keys){
   assert.ok(dict[key],lang+': missing '+key);
   assert.notEqual(dict[key],key,lang+': Vietnamese fallback '+key);
   if(lang!=='en')assert.notEqual(dict[key],en[key],lang+': English fallback '+key);
  }
});
