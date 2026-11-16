/* Playback preferences kept separately from playlist URLs.
 * A source refresh may replace signed stream URLs; a promoted preference is used
 * only while it is still one of the available alternatives for this channel. */
'use strict';
(function(root){
 const validURL=s=>{try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
 function candidates(ch,all=[],manual={},alternativeProvider){
  if(!ch)return [];
  const base=typeof alternativeProvider==='function'?alternativeProvider(ch,all,manual):[ch.url,...(manual[ch.id]||[])];
  const safe=[...new Set((Array.isArray(base)?base:[]).filter(validURL))].slice(0,10);
  const preferred=String(ch.preferredStreamUrl||'');
  if(preferred&&safe.includes(preferred))return [preferred,...safe.filter(url=>url!==preferred)];
  return safe;
 }
 function promote(ch,url,all=[],manual={},provider,now=Date.now()){
  if(!ch||!validURL(url)||url===ch.url)return false;
  const options=candidates(ch,all,manual,provider);
  if(!options.includes(url))return false;
  if(ch.preferredStreamUrl===url)return false;
  ch.preferredStreamUrl=url;
  ch.preferredStreamAt=new Date(now).toISOString();
  return true;
 }
 function clearPreferred(ch){
  if(!ch?.preferredStreamUrl)return false;
  delete ch.preferredStreamUrl;delete ch.preferredStreamAt;
  return true;
 }
 function effectiveURL(ch,all=[],manual={},provider){return candidates(ch,all,manual,provider)[0]||ch?.url||'';}
 const api=Object.freeze({validURL,candidates,promote,clearPreferred,effectiveURL});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.IPTVAdaptivePlayback=api;
})(typeof window!=='undefined'?window:globalThis);
