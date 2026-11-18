'use strict';
// Pure manual selector logic, shared between renderer and Node regression tests.
(function(root){
 function prioritize(knownUrls,selectedUrl){
  const urls=[...new Set((Array.isArray(knownUrls)?knownUrls:[]).filter(u=>typeof u==='string'&&/^https?:\/\//i.test(u)))];
  if(!selectedUrl)return urls;
  if(!urls.includes(selectedUrl))return null; // Never play an unlisted/foreign URL.
  return [selectedUrl,...urls.filter(u=>u!==selectedUrl)];
 }
 const api=Object.freeze({prioritize});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.IPTVManualStreamSelection=api;
})(typeof window!=='undefined'?window:globalThis);
