'use strict';
// Offline, deterministic audit of explicit static Rust Lab UI strings.
// Does not treat playlist/EPG metadata, names, voice identities as translatable.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const scripts=['renderer/languages.bundle.js','renderer/locales/rustlab-expanded-v23-8-40.js','renderer/locales/rustlab-extra-v23-8-43.js','renderer/locales/rustlab-shared-actions-v23-8-45.js','renderer/locales/rustlab-shared-help-v23-8-45.js','renderer/locales/rustlab-secondary-v23-8-46.js','renderer/locales/rustlab-technical-priority-v23-8-47.js','renderer/locales/rustlab-technical-main-v23-8-47.js','renderer/locales/rustlab-technical-additional-v23-8-47.js','renderer/locales/rustlab-ai-pip-v23-8-48.js','renderer/locales/rustlab-extra-instructions-v23-8-49.js','renderer/locales/rustlab-advanced-help-v23-8-50.js','renderer/locales/rustlab-core-six-v23-8-50.js','renderer/locales/rustlab-completion-v23-8-50.js','renderer/locales/rustlab-runtime-backup-v23-8-56.js','renderer/locales/rustlab-runtime-source-v23-8-56.js','renderer/locales/rustlab-runtime-doctor-v23-8-56.js','renderer/i18n.js','renderer/locales/rustlab-postengine-v23-8-50.js','renderer/locales/rustlab-attributes-v23-8-51.js','renderer/locales/rustlab-attributes-english-v23-8-52.js','renderer/locales/rustlab-dynamic-controls-v23-8-53.js'];
function boot(){
 const window={};const document={documentElement:{},readyState:'loading',addEventListener(){}};
 class MutationObserver{observe(){}}
 const context={window,document,MutationObserver,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class{}};
 for(const p of scripts)vm.runInNewContext(read(p),context,{timeout:10000,filename:p});
 return window;
}
function engine(){return boot().OpenIPTVI18n;}
function audit(){
 const t=engine().t;
 const html=read('renderer/index.html');
 const all=[...new Set([...html.matchAll(/>([^<>]{2,2000})</g)].map(m=>m[1].trim().replaceAll('&amp;','&')).filter(s=>/[À-ỹ]/.test(s)))];
 const excluded=/^(?:Tiếng Việt|日本語|한국어|ไทย|Español|Français|Português|Русский|العربية|हिन्दी|Türkçe|Українська|Hải Đăng|Trúc Ly|Thiện Minh|Thùy Dung|Thiền Tâm Đức|Ngọc Huyền|Quang Sơn|Ngọc Trân|Adam bựa|Minh Đức|Phạm Tuyên|Xuân Vĩnh|Thanh Bình|Ngọc Linh|Đoan Trang|Quỳnh Anh|Quốc Tuấn|Thái Sơn|Thục Đoan|Minh Triết|Mỹ Duyên|Đức Trí|[\d.,/×]+|[\d.,]+\s+(?:kênh|luồng)|● Sống \d|Đang dùng:|✓ Có ảnh|ລາວ|ភាសាខ្មែរ)/u;
 const labels=all.filter(s=>!excluded.test(s));
 const locales=['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 const result={total:labels.length,byLocale:{}};
 for(const locale of locales){
  const notLocalized=labels.filter(source=>t(source,locale)===source||(locale!=='en'&&t(source,locale)===t(source,'en')));
  result.byLocale[locale]={localized:labels.length-notLocalized.length,total:labels.length,percent:Number(((labels.length-notLocalized.length)/labels.length*100).toFixed(1)),missing:notLocalized};
 }
 return result;
}

function auditAttributes(){
 const t=engine().t;
 const html=read('renderer/index.html');
 const labels=[...new Set([...html.matchAll(/\b(?:title|placeholder|aria-label)\s*=\s*"([^"]+)"/g)].map(m=>m[1]).filter(s=>/[À-ỹ]/.test(s)))];
 const codes=['en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 const out={total:labels.length,byLocale:{}};
 for(const code of codes){
  const missing=labels.filter(s=>t(s,code)===s||(code!=='en'&&t(s,code)===t(s,'en')));
  out.byLocale[code]={localized:labels.length-missing.length,total:labels.length,percent:Number((100*(labels.length-missing.length)/labels.length).toFixed(1)),missing};
 }
 return out;
}
function auditDictionary(){
 const app=boot(),t=app.OpenIPTVI18n.t,d=app.OPEN_IPTV_TRANSLATIONS||{};
 const sources=Object.entries(d.en||{}).filter(([key,val])=>key && typeof val==='string' && key!==val);
 const codes=['es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
 const out={total:sources.length,byLocale:{}};
 for(const code of codes){
  const missing=sources.map(([key])=>key).filter(key=>t(key,code)===key||t(key,code)===t(key,'en'));
  out.byLocale[code]={localized:sources.length-missing.length,total:sources.length,percent:Number((100*(sources.length-missing.length)/sources.length).toFixed(1)),missing};
 }
 return out;
}

if(require.main===module){
 const result=audit(),attributes=auditAttributes(),dictionary=auditDictionary(),summary=Object.fromEntries(Object.entries(result.byLocale).map(([l,d])=>[l,{translated:d.localized,total:d.total,percent:d.percent}]));
 console.log(JSON.stringify({scope:'Rust Lab UI text-node, accessibility-attribute and app-owned English-dictionary audit',staticText:summary,attributes:Object.fromEntries(Object.entries(attributes.byLocale).map(([l,d])=>[l,{translated:d.localized,total:d.total,percent:d.percent}])),dictionary:Object.fromEntries(Object.entries(dictionary.byLocale).map(([l,d])=>[l,{translated:d.localized,total:d.total,percent:d.percent}]))},null,2));
 if(process.argv.includes('--strict') && (Object.entries(result.byLocale).some(([l,d])=>l!=='en'&&d.missing.length)||Object.entries(attributes.byLocale).some(([l,d])=>l!=='en'&&d.missing.length)))process.exitCode=1;
 if(process.argv.includes('--strict-all') && Object.values(dictionary.byLocale).some(x=>x.missing.length))process.exitCode=1;
 if(process.argv.includes('--details')){
  for(const [l,d] of Object.entries(result.byLocale))console.log('\nStatic '+l+' missing:\n'+d.missing.join('\n'));
  for(const [l,d] of Object.entries(attributes.byLocale))console.log('\nAttributes '+l+' missing:\n'+d.missing.join('\n'));
  for(const [l,d] of Object.entries(dictionary.byLocale))console.log('\nDictionary '+l+' missing:\n'+d.missing.join('\n'));
 }
}
module.exports={audit,engine,auditAttributes,auditDictionary};
