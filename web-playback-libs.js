'use strict';
/* Keep the two large decoders off the Web startup path. Fetch only when a
 * stream actually requires them, once per browser tab, from THIS origin. */
(function(root,create){
 const api=create(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVPlaybackLibs=api;
})(typeof window!=='undefined'?window:null,function(root){
 const sources={hls:{file:'hls.min.js',global:'Hls'},dash:{file:'dash.all.min.js',global:'dashjs'}};
 const inFlight=new Map();
 function load(kind){
  const entry=sources[kind];
  if(!entry)return Promise.reject(Error('Unsupported playback library: '+kind));
  if(root?.[entry.global])return Promise.resolve(root[entry.global]);
  if(inFlight.has(kind))return inFlight.get(kind);
  if(!root?.document?.head)return Promise.reject(Error('Playback loader requires a browser document'));
  const promise=new Promise((resolve,reject)=>{
   const script=root.document.createElement('script');
   script.src=entry.file;script.async=true;
   const fail=reason=>{
    script.onload=null;script.onerror=null;
    if(script.remove)script.remove();
    inFlight.delete(kind);
    reject(Error(reason));
   };
   script.onload=()=>{
    if(root[entry.global]){script.onload=null;script.onerror=null;resolve(root[entry.global]);}
    else fail('Decoder did not initialize: '+entry.file);
   };
   script.onerror=()=>fail('Không tải được thư viện phát video nội bộ: '+entry.file);
   root.document.head.appendChild(script);
  });
  inFlight.set(kind,promise);
  return promise;
 }
 return Object.freeze({load});
});
