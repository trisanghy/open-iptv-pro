'use strict';
// Official GitHub Release catalog for manually selecting stable, beta or older versions.
// Only platform-compatible releases with an SHA-256 verification path are actionable.
const REPO='trisanghy/open-iptv-pro';
const API='https://api.github.com/repos/'+REPO+'/releases?per_page=100';
const URL_PREFIX='https://github.com/'+REPO+'/releases/download/';
function versionOf(tag){
 const m=/^(?:electron-)?v(\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(String(tag||''));
 return m?m[1]:null;
}
function officialAsset(asset,tag){
 try{
  const url=new URL(asset?.browser_download_url||'');
  if(url.protocol!=='https:'||url.hostname!=='github.com')return false;
  return url.href.startsWith(URL_PREFIX+encodeURIComponent(tag)+'/')&&
   typeof asset.name==='string'&&asset.name.length<=180&&!asset.name.includes('..');
 }catch{return false;}
}
function selectInstaller(assets,platform,arch){
 const clean=assets.filter(a=>/^(?:Open-IPTV-Pro-)[\w.()-]+/i.test(a.name));
 const token=arch==='arm64'?'arm64':arch==='x64'?'x64':null;
 if(!token)return null;
 if(platform==='darwin')return clean.find(a=>a.name.endsWith('-mac-'+token+'.dmg'))||null;
 if(platform==='win32')return clean.find(a=>a.name.startsWith('Open-IPTV-Pro-Setup-')&&a.name.endsWith('-'+token+'.exe'))||null;
 return null;
}
function catalogFromReleases(releases,{platform,arch}={}){
 if(!Array.isArray(releases))throw Error('Danh sách phiên bản GitHub không hợp lệ');
 const output=[],seen=new Set();
 for(const r of releases.slice(0,100)){
  if(!r||r.draft)continue;
  const version=versionOf(r.tag_name);
  if(!version||seen.has(r.tag_name))continue;
  const tag=r.tag_name;
  const assets=(Array.isArray(r.assets)?r.assets:[]).filter(a=>officialAsset(a,tag))
   .map(a=>({name:a.name,url:a.browser_download_url,size:Number(a.size)||0,digest:typeof a.digest==='string'?a.digest:''}));
  const installer=selectInstaller(assets,platform,arch);
  if(!installer)continue;
  const integrity=/^sha256:[a-f0-9]{64}$/i.test(installer.digest)||
   assets.some(a=>a.name==='SHA256SUMS.txt');
  if(!integrity)continue;
  seen.add(tag);
  output.push({
   tag,version:'v'+version,prerelease:!!r.prerelease,
   publishedAt:typeof r.published_at==='string'?r.published_at:'',
   assetName:installer.name,size:installer.size,
   assets,releaseUrl:'https://github.com/'+REPO+'/releases/tag/'+encodeURIComponent(tag)
  });
 }
 return output.sort((a,b)=>b.version.localeCompare(a.version,undefined,{numeric:true}));
}
async function fetchReleaseCatalog(fetcher=fetch,{platform=process.platform,arch=process.arch}={}){
 const response=await fetcher(API,{
  headers:{Accept:'application/vnd.github+json','User-Agent':'Open-IPTV-Pro/4.23.67'},
  signal:AbortSignal.timeout(15000)
 });
 if(!response?.ok)throw Error('Không lấy được danh sách phiên bản từ GitHub (HTTP '+String(response?.status||'?')+')');
 const releases=await response.json();
 return catalogFromReleases(releases,{platform,arch});
}
module.exports={REPO,API,versionOf,officialAsset,catalogFromReleases,fetchReleaseCatalog};
