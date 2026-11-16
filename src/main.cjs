'use strict';
const {app,BrowserWindow,dialog,ipcMain,shell,nativeTheme,net} = require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
const http=require('node:http');
const {randomBytes,createHash}=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const {checkRepeated}=require('./stream-check.cjs');
const {pipeContinuousResponse}=require('./stream-response.cjs');
const {inspectMedia}=require('./media-inspection.cjs');
const {fetchStream,browserUserAgent}=require('./hls-relay.cjs');
const {relayStream}=require('./stream-proxy.cjs');
const {makeDesktopFetcher,makeStreamFetcher}=require('./network-transport.cjs');
const {Readable}=require('node:stream');
const {rewriteHls}=require('./core.cjs');
const {fetchGuide,readGuideFile}=require('./epg.cjs');
const {UpdateManager}=require('./update-manager.cjs');
const {openVerifiedInstaller}=require('./update-install-flow.cjs');
const {listPublicPlaylists}=require('./repo-sources.cjs');
const smartDiscovery=require('./smart-discovery.cjs');
const {createTimeshift}=require('./timeshift.cjs');
const {createPlaybackFallback}=require('./playback-fallback.cjs');
const {createRecordingScheduler}=require('./recording-scheduler.cjs');
const {CastService}=require('./cast-service.cjs');
const {discoverAirplay}=require('./airplay-discovery.cjs');
const backupService=require('./backup-service.cjs');
const secret=randomBytes(20).toString('hex');
let webWindow, server, port, timeshift, playbackFallback, updates, dvr;
let pendingBackup=null, pendingRestore=null;
const castService=new CastService();
const mediaKindCache=new Map();
// Chromium uses the operating system proxy/DNS/TLS configuration. Node fetch
// is only a connection-error fallback, never an HTTP 401/403 bypass.
const desktopFetch=makeDesktopFetcher((url,options)=>net.fetch(url,options),fetch);
const desktopStreamFetch=makeStreamFetcher(fetch,(url,options)=>net.fetch(url,options));
const MAX_PLAYLIST=25*1024*1024;
function urlOK(raw){const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw new Error('Chỉ hỗ trợ URL http/https.');return u;}
function fileSafeName(s){return String(s).replace(/[^\p{L}\p{N}_.-]+/gu,'_').slice(0,80)||'channel';}
async function readURL(raw,maxBytes=MAX_PLAYLIST,timeout=18000){
 urlOK(raw);const c=new AbortController();const t=setTimeout(()=>c.abort(),timeout);
 try {const res=await desktopFetch(raw,{signal:c.signal,redirect:'follow',headers:{'User-Agent':browserUserAgent()}});
   if(!res.ok)throw new Error(`Máy chủ trả HTTP ${res.status}`);
   const parts=[];let len=0;
   for await(const chunk of res.body){len+=chunk.length;if(len>maxBytes)throw new Error('Playlist quá lớn');parts.push(chunk);}
   return Buffer.concat(parts).toString('utf8').replace(/^\uFEFF/,'');
 }finally{clearTimeout(t);}
}
function proxyUrl(u){return `http://127.0.0.1:${port}/stream?key=${secret}&url=${encodeURIComponent(u)}`;}
function allowedOrigins(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Range,Accept,Content-Type');res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Range, Accept-Ranges');}
async function handleStream(req,res){
 allowedOrigins(res);
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
 try {
  const local=new URL(req.url,'http://127.0.0.1');
  if(local.searchParams.get('key')!==secret){res.writeHead(403);res.end();return;}
  if(local.pathname==='/snapshot'){
    const name=local.searchParams.get('file')||'';
    if(!/^[\p{L}\p{N}_.-]{1,160}\.jpg$/u.test(name)){res.writeHead(400);res.end();return;}
    const filename=path.join(app.getPath('userData'),'snapshots',name);
    try{const st=await fs.promises.stat(filename);if(!st.isFile()||st.size>5_000_000)throw Error('Invalid file');
      res.writeHead(200,{'Content-Type':'image/jpeg','Content-Length':st.size,'Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'});
      fs.createReadStream(filename).pipe(res);return;
    }catch{res.writeHead(404);res.end();return;}
  }
  if(local.pathname==='/playback-fallback'){
    try{
     const id=local.searchParams.get('id')||'',file=local.searchParams.get('file')||'';
     const item=playbackFallback.read(id,file);let data=item.data;
     if(file==='index.m3u8'){
      const lines=data.toString('utf8').split(/\r?\n/).map(line=>{
       const part=line.trim();
       return /^segment_\d{6}\.ts$/.test(part)?`http://127.0.0.1:${port}/playback-fallback?key=${secret}&id=${encodeURIComponent(id)}&file=${part}`:line;
      });data=Buffer.from(lines.join('\n'));
     }
     res.writeHead(200,{'Content-Type':item.contentType,'Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
     res.end(data);return;
    }catch(e){res.writeHead(404,{'Cache-Control':'no-store'});res.end('FFmpeg: '+String(e.message||e).slice(0,120));return;}
  }
  if(local.pathname==='/buffer'){
    try{
     const id=local.searchParams.get('id')||'',file=local.searchParams.get('file')||'';
     const item=timeshift.read(id,file);let payload=item.data;
     if(file.endsWith('.m3u8')){
       const lines=payload.toString('utf8').split(/\r?\n/).map(line=>{
         const item=line.trim();
         return /^segment_\d{6}\.ts$/.test(item)?`http://127.0.0.1:${port}/buffer?key=${secret}&id=${encodeURIComponent(id)}&file=${item}`:line;
       });payload=Buffer.from(lines.join('\n'));
     }
     res.writeHead(200,{'Content-Type':item.contentType,'Content-Length':payload.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(payload);return;
    }catch(e){res.writeHead(404);res.end(String(e.message||e));return;}
  }
  if(local.pathname!=='/stream'){res.writeHead(404);res.end();return;}
  const url=local.searchParams.get('url');urlOK(url);
  await relayStream({req,res,url,proxyUrl,fetcher:desktopStreamFetch});
 }catch(e){if(!res.headersSent)res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});res.end('Không thể tải luồng: '+String(e.message||e).slice(0,200));}
}
async function startProxy(){
 server=http.createServer(handleStream);
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>{port=server.address().port;resolve();});});
}
// Full build: the platform-specific FFmpeg binary is bundled with the application.
// Electron Builder unpacks executable binaries from app.asar to app.asar.unpacked.
let resolvedFfmpeg;
function ffmpegPath(){
 if(resolvedFfmpeg!==undefined)return resolvedFfmpeg;
 const executable=process.platform==='win32'?'ffmpeg.exe':'ffmpeg';
 const choices=[];
 try{
  const embedded=require('ffmpeg-static');
  if(embedded){
   choices.push(embedded);
   if(embedded.includes('app.asar'))choices.unshift(embedded.replace('app.asar','app.asar.unpacked'));
  }
 }catch(e){console.warn('Bundled FFmpeg is unavailable:',e.message);}
 choices.push(process.env.OPEN_IPTV_FFMPEG,
  path.join(app.getPath('userData'),'tools',executable),
  ...(process.platform==='darwin'?['/opt/homebrew/bin/ffmpeg','/usr/local/bin/ffmpeg','/opt/local/bin/ffmpeg']:[]),
  ...(process.platform==='win32'?['C:\\ffmpeg\\bin\\ffmpeg.exe']:[]),
  'ffmpeg');
 for(const cmd of [...new Set(choices.filter(Boolean))]){
  try{
   const result=spawnSync(cmd,['-version'],{windowsHide:true,timeout:3500,stdio:'ignore'});
   if(!result.error&&result.status===0){resolvedFfmpeg=cmd;return cmd;}
  }catch(e){console.warn('FFmpeg unavailable:',cmd,e.message);}
 }
 resolvedFfmpeg=null;return null;
}
function requireFfmpeg(){
 const found=ffmpegPath();
 if(!found)throw Error('Không tìm thấy FFmpeg tích hợp. Hãy cài lại bản Open IPTV Pro Full đúng kiến trúc của máy.');
 return found;
}

