'use strict';
/* Independent, inline panel next to caption control. Never creates a second player. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(!root||!root.document)return;
 const doc=root.document;
 function init(){
  const row=doc.getElementById('captionThirdRow'),caption=doc.getElementById('unifiedAiToggle');
  if(!row||!caption||doc.getElementById('videoEnhanceToggle'))return;
  const trigger=doc.createElement('button');trigger.type='button';trigger.id='videoEnhanceToggle';trigger.className='video-enhance-toggle';
  trigger.textContent='✧ Nâng cao video bằng AI ⌄';trigger.setAttribute('aria-controls','videoEnhancePanel');trigger.setAttribute('aria-expanded','false');
  caption.insertAdjacentElement('afterend',trigger);
  const panel=doc.createElement('section');panel.id='videoEnhancePanel';panel.className='video-enhance-panel';panel.hidden=true;
  panel.innerHTML=[
   '<nav class="veh-nav" aria-label="Công cụ AI"><button type="button" data-target="veh-motion">⚙ Tổng quan</button>',
   '<button type="button" data-target="veh-motion">♧ Bù chuyển động</button><button type="button" data-target="veh-upscale">▧ Nâng độ phân giải</button>',
   '<button type="button" data-target="veh-bench">◴ Benchmark</button><button type="button" data-target="veh-safe">⚙ Tùy chọn</button></nav>',
   '<div class="veh-body"><div class="veh-grid">',
   '<div class="veh-card" id="veh-motion"><label><strong>◧ Bù chuyển động (Motion)</strong><input id="veh-motion-on" type="checkbox"></label>',
   '<small>Chỉ áp dụng khi pipeline thực được xác minh</small><span>FPS mục tiêu</span><select id="veh-fps"><option>60</option><option>90</option><option>120</option></select></div>',
   '<div class="veh-card" id="veh-upscale"><label><strong>▧ Nâng độ phân giải (AI)</strong><input id="veh-ai-on" type="checkbox"></label>',
   '<small>Yêu cầu AI model và backend GPU tương thích</small><span>Độ phân giải</span>',
   '<select id="veh-resolution"><option value="1080">1080p (FHD)</option><option value="1440">2K (1440p)</option><option value="2160">4K (2160p)</option></select></div></div>',
   '<div class="veh-ai-probe"><strong>Khả năng AI trên thiết bị</strong><span id="veh-ai-hw-status" role="status">Chưa kiểm tra phần cứng</span><button type="button" id="veh-ai-probe">Kiểm tra hỗ trợ AI</button></div>',
   '<div class="veh-bench" id="veh-bench"><strong>Benchmark & Tự chọn cấu hình</strong><button type="button" id="veh-run">▶ Chạy Benchmark</button>',
   '<button type="button" id="veh-auto">✧ Tự chọn cấu hình</button><button type="button" id="veh-apply">Áp dụng cho kênh này</button></div>',
   '<label class="veh-safe" id="veh-safe"><input type="checkbox" id="veh-downshift"> Tự giảm chất lượng khi quá tải</label>',
   '<p class="veh-limit">Bù chuyển động FFmpeg tối đa 720p; AI 1080p/2K/4K vẫn cần mô hình chuyên dụng và chưa hoạt động.</p><p id="veh-status" role="status" aria-live="polite">Chưa benchmark · Video nguyên bản</p></div>'
  ].join('');
  row.append(panel);
  const el=id=>doc.getElementById(id);let config=api.load(root.localStorage),result;
  const keys={motion:el('veh-motion-on'),upscale:el('veh-ai-on'),fps:el('veh-fps'),resolution:el('veh-resolution'),downshift:el('veh-downshift')};
  function render(){keys.motion.checked=config.motion;keys.upscale.checked=config.upscale;keys.fps.value=config.fps;keys.resolution.value=config.resolution;keys.downshift.checked=config.downshift;}
  function status(s){el('veh-status').textContent=s;}
  function persist(){config=api.normalize({motion:keys.motion.checked,upscale:keys.upscale.checked,fps:Number(keys.fps.value),resolution:Number(keys.resolution.value),downshift:keys.downshift.checked});api.save(root.localStorage,config);status('Đã lưu lựa chọn; chưa áp dụng bộ lọc lên video khi backend AI chưa sẵn sàng.');}
  Object.values(keys).forEach(x=>x.addEventListener('change',persist));render();
  trigger.addEventListener('click',()=>{
    const open=panel.hidden;
    // Only one expanded tool section at a time; keep the player compact.
    if(open && caption.getAttribute('aria-expanded')==='true')caption.click();
    panel.hidden=!open;
    trigger.setAttribute('aria-expanded',String(open));
  });
  caption.addEventListener('click',()=>{
    if(!panel.hidden){panel.hidden=true;trigger.setAttribute('aria-expanded','false');}
  });
  doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus();}});
  panel.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>el(b.dataset.target)?.scrollIntoView({block:'nearest',behavior:'smooth'})));
  let probed=false;
  async function probeAI(){
    const target=el('veh-ai-hw-status');
    if(!root.streamleaf?.videoAiCapabilities){
      target.textContent='Không có backend kiểm tra AI; video gốc được giữ nguyên.';
      return;
    }
    target.textContent='Đang kiểm tra VideoToolbox / GPU...';
    try{
      const info=await root.streamleaf.videoAiCapabilities();
      probed=true;
      if(info?.nativeAvailable){
        target.textContent='Phần cứng hỗ trợ VideoToolbox ML, nhưng Rust Lab chưa nối AI lên luồng phát.';
      }else{
        target.textContent='Chưa có backend AI được xác minh trên '+String(info?.platform||'thiết bị này')+'.';
      }
    }catch(e){target.textContent='Không kiểm tra được AI: '+String(e?.message||e).slice(0,100);}
  }
  el('veh-ai-probe').addEventListener('click',probeAI);
  // Never automatically download models or report 4K inference without an engine.
  trigger.addEventListener('click',()=>{if(!panel.hidden&&!probed)void probeAI();});
  el('veh-run').addEventListener('click',async()=>{const b=el('veh-run');if(!root.streamleaf?.videoEnhanceBenchmark){status('Không có backend benchmark.');return;}b.disabled=true;status('Đang benchmark FFmpeg cục bộ (không phải AI)...');try{result=await root.streamleaf.videoEnhanceBenchmark();status(api.summary(result));}catch(e){status('Lỗi benchmark: '+String(e?.message||e).slice(0,120));}finally{b.disabled=false;}});
  el('veh-auto').addEventListener('click',()=>{if(!result){status('Cần chạy benchmark trước.');return;}const fps=api.recommend(result);if(fps===null){status('Máy chưa đạt kiểm tra sơ bộ; giữ video gốc.');return;}config={...config,fps,motion:true,upscale:false};render();api.save(root.localStorage,config);status('Đã chọn '+fps+' FPS theo benchmark. Nhấn Áp dụng cho kênh này để thử; AI upscale chưa khả dụng.');});
  el('veh-apply').addEventListener('click',()=>{
    const state=root.IPTVState, current=state?.getCurrent?.();
    if(!current){status('Hãy chọn kênh LIVE trước khi áp dụng.');return;}
    if(state.getPlayMode?.()!=='live'){status('Bù chuyển động hiện chỉ hỗ trợ kênh trực tiếp.');return;}
    status('Đang chuyển kênh để áp dụng cấu hình; nếu quá tải sẽ trở về video gốc…');
    Promise.resolve(state.playChannel(current.id)).catch(e=>status('Không áp dụng được: '+String(e?.message||e).slice(0,100)));
  });
  root.OpenIPTVVideoEnhancement={
    getSettings:()=>({...config}),getBenchmark:()=>result,severeDrop:api.severeDrop,
    setPlaybackState:({active,error,fps}={})=>{
      if(error)status(error);
      else if(active)status('Đang chạy FFmpeg nội suy '+fps+' FPS · tối đa 720p · AI upscale chưa hoạt động.');
      else status('Video nguyên bản · AI upscale chưa có backend được xác minh.');
    }
  };
 }
 // DOMContentLoaded may precede creation of #unifiedAiToggle: that button
 // is added only when app-entry dispatches openiptv:renderer-ready.
 // Retry when both module lifecycles finish instead of silently returning.
 doc.addEventListener('openiptv:renderer-ready',init);
 doc.addEventListener('openiptv:unified-ai-ready',init);
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof window!=='undefined'?window:null,function(){
 const key='rustlab:video-enhance-v1',defaults=Object.freeze({motion:false,upscale:false,fps:60,resolution:1080,downshift:true});
 function normalize(v){v=v&&typeof v==='object'?v:{};return {motion:v.motion===true,upscale:v.upscale===true,fps:[60,90,120].includes(v.fps)?v.fps:60,resolution:[1080,1440,2160].includes(v.resolution)?v.resolution:1080,downshift:v.downshift!==false};}
 function load(s){try{return normalize(JSON.parse(s.getItem(key)||'{}'));}catch{return {...defaults};}}
 function save(s,v){try{s.setItem(key,JSON.stringify(normalize(v)));return true;}catch{return false;}}
 function recommend(r){const a=Array.isArray(r?.motion)?r.motion:[];const o=a.filter(x=>[60,90,120].includes(x.targetFps)&&x.ok===true&&Number.isFinite(x.processingFps)&&x.processingFps>=x.targetFps*1.3);return o.length?Math.max(...o.map(x=>x.targetFps)):null;}
 function summary(r){return Array.isArray(r?.motion)?'Kết quả nội suy (đầu ra tối đa 720p): '+r.motion.map(x=>x.targetFps+' FPS: '+(x.ok?Math.round(x.processingFps)+' fps xử lý':'lỗi')).join(' · ')+'. AI upscaling chưa được đo.':'Kết quả không hợp lệ';}
 function severeDrop(total,dropped){return Number.isFinite(total)&&Number.isFinite(dropped)&&total>=45&&dropped>=18&&dropped/total>=0.24;}
 return {key,defaults,normalize,load,save,recommend,summary,severeDrop};
});