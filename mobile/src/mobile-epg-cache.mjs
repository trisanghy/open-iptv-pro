// Large XMLTV cache is stored separately from playlist/settings localStorage.
// IndexedDB replacement is transactional: a failed write keeps the last good EPG.
const DB_NAME='openiptv-mobile-epg-cache-v2', STORE='guides';
function openDB(){
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined')return reject(Error('IndexedDB không khả dụng'));
  let request;
  try{request=indexedDB.open(DB_NAME,1);}catch(error){reject(error);return;}
  request.onupgradeneeded=()=>{
   if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||Error('Không mở được bộ nhớ EPG'));
  request.onblocked=()=>reject(Error('Bộ nhớ EPG bị khóa bởi cửa sổ khác'));
 });
}
async function encode(value){
 if(typeof CompressionStream!=='function'||typeof Blob!=='function'||typeof Response!=='function')return value;
 try{
  const stream=new Blob([JSON.stringify(value)]).stream().pipeThrough(new CompressionStream('gzip'));
  const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
  return bytes.length?{format:'gzip-json-v1',data:bytes,updatedAt:value.updatedAt}:value;
 }catch{return value;}
}
async function decode(value){
 if(value?.format!=='gzip-json-v1')return value;
 if(typeof DecompressionStream!=='function'||typeof Blob!=='function'||typeof Response!=='function')
  throw Error('Không thể giải nén EPG đã lưu');
 return JSON.parse(await new Response(new Blob([value.data]).stream()
  .pipeThrough(new DecompressionStream('gzip'))).text());
}
export async function saveMobileEPG(guide){
 if(!Array.isArray(guide?.items)||!guide.items.length)return false;
 const stored=await encode(guide),db=await openDB();
 try{
  await new Promise((resolve,reject)=>{
   let tx;
   try{tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(stored,'current');}
   catch(error){try{tx?.abort();}catch{}reject(error);return;}
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(tx.error||Error('Không thể lưu EPG'));
   tx.onabort=()=>reject(tx.error||Error('Bộ nhớ EPG từ chối ghi'));
  });
  return true;
 }finally{db.close();}
}
export async function loadMobileEPG(){
 const db=await openDB();let stored;
 try{
  stored=await new Promise((resolve,reject)=>{
   let tx,req;
   try{tx=db.transaction(STORE,'readonly');req=tx.objectStore(STORE).get('current');}
   catch(error){reject(error);return;}
   req.onsuccess=()=>resolve(req.result||null);
   req.onerror=()=>reject(req.error||Error('Không thể đọc EPG'));
   tx.onabort=()=>reject(tx.error||Error('Không thể đọc bộ nhớ EPG'));
  });
 }finally{db.close();}
 const guide=await decode(stored);
 return Array.isArray(guide?.items)&&guide.items.length?guide:null;
}
