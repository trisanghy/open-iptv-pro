'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
test('German sorting labels are native, distinct from English and Vietnamese',()=>{
 const source=fs.readFileSync(path.join(root,'renderer/locales/rustlab-channel-browser-v23-8-60.js'),'utf8');
 const w={};vm.runInNewContext(source,{window:w});
 for(const label of ['Tên A → Z','Tên Z → A']){
  const de=w.OPEN_IPTV_TRANSLATIONS.de[label],en=w.OPEN_IPTV_TRANSLATIONS.en[label];
  assert.ok(de&&en);assert.notEqual(de,en);assert.notEqual(de,label);
 }
});