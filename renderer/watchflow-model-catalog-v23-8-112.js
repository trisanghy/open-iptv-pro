'use strict';
/* WatchFlow model catalog. Catalog selection never implies an installed inference engine. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OpenIPTVWatchFlowModelCatalog=api;})(typeof window==='undefined'?globalThis:window,function(){
 const KEY='watchflow:smart-model-choice-v1',MAX_STANDARD_MB=20,MAX_SMART_MB=200;
 const STANDARD=Object.freeze([
 {id:'naive-bayes',label:'Naive Bayes',size:'Dưới 1 MB',active:true,advantage:'Phân loại EPG và tên kênh offline rất nhanh, không cần tải mô hình.'},
 {id:'fasttext-quantized',label:'fastText Quantized',size:'Mục tiêu khoảng 18 MB',active:false,advantage:'Phân loại EPG tiếng Việt nhanh trên CPU; chưa có trọng số .ftz xác thực.'}
 ]);
 const SMART=Object.freeze([
 {id:'multilingual-e5-small-int8',label:'Multilingual E5 Small (INT8)',size:'118 MB + tokenizer',modelRepo:'Xenova/multilingual-e5-small',bytes:118000000,downloadable:true,advantage:'Embedding đa ngôn ngữ: phân tích tiêu đề, mô tả EPG tiếng Việt và nhóm kênh theo ngữ nghĩa.',note:'ONNX INT8 đã được xác minh trên Hugging Face; chạy trực tiếp trong ứng dụng bằng WASM.'},
 {id:'multilingual-minilm-int8',label:'Multilingual MiniLM (INT8)',size:'118 MB + tokenizer',modelRepo:'Xenova/paraphrase-multilingual-MiniLM-L12-v2',bytes:118000000,downloadable:true,advantage:'Biểu diễn ngữ nghĩa đa ngôn ngữ để nhận diện chủ đề và gợi ý chương trình tương tự.',note:'ONNX INT8 đã được xác minh; phù hợp tiếng Việt hơn MiniLM chỉ được huấn luyện tiếng Anh.'},
 {id:'tinybert-4l-int8',label:'TinyBERT 4L (INT8)',size:'Dự kiến 15–60 MB',downloadable:false,advantage:'Transformer rất nhỏ cho phân loại ngữ cảnh ngắn với độ trễ thấp trên CPU.',note:'Chưa có trọng số được xác minh phù hợp tiếng Việt: chưa thể tải hoặc chạy.'},
 {id:'mobilebert-int8',label:'MobileBERT (INT8)',size:'Dự kiến 25–110 MB',downloadable:false,advantage:'Transformer tối ưu cho thiết bị nhẹ, phù hợp phân loại EPG liên tục.',note:'Bản tiếng Anh không đủ phù hợp; chưa tìm được gói tiếng Việt tương thích.'},
 {id:'phobert-base-int8',label:'PhoBERT Base (INT8)',size:'Dự kiến 135–200 MB',downloadable:false,advantage:'Tiền huấn luyện tiếng Việt, thích hợp xác định chủ đề kênh và chương trình.',note:'Chưa xác minh gói ONNX/tokenizer dưới 200 MB; chưa cho tải để tránh sai dung lượng.'}
 ].map(Object.freeze));
 const getSmart=id=>SMART.find(x=>x.id===id)||null;
 const read=storage=>{try{const v=storage?.getItem(KEY);return getSmart(v)?v:SMART[0].id;}catch{return SMART[0].id;}};
 const save=(storage,id)=>{if(!getSmart(id))return false;try{storage?.setItem(KEY,id);return storage?.getItem(KEY)===id;}catch{return false;}};
 const verifiedSize=bytes=>Number.isFinite(bytes)&&bytes>0&&bytes<MAX_SMART_MB*1024*1024;
 const canActivate=(id,installed,bytes,runtimeReady)=>!!getSmart(id)?.downloadable&&installed===true&&runtimeReady===true&&verifiedSize(bytes);
 return Object.freeze({KEY,MAX_STANDARD_MB,MAX_SMART_MB,STANDARD,SMART,getSmart,read,save,verifiedSize,canActivate});
});
