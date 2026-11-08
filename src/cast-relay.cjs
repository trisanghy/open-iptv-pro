'use strict';
const http=require('node:http');
const os=require('node:os');
const dgram=require('node:dgram');
const {randomBytes,createHmac,timingSafeEqual}=require('node:crypto');
const {Readable}=require('node:stream');
const {rewriteHls}=require('./core.cjs');
function validUrl(raw){const url=new URL(raw);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('Chỉ hỗ trợ video HTTP/HTTPS');return url.href;}
function localAddress(target){
 return new Promise(resolve=>{
  const fallback=Object.values(os.networkInterfaces()).flat().find(x=>x.family==='IPv4'&&!x.internal)?.address||'127.0.0.1';
  if(!target)return resolve(fallback);
  let done=false;const sock=dgram.createSocket('udp4');
  const finish=(v)=>{if(done)return;done=true;try{sock.close();}catch{}resolve(v||fallback);};
  const timer=setTimeout(()=>finish(fallback),1500);timer.unref?.();
  sock.once('error',()=>{clearTimeout(timer);finish(fallback);});
  try{sock.connect(8009,target,()=>{clearTimeout(timer);try{finish(sock.address().address);}catch{finish(fallback);}});}catch{clearTimeout(timer);finish(fallback);}
 });
}
class CastRelay{
 constructor({fetchImpl=globalThis.fetch,hostSelector=localAddress}={}){this.fetchImpl=fetchImpl;this.hostSelector=hostSelector;this.server=null;this.key=null;this.signingSecret=null;this.base=null;this.contentUrl=null;this.pageUrl=null;}
 sign(url){return createHmac('sha256',this.signingSecret).update(url).digest('hex').slice(0,32);}
 mediaUrl(url){url=validUrl(url);return `${this.base}/media/${this.key}?u=${encodeURIComponent(url)}&sig=${this.sign(url)}`;}
 async start(sourceUrl,deviceAddress){
  const verified=validUrl(sourceUrl);await this.stop();
  this.key=randomBytes(24).toString('hex');this.signingSecret=randomBytes(32);
  const address=await this.hostSelector(deviceAddress);
  if(!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(address)||address==='127.0.0.1'&&deviceAddress)throw Error('Không tìm được địa chỉ LAN để TV truy cập');
  this.server=http.createServer((req,res)=>{this.handle(req,res).catch(e=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});if(!res.destroyed)res.end('Lỗi truyền luồng: '+String(e.message||e).slice(0,150));});});
  try{await new Promise((ok,fail)=>{this.server.once('error',fail);this.server.listen(0,'0.0.0.0',ok);});}
  catch(e){await this.stop();throw e;}
  this.base=`http://${address}:${this.server.address().port}`;
  this.contentUrl=this.mediaUrl(verified);
  this.pageUrl=`${this.base}/player/${this.key}`;
  return {url:this.contentUrl,page:this.pageUrl,ip:address};
 }
 async handle(req,res){
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const address=new URL(req.url,'http://relay.local');
  if(!this.key||!address.pathname.endsWith('/'+this.key)){res.writeHead(403);res.end();return;}
  if(address.pathname.startsWith('/player/')){
   if(req.method!=='GET'){res.writeHead(405);res.end();return;}
   const src=this.contentUrl.replaceAll('&','&amp;').replaceAll('"','&quot;');
   const page=`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open IPTV Pro · TV</title><style>body{background:#080d17;color:#edf2ff;font:16px system-ui;margin:0;padding:24px;text-align:center}video{width:min(100%,1100px);aspect-ratio:16/9;background:#000}button{padding:12px 20px;border:0;border-radius:10px;background:#ba8cff;margin:14px;cursor:pointer}p{color:#adbad2}</style></head><body><h2>Open IPTV Pro · Phát trên TV / AirPlay</h2><video id="v" src="${src}" controls autoplay playsinline x-webkit-airplay="allow" webkit-playsinline></video><p>Trên Safari của Mac, chọn nút AirPlay trên video hoặc bấm nút bên dưới.</p><button onclick="var v=document.getElementById('v');if(v.webkitShowPlaybackTargetPicker)v.webkitShowPlaybackTargetPicker();else alert('Dùng Safari trên Mac hoặc Phản chiếu màn hình (Screen Mirroring).')">Chọn thiết bị AirPlay</button><p>TV và máy tính cần chung mạng Wi-Fi. Một số nguồn có DRM hoặc định dạng không tương thích sẽ không phát được.</p></body></html>`;
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; media-src http: https:"});res.end(page);return;
  }
  if(!address.pathname.startsWith('/media/')){res.writeHead(404);res.end();return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const url=validUrl(address.searchParams.get('u')||'');
  const claimed=String(address.searchParams.get('sig')||'');
  const expected=this.sign(url);if(!/^[0-9a-f]{32}$/.test(claimed)||!timingSafeEqual(Buffer.from(claimed),Buffer.from(expected))){res.writeHead(403);res.end();return;}
  const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),18000);
  res.once('close',()=>ctrl.abort());
  try{
   const upstream=await this.fetchImpl(url,{signal:ctrl.signal,redirect:'follow',headers:{'User-Agent':'Open-IPTV-Pro/4.22.2',...(req.headers.range?{Range:req.headers.range}:{})},method:req.method});
   const ctype=upstream.headers.get('content-type')||'application/octet-stream';
   const isHls=/mpegurl/i.test(ctype)||/\.m3u8?(?:$|\?)/i.test(upstream.url||url);
   const headers={'Cache-Control':'no-store','Content-Type':ctype,'Access-Control-Allow-Origin':'*'};
   for(const k of ['content-range','accept-ranges','content-length']){const v=upstream.headers.get(k);if(v)headers[k]=v;}
   if(isHls&&upstream.ok&&req.method!=='HEAD'){
    const parts=[];let size=0;
    for await(const chunk of upstream.body){size+=chunk.length;if(size>5_000_000){ctrl.abort();throw Error('Manifest HLS quá lớn');}parts.push(Buffer.from(chunk));}
    const body=Buffer.concat(parts).toString('utf8');
    if(/#EXT-X-/i.test(body)){
     const encoded=Buffer.from(rewriteHls(body,upstream.url||url,(u)=>this.mediaUrl(u)));
     res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl; charset=utf-8','Content-Length':encoded.length,'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(encoded);
    }else{res.writeHead(upstream.status,headers);res.end(body);}
   }else{
    // The timeout protects the handshake, never an established live stream.
    clearTimeout(timeout);res.writeHead(upstream.status,headers);
    if(req.method==='HEAD'||!upstream.body){res.end();return;}
    const media=Readable.fromWeb(upstream.body);media.on('error',()=>res.destroy());media.pipe(res);
   }
  }finally{clearTimeout(timeout);}
 }
 async stop(){const server=this.server;this.server=null;this.key=null;this.signingSecret=null;this.base=null;this.contentUrl=null;this.pageUrl=null;if(server){server.closeAllConnections?.();await new Promise(resolve=>server.close(()=>resolve()));}}
}
module.exports={CastRelay,localAddress,validUrl};
