'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const code=fs.readFileSync(path.join(root,'web-cast-sender.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const castUi=fs.readFileSync(path.join(root,'cast-ui.js'),'utf8');

function harness({sender=true,source='https://example.com/live.m3u8',userAgent='Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/130'}={}){
 const elements={},listeners={},scripts=[];
 const ids=['video','castModal','castTitle','castChannel','castGoogleHint','castScan','castPlay','castDevices','castStatus','castAirplay',
  'airplaySection','airplayScan','airplayDeviceList','airplayMobileHelp','castLanHint','castLink','castCopy','castUrl','castStop'];
 for(const id of ids){
  const classes=new Set(id==='castModal'?['hidden']:[]);
  elements[id]={
   id,value:'',textContent:'',disabled:false,hidden:false,dataset:{},options:[],
   classList:{
    add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),
    toggle:(x,flag)=>{if(flag)classes.add(x);else classes.delete(x);}
   },
   addEventListener:(name,fn)=>listeners[id+':'+name]=fn,
   replaceChildren(){this.options=[];},
   add(option){this.options.push(option);},
   setAttribute(){},
   pause(){this.paused=true;},
   focus(){},select(){}
  };
 }
 const doc={getElementById:id=>elements[id]||null,
  createElement:tag=>({tag,dataset:{}}),
  head:{appendChild:script=>scripts.push(script)}
 };
 let session=null,requested=0,loads=[],ends=0,options=null,castListener;
 const remoteCommands=[];
 const remoteMedia={pause:(_req,resolve)=>{remoteCommands.push('pause');resolve();},play:(_req,resolve)=>{remoteCommands.push('resume');resolve();},stop:(_req,resolve)=>{remoteCommands.push('stop');resolve();}};
 const castSession={
  getCastDevice:()=>({friendlyName:'TV phòng khách'}),
  getMediaSession:()=>remoteMedia,
  loadMedia:req=>{loads.push(req);return Promise.resolve();}
 };
 const ctx={
  getCurrentSession:()=>session,
  requestSession:()=>{requested++;session=castSession;return Promise.resolve();},
  endCurrentSession:()=>{ends++;session=null;return Promise.resolve();},
  setOptions:opts=>{options=opts;},
  addEventListener:(name,listener)=>castListener=listener
 };
 const win={document:doc,location:{href:'https://trisanghy.github.io/open-iptv-pro/'},
  navigator:{userAgent,maxTouchPoints:0,
   clipboard:{writeText:async()=>{}}},
  streamleaf:null
 };
 if(sender){
  function MediaInfo(url,mime){this.contentId=url;this.contentType=mime;}
  function LoadRequest(media){this.media=media;}
  function GenericMediaMetadata(){}
  win.chrome={cast:{AutoJoinPolicy:{ORIGIN_SCOPED:'origin_scoped'},
   media:{DEFAULT_MEDIA_RECEIVER_APP_ID:'CC1AD845',MediaInfo,LoadRequest,GenericMediaMetadata,StreamType:{LIVE:'LIVE'}}}};
  win.cast={framework:{CastContext:{getInstance:()=>ctx},CastContextEventType:{SESSION_STATE_CHANGED:'sessionChanged'}}};
 }
 vm.runInNewContext(code,{window:win,URL,Option:function(label,value){this.text=label;this.value=value;},Promise,console});
 if(sender)win.__onGCastApiAvailable(true);
 const api=win.OpenIPTVWebCast;
 if(!api)throw Error('Adapter not initialized');
 api.open({id:'vtv2',name:'VTV2',group:'VTV'},source);
 return {api,win,ctx,elements,listeners,scripts,remoteCommands,requested:()=>requested,loads,ends:()=>ends,options:()=>options,fireSession:()=>castListener?.()};
}

