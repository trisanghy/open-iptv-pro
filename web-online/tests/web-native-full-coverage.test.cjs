'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const langs=['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar'];
function boot(){
  const document={documentElement:{},readyState:'loading',addEventListener(){}};
  class MutationObserver{observe(){}}
  const window={};
  const ctx={window,document,MutationObserver,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class{}};
  for(const file of ['languages.bundle.js','web-generated-locales.js','web-language-supplement.js','web-native-complete.js','i18n.js'])
    vm.runInNewContext(read(file),ctx,{timeout:6000,filename:file});
  return window;
}
test('all 17 Web languages have a native entry for every canonical UI string',()=>{
  const window=boot(),dict=window.OPEN_IPTV_TRANSLATIONS;
  const originals=Object.keys(dict.en);
  assert.ok(originals.length>=1000,'English UI catalog regressed');
  assert.deepEqual(Object.keys(window.OpenIPTVI18n.locales),langs);
  for(const lang of langs.filter(x=>!['vi','en'].includes(x))){
    const native=dict[lang]||{};
    const missing=originals.filter(key=>typeof native[key]!=='string'||!native[key].trim());
    assert.deepEqual(missing,[],lang+' missing '+missing.slice(0,5).join(' | '));
    const translated=originals.filter(key=>native[key]!==dict.en[key]).length;
    assert.ok(translated/originals.length>0.80,lang+' is still mostly English: '+translated+'/'+originals.length);
  }
});
test('language switching uses native text, preserves user channel names and never fetches translations at playback',()=>{
  const w=boot(),t=w.OpenIPTVI18n.t;
  for(const lang of langs.filter(x=>!['vi','en'].includes(x))){
    assert.ok(t('Quản lý nguồn',lang)!=='Quản lý nguồn',lang);
    assert.equal(t('VTV5 Tây Nguyên',lang),'VTV5 Tây Nguyên',lang);
    assert.equal(t('https://provider.example.invalid/?token=secret',lang),'https://provider.example.invalid/?token=secret',lang);
  }
  assert.doesNotMatch(read('i18n.js'),/fetch\(.*translate/i);
});
test('the Web page loads native dictionaries between base catalog and localizer',()=>{
  const html=read('index.html');
  const a=html.indexOf('src="languages.bundle.js');
  const b=html.indexOf('src="web-generated-locales.js');
  const c=html.indexOf('src="web-language-supplement.js');
  const d=html.indexOf('src="web-native-complete.js');
  const e=html.indexOf('src="i18n.js');
  assert.ok(a>=0&&b>a&&c>b&&d>c&&e>d,'Translation script loading order is incorrect');
  assert.ok(read('web-online/build-web-native-locales.py').includes('Only built-in UI labels'));
});
