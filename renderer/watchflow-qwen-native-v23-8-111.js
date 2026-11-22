'use strict';
/* Native Qwen3 inference; only reads channel name and current EPG, no stream URLs. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root?.document)api.mount(root);})(typeof window==='undefined'?null:window,function(){
 const labels=new Set(['Tin tức','Thể thao','Phim truyện','Thiếu nhi','Giải trí','Khoa học']);
 const compatible=k=>/^qwen(?:06|17|4|8)$/.test(String(k));
 const select=(key,models)=>compatible(key)&&models?.[key]?.installed&&models?.[key]?.runtimeReady?key:key==='auto'?['qwen06','qwen17','qwen4','qwen8'].find(k=>models?.[k]?.installed&&models?.[k]?.runtimeReady)||'':'';
 function metadata(ch,guide,lib){let title='';try{const item=lib?.current?.(guide,ch);title=String(item?.now?.title||item?.next?.title||'').slice(0,190);}catch{}return('Kênh: '+String(ch?.name||'').slice(0,100)+'\nNhóm: '+String(ch?.group||'').slice(0,100)+'\nEPG: '+title).slice(0,590);}
 function mount(win){const doc=win.document;let busy=false;
  function attach(){const panel=doc.getElementById('wfIntelligenceModels');if(!panel)return false;if(doc.getElementById('wfQwenClassify'))return true;
   const button=doc.createElement('button');button.id='wfQwenClassify';button.type='button';button.textContent='✧ Phân loại kênh bằng Qwen3 đã cài';
   const status=doc.createElement('small');status.id='wfQwenStatus';status.setAttribute('role','status');status.textContent='Chạy offline trên Mac Apple Silicon, không tải lại mô hình.';
   const results=doc.createElement('div');results.id='wfQwenResults';results.className='wf-list';panel.append(button,status,results);
   button.addEventListener('click',async()=>{if(busy)return;busy=true;button.disabled=true;results.replaceChildren();
    try{
     const native=win.streamleaf;if(!native?.aiModelStatus||!native?.aiClassifyChannel)throw Error('Chưa có backend MLX Qwen3 native');
     const inventory=await native.aiModelStatus(),chosen=doc.getElementById('wfModelSelect')?.value||'auto',model=select(chosen,inventory?.models);
     if(!model)throw Error('Chọn Qwen3 đã cài hoặc nhấn Tải mô hình; Hy-MT2 là bộ dịch, không phân loại.');
     const channels=(win.IPTVState?.getChannels?.()||[]).filter(ch=>ch?.id).slice(0,8);
     if(!channels.length)throw Error('Chưa có playlist/EPG kênh thật');
     const guide=win.IPTVExtras?.getGuide?.();let done=0;
     for(const ch of channels){
      status.textContent='Qwen3 '+model+' đang phân loại '+(done+1)+'/'+channels.length;
      const output=await native.aiClassifyChannel(model,metadata(ch,guide,win.IPTVGuide));
      const row=doc.createElement('div');row.className='wf-item';
      const name=doc.createElement('strong');name.textContent=String(ch.name||'Kênh').slice(0,120);
      const category=doc.createElement('small');category.textContent=labels.has(output?.label)?output.label:'Chưa phân loại';
      row.append(name,category);results.append(row);done++;
     }
     status.textContent='Đã phân loại '+done+' kênh thực bằng Qwen3 '+model+' (offline).';
    }catch(e){status.textContent='Chưa phân loại được: '+String(e?.message||e).slice(0,150);}
    finally{busy=false;button.disabled=false;}
   });return true;
  }
  if(!attach()){doc.addEventListener('openiptv:unified-ai-ready',attach);doc.addEventListener('openiptv:renderer-ready',attach);}return true;
 }
 return Object.freeze({compatible,select,metadata,mount});
});
