'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {relayStream}=require('../src/stream-proxy.cjs');
const {makeStreamFetcher}=require('../src/network-transport.cjs');
const available=spawnSync('ffmpeg',['-version'],{stdio:'ignore',timeout:3000}).status===0;
const listen=s=>new Promise(done=>s.listen(0,'127.0.0.1',done));
const close=s=>new Promise(done=>s.close(done));
test('FIX playlist-shaped local HLS: real TS data plays through relay A -> B -> A without remux delay', {skip:!available}, async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-aba-'));
 let upstream,proxy;
 try{
  const ts=path.join(folder,'segment.ts');
  const made=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=blue:s=320x180:r=25','-t','1.5','-an','-c:v','mpeg2video','-f','mpegts',ts],{timeout:10000});
  assert.equal(made.status,0,String(made.stderr||''));
  const bytes=fs.readFileSync(ts);
  assert.ok(bytes.length>1000);
  let upstreamManifest=0,upstreamSegments=0,chromiumCalls=0,nodeCalls=0;
  upstream=http.createServer((req,res)=>{
   if(/^\/(A|B)\/index\.m3u8/.test(req.url)){
    upstreamManifest++;
    res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl'});
    res.end('#EXTM3U\n#EXT-X-TARGETDURATION:2\n#EXT-X-VERSION:3\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXTINF:1.50,\nsegment001.ts\n#EXT-X-ENDLIST\n');return;
   }
   if(/^\/(A|B)\/segment001\.ts/.test(req.url)){
    upstreamSegments++;res.writeHead(200,{'Content-Type':'video/mp2t','Content-Length':bytes.length});res.end(bytes);return;
   }
   res.writeHead(404);res.end();
  });
  await listen(upstream);
  const up=`http://127.0.0.1:${upstream.address().port}`;
  const transport=makeStreamFetcher(async(u,options)=>{nodeCalls++;return fetch(u,options);},async()=>{chromiumCalls++;throw Error('not needed');});
  proxy=http.createServer((req,res)=>{
   const target=new URL(req.url,'http://127.0.0.1').searchParams.get('url');
   void relayStream({req,res,url:target,proxyUrl:u=>`http://127.0.0.1:${proxy.address().port}/stream?url=${encodeURIComponent(u)}`,fetcher:transport});
  });
  await listen(proxy);
  const base=`http://127.0.0.1:${proxy.address().port}`;
  const milestones=[];
  for(const ch of ['A','B','A']){
   const started=performance.now();
   const pl=await fetch(`${base}/stream?url=${encodeURIComponent(`${up}/${ch}/index.m3u8`)}`);
   assert.equal(pl.status,200);const text=await pl.text();
   const segment=text.split(/\r?\n/).find(line=>line.startsWith('http://127.0.0.1:'));
   assert.ok(segment,'rewritten segment from manifest');
   const response=await fetch(segment);assert.equal(response.status,200);
   const got=Buffer.from(await response.arrayBuffer());assert.equal(got.length,bytes.length);
   assert.equal(got[0],0x47,'TS sync byte');
   milestones.push({ch,elapsedMs:Math.round(performance.now()-started)});
  }
  assert.equal(upstreamManifest,3);assert.equal(upstreamSegments,3);
  assert.equal(chromiumCalls,0);assert.equal(nodeCalls,6);
  for(const entry of milestones)assert.ok(entry.elapsedMs<1500,`local fixture too slow: ${entry.ch} ${entry.elapsedMs}`);
 }finally{if(proxy)await close(proxy);if(upstream)await close(upstream);fs.rmSync(folder,{recursive:true,force:true});}
});
