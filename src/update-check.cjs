'use strict';
function compareVersions(a,b){
 const parts=v=>{const s=String(v||'').replace(/^v/i,'').split('-')[0].split('.');if(!/^\d+(\.\d+){0,3}$/.test(s.join('.')))throw Error('Phiên bản không hợp lệ');return s.map(Number);};
 const A=parts(a),B=parts(b);for(let i=0;i<4;i++){if((A[i]||0)>(B[i]||0))return 1;if((A[i]||0)<(B[i]||0))return -1;}return 0;
}
function validateRepo(value){const v=String(value||'').trim();if(!/^[a-zA-Z0-9-]{1,39}\/[a-zA-Z0-9_.-]{1,100}$/.test(v)||v.includes('..'))throw Error('Nhập repository GitHub theo dạng tai-khoan/open-iptv-pro');return v;}
async function checkUpdate(repo,version,fetcher=fetch){
 const valid=validateRepo(repo);const response=await fetcher(`https://api.github.com/repos/${valid}/releases/latest`,{headers:{Accept:'application/vnd.github+json','User-Agent':'Open-IPTV-Pro/4.1','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(response.status===404?'Chưa có bản phát hành GitHub Releases hoặc repo chưa công khai':`GitHub HTTP ${response.status}`);
 const release=await response.json();const tag=String(release.tag_name||'');if(!/^v?\d+\.\d+\.\d+(?:[.-][\w.-]+)?$/i.test(tag))throw Error('Tag bản phát hành không theo chuẩn phiên bản');
 return {current:version,latest:tag,newer:compareVersions(tag,version)>0,url:`https://github.com/${valid}/releases/latest`,publishedAt:release.published_at||''};
}
module.exports={compareVersions,validateRepo,checkUpdate};
