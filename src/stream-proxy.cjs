'use strict';
/** Shared, testable HTTP relay used by the Electron loopback server. */
const {Readable}=require('node:stream');
const {inspectMedia}=require('./media-inspection.cjs');
const {rewriteHls}=require('./core.cjs');
const {fetchStream,validHlsManifest,httpErrorText,browserUserAgent,isManifestURL}=require('./hls-relay.cjs');
const MAX_HLS_BYTES=5*1024*1024;
function rewriteDashManifest(xml,upstreamUrl){
 const content=String(xml||'');
 if(!/<MPD(?:\s|>)/i.test(content)||/<!DOCTYPE|<!ENTITY/i.test(content))throw Error('Không phải manifest DASH MPD an toàn');
 // dash.js resolves relative SegmentTemplate and BaseURL against this original
 // directory; RequestModifier then tunnels segment URLs via the local relay.
 const originalBase=new URL('.',upstreamUrl).href.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 const inserted=content.replace(/<MPD\b[^>]*>/i,match=>match+'<BaseURL>'+originalBase+'</BaseURL>');
 if(inserted===content)throw Error('Thiếu thẻ MPD');
 return inserted;
}

async function relayStream({req,res,url,proxyUrl,fetcher=fetch,connectTimeoutMs=25000,userAgent=browserUserAgent()}){
 const ctrl=new AbortController();
 const timeout=setTimeout(()=>ctrl.abort(),connectTimeoutMs);
 try{
  const range=req.headers.range;
  const upstream=await fetchStream(fetcher,url,{range,signal:ctrl.signal,userAgent});
  const type=upstream.headers.get('content-type')||'';
  const headers={'Content-Type':type||'application/octet-stream','Cache-Control':'no-store'};
  const upstreamRange=upstream.headers.get('accept-ranges');
  if(upstreamRange)headers['Accept-Ranges']=upstreamRange;
  const contentRange=upstream.headers.get('content-range');
  if(contentRange)headers['Content-Range']=contentRange;
  if(!upstream.ok){
   clearTimeout(timeout);
   res.writeHead(upstream.status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
   res.end(httpErrorText(upstream.status));
   try{await upstream.body?.cancel();}catch{}return;
  }
  if(!upstream.body)throw Error('Máy chủ không trả dữ liệu phát');
  const reader=upstream.body.getReader();
  const first=await reader.read();
  const head=Buffer.from(first.value||[]);
  const info=inspectMedia({url:upstream.url,contentType:type,sample:head.subarray(0,65536).toString('utf8')});
  if(info.dash||/\.mpd(?:[?#]|$)/i.test(url)){
   let bytes=head.length;const chunks=[head];
   if(bytes>MAX_HLS_BYTES)throw Error('Manifest DASH vượt giới hạn 5 MB');
   if(!first.done)for(;;){const next=await reader.read();if(next.done)break;bytes+=next.value.byteLength;
    if(bytes>MAX_HLS_BYTES)throw Error('Manifest DASH vượt giới hạn 5 MB');chunks.push(Buffer.from(next.value));}
   const data=Buffer.from(rewriteDashManifest(Buffer.concat(chunks).toString('utf8'),upstream.url),'utf8');
   clearTimeout(timeout);
   res.writeHead(200,{'Content-Type':'application/dash+xml; charset=utf-8','Content-Length':data.length,'Cache-Control':'no-store'});
   res.end(data);return;
  }
  if(info.hls||isManifestURL(url)||isManifestURL(upstream.url)){
   let bytes=head.length;const chunks=[head];
   if(bytes>MAX_HLS_BYTES)throw Error('Manifest HLS vượt giới hạn 5 MB');
   while(!first.done){
    const next=await reader.read();if(next.done)break;
    bytes+=next.value.byteLength;
    if(bytes>MAX_HLS_BYTES)throw Error('Manifest HLS vượt giới hạn 5 MB');
    chunks.push(Buffer.from(next.value));
   }
   const manifest=Buffer.concat(chunks).toString('utf8');
   if(!validHlsManifest(manifest)){
    res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
    res.end('Nguồn không trả manifest HLS hợp lệ (trang HTML, nguồn hết hạn hoặc định dạng khác)');
   }else{
    const rewritten=rewriteHls(manifest,upstream.url,proxyUrl);
    const data=Buffer.from(rewritten,'utf8');
    res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl; charset=utf-8','Content-Length':data.length,'Cache-Control':'no-store'});
    res.end(data);
   }
   clearTimeout(timeout);return;
  }
  const contentLength=upstream.headers.get('content-length');if(contentLength)headers['Content-Length']=contentLength;
  clearTimeout(timeout);
  res.writeHead(upstream.status,headers);
  const body=Readable.from((async function*(){
   try{
    if(head.length)yield head;
    if(!first.done)for(;;){const next=await reader.read();if(next.done)break;yield Buffer.from(next.value);}
   }finally{try{await reader.cancel();}catch{}}
  })());
  body.on('error',()=>res.destroy());body.pipe(res);
  res.once('close',()=>{ctrl.abort();body.destroy();});
 }catch(e){
  clearTimeout(timeout);ctrl.abort();
  if(!res.headersSent)res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
  if(!res.writableEnded)res.end('Không tải được nguồn: '+String(e.message||e).slice(0,200));
 }
}
module.exports={relayStream,MAX_HLS_BYTES,rewriteDashManifest};
