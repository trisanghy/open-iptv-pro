'use strict';
// Small Node-compatible replacement ONLY for APIs consumed by the original main.cjs.
// UI and all original stream/EPG/Timeshift/Doctor logic remain unchanged.
const path=require('node:path');const fs=require('node:fs');const os=require('node:os');
const {EventEmitter}=require('node:events');
const app=new EventEmitter();
const isMac=process.platform==='darwin';
function appData(){if(isMac)return path.join(os.homedir(),'Library','Application Support');if(process.platform==='win32')return process.env.APPDATA||path.join(os.homedir(),'AppData','Roaming');return process.env.XDG_CONFIG_HOME||path.join(os.homedir(),'.config');}
app.getPath=(key)=>{if(key==='userData')return path.join(appData(),'open-iptv-pro');if(key==='downloads')return path.join(os.homedir(),'Downloads');if(key==='home')return os.homedir();return appData()};
app.getVersion=()=> '4.19.0';app.isPackaged=true;
app.whenReady=()=>Promise.resolve();app.quit=()=>process.exit(0);
class BrowserWindow{
  constructor(){this.webContents={send:()=>{},setWindowOpenHandler:()=>{},on:()=>{}};BrowserWindow.instances.push(this);}
  loadFile(){} isDestroyed(){return false;}
  static getAllWindows(){return BrowserWindow.instances;}
}
BrowserWindow.instances=[];
const ipcMain={__handlers:new Map(),handle(name,handler){if(this.__handlers.has(name))throw Error('Duplicate IPC '+name);this.__handlers.set(name,handler)}};
const dialog={showOpenDialog:async()=>{throw Error('Open file uses native Tauri dialog')},showSaveDialog:async()=>{throw Error('Save file uses native Tauri dialog')},showErrorBox:(title,error)=>console.error(title,error)};
const shell={
  openExternal:async(url)=>{const u=new URL(url);if(u.protocol!=='https:')throw Error('URL ngoài không an toàn');return openFile(url)},
  openPath:async(file)=>openFile(file)
};
function openFile(url){const {spawn}=require('node:child_process');
 const args=process.platform==='darwin'?['open',[url]]:process.platform==='win32'?['explorer.exe',[url]]:['xdg-open',[url]];
 return new Promise(resolve=>{const p=spawn(args[0],args[1],{windowsHide:true,stdio:'ignore'});p.once('error',e=>resolve(e.message));p.once('spawn',()=>resolve(''));});}
const nativeTheme={shouldUseDarkColors:true};
module.exports={app,BrowserWindow,ipcMain,dialog,shell,nativeTheme};
