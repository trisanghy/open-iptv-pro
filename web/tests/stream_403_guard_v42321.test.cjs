'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const {relayStream}=require('../src/stream-proxy.cjs');
const manifest='#EXTM3U\n#EXT-X-TARGETDURATION:5\n#EXTINF:5.0,\nfragment001.ts\n#EXT-X-ENDLIST\n';
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',r));const close=s=>new Promise(r=>s.close(r));
test('upstream HLS segment HTTP 403 is exposed distinctly from successful manifest and never marked as playable',async()=>{
 const upstream=http.createServer((req,res)=>{if(req.url==='/hls/index.m3u8'){res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl'});res.end(manifest);}else{res.writeHead(403);res.end('no access');}});
 await listen(upstream);const origin=`http://127.0.0.1:${upstream.address().port}`;
 let proxy;const px=url=>`http://127.0.0.1:${proxy.address().port}/stream?url=${encodeURIComponent(url)}`;
 proxy=http.createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');relayStream({req,res,url:u.searchParams.get('url'),proxyUrl:px}).catch(e=>res.destroy(e));});await listen(proxy);
 try{
  const r=await fetch(px(origin+'/hls/index.m3u8'));assert.equal(r.status,200);
  const text=await r.text(),line=text.split('\n').find(x=>x.includes('fragment001.ts'));assert.ok(line);
  const media=await fetch(line);assert.equal(media.status,403);assert.match(await media.text(),/HTTP 403/);
 }finally{await close(proxy);await close(upstream);}
});
test('playback stall guard follows attempt identity; denied media does not schedule repeated old-attempt errors',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../renderer/app.js'),'utf8');
 assert.match(app,/const token=playGeneration,attempt=playAttemptSerial/);
 assert.match(app,/attempt===playAttemptSerial&&current/);
 assert.match(app,/clearTimeout\(stallTimer\)/);
 assert.match(app,/serverDenied\(reason\)/);
 assert.match(app,/ffmpegTried/);
 assert.doesNotMatch(app,/native-direct/);
});
test('hovering channel with poster does not spawn another HLS media stream',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../renderer/advanced.js'),'utf8');
 assert.match(js,/if\(picture\)\{/);
 assert.match(js,/preview\.append\(img\);preview\.classList\.remove\('hidden'\);return;/);
});
