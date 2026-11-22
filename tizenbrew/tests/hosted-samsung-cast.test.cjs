'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function getSource(){
 const a=html.indexOf('function setPlayerStatus(message){'),b=html.indexOf('function resumeLastChannel(){',a);
 assert.ok(a>=0&&b>a);
 return html.slice(a,b);
}
function harness(hasFrame=true){
 const sent=[],timers=[],events={},focused=[],classes=new Set();
 const frame=hasFrame?{
  hidden:true,src:'',onload:null,
  contentWindow:{postMessage:(packet,target)=>sent.push({packet,target})},
  getAttribute(name){return name==='src'?this.src:null;}
 }:null;
 const video={
  src:'',paused:true,hidden:false,readyState:0,error:null,
  canPlayType:()=>'',play(){this.paused=false;return Promise.resolve();},
  pause(){this.paused=true;},removeAttribute(name){if(name==='src')this.src='';},load(){}
 };
 const els={
  player:{hidden:true,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},focus:()=>focused.push('player')},
  browserFallback:{hidden:true,focus(){}},video,castPlayerFrame:frame,
  avplayObject:{hidden:true},playerStatus:{hidden:true,textContent:''},
  playbackDiag:{hidden:true,textContent:''},playingName:{textContent:''},
  exitModuleBtn:{title:''},channelPicker:{hidden:true}
 };
 const state={sources:[],recent:[],favorites:{}};
 const ctx={
  byId:key=>els[key],state,save(){return true;},draw(){},notify(){},
  window:{Hls:null,addEventListener:(name,fn)=>events[name]=fn},
  document:{head:{appendChild(){}},createElement(){return{};},activeElement:null},
  setTimeout:(fn,ms)=>{const timer={fn,ms,cancelled:false};timers.push(timer);return timer;},
  clearTimeout:timer=>{if(timer)timer.cancelled=true;}
 };
 const api=vm.runInNewContext(getSource()+'\n({play,closePlayer,togglePlayback,finishPlaybackError,startHostedCastPlayback,hostedCastPlayRequest,onHostedCastMessage,tryNextChannelSource,current:()=>({playbackEngine,playbackSerial,hostedCastToken,hostedCastSession,playbackConfirmed,playbackFailed,hostedCastAttempted,playbackStreamIndex})});',ctx);
 function trigger(ms){const timer=timers.find(t=>t.ms===ms&&!t.cancelled);assert.ok(timer,'Missing '+ms+'ms timeout');timer.cancelled=true;timer.fn();}
 function signal(type,details){
  const session=api.current().hostedCastSession;
  events.message({origin:'https://trisanghy.github.io',source:frame.contentWindow,
    data:{app:'openiptv-tizen-hosted',type,session,...details}});
 }
 return {api,frame,sent,events,timers,trigger,signal,video,els,classes,ctx,state};
}
test('cast-like HTTPS player is an isolated iframe, not a proxy or direct URL navigation',()=>{
 assert.match(html,/id="castPlayerFrame" hidden tabindex="-1"/);
 assert.match(html,/sandbox="allow-scripts allow-same-origin allow-presentation"/);
 assert.match(html,/referrerpolicy="no-referrer"/);
 assert.match(html,/hostedCastOrigin='https:\/\/trisanghy\.github\.io'/);
 assert.match(html,/\/open-iptv-pro\/tizen\/hosted-player\.html/);
});
test('VTV2 failing in module retries same HTTPS stream in GitHub Pages Cast origin',()=>{
 const s=harness(),channel={id:'vtv2',name:'VTV2',url:'https://example.org/vtv2.m3u8'};
 s.api.play(channel);
 s.api.finishPlaybackError(s.api.current().playbackSerial,'manifestLoadError');
 s.trigger(2400);
 assert.equal(s.api.current().playbackEngine,'hosted-cast');
 assert.equal(s.frame.hidden,false);
 assert.match(s.frame.src,/tizen\/hosted-player\.html/);
 assert.equal(s.video.hidden,true);
 assert.equal(s.api.current().playbackFailed,false);
 s.frame.onload();
 assert.equal(s.sent.length,1);
 assert.equal(s.sent[0].target,'https://trisanghy.github.io');
 assert.equal(s.sent[0].packet.url,channel.url);
 assert.equal(s.sent[0].packet.type,'play');
 assert.equal(s.sent[0].packet.app,'openiptv-tizen-hosted');
});
test('only messages from exact trusted iframe are accepted, and delayed playing clears error',()=>{
 const s=harness(),channel={id:'vtv3',name:'VTV3',url:'https://example.org/vtv3.m3u8'};
 s.api.play(channel);
 s.api.finishPlaybackError(s.api.current().playbackSerial,'HTML5 decode');
 s.trigger(2400);s.frame.onload();
 const initial=s.api.current().playbackConfirmed;
 s.events.message({origin:'https://evil.example',source:s.frame.contentWindow,
  data:{app:'openiptv-tizen-hosted',type:'playing',session:s.api.current().hostedCastSession}});
 assert.equal(s.api.current().playbackConfirmed,initial);
 s.events.message({origin:'https://trisanghy.github.io',source:{},
  data:{app:'openiptv-tizen-hosted',type:'playing',session:s.api.current().hostedCastSession}});
 assert.equal(s.api.current().playbackConfirmed,initial);
 s.signal('playing');
 assert.equal(s.api.current().playbackConfirmed,true);
 assert.equal(s.els.playerStatus.hidden,true);
 assert.ok(s.classes.has('is-playing'));
});
test('OK pauses/resumes hosted player without switching the channel; Back tears down iframe',()=>{
 const s=harness(),ch={id:'vtv4',name:'VTV4',url:'https://example.org/vtv4.m3u8'};
 s.api.play(ch);s.api.finishPlaybackError(s.api.current().playbackSerial,'HTML5');s.trigger(2400);
 s.frame.onload();s.signal('playing');
 s.api.togglePlayback();
 assert.equal(s.sent.at(-1).packet.type,'toggle');
 s.api.closePlayer();
 assert.equal(s.frame.hidden,true);
 assert.equal(s.frame.src,'about:blank');
 assert.equal(s.els.player.hidden,true);
 assert.equal(s.state.recent[0],'vtv4');
});
test('Cast failure moves to user-provided alternate channel source once, not an infinite iframe retry',()=>{
 const s=harness(),ch={id:'vtv5',name:'VTV5',url:'https://example.org/one.m3u8'};
 s.state.sources=[{channels:[ch,{id:'vtv5-alt',name:'VTV5',url:'https://example.org/two.m3u8'}]}];
 s.api.play(ch);
 s.api.finishPlaybackError(s.api.current().playbackSerial,'HTML5');
 s.trigger(2400);s.frame.onload();
 s.signal('error',{detail:'manifestLoadError HTTP 403'});
 s.trigger(2400);
 assert.equal(s.api.current().playbackStreamIndex,1);
 assert.equal(s.frame.hidden,true);
 assert.equal(s.api.current().playbackEngine,'html5');
 assert.equal(s.api.current().playbackStreamIndex,1);
 assert.equal(s.api.current().hostedCastAttempted,false);
});
test('HTTP channel is not sent into HTTPS iframe, matching Samsung Browser mixed-content restrictions',()=>{
 const s=harness(),ch={id:'test',name:'HTTP',url:'http://example.org/live.m3u8'};
 s.api.play(ch);
 s.api.finishPlaybackError(s.api.current().playbackSerial,'HTTP blocked');
 s.trigger(2400);
 assert.equal(s.frame.hidden,true);
 assert.equal(s.sent.length,0);
 assert.equal(s.api.current().playbackEngine,'html5');
});
