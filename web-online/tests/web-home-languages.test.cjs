'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.resolve(__dirname,'../project-home.html'),'utf8');
const found=html.match(/<script id="homepage-language-controller">([\s\S]*?)<\/script>/);
const script=found?.[1];
test('international homepage has twelve selectable languages and valid JavaScript',()=>{
 assert.ok(script,'Inline localization logic must ship with homepage without extra network requests');
 assert.doesNotThrow(()=>new vm.Script(script));
 for(const code of ['vi','en','zh','ja','ko','th','fr','de','es','pt','id','ru']){
   assert.ok(html.includes('<option value="'+code+'">'),code);
 }
 assert.match(html,/id="homeLanguage"/);
 assert.match(html,/for="homeLanguage"/);
 assert.match(html,/\.language-picker:focus-within/);
 assert.match(html,/document\.documentElement\.lang=/);
 assert.match(html,/localStorage\.setItem\('openiptv\.home\.language',selected\)/);
 assert.match(html,/history\.replaceState/);
 assert.match(html,/new URL\(window\.location\.href\)\.searchParams\.get\('lang'\)/);
});
function boot(search='',stored=null,navigatorLanguages=['en-US']){
 const texts=['Tính năng','Truyền hình của bạn.','Xem IPTV trên Web','Mã nguồn','Chỉ sử dụng playlist, luồng, lịch EPG và dữ liệu bên thứ ba khi bạn có quyền truy cập. Giấy phép phần mềm không cấp quyền đối với nội dung.']
  .map(str=>({nodeValue:str,parentElement:{tagName:'P'},isConnected:true}));
 let i=0;
 const picker={value:'vi',listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}};
 const data={};if(stored)data['openiptv.home.language']=stored;
 const desc={content:'Việt Nam default'};
 const doc={
   body:{},documentElement:{lang:'vi',dir:'ltr'},
   getElementById:()=>picker,
   createTreeWalker:()=>({nextNode(){return texts[i++]||null;}}),
   querySelectorAll:()=>[],
   querySelector:()=>desc
 };
 const context={document:doc,NodeFilter:{SHOW_TEXT:4},URL,
   window:{location:{href:'https://trisanghy.github.io/'+search}},
   localStorage:{getItem:key=>data[key],setItem:(key,value)=>data[key]=value},
   navigator:{languages:navigatorLanguages,language:navigatorLanguages[0]},
   history:{replaceState(_state,_unused,url){context.replaced=url;},state:{}}
 };
 vm.runInNewContext(script,context,{timeout:2000});
 return {doc,texts,picker,data,context,desc};
}
test('browser language auto-detection renders English, retains text semantics, and switches to Chinese',()=>{
 const x=boot();
 assert.equal(x.picker.value,'en');
 assert.equal(x.doc.documentElement.lang,'en');
 assert.equal(x.texts[0].nodeValue,'Features');
 assert.equal(x.texts[1].nodeValue,'Your television.');
 assert.match(x.texts[4].nodeValue,/Only use playlists/);
 x.picker.value='zh';x.picker.listeners.change();
 assert.equal(x.doc.documentElement.lang,'zh-CN');
 assert.equal(x.texts[0].nodeValue,'功能');
 assert.equal(x.texts[1].nodeValue,'你的电视。');
 assert.equal(x.data['openiptv.home.language'],'zh');
 assert.equal(x.context.replaced,'/?lang=zh');
 x.picker.value='vi';x.picker.listeners.change();
 assert.equal(x.doc.documentElement.lang,'vi');
 assert.equal(x.texts[0].nodeValue,'Tính năng');
 assert.equal(x.texts[1].nodeValue,'Truyền hình của bạn.');
});
test('URL parameter overrides saved preference and navigator language',()=>{
 const x=boot('?lang=es','ja',['ko-KR']);
 assert.equal(x.picker.value,'es');
 assert.equal(x.texts[0].nodeValue,'Funciones');
 assert.equal(x.texts[1].nodeValue,'Tu televisión.');
});
test('saved language works without a URL; unsupported browser locales default to Vietnamese',()=>{
 const a=boot('','fr',['ja-JP']);assert.equal(a.picker.value,'fr');assert.equal(a.texts[0].nodeValue,'Fonctionnalités');
 const b=boot('',null,['xx-XX']);assert.equal(b.picker.value,'vi');assert.equal(b.texts[0].nodeValue,'Tính năng');
});
test('translations do not break SEO or required content and links',()=>{
 for(const id of ['tinh-nang','anh','tai-ve','huong-dan','ma-nguon'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/rel="canonical" href="https:\/\/trisanghy.github.io\/"/);
 assert.match(html,/https:\/\/trisanghy.github.io\/open-iptv-pro\//);
 assert.match(html,/https:\/\/trisanghy.github.io\/assets\/gallery\/ios-tv.png/);
 assert.ok(!html.includes('google-translate.js'));
});