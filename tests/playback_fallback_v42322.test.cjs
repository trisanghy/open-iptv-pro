'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const http=require('node:http');const {spawnSync}=require('node:child_process');
const {createPlaybackFallback,safeMediaUrl}=require('../src/playback-fallback.cjs');
const ffmpeg=process.env.OPEN_IPTV_FFMPEG||'ffmpeg';
const available=(()=>{try{return spawnSync(ffmpeg,['-version'],{stdio:'ignore',timeout:4000}).status===0;}catch{return false;}})();
const listen=s=>new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));
const close=s=>new Promise(resolve=>s.close(resolve));
test('fallback URL parser rejects unsafe schemes and embedded credentials',()=>{
 assert.throws(()=>safeMediaUrl('file:///etc/passwd'));
 assert.throws(()=>safeMediaUrl('http://name:secret@example.com/a.m3u8'));
 assert.equal(safeMediaUrl('https://example.com/x.m3u8?token=test'),'https://example.com/x.m3u8?token=test');
});
test('renderer controls manual and automatic FFmpeg and remembers successful transport',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../renderer/app.js'),'utf8');
 assert.match(app,/window\.streamleaf\.startPlaybackFallback\(url\)/);
 assert.match(app,/transport==='ffmpeg'/);
 assert.match(app,/playMode!=='timeshift'&&native&&!!window\.streamleaf\?\.startPlaybackFallback/);
 assert.match(app,/shouldAutoFfmpeg\(/);
 assert.match(app,/ffmpegTried=true/);
 assert.match(app,/stopPlaybackFallback\?\.\(oldFallback\)/);
 // During user Pause, FFmpeg/HLS errors must NOT restart decoding or unfreeze video.
 assert.match(app,/player\.addEventListener\('error',\(\)=>\{if\(pausedByUser\)return;if\(current&&player\.currentSrc&&\(hls\|\|dash\|\|player\.hasAttribute\('src'\)\)\)/);
 const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
 assert.match(html,/id="tryFfmpegBtn"/);
});
test('fallback is separate from DVR/timeshift and endpoint requires loopback token',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../src/main.cjs'),'utf8');
 assert.match(main,/createPlaybackFallback/);
 assert.match(main,/local\.pathname==='\/playback-fallback'/);
 assert.match(main,/local\.searchParams\.get\('key'\)!==secret/);
 assert.match(main,/ipcMain\.handle\('playback:fallback:start'/);
 assert.match(main,/ipcMain\.handle\('timeshift:start'/);
});
test('actual ffmpeg local HLS remux works after HTTP Chromium-style denial, files remain session-scoped', {skip:!available}, async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-fallback-v42322-'));
 let sourceServer;let fallback;
 try{
  const input=path.join(tmp,'source.ts');
  const make=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=blue:size=320x180:rate=25','-f','lavfi','-i','sine=frequency=440:sample_rate=44100',
   '-t','8','-c:v','libx264','-preset','ultrafast','-g','50','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-f','mpegts',input],{timeout:14000});
  assert.equal(make.status,0,make.stderr?.toString());
  sourceServer=http.createServer((req,res)=>{
   if(String(req.headers['user-agent']||'').includes('Chrome')){res.writeHead(403);res.end('denied');return;}
   res.writeHead(200,{'Content-Type':'video/mp2t','Content-Length':fs.statSync(input).size});fs.createReadStream(input).pipe(res);
  });
  await listen(sourceServer);
  const url=`http://127.0.0.1:${sourceServer.address().port}/video.ts`;
  const denied=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Chrome/131'}});assert.equal(denied.status,403);
  fallback=createPlaybackFallback({baseDir:tmp,ffmpegPath:ffmpeg,readyTimeoutMs:14000,pollMs:100});
  const {id,ready}=await fallback.start(url);assert.ok(ready);
  const playlist=fallback.read(id,'index.m3u8').data.toString();
  assert.match(playlist,/#EXTM3U/);
  const file=playlist.split(/\r?\n/).find(x=>/^segment_\d{6}\.ts$/.test(x));
  assert.ok(file,'no segment file');assert.ok(fallback.read(id,file).data.length>500);
  assert.throws(()=>fallback.read(id,'../secret.txt'));
  assert.throws(()=>fallback.read('wrong-id',file));
  assert.equal(fallback.stop('wrong-id'),false);
  assert.equal(fallback.stop(id),true);
  assert.equal(fallback.status().active,false);
 }finally{fallback?.stop();if(sourceServer)await close(sourceServer);fs.rmSync(tmp,{recursive:true,force:true});}
});
