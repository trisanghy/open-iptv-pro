'use strict';
// 10-second continuous FFmpeg audio windows for Whisper; persistent recorder avoids gaps.
// Read closed segment entries from FFmpeg's segment_list (not growing WAV files).
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function createContinuousCapture({ffmpeg,url,dir,spawnProc=spawn,chunkSeconds=10,notify=()=>{},pollMs=180}={}){
 if(!ffmpeg||!/^https?:\/\//i.test(String(url||''))||!dir)throw Error('Invalid continuous caption source');
 const seconds=Math.max(3,Math.min(10,Math.round(chunkSeconds)));
 const list=path.join(dir,'segments.csv');
 const args=['-hide_banner','-nostdin','-loglevel','error','-y','-rw_timeout','8000000',
  '-user_agent','Mozilla/5.0','-i',url,'-map','0:a:0','-vn','-sn','-dn',
  '-ac','1','-ar','16000','-c:a','pcm_s16le',
  '-f','segment','-segment_time',String(seconds),'-reset_timestamps','1',
  '-segment_list','segments.csv','-segment_list_type','csv',
  '-segment_format','wav','seg_%06d.wav'];
 fs.mkdirSync(dir,{recursive:true});
 let child=null,stopped=false,closed=false,lastError='',nextIndex=0,started=Date.now();
 function start(){
  if(child)throw Error('Capture already started');
  child=spawnProc(ffmpeg,args,{shell:false,windowsHide:true,cwd:dir,stdio:['ignore','ignore','pipe']});
  child.stderr?.on('data',b=>{lastError=(lastError+b.toString()).slice(-900);});
  child.once('error',e=>{closed=true;lastError=String(e.message||e).slice(-250);});
  child.once('close',()=>{closed=true;});
  return true;
 }
 function segments(){
  let content='';try{content=fs.readFileSync(list,'utf8');}catch{return [];}
  const entries=[];
  for(const line of content.split(/\r?\n/)){
   const match=line.match(/(?:^|["/])seg_(\d{6})\.wav(?:[" ,]|$)/);
   if(!match)continue;
   const index=Number(match[1]);if(index<nextIndex)continue;
   const file=path.join(dir,'seg_'+match[1]+'.wav');
   try{if(fs.statSync(file).size>=25000)entries.push({index,file});}catch{}
  }
  return entries.sort((a,b)=>a.index-b.index);
 }
 async function next(){
  while(!stopped){
   const ready=segments();
   if(ready.length){
    const first=ready[0];nextIndex=first.index+1;return first;
   }
   if(closed)throw Error('FFmpeg đã dừng ghi phụ đề: '+(lastError||'nguồn bị ngắt'));
   if(Date.now()-started>30000&&nextIndex===0)
    throw Error('Luồng âm thanh không tạo được đoạn đầu sau 30 giây');
   await delay(pollMs);
  }
  return null;
 }
 function stop(){
  stopped=true;
  if(child){try{child.kill('SIGKILL');}catch{}}
 }
 return Object.freeze({start,next,stop,segments,args,seconds,isStopped:()=>stopped});
}
module.exports={createContinuousCapture};
