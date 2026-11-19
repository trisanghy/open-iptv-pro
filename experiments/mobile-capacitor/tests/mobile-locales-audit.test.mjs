import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const core=fs.readFileSync(path.join(root,'public/i18n.js'),'utf8');
const source=fs.readFileSync(path.join(root,'public/languages.bundle.js'),'utf8');
const scripts=['mobile-locales.js','mobile-core-locales.js',
 'mobile-locales-fr-de-it.js','mobile-locales-ja-id-hi-ar.js','mobile-locales-es-pt-th-km.js',
 'mobile-core-fr-de-it.js','mobile-core-ja-id-hi-ar.js','mobile-core-es-pt-th-km.js','mobile-rights-locales.js',
 'mobile-rights-extra.js','mobile-rights-actions.js','mobile-rights-en.js','mobile-status-locales.js'];
function load(){
 const ctx={window:{}};
 vm.runInNewContext(source,ctx,{timeout:1000});
 for(const script of scripts)
  vm.runInNewContext(fs.readFileSync(path.join(root,'public',script),'utf8'),ctx,{timeout:1000});
 return ctx.window.OPEN_IPTV_TRANSLATIONS;
}

test('all 13 offline supplement scripts load in guaranteed order before i18n and app main',()=>{
 const scriptsInHTML=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(x=>x[1]);
 const start=scriptsInHTML.indexOf('/languages.bundle.js'),end=scriptsInHTML.indexOf('/i18n.js');
 assert.ok(start>=0&&end>start);
 assert.deepEqual(scriptsInHTML.slice(start+1,end),scripts.map(x=>'/'+x));
 assert.ok(html.includes('src="/src/main.js"'));
});

test('all non-Vietnamese language options have native dictionaries for all 58 Mobile-specific strings',()=>{
 const strings=JSON.parse(core.match(/const mobileUiEnglish=(\{.*?\});\s*\n/)[1]);
 const dict=load();
 const languages=['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 for(const code of languages){
  let sharedTechnicalWords=0;
  const values={...dict[code],...(code==='en'?strings:{})};
  assert.ok(values,'Missing '+code);
  for(const [key,english] of Object.entries(strings)){
   assert.ok(values[key],code+' missing key '+key);
   if(code!=='en'){
    // Shared technical words (e.g. German "Streams") are legitimate translations.
    if(values[key]===english)sharedTechnicalWords++;
    assert.notEqual(values[key],key,code+' falls back to Vietnamese: '+key);
   }
  }
  if(code!=='en')assert.ok(sharedTechnicalWords<=4,code+' has '+sharedTechnicalWords+' UI strings still identical to English');
 }
});

test('Chinese, Lao, Korean and Russian also translate high-frequency player/menu/settings terms',()=>{
 const dict=load();
 for(const lang of ['zh-CN','lo','ko','ru']){
  for(const key of ['Chưa chọn kênh','Khung hình','Link phát','Nghe nền','Kênh vừa xem',
    'Nguồn','Yêu thích','Cài đặt','Tự động PiP khi rời ứng dụng','Tải EPG ngay','Lưu dự phòng']){
   assert.ok(dict[lang][key],lang+' missing '+key);
   assert.notEqual(dict[lang][key],key,lang+' untranslated '+key);
  }
 }
});

test('non-English locales do not silently fall back to English; playlist names remain protected',()=>{
 assert.match(core,/if\(!out && language==='en'\)out=english\[compact\]/);
 assert.doesNotMatch(core,/let out=dict\[compact\]\|\|english\[compact\]/);
 assert.match(core,/\.ch-info b/);
 assert.match(core,/\.recent-channel-copy strong/);
 assert.match(core,/locale==='ar'\?'rtl':'ltr'/);
 const main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
 assert.match(main,/title\.dataset\.i18nIgnore=c\?'true':'false'/);
 assert.match(main,/nowName\.dataset\.i18nIgnore=result\.current/);
});

test('no duplicate UI ids introduced in the original layout',()=>{
 const layout=fs.readFileSync(path.join(root,'src/legacy-mobile-layout.mjs'),'utf8');
 const ids=[...layout.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size);
});

test('usage-rights and discovery dialogs are localized in four requested languages',()=>{
 const dict=load();
 for(const locale of ['zh-CN','lo','ko','ru']){
  for(const label of ['Tôi có quyền truy cập và sử dụng các nguồn này.',
    'Tôi đã kiểm tra điều khoản và quyền của bên cung cấp danh mục.',
    'Tôi xác nhận và tiếp tục','Xác nhận điều khoản Discovery',
    'Điều khoản Smart Discovery']){
   assert.ok(dict[locale][label],locale+' missing '+label);
   assert.notEqual(dict[locale][label],label,locale+' fallback '+label);
  }
 }
});

test('all 17 locales include rights, Smart Discovery and backup confirmation messages',()=>{
 const dict=load();
 for(const locale of ['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']){
  for(const key of [
   'Chỉ nhập playlist và xem nội dung khi bạn có quyền hợp pháp. Ứng dụng không cung cấp kênh IPTV. Người dùng chịu trách nhiệm về nguồn đã nhập; giới hạn trách nhiệm của tác giả chỉ trong phạm vi pháp luật cho phép.',
   'Tôi có quyền truy cập và sử dụng các nguồn này.',
   'Tôi đã kiểm tra điều khoản và quyền của bên cung cấp danh mục.',
   'Tôi xác nhận và tiếp tục',
   'Thay thế toàn bộ playlist, yêu thích và cài đặt Mobile hiện tại? Hãy sao lưu trước khi tiếp tục.',
   'Điều khoản Smart Discovery'
  ]){
   assert.ok(dict[locale][key],locale+' missing rights translation: '+key);
   assert.notEqual(dict[locale][key],key);
  }
 }
});
