'use strict';
// Match src/preload.cjs API exactly, reusing every original v4.19 renderer module.
(() => {
 const invoke=(command,args={})=>{
   const api=window.__TAURI__?.core;
   if(!api?.invoke) return Promise.reject(Error('Tauri API chưa sẵn sàng'));
   return api.invoke(command,args);
 };
 let endpointPromise=null;
 const endpoint=()=>endpointPromise ||= invoke('backend_info');
 async function rpc(method,...args){
   const b=await endpoint();
   const c=new AbortController();const timeout=setTimeout(()=>c.abort(),150000);
   try{
     const response=await fetch(`http://127.0.0.1:${b.port}/rpc?key=${b.secret}`,{
       method:'POST',headers:{'Content-Type':'application/json','X-IPTV-Key':b.secret},
       body:JSON.stringify({method,args}),signal:c.signal
     });
     if(!response.ok)throw Error('Không liên lạc được với IPTV backend (HTTP '+response.status+')');
     const json=await response.json();if(!json.ok)throw Error(json.error||'Backend không phản hồi');
     return json.data;
   }finally{clearTimeout(timeout);}
 }
 function onUpdateStatus(cb){let active=true,last='';const timer=setInterval(async()=>{
   if(!active)return;
   try{const v=await rpc('update:status');const key=JSON.stringify(v);if(key!==last){last=key;cb(v)}}catch{}
 },750);return ()=>{active=false;clearInterval(timer)};}
 window.streamleaf=Object.freeze({
   capabilities:()=>rpc('app:capabilities'),
   startTimeshift:url=>rpc('timeshift:start',url),stopTimeshift:()=>rpc('timeshift:stop'),
   timeshiftStatus:()=>rpc('timeshift:status'),
   notifyReminder:(title,body)=>invoke('native_notify',{title,body}),
   fetchEPG:url=>rpc('epg:fetch',url),
   checkUpdate:()=>rpc('update:check'),updateStatus:()=>rpc('update:status'),
   downloadUpdate:()=>rpc('update:download'),installUpdate:()=>rpc('update:install'),
   openDownloadedUpdate:()=>rpc('update:openDownloaded'),onUpdateStatus,
   openRelease:()=>invoke('open_external',{url:'https://github.com/trisanghy/open-iptv-pro/releases/latest'}),
   openReleases:()=>invoke('open_external',{url:'https://github.com/trisanghy/open-iptv-pro/releases'}),
   openM3U:()=>invoke('open_m3u'),
   loadURL:url=>rpc('source:readUrl',url),proxy:url=>rpc('media:proxy',url),
   mediaKind:url=>rpc('media:kind',url),check:url=>rpc('link:check',url),
   snapshot:(url,label)=>rpc('snapshot:make',url,label),
   batchStart:(kind,items,concurrency)=>rpc('batch:start',{kind,items,concurrency}),
   batchStatus:(id,offset)=>rpc('batch:status',id,offset),
   batchCancel:(id)=>rpc('batch:cancel',id),
   export:(name,content)=>invoke('export_m3u',{name,content}),
   listRepoPlaylists:url=>rpc('source:listRepo',url),
   vlcWebsite:()=>invoke('open_external',{url:'https://www.videolan.org/vlc/'})
 });
})();
