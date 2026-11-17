'use strict';
// Open IPTV Pro Rust Lab v23.8.4: persist Live AI selections on this computer.
(()=>{
 const KEY='rustlab:live-ai-preferences-v1';
 const fields={
  liveCaptionToggle:'checked',liveTranslateToggle:'checked',liveTranslateTarget:'value',
  liveTtsToggle:'checked',liveTtsLanguage:'value',liveTtsVoice:'value',
  liveTtsSpeed:'value',liveTtsDuck:'value'
 };
 const ids=Object.keys(fields), $=id=>document.getElementById(id);
 if(!ids.some(id=>$(id)))return;
 let saved={};
 try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))saved=value;}catch{}
 const allowed=(element,value)=>!!element&&typeof value==='string'&&Array.from(element.options||[]).some(item=>item.value===value);
 for(const [id,key] of [['liveTranslateTarget','rustlab:live-translate-target'],['liveTtsSpeed','rustlab-tts-speed-v23-4']]){
  if(Object.prototype.hasOwnProperty.call(saved,id))continue;
  try{const value=localStorage.getItem(key);if(allowed($(id),value))saved[id]=value;}catch{}
 }
 for(const id of ids){
  const element=$(id);if(!element)continue;
  const value=saved[id];
  if(fields[id]==='checked'&&typeof value==='boolean')element.checked=value;
  if(fields[id]==='value'&&allowed(element,value))element.value=value;
 }
 const snapshot=()=>{
  const values={};
  for(const id of ids){const e=$(id);if(e)values[id]=fields[id]==='checked'?!!e.checked:e.value;}
  return values;
 };
 const syncLegacy=values=>{
  if(values.liveTranslateTarget!==undefined)localStorage.setItem('rustlab:live-translate-target',values.liveTranslateTarget);
  if(values.liveTtsSpeed!==undefined)localStorage.setItem('rustlab-tts-speed-v23-4',values.liveTtsSpeed);
 };
 const save=()=>{
  try{const values=snapshot();localStorage.setItem(KEY,JSON.stringify(values));syncLegacy(values);}
  catch(error){console.warn('Cannot persist Live AI preferences:',error);}
 };
 // Older modules still read individual keys; keep both formats coherent.
 try{syncLegacy(snapshot());}catch{}
 const tracked=new Set(ids);
 document.addEventListener('change',event=>{if(tracked.has(event.target?.id))save();},true);
 let activated=false;
 function activate(){
  if(activated)return;activated=true;
  const caption=$('liveCaptionToggle'),translate=$('liveTranslateToggle'),tts=$('liveTtsToggle');
  // Whisper is shared internally: a running translation never needs the
  // *visible* Live Caption checkbox. Keep the three saved toggle values.
  // Legacy stored speech=true, translate=false still needs translation enabled.
  if(tts?.checked&&translate&&!translate.checked)translate.checked=true;
  // Start only after all AI providers are configured, and only when a playable URL exists.
  if(translate?.checked||caption?.checked)(translate?.checked?translate:caption).dispatchEvent(new Event('change',{bubbles:true}));
  if(tts?.checked)tts.dispatchEvent(new Event('change',{bubbles:true}));
 }
 window.RustAiPreferences=Object.freeze({activate,save,storageKey:KEY});
})();
