'use strict';
// Rust Lab v23.8: Electron v4.23.67 model catalog with actual native MLX backend.
(()=>{
 const $=id=>document.getElementById(id),api=window.streamleaf;
 const panel=$('liveCaptionSetupPanel'),gear=$('liveCaptionSetup');
 if(!panel||!gear||!api?.aiStorageStatus)return;
 const mk=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 panel.classList.add('rust-ai-unified');
 const top=mk('div','rust-ai-heading');
 const title=mk('div','');title.append(mk('h3','','Cài đặt AI trên thiết bị'),mk('p','','Nhận diện, dịch offline, giọng đọc và quản lý mô hình · Hy-MT2/Qwen3 dành cho Apple Silicon.'));
 top.append(title,mk('span','rust-ai-privacy','Chạy trên máy · chỉ tải khi dùng'));
 const close=mk('button','rust-ai-close','×');
 close.type='button';close.setAttribute('aria-label','Đóng cài đặt AI');
 close.title='Đóng cài đặt AI';
 close.addEventListener('click',()=>{
  panel.hidden=true;
  gear.setAttribute('aria-expanded','false');
  gear.focus();
 });
 top.append(close);
 panel.prepend(top);
 const grid=mk('div','rust-ai-grid'),recognition=mk('section','rust-ai-card rust-ai-recognition');
 const translation=mk('section','rust-ai-card'),voice=mk('section','rust-ai-card'),storage=mk('section','rust-ai-card rust-ai-storage');
 const header=(section,index,name)=>{const row=mk('div','rust-ai-card-heading');row.append(mk('span','rust-ai-index',index),mk('h4','',name));section.append(row);};
 header(recognition,'01','Nhận diện giọng nói · Whisper');
 header(translation,'02','Live Translate · Bộ dịch offline');
 header(voice,'03','TTS · Giọng đọc và thử giọng');
 header(storage,'04','Bộ nhớ AI đã tải');
 const recognitionButtons=mk('div','rust-ai-actions');
 for(const id of ['captionAutoInstall','captionChooseBinary','captionChooseModel']){const node=$(id);if(node)recognitionButtons.append(node);}
 recognition.append(recognitionButtons,mk('p','rust-ai-muted','Bật Live Caption hoặc Live Translate sẽ tự thiết lập Whisper khi chưa có. Dùng GGML đa ngôn ngữ; lần đầu cần kết nối mạng.'));
 const modelDefs=[
  ['hymt18','Hy-MT2 1.8B · nhanh (4-bit)'],
  ['hymt7','Hy-MT2 7B · chất lượng cao (4-bit)'],
  ['hymt18q8','Hy-MT2 1.8B · 8-bit'],
  ['hymt7q8','Hy-MT2 7B · 8-bit (RAM lớn)'],
  ['qwen06','Qwen3 0.6B · siêu nhẹ'],
  ['qwen17','Qwen3 1.7B · cân bằng'],
  ['qwen4','Qwen3 4B · đa năng'],
  ['qwen8','Qwen3 8B · nâng cao']];
 const modelKeys=new Set(modelDefs.map(x=>x[0]));
 const engineField=mk('div','rust-ai-field');
 const engineLabel=mk('label','','Bộ dịch mặc định');engineLabel.htmlFor='rustTranslationEngine';
 const engine=mk('select','');engine.id='rustTranslationEngine';
 for(const [value,label] of [['auto','Tự động · dùng mô hình đã cài'],['argos','Argos · nhẹ, tiết kiệm CPU'],...modelDefs]){
  const option=mk('option','',label);option.value=value;engine.append(option);
 }
 try{const saved=localStorage.getItem('rustlab:ai-translate-engine');if([...engine.options].some(o=>o.value===saved))engine.value=saved;}catch{}
 engineField.append(engineLabel,engine);translation.append(engineField);
 const modeField=mk('div','rust-ai-field'),modeLabel=mk('label','','Ưu tiên tài nguyên khi chọn Tự động');
 modeLabel.htmlFor='rustAiResourceMode';
 const mode=mk('select','');mode.id='rustAiResourceMode';
 for(const [value,label] of [['balanced','Cân bằng · Hy-MT2 1.8B khi đã tải'],['saver','Tiết kiệm · ưu tiên mô hình nhỏ'],['quality','Chất lượng · ưu tiên mô hình lớn đã tải']]){
  const option=mk('option','',label);option.value=value;mode.append(option);
 }
 try{const saved=localStorage.getItem('rustlab:ai-resource-mode');if([...mode.options].some(o=>o.value===saved))mode.value=saved;}catch{}
 modeField.append(modeLabel,mode);translation.append(modeField);
 const settings=Object.freeze({getEngine:()=>engine.value||'auto',getMode:()=>mode.value||'balanced'});
 window.AISettings=settings;
 const notify=()=>{
  try{localStorage.setItem('rustlab:ai-translate-engine',engine.value);localStorage.setItem('rustlab:ai-resource-mode',mode.value);}catch{}
  window.dispatchEvent(new Event('rustlab:ai-settings-changed'));
  void inspectRoute();
 };
 engine.addEventListener('change',notify);mode.addEventListener('change',notify);
 const route=mk('p','rust-ai-muted','Đang kiểm tra tuyến dịch đã cài…');route.id='rustAiRouteStatus';
 translation.append(route);
 const autoRow=mk('label','rust-ai-checkbox');
 const automatic=mk('input','');automatic.type='checkbox';automatic.id='autoInstallTranslation';
 try{automatic.checked=localStorage.getItem('rustlab:ai-auto-install-translation')!=='false';}catch{automatic.checked=true;}
 autoRow.append(automatic,document.createTextNode(' Tự cài cặp Argos khi bắt đầu dịch (tải mạng lần đầu)'));
 automatic.addEventListener('change',()=>{try{localStorage.setItem('rustlab:ai-auto-install-translation',String(automatic.checked));}catch{}});
 translation.append(autoRow);
 const translationButtons=mk('div','rust-ai-actions');
 for(const id of ['captionTranslationInstall','captionTestTranslate']){const node=$(id);if(node)translationButtons.append(node);}
 const installSelected=mk('button','rust-ai-action rust-ai-install-selected','Tải / sửa mô hình đang chọn');
 installSelected.type='button';
 installSelected.title='Tải đúng mô hình Hy-MT2/Qwen3 đã chọn hoặc cài bộ dịch Argos khi chọn Tự động';
 installSelected.addEventListener('click',()=>{
  const key=modelKeys.has(engine.value)?engine.value:'argos';
  void installModel(key);
 });
 translationButtons.append(installSelected);
 translation.append(translationButtons);
 translation.append(mk('p','rust-ai-muted','Whisper xác định tiếng gốc. Argos dùng CPU, Hy-MT2/Qwen3 chạy MLX trên Mac Apple Silicon; tải mô hình một lần khi bấm cài, sau đó dịch offline. Nếu chọn Tự động, chỉ dùng mô hình đã cài.'));
 const voiceButtons=mk('div','rust-ai-actions');
 for(const id of ['liveTtsInstall','liveTtsVoicePreview']){const node=$(id);if(node)voiceButtons.append(node);}
 voice.append(voiceButtons,mk('p','rust-ai-muted','Piper (nhẹ) và VieNeu (giọng tự nhiên) được cài riêng. Tốc độ đọc và âm lượng gốc chỉnh trực tiếp ở hàng điều khiển phía trên.'));
 const total=mk('div','rust-ai-storage-total','Đang đọc dung lượng AI…');
 const list=mk('div','rust-ai-storage-list');list.id='rustAiStorageList';
 const refreshButton=mk('button','rust-ai-action','Làm mới dung lượng');refreshButton.type='button';
 const details=mk('details','rust-ai-storage-details');
 details.append(mk('summary','','Xem mô hình đã tải và giải phóng dung lượng'),list);
 storage.append(total,details,refreshButton);
 grid.append(recognition,translation,voice,storage);panel.append(grid);
 const note=mk('p','rust-ai-status','Thư mục mô hình thuộc Rust Lab; không quét hay xóa tệp ngoài ứng dụng.');
 note.id='rustAiSettingsStatus';note.setAttribute('role','status');panel.append(note);
 const leftovers=[...panel.children].filter(e=>e!==top&&e!==grid&&e!==note);
 for(const child of leftovers){if(child.tagName==='SMALL'){child.remove();}else if(child!==top){child.remove();}}
 let refreshing=false,working=false,confirm='',confirmedAt=0,mlxAvailable=false,modelStates={};
 const say=(msg,error=false)=>{note.textContent=String(msg||'').slice(0,220);note.dataset.error=String(error);};
 const human=bytes=>bytes>1073741824?(bytes/1073741824).toFixed(2)+' GB':bytes>1048576?(bytes/1048576).toFixed(1)+' MB':Math.ceil(bytes/1024)+' KB';
 const to=()=>$('liveTranslateTarget')?.value||'vi';
 const from=()=>{const s=$('liveCaptionStatus')?.dataset.sourceLanguage;return s&&s!==to()?s:(to()==='en'?'vi':'en');};
 async function inspectRoute(){
  if(!api.captionTranslationStatus)return;
  const chosen=engine.value;
  if(modelKeys.has(chosen)){
   const state=modelStates[chosen];
   route.textContent=!mlxAvailable?'MLX yêu cầu Mac Apple Silicon (ARM64)':
    !state?.installed?'Chưa tải '+(state?.label||chosen)+' · mở Bộ nhớ AI và bấm Tải mô hình':
    !state?.runtimeReady?'Cần sửa môi trường MLX · mở Bộ nhớ AI, nhấn Sửa bộ chạy':
    'Đang chọn '+(state.label||chosen)+' · chạy MLX offline trên Apple Silicon';
   return;
  }
  if(chosen==='auto'&&mlxAvailable&&modelDefs.some(d=>modelStates[d[0]]?.installed&&modelStates[d[0]]?.runtimeReady)){
   route.textContent='Tự động · ưu tiên MLX đã cài theo cấu hình, dự phòng Argos khi MLX lỗi';
   return;
  }
  try{
   const result=await api.captionTranslationStatus(to(),from());
   const name=to()==='en'?'English':$('liveTranslateTarget')?.selectedOptions?.[0]?.textContent||to();
   const routes={same:'cùng tiếng, không cần dịch',direct:'cặp trực tiếp đã cài',pivot:'dịch qua tiếng Anh',whisper:'dự phòng Whisper → English', 'needs-model':'thiếu cặp dịch'};
   route.textContent='Đích '+name+' · '+(routes[result.route]||result.reason||'chưa có mô hình')+(result.installed?' · offline đã cài':'');
  }catch(e){route.textContent='Chưa kiểm tra được: '+String(e.message||e).slice(0,90);}
 }
 function button(label,action){const b=mk('button','rust-ai-action',label);b.type='button';b.addEventListener('click',action);return b;}
 async function installModel(id){
  if(working)return;
  working=true;try{
   const lang=$('liveTtsLanguage')?.value||'vi';
   say('Đang cài '+id+'… lần đầu có thể cần tải mô hình và Python.');
   if(id==='whisper')await api.captionAutoInstall();
   else if(modelKeys.has(id)){
     if(!mlxAvailable)throw Error('MLX cần Mac Apple Silicon');
     const result=await api.aiInstallModel(id);
     if(!result?.models?.[id]?.installed)throw Error('Mô hình vẫn chưa tải đủ');
    }
    else if(id==='argos'||id==='runtimes')await api.captionTranslationInstall(to(),from());
   else if(id==='piper')await api.ttsInstall(lang);
   else if(id==='vieneu'){
    const selected=$('liveTtsVoice')?.value||'vieneu:Hải Đăng';
    await api.ttsVoiceInstall(selected.startsWith('vieneu:')?selected:'vieneu:Hải Đăng');
   }
   say('Đã hoàn tất yêu cầu cài '+id+'; đang kiểm tra dữ liệu thật.');
   await refresh();await inspectRoute();
  }catch(e){say('Cài '+id+' thất bại: '+String(e.message||e).slice(0,150),true);}
  finally{working=false;}
 }
 async function remove(id,label){
  if(working)return;
  if(confirm!==id||Date.now()-confirmedAt>12000){
   confirm=id;confirmedAt=Date.now();
   say('Xóa '+label+'? Bấm lần nữa trong 12 giây. Chỉ xóa dữ liệu AI của Rust Lab; các ứng dụng khác không bị ảnh hưởng.');
   return;
  }
  confirm='';working=true;
  try{
   const result=await api.aiRemoveModel(id);
   say('Đã xóa '+label+', giải phóng khoảng '+human(result?.freed||0)+'. Các mô hình cần tải lại khi dùng.');
   await refresh();
  }catch(e){say('Không xóa được '+label+': '+String(e.message||e).slice(0,140),true);}
  finally{working=false;}
 }
 async function refresh(){
  if(refreshing)return;
  refreshing=true;refreshButton.disabled=true;
  try{
   const result=await api.aiStorageStatus(),items=Array.isArray(result?.storage)?result.storage:[];
   mlxAvailable=!!result.mlxAvailable;
   modelStates=result.models&&typeof result.models==='object'?result.models:{};
   for(const option of engine.options){
    if(modelKeys.has(option.value))option.disabled=!mlxAvailable;
   }
   if(modelKeys.has(engine.value)&&!mlxAvailable){engine.value='auto';notify();}
   list.replaceChildren();total.textContent='Dung lượng AI đã tải: '+human(Number(result.totalBytes)||0);
   for(const item of items){
    const row=mk('div','rust-ai-storage-item'),info=mk('div',''),ops=mk('div','rust-ai-actions');
    const isMlx=modelKeys.has(item.id),state=modelStates[item.id]||{};
    const installed=isMlx?!!state.installed:!!item.present;
    const details=isMlx?(state.installed?'Đã tải đủ':'Chưa tải hoặc tải dở')+
     ' · '+human(Number(item.bytes)||0)+(state.approxBytes?' / dự kiến '+human(state.approxBytes):'')+
     (!mlxAvailable?' · chỉ Mac Apple Silicon':state.installed&&!state.runtimeReady?' · cần sửa bộ chạy MLX':''):
     item.present?'Đã có dữ liệu · '+human(Number(item.bytes)||0):'Chưa tải';
    info.append(mk('strong','',item.label||item.id),mk('small','',details));
    if(isMlx){
     const guide=window.OpenIPTVHardwareAdvice?.forModel?.(item.id,result.hardware||{});
     if(guide?.summary)info.append(mk('small','',guide.summary));
    }
    row.append(info);
    if(isMlx){
     if(mlxAvailable&&(!installed||!state.runtimeReady))ops.append(button(installed?'Sửa bộ chạy MLX':item.present?'Tải tiếp':'Tải mô hình',()=>void installModel(item.id)));
    }else if(!item.present&&item.id!=='cache')ops.append(button('Cài',()=>void installModel(item.id)));
    if(item.present)ops.append(button('Xóa',()=>void remove(item.id,item.label)));
    row.append(ops);list.append(row);
   }
  await inspectRoute();
   }catch(e){say('Không đọc được dung lượng AI: '+String(e.message||e).slice(0,145),true);}
  finally{refreshing=false;refreshButton.disabled=false;}
 }
 // Engine changes are handled by notify(), which persists selection and restarts translation.
 refreshButton.addEventListener('click',()=>void refresh());
 $('liveTranslateTarget')?.addEventListener('change',()=>void inspectRoute());
 gear.addEventListener('click',()=>{if(!panel.hidden){void refresh();void inspectRoute();}});
 api.captionOnEvent?.(e=>{if(e?.type==='setup-progress'&&e.message)say(e.message);if(e?.type==='needs-model')void inspectRoute();});
 api.ttsOnEvent?.(e=>{if(e?.type==='progress'&&e.message)say(e.message);});
  api.aiOnEvent?.(e=>{if(e?.type==='ai-progress'&&e.message)say(e.message);});
 void inspectRoute();void refresh();
})();