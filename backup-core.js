/* Portable Open IPTV Pro v4.22 backups. No third-party libraries or cloud upload. */
'use strict';
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVBackup=api;
})(typeof window!=='undefined'?window:null,function(){
 const FORMAT='open-iptv-pro-backup';
 const SCHEMA=1;
 const MAX_BYTES=32*1024*1024;
 const KEYS=Object.freeze([
  'open-iptv-pro-4',              // sources, channels, folders, favorites, snapshots metadata
  'streamleaf-3',                 // old installation fallback, if present
  'open-iptv-pro-settings-v1',   // theme, EPG sources, automatic update preferences
  'open-iptv-pro-advanced-v1',   // profiles, PIN, parental rules, failover, reminders
  'open-iptv-doctor-v2-settings',
  'open-iptv-doctor-v2-undo',
  'open-iptv-pro-language',
  'open-iptv-pro-epg-v1'         // optional cache (large, can be downloaded again)
 ]);
 const SKIP_EPG='open-iptv-pro-epg-v1';
 const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
 const size=text=>new TextEncoder().encode(text).byteLength;
 function cleanObject(value){return value&&typeof value==='object'&&!Array.isArray(value);}
 function validateStored(key,value){
  if(typeof value!=='string')throw Error('Giá trị backup phải là chuỗi: '+key);
  if(value.length>MAX_BYTES)throw Error('Dữ liệu quá lớn: '+key);
  if(key==='open-iptv-pro-language'){
   if(!['vi','en','es','pt-BR','zh-CN','th','lo','km'].includes(value))throw Error('Ngôn ngữ không hợp lệ');
   return;
  }
  let obj;try{obj=JSON.parse(value)}catch{throw Error('Dữ liệu JSON bị hỏng: '+key)}
  if(!cleanObject(obj))throw Error('Cấu trúc dữ liệu không hợp lệ: '+key);
  if(key==='open-iptv-pro-4'||key==='streamleaf-3'){
   for(const k of ['sources','channels','favorites','favoriteKeys','folders','groupOrder','collapsedGroups']){
    if(own(obj,k)&&(!Array.isArray(obj[k])||obj[k].length>150000))throw Error('Danh sách không hợp lệ: '+k);
   }
   if(Array.isArray(obj.sources)&&obj.sources.some(s=>!cleanObject(s)||s.id!==undefined&&typeof s.id!=='string'||s.name!==undefined&&typeof s.name!=='string'||s.type!==undefined&&!['url','file'].includes(s.type)))throw Error('Nguồn M3U không hợp lệ');
   if(Array.isArray(obj.channels)&&obj.channels.some(c=>!cleanObject(c)||c.id!==undefined&&typeof c.id!=='string'||c.sourceId!==undefined&&typeof c.sourceId!=='string'||c.url!==undefined&&typeof c.url!=='string'||c.name!==undefined&&typeof c.name!=='string'))throw Error('Dữ liệu kênh không hợp lệ');
   for(const k of ['favorites','favoriteKeys','folders','groupOrder','collapsedGroups']){
    if(Array.isArray(obj[k])&&obj[k].some(v=>typeof v!=='string'))throw Error('Phần tử danh sách không hợp lệ: '+k);
   }
   if(own(obj,'snapshots')&&!cleanObject(obj.snapshots))throw Error('Kho Snapshot không hợp lệ');
   if(cleanObject(obj.snapshots)&&Object.values(obj.snapshots).some(s=>!cleanObject(s)||typeof s.file!=='undefined'&&typeof s.file!=='string'||typeof s.data!=='undefined'&&typeof s.data!=='string'))throw Error('Thông tin Snapshot không hợp lệ');
  }
  if(key==='open-iptv-pro-advanced-v1'){
   if(own(obj,'profiles')&&(!Array.isArray(obj.profiles)||obj.profiles.length>100||obj.profiles.some(p=>!cleanObject(p)||typeof p.id!=='string'||typeof p.name!=='string'||typeof p.child!=='boolean')))throw Error('Hồ sơ không hợp lệ');
   if(own(obj,'reminders')&&(!Array.isArray(obj.reminders)||obj.reminders.length>100000||obj.reminders.some(r=>!cleanObject(r))))throw Error('Danh sách nhắc lịch không hợp lệ');
   if(own(obj,'alternates')&&!cleanObject(obj.alternates))throw Error('URL dự phòng không hợp lệ');
   if(cleanObject(obj.alternates)&&Object.values(obj.alternates).some(a=>!Array.isArray(a)||a.length>30||a.some(url=>typeof url!=='string')))throw Error('Các URL dự phòng không hợp lệ');
   if(own(obj,'pin')&&obj.pin!==null&&typeof obj.pin!=='string'&&(!cleanObject(obj.pin)||typeof obj.pin.salt!=='string'||typeof obj.pin.hash!=='string'))throw Error('Thông tin PIN không hợp lệ');
  }
 }
 function summary(entries,createdAt){
  const main=JSON.parse(entries['open-iptv-pro-4']||entries['streamleaf-3']||'{}');
  let advanced={};try{advanced=JSON.parse(entries['open-iptv-pro-advanced-v1']||'{}')}catch{}
  return {createdAt,keys:Object.keys(entries).length,sources:Array.isArray(main.sources)?main.sources.length:0,
    channels:Array.isArray(main.channels)?main.channels.length:0,
    favorites:Array.isArray(main.favorites)?main.favorites.length:0,
    folders:Array.isArray(main.folders)?main.folders.length:0,
    profiles:Array.isArray(advanced.profiles)?advanced.profiles.length:0,
    snapshotReferences:cleanObject(main.snapshots)?Object.keys(main.snapshots).length:0,
    epg:own(entries,SKIP_EPG)};
 }
 function create(storage,{includeEPG=true,appVersion='4.22.0'}={}){
  const entries=Object.create(null);
  for(const key of KEYS){
   if(!includeEPG&&key===SKIP_EPG)continue;
   const value=storage.getItem(key);
   if(value===null)continue;
   validateStored(key,value);entries[key]=value;
  }
  if(!Object.keys(entries).length)throw Error('Chưa có dữ liệu Open IPTV Pro để sao lưu');
  const createdAt=new Date().toISOString();
  const json=JSON.stringify({format:FORMAT,schemaVersion:SCHEMA,appVersion,createdAt,platform:'WebView',storage:entries});
  if(size(json)>MAX_BYTES)throw Error('Bản sao lưu vượt quá 32 MB. Bỏ chọn bộ nhớ EPG rồi thử lại.');
  return {content:json,summary:summary(entries,createdAt)};
 }
 function parse(content){
  if(typeof content!=='string'||size(content)>MAX_BYTES)throw Error('File backup quá lớn (tối đa 32 MB) hoặc không hợp lệ');
  let file;try{file=JSON.parse(content)}catch{throw Error('Không đọc được JSON backup')}
  if(!cleanObject(file)||file.format!==FORMAT||file.schemaVersion!==SCHEMA||!cleanObject(file.storage)){
   throw Error('Không phải file backup Open IPTV Pro được hỗ trợ');
  }
  if(typeof file.createdAt!=='string'||Number.isNaN(Date.parse(file.createdAt)))throw Error('Thiếu ngày sao lưu hợp lệ');
  const entries=Object.create(null);
  for(const [key,value] of Object.entries(file.storage)){
   if(!KEYS.includes(key))throw Error('File backup chứa khóa không được hỗ trợ: '+key);
   validateStored(key,value);entries[key]=value;
  }
  if(!Object.keys(entries).length)throw Error('File backup không có dữ liệu');
  return {entries,summary:summary(entries,file.createdAt),appVersion:typeof file.appVersion==='string'?file.appVersion:''};
 }
 function restore(storage,file,{replace=true}={}){
  // All validation happens before the first write; a failed write rolls the old data back.
  const parsed=typeof file==='string'?parse(file):parse(JSON.stringify(file));
  const old=Object.create(null);
  const touched=replace?KEYS:Object.keys(parsed.entries);
  for(const key of touched)old[key]=storage.getItem(key);
  try{
   for(const key of touched){
    if(own(parsed.entries,key))storage.setItem(key,parsed.entries[key]);
    else storage.removeItem(key);
   }
   for(const [key,value] of Object.entries(parsed.entries)){
    if(storage.getItem(key)!==value)throw Error('Không ghi được dữ liệu: '+key);
   }
  }catch(err){
   for(const key of touched){
    try{if(old[key]===null)storage.removeItem(key);else storage.setItem(key,old[key]);}catch{}
   }
   throw Error('Khôi phục thất bại, đã cố gắng trả lại dữ liệu cũ: '+(err.message||err));
  }
  return parsed.summary;
 }
 return Object.freeze({FORMAT,SCHEMA,MAX_BYTES,KEYS,create,parse,restore});
});
