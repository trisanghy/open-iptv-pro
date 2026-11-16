/* Independent, unit-testable model for manual per-channel stream selection. */
'use strict';
(function(root){
 function choices(channel, all=[], manual={}, advancedProvider, adaptive){
  if(!channel)return [];
  const urls=adaptive?.candidates?.(channel,all,manual,advancedProvider)||[channel.url];
  let backup=0;
  return urls.map(url=>{
   const original=url===channel.url;
   if(!original)backup++;
   let host='';try{const u=new URL(url);host=u.host+(u.pathname==='/'?'':u.pathname);}catch{}
   return {url,label:original?'Link gốc':`Dự phòng ${backup}`,host:host.slice(0,76),preferred:url===channel.preferredStreamUrl};
  });
 }
 function prioritize(url,urls){
  const original=[...new Set(urls)];
  if(!url||!original.includes(url))return original;
  return [url,...original.filter(x=>x!==url)];
 }
 const api=Object.freeze({choices,prioritize});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.IPTVManualLinkPicker=api;
})(typeof window!=='undefined'?window:globalThis);
