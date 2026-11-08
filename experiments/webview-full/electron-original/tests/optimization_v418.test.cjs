'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {pipeContinuousResponse}=require('../src/stream-response.cjs');
const pkg=require('../package.json');
function listen(server){return new Promise(r=>server.listen(0,'127.0.0.1',()=>r(server.address().port)));}
function close(server){return new Promise(r=>server.close(r));}
test('Full build: after media headers, live response is not killed by initial handshake timeout',async()=>{
 const upstream=http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'video/mp2t'});res.flushHeaders();
  let tick=0;const timer=setInterval(()=>{tick++;res.write('segment'+tick+'\n');if(tick===5){clearInterval(timer);res.end('done');}},32);
  res.on('close',()=>clearInterval(timer));
 });
 const port=await listen(upstream);
 const downstream=http.createServer(async(req,res)=>{
  const controller=new AbortController();const connectTimeout=setTimeout(()=>controller.abort(),75);
  try{const r=await fetch('http://127.0.0.1:'+port+'/',{signal:controller.signal});
   pipeContinuousResponse({upstream:r,response:res,controller,connectTimeout,headers:{'Content-Type':'video/mp2t'}});
  }catch(e){res.writeHead(502);res.end(e.message);}
 });
 const localPort=await listen(downstream);
 try{const reply=await fetch('http://127.0.0.1:'+localPort+'/');assert.equal(reply.status,200);
  const body=await reply.text();assert.match(body,/segment1/);assert.match(body,/segment5/);assert.match(body,/done/);
 }finally{await close(downstream);await close(upstream);}
});
test('v4.19 Full: FFmpeg packaged and full desktop capabilities retained',()=>{
 assert.equal(pkg.version,'4.19.0');
 assert.equal(pkg.dependencies['ffmpeg-static'],'5.3.0');
 assert.ok(pkg.build.asarUnpack.includes('node_modules/ffmpeg-static/**'));
 assert.ok(pkg.build.files.includes('node_modules/**/*'));
 assert.equal(pkg.build.mac.target.includes('zip'),true);
 assert.equal(pkg.build.mac.target.includes('dmg'),true);
 assert.equal(pkg.build.win.target.some(x=>x.target==='nsis'),true);
 assert.equal(pkg.build.win.target.some(x=>x.target==='portable'),true);
 assert.ok(pkg.scripts['dist:mac:universal'].includes('--universal'));
 const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
 for(const id of ['doctorRun','doctorExport','doctorVisualScan','doctorV2Undo','bufferToggle','bufferRewind','bufferRewind5','bufferLive','autoTimeshiftSetting','shotsAllBtn','snapshotWorkersQuick','checkWorkersQuick','multiGrid','pipBtn','quickChecks','quickShots','quickExport'])assert.ok(html.includes(`id="${id}"`),id);
 assert.ok(html.includes('FFmpeg tích hợp'));
 assert.ok(!html.includes('Bản Lite không kèm FFmpeg'));
 const native=fs.readFileSync(path.join(__dirname,'../src/main.cjs'),'utf8');
 assert.ok(native.includes("require('ffmpeg-static')"));
 assert.ok(native.includes("replace('app.asar','app.asar.unpacked')"));
 assert.ok(native.includes("ipcMain.handle('timeshift:start'"));
 assert.ok(native.includes("ipcMain.handle('snapshot:make'"));
});
