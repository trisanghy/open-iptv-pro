'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http');
const {inspectLink,checkRepeated}=require('../backend/stream-check.cjs');
test('HLS fetches root manifest only once; fast positive still checks actual media bytes',async()=>{
 const ts=Buffer.alloc(188*3);for(let i=0;i<3;i++)ts[i*188]=0x47;
 let manifests=0,segments=0;
 const server=http.createServer((req,res)=>{
  if(req.url==='/tv.m3u8'){manifests++;res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl'});res.end('#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXTINF:6,\n/seg.ts\n');return;}
  if(req.url==='/seg.ts'){segments++;res.writeHead(200,{'Content-Type':'video/mp2t','Content-Length':ts.length});res.end(ts);return;}
  res.writeHead(404);res.end();
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const url=`http://127.0.0.1:${server.address().port}/tv.m3u8`;
  const r=await inspectLink(url);assert.equal(r.status,'alive');assert.equal(manifests,1);assert.equal(segments,1);
  const q=await checkRepeated(url,{fastPositive:true});assert.equal(q.status,'alive');assert.equal(q.rounds,1);assert.equal(manifests,2);assert.equal(segments,2);
 }finally{await new Promise(r=>server.close(r));}
});
