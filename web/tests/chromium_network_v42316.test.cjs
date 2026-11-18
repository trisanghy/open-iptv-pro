'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {makeDesktopFetcher,errorCode}=require('../src/network-transport.cjs');
const {relayStream}=require('../src/stream-proxy.cjs');
const http=require('node:http');
const fakeResponse=status=>({status,ok:status>=200&&status<300});
test('Chromium networking is preferred and HTTP denial is not bypassed by Node',async()=>{
 let nodeCalls=0,chromeCalls=0;
 const net=makeDesktopFetcher(async()=>{chromeCalls++;return fakeResponse(403);},async()=>{nodeCalls++;return fakeResponse(200);});
 const res=await net('https://example.org/movie.m3u8');
 assert.equal(res.status,403);assert.equal(nodeCalls,0);assert.equal(chromeCalls,1);
});
test('desktop stream transport falls back once on Chromium connection failure',async()=>{
 const calls=[];
 const net=makeDesktopFetcher(async()=>{calls.push('chromium');throw Object.assign(Error('network'),{code:'ERR_NAME_NOT_RESOLVED'});},async()=>{calls.push('node');return fakeResponse(200);});
 assert.equal((await net('https://example.org/vod.m3u8')).status,200);
 assert.deepEqual(calls,['chromium','node']);
});
test('aborted fetch never retries a second transport',async()=>{
 const c=new AbortController();c.abort();let nodeCalls=0;
 const net=makeDesktopFetcher(async()=>{throw Object.assign(Error('aborted'),{name:'AbortError'});},async()=>{nodeCalls++;});
 await assert.rejects(net('https://example.org/m3u8',{signal:c.signal}),/aborted/);
 assert.equal(nodeCalls,0);
});
test('both transports failing returns diagnostic error codes without sensitive URL',async()=>{
 const net=makeDesktopFetcher(async()=>{throw Object.assign(Error('sensitive token 123'),{code:'ERR_NAME_NOT_RESOLVED'});},async()=>{throw Object.assign(Error('private URL'),{cause:{code:'ECONNRESET'}});});
 await assert.rejects(net('https://example.org/a.m3u8?token=secret'),e=>{
  assert.equal(e.code,'UPSTREAM_CONNECT_FAILED');assert.match(e.message,/ERR_NAME_NOT_RESOLVED.*ECONNRESET/);
  assert.doesNotMatch(e.message,/secret|sensitive token|private URL/);return true;
 });
 assert.equal(errorCode({cause:{code:'CERT_HAS_EXPIRED'}}),'CERT_HAS_EXPIRED');
});

test('Chromium-first HTTP transport relays a VOD HLS manifest over local proxy',async()=>{
 const manifest='#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXTINF:6,\nscene0001.ts\n#EXT-X-ENDLIST\n';
 const upstream=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/octet-stream'});res.end(manifest);});
 const listen=s=>new Promise(ok=>s.listen(0,'127.0.0.1',ok));
 const close=s=>new Promise(ok=>s.close(ok));
 await listen(upstream);
 let browserCalls=0,nodeCalls=0;
 const transport=makeDesktopFetcher(async(u,init)=>{browserCalls++;return fetch(u,init);},async()=>{nodeCalls++;throw Error('Node should not be called');});
 const proxy=http.createServer((req,res)=>void relayStream({req,res,url:`http://127.0.0.1:${upstream.address().port}/movie.m3u8`,
  proxyUrl:u=>'http://127.0.0.1/proxy?url='+encodeURIComponent(u),fetcher:transport}));
 await listen(proxy);
 try{
  const resp=await fetch(`http://127.0.0.1:${proxy.address().port}/stream`);
  assert.equal(resp.status,200);
  const text=await resp.text();assert.match(text,/\#EXTM3U/);assert.match(text,/127\.0\.0\.1\/proxy\?url=/);
  assert.equal(browserCalls,1);assert.equal(nodeCalls,0);
 }finally{await close(proxy);await close(upstream);}
});
