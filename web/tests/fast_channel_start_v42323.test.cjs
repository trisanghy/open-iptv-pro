'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {knownMedia,inspectQuick}=require('../renderer/startup-policy.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('known IPTV HLS/DASH/MP4 URLs avoid blocking mediaKind probe',async()=>{
 for(const [url,format] of [
  ['https://stream.test/vtv.m3u8?token=abc','hls'],
  ['https://stream.test/live/file.mpd?x=1','dash'],
  ['https://stream.test/video.mp4','mp4']
 ]){
  let probes=0;
  const result=await inspectQuick(url,()=>{probes++;return new Promise(()=>{});});
  assert.equal(result.format,format);assert.equal(probes,0);
 }
 assert.equal(knownMedia('https://server.test/?file=index.m3u8')?.hls,true);
 assert.equal(knownMedia('http://127.0.0.1:1010/buffer?id=abc&file=rolling.m3u8')?.hls,true);
});
test('unknown URLs are inspected for MIME with short time bound',async()=>{
 const result=await inspectQuick('https://stream.test/watch?id=2',()=>Promise.resolve({hls:true,format:'hls'}));
 assert.equal(result.hls,true);
 const at=Date.now();const fallback=await inspectQuick('https://stream.test/opaque',()=>new Promise(()=>{}),{timeoutMs:250});
 assert.equal(fallback.mode,'unknown');assert.ok(Date.now()-at<1200);
});
test('Electron prefers native HLS if supported then HLS.js without mandatory FFmpeg',()=>{
 const app=read('renderer/app.js');
 assert.match(app,/preferNativeHls\(/);
 assert.match(app,/activeEngine==='native-hls'/);
 assert.match(app,/quick\.inspectQuick\(url,u=>window\.streamleaf\.mediaKind\(u\)/);
 assert.match(app,/liveSyncDurationCount=2/);
 assert.match(app,/activeEngine==='native-hls'\?6500:transport==='ffmpeg'\?19000:24000/);
 assert.match(app,/IPTV playback first frame/);
 assert.match(read('renderer/index.html'),/startup-policy\.js/);
});
test('FFmpeg recovery is bounded and generates shorter segments rather than 1x input',()=>{
 const fallback=read('src/playback-fallback.cjs');
 assert.match(fallback,/readyTimeoutMs=14000/);
 assert.match(fallback,/'-hls_time','2'/);
 assert.match(fallback,/'-readrate','2'/);
 assert.doesNotMatch(fallback,/'-re'/);
});
