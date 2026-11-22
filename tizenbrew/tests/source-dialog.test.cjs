'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const tv=fs.readFileSync(path.join(root,'index.html'),'utf8');
const phone=fs.readFileSync(path.join(root,'phone.html'),'utf8');
const scripts=s=>Array.from(s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),m=>m[1]);

test('Tizen and mobile JavaScript scripts parse',()=>{
 for(const [target,html] of [['Tizen',tv],['phone',phone]]){
  assert.ok(scripts(html).length>0);
  scripts(html).forEach((s,i)=>assert.doesNotThrow(()=>new vm.Script(s,{filename:target+'-'+i+'.js'})));
 }
});
test('Only name, URL and consent are required on Tizen',()=>{
 assert.doesNotMatch(tv,/id="sourceText"/);
 assert.doesNotMatch(tv,/dán nội dung M3U/);
 for(const id of ['sourceName','sourceUrl','rights','sourceQR','sourceQRStatus','refreshSourceQR','toSourceUrl'])
  assert.match(tv,new RegExp('id="'+id+'"'));
 assert.match(tv,/new QRCode\(/);
 assert.match(tv,/width:420,height:420/);
 assert.match(tv,/SOURCE_PAGE\+'#code='\+token/);
});
test('Phone and TV share the relay protocol and have a time-limited token',()=>{
 for(const body of [tv,phone]){
  assert.match(body,/new Uint8Array\(16\)/);
  assert.match(body,/600000/);
  assert.match(body,/event:'source-submit'/);
  assert.match(body,/event:'source-result'/);
  assert.match(body,/openiptv-tizen-source-v1-/);
  assert.match(body,/https:\/\/zjbsvqryaxtafuffpifu\.supabase\.co/);
 }
 assert.match(tv,/addSource\(\{name:msg\.name,address:msg\.address,rights:msg\.rights\},true\)/);
 assert.match(phone,/id="rights"/);
});
test('Samsung remote D-pad can leave input name for URL',()=>{
 const start=tv.indexOf('function keyHandler(e){');
 const end=tv.indexOf("\ndocument.querySelectorAll('[data-nav]')",start);
 assert.ok(start>=0&&end>start);
 let active,prevented=false,moved='',closed=false;
 const modal={hidden:false};
 const name={tagName:'INPUT',type:'text',focus(){active=name}};
 const address={tagName:'INPUT',type:'url',focus(){active=address}};
 const ctx={document:{get activeElement(){return active;}},
  byId:id=>id==='modal'?modal:id==='sourceName'?name:id==='sourceUrl'?address:null,
  move:key=>{moved=key;},closeDialog:()=>{closed=true;}};
 const keyHandler=vm.runInNewContext(tv.slice(start,end)+'\nkeyHandler;',ctx);
 const fire=(key,keyCode)=>{prevented=false;keyHandler({key,keyCode,preventDefault(){prevented=true;},stopPropagation(){}});};
 active=name;fire('ArrowDown',40);assert.equal(active,address);assert.equal(prevented,true);
 active=name;fire('Enter',13);assert.equal(active,address);
 active=address;fire('ArrowUp',38);assert.equal(active,name);
 active=name;fire('ArrowLeft',37);assert.equal(prevented,false);
 active={tagName:'BUTTON'};fire('ArrowDown',40);assert.equal(moved,'ArrowDown');
 fire('Escape',27);assert.equal(closed,true);
});
