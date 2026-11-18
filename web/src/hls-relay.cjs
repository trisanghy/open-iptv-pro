'use strict';
/** Upstream HLS transport policy. Does not bypass authentication, DRM or geo restrictions. */
function browserUserAgent(platform=process.platform,chrome=process.versions.chrome||'120.0.0.0'){
 const platformToken=platform==='win32'?'Windows NT 10.0; Win64; x64':platform==='darwin'?'Macintosh; Intel Mac OS X 10_15_7':'X11; Linux x86_64';
 return `Mozilla/5.0 (${platformToken}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chrome} Safari/537.36`;
}
function isManifestURL(url){return /\.m3u8?(?:[?#]|$)/i.test(new URL(url).pathname);}
function headersForStream(url,{range,userAgent}={}){
 const headers={'User-Agent':userAgent||browserUserAgent(),'Accept':'*/*'};
 // A partial manifest cannot be parsed or rewritten. Ranges are for segment/media requests.
 if(range&&!isManifestURL(url)&&!/\.mpd(?:[?#]|$)/i.test(url))headers.Range=range;
 return headers;
}
async function fetchStream(fetcher,url,{range,signal,userAgent}={}){
 const headers=headersForStream(url,{range,userAgent});
 let response=await fetcher(url,{signal,redirect:'follow',headers});
 if(headers.Range&&[400,403,405,416].includes(response.status)){
  try{await response.body?.cancel();}catch{}
  response=await fetcher(url,{signal,redirect:'follow',headers:headersForStream(url,{userAgent})});
 }
 return response;
}
function validHlsManifest(text){return /^\s*#EXTM3U(?:\s|$)/i.test(String(text||''))&&/#EXT-X-[A-Z-]+/i.test(text);}
function httpErrorText(code){
 if(code===401||code===403)return `HTTP ${code}: nguồn từ chối truy cập (có thể cần quyền, bị chặn địa lý hoặc hết hiệu lực)`;
 if(code===404||code===410)return `HTTP ${code}: nguồn không còn tại địa chỉ này`;
 if(code===429)return 'HTTP 429: máy chủ giới hạn yêu cầu';
 if(code>=500)return `HTTP ${code}: lỗi phía máy chủ nguồn`;
 return `HTTP ${code}: không tải được nguồn`;
}
module.exports={browserUserAgent,isManifestURL,headersForStream,fetchStream,validHlsManifest,httpErrorText};
