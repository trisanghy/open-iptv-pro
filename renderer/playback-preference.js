'use strict';
/**
 * Reuse ONLY genuinely decoded, recently proven player routes.
 * HTTP status, snapshot or health-check results never count as playback proof.
 * Source URLs are read from the current allowed candidates, never from old history.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.IPTVPlaybackPreference=api;
})(typeof window!=='undefined'?window:null,function(){
 const MAX_AGE_MS=30*60*1000;
 function isFresh(value,now=Date.now(),maxAgeMs=MAX_AGE_MS){
  const stamp=Date.parse(String(value||''));
  return Number.isFinite(stamp)&&stamp<=now&&now-stamp>=0&&now-stamp<maxAgeMs;
 }
 function choose(channel,candidates,now=Date.now()){
  const urls=[...new Set((Array.isArray(candidates)?candidates:[]).filter(x=>typeof x==='string'&&/^https?:\/\//i.test(x)))];
  const recent=isFresh(channel?.lastPlaybackAt,now);
  const remembered=recent?channel?.lastPlayableUrl:null;
  const selected=remembered&&urls.includes(remembered)?remembered:null;
  if(selected&&urls[0]!==selected){urls.splice(urls.indexOf(selected),1);urls.unshift(selected);}
  const transport=selected&&channel.lastPlayableTransport==='ffmpeg'?'ffmpeg':'relay';
  return {urls,transport,remembered:!!selected};
 }
 function alternateTransport(current,tried,canFfmpeg){
  const next=current==='ffmpeg'?'relay':'ffmpeg';
  if(next==='ffmpeg'&&!canFfmpeg)return null;
  return tried?.has(next)?null:next;
 }
 return {MAX_AGE_MS,isFresh,choose,alternateTransport};
});
