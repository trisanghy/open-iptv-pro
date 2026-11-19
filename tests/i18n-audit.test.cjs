'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {audit,engine}=require('../scripts/audit-electron-i18n.cjs');
test('coverage audit enumerates every installed desktop locale without changing source content',()=>{
 const report=audit(),codes=report.results.map(x=>x.code);
 assert.equal(codes.length,16);
 assert.equal(report.total>550,true);
 for(const code of ['zh-CN','lo','ko','ru','fr','de','it','ja','id','hi','ar','es','pt-BR','th','km','en'])assert.ok(codes.includes(code));
 const i=engine();
 for(const code of codes){assert.equal(i.t('https://example.org/media.m3u8',code),'https://example.org/media.m3u8');assert.equal(i.t('VTV1',code),'VTV1');}
});
test('native translations do not regress across priority and other supported languages',()=>{
 const report=audit(),langs=Object.fromEntries(report.results.map(x=>[x.code,x.localized]));
 for(const code of ['zh-CN','lo'])assert.ok(langs[code]>=340,code+': '+langs[code]);
 for(const code of ['ko','ru'])assert.ok(langs[code]>=235,code+': '+langs[code]);
 for(const code of ['es','pt-BR','th','km'])assert.ok(langs[code]>=290,code+': '+langs[code]);
 for(const code of ['fr','de','it','ja','id','hi','ar'])assert.ok(langs[code]>=105,code+': '+langs[code]);
});
