'use strict';
const OFFICIAL_REPO='trisanghy/open-iptv-pro';
function compareVersions(a,b){
 const parts=v=>{const s=String(v||'').replace(/^v/i,'').split('-')[0].split('.');if(!/^\d+(\.\d+){0,3}$/.test(s.join('.')))throw Error('Phiên bản không hợp lệ');return s.map(Number);};
 const A=parts(a),B=parts(b);for(let i=0;i<4;i++){if((A[i]||0)>(B[i]||0))return 1;if((A[i]||0)<(B[i]||0))return -1;}return 0;
}
function validateRepo(value){const v=String(value||'').trim();if(!/^[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_.-]{1,100}$/.test(v)||v.includes('..'))throw Error('Repository GitHub không hợp lệ');return v;}
// Older release naming conventions are supported: v4.22.0, release-v4.22, desktop_4.22.0, etc.
function versionFromText(text){
 const match=String(text||'').match(/(?:^|[^0-9])v?(\d{1,3}\.\d{1,3}(?:\.\d{1,3}){0,2})(?![0-9])/i);
 return match?match[1]:null;
}
function compatibleAsset(assets,platform,arch){
 const candidates=(assets||[]).filter(a=>a&&typeof a.name==='string'&&typeof a.url==='string');
 if(platform==='darwin'){
  const mac=candidates.filter(a=>/\.dmg$/i.test(a.name));
  return mac.find(a=>new RegExp(`(?:-|_|\\b)${arch}(?:-|_|\\.)`,'i').test(a.name))
   ||mac.find(a=>/universal/i.test(a.name))
   ||mac.find(a=>!/(?:arm64|aarch64|x64|x86_64)/i.test(a.name))||null;
 }
 if(platform==='win32'){
  const win=candidates.filter(a=>/\.exe$/i.test(a.name)&&/(?:setup|install)/i.test(a.name));
  return win.find(a=>new RegExp(`(?:-|_|\\b)${arch}(?:-|_|\\.)`,'i').test(a.name))
   ||win.find(a=>!/(?:arm64|aarch64|x64|x86_64)/i.test(a.name))||null;
 }
 return null;
}
function toAssets(release,repo){
 return (release.assets||[]).filter(a=>typeof a.name==='string'&&typeof a.browser_download_url==='string')
  .filter(a=>a.browser_download_url.startsWith(`https://github.com/${repo}/releases/download/`))
  .map(a=>({name:a.name,url:a.browser_download_url,size:a.size||0,digest:a.digest||''}));
}
function getCandidate(release,repo,platform,arch,version){
 const assets=toAssets(release,repo);const binary=compatibleAsset(assets,platform,arch);
 const latest=versionFromText(binary?.name)||versionFromText(release.tag_name)||versionFromText(release.name);
 const newer=!!latest&&compareVersions(latest,version)>0;
 return {current:version,latest:latest?`v${latest}`:null,newer,noRelease:false,
  sourceOnly:!binary,assets,url:release.html_url||`https://github.com/${repo}/releases`,publishedAt:release.published_at||''};
}
async function checkUpdate(repo,version,fetcher=fetch,platform=process.platform,arch=process.arch){
 const valid=validateRepo(repo),base=`https://api.github.com/repos/${valid}`;
 const options={headers:{Accept:'application/vnd.github+json','User-Agent':'Open-IPTV-Pro/4.22.2','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(15000)};
 const get=async url=>{
  try{return await fetcher(url,options)}
  catch(e){throw Error('Không kết nối được GitHub hoặc đã hết thời gian chờ: '+String(e.message||e).slice(0,150));}
 };
 const checkHttp=response=>{
  if(response.status===403||response.status===429)throw Error('GitHub đang giới hạn yêu cầu. Hãy thử lại sau.');
  if(!response.ok&&response.status!==404)throw Error(`GitHub HTTP ${response.status}.`);
 };
 const response=await get(`${base}/releases/latest`);checkHttp(response);
 let latestRelease=null;
 if(response.ok){latestRelease=await response.json();}
 // No strict tag assertion: use binary filename, tag or release title.
 // If the latest release is source-only or has a nonstandard tag, browse older/newer published releases.
 let primary=latestRelease?getCandidate(latestRelease,valid,platform,arch,version):null;
 if(primary && primary.newer && !primary.sourceOnly)return primary;
 let all=[];
 if(!primary || primary.sourceOnly || !primary.latest){
  const listResponse=await get(`${base}/releases?per_page=30`);checkHttp(listResponse);
  if(listResponse.ok&&typeof listResponse.json==='function'){const list=await listResponse.json();if(Array.isArray(list))all=list.filter(r=>!r.draft&&!r.prerelease);}
 }
 const choices=[...(latestRelease?[latestRelease]:[]),...all.filter(r=>r.id!==latestRelease?.id)]
  .map(r=>getCandidate(r,valid,platform,arch,version)).filter(c=>c.newer&&!c.sourceOnly);
 choices.sort((a,b)=>compareVersions(b.latest,a.latest));
 if(choices.length)return choices[0];
 if(primary)return primary;
 // Differentiate inaccessible repositories only for internal diagnostics, not UI text.
 const metadata=await get(base);checkHttp(metadata);
 if(metadata.ok)return {current:version,latest:null,newer:false,noRelease:true,sourceOnly:true,url:`https://github.com/${valid}/releases`,publishedAt:''};
 if(metadata.status===404)throw Error('Repository GitHub không tồn tại, không công khai hoặc không có quyền xem.');
 return {current:version,latest:null,newer:false,noRelease:true,sourceOnly:true,url:`https://github.com/${valid}/releases`,publishedAt:''};
}
module.exports={OFFICIAL_REPO,compareVersions,validateRepo,checkUpdate,versionFromText,compatibleAsset};
