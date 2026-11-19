'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const app=fs.readFileSync(path.join(__dirname,'../../app.js'),'utf8');
function reader(fetch){
 const code=app.slice(app.indexOf(' async function readSourceURL'),app.indexOf(' async function replaceURLSource'));
 return vm.runInNewContext(code+';readSourceURL',{fetch,native:false});
}
const playlist='#EXTM3U\n#EXTINF:-1,Test\nhttps://example.org/live';
for(const [url,host] of [['https://d.org.vn/listiptv','raw.githubusercontent.com'],['https://nts12.s.gy/iptv','gist.githubusercontent.com']]){
 test('CORS failure follows verified destination for '+url,async()=>{
  const calls=[];
  const read=reader(async target=>{
   calls.push(target);
   if(target===url)throw new TypeError('Load failed');
   return {ok:true,text:async()=>playlist};
  });
  assert.equal(await read(url),playlist);
  assert.equal(calls.length,2);
  assert.equal(new URL(calls[1]).hostname,host);
 });
}
test('successful direct requests and HTTP errors use only the original URL',async()=>{
 for(const ok of [false,true]){
  const calls=[],url='https://nts12.s.gy/iptv';
  const read=reader(async target=>{calls.push(target);return {ok,status:404,text:async()=>playlist};});
  if(ok)assert.equal(await read(url),playlist);
  else await assert.rejects(read(url),/HTTP 404/);
  assert.deepEqual(calls,[url]);
 }
});
test('private and unknown URLs never use a public fallback',async()=>{
 const calls=[],url='https://nts12.s.gy/iptv?token=private';
 const read=reader(async target=>{calls.push(target);throw new TypeError('Load failed');});
 await assert.rejects(read(url),/URL trực tiếp/);
 assert.deepEqual(calls,[url]);
});
test('repeat submissions share one visible URL error and never stack toasts',async()=>{
 const button={disabled:false,textContent:'Tải danh sách'},errorLine={hidden:true};
 let count=0;
 const cb=async()=>{count++;throw Error('Lỗi mạng');};
 const code=app.slice(app.indexOf(' async function modalSubmit'),app.indexOf(' function wire()'));
 const submit=vm.runInNewContext(code+';modalSubmit',{modalHandler:cb,$:id=>id==='#modalConfirm'?button:errorLine,textStatus(){}});
 await Promise.all([submit(),submit()]);
 assert.equal(count,1);
 await submit();
 assert.equal(count,2);
 assert.equal(errorLine.textContent,'Lỗi mạng');
 assert.equal(errorLine.hidden,false);
 assert.equal(button.disabled,false);
});

test('the Add URL dialog downloads and stores a bare domain with HTTPS',async()=>{
 const sourceEdit=require('../../source-edit.js');
 const inputs={'#urlName':{value:'IPTV'},'#urlValue':{value:' d.org.vn/listiptv '}};
 let submit,requested,added;
 const code=app.slice(app.indexOf(' async function openURL()'),app.indexOf(' async function readSourceURL'));
 const open=vm.runInNewContext(code+';openURL',{
  window:{OpenIPTVSourceConsent:{requestImport:async()=>true}},sourceEdit,
  $:id=>inputs[id],openModal:(title,body,cb)=>{submit=cb;},textStatus(){},
  readSourceURL:async url=>{requested=url;return playlist;},addSource:(...args)=>{added=args;}
 });
 await open();await submit();
 assert.equal(requested,'https://d.org.vn/listiptv');
 assert.equal(inputs['#urlValue'].value,requested);
 assert.deepEqual(added,['IPTV',requested,playlist,'url']);
});
test('bare URL handling preserves ports, case-sensitive paths, query strings and explicit HTTP',()=>{
 const {validatePlaylistUrl}=require('../../source-edit.js');
 for(const value of ['nts12.s.gy/iptv','example.org:8443/Mixed?sig=A%2Fb']){
  assert.equal(validatePlaylistUrl(value),'https://'+value);
 }
 assert.equal(validatePlaylistUrl('http://example.org/Mixed'),'http://example.org/Mixed');
 for(const value of ['', '/playlist.m3u','file:///playlist','javascript:alert(1)','https://user:pass@example.org/']){
  assert.throws(()=>validatePlaylistUrl(value));
 }
});

for(const [url,target] of [
 ['http://d.org.vn/listiptv','https://raw.githubusercontent.com/vuminhthanh12/vuminhthanh12/main/vmttv'],
 ['http://nts12.s.gy/iptv','https://gist.githubusercontent.com/trisanghy/e63b2927598a4b932b3708ddd3183aaa/raw/iptv.m3u']
]){
 test('HTTP alias imports through one HTTPS request: '+url,async()=>{
  const calls=[];
  const read=reader(async request=>{
   calls.push(request);
   if(!request.startsWith('https://'))throw new TypeError('Mixed content');
   return {ok:true,text:async()=>playlist};
  });
  assert.equal(await read(url),playlist);
  assert.deepEqual(calls,[target]);
 });
}
test('an HTTP source with a private query never uses the shared playlist',async()=>{
 const url='http://d.org.vn/listiptv?token=private',calls=[];
 const read=reader(async request=>{calls.push(request);throw new TypeError('Mixed content');});
 await assert.rejects(read(url),/Không tải được/);
 assert.deepEqual(calls,[url]);
});
