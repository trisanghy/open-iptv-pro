/* Channel status evidence model for Tauri and Electron-compatible renderer.
 * A successful snapshot/playback is positive evidence for the exact stream URL.
 * A HTTP probe is not equivalent to a decoded media frame. */
'use strict';
(function (root, factory) {
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.IPTVHealthEvidence=api;
})(typeof window!=='undefined'?window:globalThis, function(){
  const POSITIVE_TTL_MS=30*60*1000;
  function recentProof(ch, now=Date.now()) {
    if(!ch)return false;
    const streams=[
      [ch.lastPlayableUrl,ch.lastPlaybackAt],
      [ch.lastSnapshotUrl,ch.lastSnapshotAt]
    ];
    return streams.some(([url,at])=>typeof url==='string'&&url.length>0&&
      url===ch.url&&Number.isFinite(Date.parse(at||''))&&
      now-Date.parse(at)>=0&&now-Date.parse(at)<=POSITIVE_TTL_MS);
  }
  function alternateProof(ch,now=Date.now()) {
    if(!ch||!ch.lastPlayableUrl||ch.lastPlayableUrl===ch.url)return false;
    const at=Date.parse(ch.lastPlaybackAt||'');
    return Number.isFinite(at)&&now-at>=0&&now-at<=POSITIVE_TTL_MS;
  }
  function noteProof(ch,kind,url,now=Date.now()) {
    if(!ch||!url||!['playback','snapshot'].includes(kind))return false;
    const timestamp=new Date(now).toISOString();
    if(kind==='playback'){ch.lastPlayableUrl=url;ch.lastPlaybackAt=timestamp;}
    else {ch.lastSnapshotUrl=url;ch.lastSnapshotAt=timestamp;}
    ch.status='alive';
    ch.reason=url===ch.url?(kind==='snapshot'?'FFmpeg vừa chụp được khung hình thật':'Đã giải mã và phát video thực tế'):
      'Đang phát qua link dự phòng đã xác minh; link chính chưa được xác minh';
    ch.checkedAt=timestamp;
    ch.positiveEvidence=true;
    return true;
  }
  function applyProbe(ch,res,now=Date.now()) {
    if(!ch)return {status:'uncertain',reason:'Không có kênh'};
    const proven=recentProof(ch,now);
    const requested=res&&typeof res==='object'?res:{};
    const result={...requested};
    const status=result.status;
    if(status==='alive'&&result.positiveEvidence===true){
      ch.status='alive';ch.positiveEvidence=true;
      ch.lastVerifiedAt=new Date(now).toISOString();
      ch.reason=String(result.reason||'Đã xác minh dữ liệu video');
    }else if(alternateProof(ch,now)){
      ch.status='alive';ch.positiveEvidence=true;
      ch.reason='Kênh vẫn phát được qua link dự phòng; link gốc chưa xác minh'+(result.reason?' · '+String(result.reason).slice(0,120):'');
      result.status='alive';result.positiveEvidence=true;result.confirmedDead=false;
    }else if(proven){
      ch.status='alive';ch.positiveEvidence=true;
      ch.reason='Đã phát/chụp video thật trong 30 phút; phép kiểm tra HTTP chưa đủ để phủ định'+(result.reason?' · '+String(result.reason).slice(0,170):'');
      result.status='alive';result.positiveEvidence=true;result.confirmedDead=false;
    }else if(status==='dead'&&result.confirmedDead===true){
      ch.status='dead';ch.positiveEvidence=false;
      ch.reason=String(result.reason||'Không nhận được nguồn sau kiểm tra lặp');
    }else{
      ch.status='uncertain';ch.positiveEvidence=false;
      ch.reason=String(result.reason||'Chưa có bằng chứng hình ảnh hoặc âm thanh');
      result.status='uncertain';result.confirmedDead=false;
    }
    ch.checkedAt=new Date(now).toISOString();
    result.status=ch.status;result.reason=ch.reason;
    return result;
  }
  return Object.freeze({POSITIVE_TTL_MS,recentProof,alternateProof,noteProof,applyProbe});
});
