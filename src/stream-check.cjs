'use strict';
const {rewriteHls}=require('./core.cjs');
async function getPart(url, {timeout=6500, maxBytes=400000, headers={}}={}) {
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),timeout);
  try {
    const res=await fetch(url,{headers:{'User-Agent':'Open-IPTV-Pro/4.1', ...headers},signal:ctrl.signal,redirect:'follow'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const chunks=[];let n=0;
    for await(const p of res.body) {chunks.push(p);n+=p.length;if(n>=maxBytes)break;}
    return {data:Buffer.concat(chunks).subarray(0,maxBytes),url:res.url,type:res.headers.get('content-type')||''};
  } finally {clearTimeout(timer);}
}
function isVideoData(b, type=''){
  if(!b||b.length<10)return false;
  const t=String(type).toLowerCase();
  if(t.includes('text/html')||/<!doctype html|<html|<head|access denied|not found/i.test(b.subarray(0,250).toString('utf8')))return false;
  if(b[0]===0x47 && (b.length<189||b[188]===0x47 || (b.length>377&&b[376]===0x47)))return true;
  if(b.subarray(4,8).toString()==='ftyp'||b.includes(Buffer.from('moof'))||b.includes(Buffer.from('mdat')))return true;
  if(b.subarray(0,3).toString()==='ID3'||b.subarray(0,4).toString()==='OggS'||b.subarray(0,4).toString()==='FLV\x01'||b.subarray(0,4).toString()==='\x1aE\xdf\xa3')return true;
  if(b.length>2048&&/video|audio|octet-stream/i.test(t))return true;
  return false;
}
function isHls(txt, url='',type='') {return /^#EXTM3U/m.test(txt.slice(0,500)) && (/#EXT-X-/.test(txt)||/mpegurl|\.m3u8(?:\?|$)/i.test(type+' '+url));}
async function inspectHls(url, depth=0) {
 if(depth>3)throw new Error('HLS lồng quá sâu');
 const manifest=await getPart(url,{maxBytes:1024*1024,timeout:9000});
 const body=manifest.data.toString('utf8');
 if(!isHls(body,manifest.url,manifest.type))throw new Error('HLS manifest không hợp lệ');
 const streams=body.split(/\r?\n/).map(x=>x.trim());
 if(streams.some(s=>/^#EXT-X-STREAM-INF:/i.test(s))) {
   const indexes=streams.flatMap((s,i)=>/^#EXT-X-STREAM-INF:/i.test(s)?[i]:[]);
   for(const index of indexes.slice(0,2)) {
     const next=streams.slice(index+1).find(x=>x && !x.startsWith('#'));
     if(next) {try{return await inspectHls(new URL(next,manifest.url).href,depth+1);}catch{}}
   }
   throw new Error('Không tải được playlist chất lượng HLS');
 }
 if(/#EXT-X-KEY:METHOD=(?!NONE)/.test(body)&&/KEYFORMAT="(?!identity)/.test(body))throw new Error('HLS có DRM; không thể kiểm thử tự động');
 const segs=streams.filter(s=>s&&!s.startsWith('#')).slice(0,3);
 if(!segs.length)throw new Error('HLS chưa có video segment');
 const first=new URL(segs[0],manifest.url).href;
 const r=await getPart(first,{maxBytes:100000,timeout:9000,headers:{Range:'bytes=0-99999'}});
 if(!isVideoData(r.data,r.type))throw new Error('Segment đầu không phải dữ liệu video hợp lệ');
 if(segs.length>1) {
   const r2=await getPart(new URL(segs[Math.min(1,segs.length-1)],manifest.url).href,{maxBytes:60000,timeout:9000,headers:{Range:'bytes=0-59999'}});
   if(!isVideoData(r2.data,r2.type))throw new Error('Segment thứ hai không hợp lệ');
 }
 return {kind:'HLS',description:'Manifest + segment video đã tải được'};
}
async function inspectLink(url) {
 try {
  if(!/^https?:\/\//i.test(url))return {status:'uncertain',reason:'Định dạng RTSP/UDP/RTMP chưa hỗ trợ kiểm tra tích hợp'};
  const p=await getPart(url,{maxBytes:130000,timeout:8500,headers:{Range:'bytes=0-129999'}});
  const s=p.data.toString('utf8');
  if(isHls(s,p.url,p.type)) {const x=await inspectHls(url);return {status:'alive',reason:x.description};}
  if(isVideoData(p.data,p.type))return {status:'alive',reason:'Đã tải được byte dữ liệu video thực'};
  return {status:'dead',reason:'Phản hồi không phải video hoặc HLS'};
 }catch(e){
   const m=e?.message||String(e);
   return {status:/abort|timeout|DRM|403|429|401/i.test(m)?'uncertain':'dead',reason:m.slice(0,160)};
 }
}
async function checkRepeated(url) {
 const a=await inspectLink(url);
 if(a.status!=='alive')return {...a,rounds:1};
 await new Promise(resolve=>setTimeout(resolve,350));
 const b=await inspectLink(url);
 return b.status==='alive'?{status:'alive',reason:`2 vòng đạt • ${b.reason}`,rounds:2}:{status:'uncertain',reason:`Vòng 1 đạt; vòng 2 lỗi: ${b.reason}`,rounds:2};
}
module.exports={getPart,isVideoData,isHls,inspectHls,inspectLink,checkRepeated};
