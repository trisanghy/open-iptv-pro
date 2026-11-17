'use strict';
// Resolve the platform-specific FFprobe executable inside a real Electron app.
// Executables in app.asar are not spawnable; prefer the unpacked sibling path.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
function unpacked(candidate){
 const value=String(candidate||'');
 if(value.includes('app.asar.unpacked'))return value;
 return value.replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep);
}
function checkedBinary(candidate,{exists=fs.existsSync,spawn=spawnSync}={}){
 for(const name of [...new Set([unpacked(candidate),candidate].filter(Boolean))]){
  if(!path.isAbsolute(name)||!exists(name))continue;
  try{
   const result=spawn(name,['-version'],{shell:false,stdio:'ignore',windowsHide:true,timeout:5000});
   if(!result.error&&result.status===0)return name;
  }catch{}
 }
 return null;
}
function resolveBundledFFprobe({load=require,exists=fs.existsSync,spawn=spawnSync,
 environment=process.env,platform=process.platform}={}){
 const candidates=[];
 try{candidates.push(load('@ffprobe-installer/ffprobe').path);}catch{}
 candidates.push(environment.OPEN_IPTV_FFPROBE);
 if(platform==='darwin')candidates.push('/opt/homebrew/bin/ffprobe','/usr/local/bin/ffprobe','/opt/local/bin/ffprobe');
 else if(platform==='win32')candidates.push('C:\\ffmpeg\\bin\\ffprobe.exe');
 const exe=platform==='win32'?'ffprobe.exe':'ffprobe';
 for(const dir of String(environment.PATH||'').split(path.delimiter).filter(Boolean)){
  candidates.push(path.join(dir,exe));
 }
 for(const candidate of [...new Set(candidates.filter(Boolean))]){
  const result=checkedBinary(candidate,{exists,spawn});
  if(result)return result;
 }
 return null;
}
function pythonAudioEnvironment({environment=process.env,ffprobe=null,ffmpeg=null}={}){
 const paths=[ffprobe,ffmpeg].filter(Boolean);
 const binDirs=[...new Set(paths.map(file=>path.dirname(file)))];
 const extra=binDirs.length?binDirs.join(path.delimiter)+path.delimiter:'';
 return {...environment,
  PATH:extra+String(environment.PATH||''),
  ...(ffprobe?{FFPROBE_BINARY:ffprobe,FFPROBE_PATH:ffprobe}:{}),
  ...(ffmpeg?{FFMPEG_BINARY:ffmpeg,FFMPEG_PATH:ffmpeg}:{}),
 };
}
module.exports={resolveBundledFFprobe,pythonAudioEnvironment,checkedBinary,unpacked};
