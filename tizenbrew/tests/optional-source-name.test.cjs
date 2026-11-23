'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const tv=fs.readFileSync(path.join(root,'tizenbrew/index.html'),'utf8');
const phone=fs.readFileSync(path.join(root,'tizenbrew/phone.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
function block(source,from,to){
 const a=source.indexOf(from),b=source.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'Missing code boundary: '+from);
 return source.slice(a,b);
}
const sourceNameHelper=block(tv,'function sourceDisplayName(value){','function playlistStart(req){');
test('version 0.1.49 is consistent in TizenBrew metadata and TV header',()=>{
 assert.equal(pkg.version,'0.1.49');
 assert.equal(pkg.tizenbrewEdition,pkg.version);
 assert.ok(tv.includes('Samsung Tizen Edition · TizenBrew v'+pkg.version));
});
test('TV and QR phone labels clearly say source name is optional',()=>{
 assert.ok(tv.includes('<label for="sourceName">Tên nguồn (không bắt buộc)</label>'));
 assert.ok(phone.includes('<label for="name">Tên nguồn (không bắt buộc)</label>'));
 const nameInput=phone.match(/<input id="name"[^>]+>/)[0];
 assert.doesNotMatch(nameInput,/\brequired\b/);
 assert.ok(phone.includes("byId('sourceForm').onsubmit=async function"));
 assert.doesNotMatch(phone,/if\(!name\|\|!address\|\|!byId\('rights'\)\.checked\)/);
 assert.ok(tv.includes("byId(kind==='search'?'searchInput':'toSourceUrl').focus()"),'TV should avoid opening Samsung keyboard automatically');
});
test('TV generates a source name only when missing',()=>{
 const state={sources:[]};
 const display=vm.runInNewContext(sourceNameHelper+'\nsourceDisplayName;', {state});
 assert.equal(display(''),'Nguồn IPTV 1');
 assert.equal(display('   '),'Nguồn IPTV 1');
 assert.equal(display('Tin tức'),'Tin tức');
 state.sources.push({name:'Trước đó'});
 assert.equal(display(undefined),'Nguồn IPTV 2');
 assert.equal(display('N'.repeat(100)).length,80);
});
test('TV source import accepts empty name but still checks URL and rights',async()=>{
 const state={sources:[]},notes=[];
 const fields={
   rights:{getAttribute:()=> 'true'},
   sourceName:{value:''},
   sourceUrl:{value:'https://example.com/live.m3u8'},
   saveSource:{disabled:false,textContent:''}
 };
 const ctx={state,byId:id=>fields[id],url:input=>/^https?:\/\//.test(input)?input:'',parse:()=>[{id:'c1',name:'Kênh thử',url:'https://example.com/live.m3u8'}],newToken:()=> '1234',
  save:()=>true,draw:()=>{},notify:m=>notes.push(m),closeDialog:()=>{},sourceStatus:m=>notes.push(m),sourceError:e=>String(e),search:'',group:'',section:'',selected:null};
 const code=sourceNameHelper+block(tv,'async function addSource(data,fromPhone){','function setPlayerStatus(');
 const add=vm.runInNewContext(code+'\naddSource;',ctx);
 const ok=await add(null,false);
 assert.equal(ok.ok,true);
 assert.equal(state.sources[0].name,'Nguồn IPTV 1');
 fields.sourceUrl.value='not-an-url';
 const invalid=await add(null,false);
 assert.equal(invalid.ok,false);
 assert.equal(state.sources.length,1);
 fields.rights.getAttribute=()=> 'false';
 fields.sourceUrl.value='https://example.com/live.m3u8';
 const denied=await add(null,false);
 assert.equal(denied.ok,false);
});
test('phone sends URL with blank optional name',async()=>{
 const nodes={
  sourceForm:{reset(){}},name:{value:''},address:{value:'example.com/list.m3u'},rights:{checked:true}
 };
 const sent=[],feedback=[];
 const ctx={byId:id=>nodes[id],validUrl:x=>'https://'+x,command:async(action,payload)=>{sent.push({action,payload});return {count:2};},
  feedback:(...args)=>feedback.push(args),showTab:()=>{},query:'before',offset:3};
 const code=block(phone,"byId('sourceForm').onsubmit=async function(event){","byId('renameSource').onclick=");
 const fn=vm.runInNewContext(code+"\nbyId('sourceForm').onsubmit;",ctx);
 await fn({preventDefault(){}});
 assert.equal(sent.length,1);
 assert.equal(sent[0].action,'add-source');
 assert.equal(sent[0].payload.name,'');
 assert.equal(sent[0].payload.rights,true);
 assert.equal(sent[0].payload.address,'https://example.com/list.m3u');
});
test('QR chunked playlist import also permits empty name',()=>{
 const code=block(tv,'function playlistStart(req){','function playlistChunk(req){');
 assert.match(code,/var name=sourceDisplayName\(req.name\)/);
 assert.doesNotMatch(code,/Tên nguồn không được trống/);
});
