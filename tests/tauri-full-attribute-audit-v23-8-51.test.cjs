'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {audit,auditAttributes,auditDictionary,engine}=require('../scripts/audit-rustlab-l10n.cjs');
test('every static UI and accessibility attribute localized to all 17 languages',()=>{
 const textAudit=audit(),attributeAudit=auditAttributes();
 assert.ok(textAudit.total>=350 && attributeAudit.total>=101,'Audit unexpectedly lost UI labels');
 for(const [language,stats] of Object.entries(textAudit.byLocale))
  assert.equal(stats.localized,textAudit.total,language+' missing static text: '+stats.missing.join(' | '));
 for(const [language,stats] of Object.entries(attributeAudit.byLocale))
  assert.equal(stats.localized,attributeAudit.total,language+' missing title/placeholder/aria-label: '+stats.missing.join(' | '));
});
test('dictionary-wide audit explicitly reports untranslated dynamic UI instead of conflating it with static coverage',()=>{
 const result=auditDictionary();
 assert.ok(result.total>=1200,'Unexpectedly small English UI dictionary');
 for(const [language,stats] of Object.entries(result.byLocale)){
  assert.ok(stats.localized>300,language+' suspiciously few translations');
  assert.equal(stats.total,result.total);
  assert.ok(Array.isArray(stats.missing));
 }
});
test('user-provided channel metadata remains verbatim',()=>{
 const t=engine().t;
 for(const l of ['zh-CN','lo','ko','ru','fr','ar']){
  assert.equal(t('VTV1 Thời sự Việt Nam',l),'VTV1 Thời sự Việt Nam');
  assert.equal(t('M3U custom group',l),'M3U custom group');
 }
});
