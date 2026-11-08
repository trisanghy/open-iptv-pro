'use strict';
// Update coordinator: release metadata is read-only until the user requests a download.
// Native auto-install is used only for appropriately packaged AND signed applications.
// Untrusted/missing signatures or incomplete releases use a checked manual installer.
const {EventEmitter}=require('node:events');
const {createHash}=require('node:crypto');
const {promises:fs,existsSync,createWriteStream}=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {Readable}=require('node:stream');
const {pipeline}=require('node:stream/promises');
const {checkUpdate}=require('./update-check.cjs');

const OFFICIAL_REPO='trisanghy/open-iptv-pro';
const HTTPS_RELEASE=`https://github.com/${OFFICIAL_REPO}/releases/download/`;

function identifyInstaller(assets,platform,arch){
  const list=(Array.isArray(assets)?assets:[]).filter(a=>a&&typeof a.name==='string'&&typeof a.url==='string');
  if(platform==='darwin'){
    const dmg=list.filter(a=>/\.dmg$/i.test(a.name));
    return dmg.find(a=>new RegExp(`(?:-|_|\\b)${arch}(?:-|_|\\.)`,'i').test(a.name))
      ||dmg.find(a=>/universal/i.test(a.name))
      ||dmg.find(a=>!/(?:arm64|aarch64|x64|x86_64)/i.test(a.name))||null;
  }
  if(platform==='win32'){
    const exe=list.filter(a=>/\.exe$/i.test(a.name)&&/setup|installer/i.test(a.name));
    return exe.find(a=>new RegExp(`(?:-|_|\\b)${arch}(?:-|_|\\.)`,'i').test(a.name))
      ||exe.find(a=>!/(?:arm64|aarch64|x64|x86_64)/i.test(a.name))||null;
  }
  return null;
}
function hasUpdateMetadata(assets,platform){
 const expected=platform==='darwin'?'latest-mac.yml':platform==='win32'?'latest.yml':null;
 return !!expected&&(assets||[]).some(a=>a.name===expected);
}
function isOfficialAsset(url){
 try{const u=new URL(url);return u.protocol==='https:'&&u.origin==='https://github.com'&&u.href.startsWith(HTTPS_RELEASE);}catch{return false;}
}
function safeFileName(name){
 if(typeof name!=='string'||!/^Open-IPTV-Pro-[\w.\- ]+\.(?:dmg|exe)$/i.test(name)||name.includes('..'))throw Error('Tên file cài đặt không hợp lệ');
 return name;
}
function canNativeInstall({app,platform,resourcesPath,execPath,env=process.env,spawn=spawnSync,fsExists=existsSync}){
 if(!app.isPackaged||!fsExists(path.join(resourcesPath,'app-update.yml')))return false;
 if(platform==='darwin'){
  // macOS/Squirrel requires a proper Apple Developer ID identity (same Team ID across versions).
  try{const r=spawn('/usr/bin/codesign',['-dv','--verbose=4',execPath],{encoding:'utf8',timeout:5000});
    const data=(r.stderr||'')+(r.stdout||'');return r.status===0 && /TeamIdentifier=([A-Z0-9]{10})\b/.test(data);
  }catch{return false;}
 }
 if(platform==='win32'){
  if(env.PORTABLE_EXECUTABLE_FILE)return false;
  try{
   const escaped=execPath.replace(/'/g,"''");
   const r=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',`(Get-AuthenticodeSignature -LiteralPath '${escaped}').Status.ToString()`],{encoding:'utf8',timeout:7000,windowsHide:true});
   return r.status===0&&String(r.stdout).trim()==='Valid';
  }catch{return false;}
 }
 return false;
}
function extractSha256(checksumText,fileName){
 const safe=String(fileName).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp(`^([0-9a-f]{64})\\s+\\*?${safe}$`,'im');
 return checksumText.match(re)?.[1]?.toLowerCase()||null;
}
function isTrustedRedirect(url){
 try{const u=new URL(url);return u.protocol==='https:' && (u.hostname==='github.com'||u.hostname==='release-assets.githubusercontent.com'||u.hostname.endsWith('.githubusercontent.com'));}catch{return false;}
}

class UpdateManager extends EventEmitter{
 constructor({app,platform=process.platform,arch=process.arch,resourcesPath=process.resourcesPath,execPath=process.execPath,updater=null,check=checkUpdate,fetcher=fetch,now=()=>Date.now(),signatureCheck=canNativeInstall,downloadsDir}){
  super();this.app=app;this.platform=platform;this.arch=arch;this.resourcesPath=resourcesPath;this.execPath=execPath;
  this.updater=updater;this.check=check;this.fetcher=fetcher;this.now=now;this.signatureCheck=signatureCheck;
  this.downloadsDir=downloadsDir||path.join(app.getPath('downloads'),'Open-IPTV-Pro-Updates');
  this.latestInfo=null;this.asset=null;this.downloadedPath=null;this.busy=false;this.lastProgress=0;
  this.state={phase:'idle',version:app.getVersion(),latest:null,message:'Chưa kiểm tra cập nhật',mode:null,progress:0,downloaded:false};
  if(updater){
   updater.autoDownload=false;updater.autoInstallOnAppQuit=false;
   updater.on('download-progress',p=>{
    const percent=Number(p.percent)||0;
    if(this.now()-this.lastProgress<250 && percent<100)return;
    this.lastProgress=this.now();this.setState({phase:'downloading',progress:Math.round(percent),transferred:p.transferred||0,total:p.total||0,message:`Đang tải bản cập nhật: ${Math.round(percent)}%`});
   });
   updater.on('update-downloaded',()=>{this.setState({phase:'downloaded',downloaded:true,progress:100,message:'Đã tải xong. Chọn Cài đặt & khởi động lại.'});});
   updater.on('error',e=>{this.setState({phase:'error',message:'Không thể cập nhật tự động: '+String(e.message||e).slice(0,240),mode:'manual'});});
  }
 }
 setState(delta){this.state={...this.state,...delta};this.emit('status',{...this.state});return {...this.state};}
 snapshot(){return {...this.state};}
 async checkForUpdates(){
  if(this.busy)throw Error('Một thao tác cập nhật khác đang chạy');
  this.busy=true;this.setState({phase:'checking',progress:0,message:'Đang kiểm tra GitHub Releases…'});
  try{
   const result=await this.check(OFFICIAL_REPO,this.app.getVersion(),this.fetcher);
   this.latestInfo=result;this.downloadedPath=null;this.asset=null;
   if(result.noRelease)return this.setState({phase:'no-release',latest:null,mode:null,downloaded:false,message:'Repository đã có mã nguồn nhưng chưa có GitHub Release. Không có bản cài đặt để cập nhật.'});
   if(!result.newer)return this.setState({phase:'up-to-date',latest:result.latest,mode:null,downloaded:false,message:`Đang dùng phiên bản mới nhất (${this.app.getVersion()}).`});
   const asset=identifyInstaller(result.assets,this.platform,this.arch);
   this.asset=asset;
   if(!asset)return this.setState({phase:'source-only',latest:result.latest,mode:null,downloaded:false,message:`Đã có ${result.latest}, nhưng Release chưa có bộ cài tương thích với ${this.platform}/${this.arch}.`});
   const signed=this.signatureCheck({app:this.app,platform:this.platform,resourcesPath:this.resourcesPath,execPath:this.execPath});
   const native=!!this.updater&&signed&&hasUpdateMetadata(result.assets,this.platform);
   return this.setState({phase:'available',latest:result.latest,mode:native?'automatic':'manual',assetName:asset.name,downloaded:false,
      message:native?`Có bản mới ${result.latest}. Có thể tải và cài tự động.`:`Có bản mới ${result.latest}. Bản đang dùng chưa đủ điều kiện cập nhật tự cài; có thể tải bộ cài đã xác minh rồi cài thủ công.`});
  }catch(e){return this.setState({phase:'error',message:'Không kiểm tra được bản cập nhật: '+String(e.message||e).slice(0,240),mode:null});}
  finally{this.busy=false;}
 }
 async download(){
  if(this.busy)throw Error('Một thao tác cập nhật khác đang chạy');
  if(this.state.phase!=='available'||!this.asset||!this.latestInfo?.newer)throw Error('Hãy kiểm tra và chọn bản cập nhật mới trước khi tải');
  this.busy=true;this.setState({phase:'downloading',progress:0,message:'Đang chuẩn bị tải bản cập nhật…'});
  try{
   if(this.state.mode==='automatic'){
    this.updater.setFeedURL({provider:'github',owner:'trisanghy',repo:'open-iptv-pro'});
    // Auto-updater validates sha512, signatures and update metadata before installation.
    const r=await this.updater.checkForUpdates();
    if(!r?.updateInfo)throw Error('Thiếu metadata cập nhật tự động');
    await this.updater.downloadUpdate();
    return this.snapshot();
   }
   // Unsigned and portable builds never auto-execute an installer.
   if(!isOfficialAsset(this.asset.url))throw Error('URL bộ cài không thuộc repository GitHub chính thức');
   const checksumAsset=(this.latestInfo.assets||[]).find(a=>a.name==='SHA256SUMS.txt'&&isOfficialAsset(a.url));
   let expected=null;
   if(this.asset.digest?.startsWith('sha256:'))expected=this.asset.digest.slice(7).toLowerCase();
   if(!expected && checksumAsset){
    const response=await this.fetcher(checksumAsset.url,{headers:{'User-Agent':'Open-IPTV-Pro/4.16'}});
    if(!response.ok||!isTrustedRedirect(response.url||checksumAsset.url))throw Error('Không đọc được bảng SHA256 từ GitHub');
    const sums=await response.text();if(sums.length>500_000)throw Error('Bảng SHA256 không hợp lệ');
    expected=extractSha256(sums,this.asset.name);
   }
   if(!expected||!/^[a-f0-9]{64}$/.test(expected))throw Error('Release thiếu checksum SHA256 hợp lệ; vui lòng tải thủ công từ GitHub Releases.');
   const filename=safeFileName(this.asset.name);
   await fs.mkdir(this.downloadsDir,{recursive:true});
   const finalPath=path.join(this.downloadsDir,filename),tmp=finalPath+'.part';
   let transferred=0;
   const response=await this.fetcher(this.asset.url,{headers:{'User-Agent':'Open-IPTV-Pro/4.16'}});
   if(!response.ok||!isTrustedRedirect(response.url||this.asset.url))throw Error('Không tải được từ GitHub Releases');
   const total=Number(response.headers?.get?.('content-length'))||Number(this.asset.size)||0;
   const sha=createHash('sha256');let sentAt=0;
   try{
    const sink=createWriteStream(tmp,{flags:'w'});
    const source=Readable.fromWeb(response.body);
    source.on('data',buf=>{
     sha.update(buf);transferred+=buf.length;
     if(this.now()-sentAt>=250){sentAt=this.now();this.setState({phase:'downloading',transferred,total,progress:total?Math.min(99,Math.floor(transferred/total*100)):0,message:`Đã tải ${(transferred/1048576).toFixed(1)} MB${total?' / '+(total/1048576).toFixed(1)+' MB':''}`});}
    });
    await pipeline(source,sink);
    if(sha.digest('hex')!==expected)throw Error('SHA256 không khớp: đã hủy file tải về để bảo vệ thiết bị');
    await fs.rename(tmp,finalPath);
   }catch(e){await fs.rm(tmp,{force:true}).catch(()=>{});throw e;}
   this.downloadedPath=finalPath;
   return this.setState({phase:'manual-ready',downloaded:true,progress:100,downloadedFile:finalPath,message:'Đã tải và kiểm tra SHA256. Mở bộ cài để nâng cấp thủ công; dữ liệu kênh được giữ lại.'});
  }catch(e){return this.setState({phase:'error',mode:'manual',downloaded:false,message:'Tải cập nhật không thành công: '+String(e.message||e).slice(0,250)});}
  finally{this.busy=false;}
 }
 install(){
  if(this.state.phase!=='downloaded'||this.state.mode!=='automatic'||!this.updater)throw Error('Chưa có bản cập nhật tự động đã tải xong');
  this.setState({phase:'installing',message:'Đang thoát ứng dụng và cài phiên bản mới…'});
  this.updater.quitAndInstall(false,true);
  return this.snapshot();
 }
}
module.exports={UpdateManager,OFFICIAL_REPO,identifyInstaller,hasUpdateMetadata,isOfficialAsset,extractSha256,canNativeInstall};
