'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http'),path=require('node:path'),fs=require('node:fs');
const relay=require('../hls-relay-v1.js');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../../package.json'),'utf8'));
const ui=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const origin='http://127.0.0.1:8081';
function request(method,path,body,opts={}){
 return new Promise((resolve,reject)=>{
  const data=body?JSON.stringify(body):'';
  const options={hostname:'127.0.0.1',port:17961,path,method,headers:{
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
 assert.equal(manifest.version,'0.1.35');
 assert.equal(manifest.tizenbrewEdition,'0.1.35');
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
 for(let i=0;i<5;i++)assert.ok(out.includes('http://127.0.0.1:17865/r/'+session.id+'/'+i));
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
  const denied=await request('GET','/health',null,{origin:'https://untrusted.example'});
  assert.equal(denied.status,403);
  assert.equal(denied.headers['access-control-allow-origin'],undefined);
  const noHeader=await request('GET','/health',null,{custom:false});
  assert.equal(noHeader.status,403);
  const invalid=await request('POST','/session',{url:'http://127.0.0.1:80/admin'});
  assert.equal(invalid.status,400);
  const secret='https://cdn.example.org/vtv2/live.m3u8?token=TOP_SECRET';
  const result=await request('POST','/session',{url:secret,browserUserAgent:'TestTV/1.0'});
  assert.equal(result.status,201);
  const data=JSON.parse(result.body);
  assert.match(data.url,/^http:\/\/127\.0\.0\.1:17865\/r\/[a-f0-9]{40}\/0$/);
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
test('TizenBrew video player tries local relay only on HLS failure and never navigates to Cast',()=>{
 assert.match(ui,/function startRelayHlsPlayback\(channel,token\)/);
 assert.match(ui,/hlsRelayServer='http:\/\/127\.0\.0\.1:17865'/);
 assert.match(ui,/if\(\/manifestLoadError\|manifestLoadTimeout\|levelLoadError\|levelLoadTimeout\/i\.test/);
 assert.match(ui,/method:'POST',mode:'cors',cache:'no-store'/);
 assert.match(ui,/xhrSetup:function\(xhr\)/);
 assert.match(ui,/startRelayHlsPlayback\(channel,token\)/);
 assert.match(ui,/Không phát được kênh/);
});
