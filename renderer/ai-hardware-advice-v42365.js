'use strict';
/**
 * Display-only, conservative resource *suggestions*, not official minimum specs.
 * Real performance depends on the exact models, concurrent live caption/translate/TTS,
 * available (not merely installed) RAM, system swap and playback workload.
 * No downloads, telemetry or arbitrary model lookup.
 */
(function(root,make){
 const api=make();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root&&root.document)root.OpenIPTVHardwareAdvice=api;
})(typeof window!=='undefined'?window:null,function(){
 const catalog=Object.freeze({
  whisper:{ram:8,compute:'CPU đa nhân / Apple Silicon',disk:'0,5–2 GB',use:'Nhận diện giọng nói; mô hình lớn có thể cần nhiều RAM hơn.'},
  argos:{ram:4,compute:'CPU, không bắt buộc GPU',disk:'1–2 GB',use:'Dịch offline nhẹ; bộ ngôn ngữ cài thêm sẽ tăng dung lượng.'},
  piper:{ram:4,compute:'CPU, không bắt buộc GPU',disk:'0,3–1 GB',use:'Giọng đọc nhẹ; thích hợp phụ đề cần phản hồi nhanh.'},
  vieneu:{ram:8,compute:'CPU / Apple Silicon',disk:'2–4 GB',use:'Giọng 48 kHz; đọc đồng thời với Whisper có thể dùng thêm RAM.'},
  vietvoice:{ram:8,compute:'CPU + ONNX Runtime',disk:'3–5 GB',use:'Giọng vùng miền; bản cài gồm trọng số và Python riêng.'},
  f5vi:{ram:16,compute:'Apple Silicon / GPU nên có; CPU thường chậm',disk:'4–8 GB',use:'Nhân bản giọng với WAV được phép sử dụng; checkpoint chỉ phi thương mại.'},
  hymt18:{ram:12,compute:'Mac Apple Silicon · GPU bộ nhớ hợp nhất (MLX)',disk:'2–3 GB',use:'4-bit · dịch chuyên dụng, cân bằng tốc độ và chất lượng.',mlx:true},
  hymt18q8:{ram:16,compute:'Mac Apple Silicon · GPU bộ nhớ hợp nhất (MLX)',disk:'3–4 GB',use:'8-bit · cần nhiều RAM hơn bản 1.8B 4-bit.',mlx:true},
  hymt7:{ram:24,compute:'Mac Apple Silicon · GPU bộ nhớ hợp nhất (MLX)',disk:'7–10 GB',use:'7B 4-bit · ưu tiên chất lượng, cần RAM dự phòng.',mlx:true},
  hymt7q8:{ram:32,compute:'Mac Apple Silicon · GPU bộ nhớ hợp nhất (MLX)',disk:'12–16 GB',use:'7B 8-bit · cấu hình cao; không phù hợp máy ít RAM.',mlx:true},
  qwen06:{ram:8,compute:'Mac Apple Silicon · MLX',disk:'1–2 GB',use:'0.6B 4-bit · siêu nhẹ, phù hợp tác vụ đơn giản.',mlx:true},
  qwen17:{ram:12,compute:'Mac Apple Silicon · MLX',disk:'2–3 GB',use:'1.7B 4-bit · lựa chọn cân bằng.',mlx:true},
  qwen4:{ram:16,compute:'Mac Apple Silicon · MLX',disk:'4–6 GB',use:'4B 4-bit · mạnh hơn nhưng dùng nhiều bộ nhớ hơn.',mlx:true},
  qwen8:{ram:24,compute:'Mac Apple Silicon · MLX',disk:'7–10 GB',use:'8B 4-bit · hợp tác vụ phức tạp trên máy RAM lớn.',mlx:true},
  f5sample:{aux:'Mẫu WAV và lời thoại đã được phép sử dụng; không có yêu cầu RAM riêng.',disk:'Tùy file WAV'},
  cache:{aux:'Bộ đệm của các mô hình; không tự chạy AI và không yêu cầu phần cứng riêng.',disk:'Tùy lần tải'},
  runtimes:{aux:'Môi trường Python/MLX hỗ trợ mô hình đã cài; không phải mô hình AI riêng.',disk:'Tùy thư viện'}
 });
 function forModel(id,hw={}){
  if(!Object.hasOwn(catalog,id))return null;
  const spec=catalog[id];
  if(spec.aux)return {id,kind:'aux',summary:spec.aux,detail:'Dung lượng lưu trữ: '+spec.disk,fit:''};
  const ram=Number(hw.ramGB);
  const knownRAM=Number.isFinite(ram)&&ram>0&&ram<2048;
  const macSilicon=hw.platform==='darwin'&&hw.arch==='arm64';
  let fit='Chưa đọc được RAM máy để đối chiếu.';
  if(spec.mlx&&!macSilicon)fit=hw.platform&&hw.arch?'Không hỗ trợ MLX trên thiết bị này.':'Cần Mac Apple Silicon để sử dụng MLX.';
  else if(knownRAM)fit=ram+0.5>=spec.ram?'RAM máy đạt mức gợi ý (không đảm bảo tốc độ).':'RAM máy thấp hơn mức gợi ý; có thể chậm hoặc thiếu bộ nhớ.';
  return {
   id,kind:'model',recommendedRAM:spec.ram,requiresMLX:!!spec.mlx,
   summary:'RAM gợi ý ≥ '+spec.ram+' GB · '+spec.compute,
   detail:'Ổ trống gợi ý: '+spec.disk+' · '+spec.use,
   fit
  };
 }
 function hardwareLabel(hw={}){
  const ram=Number(hw.ramGB);
  const ramText=Number.isFinite(ram)&&ram>0&&ram<2048?Math.round(ram)+' GB RAM':'Chưa xác định RAM';
  const machine=hw.platform==='darwin'?(hw.arch==='arm64'?'Mac Apple Silicon':'Mac Intel'):
   hw.platform==='win32'?'Windows':hw.platform==='linux'?'Linux':'Thiết bị chưa xác định';
  return machine+' · '+ramText;
 }
 return Object.freeze({catalog,forModel,hardwareLabel});
});
