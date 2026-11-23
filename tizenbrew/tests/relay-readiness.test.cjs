'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ui=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const js=ui.slice(ui.lastIndexOf('<script>')+8,ui.lastIndexOf('</script>'));
const begin=js.indexOf('var hlsRelayServiceLastLaunch=0;');
const end=js.indexOf('function diagText(value,max){',begin);
assert.ok(begin>=0&&end>begin,'Relay control section missing');
const script=js.slice(begin,end);
function instance(opts={}){
 const requests=[],messages=[],location=opts.location||{
  hostname:'127.0.0.1',port:'8081',protocol:'http:',
  pathname:'/module/gh%2Ftrisanghy%2Fopen-iptv-pro%40tizenbrew/tizenbrew/bootstrap.html'
 };
 function Socket(address){this.url=address;messages.push(this);}
 Socket.prototype.send=function(data){this.lastMessage=JSON.parse(data);};
 Socket.prototype.close=function(){};
 const context=vm.createContext({
  location,hlsRelayServer:'http://127.0.0.1:17870',
  Date,Promise,JSON,Error,AbortController:undefined,
  WebSocket:Socket,
  setTimeout(fn,delay){if(delay===600||delay===450)Promise.resolve().then(fn);return 1;},
  clearTimeout(){},
  fetch:opts.fetch||((url,options)=>{
   requests.push({url,options});
   return Promise.resolve({
    ok:true,
    json:()=>Promise.resolve(url.endsWith('/health')?
     {ok:true,transport:'local-hls',version:'0.1.43'}:
     {url:'http://127.0.0.1:17870/r/'+'a'.repeat(40)+'/0'})
   });
  })
 });
 vm.runInContext(script,context,{timeout:1000});
 return {context,requests,messages};
}
test('TizenBrew StartService identifies the installed module instead of a stale pinned SHA',()=>{
 const s=instance();
 assert.equal(s.context.serviceFullName(),'gh/trisanghy/open-iptv-pro@tizenbrew');
 assert.equal(s.context.ensureTizenHlsRelayService(),true);
 assert.equal(s.messages.length,1);
 s.messages[0].onopen();
 assert.equal(s.messages[0].lastMessage.type,6);
 assert.deepEqual(Object.keys(s.messages[0].lastMessage.payload).sort(),['fullName','serviceFile']);
 assert.equal(s.messages[0].lastMessage.payload.fullName,'gh/trisanghy/open-iptv-pro@tizenbrew');
 assert.equal(s.messages[0].lastMessage.payload.serviceFile,'tizenbrew/hls-relay-v1.js');
 assert.doesNotMatch(script,/fullName:'gh\/trisanghy\/open-iptv-pro@[0-9a-f]{40}'/);
});
test('Healthy TizenBrew service is checked once, then only one HLS session is created',async()=>{
 const s=instance(),channel={url:'https://example.org/hls.m3u8'};
 const reply=await s.context.requestLocalHlsSession(channel,0,()=>true);
 assert.match(reply.url,/^http:\/\/127\.0\.0\.1:17870\/r\//);
 assert.equal(s.requests.length,2);
 assert.equal(s.requests[0].url,'http://127.0.0.1:17870/health');
 assert.equal(s.requests[1].url,'http://127.0.0.1:17870/session');
 assert.equal(JSON.parse(s.requests[1].options.body).url,channel.url);
 await s.context.ensureRelayReady(()=>true);
 assert.equal(s.requests.length,2,'a cached healthy relay should not be probed again immediately');
});
test('Absent TV relay is recognized after a bounded health check; no repeated session requests',async()=>{
 const requests=[];
 const s=instance({fetch:(url,options)=>{requests.push(url);return Promise.reject(Error('Failed to fetch'));}});
 await assert.rejects(s.context.requestLocalHlsSession({url:'https://example.org/live.m3u8'},0,()=>true),
  /127\.0\.0\.1:17870|Dịch vụ HLS/);
 assert.equal(requests.length,6,'only six bounded health probes, not fourteen session POST retries');
 assert.ok(requests.every(x=>x.endsWith('/health')));
 await assert.rejects(s.context.requestLocalHlsSession({url:'https://example.org/live.m3u8'},0,()=>true));
 assert.equal(requests.length,6,'offline cooldown should eliminate repeated requests');
 assert.ok(s.context.relayDownUntil>Date.now());
});
test('Browser preview without TV local service refuses relay with a clear error',async()=>{
 const s=instance({location:{
  hostname:'127.0.0.1',port:'8080',protocol:'http:',pathname:'/index.html'
 }});
 assert.equal(s.context.ensureTizenHlsRelayService(),false);
 await assert.rejects(s.context.requestLocalHlsSession({url:'https://example.org/live.m3u8'},0,()=>true),
  /Bản xem thử trình duyệt/);
 assert.equal(s.requests.length,0,'no fake relay calls to non-existent TV service');
});
test('Playback recognises extensionless HLS and avoids repeated relay when offline',()=>{
 assert.match(js,/\/\/ Extensionless HLS redirects like \/tv360\?id=/);
 assert.match(js,/if\(pathname&&!\/\\\.[a-z0-9]/);
 assert.match(js,/relayDownUntil<=Date\.now\(\)&&preferredDecoderAttempts\.relay/);
 assert.match(js,/relayDownUntil>Date\.now\(\)\|\|preferredDecoderAttempts\.relay/);
 assert.match(js,/if\(isServiceDown\)preferredDecoderAttempts\.relay=PREFERRED_HLS_RELAY_MAX/);
 assert.match(ui,/Samsung Tizen Edition · TizenBrew v0\.1\.49/);
});
