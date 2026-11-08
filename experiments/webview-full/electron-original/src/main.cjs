'use strict';
const {app,BrowserWindow,dialog,ipcMain,shell,nativeTheme} = require('electron');
const path=require('node:path');
const fs=require('node:fs');
const http=require('node:http');
const {randomBytes,createHash}=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const {checkRepeated}=require('./stream-check.cjs');
const {pipeContinuousResponse}=require('./stream-response.cjs');
const {rewriteHls}=require('./core.cjs');
const {fetchGuide}=require('./epg.cjs');
const {UpdateManager}=require('./update-manager.cjs');
const {listPublicPlaylists}=require('./repo-sources.cjs');
const {createTimeshift}=require('./timeshift.cjs');
const secret=randomBytes(20).toString('hex');
let webWindow, server, port, timeshift, updates;
const mediaKindCache=new Map();
const MAX_PLAYLIST=25*1024*1024;
function urlOK(raw){const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw new Error('Chỉ hỗ trợ URL http/https.');return u;}
function fileSafeName(s){return String(s).replace(/[^\p{L}\p{N}_.-]+/gu,'_').slice(0,80)||'channel';}
async function readURL(raw,maxBytes=MAX_PLAYLIST,timeout=18000){
 urlOK(raw);const c=new AbortController();const t=setTimeout(()=>c.abort(),timeout);
 try {const res=await fetch(raw,{signal:c.signal,redirect:'follow',headers:{'User-Agent':'Open-IPTV-Pro/4.19'}});
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
  const ctrl=new AbortController();
  const timeout=setTimeout(()=>ctrl.abort(),25000); // connect / first response timeout ONLY
  const range=req.headers.range;
  const upstream=await fetch(url,{signal:ctrl.signal,redirect:'follow',headers:{'User-Agent':'Open-IPTV-Pro/4.19',...(range?{Range:range}:{})}});
  const ctype=upstream.headers.get('content-type')||'';
  const maybeHls=/\.m3u8?(?:$|\?)/i.test(upstream.url)||/mpegurl/i.test(ctype);
  const headers={'Content-Type':ctype||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':upstream.headers.get('accept-ranges')||'bytes'};
  if(upstream.headers.get('content-range'))headers['Content-Range']=upstream.headers.get('content-range');
  if(maybeHls&&upstream.ok){
    // Bound memory while reading HLS manifests; abort oversized responses promptly.
    const fragments=[];let bytes=0;
    for await (const chunk of upstream.body){bytes+=chunk.byteLength;if(bytes>5*1024*1024){ctrl.abort();throw Error('Manifest quá lớn');}fragments.push(Buffer.from(chunk));}
    const txt=Buffer.concat(fragments).toString('utf8');
    if(/#EXT-X-/i.test(txt)){
      const rewritten=rewriteHls(txt,upstream.url,proxyUrl);
      const b=Buffer.from(rewritten,'utf8');res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b);
    }else{res.writeHead(upstream.status,headers);res.end(txt);}
    clearTimeout(timeout);return;
  }
  if(!upstream.ok){res.writeHead(upstream.status,headers);res.end();clearTimeout(timeout);return;}
  const l=upstream.headers.get('content-length');if(l)headers['Content-Length']=l;
  // A perpetual MPEG-TS/MP4 stream must not be aborted 25 seconds after it starts.
  // Timeouts apply to the upstream handshake, never to a healthy active response.
  pipeContinuousResponse({upstream,response:res,controller:ctrl,connectTimeout:timeout,headers});
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
  let stderr='';child.stderr.on('data',d=>{stderr+=d.toString().slice(0,1000);});
  const kill=setTimeout(()=>{child.kill('SIGKILL');},12000);
  child.on('error',e=>{clearTimeout(kill);reject(new Error('Không khởi động được FFmpeg: '+e.message));});
  child.on('close',code=>{clearTimeout(kill);
    if(code===0&&fs.existsSync(dest)&&fs.statSync(dest).size>300)return resolve({file:name,data:`http://127.0.0.1:${port}/snapshot?key=${secret}&file=${encodeURIComponent(name)}`,method:'FFmpeg'});
    try{fs.unlinkSync(dest);}catch{}reject(new Error(stderr.slice(-200)||'Không chụp được video từ luồng này'));
  });
 });
}
function setupIPC(){
 ipcMain.handle('timeshift:start',(_e,url)=>{
   urlOK(url);requireFfmpeg();const {id}=timeshift.start(url);
   return {id,url:`http://127.0.0.1:${port}/buffer?key=${secret}&id=${id}&file=rolling.m3u8`};
 });
 ipcMain.handle('timeshift:stop',()=>{timeshift.stop();return true;});
 ipcMain.handle('timeshift:status',()=>timeshift.status());
 ipcMain.handle('reminder:notify',(_e,title,body)=>{const {Notification}=require('electron');if(!Notification.isSupported())return false;new Notification({title:String(title).slice(0,100),body:String(body).slice(0,200)}).show();return true;});
 ipcMain.handle('epg:fetch',async(_e,url)=>await fetchGuide(url));
 ipcMain.handle('update:check',async()=>await updates.checkForUpdates());
 ipcMain.handle('update:status',()=>updates.snapshot());
 ipcMain.handle('update:download',async()=>await updates.download());
 ipcMain.handle('update:install',()=>updates.install());
 ipcMain.handle('update:openDownloaded',async()=>{if(updates.snapshot().phase!=='manual-ready'||!updates.downloadedPath)throw Error('Chưa có bộ cài đã xác minh');return shell.openPath(updates.downloadedPath);});
 ipcMain.handle('update:openRelease',async()=>shell.openExternal('https://github.com/trisanghy/open-iptv-pro/releases/latest'));
 ipcMain.handle('update:openReleases',async()=>shell.openExternal('https://github.com/trisanghy/open-iptv-pro/releases')); 
 ipcMain.handle('app:capabilities',()=>({native:true,platform:process.platform,ffmpegExists:!!ffmpegPath(),snapshotBase:`http://127.0.0.1:${port}/snapshot?key=${secret}&file=`,version:app.getVersion()}));
 ipcMain.handle('source:readFile', async()=>{
  const r=await dialog.showOpenDialog(webWindow,{title:'Chọn playlist M3U',properties:['openFile'],filters:[{name:'Danh sách IPTV',extensions:['m3u','m3u8','txt']},{name:'Tất cả',extensions:['*']} ]});
  if(r.canceled||!r.filePaths[0])return null;const p=r.filePaths[0];const data=fs.readFileSync(p);if(data.length>MAX_PLAYLIST)throw new Error('File quá lớn');
  return {name:path.basename(p),content:data.toString('utf8')};
 });
 ipcMain.handle('source:readUrl',async(_e,url)=>({content:await readURL(url)}));
 ipcMain.handle('media:proxy',(_e,url)=>{urlOK(url);return proxyUrl(url);});
 ipcMain.handle('media:kind',async(_e,url)=>{
   urlOK(url);const cached=mediaKindCache.get(url);if(cached&&Date.now()-cached.at<15*60_000)return cached.value;const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),5000);
   try{
     const r=await fetch(url,{headers:{Range:'bytes=0-2047','User-Agent':'Open-IPTV-Pro/4.19'},signal:ctrl.signal});
     const ct=r.headers.get('content-type')||'';let sample='';
     if(r.body){const rd=r.body.getReader();const part=await rd.read();if(part.value)sample=Buffer.from(part.value).subarray(0,2048).toString('utf8');await rd.cancel();}
     const value={hls:/mpegurl/i.test(ct)||(/^#EXTM3U/m.test(sample)&&/#EXT-X-/.test(sample))};
     if(mediaKindCache.size>150)mediaKindCache.clear();mediaKindCache.set(url,{at:Date.now(),value});return value;
   }catch{return {hls:false};}finally{clearTimeout(t);}
 });
 ipcMain.handle('link:check',async(_e,url)=>{urlOK(url);return await checkRepeated(url);});
 ipcMain.handle('snapshot:make',async(_e,url,name)=>await makeSnapshot(url,name));
 ipcMain.handle('file:export',async(_e,name,content)=>{
  const r=await dialog.showSaveDialog(webWindow,{defaultPath:name||'iptv.m3u',filters:[{name:'IPTV Playlist',extensions:['m3u']}]});if(r.canceled||!r.filePath)return null;
  const p=r.filePath;const temp=p+'.tmp-'+randomBytes(4).toString('hex');fs.writeFileSync(temp,content,'utf8');fs.renameSync(temp,p);return p;
 });
 ipcMain.handle('source:listRepo',async(_e,url)=>await listPublicPlaylists(url));
 ipcMain.handle('system:openVLC',()=>shell.openExternal('https://www.videolan.org/vlc/'));
}
function createWindow(){
 webWindow=new BrowserWindow({width:1360,height:850,minWidth:980,minHeight:640,backgroundColor:nativeTheme.shouldUseDarkColors?'#080e15':'#f3f6fb',title:'Open IPTV Pro 4.19',icon:path.join(__dirname,'../assets/icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true}});
 webWindow.loadFile(path.join(__dirname,'../renderer/index.html'));
 webWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 webWindow.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file:'))event.preventDefault();});
}
app.whenReady().then(async()=>{timeshift=createTimeshift({baseDir:app.getPath('userData'),ffmpegPath:ffmpegPath()||'ffmpeg',logger:()=>{}});await startProxy();
 let nativeUpdater=null;try{nativeUpdater=require('electron-updater').autoUpdater;}catch(e){console.warn('Updater unavailable:',e.message);}
 updates=new UpdateManager({app,updater:nativeUpdater});
 updates.on('status',s=>{if(webWindow&&!webWindow.isDestroyed())webWindow.webContents.send('update:status',s);});
 setupIPC();createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});}).catch(e=>{dialog.showErrorBox('Open IPTV Pro lỗi khởi chạy',String(e.stack||e));app.quit();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('before-quit',()=>{try{timeshift?.stop();}catch{}try{server.close();}catch{}});
