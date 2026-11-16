#!/usr/bin/env node
'use strict';
// Diagnostic only: no credentials, signed query strings or full media URLs are logged.
// Tests the manifest, nested media playlist and first media segment.
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const {parseM3U}=require('../src/core.cjs');
const {fetchStream,browserUserAgent,validHlsManifest}=require('../src/hls-relay.cjs');
const file=process.argv[2];
const keyword=(process.argv[3]||'Doraemon Movie 44').toLocaleLowerCase('vi-VN');
if(!file){console.error('Cach dung: node scripts/diagnose-hls-segments.cjs "~/Documents/live events iptv.m3u" "Doraemon Movie 44"');process.exit(2);}
let channels;try{channels=parseM3U(fs.readFileSync(file,'utf8'));}catch(e){console.error('Khong doc duoc playlist: '+e.message);process.exit(2);}
const ch=channels.find(c=>c.name.toLocaleLowerCase('vi-VN').includes(keyword));
if(!ch){console.error('Khong tim thay ten phim tuong ung.');process.exit(2);}
const hostname=u=>{try{return new URL(u).hostname;}catch{return 'khong-ro-host';}};
const code=e=>String(e?.cause?.code||e?.code||e?.name||'NETWORK_ERROR').replace(/[^A-Za-z0-9_]/g,'').slice(0,70);
async function readLimitedBody(res,limit){const reader=res.body?.getReader();if(!reader)return '';let size=0;const chunks=[];try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value?.length||0;if(size>limit)throw Error('MAX_BODY');chunks.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}return Buffer.concat(chunks).toString('utf8');}
function curlCheck(url,manifest=false){const args=['-sS','-L','--connect-timeout','5','--max-time','12','-o','/dev/null','-w','%{http_code}'];if(!manifest)args.push('--range','0-1023');args.push(url);const r=spawnSync('curl',args,{encoding:'utf8',timeout:16000,maxBuffer:8192});return r.error?'CURL_ERROR':`${String(r.stdout||'').trim()||'000'} (exit ${r.status??'?'})`;}
async function fetchHead(url,what,{manifest=false}={}){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
 try{
  const headers={'User-Agent':browserUserAgent(),'Accept':'*/*'};
  if(!manifest)headers.Range='bytes=0-1023';
  let response=await fetch(url,{headers,signal:ctrl.signal,redirect:'follow'});
  if(!manifest&&response.status===416){await response.body?.cancel();delete headers.Range;response=await fetch(url,{headers,signal:ctrl.signal,redirect:'follow'});}
  console.log(`${what}: HTTP ${response.status}; host ${hostname(response.url)}; curl HTTP ${curlCheck(url,manifest)}`);
  if(!response.ok)return null;
  if(manifest)return {body:await readLimitedBody(response,512*1024),finalUrl:response.url};
  await response.body?.cancel();return {ok:true};
 }catch(e){console.log(`${what}: LOI ${code(e)}; host ${hostname(url)}; curl HTTP ${curlCheck(url,manifest)}`);return null;}
 finally{clearTimeout(timer);}
}
function children(text,url){const lines=text.split(/\r?\n/),out=[];for(let i=0;i<lines.length;i++){
 const line=lines[i].trim();if(!line||line.startsWith('#'))continue;
 try{const target=new URL(line,url).href;if(/^https?:\/\//.test(target))out.push(target);}catch{}
}return out;}
(async()=>{
 console.log('Chuan doan manifest va segment (KHONG in URL/token).');
 console.log('Kenh: '+ch.name.slice(0,100)+'; host '+hostname(ch.url));
 let next=ch.url;
 for(let depth=0;depth<3;depth++){
  const hit=await fetchHead(next,depth===0?'Manifest':`Playlist cap ${depth+1}`,{manifest:true});if(!hit)return;
  if(!validHlsManifest(hit.body)){console.log('NO HLS MANIFEST');return;}
  const variants=children(hit.body,hit.finalUrl);if(!variants.length){console.log('Manifest khong co segment.');return;}
  if(/#EXT-X-STREAM-INF/i.test(hit.body)){next=variants[0];continue;}
  await fetchHead(variants[0],'Segment dau tien');
  console.log('Neu manifest 200 nhung segment 403: server tu choi segment. Khong ket luan nguon Die; can doi chieu quyen URL/headers hop le voi ung dung phat duoc.');return;
 }
 console.log('Co nhieu cap playlist; chi kiem tra 3 cap.');
})().catch(()=>{console.error('Loi khong xac dinh (khong xuat URL).');process.exitCode=1;});
