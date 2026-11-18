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
 const values=new Map(),localStorage={
  getItem:key=>values.get(key)??null,
  setItem:(key,value)=>values.set(key,String(value)),
  removeItem:key=>values.delete(key)
 };
 const sandbox={window:{document:doc,localStorage},module:{exports:{}}};
 vm.runInNewContext(src,sandbox);
 const all=(node,tag)=>[...(node.tag===tag?[node]:[]),...node.children.flatMap(c=>all(c,tag))];
 return {api:sandbox.module.exports,body,all,localStorage,values};
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
 // requestSmartImport awaits the earlier session acceptance before showing its modal.
 await Promise.resolve();
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
 assert.match(src,/SMART_KEY='open-iptv-pro-discovery-consent-v1'/);
 assert.match(src,/SMART_REV='2026-11-18-v1'/);
});

test('Discovery consent is saved by version and can be revoked on the same device',async()=>{
 const h=harness(),pending=h.api.requireSmart();
 const checks=h.all(h.body,'input'),buttons=h.all(h.body,'button');
 checks[0].checked=true;checks[0].emit('change');
 checks[1].checked=true;checks[1].emit('change');buttons[1].emit('click');
 assert.equal(await pending,true);
 const stored=JSON.parse(h.localStorage.getItem(h.api.smartConsentKey));
 assert.equal(stored.revision,'2026-11-18-v1');
 assert.equal(stored.accepted,true);
 assert.equal(typeof stored.acceptedAt,'string');
 // Simulate reopening the app with the same device storage.
 const body=h.body,doc={body,createElement:tag=>({})},window={document:doc,localStorage:h.localStorage};
 const sandbox={window,module:{exports:{}}};
 vm.runInNewContext(src,sandbox);
 assert.equal(sandbox.module.exports.isSmartAccepted(),true);
 assert.equal(await sandbox.module.exports.requireSmart(),true);
 sandbox.module.exports.revokeSmart();
 assert.equal(h.localStorage.getItem(h.api.smartConsentKey),null);
 assert.equal(sandbox.module.exports.isSmartAccepted(),false);
});

test('Smart Discovery never loads external catalog before the consent check',()=>{
 const choiceStart=smart.indexOf('async function choices()');
 const findStart=smart.indexOf('async function find()');
 assert.ok(choiceStart>0&&findStart>choiceStart);
 const choices=smart.slice(choiceStart,findStart);
 assert.match(choices,/if\(!window\.OpenIPTVSourceConsent\?\.isSmartAccepted\?\.\(\)\)return/);
 const find=smart.slice(findStart,smart.indexOf('async function verify()',findStart));
 const approved=find.indexOf('requireSmart?.()');
 const catalog=find.indexOf('await choices();');
 assert.ok(approved>0&&catalog>approved,'The selected catalog must be loaded after rights confirmation');
});
