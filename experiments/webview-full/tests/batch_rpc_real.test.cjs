'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {spawn,spawnSync}=require('node:child_process');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os'),http=require('node:http'),readline=require('node:readline');
const ffmpeg=process.env.OPEN_IPTV_FFMPEG||'ffmpeg';
const ffmpegAvailable=spawnSync(ffmpeg,['-version'],{stdio:'ignore'}).status===0;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
test('WebView native HTTP: quick batch submit, 32 check workers and real FFmpeg batch JPEGs',{skip:!ffmpegAvailable,timeout:45000},async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-speed-batch-'));
 const fixture=path.join(tmp,'video.ts');
 const render=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=320x180:rate=5','-t','2','-c:v','mpeg2video','-f','mpegts','-y',fixture],{timeout:15000});
 assert.equal(render.status,0,String(render.stderr));const bytes=fs.readFileSync(fixture);
 const server=http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'video/mp2t','Content-Length':bytes.length});res.end(bytes);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const child=spawn(process.execPath,[path.resolve(__dirname,'../backend/main.cjs')],{env:{...process.env,OPEN_IPTV_FFMPEG:ffmpeg,XDG_CONFIG_HOME:tmp},stdio:['ignore','pipe','pipe']});
 const rl=readline.createInterface({input:child.stdout});let stderr='';child.stderr.on('data',b=>stderr+=String(b).slice(-1000));
 try{
  const ready=await Promise.race([(async()=>{for await(const line of rl)if(line.startsWith('OPEN_IPTV_BACKEND_READY:'))return JSON.parse(line.slice('OPEN_IPTV_BACKEND_READY:'.length));throw Error(stderr)})(),new Promise((_,rej)=>setTimeout(()=>rej(Error('Startup timed out '+stderr)),10000))]);
  // Use fixed marker length rather than assumed index for robustness.
  assert.ok(ready.port&&ready.secret);
  const rpc=async(method,...args)=>{
   const response=await fetch(`http://127.0.0.1:${ready.port}/rpc?key=${ready.secret}`,{method:'POST',headers:{Origin:'tauri://localhost','X-IPTV-Key':ready.secret,'Content-Type':'application/json'},body:JSON.stringify({method,args})});
   assert.equal(response.status,200);const result=await response.json();assert.equal(result.ok,true,JSON.stringify(result));return result.data;
  };
  const checkItems=Array.from({length:64},(_,i)=>({url:`${base}/watch-${i}.ts`,label:`Channel ${i}`}));
  const started=Date.now();const check=await rpc('batch:start',{kind:'check',items:checkItems,concurrency:32});
  assert.equal(check.workers,32);assert.ok(Date.now()-started<1500,'Batch submission should not await probes');
  async function drain(id){let offset=0,all=[];const start=Date.now();while(Date.now()-start<20000){const state=await rpc('batch:status',id,offset);all.push(...state.results);offset=state.nextOffset;if(state.finished&&offset>=state.done)return {state,all};await wait(80)}throw Error('Timed out collecting results')}
  const checked=await drain(check.id);assert.equal(checked.state.done,64);assert.equal(checked.state.peak,32);assert.equal(checked.all.filter(x=>x.ok&&x.value.status==='alive').length,64);
  const shot=await rpc('batch:start',{kind:'snapshot',items:Array.from({length:8},(_,i)=>({url:`${base}/watch-${i}.ts`,label:`Shot ${i}`})),concurrency:8});
  const captured=await drain(shot.id);assert.equal(captured.state.done,8);assert.equal(captured.all.filter(x=>x.ok).length,8,JSON.stringify(captured.all.filter(x=>!x.ok)));
  const first=captured.all[0].value;const res=await fetch(first.data);assert.equal(res.status,200);const jpeg=Buffer.from(await res.arrayBuffer());assert.equal(jpeg[0],0xff);assert.equal(jpeg[1],0xd8);
 }finally{child.kill('SIGKILL');rl.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(tmp,{recursive:true,force:true});}
});
