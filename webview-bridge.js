'use strict';
/* Tauri 2 to Node backend RPC adapter. All filesystem picker calls are native dialogs.
   The Node backend is bound to 127.0.0.1 and protected by a session secret. */
(()=>{
 if(typeof window.__TAURI__?.core?.invoke!=='function')return;
 const invoke=(command,args={})=>window.__TAURI__.core.invoke(command,args);
 let infoPromise=null;
 const endpoint=()=>infoPromise ||= invoke('backend_info').catch(e=>{infoPromise=null;throw e;});
 async function rpc(method,...args){
  const b=await endpoint(),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),180000);
  try{
   const response=await fetch(`http://127.0.0.1:${b.port}/rpc?key=${encodeURIComponent(b.secret)}`,{
    method:'POST',headers:{'Content-Type':'application/json','X-IPTV-Key':b.secret},
    body:JSON.stringify({method,args}),signal:controller.signal
   });
   if(!response.ok)throw Error('Không liên lạc được backend HTTP '+response.status);
   const result=await response.json();if(!result.ok)throw Error(result.error||'Backend không phản hồi');return result.data;
  }finally{clearTimeout(timeout);}
 }
 function onUpdateStatus(cb){let last='';const timer=setInterval(async()=>{try{
   const item=await rpc('update:status'),current=JSON.stringify(item);
   if(last!==current){last=current;cb(item);}
  }catch{}},1200);return ()=>clearInterval(timer);}
 const api={
  capabilities:()=>rpc('app:capabilities'),
  castDiscover:()=>rpc('cast:discover'),airplayDiscover:()=>rpc('airplay:discover'),
  castPlay:(deviceId,url,title)=>rpc('cast:play',deviceId,url,title),
  castStop:()=>rpc('cast:stop'),castStatus:()=>rpc('cast:status'),
  castLan:url=>rpc('cast:lan',url),openAirplay:url=>rpc('airplay:open',url),
  startTimeshift:(url,minutes=10)=>rpc('timeshift:start',url,minutes),
  startPlaybackFallback:url=>rpc('playback:fallback:start',url),
  stopPlaybackFallback:id=>rpc('playback:fallback:stop',id),
  playbackFallbackStatus:()=>rpc('playback:fallback:status'),stopTimeshift:()=>rpc('timeshift:stop'),
  timeshiftStatus:()=>rpc('timeshift:status'),
  notifyReminder:(title,body)=>invoke('native_notify',{title,body}),
  fetchEPG:url=>rpc('epg:fetch',url),
  importEPGFile:async()=>{const file=await invoke('pick_epg_file');return file?rpc('epg:importFile',file):null;},
  dvrList:()=>rpc('dvr:list'),dvrCreate:details=>rpc('dvr:create',details),
  dvrStop:id=>rpc('dvr:stop',id),
  dvrChooseDirectory:async()=>{const directory=await invoke('pick_dvr_directory');return directory?rpc('dvr:chooseDirectory',directory):null;},
  dvrOpenDirectory:()=>rpc('dvr:openDirectory'),dvrReveal:id=>rpc('dvr:reveal',id),
  checkUpdate:()=>rpc('update:check'),updateStatus:()=>rpc('update:status'),
  downloadUpdate:()=>rpc('update:download'),installUpdate:()=>rpc('update:install'),
  openDownloadedUpdate:()=>rpc('update:openDownloaded'),onUpdateStatus,
  openRelease:()=>invoke('open_external',{url:'https://github.com/trisanghy/open-iptv-pro/releases/latest'}),
  openReleases:()=>invoke('open_external',{url:'https://github.com/trisanghy/open-iptv-pro/releases'}),
  backupExport:async(storage,includeSnapshots)=>{
    const filename=`Open-IPTV-Pro-${new Date().toISOString().slice(0,10)}.iptvbackup`;
    const file=await invoke('pick_backup_save',{name:filename});
    return file?rpc('backup:export',storage,includeSnapshots,file):{canceled:true};
  },
  backupInspect:async()=>{const file=await invoke('pick_backup_open');return file?rpc('backup:inspect',file):{canceled:true};},
  backupRestore:token=>rpc('backup:restore',token),backupFinish:(token,success)=>rpc('backup:finish',token,success),
  confirmBackupRestore:summary=>invoke('native_confirm_restore',{summary}),
  openM3U:()=>invoke('open_m3u'),loadURL:url=>rpc('source:readUrl',url),
  proxy:url=>rpc('media:proxy',url),mediaKind:url=>rpc('media:kind',url),
  check:url=>rpc('link:check',url),snapshot:(url,label)=>rpc('snapshot:make',url,label),
  batchStart:(kind,items,concurrency)=>rpc('batch:start',{kind,items,concurrency}),
  batchStatus:(id,offset)=>rpc('batch:status',id,offset),batchCancel:id=>rpc('batch:cancel',id),
  export:(name,content)=>invoke('export_m3u',{name,content}),
  smartCountries:()=>rpc('smart:countries'),smartCountry:code=>rpc('smart:country',code),
  smartCatalogOptions:kind=>rpc('smart:catalog-options',kind),
  smartLoad:spec=>rpc('smart:load',spec),smartCheck:url=>rpc('smart:check',url),
  listRepoPlaylists:url=>rpc('source:listRepo',url),
  vlcWebsite:()=>invoke('open_external',{url:'https://www.videolan.org/vlc/'})
 };
 window.streamleaf=Object.freeze(api);
})();
