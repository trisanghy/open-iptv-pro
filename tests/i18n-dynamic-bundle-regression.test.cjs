'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {audit,engine}=require('../scripts/audit-electron-i18n.cjs');
const file=path.resolve(__dirname,'../renderer/i18n-dynamic-locales.js');
function bundle(){
 const sandbox={window:{}};
 vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{timeout:10000});
 return sandbox.window.OpenIPTVDynamicLocales;
}
const countries=['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
test('all native UI languages have a verified offline pack of dynamic renderer strings',()=>{
 const api=bundle();
 assert.equal(api.templateKeys.length,130,'Expected the authored dynamic template audit count');
 for(const lang of countries){
  assert.ok(Object.keys(api.static[lang]||{}).length>=220,'Missing static popup strings in '+lang);
  const value=api.translate('Đã chọn 12 kênh',lang);
  assert.ok(value&&value.includes('12')&&value!=='Đã chọn 12 kênh',lang+': '+value);
 }
});
test('native modal interpolation preserves all channel/program values and never translates user data',()=>{
 const api=bundle();
 const dialogue=api.templateKeys.find(k=>k.startsWith('Hẹn ghi chương trình?')&&k.includes('IPTVSLOTTHREE'));
 assert.ok(dialogue,'DVR confirmation template missing');
 const slots=['IPTVSLOTZERO','IPTVSLOTONE','IPTVSLOTTWO','IPTVSLOTTHREE','IPTVSLOTFOUR'];
 const values=['PROGRAM_X','VTV1_CHANNEL','START_0930','END_1045','USER_FILE'];
 const populated=dialogue.replace(/IPTVSLOT(?:ZERO|ONE|TWO|THREE|FOUR)/g,mark=>values[slots.indexOf(mark)]);
 for(const lang of countries){
  const translated=api.translate(populated,lang);
  assert.ok(translated,'No DVR popup translation in '+lang);
  for(const mark of dialogue.match(/IPTVSLOT(?:ZERO|ONE|TWO|THREE|FOUR)/g)||[])
   assert.ok(translated.includes(values[slots.indexOf(mark)]),lang+' lost the '+mark+' field');
  assert.equal(api.translate('https://example.com/live.m3u8',lang),null);
  assert.equal(api.translate('VTV1',lang),null);
 }
});
test('runtime localizer applies dynamic translations and retains the complete 1133-key static audit',()=>{
 const i=engine();
 for(const lang of countries){
  const label=i.t('Đã chọn 12 kênh',lang);
  assert.ok(label.includes('12')&&label!=='Đã chọn 12 kênh',lang+': '+label);
  assert.equal(i.t('VTV1',lang),'VTV1');
 }
 const report=audit();assert.ok(report.total>=1100);
 for(const lang of report.results)assert.deepEqual(lang.untranslated,[],lang.code+' missing static UI strings');
});
