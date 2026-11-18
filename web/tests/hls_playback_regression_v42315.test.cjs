'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {inspectMedia,rangeForVideo}=require('../src/media-inspection.cjs');
const {fetchStream,validHlsManifest,isManifestURL,headersForStream,httpErrorText}=require('../src/hls-relay.cjs');
const {parseM3U,rewriteHls}=require('../src/core.cjs');
const root=path.join(__dirname,'..');
const sampleVod='#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXTINF:10,\nsegment1.ts\n#EXTINF:10,\nsegment2.ts\n#EXT-X-ENDLIST\n';
const sampleLive='#EXTM3U\n#EXT-X-TARGETDURATION:10\n#EXTINF:10,\nsegment1.ts\n';
test('M3U group LIVE EVENTS does not convert on-demand movie playlist to LIVE',()=>{
 const m3u='#EXTM3U\n#EXTINF:-1 group-title="03 - LIVE EVENTS 🔴",Movie example\nhttps://movies.example.test/film/index.m3u8\n';
 const entry=parseM3U(m3u,'test');assert.equal(entry.length,1);assert.match(entry[0].group,/LIVE EVENTS/);
 const inspected=inspectMedia({url:entry[0].url,sample:sampleVod});assert.equal(inspected.mode,'vod');assert.equal(inspected.seekable,true);
});
test('LIVE never exposes VOD seekbar even when browser offers 120s of seekable timestamps',()=>{
 const mock={seekable:{length:1,start:()=>20,end:()=>140}};
 assert.equal(inspectMedia({url:'https://example.test/live.m3u8',sample:sampleLive}).mode,'live');
 assert.equal(rangeForVideo(mock,{mode:'live'}),null);
 assert.deepEqual(rangeForVideo(mock,{mode:'vod'}),{start:20,end:140,length:120});
});
test('master-only HLS is unknown pending loaded level, not prematurely LIVE',()=>{
 const r=inspectMedia({url:'https://example.test/master.m3u8',sample:'#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=2000000\nvod/index.m3u8\n'});
 assert.equal(r.mode,'unknown');assert.equal(r.hls,true);
});
test('MPEG-DASH is distinct from HLS, not fed to hls.js',()=>{
 const r=inspectMedia({url:'https://example.test/movie.mpd',contentType:'application/dash+xml',sample:'<?xml version="1.0"?><MPD type="static"></MPD>'});
 assert.equal(r.dash,true);assert.equal(r.hls,false);assert.equal(r.format,'dash');
});
test('manifest requests never send Range; media segments can send Range',()=>{
 assert.equal(isManifestURL('https://test.invalid/film/index.m3u8?token=1'),true);
 assert.equal(headersForStream('https://test.invalid/film/index.m3u8',{range:'bytes=0-4095'}).Range,undefined);
 assert.equal(headersForStream('https://test.invalid/video.ts',{range:'bytes=0-4095'}).Range,'bytes=0-4095');
});
test('retry a denied byte range once with normal GET, preserving HLS VOD classification',async()=>{
 let requests=[];
 const server=http.createServer((req,res)=>{
  requests.push(req.headers.range||'-');
  if(req.headers.range){res.writeHead(416);res.end('range unsupported');return;}
  res.writeHead(200,{'content-type':'application/octet-stream'});res.end(sampleVod);
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const url=`http://127.0.0.1:${server.address().port}/play?vid=4`;
  const r=await fetchStream(fetch,url,{range:'bytes=0-65535'});
  const info=inspectMedia({url,contentType:r.headers.get('content-type'),sample:await r.text()});
  assert.equal(info.mode,'vod');assert.equal(info.hls,true);
  assert.deepEqual(requests,['bytes=0-65535','-']);
 }finally{await new Promise(ok=>server.close(ok));}
});
test('rewrite nested HLS sources and encryption key URI without changing other metadata',()=>{
 const original='#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="../key.bin"\n#EXTINF:10,\nmedia/00001.ts\n';
 const fn=u=>'http://127.0.0.1:8000/stream?url='+encodeURIComponent(u);
 const out=rewriteHls(original,'https://example.test/hls/low/index.m3u8',fn);
 assert.match(out,/METHOD=AES-128/);assert.match(out,/key\.bin/);assert.match(out,/00001\.ts/);
 assert.ok(validHlsManifest(out));assert.equal(validHlsManifest('<html>blocked</html>'),false);
});
test('helpful HTTP diagnosis never labels blocked upstream as successful playback',()=>{
 assert.match(httpErrorText(403),/HTTP 403/);assert.match(httpErrorText(404),/không còn/);assert.match(httpErrorText(429),/giới hạn/);
});
test('HLS.js waits for parsed manifest instead of starting play before media is attached',()=>{
 const js=fs.readFileSync(path.join(root,'renderer','app.js'),'utf8');
 assert.match(js,/H\.Events\.MANIFEST_PARSED,\(\)=>\{if\(isCurrent\(\)\)\{playbackStartStage='manifest-ready';startPlaying\(\);\}\}/);
 assert.match(js,/recoverPlayback\(generation,reason,attempt\)/);
 const ux=fs.readFileSync(path.join(root,'renderer','player-ux.js'),'utf8');
 assert.match(ux,/\['event','vod','timeshift','catchup'\]\.includes\(media\.mode\)/);
});
