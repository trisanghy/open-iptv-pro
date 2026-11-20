'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../renderer');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const data=read('languages.bundle.js');
const base=JSON.parse(data.slice(data.indexOf('window.OPEN_IPTV_TRANSLATIONS=')+'window.OPEN_IPTV_TRANSLATIONS='.length).replace(/;\s*$/,''));
function setup(){
 let observer;const calls=[];
 const document={body:null,documentElement:{},readyState:'loading',addEventListener(){},getElementById(){return null},dispatchEvent(){}};
 const window={OPEN_IPTV_TRANSLATIONS:structuredClone(base),prompt(message,initial){calls.push({kind:'prompt',message,initial});return 'Original user input / VTV1';},
  confirm(message){calls.push({kind:'confirm',message});return false;},alert(message){calls.push({kind:'alert',message});}};
 class MutationObserver{constructor(fn){observer=fn}observe(){}}
 const localStorage={getItem(){return null},setItem(){}};
 const context={window,document,MutationObserver,localStorage,CustomEvent:class {}};
 for(const file of ['i18n-english-coverage.js','i18n-multilingual-packs.js','i18n-full-locale-pack.js','i18n-dynamic-locales.js','i18n.js'])
  vm.runInNewContext(read(file),context,{timeout:5000});
 return {i18n:window.OpenIPTVI18n,window,observe:observer,calls};
}
function element(attrs,submit=false){
 const data={...attrs};
 return {nodeType:1,
  closest(){return false},matches(selector){return submit&&selector.includes('input[type="submit"]')},
  hasAttribute(k){return Object.hasOwn(data,k)},getAttribute(k){return data[k]},
  setAttribute(k,v){data[k]=v},all:data};
}
test('dynamic modal nodes and tooltip attributes track language switches',()=>{
 const {i18n,observe}=setup();
 const title=element({title:'Chọn kênh','aria-label':'Chọn kênh',alt:'Ảnh chụp kênh','data-tooltip':'Chọn kênh'});
 const userText=element({value:'Tên người dùng / VTV1',placeholder:'Chọn kênh'});
 const submit=element({value:'Chọn kênh'},true);
 i18n.setLanguage('ko');for(const el of [title,userText,submit])observe([{type:'attributes',target:el}]);
 assert.equal(title.all.title,i18n.t('Chọn kênh','ko'));
 assert.equal(title.all.alt,i18n.t('Ảnh chụp kênh','ko'));
 assert.equal(userText.all.value,'Tên người dùng / VTV1');
 assert.equal(userText.all.placeholder,i18n.t('Chọn kênh','ko'));
 assert.equal(submit.all.value,i18n.t('Chọn kênh','ko'));
 i18n.setLanguage('ru');for(const el of [title,userText,submit])observe([{type:'attributes',target:el}]);
 assert.equal(title.all.title,i18n.t('Chọn kênh','ru'));
 assert.equal(submit.all.value,i18n.t('Chọn kênh','ru'));
 assert.equal(userText.all.value,'Tên người dùng / VTV1');
 const appended={nodeType:3,nodeValue:'Chọn kênh',parentElement:{closest(){return false}}};
 observe([{type:'childList',addedNodes:[appended]}]);
 assert.equal(appended.nodeValue,i18n.t('Chọn kênh','ru'));
 i18n.setLanguage('lo');observe([{type:'characterData',target:appended}]);
 assert.equal(appended.nodeValue,i18n.t('Chọn kênh','lo'));
});
test('prompt, confirm and alert translate messages, not return values or initial text',()=>{
 const {i18n,window,calls}=setup();i18n.setLanguage('ru');
 assert.equal(window.prompt('Chọn kênh','Tên gốc'),'Original user input / VTV1');
 assert.equal(window.confirm('Chọn kênh'),false);
 window.alert('Chọn kênh');
 for(const call of calls)assert.equal(call.message,i18n.t('Chọn kênh','ru'));
 assert.equal(calls[0].initial,'Tên gốc');
});
