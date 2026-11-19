
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=fs.readFileSync(path.join(__dirname,'../renderer/i18n.js'),'utf8');
test('interface languages include 17 locales, independent of voice translation',()=>{
 for(const lang of ['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'])assert.ok(file.includes('"'+lang+'":'),lang);
 assert.match(file,/for\(const \[code,name\] of Object\.entries\(locales\)\)/);
 assert.match(file,/const option=document.createElement\('option'\)/);
});
test('translations fall back to English instead of untranslated Vietnamese when missing',()=>{
 assert.match(file,/let out=dict\[compact\]\|\|english\[compact\]/);
 assert.match(file,/if\(english\[prefixMatch\[2\]\]\)/);
 assert.match(file,/Object\.assign\(dictionaries\.en/);
 for(const item of ['Chưa có chương trình','Link phát','Tùy chỉnh phụ đề (CC)','Chọn ngôn ngữ ứng dụng.'])assert.ok(file.includes(item),item);
});
test('localization preserves user channel names and supports switching without network',()=>{
 assert.match(file,/const originalText=new WeakMap\(\)/);
 assert.match(file,/const key='open-iptv-pro-language'/);
 assert.match(file,/skipSelector=.*#playingTitle/);
 assert.ok(!file.includes('fetch('));
 new vm.Script(file);
});
