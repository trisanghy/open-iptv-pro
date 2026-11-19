import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const layout=fs.readFileSync(path.join(root,'src/legacy-mobile-layout.mjs'),'utf8');
const source=fs.readFileSync(path.join(root,'public/i18n.js'),'utf8');
const supplementary=[
 'mobile-accessibility-complete.js','mobile-accessibility-rest.js',
 'mobile-operation-locales.js','mobile-operation-rest-a.js','mobile-operation-rest-b.js',
 'mobile-background-locales.js','mobile-background-rest.js'
];
const languages=['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(x=>x[1]);
const publicFiles=scripts.filter(x=>x.endsWith('.js')&&x!=='/i18n.js'&&x!=='/src/main.js');
function buildDictionary(){
 const ctx={window:{},console};
 for(const file of publicFiles)vm.runInNewContext(fs.readFileSync(path.join(root,'public',file.slice(1)),'utf8'),ctx,{timeout:2000});
 return ctx.window.OPEN_IPTV_TRANSLATIONS;
}
function completionKeys(){
 const set=new Set();
 for(const file of supplementary){
  const code=fs.readFileSync(path.join(root,'public',file),'utf8');
  const match=code.match(/keys=(\[[^\n]*?\])(?:[,;])/);
  assert.ok(match,'missing explicit key list in '+file);
  for(const key of JSON.parse(match[1]))set.add(key);
 }
 return [...set];
}
test('Mobile localization supplements are installed before the translation engine',()=>{
 const end=scripts.indexOf('/i18n.js');
 assert.ok(end>0&&scripts.indexOf('/languages.bundle.js')<end);
 for(const p of supplementary){
  const i=scripts.indexOf('/'+p);
  assert.ok(i>0&&i<end,'missing '+p);
 }
 assert.ok(scripts.indexOf('/src/main.js')>end);
});
test('100% of added accessibility, M3U, EPG and background-audio keys exist in every non-Vietnamese locale',()=>{
 const dict=buildDictionary(), keys=completionKeys();
 assert.equal(keys.length,83,'expected fixed completion contract; update test if it changes');
 for(const code of languages){
  const missing=keys.filter(k=>!dict[code]?.[k]||dict[code][k]===k);
  assert.deepEqual(missing,[],'untranslated Mobile labels in '+code);
 }
});
test('all static Mobile player accessibility labels and Vietnamese UI text have translations',()=>{
 const dict=buildDictionary();
 const strings=new Set();
 for(const m of layout.matchAll(/(?:aria-label|placeholder|title)="([^"]+)"/g)){
  const value=m[1].trim();
  if(/[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/u.test(value))strings.add(value);
 }
 for(const m of layout.matchAll(/>([^<>]+)</g)){
  const value=m[1].trim();
  if(/[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/u.test(value)&&!value.includes('&&!/^0\s*\/\s*0\s+kênh$/.test(value)&&value!=='Tiếng Việt')strings.add(value);
 }
 for(const locale of languages){
  const missing=[];
  for(const original of strings){
   const withoutDecoration=original.replace(/^[^\p{L}\p{N}]+/u,'');
   const key=dict[locale]?.[original]?original:withoutDecoration;
   if(!dict[locale]?.[key]||dict[locale][key]===key)missing.push(original);
  }
  assert.deepEqual(missing,[],'untranslated visible/accessibility layout content for '+locale);
 }
});
test('17 language choices localize complete player/EPG/error strings without translating user metadata',()=>{
 const dict=buildDictionary();
 const state={saved:{}};
 const element={nodeType:1,hasAttribute:()=>false,closest:()=>null};
 const dom={readyState:'interactive',documentElement:{...element},body:{...element},
  getElementById(){return null;},
  createTreeWalker(){return {nextNode:()=>false};},
  addEventListener(){},dispatchEvent(){}};
 const context={window:{OPEN_IPTV_TRANSLATIONS:dict},document:dom,console,
  NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},MutationObserver:class {observe(){}},
  localStorage:{getItem:()=>null,setItem(k,v){state.saved[k]=v;}},
  CustomEvent:class {}};
 vm.runInNewContext(source,context,{timeout:2000});
 const i18n=context.window.OpenIPTVI18n;
 const samples=['Khu vực trình phát','Bật hoặc tắt âm thanh','URL M3U mới','Chưa chọn nguồn EPG',
  'Không tải được nguồn EPG nào; giữ dữ liệu cũ','Âm thanh nền bị lỗi. Hãy thử kênh hoặc link khác.'];
 for(const locale of languages){
  i18n.setLanguage(locale);
  assert.equal(dom.documentElement.lang,locale);
  assert.equal(dom.documentElement.dir,locale==='ar'?'rtl':'ltr');
  for(const label of samples){
   const output=i18n.t(label,locale);
   assert.ok(output&&output!==label,locale+' failed translation: '+label);
  }
 }
 assert.equal(state.saved['open-iptv-pro-language'],'ar');
 const arbitrary='My VTV custom - Épisode 第一集';
 assert.equal(i18n.t(arbitrary,'ko'),arbitrary,'do not machine-translate user channel/EPG metadata');
});
+'{')&&!/^0\s*\/\s*0\s+kênh$/.test(value)&&value!=='Tiếng Việt')strings.add(value);
 }
 for(const locale of languages){
  const missing=[];
  for(const original of strings){
   const withoutDecoration=original.replace(/^[^\p{L}\p{N}]+/u,'');
   const key=dict[locale]?.[original]?original:withoutDecoration;
   if(!dict[locale]?.[key]||dict[locale][key]===key)missing.push(original);
  }
  assert.deepEqual(missing,[],'untranslated visible/accessibility layout content for '+locale);
 }
});
test('17 language choices localize complete player/EPG/error strings without translating user metadata',()=>{
 const dict=buildDictionary();
 const state={saved:{}};
 const element={nodeType:1,hasAttribute:()=>false,closest:()=>null};
 const dom={readyState:'interactive',documentElement:{...element},body:{...element},
  getElementById(){return null;},
  createTreeWalker(){return {nextNode:()=>false};},
  addEventListener(){},dispatchEvent(){}};
 const context={window:{OPEN_IPTV_TRANSLATIONS:dict},document:dom,console,
  NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},MutationObserver:class {observe(){}},
  localStorage:{getItem:()=>null,setItem(k,v){state.saved[k]=v;}},
  CustomEvent:class {}};
 vm.runInNewContext(source,context,{timeout:2000});
 const i18n=context.window.OpenIPTVI18n;
 const samples=['Khu vực trình phát','Bật hoặc tắt âm thanh','URL M3U mới','Chưa chọn nguồn EPG',
  'Không tải được nguồn EPG nào; giữ dữ liệu cũ','Âm thanh nền bị lỗi. Hãy thử kênh hoặc link khác.'];
 for(const locale of languages){
  i18n.setLanguage(locale);
  assert.equal(dom.documentElement.lang,locale);
  assert.equal(dom.documentElement.dir,locale==='ar'?'rtl':'ltr');
  for(const label of samples){
   const output=i18n.t(label,locale);
   assert.ok(output&&output!==label,locale+' failed translation: '+label);
  }
 }
 assert.equal(state.saved['open-iptv-pro-language'],'ar');
 const arbitrary='My VTV custom - Épisode 第一集';
 assert.equal(i18n.t(arbitrary,'ko'),arbitrary,'do not machine-translate user channel/EPG metadata');
});
