'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const mod=require('../../web-background-audio.js');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function events(o){
 const callbacks={};
 o.addEventListener=(type,fn)=>{(callbacks[type]??=[]).push(fn)};
 o.emit=(type,event={})=>{for(const fn of callbacks[type]||[])fn(event)};
 return o;
}
function fixture({playReject=false,chromeHls=false,initial={},allowAudio=true,withChannelSwitch=false}={}){
 const audioElements=[],handlers={};
 const video=events({
  paused:false,pauseCalls:0,playCalls:0,volume:.7,muted:false,suspended:0,
  pause(){this.paused=true;this.pauseCalls++;this.emit('pause');},
  play(){this.paused=false;this.playCalls++;this.emit('play');this.emit('playing');return Promise.resolve();}
 });
 const settings=events({checked:false});
 const status={textContent:''};
 const label={textContent:'Nghe nền'};
 const classes=new Set();
 const toggle=events({
  disabled:false,attrs:{},classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)}},
  setAttribute(name,value){this.attrs[name]=value},
  querySelector(){return label}
 });
 const stop=events({clicked:0,click(){this.clicked++}});
 const next=events({clicked:0,click(){this.clicked++}});
 const prev=events({clicked:0,click(){this.clicked++}});
 const source={value:'https://example.org/live.m3u8'};
 const els={video,webBackgroundAudio:settings,webBackgroundAudioStatus:status,
  webBackgroundAudioToggle:toggle,webBackgroundAudioModeStatus:{textContent:''},
  playBtn:events({textContent:'Ⅱ'}),
  stopBtn:stop,nextBtn:next,prevBtn:prev,manualStreamSelect:source};
 let channel={id:'vtv1',name:'VTV1',group:'Truyền hình',url:'https://example.org/live.m3u8'};
 const store={...initial},calls={save:0,channels:[],switches:[],stops:0,suspends:0};
 const doc=events({
  visibilityState:'visible',body:{append(el){audioElements.push(el)}},
  getElementById:id=>els[id]||null,
  createElement(kind){
   assert.equal(kind,'audio');
   const audio=events({
    paused:true,preload:'',style:{},volume:1,muted:false,playCalls:0,pauseCalls:0,removed:false,
    canPlayType:()=>chromeHls?'':'maybe',
    setAttribute(){},removeAttribute(){},
    load(){},
    remove(){this.removed=true},
    pause(){this.pauseCalls++;this.paused=true;this.emit('pause')},
    play(){
     this.playCalls++;
     if(playReject)return Promise.reject(Object.assign(new Error('NotAllowedError'),{name:'NotAllowedError'}));
     this.paused=false;this.emit('play');this.emit('playing');return Promise.resolve();
    }
   });
   return audio;
  }
 });
 const ms={metadata:null,playbackState:'none',setActionHandler(name,fn){handlers[name]=fn}};
 const nav={mediaSession:ms,audioSession:{type:'auto'}};
 const hlsLog={attached:0,loaded:0,destroyed:0};
 const win=events({
  location:{href:'https://trisanghy.github.io/open-iptv-pro/'},
  MediaMetadata:class{constructor(d){Object.assign(this,d)}},
  setTimeout(){},
  IPTVState:{
   getStore:()=>store,getCurrent:()=>channel,
   getChannels:()=>channel?[channel]:[],
   save(){calls.save++;return true},
   playChannel(id){calls.channels.push(id);return video.play()},
   ...(withChannelSwitch?{
    suspendVideoForBackground(){calls.suspends++;video.pause();video.suspended++;},
    switchChannel(dir,opts){
     calls.switches.push({dir,opts});
     channel={id:dir>0?'vtv2':'vtv3',name:dir>0?'VTV2':'VTV3',group:'Truyền hình',url:dir>0?'https://example.org/next.m3u8':'https://example.org/previous.m3u8'};
     doc.emit('openiptv:media-info');
     doc.emit('openiptv:audio-channel',{detail:{channelId:channel.id,url:channel.url}});
     return Promise.resolve();
    },
    stopPlayer(){calls.stops++;channel=null;doc.emit('openiptv:media-info');}
   }:{})
  }
 });
 if(chromeHls){
  const callbacks={};
  win.Hls=class{
   static isSupported(){return true}
   static Events={MANIFEST_PARSED:'manifest',ERROR:'error'};
   constructor(){}
   on(type,fn){callbacks[type]=fn}
   attachMedia(){hlsLog.attached++}
   loadSource(){hlsLog.loaded++;callbacks.manifest?.()}
   destroy(){hlsLog.destroyed++}
  };
 }
 const controller=mod.install({win,doc,nav});
 return {controller,doc,video,settings,status,toggle,label,els,audioElements,handlers,ms,nav,calls,hlsLog,
  setChannel(c){channel=c},source,store};
}
test('iOS native HLS: explicit Nghe nền switches from video to audio and stays playing when hidden',async()=>{
 const e=fixture();
 assert.equal(e.toggle.attrs['aria-pressed'],'false');
 assert.equal(e.settings.checked,true);
 const result=await e.controller.activate();
 assert.equal(result,true);
 assert.equal(e.audioElements.length,1);
 assert.equal(e.video.pauseCalls,1);
 assert.equal(e.audioElements[0].playCalls,1);
 assert.equal(e.audioElements[0].src,'https://example.org/live.m3u8');
 assert.equal(e.ms.playbackState,'playing');
 assert.equal(e.toggle.attrs['aria-pressed'],'true');
 e.doc.visibilityState='hidden';
 e.doc.emit('visibilitychange');
 assert.equal(e.audioElements[0].pauseCalls,0);
 assert.equal(e.video.playCalls,0);
 assert.equal(e.nav.audioSession.type,'playback');
});
test('lock-screen controls are linked to active audio, not the paused video',async()=>{
 const e=fixture();
 await e.controller.activate();
 e.handlers.pause();
 assert.equal(e.audioElements[0].paused,true);
 assert.equal(e.ms.playbackState,'paused');
 e.handlers.play();
 assert.equal(e.audioElements[0].paused,false);
 assert.equal(e.ms.playbackState,'playing');
 assert.equal(e.video.playCalls,0);
 e.controller.togglePlayback();
 assert.equal(e.audioElements[0].paused,true);
 assert.equal(e.els.playBtn.textContent,'▶');
 e.handlers.nexttrack();e.handlers.previoustrack();e.handlers.stop();
 assert.equal(e.els.nextBtn.clicked,1);
 assert.equal(e.els.prevBtn.clicked,1);
 assert.equal(e.els.stopBtn.clicked,1);
});
test('turning off audio-only returns to the original TV player, tears down the audio',async()=>{
 const e=fixture();
 await e.controller.activate();
 e.controller.deactivate(true);
 assert.equal(e.controller.active,false);
 assert.equal(e.audioElements[0].removed,true);
 assert.equal(e.calls.channels[0],'vtv1');
 assert.equal(e.toggle.attrs['aria-pressed'],'false');
 assert.equal(e.label.textContent,'Nghe nền');
});
test('Android Chromium HLS uses a dedicated HTMLAudioElement with hls.js',async()=>{
 const e=fixture({chromeHls:true});
 const ok=await e.controller.activate();
 assert.equal(ok,true);
 assert.equal(e.hlsLog.attached,1);
 assert.equal(e.hlsLog.loaded,1);
 assert.equal(e.audioElements[0].paused,false);
 e.controller.deactivate(false);
 assert.equal(e.hlsLog.destroyed,1);
});
test('a failed audio handoff restores the previous playing video and reports error',async()=>{
 const e=fixture({playReject:true});
 const ok=await e.controller.activate();
 assert.equal(ok,false);
 assert.equal(e.controller.active,false);
 assert.equal(e.video.playCalls,1);
 assert.equal(e.audioElements[0].removed,true);
 assert.match(e.els.webBackgroundAudioModeStatus.textContent,/Không bật được Nghe nền/);
});
test('no current channel means no audio stream; disabled background setting prevents activation',async()=>{
 const e=fixture();
 e.setChannel(null);
 assert.equal(await e.controller.activate(),false);
 assert.equal(e.audioElements.length,0);
 e.settings.checked=false;e.settings.emit('change');
 assert.equal(e.store.backgroundAudioEnabled,false);
 assert.equal(await e.controller.activate(),false);
 assert.equal(e.audioElements.length,0);
});
test('safety: refuse javascript, invalid and mixed content sources on HTTPS',()=>{
 for(const url of ['javascript:alert(1)','file:///etc/passwd','http://example.org/a.m3u8','https://user:pass@evil.invalid/stream'])
  assert.equal(mod.isAllowedStream(url,'https://trisanghy.github.io'),false,url);
 assert.equal(mod.isAllowedStream('https://example.org/live.m3u8','https://trisanghy.github.io'),true);
});
test('Web files and builder preserve UI after rebuild without changing native branches',()=>{
 const html=read('index.html'),builder=read('web-online/prepare-web.py'),code=read('web-background-audio.js');
 assert.equal(html.split('id="webBackgroundAudioToggle"').length,2);
 assert.equal(html.split('id="webBackgroundAudioBar"').length,1);
 assert.match(html,/id="favCurrentBtn"[\s\S]*?id="webBackgroundAudioToggle"/);
 assert.ok(html.includes('web-background-audio.js?v=lock-controls-20261119f'));
 assert.ok(html.includes('web-background-audio.css?v=lock-artwork-20261119e'));
 assert.ok(builder.includes('compact_audio=web_html['));
 assert.ok(builder.includes("'web-background-audio.css'"));
 assert.equal(read('web-online/web-background-audio.js'),code);
 assert.equal(read('web-online/web-background-audio.css'),read('web-background-audio.css'));
 assert.doesNotMatch(code,/AudioContext|wakeLock\.request|setInterval\(/);
});

test('Web application uses audio-only route and never spins up the video decoder for lock-screen next/previous',()=>{
 const app=read('app.js'),builder=read('web-online/prepare-web.py');
 assert.match(app,/function suspendVideoForBackground\(\)/);
 assert.match(app,/if\(audioOnly\)\{\s*suspendVideoForBackground\(\)/);
 assert.match(app,/openiptv:audio-channel/);
 assert.match(app,/switchChannel\(dir,opts=\{\}\)/);
 assert.match(app,/OpenIPTVBackgroundAudio\?\.active\)return window\.OpenIPTVBackgroundAudio\.togglePlayback\(\)/);
 assert.match(app,/playChannel,switchChannel,suspendVideoForBackground,stopPlayer/);
 assert.match(app,/if\(!window\.OpenIPTVBackgroundAudio\?\.active\)\$\('#playBtn'\)\.textContent='▶'/);
 assert.match(builder,/audio_begin=' function suspendVideoForBackground\(\)\{'/);
 assert.match(builder,/web_app\[web_app\.index\(audio_begin\):web_app\.index\(audio_end/);
});
test('video pause cannot override the audible Media Session or the Web play icon',async()=>{
 const e=fixture({withChannelSwitch:true});
 assert.equal(await e.controller.activate(),true);
 assert.equal(e.calls.suspends,1);
 assert.equal(e.els.playBtn.textContent,'Ⅱ');
 assert.equal(e.ms.playbackState,'playing');
 e.video.emit('pause');
 assert.equal(e.els.playBtn.textContent,'Ⅱ');
 assert.equal(e.ms.playbackState,'playing');
 e.handlers.pause();
 assert.equal(e.audioElements[0].paused,true);
 assert.equal(e.els.playBtn.textContent,'▶');
 assert.equal(e.ms.playbackState,'paused');
 e.handlers.play();
 assert.equal(e.audioElements[0].paused,false);
 assert.equal(e.els.playBtn.textContent,'Ⅱ');
 assert.equal(e.ms.playbackState,'playing');
});
test('lock-screen next and previous use audio-only channel switching while hidden, keeping one audio element',async()=>{
 const e=fixture({withChannelSwitch:true});
 assert.equal(await e.controller.activate(),true);
 const audio=e.audioElements[0];
 e.doc.visibilityState='hidden';
 e.handlers.nexttrack();
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(e.calls.switches.length,1);
 assert.equal(e.calls.switches[0].dir,1);
 assert.equal(e.calls.switches[0].opts.audioOnly,true);
 assert.equal(e.audioElements.length,1);
 assert.equal(e.audioElements[0],audio);
 assert.equal(audio.src,'https://example.org/next.m3u8');
 assert.equal(e.ms.metadata.title,'VTV2');
 assert.equal(e.ms.playbackState,'playing');
 e.handlers.previoustrack();
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(e.calls.switches.length,2);
 assert.equal(e.calls.switches[1].dir,-1);
 assert.equal(e.audioElements.length,1);
 assert.equal(audio.src,'https://example.org/previous.m3u8');
 assert.equal(e.ms.metadata.title,'VTV3');
 e.handlers.stop();
 assert.equal(e.calls.stops,1);
 assert.equal(e.controller.active,false);
 assert.equal(e.ms.playbackState,'none');
 assert.equal(audio.removed,true);
});
test('audio-only mode routes the visible previous/next controls without double-switching',async()=>{
 const e=fixture({withChannelSwitch:true});
 await e.controller.activate();
 const event={prevented:0,stopped:0,preventDefault(){this.prevented++},stopImmediatePropagation(){this.stopped++}};
 e.els.nextBtn.emit('click',event);
 await Promise.resolve();await Promise.resolve();
 assert.equal(event.prevented,1);
 assert.equal(event.stopped,1);
 assert.equal(e.calls.switches.length,1);
});
