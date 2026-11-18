/* Rust Lab v11: collapse only the TV channel list, keep player active. */
(function(global){
 'use strict';
 const doc=global.document;
 if(!doc)return;
 const close=doc.getElementById('channelPanelCollapse');
 const reopen=doc.getElementById('channelPanelReopen');
 const panel=doc.getElementById('channelPanel');
 if(!close||!reopen||!panel)return;
 const root=doc.documentElement;
 const KEY='openiptv:rustlab:channel-panel-collapsed';
 const list=doc.getElementById('channelList');
 let savedScroll=0;
 function read(){try{return global.localStorage.getItem(KEY)==='true';}catch(_){return false;}}
 function setCollapsed(value,persist=true){
   const collapsed=!!value;
   if(collapsed&&list)savedScroll=list.scrollTop;
   root.dataset.channelPanelCollapsed=String(collapsed);
   close.setAttribute('aria-expanded',String(!collapsed));
   reopen.setAttribute('aria-expanded',String(!collapsed));
   reopen.title=collapsed?'Mở lại danh sách kênh':'Danh sách kênh đang mở';
   if(persist){try{global.localStorage.setItem(KEY,String(collapsed));}catch(_){/* storage quota: UI still works */}}
   if(!collapsed&&list&&persist){
     const restore=()=>{list.scrollTop=savedScroll;};
     if(typeof global.requestAnimationFrame==='function')global.requestAnimationFrame(restore);
     else restore();
   }
 }
 close.addEventListener('click',()=>setCollapsed(true));
 reopen.addEventListener('click',()=>setCollapsed(false));
 setCollapsed(read(),false);
 global.IPTVChannelPanelToggle={setCollapsed,isCollapsed:()=>root.dataset.channelPanelCollapsed==='true'};
})(typeof window!=='undefined'?window:undefined);
