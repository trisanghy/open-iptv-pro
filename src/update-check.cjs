'use strict';
function compareVersions(a,b){
 const parts=v=>{const s=String(v||'').replace(/^v/i,'').split('-')[0].split('.');if(!/^\d+(\.\d+){0,3}$/.test(s.join('.')))throw Error('Phiên bản không hợp lệ');return s.map(Number);};
 const A=parts(a),B=parts(b);for(let i=0;i<4;i++){if((A[i]||0)>(B[i]||0))return 1;if((A[i]||0)<(B[i]||0))return -1;}return 0;
}
function validateRepo(value){const v=String(value||'').trim();if(!/^[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_.-]{1,100}$/.test(v)||v.includes('..'))throw Error('Nhập repository GitHub theo dạng tai-khoan/open-iptv-pro');return v;}
async function checkUpdate(repo,version,fetcher=fetch){
 const valid=validateRepo(repo),base=`https://api.github.com/repos/${valid}`;
 const options={headers:{Accept:'application/vnd.github+json','User-Agent':'Open-IPTV-Pro/4.21','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(15000)};
 let response;
 try{response=await fetcher(`${base}/releases/latest`,options);}
 catch(e){throw Error('Không kết nối được GitHub hoặc đã hết thời gian chờ: '+String(e.message||e).slice(0,150));}
 if(response.status===404){
   // A repository can exist without a published stable Release. This is not a software error.
   let metadata;try{metadata=await fetcher(base,options);}catch(e){throw Error('Không đọc được thông tin repository GitHub: '+String(e.message||e).slice(0,150));}
   if(metadata.ok)return {current:version,latest:null,newer:false,noRelease:true,sourceOnly:true,url:`https://github.com/${valid}/releases`,publishedAt:''};
   if(metadata.status===404)throw Error('Repository GitHub không tồn tại, không công khai hoặc không có quyền xem.');
   throw Error(`Không kiểm tra được repository (GitHub HTTP ${metadata.status}).`);
 }
 if(!response.ok){
   if(response.status===403||response.status===429)throw Error('GitHub đang giới hạn yêu cầu (HTTP '+response.status+'). Hãy thử lại sau.');
   throw Error(`Lỗi GitHub HTTP ${response.status}.`);
 }
 const release=await response.json();const tag=String(release.tag_name||'');
 if(!/^v?\d+\.\d+\.\d+(?:[.-][\w.-]+)?$/i.test(tag))throw Error('Tag bản phát hành không theo chuẩn phiên bản');
 const allAssets=(release.assets||[]).filter(a=>typeof a.name==='string'&&typeof a.browser_download_url==='string').map(a=>({name:a.name,url:a.browser_download_url,size:a.size||0,digest:a.digest||''}));
 const installerAssets=allAssets.filter(a=>/\.(?:dmg|exe|msi|zip)$/i.test(a.name) && a.url.startsWith(`https://github.com/${valid}/releases/download/`));
 return {current:version,latest:tag,newer:compareVersions(tag,version)>0,noRelease:false,sourceOnly:installerAssets.length===0,assets:allAssets,url:`https://github.com/${valid}/releases/latest`,publishedAt:release.published_at||''};
}
module.exports={compareVersions,validateRepo,checkUpdate};
