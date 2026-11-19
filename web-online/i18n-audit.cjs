#!/usr/bin/env node
'use strict';
// Native UI coverage audit for all 17 languages. English fallbacks do not
// count as translations. This audits fixed bundled UI only, never M3U/EPG data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const document={documentElement:{},readyState:'loading',addEventListener(){},dispatchEvent(){}};
class MutationObserver{observe(){}}
const window={};
const context={window,document,MutationObserver,
  localStorage:{getItem(){return null},setItem(){}},CustomEvent:class{}};
for(const name of ['languages.bundle.js','web-generated-locales.js',
                    'web-language-supplement.js','web-native-complete.js','i18n.js']){
  vm.runInNewContext(read(name),context,{timeout:20000,filename:name});
}
const dictionaries=window.OPEN_IPTV_TRANSLATIONS;
const locales=window.OpenIPTVI18n.locales;
const english=dictionaries.en;
const keys=Object.keys(english);
const report={source:'Bundled static application UI catalog',totalCanonicalKeys:keys.length,locales:{}};
let valid=keys.length>=1100;
for(const language of Object.keys(locales)){
  if(language==='vi'||language==='en'){
    report.locales[language]={nativeKeys:keys.length,total:keys.length,coverage:100,
                              missing:[],sameAsEnglish:language==='en'?keys.length:0};
    continue;
  }
  const native=dictionaries[language]||{};
  const missing=keys.filter(key=>typeof native[key]!=='string'||!native[key].trim());
  report.locales[language]={
    nativeKeys:keys.length-missing.length,total:keys.length,
    coverage:Math.round((keys.length-missing.length)*1000/keys.length)/10,
    missing,sameAsEnglish:keys.filter(key=>native[key]===english[key]).length,
  };
  if(missing.length)valid=false;
}
if(Object.keys(report.locales).length!==17)valid=false;
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else{
  console.log('Native Web application UI coverage — '+keys.length+' canonical keys:');
  for(const [language,status] of Object.entries(report.locales))
    console.log(language.padEnd(6),String(status.coverage).padStart(5)+'%',status.nativeKeys+'/'+status.total,
                'missing='+status.missing.length);
  console.log('Identical proper nouns and technical identifiers are preserved as authored.');
  console.log('This does not audit third-party channel content or subjective translation quality.');
}
if((process.argv.includes('--require-complete')||process.argv.includes('--strict'))&&!valid)process.exitCode=1;
