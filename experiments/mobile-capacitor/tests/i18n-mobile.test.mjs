import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const layout=fs.readFileSync(path.join(root,'src/legacy-mobile-layout.mjs'),'utf8');
const i18n=fs.readFileSync(path.join(root,'public/i18n.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'public/languages.bundle.js'),'utf8');
test('Capacitor Mobile exposes a display language chooser in Settings',()=>{
 assert.match(layout,/id="appLanguage"/);assert.match(layout,/for="appLanguage"/);
 assert.match(layout,/Ngôn ngữ giao diện/);assert.match(layout,/page-tools/);
 assert.match(html,/src="\/languages.bundle.js"/);assert.match(html,/src="\/i18n.js"/);
 assert.ok(html.indexOf('/languages.bundle.js')<html.indexOf('/i18n.js'));
});
test('Mobile embeds offline translations, 17 language options and persistence',()=>{
 for(const c of ['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']) assert.ok(i18n.includes('"'+c+'":'),c);
 assert.match(i18n,/open-iptv-pro-language/);
 assert.match(i18n,/const mobileUiEnglish=/);
 assert.match(i18n,/const collectionCastEnglish=/);
 assert.match(i18n,/const advancedUiEnglish=/);
 assert.match(i18n,/const appUiEnglish=/);
 assert.match(i18n,/const finishUiEnglish=/);
 assert.match(i18n,/Account & Cloud Sync/);
 assert.match(i18n,/Background audio/);
 assert.match(i18n,/Import an M3U playlist or choose a channel/);assert.match(i18n,/english\[compact\]/);
 assert.match(i18n,/channel-card \.channel-name/);
 assert.match(bundle,/window.OPEN_IPTV_TRANSLATIONS/);
});

test('all Mobile language supplements load in order before the translation engine',()=>{
 const scripts=['mobile-locales.js','mobile-core-locales.js','mobile-locales-fr-de-it.js','mobile-locales-ja-id-hi-ar.js','mobile-locales-es-pt-th-km.js','mobile-core-fr-de-it.js','mobile-core-ja-id-hi-ar.js','mobile-core-es-pt-th-km.js'];
 const docScripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
 const end=docScripts.indexOf('/i18n.js');
 assert.ok(end>0);
 assert.ok(docScripts.indexOf('/languages.bundle.js')<docScripts.indexOf('/mobile-locales.js'));
 for(const name of scripts)assert.ok(docScripts.indexOf('/'+name)>0&&docScripts.indexOf('/'+name)<end,name);
 const context={window:{},console};
 vm.runInNewContext(bundle,context);
 for(const name of scripts)vm.runInNewContext(fs.readFileSync(path.join(root,'public',name),'utf8'),context);
 for(const locale of ['zh-CN','lo','ko','ru','es','pt-BR','th','km','fr','de','it','ja','id','hi','ar']){
  const dictionary=context.window.OPEN_IPTV_TRANSLATIONS[locale];
  assert.ok(dictionary,locale);
  for(const key of ['Nhập M3U hoặc chọn kênh để xem','Thêm nguồn M3U','Nghe nền','Khung hình','Link phát','Chưa có lịch phát','Nguồn']){
   assert.ok(dictionary[key]&&dictionary[key]!==key,locale+' missing '+key);
  }
  assert.notEqual(dictionary['Nhập M3U hoặc chọn kênh để xem'],'Import an M3U playlist or choose a channel to watch');
 }
});
