'use strict';
/** Portable, local-only Open IPTV Pro backup format (JSON + embedded JPEGs). */
const fs=require('node:fs');
const path=require('node:path');
const {randomBytes,createHash}=require('node:crypto');
const MAGIC='open-iptv-pro-backup';
const FORMAT_VERSION=1;
const MAX_BACKUP_BYTES=128*1024*1024;
const MAX_STORAGE_BYTES=16*1024*1024;
const MAX_IMAGES_BYTES=96*1024*1024;
const MAX_IMAGE_BYTES=5*1024*1024;
const MAX_IMAGE_COUNT=2000;
const imageName=/^[\p{L}\p{N}_.-]{1,160}\.jpg$/u;
const allowedKey=k=>typeof k==='string'&&(k.startsWith('open-iptv-pro-')||k.startsWith('open-iptv-doctor-v2-')||k==='streamleaf-3')&&k.length<128;
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const hash=b=>createHash('sha256').update(b).digest('hex');
function checkedStorage(raw){
 if(!obj(raw))throw Error('Dữ liệu cài đặt trong bản sao lưu không hợp lệ.');
 const entries=Object.entries(raw);
 if(entries.length>64||entries.some(([k,v])=>!allowedKey(k)||typeof v!=='string'))throw Error('Bản sao lưu có khóa dữ liệu không được hỗ trợ.');
 const clean=Object.fromEntries(entries);
 if(!clean['open-iptv-pro-4']&&!clean['streamleaf-3'])throw Error('Bản sao lưu thiếu dữ liệu chính của IPTV.');
 if(Buffer.byteLength(JSON.stringify(clean),'utf8')>MAX_STORAGE_BYTES)throw Error('Cấu hình quá lớn (giới hạn 16 MB).');
 const state=JSON.parse(clean['open-iptv-pro-4']||clean['streamleaf-3']);
 if(!obj(state)||!Array.isArray(state.sources)||!Array.isArray(state.channels)||!obj(state.snapshots||{}))throw Error('Playlist hoặc dữ liệu kênh trong bản sao lưu bị lỗi.');
 for(const key of ['open-iptv-pro-settings-v1','open-iptv-pro-advanced-v1']){
  if(clean[key]){const config=JSON.parse(clean[key]);if(!obj(config))throw Error('Cấu hình tùy chọn không hợp lệ.');}
 }
 return clean;
}
function getState(storage){return JSON.parse(storage['open-iptv-pro-4']||storage['streamleaf-3']);}
function writeState(storage,state){const key=storage['open-iptv-pro-4']?'open-iptv-pro-4':'streamleaf-3';storage[key]=JSON.stringify(state);return storage;}
function validImage(buf){return buf.length>4&&buf.length<=MAX_IMAGE_BYTES&&buf[0]===0xff&&buf[1]===0xd8&&buf[2]===0xff;}
async function createBackup(storageRaw,snapshotDir,options={}){
 const storage=checkedStorage(storageRaw),state=getState(storage),images=Object.create(null);
 let bytes=0,missing=0,imagesCount=0;
 const includeSnapshots=options.includeSnapshots!==false;
 for(const snap of Object.values(state.snapshots||{})){
  if(!obj(snap)||typeof snap.file!=='string')continue;
  const filename=snap.file;
  if(!includeSnapshots||!imageName.test(filename)){
   delete snap.file; // A missing file must never shadow a valid inline image.
   continue;
  }
  if(images[filename])continue;
  try{
   const file=path.join(snapshotDir,filename);
   const stat=await fs.promises.stat(file);
   if(!stat.isFile()||stat.size>MAX_IMAGE_BYTES)throw Error('image too large');
   const data=await fs.promises.readFile(file);
   if(!validImage(data))throw Error('invalid jpeg');
   bytes+=data.length;imagesCount++;
   if(imagesCount>MAX_IMAGE_COUNT||bytes>MAX_IMAGES_BYTES)throw Error('Đã vượt giới hạn 2.000 ảnh / 96 MB. Hãy bỏ chọn ảnh Snapshot rồi sao lưu.');
   images[filename]={content:data.toString('base64'),sha256:hash(data)};
  }catch(e){
   if(/giới hạn 2\.000/.test(e.message))throw e;
   missing++;
   delete snap.file;
  }
 }
 // Remove orphan snapshot records that only referenced an omitted file.
 for(const [url,snap] of Object.entries(state.snapshots||{})){
  if(obj(snap)&&!snap.file&&!snap.data)delete state.snapshots[url];
 }
 writeState(storage,state);
 const manifest={magic:MAGIC,formatVersion:FORMAT_VERSION,createdAt:new Date().toISOString(),appVersion:String(options.appVersion||''),includesSnapshots:includeSnapshots,storage,snapshotFiles:images};
 const output=Buffer.from(JSON.stringify(manifest),'utf8');
 if(output.length>MAX_BACKUP_BYTES)throw Error('Bản sao lưu quá lớn (128 MB). Hãy thử tắt sao lưu ảnh Snapshot.');
 return {output,summary:{sourceCount:state.sources.length,channelCount:state.channels.length,images:imagesCount,missingImages:missing,bytes:output.length}};
}
async function saveAtomic(filename,buffer){
 const temp=filename+'.tmp-'+randomBytes(5).toString('hex');
 try{await fs.promises.writeFile(temp,buffer,{flag:'wx',mode:0o600});await fs.promises.rename(temp,filename);}catch(e){await fs.promises.unlink(temp).catch(()=>{});throw e;}
}
async function readBackup(filename){
 const stat=await fs.promises.stat(filename);
 if(!stat.isFile()||stat.size>MAX_BACKUP_BYTES)throw Error('File sao lưu không hợp lệ hoặc vượt 128 MB.');
 const bytes=await fs.promises.readFile(filename);
 let data;
 try{data=JSON.parse(bytes.toString('utf8'));}catch{throw Error('Không thể đọc file sao lưu (JSON hỏng).');}
 if(!obj(data)||data.magic!==MAGIC||data.formatVersion!==FORMAT_VERSION)throw Error('Không đúng định dạng .iptvbackup hoặc phiên bản chưa được hỗ trợ.');
 const storage=checkedStorage(data.storage),state=getState(storage);
 if(!obj(data.snapshotFiles))throw Error('Danh sách ảnh Snapshot trong file không hợp lệ.');
 const files=Object.entries(data.snapshotFiles);
 if(files.length>MAX_IMAGE_COUNT)throw Error('File có quá nhiều ảnh Snapshot.');
 let imagesBytes=0;
 for(const [name,value] of files){
  if(!imageName.test(name)||!obj(value)||typeof value.content!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(value.content)||typeof value.sha256!=='string')throw Error('Tên hoặc nội dung ảnh Snapshot không hợp lệ.');
  const buffer=Buffer.from(value.content,'base64');
  imagesBytes+=buffer.length;
  if(imagesBytes>MAX_IMAGES_BYTES||!validImage(buffer)||hash(buffer)!==value.sha256)throw Error('Ảnh Snapshot bị hỏng hoặc vượt dung lượng cho phép.');
 }
 return {data,sha256:hash(bytes),summary:{createdAt:data.createdAt,appVersion:data.appVersion,sourceCount:state.sources.length,channelCount:state.channels.length,images:files.length,bytes:bytes.length}};
}
async function restoreBackup(data,targetDir){
 checkedStorage(data.storage);
 const storage={...data.storage},state=getState(storage),maps=Object.create(null),written=[];
 try{
  await fs.promises.mkdir(targetDir,{recursive:true});
  for(const [filename,meta] of Object.entries(data.snapshotFiles)){
   const output=`restored_${randomBytes(8).toString('hex')}_${filename.slice(-90)}`;
   const filenameOut=output.length>160?output.slice(0,156)+'.jpg':output;
   const target=path.join(targetDir,filenameOut);
   const buffer=Buffer.from(meta.content,'base64');
   await fs.promises.writeFile(target,buffer,{flag:'wx',mode:0o600});
   maps[filename]=filenameOut;written.push(target);
  }
  for(const [url,snap] of Object.entries(state.snapshots||{})){
   if(!obj(snap)||!snap.file)continue;
   if(maps[snap.file])snap.file=maps[snap.file];
   else {delete snap.file;if(!snap.data)delete state.snapshots[url];}
  }
  writeState(storage,state);
  return {storage,createdFiles:written};
 }catch(e){await Promise.all(written.map(p=>fs.promises.unlink(p).catch(()=>{})));throw e;}
}
async function discardImportedImages(paths,baseDir){
 if(!Array.isArray(paths))return;
 await Promise.all(paths.filter(p=>typeof p==='string'&&path.dirname(p)===baseDir&&path.basename(p).startsWith('restored_')).map(p=>fs.promises.unlink(p).catch(()=>{})));
}
module.exports={MAGIC,FORMAT_VERSION,checkedStorage,createBackup,readBackup,restoreBackup,saveAtomic,discardImportedImages};
