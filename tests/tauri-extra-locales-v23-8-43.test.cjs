'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
function create(){
 const window={};const document={documentElement:{},readyState:'loading',addEventListener(){}};
 class MutationObserver{observe(){}}
 const ctx={window,document,MutationObserver,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class{}};
 for(const path of ['renderer/languages.bundle.js','renderer/locales/rustlab-expanded-v23-8-40.js','renderer/locales/rustlab-extra-v23-8-43.js','renderer/i18n.js'])
  vm.runInNewContext(read(path),ctx,{timeout:8000});
 return window.OpenIPTVI18n;
}
test('expanded offline UI translates key settings Doctor recording EPG and folders into nine additional languages',()=>{
 const t=create();
 for(const language of ['fr','de','it','ja','ko','ru','id','hi','ar']){
  for(const key of ['⏺ Lịch ghi','Lưu lịch ghi','✓ Kiểm tra link sâu','↻ Tải lại EPG','▤ Mở thư mục ghi','▣ Giám sát hình ảnh đang phát','⚙ Cài đặt Open IPTV Pro','⏪ Thời lượng tua lại']){
   const actual=t.t(key,language),english=t.t(key,'en');
   assert.notEqual(actual,key,language+' must not display Vietnamese: '+key);
   assert.notEqual(actual,english,language+' must not fall back to English: '+key);
  }
 }
});
test('preserves video, playlists and channel titles and honors offline locale switching',()=>{
 const t=create();
 assert.equal(t.t('VTV1 Thời sự Việt Nam','ko'),'VTV1 Thời sự Việt Nam');
 assert.equal(t.t('BBC News','ru'),'BBC News');
 assert.equal(t.t('M3U custom group','zh-CN'),'M3U custom group');
 for(const language of ['ko','ru','ja','ar'])assert.equal(typeof t.t('Kênh yêu thích',language),'string');
 const html=read('renderer/index.html');
 const names=['languages.bundle.js','locales/rustlab-expanded-v23-8-40.js','locales/rustlab-extra-v23-8-43.js','i18n.js'];
 const positions=names.map(name=>html.indexOf('src="'+name+'"'));
 assert.ok(positions.every(x=>x>=0)&&positions.every((x,i)=>i===0||x>positions[i-1]),'load dictionaries before engine');
 assert.ok(!read('renderer/locales/rustlab-extra-v23-8-43.js').includes('fetch('),'offline dictionary must not use network');
});
test('English Rust-specific labels and locale-specific counters never regress',()=>{
 const t=create();
 assert.equal(t.t('Chương trình tiếp theo','en'),'Next program');
 assert.equal(t.t('Đang dùng: 4 luồng','en'),'Using: 4 workers');
 assert.equal(t.t('Chưa có chương trình','en'),'No program available');
 assert.notEqual(t.t('● Sống 2 · ● Die 1 · ● Chưa rõ 3','ko'),t.t('● Sống 2 · ● Die 1 · ● Chưa rõ 3','en'));
 assert.notEqual(t.t('Chưa có chương trình','ja'),t.t('Chưa có chương trình','en'));
});
