'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'tizenbrew/index.html'),'utf8');
const appMain=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
function block(begin,end){
 const a=appMain.indexOf(begin),b=appMain.indexOf(end,a+begin.length);
 assert.ok(a>=0&&b>a,'Missing code block: '+begin);
 return appMain.slice(a,b);
}
const themes=block('/* Five first-class TV visual modes','var SOURCE_CONFIG=');
const routing=block('function startPlaybackStream(channel,token){','function tryNextChannelSource(token){');
const dashLoading=block('function loadDashLibrary(){','function startDashPlayback(channel,token){');
const dashStart=block('function startDashPlayback(channel,token){','function retryNativeHls(channel,token){');
test('five TV modes are represented by one remote-safe button and persisted separately',()=>{
 const label={textContent:''},button={title:'',setAttribute(key,value){this[key]=value;}};
 const map={themeBtn:button,themeLabel:label};
 const store=new Map(),events=[];
 const ctx=vm.createContext({state:{theme:'google'},document:{body:{dataset:{}}},byId:id=>map[id],
  localStorage:{getItem:key=>store.get(key)||null,setItem:(k,v)=>store.set(k,v)},notify:s=>events.push(s)});
 vm.runInContext(themes,ctx);
 assert.equal(ctx.state.theme,'google');
 assert.equal(ctx.applyTvTheme('no-such-theme'),undefined);
 assert.equal(ctx.state.theme,'google');
 assert.match(label.textContent,/Google TV/);
 assert.match(button.title,/Tối|Apple TV|Google TV/);
 const sequence=[];
 for(let i=0;i<6;i++)sequence.push(ctx.nextTvTheme());
 assert.deepEqual(sequence,['apple','minimalist','glass','dark','google','apple']);
 assert.equal(store.get('openiptv-tizen-ui-theme-v2'),'apple');
 assert.match(label.textContent,/Apple TV/);
 assert.ok(events.every(v=>v.startsWith('Giao diện:')));
 assert.match(html,/byId\('themeBtn'\)\.onclick=nextTvTheme/);
 assert.match(html,/applyTvTheme\(state\.theme\);draw\(\)/);
});
test('full storage still allows a transient theme change without touching IPTV list',()=>{
 const context=vm.createContext({state:{theme:'google'},document:{body:{dataset:{}}},byId:()=>({setAttribute(){}}),
  localStorage:{getItem:()=>null,setItem:()=>{throw Error('QuotaExceededError');}},notify:()=>{}});
 vm.runInContext(themes,context);
 assert.equal(context.nextTvTheme(),'apple');
 assert.equal(context.state.theme,'apple');
 assert.equal(context.document.body.dataset.theme,'apple');
});
test('five visually distinct TV skins have real panel, channel and focus styling',()=>{
 assert.match(html,/GOOGLE TV \/ MATERIAL 3 DESIGN/);
 for(const name of ['dark','apple','minimalist','glass']){
  assert.ok(html.includes('body[data-theme='+name+'] #app .channel'),name+' channel skin');
  assert.ok(html.includes('body[data-theme='+name+'] #app .nav button.active'),name+' navigation skin');
  assert.ok(html.includes('body[data-theme='+name+'] #app button:focus'),name+' remote focus skin');
  assert.ok(html.includes('body[data-theme='+name+'] #app .guide-card'),name+' EPG skin');
 }
 assert.match(html,/backdrop-filter:blur\(12px\)/,'Glassmorphism main panels');
 assert.match(html,/body\[data-theme=minimalist\] #app\{background:#fff/);
 assert.match(html,/body\[data-theme=apple\] #app\{background:linear-gradient/);
});
test('WGT bundles the byte-for-byte Web decoder files and native fallback remains',()=>{
 const native=fs.readFileSync(path.join(root,'tizen-native/build.py'),'utf8');
 const preview=fs.readFileSync(path.join(root,'.github/workflows/package-tizen-browser.yml'),'utf8');
 for(const name of ['hls.min.js','dash.all.min.js']){
  const decoder=fs.statSync(path.join(root,name));
  assert.ok(decoder.size>100_000,name+' should be bundled as an actual decoder');
  assert.match(native,new RegExp(name.replace(/\./g,'\\.'),'g'));
  assert.match(preview,new RegExp(name.replace(/\./g,'\\.'),'g'));
  assert.match(html,new RegExp("'"+name.replace(/\./g,'\\.')+"'"));
 }
 assert.match(appMain,/dash\.reset\(\)/);
 assert.match(appMain,/engine\.destroy\(\)/);
 assert.match(appMain,/if\(!startAvplay\(failedChannel,token\)\)startHtml5Playback\(failedChannel,token\)/);
});
function launch(address,verified){
 const calls=[],context=vm.createContext({
  playing:{id:'live'},playbackStream:null,playbackStreamUrls:[address],playbackStreamIndex:0,
  nativeAvplay:()=>({}),savedPlaybackRoute:()=>verified||'',playbackSafeHost:()=>'',playbackActive:()=>true,
  playbackConfirmed:false,playbackEvidence:[],hlsAddress:s=>/\.m3u8(?:[?#]|$)/.test(s),
  dashAddress:s=>/\.mpd(?:[?#]|$)/.test(s),
  logPlayback:()=>{},relayFastStartHint:()=>'',startAvplay:()=>{calls.push('avplay');return true;},
  startHtml5Playback:()=>{calls.push('native');},launchPlaybackRoute:(c,t,route)=>{calls.push(route);return true;},
  playbackEngine:'',html5Mode:'',fastRelayActive:false,preferredCycleAt:1,resetPreferredDecoderAttempts:()=>{},
  TV_PLAYBACK_CORE:{preferredRoute:url=>url.includes('.mpd')?'dashjs':url.includes('.m3u8')?'hlsjs':url.includes('.ts')?'mpegts':''},
 });
 vm.runInContext(routing,context);
 context.startPlaybackStream({id:'test',name:'Test',url:address},7);
 return calls;
}
test('manifest streams select packaged HLS.js and DASH.js before AVPlay',()=>{
 assert.deepEqual(launch('https://example.org/a.m3u8'),['hlsjs']);
 assert.deepEqual(launch('https://example.org/live.m3u8?token=x','avplay'),['hlsjs']);
 assert.deepEqual(launch('https://example.org/program.mpd'),['dashjs']);
 assert.deepEqual(launch('https://example.org/movie.mp4'),['avplay']);
 assert.deepEqual(launch('https://example.org/a.m3u8','relay'),['relay'],'verified HLS relay avoids repeating known-bad direct CORS route');
});
test('DASH loader first tries local bundled JS and shares in-flight promise',async()=>{
 const urls=[],win={MediaSource:function(){},document:{head:{appendChild(script){
   urls.push(script.src);
   Promise.resolve().then(()=>{win.dashjs={MediaPlayer:()=>({create:()=>({initialize(){}})})};script.onload();});
 }},createElement:()=>({onload:null,onerror:null,remove(){}})}};
 const ctx=vm.createContext({window:win,document:win.document,setTimeout:()=>0,clearTimeout:()=>{},dashLibraryPromise:null});
 vm.runInContext(dashLoading,ctx);
 const first=ctx.loadDashLibrary(),second=ctx.loadDashLibrary();
 assert.strictEqual(first,second);
 const loaded=await first;
 assert.equal(typeof loaded.MediaPlayer,'function');
 assert.deepEqual(urls,['dash.all.min.js']);
});
test('DASH playback initializes MediaPlayer and releases it on decoder switch',async()=>{
 let initialized=0,reset=0;
 const listeners={};
 const instance={
  on(type,callback){listeners[type]=callback;},
  initialize(video,url,autoplay){initialized++;assert.equal(url,'https://example.org/a.mpd');assert.equal(autoplay,true);},
  reset(){reset++;}
 };
 const win={MediaSource:function(){},dashjs:{MediaPlayer:()=>({create:()=>instance})}};
 const ctx=vm.createContext({window:win,playbackEngine:'',html5Mode:'',dashAttempted:false,
  preferredDecoderAttempts:{dashjs:0,hlsjs:0,relay:0},PREFERRED_DASH_MAX:3,preferredDecoderEpoch:0,
  preferredRetryStatus:()=> 'DASH.js 1/3',retryPreferredDecoder:()=>false,
  playbackConfirmed:false,dashInstance:null,
  setPlayerStatus(){},clearPlaybackTimer(){},playbackActive:()=>true,isActiveHtml5Video:()=>true,
  prepareHtml5Video:()=>({}),logPlayback(){},loadDashLibrary:async()=>win.dashjs,
  playbackTimer:0,setTimeout:()=>1,clearTimeout:()=>{},finishPlaybackError:()=>{throw Error('Unexpected failure');},
  recoverStalledPlayback:()=>false});
 vm.runInContext(dashStart,ctx);
 assert.equal(ctx.startDashPlayback({url:'https://example.org/a.mpd'},17),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(initialized,1);
 assert.strictEqual(ctx.dashInstance,instance);
 assert.equal(ctx.html5Mode,'dashjs');
 assert.equal(ctx.startDashPlayback({url:'https://example.org/a.mpd'},17),false,'no duplicate decoder attached');
 ctx.dashInstance.reset();
 assert.equal(reset,1);
});
