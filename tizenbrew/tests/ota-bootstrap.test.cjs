'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const bootstrap=fs.readFileSync(path.join(root,'tizenbrew/bootstrap.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const body=bootstrap.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(body,'Bootstrap must contain an inline script');
const validHtml='<!doctype html><html><head><title>Open IPTV Pro</title></head><body><script>function play(c){};<\/script></body></html>';
async function settle(){for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));}
function start(mode){
 const events=[],requests=[],errors=[],sha='b'.repeat(40);
 const nodes={
  status:{textContent:''},details:{textContent:''},
  retry:{hidden:true,onclick:null}
 };
 const doc={
  getElementById:id=>nodes[id],
  open(){events.push('open');},
  write(content){events.push('write');events.push(content);},
  close(){events.push('close');}
 };
 let apiFails=mode==='api-fail',cdnFails=mode==='cdn-fail';
 const fetchFn=url=>{
  requests.push(url);
  if(url.includes('api.github.com')){
   if(apiFails)return Promise.reject(Error('API blocked'));
   return Promise.resolve({ok:true,json:()=>Promise.resolve({sha})});
  }
  if(url.includes('cdn.jsdelivr.net')){
   if(cdnFails)return Promise.reject(Error('CDN blocked'));
   return Promise.resolve({ok:true,text:()=>Promise.resolve(validHtml)});
  }
  if(url.includes('raw.githubusercontent.com'))return Promise.resolve({ok:true,text:()=>Promise.resolve(validHtml)});
  return Promise.reject(Error('Unexpected '+url));
 };
 const env={
  document:doc,window:{},Date:{now:()=>123456789},
  fetch:fetchFn,Promise,Error,
  setTimeout:()=>1,clearTimeout:()=>{}
 };
 vm.runInNewContext(body[1],env);
 return {events,requests,nodes,errors,sha};
}
test('Module card points to the OTA bootstrap rather than stale inline TV HTML',()=>{
 assert.equal(pkg.appPath,'tizenbrew/bootstrap.html');
 assert.equal(pkg.version,'0.1.48');
 assert.equal(pkg.tizenbrewEdition,pkg.version);
 assert.match(bootstrap,/api\.github\.com\/repos/);
 assert.match(bootstrap,/tizenbrew\/index\.html/);
});
test('Every launch discovers the latest tizenbrew commit and loads immutable jsDelivr URL',async()=>{
 const run=start('ok');
 await settle();
 assert.equal(run.requests.length,2);
 assert.match(run.requests[0],/api\.github\.com\/repos\/trisanghy\/open-iptv-pro\/commits\/tizenbrew/);
 assert.ok(run.requests[1].includes('@'+run.sha+'/tizenbrew/index.html'));
 assert.deepEqual(run.events.slice(0,1),['open']);
 assert.equal(run.events[1],'write');
 assert.equal(run.events[2],validHtml);
 assert.equal(run.events[3],'close');
});
test('CDN failure falls back to direct raw file for the exact same commit',async()=>{
 const run=start('cdn-fail');
 await settle();
 assert.equal(run.requests.length,3);
 assert.ok(run.requests[2].includes('/'+run.sha+'/tizenbrew/index.html'));
 assert.equal(run.events[3],'close');
});
test('GitHub API failure falls back to raw branch with cache-busting query',async()=>{
 const run=start('api-fail');
 await settle();
 assert.equal(run.requests.length,2);
 assert.match(run.requests[1],/raw\.githubusercontent\.com\/trisanghy\/open-iptv-pro\/tizenbrew\/tizenbrew\/index.html\?fresh=/);
 assert.equal(run.events[3],'close');
});
