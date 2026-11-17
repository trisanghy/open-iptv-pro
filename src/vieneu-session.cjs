'use strict';
const {spawn}=require('node:child_process');
const readline=require('node:readline');
function createVieNeuSession({python,bridge,spawnProcess=spawn,env=process.env,onStatus=()=>{},args=['serve']}){
 if(!python||!bridge)throw Error('VieNeu needs validated Python and bridge paths');
 let child=null,ready=null,readyResolve=null,readyReject=null,seq=0;
 const pending=new Map();
 function failAll(error){
  for(const item of pending.values()){clearTimeout(item.timer);item.reject(error);}
  pending.clear();
 }
 function shutdown(){
  const old=child,abortLoad=readyReject;
  child=null;ready=null;readyResolve=null;readyReject=null;
  if(abortLoad)abortLoad(Error('Đã hủy tải/tổng hợp giọng'));
  if(old){try{old.kill('SIGTERM');}catch{}}
  failAll(Error('Đã hủy yêu cầu tổng hợp giọng'));
 }
 function ensure(){
  if(child&&ready)return ready;
  let stderr='';
  child=spawnProcess(python,['-u',bridge,...args],{windowsHide:true,shell:false,stdio:['pipe','pipe','pipe'],env});
  const proc=child;
  ready=new Promise((resolve,reject)=>{
   let settled=false;
   const timer=setTimeout(()=>done(Error('VieNeu load timeout')),120000);
   function done(error){
    if(settled)return;
    settled=true;clearTimeout(timer);error?reject(error):resolve();
   }
   readyResolve=()=>done();
   readyReject=e=>done(e);
   const lines=readline.createInterface({input:proc.stdout,crlfDelay:Infinity});
   lines.on('line',line=>{
    let data;try{data=JSON.parse(line);}catch{return;}
    if(data?.type==='ready'){onStatus('VieNeu đã tải mô hình vào bộ nhớ');done();return;}
    if(data?.id===undefined)return;
    const job=pending.get(data.id);
    if(!job)return;
    pending.delete(data.id);clearTimeout(job.timer);
    data.ok?job.resolve(true):job.reject(Error(String(data.error||'VieNeu failed')));
   });
   proc.stderr.on('data',b=>{stderr=(stderr+b.toString('utf8')).slice(-700);});
   proc.once('error',e=>{done(e);if(child===proc){child=null;ready=null;failAll(e);}});
   proc.once('exit',code=>{
    const e=Error('VieNeu exited '+code+': '+stderr.slice(-240));
    done(e);
    if(child===proc){child=null;ready=null;failAll(e);}
   });
  });
  return ready;
 }
 async function synthesize({voice,text,output,reference,referenceText,timeout=210000}){
  await ensure();
  if(!child)throw Error('VieNeu worker is not available');
  const id=++seq;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{
    pending.delete(id);
    reject(Error('VieNeu synthesis timeout'));
    // Only timeouts indicate deadlock: restart worker, normal cancellation does not.
    shutdown();
   },timeout);
   pending.set(id,{resolve,reject,timer});
   try{child.stdin.write(JSON.stringify({id,voice,text,output,reference,referenceText})+'\n');}
   catch(error){clearTimeout(timer);pending.delete(id);reject(error);}
  });
 }
 // Cancel in-flight local speech immediately; next request can rewarm model.
 function cancel(){if(child){shutdown();return true;}return false;}
 return Object.freeze({synthesize,shutdown,cancel,isWarm:()=>!!child&&!!ready});
}
module.exports={createVieNeuSession};
