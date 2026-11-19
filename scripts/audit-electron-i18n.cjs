'use strict';
// Native-coverage audit for all desktop UI locales. Never translates user-provided media.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const decoder=/(?:[ăâđêôơưĂÂĐÊÔƠƯ]|[àáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ])/;
function snapshot(){
 const html=read('renderer/index.html');
 const labels=[...html.matchAll(/>([^<>]{2,300})</g)].map(x=>x[1].trim().replace(/&amp;/g,'&'));
 const attrs=[...html.matchAll(/\b(?:title|placeholder|aria-label)=["']([^"'<>]{2,500})["']/g)].map(x=>x[1].trim().replace(/&amp;/g,'&'));
 const dictionaryKeys=[];
 // Translation-source keys come from the app's own UI dictionary, never a user's playlist.
 for(const match of read('renderer/i18n.js').matchAll(/"((?:\\.|[^"\\])*)"\s*:/g)){
   try{const phrase=JSON.parse('"'+match[1]+'"');if(typeof phrase==='string'&&phrase.length<500)dictionaryKeys.push(phrase.replace(/&amp;/g,'&'));}
   catch{}
 }
 return [...new Set([...labels,...attrs,...dictionaryKeys].filter(x=>decoder.test(x)&&!['Tiếng Việt','Português','Português (Brasil)'].includes(x)))];
}
function engine(){
 const bundle=read('renderer/languages.bundle.js');
 const data=JSON.parse(bundle.slice(bundle.indexOf('window.OPEN_IPTV_TRANSLATIONS=')+'window.OPEN_IPTV_TRANSLATIONS='.length).replace(/;\s*$/,''));
 const document={documentElement:{},readyState:'loading',addEventListener(){},dispatchEvent(){}};
 class MutationObserver{observe(){}}
 const window={OPEN_IPTV_TRANSLATIONS:structuredClone(data)};
 const environment={window,document,MutationObserver,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class{}};
 for(const file of ['renderer/i18n-english-coverage.js','renderer/i18n-multilingual-packs.js','renderer/i18n-full-locale-pack.js','renderer/i18n.js'])
  vm.runInNewContext(read(file),environment,{timeout:5000,filename:file});
 return window.OpenIPTVI18n;
}
function generatedPacks(){
 const name='renderer/i18n-full-locale-pack.js';
 if(!fs.existsSync(path.join(ROOT,name)))return {};
 const source=read(name);
 const match=source.match(/const packs=(\{.*\});root\.OpenIPTVCompletedLocales=/);
 if(!match)throw new Error('Malformed generated locale pack');
 return JSON.parse(match[1]);
}
function audit(){
 const strings=snapshot(),i18n=engine(),results=[],generated=generatedPacks();
 for(const code of Object.keys(i18n.locales)){
  if(code==='vi')continue;
  const notNative=strings.filter(v=>{
   const actual=i18n.t(v,code);
   if(code==='en')return actual===v;
   const native=generated[code]||{};
   // Explicit locale entry with a genuine translation is not an English fallback,
   // even if French/Indonesian happen to share a spelling with English.
   if(Object.hasOwn(native,v)&&native[v]!==v)return false;
   return actual===v||actual===i18n.t(v,'en');
  });
  results.push({code,localized:strings.length-notNative.length,total:strings.length,pct:Math.round((strings.length-notNative.length)*100/strings.length),untranslated:notNative});
 }
 return {total:strings.length,results};
}
if(require.main===module){
 const result=audit();
 if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(result,null,2)+'\n');
 else for(const l of result.results)process.stdout.write(l.code+': '+l.localized+'/'+l.total+' ('+l.pct+'%) native UI labels; missing '+l.untranslated.length+'\n');
}
module.exports={audit,snapshot,engine};
