'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function between(start,end){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'missing '+start);return html.slice(a,b);
}
const controller=between('/* Muted preview uses the same TV-local HLS relay','function draw(){');
function setup({failRelay=false}={}){
 const timers=new Map(),scheduled=[],instances=[],sessions=[],calls=[];
 let i=0;
 const names=new Set();
 const stage={dataset:{},classList:{add:x=>names.add(x),remove:x=>names.delete(x),contains:x=>names.has(x)}};
 const art={hidden:false},status={textContent:'',hidden:false};
 const video={hidden:true,muted:false,volume:1,paused:true,readyState:0,src:'',style:{},
  pause(){this.paused=true;},load(){},removeAttribute(attr){if(attr==='src')this.src='';},
  play(){this.paused=false;this.readyState=2;if(this.onplaying)this.onplaying();return Promise.resolve();}
 };
 const elements={previewStage:stage,previewArt:art,previewStatus:status,homePreviewVideo:video,player:{hidden:true},modal:{hidden:true}};
 class Hls{
  constructor(opts){this.opts=opts;this.handlers={};this.destroyed=false;instances.push(this);}
  static isSupported(){return true;}
  static Events={MANIFEST_PARSED:'manifest',ERROR:'error'};
  on(key,fn){this.handlers[key]=fn;}
  attachMedia(v){this.video=v;}
  loadSource(url){this.url=url;}
  destroy(){this.destroyed=true;}
  ready(){this.handlers.manifest?.();}
  fail(){this.handlers.error?.('error',{fatal:true});}
 }
 const env={selected:null,byId:id=>elements[id],Promise,Date,mpegtsAddress:()=>false,
  setTimeout:(fn,ms)=>{let id=++i;timers.set(id,fn);scheduled.push(ms);return id;},
  clearTimeout:id=>timers.delete(id),
  hlsAddress:url=>/\.m3u8(?:[?#]|$)/.test(url),
  relayFastStartHint:()=>'',provenDirectUrls:{},provenRelayUrls:{},
  ensureTizenHlsRelayService:()=>calls.push('start-relay'),
  loadHlsLibrary:()=>Promise.resolve(Hls),
  requestLocalHlsSession:channel=>{
   calls.push('session:'+channel.id);
   if(failRelay)return Promise.reject(new Error('relay unavailable'));
   return new Promise(resolve=>sessions.push({channel,resolve}));
  }
 };
 const api=vm.runInNewContext(controller+'\n({scheduleHomePreview,stopHomePreview,current:()=>({previewToken,previewKey,previewNativeTried,previewRelayTried})});',env);
 const select=channel=>{env.selected=channel;api.scheduleHomePreview(channel);};
 const tick=(delay)=>{for(const [id,fn] of timers){if(scheduled.includes(delay)){timers.delete(id);fn();return true;}}return false;};
 return {api,video,elements,instances,sessions,scheduled,timers,calls,env,select,tick};
}
async function settle(){for(let i=0;i<15;i++)await Promise.resolve();}
const c1={id:'vtv1',name:'VTV1',url:'https://tv.example/vtv1.m3u8'};
const c2={id:'vtv2',name:'VTV2',url:'https://tv.example/vtv2.m3u8'};
const local='http://127.0.0.1:17870/r/'+'a'.repeat(40)+'/0';
test('Home TV layout uses large controls and consistent SVG icons',()=>{
 assert.match(html,/id="previewStage"/);assert.match(html,/id="homePreviewVideo" playsinline muted/);
 assert.match(html,/id="previewStatus"/);assert.match(html,/id="watchBtn"[^>]*><svg/);
 assert.match(html,/id="searchBtn"[^>]*><svg/);
 assert.match(html,/data-nav="all"><span class="nav-icon"><svg/);
 assert.match(html,/#app \.main\{grid-template-columns:minmax\(222px,17fr\)/);
 assert.match(html,/#app \.nav button\{[^}]*min-height:77px/);
 assert.match(html,/#app \.channel\{min-height:85px/);
 assert.match(html,/#app \.preview\{[^}]*height:39vh/);
 assert.match(html,/@media\(max-width:1366px\),\(max-height:820px\)/);
});
test('400ms selection debounce prevents loading every channel while browsing',async()=>{
 const s=setup();
 s.select(c1);s.select(c2);
 assert.deepEqual(s.scheduled,[400,400]);
 assert.equal(s.timers.size,1);
 s.tick(400);await settle();
 assert.deepEqual(s.calls,['start-relay','session:vtv2']);
 assert.equal(s.sessions.length,1);
 assert.equal(s.sessions[0].channel.url,c2.url);
});
test('A successful relay preview stays muted and renders only the selected channel',async()=>{
 const s=setup();s.select(c1);s.tick(400);await settle();
 s.sessions[0].resolve({url:local});await settle();
 assert.equal(s.instances.length,1);
 const hls=s.instances[0];
 assert.equal(hls.url,local);
 const headers={};hls.opts.xhrSetup({setRequestHeader:(k,v)=>headers[k]=v});
 assert.equal(headers['X-Open-IPTV-Relay'],'1');
 assert.equal(s.video.muted,true);assert.equal(s.video.volume,0);
 hls.ready();await settle();
 assert.equal(s.elements.previewArt.hidden,true);
 assert.equal(s.elements.previewStage.classList.contains('preview-playing'),true);
 assert.equal(s.elements.previewStatus.hidden,true);
});
test('Rapid changes ignore stale relay responses and never show previous channel',async()=>{
 const s=setup();s.select(c1);s.tick(400);await settle();
 const old=s.sessions[0];s.select(c2);s.tick(400);await settle();
 old.resolve({url:local});await settle();
 assert.equal(s.instances.length,0,'stale channel cannot attach');
 s.sessions[1].resolve({url:local});await settle();
 assert.equal(s.instances.length,1,'latest selected channel only');
 s.api.stopHomePreview();
 assert.equal(s.instances[0].destroyed,true);
 assert.equal(s.video.hidden,true);
 assert.equal(s.elements.previewArt.hidden,false);
});
test('Relay failure falls back to native preview without modifying channel URL',async()=>{
 const s=setup({failRelay:true});s.select(c1);s.tick(400);await settle();
 assert.equal(s.video.src,c1.url);
 assert.equal(s.video.muted,true);
 assert.equal(s.api.current().previewNativeTried,true);
 assert.equal(s.elements.previewStage.classList.contains('preview-playing'),true);
});
test('Fullscreen, external exit and dialogs explicitly stop the independent preview',()=>{
 assert.match(html,/function play\(c\)\{\s*if\(!c\)return;\s*if\(typeof stopHomePreview===/);
 assert.match(html,/function openDialog\(kind\)\{if\(typeof stopHomePreview===/);
 assert.match(html,/function exitModule\(\)\{\s*if\(typeof stopHomePreview===/);
 assert.match(html,/function closeDialog\(\)\{stopPair\(\);byId\('modal'\)\.hidden=true;.*scheduleHomePreview\(selected\)/);
 assert.doesNotMatch(controller,/window\.open|openChannelInSamsungBrowser|hostedCast/);
});
