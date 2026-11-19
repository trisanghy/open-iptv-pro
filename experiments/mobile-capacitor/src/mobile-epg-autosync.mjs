import {Capacitor,CapacitorHttp} from '@capacitor/core';
import {guideSources,sanitizeGuideURL,matchGuideChannel,makeEPGCache,guideCoverage,epgKey} from './mobile-epg-auto.mjs';
const native=Capacitor.isNativePlatform();
const $=s=>document.querySelector(s);
const t=key=>window.OpenIPTVI18n?.t?.(key)||key;
const language=()=>window.OpenIPTVI18n?.getLanguage?.()||'vi';
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
    show(c?t('Đã tải')+' '+c.items.length+' EPG · '+new Date(c.updatedAt).toLocaleString(language())+' · '+(c.sourceName||'XMLTV'):t('Chưa tải được EPG; ứng dụng sẽ thử tải tự động'));
    renderRows();
  }
  function renderRows(){
    const root=$('#epgResults');if(!root)return;
    root.replaceChildren();
    const channel=getSelectedChannel(),matched=matchGuideChannel(state.epgCache,channel);
    const manual=($('#epgChannel')?.value||'').trim();
    const override=manual && (state.epgCache?.aliases?.[epgKey(manual)] || (state.epgCache?.items||[]).find(p=>p.channel===manual)?.channel);
    const id=override||matched;
    const now=Date.now();
    const programmes=(state.epgCache?.items||[])
      .filter(p=>(!channel&&!manual||id&&p.channel===id)&&(parseDate(p.stop)?.getTime()||0)>now-3*3600000)
      .sort((a,b)=>(parseDate(a.start)?.getTime()||0)-(parseDate(b.start)?.getTime()||0))
      .slice(0,100);
    if(!programmes.length){root.append(elt('p',t(!state.epgCache?'Chưa tải được EPG. Nhấn Tải EPG ngay để thử các nguồn khác.':!id&&channel?'Không tìm thấy tên hoặc tvg-id của kênh trong lịch EPG.':'Chưa có lịch hiện tại hoặc sắp tới của kênh này. Thử nguồn khác.'),'muted'));return;}
    for(const p of programmes){
      const row=elt('article',undefined,'epg-row');
      row.append(elt('small',p.channel+' · '+(parseDate(p.start)?.toLocaleString(language())||p.start)),elt('b',p.title));root.append(row);
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
      else if(result.data instanceof ArrayBuffer)bytes=new Uint8Array(result.data);
      else if(result.data?.data && Array.isArray(result.data.data))bytes=Uint8Array.from(result.data.data);
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
  async function refresh(quiet=false){
    if(downloading)return false;
    downloading=true;
    try{
      const enabled=state.epgSources.filter(x=>x.enabled!==false);
      if(!enabled.length){if(!quiet)notify('Chưa chọn nguồn EPG','error');return false;}
      show(t('Đang cập nhật EPG từ')+' '+enabled.length+' '+t('nguồn')+'…');
      let lastError='',candidate=null;
      const current=getSelectedChannel();
      for(const source of enabled){
        try{
          const xml=await getGuideText(source.url);
          const guide=makeEPGCache(xml,parseDate,Date.now(),5000);
          const coverage=guideCoverage(guide,Date.now(),parseDate);
          if(!coverage.usable)throw Error('EPG đã quá hạn; không có chương trình hiện tại hoặc sắp tới');
          const id=matchGuideChannel(guide,current);
          const currentMatch=!current || !!id && guide.items.some(p=>p.channel===id && (parseDate(p.stop)?.getTime()||0)>Date.now());
          const accepted={...guide,sourceName:source.name,sourceId:source.id};
          if(!currentMatch){candidate??={cache:accepted,url:source.url};continue;}
          state.epgCache=accepted;state.epgUrl=source.url;
          save();onGuide(accepted);render();
          if(!quiet)notify(t('Đã tải')+' '+guide.items.length+' '+t('lịch EPG từ')+' '+source.name,'ok');
          return true;
        }catch(e){lastError=(e?.message||String(e));console.warn('XMLTV',source.name,lastError);}
      }
      if(candidate){
        state.epgCache=candidate.cache;state.epgUrl=candidate.url;
        save();onGuide(candidate.cache);render();
        show(t('Đã tải lịch EPG nhưng chưa khớp kênh đang chọn; thử chọn tvg-id khác.'));
        if(!quiet)notify('EPG đã tải, nhưng chưa khớp kênh đang chọn.','ok');
        return true;
      }
      show(t('Không tải được EPG mới; vẫn giữ lịch cũ.')+' '+t(lastError));
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
  $('#epgChannel').onchange=renderRows;
  $('#epgAutoRefresh').onchange=e=>{state.settings.autoRefreshEPG=e.target.checked;save();};
  $('#autoRefreshPlaylists').onchange=e=>{state.settings.autoRefreshPlaylists=e.target.checked;save();};
  $('#autoResumeLast').onchange=e=>{state.settings.autoResumeLast=e.target.checked;save();};
  $('#addEPGSource').onclick=()=>{try{addCustom();}catch(e){notify(e.message,'error');}};
  render();
  document.addEventListener('openiptv:languagechange',render);
  return {render,renderRows,refresh,addCustom};
}
