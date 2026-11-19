/* Translate app-owned native JS dialogs, not user-supplied playlists or EPG content. */
'use strict';
(()=>{
 const templates=window.OpenIPTVDialogTemplates;
 if(!templates || window.__OpenIPTVNativeDialogLocalized)return;
 window.__OpenIPTVNativeDialogLocalized=true;
 function translateDialog(raw){
   const message=String(raw??''), language=window.OpenIPTVI18n?.getLanguage?.()||'vi';
   if(language==='vi')return message;
   return templates.translate(message,language)||window.OpenIPTVI18n?.t(message,language)||message;
 }
 for(const kind of ['confirm','prompt','alert']){
   const original=window[kind];
   if(typeof original!=='function')continue;
   const bound=original.bind(window);
   window[kind]=function(message,...rest){return bound(translateDialog(message),...rest);};
 }
 if(typeof document!=='undefined' && document.body && typeof document.getElementById==='function') window.OpenIPTVI18n?.apply?.();
})();
