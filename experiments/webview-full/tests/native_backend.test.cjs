'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');const {once}=require('node:events');
const path=require('node:path');const readline=require('node:readline');
async function start(){
 const main=path.join(__dirname,'..','backend','main.cjs');
 const proc=spawn(process.execPath,[main],{env:{...process.env,OPEN_IPTV_FFMPEG:process.env.OPEN_IPTV_FFMPEG||'/usr/bin/ffmpeg'},stdio:['ignore','pipe','pipe']});
 let trace='';proc.stderr.on('data',d=>{trace=(trace+d.toString()).slice(-5000)});
 const rl=readline.createInterface({input:proc.stdout});
 const ready=await Promise.race([
  (async()=>{for await(const line of rl){if(line.startsWith('OPEN_IPTV_BACKEND_READY:'))return JSON.parse(line.slice('OPEN_IPTV_BACKEND_READY:'.length));}throw Error('backend exited: '+trace)})(),
  new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('backend timeout: '+trace)),10000);timer.unref();})
 ]);
 return {proc,...ready};
}
test('real backend accepts native API and rejects untrusted origin/token',async()=>{
 const backend=await start();const {proc,port,secret}=backend;
 async function call(method,origin,key){
  const response=await fetch(`http://127.0.0.1:${port}/rpc?key=${secret}`,{
   method:'POST',headers:{Origin:origin,'X-IPTV-Key':key,'Content-Type':'application/json'},
   body:JSON.stringify({method,args:[]})
  });return {response,data:response.ok?await response.json():null};
 }
 try{
  const a=await call('app:capabilities','tauri://localhost',secret);
  assert.equal(a.data?.ok,true);assert.equal(a.data?.data?.native,true);
  const b=await call('timeshift:status','tauri://localhost',secret);assert.equal(b.data?.data?.active,false);
  const c=await call('update:status','tauri://localhost',secret);assert.equal(c.data?.data?.phase,'idle');
  assert.equal((await call('update:status','https://evil.example',secret)).response.status,403);
  assert.equal((await call('update:status','tauri://localhost','wrong-token')).response.status,403);
  const preflight=await fetch(`http://127.0.0.1:${port}/rpc?key=${secret}`,{method:'OPTIONS',headers:{Origin:'tauri://localhost','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,x-iptv-key'}});
  assert.equal(preflight.status,204);
  assert.match(preflight.headers.get('access-control-allow-headers')||'',/X-IPTV-Key/i);
 }finally{proc.kill();}
});
