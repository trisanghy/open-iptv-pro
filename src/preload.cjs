'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('streamleaf',Object.freeze({
  capabilities:()=>ipcRenderer.invoke('app:capabilities'),
  fetchEPG:url=>ipcRenderer.invoke('epg:fetch',url),
  checkUpdate:repo=>ipcRenderer.invoke('update:check',repo),
  openRelease:repo=>ipcRenderer.invoke('update:openRelease',repo),
  openM3U:()=>ipcRenderer.invoke('source:readFile'),
  loadURL:url=>ipcRenderer.invoke('source:readUrl',url),
  proxy:url=>ipcRenderer.invoke('media:proxy',url),
  mediaKind:url=>ipcRenderer.invoke('media:kind',url),
  check:url=>ipcRenderer.invoke('link:check',url),
  snapshot:(url,label)=>ipcRenderer.invoke('snapshot:make',url,label),
  export:(name,content)=>ipcRenderer.invoke('file:export',name,content),
  publish:(config,content)=>ipcRenderer.invoke('github:publish',config,content),
  vlcWebsite:()=>ipcRenderer.invoke('system:openVLC')
}));
