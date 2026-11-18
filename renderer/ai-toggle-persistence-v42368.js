'use strict';
/* Restore Caption / Translate / TTS intent BEFORE the AI worker modules load.
   Persistence is independent of media playback: pausing/Stop never erases it. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root){root.OpenIPTVAITogglePersistence=api;if(root.document)api.bootstrap(root);}
})(typeof window!=='undefined'?window:null,function(){
 const KEY='openiptv:ai-toggle-state:v1';
 const IDS=Object.freeze({
  caption:'liveCaptionToggle',
  translate:'liveTranslateToggle',
  tts:'liveTtsToggle'
 });
 function normalize(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  if(['caption','translate','tts'].some(k=>typeof raw[k]!=='boolean'))return null;
  const state={caption:raw.caption,translate:raw.translate,tts:raw.tts};
  // A restored TTS session always needs translation. The original Caption
  // visibility remains independent, as the user may have hidden it.
  if(state.tts)state.translate=true;
  return state;
 }
 function createController({doc,storage}={}){
  const elements=Object.fromEntries(Object.entries(IDS).map(([key,id])=>
   [key,doc?.getElementById?.(id)||null]));
  if(Object.values(elements).some(node=>!node))return null;
  const snapshot=()=>Object.fromEntries(Object.entries(elements)
   .map(([key,node])=>[key,!!node.checked]));
  const load=()=>{
   try{return normalize(JSON.parse(storage?.getItem?.(KEY)||'null'));}
   catch{return null;}
  };
  const saved=load();
  if(saved)for(const [key,value] of Object.entries(saved))elements[key].checked=value;
  const persist=()=>{
   const current=normalize(snapshot());
   try{storage?.setItem?.(KEY,JSON.stringify(current));}catch{}
   return current;
  };
  const changed=ev=>{
   if(!Object.values(elements).includes(ev?.target))return;
   // Event bubbles AFTER the control's own listeners have applied dependent
   // changes. Do not write during startup restoration or on pagehide.
   persist();
  };
  doc.addEventListener?.('change',changed);
  return Object.freeze({
   restored:!!saved,get:snapshot,persist,load,
   dispose:()=>doc.removeEventListener?.('change',changed)
  });
 }
 function bootstrap(root){
  if(!root?.document||root.OpenIPTVAIToggleState)return null;
  const controller=createController({doc:root.document,storage:root.localStorage});
  if(controller)root.OpenIPTVAIToggleState=controller;
  return controller;
 }
 return Object.freeze({KEY,IDS,normalize,createController,bootstrap});
});
