'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'renderer/i18n.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'renderer/languages.bundle.js'),'utf8');
const dict=JSON.parse(bundle.slice(bundle.indexOf('window.OPEN_IPTV_TRANSLATIONS=')+'window.OPEN_IPTV_TRANSLATIONS='.length).replace(/;\s*$/,''));
function engine(){
 const el={};
 const doc={documentElement:el,readyState:'loading',addEventListener(){}};
 class MutationObserver{observe(){}}
 const window={OPEN_IPTV_TRANSLATIONS:structuredClone(dict)};
 vm.runInNewContext(code,{window,document:doc,MutationObserver,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class {}},{timeout:5000});
 return window.OpenIPTVI18n;
}
test('all 17 locales selectable without network or data mutation',()=>{
 const i=engine();
 const expected=['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 assert.deepEqual(Object.keys(i.locales).sort(),expected.sort());
 assert.equal(i.t('Xem truyền hình','fr'),'Regarder la TV');
 assert.equal(i.t('Xem truyền hình','ja'),'テレビを見る');
 assert.equal(i.t('Xem truyền hình','ar'),'مشاهدة التلفزيون');
 assert.equal(i.t('Xem truyền hình','vi'),'Xem truyền hình');
});
test('untranslated settings text falls back to English, not Vietnamese',()=>{
 const i=engine();
 assert.equal(i.t('Chưa có chương trình','ja'),'番組情報なし');
 assert.equal(i.t('Chưa có chương trình','en'),'No program available');
 assert.match(i.t('↻ Tải lại EPG','de'),/Reload EPG/);
 assert.match(i.t('Whisper dùng để nhận diện tiếng nói trên máy; chọn bộ dịch offline và giọng TTS ngay tại đây.','fr'),/Whisper transcribes audio locally/);
 assert.equal(i.t('3 kênh','en'),'3 channels');
 assert.equal(i.t('M3U custom group','en'),'M3U custom group');
});
test('UI labels from Web and Mobile translate instead of leaving Vietnamese',()=>{
 const i=engine();
 const pairs={
  'Tài khoản & Đồng bộ đám mây':'Account & Cloud Sync',
  'Âm thanh khi khóa màn hình':'Audio on the lock screen',
  'Thêm tính năng':'More features',
  'Chưa có nguồn. Hãy mở file M3U, thêm URL hoặc nhập repo công khai.':'No sources yet. Open an M3U file, add a URL, or import a public repository.',
  'Đã lưu 3 link dự phòng':'Saved 3 backup URLs',
  'Đã đăng nhập · Someone':'Signed in · Someone'
 };
 for(const [vi,en] of Object.entries(pairs))assert.equal(i.t(vi,'en'),en,vi);
 assert.equal(i.t('VTV5 Tây Nguyên','en'),'VTV5 Tây Nguyên');
});
test('at least 80 percent of static Vietnamese interface labels have a translation',()=>{
 const ui=fs.readFileSync(path.join(root,'renderer/index.html'),'utf8');
 const labels=[...new Set([...ui.matchAll(/>([^<>]{2,300})</g)].map(m=>m[1].trim()).filter(x=>/[À-ỹ]/.test(x)))];
 const i=engine();
 const translated=labels.filter(x=>i.t(x,'en')!==x).length;
 assert.ok(labels.length>=300);
 assert.ok(translated/labels.length>=0.80,`translated ${translated}/${labels.length}`);
});
