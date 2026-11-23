'use strict';
/*
 * Open IPTV Pro TV — private, TV-local HLS relay for TizenBrew modules.
 * TizenBrew's application module is a remote web page without AVPlay. Its
 * Node service can request HLS on behalf of the TV without browser CORS.
 * This is NOT an Internet proxy. Listen only on 127.0.0.1, reject internal
 * upstream hosts, require TizenBrew's origin + custom request header,
 * rewrite live playlists/keys/segments to random, local resource IDs and
 * never log the user's original IPTV URL or credentials. The media GET route
 * accepts the allowlisted TizenBrew origin without a custom header because
 * Samsung WebKit's HLS loader may omit headers on playlist/segment requests.
 *
 * Compatible with the legacy Node.js runtime used by older TizenBrew TVs.
 */
var http=require('http');
var https=require('https');
var dns=require('dns');
var net=require('net');
var crypto=require('crypto');
var Url=require('url');

var PORT=17870;
var SERVICE_VERSION='0.1.43';
// Some IPTV origins reject Samsung/Tizen (403) but serve the same URL to a
// desktop browser. Retry once as Chrome and retain the winning UA per session.
var CHROME_USER_AGENT='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
// A previously successful Chrome fallback is reused across fresh channel
// sessions on this TV only. Store hostnames, never URL paths or IPTV tokens.
var chromeHosts={};
var httpAgent=new http.Agent({keepAlive:true,maxSockets:12,keepAliveMsecs:9000});
var httpsAgent=new https.Agent({keepAlive:true,maxSockets:12,keepAliveMsecs:9000});
var MAX_SESSIONS=32,MAX_RESOURCES=3500,MAX_PLAYLIST=2*1024*1024;
var MAX_SEGMENT=48*1024*1024,EXPIRE_MS=20*60*1000;
var ALLOWED_ORIGINS={'http://127.0.0.1:8081':true,'http://localhost:8081':true};
var sessions={};
function own(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function safeIp(ip){
 if(!net.isIP(ip))return false;
 if(ip.indexOf(':')>=0){
  var text=String(ip).toLowerCase();
  if(text.indexOf('::ffff:')===0)return safeIp(text.slice(7));
  return !(text==='::1'||text==='::'||/^f[cd]/.test(text)||
   /^fe[89ab]/.test(text)||/^2001:db8/.test(text));
 }
 var a=ip.split('.').map(function(x){return Number(x);});
 return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||
  a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||
  a[0]===192&&a[1]===168||a[0]===100&&a[1]>=64&&a[1]<=127||
  a[0]===192&&a[1]===0||a[0]===198&&a[1]>=18&&a[1]<=19);
}
function inspectRemote(value){
 if(typeof value!=='string'||value.length>4096||/\s/.test(value))return null;
 var parsed;
 try{parsed=Url.parse(value);}catch(e){return null;}
 if(!parsed||!/^(http|https):$/.test(parsed.protocol)||!parsed.hostname)return null;
 var host=parsed.hostname.toLowerCase();
 if(host==='localhost'||/\.localhost$|\.local$|\.internal$/.test(host))return null;
 if(net.isIP(host)&&!safeIp(host))return null;
 var port=parsed.port?Number(parsed.port):(parsed.protocol==='https:'?443:80);
 if(!(port>=1&&port<=65535))return null;
 return parsed;
}
function recordDiagnostic(session,parsed,remote){
 var rows=session.requestDiagnostics||(session.requestDiagnostics=[]);
 rows.push({host:String(parsed.hostname||'').slice(0,180),status:Number(remote.statusCode||0),
  context:'tizenbrew',userAgent:String(session.userAgent||'').slice(0,300),origin:'',referer:'',
  contentType:String(remote.headers['content-type']||'').slice(0,120),
  server:String(remote.headers.server||'').slice(0,120)});
 while(rows.length>8)rows.shift();
}
function json(res,status,value){
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
 res.end(JSON.stringify(value));
}
function setCors(req,res){
 var origin=req.headers.origin||'';
 if(own(ALLOWED_ORIGINS,origin)){
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Open-IPTV-Relay, Range');
  res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Range, Accept-Ranges');
 }
}
function prune(){
 var now=Date.now(),ids=Object.keys(sessions);
 ids.forEach(function(id){if(now-sessions[id].last>EXPIRE_MS)delete sessions[id];});
 ids=Object.keys(sessions);
 if(ids.length>=MAX_SESSIONS){
  ids.sort(function(a,b){return sessions[a].last-sessions[b].last;});
  while(ids.length>=MAX_SESSIONS){delete sessions[ids.shift()];}
 }
}
function addResource(session,source,isPlaylist){
 var ids=session.resourceIds||(session.resourceIds=Object.create(null));
 var playlists=session.playlists||(session.playlists=Object.create(null));
 if(own(ids,source)){
  if(isPlaylist)playlists[ids[source]]=true;
  return 'http://127.0.0.1:'+PORT+'/r/'+session.id+'/'+ids[source];
 }
 if(session.resources.length>=MAX_RESOURCES)return null;
 var parsed=inspectRemote(source);
 if(!parsed)return null;
 var id=session.resources.length;
 session.resources.push(source);ids[source]=id;
 if(isPlaylist)playlists[id]=true;
 return 'http://127.0.0.1:'+PORT+'/r/'+session.id+'/'+id;
}
function rewritePlaylist(raw,base,session){
 // Includes HLS variant manifests, audio renditions, AES key, init maps.
 var nextIsPlaylist=false;
 return String(raw).replace(/\r/g,'').split('\n').map(function(line){
  if(!line||!line.trim())return line;
  if(line.charAt(0)==='#'){
   if(/^#EXT-X-STREAM-INF:/.test(line))nextIsPlaylist=true;
   var uriIsPlaylist=/^#EXT-X-(?:I-FRAME-STREAM-INF|MEDIA|RENDITION-REPORT):/.test(line);
   return line.replace(/URI=(["'])([^"']+)\1/g,function(full,quote,src){
    var abs=Url.resolve(base,src),local=addResource(session,abs,uriIsPlaylist);
    return local?'URI='+quote+local+quote:full;
   });
  }
  var src=line.trim(),resolved=Url.resolve(base,src);
  var local=addResource(session,resolved,nextIsPlaylist);
  nextIsPlaylist=false;
  return local||line;
 }).join('\n');
}
function usablePlaylist(text){
 // A refresh can return an empty window, an HTML error page or a partial
 // playlist with no segment. hls.js treats those as parsing failures.
 if(!/^#EXTM3U[ \t]*(?:\n|$)/.test(text))return false;
 var media=/^#EXTINF:[^\n]+\n(?:[ \t]*#.*\n)*[ \t]*[^# \t\n][^\n]*/m.test(text)||
  /^#EXT-X-PART:[^\n]*URI="[^"]+"/m.test(text);
 if(media)return /^#EXT-X-TARGETDURATION:[ \t]*[1-9]\d*[ \t]*$/m.test(text);
 return /^#EXT-X-STREAM-INF:[^\n]+\n(?:[ \t]*#.*\n)*[ \t]*[^# \t\n][^\n]*/m.test(text);
}
function respondUpstream(source,req,res,session,depth,chromeRetried,playlistRetries,expectsPlaylist){
 var parsed=inspectRemote(source);
 if(!parsed){json(res,400,{error:'Nguồn không hợp lệ hoặc không được phép.'});return;}
 if(depth>4){json(res,502,{error:'Quá nhiều chuyển hướng nguồn.'});return;}
 dns.lookup(parsed.hostname,function(err,address){
  if(res.finished||res.destroyed)return;
  if(err||!safeIp(String(address||''))){json(res,502,{error:'Không thể xác minh địa chỉ máy chủ phát.'});return;}
  var chromeAt=chromeHosts[parsed.hostname]||0;
  var preferChrome=chromeAt&&Date.now()-chromeAt<60*60*1000;
  var headers={'Host':parsed.host,'Accept':'*/*',
   'User-Agent':preferChrome?CHROME_USER_AGENT:(session.userAgent||CHROME_USER_AGENT)};
  if(req.headers.range)headers.Range=String(req.headers.range).slice(0,120);
  var options={
   hostname:address,port:parsed.port||(parsed.protocol==='https:'?443:80),
   method:'GET',path:parsed.path||'/',headers:headers,servername:parsed.hostname,
   rejectUnauthorized:true,timeout:18000,
   agent:parsed.protocol==='https:'?httpsAgent:httpAgent
  };
  var receivedResponse=false;
  var upstream=(parsed.protocol==='https:'?https:http).request(options,function(remote){
   receivedResponse=true;
   if(remote.statusCode>=300&&remote.statusCode<400&&remote.headers.location){
    remote.resume();
    var target=Url.resolve(source,remote.headers.location);
    respondUpstream(target,req,res,session,depth+1,chromeRetried,playlistRetries,expectsPlaylist);return;
   }
   if(remote.statusCode<200||remote.statusCode>=300){
    if(remote.statusCode===403&&!chromeRetried&&headers['User-Agent']!==CHROME_USER_AGENT){
     recordDiagnostic(session,parsed,remote);
     remote.resume();
     session.userAgent=CHROME_USER_AGENT;
     respondUpstream(source,req,res,session,depth,true,playlistRetries,expectsPlaylist);return;
    }
    recordDiagnostic(session,parsed,remote);
    if(remote.statusCode===403&&headers['User-Agent']===CHROME_USER_AGENT)
     delete chromeHosts[parsed.hostname];
    remote.resume();
    json(res,remote.statusCode>=400&&remote.statusCode<600?remote.statusCode:502,
     {error:'Máy chủ nguồn trả HTTP '+remote.statusCode});return;
   }
   if(headers['User-Agent']===CHROME_USER_AGENT)chromeHosts[parsed.hostname]=Date.now();
   var contentType=String(remote.headers['content-type']||'');
   var isPlaylist=expectsPlaylist||/mpegurl|vnd\.apple|x-mpegurl/i.test(contentType)||
    /\.m3u8?(?:[?#]|$)/i.test(source);
   var size=0,parts=[],done=false;
   function retryInvalidPlaylist(){
    if(done)return;done=true;
    if(playlistRetries<2){
     setTimeout(function(){
      if(!res.finished&&!res.destroyed)
       respondUpstream(source,req,res,session,depth,chromeRetried,playlistRetries+1,true);
     },500*(playlistRetries+1));
    }else json(res,502,{error:'Máy chủ phát trả playlist HLS rỗng hoặc không hợp lệ.'});
   }
   function onUpstreamInterrupted(){
    if(res.finished||res.destroyed)return;
    if(isPlaylist)retryInvalidPlaylist();
    else if(!res.headersSent){done=true;json(res,502,{error:'Dữ liệu phát bị gián đoạn.'});}
    else res.end();
   }
   remote.on('error',onUpstreamInterrupted);
   remote.on('aborted',onUpstreamInterrupted);
   // For unknown extension, sample the first chunk to recognize #EXTM3U.
   function rejectTooLarge(limit){
    if(done)return true;
    if(size<=limit)return false;
    done=true;remote.destroy();
    if(!res.headersSent)json(res,413,{error:'Phần dữ liệu phát vượt giới hạn an toàn.'});
    else res.end();
    return true;
   }
   function sendStreaming(first){
    if(done)return;done=true;
    var h={'Content-Type':contentType||'application/octet-stream','Cache-Control':'no-store'};
    if(remote.headers['content-range'])h['Content-Range']=remote.headers['content-range'];
    if(remote.headers['accept-ranges'])h['Accept-Ranges']=remote.headers['accept-ranges'];
    res.writeHead(remote.statusCode,h);
    res.write(first);
    remote.on('data',function(chunk){
     size+=chunk.length;if(size>MAX_SEGMENT){remote.destroy();res.end();return;}
     res.write(chunk);
    });
    remote.on('end',function(){res.end();});
   }
   remote.once('data',function(first){
    size=first.length;
    if(!isPlaylist&&/^\uFEFF?#EXTM3U/.test(first.toString('utf8',0,Math.min(50,first.length))))isPlaylist=true;
    if(!isPlaylist){sendStreaming(first);return;}
    parts.push(first);
    if(rejectTooLarge(MAX_PLAYLIST))return;
    remote.on('data',function(chunk){size+=chunk.length;parts.push(chunk);rejectTooLarge(MAX_PLAYLIST);});
    remote.on('end',function(){
     if(done)return;
     var playlist=Buffer.concat(parts).toString('utf8').replace(/^\uFEFF/,'').replace(/\r/g,'');
     if(!usablePlaylist(playlist)){retryInvalidPlaylist();return;}
     done=true;
     var rewritten=rewritePlaylist(playlist,source,session);
     res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl; charset=utf-8',
       'Cache-Control':'no-store','Access-Control-Expose-Headers':'Content-Type'});
     res.end(rewritten);
    });
   });
   remote.on('end',function(){
    if(done||size)return;
    if(isPlaylist){retryInvalidPlaylist();return;}
    done=true;
    res.writeHead(remote.statusCode,{'Content-Type':contentType||'application/octet-stream','Cache-Control':'no-store'});
    res.end('');
   });
  });
  upstream.on('error',function(){
   if(!receivedResponse&&!res.finished&&!res.destroyed)json(res,502,{error:'Không kết nối được tới máy chủ phát.'});
  });
  upstream.setTimeout(18000,function(){upstream.abort();});
  upstream.end();
 });
}
function handler(req,res){
 var path=Url.parse(req.url).pathname;
 var mediaMatch=/^\/r\/([0-9a-f]{40})\/(\d+)$/.exec(path);
 var mediaSession=mediaMatch&&sessions[mediaMatch[1]];
 var mediaIndex=mediaMatch?Number(mediaMatch[2]):-1;
 var validMediaRoute=!!(mediaSession&&mediaSession.resources[mediaIndex]&&Date.now()-mediaSession.last<=EXPIRE_MS);
 var mediaGet=req.method==='GET'&&validMediaRoute;
 var mediaOptions=req.method==='OPTIONS'&&validMediaRoute;
 setCors(req,res);
 var origin=req.headers.origin||'';
 if(!own(ALLOWED_ORIGINS,origin)){
  // WebKit may use Origin:null or omit Origin for loopback HLS requests.
  // A valid 160-bit session path is the capability for media only.
  if(!mediaGet&&!mediaOptions){
   json(res,403,{error:'Chỉ ứng dụng TizenBrew trên TV được phép sử dụng.'});return;
  }
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Open-IPTV-Relay, Range');
 }
 // A CORS preflight carries Access-Control-Request-Headers, not the actual
 // X-Open-IPTV-Relay header. Valid media routes can preflight without origin allowlist.
 if(req.method==='OPTIONS'){
  if(!own(ALLOWED_ORIGINS,origin)&&!mediaOptions){json(res,403,{error:'Chỉ ứng dụng TizenBrew trên TV được phép sử dụng.'});return;}
  res.writeHead(204);res.end();return;
 }
 if(!mediaGet&&req.headers['x-open-iptv-relay']!=='1'){
  json(res,403,{error:'Yêu cầu thiếu mã ứng dụng.'});return;
 }
 if(mediaGet){
  mediaSession.last=Date.now();
  mediaSession.mediaRequest={origin:String(origin||'(no Origin)').slice(0,180),
   appHeader:req.headers['x-open-iptv-relay']==='1'};
 }
 if(req.method==='GET'&&path==='/health'){json(res,200,{ok:true,transport:'local-hls',version:SERVICE_VERSION});return;}
 if(req.method==='POST'&&path==='/session'){
  var length=0,parts=[];
  req.on('data',function(chunk){
   length+=chunk.length;
   if(length>8192){json(res,413,{error:'Yêu cầu quá lớn.'});req.destroy();return;}
   parts.push(chunk);
  });
  req.on('end',function(){
   if(length>8192)return;
   var data;
   try{data=JSON.parse(Buffer.concat(parts).toString('utf8'));}catch(e){json(res,400,{error:'Yêu cầu không đúng định dạng.'});return;}
   if(!inspectRemote(data.url)){json(res,400,{error:'Địa chỉ nguồn không hợp lệ.'});return;}
   prune();
   var agent=String(data.browserUserAgent||'').slice(0,300).replace(/[\r\n\u0000-\u001f\u007f]/g,'');
   var session={id:crypto.randomBytes(20).toString('hex'),resources:[String(data.url)],last:Date.now(),userAgent:agent||'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 TV Safari/537.36'};
   sessions[session.id]=session;
   json(res,201,{url:'http://127.0.0.1:'+PORT+'/r/'+session.id+'/0'});
  });
  return;
 }
 var diagMatch=/^\/diag\/([0-9a-f]{40})$/.exec(path);
 if(req.method==='GET'&&diagMatch){
  var debugSession=sessions[diagMatch[1]];
  if(!debugSession||Date.now()-debugSession.last>EXPIRE_MS){json(res,404,{error:'Phiên phát đã hết hạn.'});return;}
  debugSession.last=Date.now();
  json(res,200,{relayVersion:SERVICE_VERSION,browserUserAgent:String(debugSession.userAgent||''),mediaRequest:debugSession.mediaRequest||null,requests:debugSession.requestDiagnostics||[]});
  return;
 }
 var match=/^\/r\/([0-9a-f]{40})\/(\d+)$/.exec(path);
 if(req.method==='GET'&&match){
  var session=sessions[match[1]],index=Number(match[2]);
  if(!session||!session.resources[index]||Date.now()-session.last>EXPIRE_MS){
   json(res,404,{error:'Phiên phát đã hết hạn.'});return;
  }
  session.last=Date.now();
  respondUpstream(session.resources[index],req,res,session,0,false,0,index===0||Boolean(session.playlists&&session.playlists[index]));
  return;
 }
 json(res,404,{error:'Không có đường dẫn này.'});
}
function startServer(port){
 var server=http.createServer(handler);
 server.on('error',function(error){
  // Another running version can own the single local port. Do not throw.
  if(error.code!=='EADDRINUSE')console.error('Open IPTV TV relay unavailable: '+error.code);
 });
 server.listen(port||PORT,'127.0.0.1');
 return server;
}
module.exports={
 startServer:startServer,handler:handler,rewritePlaylist:rewritePlaylist,
 inspectRemote:inspectRemote,safeIp:safeIp
};
// TizenBrew service launcher evaluates this file with module={exports:{}}.
// In node:test, requiring the helper must not start a background listener.
if(!module.parent)startServer(PORT);
