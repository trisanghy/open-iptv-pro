'use strict';
/* Pure helpers tested in Node; no credentials, browser or network requirements. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVCloudCore=api;
})(typeof window!=='undefined'?window:null,function(){
 const SKIP=new Set(['snapshots','epgCache','epgRaw','epgPrograms','cloudSession','cloudToken']);
 const MAX_BYTES=1950000;
 function snapshot(store){
  const src=store&&typeof store==='object'&&!Array.isArray(store)?store:{};
  const out={};
  for(const [key,value] of Object.entries(src)){
   if(SKIP.has(key)||key.startsWith('_')||value===undefined)continue;
   if(typeof value==='function')continue;
   out[key]=value;
  }
  return JSON.parse(JSON.stringify(out));
 }
 function isMeaningful(s){
  return Boolean((s?.sources?.length||0)+(s?.channels?.length||0)+(s?.favorites?.length||0)+(s?.folders?.length||0));
 }
 const same=(a,b)=>JSON.stringify(snapshot(a))===JSON.stringify(snapshot(b));
 function validEmail(value){const v=String(value||'').trim();return v.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
 function verificationLink(value,projectUrl){
  let url,project;
  try{url=new URL(String(value||'').trim());project=new URL(projectUrl);}
  catch{throw Error('Dán đầy đủ liên kết xác thực mới từ email.');}
  if(url.protocol!=='https:'||url.origin!==project.origin||url.pathname!=='/auth/v1/verify')
   throw Error('Chỉ chấp nhận liên kết xác thực của dự án Open IPTV Pro.');
  const token_hash=url.searchParams.get('token_hash')||url.searchParams.get('token');
  const type=String(url.searchParams.get('type')||'email').toLowerCase();
  if(!token_hash||token_hash.length>2048||!['email','signup','magiclink','invite'].includes(type))
   throw Error('Liên kết thiếu mã xác thực hợp lệ.');
  return {token_hash,type};
 }
 // PKCE completes at a browser redirect containing ?code=...; the previous app
 // mistakenly accepted only /auth/v1/verify links, not localhost callback URLs.
 function recoveryCode(value,siteUrl){
  let target,site;
  try{target=new URL(String(value||'').trim());site=new URL(siteUrl);}
  catch{return null;}
  const isLocal=target.protocol==='http:' && ['localhost','127.0.0.1'].includes(target.hostname) && target.port==='3000' && target.pathname==='/';
  const isSite=target.protocol==='https:' && target.origin===site.origin && target.pathname===site.pathname;
  if(!isLocal&&!isSite)return null;
  const code=target.searchParams.get('code');
  if(!code||code.length<16||code.length>512||!/^[A-Za-z0-9_-]+$/.test(code))return null;
  return {code,flowId:target.searchParams.get('sb_flow_id')||null};
 }
 function isEmailRateLimited(error){
  const code=String(error?.code||error?.error_code||'').toLowerCase();
  const status=Number(error?.status||error?.statusCode||0);
  const message=String(error?.message||error||'').toLowerCase();
  return status===429||code==='over_email_send_rate_limit'||/email rate limit exceeded|over_email_send_rate_limit|too many requests/.test(message);
 }
 function authErrorMessage(error){
  const msg=String(error?.message||error||'').trim(),m=msg.toLowerCase();
  if(isEmailRateLimited(error))
   return 'Supabase đã nhận quá nhiều yêu cầu gửi email (HTTP 429). Hãy chờ hết hạn mức hoặc cấu hình SMTP riêng.';
  if(/expired|invalid.*(?:token|otp)|token.*invalid|otp.*invalid/.test(m))
   return 'Liên kết hoặc mã đã hết hạn, đã sử dụng hoặc sai. Hãy yêu cầu email mới.';
  if(/rate.limit|too many requests|email rate|429/.test(m))
   return 'Bạn đã gửi quá nhiều yêu cầu. Hãy chờ một lát rồi thử lại.';
  if(/redirect.*not.allowed|redirect.*not.*whitelist|unsupported redirect/.test(m))
   return 'Website chưa được cho phép làm URL chuyển hướng trong Supabase Authentication → URL Configuration.';
  if(/code verifier|code_verifier|auth code.*invalid|invalid.*code/.test(m))return 'Không khôi phục được mã đăng nhập. Hãy mở cùng trình duyệt đã yêu cầu email hoặc gửi lại liên kết mới.';
  if(error?.code==='email_address_not_authorized'||/email.address.not.authorized/i.test(msg))
   return 'Email chưa được Supabase cho phép nhận thư. Dịch vụ gửi mặc định chỉ dành cho email của thành viên dự án; cần cấu hình SMTP riêng.';
  if(/email.*not.confirmed/.test(m))return 'Email chưa xác nhận. Hãy mở email mới nhất.';
  if(/failed to fetch|network|fetch failed|load failed/.test(m))
   return 'Không kết nối được Supabase. Kiểm tra mạng và thử lại.';
  return msg.slice(0,170)||'Không thực hiện được. Hãy thử lại.';
 }

 function validate(s){
  const json=JSON.stringify(snapshot(s));
  const len=new TextEncoder().encode(json).length;
  if(len>MAX_BYTES)throw Error('Dữ liệu IPTV quá lớn để đồng bộ (giới hạn 1,95 MB). Hãy bỏ ảnh chụp hoặc giảm số kênh.');
  return {payload:JSON.parse(json),bytes:len};
 }
 function decision({local,remote,knownRevision,knownPayload}){
  if(!remote)return isMeaningful(local)?'ask-first-upload':'empty';
  if(same(local,remote.payload))return 'synced';
  if(!isMeaningful(local))return 'download';
  if(Number.isInteger(knownRevision)&&knownRevision===remote.revision&&knownPayload&&same(knownPayload,remote.payload))
   return 'upload';
  if(knownPayload&&same(knownPayload,local))return 'download';
  return 'conflict';
 }
 return Object.freeze({snapshot,isMeaningful,same,validate,decision,validEmail,verificationLink,recoveryCode,isEmailRateLimited,authErrorMessage,MAX_BYTES});
});
