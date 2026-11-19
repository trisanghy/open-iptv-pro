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
