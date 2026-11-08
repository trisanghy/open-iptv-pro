'use strict';
const {checkUpdate}=require('./update-check.cjs');
async function checkWebViewRelease(repo,version,fetcher=fetch){
 const result=await checkUpdate(repo,version,fetcher);
 if(result.noRelease)return result;
 const webview=(result.assets||[]).filter(a=>/webview/i.test(a.name)&&/\.(dmg|exe)$/i.test(a.name));
 if(!webview.length)return {...result,newer:false,assets:[],noRelease:true};
 const sums=(result.assets||[]).filter(a=>a.name==='SHA256SUMS.txt');
 return {...result,assets:[...webview,...sums]};
}
module.exports={checkWebViewRelease};
