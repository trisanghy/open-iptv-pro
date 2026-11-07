'use strict';
// Public XMLTV client. Remote guides are not bundled or re-licensed.
const {gunzipSync}=require('node:zlib');
const MAX_COMPRESSED=12*1024*1024;
const MAX_XML=35*1024*1024;
function validateGuideURL(raw){
 const u=new URL(raw);if(u.protocol!=='https:' && !(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))throw Error('EPG từ xa phải dùng HTTPS (chỉ cho phép HTTP localhost)');
 if(u.username||u.password)throw Error('Không đưa tài khoản/mật khẩu vào URL EPG');
 return u.href;
}
async function fetchGuide(raw,fetcher=fetch){
 const url=validateGuideURL(raw), controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
 try{
   const response=await fetcher(url,{signal:controller.signal,headers:{'User-Agent':'Open-IPTV-Pro/4.1 (XMLTV client)','Accept':'application/xml,text/xml,application/gzip,*/*'}});
   if(!response.ok)throw Error('EPG HTTP '+response.status);
   let length=0;const chunks=[];
   for await(const chunk of response.body){length+=chunk.length;if(length>MAX_COMPRESSED)throw Error('EPG tải về quá lớn');chunks.push(Buffer.from(chunk));}
   let buf=Buffer.concat(chunks);
   if(buf[0]===0x1f&&buf[1]===0x8b)buf=gunzipSync(buf,{maxOutputLength:MAX_XML});
   if(buf.length>MAX_XML)throw Error('XMLTV giải nén vượt 35 MB');
   const xml=buf.toString('utf8').replace(/^\uFEFF/,'');
   if(!/<tv(?:\s|>)/i.test(xml) || (!/<channel\b/i.test(xml)&&!/<programme\b/i.test(xml)))throw Error('Nguồn không phải XMLTV hợp lệ');
   return {xml,bytes:buf.length,downloadedAt:new Date().toISOString()};
 }finally{clearTimeout(timer);}
}
module.exports={MAX_COMPRESSED,MAX_XML,validateGuideURL,fetchGuide};
