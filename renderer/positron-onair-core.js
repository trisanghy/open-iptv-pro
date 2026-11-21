'use strict';
/* P5.1.98: surface only actual, locally imported XMLTV programme metadata.
 * Never loads a remote EPG, guesses titles or starts playback. */
(function(root){
 function lookup(guide,channel,clock=Date.now(),api=root?.IPTVGuide){
  if(!guide||!Array.isArray(guide.programmes)||!guide.programmes.length||!channel||typeof api?.current!=='function')return null;
  try{
   const item=api.current(guide,channel,clock)?.now;
   if(!item||!Number.isFinite(item.start)||!Number.isFinite(item.end)||item.start>clock||item.end<=clock)return null;
   const title=typeof item.title==='string'?item.title.trim().replace(/\s+/g,' ').slice(0,140):'';
   return title?{title,end:item.end}:null;
  }catch{return null;}
 }
 function upcoming(guide,channel,clock=Date.now(),api=root?.IPTVGuide){
  if(!guide||!Array.isArray(guide.programmes)||!guide.programmes.length||!channel||typeof api?.current!=='function')return null;
  try{
   const next=api.current(guide,channel,clock)?.next;
   if(!next||!Number.isFinite(next.start)||!Number.isFinite(next.end)||next.start<=clock||next.end<=next.start
    ||next.start-clock>12*60*60*1000)return null;
   const title=typeof next.title==='string'?next.title.trim().replace(/\s+/g,' ').slice(0,140):'';
   return title?{title,start:next.start}:null;
  }catch{return null;}
 }
 const api=Object.freeze({lookup,upcoming});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PositronOnAirCore=api;
})(typeof globalThis!=='undefined'?globalThis:null);
