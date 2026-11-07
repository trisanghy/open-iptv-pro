'use strict';
const {app,BrowserWindow,dialog,ipcMain,shell} = require('electron');
const path=require('node:path');
const fs=require('node:fs');
const http=require('node:http');
const {Readable}=require('node:stream');
const {randomBytes,createHash}=require('node:crypto');
const {spawn}=require('node:child_process');
const {checkRepeated}=require('./stream-check.cjs');
const {rewriteHls}=require('./core.cjs');
const {fetchGuide}=require('./epg.cjs');
const {checkUpdate}=require('./update-check.cjs');
const secret=randomBytes(20).toString('hex');
let webWindow, server, port;
const MAX_PLAYLIST=25*1024*1024;
function urlOK(raw){const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw new Error('Chỉ hỗ trợ URL http/https.');return u;}
function fileSafeName(s){return String(s).replace(/[^\p{L}\p{N}_.-]+/gu,'_').slice(0,80)||'channel';}
async function readURL(raw,maxBytes=MAX_PLAYLIST,timeout=18000){
 urlOK(raw);const c=new AbortController();const t=setTimeout(()=>c.abort(),timeout);
 try {const res=await fetch(raw,{signal:c.signal,redirect:'follow',headers:{'User-Agent':'Open-IPTV-Pro/4.1'}});
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
  if(local.pathname!=='/stream'){res.writeHead(404);res.end();return;}
  const url=local.searchParams.get('url');urlOK(url);
  const ctrl=new AbortController();
  const timeout=setTimeout(()=>ctrl.abort(),25000);
  const range=req.headers.range;
  const upstream=await fetch(url,{signal:ctrl.signal,redirect:'follow',headers:{'User-Agent':'Open-IPTV-Pro/4.1',...(range?{Range:range}:{})}});
  const ctype=upstream.headers.get('content-type')||'';
  const maybeHls=/\.m3u8?(?:$|\?)/i.test(upstream.url)||/mpegurl/i.test(ctype);
  const headers={'Content-Type':ctype||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':upstream.headers.get('accept-ranges')||'bytes'};
  if(upstream.headers.get('content-range'))headers['Content-Range']=upstream.headers.get('content-range');
  if(maybeHls&&upstream.ok){
    const txt=await upstream.text();
    if(txt.length>5*1024*1024)throw new Error('Manifest quá lớn');
    if(/#EXT-X-/i.test(txt)){
      const rewritten=rewriteHls(txt,upstream.url,proxyUrl);
      const b=Buffer.from(rewritten,'utf8');res.writeHead(200,{'Content-Type':'application/vnd.apple.mpegurl; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b);
    }else{res.writeHead(upstream.status,headers);res.end(txt);}
    clearTimeout(timeout);return;
  }
  if(!upstream.ok){res.writeHead(upstream.status,headers);res.end();clearTimeout(timeout);return;}
  const l=upstream.headers.get('content-length');if(l)headers['Content-Length']=l;
  res.writeHead(upstream.status,headers);
  const stream=Readable.fromWeb(upstream.body);stream.on('error',()=>res.destroy());stream.pipe(res);
  res.on('close',()=>{clearTimeout(timeout);ctrl.abort();stream.destroy();});
 }catch(e){if(!res.headersSent)res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});res.end('Không thể tải luồng: '+String(e.message||e).slice(0,200));}
}
async function startProxy(){
 server=http.createServer(handleStream);
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>{port=server.address().port;resolve();});});
}
function ffmpegPath(){
 try{let p=require('ffmpeg-static');if(p&&p.includes('app.asar'))p=p.replace('app.asar','app.asar.unpacked');if(p&&fs.existsSync(p))return p;}catch{}
 return 'ffmpeg';
}
async function makeSnapshot(url,label){
 urlOK(url);
 const folder=path.join(app.getPath('userData'),'snapshots');fs.mkdirSync(folder,{recursive:true});
 const name=`${fileSafeName(label)}_${Date.now()}_${randomBytes(3).toString('hex')}.jpg`;
 const dest=path.join(folder,name);
 return new Promise((resolve,reject)=>{
  const args=['-hide_banner','-nostdin','-loglevel','error','-y','-rw_timeout','10000000','-i',url,'-frames:v','1','-vf','scale=480:-2','-q:v','5',dest];
  const child=spawn(ffmpegPath(),args,{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let stderr='';child.stderr.on('data',d=>{stderr+=d.toString().slice(0,1000);});
  const kill=setTimeout(()=>{child.kill('SIGKILL');},16000);
  child.on('error',e=>{clearTimeout(kill);reject(new Error('Không khởi động được FFmpeg: '+e.message));});
  child.on('close',code=>{clearTimeout(kill);
    if(code===0&&fs.existsSync(dest)&&fs.statSync(dest).size>300)return resolve({file:name,data:`http://127.0.0.1:${port}/snapshot?key=${secret}&file=${encodeURIComponent(name)}`,method:'FFmpeg'});
    try{fs.unlinkSync(dest);}catch{}reject(new Error(stderr.slice(-200)||'Không chụp được video từ luồng này'));
  });
 });
}
function setupIPC(){
 ipcMain.handle('epg:fetch',async(_e,url)=>await fetchGuide(url));
 ipcMain.handle('update:check',async(_e,repo)=>await checkUpdate(repo,app.getVersion()));
 ipcMain.handle('update:openRelease',async(_e,repo)=>{const {validateRepo}=require('./update-check.cjs');const validated=validateRepo(repo);return shell.openExternal(`https://github.com/${validated}/releases/latest`);});
 ipcMain.handle('app:capabilities',()=>({native:true,platform:process.platform,ffmpegExists:fs.existsSync(ffmpegPath()),snapshotBase:`http://127.0.0.1:${port}/snapshot?key=${secret}&file=`,version:app.getVersion()}));
 ipcMain.handle('source:readFile', async()=>{
  const r=await dialog.showOpenDialog(webWindow,{title:'Chọn playlist M3U',properties:['openFile'],filters:[{name:'Danh sách IPTV',extensions:['m3u','m3u8','txt']},{name:'Tất cả',extensions:['*']} ]});
  if(r.canceled||!r.filePaths[0])return null;const p=r.filePaths[0];const data=fs.readFileSync(p);if(data.length>MAX_PLAYLIST)throw new Error('File quá lớn');
  return {name:path.basename(p),content:data.toString('utf8')};
 });
 ipcMain.handle('source:readUrl',async(_e,url)=>({content:await readURL(url)}));
 ipcMain.handle('media:proxy',(_e,url)=>{urlOK(url);return proxyUrl(url);});
 ipcMain.handle('media:kind',async(_e,url)=>{
   urlOK(url);const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),5000);
   try{
     const r=await fetch(url,{headers:{Range:'bytes=0-2047','User-Agent':'Open-IPTV-Pro/4.1'},signal:ctrl.signal});
     const ct=r.headers.get('content-type')||'';let sample='';
     if(r.body){const rd=r.body.getReader();const part=await rd.read();if(part.value)sample=Buffer.from(part.value).subarray(0,2048).toString('utf8');await rd.cancel();}
     return {hls:/mpegurl/i.test(ct)||(/^#EXTM3U/m.test(sample)&&/#EXT-X-/.test(sample))};
   }catch{return {hls:false};}finally{clearTimeout(t);}
 });
 ipcMain.handle('link:check',async(_e,url)=>{urlOK(url);return await checkRepeated(url);});
 ipcMain.handle('snapshot:make',async(_e,url,name)=>await makeSnapshot(url,name));
 ipcMain.handle('file:export',async(_e,name,content)=>{
  const r=await dialog.showSaveDialog(webWindow,{defaultPath:name||'iptv.m3u',filters:[{name:'IPTV Playlist',extensions:['m3u']}]});if(r.canceled||!r.filePath)return null;
  const p=r.filePath;const temp=p+'.tmp-'+randomBytes(4).toString('hex');fs.writeFileSync(temp,content,'utf8');fs.renameSync(temp,p);return p;
 });
 ipcMain.handle('github:publish',async(_e,config,content)=>await publishGithub(config,content));
 ipcMain.handle('system:openVLC',()=>shell.openExternal('https://www.videolan.org/vlc/'));
}
async function githubAPI(url, token, method='GET', body){
 const r=await fetch(url,{method,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'Open-IPTV-Pro/4.1',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(16000)});
 const s=await r.text();let data;try{data=JSON.parse(s);}catch{data={message:s.slice(0,200)};}
 if(!r.ok)throw new Error(`GitHub HTTP ${r.status}: ${data.message||'Lỗi không xác định'}`);
 return data;
}
async function publishGithub(config,content){
 const {token,type,id,repo,owner,branch='main',filename='iptv.m3u'}=config||{};
 if(!/^(gh[psuo]_|github_pat_)[a-zA-Z0-9_]+$/.test(token||''))throw new Error('Hãy nhập GitHub token hợp lệ. Token không được lưu trên máy.');
 if(String(content||'').length<8||!String(content).startsWith('#EXTM3U'))throw new Error('Nội dung playlist không hợp lệ');
 if(type==='gist'){
  if(!/^[0-9a-f]{8,64}$/i.test(id||''))throw new Error('Gist ID không hợp lệ');
  if(!/^[\w. -]{1,100}$/.test(filename))throw new Error('Tên file Gist không hợp lệ');
  const target=`https://api.github.com/gists/${id}`;
  const found=await githubAPI(target,token);
  if(!found.files||!Object.prototype.hasOwnProperty.call(found.files,filename))throw new Error('Gist không chứa tên file đã chọn: '+filename);
  await githubAPI(target,token,'PATCH',{files:{[filename]:{content}}});
  return {ok:true,url:`https://gist.github.com/${id}`,message:'Đã cập nhật Gist'};
 }
 if(type==='repo'){
  if(!/^[\w.-]{1,80}$/.test(owner||'')||!/^[\w.-]{1,100}$/.test(repo||'')||!branch||filename.includes('..')||filename.startsWith('/')||!/^([\w. -]+\/)*[\w. -]+$/.test(filename))throw new Error('Thông tin repository/đường dẫn không hợp lệ');
  const api=`https://api.github.com/repos/${owner}/${repo}/contents/${filename.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`;
  let sha;
  try{const old=await githubAPI(api,token);sha=old.sha;}catch(e){if(!/HTTP 404/.test(e.message))throw e;}
  await githubAPI(`https://api.github.com/repos/${owner}/${repo}/contents/${filename.split('/').map(encodeURIComponent).join('/')}`,token,'PUT',{message:'Update IPTV playlist via Open IPTV Pro',content:Buffer.from(content,'utf8').toString('base64'),branch,...(sha?{sha}:{})});
  return {ok:true,url:`https://github.com/${owner}/${repo}`,message:'Đã cập nhật repository'};
 }
 throw new Error('Chọn Gist hoặc repository');
}
function createWindow(){
 webWindow=new BrowserWindow({width:1360,height:850,minWidth:980,minHeight:640,backgroundColor:'#151025',title:'Open IPTV Pro 4.1',icon:path.join(__dirname,'../assets/icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true}});
 webWindow.loadFile(path.join(__dirname,'../renderer/index.html'));
 webWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 webWindow.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file:'))event.preventDefault();});
}
app.whenReady().then(async()=>{await startProxy();setupIPC();createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});}).catch(e=>{dialog.showErrorBox('Open IPTV Pro lỗi khởi chạy',String(e.stack||e));app.quit();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
app.on('before-quit',()=>{try{server.close();}catch{}});