test('browser requests official sender SDK from Google and the CSP permits it',()=>{
 const h=harness({sender:false});
 assert.equal(h.scripts.length,1);
 assert.equal(h.scripts[0].src,'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1');
 assert.match(html,/script-src 'self' https:\/\/www\.gstatic\.com/);
 assert.match(html,/web-cast-sender\.js\?v=/);
 assert.match(html,/id="castGoogleHint"/);
 assert.match(castUi,/OpenIPTVWebCast\?\.open/);
});
test('Google Cast native browser picker and media load use actual sender session',async()=>{
 const h=harness();
 assert.equal(h.options().receiverApplicationId,'CC1AD845');
 assert.equal(h.elements.castScan.disabled,false);
 assert.equal(h.elements.castDevices.disabled,true);
 await h.listeners['castScan:click']();
 assert.equal(h.requested(),1);
 assert.equal(h.elements.castDevices.options[0].text,'TV phòng khách');
 await h.api.play();
 assert.equal(h.loads.length,1);
 assert.equal(h.loads[0].media.contentId,'https://example.com/live.m3u8');
 assert.equal(h.loads[0].media.contentType,'application/x-mpegURL');
 assert.equal(h.loads[0].media.metadata.title,'VTV2');
 assert.equal(h.elements.video.paused,true);
 assert.match(h.elements.castStatus.textContent,/Đã gửi/);
 await h.api.stop();
 assert.equal(h.ends(),1);
});
test('play button can request session and send media on first click',async()=>{
 const h=harness();
 await h.api.play();
 assert.equal(h.requested(),1);
 assert.equal(h.loads.length,1);
});
test('browser never offers native LAN relay: only explicit source URL sharing',()=>{
 const h=harness();
 assert.equal(h.elements.castLink.textContent,'Lấy URL nguồn trực tiếp');
 h.listeners['castLink:click']();
 assert.equal(h.elements.castUrl.value,'https://example.com/live.m3u8');
 assert.match(h.elements.castStatus.textContent,/KHÔNG phải máy chủ LAN/);
 const b=harness({source:'blob:https://example.com/media-id'});
 assert.equal(b.elements.castLink.disabled,true);
});
test('SDK unavailable must not falsely claim successful device discovery',()=>{
 const h=harness({sender:false});
 assert.equal(h.elements.castScan.disabled,true);
 assert.equal(h.elements.castPlay.disabled,true);
 assert.equal(h.elements.castDevices.options.length,1);
 assert.equal(h.requested(),0);
 assert.match(h.elements.castStatus.textContent,/Đang khởi tạo/);
});
test('local-only URL is not accepted for Google Cast',()=>{
 const h=harness({source:'http://127.0.0.1:8000/live.m3u8'});
 assert.equal(h.api.validSource('http://localhost:5000/tv.m3u8'),'');
 assert.equal(h.api.validSource('blob:https://example.com/live'),'');
 assert.equal(h.elements.castLink.disabled,true);
 assert.equal(h.api.mediaType('https://example.com/film.mp4'),'video/mp4');
});
test('switching selected channels reuses the same Google Cast session without disconnecting',async()=>{
 const h=harness();
 await h.api.play();
 assert.equal(h.loads.length,1);
 h.api.onChannelChanged({id:'vtv3',name:'VTV3',url:'https://example.com/vtv3.m3u8'},'https://example.com/vtv3.m3u8');
 for(let i=0;i<20&&h.loads.length<2;i++)await new Promise(r=>setTimeout(r,1));
 assert.equal(h.loads.length,2);
 assert.equal(h.loads[1].media.contentId,'https://example.com/vtv3.m3u8');
 assert.equal(h.loads[1].media.metadata.title,'VTV3');
 assert.equal(h.ends(),0);
 assert.equal(h.api.getState().connected,true);
});
test('Google Cast pause and resume commands control the receiver media session',async()=>{
 const h=harness();
 await h.api.play();
 assert.equal(await h.api.transportRemote('pause'),true);
 assert.equal(h.api.getState().remotePaused,true);
 assert.equal(await h.api.transportRemote('resume'),true);
 assert.equal(h.api.getState().remotePaused,false);
 assert.deepEqual(h.remoteCommands,['pause','resume']);
});
test('AirPlay connected status is based on Safari native wireless playback, not a clicked picker',()=>{
 const h=harness({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15'});
 assert.equal(h.api.getAirplayState().connected,false);
 h.elements.video.webkitCurrentPlaybackTargetIsWireless=true;
 assert.equal(h.api.getAirplayState().connected,true);
 const chrome=harness();
 chrome.elements.video.webkitCurrentPlaybackTargetIsWireless=true;
 assert.equal(chrome.api.getAirplayState().connected,false);
});
test('user stop and changed channel end active receiver playback, not just local video',async()=>{
 const h=harness();
 await h.api.play();
 h.api.stopOnLocalStop();
 await Promise.resolve();
 assert.equal(h.ends(),1);
});
