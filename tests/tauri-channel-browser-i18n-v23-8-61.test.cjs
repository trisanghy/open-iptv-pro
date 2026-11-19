'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('counter-card headings and see-all arrows use native translations in 16 locales',()=>{
 const w={};vm.runInNewContext(read('renderer/locales/rustlab-channel-browser-v23-8-60.js'),{window:w});
 for(const [lang,dict] of Object.entries(w.OPEN_IPTV_TRANSLATIONS)){
  for(const key of ['☆ Yêu thích (','◷ Xem gần đây (','Xem tất cả ›']){
   assert.ok(dict[key],lang+' missing '+key);
   assert.notEqual(dict[key],key,lang+' still Vietnamese');
   if(lang!=='en')assert.notEqual(dict[key],w.OPEN_IPTV_TRANSLATIONS.en[key],lang+' English fallback '+key);
  }
 }
 const html=read('renderer/index.html');
 for(const key of ['☆ Yêu thích (','◷ Xem gần đây (','Xem tất cả ›'])
  assert.ok(html.includes(key),key+' not present in DOM');
});
