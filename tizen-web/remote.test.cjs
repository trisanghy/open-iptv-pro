'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=JSON.parse(fs.readFileSync('package.json','utf8')),h=fs.readFileSync('tv-web-lab-v061.html','utf8'),s=fs.readFileSync('tv-web-lab-v061.js','utf8');
test('Standalone HTTPS page and original TV interface',()=>{
 a.equal(p.websiteURL,'https://trisanghy.github.io/open-iptv-pro/tv-web-lab-v061.html');a.equal(p.packageType,'mods');a.equal(p.serviceFile,undefined);
 a.match(h,/id="channelPicker"/);a.match(h,/src="tv-web-lab-v061.js"/);a.match(h,/TV Web Lab · v0\.1\.61/);a.match(s,/function keyHandler\(e\)/);new vm.Script(s);
 a.match(h,/<video id="video"[^>]*controls playsinline/);a.doesNotMatch(h,/class="playerhead"|class="playerfoot"|class="playerdiag"/);
 for(const f of ['tizenbrew/index.html','tizenbrew/bootstrap.html']){const x=fs.readFileSync(f,'utf8');a.ok(x.includes(p.websiteURL)&&x.includes('function play(c)'));}
});
function mock(){
 let calls=[],token=1,failures=[],handlers={};
 const video={hidden:true,paused:true,readyState:2,requestFullscreen(){calls.push('fullscreen');return Promise.resolve();},play(){calls.push('play');return Promise.resolve();},set src(v){calls.push(v);}};
 const screen={hidden:false};const env={URL,location:{protocol:'https:'},byId:id=>id==='video'?video:screen,document:{body:{classList:{add(){},remove(){}}},documentElement:{},addEventListener(k,f){handlers[k]=f;}},playbackActive:t=>t===token,isActiveHtml5Video:(v,t)=>v===video&&t===token,playbackFailure:(t,r)=>failures.push(r),clearPlaybackTimer(){},setTimeout(){return 1;},playbackReady(){env.playbackConfirmed=true;},playbackConfirmed:false,notify(){},closePlayer(){}};
 const i=s.indexOf('/* Direct browser playback only.'),j=s.indexOf('function tryNextChannelSource(',i);
 vm.runInNewContext(s.slice(i,j),env);return {env,video,calls,failures,advance(){token++;}};
}
test('Selected URL exactly once; synchronous play and video fullscreen, no decoder probing',()=>{
 const m=mock();m.env.startPlaybackStream({url:'https://example.org/stream.m3u8?key=example'},1);
 a.deepEqual(m.calls,['https://example.org/stream.m3u8?key=example','play','fullscreen']);
 m.video.error={code:4};m.video.onerror();a.deepEqual(m.failures,['HTML5 4']);a.equal(m.calls.length,3);
 const i=s.indexOf('function startPlaybackStream('),j=s.indexOf('function tryNextChannelSource(',i);
 a.doesNotMatch(s.slice(i,j),/loadHlsLibrary|loadDashLibrary|stagesFor|webNextStage|tryNextChannelSource\(|new Hls|fetch\(/);
 const start=s.indexOf('function play(c)'),end=s.indexOf('function togglePlayback(',start);
 a.match(s.slice(start,end),/playbackStreamUrls=\[c\.url\]/);a.match(s.slice(start,end),/startPlaybackStream\(c,token\)/);
});
test('Obsolete media callbacks ignored; HTTP rejected without attempting playback',()=>{
 const m=mock();m.env.startPlaybackStream({url:'https://example.org/one'},1);const cb=m.video.onerror;m.advance();m.video.error={code:4};cb();a.equal(m.failures.length,0);
 const n=mock();n.env.startPlaybackStream({url:'http://example.org/one'},1);a.equal(n.calls.length,0);a.equal(n.failures.length,1);
});
test('Legacy page URLs redirect to new filename',()=>{
 for(const path of ['tv-web-lab.html','tv-web-lab-v060.html','tv-web-lab.js','tv-web-lab-v060.js']){
 const raw=fs.readFileSync(path,'utf8'),code=path.endsWith('.html')?raw.match(/<script>([\s\S]*?)<\/script>/)[1]:raw;let dest='';
 vm.runInNewContext(code,{location:{replace:u=>dest=u}});a.equal(dest,p.websiteURL);}
});
