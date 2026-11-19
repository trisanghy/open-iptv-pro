'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..','..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const src=read('source-use-consent-v1.js');
const app=read('app.js'),smart=read('smart-discovery-ui.js'),html=read('index.html'),collector=read('collector.js');
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
 assert.ok(point>0);assert.ok(point<html.indexOf('src="app.js?'));
 assert.match(html,/source-use-consent-v1\.css/);
 assert.match(html,/kênh công khai hoặc phát được không đồng nghĩa có giấy phép/);
 assert.match(src,/không chịu trách nhiệm về nội dung do người dùng lựa chọn và xem trong phạm vi pháp luật cho phép/);
 assert.doesNotMatch(src,/localStorage|sessionStorage/);
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

test('notice explicitly assigns responsibility for user-selected IPTV content',()=>{
 const h=harness();
 assert.match(h.api.NOTICE,/dự án cá nhân/);
 assert.match(h.api.NOTICE,/tự chịu trách nhiệm về mọi nội dung mình nhập, lưu, phát, xem hoặc chia sẻ/);
 assert.match(h.api.NOTICE,/không chịu trách nhiệm về nội dung do người dùng lựa chọn/);
});
test('file picker requires acknowledgment before opening and cancel clears the attempt',()=>{
 const start=app.indexOf('async function loadFile()');
 const first=app.indexOf("requestImport?.('file')",start);
 const picker=app.indexOf("$('#fileInput').click()",start);
 assert.ok(start>=0&&first>start&&picker>first);
 assert.match(app,/let fileConsentForPicker=false/);
 assert.match(app,/const approved=fileConsentForPicker;fileConsentForPicker=false/);
 assert.match(app,/if\(!approved&&!\(await window\.OpenIPTVSourceConsent\?\.requestImport\?\.\('file'\)\)\)return/);
 assert.match(app,/chooser\.addEventListener\('cancel',\(\)=>\{fileConsentForPicker=false;\}\)/);
});
test('Source Management prominently displays usage notice and Smart Discovery terms',()=>{
 assert.match(html,/class="source-legal-inline" role="note"/);
 assert.match(html,/Mỗi lần nhập phải xác nhận trước khi tiếp tục/);
 assert.match(html,/phải tích xác nhận riêng/);
 assert.match(src,/blob\/web\/online\/web-online\/README\.md/);
});
