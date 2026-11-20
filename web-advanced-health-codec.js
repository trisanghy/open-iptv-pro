'use strict';
/* Lossless, versioned encoding for diagnostic health records stored in Safari
 * localStorage. Event field names are stored once and values remain unchanged. */
(function(root,factory){
 const codec=factory();
 if(typeof module==='object'&&module.exports)module.exports=codec;
 if(root)root.OpenIPTVAdvancedHealthCodec=codec;
})(typeof window!=='undefined'?window:null,function(){
 const FORMAT='open-iptv-health-fields-v1';
 function pack(health){
  if(!health||typeof health!=='object')return health||{};
  if(health.__format===FORMAT)return health;
  const fields=[],indices=new Map(),groups=[],extra=Object.create(null);
  for(const [url,history] of Object.entries(health)){
   if(!Array.isArray(history)){extra[url]=history;continue;}
   groups.push([url,history.map(event=>{
    if(!event||typeof event!=='object'||Array.isArray(event))return {raw:event};
    const record=[];
    for(const [field,value] of Object.entries(event)){
     if(!indices.has(field)){indices.set(field,fields.length);fields.push(field);}
     record.push(indices.get(field),value);
    }
    return record;
   })]);
  }
  return {__format:FORMAT,fields,groups,extra};
 }
 function unpack(saved){
  if(!saved||saved.__format!==FORMAT)return saved||{};
  if(!Array.isArray(saved.fields)||!Array.isArray(saved.groups))return {};
  const health=Object.create(null);
  for(const [url,value] of Object.entries(saved.extra||{}))health[url]=value;
  for(const group of saved.groups){
   if(!Array.isArray(group)||group.length!==2||typeof group[0]!=='string'||!Array.isArray(group[1]))continue;
   health[group[0]]=group[1].map(entry=>{
    if(!Array.isArray(entry))return entry&&Object.prototype.hasOwnProperty.call(entry,'raw')?entry.raw:entry;
    const event={};
    for(let i=0;i+1<entry.length;i+=2){
     const field=saved.fields[entry[i]];
     if(typeof field==='string'&&field!=='__proto__')event[field]=entry[i+1];
    }
    return event;
   });
  }
  return health;
 }
 return Object.freeze({FORMAT,pack,unpack});
});
