/* Reopening a recently successful live stream must start a new WebView session.
 * The local attempt marker never changes the upstream URL or signed M3U tokens. */
'use strict';
(function(root){
 const good=new Map();
 const RECENT_MS=90*1000;
 function notePlaying(channelId,url,now=Date.now()){
  if(!channelId||!url)return;
  const key=String(channelId)+'\n'+String(url);
  good.delete(key);good.set(key,now);
  while(good.size>80)good.delete(good.keys().next().value);
 }
 function shouldRetry(channelId,url,reason,now=Date.now()){
  const key=String(channelId||'')+'\n'+String(url||'');
  const seen=good.get(key);
  if(!Number.isFinite(seen)||now<seen||now-seen>RECENT_MS)return false;
  return /MediaError\s*[34]|NotSupported|not supported|Không giải mã|Định dạng hoặc URL/i.test(String(reason));
 }
 function freshProxy(input,token){
  try{
   const u=new URL(input);
   if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.pathname!=='/stream'||
      !u.searchParams.has('key')||!u.searchParams.has('url'))return input;
   u.searchParams.set('attempt',String(token).replace(/[^0-9a-z-]/gi,'').slice(0,48));
   return u.toString();
  }catch{return input;}
 }
 const api=Object.freeze({notePlaying,shouldRetry,freshProxy});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.IPTVPlaybackReentry=api;
})(typeof window!=='undefined'?window:globalThis);
