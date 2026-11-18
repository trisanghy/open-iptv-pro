#!/usr/bin/env node
'use strict';
// LOCAL troubleshooting tool. Prints only names, hostnames, HTTP status and format.
// Does not store URLs, cookies or playlist credentials in reports.
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {parseM3U}=require('../src/core.cjs');
const {fetchStream,browserUserAgent,httpErrorText}=require('../src/hls-relay.cjs');
const {inspectMedia}=require('../src/media-inspection.cjs');
function networkCode(err){
 const nested=err?.cause?.errors?.find?.(e=>e?.code);
 const code=err?.cause?.code||nested?.code||err?.code;
 if(code&&/^[A-Z][A-Z0-9_]{1,64}$/.test(code))return code;
 return err?.name==='AbortError'?'TIMEOUT':String(err?.name||'NETWORK_ERROR').replace(/[^A-Za-z0-9_]/g,'').slice(0,48);
}
async function compareWithCurl(channel,host){
 const tmp=path.join(os.tmpdir(),`open-iptv-diagnostic-${process.pid}-${Math.random().toString(16).slice(2)}.bin`);
 const args=['--location','--max-redirs','5','--silent','--show-error','--connect-timeout','7','--max-time','14',
  '--max-filesize','1048576','--user-agent',browserUserAgent(),
  '--output',tmp,'--write-out','\n%{http_code}\n%{content_type}',channel.url];
 let output='',error='',exitCode=-1;
 try{
  await new Promise(resolve=>{
   const child=spawn('curl',args,{stdio:['ignore','pipe','pipe'],windowsHide:true});
   child.stdout.on('data',chunk=>{output+=chunk.toString('utf8').slice(0,300);});
   child.stderr.on('data',chunk=>{error+=chunk.toString('utf8').slice(0,300);});
   child.on('error',e=>{error=e.code||e.message;resolve();});
   child.on('close',code=>{exitCode=code;resolve();});
  });
  const lines=output.trim().split(/\r?\n/),code=Number(lines[lines.length-2])||0;
  const type=(lines[lines.length-1]||'').slice(0,90);
  let media='unknown';
  if(fs.existsSync(tmp)){
   const handle=fs.openSync(tmp,'r');let sample=Buffer.alloc(65536);
   const count=fs.readSync(handle,sample,0,65536,0);fs.closeSync(handle);
   const info=inspectMedia({url:channel.url,contentType:type,sample:sample.subarray(0,count).toString('utf8')});
   media=`${info.format} / ${info.mode}`;
  }
  const status=code||'NO_HTTP';
  // Do not print input URL or curl stderr: either could contain private tokens.
  console.log(`  curl (macOS): HTTP ${status}, ${type||'unknown MIME'}, ${media}, exit=${exitCode}`);
  if(exitCode!==0){
   const nr=Number(/curl: \((\d+)\)/.exec(error)?.[1]||0);
   const detail={6:'DNS không phân giải',7:'Không kết nối được',28:'Hết thời gian',35:'Lỗi bắt tay TLS',56:'Kết nối bị ngắt',60:'Chứng chỉ TLS không hợp lệ',63:'Phản hồi vượt giới hạn kiểm tra'}[nr]||'Không xác định';
   console.log(`  curl code ${nr||exitCode}: ${detail} (không kết luận Die)`);
  }
  if(exitCode===0&&code>=200&&code<300)console.log('  Node lỗi nhưng curl tải được: nên thử trình tải Chromium trong Open IPTV Pro mới.');
 }finally{try{fs.unlinkSync(tmp);}catch{}}
}

const args=process.argv.slice(2),filename=args[0];
if(!filename||!fs.existsSync(filename)){
 console.error('Cach dung: node scripts/diagnose-m3u.cjs "/duong-dan/playlist.m3u" --group "LIVE EVENTS" --limit 5');
 console.error('Thêm --offline để chỉ thống kê, không kết nối Internet.');process.exitCode=2;
}else{
 const groupIndex=args.indexOf('--group');const group=groupIndex>=0?(args[groupIndex+1]||'LIVE EVENTS'):'LIVE EVENTS';
 const idx=args.lastIndexOf('--limit'),limit=idx<0?5:Math.max(1,Math.min(30,Number(args[idx+1])||5));
 const compareCurl=args.includes('--compare-curl');
 const offline=args.includes('--offline');
 const raw=fs.readFileSync(filename,'utf8');
 const channels=parseM3U(raw,'diagnostic');
 const chosen=channels.filter(c=>c.group.toLowerCase().includes(group.toLowerCase()));
 const kinds={hls:0,dash:0,other:0};
 for(const ch of chosen){if(/\.m3u8?(?:$|\?)/i.test(ch.url))kinds.hls++;else if(/\.mpd(?:$|\?)/i.test(ch.url))kinds.dash++;else kinds.other++;}
 console.log(`Danh sach: ${channels.length} kenh; nhom ${group}: ${chosen.length} (${kinds.hls} HLS, ${kinds.dash} DASH, ${kinds.other} khac).`);
 if(compareCurl)console.log('So sanh Node fetch voi curl (macOS, su dung cau hinh mang he thong).');
 if(offline)console.log('Chi thong ke offline, khong kiem tra URL.');
 else (async()=>{
  for(const c of chosen.slice(0,limit)){
   const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),12000);
   const hostname=new URL(c.url).hostname;
   try{
    const r=await fetchStream(fetch,c.url,{signal:ctl.signal,userAgent:browserUserAgent(),range:'bytes=0-65535'});
    if(!r.ok){console.log(`[${r.status}] ${c.name.slice(0,65)} · ${hostname}: ${httpErrorText(r.status)}`);try{await r.body?.cancel();}catch{}if(compareCurl)await compareWithCurl(c,hostname);continue;}
    const reader=r.body?.getReader();let sample='';if(reader){const first=await reader.read();sample=Buffer.from(first.value||[]).subarray(0,64*1024).toString('utf8');await reader.cancel();}
    const m=inspectMedia({url:c.url,contentType:r.headers.get('content-type'),sample,acceptRanges:r.headers.get('accept-ranges')});
    console.log(`[${r.status}] ${c.name.slice(0,65)} · ${hostname}: ${m.format.toUpperCase()}, ${m.mode}, ${r.headers.get('content-type')||'unknown MIME'}`);
   }catch(e){
    const code=networkCode(e);
    console.log(`[ERR] ${c.name.slice(0,65)} · ${hostname}: ${e.name==='AbortError'?'hết thời gian':code}`);
    if(compareCurl)await compareWithCurl(c,hostname);
   }
   finally{clearTimeout(timeout);}
  }
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
