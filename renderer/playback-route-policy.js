'use strict';
/** v4.23.25: fast first playback without mandatory 13-second FFmpeg detour.
 * Built from stream URL shape and real decoded-frame history; never from link check.
 */
(function(root,factory){
 const value=factory();
 if(typeof module==='object'&&module.exports)module.exports=value;
 if(root)root.IPTVPlaybackRoutePolicy=value;
})(typeof window!=='undefined'?window:null,function(){
 const DENIED=/\b(?:HTTP\s*|status[=: ]\s*)(?:401|403)\b/i;
 function format(raw){
  try{
   const u=new URL(String(raw));
   const pathname=u.pathname.toLowerCase();
   const filename=(u.searchParams.get('file')||'').toLowerCase();
   if(/\.m3u8?$/.test(pathname)||/\.m3u8?$/.test(filename))return 'hls';
   if(/\.mpd$/.test(pathname)||/\.mpd$/.test(filename))return 'dash';
   if(/\.flv$/.test(pathname)||/\.flv$/.test(filename))return 'flv';
   if(/\.(?:ts|m2ts|mpegts)$/.test(pathname)||/\.(?:ts|m2ts|mpegts)$/.test(filename))return 'mpegts';
   if(/\.(?:mp4|m4v|mov|webm)$/.test(pathname)||/\.(?:mp4|webm)$/.test(filename))return 'video';
  }catch{}
  return 'unknown';
 }
 function initialTransport(url,{savedTransport='',savedDurationMs=0}={}){
  const kind=format(url);
  // Raw TS/FLV needs MSE transmuxing before optional FFmpeg fallback.
  if(kind==='flv'||kind==='mpegts')return 'mpegts';
  if(savedTransport==='mpegts'&&kind==='unknown')return 'mpegts';
  if(kind==='unknown'&&savedTransport==='ffmpeg'&&Number(savedDurationMs)>0&&Number(savedDurationMs)<=4000)return 'ffmpeg';
  return 'relay';
 }
 function shouldAutoFfmpeg(reason,{mode='live',url='',alreadyTried=false}={}){
  if(alreadyTried||mode==='timeshift'||!/^https?:/i.test(url)||DENIED.test(String(reason||'')))return false;
  if(/(?:kết nối quá thời gian|đứng hình quá|timed?\s*out|abort)/i.test(String(reason||'')))return false;
  return /(?:not\s*supported|unsupported|decode|MEDIA_ERROR|mediaError|bufferAppendError|codec|format|demux|container|không hỗ trợ|không giải mã)/i.test(String(reason||''));
 }
 function preferNativeHls({format:mediaFormat,hasNativeSupport=false,isTimeshift=false,wasHlsJs=false}={}){
  return mediaFormat==='hls'&&hasNativeSupport&&!isTimeshift&&!wasHlsJs;
 }
 return {format,initialTransport,shouldAutoFfmpeg,preferNativeHls};
});
