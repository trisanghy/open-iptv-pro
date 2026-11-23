'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const a=html.indexOf('function setPlayerStatus(message){'),b=html.indexOf('function resumeLastChannel(){',a);
assert.ok(a>=0&&b>a,'playback implementation exists');
const code=html.slice(a,b);
function setup(){
 const callbacks=[],states=[],calls={pause:0,play:0},cls=new Set();
 const player={hidden:true,classList:{add:x=>cls.add(x),remove:x=>cls.delete(x),contains:x=>cls.has(x)}};
 const video={paused:true,readyState:0,error:null,src:'',hidden:false,
   canPlayType:()=>'',pause(){this.paused=true;calls.pause++;},
   play(){this.paused=false;calls.play++;return Promise.resolve();},
   load(){},removeAttribute(key){if(key==='src')this.src='';}};
 const els={player,video,playerStatus:{hidden:true,textContent:''},
  playbackDiag:{hidden:true,textContent:''},browserFallback:{hidden:true},avplayObject:{hidden:true},playingName:{textContent:''},
  exitModuleBtn:{title:''},channelPicker:{hidden:true}};
 const state={sources:[],favorites:{},recent:[]};
 const context={
  state,URL,byId:id=>els[id],
  window:{Hls:undefined},save:()=>true,draw(){},notify(){},
  document:{head:{appendChild(){}},createElement(){return {}}},
  setTimeout:(fn,ms)=>{const t={fn,ms,cancelled:false};callbacks.push(t);return t;},
  clearTimeout:t=>{if(t)t.cancelled=true;}
 };
 const api=vm.runInNewContext(code+'\n({play,playbackReady,finishPlaybackError,playbackCandidates,describeHlsError,playbackActive,handleHtml5Error,tryNextChannelSource,current:()=>({playing,playbackStreamIndex,playbackStreamUrls:playbackStreamUrls.slice(),playbackConfirmed,playbackFailed,playbackSerial,html5Mode,streamUrl:playbackStream&&playbackStream.url})});',context);
 function advance(ms){
  const t=callbacks.find(t=>!t.cancelled&&t.ms===ms);
  assert.ok(t,'Expected timer '+ms+' ms');
  t.cancelled=true;t.fn();
 }
 return {api,context,state,els,callbacks,calls,advance,cls};
}
test('Same-name channels in independent M3U sources never replace the selected URL',()=>{
 const s=setup(),c={id:'channel1',name:'VTV7',url:'https://cdn1.example.org/one.mp4?token=selected'};
 s.state.sources=[
  {channels:[c,{id:'different',name:'VTV7',url:'https://cdn2.example.org/two.m3u8?token=other'}]},
  {channels:[{id:'third',name:'VTV7',url:'https://cdn3.example.org/three.m3u8'}]}
 ];
 assert.deepEqual(Array.from(s.api.playbackCandidates(c)),[c.url]);
 s.api.play(c);s.api.finishPlaybackError(s.api.current().playbackSerial,'manifestLoadError HTTP 403');
 s.advance(2400);
 assert.equal(s.api.current().playbackStreamIndex,0);
 assert.equal(s.api.current().streamUrl,c.url,'Do not silently use any other provider');
 assert.equal(s.state.sources[0].channels[1].url,'https://cdn2.example.org/two.m3u8?token=other');
 assert.match(s.els.playerStatus.textContent,/cdn1.example.org/);
 assert.doesNotMatch(s.els.playerStatus.textContent,/token=selected|token=other/);
});
test('late successful playback cancels error grace period and prevents unintended source change',()=>{
 const s=setup(),ch={id:'c1',name:'VTV1',url:'https://example.org/one.mp4'};
 s.state.sources=[{channels:[{name:'VTV1',url:'https://example.org/two.mp4'}]}];
 s.api.play(ch);const token=s.api.current().playbackSerial;
 s.api.finishPlaybackError(token,'Temporary HTML5 error');
 const timer=s.callbacks.find(x=>x.ms===2400);
 assert.ok(timer);assert.equal(s.api.current().playbackFailed,true);
 s.api.playbackReady(token);
 assert.equal(timer.cancelled,true);
 timer.fn();
 assert.equal(s.api.current().playbackStreamIndex,0);
 assert.equal(s.els.playerStatus.hidden,true);
 assert.ok(s.cls.has('is-playing'));
});
test('Explicit backup URL belonging to the selected channel is used only after stable failure',()=>{
 const s=setup(),ch={id:'c1',name:'VTV1',url:'https://example.org/one.mp4',backupUrls:['https://example.org/two.mp4']};
 s.state.sources=[{channels:[{name:'VTV1',url:'https://example.org/one.mp4'},{name:'VTV1',url:'https://example.org/two.mp4'}]}];
 s.api.play(ch);
 s.api.finishPlaybackError(s.api.current().playbackSerial,'first route failed');
 s.advance(2400);
 assert.equal(s.api.current().playbackStreamIndex,1);
 assert.equal(s.els.video.src,'https://example.org/two.mp4');
 assert.deepEqual(Array.from(s.state.recent),['c1']);
 assert.equal(s.api.current().playbackFailed,false);
 assert.equal(s.state.sources[0].channels[0].url,'https://example.org/one.mp4');
});
test('switching channel before grace deadline invalidates late callbacks',()=>{
 const s=setup(),a={id:'a',name:'VTV1',url:'https://a.test/a.mp4'},b={id:'b',name:'VTV2',url:'https://a.test/b.mp4'};
 s.api.play(a);const old=s.api.current().playbackSerial;
 s.api.finishPlaybackError(old,'old failure');
 const timer=s.callbacks.find(x=>x.ms===2400);
 s.api.play(b);
 assert.ok(timer.cancelled);
 timer.fn();
 assert.equal(s.els.video.src,b.url);
 assert.equal(s.api.current().playing.id,'b');
});
test('HLS errors show safe HTTP and network diagnoses without exposing playlist secrets',()=>{
 const s=setup();
 const report1=s.api.describeHlsError({details:'manifestLoadError',response:{code:403},url:'https://example.org/secret?token=private'});
 const report2=s.api.describeHlsError({details:'manifestLoadError',response:{code:0}});
 const report3=s.api.describeHlsError({details:'manifestLoadError',response:{code:404}});
 assert.match(report1,/HTTP 403/);assert.doesNotMatch(report1,/private|token/);
 assert.match(report2,/CORS/);
 assert.match(report3,/HTTP 404/);
});
test('Only explicit backup URLs are considered; maximum five with dedup and validation',()=>{
 const s=setup(),channels=[];
 for(let i=0;i<12;i++)channels.push({name:'VTV1',url:'https://a.test/'+i+'.m3u8'});
 channels.push({name:'VTV2',url:'https://a.test/notvtv1.m3u8'});
 s.state.sources=[{channels}];
 const selected={name:'VTV1',url:channels[0].url,backupUrls:[
  'https://a.test/1.m3u8','https://a.test/1.m3u8',
  'javascript:alert(1)','http://a.test/2.m3u8',
  'https://a.test/3.m3u8','https://a.test/4.m3u8','https://a.test/5.m3u8'
 ]};
 const urls=Array.from(s.api.playbackCandidates(selected));
 assert.deepEqual(urls,[
  selected.url,'https://a.test/1.m3u8','http://a.test/2.m3u8',
  'https://a.test/3.m3u8','https://a.test/4.m3u8'
 ]);
 assert.ok(!urls.includes(channels[12].url));
});
test('Playback diagnostics display only source hostname, never M3U8 path or tokens',()=>{
 const s=setup(),ch={id:'vtv7',name:'VTV7',url:'https://origin.example.org/live/private.m3u8?token=secret'};
 s.api.play(ch);
 assert.match(s.els.playbackDiag.textContent,/Nguồn 1\/1.*origin.example.org/);
 assert.doesNotMatch(s.els.playbackDiag.textContent,/secret|private|token=/);
});
