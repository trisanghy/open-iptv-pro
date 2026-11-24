'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
const src=fs.readFileSync('tizen-web/remote.js','utf8');
test('Direct website module, no service or alternative player',()=>{
 assert.equal(manifest.packageType,'mods');
 assert.equal(manifest.websiteURL,'https://trisanghy.github.io/open-iptv-pro/');
 assert.equal(manifest.serviceFile,undefined);
 assert.equal(manifest.main,'tizen-web/remote.js');
 for(const f of ['tizenbrew/bootstrap.html','tizenbrew/index.html'])assert.match(fs.readFileSync(f,'utf8'),/location\.replace\("https:\/\/trisanghy\.github\.io\/open-iptv-pro\/"\)/);
 assert.doesNotMatch(src,/webapis|AVPlay|XMLHttpRequest|fetch\(|new Hls|127\.0\.0\.1|localStorage/);
});
function mock(origin='https://trisanghy.github.io'){
 let clicks=[],handler,active=null;
 const node=(id,x,y)=>({id,tagName:'BUTTON',tabIndex:0,disabled:false,closest:()=>null,getAttribute:()=>null,getBoundingClientRect:()=>({left:x,top:y,width:50,height:50}),focus(){active=this;},scrollIntoView(){},click(){clicks.push(id);}});
 const a=node('nextBtn',0,0),b=node('prevBtn',100,0),c=node('playBtn',0,100);
 const doc={body:{},head:{appendChild(){}},readyState:'complete',get activeElement(){return active;},querySelectorAll:s=>s==='dialog[open],[role="dialog"][aria-modal="true"]'?[]:[a,b,c],getElementById:id=>[a,b,c].find(x=>x.id===id),addEventListener:(k,f)=>{handler=f;},createElement:()=>({})};
 active=doc.body;
 const window={};vm.runInNewContext(src,{location:{origin,pathname:'/open-iptv-pro/'},window,document:doc,getComputedStyle:()=>({display:'block',visibility:'visible',opacity:'1'})});
 return {clicks,doc,a,b,c,handler};
}
test('Remote navigation and channel keys use the original website buttons',()=>{
 const m=mock();assert.equal(m.doc.activeElement,m.a);
 function send(key,keyCode){let stopped=false;m.handler({key,keyCode,preventDefault(){stopped=true;},stopImmediatePropagation(){}});return stopped;}
 assert.equal(send('ArrowRight',39),true);assert.equal(m.doc.activeElement,m.b);
 assert.equal(send('ChannelUp',427),true);assert.deepEqual(m.clicks,['nextBtn']);
 assert.equal(send('MediaPlayPause',10252),true);assert.deepEqual(m.clicks,['nextBtn','playBtn']);
});
test('Never inject into another origin',()=>{assert.equal(mock('https://example.org').handler,undefined);});
