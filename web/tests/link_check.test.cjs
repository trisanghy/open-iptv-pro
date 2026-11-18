'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createServer}=require('node:http');
const {checkRepeated,inspectLink}=require('../src/stream-check.cjs');
const ts=Buffer.alloc(4096);ts[0]=0x47;ts[188]=0x47;ts[376]=0x47;
async function serve(fn,cb){const srv=createServer(fn);await new Promise(r=>srv.listen(0,'127.0.0.1',r));try{return await cb(`http://127.0.0.1:${srv.address().port}`);}finally{srv.closeAllConnections();await new Promise(r=>srv.close(r));}}
const fast={delayMs:1};
test('Two repeated 404 on root URL = confirmed Die',async()=>serve((req,res)=>{res.writeHead(404).end('not found')},async base=>{
 const r=await checkRepeated(base+'/not-found.m3u8',fast);assert.equal(r.status,'dead');assert.equal(r.confirmedDead,true);assert.equal(r.rounds,2);
}));
test('403, 429, 503, timeout-like result and HTML 200 do not falsely classify Die',async()=>serve((req,res)=>{
 const code=+req.url.slice(1)||200;if(code===200){res.writeHead(200,{'Content-Type':'text/html'}).end('<html>Not found</html>');}else res.writeHead(code).end('try again');
},async base=>{for(const status of [200,403,429,503]){const r=await checkRepeated(base+'/'+status,fast);assert.equal(r.status,'uncertain',String(status)+': '+r.reason);}
}));
test('Live HLS: old expired segments 404, newest segment 200 => Sống',async()=>serve((req,res)=>{
 if(req.url.startsWith('/live.m3u8')){res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl'}).end('#EXTM3U\n#EXT-X-TARGETDURATION:5\n#EXTINF:5,\nold.ts\n#EXTINF:5,\nnew.ts\n');}
 else if(req.url.startsWith('/new.ts'))res.writeHead(200,{'Content-Type':'video/mp2t'}).end(ts);
 else res.writeHead(404).end('expired');
},async base=>{const r=await checkRepeated(base+'/live.m3u8',fast);assert.equal(r.status,'alive',r.reason);assert.ok(r.positiveEvidence);}));
test('Range request rejected but no-Range GET returns video => Sống',async()=>serve((req,res)=>{
 if(req.headers.range){res.writeHead(403).end('Range blocked');return;}
 res.writeHead(200,{'Content-Type':'video/mp2t'}).end(ts);
},async base=>{const r=await inspectLink(base+'/live.ts');assert.equal(r.status,'alive',r.reason);}));
test('HLS manifest okay but all segments expired => Chưa rõ, not Die',async()=>serve((req,res)=>{
 if(req.url.includes('.m3u8'))res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl'}).end('#EXTM3U\n#EXT-X-TARGETDURATION:3\n#EXTINF:3,\nold.ts\n');
 else res.writeHead(404).end('Expired');
},async base=>{const r=await checkRepeated(base+'/v.m3u8',fast);assert.equal(r.status,'uncertain',r.reason);}));
test('Transient root 404 followed by good transport stream => Sống',async()=>{
 let count=0;
 return serve((_req,res)=>{if(++count===1)res.writeHead(404).end();else res.writeHead(200,{'Content-Type':'video/mp2t'}).end(ts);},async base=>{
 const r=await checkRepeated(base+'/v.ts',fast);assert.equal(r.status,'alive',r.reason);
 });
});
test('If player User-Agent is blocked by 404 but browser User-Agent works, it must not be Die',async()=>serve((req,res)=>{
 const ua=req.headers['user-agent']||'';
 if(ua.startsWith('Open-IPTV-Pro/'))res.writeHead(404).end('blocked');
 else res.writeHead(200,{'Content-Type':'video/mp2t'}).end(ts);
},async base=>{
 const r=await checkRepeated(base+'/play.ts',fast);assert.equal(r.status,'alive',r.reason);
}));
test('Invalid TS segment format without clear proof should remain Chưa rõ',async()=>serve((req,res)=>{
 if(req.url.endsWith('.m3u8'))res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl'}).end('#EXTM3U\n#EXT-X-TARGETDURATION:3\n#EXTINF:3,\nseg.bin\n');
 else res.writeHead(200,{'Content-Type':'text/plain'}).end('some text, not a stream');
},async base=>{const r=await checkRepeated(base+'/v.m3u8',fast);assert.equal(r.status,'uncertain');}));
