'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {format,initialTransport,shouldAutoFfmpeg,preferNativeHls}=require('../renderer/playback-route-policy.js');
const {makeStreamFetcher}=require('../src/network-transport.cjs');
const {choose}=require('../renderer/playback-preference.js');
const {planReplacement}=require('../renderer/source-edit.js');
const source=fs.readFileSync(path.resolve(__dirname,'../renderer/app.js'),'utf8');
const main=fs.readFileSync(path.resolve(__dirname,'../src/main.cjs'),'utf8');
const ui=fs.readFileSync(path.resolve(__dirname,'../renderer/index.html'),'utf8');
const fake=(status=200)=>({status,ok:status>=200&&status<300});
test('FIX playlist stream families: HLS, DASH, FLV, opaque paths are routed independently',()=>{
 assert.equal(format('https://tv.test/live/master.m3u8?token=opaque'),'hls');
 assert.equal(format('https://tv.test/live/master.mpd'),'dash');
 assert.equal(format('https://tv.test/live/video.flv'),'flv');
 assert.equal(format('https://tv.test/api/tv360/?id=abcdef'),'unknown');
 assert.equal(format('https://tv.test/index.php?id=1'),'unknown');
 assert.equal(initialTransport('https://tv.test/live/video.flv'),'ffmpeg');
 assert.equal(initialTransport('https://tv.test/live/master.m3u8',{savedTransport:'ffmpeg',savedDurationMs:18000}),'relay');
 assert.equal(initialTransport('https://tv.test/live/master.mpd',{savedTransport:'ffmpeg',savedDurationMs:12000}),'relay');
 assert.equal(initialTransport('https://tv.test/api/tv360/?id=11',{savedTransport:'ffmpeg',savedDurationMs:2000}),'ffmpeg');
 assert.equal(initialTransport('https://tv.test/api/tv360/?id=11',{savedTransport:'ffmpeg',savedDurationMs:12000}),'relay');
});
test('HLS native only if supported; HLS.js first on Windows; last hls.js success skips repeated native trial',()=>{
 assert.equal(preferNativeHls({format:'hls',hasNativeSupport:true,isTimeshift:false}),true);
 assert.equal(preferNativeHls({format:'hls',hasNativeSupport:false}),false);
 assert.equal(preferNativeHls({format:'hls',hasNativeSupport:true,wasHlsJs:true}),false);
 assert.equal(preferNativeHls({format:'hls',hasNativeSupport:true,isTimeshift:true}),false);
});
test('HTTP denials and slow startup never trigger a costly automatic FFmpeg path',()=>{
 for(const msg of ['HLS fragLoadError (HTTP 403)','HTTP 401','Kết nối quá thời gian','Đứng hình quá 12 giây']){
  assert.equal(shouldAutoFfmpeg(msg,{url:'https://tv.test/video.m3u8'}),false,msg);
 }
 assert.equal(shouldAutoFfmpeg('HLS mediaError decode',{url:'https://tv.test/master.m3u8'}),true);
 assert.equal(shouldAutoFfmpeg('codec not supported',{url:'https://tv.test/stream.flv'}),true);
 assert.equal(shouldAutoFfmpeg('codec not supported',{url:'https://tv.test/stream.flv',alreadyTried:true}),false);
});
test('stream route restores old Node-first low-latency path',async()=>{
 const called=[];
 const stream=makeStreamFetcher(async()=>{called.push('node');return fake(200);},async()=>{called.push('chromium');return fake(200);});
 assert.equal((await stream('https://tv.test/hls.m3u8')).status,200);assert.deepEqual(called,['node']);
});
test('stream route falls back only for network errors, not HTTP 403',async()=>{
 const called=[];
 const stream=makeStreamFetcher(async()=>{called.push('node');throw Object.assign(Error('dns'),{code:'ENOTFOUND'});},async()=>{called.push('chromium');return fake(206);});
 assert.equal((await stream('https://tv.test/hls.m3u8')).status,206);assert.deepEqual(called,['node','chromium']);
 const deny=makeStreamFetcher(async()=>fake(403),async()=>{throw Error('must not retry 403');});
 assert.equal((await deny('https://tv.test/hls.m3u8')).status,403);
});
test('cancelled channel request never tries network fallback',async()=>{
 const c=new AbortController();c.abort();let chromium=0;
 const stream=makeStreamFetcher(async()=>{throw Object.assign(Error('abort'),{name:'AbortError'});},async()=>{chromium++;});
 await assert.rejects(stream('https://tv.test/a.m3u8',{signal:c.signal}),/abort/);assert.equal(chromium,0);
});
test('return A -> B -> A reuses verified URL but avoids cached slow FFmpeg for HLS',()=>{
 const a='https://tv.test/a.m3u8',b='https://tv.test/b.m3u8';
 const now=Date.parse('2026-11-16T08:00:00Z');
 const good={lastPlayableUrl:a,lastPlayableTransport:'ffmpeg',lastStartupDurationMs:13250,lastPlaybackAt:new Date(now-1200).toISOString()};
 const preferred=choose(good,[a,b],now);
 assert.equal(preferred.remembered,true);assert.equal(preferred.urls[0],a);
 assert.equal(initialTransport(a,{savedTransport:preferred.transport,savedDurationMs:good.lastStartupDurationMs}),'relay');
});
test('renderer uses native/HLS.js cascade before FFmpeg, and no fixed 13s kill',()=>{
 assert.match(ui,/playback-route-policy\.js[^]*app\.js/);
 assert.match(source,/activeEngine==='native-hls'[^]*tryPlayback\(candidate,generation,'relay'\)/);
 assert.match(source,/preferNativeHls\(/);
 assert.match(source,/shouldAutoFfmpeg\(/);
 assert.match(source,/initialTransport\(/);
 assert.match(source,/clearTimeout\(startupNoteTimer\)/);
 assert.doesNotMatch(source,/transport==='ffmpeg'\?18000:13000/);
 assert.match(main,/relayStream\(\{req,res,url,proxyUrl,fetcher:desktopStreamFetch\}\)/);
});

test('playlist refresh preserves verified engine only when media URL is unchanged',()=>{
 const a='https://media.test/live.m3u8';
 const old={id:'one',sourceId:'src',name:'VTV3',url:a,lastPlayableUrl:a,lastPlayableEngine:'hlsjs',lastPlayableTransport:'relay',lastPlaybackAt:new Date().toISOString()};
 const same=planReplacement([old],[{name:'VTV3',url:a}],'src').channels[0];
 assert.equal(same.lastPlayableEngine,'hlsjs');
 const changed=planReplacement([old],[{name:'VTV3',url:'https://media.test/new.m3u8'}],'src').channels[0];
 assert.equal(changed.lastPlayableEngine,undefined);
});
test('opaque VTV-style endpoint carrying raw MPEG-TS is detected before HTML5 tries unsupported TS',()=>{
 const {inspectMedia}=require('../src/media-inspection.cjs');
 const binary=Buffer.alloc(564,0);binary[0]=binary[188]=binary[376]=0x47;
 const result=inspectMedia({url:'https://tv.test/tv360/?id=12',contentType:'application/octet-stream',sample:binary});
 assert.equal(result.format,'ts');assert.equal(result.ts,true);assert.equal(result.hls,false);
 assert.match(source,/details\.format==='ts'[^]*tryPlayback\(url,generation,'ffmpeg'\)/);
});
