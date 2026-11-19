'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'guide-native-locales.js');
const html=fs.readFileSync(path.join(root,'huong-dan.html'),'utf8');
const locales=['vi','en','fr','de','es','pt-BR','zh-CN','ja','ko','th','id','ru','lo','km','it','hi','ar'];
test('all guide strings have native translations in all 17 selectable languages', {skip:!fs.existsSync(file)},()=>{
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{timeout:5000});
  const all=context.window.OpenIPTVGuideLocales;
  assert.ok(all);
  const languages=locales.filter(lang=>lang!=='vi');
  assert.deepEqual(Object.keys(all).sort(),languages.slice().sort());
  const keys=Object.keys(all.en);
  assert.ok(keys.length>=60,'Guide source keys unexpectedly decreased');
  for(const code of languages){
    for(const key of keys){
      assert.equal(typeof all[code]?.[key],'string',code+' missing: '+key);
      assert.ok(all[code][key].trim(),code+' empty: '+key);
    }
    const translated=keys.filter(key=>all[code][key]!==key);
    assert.ok(translated.length/keys.length>.85,code+' still has mostly Vietnamese labels');
  }
  assert.ok(html.includes('id="guide-language-controller"'));
  assert.match(html,/src="guide-native-locales[.]js[?]v=[a-f0-9]{16}"/);
  for(const code of locales)assert.ok(html.includes('<option value="'+code+'">'),code+' missing from guide picker');
  assert.ok(html.includes("document.documentElement.dir=code==='ar'?'rtl':'ltr'"));
});
test('translation never changes user playlists or downloads from a remote runtime translation API',()=>{
  assert.doesNotMatch(html,/translate\.googleapis\.com|clients5\.google\.com/);
  assert.ok(html.includes('https://trisanghy.github.io/open-iptv-pro/'));
});
