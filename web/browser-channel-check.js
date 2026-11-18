'use strict';
/* Open IPTV Pro Web channel check.
 * Browser-only: checks readable HLS playlist + first segment, DASH manifests,
 * direct media response bytes, and native-media playback where supported.
 * CORS/network failures are NEVER reported as confirmed dead.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OpenIPTVWebChannelCheck = api;
})(typeof window !== 'undefined' ? window : null, function() {
  const LIMIT = 192 * 1024;
  const MIME_MEDIA = /^(video\/|audio\/|application\/(?:mp4|vnd\.apple\.mpegurl|x-mpegurl|dash\+xml))/i;
  const HLS_MIME = /mpegurl|vnd\.apple\.mpegurl/i;
  const DASH_MIME = /dash\+xml/i;
  const isMediaURL = url => /\.(?:mp4|m4v|webm|mp3|aac|m4a|ts|m2ts|flv|ogg|ogv)(?:[?#]|$)/i.test(url);
  const isHLS = url => /\.m3u8(?:[?#]|$)/i.test(url);
  const isDASH = url => /\.mpd(?:[?#]|$)/i.test(url);
  const result = (status, reason, extras={}) => ({status, reason, ...extras});
  const isCors = msg => /^(?:TypeError|NetworkError|Failed to fetch|Load failed)|cors/i.test(String(msg));
  const isHttpURL = url => /^https?:\/\//i.test(String(url || ''));
  const htmlMime = mime => /text\/html|application\/xhtml/i.test(mime);
  const isAbort = e => e?.name === 'AbortError';
  async function fetchTimed(url, opts, timeoutMs, signal, fetchImpl) {
    if (signal?.aborted) throw Object.assign(Error('Đã hủy'), {name:'AbortError'});
    const controller = new AbortController();
    const abort = () => controller.abort();
    const timer = setTimeout(abort, timeoutMs);
    signal?.addEventListener('abort', abort, {once:true});
    try { return await fetchImpl(url, {...opts, mode:'cors', redirect:'follow', signal:controller.signal}); }
    finally {clearTimeout(timer); signal?.removeEventListener('abort', abort);}
  }
  async function readPrefix(response, limit=LIMIT, onlyFirst=false) {
    const reader = response.body?.getReader?.();
    if (!reader) {
      const blob = await response.blob();
      if (blob.size > limit && !onlyFirst) throw Error('Playlist quá lớn');
      const buffer = await blob.slice(0,limit).arrayBuffer();
      return new Uint8Array(buffer);
    }
    const chunks=[]; let length=0;
    try {
      while (length < limit) {
        let timeout;
        const step = await Promise.race([
          reader.read(),
          new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Đọc dữ liệu quá thời gian')),5000);})
        ]).finally(()=>clearTimeout(timeout));
        if (step.done) break;
        if (step.value?.length) {
          chunks.push(step.value.subarray(0,limit-length));
          length+=Math.min(limit-length,step.value.length);
          if (onlyFirst) break;
        }
      }
    } finally {
      try {void reader.cancel().catch(()=>{});} catch {}
      try {reader.releaseLock();} catch {}
    }
    const output = new Uint8Array(length); let offset=0;
    for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.length;}
    return output;
  }
  const decode = bytes => new TextDecoder().decode(bytes);
  const firstHLSMedia = text => {
    const lines=text.replace(/\r/g,'').split('\n').map(x=>x.trim());
    const tags=lines.filter(l=>l.startsWith('#EXT-X-'));
    if (!lines.includes('#EXTM3U') || !tags.length) return {valid:false};
    const variant=tags.some(t=>t.startsWith('#EXT-X-STREAM-INF'));
    // For media playlist, choose a recent segment, not an expired early one.
    const locations=lines.filter(x=>x && !x.startsWith('#'));
    if (!locations.length) return {valid:true,kind:variant?'master':'media',segment:null};
    return {valid:true,kind:variant?'master':'media',segment:variant?locations[0]:locations[locations.length-1]};
  };
  function mediaBytes(bytes,mime,url) {
    if (!bytes.length || htmlMime(mime)) return false;
    const prefix=decode(bytes.subarray(0,Math.min(64,bytes.length))).trimStart().toLowerCase();
    if(prefix.startsWith('<!doctype')||prefix.startsWith('<html')||prefix.startsWith('{"error"')||prefix.startsWith('{"message"'))return false;
    if (MIME_MEDIA.test(mime)) return true;
    if(/application\/octet-stream/i.test(mime) && bytes[0]<32) return true;
    if (isMediaURL(url)) return true;
    if (bytes.length>12) {
      const header=decode(bytes.subarray(0,Math.min(30,bytes.length)));
      return bytes[0]===0x47 || header.includes('ftyp') || header.startsWith('ID3') || header.startsWith('OggS') || header.startsWith('FLV');
    }
    return false;
  }
  async function probeNative(url, ms, signal, makeVideo) {
    if (typeof makeVideo !== 'function' || signal?.aborted) return false;
    const video = makeVideo(); if (!video) return false;
    const isHls=isHLS(url);
    if (isHls && !(video.canPlayType?.('application/vnd.apple.mpegurl') || video.canPlayType?.('application/x-mpegURL'))) return false;
    if (!isHls && !isMediaURL(url)) return false;
    return new Promise(resolve=>{
      let done=false; let timer;
      const clean=(ok)=>{
        if(done)return;done=true;
        clearTimeout(timer);signal?.removeEventListener('abort', cancelled);
        for(const event of ['loadeddata','canplay','playing','error'])video.removeEventListener?.(event,handlers[event]);
        try{video.pause?.();video.removeAttribute?.('src');video.load?.();video.remove?.();}catch{}
        resolve(ok);
      };
      const cancelled=()=>clean(false);
      const handlers={
        loadeddata:()=>clean(true),canplay:()=>clean(true),playing:()=>clean(true),
        error:()=>clean(false)
      };
      signal?.addEventListener('abort',cancelled,{once:true});
      for(const [event,handler] of Object.entries(handlers))video.addEventListener?.(event,handler,{once:true});
      timer=setTimeout(()=>clean(false),ms);
      try {
        video.muted=true;video.defaultMuted=true;video.playsInline=true;
        video.preload='auto'; video.src=url; video.load?.();
      }catch{clean(false);}
    });
  }
  async function checkURL(url,ctx,depth=0) {
    if (!isHttpURL(url)) return result('uncertain','Nguồn không thuộc HTTP/HTTPS: chỉ bản desktop hỗ trợ', {unsupported:true});
    if (typeof location!=='undefined' && location.protocol==='https:' && url.startsWith('http:'))
      return result('uncertain','Nguồn HTTP có thể bị trình duyệt HTTPS chặn (mixed content)',{blocked:true});
    try {
      const response = await fetchTimed(url,{method:'GET',cache:'no-store'},ctx.timeoutMs,ctx.signal,ctx.fetch);
      const mime=(response.headers?.get?.('content-type')||'').toLowerCase();
      if (!response.ok) {
        const isGone=response.status===404 || response.status===410;
        return result(isGone?'dead':'uncertain','HTTP '+response.status+(isGone?' (URL không còn tồn tại)':' (có thể cần đăng nhập, token hoặc giới hạn vùng)'),{confirmedDead:isGone});
      }
      if (htmlMime(mime)) return result('uncertain','Nguồn trả về HTML thay vì video/playlist');
      const manifest = isHLS(url) || HLS_MIME.test(mime);
      const dash = isDASH(url) || DASH_MIME.test(mime);
      const bytes=await readPrefix(response,manifest||dash?LIMIT:8192,!manifest&&!dash);
      if (!bytes.length) return result('uncertain','HTTP 200 nhưng luồng không trả dữ liệu');
      if (manifest || decode(bytes.subarray(0,Math.min(32,bytes.length))).trimStart().startsWith('#EXTM3U')) {
        const info=firstHLSMedia(decode(bytes));
        if(!info.valid) return result('uncertain','Playlist HLS không có cấu trúc hợp lệ');
        if(!info.segment) return result('uncertain','Đọc được manifest HLS nhưng thiếu phân đoạn video');
        const next=new URL(info.segment,url);
        if(!isHttpURL(next.href))return result('uncertain','Playlist HLS có liên kết segment không hỗ trợ');
        if(info.kind==='master' && depth<1){
          const child=await checkURL(next.href,ctx,depth+1);
          if(child.status==='alive') return result('alive','HLS master + segment đã phản hồi',{confirmedAlive:true});
          if(child.status==='dead') return result('uncertain','Master HLS mở được nhưng variant trả '+child.reason);
          return child;
        }
        if (info.kind==='master')return result('uncertain','Playlist master HLS lồng quá sâu');
        try {
          const seg=await fetchTimed(next.href,{method:'GET',headers:{Range:'bytes=0-4095'},cache:'no-store'},Math.min(ctx.timeoutMs,5000),ctx.signal,ctx.fetch);
          if(!seg.ok)return result('uncertain','Manifest HLS hợp lệ nhưng segment HTTP '+seg.status);
          const contentType=(seg.headers?.get?.('content-type')||'').toLowerCase();
          if(htmlMime(contentType))return result('uncertain','Segment HLS trả về trang HTML');
          const chunk=await readPrefix(seg,4096,true);
          if(chunk.length)return result('alive','Đã tải được manifest và dữ liệu segment HLS',{confirmedAlive:true});
          return result('uncertain','Manifest HLS đọc được nhưng segment trống');
        }catch(e){
          if(isAbort(e)&&ctx.signal?.aborted)throw e;
          return result('uncertain','Đọc được playlist HLS nhưng không kiểm tra được segment (CORS/mạng)',{blocked:true});
        }
      }
      if(dash){
        const xml=decode(bytes);
        if(/<MPD(?:\s|>)/.test(xml)&&(/<Period(?:\s|>)/.test(xml)))
          return result('uncertain','Đọc được DASH manifest; chưa xác minh segment video',{manifestValid:true});
        return result('uncertain','Manifest DASH không hợp lệ');
      }
      if(mediaBytes(bytes,mime,url))return result('alive','Đã đọc dữ liệu media trực tiếp ('+(mime||'không MIME')+')',{confirmedAlive:true});
      return result('uncertain','HTTP 200 nhưng chưa xác minh được nội dung video');
    }catch(e){
      if(isAbort(e)&&ctx.signal?.aborted)throw e;
      return result('uncertain',isAbort(e)?'Nguồn phản hồi quá thời gian cho phép':'Không đọc được nguồn (CORS/mạng hoặc token)',{blocked:true});
    }
  }
  async function checkChannel(channel,options={}) {
    const links=Array.from(new Set((options.links||[channel?.url]).filter(Boolean))).slice(0,3);
    if(!links.length)return result('uncertain','Kênh chưa có liên kết');
    const context={fetch:options.fetch||globalThis.fetch.bind(globalThis),
      timeoutMs:Math.max(1000,Math.min(12000,Number(options.timeoutMs)||6500)),
      signal:options.signal};
    const errors=[];
    let definiteDead=0,blocked=false,anyResult;
    for(let index=0;index<links.length;index++){
      if(context.signal?.aborted) throw Object.assign(Error('Đã hủy'),{name:'AbortError'});
      const url=links[index];
      let r=await checkURL(url,context);
      if(r.status!=='alive' && (r.blocked||r.manifestValid) && options.makeVideo) {
        const ok=await probeNative(url,Math.min(context.timeoutMs,4600),context.signal,options.makeVideo);
        if(ok)r=result('alive','Video đã nạp dữ liệu bằng trình phát native',{confirmedAlive:true});
      }
      if(r.status==='alive'){
        return {...r, checkedLink:url, usedAlternate:index>0,
          reason:(index>0?'Link dự phòng '+index+': ':'')+r.reason};
      }
      if(r.status==='dead'&&r.confirmedDead)definiteDead++;
      if(r.blocked)blocked=true;
      errors.push((index>0?'Dự phòng '+index+': ':'')+r.reason);
      anyResult=r;
    }
    if(definiteDead===links.length)return result('dead','Tất cả '+links.length+' link đều trả HTTP 404/410',{confirmedDead:true});
    const lastVerified=channel?.lastPlaybackAt && Date.now()-Date.parse(channel.lastPlaybackAt)<20*60*1000;
    if(lastVerified && links.includes(channel.lastPlayableUrl)){
      return result('alive','Luồng đã phát hình thực tế trong 20 phút qua; kiểm tra mạng hiện không xác minh được',{confirmedAlive:true,fromRecentPlayback:true});
    }
    return result('uncertain',errors.slice(0,2).join(' · ')||anyResult?.reason||'Chưa có bằng chứng video',{blocked});
  }
  return Object.freeze({checkChannel,checkURL,firstHLSMedia});
});
