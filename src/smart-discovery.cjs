'use strict';
// Fixed allow-listed catalogs only. Never execute any playlist text or remote scripts.
// User-supplied stream URL checks continue to use the guarded fetcher below.
const CATALOG='https://iptv-org.github.io';
const COUNTRY_API=`${CATALOG}/api/countries.json`;
const MAX_COUNTRIES=450,MAX_PLAYLIST_BYTES=3_000_000;
const GLOBAL_MAX_BYTES=12_000_000;
const FREE_TV='https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8';
const CATALOG_KINDS=new Set(['country','category','language','global','freetv']);
function countryCode(input){
 const code=String(input||'').trim().toUpperCase();
 if(!/^[A-Z]{2}$/.test(code))throw Error('Mã quốc gia phải gồm 2 chữ cái ISO');
 return code;
}
function playlistURL(code){return `${CATALOG}/iptv/countries/${countryCode(code).toLowerCase()}.m3u`;}
function safeStreamURL(raw){
 const u=new URL(raw);
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Chỉ cho phép URL stream HTTP/HTTPS công khai');
 const host=u.hostname.replace(/^\[|\]$/g,'').replace(/\.$/,'').toLowerCase();
 if(!host||!host.includes('.')||host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal'))throw Error('Không kiểm tra máy chủ nội bộ');
 // This discovery feature accepts external IPv4 / domains. IPv6 literals can be
 // used through the regular, user-controlled IPTV source import instead.
 if(host.includes(':'))throw Error('IPv6 dạng IP trực tiếp chưa hỗ trợ trong Discovery');
 if(/^\d+\.\d+\.\d+\.\d+$/.test(host)){
  const n=host.split('.').map(Number);const [a,v]=n;
  if(n.some(x=>x<0||x>255)||a===0||a===10||a===127||a>=224||a===169&&v===254||a===172&&v>=16&&v<=31||a===192&&v===168||a===100&&v>=64&&v<=127||a===198&&(v===18||v===19))throw Error('Không kiểm tra địa chỉ IP riêng/nội bộ');
 }
 return u;
}
async function safeStreamFetch(raw,options={},fetcher=fetch){
 let url=safeStreamURL(raw).href;
 for(let i=0;i<4;i++){
  const response=await fetcher(url,{...options,redirect:'manual'});
  if([301,302,303,307,308].includes(response.status)){
   const location=response.headers?.get?.('location');if(!location)throw Error('Redirect thiếu Location');
   if(i===3)throw Error('Quá nhiều bước chuyển hướng stream');
   url=safeStreamURL(new URL(location,url).href).href;
   await response.body?.cancel?.().catch(()=>{});
   continue;
  }
  return response;
 }
 throw Error('Redirect không hợp lệ');
}
async function readLimited(url,{fetcher=fetch,maxBytes=MAX_PLAYLIST_BYTES,timeoutMs=16000}={}){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const res=await fetcher(url,{signal:controller.signal,redirect:'manual',headers:{'User-Agent':'Open-IPTV-Pro-SmartDiscovery/4.23','Accept':'application/json, audio/x-mpegurl, text/plain'}});
  if(!res||res.status>=300&&res.status<400)throw Error('Nguồn chuyển hướng; không theo chuyển hướng ngoài danh mục tin cậy');
  if(!res.ok)throw Error(`Nguồn dữ liệu trả về HTTP ${res.status}`);
  // Never trust a substituted final destination, including test fetch adapters.
  if(res.url&&res.url!==url)throw Error('Nguồn trả về ngoài danh mục công khai đã chọn');
  const declared=Number(res.headers?.get?.('content-length')||0);
  if(declared>maxBytes)throw Error('Danh mục vượt giới hạn kích thước');
  let bytes=0,parts=[];
  if(res.body&&Symbol.asyncIterator in res.body){
   for await(const chunk of res.body){bytes+=chunk.length;if(bytes>maxBytes){controller.abort();throw Error('Danh mục quá lớn');}parts.push(Buffer.from(chunk));}
   return Buffer.concat(parts).toString('utf8').replace(/^\uFEFF/,'');
  }
  const text=await res.text();if(Buffer.byteLength(text)>maxBytes)throw Error('Danh mục quá lớn');return text.replace(/^\uFEFF/,'');
 }finally{clearTimeout(timer);}
}
function parseCountryList(body){
 const raw=JSON.parse(body);if(!Array.isArray(raw)||raw.length>1000)throw Error('Danh mục quốc gia không hợp lệ');
 const seen=new Set();return raw.filter(x=>x&&typeof x.name==='string'&&/^[A-Z]{2}$/.test(x.code||'')&&!seen.has(x.code)&&seen.add(x.code))
  .slice(0,MAX_COUNTRIES).map(x=>({code:x.code,name:x.name.slice(0,100),flag:String(x.flag||'').slice(0,8)}));
}
function inspectPlaylist(body){
 if(typeof body!=='string'||!/^\s*#EXTM3U(?:\s|$)/i.test(body.slice(0,100)))throw Error('Danh sách trả về không phải M3U hợp lệ');
 const lines=body.split(/\r?\n/),urls=new Set();let count=0,declared=0;
 for(const raw of lines){const line=raw.trim();if(/^#EXTINF:/i.test(line))declared++;
  if(!line||line.startsWith('#'))continue;
  try{const u=new URL(line);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||urls.has(u.href))continue;urls.add(u.href);count++;}catch{}
 }
 if(count===0||declared===0)throw Error('Danh sách không có luồng HTTP/HTTPS hợp lệ');
 return {channels:count,declared,duplicateUrls:Math.max(0,declared-count)};
}
async function listCountries(options={}){
 const data=parseCountryList(await readLimited(COUNTRY_API,{...options,maxBytes:250_000}));
 if(!data.some(c=>c.code==='VN'))throw Error('Danh mục chưa có mã quốc gia VN');
 return data;
}
async function loadCountry(code,options={}){
 const country=countryCode(code),url=playlistURL(country);
 const body=await readLimited(url,options),stats=inspectPlaylist(body);
 return {country,url,content:body,...stats,provider:'iptv-org (công khai)',fetchedAt:new Date().toISOString()};
}
function catalogSpec(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Yêu cầu danh mục không hợp lệ');
 const kind=String(input.kind||'').toLowerCase();
 if(!CATALOG_KINDS.has(kind))throw Error('Danh mục không được hỗ trợ');
 if(kind==='country'){const code=countryCode(input.code);return {kind,code,url:playlistURL(code),provider:'iptv-org · quốc gia'};}
 if(kind==='category'){
  const code=String(input.code||'').trim().toLowerCase();
  if(!/^[a-z][a-z-]{1,31}$/.test(code))throw Error('Danh mục kênh không hợp lệ');
  return {kind,code,url:`${CATALOG}/iptv/categories/${code}.m3u`,provider:'iptv-org · danh mục'};
 }
 if(kind==='language'){
  const code=String(input.code||'').trim().toLowerCase();
  if(!/^[a-z]{3}$/.test(code))throw Error('Mã ngôn ngữ không hợp lệ');
  return {kind,code,url:`${CATALOG}/iptv/languages/${code}.m3u`,provider:'iptv-org · ngôn ngữ'};
 }
 if(kind==='global')return {kind,code:'ALL',url:`${CATALOG}/iptv/index.m3u`,provider:'iptv-org · toàn cầu'};
 return {kind,code:'ALL',url:FREE_TV,provider:'Free-TV/IPTV · nguồn chọn lọc'};
}
function parseCatalogOptions(body,kind){
 const raw=JSON.parse(body);if(!Array.isArray(raw)||raw.length>2000)throw Error('Danh mục tùy chọn không hợp lệ');
 const seen=new Set();const options=[];
 for(const item of raw){
  if(!item||typeof item.name!=='string')continue;
  const code=String(kind==='language'?item.code:item.id||'').trim().toLowerCase();
  if(kind==='language'?!/^[a-z]{3}$/.test(code):!/^[a-z][a-z-]{1,31}$/.test(code))continue;
  if(seen.has(code))continue;
  seen.add(code);options.push({code,name:item.name.slice(0,100)});
 }
 return options.slice(0,500);
}
async function listCatalogOptions(kind,options={}){
 if(kind==='country')return listCountries(options);
 if(!['category','language'].includes(kind))return [];
 const url=`${CATALOG}/api/${kind==='category'?'categories':'languages'}.json`;
 return parseCatalogOptions(await readLimited(url,{...options,maxBytes:280_000}),kind);
}
async function loadCatalog(input,options={}){
 const spec=catalogSpec(input);
 const maxBytes=spec.kind==='global'||spec.kind==='freetv'?GLOBAL_MAX_BYTES:MAX_PLAYLIST_BYTES;
 const body=await readLimited(spec.url,{...options,maxBytes,timeoutMs:25000});
 const stats=inspectPlaylist(body);
 return {...spec,content:body,...stats,fetchedAt:new Date().toISOString()};
}
module.exports={countryCode,playlistURL,safeStreamURL,safeStreamFetch,parseCountryList,inspectPlaylist,readLimited,listCountries,loadCountry,catalogSpec,parseCatalogOptions,listCatalogOptions,loadCatalog,FREE_TV};
