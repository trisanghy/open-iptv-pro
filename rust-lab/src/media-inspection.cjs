'use strict';
/** Determine actual media mode from HTTP content and HLS tags, not the M3U group label. */
function inspectMedia({url='',contentType='',sample='',acceptRanges=''}={}){
 const text=String(sample||'').replace(/^\uFEFF/,'').trimStart();
 const type=String(contentType||'').toLowerCase();
 const html=/^(?:<!doctype\s+html\b|<html\b|<head\b)/i.test(text);
 const manifest= /^#EXTM3U(?:\s|$)/i.test(text)&&/#EXT-X-/i.test(text);
 const urlHls=/\.m3u8?(?:[?#]|$)/i.test(url);
 const hls= !html&&(manifest||/(?:application|audio)\/(?:vnd\.apple\.mpegurl|x-mpegurl)/i.test(type)||urlHls);
 const dash=/\.mpd(?:[?#]|$)/i.test(url)||/application\/dash\+xml/i.test(type)||/^<\?xml[^>]*>\s*<MPD\b/i.test(text)||/^<MPD\b/i.test(text);
 const endlist=manifest&&/#EXT-X-ENDLIST\b/i.test(text);
 const playlistType=manifest?/#EXT-X-PLAYLIST-TYPE\s*:\s*(VOD|EVENT)/i.exec(text)?.[1]?.toLowerCase()||'':'';
 const event=playlistType==='event';
 const vod=playlistType==='vod'||endlist;
 const segments=[...text.matchAll(/^#EXTINF\s*:\s*(\d+(?:\.\d+)?)/gim)];
 const duration=segments.reduce((n,m)=>n+Number(m[1]),0);
 const mp4=/video\/mp4/i.test(type)||/\.mp4(?:[?#]|$)/i.test(url);
 const live=manifest&&/#EXT-X-TARGETDURATION\b/i.test(text)&&!vod&&!event;
 const mode=vod?'vod':event?'event':mp4?'vod':live?'live':'unknown';
 return {hls,dash,format:dash?'dash':hls?'hls':mp4?'mp4':'unknown',event,vod,mode,
  seekable:vod||event||mp4&&(/\bbytes\b/i.test(acceptRanges)||!html),
  durationSeconds:vod&&segments.length?Math.round(duration*100)/100:null};
}
function rangeForVideo(video,kind={}){
 // HTML5 reports a rolling seekable range for ordinary live streams. That does
 // not mean the user asked for DVR. LIVE uses the separate 10-minute buffer.
 if(!['event','vod','timeshift','catchup'].includes(kind.mode))return null;
 const ranges=video?.seekable;
 if(!ranges||ranges.length<1)return null;
 try{
  const start=ranges.start(0),end=ranges.end(ranges.length-1);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end-start<1)return null;
  return {start,end,length:end-start};
 }catch{return null;}
}
module.exports={inspectMedia,rangeForVideo};
