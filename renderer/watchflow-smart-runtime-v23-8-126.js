'use strict';
/* Offline-capable on-device ONNX / Transformers.js Smart models.
 * User-initiated download only. Two verified multilingual INT8 118MB models.
 * Model assets cache in a dedicated per-model CacheStorage bucket and can be removed.
 */
(function(root,factory){const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVWatchFlowSmart=api;
})(typeof window==='undefined'?globalThis:window,function(){
 const prefix='openiptv-watchflow-smart-';
 const engines=new Map(),loading=new Map(),labelsCache=new Map();
 const catalog=()=>typeof window!=='undefined'?window.OpenIPTVWatchFlowModelCatalog:
  typeof require==='function'?require('./watchflow-model-catalog-v23-8-112.js'):null;
 const persistence=()=>typeof window!=='undefined'?window.OpenIPTVWatchFlowPersistence:
  typeof require==='function'?require('./watchflow-persistence-v23-8-124.js'):null;
 const supported=id=>{const model=catalog()?.getSmart(id);return model?.downloadable&&model?.modelRepo?model:null;};
 const cacheName=id=>prefix+String(id||'').replace(/[^a-z0-9-]/g,'');
 const descriptions=Object.freeze({
  'Tin tức':'Tin tức thời sự, bản tin trong nước và quốc tế, thông tin xã hội, truyền hình thời sự',
  'Thể thao':'Thể thao bóng đá, trận đấu, trực tiếp thi đấu, câu lạc bộ giải bóng đá',
  'Phim truyện':'Phim truyện điện ảnh, phim bộ, tập phim truyền hình, diễn viên kịch bản',
  'Thiếu nhi':'Chương trình thiếu nhi trẻ em, phim hoạt hình, giáo dục cho bé',
  'Giải trí':'Giải trí hài, trò chơi truyền hình, gameshow, người nổi tiếng',
  'Khoa học':'Khoa học công nghệ, khám phá không gian, vũ trụ và nghiên cứu',
  'Ẩm thực':'Ẩm thực món ăn, đầu bếp, nấu ăn, công thức và nhà hàng',
  'Du lịch':'Du lịch trải nghiệm, hành trình khám phá các điểm đến và văn hóa bản địa',
  'Văn hóa':'Văn hóa nghệ thuật, di sản dân tộc, phong tục truyền thống',
  'Âm nhạc':'Âm nhạc ca hát, biểu diễn, bài hát, nhạc sĩ và hòa nhạc',
  'Giáo dục':'Giáo dục học tập, ngoại ngữ, trường học và kiến thức',
  'Kinh tế':'Kinh tế tài chính, kinh doanh, thị trường chứng khoán và đầu tư',
  'Pháp luật':'Pháp luật an ninh, tội phạm, công an, cảnh sát và tòa án',
  'Địa phương':'Đài truyền hình địa phương, tin tức các tỉnh thành, thông tin vùng miền',
  'Tài liệu':'Phim tài liệu lịch sử, thiên nhiên, động vật, thế giới tự nhiên',
  'Phong cách sống':'Phong cách sống, gia đình, thời trang, sức khỏe và làm đẹp',
  'Truyền hình tổng hợp':'Kênh truyền hình tổng hợp đa dạng nội dung thời sự, văn hóa, thể thao và giải trí'
 });
 async function marker(win,id){try{return await persistence()?.read(win,'smart-model:'+id);}catch{return null;}}
 async function installed(win,id){
  const model=supported(id);
  if(!model||!win?.caches)return false;
  if(!(await marker(win,id)))return false;
  try{
   if(!await win.caches.has(cacheName(id)))return false;
   const requests=await (await win.caches.open(cacheName(id))).keys();
   // Transformers.js v3 can choose model_quantized.onnx, model_q8.onnx or
   // model.onnx depending on the repository; do not mistake a downloaded
   // and validated model for 'not installed' merely due to filename.
   return requests.some(request=>{
    const url=decodeURIComponent(String(request?.url||''));
    return url.includes(model.modelRepo)&&/\/onnx\/[^/?#]+\.onnx(?:[?#]|$)/i.test(url);
   });
  }catch{return false;}
 }
 async function inventory(win){
  const list=[];
  for(const item of catalog()?.SMART||[]){
   const ready=!!item.downloadable&&await installed(win,item.id);
   list.push({...item,installed:ready,estimatedBytes:ready?item.bytes:0});
  }
  return list;
 }
 async function factory(win,id,{remote=false,onProgress=()=>{}}={}){
  const model=supported(id);
  if(!model)throw Error('Mô hình này chưa có bộ chạy và trọng số đa ngôn ngữ được xác minh.');
  if(!win?.caches?.open)throw Error('Ứng dụng chưa hỗ trợ CacheStorage. Không thể bảo đảm tải mô hình dùng offline.');
  if(engines.has(id))return engines.get(id);
  if(loading.has(id))return loading.get(id);
  const task=(async()=>{
   const lib=await import('./vendor/transformers.min.js');
   if(typeof lib.pipeline!=='function'||!lib.env)throw Error('Thiếu Transformers.js cục bộ trong bộ cài.');
   const cache=await win.caches.open(cacheName(id));
   if(typeof cache?.match!=='function'||typeof cache?.put!=='function')
    throw Error('CacheStorage không hỗ trợ match/put để lưu model offline');
   lib.env.allowLocalModels=false;
   lib.env.allowRemoteModels=remote;
   lib.env.useBrowserCache=false;
   lib.env.useCustomCache=true;
   lib.env.customCache=cache;
   if(!lib.env.backends?.onnx?.wasm)
    throw Error('Bộ chạy ONNX WASM không có trong file Transformers.js đóng gói.');
   lib.env.backends.onnx.wasm.wasmPaths=new URL('vendor/',win.document?.baseURI||win.location.href).href;
   lib.env.backends.onnx.wasm.numThreads=1;
   const engine=await lib.pipeline('feature-extraction',model.modelRepo,{
    device:'wasm',dtype:'q8',
    progress_callback:event=>onProgress(event)
   });
   if(typeof engine!=='function')throw Error('Bộ suy luận mô hình không hợp lệ');
   const probe=await engine('Tin tức truyền hình',{pooling:'mean',normalize:true});
   if(!probe?.data?.length||!Array.from(probe.data).every(Number.isFinite))
    throw Error('Mô hình tải xuống nhưng kiểm thử suy luận không thành công');
   engines.set(id,engine);
   return engine;
  })();
  loading.set(id,task);
  try{return await task;}finally{loading.delete(id);}
 }
 async function install(win,id,onProgress=()=>{}){
  const model=supported(id);if(!model)throw Error('Chỉ E5 Small và Multilingual MiniLM đã có gói ONNX INT8 được xác minh.');
  if(!win?.caches?.open)throw Error('Không thể tải: WebView chưa hỗ trợ bộ nhớ CacheStorage.');
  const engine=await factory(win,id,{remote:true,onProgress});
  if(!engine)throw Error('Chưa thử được mô hình đã tải');
  const ok=await persistence()?.write(win,'smart-model:'+id,{
   id,repo:model.modelRepo,bytes:model.bytes,version:1,installedAt:Date.now()
  });
  if(!ok)throw Error('Mô hình chạy được nhưng không ghi được xác nhận cài đặt lâu dài; kiểm tra dung lượng ứng dụng.');
  return {installed:true,id,label:model.label,bytes:model.bytes};
 }
 async function remove(win,id){
  if(!supported(id))throw Error('Mô hình này chưa hỗ trợ cài đặt.');
  engines.delete(id);labelsCache.delete(id);
  if(!win?.caches?.delete)throw Error('Không thể xóa bộ nhớ mô hình trên thiết bị này.');
  await win.caches.delete(cacheName(id));
  const marked=await persistence()?.write(win,'smart-model:'+id,null);
  if(!marked)throw Error('Đã xóa cache model nhưng chưa thể cập nhật trạng thái lưu trữ.');
  return {removed:id};
 }
 async function vectors(win,id,texts){
  const pipe=await factory(win,id,{remote:false});
  const model=supported(id);
  const prepared=texts.map(value=>{
   const safe=String(value||'').replace(/https?:\/\/\S+/gi,'').slice(0,300);
   return id==='multilingual-e5-small-int8'?'query: '+safe:safe;
  });
  const output=await pipe(prepared,{pooling:'mean',normalize:true,truncation:true});
  const dims=output?.dims||[],last=dims.at(-1);
  if(!last||last<50||!output?.data||output.data.length<last*texts.length)
   throw Error('Kích thước vector ONNX không đúng');
  return prepared.map((_,i)=>Array.from(output.data.slice(i*last,(i+1)*last)));
 }
 const cosine=(a,b)=>{
  const length=Math.min(a.length,b.length);let dot=0,as=0,bs=0;
  for(let i=0;i<length;i++){dot+=a[i]*b[i];as+=a[i]*a[i];bs+=b[i]*b[i];}
  return dot/(Math.sqrt(as*bs)||1);
 };
 async function classify(win,id,text){
  if(!await installed(win,id))throw Error('Mô hình Smart chưa được tải. Nhấn Tải rồi thử lại.');
  let labels=labelsCache.get(id);
  if(!labels){
   const keys=Object.keys(descriptions);
   const embedding=await vectors(win,id,keys.map(k=>descriptions[k]));
   labels={keys,embedding};labelsCache.set(id,labels);
  }
  const [vector]=await vectors(win,id,[text]);
  const sorted=labels.keys.map((label,i)=>({label,score:cosine(vector,labels.embedding[i])}))
   .sort((a,b)=>b.score-a.score);
  const high=sorted[0]?.score||0;
  const selected=high>=0.25?sorted.filter(x=>x.score>=Math.max(0.25,high-0.045)).slice(0,3).map(x=>x.label):[];
  return {labels:selected,score:high,model:id,source:'Smart ONNX offline'};
 }
 return Object.freeze({supported,cacheName,marker,installed,inventory,install,remove,classify,cosine,descriptions});
});
