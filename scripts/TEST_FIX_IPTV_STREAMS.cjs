#!/usr/bin/env node
'use strict';
/** Diagnose A -> B -> A on user's Mac/Windows with their real network.
 * Only prints channel names/status/timing. Never prints stream URLs or query tokens.
 * This checks the HTTP path only; it does not prove codec decode or DRM access.
 */
const fs=require('node:fs');
const {parseM3U}=require('../src/core.cjs');
const {inspectMedia}=require('../src/media-inspection.cjs');
const {browserUserAgent}=require('../src/hls-relay.cjs');
const file=process.argv[2];
if(!file){console.error('Dung: node scripts/TEST_FIX_IPTV_STREAMS.cjs "/path/FIX iptv.m3u" [ten-kenh-1] [ten-kenh-2]');process.exit(2);}
const channels=parseM3U(fs.readFileSync(file,'utf8'),'local');
const names=[process.argv[3]||'VTV3',process.argv[4]||'VTV4'];
const rows=names.map(name=>channels.find(ch=>ch.name===name)||channels.find(ch=>ch.name.toLowerCase().includes(name.toLowerCase())));
if(rows.some(x=>!x)){console.error('Khong tim thay mot trong hai kenh trong playlist');process.exit(2);}
const sequence=[rows[0],rows[1],rows[0]];
const headers={'User-Agent':browserUserAgent(),'Accept':'*/*'};
async function probe(url,maxBytes=65536,ms=9000){
 const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),ms);let reader;
 const start=performance.now();
 try{
  const response=await fetch(url,{signal:ctrl.signal,redirect:'follow',headers});
  const status=response.status;let bytes=Buffer.alloc(0);
  if(response.body&&response.ok){reader=response.body.getReader();const r=await reader.read();if(r.value)bytes=Buffer.from(r.value).subarray(0,maxBytes);}
  return {status,bytes,elapsedMs:Math.round(performance.now()-start),finalUrl:response.url||url,type:response.headers.get('content-type')||''};
 }finally{clearTimeout(tid);if(reader)try{await reader.cancel();}catch{}}
}
async function inspect(ch){
 const started=performance.now();
 try{
  const result=await probe(ch.url);let resultMode='unknown',segmentStatus='-',segmentMs='-';
  if(result.status>=200&&result.status<300){
   const type=inspectMedia({url:result.finalUrl,contentType:result.type,sample:result.bytes});
   resultMode=type.format;
   if(type.hls){
    const text=result.bytes.toString('utf8');
    const first=text.split(/\r?\n/).map(x=>x.trim()).find(x=>x&&!x.startsWith('#'));
    if(first){
     try{
      const part=await probe(new URL(first,result.finalUrl).href,4096,9000);
      segmentStatus=String(part.status);segmentMs=String(part.elapsedMs);
     }catch{segmentStatus='network-error';}
    }
   }
  }
  console.log(`${ch.name.slice(0,44)} | HTTP ${result.status} | ${resultMode} | tai-dau ${result.elapsedMs}ms | phan-doan ${segmentStatus} (${segmentMs}ms) | tong ${Math.round(performance.now()-started)}ms`);
 }catch(e){console.log(`${ch.name.slice(0,44)} | KET NOI THAT BAI | ${String(e?.cause?.code||e?.code||e?.name||'NETWORK_ERROR').replace(/[^A-Z_0-9]/gi,'').slice(0,50)}`);}
}
console.log('KIEM TRA NGUON FIX IPTV THEO THU TU A -> B -> A; khong in link co token');
console.log('Chi kiem tra ket noi/manifest/phan doan, khong thay the viec phat video that trong Electron.');
(async()=>{for(const ch of sequence)await inspect(ch);})().catch(()=>{process.exitCode=1;});
