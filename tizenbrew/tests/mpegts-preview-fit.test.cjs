'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'tizenbrew/index.html'),'utf8');
const main=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
function extract(start,end){
 const a=main.indexOf(start),b=main.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'missing code block: '+start);
 return main.slice(a,b);
}
test('Unified core exposes HLS, DASH, MPEGTS, HTML5 and Samsung AVPlay adapters',()=>{
 const core=extract('var TV_PLAYBACK_CORE={','function launchPlaybackRoute(channel,token,route){');
 for(const name of ['hlsjs','dashjs','mpegts','native','avplay'])
  assert.match(core,new RegExp('\\b'+name+':\\{name:'));
 assert.match(core,/preferredRoute:function/);
 assert.match(core,/mpegtsAddress\(address\)\?'mpegts'/);
 assert.match(html,/function mpegtsAddress\(address\)/);
 assert.match(html,/function mpegtsType\(address\)/);
 assert.match(html,/function startMpegtsPlayback\(channel,token\)/);
 assert.match(html,/function startMpegtsPreview\(channel,token\)/);
 assert.match(html,/transmux\.destroy\(\)/);
 assert.match(html,/previewMpegts\.destroy\(\)/);
 assert.match(html,/PREFERRED_HLS_DIRECT_MAX=3,PREFERRED_HLS_RELAY_MAX=2,PREFERRED_DASH_MAX=3/);
});
test('MPEGTS routes only genuine .ts/.m2ts/.flv/ .mpegts URLs',()=>{
 const pos=main.indexOf('function hlsAddress(address)');
 const until=main.indexOf('function logPlayback(text)',pos);
 const ctx=vm.createContext({});
 vm.runInContext(main.slice(pos,until),ctx);
 for(const url of ['https://e.test/live.ts','https://e.test/live.m2ts?token=abc','http://e.test/video.flv','https://e.test/live.mpegts'])
  assert.equal(ctx.mpegtsAddress(url),true,url);
 for(const url of ['https://e.test/list.m3u8','https://e.test/list.mpd','https://e.test/file.mp4','https://e.test/foo.ts.jpg'])
  assert.equal(ctx.mpegtsAddress(url),false,url);
 assert.equal(ctx.mpegtsType('http://e.test/live.flv'),'flv');
 assert.equal(ctx.mpegtsType('http://e.test/live.ts'),'mse');
});
test('Preview fits 4:3, 16:9, portrait and cinematic video inside stable panel bounds',()=>{
 const source=extract('function fitHomePreviewVideo(video){','function previewPlayed(channel,token,attempt){');
 const stage={dataset:{},getBoundingClientRect:()=>({width:600,height:330})};
 const ctx=vm.createContext({byId:id=>id==='previewStage'?stage:null});
 vm.runInContext(source,ctx);
 const results=[
  {w:1920,h:1080,shape:'landscape',fitW:Math.floor(330*1920/1080),fitH:330},
  {w:640,h:480,shape:'standard',fitW:440,fitH:330},
  {w:1080,h:1920,shape:'portrait',fitW:Math.floor(330*1080/1920),fitH:330},
  {w:2560,h:1080,shape:'wide',fitW:600,fitH:Math.floor(600*1080/2560)}
 ];
 for(const item of results){
  const v={videoWidth:item.w,videoHeight:item.h,style:{}};
  ctx.fitHomePreviewVideo(v);
  assert.equal(stage.dataset.videoShape,item.shape);
  assert.equal(v.style.width,item.fitW+'px');
  assert.equal(v.style.height,item.fitH+'px');
  assert.equal(v.style.aspectRatio,item.w+' / '+item.h);
  assert.ok(item.fitW<=600&&item.fitH<=330,'no crop or stretch');
 }
 assert.match(html,/object-fit:contain!important/);
 assert.match(html,/v\.onloadedmetadata=function\(\)/);
 assert.match(html,/v\.onresize=function\(\)/);
});
test('mpegts loader first requests the packaged WGT asset before CDN fallback',async()=>{
 const loader=extract('function loadMpegtsLibrary(){','function startMpegtsPlayback(channel,token){');
 const urls=[],window={};
 const document={head:{appendChild(script){
  urls.push(script.src);
  Promise.resolve().then(()=>{window.mpegts={createPlayer(){}};script.onload();});
 }},createElement:()=>({src:'',onload:null,onerror:null})};
 const ctx=vm.createContext({window,document,setTimeout:()=>1,clearTimeout:()=>{},mpegtsLibraryPromise:null});
 vm.runInContext(loader,ctx);
 const promise=ctx.loadMpegtsLibrary();
 const second=ctx.loadMpegtsLibrary();
 assert.equal(promise,second);
 await promise;
 assert.deepEqual(urls,['mpegts.min.js']);
});
test('MPEGTS start attaches player to the current video and responds to fatal events',async()=>{
 let attached=null,load=0,play=0;
 const instance={on(type,fn){this.event=fn;},attachMediaElement(v){attached=v;},load(){load++},play(){play++;return Promise.resolve()}};
 const ctx=vm.createContext({
  window:{MediaSource:function(){}},playbackEngine:'',html5Mode:'',mpegtsAttempted:false,mpegtsInstance:null,
  playbackConfirmed:false,playbackTimer:null,
  playbackActive:()=>true,clearPlaybackTimer(){},prepareHtml5Video:()=>({id:'vid'}),
  isActiveHtml5Video:()=>true,loadMpegtsLibrary:async()=>({
   isSupported:()=>true,Events:{ERROR:'error'},createPlayer:()=>instance
  }),setPlayerStatus(){},logPlayback(){},setTimeout:()=>1,clearTimeout(){},
  mpegtsType:()=> 'mse',finishPlaybackError:()=>{}
 });
 vm.runInContext(extract('function startMpegtsPlayback(channel,token){','function retryNativeHls(channel,token){'),ctx);
 assert.equal(ctx.startMpegtsPlayback({url:'https://e.test/live.ts'},12),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(load,1);assert.equal(play,1);
 assert.equal(attached.id,'vid');assert.equal(ctx.html5Mode,'mpegts');
 assert.equal(ctx.startMpegtsPlayback({url:'https://e.test/live.ts'},12),false);
});
test('Reproducible WGT build installs latest pinned MPEGTS and preserves full Apache license',()=>{
 const native=fs.readFileSync(path.join(root,'tizen-native/build.py'),'utf8');
 const flow=fs.readFileSync(path.join(root,'.github/workflows/package-tizen-native-avplay.yml'),'utf8');
 const browser=fs.readFileSync(path.join(root,'.github/workflows/package-tizen-browser.yml'),'utf8');
 for(const source of [flow,browser]){
  assert.match(source,/mpegts\.js@1\.8\.2/);
  assert.match(source,/mpegts\.min\.js/);
  assert.match(source,/node -e/);
 }
 assert.match(native,/archive\.write\(mpegts, "mpegts\.min\.js"\)/);
 assert.match(native,/licenses\/mpegts-Apache-2\.0\.txt/);
 assert.match(browser,/licenses\/mpegts-Apache-2\.0\.txt/);
 assert.ok(fs.statSync(path.join(root,'mpegts.min.js')).size>200000,'bundled 1.8.0 source fallback missing');
 assert.match(html,/lib\.createPlayer/);
 assert.match(html,/if\(playbackConfirmed&&recoverStalledPlayback\(token,error\)\)/);
});
