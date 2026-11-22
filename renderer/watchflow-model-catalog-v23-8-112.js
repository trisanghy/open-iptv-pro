'use strict';
/* WatchFlow model catalog. Catalog selection never implies an installed inference engine. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OpenIPTVWatchFlowModelCatalog=api;})(typeof window==='undefined'?globalThis:window,function(){
 const KEY='watchflow:smart-model-choice-v1',MAX_STANDARD_MB=20,MAX_SMART_MB=200;
 const STANDARD=Object.freeze([
 {id:'naive-bayes',label:'Naive Bayes',size:'Dưới 1 MB',active:true,advantage:'Phân loại EPG và tên kênh offline rất nhanh, không cần tải mô hình.'},
 {id:'fasttext-quantized',label:'fastText Quantized',size:'Mục tiêu khoảng 18 MB',active:false,advantage:'Phân loại EPG tiếng Việt nhanh trên CPU; chưa có trọng số .ftz xác thực.'}
 ]);
 const SMART=Object.freeze([
 {id:'tinybert-4l-int8',label:'TinyBERT 4L (INT8)',size:'Ước tính 15–60 MB',advantage:'Phân loại tiêu đề và mô tả EPG theo ngữ cảnh thay vì chỉ từ khóa.',note:'Cần phiên bản/tinh chỉnh tiếng Việt và bộ chạy tương thích.'},
 {id:'mobilebert-int8',label:'MobileBERT (INT8)',size:'Ước tính 25–110 MB',advantage:'Transformer tối ưu hiệu suất trên thiết bị, phù hợp phân loại liên tục.',note:'Bản gốc không chuyên tiếng Việt; cần huấn luyện và kiểm thử.'},
 {id:'multilingual-e5-small-int8',label:'Multilingual E5 Small (INT8)',size:'Ước tính 120–160 MB',advantage:'Embedding đa ngôn ngữ giúp tìm chương trình tương đồng về nội dung và ý nghĩa.',note:'Cần bộ tìm kiếm vector và runtime INT8 riêng.'},
 {id:'multilingual-minilm-int8',label:'Multilingual MiniLM (INT8)',size:'Ước tính 120–160 MB',advantage:'So khớp ngữ nghĩa để đề xuất kênh và chương trình cùng chủ đề.',note:'Cần xác nhận biến thể, tokenizer và hiệu quả EPG tiếng Việt.'},
 {id:'phobert-base-int8',label:'PhoBERT Base (INT8)',size:'Ước tính 135–200 MB, phải kiểm tra dưới 200 MB',advantage:'Tiền huấn luyện tiếng Việt, thích hợp phân tích chủ đề EPG tiếng Việt.',note:'Không dùng bản gốc. Chỉ cho chạy nếu tổng gói thực tế dưới 200 MB.'}
 ].map(Object.freeze));
 const getSmart=id=>SMART.find(x=>x.id===id)||null;
 const read=storage=>{try{const v=storage?.getItem(KEY);return getSmart(v)?v:SMART[0].id;}catch{return SMART[0].id;}};
 const save=(storage,id)=>{if(!getSmart(id))return false;try{storage?.setItem(KEY,id);return storage?.getItem(KEY)===id;}catch{return false;}};
 const verifiedSize=bytes=>Number.isFinite(bytes)&&bytes>0&&bytes<MAX_SMART_MB*1024*1024;
 const canActivate=(id,installed,bytes,runtimeReady)=>!!getSmart(id)&&installed===true&&runtimeReady===true&&verifiedSize(bytes);
 return Object.freeze({KEY,MAX_STANDARD_MB,MAX_SMART_MB,STANDARD,SMART,getSmart,read,save,verifiedSize,canActivate});
});
