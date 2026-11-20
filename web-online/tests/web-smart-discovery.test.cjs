'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const src=fs.readFileSync(path.join(root,'web-smart-discovery.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'smart-discovery-ui.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
function harness(fetcher,checker){
 const window={fetch:fetcher,OpenIPTVWebChannelCheck:{checkChannel:checker||(()=>({status:'uncertain'}))}};
 const context={window,module:{exports:{}},AbortController,URL,TextDecoder,TextEncoder,setTimeout,clearTimeout,Date,Error,TypeError,Symbol,console};
 vm.runInNewContext(src,context,{filename:'web-smart-discovery.js'});
 return context.module.exports;
}
function response(url,text){
 return {ok:true,status:200,url,headers:{get:()=>null},text:async()=>text};
}
test('only exact known catalog paths are constructed and external endpoints are rejected',()=>{
 const api=harness(()=>{throw Error('Unexpected network call')});
 assert.equal(api.spec({kind:'country',code:'VN'}).url,'https://iptv-org.github.io/iptv/countries/vn.m3u');
 assert.equal(api.spec({kind:'category',code:'news'}).url,'https://iptv-org.github.io/iptv/categories/news.m3u');
 assert.equal(api.spec({kind:'language',code:'vie'}).url,'https://iptv-org.github.io/iptv/languages/vie.m3u');
 assert.equal(api.spec({kind:'global'}).url,'https://iptv-org.github.io/iptv/index.m3u');
 assert.equal(api.spec({kind:'freetv'}).url,'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8');
 assert.throws(()=>api.spec({kind:'country',code:'vn/../private'}),/không hợp lệ/);
 assert.throws(()=>api.spec({kind:'category',code:'https://bad.test'}),/không hợp lệ/);
 assert.throws(()=>api.spec({kind:'invalid',code:'VN'}),/không được hỗ trợ/);
});
test('playlist loads directly with CORS, credentials omitted and no proxy, then validates M3U',async()=>{
 const calls=[],url='https://iptv-org.github.io/iptv/countries/vn.m3u';
 const api=harness(async (target,opts)=>{calls.push({target,opts});return response(target,'#EXTM3U\n#EXTINF:-1,VTV1\nhttps://tv.example.org/live.m3u8\n')});
 const result=await api.load({kind:'country',code:'VN'});
 assert.equal(result.url,url);assert.match(result.content,/VTV1/);
 assert.equal(calls.length,1);assert.equal(calls[0].target,url);
 assert.equal(calls[0].opts.credentials,'omit');assert.equal(calls[0].opts.mode,'cors');assert.equal(calls[0].opts.redirect,'error');
 const broken=harness(async target=>response(target,'<html>Not an IPTV playlist</html>'));
 await assert.rejects(broken.load({kind:'country',code:'VN'}),/không phải playlist M3U/);
});
test('Web lists country, category and language options from fixed iptv-org API only',async()=>{
 const calls=[],api=harness(async url=>{
  calls.push(url);
  return response(url,JSON.stringify(url.includes('/countries.')?
   [{code:'VN',name:'Vietnam',flag:'🇻🇳'}]:url.includes('/categories.')?
   [{id:'news',name:'News'}]:[{code:'vie',name:'Vietnamese'}]));
 });
 assert.equal((await api.catalogOptions('country'))[0].code,'VN');
 assert.equal((await api.catalogOptions('category'))[0].code,'news');
 assert.equal((await api.catalogOptions('language'))[0].code,'vie');
 assert.equal((await api.catalogOptions('global')).length,0);
 assert.deepEqual(calls,['https://iptv-org.github.io/api/countries.json','https://iptv-org.github.io/api/categories.json','https://iptv-org.github.io/api/languages.json']);
});
test('private/internal/auth URLs are rejected before browser media fetch',async()=>{
 let checks=0;const api=harness(()=>{},async()=>{checks++;return {status:'alive',confirmedAlive:true}});
 for(const url of ['http://localhost/live','http://127.0.0.1/live','http://192.168.1.1/live','http://169.254.1.2/live',
  'http://10.0.0.1/live','http://172.16.0.1/live','http://100.64.1.1/live','http://metadata.google.internal/live',
  'http://user:password@public.example.org/live','file:///etc/passwd']){
  assert.equal(api.isSafeStreamURL(url),false,url);
  assert.equal((await api.check(url)).status,'uncertain');
 }
 assert.equal(api.isSafeStreamURL('https://stream.public.org/live.m3u8'),true);
 assert.equal(checks,0);
});
test('only confirmed video evidence means Sống; CORS remains Chưa rõ',async()=>{
 const alive=harness(()=>{},async()=>({status:'alive',confirmedAlive:true,reason:'HLS segment'}));
 const blocked=harness(()=>{},async()=>({status:'uncertain',blocked:true,reason:'CORS'}));
 const dead=harness(()=>{},async()=>({status:'dead',confirmedDead:true,reason:'HTTP 404'}));
 assert.equal((await alive.check('https://stream.public.org/live.m3u8')).positiveEvidence,true);
 const b=await blocked.check('https://stream.public.org/live.m3u8');
 assert.equal(b.status,'uncertain');assert.equal(b.positiveEvidence,false);
 assert.equal((await dead.check('https://stream.public.org/live.m3u8')).confirmedDead,true);
});
test('Smart Discovery UI uses browser backend only after explicit rights consent',()=>{
 const start=ui.indexOf('async function find()'),end=ui.indexOf('async function verify()',start);
 const discovery=ui.slice(start,end);
 assert.ok(discovery.indexOf('requireSmart?.()')>=0);
 assert.ok(discovery.indexOf('requireSmart?.()')<discovery.indexOf('web.load('));
 assert.match(discovery,/OpenIPTVWebSmartDiscovery/);
 assert.match(ui,/web\.check\(c\.url,\{signal:checkingController/);
 assert.match(ui,/web\.isSafeStreamURL\(c\.url\)/);
 assert.match(ui,/requestSmartImport\?\.\(/);
 assert.match(ui,/loadingController\?\.abort\(\)/);
 assert.match(ui,/checkingController\?\.abort\(\)/);
 assert.match(ui,/window\.streamleaf\?\.smartLoad\?\(onlyAlive\?'file':'url'\):'file'/);
});
test('Web scripts load before UI and keep builder deployment regeneration in sync',()=>{
 assert.match(html,/web-smart-discovery\.js\?v=discovery-web-20261120a"><\/script><script src="smart-discovery-ui\.js\?v=discovery-web-20261120a/);
 assert.match(html,/source-use-consent-v1\.js\?v=discovery-web-20261120a/);
 assert.match(builder,/Missing Smart Discovery \/ rights consent script anchors/);
 assert.match(builder,/web-smart-discovery\.js/);
 assert.match(builder,/smart-discovery-ui\.js/);
 assert.match(builder,/source-use-consent-v1\.js/);
});
