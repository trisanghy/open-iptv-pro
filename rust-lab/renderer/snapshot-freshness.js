/* Snapshot freshness is a timestamp decision, never an HTTP health result. */
'use strict';
((root)=>{
 const MAX_AGE_MS=6*60*60*1000;
 const RETRY_DELAY_MS=30*60*1000;
 function capturedTime(shot){
  if(!shot)return 0;
  const at=Number(shot.capturedAt);
  if(Number.isFinite(at)&&at>0)return at;
  const raw=String(shot.date||'').trim();
  // Historic snapshots use Vietnamese locale: HH:mm:ss dd/MM/yyyy or dd/MM/yyyy, HH:mm:ss.
  const m=raw.match(/(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s+)?(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if(m){
   const h=Number(m[1]||m[7]||0),min=Number(m[2]||m[8]||0),sec=Number(m[3]||m[9]||0);
   const d=Number(m[4]),month=Number(m[5]),year=Number(m[6]);
   const dt=new Date(year,month-1,d,h,min,sec);
   if(dt.getFullYear()===year&&dt.getMonth()===month-1&&dt.getDate()===d)return dt.getTime();
  }
  const iso=/^\d{4}-\d\d-\d\d/.test(raw)?Date.parse(raw):NaN;
  return Number.isFinite(iso)?iso:0;
 }
 function hasImage(shot){return !!(shot&&(shot.file||shot.data));}
 function isStale(shot,now=Date.now()){
  if(!hasImage(shot))return false;
  const time=capturedTime(shot);
  return time<=0||now-time>=MAX_AGE_MS;
 }
 function eligible(shot,now=Date.now()){
  if(!isStale(shot,now))return false;
  const last=Number(shot.lastAttemptAt)||0;
  return !last||now-last>=RETRY_DELAY_MS;
 }
 const api={MAX_AGE_MS,RETRY_DELAY_MS,capturedTime,hasImage,isStale,eligible};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.IPTVSnapshotPolicy=api;
})(typeof window!=='undefined'?window:globalThis);
