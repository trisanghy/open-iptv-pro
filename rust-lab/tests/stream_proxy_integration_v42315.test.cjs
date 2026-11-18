'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {relayStream}=require('../src/stream-proxy.cjs');
const {inspectMedia}=require('../src/media-inspection.cjs');
const manifest='#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-TARGETDURATION:5\n#EXTINF:5.0,\nsegment001.ts\n#EXTINF:5.0,\nsegment002.ts\n#EXT-X-ENDLIST\n';
const listen=s=>new Promise(ok=>s.listen(0,'127.0.0.1',ok));
const close=s=>new Promise(ok=>s.close(ok));
test('real loopback proxy relays rewritable VOD HLS manifest and segments',async()=>{
 const hits=[];
 const upstream=http.createServer((req,res)=>{
  hits.push({path:req.url,range:req.headers.range});
  if(req.url.startsWith('/movie.m3u8')){res.writeHead(200,{'Content-Type':'application/octet-stream'});res.end(manifest);return;}
  if(req.url.startsWith('/segment001.ts')){res.writeHead(200,{'Content-Type':'video/mp2t'});res.end(Buffer.from([0x47,0,0,0,0x47,1,2]));return;}
  if(req.url.startsWith('/blocked.m3u8')){res.writeHead(403);res.end('Forbidden');return;}
  if(req.url.startsWith('/bad.m3u8')){res.writeHead(200,{'Content-Type':'text/html'});res.end('<html>no stream</html>');return;}
  res.writeHead(404);res.end();
 });
 await listen(upstream);
 const upstreamUrl=`http://127.0.0.1:${upstream.address().port}`;
 let proxy;
 const px=url=>`http://127.0.0.1:${proxy.address().port}/stream?url=${encodeURIComponent(url)}`;
 proxy=http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  const u=new URL(req.url,'http://127.0.0.1');
  void relayStream({req,res,url:u.searchParams.get('url'),proxyUrl:px});
 });
 await listen(proxy);
 try{
  const source=px(`${upstreamUrl}/movie.m3u8?key=abc`);
  const playlistResponse=await fetch(source,{headers:{Range:'bytes=0-128'}});
  assert.equal(playlistResponse.status,200);
  const output=await playlistResponse.text();
  assert.match(output,/EXT-X-ENDLIST/);
  assert.equal(inspectMedia({url:source,sample:output}).mode,'vod');
  assert.equal(hits[0].range,undefined,'manifest must not be truncated');
  const match=output.match(/^([^#\n]+segment001\.ts[^\n]*)$/m);
  assert.ok(match,'rewritten relative segment URL');
  const payload=await fetch(match[1]);
  assert.equal(payload.status,200);
  assert.equal(Buffer.from(await payload.arrayBuffer())[0],0x47);
  const blocked=await fetch(px(`${upstreamUrl}/blocked.m3u8`));
  assert.equal(blocked.status,403);assert.match(await blocked.text(),/HTTP 403/);
  const html=await fetch(px(`${upstreamUrl}/bad.m3u8`));
  assert.equal(html.status,502);assert.match(await html.text(),/HLS/);
 }finally{await close(proxy);await close(upstream);}
});
test('unnamed HLS manifest URI is sniffed and rewritten instead of streamed as TS',async()=>{
 const upstream=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'application/octet-stream'});res.end(manifest);});
 await listen(upstream);const base=`http://127.0.0.1:${upstream.address().port}`;
 const proxy=http.createServer((req,res)=>{void relayStream({req,res,url:base+'/play?vod=1',proxyUrl:u=>'http://127.0.0.1/next?u='+encodeURIComponent(u)});});
 await listen(proxy);
 try{
  const r=await fetch(`http://127.0.0.1:${proxy.address().port}/stream`);
  assert.equal(r.status,200);
  assert.match(r.headers.get('content-type'),/mpegurl/);
  const output=await r.text();assert.match(output,/\/next\?u=/);
 }finally{await close(proxy);await close(upstream);}
});
