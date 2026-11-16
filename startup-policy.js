'use strict';
/* Open IPTV Pro 4.23.23: avoid network preflight for explicitly typed streams.
 * A network probe can consume 5 seconds before the video engine even starts.
 * Unknown extensions still receive a bounded probe, never a forced HLS guess.
 */
(function(root,factory){
 const exported=factory();
 if(typeof module==='object'&&module.exports)module.exports=exported;
 if(root)root.IPTVStartupPolicy=exported;
})(typeof window!=='undefined'?window:null,function(){
 const UNKNOWN=Object.freeze({hls:false,dash:false,mode:'unknown',seekable:false,format:'unknown'});
 function knownMedia(raw){
  let parsed;try{parsed=new URL(String(raw));}catch{return null;}
  const pathname=parsed.pathname.toLowerCase();
  const queryFile=parsed.searchParams.get('file')||'';
  // Internal loopback routes carry the filename as a query parameter.
  const ext=/\.(?:m3u8?|mpd|mp4|m4v|mov|webm)$/i.test(queryFile)?queryFile:pathname;
  if(/\.m3u8?$/.test(ext))return {hls:true,dash:false,mode:'unknown',seekable:false,format:'hls'};
  if(/\.mpd$/.test(ext))return {hls:false,dash:true,mode:'unknown',seekable:false,format:'dash'};
  if(/\.(?:mp4|m4v|mov|webm)$/.test(ext))return {hls:false,dash:false,mode:'vod',seekable:true,format:'mp4'};
  return null;
 }
 async function inspectQuick(url,probe,{timeoutMs=2200}={}){
  const known=knownMedia(url);
  if(known)return known;
  if(typeof probe!=='function')return {...UNKNOWN};
  let timer;
  try{
   const timeout=Math.max(250,Math.min(5000,Number(timeoutMs)||2200));
   const value=await Promise.race([
    Promise.resolve().then(()=>probe(url)).catch(()=>null),
    new Promise(resolve=>{timer=setTimeout(()=>resolve(null),timeout);})
   ]);
   return value&&typeof value==='object'?value:{...UNKNOWN};
  }finally{clearTimeout(timer);}
 }
 return {knownMedia,inspectQuick};
});
