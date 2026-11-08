'use strict';
// Conservative IPTV checker: "Die" only when repeated 404/410 on the stream URL.
// Temporary failures, geo-blocks, expiring HLS segments and protected content
// are "uncertain". A positive video/segment proof beats any later transient error.
const BROWSER_UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36';
const PLAYER_UA='Open-IPTV-Pro/4.11';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function errorForStatus(status,url){const err=new Error('HTTP '+status);err.statusCode=status;err.url=url;return err;}
async function getPart(url,{timeout=8500,maxBytes=150000,headers={},fetcher=fetch,ua=PLAYER_UA}={}){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);let reader;
 try{
  const response=await fetcher(url,{headers:{'User-Agent':ua,Accept:'*/*',...headers},signal:controller.signal,redirect:'follow'});
  if(!response.ok)throw errorForStatus(response.status,response.url||url);
  if(!response.body)throw new Error('Không có dữ liệu phản hồi');
  reader=response.body.getReader();const chunks=[];let total=0;
  while(total<maxBytes){const {done,value}=await reader.read();if(done)break;if(value?.length){const part=Buffer.from(value);chunks.push(part);total+=part.length;}}
  return {data:Buffer.concat(chunks).subarray(0,maxBytes),url:response.url||url,type:response.headers?.get('content-type')||'',status:response.status};
 }finally{
  clearTimeout(timer);
  if(reader)await reader.cancel().catch(()=>{});
 }
}
function isVideoData(b,type=''){
 if(!b||b.length<8)return false;
 const sample=b.subarray(0,384).toString('utf8');
 if(/<!doctype html|<html|<head\b|access denied|cloudflare|error 404|not found/i.test(sample))return false;
 const t=String(type).toLowerCase();if(/text\/html|application\/json/.test(t))return false;
 if(b[0]===0x47 && (b.length<189||b[188]===0x47||b.length>377&&b[376]===0x47))return true;
 // A TS stream may start after ID3/PAT junk; look for repeating 188-byte sync.
 for(let i=1;i<Math.min(188,b.length-188);i++)if(b[i]===0x47&&b[i+188]===0x47)return true;
 if(b[0]===0xff&&(b[1]&0xf0)===0xf0&&/audio|aac|octet-stream/.test(t))return true;
 if(b.subarray(4,8).toString()==='ftyp'||b.includes(Buffer.from('moof'))||b.includes(Buffer.from('mdat')))return true;
 if(['ID3','OggS','FLV\x01'].some(sig=>b.subarray(0,sig.length).toString()===sig))return true;
 if(b.length>3200&&(/video\/|audio\/|application\/octet-stream|mp2t/.test(t)))return true;
 return false;
}
function isHls(txt,url='',type=''){
 return /^\s*#EXTM3U/m.test(txt.slice(0,512)) && (/#EXT-X-/i.test(txt)||/mpegurl|\.m3u8(?:\?|$)/i.test(type+' '+url));
}
function parseAttribute(line,attribute){const m=line.match(new RegExp('(?:^|[,\\s])'+attribute+'="([^"]+)"','i'));return m?.[1]||'';}
function nonEmptySegments(lines){return lines.filter(line=>line&&line[0]!=='#');}
function byteRangeForSegment(lines,index){for(let i=index-1;i>=0;i--){const line=lines[i];if(!line)continue;if(line.startsWith('#EXT-X-BYTERANGE:')){const m=line.match(/(\d+)(?:@(\d+))?/);if(m&&m[2])return `bytes=${Number(m[2])}-${Number(m[2])+Math.min(Number(m[1]),99999)-1}`;return null;}if(!line.startsWith('#'))break;}return null;}
function segmentURL(line,base){try{return new URL(line,base).href;}catch{return null;}}
function uncertain(reason,more={}){return {status:'uncertain',reason:String(reason).slice(0,250),...more};}
function alive(reason,more={}){return {status:'alive',reason,positiveEvidence:true,...more};}
async function inspectHls(url,depth=0,options={}){
 if(depth>4)return uncertain('Danh sách HLS lồng nhau quá sâu');
 let manifest;
 try{manifest=await getPart(url,{...options,timeout:10000,maxBytes:1024*1024,headers:{}});}catch(e){return uncertain(`Không tải được HLS manifest: ${e.message}`,{httpStatus:e.statusCode});}
 const body=manifest.data.toString('utf8');
 if(!isHls(body,manifest.url,manifest.type))return uncertain('Phản hồi không phải HLS manifest hợp lệ');
 const lines=body.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const variants=[];
 for(let i=0;i<lines.length;i++)if(/^#EXT-X-STREAM-INF:/i.test(lines[i])){
  const next=lines.slice(i+1).find(x=>x[0]!=='#');if(next)variants.push(next);
 }
 if(variants.length){
  let reasons=[];
  for(const v of variants.slice(0,3)){
   const resolved=segmentURL(v,manifest.url);if(!resolved)continue;
   const result=await inspectHls(resolved,depth+1,options);
   if(result.status==='alive')return alive('HLS nhiều mức chất lượng • '+result.reason,{variant:resolved});
   reasons.push(result.reason);
  }
  return uncertain('Không xác minh được các mức chất lượng HLS: '+reasons.join('; ').slice(0,150));
 }
 const segmentLines=nonEmptySegments(lines);
 if(!segmentLines.length)return uncertain('HLS chưa công bố segment (có thể đang chờ lên sóng)');
 const encrypted=/#EXT-X-KEY:\s*METHOD=(?!NONE)/i.test(body);
 const protectedContent=/KEYFORMAT="(?!identity)/i.test(body);
 const mapLine=lines.find(l=>l.startsWith('#EXT-X-MAP:'));
 const initUrl=mapLine&&parseAttribute(mapLine,'URI')?segmentURL(parseAttribute(mapLine,'URI'),manifest.url):null;
 let initPositive=false;
 if(initUrl){try{const r=await getPart(initUrl,{...options,maxBytes:64000,timeout:8000});initPositive=isVideoData(r.data,r.type);}catch{ /* Manifest-only evidence is not enough. */ }}
 let errors=[],segmentsOK=0,recognised=0;
 const entries=segmentLines.slice(-4).reverse();
 for(const segment of entries){
  const resolved=segmentURL(segment,manifest.url);if(!resolved)continue;
  try{
   let r;
   try{r=await getPart(resolved,{...options,maxBytes:100000,timeout:9000,headers:{Range:'bytes=0-99999'}});}
   catch(err){if(![400,403,404,405,410,416,500,502].includes(err.statusCode))throw err;r=await getPart(resolved,{...options,maxBytes:100000,timeout:9000});}
   if(r.data.length<32)continue;
   if(/<html|<!doctype/i.test(r.data.subarray(0,128).toString('utf8')))continue;
   segmentsOK++;
   if(isVideoData(r.data,r.type)||initPositive)recognised++;
   if(recognised>=1&&!encrypted&&!protectedContent)return alive('HLS manifest + segment mới có dữ liệu video hợp lệ');
   if(segmentsOK>=2)break;
  }catch(e){errors.push(e.message);}
 }
 if(encrypted||protectedContent){return uncertain(`HLS dùng ${protectedContent?'DRM':'mã hóa AES'}; đã kiểm tra ${segmentsOK} segment nhưng không thể xác nhận giải mã`);}
 if(segmentsOK>0)return uncertain(`${segmentsOK} segment trả dữ liệu nhưng chưa xác nhận được định dạng video`);
 return uncertain('HLS manifest hợp lệ nhưng segment không tải được (có thể đã hết hạn): '+errors.slice(0,2).join(', '));
}
async function inspectLink(url,options={}){
 if(!/^https?:\/\//i.test(url))return uncertain('RTSP/UDP/RTMP chưa hỗ trợ bộ kiểm tra HTTP');
 try{
  let p;
  try{p=await getPart(url,{...options,maxBytes:140000,timeout:9500,headers:{Range:'bytes=0-139999'}});}
  catch(e){if(![400,403,404,405,410,416,500,502].includes(e.statusCode))throw e;
   // Some legitimate servers reject Range; retry ordinary GET before classifying.
   p=await getPart(url,{...options,maxBytes:140000,timeout:9500});
  }
  const s=p.data.toString('utf8');
  if(isHls(s,p.url,p.type))return await inspectHls(p.url,0,options);
  if(isVideoData(p.data,p.type))return alive('Đã tải trực tiếp dữ liệu video');
  if(/^#EXTM3U/.test(s))return uncertain('Playlist trả về không phải manifest phát video HLS');
  return uncertain('Server phản hồi HTTP thành công nhưng dữ liệu chưa chứng minh được là video');
 }catch(e){
  if(e.statusCode===404||e.statusCode===410)return {status:'dead',reason:`HTTP ${e.statusCode} tại URL luồng chính; cần kiểm tra lại`,httpStatus:e.statusCode,confirmedDead:false};
  return uncertain('Không xác minh được: '+(e.name==='AbortError'?'hết thời gian':e.message),{httpStatus:e.statusCode});
 }
}
async function checkRepeated(url,opts={}){
 const inspect=opts.inspect||inspectLink;
 const attempts=Math.max(2,Math.min(opts.attempts||2,3));const statuses=[];
 for(let i=0;i<attempts;i++){
  if(i)await (opts.sleep||sleep)(opts.delayMs??500);
  const r=await inspect(url,{...opts,ua:i===0?PLAYER_UA:BROWSER_UA});statuses.push(r);
  if(r.status==='alive'&&r.positiveEvidence&&i===0&&opts.fastPositive){return {...r,rounds:1};}
 }
 const good=statuses.find(r=>r.status==='alive');
 if(good)return alive(`${statuses.filter(s=>s.status==='alive').length}/${attempts} vòng xác nhận có video; `+good.reason,{rounds:attempts});
 const codes=statuses.map(s=>s.httpStatus);
 if(codes.every(s=>s===404)||codes.every(s=>s===410))return {status:'dead',reason:`HTTP ${codes[0]} lặp lại ${attempts} lần ở URL luồng chính`,rounds:attempts,confirmedDead:true,httpStatus:codes[0]};
 return uncertain(`Không đủ bằng chứng Die sau ${attempts} vòng: `+statuses.map(s=>s.reason).filter(Boolean).join(' | ').slice(0,200),{rounds:attempts});
}
module.exports={getPart,isVideoData,isHls,inspectHls,inspectLink,checkRepeated};
