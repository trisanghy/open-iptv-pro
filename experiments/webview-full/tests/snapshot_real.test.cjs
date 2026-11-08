'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {spawnSync}=require('node:child_process');
const {createSnapshotEngine,captureOnce,validHttpUrl}=require('../backend/snapshot.cjs');
const ffmpeg=process.env.OPEN_IPTV_FFMPEG||'ffmpeg';
const available=spawnSync(ffmpeg,['-version'],{stdio:'ignore'}).status===0;
let server,base,tmpDir,video;
const cleanup=async()=>{if(server)await new Promise(r=>server.close(r));if(tmpDir)fs.rmSync(tmpDir,{recursive:true,force:true});};
test('Snapshot engine real FFmpeg: direct + fallback proxy + valid JPEG + errors', {skip:!available},async()=>{
 tmpDir=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-snapshot-'));
 const render=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=352x198:rate=5','-t','2','-c:v','mpeg2video','-f','mpegts','-y',path.join(tmpDir,'test.ts')],{timeout:15000});
 assert.equal(render.status,0,String(render.stderr));video=fs.readFileSync(path.join(tmpDir,'test.ts'));
 server=http.createServer((req,res)=>{
  if(req.url.startsWith('/blocked')){res.writeHead(403);res.end('unauthorized');return;}
  if(req.url.startsWith('/segment.ts')||req.url.startsWith('/watch.ts')||req.url.startsWith('/proxy')){
    res.writeHead(200,{'Content-Type':'video/mp2t','Content-Length':video.length});res.end(video);return;
  }
  res.writeHead(404);res.end();
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;
 const engine=createSnapshotEngine({ffmpeg,folder:path.join(tmpDir,'snapshots'),proxy:(url)=>base+'/proxy?url='+encodeURIComponent(url),baseUrl:()=>base+'/snapshot?file=',timeoutMs:7000});
 try{
  const direct=await engine(base+'/watch.ts','Direct Video');
  assert.equal(direct.method,'FFmpeg');assert.ok(fs.statSync(path.join(tmpDir,'snapshots',direct.file)).size>1000);assert.ok(direct.data.startsWith(base+'/snapshot?file='));
  const fallback=await engine(base+'/blocked.ts','Proxy Channel');
  assert.equal(fallback.method,'FFmpeg · Proxy');assert.ok(fs.existsSync(path.join(tmpDir,'snapshots',fallback.file)));
  const failedEngine=createSnapshotEngine({ffmpeg,folder:path.join(tmpDir,'failed'),proxy:()=>base+'/blocked.ts',baseUrl:()=>base+'/snapshot?file=',timeoutMs:4000});
  await assert.rejects(()=>failedEngine(base+'/blocked.ts','Definitely broken'),/nguồn gốc:.*proxy cục bộ:/);
  assert.throws(()=>validHttpUrl('file:///tmp/test'),/HTTP\/HTTPS/);
 }finally{await cleanup();}
});

test('Snapshot via actual WebView RPC returns an accessible JPEG', {skip:!available},async()=>{
 const {spawn}=require('node:child_process');const readline=require('node:readline');
 const root=path.resolve(__dirname,'..');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-snapshot-rpc-'));
 const fixture=path.join(temp,'test.ts');
 const render=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=352x198:rate=5','-t','2','-c:v','mpeg2video','-f','mpegts','-y',fixture],{timeout:15000});
 assert.equal(render.status,0,String(render.stderr));
 const videoBytes=fs.readFileSync(fixture);
 const media=http.createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'video/mp2t','Content-Length':videoBytes.length});res.end(videoBytes);});
 await new Promise(r=>media.listen(0,'127.0.0.1',r));
 const proc=spawn(process.execPath,[path.join(root,'backend','main.cjs')],{env:{...process.env,OPEN_IPTV_FFMPEG:ffmpeg,XDG_CONFIG_HOME:temp},stdio:['ignore','pipe','pipe']});
 let ready,stderr='';proc.stderr.on('data',chunk=>stderr=(stderr+String(chunk)).slice(-2000));
 const lines=readline.createInterface({input:proc.stdout});
 try{
  ready=await Promise.race([
   (async()=>{for await(const line of lines){if(line.startsWith('OPEN_IPTV_BACKEND_READY:'))return JSON.parse(line.slice('OPEN_IPTV_BACKEND_READY:'.length));}throw Error('backend closed: '+stderr)})(),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('backend startup timeout: '+stderr)),10000))
  ]);
  const request=await fetch(`http://127.0.0.1:${ready.port}/rpc?key=${ready.secret}`,{
   method:'POST',headers:{Origin:'tauri://localhost','X-IPTV-Key':ready.secret,'Content-Type':'application/json'},
   body:JSON.stringify({method:'snapshot:make',args:[`http://127.0.0.1:${media.address().port}/watch.ts`,'RPC Channel']})
  });
  assert.equal(request.status,200);const r=await request.json();assert.equal(r.ok,true,JSON.stringify(r));assert.match(r.data.file,/\.jpg$/);
  const picture=await fetch(r.data.data);assert.equal(picture.status,200);assert.equal(picture.headers.get('content-type'),'image/jpeg');
  const bytes=Buffer.from(await picture.arrayBuffer());assert.equal(bytes[0],0xFF);assert.equal(bytes[1],0xD8);assert.ok(bytes.length>1000);
 }finally{proc.kill();lines.close();await new Promise(r=>media.close(r));fs.rmSync(temp,{recursive:true,force:true});}
});
