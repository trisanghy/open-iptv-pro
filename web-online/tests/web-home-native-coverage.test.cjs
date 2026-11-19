'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const home=fs.readFileSync(path.join(root,'web-online/project-home.html'),'utf8');
const asset=path.join(root,'web-online/home-native-locales.js');
const supported=['vi','en','zh','ja','ko','th','fr','de','es','pt','id','ru','lo','km','it','hi','ar'];
function getBase(){
  const match=/const translations=/.exec(home);
  assert.ok(match,'Home translation dictionary missing');
  const s=home.slice(match.index+match[0].length);
  const ctx={};
  // Isolate the JSON literal: it is always a single valid JSON object.
  const brace=s.indexOf('{');
  let level=0,inString=false,escape=false,end=-1;
  for(let i=brace;i<s.length;i++){
    const c=s[i];
    if(inString){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')inString=false;}
    else if(c==='"')inString=true;
    else if(c==='{')level++;
    else if(c==='}'&&--level===0){end=i+1;break;}
  }
  return JSON.parse(s.slice(brace,end));
}
test('all selectable home language packs are present before enabling complete coverage', {skip:!fs.existsSync(asset)},()=>{
  const translations=getBase();
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(asset,'utf8'),context,{timeout:5000});
  assert.ok(context.window.OpenIPTVHomeNativeLocales,'Completed native homepage dictionaries missing');
  const extras=context.window.OpenIPTVHomeNativeLocales;
  const keys=Object.keys(translations.en);
  assert.ok(keys.length>=135,'Homepage reference dictionary regressed');
  for(const code of supported.filter(c=>!['vi','en'].includes(c))){
    const native={...(translations[code]||{}),...(extras[code]||{})};
    const missing=keys.filter(key=>typeof native[key]!=='string'||!native[key].trim());
    assert.deepEqual(missing,[],code+' untranslated: '+missing.slice(0,8).join(' | '));
    const different=keys.filter(key=>native[key]!==translations.en[key]).length;
    assert.ok(different/keys.length>.80,code+' is mostly English fallback: '+different+'/'+keys.length);
  }
  for(const code of supported.filter(c=>!['vi','en'].includes(c)))
    assert.ok(home.includes('<option value="'+code+'">'),code+' absent from language selector');
  const marker='<script id="home-native-locales-data">';
  const start=home.indexOf(marker);
  const end=home.indexOf('</script>',start+marker.length);
  assert.ok(start>=0&&end>start,'Standalone homepage must embed a complete dictionary');
  const inline=home.slice(start+marker.length,end);
  const inlineContext={window:{}};
  vm.runInNewContext(inline,inlineContext,{timeout:5000});
  assert.equal(Object.keys(inlineContext.window.OpenIPTVHomeNativeLocales).length,15);
  assert.equal(
    inlineContext.window.OpenIPTVHomeNativeLocales.fr['Tính năng'],
    extras.fr['Tính năng'],'Embedded homepage must match the audited offline asset');
  const order=home.indexOf('id="home-native-locales-data"');
  assert.ok(order>=0&&order<home.indexOf('id="homepage-language-controller"'),'Offline pack must load before controller');
  assert.ok(home.includes("document.documentElement.dir=code==='ar'?'rtl':'ltr'"),'Arabic must render right-to-left');
});
test('homepage translation requires no runtime request and keeps links intact',()=>{
  assert.ok(!home.includes('translate.googleapis.com'),'Runtime translation API should not be used');
  assert.ok(home.includes('https://trisanghy.github.io/open-iptv-pro/'),'Project destination missing');
});
