'use strict';
/** v4.23.68: emit a short audible chunk first, without dropping original text. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVTTSChunks=api;
})(typeof window!=='undefined'?window:null,function(){
 function split(text,{first=58,rest=105,max=360}={}){
  const input=String(text||'').replace(/\s+/g,' ').trim().slice(0,max);
  if(!input)return [];
  if(input.length<=first)return [input];
  let remaining=input;
  const parts=[];
  while(remaining){
   const limit=parts.length===0?first:rest;
   if(remaining.length<=limit){parts.push(remaining);break;}
   const window=remaining.slice(0,limit+1);
   const punctuation=Math.max(window.lastIndexOf('. '),window.lastIndexOf('! '),window.lastIndexOf('? '),window.lastIndexOf('。'),window.lastIndexOf('，'),window.lastIndexOf(', '),window.lastIndexOf('; '));
   const space=window.lastIndexOf(' ');
   // Always use complete words; never split Vietnamese diacritics or UTF-8.
   let cut=punctuation>=Math.floor(limit*0.38)?punctuation+1:space>=Math.floor(limit*0.45)?space:limit;
   if(cut<=0)cut=Math.min(limit,remaining.length);
   parts.push(remaining.slice(0,cut).trim());
   remaining=remaining.slice(cut).trim();
  }
  return parts.filter(Boolean);
 }
 return Object.freeze({split});
});
