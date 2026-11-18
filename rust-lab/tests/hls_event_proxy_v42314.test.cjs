'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {inspectMedia}=require('../src/media-inspection.cjs');
const {rewriteHls}=require('../src/core.cjs');
const http=require('node:http');

test('HLS event without extension and generic content-type is recognized from real HTTP bytes',async()=>{
 const manifest='#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-PLAYLIST-TYPE:EVENT\n#EXTINF:10,\nsegments/0001.ts\n';
 const server=http.createServer((req,res)=>{
  if(req.headers.range){res.writeHead(416);res.end('Range unsupported');return;}
  res.writeHead(200,{'Content-Type':'application/octet-stream'});
  res.end(manifest);
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const url=`http://127.0.0.1:${server.address().port}/play?event=12`;
  const refused=await fetch(url,{headers:{Range:'bytes=0-65535'}});assert.equal(refused.status,416);
  const r=await fetch(url);assert.equal(r.status,200);
  const info=inspectMedia({url,contentType:r.headers.get('content-type'),sample:await r.text()});
  assert.equal(info.hls,true);assert.equal(info.mode,'event');
  const proxy=u=>'http://127.0.0.1:8970/stream?key=test&url='+encodeURIComponent(u);
  const transformed=rewriteHls(manifest,url,proxy);
  assert.ok(transformed.includes('http://127.0.0.1:8970/stream?key=test&url='));
  assert.ok(transformed.includes('segments%2F0001.ts'));
 }finally{await new Promise(ok=>server.close(ok));}
});
