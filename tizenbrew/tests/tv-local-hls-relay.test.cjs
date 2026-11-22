'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http'),https=require('node:https'),dns=require('node:dns');
const path=require('node:path'),fs=require('node:fs');
const {EventEmitter}=require('node:events'),{Readable}=require('node:stream');
const relay=require('../hls-relay-v1.js');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../../package.json'),'utf8'));
const ui=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const origin='http://127.0.0.1:8081';
function request(method,path,body,opts={}){
 return new Promise((resolve,reject)=>{
  const data=body?JSON.stringify(body):'';
  const options={hostname:'127.0.0.1',port:opts.port||17961,path,method,headers:{
   Origin:opts.origin===undefined?origin:opts.origin,
   ...(opts.custom===false?{}:{'X-Open-IPTV-Relay':'1'}),
   'Content-Type':'application/json'
  }};
  const req=http.request(options,res=>{let output='';res.on('data',c=>output+=c);
   res.on('end',()=>resolve({status:res.statusCode,body:output,
    headers:res.headers}));});
  req.on('error',reject);req.end(data);
 });
}
test('serviceFile is registered on TizenBrew app manifest; OTA bootstrap untouched',()=>{
 assert.equal(manifest.packageType,'app');
 assert.equal(manifest.version,'0.1.42');
 assert.equal(manifest.tizenbrewEdition,'0.1.42');
 assert.equal(manifest.appPath,'tizenbrew/bootstrap.html');
 assert.equal(manifest.serviceFile,'tizenbrew/hls-relay-v1.js');
});
test('only public HTTP(S) upstream addresses are accepted (never localhost/private IP)',()=>{
 for(const address of [
  'http://127.0.0.1:80/secret','http://10.1.0.1/admin','https://192.168.0.1/config',
  'http://169.254.169.254/metadata','http://localhost:1234','http://[::1]/secret',
  'file:///secret','javascript:alert(1)','http://server.local/stream'
 ])assert.equal(relay.inspectRemote(address),null,address);
 assert.ok(relay.inspectRemote('https://cdn.example.org/vtv2/live.m3u8?token=a'));
 assert.equal(relay.safeIp('8.8.8.8'),true);
 assert.equal(relay.safeIp('172.20.3.4'),false);
});
test('HLS playlist rewrite keeps variant, key and init-segment resources on TV-local session only',()=>{
 const session={id:'a'.repeat(40),resources:[]};
 const playlist=[
 '#EXTM3U',
 '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",URI="../audio/master.m3u8"',
 '#EXT-X-KEY:METHOD=AES-128,URI="https://cdn.example.org/keys/private.key?token=123"',
 '#EXT-X-MAP:URI="init.mp4"',
 '#EXTINF:5.0,',
 'segment0001.ts?quality=hd',
 '#EXT-X-STREAM-INF:BANDWIDTH=2800000',
 'https://second.example.org/hi/stream.m3u8'
 ].join('\n');
 const out=relay.rewritePlaylist(playlist,'https://cdn.example.org/live/playlist.m3u8',session);
 assert.equal(session.resources.length,5);
 assert.equal(session.resources[0],'https://cdn.example.org/audio/master.m3u8');
 assert.equal(session.resources[1],'https://cdn.example.org/keys/private.key?token=123');
 assert.equal(session.resources[2],'https://cdn.example.org/live/init.mp4');
 assert.equal(session.resources[3],'https://cdn.example.org/live/segment0001.ts?quality=hd');
 assert.equal(session.resources[4],'https://second.example.org/hi/stream.m3u8');
 for(let i=0;i<5;i++)assert.ok(out.includes('http://127.0.0.1:17869/r/'+session.id+'/'+i));
 assert.doesNotMatch(out,/second\.example\.org|token=123/);
});
test('TV localhost service CORS preflight works without actual X-Open-IPTV-Relay header',async()=>{
 const server=relay.startServer(17961);
 await new Promise((resolve,reject)=>{if(server.listening)resolve();
  else {server.once('listening',resolve);server.once('error',reject);}});
 try{
  const preflight=await request('OPTIONS','/session',null,{custom:false});
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers['access-control-allow-origin'],origin);
  const health=await request('GET','/health');
  assert.equal(health.status,200);
  assert.equal(JSON.parse(health.body).ok,true);
  assert.equal(JSON.parse(health.body).version,'0.1.42');
  const denied=await request('GET','/health',null,{origin:'https://untrusted.example'});
  assert.equal(denied.status,403);
  assert.equal(denied.headers['access-control-allow-origin'],undefined);
  const noHeader=await request('GET','/health',null,{custom:false});
  assert.equal(noHeader.status,403);
  const mediaWithoutHeader=await request('GET','/r/'+ 'a'.repeat(40) +'/0',null,{custom:false});
  assert.equal(mediaWithoutHeader.status,403, 'unknown media sessions must remain forbidden');
  const invalid=await request('POST','/session',{url:'http://127.0.0.1:80/admin'});
  assert.equal(invalid.status,400);
  const secret='https://cdn.example.org/vtv2/live.m3u8?token=TOP_SECRET';
  const result=await request('POST','/session',{url:secret,browserUserAgent:'TestTV/1.0'});
  assert.equal(result.status,201);
  const data=JSON.parse(result.body);
  assert.match(data.url,/^http:\/\/127\.0\.0\.1:17869\/r\/[a-f0-9]{40}\/0$/);
  assert.doesNotMatch(result.body,/TOP_SECRET|cdn\.example\.org/);
  const sessionId=data.url.match(/\/r\/([a-f0-9]{40})\/0$/)[1];
  const diagnostics=await request('GET','/diag/'+sessionId);
  assert.equal(diagnostics.status,200);
  const report=JSON.parse(diagnostics.body);
  assert.equal(report.browserUserAgent,'TestTV/1.0');
  assert.deepEqual(report.requests,[]);
  assert.doesNotMatch(diagnostics.body,/TOP_SECRET|cdn\.example\.org/);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('HLS relay streams playlist and segment with TV UA and no spoofed Cast headers',async()=>{
 const oldLookup=dns.lookup,oldRequest=https.request,upstream=[];
 dns.lookup=function(host,opts,cb){
  if(typeof opts==='function')cb=opts;
  process.nextTick(()=>cb(null,'93.184.216.34',4));
 };
 https.request=function(options,callback){
  upstream.push(options);
  const req=new EventEmitter();req.setTimeout=function(){};req.abort=function(){};
  req.end=function(){
   const isSegment=/segment\.ts/.test(options.path);
   const response=new Readable({read(){}});
   response.statusCode=200;
   response.headers={'content-type':isSegment?'video/mp2t':'application/vnd.apple.mpegurl'};
   process.nextTick(function(){
    callback(response);
    response.push(Buffer.from(isSegment?'SEGMENT-OK':'#EXTM3U\n#EXTINF:5,Test\nhttps://cdn.example.org/segment.ts?token=hidden\n'));
    response.push(null);
   });
  };
  return req;
 };
 const server=relay.startServer(17869);
 await new Promise((resolve,reject)=>{
  if(server.listening)resolve();else{server.once('listening',resolve);server.once('error',reject);}
 });
 try{
  const appOrigin='http://127.0.0.1:8081',ua='Tizen40-UA';
  const session=await request('POST','/session',{
   url:'https://cdn.example.org/live.m3u8?token=TOP_SECRET',browserUserAgent:ua
  },{port:17869});
  assert.equal(session.status,201);
  const sessionUrl=JSON.parse(session.body).url;
  const mediaRequest={port:17869,origin:'',custom:false};
  const playlist=await request('GET',new URL(sessionUrl).pathname,null,mediaRequest);
  assert.equal(playlist.status,200);
  assert.match(playlist.body,/#EXTM3U/);
  const segmentUrl=playlist.body.split('\n').find(line=>line.indexOf('http://127.0.0.1:17869/r/')===0);
  assert.ok(segmentUrl,'playlist should rewrite the segment to the local relay');
  const segment=await request('GET',new URL(segmentUrl).pathname,null,mediaRequest);
  assert.equal(segment.status,200);
  assert.equal(segment.body,'SEGMENT-OK');
  assert.equal(upstream.length,2);
  for(const call of upstream){
   assert.equal(call.headers['User-Agent'],ua);
   assert.equal(call.headers.Origin,undefined);
   assert.equal(call.headers.Referer,undefined);
  }
  const id=sessionUrl.match(/\/r\/([a-f0-9]{40})\//)[1];
  const diag=await request('GET','/diag/'+id,null,{port:17869});
  assert.equal(diag.status,200);
  const report=JSON.parse(diag.body);
  assert.equal(report.relayVersion,'0.1.42');
  assert.equal(report.mediaRequest.origin,'(no Origin)');
  assert.equal(report.mediaRequest.appHeader,false);
  assert.doesNotMatch(playlist.body,/TOP_SECRET|token=hidden/);
 }finally{
  await new Promise(resolve=>server.close(resolve));
  dns.lookup=oldLookup;https.request=oldRequest;
 }
});
test('HLS relay retries a 403 once with Chrome UA and keeps it for HLS segments',async()=>{
 const oldLookup=dns.lookup,oldRequest=https.request,calls=[];
 dns.lookup=function(host,opts,cb){if(typeof opts==='function')cb=opts;process.nextTick(()=>cb(null,'93.184.216.34',4));};
 https.request=function(options,callback){
  calls.push(options);
  const req=new EventEmitter();req.setTimeout=function(){};req.abort=function(){};
  req.end=function(){
   const response=new Readable({read(){}});
   const blocked=options.headers['User-Agent']==='Samsung-Tizen-UA'&&calls.length===1;
   response.statusCode=blocked?403:200;
   response.headers={'content-type':/segment\.ts/.test(options.path)?'video/mp2t':'application/vnd.apple.mpegurl'};
   process.nextTick(function(){
    callback(response);
    response.push(Buffer.from(blocked?'denied':/segment\.ts/.test(options.path)?'CHROME-SEGMENT':'#EXTM3U\n#EXTINF:5,Test\nhttps://cdn.example.org/segment.ts\n'));
    response.push(null);
   });
  };
  return req;
 };
 const server=relay.startServer(17869);
 await new Promise((resolve,reject)=>{if(server.listening)resolve();else{server.once('listening',resolve);server.once('error',reject);}});
 try{
  const session=await request('POST','/session',{url:'https://cdn.example.org/live.m3u8',browserUserAgent:'Samsung-Tizen-UA'},{port:17869});
  assert.equal(session.status,201);
  const sessionUrl=JSON.parse(session.body).url,media={port:17869,origin:'',custom:false};
  const playlist=await request('GET',new URL(sessionUrl).pathname,null,media);
  assert.equal(playlist.status,200);
  const segmentUrl=playlist.body.split('\n').find(line=>line.indexOf('http://127.0.0.1:17869/r/')===0);
  assert.ok(segmentUrl);
  const segment=await request('GET',new URL(segmentUrl).pathname,null,media);
  assert.equal(segment.status,200);
  assert.equal(segment.body,'CHROME-SEGMENT');
  assert.equal(calls.length,3,'Tizen 403, Chrome manifest retry, then Chrome segment');
  assert.equal(calls[0].headers['User-Agent'],'Samsung-Tizen-UA');
  assert.ok(calls.slice(1).every(call=>/Chrome\/131\.0\.0\.0/.test(call.headers['User-Agent'])));
  assert.ok(calls.every(call=>call.headers.Origin===undefined&&call.headers.Referer===undefined));
  const id=sessionUrl.match(/\/r\/([a-f0-9]{40})\//)[1];
  const diag=await request('GET','/diag/'+id,null,{port:17869});
  assert.equal(diag.status,200);
  const report=JSON.parse(diag.body);
  assert.match(report.browserUserAgent,/Chrome\/131\.0\.0\.0/);
  assert.equal(report.requests[0].status,403,'diagnostics retain the blocked Tizen request');
  assert.equal(report.requests[0].userAgent,'Samsung-Tizen-UA');
 }finally{await new Promise(resolve=>server.close(resolve));dns.lookup=oldLookup;https.request=oldRequest;}
});
test('TizenBrew video player tries local relay only on HLS failure and never navigates to Cast',()=>{
 assert.match(ui,/function startRelayHlsPlayback\(channel,token\)/);
 assert.match(ui,/function loadRelayDiagnostics\(token\)/);
 assert.match(ui,/TizenBrew User-Agent/);
 assert.match(ui,/hlsRelayServer='http:\/\/127\.0\.0\.1:17869'/);
 assert.match(ui,/if\(\/manifestLoadError\|manifestLoadTimeout\|levelLoadError\|levelLoadTimeout\/i\.test/);
 assert.match(ui,/method:'POST',mode:'cors',cache:'no-store'/);
 assert.match(ui,/xhrSetup:function\(xhr\)/);
 assert.match(ui,/startRelayHlsPlayback\(channel,token\)/);
 assert.match(ui,/Không phát được kênh/);
});
