'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=JSON.parse(fs.readFileSync('package.json','utf8')),h=fs.readFileSync('tv-web-lab.html','utf8'),s=fs.readFileSync('tv-web-lab.js','utf8');
test('Standalone HTTPS page, WGT UI and no pairing/relay module',()=>{
 a.equal(p.websiteURL,'https://trisanghy.github.io/open-iptv-pro/tv-web-lab.html');a.equal(p.packageType,'mods');a.equal(p.serviceFile,undefined);
 a.match(h,/id="channelPicker"/);a.match(h,/src="tv-web-lab.js\?v=058"/);a.match(s,/function keyHandler\(e\)/);a.match(s,/function play\(c\)/);new vm.Script(s);
 a.doesNotMatch(s,/(?:http|ws):\/\/127\.0\.0\.1/);
 let redirected='';vm.runInNewContext(s,{location:{origin:'http://127.0.0.1:8081',pathname:'/module/old',replace:u=>redirected=u}});a.equal(redirected,p.websiteURL);
 for(const f of ['tizenbrew/index.html','tizenbrew/bootstrap.html'])a.ok(fs.readFileSync(f,'utf8').includes(p.websiteURL));
});
test('Receiver decoder stages and fullscreen',()=>{
 const start=s.indexOf('var stageAvailable=stage=>'),end=s.indexOf('/* Receiver port:',start);
 const e={URL,window:{Hls:{isSupported:()=>true},dashjs:{MediaPlayer(){}}},byId:()=>({canPlayType:()=>true})};
 vm.runInNewContext(s.slice(start,end)+';this.stages=stagesFor;',e);
 a.deepEqual(Array.from(e.stages('https://example.org/a.m3u8')),['native-hls','hlsjs']);
 a.deepEqual(Array.from(e.stages('https://example.org/a.mpd')),['dashjs','native']);
 a.match(s,/Promise\.all\(jobs\)[\s\S]*?webStages=stagesFor/);a.match(s,/MANIFEST_PARSED[\s\S]*?webEngineReady=true;webPlayReady/);a.match(s,/playbackReady\(token\);enterWebCinema\(video\)/);
});

test('Legacy v0.1.54 OTA validator accepts both navigation-only entry points',()=>{
 for(const f of ['tizenbrew/index.html','tizenbrew/bootstrap.html']){
  const html=fs.readFileSync(f,'utf8');
  // Exact validator used by the installed bootstrap.
  a.ok(html.indexOf('Open IPTV Pro')>=0&&html.indexOf('function play(c)')>=0&&/<html[\s>]/i.test(html));
  let dest='',calls=0;
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{location:{replace(u){dest=u;calls++;}}});
  a.equal(dest,p.websiteURL);a.equal(calls,1);
  a.doesNotMatch(html,/<video|<iframe|fetch\(|new Hls|127\.0\.0\.1/);
 }
});
