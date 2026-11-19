import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {guideSources,sanitizeGuideURL,matchGuideChannel,makeEPGCache} from './mobile-epg-auto.mjs';
import {saveMobileEPG,loadMobileEPG} from './mobile-epg-cache.mjs';
const native=Capacitor.isNativePlatform();
const $=s=>document.querySelector(s);
const elt=(tag,text,cls)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
export function installEPGAuto({getState,save,getText,parseDate,getSelectedChannel,notify,onGuide}){
  const state=getState();state.epgSources=guideSources(state.epgSources);
  state.epgCache=state.epgCache&&Array.isArray(state.epgCache.items)?state.epgCache:null;
  const show=(t)=>{const node=$('#epgStatus');if(node)node.textContent=t;};
  function render(){
    const root=$('#epgSourcesList');if(!root)return;
    root.replaceChildren();
    for(const source of state.epgSources){
      const row=elt('label',undefined,'epg-source-option');
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=source.enabled!==false;
      cb.onchange=()=>{source.enabled=cb.checked;save();};
      const data=elt('span',undefined,'epg-source-info');data.append(elt('strong',source.name||source.id),elt('small',source.url));
      row.append(cb,data);root.append(row);
    }
    if($('#epgAutoRefresh'))$('#epgAutoRefresh').checked=state.settings.autoRefreshEPG!==false;
    if($('#autoRefreshPlaylists'))$('#autoRefreshPlaylists').checked=state.settings.autoRefreshPlaylists!==false;
    if($('#autoResumeLast'))$('#autoResumeLast').checked=state.settings.autoResumeLast!==false;
    const c=state.epgCache;
    show(c?'Đã lưu '+c.items.length+' lịch · '+new Date(c.updatedAt).toLocaleString('vi-VN')+' · '+(c.sourceName||'XMLTV'):'Chưa tải được EPG; ứng dụng sẽ thử tải tự động');
    renderRows();
  }
  function renderRows(){
    const root=$('#epgResults');if(!root)return;
    root.replaceChildren();
    const channel=getSelectedChannel(),id=matchGuideChannel(state.epgCache,channel);
    const programmes=(state.epgCache?.items||[]).filter(p=>!id||p.channel===id).slice(0,100);
    if(!programmes.length){root.append(elt('p','Chưa có lịch cho kênh này. Thử nguồn khác hoặc kiểm tra tvg-id.','muted'));return;}
    for(const p of programmes){
      const row=elt('article',undefined,'epg-row');
      row.append(elt('small',p.channel+' · '+(parseDate(p.start)?.toLocaleString('vi-VN')||p.start)),elt('b',p.title));root.append(row);
    }
  }
  async function getGuideText(url){
    url=sanitizeGuideURL(url);
    if(!/\.gz(?:[?#]|$)/i.test(url)){
      const t=await getText(url,28000);
      if(t.length>35*1024*1024)throw Error('EPG vượt giới hạn 35MB');
      return t;
    }
    let bytes;
    if(native){
      const result=await CapacitorHttp.request({url,method:'GET',responseType:'arraybuffer',
        connectTimeout:16000,readTimeout:28000,headers:{Accept:'application/gzip,application/octet-stream,*/*'}});
      if(result.status<200||result.status>=300)throw Error('HTTP '+result.status);
      if(typeof result.data==='string'){const raw=atob(result.data);bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));}
      else if(Array.isArray(result.data))bytes=Uint8Array.from(result.data);
      else throw Error('Không nhận được dữ liệu EPG nén');
    }else{
      const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),28000);
      try{const res=await fetch(url,{signal:ctrl.signal});if(!res.ok)throw Error('HTTP '+res.status);bytes=new Uint8Array(await res.arrayBuffer());}
      finally{clearTimeout(timer);}
    }
    if(bytes.byteLength>12*1024*1024)throw Error('EPG nén vượt 12MB');
    if(bytes[0]===0x1f&&bytes[1]===0x8b){
      if(!('DecompressionStream' in window))throw Error('Máy không hỗ trợ giải nén EPG gzip');
      bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    }
    if(bytes.byteLength>35*1024*1024)throw Error('XMLTV vượt 35MB');
    return new TextDecoder('utf-8').decode(bytes);
  }
  let downloading=false;
  async function persist(guide){
    try{return await saveMobileEPG(guide);}catch(e){console.warn('EPG IndexedDB',e);return false;}
  }
  async function restorePersistedEPG(){
    try{
      const stored=await loadMobileEPG();
      if(downloading)return;
      const local=state.epgCache;
      if(stored&&(!local||Date.parse(stored.updatedAt||'')>Date.parse(local.updatedAt||''))){
        state.epgCache=stored;state.epgCacheSavedToIDB=true;
        save();onGuide(stored);render();return;
      }
      if(local?.items?.length&&await persist(local)){
        state.epgCacheSavedToIDB=true;save();
      }
    }catch(e){console.warn('EPG restore',e);}
  }
  async function refresh(quiet=false){
    if(downloading)return false;
    downloading=true;
    try{
      const enabled=state.epgSources.filter(x=>x.enabled!==false);
      if(!enabled.length){if(!quiet)notify('Chưa chọn nguồn EPG','error');return false;}
      show('Đang cập nhật EPG từ '+enabled.length+' nguồn...');
      let lastError='';
      for(const source of enabled){
        try{
          const xml=await getGuideText(source.url);
          const guide=makeEPGCache(xml,parseDate,Date.now());
          if(!guide.items.length)throw Error('Không có chương trình trong khoảng thời gian hiện tại');
          const accepted={...guide,sourceName:source.name,sourceId:source.id};
          const persisted=await persist(accepted);
          state.epgCache=accepted;state.epgCacheSavedToIDB=persisted;
          state.epgUrl=source.url;
          save();onGuide(accepted);render();
          if(!persisted&&!quiet)notify('EPG đã tải nhưng chưa lưu được lâu dài; giữ trong phiên này','error');
          if(!quiet)notify('Đã tải '+guide.items.length+' lịch EPG từ '+source.name,'ok');
          return true;
        }catch(e){lastError=(e?.message||String(e));console.warn('XMLTV',source.name,lastError);}
      }
      show('Không tải được EPG mới; vẫn giữ lịch cũ. '+lastError);
      if(!quiet)notify('Không tải được nguồn EPG nào; giữ dữ liệu cũ','error');
      return false;
    }finally{downloading=false;}
  }
  function addCustom(){
    const field=$('#epgURL'),url=sanitizeGuideURL(field.value);
    if(state.epgSources.some(x=>x.url===url)){notify('Nguồn này đã có','ok');return;}
    state.epgSources.push({id:'custom-'+Date.now(),name:new URL(url).hostname,url,enabled:true});
    field.value='';save();render();notify('Đã thêm URL EPG','ok');
  }
  $('#epgAutoRefresh').onchange=e=>{state.settings.autoRefreshEPG=e.target.checked;save();};
  $('#autoRefreshPlaylists').onchange=e=>{state.settings.autoRefreshPlaylists=e.target.checked;save();};
  $('#autoResumeLast').onchange=e=>{state.settings.autoResumeLast=e.target.checked;save();};
  $('#addEPGSource').onclick=()=>{try{addCustom();}catch(e){notify(e.message,'error');}};
  render();void restorePersistedEPG();
  return {render,renderRows,refresh,addCustom};
}
