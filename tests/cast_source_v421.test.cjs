'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {validatePlaylistUrl,planReplacement,replaceSourceInStore}=require('../renderer/source-edit.js');
const {CastRelay}=require('../src/cast-relay.cjs');
const {CastService}=require('../src/cast-service.cjs');
function source(name,url,id='s1',tvgId=''){return {sourceId:id,id:id+'|'+name,name,url,tvgId,group:'Nhóm tự tạo',status:'alive',checkedAt:'now'};}
async function serverStart(handler){const server=http.createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));return {server,url:'http://127.0.0.1:'+server.address().port};}
async function serverStop(server){server.closeAllConnections?.();await new Promise(r=>server.close(r));}
test('v4.21 source: validate URL and reject suspicious schemes/credentials',()=>{
 assert.equal(validatePlaylistUrl(' https://example.test/get.php?username=abc '),'https://example.test/get.php?username=abc');
 for(const u of ['javascript:alert(1)','file:///tmp/a.m3u','http://user:pass@site.test/a','not a url'])assert.throws(()=>validatePlaylistUrl(u));
});
test('v4.21 source: preserve source ID, favorite keys, custom groups and channel IDs when changing link',()=>{
 const ch=source('VTV 1','http://old.test/1.m3u8','s1','vn.vtv1');
 const store={sources:[{id:'s1',name:'Nguồn A',origin:'http://old.test/list.m3u',type:'url'}],channels:[ch],favoriteKeys:['name:vtv1'],favorites:[ch.url],folders:['Nhóm tự tạo']};
 const incoming=[{id:'s1|0',sourceId:'s1',name:'VTV 1',tvgId:'vn.vtv1',group:'Tin tức',url:'http://new.test/live1.m3u8',status:'unchecked'}];
 const result=replaceSourceInStore(store,'s1','http://new.test/list.m3u',incoming);
 assert.equal(result.matched,1);assert.equal(store.channels[0].group,'Nhóm tự tạo');assert.equal(store.channels[0].id,ch.id);
 assert.equal(store.channels[0].status,'unchecked');assert.equal(store.sources[0].origin,'http://new.test/list.m3u');
 assert.deepEqual(store.favoriteKeys,['name:vtv1']);assert.deepEqual(store.folders,['Nhóm tự tạo']);
});
test('v4.21 source: no partial mutations on invalid new playlist and no id collisions with reordered/new channels',()=>{
 const ch=source('News','http://old.test/news','s1','news');
 const store={sources:[{id:'s1',origin:'http://old.test/a',type:'url'}],channels:[ch,{...source('Other','http://o.test','s2'),id:'s2|0'}]};
 const before=JSON.stringify(store);
 assert.throws(()=>replaceSourceInStore(store,'s1','ftp://new.test/m3u',[]));assert.equal(JSON.stringify(store),before);
 const incoming=[{id:'s1|0',name:'Different',tvgId:'other',url:'http://new.test/d'},{id:'s1|1',name:'News',tvgId:'news',url:'http://new.test/news'}];
 const r=replaceSourceInStore(store,'s1','http://new.test/a',incoming);
 assert.equal(r.matched,1);assert.equal(store.channels.length,3);
 assert.equal(new Set(store.channels.map(c=>c.id)).size,3);
 assert.equal(store.channels.find(c=>c.name==='News').group,'Nhóm tự tạo');
});
test('v4.21 relay: authenticated signed HLS playlist and TS segments work across LAN URL',async()=>{
 const upstream=await serverStart((req,res)=>{
  if(req.url==='/video.m3u8')return res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl'}).end('#EXTM3U\n#EXT-X-TARGETDURATION:4\n#EXT-X-KEY:METHOD=AES-128,URI="key.bin"\n#EXTINF:4,\nchunk.ts\n');
  if(req.url==='/chunk.ts')return res.writeHead(200,{'Content-Type':'video/mp2t'}).end('segment-data');
  if(req.url==='/key.bin')return res.writeHead(200).end('key-data');
  res.writeHead(404).end();
 });
 const relay=new CastRelay({hostSelector:async()=> '127.0.0.1'});
 try{
  const out=await relay.start(upstream.url+'/video.m3u8');
  const page=await fetch(out.page);assert.equal(page.status,200);assert.match(await page.text(),/AirPlay/);
  const response=await fetch(out.url);assert.equal(response.status,200);
  const data=await response.text();assert.match(data,/#EXT-X-TARGETDURATION/);
  const media=data.split('\n').find(x=>x.startsWith('http:'));
  assert.ok(media?.startsWith(out.url.split('/media/')[0]));
  assert.equal(await (await fetch(media)).text(),'segment-data');
  const forged=new URL(media);forged.searchParams.set('u','http://127.0.0.1/private');
  assert.equal((await fetch(forged)).status,403);
  assert.equal((await fetch(out.page.replace('/player/','/player/not-'))).status,403);
  const keyLine=data.match(/URI="([^"]+)"/);assert.ok(keyLine);assert.equal(await (await fetch(keyLine[1])).text(),'key-data');
 }finally{await relay.stop();await serverStop(upstream.server);}
});
test('v4.21 relay: live response is not aborted after initial response',async()=>{
 const upstream=await serverStart((req,res)=>{res.writeHead(200,{'Content-Type':'video/mp2t'});res.flushHeaders();let n=0;const timer=setInterval(()=>{res.write('FRAME-'+(++n)+'\n');if(n===6){clearInterval(timer);res.end('DONE');}},30);res.on('close',()=>clearInterval(timer));});
 const relay=new CastRelay({hostSelector:async()=> '127.0.0.1'});
 try{const out=await relay.start(upstream.url+'/live.ts');const body=await (await fetch(out.url)).text();assert.match(body,/FRAME-6/);assert.match(body,/DONE/);}finally{await relay.stop();await serverStop(upstream.server);}
});
test('v4.21 Cast: discovery and load into default receiver with a mocked TV',async()=>{
 let recorded;
 class FakeClient{connect(address,cb){recorded={address};cb();}launch(receiver,cb){cb(null,{load(media,opts,done){recorded.media=media;recorded.opts=opts;done(null,{});},stop(done){recorded.stopped=true;done();}});}once(){}on(){}close(){recorded.closed=true;}}
 const relay={async stop(){},async start(url,address){assert.equal(address,'192.168.1.80');return {url:'http://192.168.1.20:12345/media/token'};}};
 const cast=new CastService({relay,bonjourFactory:()=>({find(_query,onUp){onUp({name:'Living Room',port:8009,addresses:['192.168.1.80']});return {stop(){}};},destroy(){}}),castLibrary:{Client:FakeClient,DefaultMediaReceiver:{}}});
 const devices=await cast.discover(500);assert.equal(devices[0].name,'Living Room');
 const result=await cast.play(devices[0].id,'https://demo.test/live.m3u8','VTV 1');
 assert.equal(result.active.name,'Living Room');assert.equal(recorded.media.contentType,'application/x-mpegURL');
 assert.equal(recorded.media.streamType,'LIVE');assert.equal(recorded.opts.autoplay,true);
 await cast.stop();assert.equal(recorded.closed,true);assert.equal(recorded.stopped,true);
});
