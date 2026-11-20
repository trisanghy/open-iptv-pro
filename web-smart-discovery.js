'use strict';
/* Browser-only Smart Discovery. Catalog requests are allow-listed and never
   proxied. Video checks are best-effort: CORS/geoblocks are NOT evidence of death.
   All calls are initiated by smart-discovery-ui.js after explicit legal consent. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVWebSmartDiscovery=api;
})(typeof window==='undefined'?null:window,function(root){
 const ORIGIN='https://iptv-org.github.io';
 const FREE_TV='https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8';
 const CATALOGS={country:'countries',category:'categories',language:'languages'};
 const MAX_BYTES=3000000,GLOBAL_MAX_BYTES=12000000;
 function spec(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Chọn bộ sưu tập hợp lệ');
  const kind=String(input.kind||'').toLowerCase();
  const code=String(input.code||'').trim();
  if(kind==='country'){
   if(!/^[a-z]{2}$/i.test(code))throw Error('Mã quốc gia không hợp lệ');
   return {kind,code:code.toUpperCase(),url:ORIGIN+'/iptv/countries/'+code.toLowerCase()+'.m3u',provider:'iptv-org · quốc gia'};
  }
  if(kind==='category'){
   if(!/^[a-z][a-z-]{1,31}$/.test(code))throw Error('Mã thể loại không hợp lệ');
   return {kind,code,url:ORIGIN+'/iptv/categories/'+code+'.m3u',provider:'iptv-org · thể loại'};
  }
  if(kind==='language'){
   if(!/^[a-z]{3}$/.test(code))throw Error('Mã ngôn ngữ không hợp lệ');
   return {kind,code,url:ORIGIN+'/iptv/languages/'+code+'.m3u',provider:'iptv-org · ngôn ngữ'};
  }
  if(kind==='global')return {kind,code:'ALL',url:ORIGIN+'/iptv/index.m3u',provider:'iptv-org · toàn cầu'};
  if(kind==='freetv')return {kind,code:'ALL',url:FREE_TV,provider:'Free-TV/IPTV · chọn lọc'};
  throw Error('Bộ sưu tập không được hỗ trợ');
 }
 function safeStreamURL(raw){
  let url;
  try{url=new URL(String(raw||''));}catch{throw Error('URL luồng không hợp lệ');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('Luồng phải dùng HTTP(S) và không chứa tài khoản');
  const host=url.hostname.toLowerCase().replace(/\.$/,'').replace(/^\[|\]$/g,'');
  if(!host||host.includes(':')||!host.includes('.')||/(^|\.)((localhost|local|internal|test|invalid|example))$/.test(host))
   throw Error('Không kiểm tra địa chỉ nội bộ/không công khai');
  if(/^\d+\.\d+\.\d+\.\d+$/.test(host)){
   const parts=host.split('.').map(Number),a=parts[0],b=parts[1],c=parts[2];
   if(parts.some(x=>x<0||x>255)||a===0||a===10||a===127||a>=224||
      (a===169&&b===254)||(a===172&&b>=16&&b<=31)||
      (a===192&&b===168)||(a===100&&b>=64&&b<=127)||
      (a===198&&(b===18||b===19))||
      (a===192&&b===0&&c===0)||(a===192&&b===0&&c===2)||
      (a===198&&b===51&&c===100)||(a===203&&b===0&&c===113))
    throw Error('Không kiểm tra IP riêng, dành riêng hoặc nội bộ');
  }
  return url.href;
 }
 function isSafeStreamURL(raw){try{safeStreamURL(raw);return true;}catch{return false;}}
 async function fetchCatalog(url,maxBytes,options={}){
  const known=(url.startsWith(ORIGIN+'/api/')||url.startsWith(ORIGIN+'/iptv/')||url===FREE_TV);
  if(!known)throw Error('Địa chỉ danh mục ngoài danh sách cho phép');
  const fetcher=options.fetchImpl||root?.fetch||((...args)=>fetch(...args));
  const controller=new AbortController();
  const onAbort=()=>controller.abort();
  options.signal?.addEventListener('abort',onAbort,{once:true});
  if(options.signal?.aborted)controller.abort();
  const timer=setTimeout(()=>controller.abort(),Math.min(45000,Math.max(1000,options.timeoutMs||25000)));
  try{
   const response=await fetcher(url,{method:'GET',mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',cache:'no-store',signal:controller.signal});
   if(!response?.ok)throw Error('Danh mục trả HTTP '+(response?.status||'không xác định'));
   if(response.url&&response.url!==url)throw Error('Danh mục chuyển hướng ngoài URL đã chọn');
   if(Number(response.headers?.get?.('content-length')||0)>maxBytes)throw Error('Danh mục vượt giới hạn '+maxBytes+' byte');
   let content='';
   if(response.body?.getReader){
    const reader=response.body.getReader(),decoder=new TextDecoder();let size=0;
    try{
     while(true){
      const part=await reader.read();if(part.done)break;
      size+=part.value?.byteLength||0;
      if(size>maxBytes){controller.abort();throw Error('Danh mục quá lớn');}
      content+=decoder.decode(part.value,{stream:true});
     }
     content+=decoder.decode();
    }finally{try{await reader.cancel();}catch{}try{reader.releaseLock();}catch{}}
   }else{
    content=await response.text();
    if(new TextEncoder().encode(content).length>maxBytes)throw Error('Danh mục quá lớn');
   }
   return content.replace(/^\uFEFF/,'');
  }catch(e){
   if(options.signal?.aborted)throw Object.assign(Error('Đã hủy'),{name:'AbortError'});
   if(e?.name==='AbortError')throw Error('Tải danh mục quá thời gian');
   if(e instanceof TypeError||/Failed to fetch|Load failed|network/i.test(String(e?.message||'')))
    throw Error('Trình duyệt không tải được nguồn (CORS hoặc mạng). Không dùng proxy không rõ nguồn gốc.');
   throw e;
  }finally{clearTimeout(timer);options.signal?.removeEventListener('abort',onAbort);}
 }
 async function catalogOptions(kind,options={}){
  if(!Object.prototype.hasOwnProperty.call(CATALOGS,kind))return [];
  const url=ORIGIN+'/api/'+CATALOGS[kind]+'.json';
  const raw=JSON.parse(await fetchCatalog(url,300000,options));
  if(!Array.isArray(raw)||raw.length>2500)throw Error('Danh mục bộ lọc không hợp lệ');
  const used=new Set(),output=[];
  for(const item of raw){
   if(!item||typeof item.name!=='string')continue;
   const code=String(kind==='country'?item.code:kind==='language'?item.code:item.id||'').trim();
   const valid=kind==='country'?/^[A-Z]{2}$/.test(code):
    kind==='language'?/^[a-z]{3}$/.test(code):/^[a-z][a-z-]{1,31}$/.test(code);
   if(!valid||used.has(code))continue;
   used.add(code);output.push({code,name:item.name.slice(0,100),flag:String(item.flag||'').slice(0,8)});
   if(output.length>=500)break;
  }
  return output;
 }
 async function load(input,options={}){
  const item=spec(input);
  const max=item.kind==='global'||item.kind==='freetv'?GLOBAL_MAX_BYTES:MAX_BYTES;
  const content=await fetchCatalog(item.url,max,options);
  if(!/^\s*#EXTM3U(?:\s|$)/i.test(content.slice(0,100)))throw Error('Danh mục không phải playlist M3U');
  if(!/^#EXTINF:/im.test(content))throw Error('Danh mục không có thông tin kênh');
  return {...item,content,fetchedAt:new Date().toISOString()};
 }
 async function check(url,options={}){
  try{safeStreamURL(url);}catch(e){return {status:'uncertain',reason:e.message,positiveEvidence:false,blocked:true};}
  const checker=options.checkChannelImpl||root?.OpenIPTVWebChannelCheck?.checkChannel;
  if(typeof checker!=='function')return {status:'uncertain',reason:'Thiếu module kiểm tra Web',positiveEvidence:false};
  const getVideo=options.makeVideo||(()=>root?.document?.createElement?.('video'));
  const fetcher=options.fetchImpl||root?.fetch||((...args)=>fetch(...args));
  const guardedFetch=(value,params)=>{
   safeStreamURL(value);
   return fetcher(value,{...params,credentials:'omit',referrerPolicy:'no-referrer',redirect:'error'});
  };
  const result=await checker({url},{links:[url],signal:options.signal,timeoutMs:6500,makeVideo:getVideo,fetch:guardedFetch});
  return {...result,positiveEvidence:result.status==='alive'&&result.confirmedAlive===true,
   confirmedDead:result.status==='dead'&&result.confirmedDead===true};
 }
 return Object.freeze({spec,safeStreamURL,isSafeStreamURL,catalogOptions,load,check});
});
