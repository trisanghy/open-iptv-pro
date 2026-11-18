'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const src=read('renderer/source-use-consent-v1.js');
const app=read('renderer/app.js'),smart=read('renderer/smart-discovery-ui.js'),html=read('renderer/index.html'),collector=read('renderer/collector.js');
function harness(){
 class El{
  constructor(tag){this.tag=tag;this.children=[];this.parent=null;this.handlers={};this.checked=false;this.disabled=false;this.textContent='';}
  setAttribute(name,value){this[name]=value;}
  append(...nodes){for(const node of nodes){this.children.push(node);node.parent=this;}}
  addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);}
  emit(name){for(const fn of this.handlers[name]||[])fn({target:this,preventDefault(){},stopPropagation(){}});}
  showModal(){this.open=true;}
  close(){this.open=false;}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}
  focus(){}
 }
 const body=new El('body'),doc={body,createElement:tag=>new El(tag)};
 const sandbox={window:{document:doc},module:{exports:{}}};
 vm.runInNewContext(src,sandbox);
 const all=(node,tag)=>[...(node.tag===tag?[node]:[]),...node.children.flatMap(c=>all(c,tag))];
 return {api:sandbox.module.exports,body,all};
}
test('M3U import: checkbox is empty by default, accept is disabled until explicitly checked',async()=>{
 const h=harness(),pending=h.api.requestImport('file'),checks=h.all(h.body,'input'),buttons=h.all(h.body,'button');
 assert.equal(checks.length,1);assert.equal(checks[0].checked,false);assert.equal(buttons[1].disabled,true);
 buttons[1].emit('click');assert.equal(buttons[1].disabled,true);
 checks[0].checked=true;checks[0].emit('change');assert.equal(buttons[1].disabled,false);
 buttons[1].emit('click');assert.equal(await pending,true);assert.equal(h.body.children.length,0);
});
test('M3U URL: cancel stops import and each import requires fresh consent',async()=>{
 const h=harness(),pending=h.api.requestImport('url');
 h.all(h.body,'button')[0].emit('click');assert.equal(await pending,false);
 const second=h.api.requestImport('url');assert.equal(h.all(h.body,'input')[0].checked,false);
 h.all(h.body,'button')[0].emit('click');assert.equal(await second,false);
});
test('Smart Discovery: must separately attest third-party terms and legal content rights',async()=>{
 const h=harness(),pending=h.api.requireSmart(),checks=h.all(h.body,'input'),buttons=h.all(h.body,'button');
 assert.equal(checks.length,2);assert.equal(buttons[1].disabled,true);
 checks[0].checked=true;checks[0].emit('change');assert.equal(buttons[1].disabled,true);
 checks[1].checked=true;checks[1].emit('change');assert.equal(buttons[1].disabled,false);
 buttons[1].emit('click');assert.equal(await pending,true);assert.equal(h.api.isSmartAccepted(),true);
 assert.equal(await h.api.requireSmart(),true);
 const importPending=h.api.requestSmartImport('12 luồng');
 assert.equal(h.all(h.body,'input').length,2);assert.equal(h.all(h.body,'button')[1].disabled,true);
 h.all(h.body,'button')[0].emit('click');assert.equal(await importPending,false);
});
test('Smart Discovery: rejecting the terms blocks use, including attempts to import',async()=>{
 const h=harness(),pending=h.api.requireSmart();
 h.all(h.body,'dialog')[0].emit('cancel');assert.equal(await pending,false);
 assert.equal(h.api.isSmartAccepted(),false);
 const imported=h.api.requestSmartImport();h.all(h.body,'button')[0].emit('click');
 assert.equal(await imported,false);assert.equal(h.api.isSmartAccepted(),false);
});
test('Source use: all UI flows are guarded before they fetch or save external channels',()=>{
 assert.match(app,/async function loadFile\(\)/);
 assert.match(app,/requestImport\?\.\('file'\)/);
 assert.match(app,/async function importFromInput\(file\)/);
 assert.match(app,/async function openURL\(\)/);
 assert.match(app,/requestImport\?\.\('url'\)/);
 assert.match(app,/mode==='edit'&&!\(await window\.OpenIPTVSourceConsent/);
 assert.match(smart,/async function find\(\)/);
 assert.match(smart,/requireSmart\?\.\(\)/);
 assert.match(smart,/async function add\(onlyAlive\)/);
 assert.match(smart,/requestSmartImport\?\.\(/);
 assert.match(collector,/requestImport\?\.\('url'\)/);
 const point=html.indexOf('src="source-use-consent-v1.js"');
 assert.ok(point>0);assert.ok(point<html.indexOf('src="app-entry.js"'));
 assert.match(html,/source-use-consent-v1\.css/);
 assert.match(html,/Kênh công khai hoặc có tín hiệu không đồng nghĩa có bản quyền/);
 assert.match(src,/không chịu trách nhiệm đối với dữ liệu người dùng trong phạm vi pháp luật cho phép/);
 assert.doesNotMatch(src,/localStorage|sessionStorage/);
});
