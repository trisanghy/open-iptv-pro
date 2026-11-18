/* Open IPTV Pro desktop localization. Local dictionaries ship inside the app: no translation API or account required. */
'use strict';
(() => {
  const locales = Object.freeze({
    vi:'Tiếng Việt',en:'English',es:'Español','pt-BR':'Português (Brasil)',
    'zh-CN':'简体中文',th:'ไทย',lo:'ລາວ',km:'ភាសាខ្មែរ'
  });
  const dictionaries=window.OPEN_IPTV_TRANSLATIONS || {};
  const key='open-iptv-pro-language';
  let locale='vi';
  try{const stored=localStorage.getItem(key);if(stored && Object.hasOwn(locales,stored))locale=stored;}catch{}
  const originalText=new WeakMap(), originalAttrs=new WeakMap();
  const skipSelector='script,style,code,pre,.channel-text b,.folder-header .folder-name,.folder-card h3,.fav-card h3,.shot-card b,#playingTitle,.epg-program b,.epg-row header b,.source-top h3,.source-url,.source-card h3,.preview-title,.channel-preview b';
  const attributeList=['title','placeholder','aria-label'];
  let inApply=false;
  function translate(raw,language=locale){
    if(typeof raw!=='string' || language==='vi')return raw;
    const dict=dictionaries[language]||dictionaries.en||{};
    const compact=raw.trim().replace(/\s+/g,' ');
    if(!compact)return raw;
    let out=dict[compact];
    const prefixMatch=!out && compact.match(/^([^\p{L}\p{N}]+)(.+)$/u);
    if(!out && prefixMatch){const localized=dict[prefixMatch[2]];if(localized)out=prefixMatch[1]+localized;}
    if(!out){
      const n=compact.match(/^(\d+)\s+luồng$/);
      if(n)out=n[1]+' '+({en:'workers',es:'tareas', 'pt-BR':'tarefas','zh-CN':'个并发',th:'งาน',lo:'ວຽກ',km:'ការងារ'}[language]||'workers');
    }
    if(!out){
      const n=compact.match(/^(\d+)\s*·\s*(.+)$/);
      if(n){const label=dict[n[2]];if(label)out=n[1]+' · '+label;}
    }
    if(!out){
      const n=compact.match(/^Tự động theo hệ thống\s*•\s*Hiện tại:\s*(Sáng|Tối)$/);
      if(n)out=(dict['Tự động theo hệ thống']||'Follow system')+' • '+(dict['Hiện tại']||'Current')+': '+(dict[n[1]]||n[1]);
    }
    if(!out){
      const n=compact.match(/^Đã thêm (\d+) kênh mới$/);
      if(n)out=(dict['Đã thêm']||'Added')+' '+n[1]+' '+(dict['kênh mới']||'new channels');
    }
    if(!out){
      const n=compact.match(/^(\d+)\s+kênh\s*•\s*(\d+)\s+nguồn$/);
      if(n)out=n[1]+' '+(dict['kênh']||'channels')+' • '+n[2]+' '+(dict['nguồn']||'sources');
    }
    if(!out){
      const n=compact.match(/^(\d+)\s*·\s*luồng song song$/);
      if(n)out=n[1]+' · '+({en:'parallel workers',es:'tareas paralelas','pt-BR':'tarefas paralelas','zh-CN':'个并行任务',th:'งานพร้อมกัน',lo:'ວຽກພ້ອມກັນ',km:'ការងារព្រមគ្នា'}[language]||'parallel workers');
    }
    if(!out){
      // Dynamic channel counts only, never change channel names supplied by playlist users.
      const n=compact.match(/^(\d+(?:\s*\/\s*\d+)?)\s+kênh$/);
      if(n)out=n[1]+' '+({en:'channels',es:'canales','pt-BR':'canais','zh-CN':'个频道',th:'ช่อง',lo:'ຊ່ອງ',km:'ប៉ុស្តិ៍'}[language]||'channels');
    }
    if(!out){
      const v=compact.match(/^Phiên bản hiện tại: (.+)$/);
      if(v)out=(dict['Phiên bản hiện tại']||'Current version')+': '+v[1];
    }
    if(!out)return raw;
    const leading=raw.match(/^\s*/)?.[0]||'',trailing=raw.match(/\s*$/)?.[0]||'';
    return leading+out+trailing;
  }
  function protectedNode(node){
    const parent=node.nodeType===3?node.parentElement:node;
    return !parent||!!parent.closest?.(skipSelector)||!!parent.closest?.('[data-i18n-ignore="true"]');
  }
  function translateNode(node){
    if(protectedNode(node))return;
    const value=node.nodeValue;
    if(typeof value!=='string'||!value.trim())return;
    let item=originalText.get(node);
    if(!item){item={source:value,last:value};originalText.set(node,item);}
    else if(value!==item.last && value!==item.source)item.source=value;
    const result=translate(item.source);
    item.last=result;
    if(value!==result)node.nodeValue=result;
  }
  function translateAttributes(el){
    if(protectedNode(el))return;
    let stored=originalAttrs.get(el);
    if(!stored){stored={};originalAttrs.set(el,stored);}
    for(const attr of attributeList){
      if(!el.hasAttribute(attr))continue;
      const value=el.getAttribute(attr);
      let item=stored[attr];
      if(!item){item={source:value,last:value};stored[attr]=item;}
      else if(value!==item.last && value!==item.source)item.source=value;
      const result=translate(item.source);
      item.last=result;
      if(value!==result)el.setAttribute(attr,result);
    }
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===3){translateNode(root);return;}
    if(root.nodeType!==1 && root.nodeType!==11)return;
    if(root.nodeType===1)translateAttributes(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.nodeType===3)translateNode(node);
      else translateAttributes(node);
    }
  }
  function apply(root=document.body){
    if(inApply)return;
    inApply=true;
    try{
      document.documentElement.lang=locale;
      walk(root);
      const control=document.getElementById('appLanguage');
      if(control&&control.value!==locale)control.value=locale;
    }finally{inApply=false;}
  }
  function setLanguage(code){
    if(!Object.hasOwn(locales,code))throw new Error('Unsupported language: '+code);
    locale=code;
    try{localStorage.setItem(key,locale);}catch{}
    apply();
    document.dispatchEvent(new CustomEvent('openiptv:languagechange',{detail:{locale}}));
  }
  // Translating newly-created modals, list/status labels and settings without interfering with app data.
  const observer=new MutationObserver(changes=>{
    if(inApply)return;
    for(const change of changes){
      if(change.type==='characterData')translateNode(change.target);
      else if(change.type==='attributes')translateAttributes(change.target);
      else for(const node of change.addedNodes)walk(node);
    }
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributeList});
  window.OpenIPTVI18n=Object.freeze({locales,getLanguage:()=>locale,setLanguage,t:translate,apply});
  const setup=()=>{
    const control=document.getElementById('appLanguage');
    if(control){control.value=locale;control.addEventListener('change',e=>setLanguage(e.target.value));}
    apply();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
