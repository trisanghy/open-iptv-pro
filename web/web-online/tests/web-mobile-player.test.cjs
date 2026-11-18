'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const code=fs.readFileSync(path.join(root,'web-mobile-player.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-mobile-player.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const vm=require('node:vm');
function harness({mobile=true,ios=false,native=false,hasRequest=false}={}){
 const c=new Set(),d=new Set(),handlers={};
 const box={classList:{add:(...n)=>n.forEach(v=>c.add(v)),remove:(...n)=>n.forEach(v=>c.delete(v)),contains:x=>c.has(x)}};
 const video={readyState:2,webkitEnterFullscreen:native?()=>{video.nativeOpened=true;}:undefined};
 if(hasRequest)box.requestFullscreen=()=>Promise.resolve();
 const button={setAttribute:()=>{}};
 const els={playerBox:box,video,fullscreenBtn:button};
 const doc={fullscreenElement:null,documentElement:{classList:{add:x=>d.add(x),remove:x=>d.delete(x)}},getElementById:id=>els[id],addEventListener:()=>{},querySelectorAll:()=>[]};
 const root={document:doc,navigator:{userAgent:ios?'iPhone':'Android'},matchMedia:()=>({matches:mobile}),addEventListener:(key,fn)=>{handlers[key]=fn}};
 const sandbox={window:root,module:{exports:{}},console};
 vm.runInNewContext(code,sandbox);
 return {api:sandbox.module.exports,box,video,c,d,root,handlers};
}
test('fullscreen button delegates to the mobile adapter without removing desktop behavior',()=>{
 assert.match(app,/OpenIPTVMobilePlayer\?\.toggle\?\.\(\)/);
 assert.match(html,/id="fullscreenBtn"[^>]+aria-label="Toàn màn hình video"/);
 assert.ok(html.indexOf('src="web-mobile-player.js"')<html.indexOf('src="app.js"'));
});
test('iPhone uses native video fullscreen when possible',()=>{
 const h=harness({ios:true,native:true});assert.equal(h.api.toggle(),true);
 assert.equal(h.video.nativeOpened,true);assert.equal(h.c.has('mobile-theater'),false);
});
test('embedded browsers without native fullscreen get a reversible full viewport mode',()=>{
 const h=harness();assert.equal(h.api.toggle(),true);assert.equal(h.c.has('mobile-theater'),true);
 assert.equal(h.d.has('web-mobile-theater-open'),true);
 assert.equal(h.api.toggle(),true);assert.equal(h.c.has('mobile-theater'),false);
});
test('desktop preserves original fullscreen path',()=>{
 const h=harness({mobile:false});
 assert.equal(h.api.toggle(),false);assert.equal(h.c.has('mobile-theater'),false);
});
test('mobile CSS increases touch target sizes and removes forced 3-column toolbar',()=>{
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
 assert.match(css,/min-height:48px!important/);
 assert.match(css,/mobile-theater/);
 assert.match(css,/safe-area-inset-bottom/);
});