async function makeSnapshot(url,label){
 urlOK(url);
 const ffmpeg=requireFfmpeg();
 const folder=path.join(app.getPath('userData'),'snapshots');fs.mkdirSync(folder,{recursive:true});
 const name=`${fileSafeName(label)}_${Date.now()}_${randomBytes(3).toString('hex')}.jpg`;
 const dest=path.join(folder,name);
 return new Promise((resolve,reject)=>{
  const args=['-hide_banner','-nostdin','-loglevel','error','-y','-rw_timeout','7500000','-probesize','1048576','-analyzeduration','1600000','-i',url,'-an','-sn','-dn','-threads','1','-frames:v','1','-vf','scale=384:-2','-q:v','5',dest];
  const child=spawn(ffmpeg,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let stderr='';child.stderr.on('data',d=>{stderr=(stderr+d.toString()).slice(-1800);});
  const kill=setTimeout(()=>{child.kill('SIGKILL');},12000);
  child.on('error',e=>{clearTimeout(kill);reject(new Error('Không khởi động được FFmpeg: '+e.message));});
  child.on('close',code=>{clearTimeout(kill);
    if(code===0&&fs.existsSync(dest)&&fs.statSync(dest).size>300)return resolve({file:name,data:`http://127.0.0.1:${port}/snapshot?key=${secret}&file=${encodeURIComponent(name)}`,method:'FFmpeg'});
    try{fs.unlinkSync(dest);}catch{}reject(new Error(stderr.slice(-200)||'Không chụp được video từ luồng này'));
  });
 });
}
function setupIPC(){
 ipcMain.handle('cast:discover',async()=>castService.discover());
 ipcMain.handle('airplay:discover',async()=>discoverAirplay());
 ipcMain.handle('cast:play',async(_e,deviceId,url,title)=>castService.play(deviceId,url,title));
 ipcMain.handle('cast:stop',async()=>castService.stop());
 ipcMain.handle('cast:status',()=>castService.status());
 ipcMain.handle('cast:lan',async(_e,url)=>{urlOK(url);await castService.stop();const out=await castService.relay.start(url);return {page:out.page};});
 ipcMain.handle('airplay:open',async(_e,url)=>{
  if(process.platform!=='darwin')throw Error('AirPlay qua Safari chỉ hỗ trợ macOS; trên Windows hãy dùng Google Cast hoặc link LAN.');
  return castService.openAirplay(url,async page=>{
   await new Promise((resolve,reject)=>{
    const c=spawn('open',['-a','Safari',page],{windowsHide:true,stdio:'ignore'});
    c.once('error',reject);c.once('close',code=>code===0?resolve():reject(Error('Không mở được Safari trên Mac')));
   });
  });
 });
 ipcMain.handle('playback:fallback:start',async(_e,url)=>{
   urlOK(url);const ffmpeg=requireFfmpeg();
   const {id}=await playbackFallback.start(url);
   return {id,url:`http://127.0.0.1:${port}/playback-fallback?key=${secret}&id=${encodeURIComponent(id)}&file=index.m3u8`};
 });
 ipcMain.handle('playback:fallback:stop',(_e,id)=>playbackFallback.stop(id));
 ipcMain.handle('playback:fallback:status',()=>playbackFallback.status());
 ipcMain.handle('timeshift:start',(_e,url,minutes=10)=>{
   urlOK(url);requireFfmpeg();const {id}=timeshift.start(url,minutes);
   return {id,url:`http://127.0.0.1:${port}/buffer?key=${secret}&id=${id}&file=rolling.m3u8`};
 });
 ipcMain.handle('timeshift:stop',()=>{timeshift.stop();return true;});
 ipcMain.handle('timeshift:status',()=>timeshift.status());
 ipcMain.handle('dvr:list',()=>dvr.list());
 ipcMain.handle('dvr:create',(_e,details)=>{requireFfmpeg();return dvr.create(details);});
 ipcMain.handle('dvr:stop',(_e,id)=>dvr.stopJob(id));
 ipcMain.handle('dvr:chooseDirectory',async()=>{
  const selected=await dialog.showOpenDialog(webWindow,{title:'Chọn nơi lưu chương trình đã ghi',properties:['openDirectory','createDirectory']});
  if(selected.canceled||!selected.filePaths?.[0])return null;
  return dvr.chooseDirectory(selected.filePaths[0]);
 });
 ipcMain.handle('dvr:openDirectory',async()=>shell.openPath(dvr.list().directory));
 ipcMain.handle('dvr:reveal',(_e,id)=>{const j=dvr.list().jobs.find(x=>x.id===id);if(!j?.file||!fs.existsSync(j.file))throw Error('Không tìm thấy file bản ghi trên ổ đĩa.');shell.showItemInFolder(j.file);return true;});
 ipcMain.handle('reminder:notify',(_e,title,body)=>{const {Notification}=require('electron');if(!Notification.isSupported())return false;new Notification({title:String(title).slice(0,100),body:String(body).slice(0,200)}).show();return true;});
 ipcMain.handle('epg:fetch',async(_e,url)=>await fetchGuide(url));
 ipcMain.handle('epg:importFile',async()=>{
  const result=await dialog.showOpenDialog(webWindow,{title:'Nhập file EPG XMLTV',properties:['openFile'],filters:[{name:'XMLTV EPG',extensions:['xml','xmltv','gz']},{name:'Tất cả file',extensions:['*']}]});
  if(result.canceled||!result.filePaths?.[0])return null;
  return readGuideFile(result.filePaths[0]);
 });
 ipcMain.handle('update:check',async()=>await updates.checkForUpdates());
 ipcMain.handle('update:status',()=>updates.snapshot());
 ipcMain.handle('update:download',async()=>await updates.download());
 ipcMain.handle('update:install',()=>updates.install());
 ipcMain.handle('update:openDownloaded',async()=>openVerifiedInstaller({platform:process.platform,phase:updates.snapshot().phase,downloadedPath:updates.downloadedPath,openPath:filename=>shell.openPath(filename),quit:()=>app.quit()}));
 ipcMain.handle('update:openRelease',async()=>shell.openExternal('https://github.com/trisanghy/open-iptv-pro/releases/latest'));
 ipcMain.handle('update:openReleases',async()=>shell.openExternal('https://github.com/trisanghy/open-iptv-pro/releases'));
 ipcMain.handle('app:capabilities',()=>({native:true,platform:process.platform,ffmpegExists:!!ffmpegPath(),snapshotBase:`http://127.0.0.1:${port}/snapshot?key=${secret}&file=`,version:app.getVersion()}));
 ipcMain.handle('source:readFile', async()=>{
  const r=await dialog.showOpenDialog(webWindow,{title:'Chọn playlist M3U',properties:['openFile'],filters:[{name:'Danh sách IPTV',extensions:['m3u','m3u8','txt']},{name:'Tất cả',extensions:['*']} ]});
  if(r.canceled||!r.filePaths[0])return null;
  const p=r.filePaths[0];const info=await fs.promises.stat(p);
  if(!info.isFile()||info.size>MAX_PLAYLIST)throw new Error('File M3U vượt giới hạn 25 MB');
  const data=await fs.promises.readFile(p);
  if(data.length>MAX_PLAYLIST)throw new Error('File M3U vượt giới hạn 25 MB');
  return {name:path.basename(p),content:data.toString('utf8')};
 });
 ipcMain.handle('source:readUrl',async(_e,url)=>({content:await readURL(url)}));
 ipcMain.handle('media:proxy',(_e,url)=>{urlOK(url);return proxyUrl(url);});
 ipcMain.handle('media:kind',async(_e,url)=>{
   urlOK(url);const cached=mediaKindCache.get(url);if(cached&&Date.now()-cached.at<15*60_000)return cached.value;const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),2200);
   try{
     // Request complete manifests; retry media probes without Range if rejected.
     const r=await fetchStream(desktopStreamFetch,url,{range:'bytes=0-65535',userAgent:browserUserAgent(),signal:ctrl.signal});
     if(!r.ok)throw Error('HTTP '+r.status);
     const ct=r.headers.get('content-type')||'';let sample=Buffer.alloc(0);
     if(r.body){const rd=r.body.getReader();const part=await rd.read();if(part.value)sample=Buffer.from(part.value).subarray(0,65536);await rd.cancel();}
     const value=inspectMedia({url:r.url,contentType:ct,sample,acceptRanges:r.headers.get('accept-ranges')||''});
     if(mediaKindCache.size>150)mediaKindCache.clear();mediaKindCache.set(url,{at:Date.now(),value});return value;
   }catch{return {hls:false};}finally{clearTimeout(t);}
 });
 ipcMain.handle('link:check',async(_e,url)=>{urlOK(url);return await checkRepeated(url,{fetcher:desktopFetch});});
 ipcMain.handle('snapshot:make',async(_e,url,name)=>await makeSnapshot(url,name));
 ipcMain.handle('file:export',async(_e,name,content)=>{
  const r=await dialog.showSaveDialog(webWindow,{defaultPath:name||'iptv.m3u',filters:[{name:'IPTV Playlist',extensions:['m3u']}]});if(r.canceled||!r.filePath)return null;
  const p=r.filePath;const temp=p+'.tmp-'+randomBytes(4).toString('hex');fs.writeFileSync(temp,content,'utf8');fs.renameSync(temp,p);return p;
 });
 // The backup format is local-only; file paths and image access never cross the preload bridge.
 ipcMain.handle('backup:export',async(_e,storage,includeSnapshots)=>{
  const {output,summary}=await backupService.createBackup({...storage,'open-iptv-pro-dvr-v1':dvr.exportPending()},path.join(app.getPath('userData'),'snapshots'),{includeSnapshots,appVersion:app.getVersion()});
  const r=await dialog.showSaveDialog(webWindow,{title:'Sao lưu dữ liệu Open IPTV Pro',defaultPath:`Open-IPTV-Pro-${new Date().toISOString().slice(0,10)}.iptvbackup`,filters:[{name:'Open IPTV Pro Backup',extensions:['iptvbackup']}]});
  if(r.canceled||!r.filePath)return {canceled:true};
  await backupService.saveAtomic(r.filePath,output);
  return {canceled:false,file:r.filePath,...summary};
 });
 ipcMain.handle('backup:inspect',async()=>{
  pendingBackup=null;pendingRestore=null;
  const r=await dialog.showOpenDialog(webWindow,{title:'Chọn file sao lưu để khôi phục',properties:['openFile'],filters:[{name:'Open IPTV Pro Backup',extensions:['iptvbackup']}]});
  if(r.canceled||!r.filePaths[0])return {canceled:true};
  const {sha256,summary,data}=await backupService.readBackup(r.filePaths[0]);
  if(data.storage['open-iptv-pro-dvr-v1'])summary.recordingSchedules=dvr.prepareImport(data.storage['open-iptv-pro-dvr-v1']).length;
  const token=randomBytes(18).toString('hex');pendingBackup={path:r.filePaths[0],sha256,token};
  return {canceled:false,token,...summary};
 });
 ipcMain.handle('backup:restore',async(_e,token)=>{
  if(!pendingBackup||pendingBackup.token!==token)throw Error('Phiên khôi phục không hợp lệ. Hãy chọn file lại.');
  const picked=pendingBackup;pendingBackup=null;
  const {data,sha256}=await backupService.readBackup(picked.path);
  if(sha256!==picked.sha256)throw Error('File sao lưu đã thay đổi kể từ khi xem trước.');
  const snapshotDir=path.join(app.getPath('userData'),'snapshots');
  const restored=await backupService.restoreBackup(data,snapshotDir);
  const finishToken=randomBytes(18).toString('hex');
  pendingRestore={token:finishToken,paths:restored.createdFiles,snapshotDir,dvrData:restored.storage['open-iptv-pro-dvr-v1']||null};
  return {storage:restored.storage,finishToken};
 });
 ipcMain.handle('backup:finish',async(_e,token,success)=>{
  if(!pendingRestore||pendingRestore.token!==token)return false;
  const r=pendingRestore;
  if(success===true&&r.dvrData)dvr.importPending(r.dvrData);
  pendingRestore=null;
  if(success!==true)await backupService.discardImportedImages(r.paths,r.snapshotDir);
  return true;
 });
 ipcMain.handle('smart:countries',()=>smartDiscovery.listCountries());
 ipcMain.handle('smart:country',(_e,code)=>smartDiscovery.loadCountry(code));
 ipcMain.handle('smart:catalog-options',(_e,kind)=>smartDiscovery.listCatalogOptions(kind));
 ipcMain.handle('smart:load',(_e,spec)=>smartDiscovery.loadCatalog(spec));
 ipcMain.handle('smart:check',async(_e,url)=>{const safe=smartDiscovery.safeStreamURL(url);return checkRepeated(safe.href,{fetcher:(u,opts)=>smartDiscovery.safeStreamFetch(u,opts,desktopFetch),delayMs:250});});
 ipcMain.handle('source:listRepo',async(_e,url)=>await listPublicPlaylists(url));
 ipcMain.handle('system:openVLC',()=>shell.openExternal('https://www.videolan.org/vlc/'));
}
function createWindow(){
 webWindow=new BrowserWindow({width:1360,height:850,minWidth:980,minHeight:640,backgroundColor:nativeTheme.shouldUseDarkColors?'#080e15':'#f3f6fb',title:`Open IPTV Pro ${app.getVersion()}`,icon:path.join(__dirname,'../assets/icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true}});
 webWindow.loadFile(path.join(__dirname,'../renderer/index.html'));
 webWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 const appEntry=pathToFileURL(path.join(__dirname,'../renderer/index.html')).href;
 webWindow.webContents.on('will-navigate',(event,url)=>{if(url!==appEntry)event.preventDefault();});
}
app.whenReady().then(async()=>{
 const dataDir=app.getPath('userData');
 timeshift=createTimeshift({baseDir:dataDir,ffmpegPath:ffmpegPath()||'ffmpeg',logger:()=>{}});
 playbackFallback=createPlaybackFallback({baseDir:dataDir,ffmpegPath:ffmpegPath()||'ffmpeg',logger:msg=>console.warn('Playback:',msg)});
 dvr=createRecordingScheduler({baseDir:dataDir,ffmpegPath:ffmpegPath()||'ffmpeg',logger:msg=>console.warn('DVR:',msg)});
 dvr.startMonitoring();
 const {powerMonitor}=require('electron');powerMonitor.on('resume',()=>dvr.tick());
 await startProxy();
 let nativeUpdater=null;try{nativeUpdater=require('electron-updater').autoUpdater;}catch(e){console.warn('Updater unavailable:',e.message);}
 updates=new UpdateManager({app,updater:nativeUpdater});
 updates.on('status',s=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('update:status',s);});
 setupIPC();createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});}).catch(e=>{dialog.showErrorBox('Open IPTV Pro lỗi khởi chạy',String(e.stack||e));app.quit();});
// Closing the red macOS window button also quits instead of leaving an invisible app.
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{try{dvr?.shutdown();}catch(e){console.warn('DVR shutdown',e);}castService.stop().catch(()=>{});try{timeshift?.stop();}catch{}try{playbackFallback?.stop();}catch{}try{server.close();}catch{}});
