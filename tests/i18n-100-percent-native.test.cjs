'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-electron-i18n.cjs');
test('all 17 Electron languages translate every audited static UI label',()=>{
 const report=audit();
 assert.ok(report.total>=1100);
 for(const lang of report.results)
  assert.deepEqual(lang.untranslated,[],lang.code+' missing native UI strings');
});
test('names and stream URLs from user playlists are unchanged',()=>{
 const e=engine();
 for(const lang of Object.keys(e.locales))
  for(const data of ['VTV1','Channel XYZ','https://example.com/live.m3u8'])
   assert.equal(e.t(data,lang),data);
});

test('live status and plural counts are localized instead of falling back to English',()=>{
 const e=engine(),english=e.t('● Sống 2 · ● Die 1 · ● Chưa rõ 0','en');
 for(const lang of Object.keys(e.locales).filter(x=>x!=='vi')){
  const current=e.t('● Sống 2 · ● Die 1 · ● Chưa rõ 0',lang);
  assert.notEqual(current,'● Sống 2 · ● Die 1 · ● Chưa rõ 0',lang);
  if(lang!=='en')assert.notEqual(current,english,lang);
 }
 assert.equal(e.t('1 luồng','ru'),'1 поток');
 assert.equal(e.t('4 luồng','ru'),'4 потока');
 assert.equal(e.t('5 luồng','ru'),'5 потоков');
});
test('offline translation bundles never fetch user content to translate',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const pack=fs.readFileSync(path.join(__dirname,'../renderer/i18n-full-locale-pack.js'),'utf8');
 assert.ok(pack.length>10000);
 assert.doesNotMatch(pack,/fetch\s*\(|XMLHttpRequest|WebSocket/);
});
