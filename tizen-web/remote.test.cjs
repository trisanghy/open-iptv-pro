'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const h=fs.readFileSync('tv-web-v062.html','utf8'),s=fs.readFileSync('tv-web-v062.js','utf8'),p=JSON.parse(fs.readFileSync('package.json','utf8'));
test('Pure website, no native or hybrid player',()=>{
 a.match(h,/TV Web · v0\.1\.62/);a.match(h,/src="tv-web-v062.js"/);a.match(h,/<video id="video"[^>]*controls/);
 a.doesNotMatch(h,/id="(?:appsBtn|tizenTubeBtn|webLabLegacyHooks|channelPicker|homePreviewVideo)"/);
 a.doesNotMatch(s,/function (?:startAvplay|startRelayHlsPlayback|startHlsPlayback|loadDashLibrary|webNextStage)|new Hls\(|webapis\.avplay|tizen\.application/);
 a.match(s,/function keyHandler\(e\)/);new vm.Script(s);
 a.equal(p.websiteURL,'https://trisanghy.github.io/open-iptv-pro/tv-web.html');a.equal(p.serviceFile,undefined);
});
function mock(){
 let calls=[],notes=[];const classes={add(){},remove(){}},screen={hidden:true};
 const video={readyState:2,paused:true,addEventListener(){},pause(){calls.push('pause');},removeAttribute(){calls.push('clear');},load(){calls.push('load');},set src(v){calls.push(v);},requestFullscreen(){calls.push('fullscreen');return Promise.resolve();},play(){calls.push('play');return Promise.resolve();}};
 const env={URL,byId:id=>id==='video'?video:screen,document:{addEventListener(){},body:{classList:classes},documentElement:{}},playing:null,state:{recent:[]},items:[],notify:t=>notes.push(t),save(){},draw(){},restoreHomeFocus(){},clearTimeout(){},setTimeout(){return 1;}};
 const i=s.indexOf('/* Standalone browser player.'),j=s.indexOf('function homeButtons(',i);vm.runInNewContext(s.slice(i,j),env);
 return {env,video,screen,calls,notes};
}
test('Only one chosen URL; direct fullscreen and browser play; error closes player',()=>{
 const m=mock();m.env.play({id:'a',name:'A',url:'https://example.org/a.m3u8'});
 a.deepEqual(m.calls,['pause','clear','load','https://example.org/a.m3u8','fullscreen','play']);
 a.equal(m.screen.hidden,false);m.video.error={code:4};m.video.onerror();a.equal(m.screen.hidden,true);a.equal(m.notes.length,1);
 a.equal(m.calls.filter(x=>x==='play').length,1);
});
test('Back closes and remote channel changes keep one video surface',()=>{
 const m=mock();m.env.items=[{id:'a',name:'A',url:'https://example.org/a'},{id:'b',name:'B',url:'https://example.org/b'}];
 m.env.play(m.env.items[0]);m.env.changeChannel(1);a.equal(m.calls.filter(x=>x==='fullscreen').length,1);a.ok(m.calls.includes('https://example.org/b'));m.env.closePlayer();a.equal(m.screen.hidden,true);
});
test('Stable website and legacy addresses point to versioned HTTPS page',()=>{
 for(const f of ['tv-web.html','tv-web-lab.html','tv-web-lab-v060.html','tv-web-lab-v061.html']){
  let dest='';vm.runInNewContext(fs.readFileSync(f,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],{location:{replace:u=>dest=u}});a.equal(dest,'https://trisanghy.github.io/open-iptv-pro/tv-web-v062.html');
 }
});
