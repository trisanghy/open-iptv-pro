'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {makeDesktopFetcher}=require('../src/network-transport.cjs');
const {relayStream}=require('../src/stream-proxy.cjs');
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',r));
const close=s=>new Promise(r=>s.close(r));
test('Chromium transport is shared by HLS master and segment requests through loopback relay',async()=>{
 const requests=[];
 const manifest='#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-TARGETDURATION:8\n#EXTINF:8,\npart001.ts\n#EXT-X-ENDLIST\n';
 const upstream=http.createServer((req,res)=>{
  requests.push(req.url);
  if(req.url.includes('index.m3u8')){res.writeHead(200,{'content-type':'application/vnd.apple.mpegurl'});res.end(manifest);}
  else if(req.url.includes('part001.ts')){res.writeHead(200,{'content-type':'video/mp2t'});res.end(Buffer.from([0x47,0x00,0x00,0x00]));}
  else{res.writeHead(404);res.end();}
 });
 await listen(upstream);
 let chromeCalls=0,nodeCalls=0,proxy;
 const desktopFetch=makeDesktopFetcher(async(url,options)=>{chromeCalls++;return fetch(url,options);},async()=>{nodeCalls++;throw Error('Node should not be used');});
 const port=upstream.address().port;
 const proxyUrl=url=>`http://127.0.0.1:${proxy.address().port}/stream?url=${encodeURIComponent(url)}`;
 proxy=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  void relayStream({req,res,url:u.searchParams.get('url'),proxyUrl,fetcher:desktopFetch});
 });
 await listen(proxy);
 try{
  const result=await fetch(proxyUrl(`http://127.0.0.1:${port}/movie/index.m3u8`));
  assert.equal(result.status,200);
  const text=await result.text();
  const part=text.split('\n').find(x=>x.startsWith('http://127.0.0.1:')&&x.includes('part001.ts'));
  assert.ok(part,'segment link should be rewritten through local proxy');
  const data=await fetch(part);
  assert.equal(data.status,200);
  assert.equal((await data.arrayBuffer()).byteLength,4);
  assert.ok(chromeCalls>=2);
  assert.equal(nodeCalls,0);
  assert.ok(requests.some(x=>x.includes('index.m3u8'))&&requests.some(x=>x.includes('part001.ts')));
 }finally{await close(proxy);await close(upstream);}
});
