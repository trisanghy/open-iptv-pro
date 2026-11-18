'use strict';
// Read-only discovery of public playlist files hosted in an explicit GitHub repository.
const {repoURL}=require('../renderer/collector-core.js');
const MAX_FILES=25,MAX_TREE_BYTES=3_000_000;
async function listPublicPlaylists(raw, fetcher=fetch){
 const {owner,repo}=repoURL(raw), headers={Accept:'application/vnd.github+json','User-Agent':'Open-IPTV-Pro-Collector/4.7'};
 const get=async(url)=>{const r=await fetcher(url,{headers,signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('GitHub HTTP '+r.status+'; repo có thể private hoặc giới hạn API');const length=+(r.headers?.get?.('content-length')||0);if(length>MAX_TREE_BYTES)throw Error('Dữ liệu repository quá lớn');const body=await r.text();if(body.length>MAX_TREE_BYTES)throw Error('Dữ liệu repository quá lớn');return JSON.parse(body);};
 const metadata=await get(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
 if(metadata.private)throw Error('Repository không công khai');const branch=metadata.default_branch||'main';
 const tree=await get(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
 if(tree.truncated)throw Error('Danh sách file repository chưa đầy đủ; hãy dùng đường dẫn file M3U trực tiếp');
 const files=(tree.tree||[]).filter(x=>x.type==='blob'&&/\.(?:m3u|m3u8)$/i.test(x.path)&&x.path.split('/').length<=7&&(x.size||0)<=5_000_000).slice(0,MAX_FILES);
 return {owner,repo,branch,files:files.map(f=>({path:f.path,size:f.size||0,url:`https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${f.path.split('/').map(encodeURIComponent).join('/')}`}))};
}
module.exports={listPublicPlaylists};
