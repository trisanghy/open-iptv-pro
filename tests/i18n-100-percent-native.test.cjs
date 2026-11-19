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
