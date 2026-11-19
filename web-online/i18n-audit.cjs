#!/usr/bin/env node
'use strict';
/* Report native UI text coverage without counting English fallbacks as translated.
   Sources: committed Web static HTML + bundled dictionaries + Web-only supplement.
   This is an audit, not a machine translation service. Never inspect user M3U/EPG. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bundle=read('languages.bundle.js');
const token='window.OPEN_IPTV_TRANSLATIONS=';
const dictionary=JSON.parse(bundle.slice(bundle.indexOf(token)+token.length).replace(/;\s*$/,''));
const window={OPEN_IPTV_TRANSLATIONS:dictionary};
vm.runInNewContext(read('web-online/web-generated-locales.js'),{window},{timeout:5000});
vm.runInNewContext(read('web-online/web-language-supplement.js'),{window},{timeout:5000});
const document={documentElement:{},readyState:'loading',addEventListener(){}};
class MutationObserver{observe(){}}
vm.runInNewContext(read('i18n.js'),{window,document,MutationObserver,localStorage:{getItem(){return null},setItem(){}},CustomEvent:class{}},{timeout:5000});
const {locales,t}=window.OpenIPTVI18n;
const html=read('index.html');
const ignored=new Set(['Tiếng Việt','Español','Português (Brasil)','ไทย','ລາວ','ភាសាខ្មែរ']);
const all=[...new Set([...html.matchAll(/>([^<>\n]{2,350})</g)].map(x=>x[1].trim().replace(/&amp;/g,'&')).filter(x=>/[À-ỹ]/.test(x)&&!ignored.has(x)))];
const staticLabels=all.filter(s=>t(s,'en')!==s);
let incomplete=false;
const report={reference:'Web static UI labels',base:staticLabels.length,locales:{}};
for(const lang of Object.keys(locales)){
  if(lang==='vi')continue;
  const source=window.OPEN_IPTV_TRANSLATIONS[lang]||{};
  const translated=staticLabels.filter(key=>Object.hasOwn(source,key)&&source[key]!==key).length;
  const untranslated=staticLabels.filter(key=>!Object.hasOwn(source,key)||source[key]===key);
  report.locales[lang]={translated,total:staticLabels.length,percent:Math.round(translated/staticLabels.length*1000)/10,missing:untranslated.length};
  if(untranslated.length)incomplete=true;
}
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else {
  console.log('Web static UI native-translation audit (does not count fallback English):');
  for(const [lang,row] of Object.entries(report.locales))
    console.log(lang.padEnd(6),String(row.percent).padStart(6)+'%',String(row.translated).padStart(3)+' / '+row.total);
  console.log('Dynamic messages, help pages, and mobile-browser visual testing are outside this percentage.');
}
if(process.argv.includes('--require-complete')&&incomplete)process.exitCode=1;
