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
test('TizenBrew keeps the legacy iframe hidden and opens genuine Cast as fallback',()=>{
 assert.match(html,/id="castPlayerFrame" hidden tabindex="-1"/);
 assert.match(html,/return 'https:\/\/trisanghy\.github\.io\/open-iptv-pro\/tv\.html'/);
 const fn=html.slice(html.indexOf('function finishPlaybackError(token,message){'),html.indexOf('function playbackActive(token){'));
 assert.doesNotMatch(fn,/startHostedCastPlayback\(/);
});
test('Manifest failure no longer launches broken HTTPS iframe automatically',()=>{
 const s=harness(),ch={id:'vtv7',name:'VTV7',url:'https://example.org/vtv7.m3u8'};
 s.api.play(ch);
 s.api.finishPlaybackError(s.api.current().playbackSerial,'manifestLoadError HTTP 403');
 s.trigger(2400);
 assert.equal(s.frame.hidden,true);
 assert.equal(s.sent.length,0);
 assert.equal(s.api.current().playbackEngine,'html5');
 assert.equal(s.els.browserFallback.hidden,false);
 assert.match(s.els.browserFallback.textContent,/Cast chuẩn.*mã 6 số/);
});
test('When imported backup URLs exist, fail over without launching iframe',()=>{
 const s=harness(),ch={id:'vtv2',name:'VTV2',url:'https://example.org/one.mp4'};
 s.state.sources=[{channels:[ch,{id:'backup',name:'VTV2',url:'https://example.org/two.mp4'}]}];
 s.api.play(ch);
 s.api.finishPlaybackError(s.api.current().playbackSerial,'NotSupportedError');
 s.trigger(2400);
 assert.equal(s.api.current().playbackStreamIndex,1);
 assert.equal(s.frame.hidden,true);
 assert.equal(s.sent.length,0);
 assert.equal(s.video.src,'https://example.org/two.mp4');
});
test('A successful channel still supports playback with no intrusive iframe',()=>{
 const s=harness(),ch={id:'vtv1',name:'VTV1',url:'https://example.org/vtv1.mp4'};
 s.api.play(ch);
 assert.equal(s.frame.hidden,true);
 assert.equal(s.api.current().playbackEngine,'html5');
 s.api.closePlayer();
 assert.equal(s.els.player.hidden,true);
 assert.equal(s.state.recent[0],'vtv1');
});
