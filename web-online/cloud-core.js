'use strict';
/* Pure helpers tested in Node; no credentials, browser or network requirements. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVCloudCore=api;
})(typeof window!=='undefined'?window:null,function(){
 const SKIP=new Set(['snapshots','epgCache','epgRaw','epgPrograms','cloudSession','cloudToken']);
 const MAX_BYTES=1950000;
 function snapshot(store){
  const src=store&&typeof store==='object'&&!Array.isArray(store)?store:{};
  const out={};
  for(const [key,value] of Object.entries(src)){
   if(SKIP.has(key)||key.startsWith('_')||value===undefined)continue;
   if(typeof value==='function')continue;
   out[key]=value;
  }
  return JSON.parse(JSON.stringify(out));
 }
 function isMeaningful(s){
  return Boolean((s?.sources?.length||0)+(s?.channels?.length||0)+(s?.favorites?.length||0)+(s?.folders?.length||0));
 }
 const same=(a,b)=>JSON.stringify(snapshot(a))===JSON.stringify(snapshot(b));
 function validate(s){
  const json=JSON.stringify(snapshot(s));
  const len=new TextEncoder().encode(json).length;
  if(len>MAX_BYTES)throw Error('Dữ liệu IPTV quá lớn để đồng bộ (giới hạn 1,95 MB). Hãy bỏ ảnh chụp hoặc giảm số kênh.');
  return {payload:JSON.parse(json),bytes:len};
 }
 function decision({local,remote,knownRevision,knownPayload}){
  if(!remote)return isMeaningful(local)?'ask-first-upload':'empty';
  if(same(local,remote.payload))return 'synced';
  if(!isMeaningful(local))return 'download';
  if(Number.isInteger(knownRevision)&&knownRevision===remote.revision&&knownPayload&&same(knownPayload,remote.payload))
   return 'upload';
  if(knownPayload&&same(knownPayload,local))return 'download';
  return 'conflict';
 }
 return Object.freeze({snapshot,isMeaningful,same,validate,decision,MAX_BYTES});
});
